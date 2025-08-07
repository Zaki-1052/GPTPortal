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
    // Add CSS for sliders first
    this.addSliderCSS();
    
    // Enhanced temperature and token sliders
    this.setupTemperatureSlider();
    this.setupTokensSlider();
    
    // Enhanced sidebar toggles
    this.setupSidebarToggles();
    
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

  setupTemperatureSlider() {
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

    // Update display
    tempValueDisplay.textContent = (window.temperature || 1).toFixed(1);

    // Set initial color
    const initialTempPercentage = ((window.temperature || 1) - 0) / (2 - 0) * 100;
    const initialTempColor = initialTempPercentage < 50 
      ? `rgb(${Math.round(initialTempPercentage * 2.55)}, 255, 0)` 
      : `rgb(255, ${Math.round(255 - (initialTempPercentage - 50) * 5.1)}, 0)`;
    tempValueDisplay.style.color = initialTempColor;
    tempSlider.style.setProperty('--thumb-color', initialTempColor);

    // Remove any existing event listeners to avoid duplicates
    const newTempSlider = tempSlider.cloneNode(true);
    tempSlider.parentNode.replaceChild(newTempSlider, tempSlider);

    newTempSlider.addEventListener('input', function() {
      window.temperature = parseFloat(this.value);
      tempValueDisplay.textContent = window.temperature.toFixed(1);
      
      const tempPercentage = (window.temperature - 0) / (2 - 0) * 100;
      const tempColor = tempPercentage < 50 
        ? `rgb(${Math.round(tempPercentage * 2.55)}, 255, 0)` 
        : `rgb(255, ${Math.round(255 - (tempPercentage - 50) * 5.1)}, 0)`;
      
      tempValueDisplay.style.color = tempColor;
      this.style.setProperty('--thumb-color', tempColor);

      console.log('Temperature updated:', window.temperature);
    });
  }

  setupTokensSlider() {
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

    // Set initial color - start with blue for default value
    const initialTokensColor = 'rgb(0, 128, 255)'; // Blue color for initial state
    tokensValueDisplay.style.color = initialTokensColor;
    tokensSlider.style.setProperty('--thumb-color', initialTokensColor);

    // Remove any existing event listeners to avoid duplicates
    const newTokensSlider = tokensSlider.cloneNode(true);
    tokensSlider.parentNode.replaceChild(newTokensSlider, tokensSlider);

    newTokensSlider.addEventListener('input', (e) => {
      window.tokens = parseInt(e.target.value);
      tokensValueDisplay.textContent = window.tokens.toLocaleString();
      
      const maxTokens = this.getMaxTokensByModel(window.currentModelID || 'default');
      const tokensPercentage = (window.tokens - 1000) / (maxTokens - 1000) * 100;
      const tokensColor = tokensPercentage < 50 
        ? `rgb(${Math.round(tokensPercentage * 2.55)}, 255, 0)` 
        : `rgb(255, ${Math.round(255 - (tokensPercentage - 50) * 5.1)}, 0)`;
      
      tokensValueDisplay.style.color = tokensColor;
      e.target.style.setProperty('--thumb-color', tokensColor);

      console.log('Tokens updated:', window.tokens);
    });
    
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

  setupSidebarToggles() {
    // Left sidebar toggle
    const toggleArrow = document.getElementById('toggleArrow');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleArrow && sidebar) {
      toggleArrow.addEventListener('click', () => {
        const isVisible = sidebar.style.display === 'block';
        sidebar.style.display = isVisible ? 'none' : 'block';
        toggleArrow.innerHTML = isVisible ? '&#x25B6;' : '&#x25C0;';
      });
    }

    // Right sidebar toggle
    const toggleRightArrow = document.getElementById('toggleRightArrow');
    const promptBar = document.getElementById('promptBar');
    
    if (toggleRightArrow && promptBar) {
      toggleRightArrow.addEventListener('click', () => {
        const isVisible = promptBar.style.display === 'block';
        promptBar.style.display = isVisible ? 'none' : 'block';
        toggleRightArrow.innerHTML = isVisible ? '&#x25C0;' : '&#x25B6;';
      });
    }
  }

  setupEnhancedKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
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
    });
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
      // Set initial blue color instead of triggering input event
      const initialTokensColor = 'rgb(0, 128, 255)';
      tokensValue.style.color = initialTokensColor;
      tokensSlider.style.setProperty('--thumb-color', initialTokensColor);
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

  addSliderCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .slider-container {
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      
      .slider-container label {
        font-weight: bold;
        color: white;
        min-width: 120px;
      }
      
      #temperature-slider, #tokens-slider {
        flex-grow: 1;
        height: 8px;
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(to right, #0000ff 0%, #00ff00 50%, #ffff00 75%, #ff0000 100%);
        outline: none;
        border-radius: 5px;
        --thumb-color: rgb(0, 255, 0);
      }
      
      #tokens-slider {
        background: linear-gradient(to right, #0000ff 0%, #00ff00 50%, #ffff00 75%, #ff0000 100%);
      }
      
      #temperature-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--thumb-color, #00ff00);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      #tokens-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--thumb-color, #00ff00);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      #temperature-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--thumb-color, #00ff00);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      #tokens-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--thumb-color, #00ff00);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      #temperature-value, #tokens-value {
        font-weight: bold;
        min-width: 40px;
        color: #00ff00;
      }
      
      #tokens-limit {
        font-size: 0.9em;
        color: #666;
      }
      
      #model-token-limit {
        color: #ccc;
      }
      
      /* GPT-5 Specific Controls */
      #gpt5-controls {
        margin-top: 15px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      #reasoning-effort-container,
      #verbosity-container {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      
      #reasoning-effort-container label,
      #verbosity-container label {
        min-width: 120px;
        font-weight: bold;
        color: #fff;
      }
      
      #reasoning-effort-select,
      #verbosity-select {
        flex: 1;
        padding: 5px 10px;
        background: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        font-size: 14px;
      }
      
      #reasoning-effort-select:focus,
      #verbosity-select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
      
      .param-help {
        font-size: 12px;
        color: #aaa;
        margin-left: 10px;
      }
    `;
    document.head.appendChild(style);
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing GPTPortal Enhanced...');
  window.gptPortalApp = new GPTPortalApp();
});

// Fallback initialization for immediate script loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.gptPortalApp) {
      window.gptPortalApp = new GPTPortalApp();
    }
  });
} else {
  if (!window.gptPortalApp) {
    window.gptPortalApp = new GPTPortalApp();
  }
}