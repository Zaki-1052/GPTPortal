// Refactored Dynamic Model Manager - Main Coordinator
// Manages model data and coordinates specialized modules

class DynamicModelManager {
  constructor() {
    // Prevent multiple instances
    if (window.dynamicModelManagerInstance) {
      console.log('DynamicModelManager instance already exists, returning existing instance');
      return window.dynamicModelManagerInstance;
    }
    window.dynamicModelManagerInstance = this;

    // Core state
    this.models = null;
    this.categories = null;
    this.loading = false;
    this.lastFetch = null;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes

    // Specialized managers
    this.searchManager = null;
    this.uiManager = null;
    this.initialized = false;

    // Model descriptions for enhanced display
    this.modelDescriptions = this.getModelDescriptions();

    this.init();
  }

  /**
   * Initialize the dynamic model manager
   */
  async init() {
    try {
      console.log('Initializing Enhanced Dynamic Model Manager...');

      // Initialize specialized managers
      this.initializeManagers();

      // Set initial state
      this.setInitialState();

      // Load model data
      await this.loadCompleteModelList();

      // Initialize managers with model data
      if (this.models && Object.keys(this.models).length > 0) {
        this.initializeManagersWithData();
        this.populateModelSelector();
        console.log('Enhanced Dynamic Model Manager initialized successfully');
      } else {
        console.error('No models loaded, cannot populate selector');
      }

      this.initialized = true;

    } catch (error) {
      console.error('Failed to initialize Dynamic Model Manager:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize specialized manager instances
   */
  initializeManagers() {
    console.log('Initializing specialized managers...');

    // Initialize search manager
    if (window.ModelSearchManager) {
      this.searchManager = new window.ModelSearchManager();
      console.log('Search manager created');
    } else {
      console.warn('ModelSearchManager not available');
    }

    // Initialize UI manager
    if (window.ModelUIManager) {
      this.uiManager = new window.ModelUIManager();
      console.log('UI manager created');
    } else {
      console.warn('ModelUIManager not available');
    }
  }

  /**
   * Initialize managers with loaded data
   */
  initializeManagersWithData() {
    console.log('Initializing managers with model data...');

    if (this.searchManager) {
      this.searchManager.initialize(this);
      this.searchManager.loadPreferences();
    }

    if (this.uiManager) {
      this.uiManager.initialize(this);
    }

    console.log('Managers initialized with data');
  }

  /**
   * Set initial UI state
   */
  setInitialState() {
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = 'Select a Model';
    }

    // Ensure dropdown starts hidden
    const modelOptions = document.getElementById('model-options');
    if (modelOptions) {
      modelOptions.style.display = 'none';
    }

    // Hide loading indicators
    const loadingDiv = document.getElementById('loading-models');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }

  /**
   * Load complete model list from JSON file or API
   */
  async loadCompleteModelList() {
    try {
      console.log('Loading complete model list...');

      // Try loading from JSON file first
      const response = await fetch('/js/data/models.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const modelData = await response.json();
      this.processModelData(modelData);

      // Load OpenRouter models and merge them
      await this.loadOpenRouterModels();

      console.log(`Loaded ${Object.keys(this.models).length} models total (core + OpenRouter)`);

    } catch (error) {
      console.warn('Failed to load from JSON, trying API fallback:', error);
      await this.loadFromAPI();
    }
  }

  /**
   * Load OpenRouter models from API and merge with core models
   */
  async loadOpenRouterModels() {
    try {
      console.log('Loading OpenRouter models from API...');
      
      const response = await fetch('/api/models/openrouter');
      if (!response.ok) {
        console.warn(`OpenRouter API returned ${response.status}, skipping OpenRouter models`);
        return;
      }
      
      const data = await response.json();
      if (!data.success || !data.data) {
        console.warn('Invalid OpenRouter API response, skipping OpenRouter models');
        return;
      }
      
      const openRouterModels = data.data;
      const openRouterCount = Object.keys(openRouterModels).length;
      
      if (openRouterCount === 0) {
        console.log('No OpenRouter models available');
        return;
      }
      
      console.log(`Processing ${openRouterCount} OpenRouter models...`);
      
      // Merge OpenRouter models with core models
      let mergedCount = 0;
      Object.entries(openRouterModels).forEach(([id, model]) => {
        // Skip if model already exists (core models take precedence)
        if (this.models[id]) {
          console.log(`Skipping duplicate model: ${id}`);
          return;
        }
        
        // Ensure proper source marking for OpenRouter models
        const processedModel = {
          ...model,
          id: id,
          source: 'openrouter'
        };
        
        // Add to models collection
        this.models[id] = processedModel;
        mergedCount++;
        
        // Update categories
        const category = model.category || 'other';
        if (!this.categories[category]) {
          this.categories[category] = {
            name: this.getCategoryDisplayName(category),
            models: []
          };
        }
        
        if (!this.categories[category].models.includes(id)) {
          this.categories[category].models.push(id);
        }
      });
      
      console.log(`Successfully merged ${mergedCount} OpenRouter models (${openRouterCount - mergedCount} duplicates skipped)`);
      
      // Log cache status if available
      if (data.meta && data.meta.cacheStatus) {
        console.log('OpenRouter cache status:', data.meta.cacheStatus);
      }
      
    } catch (error) {
      console.warn('Failed to load OpenRouter models:', error.message);
      // Don't throw - allow core models to work even if OpenRouter fails
    }
  }

  /**
   * Load models from API as fallback
   */
  async loadFromAPI() {
    this.loading = true;
    this.showLoading(true);

    try {
      console.log('Fetching models from API...');
      const response = await fetch('/api/models?format=frontend');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'API returned error');
      }

      // Handle unified API response format
      if (data.data.models && data.data.categories) {
        // Frontend format response
        this.models = data.data.models;
        this.categories = data.data.categories;
      } else {
        // Process raw models data
        this.processModelData({ models: data.data });
      }
      
      this.lastFetch = Date.now();

      // Enhance models with descriptions
      this.enhanceModelsWithDescriptions();

      console.log(`Loaded ${Object.keys(this.models).length} models from API (includes core + OpenRouter)`);

    } catch (error) {
      console.error('API fallback failed, using core models:', error);
      this.loadFallbackModels();
    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  /**
   * Process model data from JSON
   * @param {Object} modelData - Raw model data
   */
  processModelData(modelData) {
    // Handle the JSON structure
    const modelsData = modelData.models || modelData;
    this.models = {};
    this.categories = {};

    // Group models by category
    const categorizedModels = {};
    Object.values(modelsData).forEach(model => {
      const category = model.category || 'other';
      if (!categorizedModels[category]) {
        categorizedModels[category] = [];
      }
      categorizedModels[category].push(model);
    });

    // Process categorized models
    Object.entries(categorizedModels).forEach(([categoryKey, categoryModels]) => {
      // Build category info
      this.categories[categoryKey] = {
        name: this.getCategoryDisplayName(categoryKey),
        models: categoryModels.map(model => model.id)
      };

      // Add models to main models object
      categoryModels.forEach(model => {
        this.models[model.id] = {
          ...model,
          category: categoryKey,
          source: model.source || 'core'
        };
      });
    });

    // Enhance with descriptions
    this.enhanceModelsWithDescriptions();

    console.log('Model data processed successfully');
  }

  /**
   * Load fallback models for emergency use
   */
  loadFallbackModels() {
    console.log('Loading fallback models...');

    this.models = {
      'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o: Latest',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-4o']
      },
      'claude-3-5-sonnet-latest': {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: this.modelDescriptions['claude-3-5-sonnet-latest']
      },
      'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        category: 'gemini',
        source: 'core',
        description: this.modelDescriptions['gemini-1.5-pro']
      }
    };

    this.categories = {
      gpt: { name: 'GPT Models', models: ['gpt-4o'] },
      claude: { name: 'Claude Models', models: ['claude-3-5-sonnet-latest'] },
      gemini: { name: 'Gemini Models', models: ['gemini-1.5-pro'] }
    };

    console.log('Fallback models loaded');
  }

  /**
   * Enhance models with rich descriptions
   */
  enhanceModelsWithDescriptions() {
    if (!this.models) return;

    Object.keys(this.models).forEach(modelId => {
      const model = this.models[modelId];

      // Add description if available
      if (this.modelDescriptions[modelId]) {
        model.description = this.modelDescriptions[modelId];
      }

      // Ensure display name is set
      if (!model.name) {
        model.name = this.getDisplayName(modelId);
      }
    });
  }

  /**
   * Populate model selector UI
   */
  populateModelSelector() {
    if (this.uiManager) {
      this.uiManager.populateModelSelector(this.models, this.categories);
    } else {
      console.warn('UI manager not available for populating selector');
    }
  }

  /**
   * Filter models based on search and settings
   */
  filterModels() {
    if (this.uiManager) {
      this.uiManager.populateModelSelector(this.models, this.categories);
    }
  }

  /**
   * Select a model
   * @param {string} modelId - Model ID to select
   */
  selectModel(modelId) {
    const model = this.models[modelId];
    if (!model) {
      console.error('Model not found:', modelId);
      return;
    }

    console.log('Selecting model:', modelId, model.name);

    // Update selected model display
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = model.name || model.id;
    }

    // Update global model state for backward compatibility
    this.updateGlobalModelState(modelId);

    // BACKUP: Ensure window.currentModelID is always set
    console.log('🔧 BACKUP: Setting window.currentModelID directly to:', modelId);
    window.currentModelID = modelId;

    // Update token limits based on model
    this.updateTokenLimits(modelId);

    // Update context tracker if available
    this.updateContextTracker(modelId);

    // Update GPT-5 controls visibility
    this.updateGPT5Controls(modelId);

    console.log('Model selected successfully:', modelId);
  }

