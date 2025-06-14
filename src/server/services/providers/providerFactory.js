// Provider Factory - Manages all AI provider handlers
const OpenAIHandler = require('./openaiHandler');
const ClaudeHandler = require('./claudeHandler');
const GroqHandler = require('./groqHandler');
const DeepSeekHandler = require('./deepseekHandler');
const MistralHandler = require('./mistralHandler');
const OpenRouterHandler = require('./openrouterHandler');
const GeminiHandler = require('./geminiHandler');

class ProviderFactory {
  constructor(apiKeys, promptCacheService = null) {
    this.apiKeys = apiKeys;
    this.handlers = {};
    this.promptCacheService = promptCacheService;
    this.initializeHandlers();
  }

  /**
   * Set the prompt cache service (dependency injection)
   */
  setPromptCacheService(promptCacheService) {
    this.promptCacheService = promptCacheService;
    // Inject into existing Claude handler if available
    if (this.handlers.claude && promptCacheService) {
      this.handlers.claude.setPromptCacheService(promptCacheService);
    }
  }

  /**
   * Initialize all available provider handlers
   */
  initializeHandlers() {
    if (this.apiKeys.openai) {
      this.handlers.openai = new OpenAIHandler(this.apiKeys.openai);
      console.log('✅ OpenAI handler initialized');
    }

    if (this.apiKeys.claude) {
      this.handlers.claude = new ClaudeHandler(this.apiKeys.claude);
      // Inject prompt cache service if available
      if (this.promptCacheService) {
        this.handlers.claude.setPromptCacheService(this.promptCacheService);
      }
      console.log('✅ Claude handler initialized');
    }

    if (this.apiKeys.qroq) {
      this.handlers.groq = new GroqHandler(this.apiKeys.qroq);
      console.log('✅ Groq handler initialized');
    }

    if (this.apiKeys.mistral) {
      this.handlers.mistral = new MistralHandler(this.apiKeys.mistral, this.apiKeys.codestral);
      console.log('✅ Mistral handler initialized');
    }

    if (this.apiKeys.openrouter) {
      this.handlers.openrouter = new OpenRouterHandler(this.apiKeys.openrouter);
      console.log('✅ OpenRouter handler initialized');
    }

    if (this.apiKeys.google) {
      this.handlers.gemini = new GeminiHandler(this.apiKeys.google);
      console.log('✅ Gemini handler initialized');
    }

    if (this.apiKeys.deepseek) {
      this.handlers.deepseek = new DeepSeekHandler(this.apiKeys.deepseek);
      console.log('✅ DeepSeek handler initialized');
    }
  }

  /**
   * Get appropriate provider for a model ID
   */
  getProviderForModel(modelID) {
    // OpenRouter models (contain slash)
    if (modelID.includes('/')) {
      return 'openrouter';
    }

    // OpenAI models
    if (modelID.startsWith('gpt') || modelID.includes('o1') || modelID.includes('o3') || modelID.includes('o4')) {
      return 'openai';
    }

    // Claude models
    if (modelID.startsWith('claude')) {
      return 'claude';
    }

    // Groq models (LLaMA and others)
    if (modelID.startsWith('llama') || modelID.startsWith('gemma') || modelID === 'mixtral-8x7b-32768') {
      return 'groq';
    }

    // Mistral models
    if (modelID.includes('mistral') || modelID.includes('mixtral') || modelID === 'codestral-latest') {
      return 'mistral';
    }

    // DeepSeek models
    if (modelID.includes('deepseek')) {
      return 'deepseek';
    }

    // Gemini models
    if (modelID.startsWith('gemini')) {
      return 'gemini';
    }

    // Default to OpenRouter for unknown models
    return 'openrouter';
  }

  /**
   * Get handler instance for a provider
   */
  getHandler(provider) {
    const handler = this.handlers[provider];
    if (!handler) {
      throw new Error(`Provider '${provider}' not available. Check API key configuration.`);
    }
    return handler;
  }

  /**
   * Route request to appropriate provider handler
   */
  async handleRequest(modelID, payload) {
    const provider = this.getProviderForModel(modelID);
    const handler = this.getHandler(provider);
    
    console.log(`🔀 Routing ${modelID} to ${provider} provider`);
    
    return await handler.handleRequest({
      ...payload,
      modelID
    });
  }

  /**
   * Handle image generation (OpenAI only)
   */
  async generateImage(prompt, options = {}) {
    if (!this.handlers.openai) {
      throw new Error('OpenAI API key required for image generation');
    }
    return await this.handlers.openai.generateImage(prompt, options);
  }

  /**
   * Handle audio transcription (OpenAI or Groq)
   */
  async transcribeAudio(audioFilePath, filename, options = {}) {
    const { 
      preferGroq = false,
      preferredModel = 'gpt-4o-transcribe',
      usePrompting = true
    } = options;

    // Prefer Groq if available and requested, otherwise use enhanced OpenAI
    if (preferGroq && this.handlers.groq) {
      return await this.handlers.groq.transcribeAudio(audioFilePath, filename);
    } else if (this.handlers.openai) {
      return await this.handlers.openai.transcribeAudio(audioFilePath, filename, {
        preferredModel,
        usePrompting
      });
    } else if (this.handlers.groq) {
      return await this.handlers.groq.transcribeAudio(audioFilePath, filename);
    } else {
      throw new Error('No transcription service available. Requires OpenAI or Groq API key.');
    }
  }

  /**
   * Handle text-to-speech (OpenAI only)
   */
  async textToSpeech(text, options = {}) {
    if (!this.handlers.openai) {
      throw new Error('OpenAI API key required for text-to-speech');
    }
    
    const {
      preferredModel = 'gpt-4o-mini-tts',
      voice = 'coral',
      responseFormat = 'mp3',
      instructions = null,
      useIntelligentInstructions = true
    } = options;

    return await this.handlers.openai.textToSpeech(text, {
      preferredModel,
      voice,
      responseFormat,
      instructions,
      useIntelligentInstructions
    });
  }

  /**
   * Format user input for specific provider
   */
  formatUserInput(modelID, userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null, uploadedFiles = null) {
    const provider = this.getProviderForModel(modelID);
    const handler = this.getHandler(provider);

    console.log('=== ProviderFactory.formatUserInput Debug ===');
    console.log('modelID:', modelID);
    console.log('provider:', provider);
    console.log('userMessage:', userMessage ? userMessage.substring(0, 100) + '...' : 'N/A');
    console.log('fileContents exists:', !!fileContents);
    console.log('fileId:', fileId);
    console.log('imageName:', imageName);
    console.log('base64Image exists:', !!base64Image);
    console.log('base64Image length:', base64Image ? base64Image.length : 0);
    console.log('uploadedFiles:', uploadedFiles);
    console.log('=========================================');

    if (provider === 'claude') {
      return handler.formatUserInput(userMessage, fileContents, fileId, imageName, base64Image, uploadedFiles);
    } else if (provider === 'openai') {
      return handler.formatUserInput(userMessage, fileContents, fileId, imageName, base64Image);
    } else if (provider === 'gemini') {
      return handler.formatUserInput(userMessage, fileContents, fileId);
    } else {
      // For other providers (Groq, Mistral, DeepSeek, OpenRouter)
      return handler.formatUserInput(userMessage, fileContents, fileId);
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    return Object.keys(this.handlers);
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider) {
    return provider in this.handlers;
  }
}

module.exports = ProviderFactory;