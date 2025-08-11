// Model UI Management Module
// Handles model selector UI, dropdowns, and visual interactions

class ModelUIManager {
  constructor() {
    this.dropdownVisible = false;
    this.animationDuration = 300;
    this.tooltips = new Map();
    this.eventsBound = false;
    
    // Category collapse states
    this.collapsedCategories = new Set();
    
    // Bind methods to maintain context
    this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  /**
   * Initialize UI manager
   * @param {Object} modelManager - Reference to the main model manager
   */
  initialize(modelManager) {
    this.modelManager = modelManager;
    this.loadUIPreferences();
    this.bindEvents();
    this.setupDropdownStyling();
    console.log('Model UI manager initialized');
  }

  /**
   * Bind UI-related event handlers
   */
  bindEvents() {
    if (this.eventsBound) {
      console.log('UI events already bound, skipping...');
      return;
    }
    this.eventsBound = true;

    // Model dropdown toggle
    const selectedModel = document.getElementById('selected-model');
    if (selectedModel) {
      selectedModel.addEventListener('click', this.handleDropdownToggle);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick);

    // Refresh button
    const refreshButton = document.getElementById('refresh-models');
    if (refreshButton) {
      refreshButton.addEventListener('click', this.handleRefreshClick.bind(this));
    }

    console.log('Model UI events bound successfully');
  }

  /**
   * Handle dropdown toggle
   * @param {Event} event - Click event
   */
  handleDropdownToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const modelOptions = document.getElementById('model-options');
    if (!modelOptions) return;
    
    // Check computed style, not just inline style
    const computedStyle = window.getComputedStyle(modelOptions);
    const currentDisplay = computedStyle.display;
    const isVisible = currentDisplay === 'block';
    
    console.log('Dropdown toggle - Current display:', currentDisplay, 'Is visible:', isVisible);
    
    if (isVisible) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  /**
   * Handle clicks outside the dropdown
   * @param {Event} event - Click event
   */
  handleOutsideClick(event) {
    if (!event.target.closest('#model-selector-container')) {
      this.hideDropdown();
    }
  }

  /**
   * Handle refresh button click
   * @param {Event} event - Click event
   */
  handleRefreshClick(event) {
    if (this.modelManager && this.modelManager.refreshModels) {
      this.showRefreshAnimation(event.target);
      this.modelManager.refreshModels();
    }
  }

  /**
   * Show the model dropdown
   */
  showDropdown() {
    const modelOptions = document.getElementById('model-options');
    const searchInput = document.getElementById('model-search');
    
    if (!modelOptions) return;
    
    // Reset search when opening dropdown
    if (searchInput && this.modelManager && this.modelManager.searchManager) {
      searchInput.value = '';
      this.modelManager.searchManager.clearSearch();
    }
    
    modelOptions.style.display = 'block';
    this.dropdownVisible = true;
    
    // Add animation class if supported
    modelOptions.classList.add('dropdown-opening');
    
    // Focus search input after animation
    setTimeout(() => {
      if (searchInput) {
        searchInput.focus();
      }
      modelOptions.classList.remove('dropdown-opening');
    }, 100);
    
    console.log('Dropdown shown');
  }

  /**
   * Hide the model dropdown
   */
  hideDropdown() {
    const modelOptions = document.getElementById('model-options');
    if (!modelOptions) return;
    
    // Add closing animation
    modelOptions.classList.add('dropdown-closing');
    
    setTimeout(() => {
      modelOptions.style.display = 'none';
      modelOptions.classList.remove('dropdown-closing');
      this.dropdownVisible = false;
    }, this.animationDuration);
    
    // Clear any active tooltips
    this.clearAllTooltips();
    
    console.log('Dropdown hidden');
  }

  /**
   * Check if dropdown is visible
   * @returns {boolean} Whether dropdown is visible
   */
  isDropdownVisible() {
    return this.dropdownVisible;
  }

  /**
   * Setup dropdown styling and positioning
   */
  setupDropdownStyling() {
    const modelSelector = document.getElementById('model-selector-container');
    const modelOptions = document.getElementById('model-options');
    
    if (modelSelector && modelOptions) {
      // Ensure container has proper positioning
      modelSelector.style.position = 'relative';
      
      // Enhanced dropdown styling
      Object.assign(modelOptions.style, {
        backgroundColor: '#2a2a2a',
        border: '1px solid #555',
        borderRadius: '5px',
        zIndex: '1000',
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '10px',
        display: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: `opacity ${this.animationDuration}ms ease-in-out`
      });
      
      console.log('Dropdown styling configured');
    }
  }

  /**
   * Populate model selector with enhanced UI
   * @param {Object} models - Models to display
   * @param {Object} categories - Model categories
   */
  populateModelSelector(models, categories) {
    const modelOptions = document.getElementById('model-options');
    if (!modelOptions) {
      console.warn('Model options container not found');
      return;
    }
    
    if (!models || Object.keys(models).length === 0) {
      this.showNoModelsMessage(modelOptions);
      return;
    }
    
    console.log(`Populating model selector with ${Object.keys(models).length} models`);
    
    // Clear existing content
    modelOptions.innerHTML = '';
    
    // Group models by category
    const groupedModels = this.groupModelsByCategory(models);
    
    // Create category sections
    Object.entries(groupedModels).forEach(([categoryKey, category]) => {
      if (category.models.length === 0) return;
      
      const categoryElement = this.createCategoryElement(categoryKey, category);
      modelOptions.appendChild(categoryElement);
    });
    
    // If no visible models, show message
    if (modelOptions.children.length === 0) {
      this.showNoModelsMessage(modelOptions);
    }
    
    console.log(`Created ${modelOptions.children.length} category sections`);
  }

  /**
   * Group models by category for UI display
   * @param {Object} models - Models to group
   * @returns {Object} Grouped models by category
   */
  groupModelsByCategory(models) {
    const grouped = {};
    
    Object.values(models).forEach(model => {
      const category = model.category || 'other';
      
      if (!grouped[category]) {
        grouped[category] = {
          name: this.getCategoryDisplayName(category),
          models: []
        };
      }
      
      // Apply search and filter logic
      if (this.shouldShowModel(model)) {
        grouped[category].models.push(model);
      }
    });
    
    // Sort models within each category using custom ordering
    Object.entries(grouped).forEach(([categoryKey, category]) => {
      category.models.sort((a, b) => {
        // Sort by search score if available, then by custom order
        const scoreA = a.searchScore || 0;
        const scoreB = b.searchScore || 0;
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score first
        }
        
        return this.getCustomModelOrder(a.id, categoryKey) - this.getCustomModelOrder(b.id, categoryKey);
      });
    });
    
    return grouped;
  }

