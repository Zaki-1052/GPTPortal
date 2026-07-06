// Message Handling Module
// Manages message display, rendering, and interactions

class MessageHandler {
  constructor() {
    this.messageCounter = 0;
    this.conversationHistory = [];
    this.markdownRenderer = null;
    this.sanitizer = null;
    this.eventHandlersAttached = false;

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
    // Prevent duplicate event listeners
    if (this.eventHandlersAttached) {
      console.log('Message handler event listeners already attached, skipping...');
      return;
    }

    // Listen for copy button clicks
    this.clickHandler = (e) => {
      if (e.target.matches('.copy-btn, .copy-code-btn')) {
        this.handleCopyClick(e);
      }
      // Screenshot button clicks are handled by individual button event listeners
      // (added in createScreenshotButton method)
    };

    document.addEventListener('click', this.clickHandler);
    this.eventHandlersAttached = true;
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
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
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
    imageElement.classList.add('generated-image'); // sized by Stage 1 `.message img`

    element.appendChild(imageElement);

    // Add download button (styled via `.download-btn` — see new-class note).
    const downloadBtn = this.createButton('Download', () => {
      this.downloadImage(imageSrc);
    });
    downloadBtn.className = 'download-btn';
    element.appendChild(downloadBtn);
  }

  /**
   * Render error message
   * @param {HTMLElement} element - Message element
   * @param {string} message - Error message
   */
  renderErrorMessage(element, message) {
    // Styling comes from Stage 1's `.message.error` tokens (class already set).
    const icon = document.createElement('span');
    icon.className = 'message-icon';
    icon.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

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
    // Styling comes from Stage 1's `.message.system` tokens (class already set).
    const icon = document.createElement('span');
    icon.className = 'message-icon';
    icon.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

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
    this.renderRichText(element, message);

    // Add main copy button
    const copyButton = this.createCopyButton(message);
    element.appendChild(copyButton);

    // Add screenshot button
    const screenshotButton = this.createScreenshotButton(element);
    element.appendChild(screenshotButton);
  }

  /**
   * Shared rich-text renderer: routes to the code-block-aware or simple
   * markdown path. Reused by displayMessage (non-streaming) and by
   * finalizeStreamingResponse so both share one render pipeline.
   * @param {HTMLElement} element - Parent to append rendered content to
   * @param {string} message - Message content
   */
  renderRichText(element, message) {
    if (message.includes('```')) {
      this.renderMessageWithCodeBlocks(element, message);
    } else {
      this.renderSimpleTextMessage(element, message);
    }
  }

  /* =======================================================================
   * STREAMING RENDER API (consumed by ChatManager's SSE reader)
   * Incrementally shows plaintext deltas + reasoning, then runs the full
   * markdown/highlight/KaTeX pipeline on the complete text at the end.
   * ===================================================================== */

  /**
   * Create + append an empty assistant message ready to receive streamed
   * deltas. Contains a hidden reasoning block and a live plaintext area.
   * @returns {Object} handle used by the append/finalize helpers
   */
  beginStreamingResponse() {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'response');
    messageElement.dataset.messageId = `msg-${this.messageCounter++}`;
    messageElement.dataset.timestamp = new Date().toISOString();
    messageElement.dataset.streaming = 'true';

    // Collapsible reasoning area — hidden until a thinking delta arrives.
    const thinkingEl = document.createElement('details');
    thinkingEl.className = 'thinking-block';
    thinkingEl.hidden = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Reasoning';
    const thinkingContentEl = document.createElement('div');
    thinkingContentEl.className = 'thinking-content';
    thinkingEl.appendChild(summary);
    thinkingEl.appendChild(thinkingContentEl);
    messageElement.appendChild(thinkingEl);

    // Live plaintext area (replaced by the full render on finalize).
    const liveTextEl = document.createElement('div');
    liveTextEl.className = 'message-text streaming-text';
    const caretEl = document.createElement('span');
    caretEl.className = 'streaming-cursor';
    liveTextEl.appendChild(caretEl);
    messageElement.appendChild(liveTextEl);

    this.appendToChat(messageElement);

