// OpenRouter Provider Handler - Generic routing for 300+ models
// OpenRouter exposes an OpenAI-compatible Chat Completions endpoint, so requests
// and SSE streaming reuse the shared OpenAI parser. This is the catch-all handler
// for any provider/model id (ids contain a '/', e.g. `anthropic/claude-3.5-sonnet`);
// model ids are forwarded to the API UNCHANGED.
const axios = require('axios');
const { parseOpenAISSE } = require('./streamUtils');

class OpenRouterHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.chatCompletionsURL = `${this.baseURL}/chat/completions`;
  }

  /**
   * Build the OpenAI-compatible request body shared by streaming and
   * non-streaming paths. modelID is forwarded verbatim (slash ids allowed).
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
   * Authenticated JSON headers for OpenRouter requests.
   * Includes OpenRouter attribution headers so requests are ranked/labeled.
   */
  buildHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'GPTPortal'
    };
  }

  /**
   * Handle OpenRouter chat completion (non-streaming fallback)
   */
  async handleChatCompletion(payload) {
    const { user_input, conversationHistory } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

    const requestData = this.buildRequestData(payload);
    const headers = this.buildHeaders();

    try {
      const response = await axios.post(this.chatCompletionsURL, requestData, { headers });
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
   * Stream an OpenRouter chat completion as contract events.
   * Mirrors handleChatCompletion's history handling: pushes user_input first,
   * accumulates streamed text, then appends the assistant turn at the end.
   * reasoning_content deltas surface as {type:'thinking'} via parseOpenAISSE.
   * @param {object} payload - see PAYLOAD shape (uses conversationHistory)
   */
  async *streamCompletion(payload) {
    const { user_input, conversationHistory } = payload;

    // Mirror the non-streaming path: push user input before the request.
    conversationHistory.push(user_input);

    const requestData = {
      ...this.buildRequestData(payload),
      stream: true,
      stream_options: { include_usage: true }
    };
    const headers = this.buildHeaders();

    let text = '';
    try {
      const response = await axios.post(this.chatCompletionsURL, requestData, {
        headers,
        responseType: 'stream'
      });

      for await (const ev of parseOpenAISSE(response.data)) {
        if (ev.type === 'text') text += ev.value;
        yield ev;
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('OpenRouter Streaming Error:', message);
      yield { type: 'error', value: `OpenRouter API Error: ${message}` };
      return;
    }

    // Leave history in the same shape as a non-streamed turn.
    conversationHistory.push({ role: 'assistant', content: text });
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
