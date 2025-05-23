// Model-related utilities using unified model data
const modelLoader = require('../shared/modelLoader');

/**
 * Get maximum tokens allowed for a specific model
 * @param {string} modelID - The model identifier
 * @returns {Promise<number>} Maximum tokens allowed
 */
async function getMaxTokensByModel(modelID) {
  return await modelLoader.getMaxTokens(modelID);
}

/**
 * Enforce token limits based on model constraints
 * @param {number} requestedTokens - Requested token count
 * @param {string} modelID - The model identifier
 * @returns {Promise<number>} Enforced token count
 */
async function enforceTokenLimits(requestedTokens, modelID) {
  const maxTokens = await getMaxTokensByModel(modelID);
  const minTokens = 1000;
  return Math.min(Math.max(parseInt(requestedTokens) || 8000, minTokens), maxTokens);
}

/**
 * Calculate cost for token usage using unified pricing
 * @param {string} modelID - Model identifier
 * @param {number} inputTokens - Input token count
 * @param {number} outputTokens - Output token count
 * @returns {Promise<number>} Total cost in dollars
 */
async function calculateCost(modelID, inputTokens, outputTokens) {
  const pricing = await modelLoader.getModelPricing(modelID);
  if (!pricing) return 0;
  
  return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000000;
}

/**
 * Get model pricing information
 * @param {string} modelID - Model identifier
 * @returns {Promise<Object>} Pricing object {input, output}
 */
async function getModelPricing(modelID) {
  return await modelLoader.getModelPricing(modelID);
}

/**
 * Get context window for model
 * @param {string} modelID - Model identifier
 * @returns {Promise<number>} Context window size
 */
async function getContextWindow(modelID) {
  return await modelLoader.getContextWindow(modelID);
}

/**
 * Check if model supports vision
 * @param {string} modelID - Model identifier
 * @returns {Promise<boolean>} Vision support
 */
async function supportsVision(modelID) {
  return await modelLoader.supportsVision(modelID);
}

/**
 * Check if model supports function calling
 * @param {string} modelID - Model identifier
 * @returns {Promise<boolean>} Function support
 */
async function supportsFunction(modelID) {
  return await modelLoader.supportsFunction(modelID);
}

/**
 * Get provider for model
 * @param {string} modelID - Model identifier
 * @returns {Promise<string>} Provider name
 */
async function getProvider(modelID) {
  return await modelLoader.getProvider(modelID);
}

/**
 * Check if model is free
 * @param {string} modelID - Model identifier
 * @returns {Promise<boolean>} True if free
 */
async function isModelFree(modelID) {
  return await modelLoader.isFree(modelID);
}

/**
 * Get all available models
 * @returns {Promise<Object>} All models
 */
async function getAllModels() {
  return await modelLoader.getAllModels();
}

/**
 * Get models by category
 * @param {string} category - Category name
 * @returns {Promise<Object>} Filtered models
 */
async function getModelsByCategory(category) {
  return await modelLoader.getModelsByCategory(category);
}

/**
 * Search models by query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Matching models
 */
async function searchModels(query) {
  return await modelLoader.searchModels(query);
}

/**
 * Get model by ID
 * @param {string} modelID - Model identifier
 * @returns {Promise<Object|null>} Model object or null
 */
async function getModel(modelID) {
  return await modelLoader.getModel(modelID);
}

/**
 * Check if model exists
 * @param {string} modelID - Model identifier
 * @returns {Promise<boolean>} True if exists
 */
async function hasModel(modelID) {
  return await modelLoader.hasModel(modelID);
}

/**
 * Get comprehensive model information
 * @param {string} modelID - Model identifier
 * @returns {Promise<Object|null>} Complete model info
 */
async function getModelInfo(modelID) {
  const model = await getModel(modelID);
  if (!model) return null;
  
  return {
    ...model,
    // Add computed properties
    isFree: await isModelFree(modelID),
    maxTokens: await getMaxTokensByModel(modelID)
  };
}

/**
 * Get models suitable for specific use cases
 * @param {string} useCase - Use case ('vision', 'function', 'reasoning', 'free')
 * @returns {Promise<Object>} Filtered models
 */
async function getModelsForUseCase(useCase) {
  const allModels = await getAllModels();
  const filtered = {};
  
  for (const [id, model] of Object.entries(allModels)) {
    let include = false;
    
    switch (useCase) {
      case 'vision':
        include = model.supportsVision;
        break;
      case 'function':
        include = model.supportsFunction;
        break;
      case 'reasoning':
        include = model.category === 'reasoning';
        break;
      case 'free':
        include = model.pricing.input === 0 && model.pricing.output === 0;
        break;
      default:
        include = true;
    }
    
    if (include) {
      filtered[id] = model;
    }
  }
  
  return filtered;
}

