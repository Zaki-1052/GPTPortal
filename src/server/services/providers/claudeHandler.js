// Claude Provider Handler - Anthropic Claude models with thinking support
const axios = require('axios');

class ClaudeHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.promptCacheService = null; // Will be injected by ProviderFactory
  }

  /**
   * Set the prompt cache service (dependency injection)
   */
  setPromptCacheService(promptCacheService) {
    this.promptCacheService = promptCacheService;
  }

  /**
   * Handle Claude chat completion with thinking support and optional prompt caching
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, systemMessage, claudeHistory, temperature, tokens, cachePreference } = payload;
    
    // Apply prompt caching if available and enabled
    let finalPayload = payload;
    let cacheStrategy = null;
    if (this.promptCacheService) {
      try {
        cacheStrategy = await this.promptCacheService.analyzeCacheStrategy(payload, { cachePreference });
        if (cacheStrategy.shouldCache) {
          finalPayload = await this.promptCacheService.applyCacheControls(payload, cacheStrategy);
          console.log(`🔄 Applied ${cacheStrategy.type} caching strategy to ${modelID}`);
        }
      } catch (error) {
        console.warn('Failed to apply prompt caching, proceeding without cache:', error.message);
        // Continue with original payload on caching error (graceful degradation)
      }
    }

    // Add user input to Claude history
    const { systemMessage: finalSystemMessage, claudeHistory: finalClaudeHistory } = finalPayload;
    finalClaudeHistory.push(user_input);

    // Check if this is a Claude 4 model with thinking support
    const isThinkingModel = modelID === 'claude-3-7-sonnet-latest' || 
                           modelID === 'claude-opus-4-20250514' || 
                           modelID === 'claude-sonnet-4-20250514';

    let requestData;
    if (isThinkingModel) {
      const budget = tokens - 100;
      requestData = {
        model: modelID,
        max_tokens: tokens,
        thinking: {
          type: "enabled",
          budget_tokens: budget
        },
        temperature: temperature,
        system: finalSystemMessage,
        messages: finalClaudeHistory,
      };
    } else {
      requestData = {
        model: modelID,
        max_tokens: tokens,
        temperature: temperature,
        system: finalSystemMessage,
        messages: finalClaudeHistory,
      };
    }

    const headers = {
      'x-api-key': this.apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01'
    };

    // Add beta header for thinking models
    if (isThinkingModel) {
      headers['anthropic-beta'] = 'output-128k-2025-02-19';
    }

    try {
      const response = await axios.post(`${this.baseURL}/messages`, requestData, { headers });
      let messageContent = response.data.content;
      
      // Track cache performance if caching was attempted
      if (this.promptCacheService && cacheStrategy?.shouldCache && response.data.usage) {
        this.promptCacheService.trackCachePerformance(modelID, response.data.usage, true);
      }
      
      // Process thinking models response
      if (isThinkingModel && Array.isArray(messageContent)) {
        let thinkingContent = '';
        let textContent = '';

        messageContent.forEach((item) => {
          if (item.type === 'thinking') {
            thinkingContent += item.thinking + '\n';
          } else if (item.type === 'text') {
            textContent += item.text + '\n';
          }
        });

        const formattedContent = `# Thinking:\n${thinkingContent}\n---\n# Response:\n${textContent}`;
        
        // Add to history with original format for API consistency
        finalClaudeHistory.push({ role: "assistant", content: response.data.content });
        
        return {
          success: true,
          content: formattedContent,
          thinking: thinkingContent,
          response: textContent,
          usage: response.data.usage
        };
      } else {
        // Standard Claude response
        const textContent = Array.isArray(messageContent) ? messageContent[0].text : messageContent;
        
        finalClaudeHistory.push({ role: "assistant", content: response.data.content });
        
        return {
          success: true,
          content: textContent,
          usage: response.data.usage
        };
      }
    } catch (error) {
      console.error('Claude API Error:', error.message);
      throw new Error(`Claude API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for Claude models with XML structure
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null, uploadedFiles = null) {
    const user_input = {
      role: "user",
      content: []
    };

    // Add text content with XML tags
    if (userMessage) {
      user_input.content.push({ type: "text", text: "<user_message>" });
      user_input.content.push({ type: "text", text: userMessage });
      user_input.content.push({ type: "text", text: "</user_message>" });
    }

    // Handle single file (backward compatibility)
    if (fileContents && fileId) {
      if (fileId.endsWith('.pdf')) {
        // PDF format for Claude
        user_input.content.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: fileContents
          }
        });
      } else {
        // Text file with XML tags
        user_input.content.push({ type: "text", text: "<file_name>" });
        user_input.content.push({ type: "text", text: fileId });
        user_input.content.push({ type: "text", text: "</file_name>" });
        user_input.content.push({ type: "text", text: "<file_contents>" });
        user_input.content.push({ type: "text", text: fileContents });
        user_input.content.push({ type: "text", text: "</file_contents>" });
      }
    }

    // Handle multiple uploaded files
    if (uploadedFiles && Array.isArray(uploadedFiles)) {
      for (const file of uploadedFiles) {
        if (file.type === 'pdf') {
          user_input.content.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: file.contents
            }
          });
        } else {
          user_input.content.push({ type: "text", text: "<file_name>" });
          user_input.content.push({ type: "text", text: file.file_id });
          user_input.content.push({ type: "text", text: "</file_name>" });
          user_input.content.push({ type: "text", text: "<file_contents>" });
          user_input.content.push({ type: "text", text: file.contents });
          user_input.content.push({ type: "text", text: "</file_contents>" });
        }
      }
    }

    // Add image with XML structure
    if (base64Image) {
      const [mediaPart, base64Data] = base64Image.split(';base64,');
      const mediaType = mediaPart.split(':')[1];
      
      user_input.content.push({ type: "text", text: "<image_name>" });
      user_input.content.push({ type: "text", text: imageName || "uploaded_image" });
      user_input.content.push({ type: "text", text: "</image_name>" });
      user_input.content.push({ type: "text", text: "<image_content>" });
      user_input.content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64Data
        }
      });
      user_input.content.push({ type: "text", text: "</image_content>" });
    }

    return user_input;
  }

  /**
   * Parse Claude instructions into sections for system message
   */
  parseInstructionsIntoSections(instructionsText) {
    // Find the major section boundaries
    const roleAssignmentEnd = instructionsText.indexOf('</role_assignment>') + '</role_assignment>'.length;
    const claudeInfoStart = instructionsText.indexOf('<claude_info>');
    const claudeInfoEnd = instructionsText.indexOf('</claude_info>') + '</claude_info>'.length;
    const taskInstructionsStart = instructionsText.indexOf('<task_instructions>');
    const methodsEnd = instructionsText.indexOf('</methods>') + '</methods>'.length;
    const finalStart = instructionsText.indexOf('<final>');
    
    // Create the four main sections
    const sections = [
      {
        content: instructionsText.substring(0, roleAssignmentEnd)
      },
      {
        content: instructionsText.substring(claudeInfoStart, claudeInfoEnd)
      },
      {
        content: instructionsText.substring(taskInstructionsStart, methodsEnd)
      },
      {
        content: instructionsText.substring(finalStart)
      }
    ];

    return sections;
  }

  /**
   * Format sections into system message with caching
   */
  formatSectionsIntoSystemMessage(sections) {
    return sections.map(section => ({
      type: "text",
      text: section.content,
      cache_control: { type: "ephemeral" }
    }));
  }

  /**
   * Handle request routing for Claude models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = ClaudeHandler;