  /**
   * Update global model state for backward compatibility
   * @param {string} modelId - Selected model ID
   */
  updateGlobalModelState(modelId) {
    console.log('🔄 updateGlobalModelState called with:', modelId);
    console.log('   window.currentModelID before:', window.currentModelID);
    
    if (window.gptPortalApp && window.gptPortalApp.modelConfig) {
      console.log('   Using gptPortalApp.modelConfig.selectModel');
      window.gptPortalApp.modelConfig.selectModel(modelId);
    } else {
      console.log('   Using direct fallback update');
      // Direct update for legacy code
      window.currentModelID = modelId;
      if (window.updateCurrentModelID) {
        window.updateCurrentModelID(modelId);
      }
    }
    
    console.log('   window.currentModelID after:', window.currentModelID);
  }

  /**
   * Update token limits based on selected model
   * @param {string} modelId - Selected model ID
   */
  updateTokenLimits(modelId) {
    const tokensSlider = document.getElementById('tokens-slider');
    const modelTokenLimit = document.getElementById('model-token-limit');

    if (!tokensSlider || !modelTokenLimit) return;

    const maxTokens = this.getMaxTokensByModel(modelId);

    // Update the displayed limit
    modelTokenLimit.textContent = maxTokens.toLocaleString();

    // Update slider max attribute
    tokensSlider.max = maxTokens;

    // If current value exceeds new max, adjust it
    if (parseInt(tokensSlider.value) > maxTokens) {
      tokensSlider.value = maxTokens;
      const tokensValue = document.getElementById('tokens-value');
      if (tokensValue) {
        tokensValue.textContent = maxTokens.toLocaleString();
      }
      window.tokens = maxTokens;
    }
  }

