// src/server/services/providers/grokHandler.js
// XAI Grok Provider Handler - OpenAI-compatible API for Grok models
const axios = require('axios');

class GrokHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.x.ai/v1';
  }

  /**
   * Handle Grok chat completion with reasoning and vision support
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory, temperature, tokens } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

    // Build request data following OpenAI format
    const requestData = {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };

    // Add search parameters if provided
    if (payload.search_parameters) {
      requestData.search_parameters = payload.search_parameters;
    }

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, { headers });
      
      // Handle reasoning content for Grok 4
      let messageContent;
      if (modelID === 'grok-4' && response.data.choices[0].message.reasoning_content) {
        const reasoningContent = response.data.choices[0].message.reasoning_content || '';
        const textContent = response.data.choices[0].message.content || '';
        
        // Format with thinking and response sections similar to DeepSeek
        messageContent = `# Thinking:\n${reasoningContent}\n\n---\n# Response:\n${textContent}`;
        
        // Add assistant response to history
        conversationHistory.push({ role: "assistant", content: textContent });
        
        return {
          success: true,
          content: messageContent,
          thinking: reasoningContent,
          response: textContent,
          usage: response.data.usage,
          citations: response.data.citations || null
        };
      } else {
        // Standard Grok response
        messageContent = response.data.choices[0].message.content;
        
        // Add assistant response to history
        conversationHistory.push({ role: "assistant", content: messageContent });
        
        return {
          success: true,
          content: messageContent,
          usage: response.data.usage,
          citations: response.data.citations || null
        };
      }
    } catch (error) {
      console.error('Grok API Error:', error.message);
      throw new Error(`Grok API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle vision-enabled chat with image understanding
   */
  async handleVisionChat(payload) {
    const { user_input, modelID, conversationHistory, temperature, tokens } = payload;

    // Vision models require different handling
    if (!this.isVisionModel(modelID)) {
      throw new Error(`Model ${modelID} does not support vision capabilities`);
    }

    // Add user input to conversation history
    conversationHistory.push(user_input);

    const requestData = {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, { headers });
      const messageContent = response.data.choices[0].message.content;
      
      // Add assistant response to history
      conversationHistory.push({ role: "assistant", content: messageContent });
      
      return {
        success: true,
        content: messageContent,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Grok Vision API Error:', error.message);
      throw new Error(`Grok Vision API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle image generation using Grok image models
   */
  async generateImage(prompt, options = {}) {
    const {
      modelID = 'grok-2-image-1212',
      n = 1,
      response_format = 'url'
    } = options;

    if (!this.isImageModel(modelID)) {
      throw new Error(`Model ${modelID} does not support image generation`);
    }

    const requestData = {
      model: modelID,
      prompt: prompt,
      n: n,
      response_format: response_format
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/images/generations`, requestData, { headers });
      
      // Handle both URL and base64 responses
      const imageData = response.data.data[0];
      
      return {
        success: true,
        imageData: response_format === 'b64_json' ? imageData.b64_json : imageData.url,
        model: modelID,
        prompt: prompt,
        revisedPrompt: imageData.revised_prompt || prompt,
        responseFormat: response_format
      };
    } catch (error) {
      console.error('Grok Image Generation Error:', error.message);
      throw new Error(`Grok Image Generation Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for Grok models (OpenAI-compatible)
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
    const user_input = {
      role: "user",
      content: []
    };

    // Add text content
    if (userMessage) {
      user_input.content.push({ type: "text", text: userMessage });
    }

    // Add file contents
    if (fileContents && fileId) {
      user_input.content.push({ type: "text", text: fileId });
      user_input.content.push({ type: "text", text: fileContents });
    }

    // Add image for vision models
    if (base64Image) {
      if (imageName) {
        user_input.content.push({ type: "text", text: imageName });
      }
      user_input.content.push({ 
        type: "image_url", 
        image_url: { 
          url: base64Image,
          detail: "high" // Grok supports high detail by default
        }
      });
    }

    // If only text content and no complex content, use simple string format
    if (user_input.content.length === 1 && user_input.content[0].type === "text") {
      user_input.content = user_input.content[0].text;
    }

    return user_input;
  }

  /**
   * Check if model supports vision capabilities
   */
  isVisionModel(modelID) {
    const visionModels = ['grok-2-vision-1212', 'grok-4'];
    return visionModels.some(model => modelID.includes(model));
  }

  /**
   * Check if model supports image generation
   */
  isImageModel(modelID) {
    const imageModels = ['grok-2-image-1212'];
    return imageModels.includes(modelID);
  }

  /**
   * Check if model supports reasoning
   */
  isReasoningModel(modelID) {
    // Grok 4 is reasoning-only, others can have reasoning
    return modelID === 'grok-4';
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelID) {
    const capabilities = {
      'grok-4': {
        contextWindow: 256000,
        supportsVision: true,
        supportsReasoning: true,
        supportsFunctionCalling: true,
        supportsStructuredOutputs: true
      },
      'grok-3': {
        contextWindow: 131072,
        supportsVision: false,
        supportsReasoning: false,
        supportsFunctionCalling: true,
        supportsStructuredOutputs: true
      },
      'grok-3-mini': {
        contextWindow: 131072,
        supportsVision: false,
        supportsReasoning: false,
        supportsFunctionCalling: true,
        supportsStructuredOutputs: true
      },
      'grok-3-fast': {
        contextWindow: 131072,
        supportsVision: false,
        supportsReasoning: false,
        supportsFunctionCalling: true,
        supportsStructuredOutputs: true
      },
      'grok-3-mini-fast': {
        contextWindow: 131072,
        supportsVision: false,
        supportsReasoning: false,
        supportsFunctionCalling: true,
        supportsStructuredOutputs: true
      },
      'grok-2-vision-1212': {
        contextWindow: 32768,
        supportsVision: true,
        supportsReasoning: false,
        supportsFunctionCalling: false,
        supportsStructuredOutputs: false
      },
      'grok-2-image-1212': {
        contextWindow: 0,
        supportsVision: false,
        supportsReasoning: false,
        supportsFunctionCalling: false,
        supportsStructuredOutputs: false,
        supportsImageGeneration: true
      }
    };
    
    return capabilities[modelID] || null;
  }

  /**
   * Handle request routing for Grok models
   */
  async handleRequest(payload) {
    const { modelID, user_input } = payload;

    // Route to image generation if it's an image model
    if (this.isImageModel(modelID)) {
      // Extract prompt from user input
      const prompt = typeof user_input.content === 'string' ? 
        user_input.content : 
        user_input.content.find(item => item.type === 'text')?.text || '';
      
      return await this.generateImage(prompt, { modelID });
    }

    // Route to vision chat if input contains images
    if (user_input.content && Array.isArray(user_input.content) && 
        user_input.content.some(item => item.type === 'image_url')) {
      return await this.handleVisionChat(payload);
    }

    // Route to standard chat completion
    return await this.handleChatCompletion(payload);
  }
}

module.exports = GrokHandler;