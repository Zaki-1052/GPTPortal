// Portal Initialization Module
// Extracted from portal.html inline scripts for better maintainability

class PortalInitializer {
  constructor() {
    this.initialized = false;
    this.initializationPromise = null;
    this.legacyFunctions = new Map();
    this.globalVariables = new Map();
  }

  /**
   * Initialize the portal application
   * Main entry point for all portal functionality
   */
  async initialize() {
    if (this.initialized) {
      console.log('Portal already initialized');
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  /**
   * Perform the actual initialization process
   * @private
   */
  async _performInitialization() {
    try {
      console.log('Initializing GPTPortal Enhanced System...');
      
      // Initialize core system
      if (window.gptPortalApp) {
        console.log('Modular system loaded successfully');
        
        // Wait for dynamic models to load
        if (window.gptPortalApp.modelConfig && window.gptPortalApp.modelConfig.dynamicModelManager) {
          await window.gptPortalApp.modelConfig.dynamicModelManager.loadModels();
          console.log('Dynamic models loaded');
        }
        
        // Initialize legacy functions for backward compatibility
        this.initializeLegacyFunctions();
        
        // Setup additional event handlers
        this.setupEnhancedFeatures();
        
      } else {
        console.warn('Modular system not available, initializing basic functionality');
        this.initializeBasicFunctionality();
      }
      
      this.initialized = true;
      console.log('Portal initialization completed successfully');
      
    } catch (error) {
      console.error('Error during initialization:', error);
      // Fallback to basic functionality
      this.initializeBasicFunctionality();
    }
  }

  /**
   * Initialize legacy functions for backward compatibility
   * Maintains compatibility with original script.js functionality
   */
  initializeLegacyFunctions() {
    console.log('Initializing legacy compatibility functions...');
    
    // Global variables for backward compatibility
    this.setGlobalVariable('selectedImage', null);
    this.setGlobalVariable('voiceMode', false);
    this.setGlobalVariable('mediaRecorder', null);
    this.setGlobalVariable('audioChunks', []);
    this.setGlobalVariable('isVoiceTranscription', false);
    this.setGlobalVariable('temperature', 1);
    this.setGlobalVariable('tokens', 8000);
    
    // Core utility functions
    this.registerLegacyFunction('copyToClipboard', this.copyToClipboard.bind(this));
    this.registerLegacyFunction('uploadFile', this.uploadFile.bind(this));
    this.registerLegacyFunction('voice', this.voice.bind(this));
    this.registerLegacyFunction('isSafariBrowser', this.isSafariBrowser.bind(this));
    this.registerLegacyFunction('displayErrorMessage', this.displayErrorMessage.bind(this));
    this.registerLegacyFunction('startRecording', this.startRecording.bind(this));
    this.registerLegacyFunction('stopRecordingAndTranscribe', this.stopRecordingAndTranscribe.bind(this));
    this.registerLegacyFunction('toggleVoiceMode', this.toggleVoiceMode.bind(this));
    this.registerLegacyFunction('sendAudioToServer', this.sendAudioToServer.bind(this));
    this.registerLegacyFunction('callTTSAPI', this.callTTSAPI.bind(this));
    this.registerLegacyFunction('saveChanges', this.saveChanges.bind(this));
    this.registerLegacyFunction('saveEnvChanges', this.saveEnvChanges.bind(this));
    this.registerLegacyFunction('resetTextAreaHeight', this.resetTextAreaHeight.bind(this));
    
    console.log(`Registered ${this.legacyFunctions.size} legacy functions`);
  }

  /**
   * Register a legacy function globally
   * @param {string} name - Function name
   * @param {Function} func - Function implementation
   */
  registerLegacyFunction(name, func) {
    this.legacyFunctions.set(name, func);
    window[name] = func;
  }

  /**
   * Set a global variable for backward compatibility
   * @param {string} name - Variable name
   * @param {*} value - Variable value
   */
  setGlobalVariable(name, value) {
    this.globalVariables.set(name, value);
    window[name] = value;
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard!');
    }).catch(err => {
      console.error('Error copying text: ', err);
    });
  }

