// Core model definitions using unified JSON data source
const modelLoader = require('../../shared/modelLoader');

/**
 * Get all core models from unified JSON
 * @returns {Promise<Object>} Core models object
 */
async function getCoreModels() {
  return await modelLoader.getAllModels();
}

/**
 * Get core models by category
 * @param {string} category - Model category (gpt, claude, gemini, etc.)
 * @returns {Promise<Object>} Filtered models
 */
async function getCoreModelsByCategory(category) {
  return await modelLoader.getModelsByCategory(category);
}

/**
 * Get core models by provider
 * @param {string} provider - Provider name (openai, anthropic, google, etc.)
 * @returns {Promise<Object>} Filtered models
 */
async function getCoreModelsByProvider(provider) {
  const allModels = await modelLoader.getAllModels();
  const filtered = {};
  
  Object.entries(allModels).forEach(([id, model]) => {
    if (model.provider === provider) {
      filtered[id] = model;
    }
  });
  
  return filtered;
}

/**
 * Get model by ID
 * @param {string} modelId - Model identifier
 * @returns {Promise<Object|null>} Model object or null if not found
 */
async function getCoreModel(modelId) {
  return await modelLoader.getModel(modelId);
}

/**
 * Check if model is a core model
 * @param {string} modelId - Model identifier
 * @returns {Promise<boolean>} True if core model
 */
async function isCoreModel(modelId) {
  return await modelLoader.hasModel(modelId);
}

/**
 * Get model pricing (backward compatibility)
 * @param {string} modelId - Model identifier
 * @returns {Promise<Object>} Pricing object
 */
async function getModelPricing(modelId) {
  return await modelLoader.getModelPricing(modelId);
}

/**
 * Get max tokens for model (backward compatibility)
 * @param {string} modelId - Model identifier
 * @returns {Promise<number>} Max tokens
 */
async function getMaxTokens(modelId) {
  return await modelLoader.getMaxTokens(modelId);
}

/**
 * Get context window for model (backward compatibility)
 * @param {string} modelId - Model identifier
 * @returns {Promise<number>} Context window
 */
async function getContextWindow(modelId) {
  return await modelLoader.getContextWindow(modelId);
}

/**
 * Check vision support (backward compatibility)
 * @param {string} modelId - Model identifier
 * @returns {Promise<boolean>} Vision support
 */
async function supportsVision(modelId) {
  return await modelLoader.supportsVision(modelId);
}

/**
 * Check function support (backward compatibility)
 * @param {string} modelId - Model identifier
 * @returns {Promise<boolean>} Function support
 */
async function supportsFunction(modelId) {
  return await modelLoader.supportsFunction(modelId);
}

/**
 * Get provider for model (backward compatibility)
 * @param {string} modelId - Model identifier
 * @returns {Promise<string>} Provider name
 */
async function getProvider(modelId) {
  return await modelLoader.getProvider(modelId);
}

/**
 * Get all free models
 * @returns {Promise<Array>} Array of free model IDs
 */
async function getFreeModels() {
  const allModels = await modelLoader.getAllModels();
  const freeModels = [];
  
  for (const [modelId, model] of Object.entries(allModels)) {
    if (model.pricing.input === 0 && model.pricing.output === 0) {
      freeModels.push(modelId);
    }
  }
  
  return freeModels;
}

/**
 * Search models
 * @param {string} query - Search query
 * @returns {Promise<Object>} Matching models
 */
async function searchModels(query) {
  return await modelLoader.searchModels(query);
}

/**
 * Get system statistics
 * @returns {Promise<Object>} Model statistics
 */
async function getStatistics() {
  return await modelLoader.getStatistics();
}

/**
 * Reload models from JSON (for cache invalidation)
 * @returns {Promise<Object>} Reloaded models
 */
async function reloadModels() {
  return await modelLoader.reload();
}

/**
 * Synchronous compatibility layer (deprecated - use async versions)
 * These functions load data synchronously for backward compatibility
 * but should be migrated to async versions
 */

// Cache for synchronous access
let syncCache = null;

/**
 * Initialize sync cache (call this at startup)
 */
async function initializeSyncCache() {
  try {
    syncCache = await modelLoader.getAllModels();
    console.log('Core models sync cache initialized');
  } catch (error) {
    console.error('Failed to initialize sync cache:', error);
    // Fallback to empty object
    syncCache = {};
  }
}

// Synchronous backward compatibility functions
function getCoreModelsSync() {
  if (!syncCache) {
    console.warn('Sync cache not initialized, returning empty object');
    return {};
  }
  return { ...syncCache };
}

function getCoreModelSync(modelId) {
  if (!syncCache) {
    console.warn('Sync cache not initialized');
    return null;
  }
  return syncCache[modelId] || null;
}

function isCoreModelSync(modelId) {
  if (!syncCache) {
    console.warn('Sync cache not initialized');
    return false;
  }
  return modelId in syncCache;
}

// Export both async and sync interfaces
module.exports = {
  // Async interface (recommended)
  getCoreModels,
  getCoreModelsByCategory,
  getCoreModelsByProvider,
  getCoreModel,
  isCoreModel,
  getModelPricing,
  getMaxTokens,
  getContextWindow,
  supportsVision,
  supportsFunction,
  getProvider,
  getFreeModels,
  searchModels,
  getStatistics,
  reloadModels,
  
  // Sync compatibility layer
  initializeSyncCache,
  getCoreModelsSync,
  getCoreModelSync,
  isCoreModelSync,
  
  // For backward compatibility - export sync cache as coreModels
  get coreModels() {
    return syncCache || {};
  }
};