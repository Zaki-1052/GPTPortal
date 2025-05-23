// Enhanced Dynamic Model Manager with full original functionality
class DynamicModelManager {
  constructor() {
    // Prevent multiple instances
    if (window.dynamicModelManagerInstance) {
      console.log('DynamicModelManager instance already exists, returning existing instance');
      return window.dynamicModelManagerInstance;
    }
    window.dynamicModelManagerInstance = this;
    this.models = null;
    this.categories = null;
    this.loading = false;
    this.lastFetch = null;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.showOpenRouter = false;
    this.searchQuery = '';
    this.eventsBound = false;
    
    // Model descriptions from original script.js
    this.modelDescriptions = {
      "gpt-4": "GPT-4: Oldest Intelligent Model",
      "gpt-4o": "GPT-4o: Latest OpenAI Intelligent Model",
      "gpt-4-32k": "GPT-4-32k: Longer Context Window — Higher Price",
      "gpt-4-turbo": "GPT-4-Turbo: ChatGPT-Plus Model — 128k Tokens",
      "gpt-3.5-turbo-0125": "GPT-3.5-Turbo: Older Cheap Option",
      "claude-3-7-sonnet-latest": "Most Advanced Anthropic Model",
      "claude-3-5-sonnet-latest": "Best Normal Claude Model",
      "claude-3-5-haiku-latest": "Fast & Cheap Anthropic Model",
      "gemini-pro": "Gemini-Pro: Google Bard Model — 3.5 Equivalent",
      "gemini-pro-vision": "Gemini-Vision: View Images — One-Time Use",
      "gemini-1.5-pro": "Gemini-Pro-1.5: Best Gemini Model — 2 Million Tokens",
      "gemini-1.5-flash": "Gemini-Flash-1.5: Fastest & Cheapest Google Model",
      "gemini-2.0-flash-exp": "Gemini-Flash-2.0: Newest & Best Google Model",
      "gemini-1.0-ultra": "Gemini-Ultra: Largest Google Model — Unreleased",
      "claude-3-opus-20240229": "Claude-Opus: Very Powerful — GPT-4 Level",
      "claude-3-sonnet-20240229": "Claude-Sonnet: Hard-Working — Turbo Level",
      "claude-3-haiku-20240307": "Claude-Haiku: Light, Cheap, & Fast — New",
      "claude-2.1": "Claude-2.1: Best Instant Model — 200k Tokens",
      "claude-2.0": "Claude-2.0: Average Cheap Model — 100k Tokens",
      "claude-instant-1.2": "Claude-1.2: Cheapest Instant Model — 100k Context",
      "open-mistral-7b": "Mistral-Tiny: Cheapest — Open Source 7B",
      "open-mixtral-8x7b": "Mixtral 8x7B: Mixture of Experts (MoE) Model",
      "open-mixtral-8x22b": "Mixtral 8x22b: Strongest Open Source Model",
      "mistral-small-latest": "Mistral-Small: Smarter — More Costly",
      "mistral-medium-latest": "Mistral-Medium: Intelligent — Beats Gemini-Pro",
      "mistral-large-latest": "Mistral-Large: Most Expensive and Intelligent",
      "llama3-70b-8192": "Llama3 70b: GPT-4 Level Performance — Intelligent",
      "llama3-8b-8192": "Llama3 8b: Smaller, Faster Model — Cheaper",
      "codestral-latest": "Codestral: Best Mistral Model for Coding",
      "gemma-7b-it": "Smallest Open-Source Google Model",
      "open-codestral-mamba": "Codestral Mamba: A Mamba 2 language model specialized in code generation",
      "mathstral-temp-id": "Mathstral: A math-specific 7B model designed for math reasoning and scientific tasks",
      "open-mistral-nemo": "Mistral NeMo: A 12B model built in partnership with Nvidia, easy to use and a drop-in replacement for Mistral 7B",
      "gpt-4o-mini": "GPT-4o-Mini: Small, fast, and cheap model from OpenAI with relatively high intelligence.",
      "mixtral-8x7b-32768": "Qroq API: Free Mixtral 8x7b",
      "deepseek-reasoner": "DeepSeek-R1: Advanced reasoning model with step-by-step thinking",
      "deepseek-chat": "DeepSeek-Chat: General purpose chat model",
      "o1-preview": "GPT-o1-Preview: Advanced reasoning model for complex problems",
      "o1-mini": "GPT-o1-Mini: Faster reasoning model for simpler tasks",
      "o3-mini": "GPT-o3-Mini: Next generation reasoning model",
      "llama-3.1-405b-reasoning": "Llama 3.1 405B: Largest open source model with strong reasoning",
      "llama-3.1-70b-versatile": "Llama 3.1 70B: Versatile model for various tasks",
      "llama-3.1-8b-instant": "Llama 3.1 8B: Fast and efficient model",
      // OpenRouter models
      "anthropic/claude-3.7-sonnet:beta": "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
      "anthropic/claude-3.7-sonnet": "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
      "openai/gpt-3.5-turbo-0125": "The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.\n\nThis version has a higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls.",
      "openai/gpt-3.5-turbo": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021."
    };
    
    this.init();
  }

