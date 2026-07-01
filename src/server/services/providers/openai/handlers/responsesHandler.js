// src/server/services/providers/openai/handlers/responsesHandler.js
// Responses API handler for OpenAI reasoning models and web search

const { REASONING_MODELS, DEEP_RESEARCH_MODELS, WEB_SEARCH_RESPONSES_MODELS, CODE_INTERPRETER_MODELS, DEFAULTS } = require('../utils/constants');
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
           DEEP_RESEARCH_MODELS.includes(modelId) ||
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
   * Check if model is a deep research model
   */
  isDeepResearchModel(modelId) {
    return DEEP_RESEARCH_MODELS.includes(modelId);
  }

  /**
   * Handle reasoning completion request
   */
  async handleReasoningCompletion(payload) {
    const { 
      user_input, 
      modelID, 
      o1History = [],
      webSearchConfig = null,
      forceCleanResponse = false
    } = payload;

    if (!this.supportsModel(modelID)) {
      throw new Error(`Model ${modelID} not supported by Responses handler`);
    }

    // Add user input to o1History
    o1History.push(user_input);

    // Build the Responses API request (reasoning effort, verbosity, tokens, tools)
    const requestData = await this.buildReasoningRequestData(payload);

    try {
      const response = await this.apiClient.responses(requestData);
      this.responseCount++;
      // Informational only for getCurrentState(); never reused to chain turns.
      // Continuation is caller-supplied via payload.previousResponseId so this
      // singleton instance cannot leak one user's context into another's.
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
      
      // Format the complete message with reasoning if available (unless clean response is forced)
      const formattedContent = forceCleanResponse ? assistantContent : formatReasoningResponse(reasoning, assistantContent);
      
      // Add assistant response to o1History
      o1History.push({ role: "assistant", content: formattedContent });
      
      const result = {
        success: true,
        content: formattedContent,
        reasoning: reasoning,
        response: assistantContent,
        responseId: response.data.id,
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
   * Build the Responses API request body for reasoning-style calls.
   * Pure query: reads payload + services and performs no history mutation, so it
   * is shared by the non-streaming path and the streaming path (stream:true).
   * @param {Object} payload
   * @param {{stream?: boolean}} [options]
   * @returns {Promise<Object>} request data for POST /responses
   */
  async buildReasoningRequestData(payload, { stream = false } = {}) {
    const { user_input, modelID, tokens, verbosity, previousResponseId } = payload;

    // Extract text + optional image from the structured user_input
    let userMessage = null;
    let base64Image = null;
    let imageName = null;

    if (user_input && Array.isArray(user_input.content)) {
      user_input.content.forEach(item => {
        if (item.type === 'text' && item.text && !userMessage) {
          userMessage = item.text;
        } else if (item.type === 'text' && item.text && !imageName) {
          imageName = item.text;
        } else if (item.type === 'image_url' && item.image_url?.url) {
          base64Image = item.image_url.url;
        }
      });
    } else if (user_input && typeof user_input.content === 'string') {
      userMessage = user_input.content;
    }

    const transformedUserInput = formatUserInputForResponses(
      userMessage,
      null, null, imageName, base64Image
    );

    let requestData = {
      model: modelID,
      input: [transformedUserInput],
      store: true
    };

    // Continue a prior turn only when the caller supplies the id (no singleton state)
    if (previousResponseId) {
      requestData.previous_response_id = previousResponseId;
    }

    // Cap the generation length (previously omitted entirely)
    if (tokens) {
      requestData.max_output_tokens = tokens;
    }

    // Wire the user's reasoning effort (falls back to the model default, then 'medium')
    if (this.isReasoningModel(modelID)) {
      requestData.reasoning = {
        effort: await this.resolveReasoningEffort(payload),
        summary: 'auto'
      };
    }

    // Wire response verbosity (GPT-5 text control) when a valid value is provided
    const resolvedVerbosity = this.resolveVerbosity(verbosity);
    if (resolvedVerbosity) {
      requestData.text = { ...(requestData.text || {}), verbosity: resolvedVerbosity };
    }

    // Auto-enable web search for supported models (unless explicitly disabled)
    if (this.webSearchService.supportsResponsesWebSearch(modelID) && payload.webSearchConfig !== false) {
      const processedConfig = this.webSearchService.processWebSearchConfig(payload.webSearchConfig || {});
      requestData = this.webSearchService.addWebSearchToResponses(requestData, processedConfig);
      console.log(`🔍 Web search enabled by default for ${modelID}`);
    }

    // Auto-enable Code Interpreter for supported models (unless explicitly disabled)
    if (this.codeInterpreterService.supportsCodeInterpreter(modelID) && payload.codeInterpreterConfig !== false) {
      const codeConfig = payload.codeInterpreterConfig || {};
      requestData = this.codeInterpreterService.addCodeInterpreterToResponses(requestData, codeConfig);
      console.log(`🐍 Code Interpreter enabled by default for ${modelID}`);
    }

    if (stream) {
      requestData.stream = true;
    }

    return requestData;
  }

  /**
   * Resolve reasoning effort: explicit payload value, else the model's
   * defaultReasoningEffort, else 'medium'. Allowed: none|minimal|low|medium|high|xhigh.
   * @param {Object} payload
   * @returns {Promise<string>}
   */
  async resolveReasoningEffort(payload) {
    const allowed = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'];
    if (payload.reasoningEffort && allowed.includes(payload.reasoningEffort)) {
      return payload.reasoningEffort;
    }
    try {
      const modelLoader = require('../../../../../shared/modelLoader');
      const model = await modelLoader.getModel(payload.modelID);
      if (model && model.defaultReasoningEffort && allowed.includes(model.defaultReasoningEffort)) {
        return model.defaultReasoningEffort;
      }
    } catch (error) {
      console.warn('Could not resolve model default reasoning effort:', error.message);
    }
    return 'medium';
  }

  /**
   * Validate and normalize verbosity; returns null when absent/invalid.
   * @param {string} verbosity
   * @returns {string|null}
   */
  resolveVerbosity(verbosity) {
    const allowed = ['low', 'medium', 'high'];
    return verbosity && allowed.includes(verbosity) ? verbosity : null;
  }

  /**
   * Handle standard completion with web search
   */
  /**
   * Handle deep research completion request
   */
  async handleDeepResearchCompletion(payload) {
    const { 
      user_input, 
      modelID, 
      webSearchConfig = null,
      codeInterpreterConfig = null
    } = payload;

    if (!this.supportsModel(modelID)) {
      throw new Error(`Model ${modelID} not supported by Responses handler`);
    }

    console.log(`🔬 Starting deep research with ${modelID}`);

    try {
      // Convert user_input to input format for deep research
      const inputText = this.extractTextFromUserInput(user_input);

      // Build request data for deep research
      let requestData = {
        model: modelID,
        input: inputText,
        store: true,
        tools: []
      };

      // Deep research requires at least one data source - web search and/or code interpreter
      // Auto-enable web search for deep research models
      if (webSearchConfig !== false) {
        const webSearchTool = this.webSearchService.formatWebSearchTool({
          maxUses: 20, // Deep research needs more searches
          ...webSearchConfig
        });
        requestData.tools.push(webSearchTool);
        console.log('🔍 Web search enabled for deep research');
      }

      // Auto-enable code interpreter for analysis
      if (codeInterpreterConfig !== false) {
        const codeInterpreterTool = this.codeInterpreterService.formatCodeInterpreterTool({
          container: { type: 'auto' },
          ...codeInterpreterConfig
        });
        requestData.tools.push(codeInterpreterTool);
        console.log('💻 Code interpreter enabled for deep research');
      }

      // Ensure at least one tool is enabled
      if (requestData.tools.length === 0) {
        // Default to web search if no tools specified
        const defaultWebSearchTool = this.webSearchService.formatWebSearchTool({ maxUses: 20 });
        requestData.tools.push(defaultWebSearchTool);
        console.log('🔍 Default web search enabled - deep research requires data sources');
      }

      // Add reasoning configuration for deep research
      requestData.reasoning = {
        effort: "high",
        summary: "auto"
      };

      // Set background mode for long-running requests (optional)
      // requestData.background = true; // Can be enabled if needed

      console.log(`🚀 Sending deep research request to OpenAI with ${requestData.tools.length} tools`);
      
      const response = await this.apiClient.responses(requestData);
      
      console.log('✅ Deep research response received');
      
      return this.processDeepResearchOutput(response);
      
    } catch (error) {
      console.error(`❌ Deep research error for model ${modelID}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract text from user_input object for deep research input format
   */
  extractTextFromUserInput(user_input) {
    if (typeof user_input === 'string') {
      return user_input;
    }
    
    if (user_input && user_input.content) {
      if (Array.isArray(user_input.content)) {
        return user_input.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n');
      }
      return user_input.content;
    }

    if (user_input && user_input.role === 'user' && user_input.content) {
      return user_input.content;
    }

    return JSON.stringify(user_input);
  }

  /**
   * Process deep research output with special handling for web_search_call and code_interpreter_call
   */
  processDeepResearchOutput(response) {
    console.log('Processing deep research output...');

    const processedResponse = this.processResponsesOutput(response);
    
    // Extract deep research specific information
    const deepResearchInfo = {
      webSearchCalls: [],
      codeInterpreterCalls: [],
      mcpToolCalls: [],
      totalToolCalls: 0
    };

    if (response.output && Array.isArray(response.output)) {
      response.output.forEach(item => {
        if (item.type === 'web_search_call') {
          deepResearchInfo.webSearchCalls.push(item);
          deepResearchInfo.totalToolCalls++;
        } else if (item.type === 'code_interpreter_call') {
          deepResearchInfo.codeInterpreterCalls.push(item);
          deepResearchInfo.totalToolCalls++;
        } else if (item.type === 'mcp_tool_call') {
          deepResearchInfo.mcpToolCalls.push(item);
          deepResearchInfo.totalToolCalls++;
        }
      });
    }

    // Add deep research metadata to response
    processedResponse.deepResearch = deepResearchInfo;
    processedResponse.isDeepResearch = true;
    
    console.log(`✅ Deep research complete: ${deepResearchInfo.totalToolCalls} tool calls made`);
    
    return processedResponse;
  }

  async handleCompletionWithWebSearch(payload) {
    const { 
      user_input, 
      modelID, 
      systemMessage,
      conversationHistory = [],
      temperature = DEFAULTS.TEMPERATURE,
      tokens = DEFAULTS.MAX_TOKENS,
      webSearchConfig = null,
      forceCleanResponse = false
    } = payload;

    if (!this.webSearchService.supportsResponsesWebSearch(modelID)) {
      throw new Error(`Model ${modelID} does not support web search via Responses API`);
    }

    // Transform user input for Responses API
    // Extract all content items (text and images) from user_input
    let userMessage = null;
    let base64Image = null;
    let imageName = null;
    
    if (user_input.content && Array.isArray(user_input.content)) {
      // Extract text and image content from the array
      user_input.content.forEach(item => {
        if (item.type === 'text' && item.text && !userMessage) {
          userMessage = item.text;
        } else if (item.type === 'text' && item.text && !imageName) {
          imageName = item.text;
        } else if (item.type === 'image_url' && item.image_url?.url) {
          base64Image = item.image_url.url;
        }
      });
    } else if (typeof user_input.content === 'string') {
      userMessage = user_input.content;
    }
    
    const transformedUserInput = formatUserInputForResponses(
      userMessage,
      null, null, imageName, base64Image
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
        // Handle user messages that might contain images
        let msgText = null;
        let msgImage = null;
        let msgImageName = null;
        
        if (msg.content && Array.isArray(msg.content)) {
          msg.content.forEach(item => {
            if (item.type === 'text' && item.text && !msgText) {
              msgText = item.text;
            } else if (item.type === 'text' && item.text && !msgImageName) {
              msgImageName = item.text;
            } else if (item.type === 'image_url' && item.image_url?.url) {
              msgImage = item.image_url.url;
            }
          });
        } else if (typeof msg.content === 'string') {
          msgText = msg.content;
        }
        
        input.push(formatUserInputForResponses(msgText, null, null, msgImageName, msgImage));
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
      max_output_tokens: tokens,
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
      
      // Use assistant content directly for non-reasoning models (or when clean response is forced)
      const finalContent = (reasoning && !forceCleanResponse) ? formatReasoningResponse(reasoning, assistantContent) : assistantContent;
      
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

    // Check if this is a deep research model (highest priority - combines reasoning + web search)
    if (this.isDeepResearchModel(modelID)) {
      return this.handleDeepResearchCompletion(payload);
    }

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