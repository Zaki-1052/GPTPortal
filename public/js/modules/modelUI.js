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

    // Inline-SVG provider marks (16px, currentColor) shown next to model names.
    this.PROVIDER_LOGOS = {
      anthropic: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 6.4L20 8l-4.6 4.2L18 20l-6-3.6L6 20l2.6-7.8L4 8l6.2.4z"/></svg>',
      openai: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7z"/></svg>',
      gemini: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.5 5.2 4.8 9.5 10 10-5.2.5-9.5 4.8-10 10-.5-5.2-4.8-9.5-10-10 5.2-.5 9.5-4.8 10-10z"/></svg>',
      grok: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>',
      deepseek: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>',
      llama: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l9 16H3z"/></svg>',
      mistral: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="5" width="18" height="4"/><rect x="3" y="15" width="18" height="4"/></svg>',
      kimi: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
      generic: '<svg class="model-logo" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="7"/></svg>'
    };

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
      console.log(`🔢 Sorting ${category.models.length} models in category: ${categoryKey}`);
      category.models.sort((a, b) => {
        // Sort by search score if available, then by custom order
        const scoreA = a.searchScore || 0;
        const scoreB = b.searchScore || 0;
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score first
        }
        
        const orderA = this.getCustomModelOrder(a.id, categoryKey);
        const orderB = this.getCustomModelOrder(b.id, categoryKey);
        console.log(`📊 Model order: ${a.id}=${orderA}, ${b.id}=${orderB}`);
        
        return orderA - orderB;
      });
      
      // Log final order for this category
      console.log(`✅ Final order for ${categoryKey}:`, category.models.map(m => `${m.id}(${this.getCustomModelOrder(m.id, categoryKey)})`).slice(0, 10));
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
      categoryDiv.hidden = true;
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

    // Chevron mark; CSS rotates it via .model-category[data-collapsed].
    const arrow = document.createElement('span');
    arrow.className = 'category-arrow';
    arrow.innerHTML = '<svg class="icon icon-xs" viewBox="0 0 24 24" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

    const title = document.createElement('span');
    title.className = 'category-name';
    title.textContent = categoryName;

    categoryHeader.appendChild(arrow);
    categoryHeader.appendChild(title);

    // Collapse/expand on click; all presentation lives in the stylesheet.
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

    // All presentation (surface, border, hover) lives in the stylesheet.
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectModel(model.id);
    });

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
    content.className = 'model-option-content';

    // Provider logo (inline SVG mark, inherits currentColor)
    const logo = document.createElement('span');
    logo.className = 'model-logo-wrap';
    logo.innerHTML = this.getProviderLogo(model);
    content.appendChild(logo);

    // Model name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'model-option-name';
    nameSpan.textContent = model.name || model.id;
    content.appendChild(nameSpan);

    // Badges container
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'badges-container';

    // Provider badge
    if (model.provider) {
      const providerBadge = this.createBadge(model.provider.toUpperCase(), 'provider');
      badgesContainer.appendChild(providerBadge);
    }

    // Feature badges — tint keyed by data-feature (see stylesheet)
    if (model.supportsVision) {
      badgesContainer.appendChild(this.createBadge('👁️', 'vision', 'Vision Support'));
    }
    if (model.supportsFunction) {
      badgesContainer.appendChild(this.createBadge('⚙️', 'tools', 'Function Calling'));
    }
    if (model.supportsImageGeneration) {
      badgesContainer.appendChild(this.createBadge('🎨', 'image', 'Image Generation'));
    }
    if (model.supportsSpeechToText) {
      badgesContainer.appendChild(this.createBadge('🎙️', 'stt', 'Speech to Text'));
    }
    if (model.supportsTextToSpeech) {
      badgesContainer.appendChild(this.createBadge('🔊', 'tts', 'Text to Speech'));
    }

    content.appendChild(badgesContainer);

    return content;
  }

  /**
   * Resolve a small inline-SVG provider logo for a model, matched by regex
   * against the model id / name / provider. Marks use currentColor so they
   * inherit the option text color and stay theme-safe. Returns an SVG string.
   * @param {Object} model - Model data
   * @returns {string} Inline SVG markup for the provider mark
   */
  getProviderLogo(model) {
    const hay = `${model.id || ''} ${model.name || ''} ${model.provider || ''}`.toLowerCase();

    // Order matters: the llama/groq/gpt-oss check precedes the gpt/openai
    // check so "gpt-oss" resolves to the open-model mark, not the OpenAI one.
    const marks = [
      { re: /claude|anthropic/, svg: this.PROVIDER_LOGOS.anthropic },
      { re: /gemini|google/, svg: this.PROVIDER_LOGOS.gemini },
      { re: /grok|xai/, svg: this.PROVIDER_LOGOS.grok },
      { re: /deepseek/, svg: this.PROVIDER_LOGOS.deepseek },
      { re: /mistral|magistral|codestral|devstral/, svg: this.PROVIDER_LOGOS.mistral },
      { re: /kimi|moonshot/, svg: this.PROVIDER_LOGOS.kimi },
      { re: /llama|groq|gpt-oss/, svg: this.PROVIDER_LOGOS.llama },
      { re: /gpt|openai|o\d/, svg: this.PROVIDER_LOGOS.openai }
    ];

    for (const mark of marks) {
      if (mark.re.test(hay)) return mark.svg;
    }
    return this.PROVIDER_LOGOS.generic;
  }

  /**
   * Create a badge element. `feature` selects the tint via data-feature
   * ('provider' | 'vision' | 'tools' | 'image' | 'stt' | 'tts'); the
   * stylesheet owns all colors so badges stay theme-safe.
   * @param {string} text - Badge text
   * @param {string} feature - Feature key used for tinting
   * @param {string} title - Tooltip title
   * @returns {HTMLElement} Badge element
   */
  createBadge(text, feature = 'provider', title = '') {
    const badge = document.createElement('span');
    badge.className = 'model-badge';
    badge.dataset.feature = feature;
    badge.textContent = text;
    badge.title = title;
    return badge;
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
    let tooltipHTML = `<strong class="tt-title">${model.name || model.id}</strong>`;

    if (model.description) {
      tooltipHTML += `<span class="tt-desc">${model.description}</span>`;
    }

    if (model.provider) {
      tooltipHTML += `<span class="tt-meta">Provider: ${model.provider}</span>`;
    }

    if (model.contextWindow) {
      tooltipHTML += `<span class="tt-meta tabular">Context: ${model.contextWindow.toLocaleString()} tokens</span>`;
    }

    if (model.pricing && (model.pricing.input || model.pricing.output)) {
      const inputCost = model.pricing.input ? `$${model.pricing.input}/1M` : 'Free';
      const outputCost = model.pricing.output ? `$${model.pricing.output}/1M` : 'Free';
      tooltipHTML += `<span class="tt-price tabular">${inputCost} in · ${outputCost} out</span>`;
    }

    tooltip.innerHTML = tooltipHTML;

    // All visual styling lives in the stylesheet; JS only drives geometry
    // (positionTooltip) and the fade-in state class below.
    setTimeout(() => {
      tooltip.classList.add('is-visible');
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
      tooltip.classList.remove('is-visible');
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
    // CSS keys arrow rotation + models-container max-height off this attribute.
    categoryElement.dataset.collapsed = collapsed ? 'true' : 'false';
  }

  /**
   * Show no models message
   * @param {HTMLElement} container - Container to show message in
   */
  showNoModelsMessage(container) {
    const noModelsDiv = document.createElement('div');
    noModelsDiv.className = 'no-models-message';
    noModelsDiv.innerHTML = `
      <span class="no-models-icon" aria-hidden="true">
        <svg class="icon icon-lg" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </span>
      <div class="no-models-title">No models found</div>
      <div class="no-models-hint">Try adjusting your search or filters</div>
    `;
    container.appendChild(noModelsDiv);
  }

  /**
   * Show refresh animation
   * @param {HTMLElement} button - Refresh button
   */
  showRefreshAnimation() {
    // Spin the refresh icon via a state class; @keyframes spin lives in the
    // stylesheet. Resolve the button by id so the class lands on it even when
    // the click event targets the inner icon.
    const button = document.getElementById('refresh-models');
    if (!button) return;

    button.classList.add('is-loading');
    button.disabled = true;

    setTimeout(() => {
      button.classList.remove('is-loading');
      button.disabled = false;
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
      openrouter: 'OpenRouter Models',
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
   * Get custom model order for sorting (uses models.json as primary source, hardcoded as fallback)
   * @param {string} modelId - Model ID
   * @param {string} categoryKey - Category key
   * @returns {number} Sort order (lower numbers come first)
   */
  getCustomModelOrder(modelId, categoryKey) {
    // Primary: Use order from models.json categories array
    if (this.modelManager && this.modelManager.categories && this.modelManager.categories[categoryKey]) {
      const categoryModels = this.modelManager.categories[categoryKey].models;
      if (categoryModels && Array.isArray(categoryModels)) {
        const index = categoryModels.indexOf(modelId);
        if (index !== -1) {
          console.log(`✅ Found ${modelId} in models.json category ${categoryKey} at index ${index}`);
          return index + 1; // Return 1-based index for sorting
        } else {
          console.log(`❌ Model ${modelId} not found in models.json category ${categoryKey} array:`, categoryModels.slice(0, 5), '...');
        }
      } else {
        console.log(`❌ No models array for category ${categoryKey}`);
      }
    } else {
      console.log(`❌ No category data for ${categoryKey} in modelManager`);
    }

    // Fallback: Use hardcoded ordering for models not in models.json categories
    const fallbackOrders = {
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
      },
      mistral: {
        'mistral-large-latest': 1,
        'mistral-medium-latest': 2,
        'pixtral-large-latest': 3,
        'pixtral-12b-latest': 4,
        'mistral-small-latest': 5,
        'codestral-latest': 6,
        'open-mixtral-8x22b': 7,
        'open-mistral-nemo': 8
      },
      llama: {
        'llama-3.1-405b-reasoning': 1,
        'llama-3.1-70b-versatile': 2,
        'llama-3.1-8b-instant': 3
      }
    };

    // Get the order from fallback hardcoded ordering
    const categoryOrder = fallbackOrders[categoryKey];
    if (categoryOrder && categoryOrder[modelId] !== undefined) {
      console.log(`🔄 Using hardcoded fallback for ${modelId} in ${categoryKey}: ${categoryOrder[modelId]}`);
      return categoryOrder[modelId];
    }

    // Check if model ID contains any of the ordered model patterns
    if (categoryOrder) {
      for (const [orderedModelId, order] of Object.entries(categoryOrder)) {
        if (modelId.includes(orderedModelId) || orderedModelId.includes(modelId)) {
          console.log(`🔄 Using pattern match fallback for ${modelId} ~ ${orderedModelId} in ${categoryKey}: ${order}`);
          return order;
        }
      }
    }

    // Default fallback - put unknown models at the end
    console.log(`❌ No order found for ${modelId} in ${categoryKey}, using default: 999`);
    return 999;
  }
}

// Export for use in other modules
window.ModelUIManager = ModelUIManager;