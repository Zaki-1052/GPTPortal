// GPTPortal - Refactored Main Application
// This file initializes and coordinates all application modules

class GPTPortalApp {
  constructor() {
    this.modelConfig = null;
    this.chatManager = null;
    this.uiManager = null;
    
    this.init();
  }

  async init() {
    try {
      // Initialize core modules in order
      this.modelConfig = new ModelConfig();
      await this.modelConfig.init();
      
      this.chatManager = new ChatManager(this.modelConfig);
      this.uiManager = new UIManager(this.modelConfig, this.chatManager);
      
      // Set up global references for backward compatibility
      this.setupGlobalReferences();
      
      // Initialize legacy functionality
      this.setupLegacyCompatibility();
      
      console.log('GPTPortal application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GPTPortal:', error);
    }
  }

  setupGlobalReferences() {
    // Expose instances globally for backward compatibility
    window.modelConfig = this.modelConfig;
    window.chatManager = this.chatManager;
    window.uiManager = this.uiManager;
    
    // Legacy global variables
    window.currentModelID = this.modelConfig.currentModelID;
    window.isGemini = this.modelConfig.isGemini;
    window.assistantsMode = this.modelConfig.assistantsMode;
    window.isAssistants = this.modelConfig.isAssistants;
    window.selectedImage = this.chatManager.selectedImage;
    window.baseURL = this.modelConfig.baseURL;
  }

  setupLegacyCompatibility() {
    // Legacy functions for backward compatibility
    window.selectModel = (modelID) => this.modelConfig.selectModel(modelID);
    window.sendMessage = () => this.chatManager.sendMessage();
    window.clearChat = () => this.chatManager.clearChat();
    window.exportChat = () => this.chatManager.exportChat();
    window.updateCurrentModelID = (modelID) => this.modelConfig.updateCurrentModelID(modelID);
    window.determineEndpoint = (modelID) => this.modelConfig.determineEndpoint(modelID);
    window.isSafariBrowser = () => this.modelConfig.isSafariBrowser();
    
    // Legacy model data
    window.modelID = this.modelConfig.modelID;
    window.customModelNames = this.modelConfig.customModelNames;
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

  // Utility methods
  async restartApp() {
    try {
      await this.init();
      console.log('Application restarted successfully');
    } catch (error) {
      console.error('Failed to restart application:', error);
    }
  }

  getAppState() {
    return {
      currentModel: this.modelConfig.currentModelID,
      conversationLength: this.chatManager.conversationHistory.length,
      sidebarVisible: this.uiManager.sidebarVisible,
      promptBarVisible: this.uiManager.promptBarVisible
    };
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
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
  window.gptPortalApp = new GPTPortalApp();
}