// Advanced export service for generating rich HTML exports
const { marked } = require('marked');
const tokenService = require('./tokenService');
const costService = require('./costService');
const titleService = require('./titleService');

class ExportService {
  constructor() {
    this.setupMarkedOptions();
  }

  /**
   * Setup marked.js options for markdown rendering
   */
  setupMarkedOptions() {
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false // We'll handle sanitization elsewhere if needed
    });
  }

  /**
   * Get HTML template styles
   */
  getExportStyles() {
    return `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .message { 
          margin: 10px 0; 
          padding: 15px; 
          border-radius: 8px;
          border-left: 4px solid #ddd;
        }
        .system { 
          background-color: #f8f9fa; 
          border-left-color: #6c757d;
        }
        .user { 
          background-color: #e3f2fd; 
          border-left-color: #2196f3;
        }
        .assistant { 
          background-color: #e8f5e8; 
          border-left-color: #4caf50;
        }
        .generated-image { 
          max-width: 100%; 
          height: auto; 
          border-radius: 4px;
          margin: 10px 0;
        }
        .summary { 
          background-color: #f9f9f9; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        .summary h3 { 
          margin-top: 0; 
          color: #333;
        }
        .thinking {
          background-color: #fff3e0;
          padding: 15px;
          margin: 10px 0;
          border-left: 4px solid #ff9800;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }
        .thinking h4 {
          color: #f57c00;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .response {
          margin-top: 15px;
        }
        .response h4 {
          color: #2e7d32;
          margin-top: 0;
          margin-bottom: 10px;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-x: auto;
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .metadata {
          font-size: 0.9em;
          color: #666;
          margin-top: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }
        .export-info {
          font-size: 0.8em;
          color: #888;
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    `;
  }

  /**
   * Export standard chat to HTML
   */
  async exportChatToHTML(conversationHistory, claudeHistory, o1History, deepseekHistory, claudeInstructions, modelID, providerFactory) {
    // Determine which history to use
    let containsAssistantMessage = conversationHistory.some(entry => entry.role === 'assistant');
    let chatHistory;
    let isClaudeChat = false;
    let chatType = 'chat';

    if (o1History.length > 0) {
      console.log("Using O1 conversation history");
      chatHistory = o1History;
    } else if (deepseekHistory.length > 0) {
      console.log("Using Deepseek conversation history");
      chatHistory = deepseekHistory;
    } else if (containsAssistantMessage && conversationHistory.length > 0) {
      console.log("Using GPT conversation history");
      chatHistory = conversationHistory;
    } else {
      console.log("Using Claude conversation history");
      chatHistory = [...claudeHistory];
      chatHistory.unshift({
        role: 'system',
        content: claudeInstructions
      });
      isClaudeChat = true;
    }

    // Calculate tokens and cost
    const tokens = await tokenService.tokenizeHistory(chatHistory, modelID, chatType);
    const cost = await costService.calculateCost(tokens, modelID);

    // Format history for title generation
    const savedHistory = titleService.formatHistoryForTitleGeneration(chatHistory, chatType);

    // Generate title and summary
    let title, summary;
    try {
      const openaiHandler = providerFactory.isProviderAvailable('openai') ? 
        providerFactory.getHandler('openai') : null;
      
      if (openaiHandler) {
        const result = await titleService.titleChat(savedHistory, tokens, cost, openaiHandler);
        title = result.title;
        summary = result.summary;
      } else {
        title = 'Chat Export';
        summary = 'Chat conversation export';
      }
    } catch (error) {
      console.error('Error generating title/summary:', error);
      title = 'Chat Export';
      summary = 'Chat conversation export';
    }

    // Simplify system prompt for HTML display if it's Claude
    if (isClaudeChat) {
      console.log("Redefining the system prompt for html.");
      chatHistory = [...claudeHistory];
      chatHistory.unshift({
        role: 'system',
        content: 'Claude AI: You are a helpful and intelligent AI assistant, knowledgeable about a wide range of topics and highly capable of a great many tasks.'
      });
    }

    // Generate HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${this.getExportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="metadata">
            Exported on ${new Date().toLocaleString()} | 
            Model: ${modelID} | 
            Tokens: ${tokens.totalTokens} | 
            Cost: ${costService.formatCost(cost / 100)}
          </div>
        </div>
    `;

    // Process chat messages
    chatHistory.forEach(entry => {
      let formattedContent = '';
    
      if (entry.role === 'system' && typeof entry.content === 'string') {
        // Format system prompt
        formattedContent = `<pre>${entry.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
      } else if (Array.isArray(entry.content)) {
        // Handle complex content (like Claude thinking/response format)
        const hasThinking = entry.content.some(item => item.type === 'thinking');
        
        entry.content.forEach(item => {
          if (item.type === 'thinking' && typeof item.thinking === 'string') {
            formattedContent += `<div class="thinking"><h4>🤔 Thinking:</h4><pre>${item.thinking.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>`;
          } else if (item.type === 'text' && typeof item.text === 'string') {
            if (hasThinking) {
              formattedContent += `<div class="response"><h4>💬 Response:</h4>${marked(item.text)}</div>`;
            } else {
              formattedContent += marked(item.text);
            }
          } else if (item.type === 'image_url') {
            formattedContent += `<img src="${item.image_url.url}" alt="User Uploaded Image" class="generated-image"/>`;
          }
        });
      } else if (typeof entry.content === 'string') {
        // Handle thinking format in string content (like o1 models)
        if (entry.content.includes('# Thinking:') && entry.content.includes('# Response:')) {
          const parts = entry.content.split('---');
          if (parts.length >= 2) {
            const thinkingPart = parts[0].replace('# Thinking:', '').trim();
            const responsePart = parts[1].replace('# Response:', '').trim();
            
            formattedContent += `<div class="thinking"><h4>🤔 Thinking:</h4><pre>${thinkingPart.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>`;
            formattedContent += `<div class="response"><h4>💬 Response:</h4>${marked(responsePart)}</div>`;
          } else {
            formattedContent = marked(entry.content);
          }
        } else {
          formattedContent = marked(entry.content);
        }
      } else {
        console.error('Unexpected content type in conversationHistory:', entry.content);
        formattedContent = '<em>Unable to display content</em>';
      }
    
      htmlContent += `<div class="message ${entry.role}"><strong>${entry.role.toUpperCase()}:</strong> ${formattedContent}</div>`;
    });

    // Add summary section
    htmlContent += `
      <div class="summary">
        <h3>📊 Conversation Summary</h3>
        <p><strong>Total Tokens:</strong> ${tokens.totalTokens}</p>
        <p><strong>Total Cost:</strong> ${costService.formatCost(cost / 100)}</p>
        <p><strong>Summary:</strong> ${summary}</p>
      </div>
      
      <div class="export-info">
        Generated by GPTPortal | ${new Date().toISOString()}
      </div>
    </body>
    </html>`;

    return htmlContent;
  }

  /**
   * Export Gemini chat to HTML
   */
  async exportGeminiChatToHTML(geminiHistory, modelID, providerFactory) {
    const convertNewlinesToHtml = text => text.replace(/\n/g, '<br>');
    const messageRegex = /(System Prompt: |User Prompt: |Response: )/g;
    const messages = geminiHistory.split(messageRegex).slice(1);
    
    console.log("Gemini History: ", JSON.stringify(geminiHistory, null, 2));
    
    const chatType = 'gemini';
    const tokens = await tokenService.tokenizeHistory(geminiHistory, modelID, chatType);
    
    // Generate title and summary using Gemini
    let title, summary;
    try {
      const geminiHandler = providerFactory.isProviderAvailable('gemini') ? 
        providerFactory.getHandler('gemini') : null;
      
      if (geminiHandler) {
        const result = await titleService.nameChat(geminiHistory, tokens, geminiHandler);
        title = result.title;
        summary = result.summary;
      } else {
        title = 'Gemini Chat';
        summary = 'Gemini conversation export';
      }
    } catch (error) {
      console.error('Error generating Gemini title/summary:', error);
      title = 'Gemini Chat';
      summary = 'Gemini conversation export';
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gemini: ${title}</title>
        ${this.getExportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>🤖 Gemini: ${title}</h1>
          <div class="metadata">
            Exported on ${new Date().toLocaleString()} | 
            Model: ${modelID} | 
            Tokens: ${tokens.totalTokens} | 
            Cost: Free!
          </div>
        </div>
    `;

    // Process messages in pairs (label + content)
    for (let i = 0; i < messages.length; i += 2) {
      const label = messages[i];
      const content = messages[i + 1];
      let roleClass = '';

      if (label === 'System Prompt: ') {
        roleClass = 'system';
      } else if (label === 'User Prompt: ') {
        roleClass = 'user';
      } else if (label === 'Response: ') {
        roleClass = 'assistant';
      }

      htmlContent += `<div class="message ${roleClass}"><strong>${label.trim()}</strong> ${convertNewlinesToHtml(content.trim())}</div>`;
    }

    htmlContent += `
      <div class="summary">
        <h3>📊 Conversation Summary</h3>
        <p><strong>Total Tokens:</strong> ${tokens.totalTokens}</p>
        <p><strong>Total Cost:</strong> Free!</p>
        <p><strong>Summary:</strong> ${summary}</p>
      </div>
      
      <div class="export-info">
        Generated by GPTPortal | ${new Date().toISOString()}
      </div>
    </body>
    </html>`;
    
    return htmlContent;
  }

  /**
   * Export Assistant chat to HTML
   */
  async exportAssistantsChat(systemMessage, modelID, providerFactory) {
    // This would need to be implemented with proper assistant message fetching
    // For now, return a placeholder
    const chatType = 'assistant';
    
    // Placeholder implementation
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assistant Chat Export</title>
        ${this.getExportStyles()}
      </head>
      <body>
        <div class="header">
          <h1>🤖 Assistant Chat Export</h1>
          <div class="metadata">
            Exported on ${new Date().toLocaleString()} | 
            Model: ${modelID}
          </div>
        </div>
        
        <div class="message system">
          <strong>SYSTEM:</strong> ${marked(systemMessage || 'Assistant conversation')}
        </div>
        
        <div class="summary">
          <h3>📊 Conversation Summary</h3>
          <p><strong>Note:</strong> Assistant chat export requires full implementation</p>
        </div>
        
        <div class="export-info">
          Generated by GPTPortal | ${new Date().toISOString()}
        </div>
      </body>
      </html>`;
    
    return htmlContent;
  }

  /**
   * Generic export method that routes to appropriate exporter
   */
  async exportChat(type, data, providerFactory) {
    switch (type) {
      case 'conversation':
        return await this.exportChatToHTML(
          data.conversationHistory,
          data.claudeHistory,
          data.o1History,
          data.deepseekHistory,
          data.claudeInstructions,
          data.modelID,
          providerFactory
        );
      
      case 'gemini':
        return await this.exportGeminiChatToHTML(
          data.geminiHistory,
          data.modelID,
          providerFactory
        );
      
      case 'assistants':
        return await this.exportAssistantsChat(
          data.systemMessage,
          data.modelID,
          providerFactory
        );
      
      default:
        throw new Error(`Unknown export type: ${type}`);
    }
  }

  /**
   * Export to file
   */
  async exportToFile(type, data, providerFactory, filename = null) {
    const htmlContent = await this.exportChat(type, data, providerFactory);
    
    if (filename) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../../public/uploads', filename);
      fs.writeFileSync(filePath, htmlContent);
      return filePath;
    }
    
    return htmlContent;
  }
}

// Create singleton instance
const exportService = new ExportService();

module.exports = exportService;