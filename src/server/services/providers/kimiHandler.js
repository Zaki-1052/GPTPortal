// src/server/services/providers/kimiHandler.js
// Kimi Provider Handler - Moonshot AI Kimi K2 models (OpenAI-compatible /chat/completions)
const axios = require('axios');
const { parseOpenAISSE } = require('./streamUtils');

class KimiHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.moonshot.ai/v1';
  }

  /**
   * Build request headers for the Moonshot API.
   */
  buildHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Build the OpenAI-compatible request body. Kimi is a simple passthrough:
   * modelID (e.g. kimi-k2.6, kimi-k2.7-code, kimi-k2.5) is forwarded as-is.
   * Callers must push user_input onto conversationHistory before calling this.
   */
  buildRequestData(payload) {
    const { modelID, conversationHistory, temperature, tokens } = payload;
    return {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };
  }

  /**
   * Handle Kimi chat completion (non-streaming)
   */
  async handleChatCompletion(payload) {
    const { user_input, conversationHistory } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

    const requestData = this.buildRequestData(payload);

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestData,
        { headers: this.buildHeaders() }
      );
      const messageContent = response.data.choices[0].message.content;

      // Add assistant response to history
      conversationHistory.push({ role: "assistant", content: messageContent });

      return {
        success: true,
        content: messageContent,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Kimi API Error:', error.message);
      throw new Error(`Kimi API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Stream a Kimi chat completion. Mirrors handleChatCompletion's history
   * handling: pushes user_input first, accumulates streamed text, and appends
   * the assistant turn to conversationHistory at the end. Yields streaming
   * contract events ({type:'thinking'|'text'|'error'|'usage'}).
   */
  async *streamCompletion(payload) {
    const { user_input, conversationHistory } = payload;

    // Add user input to conversation history (mirror non-streaming path)
    conversationHistory.push(user_input);

    const requestData = {
      ...this.buildRequestData(payload),
      stream: true,
      stream_options: { include_usage: true }
    };

    let text = '';
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestData,
        { headers: this.buildHeaders(), responseType: 'stream' }
      );

      for await (const ev of parseOpenAISSE(response.data)) {
        if (ev.type === 'text') text += ev.value;
        yield ev;
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('Kimi Streaming Error:', message);
      yield { type: 'error', value: `Kimi API Error: ${message}` };
      return;
    }

    // Append the assembled assistant message so history matches a non-streamed turn
    conversationHistory.push({ role: "assistant", content: text });
  }

  /**
   * Format user input for Kimi models (OpenAI-compatible)
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
   * Handle request routing for Kimi models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = KimiHandler;
