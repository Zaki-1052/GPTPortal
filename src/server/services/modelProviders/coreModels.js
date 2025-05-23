// Core model definitions for stable providers (GPT, Claude, Gemini, etc.)
// These are well-known, stable models that don't change frequently

const coreModels = {
  // OpenAI GPT Models
  "gpt-4o": {
    name: "GPT-4o: Latest",
    provider: "openai",
    category: "gpt",
    description: "Most capable GPT-4 model",
    pricing: { input: 5.00, output: 15.00 },
    contextWindow: 128000,
    supportsVision: true,
    supportsFunction: true
  },
  "gpt-4o-mini": {
    name: "GPT-4o Mini: Cheapest",
    provider: "openai", 
    category: "gpt",
    description: "Affordable GPT-4 model",
    pricing: { input: 0.15, output: 0.60 },
    contextWindow: 128000,
    supportsVision: true,
    supportsFunction: true
  },
  "gpt-4-turbo": {
    name: "GPT-4 Turbo: Standard",
    provider: "openai",
    category: "gpt", 
    description: "Fast GPT-4 model",
    pricing: { input: 10.00, output: 30.00 },
    contextWindow: 128000,
    supportsVision: true,
    supportsFunction: true
  },
  "gpt-4": {
    name: "GPT-4: Original",
    provider: "openai",
    category: "gpt",
    description: "Original GPT-4 model",
    pricing: { input: 30.00, output: 60.00 },
    contextWindow: 8192,
    supportsVision: false,
    supportsFunction: true
  },
  "gpt-3.5-turbo-0125": {
    name: "GPT-3.5 Turbo: Legacy",
    provider: "openai",
    category: "gpt",
    description: "Legacy GPT-3.5 model",
    pricing: { input: 0.50, output: 1.50 },
    contextWindow: 16385,
    supportsVision: false,
    supportsFunction: true
  },

  // OpenAI Reasoning Models
  "o1-preview": {
    name: "GPT-o1 Preview: Reasoning",
    provider: "openai",
    category: "reasoning",
    description: "Advanced reasoning model",
    pricing: { input: 15.00, output: 60.00 },
    contextWindow: 128000,
    supportsVision: false,
    supportsFunction: false
  },
  "o1-mini": {
    name: "GPT-o1 Mini: Cheap Reasoning", 
    provider: "openai",
    category: "reasoning",
    description: "Affordable reasoning model",
    pricing: { input: 3.00, output: 12.00 },
    contextWindow: 128000,
    supportsVision: false,
    supportsFunction: false
  },
  "o3-mini": {
    name: "GPT-o3 Mini: Cheap Reasoning",
    provider: "openai", 
    category: "reasoning",
    description: "Latest affordable reasoning model",
    pricing: { input: 3.00, output: 12.00 },
    contextWindow: 128000,
    supportsVision: false,
    supportsFunction: false
  },

  // Anthropic Claude Models
  "claude-opus-4-20250514": {
    name: "Claude 4 Opus",
    provider: "anthropic",
    category: "claude", 
    description: "Most capable Claude model",
    pricing: { input: 15.00, output: 75.00 },
    contextWindow: 200000,
    supportsVision: true,
    supportsFunction: true
  },
  "claude-sonnet-4-20250514": {
    name: "Claude 4 Sonnet",
    provider: "anthropic",
    category: "claude",
    description: "Balanced Claude model",
    pricing: { input: 3.00, output: 15.00 },
    contextWindow: 200000,
    supportsVision: true,
    supportsFunction: true
  },
  "claude-3-7-sonnet-latest": {
    name: "Claude 3.7 Sonnet", 
    provider: "anthropic",
    category: "claude",
    description: "Enhanced Claude 3.5 model",
    pricing: { input: 3.00, output: 15.00 },
    contextWindow: 200000,
    supportsVision: true,
    supportsFunction: true
  },
  "claude-3-5-sonnet-latest": {
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    category: "claude",
    description: "Advanced Claude model",
    pricing: { input: 3.00, output: 15.00 },
    contextWindow: 200000,
    supportsVision: true,
    supportsFunction: true
  },
  "claude-3-5-haiku-latest": {
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    category: "claude",
    description: "Fast Claude model",
    pricing: { input: 0.25, output: 1.25 },
    contextWindow: 200000,
    supportsVision: true,
    supportsFunction: true
  },
  "claude-3-haiku-20240307": {
    name: "Claude Haiku: Cheap",
    provider: "anthropic",
    category: "claude",
    description: "Affordable Claude model",
    pricing: { input: 0.25, output: 1.25 },
    contextWindow: 200000,
    supportsVision: true,
    supportsFunction: true
  },

  // Google Gemini Models
  "gemini-2.0-flash-exp": {
    name: "Gemini 2.0 Flash",
    provider: "google",
    category: "gemini",
    description: "Latest Gemini model",
    pricing: { input: 0, output: 0 }, // Free
    contextWindow: 1000000,
    supportsVision: true,
    supportsFunction: true
  },
  "gemini-1.5-pro": {
    name: "Gemini 1.5 Pro: Best",
    provider: "google",
    category: "gemini", 
    description: "Most capable Gemini model",
    pricing: { input: 0, output: 0 }, // Free
    contextWindow: 2000000,
    supportsVision: true,
    supportsFunction: true
  },
  "gemini-1.5-flash": {
    name: "Gemini 1.5 Flash",
    provider: "google",
    category: "gemini",
    description: "Fast Gemini model", 
    pricing: { input: 0, output: 0 }, // Free
    contextWindow: 1000000,
    supportsVision: true,
    supportsFunction: true
  },
  "gemini-pro": {
    name: "Gemini Pro",
    provider: "google",
    category: "gemini",
    description: "Standard Gemini model",
    pricing: { input: 0, output: 0 }, // Free
    contextWindow: 30720,
    supportsVision: false,
    supportsFunction: true
  },

  // DeepSeek Models
  "deepseek-reasoner": {
    name: "DeepSeek-R1",
    provider: "deepseek",
    category: "deepseek",
    description: "DeepSeek reasoning model",
    pricing: { input: 0.55, output: 2.19 },
    contextWindow: 64000,
    supportsVision: false,
    supportsFunction: true
  },
  "deepseek-chat": {
    name: "DeepSeek-Chat", 
    provider: "deepseek",
    category: "deepseek",
    description: "DeepSeek conversational model",
    pricing: { input: 0.14, output: 0.28 },
    contextWindow: 64000,
    supportsVision: false,
    supportsFunction: true
  },

  // Meta LLaMA Models (via Groq)
  "llama-3.1-405b-reasoning": {
    name: "Llama 3.1 405B",
    provider: "groq",
    category: "llama",
    description: "Largest LLaMA model",
    pricing: { input: 0, output: 0 }, // Free via Groq
    contextWindow: 131072,
    supportsVision: false,
    supportsFunction: true
  },
  "llama-3.1-70b-versatile": {
    name: "Llama 3.1 70B",
    provider: "groq", 
    category: "llama",
    description: "Versatile LLaMA model",
    pricing: { input: 0, output: 0 }, // Free via Groq
    contextWindow: 131072,
    supportsVision: false,
    supportsFunction: true
  },
  "llama-3.1-8b-instant": {
    name: "Llama 3.1 8B",
    provider: "groq",
    category: "llama", 
    description: "Fast LLaMA model",
    pricing: { input: 0, output: 0 }, // Free via Groq
    contextWindow: 131072,
    supportsVision: false,
    supportsFunction: true
  },

  // Mistral Models  
  "mistral-large-latest": {
    name: "Mistral Large",
    provider: "mistral",
    category: "mistral",
    description: "Largest Mistral model",
    pricing: { input: 2.00, output: 6.00 },
    contextWindow: 128000,
    supportsVision: false,
    supportsFunction: true
  },
  "codestral-latest": {
    name: "Codestral",
    provider: "mistral",
    category: "mistral",
    description: "Mistral coding model",
    pricing: { input: 1.00, output: 3.00 },
    contextWindow: 32000,
    supportsVision: false,
    supportsFunction: true
  }
};

