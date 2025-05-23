// Unified model registry that combines core models and OpenRouter models
const { getCoreModels, getCoreModelsByCategory, getCoreModel, isCoreModel } = require('./coreModels');
const OpenRouterProvider = require('./openRouterProvider');

class ModelRegistry {
  constructor() {
    this.openRouterProvider = new OpenRouterProvider();
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize the model registry
   */
  async init() {
    try {
      console.log('Initializing Model Registry...');
      this.initialized = true;
      console.log('Model Registry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Model Registry:', error);
      this.initialized = false;
    }
  }

  /**
   * Get all available models (core + OpenRouter)
   */
  getAllModels() {
    const coreModels = getCoreModels();
    const openRouterModels = this.openRouterProvider.getModels();
    
    return {
      core: coreModels,
      openrouter: openRouterModels,
      combined: { ...coreModels, ...openRouterModels }
    };
  }

  /**
   * Get only core models
   */
  getCoreModels() {
    return getCoreModels();
  }

  /**
   * Get only OpenRouter models
   */
  getOpenRouterModels() {
    return this.openRouterProvider.getModels();
  }

  /**
   * Get models by category across all providers
   */
  getModelsByCategory(category) {
    const coreModels = getCoreModelsByCategory(category);
    const openRouterModels = this.openRouterProvider.getModelsByCategory(category);
    
    return {
      core: coreModels,
      openrouter: openRouterModels,
      combined: { ...coreModels, ...openRouterModels }
    };
  }

  /**
   * Get models organized by categories for frontend
   */
  getModelsByCategories() {
    const allModels = this.getAllModels().combined;
    const categories = {};
    
    Object.entries(allModels).forEach(([id, model]) => {
      const category = model.category;
      if (!categories[category]) {
        categories[category] = {};
      }
      categories[category][id] = model;
    });
    
    return categories;
  }

  /**
   * Get specific model by ID (searches both core and OpenRouter)
   */
  getModel(modelId) {
    // Try core models first
    const coreModel = getCoreModel(modelId);
    if (coreModel) {
      return { ...coreModel, source: 'core' };
    }
    
    // Try OpenRouter models
    const openRouterModel = this.openRouterProvider.getModel(modelId);
    if (openRouterModel) {
      return { ...openRouterModel, source: 'openrouter' };
    }
    
    return null;
  }

  /**
   * Search models across all providers
   */
  searchModels(query) {
    const coreModels = getCoreModels();
    const openRouterModels = this.openRouterProvider.searchModels(query);
    
    // Search core models
    const coreResults = {};
    const lowercaseQuery = query.toLowerCase();
    Object.entries(coreModels).forEach(([id, model]) => {
      if (
        model.name.toLowerCase().includes(lowercaseQuery) ||
        model.description.toLowerCase().includes(lowercaseQuery) ||
        id.toLowerCase().includes(lowercaseQuery)
      ) {
        coreResults[id] = { ...model, source: 'core' };
      }
    });

    // Add source information to OpenRouter results
    const openRouterResults = {};
    Object.entries(openRouterModels).forEach(([id, model]) => {
      openRouterResults[id] = { ...model, source: 'openrouter' };
    });
    
    return {
      core: coreResults,
      openrouter: openRouterResults,
      combined: { ...coreResults, ...openRouterResults }
    };
  }

  /**
   * Get models formatted for frontend dropdown
   */
  getModelsForFrontend() {
    const categories = this.getModelsByCategories();
    const formatted = {
      categories: {},
      models: {}
    };
    
    // Organize by categories for UI
    Object.entries(categories).forEach(([categoryName, models]) => {
      formatted.categories[categoryName] = {
        name: this.getCategoryDisplayName(categoryName),
        models: Object.keys(models)
      };
      
      // Add models to flat structure
      Object.entries(models).forEach(([id, model]) => {
        formatted.models[id] = {
          id,
          name: model.name,
          provider: model.provider,
          category: model.category,
          description: model.description,
          pricing: model.pricing,
          contextWindow: model.contextWindow,
          supportsVision: model.supportsVision,
          supportsFunction: model.supportsFunction,
          source: isCoreModel(id) ? 'core' : 'openrouter'
        };
      });
    });
    
    return formatted;
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
   * Check if model exists
   */
  hasModel(modelId) {
    return this.getModel(modelId) !== null;
  }

  /**
   * Get model provider for routing purposes
   */
  getModelProvider(modelId) {
    const model = this.getModel(modelId);
    if (!model) return null;
    
    // Map providers to endpoints
    const providerMap = {
      openai: 'openai',
      anthropic: 'claude',
      google: 'gemini',
      groq: 'groq',
      mistral: 'mistral',
      deepseek: 'deepseek',
      openrouter: 'openrouter'
    };
    
    return providerMap[model.provider] || 'openrouter';
  }

  /**
   * Refresh OpenRouter models manually
   */
  async refreshOpenRouterModels() {
    return await this.openRouterProvider.forceRefresh();
  }

  /**
   * Get system status
   */
  getStatus() {
    const coreModels = getCoreModels();
    const openRouterStatus = this.openRouterProvider.getCacheStatus();
    
    return {
      initialized: this.initialized,
      core: {
        modelCount: Object.keys(coreModels).length,
        categories: [...new Set(Object.values(coreModels).map(m => m.category))]
      },
      openrouter: openRouterStatus,
      total: {
        modelCount: Object.keys(coreModels).length + openRouterStatus.modelCount
      }
    };
  }

  /**
   * Get statistics for admin dashboard
   */
  getStatistics() {
    const allModels = this.getAllModels().combined;
    const stats = {
      total: Object.keys(allModels).length,
      byProvider: {},
      byCategory: {},
      withVision: 0,
      withFunction: 0,
      free: 0
    };
    
    Object.values(allModels).forEach(model => {
      // Count by provider
      stats.byProvider[model.provider] = (stats.byProvider[model.provider] || 0) + 1;
      
      // Count by category
      stats.byCategory[model.category] = (stats.byCategory[model.category] || 0) + 1;
      
      // Count capabilities
      if (model.supportsVision) stats.withVision++;
      if (model.supportsFunction) stats.withFunction++;
      if (model.pricing.input === 0 && model.pricing.output === 0) stats.free++;
    });
    
    return stats;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down Model Registry...');
    await this.openRouterProvider.shutdown();
    console.log('Model Registry shut down cleanly');
  }
}

// Create singleton instance
const modelRegistry = new ModelRegistry();

module.exports = modelRegistry;