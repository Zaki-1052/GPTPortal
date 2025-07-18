/**
 * Route Manager - Centralized route registration and management
 */

const express = require('express');
const path = require('path');
const { createSetupRoutes } = require('../routes/setup');
const { createConfigRoutes } = require('../routes/config');
const { router: chatRouter, initializeChatRoutes } = require('../routes/chat');
const geminiRouter = require('../routes/gemini');
const { router: assistantRouter, initializeAssistantRoutes } = require('../routes/assistant');
const modelRoutes = require('../routes/models');
const ValidationUtils = require('../utils/ValidationUtils');
const ErrorHandler = require('./ErrorHandler');
const Logger = require('../utils/Logger');

class RouteManager {
  constructor(serviceManager) {
    this.serviceManager = serviceManager;
    this.logger = new Logger('RouteManager');
    this.routes = new Map();
  }

  /**
   * Setup all application routes
   */
  setup(app) {
    this.logger.info('Setting up routes...');

    // Initialize route dependencies
    this.initializeRouteDependencies();

    // Core application routes
    this.setupCoreRoutes(app);

    // API routes
    this.setupAPIRoutes(app);

    // Chat and AI routes
    this.setupAIRoutes(app);

    // File and media routes
    this.setupFileRoutes(app);

    // Administrative routes
    this.setupAdminRoutes(app);

    this.logger.info(`✅ ${this.routes.size} route groups registered`);
  }

  /**
   * Initialize route dependencies
   */
  initializeRouteDependencies() {
    const providerFactory = this.serviceManager.getProviderFactory();
    
    // Initialize chat routes with provider factory
    initializeChatRoutes(providerFactory);
    
    // Initialize assistant routes with provider factory
    initializeAssistantRoutes(providerFactory);
  }

  /**
   * Setup core application routes (auth, config, setup)
   */
  setupCoreRoutes(app) {
    const config = this.serviceManager.config;

    // Setup and configuration routes
    app.use('/', createSetupRoutes(config));
    this.routes.set('setup', 'Setup and environment configuration');

    app.use('/', createConfigRoutes(config));
    this.routes.set('config', 'Application configuration');

    // Default redirect route
    app.get('*', (req, res, next) => {
      if (req.path === '/portal' || req.path === '/config' || req.path === '/model') {
        next();
      } else if (req.path === '/') {
        res.redirect('/portal');
      } else {
        next();
      }
    });

    // Portal route
    app.get('/portal', (req, res) => {
      res.sendFile('portal.html', { root: 'public' });
    });
    this.routes.set('portal', 'Main application interface');
  }

  /**
   * Setup API routes
   */
  setupAPIRoutes(app) {
    // Model management API
    app.use('/api', modelRoutes);
    this.routes.set('models-api', 'Model management and information API');

    // Health check endpoints
    this.setupHealthRoutes(app);
    this.routes.set('health', 'Health check and status endpoints');

    // System information endpoints
    this.setupSystemRoutes(app);
    this.routes.set('system', 'System information and diagnostics');

    // Context window API
    this.setupContextWindowRoutes(app);
    this.routes.set('context-window', 'Context window information API');
  }

  /**
   * Setup AI and chat routes
   */
  setupAIRoutes(app) {
    // Main chat routes
    app.use('/', chatRouter);
    this.routes.set('chat', 'Main chat interface for all AI providers');

    // Gemini-specific routes
    app.use('/', geminiRouter);
    this.routes.set('gemini', 'Google Gemini specific endpoints');

    // Assistant routes
    app.use('/', assistantRouter);
    this.routes.set('assistants', 'OpenAI Assistants API endpoints');

    // Enhanced AI service routes
    this.setupAIServiceRoutes(app);
  }

