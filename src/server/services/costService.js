// Cost calculation service with comprehensive model pricing
class CostService {
  constructor() {
    this.setupModelPricing();
  }

  /**
   * Setup comprehensive model pricing (cost per million tokens)
   */
  setupModelPricing() {
    this.modelPricing = {
      // OpenAI GPT Models
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-4o': { input: 5.00, output: 15.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-3.5-turbo-0125': { input: 0.50, output: 1.50 },

      // OpenAI Reasoning Models
      'o1-preview': { input: 15.00, output: 60.00 },
      'o1-mini': { input: 3.00, output: 12.00 },
      'o3-mini': { input: 3.00, output: 12.00 },

      // Anthropic Claude Models
      'claude-opus-4-20250514': { input: 15.00, output: 75.00 },
      'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
      'claude-3-7-sonnet-latest': { input: 3.00, output: 15.00 },
      'claude-3-5-sonnet-latest': { input: 3.00, output: 15.00 },
      'claude-3-5-sonnet-20240620': { input: 3.00, output: 15.00 },
      'claude-3-5-haiku-latest': { input: 0.25, output: 1.25 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      'claude-2.1': { input: 8.00, output: 24.00 },
      'claude-2.0': { input: 8.00, output: 24.00 },
      'claude-instant-1.2': { input: 0.80, output: 2.40 },

      // DeepSeek Models
      'deepseek-reasoner': { input: 0.55, output: 2.19 },
      'deepseek-chat': { input: 0.14, output: 0.28 },

      // Mistral Models
      'mistral-large-latest': { input: 2.00, output: 6.00 },
      'mistral-large-2402': { input: 4.00, output: 12.00 },
      'mistral-medium-2312': { input: 2.70, output: 8.10 },
      'mistral-small-2402': { input: 1.00, output: 3.00 },
      'open-mistral-7b': { input: 0.25, output: 0.25 },
      'open-mixtral-8x7b': { input: 0.70, output: 0.70 },
      'open-mixtral-8x22b': { input: 2.00, output: 6.00 },
      'open-mistral-nemo': { input: 0.3, output: 0.3 },
      'codestral-2405': { input: 1.00, output: 3.00 },
      'codestral-latest': { input: 1.00, output: 3.00 },
      'open-codestral-mamba': { input: 0.25, output: 0.25 },

      // Google Gemini Models (Free)
      'gemini-2.0-flash-exp': { input: 0, output: 0 },
      'gemini-1.5-pro': { input: 0, output: 0 },
      'gemini-1.5-flash': { input: 0, output: 0 },
      'gemini-pro': { input: 0, output: 0 },
      'gemini-pro-vision': { input: 0, output: 0 },

      // Meta LLaMA via Groq (Free)
      'llama-3.1-405b-reasoning': { input: 0, output: 0 },
      'llama-3.1-70b-versatile': { input: 0, output: 0 },
      'llama-3.1-8b-instant': { input: 0, output: 0 },
      'llama3-70b-8192': { input: 0, output: 0 },
      'llama3-8b-8192': { input: 0, output: 0 },
      'gemma-7b-it': { input: 0, output: 0 },
      'mixtral-8x7b-32768': { input: 0, output: 0 }
    };
  }

  /**
   * Calculate cost for token usage
   * @param {Object} tokens - Object containing totalTokens and tokensPerSegment
   * @param {string} model - Model identifier
   * @returns {Promise<number>} - Total cost in cents
   */
  async calculateCost(tokens, model) {
    const pricing = this.modelPricing[model];
    
    if (!pricing) {
      console.warn(`Unknown model pricing: ${model}`);
      return 0;
    }

    let totalCost = 0;
    let cumulativeInputTokens = 0;

    // Process each segment in tokensPerSegment
    for (const segment of tokens.tokensPerSegment) {
      if (segment.role === 'SYSTEM' || segment.role === 'USER') {
        cumulativeInputTokens += segment.tokens;
        if (segment.role === 'USER') {
          // Calculate cost for cumulative input tokens
          const inputCost = (cumulativeInputTokens / 1000000) * pricing.input;
          totalCost += inputCost;
        }
      } else if (segment.role === 'ASSISTANT') {
        // Calculate output cost for assistant tokens
        const outputCost = (segment.tokens / 1000000) * pricing.output;
        totalCost += outputCost;

        // Include assistant tokens in cumulative input for future context
        cumulativeInputTokens += segment.tokens;
      }
    }

    // Add extra cost calculation (from original implementation)
    const extraCostRate = 0.600; // per million tokens
    let extraCost = (tokens.totalTokens / 1000000) * extraCostRate;
    extraCost *= 2;

    totalCost += extraCost;
    
    // Convert to cents
    totalCost *= 100;

    return totalCost;
  }

  /**
   * Calculate simple cost based on input/output token counts
   * @param {string} modelId - Model identifier
   * @param {number} inputTokens - Input token count
   * @param {number} outputTokens - Output token count
   * @returns {number} - Total cost in dollars
   */
  calculateSimpleCost(modelId, inputTokens, outputTokens) {
    const pricing = this.modelPricing[modelId];
    if (!pricing) return 0;
    
    return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000000;
  }

  /**
   * Get pricing for a specific model
   */
  getModelPricing(modelId) {
    return this.modelPricing[modelId] || { input: 0, output: 0 };
  }

  /**
   * Check if model is free
   */
  isModelFree(modelId) {
    const pricing = this.getModelPricing(modelId);
    return pricing.input === 0 && pricing.output === 0;
  }

  /**
   * Get all free models
   */
  getFreeModels() {
    return Object.entries(this.modelPricing)
      .filter(([_, pricing]) => pricing.input === 0 && pricing.output === 0)
      .map(([modelId, _]) => modelId);
  }

  /**
   * Get cost estimate for a conversation
   */
  async estimateConversationCost(messages, modelId) {
    const tokenService = require('./tokenService');
    const tokens = await tokenService.getTokensForModel(messages, modelId);
    const pricing = this.getModelPricing(modelId);
    
    if (!pricing) return 0;
    
    // Rough estimate: assume 80% input, 20% output
    const estimatedInputTokens = Math.floor(tokens * 0.8);
    const estimatedOutputTokens = Math.floor(tokens * 0.2);
    
    return this.calculateSimpleCost(modelId, estimatedInputTokens, estimatedOutputTokens);
  }

  /**
   * Format cost for display
   */
  formatCost(cost, currency = 'USD') {
    if (cost === 0) return 'Free';
    
    if (currency === 'USD') {
      if (cost < 0.01) {
        return `¢${(cost * 100).toFixed(4)}`;
      } else {
        return `$${cost.toFixed(6)}`;
      }
    }
    
    return cost.toString();
  }

  /**
   * Get pricing comparison for models
   */
  getPricingComparison(modelIds) {
    return modelIds.map(modelId => ({
      model: modelId,
      pricing: this.getModelPricing(modelId),
      isFree: this.isModelFree(modelId)
    }));
  }

  /**
   * Update pricing for a model
   */
  updateModelPricing(modelId, inputPrice, outputPrice) {
    this.modelPricing[modelId] = {
      input: inputPrice,
      output: outputPrice
    };
  }
}

// Create singleton instance
const costService = new CostService();

module.exports = costService;