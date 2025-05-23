// API routes for dynamic model management
const express = require('express');
const modelRegistry = require('../services/modelProviders/modelRegistry');
const modelLoader = require('../../shared/modelLoader');
const modelSyncService = require('../services/modelSyncService');
const tokenCountService = require('../services/tokenCountService');

const router = express.Router();

/**
 * GET /api/models - Get all available models
 */
router.get('/models', async (req, res) => {
  try {
    const format = req.query.format || 'detailed';
    
    if (format === 'frontend') {
      // Optimized format for frontend dropdown
      const models = modelRegistry.getModelsForFrontend();
      res.json({
        success: true,
        data: models,
        meta: {
          timestamp: new Date().toISOString(),
          total: Object.keys(models.models).length
        }
      });
    } else {
      // Detailed format with all model information
      const models = modelRegistry.getAllModels();
      res.json({
        success: true,
        data: models,
        meta: {
          timestamp: new Date().toISOString(),
          core: Object.keys(models.core).length,
          openrouter: Object.keys(models.openrouter).length,
          total: Object.keys(models.combined).length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      details: error.message
    });
  }
});

/**
 * GET /api/models/core - Get only core models
 */
router.get('/models/core', async (req, res) => {
  try {
    const models = modelRegistry.getCoreModels();
    res.json({
      success: true,
      data: models,
      meta: {
        timestamp: new Date().toISOString(),
        count: Object.keys(models).length,
        source: 'core'
      }
    });
  } catch (error) {
    console.error('Error fetching core models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch core models',
      details: error.message
    });
  }
});

/**
 * GET /api/models/openrouter - Get only OpenRouter models
 */
router.get('/models/openrouter', async (req, res) => {
  try {
    const models = modelRegistry.getOpenRouterModels();
    const status = modelRegistry.getStatus().openrouter;
    
    res.json({
      success: true,
      data: models,
      meta: {
        timestamp: new Date().toISOString(),
        count: Object.keys(models).length,
        source: 'openrouter',
        cacheStatus: status
      }
    });
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch OpenRouter models',
      details: error.message
    });
  }
});

/**
 * GET /api/models/categories - Get models organized by categories
 */
router.get('/models/categories', async (req, res) => {
  try {
    const categories = modelRegistry.getModelsByCategories();
    res.json({
      success: true,
      data: categories,
      meta: {
        timestamp: new Date().toISOString(),
        categoryCount: Object.keys(categories).length
      }
    });
  } catch (error) {
    console.error('Error fetching model categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model categories',
      details: error.message
    });
  }
});

/**
 * GET /api/models/search - Search models
 */
router.get('/models/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const results = modelRegistry.searchModels(query.trim());
    res.json({
      success: true,
      data: results,
      meta: {
        timestamp: new Date().toISOString(),
        query: query.trim(),
        totalResults: Object.keys(results.combined).length
      }
    });
  } catch (error) {
    console.error('Error searching models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search models',
      details: error.message
    });
  }
});

/**
 * GET /api/models/:modelId - Get specific model details
 */
router.get('/models/:modelId', async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const model = modelRegistry.getModel(modelId);
    
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found',
        modelId: modelId
      });
    }
    
    res.json({
      success: true,
      data: model,
      meta: {
        timestamp: new Date().toISOString(),
        modelId: modelId
      }
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model',
      details: error.message
    });
  }
});

/**
 * POST /api/models/refresh - Manually refresh OpenRouter models
 */
router.post('/models/refresh', async (req, res) => {
  try {
    console.log('Manual model refresh requested');
    const success = await modelRegistry.refreshOpenRouterModels();
    
    if (success) {
      const status = modelRegistry.getStatus();
      res.json({
        success: true,
        message: 'Models refreshed successfully',
        data: status,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to refresh models',
        message: 'Check server logs for details'
      });
    }
  } catch (error) {
    console.error('Error refreshing models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh models',
      details: error.message
    });
  }
});

/**
 * GET /api/models/status - Get model system status
 */
