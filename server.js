#!/usr/bin/env node

/**
 * GPTPortal - Refactored Server Entry Point
 * Clean, modular, and maintainable server implementation
 * 
 * @author GPTPortal Team
 * @version 2.0.0
 */

const Application = require('./src/server/core/Application');
const Logger = require('./src/server/utils/Logger');

// Create logger for main process
const logger = new Logger('Server');

/**
 * Main server startup function
 */
async function main() {
  try {
    logger.info('🚀 Starting GPTPortal Server...');
    logger.info(`Node.js version: ${process.version}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Create and initialize application
    const app = new Application();
    
    // Handle application events
    app.on('initialized', () => {
      logger.info('✅ Application initialized successfully');
    });

    app.on('started', () => {
      logger.info('✅ Server started successfully');
      logger.info('📝 Access the application at the configured URL');
    });

    app.on('error', (error) => {
      logger.error('Application error:', error);
    });

    // Start the server
    await app.start();

    // Periodic health logging
    setInterval(() => {
      const status = app.getStatus();
      logger.debug('Server health check', {
        uptime: `${Math.floor(status.uptime / 60)}m`,
        memory: `${Math.round(status.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        services: Object.keys(status.services).length
      });
    }, 5 * 60 * 1000); // Every 5 minutes

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
if (require.main === module) {
  main();
}

module.exports = { main };