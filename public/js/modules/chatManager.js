// Enhanced Chat Manager with complete original functionality
class ChatManager {
  constructor(modelConfig) {
    this.modelConfig = modelConfig;
    this.conversations = new Map();
    this.currentConversationId = null;
    this.conversationHistory = [];
    this.selectedImage = null;
    this.fileUrl = null;
    this.messageCounter = 0;
    this.isFirstMessage = false;
    
    // Voice-related properties
    this.voiceMode = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isVoiceTranscription = false;
    
    this.init();
  }

  init() {
    this.setupMarkdown();
    this.loadChatHistory();
    this.bindEvents();
    this.fetchChatList();
    this.fetchPromptList();
  }

  setupMarkdown() {
    // Configure marked.js for markdown rendering (from original script.js)
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined') {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
          return code;
        }
      });
    }
  }

  bindEvents() {
    // Send button and message input
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    }
    
    if (messageInput) {
      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
          this.resetTextAreaHeight(messageInput);
        }
      });
    }

    // File input handling
    const fileInput = document.getElementById('file-input');
    const clipboardButton = document.getElementById('clipboard-button');
    
    if (fileInput) {
      fileInput.addEventListener('change', async (event) => {
        let file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          this.selectedImage = file;
          file = null;
        } else if (file) {
          this.fileUrl = await this.uploadFile(file);
        }
      });
    }

    if (clipboardButton) {
      clipboardButton.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    // Sidebar and prompt bar handling
    this.setupSidebarEvents();
    this.setupPromptBarEvents();
  }

  setupSidebarEvents() {
    // Chat list handling
    const chatList = document.getElementById('chatList');
    if (chatList) {
      chatList.addEventListener('click', async (event) => {
        if (event.target.tagName === 'A') {
          event.preventDefault();
          const chatName = event.target.getAttribute('data-chat');
          if (chatName) {
            try {
              await fetch('/setChat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chosenChat: chatName })
              });
      
              const summaryResponse = await fetch(`/getSummary/${chatName}`);
              const summaryData = await summaryResponse.json();
      
              if (summaryData.summary) {
                this.displayMessage(summaryData.summary, 'response', false);
              }
            } catch (error) {
              console.error('Error setting chat:', error);
            }
          }
        }
      });
    }

    // Summaries button
    const summariesButton = document.getElementById('summariesButton');
    if (summariesButton) {
      let summariesOnly = true;
      summariesButton.addEventListener('click', async () => {
        summariesOnly = !summariesOnly;
        summariesButton.textContent = summariesOnly ? 'Summaries Only' : 'Whole Conversations';

        try {
          await fetch('/setSummariesOnly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summariesOnly })
          });
        } catch (error) {
          console.error('Error setting summaries only:', error);
        }
      });
    }
  }

  setupPromptBarEvents() {
    // Prompt list handling
    const promptList = document.getElementById('promptList');
    if (promptList) {
      promptList.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
          this.handlePromptSelection(event);
        } else if (event.target.classList.contains('copyPromptButton')) {
          this.handleCopyPrompt(event);
        }
      });
    }
  }

  async sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message && !this.selectedImage) return;
    
    // Clear input
    messageInput.value = '';
    this.resetTextAreaHeight(messageInput);

    // Set default model if needed
    this.setDefaultModel();

    if (message) {
      this.displayMessage(message, 'user');
      
      // Check if it's an image generation request
      if (this.isImageGenerationRequest(message)) {
        await this.handleImageGenerationRequest(message);
      } else {
        // Send regular message
        try {
          await this.sendMessageToServer(message);
          if (this.voiceMode) {
            // Voice mode feedback would be handled here
          }
          if (message === "Bye!") {
            this.exportChatOnShutdown();
          }
        } catch (error) {
          console.error('Error sending message:', error);
          this.displayMessage('Error sending message. Please try again.', 'error');
        }
      }
    }
  }

  setDefaultModel() {
    const selectedModelDiv = document.getElementById("selected-model");
    
    if (selectedModelDiv && selectedModelDiv.textContent.trim() === "Select a Model") {
      if (this.modelConfig && this.modelConfig.currentModelID) {
        const defaultModel = this.modelConfig.currentModelID;
        
        // Use dynamic model name if available
        if (this.modelConfig.dynamicModelManager) {
          const model = this.modelConfig.dynamicModelManager.getModel(defaultModel);
          if (model) {
            selectedModelDiv.textContent = model.name;
          } else {
            selectedModelDiv.textContent = defaultModel;
          }
        } else {
          selectedModelDiv.textContent = defaultModel;
        }
      }
    }
  }

  isImageGenerationRequest(message) {
    return message.startsWith("Generate:");
  }

  async handleImageGenerationRequest(message) {
    const prompt = message.substring("Generate:".length).trim();

    try {
      const response = await fetch('/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const result = await response.json();
      if (result.imageUrl) {
        this.displayGeneratedImage(result.imageUrl);
        this.sendMessageToServer("Generated image", result.imageUrl);
      } else {
        this.displayMessage('Image generation failed, please try again.', 'error');
      }
    } catch (error) {
      console.error('Error in image generation:', error);
      this.displayMessage('Error in image generation, please try again.', 'error');
    }
  }

  displayGeneratedImage(imageUrl) {
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.alt = "Generated Image";
    imageElement.classList.add('generated-image');

    // Trigger image download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = 'generated-image.jpg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.appendChild(imageElement);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  async sendMessageToServer(message) {
    let imageUrl = null;
    let imageFilename = null;
    
    if (this.selectedImage) {
      imageUrl = await this.uploadImageAndGetUrl(this.selectedImage);
      imageFilename = imageUrl.split('/').pop();
    }
    
    if (this.fileUrl) {
      // File handling logic
      const filename = this.fileUrl.split('/').pop();
    }

    // Prepare payload based on endpoint
    let payload, endpoint;
    const instructions = await this.fetchInstructions();
    const currentModelID = this.modelConfig ? this.modelConfig.currentModelID : 'gpt-4o';
    
    if (this.modelConfig && this.modelConfig.isAssistants) {
      if (this.messageCounter === 0) {
        this.isFirstMessage = true;
        this.messageCounter += 1;
      } else {
        this.isFirstMessage = false;
      }
      
      payload = {
        message: message,
        modelID: currentModelID,
        instructions: instructions,
        file: this.fileUrl,
        initialize: this.isFirstMessage,
        temperature: window.temperature || 1,
        tokens: window.tokens || 8000
      };
      endpoint = '/assistant';
    } else if (currentModelID && currentModelID.includes('gemini')) {
      payload = {
        prompt: message,
        model: currentModelID,
        imageParts: imageFilename ? [{ filename: imageFilename, mimeType: 'image/jpeg' }] : []
      };
      endpoint = '/gemini';
    } else {
      payload = {
        message: message,
        modelID: currentModelID,
        instructions: instructions,
        image: imageUrl,
        file: this.fileUrl,
        temperature: window.temperature || 1,
        tokens: window.tokens || 8000
      };
      endpoint = '/message';
    }

    try {
      console.log('Sending to:', endpoint, payload);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Determine response format based on endpoint
      let messageContent;
      if (endpoint.includes('gemini')) {
        messageContent = data.text || 'No response received.';
      } else if (endpoint.includes('assistant')) {
        messageContent = data.text?.text || 'No response received.';
      } else {
        messageContent = data.text || 'No response received.';
      }

      this.displayMessage(messageContent, 'response', this.isVoiceTranscription);
      this.isVoiceTranscription = false;
      
    } catch (error) {
      console.error('Error sending message to server:', error);
      this.displayMessage('Error sending message. Please try again.', 'error');
    }
  }

  async fetchInstructions() {
    try {
      const response = await fetch('/instructions.md');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching instructions:', error);
      return '';
    }
  }

  async uploadImageAndGetUrl(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

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
    }
  }

  displayMessage(message, type, shouldReadAloud = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);

    if (type === 'image') {
      const imageElement = document.createElement('img');
      imageElement.src = message;
      imageElement.alt = "Generated Image";
      imageElement.classList.add('generated-image');
      messageElement.appendChild(imageElement);
    } else {
      // Handle code blocks and markdown (from original script.js)
      if (message.includes('```')) {
        const parts = message.split(/(```[\s\S]+?```)/);
        parts.forEach(part => {
          if (part.startsWith('```') && part.endsWith('```')) {
            // Handle code blocks
            const codeContent = part.substring(3, part.length - 3);
            const languageMatch = codeContent.match(/^[^\n]+/);
            const language = languageMatch ? languageMatch[0].trim() : '';
            const actualCode = codeContent.replace(/^[^\n]+/, '').trim();

            const pre = document.createElement('pre');
            const codeElement = document.createElement('code');
            codeElement.textContent = actualCode;
            pre.appendChild(codeElement);
            messageElement.appendChild(pre);

            // Add "Copy Code" button
            const copyCodeButtonWrapper = document.createElement('div');
            copyCodeButtonWrapper.style.marginTop = '10px';
            const copyCodeButton = document.createElement('button');
            copyCodeButton.textContent = 'Copy Code';
            copyCodeButton.onclick = function() { 
              this.copyToClipboard(actualCode); 
            }.bind(this);
            copyCodeButtonWrapper.appendChild(copyCodeButton);
            messageElement.appendChild(copyCodeButtonWrapper);
          } else {
            // Regular text, render as markdown
            const textSpan = document.createElement('span');
            if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
              const rawHtml = marked.parse(part);
              const safeHtml = DOMPurify.sanitize(rawHtml);
              textSpan.innerHTML = safeHtml;
            } else {
              textSpan.textContent = part;
            }
            messageElement.appendChild(textSpan);
          }
        });
        
        // Add main copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.onclick = function() { 
          this.copyToClipboard(messageElement.innerText); 
        }.bind(this);
        messageElement.appendChild(copyButton);
      } else {
        // No code blocks, just render as markdown
        const messageText = document.createElement('span');
        if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
          const rawHtml = marked.parse(message);
          const safeHtml = DOMPurify.sanitize(rawHtml);
          messageText.innerHTML = safeHtml;
        } else {
          messageText.textContent = message;
        }

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.onclick = function() { 
          this.copyToClipboard(messageText.textContent); 
        }.bind(this);

        messageElement.appendChild(messageText);
        messageElement.appendChild(copyButton);
      }
    }

    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.appendChild(messageElement);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Add to conversation history
    if (type !== 'error') {
      this.conversationHistory.push({ role: type === 'user' ? 'user' : 'assistant', content: message });
    }

    // Voice feedback
    if (type === 'response' && shouldReadAloud && window.callTTSAPI) {
      window.callTTSAPI(message);
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard!');
    }).catch(err => {
      console.error('Error copying text: ', err);
    });
  }

  clearChat() {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.innerHTML = '';
    }
    this.conversationHistory = [];
  }

  // Export chat functionality (from original script.js)
  exportChatHistory() {
    let historyType = 'conversation';
    if (this.modelConfig) {
      if (this.modelConfig.isGemini) {
        historyType = 'gemini';
      } else if (this.modelConfig.isAssistants) {
        historyType = 'assistants';
      }
    }
    
    console.log("Exporting chat history for:", historyType);
    const exportUrl = '/export-chat-html?type=' + historyType;
    fetch(exportUrl)
      .then(async response => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'chat_history.html';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match.length > 1) {
            filename = match[1];
          }
        }
        const blob = await response.blob();
        return ({ blob, filename });
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Error exporting chat history:', err));
  }

  exportChatOnShutdown() {
    let historyType = 'conversation';
    if (this.modelConfig) {
      if (this.modelConfig.isGemini) {
        historyType = 'gemini';
      } else if (this.modelConfig.isAssistants) {
        historyType = 'assistants';
      }
    }
    this.exportChatHistory(historyType);
  }

  // Chat list and prompt management
  async fetchChatList() {
    try {
      const response = await fetch('/listChats');
      const data = await response.json();
      const chatList = document.getElementById('chatList');
      if (chatList) {
        chatList.innerHTML = data.files.map(file => {
          let fileNameWithoutExt = file.replace('.txt', '');
          let displayName = fileNameWithoutExt.replace(/_/g, ' ');
          return `<li><a href="#" data-chat="${fileNameWithoutExt}">${displayName}</a></li>`;
        }).join('');
      }
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  }

  async fetchPromptList() {
    try {
      const response = await fetch('/listPrompts');
      const data = await response.json();
      const promptList = document.getElementById('promptList');
      const promptInfo = data.promptInfo;

      if (promptList) {
        promptList.innerHTML = data.files.map(file => {
          let fileNameWithoutExt = file.replace('.md', '');
          let displayName = fileNameWithoutExt.charAt(0).toUpperCase() + fileNameWithoutExt.slice(1);
          return `
            <li>
              <a href="#" data-prompt="${fileNameWithoutExt}">${displayName}</a>
              <button class="copyPromptButton" data-prompt="${fileNameWithoutExt}">Copy</button>
            </li>`;
        }).join('');

        // Add tooltip functionality
        document.querySelectorAll('#promptList li a').forEach(item => {
          item.addEventListener('mouseover', (event) => {
            const promptName = event.currentTarget.getAttribute('data-prompt');
            const info = promptInfo[promptName];
            if (info && window.showCustomTooltip) {
              window.showCustomTooltip(`${info.name}: ${info.description}`, event.currentTarget);
            }
          });
          item.addEventListener('mouseout', () => {
            if (window.hideCustomTooltip) {
              window.hideCustomTooltip();
            }
          });
        });
      }
    } catch (error) {
      console.error('Error fetching prompt list:', error);
    }
  }

  async handlePromptSelection(event) {
    event.preventDefault();
    const promptName = event.target.getAttribute('data-prompt');
    
    try {
      const promptResponse = await fetch('/setPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosenPrompt: promptName })
      });

      const promptData = await promptResponse.json();

      if (promptData.prompt) {
        this.displayMessage(promptData.prompt.body, 'response', false);
      } else {
        console.error('Prompt not found.');
      }
    } catch (error) {
      console.error('Error setting prompt:', error);
    }
  }

  async handleCopyPrompt(event) {
    const promptName = event.target.getAttribute('data-prompt');
    try {
      const response = await fetch('/copyPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosenPrompt: promptName })
      });
      
      if (response.ok) {
        event.target.textContent = 'Copied!';
        setTimeout(() => {
          event.target.textContent = 'Copy';
        }, 1000);
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      console.error('Error copying prompt:', error);
    }
  }

  resetTextAreaHeight(field) {
    if (field) {
      field.style.height = '40px';
      this.autoExpand(field);
    }
  }

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

  // Legacy compatibility methods
  async loadChatHistory() {
    try {
      // Use the correct endpoint from the backend architecture
      const response = await fetch('/listChats');
      if (response.ok) {
        const data = await response.json();
        // Convert file list to conversations map for compatibility
        const conversations = new Map();
        data.files.forEach(file => {
          const chatName = file.replace('.txt', '');
          conversations.set(chatName, { name: chatName, file: file });
        });
        this.conversations = conversations;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Graceful fallback - initialize empty conversations
      this.conversations = new Map();
    }
  }

  async saveChatHistory() {
    try {
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...this.conversations])
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
}

// Export for use in main script
window.ChatManager = ChatManager;