router.get('/models/status', async (req, res) => {
  try {
    const status = modelRegistry.getStatus();
    res.json({
      success: true,
      data: status,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching model status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model status',
      details: error.message
    });
  }
});

/**
 * GET /api/models/statistics - Get model statistics
 */
router.get('/models/statistics', async (req, res) => {
  try {
    const stats = modelRegistry.getStatistics();
    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching model statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model statistics',
      details: error.message
    });
  }
});

/**
 * GET /api/models/provider/:modelId - Get the provider/endpoint for a model
 */
router.get('/models/provider/:modelId', async (req, res) => {
  try {
    const modelId = req.params.modelId;
    const provider = modelRegistry.getModelProvider(modelId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Model not found',
        modelId: modelId
      });
    }
    
    res.json({
      success: true,
      data: {
        modelId: modelId,
        provider: provider
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching model provider:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch model provider',
      details: error.message
    });
  }
});

/**
 * POST /api/models/sync - Sync models with provider APIs
 */
router.post('/models/sync', async (req, res) => {
  try {
    const { forceSync = false } = req.body;
    const result = await modelSyncService.syncModels({ forceSync });
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error syncing models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync models',
      details: error.message
    });
  }
});

/**
 * GET /api/models/sync/status - Get model sync status
 */
router.get('/models/sync/status', async (req, res) => {
  try {
    const status = modelSyncService.getStatus();
    
    res.json({
      success: true,
      data: status,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync status',
      details: error.message
    });
  }
});

/**
 * POST /api/models/recommend - Get model recommendations
 */
router.post('/models/recommend', async (req, res) => {
  try {
    const requirements = req.body;
    const recommendations = await modelLoader.getModelRecommendations(requirements);
    
    res.json({
      success: true,
      data: recommendations,
      meta: {
        timestamp: new Date().toISOString(),
        requirements: requirements
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model recommendations',
      details: error.message
    });
  }
});

/**
 * POST /api/models/tokens/count - Count tokens for specific model
 */
router.post('/models/tokens/count', async (req, res) => {
  try {
    const { text, modelId } = req.body;
    
    if (!text || !modelId) {
      return res.status(400).json({
        success: false,
        error: 'Both "text" and "modelId" are required'
      });
    }
    
    const tokenCount = await tokenCountService.countTokens(text, modelId);
    const cost = await tokenCountService.calculateCost(modelId, tokenCount, 0);
    
    res.json({
      success: true,
      data: {
        modelId,
        tokenCount,
        textLength: text.length,
        costEstimate: cost
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error counting tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to count tokens',
      details: error.message
    });
  }
});

/**
 * POST /api/models/tokens/analyze - Analyze text across multiple models
 */
router.post('/models/tokens/analyze', async (req, res) => {
  try {
    const { text, modelIds } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const analysis = await tokenCountService.analyzeText(text, modelIds);
    
    res.json({
      success: true,
      data: analysis,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze text',
      details: error.message
    });
  }
});

/**
 * POST /api/models/tokens/calculate-cost - Calculate cost for token usage
 */
router.post('/models/tokens/calculate-cost', async (req, res) => {
  try {
    const { modelId, inputTokens, outputTokens, useCached = false } = req.body;
    
    if (!modelId || !inputTokens) {
      return res.status(400).json({
        success: false,
        error: 'modelId and inputTokens are required'
      });
    }
    
    const cost = await tokenCountService.calculateCost(
      modelId, 
      inputTokens, 
      outputTokens || 0, 
      useCached
    );
    
    res.json({
      success: true,
      data: cost,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate cost',
      details: error.message
    });
  }
});

/**
 * GET /api/models/tokens/capabilities - Get token counting capabilities
 */
router.get('/models/tokens/capabilities', async (req, res) => {
  try {
    const capabilities = tokenCountService.getCapabilities();
    
    res.json({
      success: true,
      data: capabilities,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get capabilities',
      details: error.message
    });
  }
});

module.exports = router;