/**
 * Get all core models
 * @returns {Object} Core models object
 */
function getCoreModels() {
  return { ...coreModels };
}

/**
 * Get core models by category
 * @param {string} category - Model category (gpt, claude, gemini, etc.)
 * @returns {Object} Filtered models
 */
function getCoreModelsByCategory(category) {
  const filtered = {};
  Object.entries(coreModels).forEach(([id, model]) => {
    if (model.category === category) {
      filtered[id] = model;
    }
  });
  return filtered;
}

/**
 * Get core models by provider
 * @param {string} provider - Provider name (openai, anthropic, google, etc.)
 * @returns {Object} Filtered models
 */
function getCoreModelsByProvider(provider) {
  const filtered = {};
  Object.entries(coreModels).forEach(([id, model]) => {
    if (model.provider === provider) {
      filtered[id] = model;
    }
  });
  return filtered;
}

/**
 * Get model by ID
 * @param {string} modelId - Model identifier
 * @returns {Object|null} Model object or null if not found
 */
function getCoreModel(modelId) {
  return coreModels[modelId] || null;
}

/**
 * Check if model is a core model
 * @param {string} modelId - Model identifier
 * @returns {boolean} True if core model
 */
function isCoreModel(modelId) {
  return modelId in coreModels;
}

module.exports = {
  getCoreModels,
  getCoreModelsByCategory,
  getCoreModelsByProvider, 
  getCoreModel,
  isCoreModel,
  coreModels
};