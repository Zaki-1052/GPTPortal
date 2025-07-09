// Gemini Provider Handler - Google Generative AI models
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GeminiHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
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
   * Handle image generation with Gemini models
   * TODO: Implement Google's image generation API integration
   */
  async generateImage(prompt, options = {}) {
    // TODO: Implement Gemini image generation
    // This will need to be replaced with actual Google image generation API calls
    // when Google releases their image generation models
    
    throw new Error('Gemini image generation not yet implemented. TODO: Add Google image generation API integration');
    
    // Placeholder for future implementation:
    /*
    const { enhancePrompt = true, quality = 'standard', size = '1024x1024' } = options;
    
    try {
      // TODO: Use Google's image generation API
      const result = await this.genAI.generateImage({
        prompt: prompt,
        quality: quality,
        size: size
      });
      
      return {
        success: true,
        imageData: result.imageData,
        model: 'gemini-image-1',
        originalPrompt: prompt
      };
    } catch (error) {
      console.error('Gemini image generation error:', error);
      throw new Error(`Gemini image generation failed: ${error.message}`);
    }
    */
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