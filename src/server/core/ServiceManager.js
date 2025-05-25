/**
 * Service Manager - Central orchestrator for all application services
 * Handles initialization, lifecycle, and coordination of services
 */

const ProviderFactory = require('../services/providers/providerFactory');
const { initializeAIProviders } = require('../services/aiProviders');
const modelSyncService = require('../services/modelSyncService');
const tokenCountService = require('../services/tokenCountService');
const tokenService = require('../services/tokenService');
const costService = require('../services/costService');
const exportService = require('../services/exportService');
const titleService = require('../services/titleService');
const PromptCacheService = require('../services/promptCacheService');
const Logger = require('../utils/Logger');

class ServiceManager {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('ServiceManager');
    this.services = new Map();
    this.initialized = false;
    
    // Core services
    this.providerFactory = null;
    this.aiProviders = null;
  }

  /**
   * Initialize all services
   */
  async initialize() {
    try {
      this.logger.info('Initializing services...');

      // Initialize AI providers
      this.aiProviders = initializeAIProviders(this.config.apiKeys);
      this.services.set('aiProviders', this.aiProviders);

      // Initialize prompt cache service with configuration
      const promptCacheService = new PromptCacheService(tokenService, costService, this.config.promptCache);
      this.services.set('promptCacheService', promptCacheService);

      // Initialize provider factory with prompt cache service
      this.providerFactory = new ProviderFactory(this.config.apiKeys, promptCacheService);
      this.services.set('providerFactory', this.providerFactory);

      // Initialize model sync service
      modelSyncService.start({
        intervalHours: 24,
        startupSync: false // Don't sync on startup to avoid blocking
      });
      this.services.set('modelSyncService', modelSyncService);

      // Register other services
      this.services.set('tokenCountService', tokenCountService);
      this.services.set('tokenService', tokenService);
      this.services.set('costService', costService);
      this.services.set('exportService', exportService);
      this.services.set('titleService', titleService);

      this.initialized = true;
      this.logger.info('✅ All services initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Get a service by name
   */
  getService(name) {
    if (!this.initialized) {
      throw new Error('ServiceManager not initialized');
    }
    
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    
    return service;
  }

  /**
   * Get provider factory
   */
  getProviderFactory() {
    return this.providerFactory;
  }

  /**
   * Get available AI providers
   */
  getAvailableProviders() {
    return this.providerFactory ? this.providerFactory.getAvailableProviders() : [];
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider) {
    return this.providerFactory ? this.providerFactory.isProviderAvailable(provider) : false;
  }

  /**
   * Get service status
   */
  getStatus() {
    const status = {
      initialized: this.initialized,
      serviceCount: this.services.size,
      services: {}
    };

    // Get status from each service
    this.services.forEach((service, name) => {
      try {
        if (typeof service.getStatus === 'function') {
          status.services[name] = service.getStatus();
        } else if (typeof service.getCapabilities === 'function') {
          status.services[name] = { capabilities: service.getCapabilities() };
        } else {
          status.services[name] = { available: true };
        }
      } catch (error) {
        status.services[name] = { error: error.message };
      }
    });

    // Add provider factory status
    if (this.providerFactory) {
      status.providers = {
        available: this.providerFactory.getAvailableProviders(),
        count: this.providerFactory.getAvailableProviders().length
      };
    }

    return status;
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown() {
    this.logger.info('Shutting down services...');

    try {
      // Stop model sync service
      if (modelSyncService) {
        modelSyncService.stop();
      }

      // Shutdown other services that support it
      for (const [name, service] of this.services) {
        if (typeof service.shutdown === 'function') {
          try {
            await service.shutdown();
            this.logger.info(`✅ ${name} shut down cleanly`);
          } catch (error) {
            this.logger.error(`Error shutting down ${name}:`, error);
          }
        }
      }

      this.services.clear();
      this.initialized = false;
      this.logger.info('✅ All services shut down');

    } catch (error) {
      this.logger.error('Error during service shutdown:', error);
      throw error;
    }
  }

  /**
   * Restart a specific service
   */
  async restartService(serviceName) {
    this.logger.info(`Restarting service: ${serviceName}`);
    
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    try {
      // Shutdown if supported
      if (typeof service.shutdown === 'function') {
        await service.shutdown();
      }

      // Reinitialize if supported
      if (typeof service.initialize === 'function') {
        await service.initialize();
      }

      this.logger.info(`✅ Service '${serviceName}' restarted successfully`);

    } catch (error) {
      this.logger.error(`Failed to restart service '${serviceName}':`, error);
      throw error;
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    const health = {
      overall: 'healthy',
      services: {},
      timestamp: new Date().toISOString()
    };

    let hasUnhealthy = false;

    for (const [name, service] of this.services) {
      try {
        if (typeof service.healthCheck === 'function') {
          health.services[name] = await service.healthCheck();
        } else if (typeof service.getStatus === 'function') {
          const status = service.getStatus();
          health.services[name] = {
            status: 'healthy',
            details: status
          };
        } else {
          health.services[name] = { status: 'unknown' };
        }

        if (health.services[name].status !== 'healthy') {
          hasUnhealthy = true;
        }

      } catch (error) {
        health.services[name] = {
          status: 'unhealthy',
          error: error.message
        };
        hasUnhealthy = true;
      }
    }

    health.overall = hasUnhealthy ? 'degraded' : 'healthy';
    return health;
  }
}

module.exports = ServiceManager;