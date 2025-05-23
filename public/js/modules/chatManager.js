// Chat management and conversation handling
class ChatManager {
  constructor(modelConfig) {
    this.modelConfig = modelConfig;
    this.conversations = new Map();
    this.currentConversationId = null;
    this.conversationHistory = [];
    this.selectedImage = null;
    
    this.init();
  }

  init() {
    this.setupMarkdown();
    this.loadChatHistory();
    this.bindEvents();
  }

  setupMarkdown() {
    // Configure marked.js for markdown rendering
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
    // Bind chat-related events
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
        }
      });
    }
  }

  async sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message && !this.selectedImage) return;
    
    // Add user message to chat
    this.addMessageToChat('user', message);
    
    // Clear input
    messageInput.value = '';
    
    // Send to appropriate AI endpoint
    try {
      const response = await this.sendToAI(message);
      this.addMessageToChat('assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessageToChat('error', 'Failed to send message. Please try again.');
    }
  }

  async sendToAI(message) {
    const endpoint = this.determineEndpoint();
    const payload = this.buildPayload(message);
    
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
    return data.response || data.message || 'No response received';
  }

  determineEndpoint() {
    if (this.modelConfig.isGemini) {
      return '/chat-gemini';
    } else if (this.modelConfig.isAssistants) {
      return '/chat-assistants';
    } else {
      return '/chat';
    }
  }

  buildPayload(message) {
    const payload = {
      message: message,
      model: this.modelConfig.currentModelID,
      conversation_history: this.conversationHistory
    };
    
    if (this.selectedImage) {
      payload.image = this.selectedImage;
    }
    
    return payload;
  }

  addMessageToChat(role, content) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    if (role === 'user') {
      messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(content)}</div>`;
    } else if (role === 'assistant') {
      // Render markdown for assistant messages
      const renderedContent = typeof marked !== 'undefined' ? 
        marked(content) : this.escapeHtml(content);
      messageDiv.innerHTML = `<div class="message-content">${renderedContent}</div>`;
    } else if (role === 'error') {
      messageDiv.innerHTML = `<div class="message-content error">${this.escapeHtml(content)}</div>`;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Add to conversation history
    if (role !== 'error') {
      this.conversationHistory.push({ role, content });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  clearChat() {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.innerHTML = '';
    }
    this.conversationHistory = [];
  }

  async loadChatHistory() {
    try {
      const response = await fetch('/api/chat-history');
      if (response.ok) {
        const history = await response.json();
        this.conversations = new Map(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
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

  exportChat() {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    
    const exportContent = chatContainer.innerHTML;
    const blob = new Blob([exportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// Export for use in main script
window.ChatManager = ChatManager;