// AI Provider initialization and management
const OpenAI = require('openai').default;
const axios = require('axios');

/**
 * Initialize AI providers based on available API keys
 * @param {Object} apiKeys - Object containing API keys for different providers
 * @returns {Object} Initialized AI provider instances
 */
function initializeAIProviders(apiKeys) {
  const providers = {};

  // Initialize OpenAI
  if (apiKeys.openai) {
    providers.openai = new OpenAI({
      apiKey: apiKeys.openai
    });
    console.log('OpenAI provider initialized');
  } else {
    console.warn("Warning: OpenAI API key missing. OpenAI features disabled.");
  }

  // Initialize Google Gemini
  if (apiKeys.google) {
    // Active Gemini chat/image path lives in providers/geminiHandler.js (@google/genai);
    // this legacy registry only needs the key marker for parity with other providers.
    providers.gemini = { apiKey: apiKeys.google };
    console.log('Google Gemini provider initialized');
  } else {
    console.warn("Warning: Google API key missing. Gemini features disabled.");
  }

  // Claude API is handled via HTTP requests (no SDK initialization needed)
  if (apiKeys.claude) {
    providers.claude = { apiKey: apiKeys.claude };
    console.log('Claude provider configured');
  }

  // Mistral API
  if (apiKeys.mistral) {
    providers.mistral = { apiKey: apiKeys.mistral };
    console.log('Mistral provider configured');
  }

  // Groq API
  if (apiKeys.groq) {
    providers.groq = { apiKey: apiKeys.groq };
    console.log('Groq provider configured');
  }

  // OpenRouter API
  if (apiKeys.openrouter) {
    providers.openrouter = { apiKey: apiKeys.openrouter };
    console.log('OpenRouter provider configured');
  }

  // DeepSeek API
  if (apiKeys.deepseek) {
    providers.deepseek = { apiKey: apiKeys.deepseek };
    console.log('DeepSeek provider configured');
  }

  // Grok API
  if (apiKeys.grok) {
    providers.grok = { apiKey: apiKeys.grok };
    console.log('Grok provider configured');
  }

  // Kimi API
  if (apiKeys.kimi) {
    providers.kimi = { apiKey: apiKeys.kimi };
    console.log('Kimi provider configured');
  }

  return providers;
}

/**
 * Get safety settings for Google Gemini
 */
function getGeminiSafetySettings() {
  // Plain string enum values (accepted by the Gemini REST API), so this helper no
  // longer depends on the deprecated @google/generative-ai package for constants.
  const threshold = 'BLOCK_MEDIUM_AND_ABOVE';
  return [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold },
  ];
}

/**
 * Make HTTP request to external AI APIs
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request payload
 * @param {Object} headers - Request headers
 * @returns {Promise} API response
 */
async function makeAIRequest(url, data, headers) {
  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('AI API request failed:', error.message);
    throw error;
  }
}

module.exports = {
  initializeAIProviders,
  getGeminiSafetySettings,
  makeAIRequest
};