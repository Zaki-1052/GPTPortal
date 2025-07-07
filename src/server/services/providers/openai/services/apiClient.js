// src/server/services/providers/openai/services/apiClient.js
// Shared API client for OpenAI services

const axios = require('axios');
const { API_ENDPOINTS, ERROR_TYPES } = require('../utils/constants');

class OpenAIApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = API_ENDPOINTS.BASE_URL;
  }

  /**
   * Get default headers for API requests
   */
  getDefaultHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get headers for multipart form data
   */
  getFormHeaders(formData) {
    return {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Make a POST request to OpenAI API
   */
  async post(endpoint, data, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = options.headers || this.getDefaultHeaders();
    const config = {
      headers,
      ...options
    };

    try {
      console.log(`🔗 OpenAI API Request: ${endpoint}`);
      const response = await axios.post(url, data, config);
      return response;
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * Make a GET request to OpenAI API
   */
  async get(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = options.headers || this.getDefaultHeaders();
    const config = {
      headers,
      ...options
    };

    try {
      console.log(`🔗 OpenAI API Request: ${endpoint}`);
      const response = await axios.get(url, config);
      return response;
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * Handle API errors with detailed error information
   */
  handleError(error, endpoint) {
    console.error(`OpenAI API Error (${endpoint}):`, error.message);
    
    // Extract error details from response
    const errorData = error.response?.data?.error;
    const statusCode = error.response?.status;
    
    let errorType = ERROR_TYPES.API_ERROR;
    let errorMessage = error.message;
    
    if (errorData) {
      errorMessage = errorData.message || errorMessage;
      
      // Classify error types
      if (statusCode === 401) {
        errorType = ERROR_TYPES.AUTHENTICATION;
      } else if (statusCode === 429) {
        errorType = ERROR_TYPES.RATE_LIMIT;
      } else if (statusCode === 403 && errorData.code === 'quota_exceeded') {
        errorType = ERROR_TYPES.QUOTA_EXCEEDED;
      } else if (statusCode >= 500) {
        errorType = ERROR_TYPES.SERVER_ERROR;
      }
    }

    const enhancedError = new Error(`OpenAI API Error: ${errorMessage}`);
    enhancedError.type = errorType;
    enhancedError.statusCode = statusCode;
    enhancedError.originalError = error;
    enhancedError.endpoint = endpoint;
    
    throw enhancedError;
  }

  /**
   * Chat Completions API request
   */
  async chatCompletions(requestData) {
    return this.post(API_ENDPOINTS.CHAT_COMPLETIONS, requestData);
  }

  /**
   * Responses API request
   */
  async responses(requestData) {
    return this.post(API_ENDPOINTS.RESPONSES, requestData);
  }

  /**
   * Image generation API request
   */
  async imageGeneration(requestData) {
    return this.post(API_ENDPOINTS.IMAGES_GENERATIONS, requestData);
  }

  /**
   * Audio transcription API request
   */
  async audioTranscription(formData) {
    const headers = this.getFormHeaders(formData);
    return this.post(API_ENDPOINTS.AUDIO_TRANSCRIPTIONS, formData, { headers });
  }

  /**
   * Text-to-speech API request
   */
  async textToSpeech(requestData) {
    return this.post(API_ENDPOINTS.AUDIO_SPEECH, requestData, {
      responseType: 'arraybuffer'
    });
  }

  /**
   * Create assistant
   */
  async createAssistant(requestData) {
    return this.post(API_ENDPOINTS.ASSISTANTS, requestData);
  }

  /**
   * Get assistant
   */
  async getAssistant(assistantId) {
    return this.get(`${API_ENDPOINTS.ASSISTANTS}/${assistantId}`);
  }

  /**
   * Create thread
   */
  async createThread(requestData = {}) {
    return this.post(API_ENDPOINTS.THREADS, requestData);
  }

  /**
   * Get thread
   */
  async getThread(threadId) {
    return this.get(`${API_ENDPOINTS.THREADS}/${threadId}`);
  }

  /**
   * Create message in thread
   */
  async createMessage(threadId, requestData) {
    return this.post(`${API_ENDPOINTS.THREADS}/${threadId}/messages`, requestData);
  }

  /**
   * List messages in thread
   */
  async listMessages(threadId) {
    return this.get(`${API_ENDPOINTS.THREADS}/${threadId}/messages`);
  }

  /**
   * Create run
   */
  async createRun(threadId, requestData) {
    return this.post(`${API_ENDPOINTS.THREADS}/${threadId}/runs`, requestData);
  }

  /**
   * Get run
   */
  async getRun(threadId, runId) {
    return this.get(`${API_ENDPOINTS.THREADS}/${threadId}/runs/${runId}`);
  }

  /**
   * Upload file
   */
  async uploadFile(formData) {
    const headers = this.getFormHeaders(formData);
    return this.post(API_ENDPOINTS.FILES, formData, { headers });
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      // Simple request to verify API connectivity
      await this.get('/models');
      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        type: error.type
      };
    }
  }
}

module.exports = OpenAIApiClient;