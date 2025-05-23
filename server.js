// GPTPortal - Complete Refactored Server
// Fully modular implementation with all provider handlers
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Internal modules
const { config, validateConfig } = require('./src/server/config/environment');
const { setupAuth } = require('./src/server/middleware/auth');
const { setupUpload } = require('./src/server/middleware/upload');
const { initializeAIProviders } = require('./src/server/services/aiProviders');
const { createSetupRoutes } = require('./src/server/routes/setup');
const { createConfigRoutes } = require('./src/server/routes/config');
const ProviderFactory = require('./src/server/services/providers/providerFactory');
const { router: chatRouter, initializeChatRoutes } = require('./src/server/routes/chat');
const geminiRouter = require('./src/server/routes/gemini');
const { router: assistantRouter, initializeAssistantRoutes } = require('./src/server/routes/assistant');

// Global state
let isShuttingDown = false;

// Initialize Express app
const app = express();

// Validate configuration
validateConfig();

// Basic middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.json());
app.use(express.static('public'));
app.use(cors({ origin: '*' }));
app.set('trust proxy', true);

// Initialize AI providers and provider factory
const aiProviders = initializeAIProviders(config.apiKeys);
const providerFactory = new ProviderFactory(config.apiKeys);

// Setup upload middleware
const { uploadMiddleware } = setupUpload(config);

// Setup authentication
setupAuth(app, config);

// Initialize chat routes with provider factory
initializeChatRoutes(providerFactory);

// Initialize assistant routes with provider factory
initializeAssistantRoutes(providerFactory);

// Mount route modules
app.use('/', createSetupRoutes(config));
app.use('/', createConfigRoutes(config));

// Mount dynamic model API routes
const modelRoutes = require('./src/server/routes/models');
app.use('/api', modelRoutes);

// Mount chat routes
app.use('/', chatRouter);

// Mount Gemini routes
app.use('/', geminiRouter);

// Mount Assistant routes
app.use('/', assistantRouter);

// Initialize Gemini handler in routes
if (providerFactory.isProviderAvailable('gemini')) {
  const geminiHandler = providerFactory.getHandler('gemini');
  // Gemini routes will use the handler from providerFactory
}

// File upload routes
app.use('/uploads', express.static('public/uploads'));

// Additional routes from original server that need to be extracted

// Transcription route
app.post('/transcribe', uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const uploadedFilePath = req.file.path;
    const filename = req.file.filename;
    
    // Use Groq if available, otherwise OpenAI
    const useGroq = process.env.QROQ_API_KEY && providerFactory.isProviderAvailable('groq');
    const result = await providerFactory.transcribeAudio(uploadedFilePath, filename, useGroq);
    
    // Cleanup temp file
    const fs = require('fs');
    fs.unlinkSync(uploadedFilePath);
    
    res.json({ text: result.text });
  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    res.status(500).json({ error: "Error transcribing audio", details: error.message });
  }
});

// Text-to-speech route
app.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await providerFactory.textToSpeech(text);
    
    res.set('Content-Type', result.contentType);
    res.send(result.audioData);
  } catch (error) {
    console.error('Error generating speech:', error.message);
    res.status(500).json({ error: "Error generating speech", details: error.message });
  }
});

// Image generation route
app.post('/generate-image', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const result = await providerFactory.generateImage(prompt);
    
    // Download and save the image locally
    const download = require('image-downloader');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'public/uploads');
    const imagePath = path.join(uploadsDir, `generated-${Date.now()}.jpg`);

    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await download.image({ url: result.imageUrl, dest: imagePath });
    res.json({ imageUrl: result.imageUrl });
  } catch (error) {
    console.error('Error generating image:', error.message);
    res.status(500).json({ error: "Error generating image", details: error.message });
  }
});

// File upload route
app.post('/upload-file', uploadMiddleware, async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  console.log("Files received in /upload-file:", files);

  if (files.length === 0) {
    return res.status(400).send({ error: 'No file provided.' });
  }

  const tempFilePath = files[0].path;
  const file_id = files[0].filename;
  const isAssistants = req.body.isAssistants === 'true' || req.body.isAssistants === true;

  try {
    const fs = require('fs');
    
    // Handle Assistants API file uploads
    if (isAssistants && providerFactory.isProviderAvailable('openai')) {
      const openaiHandler = providerFactory.getHandler('openai');
      
      // Initialize assistant if needed
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
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
            console.log("Temp file deleted");
          });
        } catch (error) {
          console.error("Error attaching file to assistant:", error);
          // Still clean up the file
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        }
      }

      return res.json({ 
        success: true, 
        fileId: file_id,
        initialize: false,
        assistantFiles: assistantFiles
      });
    }

    // Regular file upload handling
    let fileContents;
    
    if (files[0].mimetype === 'application/pdf') {
      console.log("PDF file detected");
      fileContents = await fs.promises.readFile(tempFilePath, { encoding: 'base64' });
    } else {
      console.log("Non-PDF file detected");
      fileContents = await fs.promises.readFile(tempFilePath, 'utf8');
    }

    // Store in global state (matching original behavior)
    req.app.locals.currentFileContents = fileContents;
    req.app.locals.currentFileId = file_id;

    if (files.length > 1) {
      const processedFiles = [];
      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          processedFiles.push({
            file_id: file.filename,
            contents: await fs.promises.readFile(file.path, { encoding: 'base64' }),
            type: 'pdf'
          });
        } else {
          processedFiles.push({
            file_id: file.filename,
            contents: await fs.promises.readFile(file.path, 'utf8'),
            type: 'text'
          });
        }
        
        if (file.path !== tempFilePath) {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        }
      }

      if (!req.app.locals.uploadedFiles) {
        req.app.locals.uploadedFiles = new Map();
      }
      const sessionId = Date.now().toString();
      req.app.locals.uploadedFiles.set(sessionId, processedFiles);

      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      return res.json({
        success: true,
        fileId: file_id,
        sessionId: sessionId,
        additionalFiles: processedFiles
      });
    }

    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({ 
      success: true, 
      fileId: file_id,
      initialize: false
    });

  } catch (error) {
    console.error('Failed to process uploaded files:', error);
    res.status(500).json({
      error: error.message || 'Failed to process uploaded files'
    });
  }
});

