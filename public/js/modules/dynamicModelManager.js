// Dynamic Model Manager - Replaces hardcoded model buttons with API-driven model loading
class DynamicModelManager {
  constructor() {
    this.models = null;
    this.categories = null;
    this.loading = false;
    this.lastFetch = null;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.showOpenRouter = false;
    this.searchQuery = '';
    
    this.init();
  }

  /**
   * Initialize the dynamic model manager
   */
  async init() {
    try {
      console.log('Initializing Dynamic Model Manager...');
      await this.loadModels();
      this.bindEvents();
      this.populateModelSelector();
      console.log('Dynamic Model Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Dynamic Model Manager:', error);
      this.showError('Failed to load models. Using fallback.');
    }
  }

  /**
   * Load models from API
   */
  async loadModels(force = false) {
    // Check cache first
    if (!force && this.models && this.isCacheValid()) {
      console.log('Using cached model data');
      return this.models;
    }

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

      this.models = data.data.models;
      this.categories = data.data.categories;
      this.lastFetch = Date.now();
      
      console.log(`Loaded ${Object.keys(this.models).length} models`);
      return this.models;

    } catch (error) {
      console.error('Failed to load models from API:', error);
      
      // Try to use fallback models
      this.loadFallbackModels();
      throw error;

    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  /**
   * Load fallback models (core models only)
   */
  loadFallbackModels() {
    console.log('Loading fallback models...');
    
    // Basic fallback models
    this.models = {
      'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o: Latest',
        provider: 'openai',
        category: 'gpt',
        source: 'core'
      },
      'gpt-4o-mini': {
        id: 'gpt-4o-mini', 
        name: 'GPT-4o Mini: Cheapest',
        provider: 'openai',
        category: 'gpt',
        source: 'core'
      },
      'claude-3-5-sonnet-latest': {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        category: 'claude',
        source: 'core'
      },
      'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro: Best',
        provider: 'google',
        category: 'gemini',
        source: 'core'
      }
    };

