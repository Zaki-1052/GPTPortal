// Message Handling Module
// Manages message display, rendering, and interactions

class MessageHandler {
  constructor() {
    this.messageCounter = 0;
    this.conversationHistory = [];
    this.markdownRenderer = null;
    this.sanitizer = null;
    this.latexRenderer = null;
    this.latexEnabled = false;
    
    this.init();
  }

  /**
   * Initialize message handler
   */
  init() {
    this.setupMarkdown();
    this.setupLaTeX();
    this.setupEventHandlers();
    console.log('Message handler initialized');
  }

  /**
   * Setup markdown rendering
   */
  setupMarkdown() {
    console.log('=== setupMarkdown called ===');
    console.log('typeof marked:', typeof marked);
    
    if (typeof marked !== 'undefined') {
      this.markdownRenderer = marked;
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
      console.log('Markdown renderer configured successfully');
      console.log('this.markdownRenderer:', !!this.markdownRenderer);
    } else {
      console.warn('Marked.js not available - markdown rendering disabled');
    }

    if (typeof DOMPurify !== 'undefined') {
      this.sanitizer = DOMPurify;
      console.log('DOMPurify sanitizer available');
    } else {
      console.warn('DOMPurify not available - HTML sanitization disabled');
    }
  }

  /**
   * Setup LaTeX rendering
   */
  setupLaTeX() {
    console.log('=== setupLaTeX called ===');
    console.log('typeof katex:', typeof katex);
    
    if (typeof katex !== 'undefined') {
      this.latexRenderer = katex;
      this.latexEnabled = true;
      console.log('✓ KaTeX LaTeX renderer available');
      console.log('LaTeX enabled set to:', this.latexEnabled);
    } else {
      console.warn('KaTeX not available - LaTeX rendering disabled');
      this.latexEnabled = false;
      console.log('LaTeX enabled set to:', this.latexEnabled);
    }
  }

  /**
   * Process LaTeX expressions in DOM elements
   * @param {HTMLElement} element - DOM element to process
   */
  processLaTeXInDOM(element) {
    // Get all text nodes in the element
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip text nodes inside code blocks and pre elements
          if (node.parentElement.closest('code, pre')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // Process each text node
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      if (!text) return;
      
      // Check for LaTeX patterns
      const hasLaTeX = 
        /\$\$[\s\S]+?\$\$/.test(text) ||  // Display math $$...$$
        /\$[^$\n]+?\$/.test(text) ||       // Inline math $...$
        /\\\[[\s\S]+?\\\]/.test(text) ||   // Display math \[...\]
        /\\\([\s\S]+?\\\)/.test(text) ||   // Inline math \(...\)
        /\\begin\{equation\}[\s\S]+?\\end\{equation\}/.test(text); // Equation environment
      
      if (!hasLaTeX) return;
      
      console.log('Found LaTeX in text node:', text);
      
      // Create a temporary container to process the text
      const tempDiv = document.createElement('div');
      let processedText = text;
      
      // Process display math $$...$$ first
      processedText = processedText.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
        try {
          return katex.renderToString(content.trim(), {
            displayMode: true,
            throwOnError: false
          });
        } catch (e) {
          console.warn('LaTeX error:', e);
          return match;
        }
      });
      
