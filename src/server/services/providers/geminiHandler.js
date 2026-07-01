// src/server/services/providers/geminiHandler.js
// Gemini Provider Handler - Google Gemini models via the '@google/genai' SDK.
const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');

// Default model ids for the modern Gemini 3 family.
const DEFAULT_TEXT_MODEL = 'gemini-3.5-flash';
const DEFAULT_IMAGE_MODEL = 'gemini-3.1-flash-image';

class GeminiHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Pass the key explicitly rather than relying on process env.
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.defaultModel = DEFAULT_TEXT_MODEL;
    this.imageModel = DEFAULT_IMAGE_MODEL;
  }

  /**
   * Resolve the model id, falling back to the default text model.
   */
  resolveModel(modelID) {
    return typeof modelID === 'string' && modelID.startsWith('gemini') ? modelID : this.defaultModel;
  }

  /**
   * Map an application reasoning effort to a Gemini thinking level.
   * @param {string} reasoningEffort - none|minimal|low|medium|high|xhigh
   * @returns {'minimal'|'low'|'medium'|'high'}
   */
  mapThinkingLevel(reasoningEffort) {
    switch (reasoningEffort) {
      case 'none':
      case 'minimal':
        return 'minimal';
      case 'low':
        return 'low';
      case 'high':
      case 'xhigh':
        return 'high';
      case 'medium':
      default:
        return 'medium';
    }
  }

  /**
   * Build the Gemini generation config from a request payload.
   * Temperature is pinned to 1: Gemini 3 degrades noticeably below 1.
   */
  buildConfig(payload) {
    const { systemMessage, tokens, reasoningEffort } = payload;
    const config = {
      temperature: 1,
      maxOutputTokens: tokens || 8000,
      thinkingConfig: {
        thinkingLevel: this.mapThinkingLevel(reasoningEffort),
        includeThoughts: true
      }
    };
    if (systemMessage) {
      config.systemInstruction = systemMessage;
    }
    return config;
  }

  /**
   * Convert a single history message's content into Gemini parts[].
   * Accepts a plain string or an array of text / inline-image items.
   */
  buildParts(content) {
    if (typeof content === 'string') {
      return [{ text: content }];
    }
    if (Array.isArray(content)) {
      const parts = [];
      for (const item of content) {
        if (typeof item === 'string') {
          parts.push({ text: item });
        } else if (item && typeof item.text === 'string') {
          parts.push({ text: item.text });
        } else if (item && item.inlineData) {
          parts.push({ inlineData: item.inlineData });
        } else if (item && item.inline_data) {
          parts.push({ inlineData: item.inline_data });
        } else if (item && item.type === 'image' && item.source) {
          parts.push({ inlineData: { mimeType: item.source.media_type, data: item.source.data } });
        }
      }
      return parts.length ? parts : [{ text: '' }];
    }
    return [{ text: String(content == null ? '' : content) }];
  }

  /**
   * Build a Gemini contents[] array from conversation history.
   * System turns are skipped (they belong in config.systemInstruction).
   */
  buildContents(conversationHistory) {
    const contents = [];
    for (const message of conversationHistory || []) {
      if (!message || message.role === 'system') continue;
      const role = (message.role === 'assistant' || message.role === 'model') ? 'model' : 'user';
      contents.push({ role, parts: this.buildParts(message.content) });
    }
    return contents;
  }

  /**
   * Normalize Gemini usage metadata to the app's token-count shape.
   */
  normalizeUsage(usageMetadata) {
    if (!usageMetadata) return {};
    return {
      prompt_tokens: usageMetadata.promptTokenCount || 0,
      completion_tokens: usageMetadata.candidatesTokenCount || 0,
      total_tokens: usageMetadata.totalTokenCount || 0,
      ...usageMetadata
    };
  }

  /**
   * Handle a Gemini chat completion (non-streaming fallback path).
   * Mirrors the streaming path's history handling: user_input is pushed onto
   * conversationHistory up front and the assistant turn is appended at the end.
   * @param {Object} payload - see PAYLOAD shape (uses conversationHistory)
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory } = payload;
    const model = this.resolveModel(modelID);

    // Add user input to conversation history before the request.
    if (user_input) conversationHistory.push(user_input);

    const contents = this.buildContents(conversationHistory);
    const config = this.buildConfig(payload);

    try {
      const response = await this.ai.models.generateContent({ model, contents, config });
      const responseText = response.text || '';

      // Leave history in the same shape as a streamed turn.
      conversationHistory.push({ role: 'assistant', content: responseText });

      return {
        success: true,
        content: responseText,
        usage: this.normalizeUsage(response.usageMetadata)
      };
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Stream a Gemini chat completion as contract events.
   * Mirrors handleChatCompletion's history handling: pushes user_input first,
   * accumulates streamed text, then appends the assistant turn at the end.
   * Thought parts surface as {type:'thinking'}; answer parts as {type:'text'}.
   * @param {Object} payload - see PAYLOAD shape (uses conversationHistory)
   */
  async *streamCompletion(payload) {
    const { user_input, modelID, conversationHistory } = payload;
    const model = this.resolveModel(modelID);

    // Mirror the non-streaming path: push user input before the request.
    if (user_input) conversationHistory.push(user_input);

    const contents = this.buildContents(conversationHistory);
    const config = this.buildConfig(payload);

    let accumulated = '';
    let usageMetadata = null;

    try {
      const stream = await this.ai.models.generateContentStream({ model, contents, config });

      for await (const chunk of stream) {
        if (chunk.usageMetadata) usageMetadata = chunk.usageMetadata;

        const candidate = chunk.candidates && chunk.candidates[0];
        const parts = candidate && candidate.content && candidate.content.parts;

        if (Array.isArray(parts)) {
          for (const part of parts) {
            if (!part || typeof part.text !== 'string' || part.text.length === 0) continue;
            if (part.thought) {
              yield { type: 'thinking', value: part.text };
            } else {
              accumulated += part.text;
              yield { type: 'text', value: part.text };
            }
          }
        } else if (chunk.text) {
          accumulated += chunk.text;
          yield { type: 'text', value: chunk.text };
        }
      }
    } catch (error) {
      console.error('Gemini Streaming Error:', error.message);
      yield { type: 'error', value: `Gemini API Error: ${error.message}` };
      return;
    }

    // Leave history in the same shape as a non-streamed turn.
    conversationHistory.push({ role: 'assistant', content: accumulated });
    yield { type: 'usage', usage: this.normalizeUsage(usageMetadata) };
  }

  /**
   * Attach on-disk image files to a user input, producing a multimodal message.
   */
  attachImageParts(user_input, imageParts) {
    if (!imageParts || imageParts.length === 0) return user_input;

    const parts = [];
    if (typeof user_input.content === 'string') {
      parts.push({ text: user_input.content });
    } else if (Array.isArray(user_input.content)) {
      parts.push(...user_input.content);
    }

    for (const part of imageParts) {
      const converted = this.convertImageForGemini(`public/uploads/${part.filename}`, part.mimeType);
      if (converted) parts.push(converted);
    }

    return { role: 'user', content: parts };
  }

  /**
   * Handle a Gemini multimodal chat (text + on-disk images).
   * Delegates to handleChatCompletion after inlining the image parts.
   */
  async handleMultimodalChat(payload) {
    const enrichedInput = this.attachImageParts(payload.user_input, payload.imageParts);
    return await this.handleChatCompletion({ ...payload, user_input: enrichedInput, imageParts: undefined });
  }

  /**
   * Convert an image file to a Gemini inline-data part.
   */
  convertImageForGemini(filePath, mimeType) {
    try {
      if (!filePath || !mimeType) {
        throw new Error('Invalid arguments: filePath and mimeType are required');
      }
      const base64Data = fs.readFileSync(filePath).toString('base64');
      return { inlineData: { data: base64Data, mimeType } };
    } catch (error) {
      console.error('Error in convertImageForGemini:', error.message);
      return null;
    }
  }

  /**
   * Format user input for Gemini models (simple text-first message shape).
   */
  formatUserInput(userMessage, fileContents = null, fileId = null) {
    let content = userMessage || '';
    if (fileContents && fileId) {
      content += `\n\nFile: ${fileId}\n${fileContents}`;
    }
    return { role: 'user', content };
  }

  /**
   * Estimate tokens for Gemini (rough ~4 characters per token).
   */
  estimateTokens(text) {
    return Math.ceil((text || '').length / 4);
  }

  /**
   * Enhance an image-generation prompt with the default text model.
   */
  async enhanceImagePrompt(originalPrompt, skipEnhancement = false) {
    if (skipEnhancement) return originalPrompt;

    try {
      const enhancementPrompt = `Enhance this image generation prompt to be more detailed and specific while maintaining the original intent. Focus on visual details, style, composition, and artistic elements. Return only the enhanced prompt without explanations:

Original: ${originalPrompt}

Enhanced:`;

      const response = await this.ai.models.generateContent({
        model: this.defaultModel,
        contents: [{ role: 'user', parts: [{ text: enhancementPrompt }] }],
        config: { temperature: 1, maxOutputTokens: 200 }
      });

      const enhancedPrompt = (response.text || '').trim();
      return enhancedPrompt || originalPrompt;
    } catch (error) {
      console.error('Prompt enhancement failed:', error.message);
      return originalPrompt;
    }
  }

  /**
   * Generate an image with the Gemini flash-image model (text + image modalities).
   */
  async generateImageWithGeminiFlash(prompt, options = {}) {
    const { enhancePrompt = true } = options;

    try {
      const finalPrompt = await this.enhanceImagePrompt(prompt, !enhancePrompt);

      const response = await this.ai.models.generateContent({
        model: this.imageModel,
        contents: finalPrompt,
        config: { responseModalities: [Modality.TEXT, Modality.IMAGE] }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return {
            success: true,
            imageData: part.inlineData.data,
            model: this.imageModel,
            originalPrompt: prompt,
            enhancedPrompt: finalPrompt !== prompt ? finalPrompt : null,
            revisedPrompt: null
          };
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Gemini image generation error:', error.message);
      throw error;
    }
  }

  /**
   * Public image-generation entry point for Gemini models.
   */
  async generateImage(prompt, options = {}) {
    return await this.generateImageWithGeminiFlash(prompt, options);
  }

  /**
   * Handle request routing for Gemini models.
   */
  async handleRequest(payload) {
    if (payload.imageParts && payload.imageParts.length > 0) {
      return await this.handleMultimodalChat(payload);
    }
    return await this.handleChatCompletion(payload);
  }
}

module.exports = GeminiHandler;
