// Unified Model Loader - Works in both Node.js and Browser
// Single source of truth for all model data with dynamic discovery

const fs = require('fs');
const path = require('path');

// Node.js compatibility for fetch
let fetch;
if (typeof global !== 'undefined' && !global.fetch) {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    // Fallback if node-fetch is not available
    const https = require('https');
    const http = require('http');
    
    fetch = (url, options = {}) => {
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        const req = protocol.request(url, {
          method: options.method || 'GET',
          headers: options.headers || {}
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              json: () => Promise.resolve(JSON.parse(data))
            });
          });
        });
        req.on('error', reject);
        req.end();
      });
    };
  }
} else {
  fetch = global.fetch || window.fetch;
}

class ModelLoader {
  constructor() {
    this.models = null;
    this.categories = null;
    this.lastLoad = null;
    this.lastSync = null;
    this.jsonPath = path.join(__dirname, '../../public/js/data/models.json');
    this.syncInterval = 24 * 60 * 60 * 1000; // 24 hours
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

  /**
   * Fetch models from OpenAI API
   * @param {string} apiKey - OpenAI API key
   * @returns {Promise<Array>} Array of OpenAI models
   */
  async fetchOpenAIModels(apiKey) {
    if (!apiKey) {
      console.log('No OpenAI API key provided, skipping dynamic discovery');
      return [];
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Discovered ${data.data.length} models from OpenAI API`);
      
      return data.data.map(model => ({
        id: model.id,
        name: this.formatModelName(model.id, 'openai'),
        provider: 'openai',
        category: this.inferCategory(model.id),
        source: 'api',
        description: `OpenAI model: ${model.id}`,
        pricing: this.inferPricing(model.id, 'openai'),
        contextWindow: this.inferContextWindow(model.id),
        maxTokens: this.inferMaxTokens(model.id),
        supportsVision: this.inferVisionSupport(model.id),
        supportsFunction: this.inferFunctionSupport(model.id),
        apiData: {
          created: model.created,
          owned_by: model.owned_by,
          object: model.object
        }
      }));

    } catch (error) {
      console.warn('Failed to fetch OpenAI models:', error.message);
      return [];
    }
  }

  /**
   * Fetch models from Anthropic API
   * @param {string} apiKey - Anthropic API key
   * @returns {Promise<Array>} Array of Anthropic models
   */
  async fetchAnthropicModels(apiKey) {
    if (!apiKey) {
      console.log('No Anthropic API key provided, skipping dynamic discovery');
      return [];
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Discovered ${data.data.length} models from Anthropic API`);
      
      return data.data.map(model => ({
        id: model.id,
        name: model.display_name || this.formatModelName(model.id, 'anthropic'),
        provider: 'anthropic',
        category: this.inferCategory(model.id),
        source: 'api',
        description: `Anthropic model: ${model.display_name || model.id}`,
        pricing: this.inferPricing(model.id, 'anthropic'),
        contextWindow: this.inferContextWindow(model.id),
        maxTokens: this.inferMaxTokens(model.id),
        supportsVision: this.inferVisionSupport(model.id),
        supportsFunction: this.inferFunctionSupport(model.id),
        apiData: {
          created_at: model.created_at,
          type: model.type
        }
      }));

    } catch (error) {
      console.warn('Failed to fetch Anthropic models:', error.message);
      return [];
    }
  }

  /**
   * Sync models with provider APIs and update JSON
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync results
   */
  async syncWithAPIs(options = {}) {
    const {
      openaiKey = process.env.OPENAI_API_KEY,
      anthropicKey = process.env.ANTHROPIC_API_KEY,
      forceSync = false
    } = options;

    // Check if sync is needed
    if (!forceSync && this.lastSync && (Date.now() - this.lastSync) < this.syncInterval) {
      console.log('Model sync not needed, last sync was recent');
      return { synced: false, reason: 'Recent sync' };
    }

    console.log('Starting model sync with provider APIs...');
    
    try {
      // Load current models
      await this.loadModels();
      const currentModels = { ...this.models };

      // Fetch from APIs
      const [openaiModels, anthropicModels] = await Promise.all([
        this.fetchOpenAIModels(openaiKey),
        this.fetchAnthropicModels(anthropicKey)
      ]);

      const discoveredModels = [...openaiModels, ...anthropicModels];
      let addedCount = 0;
      let updatedCount = 0;

      // Preserve order: keep existing core models first, add new API models
      const updatedModels = { ...currentModels };

      for (const apiModel of discoveredModels) {
        if (currentModels[apiModel.id]) {
          // Update existing model but preserve core metadata if it exists
          if (currentModels[apiModel.id].source === 'core') {
            // Keep core model data, just update API metadata
            updatedModels[apiModel.id] = {
              ...currentModels[apiModel.id],
              apiData: apiModel.apiData
            };
          } else {
            // Update API-sourced model
            updatedModels[apiModel.id] = apiModel;
            updatedCount++;
          }
        } else {
          // Add new model
          updatedModels[apiModel.id] = apiModel;
          addedCount++;
        }
      }

      // Update the JSON file
      const updatedData = {
        models: updatedModels,
        categories: this.categories,
        lastSync: new Date().toISOString(),
        syncStats: {
          discovered: discoveredModels.length,
          added: addedCount,
          updated: updatedCount
        }
      };

      await fs.promises.writeFile(this.jsonPath, JSON.stringify(updatedData, null, 2));
      
      // Update in-memory cache
      this.models = updatedModels;
      this.lastSync = Date.now();

      console.log(`Model sync complete: ${addedCount} added, ${updatedCount} updated`);
      
      return {
        synced: true,
        discovered: discoveredModels.length,
        added: addedCount,
        updated: updatedCount,
        total: Object.keys(updatedModels).length
      };

    } catch (error) {
      console.error('Model sync failed:', error);
      return { synced: false, error: error.message };
    }
  }

