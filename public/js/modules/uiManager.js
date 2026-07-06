// UI management and interface controls
class UIManager {
  constructor(modelConfig, chatManager) {
    this.modelConfig = modelConfig;
    this.chatManager = chatManager;
    this.sidebarVisible = false;
    this.promptBarVisible = false;
    this.listenersAttached = false;

    this.init();
  }

  init() {
    // Only initialize once to prevent duplicate event listeners
    if (this.listenersAttached) {
      console.log('UIManager already initialized, skipping...');
      return;
    }

    this.setupModelSelector();
    this.setupSidebar();
    this.setupPromptBar();
    this.setupKeyboardShortcuts();
    this.setupFileUpload();
    this.setupDragAndDrop();

    this.listenersAttached = true;
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
      button.hidden = !matches;
    });
  }

  toggleOpenRouterModels(show) {
    const openRouterModels = document.querySelectorAll('.openrouter-model');
    openRouterModels.forEach(model => {
      model.hidden = !show;
    });
  }

  setupSidebar() {
    // Single source of truth for the sidebar toggle. Visibility is a class
    // (#sidebar.is-open) so the CSS owns the transition and there is no inline
    // style string to key selectors off. The toggle keeps its SVG glyph; only
    // aria-expanded reflects state.
    const toggleArrow = document.getElementById('toggleArrow');
    const sidebar = document.getElementById('sidebar');

    if (toggleArrow && sidebar) {
      toggleArrow.setAttribute('aria-expanded', 'false');
      toggleArrow.addEventListener('click', () => {
        this.sidebarVisible = sidebar.classList.toggle('is-open');
        toggleArrow.setAttribute('aria-expanded', this.sidebarVisible ? 'true' : 'false');
      });
    }
  }

  setupPromptBar() {
    // Off-canvas prompt bar: revealed via #promptBar.is-open, consistent with
    // the sidebar. No inline styles, no glyph swap.
    const toggleRightArrow = document.getElementById('toggleRightArrow');
    const promptBar = document.getElementById('promptBar');

    if (toggleRightArrow && promptBar) {
      toggleRightArrow.setAttribute('aria-expanded', 'false');
      toggleRightArrow.addEventListener('click', () => {
        this.promptBarVisible = promptBar.classList.toggle('is-open');
        toggleRightArrow.setAttribute('aria-expanded', this.promptBarVisible ? 'true' : 'false');
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
    const clipboardButton = document.getElementById('clipboard-button');

    // File input change handler removed - handled by ChatManager to prevent duplicates

    if (clipboardButton && fileInput) {
      // Remove any existing listeners first by cloning
      const newClipboardButton = clipboardButton.cloneNode(true);
      clipboardButton.parentNode.replaceChild(newClipboardButton, clipboardButton);
      
      newClipboardButton.addEventListener('click', (e) => {
        console.log('=== Clipboard button clicked ===');
        console.log('Timestamp:', new Date().toISOString());
        e.stopPropagation();
        e.preventDefault();
        
        if (fileInput) {
          fileInput.click();
        }
      });
    }
  }

  setupDragAndDrop() {
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    
    // Create visual feedback element. All presentation (fixed overlay, blur,
    // centering) lives in the stylesheet; visibility is the .is-active class.
    const dropZone = document.createElement('div');
    dropZone.id = 'drop-zone';
    dropZone.innerHTML = `
      <div class="drop-zone-content">
        <div class="drop-zone-icon">
          <svg class="icon" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="drop-zone-text">Drop files here to upload</div>
      </div>
    `;
    document.body.appendChild(dropZone);

    // Prevent default drag behaviors on document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Show drop zone when dragging over the document
    document.addEventListener('dragenter', (e) => {
      if (e.dataTransfer.types.includes('Files')) {
        dropZone.classList.add('is-active');
      }
    });

    // Hide drop zone when dragging leaves
    document.addEventListener('dragleave', (e) => {
      // Only hide if we're leaving the entire document
      if (e.clientX === 0 && e.clientY === 0) {
        dropZone.classList.remove('is-active');
      }
    });

    // Handle drop on drop zone
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('is-active');

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        // Handle single file for now, can be extended for multiple files
        this.handleFileUpload(files[0]);
      }
    });

    // Also handle direct drops on chat container and message input
    [chatContainer, messageInput].forEach(element => {
      if (element) {
        element.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.classList.remove('is-active');

          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            this.handleFileUpload(files[0]);
          }
        });
      }
    });
  }

  async handleFileUpload(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload-file', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show upload success message using original file name (like existing implementation)
        this.showUploadMessage(`File Uploaded: ${file.name}`);
        
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
        <span class="file-attachment-name"><svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> ${originalName}</span>
        <a href="/uploads/${filename}" target="_blank">View</a>
      `;
      chatContainer.appendChild(fileDiv);
    }
  }

  showUploadMessage(message) {
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
      uploadStatus.textContent = message;
      uploadStatus.classList.add('is-success');

      // Clear the message after 5 seconds (longer duration to match user expectations)
      setTimeout(() => {
        uploadStatus.textContent = '';
        uploadStatus.classList.remove('is-success');
      }, 5000);
    } else {
      // Fallback to console if upload-status element doesn't exist
      console.log(message);
    }
  }

  showNotification(message, type = 'info') {
    // Delegate to the shared toast system (kept as a method for back-compat).
    if (window.Toast) { window.Toast.show(message, { type }); return; }
    console.log('[notify]', type, message);
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