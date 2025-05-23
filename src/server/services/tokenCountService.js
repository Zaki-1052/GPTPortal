// Token Counting Service - Accurate token counting for all providers
const modelLoader = require('../../shared/modelLoader');

class TokenCountService {
  constructor() {
    this.tiktoken = null;
    this.initializeTiktoken();
  }

  /**
   * Initialize tiktoken for OpenAI models
   */
  async initializeTiktoken() {
    try {
      // Try to load tiktoken for Node.js
      this.tiktoken = require('tiktoken');
      console.log('Tiktoken initialized for OpenAI token counting');
    } catch (error) {
      console.warn('Tiktoken not available, falling back to estimation');
      this.tiktoken = null;
    }
  }

  /**
   * Count tokens using appropriate method for provider
   * @param {string} text - Text to count
   * @param {string} modelId - Model identifier
   * @returns {Promise<number>} Token count
   */
  async countTokens(text, modelId) {
    const provider = await modelLoader.getProvider(modelId);
    
    switch (provider) {
      case 'openai':
        return this.countOpenAITokens(text, modelId);
      case 'anthropic':
        return this.countAnthropicTokens(text, modelId);
      default:
        return this.estimateTokens(text);
    }
  }

  /**
   * Count tokens for OpenAI models using tiktoken
   * @param {string} text - Text to count
   * @param {string} modelId - OpenAI model ID
   * @returns {number} Token count
   */
  countOpenAITokens(text, modelId) {
    if (!this.tiktoken) {
      return this.estimateTokens(text);
    }

    try {
      // Map model to encoding
      let encoding;
      if (modelId.includes('gpt-4') || modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
        encoding = this.tiktoken.get_encoding('cl100k_base');
      } else if (modelId.includes('gpt-3.5')) {
        encoding = this.tiktoken.get_encoding('cl100k_base');
      } else {
        // Try to get encoding for specific model
        try {
          encoding = this.tiktoken.encoding_for_model(modelId);
        } catch (e) {
          encoding = this.tiktoken.get_encoding('cl100k_base'); // Fallback
        }
      }

      const tokens = encoding.encode(text);
      return tokens.length;

    } catch (error) {
      console.warn('Tiktoken encoding failed:', error.message);
      return this.estimateTokens(text);
    }
  }

  /**
   * Count tokens for Anthropic models using API
   * @param {string} text - Text to count  
   * @param {string} modelId - Anthropic model ID
   * @returns {Promise<number>} Token count
   */
  async countAnthropicTokens(text, modelId) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return this.estimateTokens(text);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: text }]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic token count API error: ${response.status}`);
      }

      const data = await response.json();
      return data.input_tokens;

    } catch (error) {
      console.warn('Anthropic token counting failed:', error.message);
      return this.estimateTokens(text);
    }
  }

  /**
   * Estimate tokens using simple heuristics
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost for token usage
   * @param {string} modelId - Model identifier
   * @param {number} inputTokens - Input token count
   * @param {number} outputTokens - Output token count
   * @param {boolean} useCached - Whether to use cached pricing
   * @returns {Promise<Object>} Cost breakdown
   */
  async calculateCost(modelId, inputTokens, outputTokens, useCached = false) {
    const pricing = await modelLoader.getModelPricing(modelId);
    
    if (!pricing || (!pricing.input && !pricing.output)) {
      return { 
        inputCost: 0, 
        outputCost: 0, 
        totalCost: 0, 
        currency: 'USD',
        breakdown: 'Pricing not available'
      };
    }

    // Use cached pricing if available and requested
    const inputPrice = useCached && pricing.cached ? pricing.cached : pricing.input;
    const outputPrice = pricing.output;

    // Calculate costs (pricing is per 1M tokens)
    const inputCost = (inputTokens * inputPrice) / 1000000;
    const outputCost = (outputTokens * outputPrice) / 1000000;
    const totalCost = inputCost + outputCost;

    return {
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat(totalCost.toFixed(6)),
      currency: 'USD',
      breakdown: {
        inputTokens,
        outputTokens,
        inputRate: inputPrice,
        outputRate: outputPrice,
        usedCached: useCached && !!pricing.cached
      }
    };
  }

  /**
   * Analyze text and provide token/cost estimates for multiple models
   * @param {string} text - Text to analyze
   * @param {Array} modelIds - Array of model IDs to compare
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeText(text, modelIds = []) {
    if (!modelIds.length) {
      // Default to popular models for comparison
      modelIds = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'];
    }

    const results = {};
    
    for (const modelId of modelIds) {
      try {
        const tokenCount = await this.countTokens(text, modelId);
        const cost = await this.calculateCost(modelId, tokenCount, 0); // Just input cost
        
        results[modelId] = {
          tokens: tokenCount,
          inputCost: cost.inputCost,
          estimatedOutputCost: cost.inputCost, // Rough estimate assuming similar output length
          totalEstimatedCost: cost.inputCost * 2,
          model: await modelLoader.getModel(modelId)
        };
      } catch (error) {
        results[modelId] = {
          error: error.message,
          tokens: this.estimateTokens(text)
        };
      }
    }

    return {
      textLength: text.length,
      analysis: results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get token counting capabilities
   * @returns {Object} Available capabilities
   */
  getCapabilities() {
    return {
      tiktoken: !!this.tiktoken,
      anthropicAPI: !!process.env.ANTHROPIC_API_KEY,
      supportedProviders: ['openai', 'anthropic', 'estimation'],
      features: {
        exactCounting: this.tiktoken || !!process.env.ANTHROPIC_API_KEY,
        costCalculation: true,
        multiModelComparison: true,
        cachedPricing: true
      }
    };
  }
}

// Create singleton instance
const tokenCountService = new TokenCountService();

module.exports = tokenCountService;