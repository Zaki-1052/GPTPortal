// AI Provider initialization and management
const OpenAI = require('openai').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');
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
    providers.gemini = new GoogleGenerativeAI(apiKeys.google);
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

  return providers;
}

/**
 * Get safety settings for Google Gemini
 */
function getGeminiSafetySettings() {
  const { HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
  
  return [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
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