  /**
   * Initialize the dynamic model manager
   */
  async init() {
    try {
      console.log('Initializing Enhanced Dynamic Model Manager...');
      
      // Set initial state
      this.setInitialState();
      
      // Use comprehensive static model list (now from JSON file)
      await this.loadCompleteModelList();
      
      // Only populate after models are loaded
      if (this.models && Object.keys(this.models).length > 0) {
        this.bindEvents();
        
        // Debug: Check initial state before populating
        const modelOptions = document.getElementById('model-options');
        if (modelOptions) {
          console.log('INIT - Before populate - Current display:', window.getComputedStyle(modelOptions).display);
          console.log('INIT - Before populate - Inline style:', modelOptions.style.display);
        }
        
        this.populateModelSelector();
        console.log('Enhanced Dynamic Model Manager initialized successfully with complete model list');
      } else {
        console.error('No models loaded, cannot populate selector');
      }
    } catch (error) {
      console.error('Failed to initialize Dynamic Model Manager:', error);
      try {
        await this.loadCompleteModelList();
        if (this.models && Object.keys(this.models).length > 0) {
          this.bindEvents();
          this.populateModelSelector();
        }
        // Ensure proper state after fallback
        this.setInitialState();
      } catch (fallbackError) {
        console.error('Fallback initialization also failed:', fallbackError);
      }
    }
  }

  /**
   * Set initial UI state
   */
  setInitialState() {
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = 'Select a Model';
    }
    
    // Ensure dropdown starts hidden
    const modelOptions = document.getElementById('model-options');
    if (modelOptions) {
      modelOptions.style.display = 'none';
    }
    
