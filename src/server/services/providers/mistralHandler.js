// Mistral Provider Handler - Mistral and Codestral models
const axios = require('axios');

class MistralHandler {
  constructor(apiKey, codestralApiKey = null) {
    this.apiKey = apiKey;
    this.codestralApiKey = codestralApiKey;
    this.baseURL = 'https://api.mistral.ai/v1';
    this.codestralURL = 'https://codestral.mistral.ai/v1';
  }

  /**
   * Handle Mistral chat completion
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory, temperature, tokens } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

    // Determine API endpoint and key
    const isCodestral = modelID === 'codestral-latest';
    const apiUrl = isCodestral ? this.codestralURL : this.baseURL;
    const apiKey = isCodestral ? (this.codestralApiKey || this.apiKey) : this.apiKey;

    const requestData = {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${apiUrl}/chat/completions`, requestData, { headers });
      const messageContent = response.data.choices[0].message.content;
      
      // Add assistant response to history
      conversationHistory.push({ role: "assistant", content: messageContent });
      
      return {
        success: true,
        content: messageContent,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Mistral API Error:', error.message);
      throw new Error(`Mistral API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for Mistral models (OpenAI-compatible)
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
   * Handle request routing for Mistral models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = MistralHandler;