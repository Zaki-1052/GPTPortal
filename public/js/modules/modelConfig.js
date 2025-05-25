// Enhanced Model Configuration with Dynamic Model Support
class ModelConfig {
  constructor() {
    this.currentModelID = null;
    this.isGemini = false;
    this.assistantsMode = false;
    this.isAssistants = false;
    this.baseURL = window.location.origin;
    this.dynamicModelManager = null;
    this.usesDynamicModels = true; // Flag to enable new dynamic system
    
    // Prompt caching configuration
    this.promptCacheEnabled = false;
    this.promptCachePreference = 'auto'; // 'auto', 'force', 'none'
    
    this.init();
  }

  async init() {
    await this.fetchConfig();
    await this.fetchDefaultModel();
    
    // Initialize dynamic model manager
    if (window.DynamicModelManager) {
      this.dynamicModelManager = new window.DynamicModelManager();
      console.log('Dynamic model system enabled');
    } else {
      console.warn('DynamicModelManager not available, using static models');
      this.usesDynamicModels = false;
    }
    
    // Don't set default model on initialization - let it show "Select a Model" until first message
    // this.setDefaultModel();
  }

  async fetchConfig() {
    try {
      const response = await fetch('/config');
      const config = await response.json();
      if (config.host && config.port) {
        this.baseURL = `http://${config.host}:${config.port}`;
      }
      console.log(`Base URL set to: ${this.baseURL}`);
    } catch (error) {
      console.error("Error fetching configuration:", error);
    }
  }

  async fetchDefaultModel() {
    try {
      const response = await fetch('/model');
      const data = await response.json();
      this.currentModelID = data.model;
    } catch (error) {
      console.error('Error fetching default model:', error);
      this.currentModelID = 'gpt-4.1'; // Fallback
    }
  }

  setDefaultModel() {
    const selectedModelDiv = document.getElementById("selected-model");
    
    if (selectedModelDiv && selectedModelDiv.textContent.trim() === "Select a Model") {
      if (this.usesDynamicModels && this.dynamicModelManager) {
        // Use dynamic model data
        const model = this.dynamicModelManager.getModel(this.currentModelID);
        if (model) {
          selectedModelDiv.textContent = model.name;
        } else {
          selectedModelDiv.textContent = this.currentModelID;
        }
      } else {
        // Fallback to legacy model names
        selectedModelDiv.textContent = this.getLegacyModelName(this.currentModelID);
      }
    }
  }

  selectModel(modelID) {
    let displayName = modelID;
    
    // Get display name from dynamic model manager
    if (this.usesDynamicModels && this.dynamicModelManager) {
      const model = this.dynamicModelManager.getModel(modelID);
      if (model) {
        displayName = model.name;
      }
    } else {
      displayName = this.getLegacyModelName(modelID);
    }
    
    // Update display
    const selectedModelDiv = document.getElementById("selected-model");
    if (selectedModelDiv) {
      selectedModelDiv.textContent = displayName;
    }
    
    // Update current model
    this.currentModelID = modelID;
    this.determineEndpoint(modelID);
    
    // Close dropdown
    const options = document.getElementById('model-options');
    if (options) {
      options.style.display = 'none';
    }
    
    console.log("Selected model ID:", modelID);
  }

  determineEndpoint(modelID) {
    this.isGemini = modelID.startsWith('gemini');
    this.isAssistants = modelID.includes('assistants');
    
    if (this.isGemini) {
      console.log("Using Gemini endpoint");
    } else if (this.isAssistants) {
      console.log("Using Assistants endpoint");
    } else {
      console.log("Using standard endpoint");
    }
  }

  // Legacy model name mapping for backward compatibility
  getLegacyModelName(modelID) {
    const legacyNames = {
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
      "codestral-latest": "Codestral"
    };
    
    return legacyNames[modelID] || modelID;
  }

  updateCurrentModelID(modelID) {
    this.currentModelID = modelID;
    this.determineEndpoint(modelID);
  }

  isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  // Get model information for API calls
  async getModelInfo(modelID) {
    if (this.usesDynamicModels && this.dynamicModelManager) {
      return this.dynamicModelManager.getModel(modelID);
    }
    
    // Fallback for legacy system
    return {
      id: modelID,
      name: this.getLegacyModelName(modelID),
      provider: this.inferProvider(modelID)
    };
  }

  // Infer provider from model ID (for legacy support)
  inferProvider(modelID) {
    if (modelID.startsWith('gpt') || modelID.startsWith('o1') || modelID.startsWith('o3')) return 'openai';
    if (modelID.includes('claude')) return 'anthropic';
    if (modelID.includes('gemini')) return 'google';
    if (modelID.includes('llama')) return 'groq';
    if (modelID.includes('mistral') || modelID.includes('codestral')) return 'mistral';
    if (modelID.includes('deepseek')) return 'deepseek';
    return 'openrouter';
  }

  // Search models (delegates to dynamic manager)
  async searchModels(query) {
    if (this.usesDynamicModels && this.dynamicModelManager) {
      return this.dynamicModelManager.searchModels(query);
    }
    return {};
  }

  // Get models by category (delegates to dynamic manager)
  async getModelsByCategory(category) {
    if (this.usesDynamicModels && this.dynamicModelManager) {
      return this.dynamicModelManager.getModelsByCategory(category);
    }
    return {};
  }

  // Refresh models (delegates to dynamic manager)
  async refreshModels() {
    if (this.usesDynamicModels && this.dynamicModelManager) {
      return await this.dynamicModelManager.refreshModels();
    }
    return false;
  }

  // Get current model details
  getCurrentModel() {
    if (this.usesDynamicModels && this.dynamicModelManager) {
      return this.dynamicModelManager.getModel(this.currentModelID);
    }
    
    return {
      id: this.currentModelID,
      name: this.getLegacyModelName(this.currentModelID),
      provider: this.inferProvider(this.currentModelID)
    };
  }

  // Prompt caching methods
  isClaudeModel(modelID = this.currentModelID) {
    return modelID && modelID.includes('claude');
  }

  supportsPromptCaching(modelID = this.currentModelID) {
    return this.isClaudeModel(modelID);
  }

  updatePromptCacheEnabled(enabled) {
    this.promptCacheEnabled = enabled;
    localStorage.setItem('promptCacheEnabled', enabled.toString());
    
    // Update UI
    this.updateCacheControlVisibility();
    
    console.log('Prompt caching', enabled ? 'enabled' : 'disabled');
  }

  getPromptCachePreference() {
    if (!this.promptCacheEnabled || !this.supportsPromptCaching()) {
      return 'none';
    }
    return this.promptCachePreference;
  }

  setPromptCachePreference(preference) {
    this.promptCachePreference = preference;
    localStorage.setItem('promptCachePreference', preference);
  }

  loadCachePreferences() {
    const saved = localStorage.getItem('promptCacheEnabled');
    if (saved !== null) {
      this.promptCacheEnabled = saved === 'true';
    }
    
    const savedPreference = localStorage.getItem('promptCachePreference');
    if (savedPreference) {
      this.promptCachePreference = savedPreference;
    }

    // Update UI
    this.updateCacheControlVisibility();
    const cacheToggle = document.getElementById('enable-prompt-cache');
    if (cacheToggle) {
      cacheToggle.checked = this.promptCacheEnabled;
    }
  }

  updateCacheControlVisibility() {
    const cacheContainer = document.getElementById('prompt-cache-container');
    if (cacheContainer) {
      if (this.supportsPromptCaching()) {
        cacheContainer.style.display = 'flex';
      } else {
        cacheContainer.style.display = 'none';
      }
    }
  }

  // Override selectModel to handle cache UI visibility
  selectModel(modelID) {
    this.currentModelID = modelID;
    this.determineEndpoint(modelID);
    
    // Update cache control visibility based on model
    this.updateCacheControlVisibility();
    
    // Close dropdown
    const options = document.getElementById('model-options');
    if (options) {
      options.style.display = 'none';
    }
    
    console.log("Selected model ID:", modelID);
  }
}

// Export for use in main script
window.ModelConfig = ModelConfig;