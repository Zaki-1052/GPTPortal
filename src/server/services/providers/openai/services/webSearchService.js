// src/server/services/providers/openai/services/webSearchService.js
// Web search implementation for OpenAI models

const { 
  WEB_SEARCH_CHAT_MODELS, 
  WEB_SEARCH_RESPONSES_MODELS, 
  WEB_SEARCH_CONFIG 
} = require('../utils/constants');
const { formatWebSearchOptions, formatWebSearchTool } = require('../utils/formatters');

class WebSearchService {
  constructor() {
    this.supportedChatModels = WEB_SEARCH_CHAT_MODELS;
    this.supportedResponsesModels = WEB_SEARCH_RESPONSES_MODELS;
  }

  /**
   * Check if model supports web search via Chat Completions API
   */
  supportsChatWebSearch(modelId) {
    return this.supportedChatModels.includes(modelId);
  }

  /**
   * Check if model supports web search via Responses API
   */
  supportsResponsesWebSearch(modelId) {
    return this.supportedResponsesModels.includes(modelId);
  }

  /**
   * Check if any web search is supported for model
   */
  supportsWebSearch(modelId) {
    return this.supportsChatWebSearch(modelId) || this.supportsResponsesWebSearch(modelId);
  }

  /**
   * Add web search to Chat Completions request
   */
  addWebSearchToChat(requestData, webSearchConfig = {}) {
    const { modelID } = requestData;
    
    if (!this.supportsChatWebSearch(modelID)) {
      console.log(`❌ Web search not supported for Chat Completions model: ${modelID}`);
      return requestData;
    }

    // Add web_search_options to request
    const webSearchOptions = formatWebSearchOptions(webSearchConfig);
    
    if (Object.keys(webSearchOptions).length > 0) {
      requestData.web_search_options = webSearchOptions;
    } else {
      // Even if no options, include empty object to enable web search
      requestData.web_search_options = {};
    }

    console.log(`🔍 Web search enabled for Chat Completions model: ${modelID}`);
    return requestData;
  }

  /**
   * Add web search tool to Responses API request
   */
  addWebSearchToResponses(requestData, webSearchConfig = {}) {
    const { model } = requestData;
    
    if (!this.supportsResponsesWebSearch(model)) {
      console.log(`❌ Web search not supported for Responses model: ${model}`);
      return requestData;
    }

    // Create web search tool
    const webSearchTool = formatWebSearchTool(webSearchConfig);

    // Add tools array to request data
    if (!requestData.tools) {
      requestData.tools = [];
    }
    
    requestData.tools.push(webSearchTool);
    
    console.log(`🔍 Web search tool enabled for Responses model: ${model}`);
    return requestData;
  }

  /**
   * Process web search configuration
   */
  processWebSearchConfig(webSearchConfig = {}) {
    const config = { ...webSearchConfig };

    // Validate and set defaults
    if (config.searchContextSize && !WEB_SEARCH_CONFIG.CONTEXT_SIZES.includes(config.searchContextSize)) {
      console.warn(`Invalid search context size: ${config.searchContextSize}. Using default.`);
      config.searchContextSize = WEB_SEARCH_CONFIG.DEFAULT_CONTEXT_SIZE;
    }

    // Validate user location
    if (config.userLocation) {
      const validFields = WEB_SEARCH_CONFIG.SUPPORTED_LOCATION_FIELDS;
      const locationKeys = Object.keys(config.userLocation);
      const invalidFields = locationKeys.filter(field => !validFields.includes(field));
      
      if (invalidFields.length > 0) {
        console.warn(`Invalid user location fields: ${invalidFields.join(', ')}`);
        // Remove invalid fields
        invalidFields.forEach(field => delete config.userLocation[field]);
      }

      // Validate country code (should be 2 letters)
      if (config.userLocation.country && config.userLocation.country.length !== 2) {
        console.warn(`Invalid country code: ${config.userLocation.country}. Should be 2 letters.`);
        delete config.userLocation.country;
      }
    }

    // Validate domain arrays
    if (config.allowedDomains && !Array.isArray(config.allowedDomains)) {
      console.warn('allowedDomains must be an array');
      delete config.allowedDomains;
    }

    if (config.blockedDomains && !Array.isArray(config.blockedDomains)) {
      console.warn('blockedDomains must be an array');
      delete config.blockedDomains;
    }

    // Validate maxUses
    if (config.maxUses && (typeof config.maxUses !== 'number' || config.maxUses < 1)) {
      console.warn('maxUses must be a positive number');
      delete config.maxUses;
    }

    return config;
  }

  /**
   * Extract citations from Chat Completions response
   */
  extractChatCitations(response) {
    const message = response.data.choices[0].message;
    const annotations = message.annotations || [];
    
    const citations = annotations
      .filter(annotation => annotation.type === 'url_citation')
      .map(annotation => ({
        url: annotation.url_citation.url,
        title: annotation.url_citation.title,
        startIndex: annotation.url_citation.start_index,
        endIndex: annotation.url_citation.end_index
      }));

    return {
      content: message.content,
      citations,
      hasCitations: citations.length > 0
    };
  }

  /**
   * Extract web search information from Responses API output
   */
  extractResponsesCitations(outputArray) {
    let webSearchUsed = false;
    let citations = [];
    
    outputArray.forEach(item => {
      if (item.type === 'tool_use' && item.name === 'web_search') {
        webSearchUsed = true;
      }
      
      // Look for citations in message content
      if (item.type === 'message' && item.role === 'assistant' && item.content) {
        // Parse content for citation markers or structured citations
        // This depends on how the Responses API returns citations
        if (Array.isArray(item.content)) {
          item.content.forEach(contentItem => {
            if (contentItem.type === 'text' && contentItem.annotations) {
              citations.push(...contentItem.annotations);
            }
          });
        }
      }
    });

    return {
      webSearchUsed,
      citations,
      hasCitations: citations.length > 0
    };
  }

  /**
   * Get supported models information
   */
  getSupportedModels() {
    return {
      chatCompletions: this.supportedChatModels,
      responses: this.supportedResponsesModels,
      all: [...this.supportedChatModels, ...this.supportedResponsesModels]
    };
  }

  /**
   * Get web search configuration options
   */
  getConfigOptions() {
    return {
      contextSizes: WEB_SEARCH_CONFIG.CONTEXT_SIZES,
      defaultContextSize: WEB_SEARCH_CONFIG.DEFAULT_CONTEXT_SIZE,
      supportedLocationFields: WEB_SEARCH_CONFIG.SUPPORTED_LOCATION_FIELDS,
      toolType: WEB_SEARCH_CONFIG.TOOL_TYPE
    };
  }
}

module.exports = WebSearchService;