// Claude Provider Handler - Anthropic Claude models with thinking support and web search
// 
// Web Search Feature:
// - Enabled by default for supported models: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3.7 Sonnet, Claude 4 models
// - Allows Claude to search the web for up-to-date information
// - Automatically cites sources in responses
// - Pricing: $10 per 1,000 searches + standard token costs
//
// Note: Web search is enabled by default. To disable, uncomment the conditional check in handleChatCompletion
// and pass webSearchConfig: false in your payload.
//
// Future configuration options (currently commented out):
// {
//   webSearchConfig: {
//     maxUses: 5,
//     allowedDomains: ['docs.example.com', 'api.example.com'],
//     blockedDomains: ['untrusted.com'],
//     userLocation: {
//       type: 'approximate',
//       city: 'San Francisco',
//       region: 'California',
//       country: 'US'
//     }
//   }
// }
const axios = require('axios');
const { parseAnthropicSSE } = require('./streamUtils');

// Valid effort levels for adaptive-thinking (effort-class) Claude models
const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

class ClaudeHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.promptCacheService = null; // Will be injected by ProviderFactory
  }

  /**
   * Set the prompt cache service (dependency injection)
   */
  setPromptCacheService(promptCacheService) {
    this.promptCacheService = promptCacheService;
  }

  /**
   * Classify a Claude model id into a request-construction family.
   * - 'effort':  adaptive thinking + output_config.effort (no temperature/top_p)
   * - 'legacy':  extended thinking via budget_tokens (temperature allowed)
   * Unknown ids default to 'effort' (adaptive) to match current API behavior.
   * @param {string} modelID
   * @returns {'effort'|'legacy'}
   */
  classifyModel(modelID) {
    const id = modelID || '';
    // Legacy extended-thinking models reject output_config.effort
    if (id === 'claude-sonnet-4-5-20250929' || id === 'claude-haiku-4-5-20251001') {
      return 'legacy';
    }
    // Effort-class families (adaptive thinking)
    if (/opus-4-(5|6|7|8)/.test(id) || /sonnet-(5|4-6)/.test(id) || /fable-5/.test(id)) {
      return 'effort';
    }
    // Default any other/unknown Claude id to the adaptive effort path
    return 'effort';
  }

  /**
   * Map a requested reasoning effort to a value supported by the target model.
   * xhigh/max are valid on fable-5/opus-4-7/opus-4-8/sonnet-5; on
   * opus-4-5/sonnet-4-6 the maximum allowed is 'high' so xhigh/max clamp down.
   * @param {string} modelID
   * @param {string} [reasoningEffort]
   * @returns {'low'|'medium'|'high'|'xhigh'|'max'}
   */
  mapEffort(modelID, reasoningEffort) {
    let effort = (reasoningEffort || 'high').toLowerCase();
    if (!EFFORT_LEVELS.includes(effort)) effort = 'high';

    const clampToHigh = /opus-4-5/.test(modelID || '') || /sonnet-4-6/.test(modelID || '');
    if (clampToHigh && (effort === 'xhigh' || effort === 'max')) {
      effort = 'high';
    }
    return effort;
  }

  /**
   * Whether the given model supports the server-side web_search tool.
   * Matches the current catalog: opus-4-8, opus-4-7, opus-4-5, sonnet-5,
   * sonnet-4-5, haiku-4-5, fable-5.
   * @param {string} modelID
   * @returns {boolean}
   */
  supportsWebSearch(modelID) {
    const id = modelID || '';
    return /opus-4-8|opus-4-7|opus-4-5|sonnet-5|sonnet-4-5|haiku-4-5|fable-5/.test(id);
  }

  /**
   * Build the Anthropic Messages request body for a given model family.
   * Shared by the non-streaming and streaming paths so both stay in lockstep.
   * @param {Object} args
   * @param {string} args.modelID
   * @param {number} [args.tokens]
   * @param {number} [args.temperature]
   * @param {string} [args.reasoningEffort]
   * @param {*} args.systemMessage
   * @param {Array} args.messages
   * @returns {{ requestData: Object, modelClass: 'effort'|'legacy' }}
   */
  buildRequestData({ modelID, tokens, temperature, reasoningEffort, systemMessage, messages }) {
    const modelClass = this.classifyModel(modelID);
    const maxTokens = tokens || 16000;

    const requestData = {
      model: modelID,
      max_tokens: maxTokens,
      system: systemMessage,
      messages: messages,
    };

    if (modelClass === 'legacy') {
      // Extended thinking: budget_tokens must be < max_tokens
      const budget = Math.min(Math.max(1024, maxTokens - 1024), maxTokens - 1);
      requestData.thinking = { type: 'enabled', budget_tokens: budget };
      if (temperature !== undefined && temperature !== null) {
        requestData.temperature = temperature;
      }
    } else {
      // Effort-class: adaptive thinking; never send temperature/top_p
      requestData.thinking = { type: 'adaptive', display: 'summarized' };
      requestData.output_config = { effort: this.mapEffort(modelID, reasoningEffort) };
    }

    // Auto-enable web search for supported models with the version matching the family
    if (this.supportsWebSearch(modelID)) {
      const toolType = modelClass === 'legacy' ? 'web_search_20250305' : 'web_search_20260209';
      requestData.tools = [{ type: toolType, name: 'web_search' }];
      console.log(`🔍 Web search enabled by default for ${modelID}`);
    }

    return { requestData, modelClass };
  }

  /**
   * Construct the standard Anthropic request headers.
   * @returns {Object}
   */
  buildHeaders() {
    return {
      'x-api-key': this.apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01'
    };
  }

  /**
   * Handle Claude chat completion with thinking support, optional prompt caching, and web search
   * @param {Object} payload - The request payload
   * @param {Object} payload.user_input - The user's input message
   * @param {string} payload.modelID - The Claude model ID to use
   * @param {string} payload.systemMessage - The system message/instructions
   * @param {Array} payload.claudeHistory - The conversation history
   * @param {number} payload.temperature - The temperature for response generation
   * @param {number} payload.tokens - The maximum tokens for the response
   * @param {string} [payload.cachePreference] - Optional prompt caching preference
   * @param {Object} [payload.webSearchConfig] - Optional web search configuration (web search is enabled by default)
   * // Note: To disable web search, uncomment the conditional in the method and pass webSearchConfig: false
   * // @param {number} [payload.webSearchConfig.maxUses=5] - Maximum number of web searches (default: 5)
   * // @param {string[]} [payload.webSearchConfig.allowedDomains] - List of allowed domains for search
   * // @param {string[]} [payload.webSearchConfig.blockedDomains] - List of blocked domains for search
   * // @param {Object} [payload.webSearchConfig.userLocation] - User location for localized results
   * // @param {string} [payload.webSearchConfig.userLocation.type] - Location type (e.g., "approximate")
   * // @param {string} [payload.webSearchConfig.userLocation.city] - City name
   * // @param {string} [payload.webSearchConfig.userLocation.region] - Region/state name
   * // @param {string} [payload.webSearchConfig.userLocation.country] - Country code (e.g., "US")
   * @returns {Promise<Object>} Response object with success status, content, and usage info
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, systemMessage, claudeHistory, temperature, tokens, reasoningEffort, cachePreference, webSearchConfig } = payload;
    
    // Apply prompt caching if available and enabled
    let finalPayload = payload;
    let cacheStrategy = null;
    if (this.promptCacheService) {
      try {
        cacheStrategy = await this.promptCacheService.analyzeCacheStrategy(payload, { cachePreference });
        if (cacheStrategy.shouldCache) {
          finalPayload = await this.promptCacheService.applyCacheControls(payload, cacheStrategy);
          console.log(`🔄 Applied ${cacheStrategy.type} caching strategy to ${modelID}`);
        }
      } catch (error) {
        console.warn('Failed to apply prompt caching, proceeding without cache:', error.message);
        // Continue with original payload on caching error (graceful degradation)
      }
    }

    // Add user input to Claude history
    const { systemMessage: finalSystemMessage, claudeHistory: finalClaudeHistory } = finalPayload;
    
    console.log('=== About to push user_input to Claude history ===');
    console.log('user_input:', JSON.stringify(user_input, null, 2));
    console.log('user_input.content length:', user_input.content?.length);
    console.log('user_input.content has image:', user_input.content?.some(item => item.type === 'image'));
    console.log('================================================');
    
    finalClaudeHistory.push(user_input);

    // Build the request body via model-family logic (effort vs legacy thinking)
    const { requestData } = this.buildRequestData({
      modelID,
      tokens,
      temperature,
      reasoningEffort,
      systemMessage: finalSystemMessage,
      messages: finalClaudeHistory
    });

    const headers = this.buildHeaders();

    try {
      const response = await axios.post(`${this.baseURL}/messages`, requestData, { headers });
      let messageContent = response.data.content;

      // Track cache performance if caching was attempted
      if (this.promptCacheService && cacheStrategy?.shouldCache && response.data.usage) {
        this.promptCacheService.trackCachePerformance(modelID, response.data.usage, true);
      }

      // Process responses that contain thinking blocks (effort or legacy families)
      const hasThinking = Array.isArray(messageContent) && messageContent.some(item => item.type === 'thinking');
      if (hasThinking) {
        let thinkingContent = '';
        let textContent = '';

        messageContent.forEach((item) => {
          if (item.type === 'thinking') {
            thinkingContent += item.thinking + '\n';
          } else if (item.type === 'text') {
            textContent += item.text + '\n';
          }
        });

        const formattedContent = `# Thinking:\n${thinkingContent}\n---\n# Response:\n${textContent}`;
        
        // Add to history with original format for API consistency
        finalClaudeHistory.push({ role: "assistant", content: response.data.content });
        
        return {
          success: true,
          content: formattedContent,
          thinking: thinkingContent,
          response: textContent,
          usage: response.data.usage
        };
      } else {
        // Standard Claude response
        let textContent = messageContent;
        if (Array.isArray(messageContent)) {
          if (messageContent.length > 0 && messageContent[0]?.text) {
            textContent = messageContent[0].text;
          } else {
            textContent = JSON.stringify(messageContent);
          }
        }

        finalClaudeHistory.push({ role: "assistant", content: response.data.content });

        return {
          success: true,
          content: textContent,
          usage: response.data.usage
        };
      }
    } catch (error) {
      console.error('Claude API Error:', error.message);
      throw new Error(`Claude API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Stream a Claude chat completion, yielding contract events.
   * Mirrors handleChatCompletion's history handling: pushes user_input onto
   * claudeHistory first, accumulates streamed text, and pushes the assembled
   * assistant message onto claudeHistory at the end.
   * @param {Object} payload - see handleChatCompletion for shape
   * @yields {{type:'thinking'|'text'|'error'|'usage', value?:string, usage?:object}}
   */
  async *streamCompletion(payload) {
    const { user_input, modelID, systemMessage, temperature, tokens, reasoningEffort, cachePreference } = payload;

    // Apply prompt caching if available and enabled (graceful degradation on error)
    let finalPayload = payload;
    if (this.promptCacheService) {
      try {
        const cacheStrategy = await this.promptCacheService.analyzeCacheStrategy(payload, { cachePreference });
        if (cacheStrategy.shouldCache) {
          finalPayload = await this.promptCacheService.applyCacheControls(payload, cacheStrategy);
          console.log(`🔄 Applied ${cacheStrategy.type} caching strategy to ${modelID}`);
        }
      } catch (error) {
        console.warn('Failed to apply prompt caching, proceeding without cache:', error.message);
      }
    }

    const { systemMessage: finalSystemMessage, claudeHistory: finalClaudeHistory } = finalPayload;

    // Push user input first, exactly like the non-streaming path
    finalClaudeHistory.push(user_input);

    // Build the same request body as handleChatCompletion, plus stream:true
    const { requestData } = this.buildRequestData({
      modelID,
      tokens,
      temperature,
      reasoningEffort,
      systemMessage: finalSystemMessage,
      messages: finalClaudeHistory
    });
    requestData.stream = true;

    const headers = this.buildHeaders();

    let accumulatedText = '';
    try {
      const response = await axios.post(`${this.baseURL}/messages`, requestData, {
        headers,
        responseType: 'stream'
      });

      for await (const ev of parseAnthropicSSE(response.data)) {
        if (ev.type === 'text') accumulatedText += ev.value;
        yield ev;
      }
    } catch (error) {
      console.error('Claude API Stream Error:', error.message);
      yield { type: 'error', value: error.response?.data?.error?.message || error.message };
      return;
    }

    // Leave history in the same shape as a non-streamed turn
    finalClaudeHistory.push({ role: 'assistant', content: accumulatedText });
  }

  /**
   * Format user input for Claude models with XML structure
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null, uploadedFiles = null) {
    console.log('=== ClaudeHandler.formatUserInput Debug ===');
    console.log('userMessage:', userMessage ? userMessage.substring(0, 100) + '...' : 'N/A');
    console.log('fileContents exists:', !!fileContents);
    console.log('fileId:', fileId);
    console.log('imageName:', imageName);
    console.log('base64Image exists:', !!base64Image);
    console.log('base64Image length:', base64Image ? base64Image.length : 0);
    console.log('base64Image starts with:', base64Image ? base64Image.substring(0, 50) : 'N/A');
    console.log('uploadedFiles:', uploadedFiles);
    console.log('==========================================');
    
    const user_input = {
      role: "user",
      content: []
    };

    // Add text content with XML tags
    if (userMessage) {
      user_input.content.push({ type: "text", text: "<user_message>" });
      user_input.content.push({ type: "text", text: userMessage });
      user_input.content.push({ type: "text", text: "</user_message>" });
    }

    // Handle single file (backward compatibility)
    if (fileContents && fileId) {
      if (fileId.endsWith('.pdf')) {
        // PDF format for Claude
        user_input.content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: fileContents
          }
        });
      } else {
        // Text file with XML tags
        user_input.content.push({ type: "text", text: "<file_name>" });
        user_input.content.push({ type: "text", text: fileId });
        user_input.content.push({ type: "text", text: "</file_name>" });
        user_input.content.push({ type: "text", text: "<file_contents>" });
        user_input.content.push({ type: "text", text: fileContents });
        user_input.content.push({ type: "text", text: "</file_contents>" });
      }
    }

    // Handle multiple uploaded files
    if (uploadedFiles && Array.isArray(uploadedFiles)) {
      for (const file of uploadedFiles) {
        if (file.type === 'pdf') {
          user_input.content.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: file.contents
            }
          });
        } else {
          user_input.content.push({ type: "text", text: "<file_name>" });
          user_input.content.push({ type: "text", text: file.file_id });
          user_input.content.push({ type: "text", text: "</file_name>" });
          user_input.content.push({ type: "text", text: "<file_contents>" });
          user_input.content.push({ type: "text", text: file.contents });
          user_input.content.push({ type: "text", text: "</file_contents>" });
        }
      }
    }

    // Add image with XML structure
    if (base64Image) {
      console.log('=== Processing base64Image in ClaudeHandler ===');
      const parts = base64Image.split(';base64,');
      if (parts.length !== 2) {
        console.error('Invalid base64 image format. Expected "data:type;base64,data"');
        throw new Error('Invalid base64 image format');
      }

      const [mediaPart, base64Data] = parts;
      const mediaTypeParts = mediaPart.split(':');
      if (mediaTypeParts.length < 2) {
        console.error('Invalid media type format in base64 image');
        throw new Error('Invalid media type format');
      }

      const mediaType = mediaTypeParts[1];
      console.log('mediaType:', mediaType);
      console.log('base64Data length:', base64Data ? base64Data.length : 0);

      user_input.content.push({ type: "text", text: "<image_name>" });
      user_input.content.push({ type: "text", text: imageName || "uploaded_image" });
      user_input.content.push({ type: "text", text: "</image_name>" });
      user_input.content.push({ type: "text", text: "<image_content>" });
      user_input.content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64Data
        }
      });
      user_input.content.push({ type: "text", text: "</image_content>" });
      console.log('Image added to user_input.content');
    }

    console.log('=== Final user_input structure ===');
    console.log('user_input.content length:', user_input.content.length);
    console.log('user_input.content types:', user_input.content.map(item => item.type));
    console.log('================================');

    return user_input;
  }

  /**
   * Parse Claude instructions into sections for system message
   */
  parseInstructionsIntoSections(instructionsText) {
    if (!instructionsText || typeof instructionsText !== 'string') {
      throw new Error('Invalid instructions text: must be a non-empty string');
    }

    // Find the major section boundaries
    const roleAssignmentEndTag = '</role_assignment>';
    const roleAssignmentEndIdx = instructionsText.indexOf(roleAssignmentEndTag);
    if (roleAssignmentEndIdx === -1) {
      throw new Error('Missing </role_assignment> tag in instructions');
    }
    const roleAssignmentEnd = roleAssignmentEndIdx + roleAssignmentEndTag.length;

    const claudeInfoStart = instructionsText.indexOf('<claude_info>');
    if (claudeInfoStart === -1) {
      throw new Error('Missing <claude_info> tag in instructions');
    }

    const claudeInfoEndTag = '</claude_info>';
    const claudeInfoEndIdx = instructionsText.indexOf(claudeInfoEndTag);
    if (claudeInfoEndIdx === -1) {
      throw new Error('Missing </claude_info> tag in instructions');
    }
    const claudeInfoEnd = claudeInfoEndIdx + claudeInfoEndTag.length;

    const taskInstructionsStart = instructionsText.indexOf('<task_instructions>');
    if (taskInstructionsStart === -1) {
      throw new Error('Missing <task_instructions> tag in instructions');
    }

    const methodsEndTag = '</methods>';
    const methodsEndIdx = instructionsText.indexOf(methodsEndTag);
    if (methodsEndIdx === -1) {
      throw new Error('Missing </methods> tag in instructions');
    }
    const methodsEnd = methodsEndIdx + methodsEndTag.length;

    const finalStart = instructionsText.indexOf('<final>');
    if (finalStart === -1) {
      throw new Error('Missing <final> tag in instructions');
    }

    // Create the four main sections
    const sections = [
      {
        content: instructionsText.substring(0, roleAssignmentEnd)
      },
      {
        content: instructionsText.substring(claudeInfoStart, claudeInfoEnd)
      },
      {
        content: instructionsText.substring(taskInstructionsStart, methodsEnd)
      },
      {
        content: instructionsText.substring(finalStart)
      }
    ];

    return sections;
  }

  /**
   * Format sections into system message with caching
   */
  formatSectionsIntoSystemMessage(sections) {
    return sections.map(section => ({
      type: "text",
      text: section.content,
      cache_control: { type: "ephemeral" }
    }));
  }

  /**
   * Handle request routing for Claude models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = ClaudeHandler;