  /**
   * Check if model should be shown (delegates to search manager)
   * @param {Object} model - Model to check
   * @returns {boolean} Whether model should be shown
   */
  shouldShowModel(model) {
    if (this.modelManager && this.modelManager.searchManager) {
      return this.modelManager.searchManager.shouldShowModel(model);
    }
    return true; // Show all models if no search manager
  }

  /**
   * Create category element with models
   * @param {string} categoryKey - Category identifier
   * @param {Object} category - Category data
   * @returns {HTMLElement} Category element
   */
  createCategoryElement(categoryKey, category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'model-category';
    categoryDiv.dataset.category = categoryKey;
    
    // Create category header
    const categoryHeader = this.createCategoryHeader(categoryKey, category.name);
    categoryDiv.appendChild(categoryHeader);
    
    // Create collapsible models container
    const modelsContainer = this.createModelsContainer(category.models);
    categoryDiv.appendChild(modelsContainer);
    
    // Set initial collapse state
    const isCollapsed = this.collapsedCategories.has(categoryKey);
    if (isCollapsed) {
      this.setCategoryCollapsed(categoryDiv, true);
    }
    
    // Hide OpenRouter categories if toggle is off
    if (this.isOpenRouterCategory(categoryKey) && !this.getShowOpenRouter()) {
      categoryDiv.style.display = 'none';
    }
    
    return categoryDiv;
  }

