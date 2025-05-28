// Message Handling Module
// Manages message display, rendering, and interactions

class MessageHandler {
  constructor() {
    this.messageCounter = 0;
    this.conversationHistory = [];
    this.markdownRenderer = null;
    this.sanitizer = null;
    this.latexPlaceholders = new Map();
    this.placeholderPrefix = '__LATEX_PLACEHOLDER_';
    this.placeholderCounter = 0;
    
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
      
      // Check if markedKatex is available and use it
      if (typeof window.markedKatex !== 'undefined') {
        console.log('markedKatex found, configuring...');
        marked.use(window.markedKatex({
          throwOnError: false,
          output: 'html' // Use HTML output for better compatibility
        }));
        console.log('markedKatex extension loaded');
      }
      
      // Basic markdown configuration WITHOUT breaks: true to avoid LaTeX interference
      marked.setOptions({
        // DO NOT use breaks: true - it interferes with LaTeX
        breaks: false,
        gfm: true,
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined') {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
          return code;
        }
      });
      
      console.log('Markdown renderer configured for LaTeX compatibility');
    } else {
      console.warn('Marked.js not available - markdown rendering disabled');
    }

    if (typeof DOMPurify !== 'undefined') {
      this.sanitizer = DOMPurify;
      // Configure DOMPurify to allow KaTeX elements
      this.sanitizer.addHook('afterSanitizeAttributes', (node) => {
        // Allow KaTeX classes
        if (node.hasAttribute('class')) {
          const classes = node.getAttribute('class');
          if (classes && classes.includes('katex')) {
            // Keep KaTeX classes
            return;
          }
        }
      });
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
   * Extract LaTeX expressions and replace with placeholders
   * @param {string} text - Text containing LaTeX
   * @returns {string} Text with placeholders
   */
  extractLatex(text) {
    this.latexPlaceholders.clear();
    this.placeholderCounter = 0;

    // Define LaTeX patterns with proper regex
    const patterns = [
      // Display math with $$...$$ (multiline support)
      { regex: /\$\$([\s\S]*?)\$\$/g, display: true },
      // Display math with \[...\] (multiline support)
      { regex: /\\\[([\s\S]*?)\\\]/g, display: true },
      // Display math with \begin{equation}...\end{equation}
      { regex: /\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, display: true },
      // Display math with \begin{align}...\end{align}
      { regex: /\\begin\{align\}([\s\S]*?)\\end\{align\}/g, display: true },
      // Inline math with $...$ (single line)
      { regex: /(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, display: false },
      // Inline math with \(...\) (single line)
      { regex: /\\\(([^\)]+?)\\\)/g, display: false }
    ];

    let processedText = text;

    // Process each pattern
    patterns.forEach(({ regex, display }) => {
      processedText = processedText.replace(regex, (match, latex) => {
        const placeholder = `${this.placeholderPrefix}${this.placeholderCounter++}__`;
        this.latexPlaceholders.set(placeholder, { latex: latex.trim(), display, original: match });
        return placeholder;
      });
    });

    return processedText;
  }

  /**
   * Restore LaTeX expressions and render with KaTeX
   * @param {string} html - HTML with placeholders
   * @returns {string} HTML with rendered LaTeX
   */
  restoreAndRenderLatex(html) {
    let processedHtml = html;

    // Replace placeholders with rendered LaTeX
    this.latexPlaceholders.forEach((data, placeholder) => {
      const { latex, display, original } = data;
      
      try {
        if (typeof katex !== 'undefined') {
          const rendered = katex.renderToString(latex, {
            throwOnError: false,
            displayMode: display,
            trust: false,
            strict: 'warn',
            output: 'htmlAndMathml' // For accessibility
          });
          processedHtml = processedHtml.replace(placeholder, rendered);
        } else {
          // Fallback: restore original if KaTeX not available
          console.warn('KaTeX not available, restoring original LaTeX');
          processedHtml = processedHtml.replace(placeholder, original);
        }
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        // On error, show the LaTeX source in a styled span
        const errorHtml = `<span class="katex-error" style="color: #cc0000; font-family: monospace;">${this.escapeHtml(original)}</span>`;
        processedHtml = processedHtml.replace(placeholder, errorHtml);
      }
    });

    return processedHtml;
  }

  /**
   * Process text with LaTeX and markdown
   * @param {string} text - Raw text
   * @returns {string} Processed HTML
   */
  processTextWithLatex(text) {
    // Step 1: Extract LaTeX expressions
    const textWithPlaceholders = this.extractLatex(text);
    
    // Step 2: Process line breaks manually (since we can't use breaks: true)
    const textWithBreaks = textWithPlaceholders.replace(/\n/g, '  \n'); // Two spaces before newline for markdown line breaks
    
    // Step 3: Process markdown
    let html = '';
    if (this.markdownRenderer) {
      html = this.markdownRenderer.parse(textWithBreaks);
    } else {
      html = this.escapeHtml(textWithBreaks).replace(/\n/g, '<br>');
    }
    
    // Step 4: Restore and render LaTeX
    html = this.restoreAndRenderLatex(html);
    
    // Step 5: Sanitize HTML (KaTeX output should survive)
    if (this.sanitizer) {
      html = this.sanitizer.sanitize(html, {
        ADD_TAGS: ['span', 'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mroot', 'msqrt', 'mtext', 'annotation'],
        ADD_ATTR: ['class', 'style', 'encoding']
      });
    }
    
    return html;
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
   * Render markdown text with LaTeX support
   * @param {HTMLElement} parent - Parent element
   * @param {string} text - Text to render
   */
  renderMarkdownText(parent, text) {
    const textSpan = document.createElement('div');
    textSpan.className = 'message-text';
    
    let processedHtml = '';
    
    // Process with marked (which now includes LaTeX support via markedKatex)
    // if (this.markdownRenderer) {
    //   // Add two spaces before newlines for proper line breaks
    //   const textWithBreaks = text.replace(/\n/g, '  \n');
    //   processedHtml = this.markdownRenderer.parse(textWithBreaks);
    // } else {
    //   processedHtml = this.escapeHtml(text);
    // }
    
    // Sanitize HTML
    if (this.sanitizer) {
      const safeHtml = this.sanitizer.sanitize(processedHtml, {
        ADD_TAGS: ['span', 'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mroot', 'msqrt', 'mtext', 'annotation', 'annotation-xml'],
        ADD_ATTR: ['class', 'style', 'encoding', 'mathvariant', 'display']
      });
      textSpan.innerHTML = safeHtml;
    } else {
      textSpan.innerHTML = processedHtml;
    }
    
    parent.appendChild(textSpan);
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
    
    // Process with marked (which now includes LaTeX support via markedKatex)
    if (this.markdownRenderer) {
      // Add two spaces before newlines for proper line breaks
      const messageWithBreaks = message.replace(/\n/g, '  \n');
      processedHtml = this.markdownRenderer.parse(messageWithBreaks);
    } else {
      processedHtml = this.escapeHtml(message);
    }
    
    // Sanitize HTML
    if (this.sanitizer) {
      const safeHtml = this.sanitizer.sanitize(processedHtml, {
        ADD_TAGS: ['span', 'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mroot', 'msqrt', 'mtext', 'annotation', 'annotation-xml'],
        ADD_ATTR: ['class', 'style', 'encoding', 'mathvariant', 'display']
      });
      messageText.innerHTML = safeHtml;
    } else {
      messageText.innerHTML = processedHtml;
    }

    element.appendChild(messageText);
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
        
        // Process with marked (which now includes LaTeX support via markedKatex)
        if (this.markdownRenderer) {
          // Add two spaces before newlines for proper line breaks
          const contentWithBreaks = newContent.replace(/\n/g, '  \n');
          processedHtml = this.markdownRenderer.parse(contentWithBreaks);
        } else {
          processedHtml = this.escapeHtml(newContent);
        }
        
        // Sanitize HTML
        if (this.sanitizer) {
          const safeHtml = this.sanitizer.sanitize(processedHtml, {
            ADD_TAGS: ['span', 'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mroot', 'msqrt', 'mtext', 'annotation', 'annotation-xml'],
            ADD_ATTR: ['class', 'style', 'encoding', 'mathvariant', 'display']
          });
          textElement.innerHTML = safeHtml;
        } else {
          textElement.innerHTML = processedHtml;
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