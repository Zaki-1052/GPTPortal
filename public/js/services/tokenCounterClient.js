// Client-side Token Counter Service
// Provides accurate token counting for system prompts and user input

class TokenCounterClient {
  constructor() {
    this.encoders = new Map();
    this.initPromise = null;
    this.fallbackMode = false;
    
    // Initialize on construction
    this.init();
  }

  /**
   * Initialize tiktoken for browser environment
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._loadTiktoken();
    return this.initPromise;
  }

  /**
   * Load tiktoken module for browser
   * @private
   */
  async _loadTiktoken() {
    try {
      // Import js-tiktoken lite from jsDelivr CDN
      const { Tiktoken } = await import('https://cdn.jsdelivr.net/npm/js-tiktoken@1.0.20/dist/lite.js');
      
      // Store Tiktoken class for later use
      this.Tiktoken = Tiktoken;
      
      // Load encodings dynamically from Cloudflare CDN
      const encodingsToLoad = [
        { name: 'cl100k_base', url: 'https://tiktoken.pages.dev/js/cl100k_base.json' },
        { name: 'o200k_base', url: 'https://tiktoken.pages.dev/js/o200k_base.json' }
      ];
      
      // Load all encodings in parallel
      const loadPromises = encodingsToLoad.map(async ({ name, url }) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${name}: ${response.statusText}`);
          }
          const encodingData = await response.json();
          
          // Create encoder instance
          const encoder = new Tiktoken(encodingData);
          this.encoders.set(name, encoder);
          
          console.log(`✓ Loaded ${name} encoder`);
          return { name, success: true };
        } catch (error) {
          console.warn(`Failed to load ${name} encoder:`, error);
          return { name, success: false, error };
        }
      });
      
      const results = await Promise.all(loadPromises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === 0) {
        throw new Error('Failed to load any encoders');
      }
      
      console.log(`✓ js-tiktoken loaded successfully with ${successCount}/${encodingsToLoad.length} encoders`);
      console.log('Available encoders:', Array.from(this.encoders.keys()));
      
    } catch (error) {
      console.warn('js-tiktoken not available in browser, using fallback estimation:', error);
      this.fallbackMode = true;
    }
  }

  /**
   * Count tokens accurately using tiktoken
   * @param {string} text - Text to count tokens for
   * @param {string} [modelId='gpt-4o'] - Model ID to determine encoding
   * @returns {Promise<number>} Accurate token count
   */
  async countTokens(text, modelId = 'gpt-4o') {
    if (!text) return 0;

    // Wait for initialization
    await this.init();

    if (this.fallbackMode) {
      return this._estimateTokens(text);
    }

    try {
      const encoding = await this._getEncodingForModel(modelId);
      if (!encoding) {
        return this._estimateTokens(text);
      }

      const tokens = encoding.encode(text);
      return tokens.length;

    } catch (error) {
      console.warn('Token counting failed, using fallback:', error);
      return this._estimateTokens(text);
    }
  }

  /**
   * Get appropriate encoding for model
   * @param {string} modelId - Model identifier
   * @returns {Promise<Object|null>} Encoding object
   * @private
   */
  async _getEncodingForModel(modelId) {
    try {
      // Determine encoding based on model
      let encodingName = 'cl100k_base'; // Default for GPT-4

      if (modelId.includes('gpt-4o') || modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
        // Newer models might use o200k_base
        encodingName = this.encoders.has('o200k_base') ? 'o200k_base' : 'cl100k_base';
      } else if (modelId.includes('gpt-4') || modelId.includes('gpt-3.5')) {
        encodingName = 'cl100k_base';
      }

      // Get from pre-loaded encoders
      if (this.encoders.has(encodingName)) {
        return this.encoders.get(encodingName);
      }

      // If encoder not available, return null to use fallback
      console.warn(`Encoder ${encodingName} not available for model ${modelId}`);
      return null;

    } catch (error) {
      console.warn(`Failed to get encoding for model ${modelId}:`, error);
      return null;
    }
  }

  /**
   * Fallback token estimation
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   * @private
   */
  _estimateTokens(text) {
    if (!text) return 0;
    
    // More sophisticated estimation than simple char/4
    const baseTokens = Math.ceil(text.length / 4);
    
    // Add extra tokens for special characters and formatting
    const specialChars = (text.match(/[{}[\](),.;:!?'"]/g) || []).length;
    const whitespace = (text.match(/\s+/g) || []).length;
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length * 10;
    const markup = (text.match(/<[^>]+>/g) || []).length * 2;
    
    return baseTokens + Math.ceil(specialChars / 3) + Math.ceil(whitespace / 8) + codeBlocks + markup;
  }

  /**
   * Count tokens for multiple model types with cost estimation
   * @param {string} text - Text to analyze
   * @param {Array<string>} [modelIds] - Models to analyze for
   * @returns {Promise<Object>} Analysis results with token counts and estimated costs
   */
  async analyzeText(text, modelIds = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-latest']) {
    const results = {};
    
    for (const modelId of modelIds) {
      try {
        const tokenCount = await this.countTokens(text, modelId);
        
        // Simple cost estimation (would be better to fetch from server)
        let inputCostPer1M = 0;
        if (modelId.includes('gpt-4o-mini')) {
          inputCostPer1M = 0.15;
        } else if (modelId.includes('gpt-4o')) {
          inputCostPer1M = 2.5;
        } else if (modelId.includes('claude-3-5-sonnet')) {
          inputCostPer1M = 3.0;
        } else if (modelId.includes('claude-3-5-haiku')) {
          inputCostPer1M = 0.25;
        }
        
        const estimatedCost = (tokenCount * inputCostPer1M) / 1000000;
        
        results[modelId] = {
          tokens: tokenCount,
          estimatedCost: parseFloat(estimatedCost.toFixed(6)),
          costPer1M: inputCostPer1M
        };
        
      } catch (error) {
        results[modelId] = {
          tokens: this._estimateTokens(text),
          error: error.message
        };
      }
    }
    
    return {
      textLength: text.length,
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get token counting status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: !!this.initPromise,
      tiktoken: !!this.Tiktoken && !this.fallbackMode,
      fallbackMode: this.fallbackMode,
      encoders: Array.from(this.encoders.keys())
    };
  }

  /**
   * Format token count with commas and cost estimate
   * @param {number} tokens - Token count
   * @param {string} [modelId] - Model for cost estimation
   * @returns {string} Formatted string
   */
  formatTokenCount(tokens, modelId) {
    const tokenStr = tokens.toLocaleString();
    
    if (!modelId) {
      return `${tokenStr} tokens`;
    }
    
    // Simple cost calculation
    let costPer1M = 0;
    if (modelId.includes('gpt-4o-mini')) {
      costPer1M = 0.15;
    } else if (modelId.includes('gpt-4o')) {
      costPer1M = 2.5;
    } else if (modelId.includes('claude-3-5-sonnet')) {
      costPer1M = 3.0;
    } else if (modelId.includes('claude-3-5-haiku')) {
      costPer1M = 0.25;
    }
    
    if (costPer1M > 0) {
      const cost = (tokens * costPer1M) / 1000000;
      if (cost >= 0.01) {
        return `${tokenStr} tokens (~$${cost.toFixed(3)})`;
      } else if (cost >= 0.001) {
        return `${tokenStr} tokens (~$${cost.toFixed(4)})`;
      } else {
        return `${tokenStr} tokens (~$${cost.toFixed(6)})`;
      }
    }
    
    return `${tokenStr} tokens`;
  }
}

// Create singleton instance
const tokenCounterClient = new TokenCounterClient();

// Export for use in other modules
window.TokenCounterClient = TokenCounterClient;
window.tokenCounterClient = tokenCounterClient;

// Expose globally for compatibility
window.countTokens = async (text, modelId) => {
  return await tokenCounterClient.countTokens(text, modelId);
};

console.log('🔢 Token Counter Client loaded');