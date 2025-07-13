// Enhanced Token counting service with caching and performance optimizations
const { get_encoding, encoding_for_model } = require("tiktoken");
const Logger = require('../utils/Logger');

class TokenService {
  constructor() {
    this.encoderCache = new Map();
    this.tokenCache = new Map();
    this.logger = new Logger('TokenService');
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Periodic cache cleanup
    this.setupCacheCleanup();
  }

  /**
   * Get encoder for a specific model with caching
   */
  getEncoder(model) {
    if (this.encoderCache.has(model)) {
      return this.encoderCache.get(model);
    }

    try {
      const encoder = encoding_for_model(model);
      this.encoderCache.set(model, encoder);
      return encoder;
    } catch (error) {
      console.warn(`Could not get encoder for model ${model}, using default`);
      const encoder = get_encoding("cl100k_base"); // Default encoder
      this.encoderCache.set(model, encoder);
      return encoder;
    }
  }

  /**
   * Tokenize chat history based on model and format type
   * @param {string|Array} history - The chat history (string for gemini, array for chat)
   * @param {string} model - The OpenAI model to use for encoding
   * @param {string} type - The format type ('chat', 'gemini', 'assistant')
   * @returns {Promise<Object>} - Object containing total tokens and tokens per segment
   */
  async tokenizeHistory(history, model, type) {
    const encoder = this.getEncoder(model);

    try {
      // Split the chat history into segments based on type
      let segments;
      try {
        segments = this.splitSegments(history, type);
      } catch (error) {
        console.error(error.message);
        encoder.free();
        return { totalTokens: 0, tokensPerSegment: [] };
      }

      // Calculate tokens for each segment
      let totalTokens = 0;
      const tokensPerSegment = segments.map(segment => {
        const tokens = encoder.encode(segment.text);
        totalTokens += tokens.length;
        return {
          role: segment.role,
          text: segment.text,
          tokens: tokens.length
        };
      });

      return {
        totalTokens,
        tokensPerSegment
      };
    } finally {
      // Don't free cached encoders
    }
  }

  /**
   * Split history into segments based on type
   */
  splitSegments(chatHistory, type) {
    if (type === 'gemini') {
      return this.splitGeminiSegments(chatHistory);
    } else if (type === 'assistant') {
      return this.splitAssistantSegments(chatHistory);
    } else if (type === 'chat') {
      return this.splitChatSegments(chatHistory);
    }
    throw new Error(`Unknown history type: ${type}`);
  }