    this.categories = {
      gpt: { name: 'GPT Models', models: ['gpt-4o', 'gpt-4o-mini'] },
      claude: { name: 'Claude Models', models: ['claude-3-5-sonnet-latest'] },
      gemini: { name: 'Gemini Models', models: ['gemini-1.5-pro'] }
    };
  }

  /**
   * Check if cache is valid
   */
  isCacheValid() {
    return this.lastFetch && (Date.now() - this.lastFetch) < this.cacheTTL;
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    // Model search
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterModels();
      });
    }

    // OpenRouter toggle
    const openRouterToggle = document.getElementById('show-open-router');
    if (openRouterToggle) {
      openRouterToggle.addEventListener('change', (e) => {
        this.showOpenRouter = e.target.checked;
        this.filterModels();
      });
    }

    // Refresh button (if exists)
    const refreshButton = document.getElementById('refresh-models');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.refreshModels();
      });
    }
  }

  /**
   * Populate model selector with dynamic content
   */
  populateModelSelector() {
    const modelOptions = document.getElementById('model-options');
    if (!modelOptions || !this.models) return;

    // Clear existing content
    modelOptions.innerHTML = '';

    // Group models by category
    const groupedModels = this.groupModelsByCategory();

    // Create category sections
    Object.entries(groupedModels).forEach(([categoryKey, category]) => {
      if (category.models.length === 0) return;

      // Create category header
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'model-category';
      
      const categoryHeader = document.createElement('h4');
      categoryHeader.textContent = category.name;
      categoryDiv.appendChild(categoryHeader);

      // Add models to category
      category.models.forEach(model => {
        const button = this.createModelButton(model);
        categoryDiv.appendChild(button);
      });

      // Hide OpenRouter categories if toggle is off
      if (this.isOpenRouterCategory(categoryKey) && !this.showOpenRouter) {
        categoryDiv.style.display = 'none';
      }

      modelOptions.appendChild(categoryDiv);
    });

    // If no models visible, show message
    if (modelOptions.children.length === 0) {
      const noModelsDiv = document.createElement('div');
      noModelsDiv.className = 'no-models-message';
      noModelsDiv.textContent = 'No models found. Try adjusting your filters.';
      modelOptions.appendChild(noModelsDiv);
    }
  }

  /**
   * Group models by category
   */
  groupModelsByCategory() {
    const grouped = {};

    Object.values(this.models).forEach(model => {
      const category = model.category;
      
      if (!grouped[category]) {
        grouped[category] = {
          name: this.getCategoryDisplayName(category),
          models: []
        };
      }

      // Apply filters
      if (this.shouldShowModel(model)) {
        grouped[category].models.push(model);
      }
    });

    return grouped;
  }

  /**
   * Check if model should be shown based on filters
   */
  shouldShowModel(model) {
    // Search filter
    if (this.searchQuery) {
      const searchableText = (
        model.name + ' ' + 
        model.description + ' ' + 
        model.id + ' ' + 
        model.provider
      ).toLowerCase();
      
      if (!searchableText.includes(this.searchQuery)) {
        return false;
      }
    }

    // OpenRouter filter
    if (!this.showOpenRouter && model.source === 'openrouter') {
      return false;
    }

    return true;
  }

  /**
   * Check if category is OpenRouter-only
   */
  isOpenRouterCategory(category) {
    if (!this.models) return false;
    
    const categoryModels = Object.values(this.models).filter(m => m.category === category);
    return categoryModels.every(m => m.source === 'openrouter');
  }

  /**
   * Create model button element
   */
  createModelButton(model) {
    const button = document.createElement('button');
    button.id = this.generateButtonId(model.id);
    button.className = model.source === 'core' ? 'standard-model' : 'openrouter-model';
    button.setAttribute('data-value', model.id);
    button.textContent = model.name;
    
    // Add tooltip with description
    if (model.description) {
      button.title = model.description;
    }

    // Add click handler
    button.addEventListener('click', () => {
      this.selectModel(model.id);
    });

    // Add provider badge
    const badge = document.createElement('span');
    badge.className = 'provider-badge';
    badge.textContent = model.provider;
    button.appendChild(badge);

    return button;
  }

  /**
   * Generate consistent button ID
   */
  generateButtonId(modelId) {
    return 'model-' + modelId.replace(/[^a-zA-Z0-9]/g, '-');
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category) {
    const displayNames = {
      gpt: 'GPT Models',
      claude: 'Claude Models',
      gemini: 'Gemini Models', 
      reasoning: 'Reasoning Models',
      llama: 'LLaMA Models',
      mistral: 'Mistral Models',
      deepseek: 'DeepSeek Models',
      qwen: 'Qwen Models',
      cohere: 'Cohere Models',
      perplexity: 'Perplexity Models',
      other: 'Other Models'
    };
    
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1) + ' Models';
  }

  /**
   * Select a model
   */
  selectModel(modelId) {
    const model = this.models[modelId];
    if (!model) {
      console.error('Model not found:', modelId);
      return;
    }

    // Update selected model display
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = model.name;
    }

    // Update global model state (for backward compatibility)
    if (window.modelConfig) {
      window.modelConfig.selectModel(modelId);
    } else {
      // Direct update for legacy code
      window.currentModelID = modelId;
      if (window.updateCurrentModelID) {
        window.updateCurrentModelID(modelId);
      }
    }

    // Close dropdown
    const modelOptions = document.getElementById('model-options');
    if (modelOptions) {
      modelOptions.style.display = 'none';
    }

    console.log('Selected model:', modelId, model.name);
  }

  /**
   * Filter models based on current search and toggle state
   */
  filterModels() {
    this.populateModelSelector();
  }

  /**
   * Refresh models from API
   */
  async refreshModels() {
    try {
      console.log('Refreshing models...');
      await this.loadModels(true);
      this.populateModelSelector();
      this.showSuccess('Models refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh models:', error);
      this.showError('Failed to refresh models');
    }
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv && show) {
      selectedModelDiv.textContent = 'Loading models...';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error(message);
    // Could show a toast notification here
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log(message);
    // Could show a toast notification here
  }

  /**
   * Get model by ID
   */
  getModel(modelId) {
    return this.models ? this.models[modelId] : null;
  }

  /**
   * Get all models
   */
  getAllModels() {
    return this.models || {};
  }

  /**
   * Get models by category
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
   * Search models
   */
  searchModels(query) {
    if (!this.models) return {};
    
    const results = {};
    const lowercaseQuery = query.toLowerCase();
    
    Object.entries(this.models).forEach(([id, model]) => {
      const searchableText = (
        model.name + ' ' + 
        model.description + ' ' + 
        model.id + ' ' + 
        model.provider
      ).toLowerCase();
      
      if (searchableText.includes(lowercaseQuery)) {
        results[id] = model;
      }
    });
    
    return results;
  }
}

// Export for use in main script
window.DynamicModelManager = DynamicModelManager;