  /**
   * Refresh models from API
   */
  async refreshModels() {
    console.log('Refreshing models...');

    try {
      await this.loadCompleteModelList();
      this.populateModelSelector();

      if (this.uiManager) {
        this.uiManager.showRefreshAnimation(document.getElementById('refresh-models'));
      }

    } catch (error) {
      console.error('Failed to refresh models:', error);
    }
  }

  /**
   * Show/hide loading state
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show) {
    const loadingDiv = document.getElementById('loading-models');
    if (loadingDiv) {
      loadingDiv.style.display = show ? 'block' : 'none';
    }

    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      if (show) {
        selectedModelDiv.textContent = 'Loading models...';
      } else {
        selectedModelDiv.textContent = 'Select a Model';
      }
    }
  }

  /**
   * Handle initialization error
   * @param {Error} error - Initialization error
   */
  handleInitializationError(error) {
    console.error('Initialization failed:', error);

    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = 'Error loading models';
    }

    const loadingDiv = document.getElementById('loading-models');
    if (loadingDiv) {
      loadingDiv.innerHTML = `
        <div style="color: #e66767; text-align: center; padding: 20px;">
          <strong>Error loading models</strong><br>
          <small>Using fallback functionality</small>
        </div>
      `;
    }

    // Load fallback models as last resort
    this.loadFallbackModels();
  }

  /**
   * Get model by ID
   * @param {string} modelId - Model ID
   * @returns {Object|null} Model object or null
   */
  getModel(modelId) {
    return this.models ? this.models[modelId] : null;
  }

  /**
   * Get all models
   * @returns {Object} All models
   */
  getAllModels() {
    return this.models || {};
  }

  /**
   * Get models by category
   * @param {string} category - Category name
   * @returns {Object} Models in category
   */
  getModelsByCategory(category) {
    if (!this.models) return {};

    const filtered = {};
    Object.entries(this.models).forEach(([id, model]) => {
      if (model.category === category) {
        filtered[id] = model;
      }
    });
    return filtered;
  }

  /**
   * Search models (delegates to search manager)
   * @param {string} query - Search query
   * @returns {Object} Search results
   */
  searchModels(query) {
    if (this.searchManager) {
      return this.searchManager.searchModels(this.models, query);
    }
    return this.models || {};
  }

  /**
   * Get max tokens by model (from original script.js)
   * @param {string} modelId - Model ID
   * @returns {number} Maximum tokens for model
   */
  getMaxTokensByModel(modelId) {
    // Check if model has explicit maxTokens
    const model = this.getModel(modelId);
    if (model && model.maxTokens) {
      return model.maxTokens;
    }

    // Fallback to hardcoded values from original script.js
    if (modelId === 'gpt-4') {
      return 6000;
    } else if (modelId === 'gpt-4o-mini') {
      return 16000;
    } else if (modelId === 'gpt-4o') {
      return 16000;
    } else if (modelId.startsWith('llama-3.1')) {
      return 8000;
    } else if (modelId === 'claude-3-7-sonnet-latest') {
      return 100000;
    } else if (modelId === 'claude-opus-4-20250514' || modelId === 'claude-sonnet-4-20250514') {
      return 100000;
    } else if (modelId.startsWith('claude')) {
      return 8000;
    } else {
      return 8000; // Default
    }
  }

  /**
   * Get display name for model
   * @param {string} modelId - Model ID
   * @returns {string} Display name
   */
  getDisplayName(modelId) {
    const customNames = {
      "gpt-5": "GPT-5: Most Intelligent",
      "gpt-5-mini": "GPT-5 Mini: Balanced",
      "gpt-5-nano": "GPT-5 Nano: Efficient",
      "gpt-5-chat-latest": "GPT-5 Chat: Latest",
      "gpt-4": "GPT-4: Original",
      "gpt-4o": "GPT-4o: Latest",
      "gpt-4o-mini": "GPT-4o Mini: Cheapest",
      "gpt-4-turbo": "GPT-4 Turbo: Standard",
      "gpt-3.5-turbo-0125": "GPT-3.5 Turbo: Legacy",
      "claude-opus-4-1-20250805": "Claude 4.1 Opus",
      "claude-opus-4-20250514": "Claude 4 Opus",
      "claude-sonnet-4-20250514": "Claude 4 Sonnet",
      "claude-3-7-sonnet-latest": "Claude 3.7 Sonnet",
      "claude-3-5-sonnet-latest": "Claude 3.5 Sonnet",
      "claude-3-5-haiku-latest": "Claude 3.5 Haiku",
      "claude-3-haiku-20240307": "Claude Haiku: Cheap",
      "o1-preview": "GPT-o1 Preview: Reasoning",
      "o1-mini": "GPT-o1 Mini: Cheap Reasoning",
      "o3-mini": "GPT-o3 Mini: Cheap Reasoning",
      "deepseek-reasoner": "DeepSeek-R1",
      "deepseek-chat": "DeepSeek-Chat",
      "kimi-k2-0711-preview": "Kimi K2: Advanced Reasoning",
      "gemini-pro": "Gemini Pro",
      "gemini-1.5-pro": "Gemini 1.5 Pro: Best",
      "gemini-1.5-flash": "Gemini 1.5 Flash",
      "gemini-2.0-flash-exp": "Gemini 2.0 Flash",
      "llama-3.1-405b-reasoning": "Llama 3.1 405B",
      "llama-3.1-70b-versatile": "Llama 3.1 70B",
      "llama-3.1-8b-instant": "Llama 3.1 8B",
      "mistral-large-latest": "Mistral Large",
      "codestral-latest": "Codestral"
    };

    return customNames[modelId] || modelId;
  }

  /**
   * Get category display name
   * @param {string} category - Category key
   * @returns {string} Display name
   */
  getCategoryDisplayName(category) {
    const displayNames = {
      gpt: 'GPT Models',
      claude: 'Claude Models',
      gemini: 'Gemini Models',
      reasoning: 'Reasoning Models',
      llama: 'LLaMA Models',
      mistral: 'Mistral Models',
      deepseek: 'Chinese AI Models',
      grok: 'Grok Models',
      voice: 'Voice Models',
      image: 'Image Models',
      search: 'Web Search Models',
      other: 'Other Models'
    };

    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1) + ' Models';
  }

  /**
   * Get model descriptions for enhanced display
   * @returns {Object} Map of model descriptions
   */
  getModelDescriptions() {
    return {
      "gpt-5": "GPT-5: Most intelligent GPT model with advanced reasoning, code generation, and long context capabilities",
      "gpt-5-mini": "GPT-5 Mini: Cost-optimized reasoning and chat model that balances speed, cost, and capability",
      "gpt-5-nano": "GPT-5 Nano: High-throughput model for simple instruction-following and classification tasks",
      "gpt-5-chat-latest": "GPT-5 Chat: Latest GPT-5 model optimized for conversational interactions",
      "gpt-4": "GPT-4: Oldest Intelligent Model",
      "gpt-4o": "GPT-4o: Latest OpenAI Intelligent Model",
      "gpt-4-32k": "GPT-4-32k: Longer Context Window — Higher Price",
      "gpt-4-turbo": "GPT-4-Turbo: ChatGPT-Plus Model — 128k Tokens",
      "gpt-3.5-turbo-0125": "GPT-3.5-Turbo: Older Cheap Option",
      "claude-opus-4-1-20250805": "Claude 4.1 Opus: Highest level of intelligence and capability with extended thinking",
      "claude-opus-4-20250514": "Claude 4 Opus: Previous flagship model with very high intelligence",
      "claude-sonnet-4-20250514": "Claude 4 Sonnet: High-performance model with balanced capabilities",
      "claude-3-7-sonnet-latest": "Most Advanced Anthropic Model",
      "claude-3-5-sonnet-latest": "Best Normal Claude Model",
      "claude-3-5-haiku-latest": "Fast & Cheap Anthropic Model",
      "gemini-pro": "Gemini-Pro: Google Bard Model — 3.5 Equivalent",
      "gemini-pro-vision": "Gemini-Vision: View Images — One-Time Use",
      "gemini-1.5-pro": "Gemini-Pro-1.5: Best Gemini Model — 2 Million Tokens",
      "gemini-1.5-flash": "Gemini-Flash-1.5: Fastest & Cheapest Google Model",
      "gemini-2.0-flash-exp": "Gemini-Flash-2.0: Newest & Best Google Model",
      "claude-3-opus-20240229": "Claude-Opus: Very Powerful — GPT-4 Level",
      "claude-3-sonnet-20240229": "Claude-Sonnet: Hard-Working — Turbo Level",
      "claude-3-haiku-20240307": "Claude-Haiku: Light, Cheap, & Fast — New",
      "o1-preview": "GPT-o1-Preview: Advanced reasoning model for complex problems",
      "o1-mini": "GPT-o1-Mini: Faster reasoning model for simpler tasks",
      "o3-mini": "GPT-o3-Mini: Next generation reasoning model",
      "deepseek-reasoner": "DeepSeek-R1: Advanced reasoning model with step-by-step thinking",
      "deepseek-chat": "DeepSeek-Chat: General purpose chat model",
      "kimi-k2-0711-preview": "Kimi K2: Moonshot AI's flagship model with 1T parameters, optimized for long context, reasoning, and agentic behavior",
      "llama-3.1-405b-reasoning": "Llama 3.1 405B: Largest open source model with strong reasoning",
      "llama-3.1-70b-versatile": "Llama 3.1 70B: Versatile model for various tasks",
      "llama-3.1-8b-instant": "Llama 3.1 8B: Fast and efficient model",
      "mistral-large-latest": "Mistral-Large: Most Expensive and Intelligent",
      "codestral-latest": "Codestral: Best Mistral Model for Coding",
      "gpt-4o-mini": "GPT-4o-Mini: Small, fast, and cheap model from OpenAI with relatively high intelligence."
    };
  }

  /**
   * Check if cache is valid
   * @returns {boolean} Whether cache is still valid
   */
  isCacheValid() {
    return this.lastFetch && (Date.now() - this.lastFetch) < this.cacheTTL;
  }

  /**
   * Get initialization status
   * @returns {boolean} Whether manager is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Cleanup dynamic model manager
   */
  cleanup() {
    console.log('Cleaning up dynamic model manager...');

    // Cleanup specialized managers
    if (this.searchManager && this.searchManager.cleanup) {
      this.searchManager.cleanup();
    }

    if (this.uiManager && this.uiManager.cleanup) {
      this.uiManager.cleanup();
    }

    // Clear data
    this.models = null;
    this.categories = null;
    this.loading = false;
    this.lastFetch = null;
    this.initialized = false;

    // Clear manager references
    this.searchManager = null;
    this.uiManager = null;

    console.log('Dynamic model manager cleanup completed');
  }

  /**
   * Update context tracker with new model
   * @param {string} modelId - Selected model ID
   */
  updateContextTracker(modelId) {
    // Update chat manager's context tracker
    if (window.gptPortalApp && window.gptPortalApp.chatManager) {
      window.gptPortalApp.chatManager.updateCurrentModel(modelId);
    }
    
    // Also update any global context tracker
    if (window.contextTracker) {
      window.contextTracker.setCurrentModel(modelId);
    }
  }

  /**
   * Update GPT-5 specific controls visibility
   * @param {string} modelId - Selected model ID
   */
  updateGPT5Controls(modelId) {
    console.log('updateGPT5Controls called with:', modelId);
    
    const gpt5Controls = document.getElementById('gpt5-controls');
    if (gpt5Controls) {
      const isGPT5 = modelId && modelId.startsWith('gpt-5');
      console.log('GPT-5 controls found, isGPT5:', isGPT5);
      
      if (isGPT5) {
        gpt5Controls.style.display = 'block';
        console.log('Showing GPT-5 controls');
      } else {
        gpt5Controls.style.display = 'none';
        console.log('Hiding GPT-5 controls');
      }
    } else {
      console.log('GPT-5 controls element not found in DOM');
    }
  }
}

// Export for use in main script
window.DynamicModelManager = DynamicModelManager;