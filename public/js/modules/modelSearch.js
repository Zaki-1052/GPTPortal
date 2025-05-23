// Model Search and Filtering Module
// Handles model searching, filtering, and categorization

class ModelSearchManager {
  constructor() {
    this.searchQuery = '';
    this.showOpenRouter = false;
    this.searchHistory = [];
    this.maxHistorySize = 10;
    this.searchDebounceTime = 300;
    this.searchTimeout = null;
    
    // Bind methods to maintain context
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleOpenRouterToggle = this.handleOpenRouterToggle.bind(this);
  }

  /**
   * Initialize search functionality
   * @param {Object} modelManager - Reference to the main model manager
   */
  initialize(modelManager) {
    this.modelManager = modelManager;
    this.bindEvents();
    console.log('Model search manager initialized');
  }

  /**
   * Bind search-related event handlers
   */
  bindEvents() {
    // Model search input
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
      console.log('Binding search input events');
      searchInput.addEventListener('input', this.handleSearchInput);
      searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
    }

    // OpenRouter toggle
    const openRouterToggle = document.getElementById('show-open-router');
    if (openRouterToggle) {
      console.log('Binding OpenRouter toggle events');
      openRouterToggle.addEventListener('change', this.handleOpenRouterToggle);
    }
  }

  /**
   * Handle search input with debouncing
   * @param {Event} event - Input event
   */
  handleSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, this.searchDebounceTime);
  }

  /**
   * Handle keyboard shortcuts in search
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleSearchKeydown(event) {
    if (event.key === 'Escape') {
      event.target.value = '';
      this.performSearch('');
      event.target.blur();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const firstResult = this.getFirstSearchResult();
      if (firstResult && this.modelManager) {
        this.modelManager.selectModel(firstResult.id);
        event.target.blur();
      }
    }
  }

  /**
   * Handle OpenRouter toggle change
   * @param {Event} event - Change event
   */
  handleOpenRouterToggle(event) {
    this.showOpenRouter = event.target.checked;
    console.log('OpenRouter models', this.showOpenRouter ? 'enabled' : 'disabled');
    
    if (this.modelManager) {
      this.modelManager.filterModels();
    }
    
    // Store preference
    this.storePreference('showOpenRouter', this.showOpenRouter);
  }

  /**
   * Perform search operation
   * @param {string} query - Search query
   */
  performSearch(query) {
    this.searchQuery = query;
    
    // Add to search history if it's a meaningful query
    if (query.length > 2 && !this.searchHistory.includes(query)) {
      this.addToSearchHistory(query);
    }
    
    console.log('Performing search:', query);
    
    if (this.modelManager) {
      this.modelManager.filterModels();
    }
  }

  /**
   * Add query to search history
   * @param {string} query - Search query to add
   */
  addToSearchHistory(query) {
    this.searchHistory.unshift(query);
    
    // Limit history size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }
    
    this.storePreference('searchHistory', this.searchHistory);
  }

  /**
   * Get current search query
   * @returns {string} Current search query
   */
  getSearchQuery() {
    return this.searchQuery;
  }

  /**
   * Get OpenRouter visibility setting
   * @returns {boolean} Whether OpenRouter models should be shown
   */
  getShowOpenRouter() {
    return this.showOpenRouter;
  }

  /**
   * Set search query programmatically
   * @param {string} query - Search query to set
   */
  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase().trim();
    
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
      searchInput.value = query;
    }
    
    if (this.modelManager) {
      this.modelManager.filterModels();
    }
  }

  /**
   * Set OpenRouter visibility
   * @param {boolean} show - Whether to show OpenRouter models
   */
  setShowOpenRouter(show) {
    this.showOpenRouter = show;
    
    const openRouterToggle = document.getElementById('show-open-router');
    if (openRouterToggle) {
      openRouterToggle.checked = show;
    }
    
    if (this.modelManager) {
      this.modelManager.filterModels();
    }
    
    this.storePreference('showOpenRouter', show);
  }

  /**
   * Check if a model should be shown based on current filters
   * @param {Object} model - Model object to check
   * @returns {boolean} Whether model should be shown
   */
  shouldShowModel(model) {
    // Search filter
    if (this.searchQuery) {
      const searchableText = this.getSearchableText(model);
      if (!searchableText.includes(this.searchQuery)) {
        return false;
      }
    }

    // OpenRouter filter
    if (!this.showOpenRouter && model.source === 'openrouter') {
      return false;
    }

    return true;
  }

  /**
   * Get searchable text for a model
   * @param {Object} model - Model object
   * @returns {string} Searchable text
   */
  getSearchableText(model) {
    return [
      model.name || '',
      model.description || '',
      model.id || '',
      model.provider || '',
      model.category || ''
    ].join(' ').toLowerCase();
  }

  /**
   * Search models and return results
   * @param {Object} models - Models object to search
   * @param {string} query - Search query (optional, uses current query if not provided)
   * @returns {Object} Filtered models
   */
  searchModels(models, query = null) {
    const searchQuery = query !== null ? query.toLowerCase().trim() : this.searchQuery;
    
    if (!searchQuery) {
      return models;
    }
    
    const results = {};
    
    Object.entries(models).forEach(([id, model]) => {
      const searchableText = this.getSearchableText(model);
      
      if (searchableText.includes(searchQuery)) {
        results[id] = {
          ...model,
          searchScore: this.calculateSearchScore(model, searchQuery)
        };
      }
    });
    
    return results;
  }

  /**
   * Calculate search relevance score
   * @param {Object} model - Model object
   * @param {string} query - Search query
   * @returns {number} Search score (higher is more relevant)
   */
  calculateSearchScore(model, query) {
    let score = 0;
    
    // Exact name match gets highest score
    if (model.name && model.name.toLowerCase().includes(query)) {
      score += 100;
      if (model.name.toLowerCase().startsWith(query)) {
        score += 50;
      }
    }
    
    // ID match gets high score
    if (model.id && model.id.toLowerCase().includes(query)) {
      score += 80;
      if (model.id.toLowerCase().startsWith(query)) {
        score += 40;
      }
    }
    
    // Provider match
    if (model.provider && model.provider.toLowerCase().includes(query)) {
      score += 30;
    }
    
    // Description match
    if (model.description && model.description.toLowerCase().includes(query)) {
      score += 20;
    }
    
    // Category match
    if (model.category && model.category.toLowerCase().includes(query)) {
      score += 10;
    }
    
    return score;
  }

  /**
   * Get first search result (for Enter key handling)
   * @returns {Object|null} First search result or null
   */
  getFirstSearchResult() {
    if (!this.modelManager || !this.modelManager.models) {
      return null;
    }
    
    const searchResults = this.searchModels(this.modelManager.models);
    const sortedResults = Object.values(searchResults)
      .filter(model => this.shouldShowModel(model))
      .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
    
    return sortedResults.length > 0 ? sortedResults[0] : null;
  }

  /**
   * Get search suggestions based on partial query
   * @param {string} partialQuery - Partial search query
   * @param {number} maxSuggestions - Maximum number of suggestions
   * @returns {Array} Array of search suggestions
   */
  getSearchSuggestions(partialQuery, maxSuggestions = 5) {
    if (!this.modelManager || !this.modelManager.models || partialQuery.length < 2) {
      return [];
    }
    
    const query = partialQuery.toLowerCase();
    const suggestions = new Set();
    
    Object.values(this.modelManager.models).forEach(model => {
      // Add model name suggestions
      if (model.name && model.name.toLowerCase().includes(query)) {
        suggestions.add(model.name);
      }
      
      // Add provider suggestions
      if (model.provider && model.provider.toLowerCase().includes(query)) {
        suggestions.add(model.provider);
      }
      
      // Add category suggestions
      if (model.category && model.category.toLowerCase().includes(query)) {
        suggestions.add(model.category);
      }
    });
    
    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Clear current search
   */
  clearSearch() {
    this.searchQuery = '';
    
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
      searchInput.value = '';
    }
    
    if (this.modelManager) {
      this.modelManager.filterModels();
    }
  }

  /**
   * Get search history
   * @returns {Array} Search history array
   */
  getSearchHistory() {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  clearSearchHistory() {
    this.searchHistory = [];
    this.storePreference('searchHistory', []);
  }

  /**
   * Store user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  storePreference(key, value) {
    try {
      const preferences = JSON.parse(localStorage.getItem('modelSearchPreferences') || '{}');
      preferences[key] = value;
      localStorage.setItem('modelSearchPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to store search preference:', error);
    }
  }

  /**
   * Load user preferences
   */
  loadPreferences() {
    try {
      const preferences = JSON.parse(localStorage.getItem('modelSearchPreferences') || '{}');
      
      if (preferences.showOpenRouter !== undefined) {
        this.setShowOpenRouter(preferences.showOpenRouter);
      }
      
      if (preferences.searchHistory && Array.isArray(preferences.searchHistory)) {
        this.searchHistory = preferences.searchHistory.slice(0, this.maxHistorySize);
      }
      
      console.log('Loaded search preferences:', preferences);
    } catch (error) {
      console.warn('Failed to load search preferences:', error);
    }
  }

  /**
   * Get advanced search operators
   * @returns {Object} Map of search operators and their descriptions
   */
  getSearchOperators() {
    return {
      'provider:': 'Search by provider (e.g., provider:openai)',
      'category:': 'Search by category (e.g., category:gpt)',
      'source:': 'Search by source (e.g., source:core)',
      'vision:': 'Search by vision support (e.g., vision:true)',
      'function:': 'Search by function support (e.g., function:true)'
    };
  }

  /**
   * Parse advanced search query
   * @param {string} query - Search query with potential operators
   * @returns {Object} Parsed search criteria
   */
  parseAdvancedSearch(query) {
    const criteria = {
      text: '',
      provider: null,
      category: null,
      source: null,
      hasVision: null,
      hasFunction: null
    };
    
    const operators = this.getSearchOperators();
    let remainingQuery = query;
    
    Object.keys(operators).forEach(operator => {
      const regex = new RegExp(`${operator.replace(':', '\\:')}(\\S+)`, 'gi');
      const matches = remainingQuery.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const value = match.split(':')[1];
          const key = operator.replace(':', '');
          
          switch (key) {
            case 'provider':
              criteria.provider = value.toLowerCase();
              break;
            case 'category':
              criteria.category = value.toLowerCase();
              break;
            case 'source':
              criteria.source = value.toLowerCase();
              break;
            case 'vision':
              criteria.hasVision = value.toLowerCase() === 'true';
              break;
            case 'function':
              criteria.hasFunction = value.toLowerCase() === 'true';
              break;
          }
          
          remainingQuery = remainingQuery.replace(match, '');
        });
      }
    });
    
    criteria.text = remainingQuery.trim().toLowerCase();
    return criteria;
  }

  /**
   * Apply advanced search criteria to models
   * @param {Object} models - Models to search
   * @param {Object} criteria - Search criteria from parseAdvancedSearch
   * @returns {Object} Filtered models
   */
  applyAdvancedSearch(models, criteria) {
    const results = {};
    
    Object.entries(models).forEach(([id, model]) => {
      let matches = true;
      
      // Check text criteria
      if (criteria.text) {
        const searchableText = this.getSearchableText(model);
        if (!searchableText.includes(criteria.text)) {
          matches = false;
        }
      }
      
      // Check provider criteria
      if (criteria.provider && model.provider !== criteria.provider) {
        matches = false;
      }
      
      // Check category criteria
      if (criteria.category && model.category !== criteria.category) {
        matches = false;
      }
      
      // Check source criteria
      if (criteria.source && model.source !== criteria.source) {
        matches = false;
      }
      
      // Check vision support criteria
      if (criteria.hasVision !== null && Boolean(model.supportsVision) !== criteria.hasVision) {
        matches = false;
      }
      
      // Check function support criteria
      if (criteria.hasFunction !== null && Boolean(model.supportsFunction) !== criteria.hasFunction) {
        matches = false;
      }
      
      if (matches) {
        results[id] = model;
      }
    });
    
    return results;
  }

  /**
   * Cleanup search manager
   */
  cleanup() {
    // Clear timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    
    // Remove event listeners
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
      searchInput.removeEventListener('input', this.handleSearchInput);
      searchInput.removeEventListener('keydown', this.handleSearchKeydown);
    }
    
    const openRouterToggle = document.getElementById('show-open-router');
    if (openRouterToggle) {
      openRouterToggle.removeEventListener('change', this.handleOpenRouterToggle);
    }
    
    // Clear references
    this.modelManager = null;
    this.searchQuery = '';
    this.showOpenRouter = false;
    
    console.log('Model search manager cleaned up');
  }
}

// Export for use in other modules
window.ModelSearchManager = ModelSearchManager;