// Image upload route
app.post('/upload-image', uploadMiddleware, async (req, res) => {
  console.log("File received in /upload-image:", req.file);
  if (!req.file) {
    return res.status(400).send({ error: 'No image file provided.' });
  }

  const imageName = req.file.filename;
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  // Store in global state (matching original behavior)
  req.app.locals.currentImageName = imageName;
  req.app.locals.currentImagePath = req.file.path;

  res.send({ imageUrl: imageUrl });
});

// Chat history routes
app.get('/listChats', (req, res) => {
  const fs = require('fs');
  const folderPath = path.join(__dirname, 'public/uploads/chats');
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading chat files:', err);
      res.status(500).json({ message: 'Failed to list chat files', error: err.message });
      return;
    }
    const sortedFiles = files.sort((a, b) => fs.statSync(path.join(folderPath, b)).mtime - fs.statSync(path.join(folderPath, a)).mtime);
    res.status(200).json({ files: sortedFiles });
  });
});

app.get('/getSummary/:chatName', async (req, res) => {
  try {
    const fs = require('fs');
    const chatName = req.params.chatName;
    const conversationFile = await fs.promises.readFile(path.join(__dirname, 'public/uploads/chats', `${chatName}.txt`), 'utf8');
    const regex = /Conversation Summary: (.+)/s;
    const match = conversationFile.match(regex);
    if (match && match[1]) {
      const summary = match[1].split('\n\n')[0];
      res.status(200).json({ summary });
    } else {
      res.status(404).json({ message: 'Summary not found in the conversation file.' });
    }
  } catch (error) {
    console.error('Error in /getSummary endpoint:', error);
    res.status(500).json({ message: 'Failed to get summary', error: error.message });
  }
});

// Prompt management routes
app.get('/listPrompts', async (req, res) => {
  try {
    const fs = require('fs');
    const promptDir = path.join(__dirname, 'public', 'uploads', 'prompts');
    const files = fs.readdirSync(promptDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const promptInfo = {};
    for (const file of markdownFiles) {
      const content = fs.readFileSync(path.join(promptDir, file), 'utf8');
      const nameMatch = content.match(/## \*\*(.*?)\*\*/);
      const descriptionMatch = content.match(/### Description\s*\n\s*\*(.*?)\./s);
      
      promptInfo[file.replace('.md', '')] = {
        name: nameMatch ? nameMatch[1].trim() : file.replace('.md', ''),
        description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available'
      };
    }
    
    res.json({ files: markdownFiles, promptInfo });
  } catch (error) {
    console.error('Error reading prompt directory:', error);
    res.status(500).json({ error: 'Error reading prompt directory' });
  }
});

app.post('/setPrompt', async (req, res) => {
  const { chosenPrompt } = req.body;
  const promptFile = path.join(__dirname, 'public', 'uploads', 'prompts', `${chosenPrompt}.md`);
  
  try {
    const fs = require('fs');
    const data = fs.readFileSync(promptFile, 'utf8');
    // Parse prompt function would go here
    res.json({ prompt: data });
  } catch (error) {
    console.error('Error reading prompt file:', error);
    res.status(500).json({ error: 'Error reading prompt file' });
  }
});

// Instructions management routes
app.get('/get-instructions', (req, res) => {
  const fs = require('fs');
  fs.readFile('./public/instructions.md', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading the file');
    }
    res.send(data);
  });
});

app.post('/update-instructions', (req, res) => {
  const fs = require('fs');
  const newContent = req.body.content;
  fs.writeFile('./public/instructions.md', newContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error saving the file' });
    }
    res.send({ message: 'File updated successfully' });
  });
});

// Environment management routes
app.get('/get-my-env', (req, res) => {
  const fs = require('fs');
  fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading the file');
    }
    res.send(data);
  });
});

