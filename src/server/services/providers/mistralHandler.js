// src/server/services/providers/mistralHandler.js
// Mistral Provider Handler - OpenAI-compatible chat completions for Mistral and Codestral models.
const axios = require('axios');
const { parseOpenAISSE } = require('./streamUtils');

class MistralHandler {
  constructor(apiKey, codestralApiKey = null) {
    this.apiKey = apiKey;
    this.codestralApiKey = codestralApiKey;
    this.baseURL = 'https://api.mistral.ai/v1';
    this.codestralURL = 'https://codestral.mistral.ai/v1';
  }

  /**
   * Resolve the API endpoint and key for a given model id.
   * codestral-latest uses the dedicated Codestral endpoint; every other id
   * (mistral-large/medium/small-latest, magistral-medium-latest, devstral-2, ...)
   * routes to the standard Mistral API. No id whitelist is applied so newer
   * models are supported without code changes.
   * @param {string} modelID
   * @returns {{ apiUrl: string, apiKey: string }}
   */
  resolveEndpoint(modelID) {
    const isCodestral = modelID === 'codestral-latest';
    return {
      apiUrl: isCodestral ? this.codestralURL : this.baseURL,
      apiKey: isCodestral ? (this.codestralApiKey || this.apiKey) : this.apiKey
    };
  }

  /**
   * Build the OpenAI-compatible request body shared by streaming and
   * non-streaming paths.
   * @param {object} payload
   * @returns {object} request data for POST /chat/completions
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
   * Build authorization headers for a resolved API key.
   * @param {string} apiKey
   * @returns {object}
   */
  buildHeaders(apiKey) {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Handle Mistral chat completion (non-streaming fallback path).
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

    const { apiUrl, apiKey } = this.resolveEndpoint(modelID);
    const requestData = this.buildRequestData(payload);
    const headers = this.buildHeaders(apiKey);

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
   * Stream a Mistral chat completion as contract events.
   * Mirrors handleChatCompletion's history handling: pushes user_input onto
   * conversationHistory first, accumulates streamed text, and appends the
   * assistant message at the end.
   * @param {object} payload
   * @yields {{type: string, value?: string, usage?: object}}
   */
  async *streamCompletion(payload) {
    const { user_input, modelID, conversationHistory } = payload;

    // Mirror non-streaming history handling: user input pushed at the start.
    conversationHistory.push(user_input);

    const { apiUrl, apiKey } = this.resolveEndpoint(modelID);
    const requestData = {
      ...this.buildRequestData(payload),
      stream: true,
      stream_options: { include_usage: true }
    };
    const headers = this.buildHeaders(apiKey);

    let text = '';
    try {
      const response = await axios.post(`${apiUrl}/chat/completions`, requestData, {
        headers,
        responseType: 'stream'
      });

      for await (const ev of parseOpenAISSE(response.data)) {
        if (ev.type === 'text') text += ev.value;
        yield ev;
      }
    } catch (error) {
      console.error('Mistral API Streaming Error:', error.message);
      yield { type: 'error', value: `Mistral API Error: ${error.response?.data?.error?.message || error.message}` };
      return;
    }

    // Append the assembled assistant message so history matches the non-streamed turn.
    conversationHistory.push({ role: "assistant", content: text });
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
