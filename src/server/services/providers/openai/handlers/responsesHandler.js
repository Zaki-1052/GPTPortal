// src/server/services/providers/openai/handlers/responsesHandler.js
// Responses API handler for OpenAI reasoning models and web search

const { REASONING_MODELS, WEB_SEARCH_RESPONSES_MODELS, CODE_INTERPRETER_MODELS, DEFAULTS } = require('../utils/constants');
const { 
  formatUserInputForResponses, 
  extractResponseContent, 
  formatReasoningResponse 
} = require('../utils/formatters');

class ResponsesHandler {
  constructor(apiClient, webSearchService, codeInterpreterService) {
    this.apiClient = apiClient;
    this.webSearchService = webSearchService;
    this.codeInterpreterService = codeInterpreterService;
    this.responseCount = 0;
    this.lastResponseId = null;
  }

  /**
   * Check if model is supported by this handler
   */
  supportsModel(modelId) {
    return REASONING_MODELS.some(pattern => modelId.includes(pattern)) || 
           WEB_SEARCH_RESPONSES_MODELS.includes(modelId) ||
           CODE_INTERPRETER_MODELS.some(pattern => modelId.includes(pattern));
  }

  /**
   * Check if model is a reasoning model
   */
  isReasoningModel(modelId) {
    return REASONING_MODELS.some(pattern => modelId.includes(pattern));
  }

  /**
   * Handle reasoning completion request
   */
  async handleReasoningCompletion(payload) {
    const { 
      user_input, 
      modelID, 
      o1History = [],
      webSearchConfig = null
    } = payload;

    if (!this.supportsModel(modelID)) {
      throw new Error(`Model ${modelID} not supported by Responses handler`);
    }

    // Add user input to o1History
    o1History.push(user_input);

    // Transform content types for Responses API
    const transformedUserInput = formatUserInputForResponses(
      user_input.content?.[0]?.text || user_input.content,
      null, null, null, null
    );

    // Build request data
    let requestData;
    if (this.responseCount > 0 && this.lastResponseId) {
      requestData = {
        model: modelID,
        previous_response_id: this.lastResponseId,
        input: [transformedUserInput],
        store: true,
      };
    } else {
      requestData = {
        model: modelID,
        input: [transformedUserInput],
        store: true,
      };
    }

    // Add reasoning configuration for reasoning models
    if (this.isReasoningModel(modelID)) {
      requestData.reasoning = { 
        effort: "high", 
        summary: "auto" 
      };
    }

    // Auto-enable web search for supported models (like Claude implementation)
    if (this.webSearchService.supportsResponsesWebSearch(modelID)) {
      if (webSearchConfig !== false) { // Allow explicit disable with false
        const processedConfig = this.webSearchService.processWebSearchConfig(webSearchConfig || {});
        requestData = this.webSearchService.addWebSearchToResponses(requestData, processedConfig);
        console.log(`🔍 Web search enabled by default for ${modelID}`);
      }
    }

    // Auto-enable Code Interpreter for supported models
    if (this.codeInterpreterService.supportsCodeInterpreter(modelID)) {
      if (payload.codeInterpreterConfig !== false) { // Allow explicit disable with false
        const codeConfig = payload.codeInterpreterConfig || {};
        requestData = this.codeInterpreterService.addCodeInterpreterToResponses(requestData, codeConfig);
        console.log(`🐍 Code Interpreter enabled by default for ${modelID}`);
      }
    }

    try {
      const response = await this.apiClient.responses(requestData);
      this.responseCount++;
      this.lastResponseId = response.data.id;

      // Process response format
      const outputArray = response.data.output;
      const { reasoning, response: assistantContent } = extractResponseContent(outputArray);
      
      // Check for web search usage
      let webSearchUsed = false;
      let citations = [];
      
      if (this.webSearchService.supportsResponsesWebSearch(modelID) && webSearchConfig !== false) {
        const citationData = this.webSearchService.extractResponsesCitations(outputArray);
        webSearchUsed = citationData.webSearchUsed;
        citations = citationData.citations;
      }

      // Check for Code Interpreter usage
      let codeInterpreterUsed = false;
      let codeExecutions = [];
      let generatedFiles = [];
      
      if (this.codeInterpreterService.supportsCodeInterpreter(modelID) && payload.codeInterpreterConfig !== false) {
        const codeResults = this.codeInterpreterService.extractCodeInterpreterResults(outputArray);
        codeInterpreterUsed = codeResults.hasCodeExecution;
        codeExecutions = codeResults.codeExecutions;
        generatedFiles = codeResults.generatedFiles;
      }
      
      // Format the complete message with reasoning if available
      const formattedContent = formatReasoningResponse(reasoning, assistantContent);
      
      // Add assistant response to o1History
      o1History.push({ role: "assistant", content: formattedContent });
      
      const result = {
        success: true,
        content: formattedContent,
        reasoning: reasoning,
        response: assistantContent,
        responseId: this.lastResponseId,
        model: modelID,
        type: 'responses',
        usage: response.data.usage
      };

      // Add web search information if used
      if (webSearchUsed) {
        result.webSearchUsed = true;
        result.citations = citations;
      }

      // Add Code Interpreter information if used
      if (codeInterpreterUsed) {
        result.codeInterpreterUsed = true;
        result.codeExecutions = codeExecutions;
        result.generatedFiles = generatedFiles;
      }

      return result;
    } catch (error) {
      console.error('Responses API Error:', error.message);
      throw new Error(`Responses API Error: ${error.message}`);
    }
  }