  /**
   * Helper methods for inferring model metadata
   */
  formatModelName(modelId, provider) {
    if (provider === 'openai') {
      if (modelId.includes('gpt-4o')) return `GPT-4o: ${modelId}`;
      if (modelId.includes('gpt-4')) return `GPT-4: ${modelId}`;
      if (modelId.includes('gpt-3.5')) return `GPT-3.5: ${modelId}`;
      if (modelId.includes('o1')) return `GPT-o1: ${modelId}`;
    }
    if (provider === 'anthropic') {
      if (modelId.includes('claude')) return `Claude: ${modelId}`;
    }
    return modelId;
  }

  inferCategory(modelId) {
    if (modelId.includes('gpt')) return 'gpt';
    if (modelId.includes('claude')) return 'claude';
    if (modelId.includes('o1') || modelId.includes('o3')) return 'reasoning';
    if (modelId.includes('gemini')) return 'gemini';
    if (modelId.includes('llama')) return 'llama';
    return 'other';
  }

  inferPricing(modelId, provider) {
    // Updated pricing based on latest OpenAI/Anthropic data (Jan 2025)
    if (provider === 'openai') {
      // Latest GPT-4 models
      if (modelId.includes('gpt-4.1-nano')) return { input: 0.10, output: 0.40, cached: 0.025 };
      if (modelId.includes('gpt-4.1-mini')) return { input: 0.40, output: 1.60, cached: 0.10 };
      if (modelId.includes('gpt-4.1')) return { input: 2.00, output: 8.00, cached: 0.50 };
      if (modelId.includes('gpt-4.5-preview')) return { input: 75.00, output: 150.00, cached: 37.50 };
      
      // Current GPT-4o models (updated pricing)
      if (modelId.includes('gpt-4o-mini')) return { input: 0.15, output: 0.60, cached: 0.075 };
      if (modelId.includes('gpt-4o')) return { input: 2.50, output: 10.00, cached: 1.25 };
      
      // Reasoning models
      if (modelId.includes('o4-mini')) return { input: 1.10, output: 4.40, cached: 0.275 };
      if (modelId.includes('o3-mini')) return { input: 1.10, output: 4.40, cached: 0.55 };
      if (modelId.includes('o3')) return { input: 10.00, output: 40.00, cached: 2.50 };
      if (modelId.includes('o1-pro')) return { input: 150.00, output: 600.00 };
      if (modelId.includes('o1-mini')) return { input: 1.10, output: 4.40, cached: 0.55 };
      if (modelId.includes('o1')) return { input: 15.00, output: 60.00, cached: 7.50 };
      
      // Legacy models
      if (modelId.includes('gpt-4-turbo')) return { input: 10.00, output: 30.00 };
      if (modelId.includes('gpt-4-32k')) return { input: 60.00, output: 120.00 };
      if (modelId.includes('gpt-4')) return { input: 30.00, output: 60.00 };
      if (modelId.includes('gpt-3.5-turbo')) return { input: 0.50, output: 1.50 };
    }
    
    if (provider === 'anthropic') {
      // Anthropic pricing (no major changes reported)
      if (modelId.includes('haiku')) return { input: 0.25, output: 1.25 };
      if (modelId.includes('sonnet')) return { input: 3.00, output: 15.00 };
      if (modelId.includes('opus')) return { input: 15.00, output: 75.00 };
    }
    
    return { input: 1.00, output: 2.00 }; // Conservative default
  }

  inferContextWindow(modelId) {
    if (modelId.includes('gpt-4o') || modelId.includes('gpt-4-turbo')) return 128000;
    if (modelId.includes('gpt-4')) return 8192;
    if (modelId.includes('claude')) return 200000;
    if (modelId.includes('o1') || modelId.includes('o3')) return 128000;
    return 8192; // Default
  }

  inferMaxTokens(modelId) {
    if (modelId.includes('gpt-4o')) return 16000;
    if (modelId.includes('claude') && modelId.includes('sonnet')) return 8000;
    if (modelId.includes('claude')) return 100000;
    if (modelId.includes('o1') || modelId.includes('o3')) return 8000;
    return 8000; // Default
  }

  inferVisionSupport(modelId) {
    if (modelId.includes('gpt-4o')) return true;
    if (modelId.includes('gpt-4-turbo')) return true;
    if (modelId.includes('claude-3')) return true;
    if (modelId.includes('vision')) return true;
    return false;
  }

  inferFunctionSupport(modelId) {
    if (modelId.includes('gpt')) return true;
    if (modelId.includes('claude')) return true;
    if (modelId.includes('o1') || modelId.includes('o3')) return false;
    return true; // Most models support functions
  }
}

// Create singleton instance
const modelLoader = new ModelLoader();

module.exports = modelLoader;