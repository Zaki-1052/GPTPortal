// src/server/services/providers/customEndpointHandler.js
// Generic OpenAI-compatible handler for user-configured endpoints (Ollama,
// LM Studio, vLLM, LocalAI, remote OpenAI-compatible gateways). A SINGLE
// instance serves any number of endpoints: the model id's prefix selects which
// endpoint + upstream model to call (via endpointResolver). This is the "no new
// handler code per provider" chokepoint — adding an endpoint is pure config.
const axios = require('axios');
const { parseOpenAISSE } = require('./streamUtils');
const { resolveEndpoint } = require('./endpointResolver');

class CustomEndpointHandler {
  /**
   * @param {Array<{prefix,baseURL,apiKey,label}>} endpoints - from loadEndpointsFromEnv
   */
  constructor(endpoints = []) {
    this.endpoints = Array.isArray(endpoints) ? endpoints : [];
  }

  /**
   * Whether a model id maps to one of the configured endpoints.
   * @param {string} modelID
   * @returns {boolean}
   */
  supports(modelID) {
    return !!resolveEndpoint(modelID, this.endpoints);
  }

  /**
   * Resolve the endpoint/upstream model or throw a clear error.
   * @param {string} modelID
   * @returns {{endpoint:Object, upstreamModel:string}}
   */
  _resolve(modelID) {
    const resolved = resolveEndpoint(modelID, this.endpoints);
    if (!resolved) {
      throw new Error(`No custom endpoint configured for model '${modelID}'`);
    }
    return resolved;
  }

  /**
   * Build the shared OpenAI-compatible request body. `upstreamModel` is the id
   * with the routing prefix stripped (what the endpoint actually knows).
   */
  buildRequestData(payload, upstreamModel) {
    const { conversationHistory, temperature, tokens } = payload;
    return {
      model: upstreamModel,
      messages: conversationHistory,
      temperature,
      max_tokens: tokens
    };
  }

  /**
   * Auth + content headers. Local servers often need no key, so Authorization
   * is only sent when one is configured.
   */
  buildHeaders(endpoint) {
    const headers = { 'Content-Type': 'application/json' };
    if (endpoint.apiKey) {
      headers['Authorization'] = `Bearer ${endpoint.apiKey}`;
    }
    return headers;
  }

  /**
   * Non-streaming chat completion (also the streaming fallback path).
   */
  async handleChatCompletion(payload) {
    const { modelID, user_input, conversationHistory } = payload;
    const { endpoint, upstreamModel } = this._resolve(modelID);

    conversationHistory.push(user_input);

    try {
      const response = await axios.post(
        `${endpoint.baseURL}/chat/completions`,
        this.buildRequestData(payload, upstreamModel),
        { headers: this.buildHeaders(endpoint) }
      );
      const messageContent = response.data.choices[0].message.content;
      conversationHistory.push({ role: 'assistant', content: messageContent });

      return {
        success: true,
        content: messageContent,
        usage: response.data.usage
      };
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error(`Custom endpoint (${endpoint.label}) Error:`, message);
      throw new Error(`Custom endpoint (${endpoint.label}) Error: ${message}`);
    }
  }

  /**
   * Stream a chat completion as contract events, mirroring handleChatCompletion's
   * history handling (push user_input first, accumulate text, append assistant
   * turn at the end). reasoning_content deltas surface as {type:'thinking'}.
   */
  async *streamCompletion(payload) {
    const { modelID, user_input, conversationHistory } = payload;
    const { endpoint, upstreamModel } = this._resolve(modelID);

    conversationHistory.push(user_input);

    const requestData = {
      ...this.buildRequestData(payload, upstreamModel),
      stream: true,
      stream_options: { include_usage: true }
    };

    let text = '';
    try {
      const response = await axios.post(
        `${endpoint.baseURL}/chat/completions`,
        requestData,
        { headers: this.buildHeaders(endpoint), responseType: 'stream' }
      );

      for await (const ev of parseOpenAISSE(response.data)) {
        if (ev.type === 'text') text += ev.value;
        yield ev;
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error(`Custom endpoint (${endpoint.label}) Streaming Error:`, message);
      yield { type: 'error', value: `Custom endpoint (${endpoint.label}) Error: ${message}` };
      return;
    }

    conversationHistory.push({ role: 'assistant', content: text });
  }

  /**
   * Format user input (OpenAI-compatible message object).
   */
  formatUserInput(userMessage, fileContents = null, fileId = null) {
    let user_input = {
      role: 'user',
      content: userMessage || ''
    };
    if (fileContents && fileId) {
      user_input.content += '\n' + fileId + '\n' + fileContents;
    }
    return user_input;
  }

  /**
   * Handle request routing.
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = CustomEndpointHandler;
