// Cost calculation service using unified model data
const modelLoader = require('../shared/modelLoader');

class CostService {
  constructor() {
    // No longer need hardcoded pricing - using unified JSON
  }

  /**
   * Calculate cost for token usage
   * @param {Object} tokens - Object containing totalTokens and tokensPerSegment
   * @param {string} model - Model identifier
   * @returns {Promise<number>} - Total cost in cents
   */
  async calculateCost(tokens, model) {
    const pricing = await modelLoader.getModelPricing(model);
    
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
   * @returns {Promise<number>} - Total cost in dollars
   */
  async calculateSimpleCost(modelId, inputTokens, outputTokens) {
    const pricing = await modelLoader.getModelPricing(modelId);
    if (!pricing) return 0;
    
    return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000000;
  }

  /**
   * Get pricing for a specific model
   * @param {string} modelId - Model identifier
   * @returns {Promise<Object>} Pricing object
   */
  async getModelPricing(modelId) {
    return await modelLoader.getModelPricing(modelId);
  }

  /**
   * Check if model is free
   * @param {string} modelId - Model identifier
   * @returns {Promise<boolean>} True if free
   */
  async isModelFree(modelId) {
    return await modelLoader.isFree(modelId);
  }

  /**
   * Get all free models
   * @returns {Promise<Array>} Array of free model IDs
   */
  async getFreeModels() {
    const allModels = await modelLoader.getAllModels();
    const freeModels = [];
    
    for (const [modelId, model] of Object.entries(allModels)) {
      if (model.pricing.input === 0 && model.pricing.output === 0) {
        freeModels.push(modelId);
      }
    }
    
    return freeModels;
  }

  /**
   * Get cost estimate for a conversation
   * @param {Array} messages - Conversation messages
   * @param {string} modelId - Model identifier
   * @returns {Promise<number>} Estimated cost in dollars
   */
  async estimateConversationCost(messages, modelId) {
    const tokenService = require('./tokenService');
    const tokens = await tokenService.getTokensForModel(messages, modelId);
    const pricing = await this.getModelPricing(modelId);
    
    if (!pricing) return 0;
    
    // Rough estimate: assume 80% input, 20% output
    const estimatedInputTokens = Math.floor(tokens * 0.8);
    const estimatedOutputTokens = Math.floor(tokens * 0.2);
    
    return await this.calculateSimpleCost(modelId, estimatedInputTokens, estimatedOutputTokens);
  }

  /**
   * Format cost for display
   * @param {number} cost - Cost in dollars
   * @param {string} currency - Currency format
   * @returns {string} Formatted cost
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
   * @param {Array} modelIds - Array of model IDs
   * @returns {Promise<Array>} Pricing comparison
   */
  async getPricingComparison(modelIds) {
    const comparisons = [];
    
    for (const modelId of modelIds) {
      comparisons.push({
        model: modelId,
        pricing: await this.getModelPricing(modelId),
        isFree: await this.isModelFree(modelId)
      });
    }
    
    return comparisons;
  }

  /**
   * Update pricing for a model (runtime only - doesn't persist)
   * @param {string} modelId - Model identifier
   * @param {number} inputPrice - Input price per million tokens
   * @param {number} outputPrice - Output price per million tokens
   */
  async updateModelPricing(modelId, inputPrice, outputPrice) {
    // Note: This would update runtime cache only
    // For persistent updates, modify the JSON file
    console.warn('updateModelPricing: Runtime updates not persistent. Modify JSON file for permanent changes.');
  }

  /**
   * Get comprehensive cost statistics
   * @returns {Promise<Object>} Cost statistics
   */
  async getCostStatistics() {
    const allModels = await modelLoader.getAllModels();
    const stats = {
      totalModels: Object.keys(allModels).length,
      freeModels: 0,
      paidModels: 0,
      avgInputCost: 0,
      avgOutputCost: 0,
      costRanges: {
        cheap: 0,    // < $1 per million
        medium: 0,   // $1-10 per million
        expensive: 0 // > $10 per million
      }
    };

    let totalInputCost = 0;
    let totalOutputCost = 0;
    let paidModelCount = 0;

    Object.values(allModels).forEach(model => {
      const pricing = model.pricing;
      
      if (pricing.input === 0 && pricing.output === 0) {
        stats.freeModels++;
      } else {
        stats.paidModels++;
        paidModelCount++;
        totalInputCost += pricing.input;
        totalOutputCost += pricing.output;
        
        // Categorize by cost
        const maxPrice = Math.max(pricing.input, pricing.output);
        if (maxPrice < 1) {
          stats.costRanges.cheap++;
        } else if (maxPrice <= 10) {
          stats.costRanges.medium++;
        } else {
          stats.costRanges.expensive++;
        }
      }
    });

    if (paidModelCount > 0) {
      stats.avgInputCost = totalInputCost / paidModelCount;
      stats.avgOutputCost = totalOutputCost / paidModelCount;
    }

    return stats;
  }
}

// Create singleton instance
const costService = new CostService();

module.exports = costService;