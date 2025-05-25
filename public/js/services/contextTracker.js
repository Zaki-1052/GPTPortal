// Context Tracker - Frontend service for tracking context window usage
class ContextTracker {
  constructor() {
    this.conversationHistory = [];
    this.currentModel = null;
    this.contextCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Bind methods
    this.updateIndicator = this.updateIndicator.bind(this);
  }

  /**
   * Initialize the context tracker
   * @param {Object} chatManager - Chat manager instance
   * @param {Object} modelConfig - Model configuration instance
   */
  initialize(chatManager, modelConfig) {
    this.chatManager = chatManager;
    this.modelConfig = modelConfig;
    
    // Set up event listeners for model changes
    if (this.modelConfig) {
      this.currentModel = this.modelConfig.currentModelID;
    }
    
    console.log('Context tracker initialized');
  }

  /**
   * Get context window limit for a model from server
   * @param {string} modelId - Model identifier
   * @returns {Promise<number>} Context window size
   */
  async getContextWindow(modelId) {
    try {
      // Check cache first
      const cached = this.getCachedContextWindow(modelId);
      if (cached !== null) {
        return cached;
      }

      // Fetch from server API
      const response = await fetch(`/api/models/${encodeURIComponent(modelId)}/context-window`);
      if (response.ok) {
        const data = await response.json();
        const contextWindow = data.contextWindow || this.getContextWindowFallback(modelId);
        
        // Cache the result
        this.setCachedContextWindow(modelId, contextWindow);
        return contextWindow;
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to fetch context window from server, using fallback:', error);
      return this.getContextWindowFallback(modelId);
    }
  }

  /**
   * Get cached context window
   * @param {string} modelId - Model identifier
   * @returns {number|null} Cached context window or null
   */
  getCachedContextWindow(modelId) {
    const cached = this.contextCache.get(modelId);
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
    this.contextCache.set(modelId, {
      contextWindow,
      timestamp: Date.now()
    });
  }

  /**
   * Fallback context window calculation (client-side)
   * @param {string} modelId - Model identifier
   * @returns {number} Context window size
   */
  getContextWindowFallback(modelId) {
    // This is a fallback - prefer server-side data
    const limits = {
      'gpt-4o': 128000,
      'gpt-4o-mini': 128000,
      'gpt-4-turbo': 128000,
      'gpt-4.1': 128000,
      'gpt-4.1-mini': 128000,
      'gpt-4.1-nano': 128000,
      'gpt-4': 8192,
      'claude-opus-4-20250514': 200000,
      'claude-sonnet-4-20250514': 200000,
      'claude-3-7-sonnet-latest': 200000,
      'claude-3-5-sonnet-latest': 200000,
      'claude-3-5-haiku-latest': 200000,
      'claude-3-haiku-20240307': 200000,
      'gemini-1.5-pro': 2000000,
      'gemini-2.5-pro-preview-05-06': 2000000,
      'gemini-1.5-flash': 1000000,
      'gemini-2.0-flash-exp': 1000000,
      'gemini-2.5-flash-preview-05-20': 1000000,
      'gemini-1.5-flash-8b': 1000000,
      'gemini-pro': 30720,
      'deepseek-reasoner': 64000,
      'deepseek-chat': 64000,
      'o1-preview': 128000,
      'o1-mini': 128000,
      'o3-mini': 128000,
      'o3': 128000,
      'o4-mini': 128000
    };

    // Check for exact match first
    if (limits[modelId]) {
      return limits[modelId];
    }

    // Pattern matching
    if (modelId.includes('claude')) {
      return 200000;
    } else if (modelId.includes('gemini-1.5-pro') || modelId.includes('gemini-2.5-pro')) {
      return 2000000;
    } else if (modelId.includes('gemini')) {
      return 1000000;
    } else if (modelId.includes('deepseek')) {
      return 64000;
    } else if (modelId.includes('gpt-4o') || modelId.includes('o1') || modelId.includes('o3') || modelId.includes('gpt-4.1')) {
      return 128000;
    } else if (modelId.includes('gpt-4')) {
      return 8192;
    }

    // Default fallback
    return 8000;
  }

  /**
   * Estimate tokens in text (client-side estimation)
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // Simple token estimation (approximately 4 characters per token for English)
    const baseTokens = Math.ceil(text.length / 4);
    
    // Add extra tokens for special characters and formatting
    const specialChars = (text.match(/[{}[\](),.;:!?'"]/g) || []).length;
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length * 10;
    
    return baseTokens + Math.ceil(specialChars / 2) + codeBlocks;
  }

  /**
   * Estimate conversation tokens
   * @returns {number} Estimated token count for conversation
   */
  estimateConversationTokens() {
    let totalTokens = 0;
    
    // Get conversation history from chat manager
    const history = this.chatManager ? this.chatManager.conversationHistory : this.conversationHistory;
    
    // Estimate tokens from conversation history
    for (const message of history) {
      if (typeof message.content === 'string') {
        totalTokens += this.estimateTokens(message.content);
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.text) {
            totalTokens += this.estimateTokens(part.text);
          }
        }
      }
      // Add some overhead for message structure
      totalTokens += 10;
    }
    
    // Add system message overhead
    totalTokens += 200; // Estimated system message tokens
    
    return totalTokens;
  }

  /**
   * Update the context indicator in the UI
   * @param {string} [currentInput] - Current input text
   */
  async updateIndicator(currentInput = '') {
    const contextUsed = document.getElementById('context-used');
    const contextLimit = document.getElementById('context-limit');
    const contextFill = document.getElementById('context-fill');
    
    if (!contextUsed || !contextLimit || !contextFill) {
      console.warn('Context indicator elements not found');
      return;
    }
    
    try {
      // Get current model
      const modelId = this.currentModel || (this.modelConfig ? this.modelConfig.currentModelID : 'gpt-4o');
      
      // Get context limit
      const contextWindow = await this.getContextWindow(modelId);
      
      // Calculate current usage
      const conversationTokens = this.estimateConversationTokens();
      const currentInputTokens = this.estimateTokens(currentInput);
      const totalTokens = conversationTokens + currentInputTokens;
      
      // Update display
      contextUsed.textContent = totalTokens.toLocaleString();
      contextLimit.textContent = contextWindow.toLocaleString();
      
      // Update progress bar
      const percentage = Math.min((totalTokens / contextWindow) * 100, 100);
      contextFill.style.width = `${percentage}%`;
      
      // Update color based on usage
      contextFill.className = 'context-fill';
      if (percentage < 25) {
        contextFill.classList.add('low');
      } else if (percentage < 50) {
        contextFill.classList.add('medium');
      } else if (percentage < 80) {
        contextFill.classList.add('high');
      } else {
        contextFill.classList.add('critical');
      }
      
    } catch (error) {
      console.error('Error updating context indicator:', error);
    }
  }

  /**
   * Update current model
   * @param {string} modelId - New model identifier
   */
  setCurrentModel(modelId) {
    this.currentModel = modelId;
    // Update indicator when model changes
    this.updateIndicator();
  }

  /**
   * Update conversation history
   * @param {Array} history - New conversation history
   */
  updateConversationHistory(history) {
    this.conversationHistory = history;
    this.updateIndicator();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.contextCache.clear();
  }
}

// Export for use in other modules
window.ContextTracker = ContextTracker;