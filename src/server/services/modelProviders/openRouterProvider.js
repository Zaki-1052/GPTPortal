// OpenRouter model provider with automatic API integration and caching
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class OpenRouterProvider {
  constructor() {
    this.apiUrl = 'https://openrouter.ai/api/v1/models';
    this.cacheFile = path.join(__dirname, '../../../cache/openrouter_models.json');
    this.metaCacheFile = path.join(__dirname, '../../../cache/openrouter_meta.json');
    this.models = new Map();
    this.lastFetch = null;
    this.cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.lastSuccessfulFetch = null;
    
    // Ensure cache directory exists
    this.ensureCacheDir();
    
    // Load cached models on startup
    this.loadFromCache();
    
    // Start automatic refresh
    this.startAutoRefresh();
  }

  /**
   * Ensure cache directory exists
   */
  async ensureCacheDir() {
    try {
      const cacheDir = path.dirname(this.cacheFile);
      await fs.mkdir(cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  /**
   * Load models from cache file
   */
  async loadFromCache() {
    try {
      // Load models
      const modelsData = await fs.readFile(this.cacheFile, 'utf8');
      const cachedModels = JSON.parse(modelsData);
      
      // Load metadata
      let meta = { lastFetch: null, lastSuccessfulFetch: null };
      try {
        const metaData = await fs.readFile(this.metaCacheFile, 'utf8');
        meta = JSON.parse(metaData);
      } catch (metaError) {
        // Meta file doesn't exist, use defaults
      }
      
      // Restore models to Map
      this.models.clear();
      Object.entries(cachedModels).forEach(([id, model]) => {
        this.models.set(id, model);
      });
      
      this.lastFetch = meta.lastFetch ? new Date(meta.lastFetch) : null;
      this.lastSuccessfulFetch = meta.lastSuccessfulFetch ? new Date(meta.lastSuccessfulFetch) : null;
      
      console.log(`Loaded ${this.models.size} OpenRouter models from cache`);
      
      // If cache is stale, refresh immediately
      if (this.isCacheStale()) {
        console.log('Cache is stale, refreshing models...');
        this.refreshModels();
      }
    } catch (error) {
      console.log('No valid cache found, will fetch models from API');
      this.refreshModels();
    }
  }

  /**
   * Save models to cache file
   */
  async saveToCache() {
    try {
      // Save models
      const modelsObj = Object.fromEntries(this.models);
      await fs.writeFile(this.cacheFile, JSON.stringify(modelsObj, null, 2));
      
      // Save metadata
      const meta = {
        lastFetch: this.lastFetch?.toISOString(),
        lastSuccessfulFetch: this.lastSuccessfulFetch?.toISOString(),
        modelCount: this.models.size
      };
      await fs.writeFile(this.metaCacheFile, JSON.stringify(meta, null, 2));
      
      console.log(`Cached ${this.models.size} OpenRouter models`);
    } catch (error) {
      console.error('Failed to save models to cache:', error);
    }
  }

  /**
   * Check if cache is stale
   */
  isCacheStale() {
    if (!this.lastFetch) return true;
    return Date.now() - this.lastFetch.getTime() > this.cacheTTL;
  }

  /**
   * Transform OpenRouter API model to our internal format
   */
  transformModel(apiModel) {
    return {
      name: apiModel.name,
      provider: 'openrouter',
      category: this.inferCategory(apiModel.id),
      description: apiModel.description || '',
      pricing: {
        input: parseFloat(apiModel.pricing?.prompt || 0) * 1000000, // Convert to per million tokens
        output: parseFloat(apiModel.pricing?.completion || 0) * 1000000
      },
      contextWindow: apiModel.context_length || 4096,
      supportsVision: apiModel.architecture?.modality?.includes('image') || false,
      supportsFunction: apiModel.architecture?.modality?.includes('function') || false,
      topProvider: apiModel.top_provider || null,
      architecture: apiModel.architecture || {},
      // OpenRouter specific fields
      openRouterData: {
        id: apiModel.id,
        created: apiModel.created,
        per_request_limits: apiModel.per_request_limits
      }
    };
  }

  /**
   * Infer model category from ID
   */
  inferCategory(modelId) {
    const id = modelId.toLowerCase();
    
    if (id.includes('gpt') || id.includes('openai')) return 'gpt';
    if (id.includes('claude') || id.includes('anthropic')) return 'claude';
    if (id.includes('gemini') || id.includes('google')) return 'gemini';
    if (id.includes('llama') || id.includes('meta')) return 'llama';
    if (id.includes('mistral')) return 'mistral';
    if (id.includes('deepseek')) return 'deepseek';
    if (id.includes('qwen')) return 'qwen';
    if (id.includes('cohere')) return 'cohere';
    if (id.includes('perplexity')) return 'perplexity';
    
    return 'other';
  }

  /**
   * Fetch models from OpenRouter API
   */
  async fetchModelsFromAPI() {
    try {
      console.log('Fetching models from OpenRouter API...');
      
      const response = await axios.get(this.apiUrl, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'GPTPortal/1.0'
        }
      });
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid API response format');
      }
      
      const apiModels = response.data.data;
      console.log(`Fetched ${apiModels.length} models from OpenRouter API`);
      
      // Transform and store models
      const newModels = new Map();
      apiModels.forEach(apiModel => {
        try {
          const transformedModel = this.transformModel(apiModel);
          newModels.set(apiModel.id, transformedModel);
        } catch (error) {
          console.warn(`Failed to transform model ${apiModel.id}:`, error.message);
        }
      });
      
      // Update models and timestamps
      this.models = newModels;
      this.lastFetch = new Date();
      this.lastSuccessfulFetch = new Date();
      
      // Save to cache
      await this.saveToCache();
      
      console.log(`Successfully processed ${this.models.size} OpenRouter models`);
      return true;
      
    } catch (error) {
      console.error('Failed to fetch models from OpenRouter API:', error.message);
      this.lastFetch = new Date(); // Update lastFetch even on failure
      return false;
    }
  }

  /**
   * Refresh models (with retry logic)
   */
  async refreshModels(retries = 3) {
    if (this.isRefreshing) {
      console.log('Model refresh already in progress');
      return false;
    }
    
    this.isRefreshing = true;
    
    try {
      for (let attempt = 1; attempt <= retries; attempt++) {
        const success = await this.fetchModelsFromAPI();
        if (success) {
          this.isRefreshing = false;
          return true;
        }
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.error(`Failed to refresh models after ${retries} attempts`);
      this.isRefreshing = false;
      return false;
      
    } catch (error) {
      console.error('Unexpected error during model refresh:', error);
      this.isRefreshing = false;
      return false;
    }
  }

  /**
   * Start automatic refresh interval
   */
  startAutoRefresh() {
    // Refresh every hour
    this.refreshInterval = setInterval(() => {
      console.log('Scheduled OpenRouter model refresh...');
      this.refreshModels();
    }, this.cacheTTL);
    
    console.log('Started automatic OpenRouter model refresh (every hour)');
  }

  /**
   * Stop automatic refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Stopped automatic OpenRouter model refresh');
    }
  }

  /**
   * Get all OpenRouter models
   */
  getModels() {
    return Object.fromEntries(this.models);
  }

  /**
   * Get models by category
   */
  getModelsByCategory(category) {
    const filtered = {};
    this.models.forEach((model, id) => {
      if (model.category === category) {
        filtered[id] = model;
      }
    });
    return filtered;
  }

  /**
   * Get specific model by ID
   */
  getModel(modelId) {
    return this.models.get(modelId) || null;
  }

  /**
   * Search models by name or description
   */
  searchModels(query) {
    const results = {};
    const lowercaseQuery = query.toLowerCase();
    
    this.models.forEach((model, id) => {
      if (
        model.name.toLowerCase().includes(lowercaseQuery) ||
        model.description.toLowerCase().includes(lowercaseQuery) ||
        id.toLowerCase().includes(lowercaseQuery)
      ) {
        results[id] = model;
      }
    });
    
    return results;
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    return {
      modelCount: this.models.size,
      lastFetch: this.lastFetch?.toISOString(),
      lastSuccessfulFetch: this.lastSuccessfulFetch?.toISOString(),
      cacheAge: this.lastFetch ? Date.now() - this.lastFetch.getTime() : null,
      isStale: this.isCacheStale(),
      isRefreshing: this.isRefreshing,
      cacheTTL: this.cacheTTL
    };
  }

  /**
   * Force refresh (for manual triggers)
   */
  async forceRefresh() {
    console.log('Force refreshing OpenRouter models...');
    return await this.refreshModels();
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown() {
    this.stopAutoRefresh();
    await this.saveToCache();
    console.log('OpenRouter provider shut down cleanly');
  }
}

module.exports = OpenRouterProvider;