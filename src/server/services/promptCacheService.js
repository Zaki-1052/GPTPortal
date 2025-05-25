/**
 * Prompt Cache Service - Modular caching system for Claude and other providers
 * 
 * Features:
 * - Intelligent cache strategy determination
 * - Token minimum validation for cache eligibility
 * - Cost analysis with cache savings calculation
 * - Cache hit/miss tracking and analytics
 * - Full backward compatibility (opt-in caching)
 * - Integration with existing TokenService and CostService
 */

const Logger = require('../utils/Logger');

class PromptCacheService {
  constructor(tokenService, costService, config = {}) {
    this.tokenService = tokenService;
    this.costService = costService;
    this.logger = new Logger('PromptCacheService');
    
    // Cache analytics
    this.analytics = {
      requests: 0,
      cacheAttempts: 0,
      cacheHits: 0,
      cacheMisses: 0,
      tokensSaved: 0,
      costSavingsUSD: 0,
      byModel: new Map()
    };
    
    // Cache configuration with defaults
    this.config = {
      enabled: config.enabled || process.env.CLAUDE_CACHE_ENABLED === 'true',
      defaultStrategy: config.strategy || process.env.CLAUDE_CACHE_STRATEGY || 'conservative',
      maxCacheBreakpoints: config.maxBreakpoints || process.env.CLAUDE_CACHE_MAX_BREAKPOINTS || 4,
      enableAnalytics: config.analytics !== false,
      defaultPreference: config.defaultPreference || 'auto'
    };
    
    this.logger.info('PromptCacheService initialized', {
      enabled: this.config.enabled,
      strategy: this.config.defaultStrategy
    });
  }

  /**
   * Get cache configuration for a specific model
   */
  getModelCacheConfig(modelId) {
    // Token minimums based on Claude documentation
    const cacheMinimums = {
      'claude-opus-4-20250514': 1024,
      'claude-sonnet-4-20250514': 1024, 
      'claude-3-7-sonnet-latest': 1024,
      'claude-3-5-sonnet-latest': 1024,
      'claude-3-5-haiku-latest': 2048,
      'claude-3-haiku-20240307': 2048
    };

    return {
      supported: modelId.startsWith('claude'),
      minimumTokens: cacheMinimums[modelId] || 1024,
      maxBreakpoints: this.config.maxCacheBreakpoints,
      defaultCacheStrategy: this.config.defaultStrategy
    };
  }

  /**
   * Analyze content and determine optimal cache strategy
   */
  async analyzeCacheStrategy(payload, options = {}) {
    const { modelID, systemMessage, claudeHistory, cachePreference = 'auto' } = payload;
    const modelConfig = this.getModelCacheConfig(modelID);
    
    this.analytics.requests++;
    
    if (!modelConfig.supported) {
      return {
        shouldCache: false,
        reason: 'Model does not support prompt caching',
        strategy: null
      };
    }

    if (!this.config.enabled && cachePreference !== 'force') {
      return {
        shouldCache: false,
        reason: 'Caching disabled globally',
        strategy: null
      };
    }

    // Analyze content for cache opportunities
    const analysis = await this._analyzeContent({
      systemMessage,
      claudeHistory,
      modelID,
      minimumTokens: modelConfig.minimumTokens
    });

    // Determine strategy based on content analysis and preferences
    const strategy = this._determineStrategy(analysis, cachePreference, options);
    
    if (strategy.shouldCache) {
      this.analytics.cacheAttempts++;
    }

    return strategy;
  }

  /**
   * Apply cache controls to request data based on strategy
   */
  async applyCacheControls(payload, strategy) {
    if (!strategy.shouldCache) {
      return payload; // Return unchanged
    }

    const { modelID, systemMessage, claudeHistory } = payload;
    const modifiedPayload = { ...payload };

    try {
      // Apply caching to system message if strategy indicates
      if (strategy.cacheSystemMessage && systemMessage) {
        modifiedPayload.systemMessage = await this._applyCacheControlToContent(
          systemMessage, 
          'system',
          modelID
        );
      }

      // Apply caching to conversation history if strategy indicates
      if (strategy.cacheConversationHistory && claudeHistory) {
        modifiedPayload.claudeHistory = await this._applyCacheControlToHistory(
          claudeHistory,
          strategy,
          modelID
        );
      }

      this.logger.debug('Applied cache controls', {
        modelID,
        strategy: strategy.type,
        breakpoints: strategy.breakpoints
      });

      return modifiedPayload;

    } catch (error) {
      this.logger.error('Failed to apply cache controls', { error: error.message, modelID });
      // Return original payload on error (graceful degradation)
      return payload;
    }
  }

