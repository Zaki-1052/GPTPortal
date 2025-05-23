// OpenRouter Provider Handler - Generic routing for 300+ models
const axios = require('axios');

class OpenRouterHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://openrouter.ai/api/v1';
  }

  /**
   * Handle OpenRouter chat completion
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory, temperature, tokens } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

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
      const messageContent = response.data.choices[0].message.content;
      
      // Add assistant response to history
      conversationHistory.push({ role: "assistant", content: messageContent });
      
      return {
        success: true,
        content: messageContent,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error.message);
      throw new Error(`OpenRouter API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for OpenRouter models (OpenAI-compatible)
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
   * Handle request routing for OpenRouter models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = OpenRouterHandler;