      // Process display math \[...\]
      processedText = processedText.replace(/\\\[([^\]]+)\\\]/g, (match, content) => {
        try {
          return katex.renderToString(content.trim(), {
            displayMode: true,
            throwOnError: false
          });
        } catch (e) {
          console.warn('LaTeX error:', e);
          return match;
        }
      });
      
      // Process equation environments
      processedText = processedText.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, content) => {
        try {
          return katex.renderToString(content.trim(), {
            displayMode: true,
            throwOnError: false
          });
        } catch (e) {
          console.warn('LaTeX error:', e);
          return match;
        }
      });
      
      // Process displaymath environments
      processedText = processedText.replace(/\\begin\{displaymath\}([\s\S]*?)\\end\{displaymath\}/g, (match, content) => {
        try {
          return katex.renderToString(content.trim(), {
            displayMode: true,
            throwOnError: false
          });
        } catch (e) {
          console.warn('LaTeX error:', e);
          return match;
        }
      });
      
      // Process inline math \(...\)
      processedText = processedText.replace(/\\\(([^)]+)\\\)/g, (match, content) => {
        try {
          return katex.renderToString(content.trim(), {
            displayMode: false,
            throwOnError: false
          });
        } catch (e) {
          console.warn('LaTeX error:', e);
          return match;
        }
      });
      
      // Process inline math $...$ (be careful not to match $$)
      processedText = processedText.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (match, content) => {
        // Check if it looks like LaTeX
        if (!/[\\^_{}]/.test(content)) {
          return match;
        }
        try {
          return katex.renderToString(content.trim(), {
            displayMode: false,
            throwOnError: false
          });
        } catch (e) {
          console.warn('LaTeX error:', e);
          return match;
        }
      });
      
      // If text changed, replace the text node with processed HTML
      if (processedText !== text) {
        tempDiv.innerHTML = processedText;
        
        // Replace the text node with the new nodes
        const parent = textNode.parentNode;
        while (tempDiv.firstChild) {
          parent.insertBefore(tempDiv.firstChild, textNode);
        }
        parent.removeChild(textNode);
      }
    });
  }
  
  /**
   * Extract LaTeX expressions and replace with placeholders
   * @param {string} text - Text containing LaTeX expressions
   * @returns {Object} Object with processed text and LaTeX map
   */
  extractLaTeX(text) {
    const latexMap = new Map();
    let counter = 0;
    let processedText = text;
    
    console.log('=== extractLaTeX called ===');
    console.log('Input text:', text);
    
    // Extract \begin{equation}...\end{equation} blocks first
    processedText = processedText.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, content) => {
      const placeholder = `LATEXPLACEHOLDER${counter}ENDLATEX`;
      latexMap.set(placeholder, {
        content: content.trim(),
        displayMode: true,
        original: match
      });
      counter++;
      console.log(`Extracted equation environment: ${match} → ${placeholder}`);
      return placeholder;
    });
    
    // Extract display math \[...\] - must have content
    processedText = processedText.replace(/\\\[([^\]]+)\\\]/g, (match, content) => {
      const placeholder = `LATEXPLACEHOLDER${counter}ENDLATEX`;
      latexMap.set(placeholder, {
        content: content.trim(),
        displayMode: true,
        original: match
      });
      counter++;
      console.log(`Extracted display math \\[...\\]: ${match} → ${placeholder}`);
      return placeholder;
    });
    
    // Extract display math $$...$$ - don't require newlines
    processedText = processedText.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
      const placeholder = `LATEXPLACEHOLDER${counter}ENDLATEX`;
      latexMap.set(placeholder, {
        content: content.trim(),
        displayMode: true,
        original: match
      });
      counter++;
      console.log(`Extracted display math $$...$$: ${match} → ${placeholder}`);
      return placeholder;
    });
    
    // Extract inline math \(...\)
    processedText = processedText.replace(/\\\(([^)]+)\\\)/g, (match, content) => {
      const placeholder = `LATEXPLACEHOLDER${counter}ENDLATEX`;
      latexMap.set(placeholder, {
        content: content.trim(),
        displayMode: false,
        original: match
      });
      counter++;
      console.log(`Extracted inline paren math: ${match} → ${placeholder}`);
      return placeholder;
    });
    
    // Extract inline math $...$ - simpler pattern
    // Process from end to beginning to avoid issues with offset-based validation
    const dollarMatches = [];
    let dollarRegex = /\$([^$\n]+)\$/g;
    let match;
    
    while ((match = dollarRegex.exec(processedText)) !== null) {
      // Check if it's actually LaTeX (contains backslash, ^, _, or braces)
      if (/[\\^_{}]/.test(match[1])) {
        dollarMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          original: match[0]
        });
      }
    }
    
    // Replace from end to beginning to maintain string positions
    for (let i = dollarMatches.length - 1; i >= 0; i--) {
      const m = dollarMatches[i];
      const placeholder = `LATEXPLACEHOLDER${counter}ENDLATEX`;
      latexMap.set(placeholder, {
        content: m.content.trim(),
        displayMode: false,
        original: m.original
      });
      counter++;
      processedText = processedText.substring(0, m.start) + placeholder + processedText.substring(m.end);
      console.log(`Extracted inline dollar math: ${m.original} → ${placeholder}`);
    }
    
    console.log(`Extracted ${counter} LaTeX expressions`);
    console.log('Processed text:', processedText);
    
    return { processedText, latexMap };
  }
  
  /**
   * Restore LaTeX placeholders with rendered content
   * @param {string} html - HTML with placeholders
   * @param {Map} latexMap - Map of placeholders to LaTeX content
   * @returns {string} HTML with rendered LaTeX
   */
  restoreLaTeX(html, latexMap) {
    if (!this.latexEnabled || latexMap.size === 0) return html;
    
    console.log('=== restoreLaTeX called ===');
    console.log('LaTeX map size:', latexMap.size);
    console.log('Input HTML:', html);
    
    let restoredHtml = html;
    
    // Replace each placeholder with rendered LaTeX
    for (const [placeholder, data] of latexMap) {
      console.log(`Restoring placeholder: "${placeholder}"`);
      console.log(`HTML contains placeholder? ${restoredHtml.includes(placeholder)}`);
      
      try {
        const rendered = katex.renderToString(data.content, {
          displayMode: data.displayMode,
          throwOnError: false,
          trust: false,
          strict: 'warn',
          errorColor: '#cc0000'
        });
        
        // Simple string replacement - the placeholder should be unique enough
        restoredHtml = restoredHtml.replace(new RegExp(placeholder, 'g'), rendered);
        
        console.log(`Successfully rendered ${data.displayMode ? 'display' : 'inline'} math: ${data.content}`);
      } catch (error) {
        console.warn(`LaTeX rendering error for ${placeholder}:`, error.message);
        // On error, show the original LaTeX notation with error styling
        const errorHtml = `<span class="latex-error" title="LaTeX Error: ${error.message}">${this.escapeHtml(data.original)}</span>`;
        restoredHtml = restoredHtml.replace(new RegExp(placeholder, 'g'), errorHtml);
      }
    }
    
    console.log('Final restored HTML:', restoredHtml);
    console.log('=== restoreLaTeX completed ===');
    return restoredHtml;
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
        this.renderTextMessage(messageElement, message, type);
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
   * @param {string} type - Message type
   */
  renderTextMessage(element, message, type) {
    console.log('=== renderTextMessage called ===');
    console.log('Message type:', type);
    console.log('Message contains code blocks:', message.includes('```'));
    
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
    console.log('=== renderMessageWithCodeBlocks called ===');
    console.log('Message contains code blocks, splitting...');
    
    const parts = message.split(/(```[\s\S]+?```)/);
    
    parts.forEach(part => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Handle code blocks
        console.log('Rendering code block...');
        this.renderCodeBlock(element, part);
      } else {
        // Handle regular text
        console.log('Rendering regular text part (will process LaTeX)...');
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
   * Render markdown text
   * @param {HTMLElement} parent - Parent element
   * @param {string} text - Text to render
   */
  renderMarkdownText(parent, text) {
    console.log('=== renderMarkdownText called ===');
    console.log('LaTeX enabled:', this.latexEnabled);
    console.log('Input text:', text);
    console.log('Markdown renderer available:', !!this.markdownRenderer);
    
    const textSpan = document.createElement('div');
    textSpan.className = 'message-text';
    
    let processedText = text;
    let processedHtml = '';
    
    // Protect LaTeX delimiters from markdown processing
    if (this.latexEnabled) {
      // Temporarily escape LaTeX delimiters so markdown doesn't process them
      processedText = processedText
        .replace(/\\\[/g, '@@LEFTBRACKET@@')
        .replace(/\\\]/g, '@@RIGHTBRACKET@@')
        .replace(/\\\(/g, '@@LEFTPAREN@@')
        .replace(/\\\)/g, '@@RIGHTPAREN@@')
        .replace(/\\begin\{equation\}/g, '@@BEGINEQUATION@@')
        .replace(/\\end\{equation\}/g, '@@ENDEQUATION@@')
        .replace(/\\begin\{displaymath\}/g, '@@BEGINDISPLAYMATH@@')
        .replace(/\\end\{displaymath\}/g, '@@ENDDISPLAYMATH@@');
    }
    
    // Process markdown
    if (this.markdownRenderer) {
      processedHtml = this.markdownRenderer.parse(processedText);
      console.log('Markdown processed, output HTML:', processedHtml);
    } else {
      // Fallback to plain text if no markdown renderer
      console.log('No markdown renderer available, using plain text fallback');
      processedHtml = this.escapeHtml(processedText);
    }
    
    // Restore LaTeX delimiters
    if (this.latexEnabled) {
      processedHtml = processedHtml
        .replace(/@@LEFTBRACKET@@/g, '\\[')
        .replace(/@@RIGHTBRACKET@@/g, '\\]')
        .replace(/@@LEFTPAREN@@/g, '\\(')
        .replace(/@@RIGHTPAREN@@/g, '\\)')
        .replace(/@@BEGINEQUATION@@/g, '\\begin{equation}')
        .replace(/@@ENDEQUATION@@/g, '\\end{equation}')
        .replace(/@@BEGINDISPLAYMATH@@/g, '\\begin{displaymath}')
        .replace(/@@ENDDISPLAYMATH@@/g, '\\end{displaymath}');
    }
    
    // Set the HTML first
    if (this.sanitizer) {
      const safeHtml = this.sanitizer.sanitize(processedHtml, {
        ADD_TAGS: ['span'],
        ADD_ATTR: ['class', 'style'] // Allow KaTeX styling
      });
      textSpan.innerHTML = safeHtml;
    } else {
      textSpan.innerHTML = processedHtml;
    }
    
    // Now process LaTeX in the DOM if enabled
    if (this.latexEnabled && this.latexRenderer) {
      console.log('Processing LaTeX in DOM...');
      this.processLaTeXInDOM(textSpan);
    }
    
    parent.appendChild(textSpan);
  }

  /**
   * Render simple text message
   * @param {HTMLElement} element - Message element
   * @param {string} message - Message text
   */
  renderSimpleTextMessage(element, message) {
    console.log('=== renderSimpleTextMessage called ===');
    console.log('LaTeX enabled:', this.latexEnabled);
    console.log('Input message:', message);
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    let processedText = message;
    let processedHtml = '';
    
    // Protect LaTeX delimiters from markdown processing
    if (this.latexEnabled) {
      // Temporarily escape LaTeX delimiters so markdown doesn't process them
      processedText = processedText
        .replace(/\\\[/g, '@@LEFTBRACKET@@')
        .replace(/\\\]/g, '@@RIGHTBRACKET@@')
        .replace(/\\\(/g, '@@LEFTPAREN@@')
        .replace(/\\\)/g, '@@RIGHTPAREN@@')
        .replace(/\\begin\{equation\}/g, '@@BEGINEQUATION@@')
        .replace(/\\end\{equation\}/g, '@@ENDEQUATION@@')
        .replace(/\\begin\{displaymath\}/g, '@@BEGINDISPLAYMATH@@')
        .replace(/\\end\{displaymath\}/g, '@@ENDDISPLAYMATH@@');
    }
    
    // Process markdown
    if (this.markdownRenderer) {
      processedHtml = this.markdownRenderer.parse(processedText);
      console.log('Markdown processed');
    } else {
      // Fallback to plain text if no markdown renderer
      processedHtml = this.escapeHtml(processedText);
    }
    
    // Restore LaTeX delimiters
    if (this.latexEnabled) {
      processedHtml = processedHtml
        .replace(/@@LEFTBRACKET@@/g, '\\[')
        .replace(/@@RIGHTBRACKET@@/g, '\\]')
        .replace(/@@LEFTPAREN@@/g, '\\(')
        .replace(/@@RIGHTPAREN@@/g, '\\)')
        .replace(/@@BEGINEQUATION@@/g, '\\begin{equation}')
        .replace(/@@ENDEQUATION@@/g, '\\end{equation}')
        .replace(/@@BEGINDISPLAYMATH@@/g, '\\begin{displaymath}')
        .replace(/@@ENDDISPLAYMATH@@/g, '\\end{displaymath}');
    }
    
    // Set the HTML
    if (this.sanitizer) {
      const safeHtml = this.sanitizer.sanitize(processedHtml, {
        ADD_TAGS: ['span'],
        ADD_ATTR: ['class', 'style'] // Allow KaTeX styling
      });
      messageText.innerHTML = safeHtml;
    } else {
      messageText.innerHTML = processedHtml;
    }
    
    // Process LaTeX in the DOM if enabled
    if (this.latexEnabled && this.latexRenderer) {
      console.log('Processing LaTeX in DOM...');
      this.processLaTeXInDOM(messageText);
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
   * Update message content
   * @param {string} messageId - Message ID
   * @param {string} newContent - New content
   */
  updateMessage(messageId, newContent) {
    const messageElement = this.getMessageById(messageId);
    if (messageElement) {
      const textElement = messageElement.querySelector('.message-text');
      if (textElement) {
        if (this.markdownRenderer && this.sanitizer) {
          const rawHtml = this.markdownRenderer.parse(newContent);
          const safeHtml = this.sanitizer.sanitize(rawHtml);
          textElement.innerHTML = safeHtml;
        } else {
          textElement.textContent = newContent;
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
    this.latexRenderer = null;
    this.latexEnabled = false;
    console.log('Message handler cleaned up');
  }
}

// Export for use in other modules
window.MessageHandler = MessageHandler;