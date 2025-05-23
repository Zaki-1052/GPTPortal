/**
 * Centralized Error Handling System
 * Provides consistent error responses and logging
 */

const Logger = require('../utils/Logger');

class ErrorHandler {
  constructor() {
    this.logger = new Logger('ErrorHandler');
  }

  /**
   * Setup error handling middleware
   */
  setup(app) {
    // 404 handler
    app.use('*', (req, res, next) => {
      const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
      error.status = 404;
      error.code = 'ROUTE_NOT_FOUND';
      next(error);
    });

    // Global error handler
    app.use(this.globalErrorHandler.bind(this));
  }

  /**
   * Global error handling middleware
   */
  globalErrorHandler(error, req, res, next) {
    // Ensure error has a status code
    error.status = error.status || error.statusCode || 500;
    error.code = error.code || 'INTERNAL_SERVER_ERROR';

    // Log the error
    this.logError(error, req);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    const errorResponse = {
      success: false,
      error: {
        code: error.code,
        message: this.getErrorMessage(error, isDevelopment),
        status: error.status,
        timestamp: new Date().toISOString(),
        requestId: req.id || req.headers['x-request-id'] || 'unknown'
      }
    };

    // Add stack trace in development
    if (isDevelopment && error.stack) {
      errorResponse.error.stack = error.stack;
    }

    // Add additional context if available
    if (error.context) {
      errorResponse.error.context = error.context;
    }

    res.status(error.status).json(errorResponse);
  }

  /**
   * Get appropriate error message based on environment
   */
  getErrorMessage(error, isDevelopment) {
    // Known error types with safe messages
    const safeMessages = {
      'VALIDATION_ERROR': error.message,
      'AUTHENTICATION_ERROR': 'Authentication failed',
      'AUTHORIZATION_ERROR': 'Access denied',
      'RATE_LIMIT_EXCEEDED': 'Rate limit exceeded',
      'MODEL_NOT_FOUND': 'Requested model not available',
      'PROVIDER_ERROR': 'AI provider error',
      'FILE_UPLOAD_ERROR': 'File upload failed',
      'ROUTE_NOT_FOUND': 'Route not found'
    };

    if (safeMessages[error.code]) {
      return safeMessages[error.code];
    }

    // In development, show actual error message
    if (isDevelopment) {
      return error.message || 'An error occurred';
    }

    // In production, show generic message for unknown errors
    return 'An internal server error occurred';
  }

  /**
   * Log error with appropriate level and context
   */
  logError(error, req = null) {
    const logContext = {
      code: error.code,
      status: error.status,
      stack: error.stack
    };

    if (req) {
      logContext.request = {
        method: req.method,
        url: req.url,
        userAgent: req.get('user-agent'),
        ip: req.ip,
        headers: this.sanitizeHeaders(req.headers)
      };
    }

    // Log based on error severity
    if (error.status >= 500) {
      this.logger.error(error.message, error, logContext);
    } else if (error.status >= 400) {
      this.logger.warn(error.message, logContext);
    } else {
      this.logger.info(error.message, logContext);
    }
  }

  /**
   * Sanitize request headers for logging
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token'
    ];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Create standardized error objects
   */
  static createError(message, code, status = 500, context = null) {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    if (context) {
      error.context = context;
    }
    return error;
  }

  /**
   * Validation error factory
   */
  static validationError(message, details = null) {
    return this.createError(message, 'VALIDATION_ERROR', 400, details);
  }

  /**
   * Authentication error factory
   */
  static authenticationError(message = 'Authentication required') {
    return this.createError(message, 'AUTHENTICATION_ERROR', 401);
  }

  /**
   * Authorization error factory
   */
  static authorizationError(message = 'Access denied') {
    return this.createError(message, 'AUTHORIZATION_ERROR', 403);
  }

  /**
   * Not found error factory
   */
  static notFoundError(resource = 'Resource') {
    return this.createError(`${resource} not found`, 'NOT_FOUND', 404);
  }

  /**
   * Rate limit error factory
   */
  static rateLimitError(message = 'Rate limit exceeded') {
    return this.createError(message, 'RATE_LIMIT_EXCEEDED', 429);
  }

  /**
   * Provider error factory
   */
  static providerError(provider, originalError, context = null) {
    const message = `${provider} provider error: ${originalError.message}`;
    return this.createError(message, 'PROVIDER_ERROR', 502, {
      provider,
      originalError: originalError.message,
      ...context
    });
  }

  /**
   * Model error factory
   */
  static modelError(modelId, message = 'Model not available') {
    return this.createError(message, 'MODEL_ERROR', 400, { modelId });
  }

  /**
   * File upload error factory
   */
  static fileUploadError(message, details = null) {
    return this.createError(message, 'FILE_UPLOAD_ERROR', 400, details);
  }

  /**
   * Async error wrapper for route handlers
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;