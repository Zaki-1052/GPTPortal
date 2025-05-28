// Message Handling Module
// Manages message display, rendering, and interactions

class MessageHandler {
  constructor() {
    this.messageCounter = 0;
    this.conversationHistory = [];
    this.markdownRenderer = null;
    this.sanitizer = null;
    
    this.init();
  }

  /**
   * Initialize message handler
   */
  init() {
    // Delay markdown setup to ensure all scripts are loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupMarkdown();
      });
    } else {
      // DOM is already loaded, but wait a tick for scripts to initialize
      setTimeout(() => {
        this.setupMarkdown();
      }, 0);
    }
    
    this.setupEventHandlers();
    console.log('Message handler initialized');
  }

  /**
   * Setup markdown rendering
   */
  setupMarkdown() {
    console.log('=== setupMarkdown called ===');
    
    if (typeof marked !== 'undefined') {
      this.markdownRenderer = marked;
      
      // Configure general options FIRST (before extensions)
      marked.setOptions({
        gfm: true,
        breaks: true, // We'll handle line breaks with CSS
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined') {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
          return code;
        }
      });
      
      // THEN add KaTeX extension
      if (typeof window.markedKatex !== 'undefined') {
        console.log('markedKatex found, configuring...');
        marked.use(window.markedKatex({
          throwOnError: false,
          output: 'html',
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '\\[', right: '\\]', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false}
          ]
        }));
        console.log('markedKatex extension loaded');
      }
      
      console.log('Markdown renderer configured for LaTeX compatibility');
    } else {
      console.warn('Marked.js not available - markdown rendering disabled');
    }

    if (typeof DOMPurify !== 'undefined') {
      this.sanitizer = DOMPurify;
      console.log('DOMPurify sanitizer configured for KaTeX');
    } else {
      console.warn('DOMPurify not available - HTML sanitization disabled');
    }
  }


  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Listen for copy button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('.copy-btn, .copy-code-btn')) {
        this.handleCopyClick(e);
      }
    });
  }

  /**
   * Handle copy button clicks
   * @param {Event} event - Click event
   */
  handleCopyClick(event) {
    const button = event.target;
    const textToCopy = button.dataset.copyText || button.previousElementSibling?.textContent;
    
    if (textToCopy) {
      this.copyToClipboard(textToCopy);
      this.showCopyFeedback(button);
    }
  }


  /**
   * Show copy feedback on button
   * @param {HTMLElement} button - Copy button
   */
  showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.backgroundColor = '#4CAF50';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 1500);
  }

  /**
   * Display a message in the chat
   * @param {string} message - Message content
   * @param {string} type - Message type ('user', 'response', 'error', 'system')
   * @param {boolean} shouldReadAloud - Whether to read message aloud
   * @returns {HTMLElement} Created message element
   */
  displayMessage(message, type, shouldReadAloud = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.dataset.messageId = `msg-${this.messageCounter++}`;
    messageElement.dataset.timestamp = new Date().toISOString();

    // Handle different message types
    switch (type) {
      case 'image':
        this.renderImageMessage(messageElement, message);
        break;
      case 'error':
        this.renderErrorMessage(messageElement, message);
        break;
      case 'system':
        this.renderSystemMessage(messageElement, message);
        break;
      default:
        this.renderTextMessage(messageElement, message);
        break;
    }

    // Add message to chat box
    this.appendToChat(messageElement);

    // Add to conversation history
    if (type !== 'error' && type !== 'system') {
      this.addToHistory(type === 'user' ? 'user' : 'assistant', message);
    }

    // Voice feedback
    if (type === 'response' && shouldReadAloud && window.callTTSAPI) {
      window.callTTSAPI(message);
    }

    return messageElement;
  }

  /**
   * Render image message
   * @param {HTMLElement} element - Message element
   * @param {string} imageSrc - Image source URL
   */
  renderImageMessage(element, imageSrc) {
    const imageElement = document.createElement('img');
    imageElement.src = imageSrc;
    imageElement.alt = "Generated Image";
    imageElement.classList.add('generated-image');
    imageElement.style.cssText = 'max-width: 100%; height: auto; border-radius: 8px;';
    
    element.appendChild(imageElement);
    
    // Add download button
    const downloadBtn = this.createButton('Download', () => {
      this.downloadImage(imageSrc);
    });
    downloadBtn.style.marginTop = '10px';
    element.appendChild(downloadBtn);
  }

  /**
   * Render error message
   * @param {HTMLElement} element - Message element
   * @param {string} message - Error message
   */
  renderErrorMessage(element, message) {
    element.style.color = '#e66767';
    element.style.backgroundColor = '#2a1f1f';
    element.style.border = '1px solid #e66767';
    element.style.borderRadius = '8px';
    element.style.padding = '12px';
    
    const icon = document.createElement('span');
    icon.textContent = '⚠️ ';
    icon.style.marginRight = '8px';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    element.appendChild(icon);
    element.appendChild(text);
  }

  /**
   * Render system message
   * @param {HTMLElement} element - Message element
   * @param {string} message - System message
   */
  renderSystemMessage(element, message) {
    element.style.color = '#888';
    element.style.backgroundColor = '#1a1a1a';
    element.style.border = '1px solid #333';
    element.style.borderRadius = '8px';
    element.style.padding = '8px 12px';
    element.style.fontStyle = 'italic';
    element.style.fontSize = '14px';
    
    const icon = document.createElement('span');
    icon.textContent = 'ℹ️ ';
    icon.style.marginRight = '6px';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    element.appendChild(icon);
    element.appendChild(text);
  }

  /**
   * Render text message with markdown and code blocks
   * @param {HTMLElement} element - Message element
   * @param {string} message - Message content
   */
  renderTextMessage(element, message) {
    
    if (message.includes('```')) {
      this.renderMessageWithCodeBlocks(element, message);
    } else {
      this.renderSimpleTextMessage(element, message);
    }

    // Add main copy button
    const copyButton = this.createCopyButton(message);
    element.appendChild(copyButton);
  }

  /**
   * Render message with code blocks
   * @param {HTMLElement} element - Message element
   * @param {string} message - Message with code blocks
   */
  renderMessageWithCodeBlocks(element, message) {
    
    const parts = message.split(/(```[\s\S]+?```)/);
    
    parts.forEach(part => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Handle code blocks
        this.renderCodeBlock(element, part);
      } else {
        // Handle regular text
        this.renderMarkdownText(element, part);
      }
    });
  }

  /**
   * Render code block
   * @param {HTMLElement} parent - Parent element
   * @param {string} codeBlock - Code block text
   */
  renderCodeBlock(parent, codeBlock) {
    const codeContent = codeBlock.substring(3, codeBlock.length - 3);
    const languageMatch = codeContent.match(/^[^\n]+/);
    const language = languageMatch ? languageMatch[0].trim() : '';
    const actualCode = codeContent.replace(/^[^\n]+/, '').trim();

    // Create code container
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-block';
    codeContainer.style.cssText = 'position: relative; margin: 10px 0; background-color: #1e1e1e; border-radius: 8px; overflow: hidden;';

    // Add language label if present
    if (language) {
      const langLabel = document.createElement('div');
      langLabel.className = 'code-language';
      langLabel.textContent = language;
      langLabel.style.cssText = 'background-color: #333; color: #888; padding: 6px 12px; font-size: 12px; border-bottom: 1px solid #444;';
      codeContainer.appendChild(langLabel);
    }

    // Create pre/code elements
    const pre = document.createElement('pre');
    pre.style.cssText = 'margin: 0; padding: 16px; overflow-x: auto; background-color: transparent;';
    
    const codeElement = document.createElement('code');
    codeElement.textContent = actualCode;
    codeElement.className = language ? `language-${language}` : '';
    
    // Apply syntax highlighting if available
    if (typeof hljs !== 'undefined' && language) {
      try {
        const highlighted = hljs.highlight(actualCode, { language: hljs.getLanguage(language) ? language : 'plaintext' });
        codeElement.innerHTML = highlighted.value;
      } catch (e) {
        console.warn('Syntax highlighting failed:', e);
      }
    }
    
    pre.appendChild(codeElement);
    codeContainer.appendChild(pre);

    // Add copy code button
    const copyCodeButton = this.createCopyButton(actualCode, 'Copy Code');
    copyCodeButton.style.cssText = 'position: absolute; top: 8px; right: 8px; background-color: #444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;';
    copyCodeButton.addEventListener('mouseenter', () => {
      copyCodeButton.style.backgroundColor = '#555';
    });
    copyCodeButton.addEventListener('mouseleave', () => {
      copyCodeButton.style.backgroundColor = '#444';
    });
    
    codeContainer.appendChild(copyCodeButton);
    parent.appendChild(codeContainer);
  }

  /**
   * Escape LaTeX delimiters to prevent marked.js from treating them as escaped characters
   * @param {string} text - Text to process
   * @returns {string} Text with escaped LaTeX delimiters
   */
  escapeLatexDelimiters(text) {
    // Escape backslash-bracket delimiters so marked doesn't convert \[ to [
    return text
      .replace(/\\\[/g, '\\\\[')
      .replace(/\\\]/g, '\\\\]')
      .replace(/\\\(/g, '\\\\(')
      .replace(/\\\)/g, '\\\\)');
  }

  /**
   * Render markdown text with LaTeX support
   * @param {HTMLElement} parent - Parent element
   * @param {string} text - Text to render
   */
  renderMarkdownText(parent, text) {
    const textSpan = document.createElement('div');
    textSpan.className = 'message-text';
    
    let processedHtml = '';
    
    // Escape LaTeX delimiters before markdown processing
    const escapedText = this.escapeLatexDelimiters(text);
    
    // Process with marked (which now includes LaTeX support via markedKatex)
    if (this.markdownRenderer) {
      processedHtml = this.markdownRenderer.parse(escapedText);
    } else {
      processedHtml = this.escapeHtml(escapedText);
    }
    
    // Sanitize HTML
    if (this.sanitizer) {
      const safeHtml = this.sanitizer.sanitize(processedHtml, {
        ADD_TAGS: ['math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mrow', 'msub', 'msup', 'mfrac', 'mroot', 'msqrt'],
        ADD_ATTR: ['data-mathml', 'aria-label', 'href', 'mathvariant', 'encoding']
      });
      textSpan.innerHTML = safeHtml;
    } else {
      textSpan.innerHTML = processedHtml;
    }
    
    parent.appendChild(textSpan);
    
    // Apply KaTeX auto-render to handle additional delimiters
    // Need to use requestAnimationFrame to ensure DOM is updated
    if (typeof renderMathInElement !== 'undefined') {
      requestAnimationFrame(() => {
        renderMathInElement(textSpan, {
          delimiters: [
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\begin{equation}', right: '\\end{equation}', display: true},
            {left: '\\begin{align}', right: '\\end{align}', display: true},
            {left: '\\begin{alignat}', right: '\\end{alignat}', display: true},
            {left: '\\begin{gather}', right: '\\end{gather}', display: true},
            {left: '\\begin{displaymath}', right: '\\end{displaymath}', display: true}
          ],
          throwOnError: false
        });
      });
    }
  }

  /**
   * Render simple text message with LaTeX support
   * @param {HTMLElement} element - Message element
   * @param {string} message - Message text
   */
  renderSimpleTextMessage(element, message) {
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    let processedHtml = '';
    
    // Escape LaTeX delimiters before markdown processing
    const escapedMessage = this.escapeLatexDelimiters(message);
    
    // Process with marked (which now includes LaTeX support via markedKatex)
    if (this.markdownRenderer) {
      processedHtml = this.markdownRenderer.parse(escapedMessage);
    } else {
      processedHtml = this.escapeHtml(escapedMessage);
    }
    
    // Sanitize HTML
    if (this.sanitizer) {
      const safeHtml = this.sanitizer.sanitize(processedHtml, {
        ADD_TAGS: ['math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mrow', 'msub', 'msup', 'mfrac', 'mroot', 'msqrt'],
        ADD_ATTR: ['data-mathml', 'aria-label', 'href', 'mathvariant', 'encoding']
      });
      messageText.innerHTML = safeHtml;
    } else {
      messageText.innerHTML = processedHtml;
    }

    element.appendChild(messageText);
    
    // Apply KaTeX auto-render to handle additional delimiters
    // Need to use requestAnimationFrame to ensure DOM is updated
    if (typeof renderMathInElement !== 'undefined') {
      requestAnimationFrame(() => {
        renderMathInElement(messageText, {
          delimiters: [
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\begin{equation}', right: '\\end{equation}', display: true},
            {left: '\\begin{align}', right: '\\end{align}', display: true},
            {left: '\\begin{alignat}', right: '\\end{alignat}', display: true},
            {left: '\\begin{gather}', right: '\\end{gather}', display: true},
            {left: '\\begin{displaymath}', right: '\\end{displaymath}', display: true}
          ],
          throwOnError: false
        });
      });
    }
  }

  /**
   * Create copy button
   * @param {string} textToCopy - Text to copy
   * @param {string} buttonText - Button text
   * @returns {HTMLElement} Copy button
   */
  createCopyButton(textToCopy, buttonText = 'Copy') {
    const button = this.createButton(buttonText, () => {
      this.copyToClipboard(textToCopy);
      this.showCopyFeedback(button);
    });
    
    button.className = 'copy-btn';
    button.dataset.copyText = textToCopy;
    
    return button;
  }

  /**
   * Create button element
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @returns {HTMLElement} Button element
   */
  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin: 4px 4px 0 0;
      transition: background-color 0.2s;
    `;
    
    button.addEventListener('click', onClick);
    
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#45a049';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#4CAF50';
    });
    
    return button;
  }

  /**
   * Append message to chat box
   * @param {HTMLElement} messageElement - Message element to append
   */
  appendToChat(messageElement) {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.appendChild(messageElement);
      chatBox.scrollTop = chatBox.scrollHeight;
      
      // Add entrance animation
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
      });
    }
  }

  /**
   * Add message to conversation history
   * @param {string} role - Role ('user' or 'assistant')
   * @param {string} content - Message content
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role: role,
      content: content,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size to prevent memory issues
    const maxHistorySize = 100;
    if (this.conversationHistory.length > maxHistorySize) {
      this.conversationHistory = this.conversationHistory.slice(-maxHistorySize);
    }
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getConversationHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('Conversation history cleared');
  }

  /**
   * Clear chat display
   */
  clearChat() {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.innerHTML = '';
    }
    this.clearHistory();
    this.messageCounter = 0;
    console.log('Chat cleared');
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
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text);
    });
  }

  /**
   * Fallback copy method for older browsers
   * @param {string} text - Text to copy
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Text copied using fallback method');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Download image
   * @param {string} imageSrc - Image source URL
   */
  downloadImage(imageSrc) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format message timestamp
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Get message by ID
   * @param {string} messageId - Message ID
   * @returns {HTMLElement|null} Message element or null
   */
  getMessageById(messageId) {
    return document.querySelector(`[data-message-id="${messageId}"]`);
  }

  /**
   * Update message content with LaTeX support
   * @param {string} messageId - Message ID
   * @param {string} newContent - New content
   */
  updateMessage(messageId, newContent) {
    const messageElement = this.getMessageById(messageId);
    if (messageElement) {
      const textElement = messageElement.querySelector('.message-text');
      if (textElement) {
        let processedHtml = '';
        
        // Escape LaTeX delimiters before markdown processing
        const escapedContent = this.escapeLatexDelimiters(newContent);
        
        // Process with marked (which now includes LaTeX support via markedKatex)
        if (this.markdownRenderer) {
          processedHtml = this.markdownRenderer.parse(escapedContent);
        } else {
          processedHtml = this.escapeHtml(escapedContent);
        }
        
        // Sanitize HTML
        if (this.sanitizer) {
          const safeHtml = this.sanitizer.sanitize(processedHtml, {
            ADD_TAGS: ['math', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mrow', 'msub', 'msup', 'mfrac', 'mroot', 'msqrt'],
            ADD_ATTR: ['data-mathml', 'aria-label', 'href', 'mathvariant', 'encoding']
          });
          textElement.innerHTML = safeHtml;
        } else {
          textElement.innerHTML = processedHtml;
        }
        
        // Apply KaTeX auto-render to handle additional delimiters
        // Need to use requestAnimationFrame to ensure DOM is updated
        if (typeof renderMathInElement !== 'undefined') {
          requestAnimationFrame(() => {
                console.log('HTML content before renderMathInElement:', textElement.innerHTML);
            renderMathInElement(textElement, {
              delimiters: [
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\begin{equation}', right: '\\end{equation}', display: true},
                {left: '\\begin{align}', right: '\\end{align}', display: true},
                {left: '\\begin{alignat}', right: '\\end{alignat}', display: true},
                {left: '\\begin{gather}', right: '\\end{gather}', display: true},
                {left: '\\begin{displaymath}', right: '\\end{displaymath}', display: true}
              ],
              throwOnError: false
            });
          });
        }
      }
    }
  }

  /**
   * Remove message by ID
   * @param {string} messageId - Message ID
   */
  removeMessage(messageId) {
    const messageElement = this.getMessageById(messageId);
    if (messageElement) {
      messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateX(-100%)';
      
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }
  }

  /**
   * Export conversation as text
   * @returns {string} Conversation text
   */
  exportAsText() {
    return this.conversationHistory.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      const timestamp = this.formatTimestamp(msg.timestamp);
      return `[${timestamp}] ${role}: ${msg.content}`;
    }).join('\n\n');
  }

  /**
   * Export conversation as JSON
   * @returns {string} Conversation JSON
   */
  exportAsJSON() {
    return JSON.stringify({
      conversation: this.conversationHistory,
      exportedAt: new Date().toISOString(),
      messageCount: this.conversationHistory.length
    }, null, 2);
  }

  /**
   * Show copy feedback
   * @param {HTMLElement} button - Copy button element
   */
  showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.backgroundColor = '#45a049';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '#4CAF50';
    }, 1500);
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleanup message handler
   */
  cleanup() {
    this.clearChat();
    this.markdownRenderer = null;
    this.sanitizer = null;
    console.log('Message handler cleaned up');
  }
}

// Export for use in other modules
window.MessageHandler = MessageHandler;