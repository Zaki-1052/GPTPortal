/**
 * GPTPortal Application Core
 * Central application orchestrator with improved architecture
 */

const express = require('express');
const { EventEmitter } = require('events');
const { config, validateConfig } = require('../config/environment');
const MiddlewareManager = require('./MiddlewareManager');
const RouteManager = require('./RouteManager');
const ServiceManager = require('./ServiceManager');
const ErrorHandler = require('./ErrorHandler');
const Logger = require('../utils/Logger');

class Application extends EventEmitter {
  constructor() {
    super();
    this.app = express();
    this.server = null;
    this.config = config;
    this.isShuttingDown = false;
    
    // Core managers
    this.middlewareManager = new MiddlewareManager(this.config);
    this.serviceManager = new ServiceManager(this.config);
    this.routeManager = new RouteManager(this.serviceManager);
    this.errorHandler = new ErrorHandler();
    this.logger = new Logger('Application');
    
    this.initialize();
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      this.logger.info('Initializing GPTPortal Application...');
      
      // Validate configuration
      validateConfig();
      
      // Initialize services first
      await this.serviceManager.initialize();
      
      // Setup middleware
      this.middlewareManager.setup(this.app);
      
      // Setup routes
      this.routeManager.setup(this.app);
      
      // Setup error handling
      this.errorHandler.setup(this.app);
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      this.logger.info('✅ Application initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start() {
    const PORT = this.config.isVercelEnvironment ? process.env.PORT : this.config.port;
    const HOST = this.config.isVercelEnvironment ? '0.0.0.0' : this.config.host;

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(PORT, HOST, (error) => {
        if (error) {
          this.logger.error('Failed to start server:', error);
          reject(error);
          return;
        }

        this.logger.info(`🚀 GPTPortal server running at http://${HOST}:${PORT}`);
        this.logger.info('✅ All systems operational');
        this.logger.info(`📊 Available providers: ${this.serviceManager.getAvailableProviders().join(', ')}`);
        
        this.emit('started');
        resolve();
      });
    });
  }

  /**
   * Setup graceful shutdown handling
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      this.logger.info(`Received ${signal}, initiating graceful shutdown...`);
      
      try {
        // Stop accepting new requests
        if (this.server) {
          this.server.close();
        }
        
        // Shutdown services
        await this.serviceManager.shutdown();
        
        this.logger.info('✅ Graceful shutdown completed');
        process.exit(0);
        
      } catch (error) {
        this.logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception:', error);
      gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  /**
   * Get application status
   */
  getStatus() {
    return {
      isRunning: !!this.server,
      isShuttingDown: this.isShuttingDown,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: this.serviceManager.getStatus(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get the Express app instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Get the server instance
   */
  getServer() {
    return this.server;
  }
}

module.exports = Application;