    // Hide any loading indicators
    const loadingDiv = document.getElementById('loading-models');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }

  /**
   * Load models from API
   */
  async loadModels(force = false) {
    // Check cache first
    if (!force && this.models && this.isCacheValid()) {
      console.log('Using cached model data');
      return this.models;
    }

    this.loading = true;
    this.showLoading(true);

    try {
      console.log('Fetching models from API...');
      const response = await fetch('/api/models?format=frontend');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API returned error');
      }

      this.models = data.data.models;
      this.categories = data.data.categories;
      this.lastFetch = Date.now();
      
      // Enhance models with descriptions
      this.enhanceModelsWithDescriptions();
      
      console.log(`Loaded ${Object.keys(this.models).length} models from API`);
      return this.models;

    } catch (error) {
      console.warn('API not available, using core models fallback:', error.message);
      
      // Use fallback models immediately
      this.loadFallbackModels();
      return this.models;

    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  /**
   * Enhance models with rich descriptions from original script.js
   */
  enhanceModelsWithDescriptions() {
    if (!this.models) return;
    
    Object.keys(this.models).forEach(modelId => {
      const model = this.models[modelId];
      
      // Add description if available
      if (this.modelDescriptions[modelId]) {
        model.description = this.modelDescriptions[modelId];
      }
      
      // Ensure display name is set
      if (!model.name) {
        model.name = this.getDisplayName(modelId);
      }
    });
  }

  /**
   * Get display name for model (from original customModelNames)
   */
  getDisplayName(modelId) {
    const customNames = {
      "gpt-4": "GPT-4: Original",
      "gpt-4o": "GPT-4o: Latest", 
      "gpt-4o-mini": "GPT-4o Mini: Cheapest",
      "gpt-4-turbo": "GPT-4 Turbo: Standard",
      "gpt-3.5-turbo-0125": "GPT-3.5 Turbo: Legacy",
      "claude-opus-4-20250514": "Claude 4 Opus",
      "claude-sonnet-4-20250514": "Claude 4 Sonnet",
      "claude-3-7-sonnet-latest": "Claude 3.7 Sonnet",
      "claude-3-5-sonnet-latest": "Claude 3.5 Sonnet",
      "claude-3-5-haiku-latest": "Claude 3.5 Haiku",
      "claude-3-haiku-20240307": "Claude Haiku: Cheap",
      "o1-preview": "GPT-o1 Preview: Reasoning",
      "o1-mini": "GPT-o1 Mini: Cheap Reasoning",
      "o3-mini": "GPT-o3 Mini: Cheap Reasoning",
      "deepseek-reasoner": "DeepSeek-R1",
      "deepseek-chat": "DeepSeek-Chat",
      "gemini-pro": "Gemini Pro",
      "gemini-1.5-pro": "Gemini 1.5 Pro: Best",
      "gemini-1.5-flash": "Gemini 1.5 Flash",
      "gemini-2.0-flash-exp": "Gemini 2.0 Flash",
      "llama-3.1-405b-reasoning": "Llama 3.1 405B",
      "llama-3.1-70b-versatile": "Llama 3.1 70B",
      "llama-3.1-8b-instant": "Llama 3.1 8B",
      "mistral-large-latest": "Mistral Large",
      "codestral-latest": "Codestral",
      // OpenRouter models
      "anthropic/claude-3.7-sonnet:beta": "Anthropic: Claude 3.7 Sonnet (self-moderated)",
      "anthropic/claude-3.7-sonnet": "Anthropic: Claude 3.7 Sonnet",
      "perplexity/r1-1776": "Perplexity: R1 1776"
    };
    
    return customNames[modelId] || modelId;
  }

  /**
   * Load complete model list from JSON file
   */
  async loadCompleteModelList() {
    try {
      console.log('Loading complete model list from JSON file...');
      
      const response = await fetch('/js/data/models.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const modelData = await response.json();
      
      // Flatten all categories into a single models object
      this.models = {};
      this.categories = {};
      
      // Handle the actual JSON structure with nested models object
      const modelsData = modelData.models || modelData;
      
      // Group models by category
      const categorizedModels = {};
      Object.values(modelsData).forEach(model => {
        const category = model.category || 'other';
        if (!categorizedModels[category]) {
          categorizedModels[category] = [];
        }
        categorizedModels[category].push(model);
      });
      
      // Process categorized models
      Object.entries(categorizedModels).forEach(([categoryKey, categoryModels]) => {
        // Build category info
        this.categories[categoryKey] = {
          name: this.getCategoryDisplayName(categoryKey),
          models: categoryModels.map(model => model.id)
        };
        
        // Add models to main models object
        categoryModels.forEach(model => {
          this.models[model.id] = {
            ...model,
            category: categoryKey,
            source: 'core'
          };
        });
      });
      
      console.log(`Loaded ${Object.keys(this.models).length} models from JSON file`);
      console.log('Models loaded:', Object.keys(this.models));
      console.log('Categories created:', Object.keys(this.categories));
      
    } catch (error) {
      console.error('Error loading model data from JSON:', error);
      console.log('Falling back to hardcoded model list...');
      
      // Fallback to hardcoded models
      this.models = this.getOriginalModelList();
      this.categories = this.getOriginalCategories();
      console.log(`Fallback loaded ${Object.keys(this.models).length} models`);
      console.log('Fallback models:', Object.keys(this.models));
    }
  }

  /**
   * Load fallback models with full descriptions (matching coreModels.js)
   */
  loadFallbackModels() {
    console.log('Loading comprehensive fallback models from coreModels.js...');
    
    this.models = {
      'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o: Latest',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-4o']
      },
      'gpt-4o-mini': {
        id: 'gpt-4o-mini', 
        name: 'GPT-4o Mini: Cheapest',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-4o-mini']
      },
      'gpt-4-turbo': {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo: Standard',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-4-turbo']
      },
      'gpt-4': {
        id: 'gpt-4',
        name: 'GPT-4: Original',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-4']
      },
      'gpt-3.5-turbo-0125': {
        id: 'gpt-3.5-turbo-0125',
        name: 'GPT-3.5 Turbo: Legacy',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-3.5-turbo-0125']
      },
      'claude-opus-4-20250514': {
        id: 'claude-opus-4-20250514',
        name: 'Claude 4 Opus',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: 'Claude 4 Opus: Most capable Claude model with enhanced reasoning'
      },
      'claude-sonnet-4-20250514': {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude 4 Sonnet',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: 'Claude 4 Sonnet: Balanced performance and speed'
      },
      'claude-3-7-sonnet-latest': {
        id: 'claude-3-7-sonnet-latest',
        name: 'Claude 3.7 Sonnet',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: this.modelDescriptions['claude-3-7-sonnet-latest']
      },
      'claude-3-5-sonnet-latest': {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: this.modelDescriptions['claude-3-5-sonnet-latest']
      },
      'claude-3-5-haiku-latest': {
        id: 'claude-3-5-haiku-latest',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: this.modelDescriptions['claude-3-5-haiku-latest']
      },
      'claude-3-haiku-20240307': {
        id: 'claude-3-haiku-20240307',
        name: 'Claude Haiku: Cheap',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: this.modelDescriptions['claude-3-haiku-20240307']
      },
      'o1-preview': {
        id: 'o1-preview',
        name: 'GPT-o1 Preview: Reasoning',
        provider: 'openai',
        category: 'reasoning',
        source: 'core',
        description: this.modelDescriptions['o1-preview']
      },
      'o1-mini': {
        id: 'o1-mini',
        name: 'GPT-o1 Mini: Cheap Reasoning',
        provider: 'openai',
        category: 'reasoning',
        source: 'core',
        description: this.modelDescriptions['o1-mini']
      },
      'o3-mini': {
        id: 'o3-mini',
        name: 'GPT-o3 Mini: Cheap Reasoning',
        provider: 'openai',
        category: 'reasoning',
        source: 'core',
        description: this.modelDescriptions['o3-mini']
      },
      'gemini-2.0-flash-exp': {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        category: 'gemini',
        source: 'core',
        description: this.modelDescriptions['gemini-2.0-flash-exp']
      },
      'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro: Best',
        provider: 'google',
        category: 'gemini',
        source: 'core',
        description: this.modelDescriptions['gemini-1.5-pro']
      },
      'gemini-1.5-flash': {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        category: 'gemini',
        source: 'core',
        description: this.modelDescriptions['gemini-1.5-flash']
      },
      'gemini-pro': {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        category: 'gemini',
        source: 'core',
        description: this.modelDescriptions['gemini-pro']
      },
      'deepseek-reasoner': {
        id: 'deepseek-reasoner',
        name: 'DeepSeek-R1',
        provider: 'deepseek',
        category: 'reasoning',
        source: 'core',
        description: this.modelDescriptions['deepseek-reasoner']
      },
      'deepseek-chat': {
        id: 'deepseek-chat',
        name: 'DeepSeek-Chat',
        provider: 'deepseek',
        category: 'other',
        source: 'core',
        description: this.modelDescriptions['deepseek-chat']
      },
      'llama-3.1-405b-reasoning': {
        id: 'llama-3.1-405b-reasoning',
        name: 'Llama 3.1 405B',
        provider: 'groq',
        category: 'llama',
        source: 'core',
        description: this.modelDescriptions['llama-3.1-405b-reasoning']
      },
      'llama-3.1-70b-versatile': {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B',
        provider: 'groq',
        category: 'llama',
        source: 'core',
        description: this.modelDescriptions['llama-3.1-70b-versatile']
      },
      'llama-3.1-8b-instant': {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        provider: 'groq',
        category: 'llama',
        source: 'core',
        description: this.modelDescriptions['llama-3.1-8b-instant']
      },
      'mistral-large-latest': {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        provider: 'mistral',
        category: 'mistral',
        source: 'core',
        description: this.modelDescriptions['mistral-large-latest']
      },
      'codestral-latest': {
        id: 'codestral-latest',
        name: 'Codestral',
        provider: 'mistral',
        category: 'mistral',
        source: 'core',
        description: this.modelDescriptions['codestral-latest']
      }
    };

    this.categories = {
      gpt: { name: 'GPT Models', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo-0125'] },
      claude: { name: 'Claude Models', models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-haiku-20240307'] },
      gemini: { name: 'Gemini Models', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'] },
      reasoning: { name: 'Reasoning Models', models: ['o1-preview', 'o1-mini', 'o3-mini', 'deepseek-reasoner'] },
      llama: { name: 'LLaMA Models', models: ['llama-3.1-405b-reasoning', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'] },
      mistral: { name: 'Mistral Models', models: ['mistral-large-latest', 'codestral-latest'] },
      other: { name: 'Other Models', models: ['deepseek-chat'] }
    };
  }

  /**
   * Check if cache is valid
   */
  isCacheValid() {
    return this.lastFetch && (Date.now() - this.lastFetch) < this.cacheTTL;
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    console.log('Binding events for dynamic model manager...');
    
    // Prevent multiple event bindings
    if (this.eventsBound) {
      console.log('Events already bound, skipping...');
      return;
    }
    this.eventsBound = true;
    
    // Model search
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
      console.log('Found model-search element');
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterModels();
      });
    } else {
      console.warn('model-search element not found');
    }

    // OpenRouter toggle
    const openRouterToggle = document.getElementById('show-open-router');
    if (openRouterToggle) {
      console.log('Found show-open-router element');
      openRouterToggle.addEventListener('change', (e) => {
        this.showOpenRouter = e.target.checked;
        this.filterModels();
      });
    } else {
      console.warn('show-open-router element not found');
    }

    // Refresh button
    const refreshButton = document.getElementById('refresh-models');
    if (refreshButton) {
      console.log('Found refresh-models element');
      refreshButton.addEventListener('click', () => {
        this.refreshModels();
      });
    } else {
      console.warn('refresh-models element not found');
    }

    // Model dropdown toggle
    const selectedModel = document.getElementById('selected-model');
    const modelOptions = document.getElementById('model-options');
    
    console.log('selectedModel found:', !!selectedModel);
    console.log('modelOptions found:', !!modelOptions);
    
    if (selectedModel && modelOptions) {
      console.log('Adding click event to selected-model');
      selectedModel.addEventListener('click', (e) => {
        console.log('Selected model clicked!');
        e.preventDefault();
        e.stopPropagation();
        
        // Check computed style, not just inline style
        const computedStyle = window.getComputedStyle(modelOptions);
        const currentDisplay = computedStyle.display;
        const isVisible = currentDisplay === 'block';
        
        console.log('Current computed display:', currentDisplay);
        console.log('Current visibility:', isVisible);
        
        modelOptions.style.display = isVisible ? 'none' : 'block';
        console.log('New display style:', modelOptions.style.display);
        
        if (!isVisible) {
          // Reset search when opening
          if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            this.filterModels();
            // Don't auto-focus search input to avoid interference
          }
        }
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#model-selector-container')) {
        if (modelOptions) {
          modelOptions.style.display = 'none';
        }
      }
    });
  }

  /**
   * Populate model selector with enhanced content
   */
  populateModelSelector() {
    const modelOptions = document.getElementById('model-options');
    if (!modelOptions) {
      console.warn('Model options container not found - element with ID "model-options" does not exist');
      return;
    }
    
    if (!this.models || Object.keys(this.models).length === 0) {
      console.warn('No models available - this.models is empty or undefined');
      console.log('Current models object:', this.models);
      return;
    }
    
    console.log(`Populating model selector with ${Object.keys(this.models).length} models`);
    console.log('BEFORE populate - Current display:', window.getComputedStyle(modelOptions).display);
    console.log('BEFORE populate - Inline style:', modelOptions.style.display);

    // Clear existing content
    modelOptions.innerHTML = '';

    // Group models by category
    const groupedModels = this.groupModelsByCategory();

    // Create category sections
    Object.entries(groupedModels).forEach(([categoryKey, category]) => {
      if (category.models.length === 0) return;

      // Create category header
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'model-category';
      
      const categoryHeader = document.createElement('h4');
      categoryHeader.textContent = category.name;
      categoryHeader.style.cssText = 'margin: 10px 0 5px 0; padding: 5px; background-color: #404245; border-radius: 3px; font-size: 14px;';
      categoryDiv.appendChild(categoryHeader);

      // Add models to category
      category.models.forEach(model => {
        const button = this.createModelButton(model);
        categoryDiv.appendChild(button);
      });

      // Hide OpenRouter categories if toggle is off
      if (this.isOpenRouterCategory(categoryKey) && !this.showOpenRouter) {
        categoryDiv.style.display = 'none';
      }

      modelOptions.appendChild(categoryDiv);
    });

    // If no models visible, show message
    if (modelOptions.children.length === 0) {
      const noModelsDiv = document.createElement('div');
      noModelsDiv.className = 'no-models-message';
      noModelsDiv.textContent = 'No models found. Try adjusting your filters.';
      noModelsDiv.style.cssText = 'text-align: center; padding: 20px; color: #888;';
      modelOptions.appendChild(noModelsDiv);
    }

    console.log(`Populated ${modelOptions.children.length} model categories`);
    console.log('AFTER populate - Current display:', window.getComputedStyle(modelOptions).display);
    console.log('AFTER populate - Inline style:', modelOptions.style.display);
  }

  /**
   * Group models by category
   */
  groupModelsByCategory() {
    const grouped = {};

    Object.values(this.models).forEach(model => {
      const category = model.category || 'other';
      
      if (!grouped[category]) {
        grouped[category] = {
          name: this.getCategoryDisplayName(category),
          models: []
        };
      }

      // Apply filters
      if (this.shouldShowModel(model)) {
        grouped[category].models.push(model);
      }
    });

    return grouped;
  }

  /**
   * Check if model should be shown based on filters
   */
  shouldShowModel(model) {
    // Search filter
    if (this.searchQuery) {
      const searchableText = (
        (model.name || '') + ' ' + 
        (model.description || '') + ' ' + 
        (model.id || '') + ' ' + 
        (model.provider || '')
      ).toLowerCase();
      
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
   * Check if category is OpenRouter-only
   */
  isOpenRouterCategory(category) {
    if (!this.models) return false;
    
    const categoryModels = Object.values(this.models).filter(m => m.category === category);
    return categoryModels.every(m => m.source === 'openrouter');
  }

  /**
   * Create model button element with enhanced features
   */
  createModelButton(model) {
    const button = document.createElement('button');
    button.id = this.generateButtonId(model.id);
    button.className = model.source === 'core' ? 'standard-model' : 'openrouter-model';
    button.setAttribute('data-value', model.id);
    button.textContent = model.name || model.id;
    
    // Enhanced styling
    button.style.cssText = `
      width: 100%;
      text-align: left;
      padding: 8px 12px;
      margin: 2px 0;
      background-color: #303134;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 14px;
    `;

    // Add click handler
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectModel(model.id);
    });

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#505355';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#303134';
    });

    // Add tooltip with description
    if (model.description) {
      this.addTooltip(button, model);
    }

    // Add provider badge
    if (model.provider) {
      const badge = document.createElement('span');
      badge.className = 'provider-badge';
      badge.textContent = model.provider.toUpperCase();
      badge.style.cssText = `
        float: right;
        font-size: 10px;
        background-color: #555;
        padding: 2px 6px;
        border-radius: 3px;
        margin-left: 10px;
      `;
      button.appendChild(badge);
    }

    return button;
  }

  /**
   * Add tooltip functionality to button
   */
  addTooltip(button, model) {
    let tooltip = null;
    
    button.addEventListener('mouseenter', (e) => {
      // Create tooltip
      tooltip = document.createElement('div');
      tooltip.className = 'model-tooltip';
      tooltip.innerHTML = `
        <strong>${model.name}</strong><br>
        ${model.description || 'No description available'}
        ${model.provider ? `<br><em>Provider: ${model.provider}</em>` : ''}
      `;
      
      tooltip.style.cssText = `
        position: absolute;
        background-color: #333;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        max-width: 300px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        line-height: 1.4;
      `;
      
      document.body.appendChild(tooltip);
      
      // Position tooltip
      const rect = button.getBoundingClientRect();
      tooltip.style.left = `${rect.left - tooltip.offsetWidth - 10}px`;
      tooltip.style.top = `${rect.top + window.scrollY}px`;
      
      // Ensure tooltip stays on screen
      if (parseInt(tooltip.style.left) < 0) {
        tooltip.style.left = `${rect.right + 10}px`;
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    });
  }

  /**
   * Generate consistent button ID
   */
  generateButtonId(modelId) {
    return 'model-' + modelId.replace(/[^a-zA-Z0-9]/g, '-');
  }

  /**
   * Get category display name
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
      qwen: 'Qwen Models',
      cohere: 'Cohere Models',
      perplexity: 'Perplexity Models',
      other: 'Other Models'
    };
    
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1) + ' Models';
  }

  /**
   * Select a model with enhanced features
   */
  selectModel(modelId) {
    const model = this.models[modelId];
    if (!model) {
      console.error('Model not found:', modelId);
      return;
    }

    console.log('Selecting model:', modelId, model.name);

    // Update selected model display
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = model.name || model.id;
    }

    // Update global model state for backward compatibility
    if (window.gptPortalApp && window.gptPortalApp.modelConfig) {
      window.gptPortalApp.modelConfig.selectModel(modelId);
    } else {
      // Direct update for legacy code
      window.currentModelID = modelId;
      if (window.updateCurrentModelID) {
        window.updateCurrentModelID(modelId);
      }
    }

    // Close dropdown
    const modelOptions = document.getElementById('model-options');
    if (modelOptions) {
      modelOptions.style.display = 'none';
    }

    // Update token slider limits based on model
    this.updateTokenLimits(modelId);

    console.log('Model selected successfully:', modelId);
  }

  /**
   * Update token limits based on selected model
   */
  updateTokenLimits(modelId) {
    const tokensSlider = document.getElementById('tokens-slider');
    const modelTokenLimit = document.getElementById('model-token-limit');
    
    if (!tokensSlider || !modelTokenLimit) return;

    const maxTokens = this.getMaxTokensByModel(modelId);
    
    // Update the displayed limit
    modelTokenLimit.textContent = maxTokens.toLocaleString();
    
    // Update slider max attribute
    tokensSlider.max = maxTokens;
    
    // If current value exceeds new max, adjust it
    if (parseInt(tokensSlider.value) > maxTokens) {
      tokensSlider.value = maxTokens;
      const tokensValue = document.getElementById('tokens-value');
      if (tokensValue) {
        tokensValue.textContent = maxTokens.toLocaleString();
      }
      window.tokens = maxTokens;
    }
  }

  /**
   * Get max tokens by model (from original script.js)
   */
  getMaxTokensByModel(modelId) {
    if (modelId === 'gpt-4') {
      return 6000;
    } else if (modelId === 'gpt-4o-mini') {
      return 16000;
    } else if (modelId === 'gpt-4o') {
      return 16000;
    } else if (modelId.startsWith('llama-3.1')) {
      return 8000;
    } else if (modelId === 'claude-3-7-sonnet-latest') {
      return 100000;
    } else if (modelId === 'claude-opus-4-20250514' || modelId === 'claude-sonnet-4-20250514') {
      return 100000;
    } else if (modelId.startsWith('claude')) {
      return 8000;
    } else {
      return 8000; // Default for other models
    }
  }

  /**
   * Filter models based on current search and toggle state
   */
  filterModels() {
    this.populateModelSelector();
  }

  /**
   * Refresh models from API
   */
  async refreshModels() {
    const refreshButton = document.getElementById('refresh-models');
    const originalText = refreshButton ? refreshButton.textContent : '';
    
    try {
      console.log('Refreshing models...');
      
      // Show visual feedback on refresh button
      if (refreshButton) {
        refreshButton.textContent = '⏳';
        refreshButton.disabled = true;
      }
      
      await this.loadCompleteModelList();
      this.populateModelSelector();
      this.showSuccess('Models refreshed successfully');
      
    } catch (error) {
      console.error('Failed to refresh models:', error);
      this.showError('Failed to refresh models');
    } finally {
      // Reset refresh button state
      if (refreshButton) {
        refreshButton.textContent = originalText || '🔄';
        refreshButton.disabled = false;
      }
    }
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const loadingDiv = document.getElementById('loading-models');
    if (loadingDiv) {
      loadingDiv.style.display = show ? 'block' : 'none';
    }
    
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      if (show) {
        selectedModelDiv.textContent = 'Loading models...';
      } else {
        // Reset to default state when loading is complete
        selectedModelDiv.textContent = 'Select a Model';
      }
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error(message);
    // Could show a toast notification here
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log(message);
    // Could show a toast notification here
  }

  /**
   * Get model by ID
   */
  getModel(modelId) {
    return this.models ? this.models[modelId] : null;
  }

  /**
   * Get all models
   */
  getAllModels() {
    return this.models || {};
  }

  /**
   * Get models by category
   */
  getModelsByCategory(category) {
    if (!this.models) return {};
    
    const filtered = {};
    Object.entries(this.models).forEach(([id, model]) => {
      if (model.category === category) {
        filtered[id] = model;
      }
    });
    return filtered;
  }

  /**
   * Search models
   */
  searchModels(query) {
    if (!this.models) return {};
    
    const results = {};
    const lowercaseQuery = query.toLowerCase();
    
    Object.entries(this.models).forEach(([id, model]) => {
      const searchableText = (
        (model.name || '') + ' ' + 
        (model.description || '') + ' ' + 
        (model.id || '') + ' ' + 
        (model.provider || '')
      ).toLowerCase();
      
      if (searchableText.includes(lowercaseQuery)) {
        results[id] = model;
      }
    });
    
    return results;
  }

  /**
   * Get original complete model list (fallback only)
   */
  getOriginalModelList() {
    // Simplified fallback - just core models for emergency use
    return {
      'gpt-4o': {
        id: 'gpt-4o',
        name: 'GPT-4o: Latest',
        provider: 'openai',
        category: 'gpt',
        source: 'core',
        description: this.modelDescriptions['gpt-4o']
      },
      'claude-3-5-sonnet-latest': {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        category: 'claude',
        source: 'core',
        description: this.modelDescriptions['claude-3-5-sonnet-latest']
      },
      'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        category: 'gemini',
        source: 'core',
        description: this.modelDescriptions['gemini-1.5-pro']
      }
    };
  }

  /**
   * Get original categories structure
   */
  getOriginalCategories() {
    return {
      gpt: { 
        name: 'GPT Models', 
        models: ['gpt-4', 'gpt-4.5-preview', 'gpt-4.1', 'gpt-4o', 'gpt-4-32k', 'gpt-4-turbo', 'gpt-3.5-turbo-0125', 'gpt-4o-mini'] 
      },
      claude: { 
        name: 'Claude Models', 
        models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-2.1', 'claude-2.0', 'claude-instant-1.2'] 
      },
      reasoning: { 
        name: 'Reasoning Models', 
        models: ['o1-preview', 'o1', 'o3-mini', 'o4-mini', 'o1-mini', 'deepseek-reasoner'] 
      },
      gemini: { 
        name: 'Gemini Models', 
        models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.0-ultra'] 
      },
      llama: { 
        name: 'LLaMA Models', 
        models: ['llama-3.1-405b-reasoning', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192'] 
      },
      mistral: { 
        name: 'Mistral Models', 
        models: ['mistral-large-latest', 'mistral-small-latest', 'mistral-medium-latest', 'open-mistral-7b', 'open-mixtral-8x7b', 'open-mixtral-8x22b', 'codestral-latest', 'open-codestral-mamba', 'mathstral-temp-id', 'open-mistral-nemo', 'mixtral-8x7b-32768'] 
      },
      other: { 
        name: 'Other Models', 
        models: ['deepseek-chat', 'gemma-7b-it'] 
      }
    };
  }
}

// Export for use in main script
window.DynamicModelManager = DynamicModelManager;