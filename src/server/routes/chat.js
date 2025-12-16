// Enhanced Chat Routes - Complete implementation using provider handlers
const express = require('express');
const fs = require('fs');
const path = require('path');
const ProviderFactory = require('../services/providers/providerFactory');
const { enforceTokenLimits } = require('../services/modelService');
const tokenService = require('../services/tokenService');
const costService = require('../services/costService');
const titleService = require('../services/titleService');
const exportService = require('../services/exportService');
const ValidationUtils = require('../utils/ValidationUtils');

const router = express.Router();

// Valid reasoning effort levels according to OpenAI API
const VALID_REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'];

// Initialize provider factory (will be set by main server)
let providerFactory = null;

// IMPORTANT: Chat state is now stored in req.session.chat instead of global variables
// This prevents multi-user interference and data leakage between sessions
// All chat state is initialized in MiddlewareManager.setupSession()

/**
 * Initialize the chat routes with provider factory
 */
function initializeChatRoutes(factory) {
  providerFactory = factory;
  console.log('✅ Chat routes initialized with provider factory');
}

/**
 * Function to read instructions from the file
 * @param {Object} session - Express session object containing chat state
 */
async function readInstructionsFile(session) {
  try {
    if (session.customPrompt) {
      // Validate and sanitize filename to prevent path traversal
      const baseDir = path.join(__dirname, '../../../public/uploads/prompts');
      const validation = ValidationUtils.validateSafeFilePath(baseDir, session.promptName, '.md');

      if (!validation.isValid) {
        console.error('Invalid prompt name:', validation.error);
        return '';
      }

      const content = await fs.promises.readFile(validation.safePath, 'utf8');
      const parsedContent = parsePromptMarkdown(content);
      return parsedContent.body;
    } else {
      const instructions = await fs.promises.readFile('./public/instructions.md', 'utf8');
      return instructions;
    }
  } catch (error) {
    console.error('Error reading instructions file:', error);
    return '';
  }
}

/**
 * Function to parse prompt markdown file
 */
