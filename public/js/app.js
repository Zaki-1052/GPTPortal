// GPTPortal Enhanced Application - Complete Integration
class GPTPortalApp {
  constructor() {
    this.modelConfig = null;
    this.chatManager = null;
    this.uiManager = null;
    this.dynamicModelManager = null;
    this.initialized = false;
    
    this.init();
  }

  async init() {
    try {
      console.log('Initializing Enhanced GPTPortal Application...');
      
      // Initialize in correct order
      await this.initializeModelConfig();
      await this.initializeDynamicModelManager();
      await this.initializeChatManager();
      await this.initializeUIManager();
      
      // Set up global references for backward compatibility
      this.setupGlobalReferences();
      
      // Initialize legacy functionality
      this.setupLegacyCompatibility();
      
      // Setup enhanced features
      this.setupEnhancedFeatures();
      
      this.initialized = true;
      console.log('GPTPortal Enhanced Application initialized successfully');
      
      // Initialize sliders after everything is set up
      this.initializeSliders();
      
      // Show successful initialization
      this.showInitializationSuccess();
      
    } catch (error) {
      console.error('Failed to initialize GPTPortal:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeModelConfig() {
    console.log('Initializing model configuration...');
    
    // Use enhanced model config if available
    if (window.ModelConfig) {
      this.modelConfig = new window.ModelConfig();
      if (this.modelConfig.init) {
        await this.modelConfig.init();
      }
    } else {
      console.warn('ModelConfig not available, using basic configuration');
      this.modelConfig = {
        currentModelID: 'gpt-4.1',
        isGemini: false,
        isAssistants: false,
        baseURL: window.location.origin
      };
    }
    
    console.log('Model configuration initialized');
  }

  async initializeDynamicModelManager() {
    console.log('Initializing dynamic model manager...');
    
    if (window.DynamicModelManager) {
      this.dynamicModelManager = new window.DynamicModelManager();
      
      // Integrate with model config
      if (this.modelConfig) {
        this.modelConfig.dynamicModelManager = this.dynamicModelManager;
      }
      
      console.log('Dynamic model manager initialized');
    } else {
      console.warn('DynamicModelManager not available');
    }
  }

  async initializeChatManager() {
    console.log('Initializing chat manager...');
    
    if (window.ChatManager) {
      this.chatManager = new window.ChatManager(this.modelConfig);
      console.log('Chat manager initialized');
    } else {
      console.warn('ChatManager not available, using basic chat functionality');
      this.chatManager = {
        sendMessage: () => console.log('Basic send message'),
        clearChat: () => console.log('Basic clear chat'),
        exportChat: () => console.log('Basic export chat')
      };
    }
  }

  async initializeUIManager() {
    console.log('Initializing UI manager...');
    
    if (window.UIManager) {
      this.uiManager = new window.UIManager(this.modelConfig, this.chatManager);
      
      // Give chatManager a reference to uiManager for two-way communication
      if (this.chatManager) {
        this.chatManager.uiManager = this.uiManager;
      }
      
      console.log('UI manager initialized');
    } else {
      console.warn('UIManager not available, using basic UI functionality');
      this.uiManager = {
        setupKeyboardShortcuts: () => console.log('Basic keyboard shortcuts'),
        toggleSidebar: () => console.log('Basic sidebar toggle')
      };
    }
  }

  setupGlobalReferences() {
    // Expose instances globally for backward compatibility
    window.gptPortalApp = this;
    window.modelConfig = this.modelConfig;
    window.chatManager = this.chatManager;
    window.uiManager = this.uiManager;
    window.dynamicModelManager = this.dynamicModelManager;
    
    // Legacy global variables
    window.currentModelID = this.modelConfig.currentModelID;
    window.baseURL = this.modelConfig.baseURL || window.location.origin;
    window.selectedImage = this.chatManager ? this.chatManager.selectedImage : null;
    
    // Temperature and tokens (from original script.js)
    if (typeof window.temperature === 'undefined') {
      window.temperature = 1;
    }
    if (typeof window.tokens === 'undefined') {
      window.tokens = 8000;
    }
    
    // Voice mode variables
    if (typeof window.voiceMode === 'undefined') {
      window.voiceMode = false;
    }
    if (typeof window.mediaRecorder === 'undefined') {
      window.mediaRecorder = null;
    }
    if (typeof window.audioChunks === 'undefined') {
      window.audioChunks = [];
    }
    if (typeof window.isVoiceTranscription === 'undefined') {
      window.isVoiceTranscription = false;
    }
  }

  setupLegacyCompatibility() {
    // Legacy functions for backward compatibility with original script.js
    window.selectModel = (modelID) => {
      if (this.dynamicModelManager) {
        this.dynamicModelManager.selectModel(modelID);
      } else if (this.modelConfig && this.modelConfig.selectModel) {
        this.modelConfig.selectModel(modelID);
      } else {
        console.log('Selecting model:', modelID);
        window.currentModelID = modelID;
      }
    };
    
    window.sendMessage = () => {
      if (this.chatManager && this.chatManager.sendMessage) {
        this.chatManager.sendMessage();
      } else {
        console.log('Basic send message');
      }
    };
    
    window.clearChat = () => {
      if (this.chatManager && this.chatManager.clearChat) {
        this.chatManager.clearChat();
      } else {
        console.log('Basic clear chat');
      }
    };
    
    window.exportChatHistory = () => {
      if (this.chatManager && this.chatManager.exportChatHistory) {
        this.chatManager.exportChatHistory();
      } else {
        console.log('Basic export chat');
      }
    };
    
    window.updateCurrentModelID = (modelID) => {
      if (this.modelConfig && this.modelConfig.updateCurrentModelID) {
        this.modelConfig.updateCurrentModelID(modelID);
      } else {
        window.currentModelID = modelID;
      }
    };
    
    window.determineEndpoint = (modelID) => {
      if (this.modelConfig && this.modelConfig.determineEndpoint) {
        return this.modelConfig.determineEndpoint(modelID);
      } else {
        // Basic endpoint determination
        if (modelID && modelID.startsWith('gemini')) {
          return window.baseURL + '/gemini';
        } else {
          return window.baseURL + '/message';
        }
      }
    };
    
    window.isSafariBrowser = () => {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    // Copy functionality
    window.copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard!');
      }).catch(err => {
        console.error('Error copying text: ', err);
      });
    };

    // Model data for legacy compatibility
    if (this.modelConfig && this.modelConfig.modelID) {
      window.modelID = this.modelConfig.modelID;
    }
    if (this.modelConfig && this.modelConfig.customModelNames) {
      window.customModelNames = this.modelConfig.customModelNames;
    }
  }

