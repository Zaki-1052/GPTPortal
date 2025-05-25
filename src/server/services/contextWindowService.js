// Context Window Service - Dynamic context limit retrieval for all models
const modelLoader = require('../../shared/modelLoader');
const Logger = require('../utils/Logger');

class ContextWindowService {
  constructor() {
    this.logger = new Logger('ContextWindowService');
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get context window limit for a model
   * @param {string} modelId - Model identifier
   * @returns {Promise<number>} Context window size in tokens
   */
  async getContextWindow(modelId) {
    try {
      // Check cache first
      const cached = this.getCachedContextWindow(modelId);
      if (cached !== null) {
        return cached;
      }

      // Load model data
      const model = await modelLoader.getModel(modelId);
      let contextWindow = null;

      if (model && model.contextWindow) {
        contextWindow = model.contextWindow;
        this.logger.debug(`Context window for ${modelId}: ${contextWindow} (from model data)`);
      } else {
        // Fallback to pattern matching
        contextWindow = this.getContextWindowByPattern(modelId);
        this.logger.warn(`Context window for ${modelId}: ${contextWindow} (from pattern matching)`);
      }

      // Cache the result
      this.setCachedContextWindow(modelId, contextWindow);
      return contextWindow;

    } catch (error) {
      this.logger.error(`Error getting context window for ${modelId}:`, error);
      return this.getContextWindowByPattern(modelId);
    }
  }

  /**
   * Get context window using pattern matching (fallback)
   * @param {string} modelId - Model identifier
   * @returns {number} Context window size
   */
  getContextWindowByPattern(modelId) {
    // OpenAI models
    if (modelId.includes('gpt-4o') || modelId.includes('gpt-4-turbo') || modelId.includes('gpt-4.1')) {
      return 128000;
    } else if (modelId.includes('gpt-4')) {
      return 8192;
    } else if (modelId.includes('gpt-3.5')) {
      return 16385;
    } else if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
      return 128000;
    }

    // Anthropic models
    else if (modelId.includes('claude')) {
      return 200000;
    }

    // Google models
    else if (modelId.includes('gemini-1.5-pro') || modelId.includes('gemini-2.5-pro')) {
      return 2000000;
    } else if (modelId.includes('gemini-1.5') || modelId.includes('gemini-2.0') || modelId.includes('gemini-2.5')) {
      return 1000000;
    } else if (modelId.includes('gemini')) {
      return 30720;
    }

    // DeepSeek models
    else if (modelId.includes('deepseek')) {
      return 64000;
    }

    // LLaMA models
    else if (modelId.includes('llama')) {
      return 131072;
    }

    // Mistral models
    else if (modelId.includes('mistral') || modelId.includes('mixtral') || modelId.includes('pixtral')) {
      return 128000;
    } else if (modelId.includes('codestral')) {
      return 32000;
    }

    // Voice/Image models (smaller contexts)
    else if (modelId.includes('tts') || modelId.includes('whisper') || modelId.includes('dall-e')) {
      if (modelId.includes('gpt-4o')) {
        return 128000;
      }
      return 4000;
    }

    // Default fallback
    return 8000;
  }

  /**
   * Get cached context window
   * @param {string} modelId - Model identifier
   * @returns {number|null} Cached context window or null
   */
  getCachedContextWindow(modelId) {
    const cached = this.cache.get(modelId);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.contextWindow;
    }
    return null;
  }

  /**
   * Cache context window for model
   * @param {string} modelId - Model identifier
   * @param {number} contextWindow - Context window size
   */
  setCachedContextWindow(modelId, contextWindow) {
    this.cache.set(modelId, {
      contextWindow,
      timestamp: Date.now()
    });
  }

  /**
   * Get context windows for multiple models
   * @param {string[]} modelIds - Array of model identifiers
   * @returns {Promise<Object>} Map of modelId to context window
   */
  async getContextWindows(modelIds) {
    const results = {};
    await Promise.all(
      modelIds.map(async (modelId) => {
        results[modelId] = await this.getContextWindow(modelId);
      })
    );
    return results;
  }

  /**
   * Calculate context usage percentage
   * @param {number} usedTokens - Number of tokens used
   * @param {string} modelId - Model identifier
   * @returns {Promise<Object>} Usage information
   */
  async calculateContextUsage(usedTokens, modelId) {
    const contextWindow = await this.getContextWindow(modelId);
    const percentage = (usedTokens / contextWindow) * 100;
    
    let status = 'low';
    if (percentage >= 80) {
      status = 'critical';
    } else if (percentage >= 50) {
      status = 'high';
    } else if (percentage >= 25) {
      status = 'medium';
    }

    return {
      usedTokens,
      contextWindow,
      percentage: Math.min(percentage, 100),
      status,
      remainingTokens: Math.max(contextWindow - usedTokens, 0)
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.logger.info('Context window cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const contextWindowService = new ContextWindowService();

module.exports = contextWindowService;