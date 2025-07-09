// Gemini Provider Handler - Google Generative AI models
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs');
const path = require('path');

class GeminiHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.genAINew = new GoogleGenAI({});
    this.setupSafetySettings();
    this.setupDefaultConfig();
  }

  /**
   * Setup Gemini safety settings (reduced to none for uncensored output)
   */
  setupSafetySettings() {
    const { HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
    
    this.safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];
  }

  /**
   * Setup default generation configuration
   */
  setupDefaultConfig() {
    this.defaultConfig = {
      candidate_count: 1,
      max_output_tokens: 2000,
      temperature: 1
    };
  }

  /**
   * Handle Gemini chat completion
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, systemMessage, geminiHistory, temperature, tokens } = payload;
    
    // Update generation config with request parameters
    const generationConfig = {
      ...this.defaultConfig,
      max_output_tokens: tokens,
      temperature: temperature
    };

    try {
      // Add user prompt to Gemini history format
      const userPrompt = typeof user_input.content === 'string' ? 
        user_input.content : 
        user_input.content.map(item => item.text).join(' ');
      
      const updatedHistory = geminiHistory + 'User Prompt: ' + userPrompt + '\n';

      // Initialize the Google model
      const googleModel = this.genAI.getGenerativeModel({ 
        model: modelID, 
        generationConfig, 
        safetySettings: this.safetySettings 
      });

      // Generate content based on the updated history
      const result = await googleModel.generateContent(updatedHistory);
      const responseText = result.response.text();

      // Add assistant's response to conversation history
      const finalHistory = updatedHistory + 'Response: ' + responseText + '\n';

      return {
        success: true,
        content: responseText,
        updatedHistory: finalHistory,
        usage: {
          prompt_tokens: this.estimateTokens(updatedHistory),
          completion_tokens: this.estimateTokens(responseText),
          total_tokens: this.estimateTokens(updatedHistory + responseText)
        }
      };
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Handle Gemini multimodal chat (text + images)
   */
  async handleMultimodalChat(payload) {
    const { user_input, modelID, imageParts, temperature, tokens } = payload;
    
    const generationConfig = {
      ...this.defaultConfig,
      max_output_tokens: tokens,
      temperature: temperature
    };

    try {
      const googleModel = this.genAI.getGenerativeModel({ 
        model: modelID, 
        generationConfig, 
        safetySettings: this.safetySettings 
      });

      const userPrompt = typeof user_input.content === 'string' ? 
        user_input.content : 
        user_input.content.map(item => item.text).join(' ');

      // Convert image parts to the required format
      const convertedImageParts = imageParts.map(part => {
        const filePath = `public/uploads/${part.filename}`;
        return this.convertImageForGemini(filePath, part.mimeType);
      }).filter(Boolean);

      // Generate content with prompt and images
      const result = await googleModel.generateContent([userPrompt, ...convertedImageParts]);
      const responseText = result.response.text();

      return {
        success: true,
        content: responseText,
        usage: {
          prompt_tokens: this.estimateTokens(userPrompt),
          completion_tokens: this.estimateTokens(responseText),
          total_tokens: this.estimateTokens(userPrompt + responseText)
        }
      };
    } catch (error) {
      console.error('Gemini Multimodal API Error:', error.message);
      throw new Error(`Gemini Multimodal API Error: ${error.message}`);
    }
  }

  /**
   * Handle multi-turn chat with history
   */
  async handleMultiTurnChat(payload) {
    const { user_input, modelID, chatHistory, temperature, tokens } = payload;
    
    if (modelID !== 'gemini-pro') {
      throw new Error('Invalid model for chat. Use gemini-pro.');
    }

    const generationConfig = {
      ...this.defaultConfig,
      max_output_tokens: tokens,
      temperature: temperature
    };

    try {
      const googleModel = this.genAI.getGenerativeModel({ 
        model: 'gemini-pro', 
        generationConfig, 
        safetySettings: this.safetySettings 
      });

      // Start the chat with provided history
      const chat = googleModel.startChat({ history: chatHistory });

      const userPrompt = typeof user_input.content === 'string' ? 
        user_input.content : 
        user_input.content.map(item => item.text).join(' ');

      // Send message and get response
      const result = await chat.sendMessage({ role: "user", parts: userPrompt });
      const responseText = result.response.text();

      return {
        success: true,
        content: responseText,
        usage: {
          prompt_tokens: this.estimateTokens(userPrompt),
          completion_tokens: this.estimateTokens(responseText),
          total_tokens: this.estimateTokens(userPrompt + responseText)
        }
      };
    } catch (error) {
      console.error('Gemini Multi-turn Chat Error:', error.message);
      throw new Error(`Gemini Multi-turn Chat Error: ${error.message}`);
    }
  }

  /**
   * Convert image file to Gemini format
   */
  convertImageForGemini(filePath, mimeType) {
    try {
      if (!filePath || !mimeType) {
        throw new Error('Invalid arguments: filePath and mimeType are required');
      }

      const fileData = fs.readFileSync(filePath);
      const base64Data = fileData.toString('base64');

      return {
        inlineData: {
          data: base64Data,
          mimeType
        },
      };
    } catch (error) {
      console.error('Error in convertImageForGemini:', error.message);
      return null;
    }
  }

  /**
   * Format user input for Gemini models
   */
  formatUserInput(userMessage, fileContents = null, fileId = null) {
    // Gemini uses simple string format for most cases
    let content = userMessage;
    
    if (fileContents && fileId) {
      content += `\n\nFile: ${fileId}\n${fileContents}`;
    }
    
    return {
      role: "user",
      content: content
    };
  }

  /**
   * Estimate tokens for Gemini (approximate)
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Enhance image prompt using Gemini Flash model
   */
  async enhanceImagePrompt(originalPrompt, skipEnhancement = false) {
    if (skipEnhancement) {
      return originalPrompt;
    }

    try {
      const enhancementPrompt = `Enhance this image generation prompt to be more detailed and specific while maintaining the original intent. Focus on visual details, style, composition, and artistic elements. Return only the enhanced prompt without explanations:

Original: ${originalPrompt}

Enhanced:`;

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { max_output_tokens: 200, temperature: 0.7 },
        safetySettings: this.safetySettings
      });

      const result = await model.generateContent(enhancementPrompt);
      const enhancedPrompt = result.response.text().trim();
      
      return enhancedPrompt || originalPrompt;
    } catch (error) {
      console.error('Prompt enhancement failed:', error.message);
      return originalPrompt;
    }
  }

  /**
   * Generate image using Gemini 2.0 Flash Preview Image Generation
   */
  async generateImageWithGeminiFlash(prompt, options = {}) {
    const { enhancePrompt = true } = options;
    
    try {
      const finalPrompt = await this.enhanceImagePrompt(prompt, !enhancePrompt);
      
      const response = await this.genAINew.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: finalPrompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Extract image data from response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            success: true,
            imageData: part.inlineData.data,
            model: 'gemini-2.0-flash-preview-image-generation',
            originalPrompt: prompt,
            enhancedPrompt: finalPrompt !== prompt ? finalPrompt : null,
            revisedPrompt: null
          };
        }
      }
      
      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Gemini Flash image generation error:', error.message);
      throw error;
    }
  }

  /**
   * Generate image using Imagen 4.0
   */
  async generateImageWithImagen(prompt, options = {}) {
    const { enhancePrompt = true, numberOfImages = 1, aspectRatio = '1:1' } = options;
    
    try {
      const finalPrompt = await this.enhanceImagePrompt(prompt, !enhancePrompt);
      
      const response = await this.genAINew.models.generateImages({
        model: 'imagen-4.0-generate-preview',
        prompt: finalPrompt,
        config: {
          numberOfImages,
          aspectRatio,
          personGeneration: 'allow_adult'
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return {
          success: true,
          imageData: response.generatedImages[0].image.imageBytes,
          model: 'imagen-4.0-generate-preview',
          originalPrompt: prompt,
          enhancedPrompt: finalPrompt !== prompt ? finalPrompt : null,
          revisedPrompt: null
        };
      }
      
      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Imagen image generation error:', error.message);
      throw error;
    }
  }

  /**
   * Determine which image model to use based on model ID
   */
  getImageModelCapabilities(modelID) {
    const capabilities = {
      'gemini-2.0-flash-preview-image-generation': {
        supportsConversational: true,
        supportsTextAndImage: true,
        maxImages: 1,
        supportedSizes: ['1:1'],
        supportedQualities: ['standard']
      },
      'imagen-4.0-generate-preview': {
        supportsConversational: false,
        supportsTextAndImage: false,
        maxImages: 4,
        supportedSizes: ['1:1', '3:4', '4:3', '9:16', '16:9'],
        supportedQualities: ['standard']
      }
    };
    
    return capabilities[modelID] || null;
  }

  /**
   * Validate image generation options
   */
  validateImageOptions(options, modelID) {
    const capabilities = this.getImageModelCapabilities(modelID);
    if (!capabilities) {
      throw new Error(`Unsupported image model: ${modelID}`);
    }

    const { numberOfImages = 1, aspectRatio = '1:1' } = options;
    
    if (numberOfImages > capabilities.maxImages) {
      throw new Error(`Model ${modelID} supports maximum ${capabilities.maxImages} images`);
    }
    
    if (!capabilities.supportedSizes.includes(aspectRatio)) {
      throw new Error(`Model ${modelID} does not support aspect ratio ${aspectRatio}`);
    }
    
    return true;
  }

  /**
   * Handle image generation with Gemini models
   */
  async generateImage(prompt, options = {}) {
    const { 
      preferredModel = 'gemini-2.0-flash-preview-image-generation',
      enhancePrompt = true,
      quality = 'standard',
      numberOfImages = 1,
      aspectRatio = '1:1'
    } = options;

    const imageOptions = { enhancePrompt, quality, numberOfImages, aspectRatio };
    
    // Validate options for the preferred model
    try {
      this.validateImageOptions(imageOptions, preferredModel);
    } catch (validationError) {
      throw new Error(`Image generation validation failed: ${validationError.message}`);
    }

    let lastError = null;
    let fallbackReason = null;

    // Try preferred model first
    try {
      console.log(`Attempting image generation with ${preferredModel}`);
      
      if (preferredModel === 'gemini-2.0-flash-preview-image-generation') {
        return await this.generateImageWithGeminiFlash(prompt, imageOptions);
      } else if (preferredModel === 'imagen-4.0-generate-preview') {
        return await this.generateImageWithImagen(prompt, imageOptions);
      } else {
        throw new Error(`Unsupported image model: ${preferredModel}`);
      }
    } catch (error) {
      console.error(`${preferredModel} failed:`, error.message);
      lastError = error;
      fallbackReason = error.message;
    }

    // Try fallback models
    const fallbackModels = preferredModel === 'gemini-2.0-flash-preview-image-generation' 
      ? ['imagen-4.0-generate-preview']
      : ['gemini-2.0-flash-preview-image-generation'];

    for (const fallbackModel of fallbackModels) {
      try {
        console.log(`Trying fallback model: ${fallbackModel}`);
        
        // Validate options for fallback model
        this.validateImageOptions(imageOptions, fallbackModel);
        
        let result;
        if (fallbackModel === 'gemini-2.0-flash-preview-image-generation') {
          result = await this.generateImageWithGeminiFlash(prompt, imageOptions);
        } else if (fallbackModel === 'imagen-4.0-generate-preview') {
          result = await this.generateImageWithImagen(prompt, imageOptions);
        }
        
        // Add fallback information to result
        result.usedFallback = true;
        result.fallbackReason = fallbackReason;
        result.originalModel = preferredModel;
        
        return result;
      } catch (fallbackError) {
        console.error(`Fallback ${fallbackModel} failed:`, fallbackError.message);
        lastError = fallbackError;
      }
    }

    // If all models failed, throw the last error
    throw new Error(`All Gemini image generation models failed. Last error: ${lastError.message}`);
  }

  /**
   * Handle request routing for Gemini models
   */
  async handleRequest(payload) {
    const { imageParts, chatHistory } = payload;
    
    // Route to appropriate handler based on request type
    if (imageParts && imageParts.length > 0) {
      return await this.handleMultimodalChat(payload);
    } else if (chatHistory && chatHistory.length > 0) {
      return await this.handleMultiTurnChat(payload);
    } else {
      return await this.handleChatCompletion(payload);
    }
  }
}

module.exports = GeminiHandler;