  setupEnhancedFeatures() {
    // Sliders are styled by Stage 1 tokens (no runtime <style> injection).

    // Theme toggle (light/dark) + persistence
    this.setupThemeToggle();

    // Enhanced temperature and token sliders
    this.setupTemperatureSlider();
    this.setupTokensSlider();

    // Sidebar toggles are owned by UIManager (single source of truth).

    // Enhanced keyboard shortcuts
    this.setupEnhancedKeyboardShortcuts();
    
    // Enhanced file upload status
    this.setupFileUploadStatus();
    
    // Enhanced Assistant Mode
    this.setupAssistantMode();
    
    // Prompt caching controls
    this.setupPromptCacheControls();
    
    // Fix model selector dropdown
    this.fixModelSelector();
    
    // Ensure model selector is populated (only if models are already loaded)
    if (this.dynamicModelManager && this.dynamicModelManager.models && Object.keys(this.dynamicModelManager.models).length > 0) {
      this.dynamicModelManager.populateModelSelector();
    }
  }

  /**
   * Wire the header #theme-toggle to flip [data-theme] on <html> and persist
   * to localStorage('gptportal-theme'); apply the saved/preferred theme on load.
   * The portal.html <head> bootstrap sets the theme pre-paint (and may attach
   * its own click handler), so we clone-replace the button to guarantee a
   * single canonical listener here.
   */
  setupThemeToggle() {
    if (this._themeToggleInitialized) return;

    const KEY = 'gptportal-theme';
    const root = document.documentElement;

    // Apply-on-load: honor a saved choice, else the OS preference. The head
    // bootstrap usually set this pre-paint; recompute defensively (no persist).
    if (!root.getAttribute('data-theme')) {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      root.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'));
    }

    const btn = document.getElementById('theme-toggle');
    if (!btn) {
      this._themeToggleInitialized = true;
      return;
    }

    // Drop any listener wired in portal.html by replacing the node, then own
    // the click behavior here so a single toggle fires per click.
    const freshBtn = btn.cloneNode(true);
    if (btn.parentNode) {
      btn.parentNode.replaceChild(freshBtn, btn);
    }

    freshBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      console.log('Theme set to:', next);
    });

    this._themeToggleInitialized = true;
  }

  setupTemperatureSlider() {
    // Prevent re-initialization
    if (this._temperatureSliderInitialized) {
      console.log('Temperature slider already initialized, skipping...');
      return;
    }

    // Use existing elements from HTML
    const tempSlider = document.getElementById('temperature-slider');
    const tempValueDisplay = document.getElementById('temperature-value');
    const tempSliderContainer = document.getElementById('temperature-slider-container');

    if (!tempSlider || !tempValueDisplay || !tempSliderContainer) {
      console.warn('Temperature slider elements not found in HTML');
      return;
    }

    // Update the label text to match original
    const label = tempSliderContainer.querySelector('label');
    if (label) {
      label.textContent = 'Adjust Temperature:';
    }

    // Set slider attributes
    tempSlider.min = '0';
    tempSlider.max = '2';
    tempSlider.step = '0.1';
    tempSlider.value = window.temperature || 1;

    // Update display (track/thumb/value colors come from Stage 1 tokens)
    tempValueDisplay.textContent = (window.temperature || 1).toFixed(1);

    // Add event listener (only once since we prevent re-initialization)
    const tempInputHandler = function() {
      window.temperature = parseFloat(this.value);
      tempValueDisplay.textContent = window.temperature.toFixed(1);
      console.log('Temperature updated:', window.temperature);
    };

    tempSlider.addEventListener('input', tempInputHandler);
    this._temperatureSliderInitialized = true;
    this._tempInputHandler = tempInputHandler;
  }

  setupTokensSlider() {
    // Prevent re-initialization
    if (this._tokensSliderInitialized) {
      console.log('Tokens slider already initialized, skipping...');
      return;
    }

    // Use existing elements from HTML
    const tokensSlider = document.getElementById('tokens-slider');
    const tokensValueDisplay = document.getElementById('tokens-value');
    const tokensSliderContainer = document.getElementById('tokens-slider-container');
    const tokensLimitDisplay = document.getElementById('tokens-limit');
    const modelTokenLimit = document.getElementById('model-token-limit');

    if (!tokensSlider || !tokensValueDisplay || !tokensSliderContainer) {
      console.warn('Tokens slider elements not found in HTML');
      return;
    }

    // Set slider attributes
    tokensSlider.min = '1000';
    tokensSlider.max = '100000';
    tokensSlider.step = '500';
    tokensSlider.value = window.tokens || 8000;

    // Update display
    tokensValueDisplay.textContent = (window.tokens || 8000).toLocaleString();

    // Ensure model limit display exists
    if (modelTokenLimit) {
      modelTokenLimit.textContent = '8000';
    }

    // Add event listener (only once since we prevent re-initialization).
    // Track/thumb/value colors come from Stage 1 tokens.
    const tokensInputHandler = (e) => {
      window.tokens = parseInt(e.target.value);
      tokensValueDisplay.textContent = window.tokens.toLocaleString();
      console.log('Tokens updated:', window.tokens);
    };

    tokensSlider.addEventListener('input', tokensInputHandler);
    this._tokensSliderInitialized = true;
    this._tokensInputHandler = tokensInputHandler;

    // Setup GPT-5 specific controls
    this.setupGPT5Controls();
  }

  setupGPT5Controls() {
    const reasoningEffortSelect = document.getElementById('reasoning-effort-select');
    const verbositySelect = document.getElementById('verbosity-select');
    
    // Initialize global variables
    window.reasoningEffort = 'medium';
    window.verbosity = 'medium';
    
    if (reasoningEffortSelect) {
      reasoningEffortSelect.addEventListener('change', (e) => {
        window.reasoningEffort = e.target.value;
        console.log('Reasoning effort updated:', window.reasoningEffort);
      });
    }
    
    if (verbositySelect) {
      verbositySelect.addEventListener('change', (e) => {
        window.verbosity = e.target.value;
        console.log('Verbosity updated:', window.verbosity);
      });
    }
    
    // Show/hide GPT-5 controls based on model selection
    this.updateGPT5ControlsVisibility();
  }

  updateGPT5ControlsVisibility() {
    const gpt5Controls = document.getElementById('gpt5-controls');
    const currentModelID = window.currentModelID || '';
    
    console.log('updateGPT5ControlsVisibility called');
    console.log('currentModelID:', currentModelID);
    console.log('gpt5Controls element:', gpt5Controls);
    console.log('Is GPT-5:', currentModelID.startsWith('gpt-5'));
    
    if (gpt5Controls) {
      if (currentModelID.startsWith('gpt-5')) {
        console.log('Showing GPT-5 controls via app');
        gpt5Controls.style.display = 'block';
      } else {
        console.log('Hiding GPT-5 controls via app');
        gpt5Controls.style.display = 'none';
      }
    } else {
      console.log('GPT-5 controls element not found in app');
    }
  }

  updateReasoningEffortDefault(modelID) {
    const reasoningEffortSelect = document.getElementById('reasoning-effort-select');
    if (!reasoningEffortSelect || !modelID) return;

    // Get model metadata from dynamic model manager
    let defaultEffort = 'medium'; // fallback
    if (this.modelConfig?.dynamicModelManager) {
      const model = this.modelConfig.dynamicModelManager.getModel(modelID);
      if (model?.defaultReasoningEffort) {
        defaultEffort = model.defaultReasoningEffort;
      }
    }

    // Update dropdown and global variable
    reasoningEffortSelect.value = defaultEffort;
    window.reasoningEffort = defaultEffort;

    console.log(`Reasoning effort set to ${defaultEffort} for model ${modelID}`);
  }

  getMaxTokensByModel(modelID) {
    // From original script.js
    if (modelID === 'gpt-4') {
      return 6000;
    } else if (modelID === 'gpt-4o-mini') {
      return 16000;
    } else if (modelID === 'gpt-4o') {
      return 16000;
    } else if (modelID && modelID.startsWith('llama-3.1')) {
      return 8000;
    } else if (modelID === 'claude-3-7-sonnet-latest') {
      return 100000;
    } else if (modelID === 'claude-opus-4-20250514' || modelID === 'claude-sonnet-4-20250514') {
      return 100000;
    } else if (modelID && modelID.startsWith('claude')) {
      return 8000;
    } else {
      return 8000;
    }
  }


  setupEnhancedKeyboardShortcuts() {
    // Avoid duplicate keyboard shortcut listeners
    if (this._keyboardShortcutsAttached) {
      console.log('Keyboard shortcuts already attached, skipping...');
      return;
    }

    const keyboardHandler = (event) => {
      // Ctrl/Cmd + Enter to send message
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        window.sendMessage();
      }

      // Escape to close dropdown
      if (event.key === 'Escape') {
        const modelOptions = document.getElementById('model-options');
        if (modelOptions) {
          modelOptions.style.display = 'none';
        }
      }

      // Ctrl/Cmd + L to clear chat
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        window.clearChat();
      }

      // Ctrl/Cmd + S to save/export chat
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        window.exportChatHistory();
      }

      // SHIFT+ESC for focusing the chat input
      if (event.shiftKey && event.key === 'Escape') {
        event.preventDefault();
        const messageInput = document.getElementById('message-input');
        if (messageInput) messageInput.focus();
      }

      // CMD+SHIFT+V for toggling voice mode
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        if (window.voice) window.voice();
      }

      // CMD+SHIFT+F for focusing the file input
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
          fileInput.click();
        }
      }

      // CMD+SHIFT+A for toggling Assistant Mode
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        const modeSelector = document.getElementById('mode-selector');
        if (modeSelector) {
          modeSelector.click();
        }
      }
    };

    document.addEventListener('keydown', keyboardHandler);
    this._keyboardShortcutsAttached = true;
    this._keyboardHandler = keyboardHandler;
  }

  setupFileUploadStatus() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const uploadStatus = document.getElementById('upload-status');
        if (uploadStatus) {
          if (file) {
            uploadStatus.textContent = 'File Uploaded: ' + file.name;
          } else {
            uploadStatus.textContent = 'No file selected or unsupported file type';
          }
        }
      });
    }
  }

  setupAssistantMode() {
    const modeSelector = document.getElementById('mode-selector');
    if (modeSelector) {
      modeSelector.addEventListener('click', () => {
        if (this.modelConfig) {
          this.modelConfig.assistantsMode = !this.modelConfig.assistantsMode;
          
          if (this.modelConfig.assistantsMode) {
            modeSelector.style.backgroundColor = '#4CAF50';
            modeSelector.textContent = 'Assistants Mode ON';
            this.modelConfig.isAssistants = true;
            this.modelConfig.currentModelID = 'gpt-4-turbo';
          } else {
            modeSelector.style.backgroundColor = '';
            modeSelector.textContent = 'Assistants Mode';
            this.modelConfig.isAssistants = false;
          }

          console.log("Assistants Mode:", this.modelConfig.assistantsMode);
        }
      });
    }
  }

  showInitializationSuccess() {
    // Update loading indicator
    const loadingModels = document.getElementById('loading-models');
    if (loadingModels) {
      loadingModels.style.display = 'none';
    }
    
    // Show ready status
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv && (selectedModelDiv.textContent === 'Loading models...' || selectedModelDiv.textContent === 'Select a Model')) {
      if (this.dynamicModelManager && this.dynamicModelManager.models) {
        const modelCount = Object.keys(this.dynamicModelManager.models).length;
        console.log(`Ready with ${modelCount} models available`);
      }
      
      // Keep showing "Select a Model" until first message is sent
      selectedModelDiv.textContent = 'Select a Model';
      
      // Still set up the model ID in the background for when it's needed
      if (this.modelConfig && this.modelConfig.currentModelID) {
        // Update global currentModelID for backward compatibility
        window.currentModelID = this.modelConfig.currentModelID;
      }
    }

    console.log('GPTPortal is ready!');
  }

  handleInitializationError(error) {
    console.error('Initialization failed:', error);
    
    // Show error in UI
    const selectedModelDiv = document.getElementById('selected-model');
    if (selectedModelDiv) {
      selectedModelDiv.textContent = 'Error loading models';
    }
    
    const loadingModels = document.getElementById('loading-models');
    if (loadingModels) {
      loadingModels.innerHTML = `
        <div style="color: #e66767; text-align: center; padding: 20px;">
          <strong>Error loading models</strong><br>
          <small>Using fallback functionality</small>
        </div>
      `;
    }
  }

  // Public API methods
  getModelConfig() {
    return this.modelConfig;
  }

  getChatManager() {
    return this.chatManager;
  }

  getUIManager() {
    return this.uiManager;
  }

  getDynamicModelManager() {
    return this.dynamicModelManager;
  }

  isInitialized() {
    return this.initialized;
  }

  initializeSliders() {
    // Make sure sliders work with existing HTML elements and have proper initial values
    const tempSlider = document.getElementById('temperature-slider');
    const tokensSlider = document.getElementById('tokens-slider');
    const tempValue = document.getElementById('temperature-value');
    const tokensValue = document.getElementById('tokens-value');
    
    if (tempSlider && tempValue) {
      tempSlider.value = window.temperature || 1;
      tempValue.textContent = (window.temperature || 1).toFixed(1);
      // Trigger initial color update
      tempSlider.dispatchEvent(new Event('input'));
    }
    
    if (tokensSlider && tokensValue) {
      tokensSlider.value = window.tokens || 8000;
      tokensValue.textContent = (window.tokens || 8000).toLocaleString();
      // Track/thumb/value colors are supplied by Stage 1 tokens.
    }
  }

  // Utility methods
  async restartApp() {
    try {
      this.initialized = false;
      await this.init();
      console.log('Application restarted successfully');
    } catch (error) {
      console.error('Failed to restart application:', error);
    }
  }

  getAppState() {
    return {
      initialized: this.initialized,
      currentModel: this.modelConfig ? this.modelConfig.currentModelID : 'unknown',
      conversationLength: this.chatManager ? this.chatManager.conversationHistory.length : 0,
      modelCount: this.dynamicModelManager ? Object.keys(this.dynamicModelManager.models || {}).length : 0,
      temperature: window.temperature,
      tokens: window.tokens
    };
  }

  fixModelSelector() {
    console.log('🔧 fixModelSelector() called');
    const selectedModel = document.getElementById('selected-model');
    const modelOptions = document.getElementById('model-options');
    const modelSelector = document.getElementById('model-selector-container');
    
    if (selectedModel && modelOptions && modelSelector) {
      console.log('🔧 Before fixModelSelector - display:', window.getComputedStyle(modelOptions).display);
      // Make sure container has proper positioning
      modelSelector.style.position = 'relative';
      
      // Ensure the dropdown toggle works
      selectedModel.style.cursor = 'pointer';
      
      // Don't add any click handlers here - let dynamicModelManager handle all click events
      // This prevents duplicate event handlers
      
      // Ensure dropdown styling - let CSS handle positioning, just ensure basic properties
      modelOptions.style.backgroundColor = '#2a2a2a';
      modelOptions.style.border = '1px solid #555';
      modelOptions.style.borderRadius = '5px';
      modelOptions.style.zIndex = '1000';
      modelOptions.style.maxHeight = '300px';
      modelOptions.style.overflowY = 'auto';
      modelOptions.style.padding = '10px';
      modelOptions.style.display = 'none'; // Initially hidden
      
      console.log('🔧 After fixModelSelector - display set to none');
      console.log('🔧 After fixModelSelector - computed display:', window.getComputedStyle(modelOptions).display);
    }
  }

  setupPromptCacheControls() {
    console.log('Setting up prompt cache controls...');
    
    const cacheToggle = document.getElementById('enable-prompt-cache');
    if (!cacheToggle) {
      console.warn('Prompt cache toggle not found in DOM');
      return;
    }

    // Load saved preferences
    if (this.modelConfig && typeof this.modelConfig.loadCachePreferences === 'function') {
      this.modelConfig.loadCachePreferences();
    }

    // Add event listener for cache toggle
    cacheToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      console.log('Prompt cache toggled:', enabled);
      
      if (this.modelConfig && typeof this.modelConfig.updatePromptCacheEnabled === 'function') {
        this.modelConfig.updatePromptCacheEnabled(enabled);
      }
    });

    // Initialize visibility based on current model
    if (this.modelConfig && typeof this.modelConfig.updateCacheControlVisibility === 'function') {
      this.modelConfig.updateCacheControlVisibility();
    }

    console.log('Prompt cache controls initialized');
  }
}

// Initialize the application when DOM is ready
// Use a single initialization path to prevent duplicate instances
function initializeApp() {
  if (window.gptPortalApp) {
    console.log('GPTPortalApp already initialized, skipping...');
    return;
  }

  console.log('Initializing GPTPortal Enhanced...');
  window.gptPortalApp = new GPTPortalApp();
}

// Single initialization path - avoid race conditions
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded, initialize immediately
  initializeApp();
}