/**
 * Get model recommendations based on requirements
 * @param {Object} requirements - Requirements object
 * @returns {Promise<Array>} Recommended models
 */
async function getModelRecommendations(requirements = {}) {
  const {
    budget = 'any',      // 'free', 'cheap', 'medium', 'expensive', 'any'
    capability = 'any',  // 'vision', 'function', 'reasoning', 'any'
    provider = 'any',    // Provider preference
    performance = 'any'  // 'fast', 'balanced', 'best', 'any'
  } = requirements;
  
  const allModels = await getAllModels();
  const recommendations = [];
  
  for (const [id, model] of Object.entries(allModels)) {
    let score = 0;
    let qualifies = true;
    
    // Budget filter
    if (budget !== 'any') {
      const maxPrice = Math.max(model.pricing.input, model.pricing.output);
      switch (budget) {
        case 'free':
          if (maxPrice > 0) qualifies = false;
          break;
        case 'cheap':
          if (maxPrice > 1) qualifies = false;
          else score += 3;
          break;
        case 'medium':
          if (maxPrice > 10) qualifies = false;
          else score += 2;
          break;
        case 'expensive':
          score += 1;
          break;
      }
    }
    
    // Capability filter
    if (capability !== 'any' && qualifies) {
      switch (capability) {
        case 'vision':
          if (!model.supportsVision) qualifies = false;
          else score += 2;
          break;
        case 'function':
          if (!model.supportsFunction) qualifies = false;
          else score += 2;
          break;
        case 'reasoning':
          if (model.category !== 'reasoning') qualifies = false;
          else score += 3;
          break;
      }
    }
    
    // Provider preference
    if (provider !== 'any' && model.provider === provider) {
      score += 1;
    }
    
    // Performance heuristics
    if (performance !== 'any') {
      switch (performance) {
        case 'fast':
          if (model.name.toLowerCase().includes('mini') || 
              model.name.toLowerCase().includes('flash') ||
              model.name.toLowerCase().includes('8b')) {
            score += 2;
          }
          break;
        case 'best':
          if (model.name.toLowerCase().includes('opus') ||
              model.name.toLowerCase().includes('4o') ||
              model.name.toLowerCase().includes('405b')) {
            score += 3;
          }
          break;
        case 'balanced':
          if (model.name.toLowerCase().includes('sonnet') ||
              model.name.toLowerCase().includes('turbo') ||
              model.name.toLowerCase().includes('70b')) {
            score += 2;
          }
          break;
      }
    }
    
    if (qualifies) {
      recommendations.push({ id, model, score });
    }
  }
  
  // Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);
  
  return recommendations.map(r => ({ id: r.id, ...r.model, score: r.score }));
}

/**
 * Synchronous backward compatibility functions
 * These maintain compatibility with existing code
 */

// Backward compatibility - keep original hardcoded pricing for sync access
const legacyModelPricing = {
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-4o': { input: 5.00, output: 15.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-3.5-turbo-0125': { input: 0.50, output: 1.50 },
  'claude-3-5-sonnet-20240620': { input: 3.00, output: 15.00 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  // Free models
  'gemini-pro': { input: 0, output: 0 },
  'gemini-pro-vision': { input: 0, output: 0 },
  'gemini-1.5-pro': { input: 0, output: 0 },
  'gemini-1.5-flash': { input: 0, output: 0 },
  'llama3-70b-8192': { input: 0, output: 0 },
  'llama3-8b-8192': { input: 0, output: 0 }
};

// Synchronous token limits function (for backward compatibility)
function getMaxTokensByModelSync(modelID) {
  if (modelID === 'gpt-4') {
    return 6000;
  } else if (modelID === 'gpt-4o-mini' || modelID === 'gpt-4o') {
    return 16000;
  } else if (modelID.startsWith('llama-3.1')) {
    return 8000;
  } else if (modelID === 'claude-3-7-sonnet-latest') {
    return 100000;
  } else if (modelID.startsWith('claude')) {
    return 8000;
  } else {
    return 8000; // Default for other models
  }
}

module.exports = {
  // Async interface (recommended)
  getMaxTokensByModel,
  enforceTokenLimits,
  calculateCost,
  getModelPricing,
  getContextWindow,
  supportsVision,
  supportsFunction,
  getProvider,
  isModelFree,
  getAllModels,
  getModelsByCategory,
  searchModels,
  getModel,
  hasModel,
  getModelInfo,
  getModelsForUseCase,
  getModelRecommendations,
  
  // Backward compatibility
  getMaxTokensByModelSync,
  modelPricing: legacyModelPricing
};