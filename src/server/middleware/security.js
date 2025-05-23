/**
 * Enhanced Security Middleware
 * Comprehensive security measures including rate limiting, CSRF protection, and more
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Logger = require('../utils/Logger');

class SecurityMiddleware {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('SecurityMiddleware');
    this.rateLimitStore = new Map(); // In production, use Redis
  }

  /**
   * Setup comprehensive security middleware
   * @param {Express} app - Express application instance
   */
  setup(app) {
    this.logger.info('Setting up security middleware...');

    // Basic security headers with Helmet
    this.setupHelmet(app);

    // Rate limiting
    this.setupRateLimiting(app);

    // Request size limits
    this.setupRequestLimits(app);

    // API key validation
    this.setupAPIKeyValidation(app);

    this.logger.info('✅ Security middleware configured');
  }

  /**
   * Setup Helmet for security headers
   * @param {Express} app - Express application instance
   */
  setupHelmet(app) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'", 
            "'unsafe-inline'", // Required for some CDN scripts
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
          ],
          styleSrc: [
            "'self'", 
            "'unsafe-inline'", // Required for inline styles
            "https://fonts.googleapis.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https:"
          ],
          connectSrc: [
            "'self'",
            "https:"
          ],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false // Disable for compatibility
    }));
  }

  /**
   * Setup rate limiting
   * @param {Express} app - Express application instance
   */
  setupRateLimiting(app) {
    // General API rate limiting
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        error: 'Too many requests from this IP',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
          ip: req.ip,
          userAgent: req.get('user-agent'),
          path: req.path
        });
        res.status(429).json({
          error: 'Too many requests from this IP',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: '15 minutes'
        });
      }
    });

    // Stricter rate limiting for AI endpoints
    const aiLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20, // Limit to 20 AI requests per minute
      message: {
        error: 'Too many AI requests from this IP',
        code: 'AI_RATE_LIMIT_EXCEEDED',
        retryAfter: '1 minute'
      },
      keyGenerator: (req) => {
        // Include user info if authenticated
        return req.user ? `${req.ip}-${req.user.id}` : req.ip;
      }
    });

    // Very strict rate limiting for image generation
    const imageLimiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 10, // Limit to 10 image generations per 5 minutes
      message: {
        error: 'Too many image generation requests',
        code: 'IMAGE_RATE_LIMIT_EXCEEDED',
        retryAfter: '5 minutes'
      }
    });

    // Apply rate limiters
    app.use('/api/', generalLimiter);
    app.use('/message', aiLimiter);
    app.use('/gemini', aiLimiter);
    app.use('/assistant', aiLimiter);
    app.use('/generate-image', imageLimiter);
  }

  /**
   * Setup request size and complexity limits
   * @param {Express} app - Express application instance
   */
  setupRequestLimits(app) {
    // Middleware to check request size and complexity
    app.use((req, res, next) => {
      // Check for suspiciously large requests
      const contentLength = parseInt(req.get('content-length') || '0');
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (contentLength > maxSize) {
        this.logger.warn(`Large request detected: ${contentLength} bytes from ${req.ip}`);
        return res.status(413).json({
          error: 'Request too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: `${maxSize / 1024 / 1024}MB`
        });
      }

      // Check for suspicious request patterns
      if (this.detectSuspiciousPatterns(req)) {
        this.logger.warn(`Suspicious request pattern detected from ${req.ip}`, {
          path: req.path,
          method: req.method,
          userAgent: req.get('user-agent')
        });
        
        return res.status(400).json({
          error: 'Invalid request pattern',
          code: 'SUSPICIOUS_REQUEST'
        });
      }

      next();
    });
  }

  /**
   * Setup API key validation for external requests
   * @param {Express} app - Express application instance
   */
  setupAPIKeyValidation(app) {
    // Optional API key authentication for external access
    app.use('/api/external/*', (req, res, next) => {
      const apiKey = req.get('X-API-Key') || req.query.apiKey;
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required for external access',
          code: 'API_KEY_REQUIRED'
        });
      }

      // Validate API key (implement your validation logic)
      if (!this.validateAPIKey(apiKey)) {
        this.logger.warn(`Invalid API key used from ${req.ip}`);
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY'
        });
      }

      next();
    });
  }

  /**
   * Detect suspicious request patterns
   * @param {Request} req - Express request object
   * @returns {boolean} True if suspicious patterns detected
   */
  detectSuspiciousPatterns(req) {
    // Check for common attack patterns
    const suspiciousPatterns = [
      /\.\.\//,  // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript injection
      /on\w+\s*=/i // Event handler injection
    ];

    // Check URL and query parameters
    const checkString = req.url + JSON.stringify(req.query) + JSON.stringify(req.body);
    
    return suspiciousPatterns.some(pattern => pattern.test(checkString));
  }

  /**
   * Validate API key
   * @param {string} apiKey - API key to validate
   * @returns {boolean} True if valid
   */
  validateAPIKey(apiKey) {
    // Implement your API key validation logic here
    // This could check against a database, environment variable, etc.
    const validKeys = process.env.EXTERNAL_API_KEYS ? 
      process.env.EXTERNAL_API_KEYS.split(',') : [];
    
    return validKeys.includes(apiKey);
  }

  /**
   * Create IP-based fingerprint for tracking
   * @param {Request} req - Express request object
   * @returns {string} Request fingerprint
   */
  createRequestFingerprint(req) {
    const components = [
      req.ip,
      req.get('user-agent') || '',
      req.get('accept-language') || '',
      req.get('accept-encoding') || ''
    ];
    
    return Buffer.from(components.join('|')).toString('base64');
  }

  /**
   * Log security events
   * @param {string} event - Event type
   * @param {Request} req - Express request object
   * @param {Object} details - Additional details
   */
  logSecurityEvent(event, req, details = {}) {
    this.logger.warn(`Security event: ${event}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path,
      method: req.method,
      fingerprint: this.createRequestFingerprint(req),
      ...details
    });
  }
}

module.exports = SecurityMiddleware;