  /**
   * Setup AI service routes (transcription, TTS, image generation)
   */
  setupAIServiceRoutes(app) {
    const providerFactory = this.serviceManager.getProviderFactory();
    const uploadMiddleware = app.locals.uploadMiddleware;

    // Enhanced transcription route
    app.post('/transcribe', uploadMiddleware, ErrorHandler.asyncHandler(async (req, res) => {
      if (!req.file) {
        throw ErrorHandler.validationError('No audio file provided');
      }

      const { preferGroq = false, preferredModel = 'gpt-4o-transcribe' } = req.body;
      
      const options = {
        preferGroq: preferGroq && providerFactory.isProviderAvailable('groq'),
        preferredModel,
        usePrompting: true
      };
      
      const result = await providerFactory.transcribeAudio(
        req.file.path, 
        req.file.filename, 
        options
      );
      
      // Cleanup temp file
      require('fs').unlinkSync(req.file.path);
      
      res.json({
        success: true,
        text: result.text,
        model: result.model,
        duration: result.duration,
        usedFallback: result.usedFallback || false,
        fallbackReason: result.fallbackReason || null
      });
    }));

    // Enhanced text-to-speech route
    app.post('/tts', ErrorHandler.asyncHandler(async (req, res) => {
      const { text, voice = 'coral', format = 'mp3', instructions = null } = req.body;
      
      const validation = ValidationUtils.validateMessagePayload({ message: text, modelID: 'tts' });
      if (!validation.isValid) {
        throw ErrorHandler.validationError('Invalid TTS request', validation.errors);
      }

      const options = {
        preferredModel: 'gpt-4o-mini-tts',
        voice,
        responseFormat: format,
        instructions,
        useIntelligentInstructions: true
      };
      
      const result = await providerFactory.textToSpeech(text, options);
      
      // Set response headers
      res.set('Content-Type', result.contentType);
      res.set('X-TTS-Model', result.model);
      res.set('X-TTS-Voice', result.voice);
      
      if (result.usedFallback) {
        res.set('X-TTS-Fallback', 'true');
        res.set('X-TTS-Fallback-Reason', result.fallbackReason);
      }
      
      res.send(result.audioData);
    }));

    // Enhanced image generation route
    app.post('/generate-image', ErrorHandler.asyncHandler(async (req, res) => {
      const { prompt, modelID, options = {} } = req.body;
      
      if (!prompt) {
        throw ErrorHandler.validationError('Prompt is required for image generation');
      }

      // Detect if Generate: prefix was used to skip enhancement
      const isGenerateCommand = prompt.startsWith("Generate:");
      const actualPrompt = isGenerateCommand ? prompt.substring("Generate:".length).trim() : prompt;
      
      // Update options based on command type
      const updatedOptions = {
        ...options,
        enhancePrompt: !isGenerateCommand, // Skip enhancement for Generate: prefix
        modelID: modelID || options.preferredModel || 'gpt-image-1'
      };

      const result = await providerFactory.generateImage(actualPrompt, updatedOptions);
      
      if (result.imageData) {
        // Save image to uploads directory
        const fs = require('fs');
        const uploadsDir = path.join(__dirname, '../../../public/uploads');
        const timestamp = Date.now();
        const imagePath = path.join(uploadsDir, `generated-${timestamp}.png`);
        
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const imageBuffer = Buffer.from(result.imageData, 'base64');
        fs.writeFileSync(imagePath, imageBuffer);
        
        res.json({
          success: true,
          imageUrl: `/uploads/generated-${timestamp}.png`,
          model: result.model,
          enhancedPrompt: result.enhancedPrompt,
          revisedPrompt: result.revisedPrompt,
          usedFallback: result.usedFallback || false,
          fallbackReason: result.fallbackReason || null
        });
      } else {
        throw ErrorHandler.createError('Image generation failed', 'IMAGE_GENERATION_ERROR', 500);
      }
    }));

    this.routes.set('ai-services', 'AI services (transcription, TTS, image generation)');
  }

