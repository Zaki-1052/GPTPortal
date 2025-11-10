// Claude Provider Handler - Anthropic Claude models with thinking support and web search
// 
// Web Search Feature:
// - Enabled by default for supported models: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3.7 Sonnet, Claude 4 models
// - Allows Claude to search the web for up-to-date information
// - Automatically cites sources in responses
// - Pricing: $10 per 1,000 searches + standard token costs
//
// Note: Web search is enabled by default. To disable, uncomment the conditional check in handleChatCompletion
// and pass webSearchConfig: false in your payload.
//
// Future configuration options (currently commented out):
// {
//   webSearchConfig: {
//     maxUses: 5,
//     allowedDomains: ['docs.example.com', 'api.example.com'],
//     blockedDomains: ['untrusted.com'],
//     userLocation: {
//       type: 'approximate',
//       city: 'San Francisco',
//       region: 'California',
//       country: 'US'
//     }
//   }
// }
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
   * Handle Claude chat completion with thinking support, optional prompt caching, and web search
   * @param {Object} payload - The request payload
   * @param {Object} payload.user_input - The user's input message
   * @param {string} payload.modelID - The Claude model ID to use
   * @param {string} payload.systemMessage - The system message/instructions
   * @param {Array} payload.claudeHistory - The conversation history
   * @param {number} payload.temperature - The temperature for response generation
   * @param {number} payload.tokens - The maximum tokens for the response
   * @param {string} [payload.cachePreference] - Optional prompt caching preference
   * @param {Object} [payload.webSearchConfig] - Optional web search configuration (web search is enabled by default)
   * // Note: To disable web search, uncomment the conditional in the method and pass webSearchConfig: false
   * // @param {number} [payload.webSearchConfig.maxUses=5] - Maximum number of web searches (default: 5)
   * // @param {string[]} [payload.webSearchConfig.allowedDomains] - List of allowed domains for search
   * // @param {string[]} [payload.webSearchConfig.blockedDomains] - List of blocked domains for search
   * // @param {Object} [payload.webSearchConfig.userLocation] - User location for localized results
   * // @param {string} [payload.webSearchConfig.userLocation.type] - Location type (e.g., "approximate")
   * // @param {string} [payload.webSearchConfig.userLocation.city] - City name
   * // @param {string} [payload.webSearchConfig.userLocation.region] - Region/state name
   * // @param {string} [payload.webSearchConfig.userLocation.country] - Country code (e.g., "US")
   * @returns {Promise<Object>} Response object with success status, content, and usage info
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, systemMessage, claudeHistory, temperature, tokens, cachePreference, webSearchConfig } = payload;
    
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
    
    console.log('=== About to push user_input to Claude history ===');
    console.log('user_input:', JSON.stringify(user_input, null, 2));
    console.log('user_input.content length:', user_input.content?.length);
    console.log('user_input.content has image:', user_input.content?.some(item => item.type === 'image'));
    console.log('================================================');
    
    finalClaudeHistory.push(user_input);

    // Check if this is a Claude 4 model with thinking support
    const isThinkingModel = modelID === 'claude-3-7-sonnet-latest' || 
                           modelID === 'claude-opus-4-20250514' || 
                           modelID === 'claude-sonnet-4-20250514';

    // Check if web search is supported for this model
    const supportsWebSearch = [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-latest',
      'claude-3-5-haiku-20241022'
    ].includes(modelID);

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

    // Add web search tool by default for supported models
    // Uncomment the condition below to make web search optional
    // if (webSearchConfig && supportsWebSearch) {
    if (supportsWebSearch) {
      const webSearchTool = {
        type: "web_search_20250305",
        name: "web_search"
      };

      // Add optional parameters if provided
      // if (webSearchConfig.maxUses !== undefined) {
      //   webSearchTool.max_uses = webSearchConfig.maxUses;
      // }
      // if (webSearchConfig.allowedDomains && Array.isArray(webSearchConfig.allowedDomains)) {
      //   webSearchTool.allowed_domains = webSearchConfig.allowedDomains;
      // }
      // if (webSearchConfig.blockedDomains && Array.isArray(webSearchConfig.blockedDomains)) {
      //   webSearchTool.blocked_domains = webSearchConfig.blockedDomains;
      // }
      // if (webSearchConfig.userLocation) {
      //   webSearchTool.user_location = webSearchConfig.userLocation;
      // }

      // Add tools array to request data
      requestData.tools = [webSearchTool];
      
      console.log(`🔍 Web search enabled by default for ${modelID}`);
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
        let textContent = messageContent;
        if (Array.isArray(messageContent)) {
          if (messageContent.length > 0 && messageContent[0]?.text) {
            textContent = messageContent[0].text;
          } else {
            textContent = JSON.stringify(messageContent);
          }
        }

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
    console.log('=== ClaudeHandler.formatUserInput Debug ===');
    console.log('userMessage:', userMessage ? userMessage.substring(0, 100) + '...' : 'N/A');
    console.log('fileContents exists:', !!fileContents);
    console.log('fileId:', fileId);
    console.log('imageName:', imageName);
    console.log('base64Image exists:', !!base64Image);
    console.log('base64Image length:', base64Image ? base64Image.length : 0);
    console.log('base64Image starts with:', base64Image ? base64Image.substring(0, 50) : 'N/A');
    console.log('uploadedFiles:', uploadedFiles);
    console.log('==========================================');
    
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
      console.log('=== Processing base64Image in ClaudeHandler ===');
      const parts = base64Image.split(';base64,');
      if (parts.length !== 2) {
        console.error('Invalid base64 image format. Expected "data:type;base64,data"');
        throw new Error('Invalid base64 image format');
      }

      const [mediaPart, base64Data] = parts;
      const mediaTypeParts = mediaPart.split(':');
      if (mediaTypeParts.length < 2) {
        console.error('Invalid media type format in base64 image');
        throw new Error('Invalid media type format');
      }

      const mediaType = mediaTypeParts[1];
      console.log('mediaType:', mediaType);
      console.log('base64Data length:', base64Data ? base64Data.length : 0);

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
      console.log('Image added to user_input.content');
    }

    console.log('=== Final user_input structure ===');
    console.log('user_input.content length:', user_input.content.length);
    console.log('user_input.content types:', user_input.content.map(item => item.type));
    console.log('================================');

    return user_input;
  }

  /**
   * Parse Claude instructions into sections for system message
   */
  parseInstructionsIntoSections(instructionsText) {
    if (!instructionsText || typeof instructionsText !== 'string') {
      throw new Error('Invalid instructions text: must be a non-empty string');
    }

    // Find the major section boundaries
    const roleAssignmentEndTag = '</role_assignment>';
    const roleAssignmentEndIdx = instructionsText.indexOf(roleAssignmentEndTag);
    if (roleAssignmentEndIdx === -1) {
      throw new Error('Missing </role_assignment> tag in instructions');
    }
    const roleAssignmentEnd = roleAssignmentEndIdx + roleAssignmentEndTag.length;

    const claudeInfoStart = instructionsText.indexOf('<claude_info>');
    if (claudeInfoStart === -1) {
      throw new Error('Missing <claude_info> tag in instructions');
    }

    const claudeInfoEndTag = '</claude_info>';
    const claudeInfoEndIdx = instructionsText.indexOf(claudeInfoEndTag);
    if (claudeInfoEndIdx === -1) {
      throw new Error('Missing </claude_info> tag in instructions');
    }
    const claudeInfoEnd = claudeInfoEndIdx + claudeInfoEndTag.length;

    const taskInstructionsStart = instructionsText.indexOf('<task_instructions>');
    if (taskInstructionsStart === -1) {
      throw new Error('Missing <task_instructions> tag in instructions');
    }

    const methodsEndTag = '</methods>';
    const methodsEndIdx = instructionsText.indexOf(methodsEndTag);
    if (methodsEndIdx === -1) {
      throw new Error('Missing </methods> tag in instructions');
    }
    const methodsEnd = methodsEndIdx + methodsEndTag.length;

    const finalStart = instructionsText.indexOf('<final>');
    if (finalStart === -1) {
      throw new Error('Missing <final> tag in instructions');
    }

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