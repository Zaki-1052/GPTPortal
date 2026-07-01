// Groq Provider Handler - LLaMA/gpt-oss models and Whisper transcription
// Groq exposes an OpenAI-compatible Chat Completions endpoint, so requests and
// SSE streaming reuse the shared OpenAI parser. Model ids (including slash ids
// like `openai/gpt-oss-120b`) are passed through UNCHANGED.
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { parseOpenAISSE } = require('./streamUtils');

class GroqHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1';
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
   * Standard authenticated JSON headers for Groq requests.
   */
  buildHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Handle LLaMA/gpt-oss chat completion via Groq (non-streaming fallback)
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
      console.error('Groq API Error:', error.message);
      throw new Error(`Groq API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Stream a Groq chat completion as contract events.
   * Mirrors handleChatCompletion's history handling: pushes user_input first,
   * accumulates streamed text, then appends the assistant turn at the end.
   * gpt-oss reasoning deltas surface as {type:'thinking'} via parseOpenAISSE.
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
      console.error('Groq Streaming Error:', message);
      yield { type: 'error', value: `Groq API Error: ${message}` };
      return;
    }

    // Leave history in the same shape as a non-streamed turn.
    conversationHistory.push({ role: 'assistant', content: text });
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