    return {
      element: messageElement,
      thinkingEl,
      thinkingContentEl,
      liveTextEl,
      caretEl,
      textBuffer: '',
      thinkingBuffer: ''
    };
  }

  /**
   * Append an answer-text delta to the live area (keeps the caret trailing).
   * @param {Object} handle - handle from beginStreamingResponse
   * @param {string} delta - text fragment
   */
  appendStreamingText(handle, delta) {
    if (!handle || !delta) return;
    handle.textBuffer += delta;
    if (handle.liveTextEl) {
      // textContent preserves the raw stream; caret re-appended at the tail.
      handle.liveTextEl.textContent = handle.textBuffer;
      if (handle.caretEl) handle.liveTextEl.appendChild(handle.caretEl);
    }
    this.scrollChatToBottom();
  }

  /**
   * Reveal (once) and append to the collapsible reasoning block.
   * @param {Object} handle - handle from beginStreamingResponse
   * @param {string} delta - reasoning fragment
   */
  appendStreamingThinking(handle, delta) {
    if (!handle || !delta) return;
    handle.thinkingBuffer += delta;
    if (handle.thinkingEl && handle.thinkingEl.hidden) {
      handle.thinkingEl.hidden = false;
      handle.thinkingEl.open = true; // expanded while actively streaming
    }
    if (handle.thinkingContentEl) {
      handle.thinkingContentEl.textContent = handle.thinkingBuffer;
    }
    this.scrollChatToBottom();
  }

  /**
   * Replace the live plaintext with the full render pipeline output
   * (marked -> DOMPurify -> highlight.js -> KaTeX) and attach the message
   * action buttons. Collapses or drops the reasoning block as appropriate.
   * @param {Object} handle - handle from beginStreamingResponse
   * @param {string} fullText - the complete answer text
   * @returns {HTMLElement} the finalized message element
   */
  finalizeStreamingResponse(handle, fullText) {
    if (!handle) return null;
    const element = handle.element;

    // Drop the transient live plaintext area.
    if (handle.liveTextEl && handle.liveTextEl.parentNode) {
      handle.liveTextEl.parentNode.removeChild(handle.liveTextEl);
    }

    // Keep captured reasoning (collapsed); remove the block if none arrived.
    if (handle.thinkingEl) {
      if (handle.thinkingBuffer) {
        handle.thinkingEl.hidden = false;
        handle.thinkingEl.open = false;
      } else if (handle.thinkingEl.parentNode) {
        handle.thinkingEl.parentNode.removeChild(handle.thinkingEl);
      }
    }

    const text = (fullText != null ? fullText : handle.textBuffer) || '';

    // Full render — reuses the exact non-streaming pipeline.
    this.renderRichText(element, text);
    element.appendChild(this.createCopyButton(text));
    element.appendChild(this.createScreenshotButton(element));

    element.dataset.streaming = 'false';
    this.addToHistory('assistant', text);
    this.scrollChatToBottom();
    return element;
  }

  /**
   * Remove a streaming message element (used when a stream errors before
   * producing any answer text).
   * @param {Object} handle - handle from beginStreamingResponse
   */
  discardStreamingResponse(handle) {
    if (handle && handle.element && handle.element.parentNode) {
      handle.element.parentNode.removeChild(handle.element);
    }
  }

  /**
   * Scroll the chat viewport to the newest content.
   */
  scrollChatToBottom() {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
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

    // Create code container. Styling (dark code palette, header row, layout)
    // comes from Stage 1's token-based `.code-block` rules — no inline styles.
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-block';

    // Add language label if present
    if (language) {
      const langLabel = document.createElement('div');
      langLabel.className = 'code-language';
      langLabel.textContent = language;
      codeContainer.appendChild(langLabel);
    }

    // Create pre/code elements
    const pre = document.createElement('pre');

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

    // Add copy code button. Position + theme come from Stage 1's
    // `.code-block .copy-btn` rules (class set by createCopyButton).
    const copyCodeButton = this.createCopyButton(actualCode, 'Copy Code');
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
   * Create screenshot button
   * @param {HTMLElement} messageElement - Message element to screenshot
   * @returns {HTMLElement} Screenshot button
   */
  createScreenshotButton(messageElement) {
    const button = this.createButton('', async () => {
      try {
        await this.captureAndCopyScreenshot(messageElement);
        this.showScreenshotFeedback(button);
      } catch (error) {
        console.error('Screenshot failed:', error);
        this.showScreenshotError(button);
      }
    });

    button.className = 'screenshot-btn';
    button.title = 'Copy screenshot to clipboard';
    button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

    return button;
  }

  /**
   * Create button element
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @returns {HTMLElement} Button element
   */
  createButton(text, onClick) {
    // Visual styling is supplied by the caller-assigned class (.copy-btn,
    // .screenshot-btn, .download-btn) via Stage 1 tokens — no inline styles.
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Append message to chat box
   * @param {HTMLElement} messageElement - Message element to append
   */
  appendToChat(messageElement) {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      // Entrance animation is supplied by Stage 1's `.message` keyframes.
      chatBox.appendChild(messageElement);
      chatBox.scrollTop = chatBox.scrollHeight;
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
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
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
   * Capture message element as screenshot and copy to clipboard
   * @param {HTMLElement} messageElement - Message element to capture
   */
  async captureAndCopyScreenshot(messageElement) {
    // Check browser support
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported in this browser');
    }

    // Create canvas and capture the message
    const canvas = await this.captureMessageToCanvas(messageElement);
    
    // Convert canvas to blob and copy to clipboard
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }

        try {
          const clipboardItem = new ClipboardItem({
            'image/png': blob
          });
          
          await navigator.clipboard.write([clipboardItem]);
          console.log('Screenshot copied to clipboard successfully');
          resolve();
        } catch (error) {
          console.error('Failed to copy screenshot to clipboard:', error);
          reject(error);
        }
      }, 'image/png', 0.95);
    });
  }

  /**
   * Capture message element to canvas
   * @param {HTMLElement} messageElement - Element to capture
   * @returns {Promise<HTMLCanvasElement>} Canvas with captured content
   */
  async captureMessageToCanvas(messageElement) {
    // Get element dimensions and styles
    const rect = messageElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(messageElement);
    
    // Create canvas with appropriate size
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    
    // Set canvas size accounting for device pixel ratio
    canvas.width = Math.ceil(rect.width * scale);
    canvas.height = Math.ceil(rect.height * scale);
    ctx.scale(scale, scale);
    
    // Set canvas dimensions for CSS
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Fill background
    const bgColor = this.getElementBackgroundColor(messageElement, computedStyle);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw rounded corners if border-radius is set
    const borderRadius = this.getBorderRadius(computedStyle);
    if (borderRadius > 0) {
      this.drawRoundedRect(ctx, 0, 0, rect.width, rect.height, borderRadius, bgColor);
    }

    // Render text content
    await this.renderElementContent(ctx, messageElement, rect);
    
    return canvas;
  }

  /**
   * Get effective background color of element
   * @param {HTMLElement} element - Element to check
   * @param {CSSStyleDeclaration} computedStyle - Computed styles
   * @returns {string} Background color
   */
  getElementBackgroundColor(element, computedStyle) {
    let bgColor = computedStyle.backgroundColor;
    
    // If transparent, look for parent background
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      // Use message response background color from CSS
      bgColor = 'rgba(22, 27, 34, 0.8)';
    }
    
    return bgColor;
  }

  /**
   * Get border radius from computed style
   * @param {CSSStyleDeclaration} computedStyle - Computed styles
   * @returns {number} Border radius in pixels
   */
  getBorderRadius(computedStyle) {
    const borderRadius = computedStyle.borderRadius;
    if (borderRadius && borderRadius !== '0px') {
      return parseInt(borderRadius, 10) || 0;
    }
    return 0;
  }

  /**
   * Draw rounded rectangle
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Border radius
   * @param {string} fillStyle - Fill color
   */
  drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  /**
   * Render element content to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLElement} element - Element to render
   * @param {DOMRect} containerRect - Container dimensions
   */
  async renderElementContent(ctx, element, containerRect) {
    const padding = 20; // Message padding from CSS
    let currentY = padding;
    
    // Set text properties
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#e6edf3'; // Text color from CSS
    
    // Process each child element
    for (const child of element.children) {
      if (child.classList.contains('copy-btn') || child.classList.contains('screenshot-btn')) {
        continue; // Skip buttons
      }
      
      if (child.classList.contains('message-text')) {
        currentY = await this.renderTextContent(ctx, child, padding, currentY, containerRect.width - (padding * 2));
      } else if (child.classList.contains('code-block')) {
        currentY = await this.renderCodeBlock(ctx, child, padding, currentY, containerRect.width - (padding * 2));
      }
      
      currentY += 10; // Space between elements
    }
  }

  /**
   * Render text content to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLElement} textElement - Text element
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} maxWidth - Maximum width
   * @returns {Promise<number>} Next Y position
   */
  async renderTextContent(ctx, textElement, x, y, maxWidth) {
    ctx.font = '16px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#e6edf3';
    
    const text = textElement.textContent || '';
    const lineHeight = 24;
    const lines = this.wrapText(ctx, text, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineHeight));
    }
    
    return y + (lines.length * lineHeight);
  }

  /**
   * Render code block to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {HTMLElement} codeElement - Code block element
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} maxWidth - Maximum width
   * @returns {Promise<number>} Next Y position
   */
  async renderCodeBlock(ctx, codeElement, x, y, maxWidth) {
    const codeRect = { x: x, y: y, width: maxWidth, height: 0 };
    
    // Draw code block background
    ctx.fillStyle = '#1e1e1e';
    const codeHeight = 100; // Estimate, would need more complex calculation
    ctx.fillRect(codeRect.x, codeRect.y, codeRect.width, codeHeight);
    
    // Draw code text
    ctx.font = '14px "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace';
    ctx.fillStyle = '#e6edf3';
    
    const codeText = codeElement.textContent || '';
    const lines = this.wrapText(ctx, codeText, maxWidth - 32); // Account for padding
    const lineHeight = 20;
    
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + 16, y + 16 + (i * lineHeight));
    }
    
    return y + Math.max(codeHeight, (lines.length * lineHeight) + 32);
  }

  /**
   * Wrap text to fit within specified width
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Text to wrap
   * @param {number} maxWidth - Maximum width
   * @returns {string[]} Array of wrapped lines
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [''];
  }

  /**
   * Show screenshot success feedback
   * @param {HTMLElement} button - Screenshot button
   */
  showScreenshotFeedback(button) {
    const original = button.innerHTML;
    button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    button.classList.add('copied');

    setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove('copied');
    }, 2000);
  }

  /**
   * Show screenshot error feedback
   * @param {HTMLElement} button - Screenshot button
   */
  showScreenshotError(button) {
    const original = button.innerHTML;
    button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    button.classList.add('failed');
    button.title = 'Screenshot failed - clipboard not supported';

    setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove('failed');
      button.title = 'Copy screenshot to clipboard';
    }, 3000);
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