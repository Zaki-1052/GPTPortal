// Model-related utilities and token management

/**
 * Get maximum tokens allowed for a specific model
 * @param {string} modelID - The model identifier
 * @returns {number} Maximum tokens allowed
 */
function getMaxTokensByModel(modelID) {
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

/**
 * Enforce token limits based on model constraints
 * @param {number} requestedTokens - Requested token count
 * @param {string} modelID - The model identifier
 * @returns {number} Enforced token count
 */
function enforceTokenLimits(requestedTokens, modelID) {
  const maxTokens = getMaxTokensByModel(modelID);
  const minTokens = 1000;
  return Math.min(Math.max(parseInt(requestedTokens) || 8000, minTokens), maxTokens);
}

/**
 * Model pricing information (cost per million tokens)
 */
const modelPricing = {
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

/**
 * Calculate cost for token usage
 * @param {string} modelID - Model identifier
 * @param {number} inputTokens - Input token count
 * @param {number} outputTokens - Output token count
 * @returns {number} Total cost in dollars
 */
function calculateCost(modelID, inputTokens, outputTokens) {
  const pricing = modelPricing[modelID];
  if (!pricing) return 0;
  
  return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000000;
}

module.exports = {
  getMaxTokensByModel,
  enforceTokenLimits,
  modelPricing,
  calculateCost
};