  /**
   * Track cache performance from API response
   */
  trackCachePerformance(modelID, usage, wasCacheAttempted = false) {
    if (!this.config.enableAnalytics) return;

    const modelStats = this._getModelStats(modelID);

    if (wasCacheAttempted) {
      if (usage.cache_creation_input_tokens > 0) {
        // Cache was created
        modelStats.cacheCreations++;
        this.logger.debug('Cache created', {
          modelID,
          cacheTokens: usage.cache_creation_input_tokens
        });
      }

      if (usage.cache_read_input_tokens > 0) {
        // Cache was hit
        this.analytics.cacheHits++;
        modelStats.cacheHits++;
        modelStats.tokensSaved += usage.cache_read_input_tokens;
        this.analytics.tokensSaved += usage.cache_read_input_tokens;
        
        // Calculate cost savings
        this._calculateCostSavings(modelID, usage);
        
        this.logger.debug('Cache hit recorded', {
          modelID,
          tokensRead: usage.cache_read_input_tokens,
          totalSaved: this.analytics.tokensSaved
        });
      } else if (usage.input_tokens > 0) {
        // Cache miss
        this.analytics.cacheMisses++;
        modelStats.cacheMisses++;
      }
    }
  }

  /**
   * Get comprehensive analytics
   */
  getAnalytics() {
    const hitRate = this.analytics.cacheAttempts > 0 ? 
      (this.analytics.cacheHits / this.analytics.cacheAttempts) * 100 : 0;

    return {
      overall: {
        requests: this.analytics.requests,
        cacheAttempts: this.analytics.cacheAttempts,
        cacheHits: this.analytics.cacheHits,
        cacheMisses: this.analytics.cacheMisses,
        hitRate: Math.round(hitRate * 100) / 100,
        tokensSaved: this.analytics.tokensSaved,
        costSavingsUSD: Math.round(this.analytics.costSavingsUSD * 100000) / 100000
      },
      byModel: Object.fromEntries(this.analytics.byModel),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze content for cache opportunities
   * @private
   */
  async _analyzeContent({ systemMessage, claudeHistory, modelID, minimumTokens }) {
    const analysis = {
      systemMessageTokens: 0,
      conversationTokens: 0,
      totalTokens: 0,
      cacheableContent: []
    };

    // Analyze system message
    if (systemMessage) {
      const systemTokens = await this.tokenService.getTokensForModel(systemMessage, modelID);
      analysis.systemMessageTokens = systemTokens;
      analysis.totalTokens += systemTokens;

      if (systemTokens >= minimumTokens) {
        analysis.cacheableContent.push({
          type: 'system',
          tokens: systemTokens,
          content: systemMessage
        });
      }
    }

    // Analyze conversation history
    if (claudeHistory && Array.isArray(claudeHistory)) {
      let conversationText = '';
      for (const message of claudeHistory) {
        if (typeof message.content === 'string') {
          conversationText += message.content + ' ';
        } else if (Array.isArray(message.content)) {
          conversationText += message.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join(' ');
        }
      }

      if (conversationText.trim()) {
        const conversationTokens = await this.tokenService.getTokensForModel(conversationText, modelID);
        analysis.conversationTokens = conversationTokens;
        analysis.totalTokens += conversationTokens;

        if (conversationTokens >= minimumTokens) {
          analysis.cacheableContent.push({
            type: 'conversation',
            tokens: conversationTokens,
            content: claudeHistory
          });
        }
      }
    }

    return analysis;
  }

  /**
   * Determine the optimal caching strategy
   * @private
   */
  _determineStrategy(analysis, cachePreference, options) {
    const { defaultCacheStrategy } = options;
    const strategy = defaultCacheStrategy || this.config.defaultStrategy;

    // Force caching if explicitly requested
    if (cachePreference === 'force') {
      return this._createForceStrategy(analysis);
    }

    // Skip caching if explicitly disabled
    if (cachePreference === 'none') {
      return { shouldCache: false, reason: 'Caching explicitly disabled' };
    }

    // No cacheable content found
    if (analysis.cacheableContent.length === 0) {
      return { 
        shouldCache: false, 
        reason: 'No content meets minimum token requirements' 
      };
    }

    // Apply strategy-specific logic
    switch (strategy) {
      case 'aggressive':
        return this._createAggressiveStrategy(analysis);
      case 'conservative':
        return this._createConservativeStrategy(analysis);
      case 'system_only':
        return this._createSystemOnlyStrategy(analysis);
      default:
        return this._createConservativeStrategy(analysis);
    }
  }

  /**
   * Create aggressive caching strategy
   * @private
   */
  _createAggressiveStrategy(analysis) {
    const breakpoints = [];
    
    analysis.cacheableContent.forEach(content => {
      breakpoints.push({
        type: content.type,
        tokens: content.tokens
      });
    });

    return {
      shouldCache: true,
      type: 'aggressive',
      cacheSystemMessage: analysis.cacheableContent.some(c => c.type === 'system'),
      cacheConversationHistory: analysis.cacheableContent.some(c => c.type === 'conversation'),
      breakpoints: breakpoints.slice(0, this.config.maxCacheBreakpoints),
      estimatedSavings: this._estimateSavings(analysis)
    };
  }

  /**
   * Create conservative caching strategy (system message only)
   * @private
   */
  _createConservativeStrategy(analysis) {
    const systemContent = analysis.cacheableContent.find(c => c.type === 'system');
    
    if (!systemContent) {
      return { shouldCache: false, reason: 'No system message eligible for caching' };
    }

    return {
      shouldCache: true,
      type: 'conservative',
      cacheSystemMessage: true,
      cacheConversationHistory: false,
      breakpoints: [{ type: 'system', tokens: systemContent.tokens }],
      estimatedSavings: this._estimateSavings({ cacheableContent: [systemContent] })
    };
  }

  /**
   * Create system-only caching strategy
   * @private
   */
  _createSystemOnlyStrategy(analysis) {
    return this._createConservativeStrategy(analysis);
  }

  /**
   * Create force caching strategy
   * @private
   */
  _createForceStrategy(analysis) {
    return {
      shouldCache: true,
      type: 'force',
      cacheSystemMessage: analysis.systemMessageTokens > 0,
      cacheConversationHistory: analysis.conversationTokens > 0,
      breakpoints: analysis.cacheableContent.map(c => ({ type: c.type, tokens: c.tokens })),
      estimatedSavings: this._estimateSavings(analysis)
    };
  }

  /**
   * Apply cache control to content
   * @private
   */
  async _applyCacheControlToContent(content, type, modelID) {
    if (typeof content === 'string') {
      return {
        type: 'text',
        text: content,
        cache_control: { type: 'ephemeral' }
      };
    }

    if (Array.isArray(content)) {
      // Add cache control to the last text element
      const modifiedContent = [...content];
      for (let i = modifiedContent.length - 1; i >= 0; i--) {
        if (modifiedContent[i].type === 'text') {
          modifiedContent[i] = {
            ...modifiedContent[i],
            cache_control: { type: 'ephemeral' }
          };
          break;
        }
      }
      return modifiedContent;
    }

    return content;
  }

  /**
   * Apply cache control to conversation history
   * @private
   */
  async _applyCacheControlToHistory(history, strategy, modelID) {
    if (!Array.isArray(history) || history.length === 0) {
      return history;
    }

    const modifiedHistory = [...history];

    // For conservative strategy, only cache the first few messages (stable context)
    if (strategy.type === 'conservative' && modifiedHistory.length > 2) {
      // Cache the first user message (typically contains initial context)
      const firstUserMessageIndex = modifiedHistory.findIndex(msg => msg.role === 'user');
      if (firstUserMessageIndex !== -1) {
        modifiedHistory[firstUserMessageIndex] = this._addCacheControlToMessage(
          modifiedHistory[firstUserMessageIndex]
        );
      }
    }

    // For aggressive strategy, cache multiple breakpoints
    if (strategy.type === 'aggressive') {
      const cacheIndices = this._selectHistoryCachePoints(modifiedHistory, strategy.breakpoints.length);
      cacheIndices.forEach(index => {
        if (index < modifiedHistory.length) {
          modifiedHistory[index] = this._addCacheControlToMessage(modifiedHistory[index]);
        }
      });
    }

    return modifiedHistory;
  }

  /**
   * Add cache control to a message
   * @private
   */
  _addCacheControlToMessage(message) {
    const modifiedMessage = { ...message };

    if (Array.isArray(modifiedMessage.content)) {
      const modifiedContent = [...modifiedMessage.content];
      // Add cache control to the last text element
      for (let i = modifiedContent.length - 1; i >= 0; i--) {
        if (modifiedContent[i].type === 'text') {
          modifiedContent[i] = {
            ...modifiedContent[i],
            cache_control: { type: 'ephemeral' }
          };
          break;
        }
      }
      modifiedMessage.content = modifiedContent;
    } else if (typeof modifiedMessage.content === 'string') {
      modifiedMessage.content = [{
        type: 'text',
        text: modifiedMessage.content,
        cache_control: { type: 'ephemeral' }
      }];
    }

    return modifiedMessage;
  }

  /**
   * Select optimal cache points in conversation history
   * @private
   */
  _selectHistoryCachePoints(history, maxPoints) {
    const indices = [];
    const step = Math.max(1, Math.floor(history.length / maxPoints));
    
    for (let i = 0; i < history.length && indices.length < maxPoints; i += step) {
      indices.push(i);
    }

    return indices;
  }

  /**
   * Estimate cost savings from caching
   * @private
   */
  _estimateSavings(analysis) {
    const totalCacheableTokens = analysis.cacheableContent.reduce((sum, content) => sum + content.tokens, 0);
    
    return {
      tokens: totalCacheableTokens,
      estimatedHitRate: 0.7, // Conservative estimate
      potentialSavings: totalCacheableTokens * 0.7 * 0.9 // 90% cost reduction on cache hits
    };
  }

  /**
   * Calculate actual cost savings from cache hits
   * @private
   */
  async _calculateCostSavings(modelID, usage) {
    if (usage.cache_read_input_tokens > 0) {
      try {
        const pricing = await this.costService.getModelPricing(modelID);
        if (pricing) {
          // Cache hits cost 10% of regular input tokens
          const regularCost = (usage.cache_read_input_tokens * pricing.input) / 1000000;
          const cacheCost = regularCost * 0.1;
          const savings = regularCost - cacheCost;
          
          this.analytics.costSavingsUSD += savings;
          
          const modelStats = this._getModelStats(modelID);
          modelStats.costSavingsUSD += savings;
        }
      } catch (error) {
        this.logger.warn('Failed to calculate cost savings', { error: error.message });
      }
    }
  }

  /**
   * Get or create model statistics
   * @private
   */
  _getModelStats(modelID) {
    if (!this.analytics.byModel.has(modelID)) {
      this.analytics.byModel.set(modelID, {
        requests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheCreations: 0,
        tokensSaved: 0,
        costSavingsUSD: 0
      });
    }
    
    const stats = this.analytics.byModel.get(modelID);
    stats.requests++;
    return stats;
  }

  /**
   * Reset analytics (useful for testing)
   */
  resetAnalytics() {
    this.analytics = {
      requests: 0,
      cacheAttempts: 0,
      cacheHits: 0,
      cacheMisses: 0,
      tokensSaved: 0,
      costSavingsUSD: 0,
      byModel: new Map()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', newConfig);
  }

  /**
   * Health check
   */
  healthCheck() {
    return {
      status: 'healthy',
      enabled: this.config.enabled,
      analytics: this.getAnalytics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Shutdown cleanup
   */
  async shutdown() {
    this.logger.info('PromptCacheService shutting down', {
      analytics: this.getAnalytics()
    });
  }
}

module.exports = PromptCacheService;