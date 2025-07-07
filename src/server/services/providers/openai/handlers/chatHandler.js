// src/server/services/providers/openai/handlers/chatHandler.js
// Chat Completions API handler for OpenAI GPT models

const { CHAT_MODELS, WEB_SEARCH_CHAT_MODELS, DEFAULTS } = require('../utils/constants');
const { formatUserInput, processCitations } = require('../utils/formatters');

class ChatHandler {
  constructor(apiClient, webSearchService) {
    this.apiClient = apiClient;
    this.webSearchService = webSearchService;
  }

  /**
   * Check if model is supported by this handler
   */
  supportsModel(modelId) {
    return CHAT_MODELS.includes(modelId) || WEB_SEARCH_CHAT_MODELS.includes(modelId);
  }

  /**
   * Handle chat completion request
   */
  async handleChatCompletion(payload) {
    const { 
      user_input, 
      modelID, 
      systemMessage, 
      conversationHistory = [], 
      temperature = DEFAULTS.TEMPERATURE, 
      tokens = DEFAULTS.MAX_TOKENS,
      webSearchConfig = null
    } = payload;

    if (!this.supportsModel(modelID)) {
      throw new Error(`Model ${modelID} not supported by Chat Completions handler`);
    }

    // Add user input to conversation history
    const finalHistory = [...conversationHistory, user_input];

    // Build request data
    let requestData = {
      model: modelID,
      messages: finalHistory,
      temperature: temperature,
      max_tokens: tokens
    };

    // Add system message if provided
    if (systemMessage) {
      requestData.messages.unshift({ role: "system", content: systemMessage });
    }

    // Add web search if supported and configured
    if (this.webSearchService.supportsChatWebSearch(modelID)) {
      if (webSearchConfig !== false) { // Allow explicit disable with false
        const processedConfig = this.webSearchService.processWebSearchConfig(webSearchConfig || {});
        requestData = this.webSearchService.addWebSearchToChat(requestData, processedConfig);
      }
    }

    try {
      const response = await this.apiClient.chatCompletions(requestData);
      const messageContent = response.data.choices[0].message.content;
      
      // Process citations if web search was used
      let citations = [];
      let hasCitations = false;
      
      if (this.webSearchService.supportsChatWebSearch(modelID) && webSearchConfig !== false) {
        const citationData = this.webSearchService.extractChatCitations(response);
        citations = citationData.citations;
        hasCitations = citationData.hasCitations;
      }
      
      // Add assistant response to history
      finalHistory.push({ role: "assistant", content: messageContent });
      
      const result = {
        success: true,
        content: messageContent,
        usage: response.data.usage,
        model: modelID,
        type: 'chat'
      };

      // Add citation information if available
      if (hasCitations) {
        result.citations = citations;
        result.webSearchUsed = true;
      }

      return result;
    } catch (error) {
      console.error('Chat Completions API Error:', error.message);
      throw new Error(`Chat Completions API Error: ${error.message}`);
    }
  }

  /**
   * Format user input for chat models
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
    return formatUserInput(userMessage, fileContents, fileId, imageName, base64Image);
  }

  /**
   * Get supported models
   */
  getSupportedModels() {
    return {
      standard: CHAT_MODELS,
      webSearch: WEB_SEARCH_CHAT_MODELS,
      all: [...CHAT_MODELS, ...WEB_SEARCH_CHAT_MODELS]
    };
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelId) {
    const capabilities = {
      chat: this.supportsModel(modelId),
      webSearch: this.webSearchService.supportsChatWebSearch(modelId),
      vision: this.supportsVision(modelId),
      function: this.supportsFunction(modelId)
    };

    return capabilities;
  }

  /**
   * Check if model supports vision
   */
  supportsVision(modelId) {
    const visionModels = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4.1',
      'gpt-4o-mini',
      'gpt-4.1-mini',
      'gpt-4o-search-preview',
      'gpt-4o-mini-search-preview'
    ];
    return visionModels.includes(modelId);
  }

  /**
   * Check if model supports function calling
   */
  supportsFunction(modelId) {
    const functionModels = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4.1',
      'gpt-4o-mini',
      'gpt-4.1-mini',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-0125'
    ];
    return functionModels.includes(modelId);
  }

  /**
   * Enhance prompt for better responses
   */
  async enhancePrompt(userPrompt, enhancementType = 'general') {
    const enhancementPrompts = {
      general: `You are an expert at improving prompts for better AI responses. Take the user's request and make it clearer, more specific, and more likely to get a helpful response. Keep the enhanced prompt concise but comprehensive.

User request: "${userPrompt}"

Enhanced prompt:`,
      
      technical: `You are an expert at creating technical prompts. Take the user's request and enhance it with technical details, context, and specific requirements that will help generate more accurate technical responses.

User request: "${userPrompt}"

Enhanced technical prompt:`,
      
      creative: `You are an expert at creating creative prompts. Take the user's request and enhance it with creative elements, style guidelines, and inspirational details that will help generate more imaginative responses.

User request: "${userPrompt}"

Enhanced creative prompt:`
    };

    try {
      const response = await this.apiClient.chatCompletions({
        model: "gpt-4.1",
        messages: [{ role: "user", content: enhancementPrompts[enhancementType] }],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.warn('Prompt enhancement failed, using original prompt:', error.message);
      return userPrompt;
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      supportedModels: this.getSupportedModels().all.length,
      webSearchModels: WEB_SEARCH_CHAT_MODELS.length,
      apiType: 'Chat Completions'
    };
  }
}

module.exports = ChatHandler;