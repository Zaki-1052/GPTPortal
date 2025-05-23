// UI management and interface controls
class UIManager {
  constructor(modelConfig, chatManager) {
    this.modelConfig = modelConfig;
    this.chatManager = chatManager;
    this.sidebarVisible = false;
    this.promptBarVisible = false;
    
    this.init();
  }

  init() {
    this.setupModelSelector();
    this.setupSidebar();
    this.setupPromptBar();
    this.setupKeyboardShortcuts();
    this.setupFileUpload();
  }

  setupModelSelector() {
    const selectedModel = document.getElementById('selected-model');
    const modelOptions = document.getElementById('model-options');
    const modelSearch = document.getElementById('model-search');
    const showOpenRouter = document.getElementById('show-open-router');

    if (selectedModel && modelOptions) {
      // Click handler moved to dynamicModelManager.js to avoid conflicts
      // selectedModel.addEventListener('click', () => {
      //   modelOptions.style.display = modelOptions.style.display === 'block' ? 'none' : 'block';
      // });

      // Model option selection
      modelOptions.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          const modelId = e.target.getAttribute('data-value');
          this.modelConfig.selectModel(modelId);
        }
      });
    }

    // Model search functionality
    if (modelSearch) {
      modelSearch.addEventListener('input', (e) => {
        this.filterModels(e.target.value);
      });
    }

    // OpenRouter toggle
    if (showOpenRouter) {
      showOpenRouter.addEventListener('change', (e) => {
        this.toggleOpenRouterModels(e.target.checked);
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

  filterModels(searchTerm) {
    const modelOptions = document.getElementById('model-options');
    if (!modelOptions) return;

    const buttons = modelOptions.querySelectorAll('button');
    buttons.forEach(button => {
      const text = button.textContent.toLowerCase();
      const matches = text.includes(searchTerm.toLowerCase());
      button.style.display = matches ? 'block' : 'none';
    });
  }

  toggleOpenRouterModels(show) {
    const openRouterModels = document.querySelectorAll('.openrouter-model');
    openRouterModels.forEach(model => {
      model.style.display = show ? 'block' : 'none';
    });
  }

  setupSidebar() {
    const toggleArrow = document.getElementById('toggleArrow');
    const sidebar = document.getElementById('sidebar');

    if (toggleArrow && sidebar) {
      toggleArrow.addEventListener('click', () => {
        this.sidebarVisible = !this.sidebarVisible;
        sidebar.style.transform = this.sidebarVisible ? 'translateX(0)' : 'translateX(-100%)';
        toggleArrow.innerHTML = this.sidebarVisible ? '&#x25C0;' : '&#x25B6;';
      });
    }
  }

  setupPromptBar() {
    const toggleRightArrow = document.getElementById('toggleRightArrow');
    const promptBar = document.getElementById('promptBar');

    if (toggleRightArrow && promptBar) {
      toggleRightArrow.addEventListener('click', () => {
        this.promptBarVisible = !this.promptBarVisible;
        promptBar.style.transform = this.promptBarVisible ? 'translateX(0)' : 'translateX(100%)';
        toggleRightArrow.innerHTML = this.promptBarVisible ? '&#x25B6;' : '&#x25C0;';
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.chatManager.sendMessage();
      }
      
      // Escape to close modal/dropdown
      if (e.key === 'Escape') {
        const modelOptions = document.getElementById('model-options');
        if (modelOptions) {
          modelOptions.style.display = 'none';
        }
      }
      
      // Ctrl/Cmd + L to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        this.chatManager.clearChat();
      }
      
      // Ctrl/Cmd + S to save/export chat
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.chatManager.exportChat();
      }
    });
  }

  setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const imagePreview = document.getElementById('image-preview');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFileUpload(e.target.files[0]);
      });
    }

    if (uploadButton) {
      uploadButton.addEventListener('click', () => {
        fileInput?.click();
      });
    }
  }

  async handleFileUpload(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        if (file.type.startsWith('image/')) {
          this.chatManager.selectedImage = result.filename;
          this.showImagePreview(result.filename);
        } else {
          // Handle other file types
          this.addFileToChat(result.filename, file.name);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      this.showNotification('File upload failed', 'error');
    }
  }

  showImagePreview(filename) {
    const preview = document.getElementById('image-preview');
    if (preview) {
      preview.innerHTML = `
        <img src="/uploads/${filename}" alt="Preview" style="max-width: 200px; max-height: 150px;">
        <button onclick="this.parentElement.innerHTML=''; chatManager.selectedImage=null;">Remove</button>
      `;
    }
  }

  addFileToChat(filename, originalName) {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'file-attachment';
      fileDiv.innerHTML = `
        <span>📎 ${originalName}</span>
        <a href="/uploads/${filename}" target="_blank">View</a>
      `;
      chatContainer.appendChild(fileDiv);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  updateTokenCount(inputTokens, outputTokens, cost) {
    const tokenDisplay = document.getElementById('token-count');
    if (tokenDisplay) {
      tokenDisplay.innerHTML = `
        <span>In: ${inputTokens} | Out: ${outputTokens} | Cost: $${cost.toFixed(4)}</span>
      `;
    }
  }

  showLoading(show = true) {
    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
      loadingIndicator.style.display = show ? 'block' : 'none';
    }
  }
}

// Export for use in main script
window.UIManager = UIManager;