  /**
   * Create category header with toggle functionality
   * @param {string} categoryKey - Category identifier
   * @param {string} categoryName - Display name for category
   * @returns {HTMLElement} Category header element
   */
  createCategoryHeader(categoryKey, categoryName) {
    const categoryHeader = document.createElement('h4');
    categoryHeader.className = 'category-header';
    categoryHeader.dataset.category = categoryKey;
    
    const arrow = document.createElement('span');
    arrow.className = 'category-arrow';
    arrow.innerHTML = '▼';
    arrow.style.cssText = 'transition: transform 0.2s ease; margin-right: 8px; font-size: 12px;';
    
    const title = document.createElement('span');
    title.textContent = categoryName;
    
    categoryHeader.appendChild(arrow);
    categoryHeader.appendChild(title);
    
    // Styling
    categoryHeader.style.cssText = `
      margin: 10px 0 5px 0;
      padding: 8px 12px;
      background-color: #404245;
      border-radius: 3px;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      transition: background-color 0.2s ease;
    `;
    
    // Add hover effects
    categoryHeader.addEventListener('mouseenter', () => {
      categoryHeader.style.backgroundColor = '#505355';
    });
    
    categoryHeader.addEventListener('mouseleave', () => {
      categoryHeader.style.backgroundColor = '#404245';
    });
    
    // Add click handler for collapse/expand
    categoryHeader.addEventListener('click', () => {
      this.toggleCategoryCollapse(categoryKey);
    });
    
    return categoryHeader;
  }

  /**
   * Create models container
   * @param {Array} models - Array of models
   * @returns {HTMLElement} Models container element
   */
  createModelsContainer(models) {
    const modelsContainer = document.createElement('div');
    modelsContainer.className = 'models-container';
    modelsContainer.style.cssText = `
      overflow: hidden;
      transition: max-height 0.3s ease-out;
      max-height: 1000px;
    `;
    
    // Add models to container
    models.forEach(model => {
      const button = this.createModelButton(model);
      modelsContainer.appendChild(button);
    });
    
    return modelsContainer;
  }

