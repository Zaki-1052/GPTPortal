// Provider Factory - Manages all AI provider handlers
const OpenAIHandler = require('./openai/index');
const ClaudeHandler = require('./claudeHandler');
const GroqHandler = require('./groqHandler');
const DeepSeekHandler = require('./deepseekHandler');
const MistralHandler = require('./mistralHandler');
const OpenRouterHandler = require('./openrouterHandler');
const GeminiHandler = require('./geminiHandler');
const GrokHandler = require('./grokHandler');

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

    if (this.apiKeys.groq) {
      this.handlers.groq = new GroqHandler(this.apiKeys.groq);
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

    if (this.apiKeys.grok) {
      this.handlers.grok = new GrokHandler(this.apiKeys.grok);
      console.log('✅ Grok handler initialized');
    }
  }

  /**
   * Check if model is an image generation model
   */
  isImageModel(modelID) {
    const imageModelIds = [
      'gpt-image-1', 
      'dall-e-3', 
      'dall-e-2',
      'gemini-2.0-flash-preview-image-generation',
      'imagen-4.0-generate-preview',
      'grok-2-image-1212'
    ];
    return imageModelIds.includes(modelID);
  }

  /**
   * Get appropriate provider for a model ID
   */
  getProviderForModel(modelID) {
    // Image models have specific provider routing
    if (this.isImageModel(modelID)) {
      if (modelID.startsWith('gpt-image') || modelID.startsWith('dall-e')) {
        return 'openai';
      }
      if (modelID.startsWith('gemini-2.0-flash-preview-image-generation') || modelID.startsWith('imagen-')) {
        return 'gemini';
      }
      if (modelID.startsWith('grok-2-image')) {
        return 'grok';
      }
    }

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

    // Grok models
    if (modelID.startsWith('grok')) {
      return 'grok';
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
   * Handle image generation with multi-provider support
   */
  async generateImage(prompt, options = {}) {
    const { modelID = 'gpt-image-1' } = options;
    
    // Determine which provider to use based on model
    const provider = this.getProviderForModel(modelID);
    
    if (provider === 'openai') {
      if (!this.handlers.openai) {
        throw new Error('OpenAI API key required for image generation');
      }
      return await this.handlers.openai.generateImage(prompt, options);
    } else if (provider === 'gemini') {
      if (!this.handlers.gemini) {
        throw new Error('Google API key required for Gemini image generation');
      }
      return await this.handlers.gemini.generateImage(prompt, options);
    } else if (provider === 'grok') {
      if (!this.handlers.grok) {
        throw new Error('Grok API key required for Grok image generation');
      }
      return await this.handlers.grok.generateImage(prompt, options);
    } else {
      throw new Error(`Image generation not supported for provider: ${provider}`);
    }
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
    } else if (provider === 'grok') {
      return handler.formatUserInput(userMessage, fileContents, fileId, imageName, base64Image);
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