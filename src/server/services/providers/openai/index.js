// src/server/services/providers/openai/index.js
// Main OpenAI handler orchestrator - coordinates all specialized handlers

const OpenAIApiClient = require('./services/apiClient');
const WebSearchService = require('./services/webSearchService');
const CodeInterpreterService = require('./services/codeInterpreterService');
const ChatHandler = require('./handlers/chatHandler');
const ResponsesHandler = require('./handlers/responsesHandler');
const ImageHandler = require('./handlers/imageHandler');
const AudioHandler = require('./handlers/audioHandler');
const AssistantsHandler = require('./handlers/assistantsHandler');

const { 
  MODEL_TYPES, 
  CHAT_MODELS, 
  WEB_SEARCH_CHAT_MODELS,
  REASONING_MODELS, 
  WEB_SEARCH_RESPONSES_MODELS,
  CODE_INTERPRETER_MODELS,
  IMAGE_MODELS, 
  AUDIO_MODELS 
} = require('./utils/constants');

class OpenAIHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    
    // Initialize core services
    this.apiClient = new OpenAIApiClient(apiKey);
    this.webSearchService = new WebSearchService();
    this.codeInterpreterService = new CodeInterpreterService();
    
    // Initialize specialized handlers
    this.chatHandler = new ChatHandler(this.apiClient, this.webSearchService);
    this.responsesHandler = new ResponsesHandler(this.apiClient, this.webSearchService, this.codeInterpreterService);
    this.imageHandler = new ImageHandler(this.apiClient);
    this.audioHandler = new AudioHandler(this.apiClient);
    this.assistantsHandler = new AssistantsHandler(this.apiClient);
    
    console.log('✅ OpenAI modular handler initialized');
  }

  /**
   * Route request to appropriate handler based on model and intent
   */
  async handleRequest(payload) {
    const { modelID } = payload;
    
    try {
      // Route to reasoning models via Responses API
      if (this.isReasoningModel(modelID)) {
        return await this.responsesHandler.handleRequest(payload);
      }

      // Route Code Interpreter models to Responses API by default
      if (this.isCodeInterpreterModel(modelID)) {
        return await this.responsesHandler.handleRequest(payload);
      }

      // Route to web search models
      if (this.isWebSearchModel(modelID)) {
        if (this.webSearchService.supportsChatWebSearch(modelID)) {
          return await this.chatHandler.handleChatCompletion(payload);
        } else if (this.webSearchService.supportsResponsesWebSearch(modelID)) {
          return await this.responsesHandler.handleRequest(payload);
        }
      }

      // Route supported models to Responses API by default (gpt-4.1, gpt-4o, etc.)
      if (this.shouldUseResponsesAPI(modelID)) {
        return await this.responsesHandler.handleRequest(payload);
      }

      // Route to standard chat models
      if (this.isChatModel(modelID)) {
        return await this.chatHandler.handleChatCompletion(payload);
      }

      // Route to image models (should use generateImage method instead)
      if (this.isImageModel(modelID)) {
        throw new Error('Image models should use generateImage method, not handleRequest');
      }

      // Default fallback to chat handler for unknown GPT models
      if (modelID.startsWith('gpt')) {
        console.warn(`Unknown GPT model ${modelID}, attempting with chat handler`);
        return await this.chatHandler.handleChatCompletion(payload);
      }

      throw new Error(`Unsupported OpenAI model: ${modelID}`);
    } catch (error) {
      console.error(`OpenAI Handler Error for model ${modelID}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle chat completion (legacy method for backwards compatibility)
   */
  async handleChatCompletion(payload) {
    return this.chatHandler.handleChatCompletion(payload);
  }

  /**
   * Handle reasoning completion (legacy method for backwards compatibility)
   */
  async handleReasoningCompletion(payload) {
    return this.responsesHandler.handleReasoningCompletion(payload);
  }

  /**
   * Generate image with intelligent model selection and fallback
   */
  async generateImage(prompt, options = {}) {
    return this.imageHandler.generateImage(prompt, options);
  }

  /**
   * Transcribe audio with intelligent model selection and fallback
   */
  async transcribeAudio(audioFilePath, filename, options = {}) {
    return this.audioHandler.transcribeAudio(audioFilePath, filename, options);
  }

  /**
   * Text-to-speech with intelligent model selection and fallback
   */
  async textToSpeech(text, options = {}) {
    return this.audioHandler.textToSpeech(text, options);
  }

  /**
   * Initialize assistant and thread
   */
  async initializeAssistantAndThread(modelID, systemMessage) {
    return this.assistantsHandler.initializeAssistantAndThread(modelID, systemMessage);
  }

  /**
   * Handle assistant message
   */
  async handleAssistantMessage(userMessage) {
    return this.assistantsHandler.handleAssistantMessage(userMessage);
  }

  /**
   * Fetch thread messages
   */
  async fetchThreadMessages() {
    return this.assistantsHandler.fetchThreadMessages();
  }

  /**
   * Attach file to assistant
   */
  async attachFileToAssistant(filePath, filename) {
    return this.assistantsHandler.attachFileToAssistant(filePath, filename);
  }

  /**
   * Format user input for appropriate handler
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
    // Use chat handler formatting as default (most common case)
    return this.chatHandler.formatUserInput(userMessage, fileContents, fileId, imageName, base64Image);
  }

  /**
   * Model type detection methods
   */
  isChatModel(modelId) {
    return CHAT_MODELS.includes(modelId);
  }

  isWebSearchModel(modelId) {
    return WEB_SEARCH_CHAT_MODELS.includes(modelId) || 
           WEB_SEARCH_RESPONSES_MODELS.includes(modelId);
  }

  isCodeInterpreterModel(modelId) {
    return CODE_INTERPRETER_MODELS.some(pattern => modelId.includes(pattern));
  }

  isReasoningModel(modelId) {
    return REASONING_MODELS.some(pattern => modelId.includes(pattern));
  }

  /**
   * Determine if model should use Responses API by default
   * Consolidates routing logic for models that support enhanced features
   */
  shouldUseResponsesAPI(modelId) {
    return this.isReasoningModel(modelId) || 
           this.isCodeInterpreterModel(modelId) ||
           this.webSearchService.supportsResponsesWebSearch(modelId);
  }

  isImageModel(modelId) {
    return IMAGE_MODELS.includes(modelId);
  }

  isAudioModel(modelId) {
    return [...AUDIO_MODELS.TRANSCRIPTION, ...AUDIO_MODELS.TTS].includes(modelId);
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelId) {
    const capabilities = {
      chat: this.isChatModel(modelId) || this.webSearchService.supportsChatWebSearch(modelId),
      reasoning: this.isReasoningModel(modelId),
      webSearch: this.isWebSearchModel(modelId),
      codeInterpreter: this.isCodeInterpreterModel(modelId),
      image: this.isImageModel(modelId),
      audio: this.isAudioModel(modelId),
      vision: this.supportsVision(modelId),
      function: this.supportsFunction(modelId)
    };

    // Add specific handler capabilities
    if (capabilities.chat && this.isChatModel(modelId)) {
      Object.assign(capabilities, this.chatHandler.getModelCapabilities(modelId));
    }
    if (capabilities.webSearch && this.webSearchService.supportsChatWebSearch(modelId)) {
      // Web search chat models use chat handler but with web search
      Object.assign(capabilities, {
        webSearchType: 'chat_completions',
        supportsWebSearch: true
      });
    }
    if (capabilities.reasoning || (capabilities.webSearch && this.webSearchService.supportsResponsesWebSearch(modelId))) {
      Object.assign(capabilities, this.responsesHandler.getModelCapabilities(modelId));
    }
    if (capabilities.image) {
      Object.assign(capabilities, this.imageHandler.getModelCapabilities(modelId));
    }
    if (capabilities.audio) {
      Object.assign(capabilities, this.audioHandler.getModelCapabilities(modelId));
    }

    return capabilities;
  }

  /**
   * Check vision support
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
   * Check function calling support
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
   * Get all supported models
   */
  getSupportedModels() {
    return {
      chat: this.chatHandler.getSupportedModels(),
      responses: this.responsesHandler.getSupportedModels(),
      image: this.imageHandler.getSupportedModels(),
      audio: this.audioHandler.getSupportedModels(),
      webSearch: this.webSearchService.getSupportedModels()
    };
  }

  /**
   * Get web search configuration options
   */
  getWebSearchConfigOptions() {
    return this.webSearchService.getConfigOptions();
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    try {
      const apiHealth = await this.apiClient.healthCheck();
      
      return {
        healthy: apiHealth.healthy,
        services: {
          apiClient: apiHealth.healthy,
          chatHandler: true,
          responsesHandler: true,
          imageHandler: true,
          audioHandler: true,
          assistantsHandler: true,
          webSearchService: true,
          codeInterpreterService: true
        },
        supportedModels: this.getSupportedModels(),
        error: apiHealth.error
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        services: {
          apiClient: false
        }
      };
    }
  }

  /**
   * Reset state for new conversation
   */
  resetState() {
    this.responsesHandler.resetState();
    this.assistantsHandler.resetState();
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      totalModels: Object.values(this.getSupportedModels()).flat().length,
      handlers: {
        chat: this.chatHandler.getUsageStats(),
        responses: this.responsesHandler.getUsageStats(),
        image: this.imageHandler.getUsageStats(),
        audio: this.audioHandler.getUsageStats(),
        assistants: this.assistantsHandler.getUsageStats()
      },
      webSearch: this.webSearchService.getSupportedModels()
    };
  }
}

module.exports = OpenAIHandler;