  /**
   * Upload file to server
   * @param {File} file - File to upload
   * @returns {Promise<string>} File ID
   */
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/upload-file', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.fileId;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Voice functionality handler
   */
  voice() {
    console.log("Voice button clicked. Current mode:", window.voiceMode);
    
    if (this.isSafariBrowser()) {
      this.displayErrorMessage('Safari browser detected. Please use a Chromium browser for voice functionality.');
      return;
    }

    if (window.voiceMode) {
      this.stopRecordingAndTranscribe();
    } else {
      this.startRecording();
    }
    this.toggleVoiceMode();
  }

  /**
   * Check if browser is Safari
   * @returns {boolean} True if Safari browser
   */
  isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  /**
   * Display error message in chat
   * @param {string} message - Error message
   */
  displayErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'message error';
    errorMessage.textContent = message;
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.appendChild(errorMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  /**
   * Start audio recording
   */
  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        window.mediaRecorder = new MediaRecorder(stream);
        window.mediaRecorder.ondataavailable = e => {
          window.audioChunks.push(e.data);
        };
        window.mediaRecorder.onstop = this.sendAudioToServer.bind(this);
        window.mediaRecorder.start();
        console.log("Recording started");
      })
      .catch(error => {
        console.error("Error accessing media devices:", error);
      });
  }

  /**
   * Stop recording and transcribe
   */
  stopRecordingAndTranscribe() {
    if (window.mediaRecorder && window.mediaRecorder.state === "recording") {
      window.mediaRecorder.stop();
      console.log("Recording stopped");
    }
  }

  /**
   * Toggle voice mode indicator
   */
  toggleVoiceMode() {
    window.voiceMode = !window.voiceMode;
    const voiceIndicator = document.getElementById('voice-indicator');
    if (voiceIndicator) {
      if (window.voiceMode) {
        voiceIndicator.textContent = 'Voice Mode ON';
        voiceIndicator.style.display = 'block';
      } else {
        voiceIndicator.style.display = 'none';
      }
    }
  }

  /**
   * Send audio to server for transcription
   */
  sendAudioToServer() {
    const audioBlob = new Blob(window.audioChunks, { type: 'audio/mpeg' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.mp3');
    window.audioChunks = [];
    
    setTimeout(() => {
      fetch('/transcribe', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        const messageInput = document.getElementById('message-input');
        if (data && data.text && messageInput) {
          messageInput.value = data.text;
          window.isVoiceTranscription = data.text.startsWith("Voice Transcription: ");
          this.copyToClipboard(data.text);
        }
        window.voiceMode = false;
      })
      .catch(console.error);
    }, 100);
  }

  /**
   * Call Text-to-Speech API
   * @param {string} text - Text to convert to speech
   */
  callTTSAPI(text) {
    fetch('/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: text })
    })
    .then(response => response.blob())
    .then(blob => {
      const audioURL = URL.createObjectURL(blob);
      new Audio(audioURL).play();
    })
    .catch(console.error);
  }

  /**
   * Save changes to instructions
   */
  saveChanges() {
    const content = document.getElementById('instructions-content')?.value;
    if (!content) return;
    
    navigator.clipboard.writeText('node server.js').then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });

    fetch('/update-instructions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Changes saved successfully');
      const container = document.getElementById('edit-instructions-container');
      if (container) container.style.display = 'none';
      
      document.body.innerHTML = '<h2>Complete. Please restart the server and access the web app at <a href="http://localhost:3000">localhost:3000</a>. Simply paste `node server.js` into your Terminal to start again, reloading the page.</h2>';
      
      fetch('/shutdown-server', {
        method: 'POST'
      }).then(restartResponse => {
        if (restartResponse.ok) {
          console.log('Server shutdown initiated');
        } else {
          console.error('Failed to initiate server shutdown');
        }
      }).catch(err => {
        console.error('Error:', err);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred during setup. Please try again.');
    });
  }

  /**
   * Save environment variable changes
   */
  saveEnvChanges() {
    const content = document.getElementById('env-content')?.value;
    if (!content) return;
    
    navigator.clipboard.writeText('node server.js').then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });

    fetch('/update-my-env', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      alert('Changes saved successfully');
      const container = document.getElementById('edit-env-container');
      if (container) container.style.display = 'none';
      
      document.body.innerHTML = '<h2>Setup is complete. Please restart the server and access the web app at <a href="http://localhost:3000">localhost:3000</a>. Simply paste `node server.js` into your Terminal to start again, reloading the page.</h2>';
      
      fetch('/shutdown-server', {
        method: 'POST'
      }).then(restartResponse => {
        if (restartResponse.ok) {
          console.log('Server shutdown initiated');
        } else {
          console.error('Failed to initiate server shutdown');
        }
      }).catch(err => {
        console.error('Error:', err);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred during setup. Please try again.');
    });
  }

  /**
   * Reset textarea height with auto-expand
   * @param {HTMLElement} field - Textarea element
   */
  resetTextAreaHeight(field) {
    if (!field) return;
    field.style.height = '40px';
    this.autoExpand(field);
  }

  /**
   * Auto-expand textarea based on content
   * @param {HTMLElement} field - Textarea element
   */
  autoExpand(field) {
    field.style.height = 'inherit';
    const computed = window.getComputedStyle(field);
    const borderTop = parseInt(computed.getPropertyValue('border-top-width'), 10);
    const borderBottom = parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    const paddingTop = parseInt(computed.getPropertyValue('padding-top'), 10);
    const paddingBottom = parseInt(computed.getPropertyValue('padding-bottom'), 10);
    const heightNeeded = field.scrollHeight + borderTop + borderBottom;
    
    if (field.scrollHeight > field.clientHeight - paddingTop - paddingBottom - borderTop - borderBottom) {
      field.style.height = `${heightNeeded}px`;
    }
  }

  /**
   * Setup enhanced features and event handlers
   */
  setupEnhancedFeatures() {
    console.log('Setting up enhanced features...');
    
    // Voice button
    this.setupVoiceButton();
    
    // Export button
    this.setupExportButton();
    
    // Setup/config buttons
    this.setupConfigButtons();
    
    // Enhanced keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Auto-expand textarea
    this.setupTextareaAutoExpand();
    
    console.log('Enhanced features setup completed');
  }

  /**
   * Setup voice button functionality
   */
  setupVoiceButton() {
    const voiceButton = document.getElementById('voice-button');
    if (voiceButton) {
      voiceButton.addEventListener('click', this.voice.bind(this));
    }
  }

  /**
   * Setup export button functionality
   */
  setupExportButton() {
    const exportButton = document.getElementById('export-button');
    if (exportButton) {
      // Remove any existing listeners first
      const newExportButton = exportButton.cloneNode(true);
      exportButton.parentNode.replaceChild(newExportButton, exportButton);
      
      newExportButton.addEventListener('click', (e) => {
        console.log('=== Export button clicked ===');
        console.log('Event:', e);
        console.log('Timestamp:', new Date().toISOString());
        
        // Prevent any bubbling or default action
        e.stopPropagation();
        e.preventDefault();
        
        if (window.gptPortalApp && window.gptPortalApp.chatManager) {
          window.gptPortalApp.chatManager.exportChat();
        }
      });
    }
  }

  /**
   * Setup configuration buttons
   */
  setupConfigButtons() {
    this.setupInstructionsButton();
    this.setupEnvButton();
  }

  /**
   * Setup instructions editing button
   */
  setupInstructionsButton() {
    const editInstructionsBtn = document.getElementById('edit-instructions-btn');
    if (editInstructionsBtn) {
      editInstructionsBtn.addEventListener('click', () => {
        const container = document.getElementById('edit-instructions-container');
        if (!container) return;
        
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
          // Add body class to prevent scrolling
          document.body.style.overflow = 'hidden';
          
          fetch('/get-instructions', {
            credentials: 'include'
          })
            .then(response => response.text())
            .then(data => {
              const textarea = document.getElementById('instructions-content');
              if (textarea) {
                textarea.value = data;
                this.updateCharCount('instructions');
                
                // Focus the textarea after a short delay to ensure modal is visible
                setTimeout(() => {
                  textarea.focus();
                }, 300);
              }
            })
            .catch(error => {
              console.error('Error:', error);
            });
        } else {
          // Restore body scrolling
          document.body.style.overflow = '';
        }
      });
    }
    
    // Setup character counting for instructions
    const instructionsTextarea = document.getElementById('instructions-content');
    if (instructionsTextarea) {
      instructionsTextarea.addEventListener('input', () => {
        this.updateCharCount('instructions');
      });
    }
    
    // Setup model selector change for instructions
    const instructionsModelSelect = document.getElementById('instructions-model-select');
    if (instructionsModelSelect) {
      instructionsModelSelect.addEventListener('change', () => {
        this.updateCharCount('instructions');
      });
    }
  }

  /**
   * Setup environment variables editing button
   */
  setupEnvButton() {
    const editEnvBtn = document.getElementById('edit-env-btn');
    if (editEnvBtn) {
      editEnvBtn.addEventListener('click', () => {
        const container = document.getElementById('edit-env-container');
        if (!container) return;
        
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
          // Add body class to prevent scrolling
          document.body.style.overflow = 'hidden';
          
          fetch('/get-my-env')
            .then(response => response.text())
            .then(data => {
              const textarea = document.getElementById('env-content');
              if (textarea) {
                textarea.value = data;
                this.updateLineCount();
                
                // Focus the textarea after a short delay to ensure modal is visible
                setTimeout(() => {
                  textarea.focus();
                }, 300);
              }
            })
            .catch(error => {
              console.error('Error:', error);
            });
        } else {
          // Restore body scrolling
          document.body.style.overflow = '';
        }
      });
    }
    
    // Setup line counting for environment variables
    const envTextarea = document.getElementById('env-content');
    if (envTextarea) {
      envTextarea.addEventListener('input', () => {
        this.updateLineCount();
      });
    }
    
    // Setup model selector change for environment variables
    const envModelSelect = document.getElementById('env-model-select');
    if (envModelSelect) {
      envModelSelect.addEventListener('change', () => {
        this.updateLineCount();
      });
    }
  }

  /**
   * Setup enhanced keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // SHIFT+ESC for focusing the chat input
      if (event.shiftKey && event.key === 'Escape') {
        event.preventDefault();
        const messageInput = document.getElementById('message-input');
        if (messageInput) messageInput.focus();
      }

      // CMD+SHIFT+X for exporting chat history
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'X') {
        console.log("exporting");
        event.preventDefault();
        if (window.gptPortalApp && window.gptPortalApp.chatManager) {
          window.gptPortalApp.chatManager.exportChat();
        }
      }

      // CMD+SHIFT+V for toggling voice mode
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        this.voice();
      }

      // CMD+SHIFT+C for copying the latest chat message
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        const copyButtons = document.querySelectorAll('.message button');
        const latestCopyButton = Array.from(copyButtons).reverse().find(btn => 
          btn.textContent.includes('Copy') && !btn.textContent.includes('Copy Code')
        );
        if (latestCopyButton) {
          latestCopyButton.click();
        }
      }

      // CMD+SHIFT+; for copying the latest code block
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === ';') {
        event.preventDefault();
        const copyCodeButtons = document.querySelectorAll('.message button');
        const latestCopyCodeButton = Array.from(copyCodeButtons).reverse().find(btn => 
          btn.textContent.includes('Copy Code')
        );
        if (latestCopyCodeButton) {
          latestCopyCodeButton.click();
        }
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

  /**
   * Setup textarea auto-expand functionality
   */
  setupTextareaAutoExpand() {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('input', () => {
        this.autoExpand(messageInput);
      });
    }
  }

  /**
   * Initialize basic functionality as fallback
   */
  initializeBasicFunctionality() {
    console.log('Initializing basic functionality...');
    
    // Basic model selector
    const selectedModel = document.getElementById('selected-model');
    const modelOptions = document.getElementById('model-options');
    
    if (selectedModel && modelOptions) {
      selectedModel.addEventListener('click', () => {
        modelOptions.style.display = modelOptions.style.display === 'block' ? 'none' : 'block';
      });
    }
    
    // Basic send button
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton && messageInput) {
      sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
          console.log('Sending message:', message);
          messageInput.value = '';
        }
      });
    }
    
    console.log('Basic functionality initialized');
  }

  /**
   * Get initialization status
   * @returns {boolean} Whether portal is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get registered legacy functions
   * @returns {Map} Map of legacy functions
   */
  getLegacyFunctions() {
    return new Map(this.legacyFunctions);
  }

  /**
   * Get global variables
   * @returns {Map} Map of global variables
   */
  getGlobalVariables() {
    return new Map(this.globalVariables);
  }

  /**
   * Update character count and token count for instructions
   * @param {string} type - Type of editor ('instructions')
   */
  async updateCharCount(type) {
    const textarea = document.getElementById(`${type}-content`);
    const charCountElement = document.getElementById(`${type}-char-count`);
    const tokenCountElement = document.getElementById(`${type}-token-count`);
    const modelSelect = document.getElementById(`${type}-model-select`);
    
    if (textarea && charCountElement) {
      const count = textarea.value.length;
      charCountElement.textContent = count.toLocaleString();
      
      // Add color coding based on content length
      if (count > 10000) {
        charCountElement.style.color = '#ff6b35';
      } else if (count > 5000) {
        charCountElement.style.color = '#ff9500';
      } else {
        charCountElement.style.color = '#6e7681';
      }
    }
    
    // Update token count if elements exist
    if (textarea && tokenCountElement && window.tokenCounterClient) {
      const modelId = modelSelect ? modelSelect.value : 'gpt-4o';
      
      // Show loading state
      tokenCountElement.classList.add('loading');
      tokenCountElement.textContent = 'Counting';
      
      try {
        const tokenCount = await window.tokenCounterClient.countTokens(textarea.value, modelId);
        const formatted = window.tokenCounterClient.formatTokenCount(tokenCount, modelId);
        
        // Remove loading state
        tokenCountElement.classList.remove('loading');
        
        // Extract just the number for display
        const tokenNumber = tokenCount.toLocaleString();
        tokenCountElement.textContent = tokenNumber;
        
        // Add tooltip with cost estimate
        tokenCountElement.title = formatted;
        
        // Color coding based on token count
        if (tokenCount > 50000) {
          tokenCountElement.style.color = '#ff6b35';
        } else if (tokenCount > 20000) {
          tokenCountElement.style.color = '#ff9500';
        } else if (tokenCount > 5000) {
          tokenCountElement.style.color = '#58a6ff';
        } else {
          tokenCountElement.style.color = '#00d084';
        }
        
      } catch (error) {
        console.warn('Token counting failed:', error);
        // Remove loading state
        tokenCountElement.classList.remove('loading');
        
        // Fallback to estimation
        const estimatedTokens = Math.ceil(textarea.value.length / 4);
        tokenCountElement.textContent = `~${estimatedTokens.toLocaleString()}`;
        tokenCountElement.style.color = '#6e7681';
        tokenCountElement.title = 'Estimated (tiktoken unavailable)';
      }
    }
  }

  /**
   * Update line count and token count for environment variables
   */
  async updateLineCount() {
    const textarea = document.getElementById('env-content');
    const lineCountElement = document.getElementById('env-line-count');
    const tokenCountElement = document.getElementById('env-token-count');
    const modelSelect = document.getElementById('env-model-select');
    
    if (textarea && lineCountElement) {
      const lines = textarea.value.split('\n').length;
      lineCountElement.textContent = lines.toLocaleString();
      
      // Add color coding based on line count
      if (lines > 100) {
        lineCountElement.style.color = '#ff6b35';
      } else if (lines > 50) {
        lineCountElement.style.color = '#ff9500';
      } else {
        lineCountElement.style.color = '#6e7681';
      }
    }
    
    // Update token count if elements exist
    if (textarea && tokenCountElement && window.tokenCounterClient) {
      const modelId = modelSelect ? modelSelect.value : 'gpt-4o';
      
      // Show loading state
      tokenCountElement.classList.add('loading');
      tokenCountElement.textContent = 'Counting';
      
      try {
        const tokenCount = await window.tokenCounterClient.countTokens(textarea.value, modelId);
        const formatted = window.tokenCounterClient.formatTokenCount(tokenCount, modelId);
        
        // Remove loading state
        tokenCountElement.classList.remove('loading');
        
        // Extract just the number for display
        const tokenNumber = tokenCount.toLocaleString();
        tokenCountElement.textContent = tokenNumber;
        
        // Add tooltip with cost estimate
        tokenCountElement.title = formatted;
        
        // Color coding based on token count (env vars are usually much smaller)
        if (tokenCount > 10000) {
          tokenCountElement.style.color = '#ff6b35';
        } else if (tokenCount > 5000) {
          tokenCountElement.style.color = '#ff9500';
        } else if (tokenCount > 1000) {
          tokenCountElement.style.color = '#58a6ff';
        } else {
          tokenCountElement.style.color = '#00d084';
        }
        
      } catch (error) {
        console.warn('Token counting failed:', error);
        // Remove loading state
        tokenCountElement.classList.remove('loading');
        
        // Fallback to estimation
        const estimatedTokens = Math.ceil(textarea.value.length / 4);
        tokenCountElement.textContent = `~${estimatedTokens.toLocaleString()}`;
        tokenCountElement.style.color = '#6e7681';
        tokenCountElement.title = 'Estimated (tiktoken unavailable)';
      }
    }
  }

  /**
   * Enhanced save changes with better UX
   */
  enhancedSaveChanges() {
    const content = document.getElementById('instructions-content')?.value;
    if (!content) return;
    
    // Show loading state
    const saveBtn = document.querySelector('#edit-instructions-container .setup-action-btn.primary');
    if (saveBtn) {
      saveBtn.innerHTML = '<span class="action-icon">⏳</span><span>Saving...</span>';
      saveBtn.disabled = true;
    }
    
    this.saveChanges();
  }

  /**
   * Enhanced save env changes with better UX
   */
  enhancedSaveEnvChanges() {
    const content = document.getElementById('env-content')?.value;
    if (!content) return;
    
    // Show loading state
    const saveBtn = document.querySelector('#edit-env-container .setup-action-btn.primary');
    if (saveBtn) {
      saveBtn.innerHTML = '<span class="action-icon">⏳</span><span>Saving...</span>';
      saveBtn.disabled = true;
    }
    
    this.saveEnvChanges();
  }

  /**
   * Cleanup function for proper resource management
   */
  cleanup() {
    console.log('Cleaning up portal initializer...');
    
    // Restore body scrolling if modals were open
    document.body.style.overflow = '';
    
    // Remove event listeners
    document.removeEventListener('keydown', this.setupKeyboardShortcuts);
    
    // Clear global functions and variables
    this.legacyFunctions.forEach((_, name) => {
      delete window[name];
    });
    
    this.globalVariables.forEach((_, name) => {
      delete window[name];
    });
    
    this.legacyFunctions.clear();
    this.globalVariables.clear();
    this.initialized = false;
    this.initializationPromise = null;
    
    console.log('Portal initializer cleanup completed');
  }
}

// Create and export portal initializer instance
const portalInitializer = new PortalInitializer();

// Export for use in other modules
window.PortalInitializer = PortalInitializer;
window.portalInitializer = portalInitializer;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing GPTPortal Enhanced...');
  await portalInitializer.initialize();
});

// Fallback initialization for immediate script loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    if (!portalInitializer.isInitialized()) {
      await portalInitializer.initialize();
    }
  });
} else {
  if (!portalInitializer.isInitialized()) {
    portalInitializer.initialize();
  }
}

// Export for use in other modules
window.PortalInitializer = PortalInitializer;

console.log('GPTPortal Enhanced Frontend initialized');