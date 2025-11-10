/**
 * Input validation and sanitization utilities
 */

const Logger = require('./Logger');

class ValidationUtils {
  constructor() {
    this.logger = new Logger('ValidationUtils');
  }

  /**
   * Validate message payload
   */
  validateMessagePayload(payload) {
    const errors = [];

    // Required fields
    if (!payload.message || typeof payload.message !== 'string') {
      errors.push('Message is required and must be a string');
    }

    if (!payload.modelID || typeof payload.modelID !== 'string') {
      errors.push('ModelID is required and must be a string');
    }

    // Optional fields validation
    if (payload.temperature !== undefined) {
      const temp = parseFloat(payload.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        errors.push('Temperature must be a number between 0 and 2');
      }
    }

    if (payload.tokens !== undefined) {
      const tokens = parseInt(payload.tokens);
      if (isNaN(tokens) || tokens < 1 || tokens > 200000) {
        errors.push('Tokens must be a number between 1 and 200000');
      }
    }

    // Message length validation
    if (payload.message && payload.message.length > 100000) {
      errors.push('Message too long (max 100,000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate model ID format
   */
  validateModelID(modelID) {
    if (!modelID || typeof modelID !== 'string') {
      return { isValid: false, error: 'Model ID must be a non-empty string' };
    }

    // Check for dangerous characters
    if (/[<>\"'&]/.test(modelID)) {
      return { isValid: false, error: 'Model ID contains invalid characters' };
    }

    // Check reasonable length
    if (modelID.length > 100) {
      return { isValid: false, error: 'Model ID too long' };
    }

    return { isValid: true };
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove potential XSS vectors while preserving legitimate content
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file) {
    const errors = [];
    const maxSize = 32 * 1024 * 1024; // 32MB
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Size validation
    if (file.size > maxSize) {
      errors.push(`File too large (max ${maxSize / 1024 / 1024}MB)`);
    }

    // Type validation
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type not allowed: ${file.mimetype}`);
    }

    // Filename validation
    if (file.originalname && /[<>:"/\\|?*]/.test(file.originalname)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate API key format
   */
  validateAPIKey(provider, apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return { isValid: false, error: 'API key must be a non-empty string' };
    }

    const patterns = {
      openai: /^sk-[A-Za-z0-9]{48,}$/,
      claude: /^sk-ant-[A-Za-z0-9\-_]{95,}$/,
      google: /^[A-Za-z0-9\-_]{39}$/,
      mistral: /^[A-Za-z0-9]{32}$/,
      groq: /^gsk_[A-Za-z0-9]{52}$/
    };

    const pattern = patterns[provider];
    if (pattern && !pattern.test(apiKey)) {
      return { isValid: false, error: `Invalid ${provider} API key format` };
    }

    return { isValid: true };
  }

  /**
   * Rate limiting validation
   */
  validateRateLimit(identifier, windowMs = 60000, maxRequests = 100) {
    // This would integrate with a rate limiting store (Redis, memory, etc.)
    // For now, return true - implement based on your rate limiting strategy
    return { isValid: true, remaining: maxRequests };
  }

  /**
   * Validate environment configuration
   */
  validateEnvironmentConfig(config) {
    const warnings = [];
    const errors = [];

    // Check required environment variables
    if (!config.auth.username || !config.auth.password) {
      warnings.push('No authentication configured - server will redirect to setup');
    }

    // Check API keys
    const apiKeyCount = Object.values(config.apiKeys).filter(Boolean).length;
    if (apiKeyCount === 0) {
      errors.push('No AI provider API keys configured');
    }

    // Check server configuration
    if (config.port < 1 || config.port > 65535) {
      errors.push(`Invalid port number: ${config.port}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate token count request
   */
  validateTokenCountRequest(payload) {
    const errors = [];

    if (!payload.text || typeof payload.text !== 'string') {
      errors.push('Text is required and must be a string');
    }

    if (!payload.modelId || typeof payload.modelId !== 'string') {
      errors.push('ModelId is required and must be a string');
    }

    if (payload.text && payload.text.length > 1000000) {
      errors.push('Text too long for token counting (max 1M characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize filename to prevent path traversal attacks
   * Removes directory traversal sequences and returns only the basename
   * @param {string} filename - The filename to sanitize
   * @param {string} allowedExtension - Optional: specific extension to enforce (e.g., '.md', '.txt')
   * @returns {Object} - { isValid: boolean, sanitized: string, error: string }
   */
  sanitizeFilename(filename, allowedExtension = null) {
    if (!filename || typeof filename !== 'string') {
      return { isValid: false, sanitized: '', error: 'Filename must be a non-empty string' };
    }

    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return { isValid: false, sanitized: '', error: 'Path traversal detected in filename' };
    }

    // Check for null bytes (common attack vector)
    if (filename.includes('\0')) {
      return { isValid: false, sanitized: '', error: 'Null byte detected in filename' };
    }

    // Check for dangerous characters
    if (/[<>:"|?*\x00-\x1F]/.test(filename)) {
      return { isValid: false, sanitized: '', error: 'Filename contains invalid characters' };
    }

    // Validate length
    if (filename.length > 255) {
      return { isValid: false, sanitized: '', error: 'Filename too long (max 255 characters)' };
    }

    // Extract just the basename to prevent any directory traversal
    const path = require('path');
    const basename = path.basename(filename);

    // Check if specific extension is required
    if (allowedExtension) {
      if (!basename.endsWith(allowedExtension)) {
        return {
          isValid: false,
          sanitized: '',
          error: `Filename must have ${allowedExtension} extension`
        };
      }
    }

    return { isValid: true, sanitized: basename, error: null };
  }

  /**
   * Validate and construct safe file path within allowed directory
   * @param {string} baseDir - The base directory (absolute path)
   * @param {string} filename - The filename to validate
   * @param {string} allowedExtension - Optional: specific extension to enforce
   * @returns {Object} - { isValid: boolean, safePath: string, error: string }
   */
  validateSafeFilePath(baseDir, filename, allowedExtension = null) {
    const path = require('path');
    const fs = require('fs');

    // First sanitize the filename
    const sanitized = this.sanitizeFilename(filename, allowedExtension);
    if (!sanitized.isValid) {
      return { isValid: false, safePath: '', error: sanitized.error };
    }

    // Construct the full path
    const fullPath = path.join(baseDir, sanitized.sanitized);

    // Resolve to absolute path to check for traversal
    const resolvedPath = path.resolve(fullPath);
    const resolvedBase = path.resolve(baseDir);

    // Ensure the resolved path is within the base directory
    if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
      return { isValid: false, safePath: '', error: 'Path traversal attempt detected' };
    }

    return { isValid: true, safePath: fullPath, error: null };
  }
}

module.exports = new ValidationUtils();