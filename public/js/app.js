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
        currentModelID: 'gpt-4o',
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
  }

  setupTemperatureSlider() {
    let tempSliderContainer = document.getElementById('temperature-slider-container');
    if (!tempSliderContainer) {
      tempSliderContainer = document.createElement('div');
      tempSliderContainer.id = 'temperature-slider-container';
      tempSliderContainer.className = 'slider-container';
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.appendChild(tempSliderContainer);
      }
    }

    let tempSlider = document.getElementById('temperature-slider');
    if (!tempSlider) {
      tempSlider = document.createElement('input');
      tempSlider.type = 'range';
      tempSlider.id = 'temperature-slider';
      tempSlider.min = '0';
      tempSlider.max = '2';
      tempSlider.step = '0.1';
      tempSlider.value = window.temperature || 1;
      tempSliderContainer.appendChild(tempSlider);
    }

    let tempValueDisplay = document.getElementById('temperature-value');
    if (!tempValueDisplay) {
      tempValueDisplay = document.createElement('span');
      tempValueDisplay.id = 'temperature-value';
      tempSliderContainer.appendChild(tempValueDisplay);
    }

    tempValueDisplay.textContent = (window.temperature || 1).toFixed(1);

    tempSlider.addEventListener('input', function() {
      window.temperature = parseFloat(this.value);
      tempValueDisplay.textContent = window.temperature.toFixed(1);
      
      const tempPercentage = (window.temperature - 0) / (2 - 0) * 100;
      const tempColor = tempPercentage < 50 
        ? `rgb(${tempPercentage * 2.55}, ${255}, 0)` 
        : `rgb(255, ${255 - (tempPercentage - 50) * 5.1}, 0)`;
      
      tempValueDisplay.style.color = tempColor;
      this.style.setProperty('--thumb-color', tempColor);

      console.log('Temperature updated:', window.temperature);
    });
  }

  setupTokensSlider() {
    let tokensSliderContainer = document.getElementById('tokens-slider-container');
    if (!tokensSliderContainer) {
      tokensSliderContainer = document.createElement('div');
      tokensSliderContainer.id = 'tokens-slider-container';
      tokensSliderContainer.className = 'slider-container';
      
      const tempContainer = document.getElementById('temperature-slider-container');
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.insertBefore(tokensSliderContainer, tempContainer.nextSibling);
      }
    }

    if (!document.getElementById('tokens-slider')) {
      const tokensLabel = document.createElement('label');
      tokensLabel.htmlFor = 'tokens-slider';
      tokensLabel.textContent = 'Max Tokens:';
      tokensSliderContainer.appendChild(tokensLabel);

      const tokensSlider = document.createElement('input');
      tokensSlider.type = 'range';
      tokensSlider.id = 'tokens-slider';
      tokensSlider.min = '1000';
      tokensSlider.max = '100000';
      tokensSlider.step = '500';
      tokensSlider.value = window.tokens || 8000;
      tokensSliderContainer.appendChild(tokensSlider);

      const tokensValueDisplay = document.createElement('span');
      tokensValueDisplay.id = 'tokens-value';
      tokensValueDisplay.textContent = (window.tokens || 8000).toLocaleString();
      tokensSliderContainer.appendChild(tokensValueDisplay);

      const tokensLimitDisplay = document.createElement('span');
      tokensLimitDisplay.id = 'tokens-limit';
      tokensLimitDisplay.innerHTML = ' (Model limit: <span id="model-token-limit">8000</span>)';
      tokensSliderContainer.appendChild(tokensLimitDisplay);

      tokensSlider.addEventListener('input', function() {
        window.tokens = parseInt(this.value);
        tokensValueDisplay.textContent = window.tokens.toLocaleString();
        
        const maxTokens = this.getMaxTokensByModel(window.currentModelID || 'default');
        const tokensPercentage = (window.tokens - 1000) / (maxTokens - 1000) * 100;
        const tokensColor = tokensPercentage < 50 
          ? `rgb(${tokensPercentage * 2.55}, ${255}, 0)` 
          : `rgb(255, ${255 - (tokensPercentage - 50) * 5.1}, 0)`;
        
        tokensValueDisplay.style.color = tokensColor;
        this.style.setProperty('--thumb-color', tokensColor);

        console.log('Tokens updated:', window.tokens);
      }.bind(this));
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
    if (selectedModelDiv && selectedModelDiv.textContent === 'Loading models...') {
      if (this.dynamicModelManager && this.dynamicModelManager.models) {
        const modelCount = Object.keys(this.dynamicModelManager.models).length;
        console.log(`Ready with ${modelCount} models available`);
      }
      
      // Set default model
      if (this.modelConfig && this.modelConfig.currentModelID) {
        if (this.dynamicModelManager) {
          const model = this.dynamicModelManager.getModel(this.modelConfig.currentModelID);
          if (model) {
            selectedModelDiv.textContent = model.name;
          } else {
            selectedModelDiv.textContent = this.modelConfig.currentModelID;
          }
        } else {
          selectedModelDiv.textContent = this.modelConfig.currentModelID;
        }
      } else {
        selectedModelDiv.textContent = 'Select a Model';
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