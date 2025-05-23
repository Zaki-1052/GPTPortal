// DeepSeek Provider Handler - DeepSeek reasoning and chat models
const axios = require('axios');

class DeepSeekHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.deepseek.com/v1';
  }

  /**
   * Handle DeepSeek chat completion with reasoning support
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory, deepseekHistory, temperature, tokens } = payload;

    // Add user input to both histories
    conversationHistory.push(user_input);
    deepseekHistory.push(user_input);

    const requestData = {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, { headers });
      
      // Handle reasoning content for DeepSeek-R1
      let messageContent;
      if (modelID === 'deepseek-reasoner') {
        const reasoningContent = response.data.choices[0].message.reasoning_content || '';
        const textContent = response.data.choices[0].message.content || '';
        
        // Format with thinking and response sections
        messageContent = `# Thinking:\n${reasoningContent}\n\n\n---\n# Response:\n${textContent}`;
        
        // Add to histories
        conversationHistory.push({ role: "assistant", content: textContent });
        deepseekHistory.push({ role: "assistant", content: messageContent });
        
        return {
          success: true,
          content: messageContent,
          thinking: reasoningContent,
          response: textContent,
          usage: response.data.usage
        };
      } else {
        // Standard DeepSeek response
        messageContent = response.data.choices[0].message.content;
        
        conversationHistory.push({ role: "assistant", content: messageContent });
        deepseekHistory.push({ role: "assistant", content: messageContent });
        
        return {
          success: true,
          content: messageContent,
          usage: response.data.usage
        };
      }
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      throw new Error(`DeepSeek API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for DeepSeek models (OpenAI-compatible)
   */
  formatUserInput(userMessage, fileContents = null, fileId = null) {
    let user_input = {
      role: "user",
      content: userMessage || ''
    };

    // Add file contents for text-based models
    if (fileContents && fileId) {
      user_input.content += "\n" + fileId + "\n" + fileContents;
    }

    return user_input;
  }

  /**
   * Handle request routing for DeepSeek models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = DeepSeekHandler;