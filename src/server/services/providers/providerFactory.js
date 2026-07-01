// Provider Factory - Manages all AI provider handlers
const OpenAIHandler = require('./openai/index');
const ClaudeHandler = require('./claudeHandler');
const GroqHandler = require('./groqHandler');
const DeepSeekHandler = require('./deepseekHandler');
const MistralHandler = require('./mistralHandler');
const OpenRouterHandler = require('./openrouterHandler');
const GeminiHandler = require('./geminiHandler');
const GrokHandler = require('./grokHandler');
const KimiHandler = require('./kimiHandler');
const CustomEndpointHandler = require('./customEndpointHandler');
const { loadEndpointsFromEnv } = require('./endpointResolver');

class ProviderFactory {
  constructor(apiKeys, promptCacheService = null) {
    this.apiKeys = apiKeys;
    this.handlers = {};
    this.promptCacheService = promptCacheService;
    // catalog id -> handler key, so routing follows the model catalog (single
    // source of truth) instead of brittle string prefixes. Built once at init.
    this.catalogRoutes = this._loadCatalogRoutes();
    this.initializeHandlers();
  }

  /**
   * Build a { modelID -> handlerKey } map from the model catalog so
   * getProviderForModel can consult the declared `provider` field first.
   * Catalog `provider` values use vendor names (`anthropic`, `google`) while
   * handlers are keyed by our internal names (`claude`, `gemini`); resolve that
   * alias here. Failure is non-fatal — routing falls back to prefix matching.
   * @returns {Object<string,string>}
   */
  _loadCatalogRoutes() {
    const alias = { anthropic: 'claude', google: 'gemini' };
    try {
      const catalog = require('../../../../public/js/data/models.json');
      const routes = {};
      for (const [id, model] of Object.entries(catalog.models || {})) {
        const provider = model && model.provider;
        if (!provider) continue;
        routes[id] = alias[provider] || provider;
      }
      return routes;
    } catch (error) {
      console.warn('⚠️  Could not load catalog for provider routing; using prefix matching only:', error.message);
      return {};
    }
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

    if (this.apiKeys.kimi) {
      this.handlers.kimi = new KimiHandler(this.apiKeys.kimi);
      console.log('✅ Kimi handler initialized');
    }

    // Optional, config-driven OpenAI-compatible endpoints (Ollama/LM Studio/vLLM/…).
    // Fully opt-in: only registered when CUSTOM_* env vars declare an endpoint.
    const customEndpoints = loadEndpointsFromEnv();
    if (customEndpoints.length > 0) {
      this.handlers.custom = new CustomEndpointHandler(customEndpoints);
      console.log(`✅ Custom endpoint handler initialized (${customEndpoints.map(e => e.prefix).join(', ')})`);
    }
  }

  /**
   * Check if model is an image generation model
   */
  isImageModel(modelID) {
    const imageModelIds = [
      'gpt-image-2',
      'gpt-image-1.5',
      'gpt-image-1-mini',
      'gpt-image-1',
      'gemini-3.1-flash-image',
      'gemini-3-pro-image'
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
      if (modelID.startsWith('gemini')) {
        return 'gemini';
      }
      if (modelID.startsWith('grok')) {
        return 'grok';
      }
    }

    // Prefer the catalog's declared provider (single source of truth) over the
    // string-prefix guesses below. This covers every core model — including
    // slash ids like `openai/gpt-oss-120b` (→ groq) — so the routing table and
    // the catalog can never silently diverge. OpenRouter slash ids and any
    // unknown/custom ids are absent from the catalog and fall through.
    const catalogProvider = this.catalogRoutes[modelID];
    if (catalogProvider) {
      return catalogProvider;
    }

    // Groq-hosted open models use slash ids (e.g. openai/gpt-oss-120b, groq/compound) —
    // match these BEFORE the generic slash → OpenRouter fallback below.
    if (modelID.includes('gpt-oss') || modelID.startsWith('groq/')) {
      return 'groq';
    }

    // User-configured OpenAI-compatible endpoints use `<prefix>/<model>` ids
    // (e.g. `ollama/llama3.2`). Match before the generic slash → OpenRouter.
    if (this.handlers.custom && this.handlers.custom.supports(modelID)) {
      return 'custom';
    }

    // OpenRouter models (contain slash)
    if (modelID.includes('/')) {
      return 'openrouter';
    }

    // OpenAI models (GPT family + o-series reasoning, e.g. o4-mini)
    if (modelID.startsWith('gpt') || /^o\d/.test(modelID)) {
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

    // Mistral models (large/medium/small, codestral, magistral, devstral, ministral, pixtral)
    if (/mistral|mixtral|codestral|magistral|devstral|ministral|pixtral/.test(modelID)) {
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

    // Kimi / Moonshot models
    if (modelID.includes('kimi')) {
      return 'kimi';
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
   * Whether the routed handler can stream this model (never for image models).
   */
  supportsStreaming(modelID) {
    if (this.isImageModel(modelID)) return false;
    try {
      const provider = this.getProviderForModel(modelID);
      const handler = this.handlers[provider];
      return !!(handler && typeof handler.streamCompletion === 'function');
    } catch (error) {
      return false;
    }
  }

  /**
   * Route a streaming request to the appropriate provider handler.
   * Yields contract events: { type: 'thinking'|'text'|'error'|'usage', ... }.
   * Falls back to a single non-streaming turn for handlers without streamCompletion.
   */
  async *handleRequestStream(modelID, payload) {
    const provider = this.getProviderForModel(modelID);
    const handler = this.getHandler(provider);

    console.log(`🔀 Streaming ${modelID} via ${provider} provider`);

    if (typeof handler.streamCompletion !== 'function') {
      const result = await handler.handleRequest({ ...payload, modelID });
      if (result && result.success) {
        yield { type: 'text', value: result.content };
        yield { type: 'usage', usage: result.usage || {} };
      } else {
        yield { type: 'error', value: (result && result.error) || 'Request failed' };
      }
      return;
    }

    yield* handler.streamCompletion({ ...payload, modelID });
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
    } else if (provider === 'kimi') {
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