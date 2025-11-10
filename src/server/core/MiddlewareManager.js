/**
 * Middleware Manager - Centralized middleware configuration and setup
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
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

    // Session middleware (before auth to maintain state per user)
    this.setupSession(app);

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
      const logger = this.logger; // Reuse existing logger instance
      res.end = function(...args) {
        logger.logResponse(req, res, startTime);
        originalEnd.apply(this, args);
      };

      next();
    });
  }

  /**
   * Setup session middleware to maintain per-user state
   */
  setupSession(app) {
    const sessionSecret = process.env.SESSION_SECRET ||
      require('crypto').randomBytes(32).toString('hex');

    app.use(session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Initialize session storage for chat state
    app.use((req, res, next) => {
      if (!req.session.chat) {
        req.session.chat = {
          conversationHistory: [],
          claudeHistory: [],
          o1History: [],
          deepseekHistory: [],
          geminiHistory: '',
          systemMessage: '',
          claudeInstructions: '',
          epochs: 0,
          fileContents: null,
          file_id: "",
          imageName: "",
          uploadedImagePath: "",
          customPrompt: false,
          promptName: '',
          continueConv: false,
          chosenChat: '',
          summariesOnly: true
        };
      }
      next();
    });

    this.logger.info('✅ Session management configured');
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
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://esm.sh; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https: https://tiktoken.pages.dev https://esm.sh;"
      );

      next();
    });

    // Rate limiting implementation
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      // Skip rate limiting for health check endpoints
      skip: (req) => req.path === '/health' || req.path === '/health/detailed'
    });

    // Apply general rate limiter to all routes
    app.use(generalLimiter);

    // Stricter rate limiting for API endpoints
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.API_RATE_LIMIT_MAX) || 50, // Limit each IP to 50 requests per windowMs for API
      message: {
        error: 'Too many API requests from this IP, please try again later.',
        code: 'API_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

    // Apply stricter rate limiter to API routes
    app.use('/api/', apiLimiter);

    this.logger.info('✅ Rate limiting configured');
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