  /**
   * Split Gemini format history into segments
   */
  splitGeminiSegments(chatHistory) {
    // Capture everything between section labels including newlines and colons
    const segmentRegex = /(?:System Prompt:|User Prompt:|Response:)([\s\S]*?)(?=System Prompt:|User Prompt:|Response:|$)/g;
    const matches = [];
    let match;
    
    while ((match = segmentRegex.exec(chatHistory)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches.map((text, index) => ({
      role: index % 3 === 0 ? 'System Prompt' : index % 3 === 1 ? 'User Prompt' : 'Response',
      text
    }));
  }

  /**
   * Split Assistant format history into segments
   */
  splitAssistantSegments(chatHistory) {
    const segmentRegex = /(SYSTEM:|USER:|ASSISTANT:)(.*?)(?=(SYSTEM:|USER:|ASSISTANT:|$))/gs;
    const matches = [];
    let match;
    
    while ((match = segmentRegex.exec(chatHistory)) !== null) {
      matches.push({
        role: match[1].replace(':', '').trim(),
        text: match[2].trim()
      });
    }
    
    return matches;
  }

  /**
   * Split chat format history into segments
   */
  splitChatSegments(chatHistory) {
    return chatHistory.map(entry => ({
      role: entry.role.toUpperCase(),
      text: Array.isArray(entry.content) ? 
        entry.content.map(item => item.type === 'text' ? item.text : '').join(' ') : 
        entry.content
    }));
  }

  /**
   * Count tokens in a simple text string
   */
  countTokens(text, model = 'gpt-4o') {
    const encoder = this.getEncoder(model);
    const tokens = encoder.encode(text);
    return tokens.length;
  }

  /**
   * Count tokens in a message array (for chat completion format)
   */
  countMessageTokens(messages, model = 'gpt-4o') {
    let totalTokens = 0;
    
    for (const message of messages) {
      // Count tokens for role
      totalTokens += this.countTokens(message.role, model);
      
      // Count tokens for content
      if (typeof message.content === 'string') {
        totalTokens += this.countTokens(message.content, model);
      } else if (Array.isArray(message.content)) {
        for (const item of message.content) {
          if (item.type === 'text') {
            totalTokens += this.countTokens(item.text, model);
          }
          // Images typically count as ~85 tokens for GPT-4 vision
          else if (item.type === 'image_url') {
            totalTokens += 85;
          }
        }
      }
      
      // Add overhead tokens per message (varies by model)
      totalTokens += this.getMessageOverhead(model);
    }
    
    return totalTokens;
  }

  /**
   * Get message overhead tokens (formatting tokens added per message)
   */
  getMessageOverhead(model) {
    // These are approximate values based on OpenAI documentation
    if (model.includes('gpt-4')) {
      return 3; // Each message has ~3 tokens of overhead
    } else if (model.includes('gpt-3.5')) {
      return 4; // GPT-3.5 has slightly more overhead
    } else {
      return 3; // Default
    }
  }

  /**
   * Estimate tokens for models that don't have tiktoken support
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Get appropriate token counting method for a model
   */
  async getTokensForModel(content, modelId) {
    if (modelId.startsWith('gpt') || modelId.includes('o1') || modelId.includes('o3')) {
      // Use tiktoken for OpenAI models
      if (Array.isArray(content)) {
        return this.countMessageTokens(content, modelId);
      } else {
        return this.countTokens(content, modelId);
      }
    } else if (modelId.startsWith('claude')) {
      // Claude token counting (approximate)
      const text = Array.isArray(content) ? 
        content.map(msg => msg.content).join(' ') : content;
      return this.estimateTokens(text);
    } else if (modelId.startsWith('gemini')) {
      // Gemini token counting (approximate)  
      const text = Array.isArray(content) ? 
        content.map(msg => msg.content).join(' ') : content;
      return this.estimateTokens(text);
    } else {
      // Default estimation for other models
      const text = Array.isArray(content) ? 
        content.map(msg => msg.content).join(' ') : content;
      return this.estimateTokens(text);
    }
  }

  /**
   * Setup periodic cache cleanup
   */
  setupCacheCleanup() {
    // Clean token cache every 30 minutes
    setInterval(() => {
      this.cleanupTokenCache();
    }, 30 * 60 * 1000);
  }

  /**
   * Clean up token cache to prevent memory leaks
   */
  cleanupTokenCache() {
    const maxAge = 60 * 60 * 1000; // 1 hour
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.tokenCache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.tokenCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired token cache entries`);
    }
  }

  /**
   * Get cache key for token counting
   */
  getCacheKey(text, model, type) {
    const textHash = this.simpleHash(text);
    return `${model}:${type}:${textHash}`;
  }

  /**
   * Simple hash function for cache keys
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Count tokens with caching
   */
  countTokensWithCache(text, model = 'gpt-4o') {
    const cacheKey = this.getCacheKey(text, model, 'simple');
    
    // Check cache first
    const cached = this.tokenCache.get(cacheKey);
    if (cached) {
      this.cacheHits++;
      return cached.tokens;
    }

    this.cacheMisses++;
    
    // Calculate tokens
    const encoder = this.getEncoder(model);
    const tokens = encoder.encode(text);
    const tokenCount = tokens.length;

    // Cache result
    this.tokenCache.set(cacheKey, {
      tokens: tokenCount,
      timestamp: Date.now()
    });

    return tokenCount;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      encoderCacheSize: this.encoderCache.size,
      tokenCacheSize: this.tokenCache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: this.cacheHits + this.cacheMisses > 0 ? 
        (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100 : 0
    };
  }

  /**
   * Cleanup cached encoders
   */
  cleanup() {
    for (const encoder of this.encoderCache.values()) {
      try {
        encoder.free();
      } catch (error) {
        this.logger.warn('Error freeing encoder:', error.message);
      }
    }
    this.encoderCache.clear();
    this.tokenCache.clear();
    this.logger.info('Token service cleanup completed');
  }

  /**
   * Health check for token service
   */
  healthCheck() {
    const stats = this.getCacheStats();
    return {
      status: 'healthy',
      cacheStats: stats,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const tokenService = new TokenService();

module.exports = tokenService;