function parsePromptMarkdown(content) {
  const nameMatch = content.match(/## \*\*(.*?)\*\*/);
  const descriptionMatch = content.match(/### Description\s*\n\s*\*(.*?)\*/s);
  const bodyMatch = content.match(/#### Instructions\s*\n(.*?)\n##### Conversation starters/s);
  
  return {
    name: nameMatch ? nameMatch[1].trim() : 'No name found',
    description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available',
    body: bodyMatch ? bodyMatch[1].trim() : 'No instructions available'
  };
}

/**
 * Initialize conversation history with instructions
 * @param {Object} session - Express session object containing chat state
 */
async function initializeConversationHistory(session) {
  const fileInstructions = await readInstructionsFile(session);
  let message = `You are a helpful and intelligent AI assistant, knowledgeable about a wide range of topics and highly capable of a great many tasks.\n Specifically:\n ${fileInstructions}`;

  if (session.continueConv) {
    console.log("continue conversation", session.continueConv);
    if (session.summariesOnly) {
      console.log("summaries only", session.summariesOnly);
      const contextAndSummary = await continueConversation(session.chosenChat);
      message += `\n---\n${contextAndSummary}`;
    } else {
      message = await continueConversation(session.chosenChat);
    }
  }

  session.conversationHistory.push({ role: "system", content: message });
  return message;
}

/**
 * Initialize Claude instructions
 * @param {Object} session - Express session object containing chat state
 */
async function initializeClaudeInstructions(session) {
  try {
    let claudeFile = await fs.promises.readFile('./public/claudeInstructions.xml', 'utf8');

    if (session.customPrompt) {
      // Validate and sanitize filename to prevent path traversal
      const baseDir = path.join(__dirname, '../../../public/uploads/prompts');
      const validation = ValidationUtils.validateSafeFilePath(baseDir, session.promptName, '.md');

      if (!validation.isValid) {
        console.error('Invalid prompt name:', validation.error);
        return claudeFile; // Return without custom prompt if invalid
      }

      const content = await fs.promises.readFile(validation.safePath, 'utf8');
      const parsedContent = parsePromptMarkdown(content);
      let customPromptText = parsedContent.body;
      claudeFile += "\n\n <prompt> \n\n" + customPromptText + "\n\n </prompt>";
    }

    session.claudeInstructions = claudeFile;
    if (session.continueConv) {
      if (session.summariesOnly) {
        const contextAndSummary = await continueConversation(session.chosenChat, session.summariesOnly);
        session.claudeInstructions += `\n---\n${contextAndSummary}`;
      } else {
        session.claudeInstructions += await continueConversation(session.chosenChat, session.summariesOnly);
      }
    }
    return session.claudeInstructions;
  } catch (error) {
    console.error('Error reading Claude instructions file:', error);
    return '';
  }
}

/**
 * Continue conversation by loading chat context
 * @param {string} chosenChat - Chat file name
 * @param {boolean} summariesOnly - Whether to load only summaries
 */
async function continueConversation(chosenChat, summariesOnly) {
  try {
    // Validate and sanitize filename to prevent path traversal
    const baseDir = path.join(__dirname, '../../../public/uploads/chats');
    const validation = ValidationUtils.validateSafeFilePath(baseDir, chosenChat, '.txt');

    if (!validation.isValid) {
      throw new Error(`Invalid chat name: ${validation.error}`);
    }

    const conversationFile = await fs.promises.readFile(
      validation.safePath,
      'utf8'
    );

    if (summariesOnly) {
      const regex = /\n\n-----\n\n(.+)/s;
      const match = conversationFile.match(regex);
      if (match && match[1]) {
        return match[1];
      } else {
        throw new Error('Context and summary not found in the conversation file.');
      }
    } else {
      return conversationFile;
    }
  } catch (error) {
    console.error('Error in continueConversation:', error);
    throw error;
  }
}

/**
 * Convert an image URL to base64
 */
async function imageURLToBase64(url) {
  try {
    console.log('imageURLToBase64 called with URL:', url);
    
    // Check if it's a local path starting with /uploads/
    if (url.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '../../..', 'public', url);
      console.log('Local path resolved to:', localPath);
      console.log('Path exists:', fs.existsSync(localPath));
      return imageToBase64(localPath);
    }
    
    // Handle external URLs
    console.log('Fetching external URL:', url);
    const axios = require('axios');
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'];
    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:${contentType};base64,${base64Image}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

/**
 * Convert an image file to base64
 */
function imageToBase64(filePath) {
  try {
    const image = fs.readFileSync(filePath);
    // Detect MIME type from file extension
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'image/jpeg'; // default
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.webp') mimeType = 'image/webp';
    
    return `data:${mimeType};base64,${image.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

/**
 * Export chat to HTML using the export service
 * @param {Object} session - Express session object containing chat state
 * @param {string} modelID - Model ID for export context
 */
async function exportChatToHTML(session, modelID = 'gpt-4.1') {
  const exportData = {
    conversationHistory: session.conversationHistory,
    claudeHistory: session.claudeHistory,
    o1History: session.o1History,
    deepseekHistory: session.deepseekHistory,
    claudeInstructions: session.claudeInstructions,
    modelID: modelID
  };

  return await exportService.exportChat('conversation', exportData, providerFactory);
}

/**
 * Main chat endpoint - handles all AI model conversations
 */
router.post('/message', async (req, res) => {
  console.log("Received model ID:", req.body.modelID);
  
  const user_message = req.body.message;
  const modelID = req.body.modelID || 'gpt-4o';
  const image_url = req.body.image;
  
  console.log("Received request with size:", JSON.stringify(req.body).length);

  // Handle temperature parameter
  let temperature = req.body.temperature || 1;
  if (process.env.TEMPERATURE) {
    const parsedTemp = parseFloat(process.env.TEMPERATURE);
    if (!isNaN(parsedTemp)) {
      temperature = parsedTemp;
    }
  }

  // Handle tokens parameter
  let tokens = req.body.tokens || 8000;
  if (process.env.MAX_TOKENS) {
    const parsedTokens = parseInt(process.env.MAX_TOKENS);
    if (!isNaN(parsedTokens)) {
      tokens = parsedTokens;
    }
  }
  tokens = await enforceTokenLimits(tokens, modelID);

  // Handle GPT-5 specific parameters
  let reasoningEffort = req.body.reasoningEffort || "medium"; // none, minimal, low, medium, high, xhigh
  let verbosity = req.body.verbosity || "medium"; // low, medium, high

  // Validate reasoning effort
  if (!VALID_REASONING_EFFORTS.includes(reasoningEffort)) {
    console.warn(`Invalid reasoning effort '${reasoningEffort}', defaulting to 'medium'`);
    reasoningEffort = 'medium';
  }

  // Override with environment variables if set
  if (process.env.REASONING_EFFORT) {
    reasoningEffort = process.env.REASONING_EFFORT;
  }
  if (process.env.VERBOSITY) {
    verbosity = process.env.VERBOSITY;
  }

  // Check for shutdown command
  if (user_message === "Bye!") {
    console.log("Shutdown message received. Exporting chat and closing server...");
    
    if (req.app.locals.isShuttingDown) {
      return res.status(503).send('Server is already shutting down');
    }
    
    req.app.locals.isShuttingDown = true;
    
    const htmlContent = await exportChatToHTML(req.session.chat, modelID);

    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'attachment; filename="chat_history.html"');
    res.send(htmlContent);
    
    // Gracefully shutdown server after sending response
    setTimeout(() => {
      console.log("Server shutting down gracefully...");
      
      // Get server instance from app locals if available
      const server = req.app.locals.serverInstance || req.app.get('server');
      
      if (server) {
        server.close(() => {
          console.log('Server successfully shut down.');
          process.exit(0);
        });
      } else {
        // Fallback if server instance not available
        console.log('Server instance not found, forcing exit...');
        process.exit(0);
      }
    }, 1000);
    
    return;
  }

  try {
    // Initialize system message if first request
    if (req.session.chat.epochs === 0) {
      if (modelID.startsWith('gpt') || modelID.includes('o1') || modelID.includes('o3')) {
        req.session.chat.systemMessage = await initializeConversationHistory(req.session.chat);
      } else if (modelID.startsWith('claude')) {
        const instructionsText = await initializeClaudeInstructions(req.session.chat);
        if (providerFactory.isProviderAvailable('claude')) {
          const claudeHandler = providerFactory.getHandler('claude');
          const sections = claudeHandler.parseInstructionsIntoSections(instructionsText);
          req.session.chat.systemMessage = claudeHandler.formatSectionsIntoSystemMessage(sections);
        }
      } else {
        req.session.chat.systemMessage = await initializeConversationHistory(req.session.chat);
      }
      req.session.chat.epochs++;
    }

    // Handle file contents from upload
    let uploadedFiles = null;
    if (req.body.sessionId && req.app.locals.uploadedFiles?.get(req.body.sessionId)) {
      uploadedFiles = req.app.locals.uploadedFiles.get(req.body.sessionId);
      // Clean up after processing
      req.app.locals.uploadedFiles.delete(req.body.sessionId);
    }
    
    // Handle single file upload (backward compatibility)
    if (req.app.locals.currentFileContents) {
      req.session.chat.fileContents = req.app.locals.currentFileContents;
      req.session.chat.file_id = req.app.locals.currentFileId;
      // Clear after use
      req.app.locals.currentFileContents = null;
      req.app.locals.currentFileId = null;
    }

    // Handle image from upload route first
    if (req.app.locals.currentImageName) {
      req.session.chat.imageName = req.app.locals.currentImageName;
      req.session.chat.uploadedImagePath = req.app.locals.currentImagePath;
      console.log('Found uploaded image:', req.session.chat.imageName, 'at path:', req.session.chat.uploadedImagePath);
      // Clear after use
      req.app.locals.currentImageName = null;
      req.app.locals.currentImagePath = null;
    }

    // Handle image processing
    let base64Image = null;
    if (req.body.image) {
      console.log('Processing image:', req.body.image);
      if (req.file) {
        console.log('Using req.file.path:', req.file.path);
        base64Image = imageToBase64(req.file.path);
      } else {
        console.log('Using imageURLToBase64 for:', req.body.image);
        base64Image = await imageURLToBase64(req.body.image);
      }
      console.log('base64Image result:', base64Image ? 'SUCCESS (length: ' + base64Image.length + ')' : 'FAILED');
    }
    
    // Also check if we have an uploaded image path but no base64Image yet
    if (!base64Image && req.session.chat.uploadedImagePath) {
      console.log('Converting uploaded image to base64:', req.session.chat.uploadedImagePath);
      base64Image = imageToBase64(req.session.chat.uploadedImagePath);
      console.log('base64Image from upload result:', base64Image ? 'SUCCESS (length: ' + base64Image.length + ')' : 'FAILED');
    }
    
    // Debug logging for image data
    console.log('=== Image Processing Debug ===');
    console.log('imageName:', req.session.chat.imageName);
    console.log('uploadedImagePath:', req.session.chat.uploadedImagePath);
    console.log('base64Image exists:', !!base64Image);
    console.log('base64Image length:', base64Image ? base64Image.length : 0);
    console.log('base64Image starts with:', base64Image ? base64Image.substring(0, 50) : 'N/A');
    console.log('============================')
    
    // Clean up uploaded image after processing
    if (req.session.chat.uploadedImagePath) {
      fs.unlink(req.session.chat.uploadedImagePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
        else console.log("Temp file deleted:", req.session.chat.uploadedImagePath);
      });
    }

    // Format user input using provider factory
    const user_input = providerFactory.formatUserInput(
      modelID,
      user_message,
      req.session.chat.fileContents,
      req.session.chat.file_id,
      req.session.chat.imageName,
      base64Image,
      uploadedFiles
    );

    // Prepare payload for provider
    const payload = {
      user_input,
      modelID,
      systemMessage: req.session.chat.systemMessage,
      conversationHistory: req.session.chat.conversationHistory,
      claudeHistory: req.session.chat.claudeHistory,
      o1History: req.session.chat.o1History,
      deepseekHistory: req.session.chat.deepseekHistory,
      temperature,
      tokens,
      reasoningEffort,
      verbosity
    };

    // Route to appropriate provider
    const result = await providerFactory.handleRequest(modelID, payload);

    if (result.success) {
      // Store conversation state in app.locals for export functionality
      req.app.locals.conversationHistory = req.session.chat.conversationHistory;
      req.app.locals.claudeHistory = req.session.chat.claudeHistory;
      req.app.locals.o1History = req.session.chat.o1History;
      req.app.locals.deepseekHistory = req.session.chat.deepseekHistory;
      req.app.locals.claudeInstructions = req.session.chat.claudeInstructions;
      req.app.locals.currentModelID = modelID;
      req.app.locals.systemMessage = req.session.chat.systemMessage;

      // Clean up file contents
      req.session.chat.fileContents = null;
      req.session.chat.file_id = "";
      req.session.chat.imageName = "";

      res.json({
        text: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({ 
        error: "Failed to process message",
        details: result.error 
      });
    }

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process message', 
      details: error.message 
    });
  }
});

/**
 * Reset conversation state
 */
router.post('/reset', (req, res) => {
  req.session.chat.conversationHistory = [];
  req.session.chat.claudeHistory = [];
  req.session.chat.o1History = [];
  req.session.chat.deepseekHistory = [];
  req.session.chat.geminiHistory = '';
  req.session.chat.epochs = 0;
  req.session.chat.fileContents = null;
  req.session.chat.file_id = "";
  req.session.chat.imageName = "";
  req.session.chat.customPrompt = false;
  req.session.chat.continueConv = false;

  // Reset provider factory state
  if (providerFactory && providerFactory.handlers.openai) {
    providerFactory.handlers.openai.resetState();
  }

  res.json({ success: true, message: 'Conversation state reset' });
});

/**
 * Set chat continuation
 */
router.post('/setChat', async (req, res) => {
  try {
    req.session.chat.chosenChat = req.body.chosenChat;
    req.session.chat.continueConv = true;

    const contextAndSummary = await continueConversation(req.session.chat.chosenChat);
    console.log('Context and Summary loaded');

    res.status(200).json({ message: 'Chat set successfully', chosenChat: req.session.chat.chosenChat });
  } catch (error) {
    console.error('Error in /setChat endpoint:', error);
    res.status(500).json({ message: 'Failed to set chat', error: error.message });
  }
});

/**
 * Set custom prompt
 */
router.post('/copyPrompt', async (req, res) => {
  try {
    const { chosenPrompt } = req.body;
    req.session.chat.customPrompt = true;
    req.session.chat.promptName = chosenPrompt;
    const instructions = await readInstructionsFile(req.session.chat);

    res.json({ success: true, instructions });
  } catch (error) {
    console.error('Error copying prompt:', error);
    res.status(500).json({ error: 'Error copying prompt' });
  }
});

/**
 * Set summaries only mode
 */
router.post('/setSummariesOnly', (req, res) => {
  try {
    req.session.chat.summariesOnly = req.body.summariesOnly;
    console.log('Summaries only mode:', req.session.chat.summariesOnly);
    res.status(200).json({ message: 'Summaries only setting updated successfully', summariesOnly: req.session.chat.summariesOnly });
  } catch (error) {
    console.error('Error in /setSummariesOnly endpoint:', error);
    res.status(500).json({ message: 'Failed to update summaries only setting', error: error.message });
  }
});

// Export both the router and initialization function
module.exports = {
  router,
  initializeChatRoutes
};