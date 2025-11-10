// Model Sync Service - Automated model discovery and updates
const modelLoader = require('../../shared/modelLoader');

class ModelSyncService {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.lastSyncResult = null;
  }

  /**
   * Start automatic model syncing
   * @param {Object} options - Sync configuration
   */
  start(options = {}) {
    const {
      intervalHours = 24,
      startupSync = true,
      openaiKey = process.env.OPENAI_API_KEY,
      anthropicKey = process.env.ANTHROPIC_API_KEY
    } = options;

    if (this.isRunning) {
      console.log('Model sync service already running');
      return;
    }

    console.log(`Starting model sync service (${intervalHours}h interval)`);
    this.isRunning = true;

    // Initial sync on startup
    if (startupSync) {
      this.syncModels({ openaiKey, anthropicKey }).catch(console.error);
    }

    // Set up periodic sync
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.syncInterval = setInterval(() => {
      this.syncModels({ openaiKey, anthropicKey }).catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop automatic syncing
   */
  stop() {
    if (!this.isRunning) {
      console.log('Model sync service not running');
      return;
    }

    console.log('Stopping model sync service');
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Perform manual sync
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync results
   */
  async syncModels(options = {}) {
    const {
      openaiKey = process.env.OPENAI_API_KEY,
      anthropicKey = process.env.ANTHROPIC_API_KEY,
      forceSync = false
    } = options;

    console.log('Starting manual model sync...');
    
    try {
      const result = await modelLoader.syncWithAPIs({
        openaiKey,
        anthropicKey,
        forceSync
      });

      this.lastSyncResult = {
        ...result,
        timestamp: new Date().toISOString()
      };

      if (result.synced) {
        console.log(`Model sync successful: ${result.added} added, ${result.updated} updated`);
      } else {
        console.log(`Model sync skipped: ${result.reason || result.error}`);
      }

      return this.lastSyncResult;

    } catch (error) {
      console.error('Model sync failed:', error);
      this.lastSyncResult = {
        synced: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
  }

  /**
   * Get sync status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      running: this.isRunning,
      lastSync: this.lastSyncResult,
      nextSync: this.syncInterval ? 
        new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() : 
        null
    };
  }

  /**
   * Force immediate sync
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync results
   */
  async forceSync(options = {}) {
    return this.syncModels({ ...options, forceSync: true });
  }
}

// Create singleton instance
const modelSyncService = new ModelSyncService();

module.exports = modelSyncService;