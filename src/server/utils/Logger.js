/**
 * Enhanced Logger with structured logging and different log levels
 */

class Logger {
  constructor(component = 'GPTPortal') {
    this.component = component;
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
  }

  /**
   * Check if message should be logged based on level
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message with timestamp and component
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    const componentPadded = this.component.padEnd(15);
    
    let formattedMessage = `${timestamp} [${levelUpper}] [${componentPadded}] ${message}`;
    
    if (Object.keys(meta).length > 0) {
      formattedMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return formattedMessage;
  }

  /**
   * Log error messages
   */
  error(message, error = null, meta = {}) {
    if (!this.shouldLog('error')) return;
    
    const logMeta = { ...meta };
    if (error) {
      logMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    console.error(this.formatMessage('error', message, logMeta));
  }

  /**
   * Log warning messages
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, meta));
  }

  /**
   * Log info messages
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, meta));
  }

  /**
   * Log debug messages
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatMessage('debug', message, meta));
  }

  /**
   * Log trace messages
   */
  trace(message, meta = {}) {
    if (!this.shouldLog('trace')) return;
    console.log(this.formatMessage('trace', message, meta));
  }

  /**
   * Log request information
   */
  logRequest(req, startTime = Date.now()) {
    if (!this.shouldLog('info')) return;
    
    const duration = Date.now() - startTime;
    const meta = {
      method: req.method,
      url: req.url,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      duration: `${duration}ms`
    };
    
    this.info(`${req.method} ${req.url}`, meta);
  }

  /**
   * Log response information
   */
  logResponse(req, res, startTime = Date.now()) {
    if (!this.shouldLog('info')) return;
    
    const duration = Date.now() - startTime;
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0
    };
    
    this.info(`Response ${res.statusCode}`, meta);
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation, duration, meta = {}) {
    if (!this.shouldLog('debug')) return;
    
    const perfMeta = {
      operation,
      duration: `${duration}ms`,
      ...meta
    };
    
    this.debug('Performance metric', perfMeta);
  }

  /**
   * Create a child logger with additional context
   */
  child(childComponent) {
    const childLogger = new Logger(`${this.component}:${childComponent}`);
    childLogger.logLevel = this.logLevel;
    return childLogger;
  }
}

module.exports = Logger;