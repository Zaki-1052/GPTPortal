// src/server/services/providers/openai/utils/formatters.js
// Input/output formatting utilities for OpenAI models

/**
 * Format user input for OpenAI models
 */
function formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
  const user_input = {
    role: "user",
    content: []
  };

  // Add text content
  if (userMessage) {
    user_input.content.push({ type: "text", text: userMessage });
  }

  // Add file contents
  if (fileContents && fileId) {
    user_input.content.push({ type: "text", text: fileId });
    user_input.content.push({ type: "text", text: fileContents });
  }

  // Add image
  if (base64Image) {
    if (imageName) {
      user_input.content.push({ type: "text", text: imageName });
    }
    user_input.content.push({ type: "image_url", image_url: { url: base64Image } });
  }

  return user_input;
}

/**
 * Transform content types for Responses API
 */
function transformContentForResponses(content) {
  if (!Array.isArray(content)) {
    return content;
  }

  return content.map(item => {
    if (item.type === 'text') {
      return { type: 'input_text', text: item.text };
    } else if (item.type === 'image_url') {
      return { type: 'input_image', image_url: item.image_url };
    }
    return item;
  });
}

/**
 * Format user input for Responses API
 */
function formatUserInputForResponses(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
  const user_input = formatUserInput(userMessage, fileContents, fileId, imageName, base64Image);
  
  return {
    role: user_input.role,
    content: transformContentForResponses(user_input.content)
  };
}

/**
 * Format web search options for Chat Completions API
 */
function formatWebSearchOptions(options = {}) {
  const webSearchOptions = {};

  // User location
  if (options.userLocation) {
    webSearchOptions.user_location = {
      type: "approximate",
      approximate: {
        country: options.userLocation.country,
        city: options.userLocation.city,
        region: options.userLocation.region
      }
    };

    if (options.userLocation.timezone) {
      webSearchOptions.user_location.approximate.timezone = options.userLocation.timezone;
    }
  }

  // Search context size
  if (options.searchContextSize) {
    webSearchOptions.search_context_size = options.searchContextSize;
  }

  return webSearchOptions;
}

/**
 * Format web search tool for Responses API
 */
function formatWebSearchTool(options = {}) {
  const tool = {
    type: "web_search_preview",
    name: "web_search"
  };

  // Add optional parameters
  if (options.maxUses !== undefined) {
    tool.max_uses = options.maxUses;
  }

  if (options.allowedDomains && Array.isArray(options.allowedDomains)) {
    tool.allowed_domains = options.allowedDomains;
  }

  if (options.blockedDomains && Array.isArray(options.blockedDomains)) {
    tool.blocked_domains = options.blockedDomains;
  }

  if (options.userLocation) {
    tool.user_location = {
      type: "approximate",
      ...options.userLocation
    };
  }

  return tool;
}

/**
 * Format Code Interpreter tool for Responses API
 */
function formatCodeInterpreterTool(options = {}) {
  const tool = {
    type: "code_interpreter"
  };

  // Handle container configuration
  if (options.containerId) {
    // Use explicit container ID
    tool.container = options.containerId;
  } else if (options.container && typeof options.container === 'object') {
    // Use provided container object
    tool.container = options.container;
  } else {
    // Default to auto mode for simplicity
    tool.container = { type: "auto" };
  }

  // Add files to container if specified
  if (options.files && Array.isArray(options.files)) {
    if (tool.container.type === "auto") {
      tool.container.files = options.files;
    }
  }

  return tool;
}

/**
 * Extract reasoning and response content from Responses API output
 */