app.post('/update-my-env', (req, res) => {
  const fs = require('fs');
  const newContent = req.body.content;
  fs.writeFile('.env', newContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error saving the file' });
    }
    res.send({ message: 'File updated successfully' });
  });
});

// Export route using advanced export service
app.get('/export-chat-html', async (req, res) => {
  console.log("Export request received for type:", req.query.type);
  const type = req.query.type; // Expecting 'gemini' or 'conversation' as query parameter
  console.log("Export request received for type:", type);
  let htmlContent;
  let title = 'chat_export'; // Default title
  
  try {
    const exportService = require('./src/server/services/exportService');
    
    // Prepare export data based on type with actual conversation state
    let exportData = {};
    
    if (type === 'conversation') {
      // Use actual conversation state from app.locals or provide defaults
      exportData = {
        conversationHistory: app.locals.conversationHistory || [],
        claudeHistory: app.locals.claudeHistory || [],
        o1History: app.locals.o1History || [],
        deepseekHistory: app.locals.deepseekHistory || [],
        claudeInstructions: app.locals.claudeInstructions || '',
        modelID: app.locals.currentModelID || 'gpt-4o'
      };
      htmlContent = await exportService.exportChat('conversation', exportData, providerFactory);
    } else if (type === 'gemini') {
      exportData = {
        geminiHistory: app.locals.geminiHistory || '',
        modelID: app.locals.currentModelID || 'gemini-1.5-pro'
      };
      htmlContent = await exportService.exportChat('gemini', exportData, providerFactory);
    } else if (type === 'assistants') {
      exportData = {
        systemMessage: app.locals.systemMessage || '',
        modelID: app.locals.currentModelID || 'gpt-4o'
      };
      htmlContent = await exportService.exportChat('assistants', exportData, providerFactory);
    } else {
      // Default to conversation export
      exportData = {
        conversationHistory: app.locals.conversationHistory || [],
        claudeHistory: app.locals.claudeHistory || [],
        o1History: app.locals.o1History || [],
        deepseekHistory: app.locals.deepseekHistory || [],
        claudeInstructions: app.locals.claudeInstructions || '',
        modelID: app.locals.currentModelID || 'gpt-4o'
      };
      htmlContent = await exportService.exportChat('conversation', exportData, providerFactory);
    }
    
    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', `attachment; filename="${title}.html"`);
    // console.log(htmlContent);
    res.send(htmlContent);

    // No need to call res.end() after res.send(), as send() ends the response.
    console.log("Chat history sent to client, initiating shutdown...");
      
    // This part might need to be moved or adjusted depending on your shutdown logic
    if (isShuttingDown) {
      return res.status(503).send('Server is shutting down');
    }
    
    isShuttingDown = true; // Set the shutdown flag
    // Delay before shutting down the server to allow file download
    setTimeout(() => {
      console.log("Sending SIGTERM to self...");
      process.kill(process.pid, 'SIGINT'); // Send SIGTERM to self
      server.close(() => {
        console.log("Server successfully shut down.");
        process.exit(99);
      });
    }, 100); // 1-second delay
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// Server shutdown route
app.post('/shutdown-server', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send('Server is already shutting down');
  }

  isShuttingDown = true;
  res.send('Server shutdown initiated');

  setTimeout(() => {
    console.log("Sending SIGTERM to self...");
        process.kill(process.pid, 'SIGINT'); // Send SIGTERM to self
    server.close(() => {
      console.log('Server successfully shut down.');
      process.exit(99);
    });
  }, 1000); // 1-second delay for the response to be sent
});

// Initialize uploaded files map
app.locals.uploadedFiles = new Map();

// Cleanup old upload sessions periodically
setInterval(() => {
  const uploadedFiles = app.locals.uploadedFiles;
  if (!uploadedFiles) return;
  
  const now = Date.now();
  for (const [sessionId, files] of uploadedFiles.entries()) {
    if (now - parseInt(sessionId) > 30 * 60 * 1000) { // 30 minutes
      uploadedFiles.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Default routes
app.get('*', (req, res, next) => {
  if (req.path === '/portal' || req.path === '/config' || req.path === '/model') {
    next();
  } else {
    res.redirect('/portal');
  }
});

app.get('/portal', (req, res) => {
  res.sendFile('portal.html', { root: 'public' });
});

app.use(cors({
  origin: '*'
}));

// Server startup
const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const PORT = isVercelEnvironment ? process.env.PORT : config.port;
const HOST = isVercelEnvironment ? '0.0.0.0' : config.host;

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 GPTPortal Complete Server running at http://${HOST}:${PORT}`);
  console.log('✅ All provider handlers loaded');
  console.log('✅ Chat routes integrated');
  console.log('✅ Gemini routes integrated');
  console.log('✅ Assistant routes integrated');
  console.log('✅ Advanced services loaded (token, cost, title, export)');
  console.log('✅ Dynamic model system active');
  console.log(`📊 Available providers: ${providerFactory.getAvailableProviders().join(', ')}`);
});

module.exports = { app, server, config, providerFactory };