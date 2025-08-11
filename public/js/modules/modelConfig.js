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
    
    // Initialize dynamic model manager - use existing instance if available
    if (window.DynamicModelManager) {
      // Check if there's already an instance
      if (window.dynamicModelManagerInstance) {
        this.dynamicModelManager = window.dynamicModelManagerInstance;
        console.log('Using existing DynamicModelManager instance');
      } else {
        this.dynamicModelManager = new window.DynamicModelManager();
        console.log('Created new DynamicModelManager instance');
      }
      
      // Wait for the dynamic model manager to be ready
      await this.waitForDynamicModelManager();
      console.log('Dynamic model system enabled and ready');
    } else {
      console.warn('DynamicModelManager not available, using static models');
      this.usesDynamicModels = false;
    }
    
    // Don't set default model on initialization - let it show "Select a Model" until first message
    // this.setDefaultModel();
  }

  /**
   * Wait for the dynamic model manager to finish loading
   */
  async waitForDynamicModelManager() {
    if (!this.dynamicModelManager) return;
    
    // Wait for initialization to complete
    const maxWait = 10000; // 10 seconds max
    const checkInterval = 100; // Check every 100ms
    const startTime = Date.now();
    
    while (!this.dynamicModelManager.initialized && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    if (!this.dynamicModelManager.initialized) {
      console.warn('DynamicModelManager initialization timeout');
    } else {
      console.log('DynamicModelManager is ready with models loaded');
    }
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
        // Fallback to model ID if dynamic manager not available
        selectedModelDiv.textContent = this.currentModelID;
      }
    }
  }

  selectModel(modelID) {
    console.log('📋 modelConfig.selectModel called with:', modelID);
    console.log('   window.currentModelID before:', window.currentModelID);
    
    let displayName = modelID;
    
    // Get display name from dynamic model manager
    if (this.usesDynamicModels && this.dynamicModelManager) {
      const model = this.dynamicModelManager.getModel(modelID);
      if (model) {
        displayName = model.name;
      }
    }
    // If no display name found, use the model ID as fallback
    
    // Update display
    const selectedModelDiv = document.getElementById("selected-model");
    if (selectedModelDiv) {
      selectedModelDiv.textContent = displayName;
    }
    
    // Update current model
    this.currentModelID = modelID;
    window.currentModelID = modelID; // Update global reference for GPT-5 controls
    console.log('   window.currentModelID set to:', window.currentModelID);
    this.determineEndpoint(modelID);
    
    // Update GPT-5 controls visibility
    console.log('Model selected:', modelID, 'Is GPT-5:', modelID.startsWith('gpt-5'));
    
    if (window.gptPortalApp && window.gptPortalApp.updateGPT5ControlsVisibility) {
      console.log('Calling updateGPT5ControlsVisibility from app');
      window.gptPortalApp.updateGPT5ControlsVisibility();
    } else {
      console.log('App not ready, trying direct control update');
      // Fallback: directly update controls if app isn't ready
      this.updateGPT5ControlsDirect(modelID);
    }
    
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

  // Fallback method to update GPT-5 controls directly
  updateGPT5ControlsDirect(modelID) {
    const gpt5Controls = document.getElementById('gpt5-controls');
    console.log('GPT-5 controls element:', gpt5Controls);
    
    if (gpt5Controls) {
      if (modelID && modelID.startsWith('gpt-5')) {
        console.log('Showing GPT-5 controls');
        gpt5Controls.style.display = 'block';
      } else {
        console.log('Hiding GPT-5 controls');
        gpt5Controls.style.display = 'none';
      }
    } else {
      console.log('GPT-5 controls element not found');
    }
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
      name: modelID, // Use model ID as display name if no dynamic data available
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
      name: this.currentModelID, // Use model ID as display name if no dynamic data available
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