  /**
   * Handle standard completion with web search
   */
  async handleCompletionWithWebSearch(payload) {
    const { 
      user_input, 
      modelID, 
      systemMessage,
      conversationHistory = [],
      temperature = DEFAULTS.TEMPERATURE,
      tokens = DEFAULTS.MAX_TOKENS,
      webSearchConfig = null
    } = payload;

    if (!this.webSearchService.supportsResponsesWebSearch(modelID)) {
      throw new Error(`Model ${modelID} does not support web search via Responses API`);
    }

    // Transform user input for Responses API
    const transformedUserInput = formatUserInputForResponses(
      user_input.content?.[0]?.text || user_input.content,
      null, null, null, null
    );

    // Build conversation input
    const input = [];
    
    // Add system message if provided
    if (systemMessage) {
      input.push({ role: "system", content: systemMessage });
    }

    // Add conversation history
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        input.push(formatUserInputForResponses(msg.content));
      } else {
        input.push({ role: msg.role, content: msg.content });
      }
    });

    // Add current user input
    input.push(transformedUserInput);

    // Build request data
    let requestData = {
      model: modelID,
      input: input,
      temperature: temperature,
      max_tokens: tokens,
      store: true
    };

    // Auto-enable web search by default (allow explicit disable with false)
    if (webSearchConfig !== false) {
      const processedConfig = this.webSearchService.processWebSearchConfig(webSearchConfig || {});
      requestData = this.webSearchService.addWebSearchToResponses(requestData, processedConfig);
      console.log(`🔍 Web search enabled by default for ${modelID}`);
    }

    // Auto-enable Code Interpreter for supported models
    if (this.codeInterpreterService.supportsCodeInterpreter(modelID)) {
      if (payload.codeInterpreterConfig !== false) { // Allow explicit disable with false
        const codeConfig = payload.codeInterpreterConfig || {};
        requestData = this.codeInterpreterService.addCodeInterpreterToResponses(requestData, codeConfig);
        console.log(`🐍 Code Interpreter enabled by default for ${modelID}`);
      }
    }

    try {
      const response = await this.apiClient.responses(requestData);
      
      // Process response
      const outputArray = response.data.output;
      const { reasoning, response: assistantContent } = extractResponseContent(outputArray);
      
      // Extract web search information (if enabled)
      let webSearchUsed = false;
      let citations = [];
      
      if (webSearchConfig !== false) {
        const citationData = this.webSearchService.extractResponsesCitations(outputArray);
        webSearchUsed = citationData.webSearchUsed;
        citations = citationData.citations;
      }

      // Extract Code Interpreter information (if enabled)
      let codeInterpreterUsed = false;
      let codeExecutions = [];
      let generatedFiles = [];
      
      if (this.codeInterpreterService.supportsCodeInterpreter(modelID) && payload.codeInterpreterConfig !== false) {
        const codeResults = this.codeInterpreterService.extractCodeInterpreterResults(outputArray);
        codeInterpreterUsed = codeResults.hasCodeExecution;
        codeExecutions = codeResults.codeExecutions;
        generatedFiles = codeResults.generatedFiles;
      }
      
      // Use assistant content directly for non-reasoning models
      const finalContent = reasoning ? formatReasoningResponse(reasoning, assistantContent) : assistantContent;
      
      const result = {
        success: true,
        content: finalContent,
        response: assistantContent,
        responseId: response.data.id,
        model: modelID,
        type: 'responses',
        usage: response.data.usage
      };

      // Add web search information if enabled and used
      if (webSearchUsed) {
        result.webSearchUsed = true;
        result.citations = citations;
      }

      // Add reasoning if available
      if (reasoning) {
        result.reasoning = reasoning;
      }

      // Add Code Interpreter information if used
      if (codeInterpreterUsed) {
        result.codeInterpreterUsed = true;
        result.codeExecutions = codeExecutions;
        result.generatedFiles = generatedFiles;
      }

      return result;
    } catch (error) {
      console.error('Responses API Error:', error.message);
      throw new Error(`Responses API Error: ${error.message}`);
    }
  }

  /**
   * Route request to appropriate method
   */
  async handleRequest(payload) {
    const { modelID } = payload;

    // Check if this is a reasoning model
    if (this.isReasoningModel(modelID)) {
      return this.handleReasoningCompletion(payload);
    }
    
    // Auto-enable web search for supported standard models (like Claude implementation)
    if (this.webSearchService.supportsResponsesWebSearch(modelID)) {
      return this.handleCompletionWithWebSearch(payload);
    }
    
    throw new Error(`Model ${modelID} not supported or misconfigured for Responses API`);
  }

  /**
   * Format user input for responses models
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
    return formatUserInputForResponses(userMessage, fileContents, fileId, imageName, base64Image);
  }

  /**
   * Get supported models
   */
  getSupportedModels() {
    return {
      reasoning: REASONING_MODELS,
      webSearch: WEB_SEARCH_RESPONSES_MODELS,
      codeInterpreter: CODE_INTERPRETER_MODELS,
      all: [...new Set([...REASONING_MODELS, ...WEB_SEARCH_RESPONSES_MODELS, ...CODE_INTERPRETER_MODELS])]
    };
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelId) {
    const capabilities = {
      reasoning: this.isReasoningModel(modelId),
      webSearch: this.webSearchService.supportsResponsesWebSearch(modelId),
      codeInterpreter: this.codeInterpreterService.supportsCodeInterpreter(modelId),
      stateful: true, // Responses API maintains state
      previousResponse: true // Supports previous_response_id
    };

    return capabilities;
  }

  /**
   * Reset state for new conversation
   */
  resetState() {
    this.responseCount = 0;
    this.lastResponseId = null;
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return {
      responseCount: this.responseCount,
      lastResponseId: this.lastResponseId,
      hasState: this.responseCount > 0
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      supportedModels: this.getSupportedModels().all.length,
      reasoningModels: REASONING_MODELS.length,
      webSearchModels: WEB_SEARCH_RESPONSES_MODELS.length,
      codeInterpreterModels: CODE_INTERPRETER_MODELS.length,
      apiType: 'Responses',
      currentState: this.getCurrentState()
    };
  }
}

module.exports = ResponsesHandler;