  /**
   * Setup file and media routes
   */
  setupFileRoutes(app) {
    const uploadMiddleware = app.locals.uploadMiddleware;

    // File upload route with enhanced validation
    app.post('/upload-file', uploadMiddleware, ErrorHandler.asyncHandler(async (req, res) => {
      const files = req.files || (req.file ? [req.file] : []);
      
      if (files.length === 0) {
        throw ErrorHandler.fileUploadError('No file provided');
      }

      // Validate all files
      for (const file of files) {
        const validation = ValidationUtils.validateFileUpload(file);
        if (!validation.isValid) {
          throw ErrorHandler.fileUploadError('File validation failed', validation.errors);
        }
      }

      const fileId = files[0].filename;
      const isAssistants = req.body.isAssistants === 'true' || req.body.isAssistants === true;

      // Handle Assistants API file uploads
      if (isAssistants && this.serviceManager.isProviderAvailable('openai')) {
        const openaiHandler = this.serviceManager.getProviderFactory().getHandler('openai');
        
        if (!openaiHandler.assistant) {
          const systemMessage = 'You are a helpful and intelligent AI assistant.';
          const modelID = req.body.modelID || 'gpt-4o';
          await openaiHandler.initializeAssistantAndThread(modelID, systemMessage);
        }

        const assistantFiles = [];
        for (const file of files) {
          try {
            const assistantFile = await openaiHandler.attachFileToAssistant(file.path, file.filename);
            assistantFiles.push(assistantFile);
            
            // Clean up temp file
            require('fs').unlinkSync(file.path);
          } catch (error) {
            this.logger.error('Error attaching file to assistant:', error);
            require('fs').unlinkSync(file.path);
          }
        }

        return res.json({
          success: true,
          fileId,
          initialize: false,
          assistantFiles
        });
      }

      // Regular file processing
      const processedFiles = await this.processUploadedFiles(files);
      
      res.json({
        success: true,
        fileId,
        files: processedFiles
      });
    }));

    // Image upload route
    app.post('/upload-image', uploadMiddleware, ErrorHandler.asyncHandler(async (req, res) => {
      if (!req.file) {
        throw ErrorHandler.fileUploadError('No image file provided');
      }

      const validation = ValidationUtils.validateFileUpload(req.file);
      if (!validation.isValid) {
        throw ErrorHandler.fileUploadError('Image validation failed', validation.errors);
      }

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      // Store in app locals for chat processing
      req.app.locals.currentImageName = req.file.filename;
      req.app.locals.currentImagePath = req.file.path;
      
      res.json({
        success: true,
        imageUrl
      });
    }));

    this.routes.set('file-upload', 'File and image upload endpoints');
  }