  /**
   * Create model button with enhanced features
   * @param {Object} model - Model data
   * @returns {HTMLElement} Model button element
   */
  createModelButton(model) {
    const button = document.createElement('button');
    button.id = this.generateButtonId(model.id);
    button.className = model.source === 'core' ? 'standard-model' : 'openrouter-model';
    button.setAttribute('data-value', model.id);
    
    // Button content
    const buttonContent = this.createButtonContent(model);
    button.appendChild(buttonContent);
    
    // Enhanced styling
    button.style.cssText = `
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      margin: 2px 0;
      background-color: #303134;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      position: relative;
      overflow: hidden;
    `;
    
    // Add click handler
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectModel(model.id);
    });
    
    // Add hover effects
    this.addButtonHoverEffects(button);
    
    // Add tooltip if description exists
    if (model.description) {
      this.addTooltipToButton(button, model);
    }
    
    return button;
  }

  /**
   * Create button content with badges and indicators
   * @param {Object} model - Model data
   * @returns {HTMLElement} Button content container
   */
  createButtonContent(model) {
    const content = document.createElement('div');
    content.style.cssText = 'display: flex; justify-content: space-between; align-items: center; width: 100%;';
    
    // Model name
    const nameSpan = document.createElement('span');
    nameSpan.textContent = model.name || model.id;
    nameSpan.style.cssText = 'flex: 1; margin-right: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    content.appendChild(nameSpan);
    
    // Badges container
    const badgesContainer = document.createElement('div');
    badgesContainer.style.cssText = 'display: flex; gap: 4px; align-items: center; flex-shrink: 0;';
    
    // Provider badge
    if (model.provider) {
      const providerBadge = this.createBadge(model.provider.toUpperCase(), '#555');
      badgesContainer.appendChild(providerBadge);
    }
    
    // Feature badges
    if (model.supportsVision) {
      const visionBadge = this.createBadge('👁️', '#2196F3', 'Vision Support');
      badgesContainer.appendChild(visionBadge);
    }
    
    if (model.supportsFunction) {
      const functionBadge = this.createBadge('⚙️', '#4CAF50', 'Function Calling');
      badgesContainer.appendChild(functionBadge);
    }
    
    if (model.supportsImageGeneration) {
      const imageBadge = this.createBadge('🎨', '#FF9800', 'Image Generation');
      badgesContainer.appendChild(imageBadge);
    }
    
    if (model.supportsSpeechToText) {
      const speechBadge = this.createBadge('🎙️', '#9C27B0', 'Speech to Text');
      badgesContainer.appendChild(speechBadge);
    }
    
    if (model.supportsTextToSpeech) {
      const ttsBadge = this.createBadge('🔊', '#E91E63', 'Text to Speech');
      badgesContainer.appendChild(ttsBadge);
    }
    
    content.appendChild(badgesContainer);
    
    return content;
  }

  /**
   * Create a badge element
   * @param {string} text - Badge text
   * @param {string} color - Badge background color
   * @param {string} title - Tooltip title
   * @returns {HTMLElement} Badge element
   */
  createBadge(text, color, title = '') {
    const badge = document.createElement('span');
    badge.textContent = text;
    badge.title = title;
    badge.style.cssText = `
      font-size: 10px;
      background-color: ${color};
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 2px;
      white-space: nowrap;
    `;
    return badge;
  }

  /**
   * Add hover effects to button
   * @param {HTMLElement} button - Button element
   */
  addButtonHoverEffects(button) {
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#505355';
      button.style.transform = 'translateX(2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#303134';
      button.style.transform = 'translateX(0)';
    });
  }

  /**
   * Add tooltip to button
   * @param {HTMLElement} button - Button element
   * @param {Object} model - Model data
   */
  addTooltipToButton(button, model) {
    let tooltip = null;
    
    button.addEventListener('mouseenter', (e) => {
      // Don't show tooltip if dropdown is not visible
      if (!this.dropdownVisible) return;
      
      // Create tooltip
      tooltip = this.createTooltip(model);
      document.body.appendChild(tooltip);
      
      // Position tooltip
      this.positionTooltip(tooltip, button);
      
      // Store tooltip reference
      this.tooltips.set(button, tooltip);
    });
    
    button.addEventListener('mouseleave', () => {
      if (tooltip) {
        this.removeTooltip(tooltip);
        this.tooltips.delete(button);
        tooltip = null;
      }
    });
  }

  /**
   * Create tooltip element
   * @param {Object} model - Model data
   * @returns {HTMLElement} Tooltip element
   */
  createTooltip(model) {
    const tooltip = document.createElement('div');
    tooltip.className = 'model-tooltip';
    
    // Build tooltip content
    let tooltipHTML = `<strong>${model.name || model.id}</strong>`;
    
    if (model.description) {
      tooltipHTML += `<br><span style="color: #ccc;">${model.description}</span>`;
    }
    
    if (model.provider) {
      tooltipHTML += `<br><em>Provider: ${model.provider}</em>`;
    }
    
    if (model.contextWindow) {
      tooltipHTML += `<br><small>Context: ${model.contextWindow.toLocaleString()} tokens</small>`;
    }
    
    if (model.pricing && (model.pricing.input || model.pricing.output)) {
      const inputCost = model.pricing.input ? `$${model.pricing.input}/1M` : 'Free';
      const outputCost = model.pricing.output ? `$${model.pricing.output}/1M` : 'Free';
      tooltipHTML += `<br><small>Cost: ${inputCost} in, ${outputCost} out</small>`;
    }
    
    tooltip.innerHTML = tooltipHTML;
    
    // Tooltip styling
    tooltip.style.cssText = `
      position: absolute;
      background-color: #333;
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      max-width: 300px;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      line-height: 1.4;
      border: 1px solid #555;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    `;
    
    // Fade in tooltip
    setTimeout(() => {
      tooltip.style.opacity = '1';
    }, 10);
    
    return tooltip;
  }

  /**
   * Position tooltip relative to button
   * @param {HTMLElement} tooltip - Tooltip element
   * @param {HTMLElement} button - Button element
   */
  positionTooltip(tooltip, button) {
    const rect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Default position (left of button)
    let left = rect.left - tooltipRect.width - 10;
    let top = rect.top + (rect.height - tooltipRect.height) / 2;
    
    // Ensure tooltip stays on screen
    if (left < 10) {
      // Position to the right if no space on left
      left = rect.right + 10;
    }
    
    if (top < 10) {
      top = 10;
    } else if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10;
    }
    
    tooltip.style.left = `${left + window.scrollX}px`;
    tooltip.style.top = `${top + window.scrollY}px`;
  }

  /**
   * Remove tooltip
   * @param {HTMLElement} tooltip - Tooltip element
   */
  removeTooltip(tooltip) {
    if (tooltip && tooltip.parentNode) {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    }
  }

  /**
   * Clear all active tooltips
   */
  clearAllTooltips() {
    this.tooltips.forEach((tooltip, button) => {
      this.removeTooltip(tooltip);
    });
    this.tooltips.clear();
  }

  /**
   * Select a model and update UI
   * @param {string} modelId - Model ID to select
   */
  selectModel(modelId) {
    if (this.modelManager) {
      this.modelManager.selectModel(modelId);
    }
    this.hideDropdown();
  }

  /**
   * Toggle category collapse state
   * @param {string} categoryKey - Category to toggle
   */
  toggleCategoryCollapse(categoryKey) {
    const categoryElement = document.querySelector(`.model-category[data-category="${categoryKey}"]`);
    if (!categoryElement) return;
    
    const isCollapsed = this.collapsedCategories.has(categoryKey);
    
    if (isCollapsed) {
      this.collapsedCategories.delete(categoryKey);
    } else {
      this.collapsedCategories.add(categoryKey);
    }
    
    this.setCategoryCollapsed(categoryElement, !isCollapsed);
    this.saveUIPreferences();
  }

  /**
   * Set category collapsed state
   * @param {HTMLElement} categoryElement - Category element
   * @param {boolean} collapsed - Whether to collapse
   */
  setCategoryCollapsed(categoryElement, collapsed) {
    const arrow = categoryElement.querySelector('.category-arrow');
    const modelsContainer = categoryElement.querySelector('.models-container');
    
    if (arrow) {
      arrow.style.transform = collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
    }
    
    if (modelsContainer) {
      modelsContainer.style.maxHeight = collapsed ? '0px' : '1000px';
    }
  }

  /**
   * Show no models message
   * @param {HTMLElement} container - Container to show message in
   */
  showNoModelsMessage(container) {
    const noModelsDiv = document.createElement('div');
    noModelsDiv.className = 'no-models-message';
    noModelsDiv.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #888;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <div style="font-size: 16px; margin-bottom: 8px;">No models found</div>
        <div style="font-size: 14px; color: #666;">Try adjusting your search or filters</div>
      </div>
    `;
    container.appendChild(noModelsDiv);
  }

  /**
   * Show refresh animation
   * @param {HTMLElement} button - Refresh button
   */
  showRefreshAnimation(button) {
    const originalText = button.textContent;
    button.textContent = '⏳';
    button.disabled = true;
    button.style.animation = 'spin 1s linear infinite';
    
    // Add CSS for spin animation if not exists
    if (!document.getElementById('refresh-animation-style')) {
      const style = document.createElement('style');
      style.id = 'refresh-animation-style';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.textContent = originalText || '🔄';
      button.disabled = false;
      button.style.animation = '';
    }, 3000);
  }

  /**
   * Get category display name
   * @param {string} category - Category key
   * @returns {string} Display name
   */
  getCategoryDisplayName(category) {
    const displayNames = {
      gpt: 'GPT Models',
      claude: 'Claude Models',
      gemini: 'Gemini Models',
      reasoning: 'Reasoning Models',
      llama: 'LLaMA Models',
      mistral: 'Mistral Models',
      deepseek: 'DeepSeek Models',
      grok: 'Grok Models',
      voice: 'Voice Models',
      image: 'Image Models',
      search: 'Web Search Models',
      other: 'Other Models'
    };
    
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1) + ' Models';
  }

  /**
   * Check if category is OpenRouter-only
   * @param {string} category - Category to check
   * @returns {boolean} Whether category is OpenRouter-only
   */
  isOpenRouterCategory(category) {
    if (!this.modelManager || !this.modelManager.models) return false;
    
    const categoryModels = Object.values(this.modelManager.models).filter(m => m.category === category);
    return categoryModels.length > 0 && categoryModels.every(m => m.source === 'openrouter');
  }

  /**
   * Get OpenRouter visibility setting
   * @returns {boolean} Whether to show OpenRouter models
   */
  getShowOpenRouter() {
    if (this.modelManager && this.modelManager.searchManager) {
      return this.modelManager.searchManager.getShowOpenRouter();
    }
    return false;
  }

  /**
   * Generate consistent button ID
   * @param {string} modelId - Model ID
   * @returns {string} Button ID
   */
  generateButtonId(modelId) {
    return 'model-' + modelId.replace(/[^a-zA-Z0-9]/g, '-');
  }

  /**
   * Load UI preferences from storage
   */
  loadUIPreferences() {
    try {
      const preferences = JSON.parse(localStorage.getItem('modelUIPreferences') || '{}');
      
      if (preferences.collapsedCategories && Array.isArray(preferences.collapsedCategories)) {
        this.collapsedCategories = new Set(preferences.collapsedCategories);
      }
      
      console.log('Loaded UI preferences:', preferences);
    } catch (error) {
      console.warn('Failed to load UI preferences:', error);
    }
  }

  /**
   * Save UI preferences to storage
   */
  saveUIPreferences() {
    try {
      const preferences = {
        collapsedCategories: Array.from(this.collapsedCategories)
      };
      
      localStorage.setItem('modelUIPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save UI preferences:', error);
    }
  }

  /**
   * Cleanup UI manager
   */
  cleanup() {
    // Remove event listeners
    const selectedModel = document.getElementById('selected-model');
    if (selectedModel) {
      selectedModel.removeEventListener('click', this.handleDropdownToggle);
    }
    
    document.removeEventListener('click', this.handleOutsideClick);
    
    const refreshButton = document.getElementById('refresh-models');
    if (refreshButton) {
      refreshButton.removeEventListener('click', this.handleRefreshClick);
    }
    
    // Clear tooltips
    this.clearAllTooltips();
    
    // Reset state
    this.dropdownVisible = false;
    this.eventsBound = false;
    this.collapsedCategories.clear();
    this.modelManager = null;
    
    console.log('Model UI manager cleaned up');
  }

  /**
   * Get custom model order for sorting
   * @param {string} modelId - Model ID
   * @param {string} categoryKey - Category key
   * @returns {number} Sort order (lower numbers come first)
   */
  getCustomModelOrder(modelId, categoryKey) {
    // Define custom ordering for each category
    const categoryOrders = {
      gpt: {
        'gpt-5': 1,
        'gpt-5-mini': 2,
        'gpt-5-nano': 3,
        'gpt-5-chat-latest': 4,
        'gpt-4': 5,
        'gpt-4-turbo': 6,
        'gpt-4o': 7,
        'gpt-4.1': 8,
        'gpt-4o-mini': 9,
        'gpt-4.1-mini': 10,
        'gpt-4.1-nano': 11,
        'gpt-3.5-turbo': 12,
        'gpt-3.5-turbo-0125': 12
      },
      reasoning: {
        'o4-mini': 1,
        'o3': 2,
        'o3-mini': 3,
        'o1-preview': 4,
        'o1-mini': 5
      },
      claude: {
        'claude-opus-4-1-20250805': 1,  // Claude 4.1 Opus (newest)
        'claude-opus-4-20250514': 2,    // Claude 4 Opus (older)
        'claude-4-opus': 2,
        'claude-sonnet-4-20250514': 3,
        'claude-4-sonnet': 3,
        'claude-3-7-sonnet-latest': 4,
        'claude-3.7-sonnet': 4,
        'claude-3-5-sonnet-latest': 5,
        'claude-3-5-sonnet-20241022': 5,
        'claude-3.5-sonnet': 5,
        'claude-3-5-haiku-latest': 6,
        'claude-3-5-haiku-20241022': 6,
        'claude-3.5-haiku': 6,
        'claude-3-haiku-20240307': 7,
        'claude-3-haiku': 7
      },
      gemini: {
        'gemini-2.5-pro': 1,
        'gemini-2.5-flash': 2,
        'gemini-2.0-flash-exp': 3,
        'gemini-2.0-flash': 3,
        'gemini-2.0-flash-light': 4,
        'gemini-1.5-flash': 5,
        'gemini-1.5-flash-8b': 6,
        'gemini-8b': 6,
        'gemini-1.5-pro': 7,
        'gemini-pro': 7
      },
      deepseek: {
        'deepseek-reasoner': 1,
        'deepseek-r1': 1,
        'deepseek-chat': 2
      }
    };

    // Get the order for this model in this category
    const categoryOrder = categoryOrders[categoryKey];
    if (categoryOrder && categoryOrder[modelId] !== undefined) {
      return categoryOrder[modelId];
    }

    // Check if model ID contains any of the ordered model patterns
    if (categoryOrder) {
      for (const [orderedModelId, order] of Object.entries(categoryOrder)) {
        if (modelId.includes(orderedModelId) || orderedModelId.includes(modelId)) {
          return order;
        }
      }
    }

    // Default fallback - put unknown models at the end
    return 999;
  }
}

// Export for use in other modules
window.ModelUIManager = ModelUIManager;