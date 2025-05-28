/**
 * Middleware Manager - Centralized middleware configuration and setup
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { setupAuth } = require('../middleware/auth');
const { setupUpload } = require('../middleware/upload');
const ValidationUtils = require('../utils/ValidationUtils');
const Logger = require('../utils/Logger');

class MiddlewareManager {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('MiddlewareManager');
  }

  /**
   * Setup all middleware in correct order
   */
  setup(app) {
    this.logger.info('Setting up middleware...');

    // Basic Express configuration
    app.set('trust proxy', true);
    app.disable('x-powered-by'); // Security: hide Express

    // Request ID middleware
    this.setupRequestId(app);

    // Request logging middleware
    this.setupRequestLogging(app);

    // Security middleware
    this.setupSecurity(app);

    // Body parsing middleware
    this.setupBodyParsing(app);

    // CORS middleware
    this.setupCORS(app);

    // Static file serving
    this.setupStaticFiles(app);

    // Authentication middleware
    setupAuth(app, this.config);

    // File upload middleware
    const { uploadMiddleware } = setupUpload(this.config);
    app.locals.uploadMiddleware = uploadMiddleware;

    // Request validation middleware
    this.setupValidation(app);

    this.logger.info('✅ Middleware setup completed');
  }

  /**
   * Setup request ID middleware for tracing
   */
  setupRequestId(app) {
    app.use((req, res, next) => {
      req.id = req.headers['x-request-id'] || 
               `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      res.set('X-Request-ID', req.id);
      next();
    });
  }

  /**
   * Setup request logging middleware
   */
  setupRequestLogging(app) {
    app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Log request
      this.logger.logRequest(req, startTime);

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(...args) {
        const logger = new Logger('MiddlewareManager');
        logger.logResponse(req, res, startTime);
        originalEnd.apply(this, args);
      };

      next();
    });
  }

  /**
   * Setup security middleware
   */
  setupSecurity(app) {
    // Security headers
    app.use((req, res, next) => {
      // Prevent clickjacking
      res.set('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.set('X-Content-Type-Options', 'nosniff');
      
      // XSS protection
      res.set('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Content Security Policy (basic)
      res.set('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https: https://tiktoken.pages.dev;"
      );

      next();
    });

    // Rate limiting placeholder
    app.use((req, res, next) => {
      // TODO: Implement rate limiting
      // This would integrate with Redis or memory store
      next();
    });
  }

  /**
   * Setup body parsing middleware
   */
  setupBodyParsing(app) {
    // JSON parsing with size limits
    app.use(bodyParser.json({ 
      limit: '50mb',
      verify: (req, res, buf) => {
        // Store raw body for signature verification if needed
        req.rawBody = buf;
      }
    }));

    // URL-encoded parsing
    app.use(bodyParser.urlencoded({ 
      limit: '50mb', 
      extended: true, 
      parameterLimit: 50000 
    }));

    // Also use Express built-in parser as backup
    app.use(express.json());
  }

  /**
   * Setup CORS middleware
   */
  setupCORS(app) {
    const corsOptions = {
      origin: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        '*',
      credentials: true,
      optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    };

    app.use(cors(corsOptions));
  }

  /**
   * Setup static file serving
   */
  setupStaticFiles(app) {
    // Serve static files with caching
    app.use(express.static('public', {
      maxAge: '1d', // Cache for 1 day
      etag: true,
      lastModified: true
    }));

    // Upload files serving
    app.use('/uploads', express.static('public/uploads', {
      maxAge: '1h', // Cache uploads for 1 hour
      etag: true
    }));
  }

  /**
   * Setup request validation middleware
   */
  setupValidation(app) {
    // Add validation utilities to request object
    app.use((req, res, next) => {
      req.validate = ValidationUtils;
      next();
    });

    // Validate common request patterns
    app.use('/api/*', (req, res, next) => {
      // Add API-specific validation here
      next();
    });
  }

  /**
   * Setup health check middleware
   */
  setupHealthCheck(app) {
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    app.get('/health/detailed', async (req, res) => {
      // This would get detailed health from ServiceManager
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {} // TODO: Get from ServiceManager
      });
    });
  }

  /**
   * Setup graceful shutdown middleware
   */
  setupGracefulShutdown(app) {
    app.use((req, res, next) => {
      if (app.locals.isShuttingDown) {
        return res.status(503).json({
          error: 'Server is shutting down',
          code: 'SERVICE_UNAVAILABLE'
        });
      }
      next();
    });
  }
}

module.exports = MiddlewareManager;