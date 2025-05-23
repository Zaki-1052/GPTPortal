// Groq Provider Handler - LLaMA models and Whisper transcription
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class GroqHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  /**
   * Handle LLaMA chat completion via Groq
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
      console.error('Groq API Error:', error.message);
      throw new Error(`Groq API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle audio transcription with Whisper via Groq
   */
  async transcribeAudio(audioFilePath, filename) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath), filename);
    formData.append('model', 'whisper-large-v3');

    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${this.apiKey}`
    };

    try {
      const response = await axios.post(`${this.baseURL}/audio/transcriptions`, formData, { headers });
      const transcription = "Voice Transcription: " + response.data.text;
      
      return {
        success: true,
        text: transcription
      };
    } catch (error) {
      console.error('Groq Whisper API Error:', error.message);
      throw new Error(`Groq Whisper API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for Groq models (OpenAI-compatible)
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
   * Handle request routing for Groq models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = GroqHandler;