// src/server/services/providers/deepseekHandler.js
// DeepSeek Provider Handler - OpenAI-compatible chat completions with hybrid
// thinking (reasoning_content) support and SSE streaming.
const axios = require('axios');
const { parseOpenAISSE } = require('./streamUtils');

class DeepSeekHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // All DeepSeek ids (deepseek-v4-flash, deepseek-v4-pro, legacy chat/reasoner)
    // route to the OpenAI-compatible endpoint on api.deepseek.com.
    this.baseURL = 'https://api.deepseek.com/v1';
  }

  /**
   * Build the Authorization/content headers shared by every request.
   */
  buildHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Build the base (non-streaming) request body from the payload. `messages`
   * references conversationHistory by reference, so it must already contain the
   * pushed user_input before the request is sent.
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
   * Format the combined thinking + answer content stored on deepseekHistory when
   * a model emits reasoning_content, keeping streamed and non-streamed turns
   * identically shaped.
   */
  formatReasoningContent(reasoningContent, textContent) {
    return `# Thinking:\n${reasoningContent}\n\n\n---\n# Response:\n${textContent}`;
  }

  /**
   * Handle DeepSeek chat completion. Any DeepSeek id may surface
   * reasoning_content (hybrid thinking), so detection is content-driven rather
   * than keyed on a specific model id.
   */
  async handleChatCompletion(payload) {
    const { user_input, conversationHistory, deepseekHistory } = payload;

    // Add user input to both histories (conversationHistory drives the request).
    conversationHistory.push(user_input);
    deepseekHistory.push(user_input);

    const requestData = this.buildRequestData(payload);
    const headers = this.buildHeaders();

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, { headers });

      const message = response.data.choices[0].message;
      const textContent = message.content || '';
      const reasoningContent = message.reasoning_content || '';

      if (reasoningContent) {
        const messageContent = this.formatReasoningContent(reasoningContent, textContent);

        conversationHistory.push({ role: "assistant", content: textContent });
        deepseekHistory.push({ role: "assistant", content: messageContent });

        return {
          success: true,
          content: messageContent,
          thinking: reasoningContent,
          response: textContent,
          usage: response.data.usage
        };
      }

      // Standard (non-thinking) DeepSeek response.
      conversationHistory.push({ role: "assistant", content: textContent });
      deepseekHistory.push({ role: "assistant", content: textContent });

      return {
        success: true,
        content: textContent,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('DeepSeek API Error:', error.message);
      throw new Error(`DeepSeek API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Stream a DeepSeek chat completion as contract events. Mirrors
   * handleChatCompletion's history handling: user_input is pushed up front and
   * the assembled assistant turn is appended once the stream completes.
   * @param {object} payload
   * @yields {{type:'thinking'|'text'|'error'|'usage', value?:string, usage?:object}}
   */
  async *streamCompletion(payload) {
    const { user_input, conversationHistory, deepseekHistory } = payload;

    // Push user input before building the request (same as the non-stream path).
    conversationHistory.push(user_input);
    deepseekHistory.push(user_input);

    const requestData = {
      ...this.buildRequestData(payload),
      stream: true,
      stream_options: { include_usage: true }
    };
    const headers = this.buildHeaders();

    let text = '';
    let thinking = '';

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, {
        headers,
        responseType: 'stream'
      });

      // parseOpenAISSE surfaces reasoning_content deltas as {type:'thinking'}.
      for await (const ev of parseOpenAISSE(response.data)) {
        if (ev.type === 'text') text += ev.value;
        else if (ev.type === 'thinking') thinking += ev.value;
        yield ev;
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('DeepSeek Streaming Error:', message);
      yield { type: 'error', value: `DeepSeek API Error: ${message}` };
      return;
    }

    // Persist the assistant turn so a streamed turn leaves history in the same
    // shape as a non-streamed one: plain answer text on conversationHistory,
    // formatted thinking+response on deepseekHistory when reasoning was emitted.
    conversationHistory.push({ role: "assistant", content: text });
    const deepseekContent = thinking
      ? this.formatReasoningContent(thinking, text)
      : text;
    deepseekHistory.push({ role: "assistant", content: deepseekContent });
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
