// Unified Model Loader - Works in both Node.js and Browser
// Single source of truth for all model data

const fs = require('fs');
const path = require('path');

class ModelLoader {
  constructor() {
    this.models = null;
    this.categories = null;
    this.lastLoad = null;
    this.jsonPath = path.join(__dirname, '../../public/js/data/models.json');
  }

  /**
   * Load models from unified JSON file
   * @returns {Promise<Object>} Models and categories
   */
  async loadModels() {
    try {
      // Check if we have cached data
      if (this.models && this.categories) {
        return { models: this.models, categories: this.categories };
      }

      console.log('Loading unified model data from:', this.jsonPath);
      
      // Read the unified JSON file
      const jsonData = await fs.promises.readFile(this.jsonPath, 'utf8');
      const data = JSON.parse(jsonData);
      
      this.models = data.models;
      this.categories = data.categories;
      this.lastLoad = new Date();
      
      console.log(`Loaded ${Object.keys(this.models).length} models from unified JSON`);
      
      return { models: this.models, categories: this.categories };
      
    } catch (error) {
      console.error('Failed to load unified model data:', error);
      throw new Error(`Model loading failed: ${error.message}`);
    }
  }

  /**
   * Get specific model by ID
   * @param {string} modelId - Model identifier
   * @returns {Object|null} Model object or null
   */
  async getModel(modelId) {
    if (!this.models) {
      await this.loadModels();
    }
    return this.models[modelId] || null;
  }

  /**
   * Get all models
   * @returns {Object} All models
   */
  async getAllModels() {
    if (!this.models) {
      await this.loadModels();
    }
    return this.models;
  }

  /**
   * Get models by category
   * @param {string} category - Category name
   * @returns {Object} Filtered models
   */
  async getModelsByCategory(category) {
    if (!this.models) {
      await this.loadModels();
    }
    
    const filtered = {};
    Object.entries(this.models).forEach(([id, model]) => {
      if (model.category === category) {
        filtered[id] = model;
      }
    });
    return filtered;
  }

  /**
   * Get model pricing information
   * @param {string} modelId - Model identifier
   * @returns {Object} Pricing object {input, output}
   */
  async getModelPricing(modelId) {
    const model = await this.getModel(modelId);
    return model?.pricing || { input: 0, output: 0 };
  }

  /**
   * Get model context window
   * @param {string} modelId - Model identifier
   * @returns {number} Context window size
   */
  async getContextWindow(modelId) {
    const model = await this.getModel(modelId);
    return model?.contextWindow || 4096;
  }

  /**
   * Get max tokens for model
   * @param {string} modelId - Model identifier
   * @returns {number} Max tokens
   */
  async getMaxTokens(modelId) {
    const model = await this.getModel(modelId);
    return model?.maxTokens || 8000;
  }

  /**
   * Check if model supports vision
   * @param {string} modelId - Model identifier
   * @returns {boolean} Vision support
   */
  async supportsVision(modelId) {
    const model = await this.getModel(modelId);
    return model?.supportsVision || false;
  }

  /**
   * Check if model supports function calling
   * @param {string} modelId - Model identifier
   * @returns {boolean} Function support
   */
  async supportsFunction(modelId) {
    const model = await this.getModel(modelId);
    return model?.supportsFunction || false;
  }

  /**
   * Check if model is free
   * @param {string} modelId - Model identifier
   * @returns {boolean} True if free
   */
  async isFree(modelId) {
    const pricing = await this.getModelPricing(modelId);
    return pricing.input === 0 && pricing.output === 0;
  }

  /**
   * Get provider for model
   * @param {string} modelId - Model identifier
   * @returns {string} Provider name
   */
  async getProvider(modelId) {
    const model = await this.getModel(modelId);
    return model?.provider || 'unknown';
  }

  /**
   * Search models by query
   * @param {string} query - Search query
   * @returns {Object} Matching models
   */
  async searchModels(query) {
    if (!this.models) {
      await this.loadModels();
    }
    
    const results = {};
    const lowercaseQuery = query.toLowerCase();
    
    Object.entries(this.models).forEach(([id, model]) => {
      if (
        model.name.toLowerCase().includes(lowercaseQuery) ||
        model.description.toLowerCase().includes(lowercaseQuery) ||
        id.toLowerCase().includes(lowercaseQuery) ||
        model.provider.toLowerCase().includes(lowercaseQuery)
      ) {
        results[id] = model;
      }
    });
    
    return results;
  }

  /**
   * Get models organized by categories (for frontend)
   * @returns {Object} Categorized models
   */
  async getModelsByCategories() {
    if (!this.models || !this.categories) {
      await this.loadModels();
    }
    
    const organized = {};
    Object.entries(this.categories).forEach(([categoryKey, categoryData]) => {
      organized[categoryKey] = {
        name: categoryData.name,
        models: {}
      };
      
      categoryData.models.forEach(modelId => {
        if (this.models[modelId]) {
          organized[categoryKey].models[modelId] = this.models[modelId];
        }
      });
    });
    
    return organized;
  }

  /**
   * Get statistics about models
   * @returns {Object} Model statistics
   */
  async getStatistics() {
    if (!this.models) {
      await this.loadModels();
    }
    
    const stats = {
      total: Object.keys(this.models).length,
      byProvider: {},
      byCategory: {},
      withVision: 0,
      withFunction: 0,
      free: 0
    };
    
    Object.values(this.models).forEach(model => {
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
   * Check if model exists
   * @param {string} modelId - Model identifier
   * @returns {boolean} True if exists
   */
  async hasModel(modelId) {
    const model = await this.getModel(modelId);
    return model !== null;
  }

  /**
   * Get load status
   * @returns {Object} Load status
   */
  getStatus() {
    return {
      loaded: this.models !== null,
      lastLoad: this.lastLoad,
      modelCount: this.models ? Object.keys(this.models).length : 0,
      categoryCount: this.categories ? Object.keys(this.categories).length : 0
    };
  }

  /**
   * Force reload from JSON
   */
  async reload() {
    this.models = null;
    this.categories = null;
    this.lastLoad = null;
    return await this.loadModels();
  }
}

// Create singleton instance
const modelLoader = new ModelLoader();

module.exports = modelLoader;