  /**
   * Setup administrative routes
   */
  setupAdminRoutes(app) {
    // Chat history management
    app.get('/listChats', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs');
      const folderPath = path.join(__dirname, '../../../public/uploads/chats');
      
      try {
        const files = await fs.promises.readdir(folderPath);
        const sortedFiles = files.sort((a, b) => {
          const statA = fs.statSync(path.join(folderPath, a));
          const statB = fs.statSync(path.join(folderPath, b));
          return statB.mtime - statA.mtime;
        });
        
        res.json({ success: true, files: sortedFiles });
      } catch (error) {
        // If directory doesn't exist, return empty array
        res.json({ success: true, files: [] });
      }
    }));

    // Prompt templates management
    app.get('/listPrompts', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs');
      const folderPath = path.join(__dirname, '../../../public/uploads/prompts');
      
      try {
        const files = await fs.promises.readdir(folderPath);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        const sortedFiles = mdFiles.sort((a, b) => {
          const statA = fs.statSync(path.join(folderPath, a));
          const statB = fs.statSync(path.join(folderPath, b));
          return statB.mtime - statA.mtime;
        });
        
        // Parse prompt info for tooltips
        const promptInfo = {};
        for (const file of mdFiles) {
          try {
            const content = await fs.promises.readFile(path.join(folderPath, file), 'utf8');
            const fileNameWithoutExt = file.replace('.md', '');
            const nameMatch = content.match(/## \*\*(.*?)\*\*/);
            const descriptionMatch = content.match(/### Description\s*\n\s*\*(.*?)\*/s);
            
            promptInfo[fileNameWithoutExt] = {
              name: nameMatch ? nameMatch[1].trim() : fileNameWithoutExt,
              description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available'
            };
          } catch (error) {
            // If can't parse, use filename as fallback
            const fileNameWithoutExt = file.replace('.md', '');
            promptInfo[fileNameWithoutExt] = {
              name: fileNameWithoutExt,
              description: 'No description available'
            };
          }
        }
        
        res.json({ success: true, files: sortedFiles, promptInfo });
      } catch (error) {
        // If directory doesn't exist, return empty array
        res.json({ success: true, files: [], promptInfo: {} });
      }
    }));

    // Set prompt route
    app.post('/setPrompt', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs');
      const { chosenPrompt } = req.body;
      
      if (!chosenPrompt) {
        throw ErrorHandler.validationError('Prompt name is required');
      }
      
      const promptFile = path.join(__dirname, '../../../public/uploads/prompts', `${chosenPrompt}.md`);
      
      try {
        const content = await fs.promises.readFile(promptFile, 'utf8');
        const nameMatch = content.match(/## \*\*(.*?)\*\*/);
        const descriptionMatch = content.match(/### Description\s*\n\s*\*(.*?)\*/s);
        const bodyMatch = content.match(/#### Instructions\s*\n(.*?)\n##### Conversation starters/s);
        
        const prompt = {
          name: nameMatch ? nameMatch[1].trim() : 'No name found',
          description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available',
          body: bodyMatch ? bodyMatch[1].trim() : content // fallback to full content if parsing fails
        };
        
        res.json({ success: true, prompt });
      } catch (error) {
        throw ErrorHandler.notFoundError('Prompt file not found');
      }
    }));

    // Chat summary retrieval
    app.get('/getSummary/:chatName', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs');
      const { chatName } = req.params;
      const conversationFile = await fs.promises.readFile(
        path.join(__dirname, '../../../public/uploads/chats', `${chatName}.txt`), 
        'utf8'
      );
      
      const regex = /Conversation Summary: (.+)/s;
      const match = conversationFile.match(regex);
      
      if (match && match[1]) {
        const summary = match[1].split('\n\n')[0];
        res.json({ success: true, summary });
      } else {
        throw ErrorHandler.notFoundError('Summary not found');
      }
    }));

    // Export functionality
    app.get('/export-chat-html', ErrorHandler.asyncHandler(async (req, res) => {
      console.log("Export request received for type:", req.query.type);
      const type = req.query.type || 'conversation';
      const exportService = this.serviceManager.getService('exportService');
      const providerFactory = this.serviceManager.getProviderFactory();
      
      const exportData = {
        conversationHistory: req.app.locals.conversationHistory || [],
        claudeHistory: req.app.locals.claudeHistory || [],
        o1History: req.app.locals.o1History || [],
        deepseekHistory: req.app.locals.deepseekHistory || [],
        geminiHistory: req.app.locals.geminiHistory || '',
        claudeInstructions: req.app.locals.claudeInstructions || '',
        systemMessage: req.app.locals.systemMessage || '',
        modelID: req.app.locals.currentModelID || 'gpt-4o'
      };
      
      const result = await exportService.exportChat(type, exportData, providerFactory);
      
      res.type('html');
      res.attachment(`${result.title}.html`);
      res.send(result.htmlContent);

      console.log("Chat history sent to client, initiating shutdown...");
      
      // Check if already shutting down
      if (req.app.locals.isShuttingDown) {
        return;
      }
      
      req.app.locals.isShuttingDown = true;
      
      // Delay before shutting down the server to allow file download
      setTimeout(() => {
        console.log("Sending SIGTERM to self...");
        
        const server = req.app.locals.serverInstance || req.app.get('server');
        
        if (server) {
          process.kill(process.pid, 'SIGINT'); // Send SIGINT to self first
          server.close(() => {
            console.log('Server successfully shut down.');
            process.exit(99);
          });
        } else {
          console.log('Server instance not found, forcing exit...');
          process.exit(99);
        }
      }, 100); // Short delay for download to complete
    }));


    // Instructions management routes
    app.get('/get-instructions', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs').promises;
      try {
        const data = await fs.readFile('./public/instructions.md', 'utf8');
        res.send(data);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error reading the file');
      }
    }));

    app.post('/update-instructions', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs').promises;
      const newContent = req.body.content;
      try {
        await fs.writeFile('./public/instructions.md', newContent, 'utf8');
        res.send({ message: 'File updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error saving the file' });
      }
    }));

    // Environment management routes
    app.get('/get-my-env', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs').promises;
      try {
        const data = await fs.readFile('.env', 'utf8');
        res.send(data);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error reading the file');
      }
    }));

    app.post('/update-my-env', ErrorHandler.asyncHandler(async (req, res) => {
      const fs = require('fs').promises;
      const newContent = req.body.content;
      try {
        await fs.writeFile('.env', newContent, 'utf8');
        res.send({ message: 'File updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error saving the file' });
      }
    }));

    // Upload status checking route
    app.get('/upload-status/:sessionId', ErrorHandler.asyncHandler(async (req, res) => {
      const { sessionId } = req.params;
      const files = req.app.locals.uploadedFiles?.get(sessionId);
      
      if (!files) {
        return res.status(404).json({ error: 'Upload session not found' });
      }
      
      res.json({ 
        sessionId,
        files: files.map(file => ({
          originalName: file.originalName,
          fileName: file.fileName,
          mimeType: file.mimeType,
          size: file.size,
          pageCount: file.pageCount
        }))
      });
    }));

    // Standalone shutdown server route
    app.post('/shutdown-server', ErrorHandler.asyncHandler(async (req, res) => {
      if (req.app.locals.isShuttingDown) {
        return res.status(503).send('Server is already shutting down');
      }

      req.app.locals.isShuttingDown = true;
      res.send('Server shutdown initiated');

      setTimeout(() => {
        console.log("Sending SIGTERM to self...");
        
        const server = req.app.locals.serverInstance || req.app.get('server');
        
        if (server) {
          process.kill(process.pid, 'SIGINT'); // Send SIGINT to self first
          server.close(() => {
            console.log('Server successfully shut down.');
            process.exit(99);
          });
        } else {
          console.log('Server instance not found, forcing exit...');
          process.exit(99);
        }
      }, 1000); // 1-second delay for the response to be sent
    }));

    this.routes.set('admin', 'Administrative endpoints (chat management, export, shutdown, instructions, environment)');
  }

  /**
   * Setup health check routes
   */
  setupHealthRoutes(app) {
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: require('../../../package.json').version || '1.0.0'
      });
    });

    app.get('/health/detailed', ErrorHandler.asyncHandler(async (req, res) => {
      const serviceHealth = await this.serviceManager.healthCheck();
      res.json(serviceHealth);
    }));
  }

  /**
   * Setup system information routes
   */
  setupSystemRoutes(app) {
    app.get('/api/system/status', (req, res) => {
      const status = {
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version
        },
        services: this.serviceManager.getStatus(),
        routes: Array.from(this.routes.entries()).map(([name, description]) => ({
          name,
          description
        }))
      };
      
      res.json({ success: true, data: status });
    });
  }

  /**
   * Setup context window routes
   */
  setupContextWindowRoutes(app) {
    const contextWindowService = require('../services/contextWindowService');

    // Get context window for specific model
    app.get('/api/models/:modelId/context-window', ErrorHandler.asyncHandler(async (req, res) => {
      const { modelId } = req.params;
      
      if (!modelId) {
        throw ErrorHandler.validationError('Model ID is required');
      }

      const contextWindow = await contextWindowService.getContextWindow(modelId);
      const usage = req.query.tokens ? 
        await contextWindowService.calculateContextUsage(parseInt(req.query.tokens), modelId) : 
        null;

      res.json({
        success: true,
        modelId,
        contextWindow,
        usage
      });
    }));

    // Get context windows for multiple models
    app.post('/api/models/context-windows', ErrorHandler.asyncHandler(async (req, res) => {
      const { modelIds } = req.body;
      
      if (!Array.isArray(modelIds)) {
        throw ErrorHandler.validationError('modelIds must be an array');
      }

      const contextWindows = await contextWindowService.getContextWindows(modelIds);

      res.json({
        success: true,
        contextWindows
      });
    }));

    // Calculate context usage
    app.post('/api/context-usage', ErrorHandler.asyncHandler(async (req, res) => {
      const { modelId, tokens } = req.body;
      
      if (!modelId || typeof tokens !== 'number') {
        throw ErrorHandler.validationError('modelId and tokens are required');
      }

      const usage = await contextWindowService.calculateContextUsage(tokens, modelId);

      res.json({
        success: true,
        usage
      });
    }));
  }

  /**
   * Process uploaded files
   */
  async processUploadedFiles(files) {
    const fs = require('fs');
    const processedFiles = [];

    for (const file of files) {
      let contents;
      
      if (file.mimetype === 'application/pdf') {
        contents = await fs.promises.readFile(file.path, { encoding: 'base64' });
      } else if (file.mimetype.startsWith('image/')) {
        // For images, just store the path
        contents = file.path;
      } else {
        contents = await fs.promises.readFile(file.path, 'utf8');
      }

      processedFiles.push({
        id: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        contents,
        type: file.mimetype === 'application/pdf' ? 'pdf' : 
              file.mimetype.startsWith('image/') ? 'image' : 'text'
      });
    }

    return processedFiles;
  }

  /**
   * Get registered routes information
   */
  getRoutesInfo() {
    return Array.from(this.routes.entries()).map(([name, description]) => ({
      name,
      description
    }));
  }
}

module.exports = RouteManager;