function extractResponseContent(outputArray) {
  let reasoningContent = '';
  let assistantContent = '';
  
  outputArray.forEach(item => {
    if (item.type === 'reasoning' && item.summary) {
      if (Array.isArray(item.summary)) {
        item.summary.forEach(summaryItem => {
          if (typeof summaryItem === 'object' && summaryItem.text) {
            reasoningContent += summaryItem.text + '\n\n';
          } else if (typeof summaryItem === 'string') {
            reasoningContent += summaryItem + '\n\n';
          }
        });
      } else if (typeof item.summary === 'object') {
        if (item.summary.text) {
          reasoningContent += item.summary.text;
        } else {
          reasoningContent += JSON.stringify(item.summary);
        }
      } else {
        reasoningContent += item.summary;
      }
    }
    
    if (item.type === 'message' && item.role === 'assistant') {
      if (typeof item.content === 'object') {
        if (Array.isArray(item.content)) {
          item.content.forEach(contentItem => {
            if (typeof contentItem === 'object' && contentItem.text) {
              assistantContent += contentItem.text;
            } else if (typeof contentItem === 'string') {
              assistantContent += contentItem;
            }
          });
        } else if (item.content.text) {
          assistantContent += item.content.text;
        } else {
          assistantContent += JSON.stringify(item.content);
        }
      } else {
        assistantContent += item.content;
      }
    }
  });

  return {
    reasoning: reasoningContent.trim(),
    response: assistantContent.trim()
  };
}

/**
 * Format reasoning response with thinking section
 */
function formatReasoningResponse(reasoningContent, assistantContent) {
  if (reasoningContent) {
    return `# Thinking:\n${reasoningContent}\n\n---\n# Response:\n${assistantContent}`;
  }
  return assistantContent;
}

/**
 * Process URL citations from Chat Completions response
 */
function processCitations(response) {
  const content = response.choices[0].message.content;
  const annotations = response.choices[0].message.annotations || [];
  
  const citations = annotations
    .filter(annotation => annotation.type === 'url_citation')
    .map(annotation => ({
      url: annotation.url_citation.url,
      title: annotation.url_citation.title,
      startIndex: annotation.url_citation.start_index,
      endIndex: annotation.url_citation.end_index
    }));

  return {
    content,
    citations
  };
}

/**
 * Generate intelligent transcription prompt based on context
 */
function generateTranscriptionPrompt(filename) {
  const context = [];
  
  // Add context based on filename or common patterns
  if (filename && filename.toLowerCase().includes('meeting')) {
    context.push('This is a meeting recording with multiple speakers.');
  } else if (filename && filename.toLowerCase().includes('call')) {
    context.push('This is a phone call recording.');
  } else if (filename && filename.toLowerCase().includes('interview')) {
    context.push('This is an interview recording.');
  } else {
    context.push('This is a voice recording that may contain technical terms, proper nouns, or specific terminology.');
  }
  
  context.push('Please transcribe accurately, maintaining proper punctuation and capitalization.');
  context.push('Include filler words like "um", "uh", "like" if they are present.');
  
  return context.join(' ');
}

/**
 * Generate intelligent TTS instructions based on text content
 */
function generateTTSInstructions(text) {
  const instructions = [];
  
  // Analyze text content for appropriate instructions
  if (text.includes('!') || text.includes('?') || text.toUpperCase() === text) {
    instructions.push('Speak with energy and emotion appropriate to the content.');
  } else if (text.includes('...') || text.includes(' - ')) {
    instructions.push('Use thoughtful pauses and contemplative tone.');
  } else if (text.length > 200) {
    instructions.push('Maintain a clear, engaging narration style suitable for longer content.');
  } else {
    instructions.push('Speak in a natural, conversational tone.');
  }
  
  // Add context-specific instructions
  if (text.toLowerCase().includes('error') || text.toLowerCase().includes('warning')) {
    instructions.push('Use a concerned but helpful tone.');
  } else if (text.toLowerCase().includes('success') || text.toLowerCase().includes('complete')) {
    instructions.push('Use a positive, accomplished tone.');
  } else if (text.toLowerCase().includes('question') || text.includes('?')) {
    instructions.push('Use an inquisitive, engaging tone.');
  }
  
  return instructions.join(' ');
}

module.exports = {
  formatUserInput,
  formatUserInputForResponses,
  transformContentForResponses,
  formatWebSearchOptions,
  formatWebSearchTool,
  formatCodeInterpreterTool,
  extractResponseContent,
  formatReasoningResponse,
  processCitations,
  generateTranscriptionPrompt,
  generateTTSInstructions
};