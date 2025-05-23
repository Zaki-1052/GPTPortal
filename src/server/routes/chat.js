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

const router = express.Router();

// Initialize provider factory (will be set by main server)
let providerFactory = null;

// Global state variables (preserving original behavior)
let conversationHistory = [];
let claudeHistory = [];
let o1History = [];
let deepseekHistory = [];
let geminiHistory = '';
let systemMessage = '';
let claudeInstructions = '';
let epochs = 0;
let fileContents = null;
let file_id = "";
let imageName = "";
let uploadedImagePath = "";
let isShuttingDown = false;
let customPrompt = false;
let promptName = '';
let continueConv = false;
let chosenChat = '';
let summariesOnly = true;

/**
 * Initialize the chat routes with provider factory
 */
function initializeChatRoutes(factory) {
  providerFactory = factory;
  console.log('✅ Chat routes initialized with provider factory');
}

/**
 * Function to read instructions from the file
 */
async function readInstructionsFile() {
  try {
    if (customPrompt) {
      const promptFile = path.join(__dirname, '../../../public/uploads/prompts', `${promptName}.md`);
      const content = fs.readFileSync(promptFile, 'utf8');
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
 */
async function initializeConversationHistory() {
  const fileInstructions = await readInstructionsFile();
  let message = `You are a helpful and intelligent AI assistant, knowledgeable about a wide range of topics and highly capable of a great many tasks.\n Specifically:\n ${fileInstructions}`;
  
  if (continueConv) {
    console.log("continue conversation", continueConv);
    if (summariesOnly) {
      console.log("summaries only", summariesOnly);
      const contextAndSummary = await continueConversation(chosenChat);
      message += `\n---\n${contextAndSummary}`;
    } else {
      message = await continueConversation(chosenChat);
    }
  }
  
  conversationHistory.push({ role: "system", content: message });
  return message;
}

/**
 * Initialize Claude instructions
 */
async function initializeClaudeInstructions() {
  try {
    let claudeFile = await fs.promises.readFile('./public/claudeInstructions.xml', 'utf8');
    
    if (customPrompt) {
      const promptFile = path.join(__dirname, '../../../public/uploads/prompts', `${promptName}.md`);
      const content = fs.readFileSync(promptFile, 'utf8');
      const parsedContent = parsePromptMarkdown(content);
      let customPromptText = parsedContent.body;
      claudeFile += "\n\n <prompt> \n\n" + customPromptText + "\n\n </prompt>";
    }
    
    claudeInstructions = claudeFile;
    if (continueConv) {
      if (summariesOnly) {
        const contextAndSummary = await continueConversation(chosenChat);
        claudeInstructions += `\n---\n${contextAndSummary}`;
      } else {
        claudeInstructions += await continueConversation(chosenChat);
      }
    }
    return claudeInstructions;
  } catch (error) {
    console.error('Error reading Claude instructions file:', error);
    return '';
  }
}

/**
 * Continue conversation by loading chat context
 */
async function continueConversation(chosenChat) {
  try {
    const conversationFile = await fs.promises.readFile(
      path.join(__dirname, '../../../public/uploads/chats', `${chosenChat}.txt`), 
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
  const image = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${image.toString('base64')}`;
}

/**
 * Export chat to HTML using the export service
 */
async function exportChatToHTML() {
  const exportData = {
    conversationHistory,
    claudeHistory,
    o1History,
    deepseekHistory,
    claudeInstructions,
    modelID: 'gpt-4o' // Default, should be passed from request context
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
  tokens = enforceTokenLimits(tokens, modelID);

  // Check for shutdown command
  if (user_message === "Bye!") {
    console.log("Shutdown message received. Exporting chat and closing server...");
    
    const htmlContent = await exportChatToHTML();
    
    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'attachment; filename="chat_history.html"');
    res.send(htmlContent);
    
    return;
  }

  try {
    // Initialize system message if first request
    if (epochs === 0) {
      if (modelID.startsWith('gpt') || modelID.includes('o1') || modelID.includes('o3')) {
        systemMessage = await initializeConversationHistory();
      } else if (modelID.startsWith('claude')) {
        const instructionsText = await initializeClaudeInstructions();
        if (providerFactory.isProviderAvailable('claude')) {
          const claudeHandler = providerFactory.getHandler('claude');
          const sections = claudeHandler.parseInstructionsIntoSections(instructionsText);
          systemMessage = claudeHandler.formatSectionsIntoSystemMessage(sections);
        }
      } else {
        systemMessage = await initializeConversationHistory();
      }
      epochs++;
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
      fileContents = req.app.locals.currentFileContents;
      file_id = req.app.locals.currentFileId;
      // Clear after use
      req.app.locals.currentFileContents = null;
      req.app.locals.currentFileId = null;
    }

    // Handle image processing
    let base64Image = null;
    if (req.body.image) {
      if (req.file) {
        base64Image = imageToBase64(req.file.path);
      } else {
        base64Image = await imageURLToBase64(req.body.image);
      }
      
      // Clean up uploaded image
      if (uploadedImagePath) {
        fs.unlink(uploadedImagePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
    }
    
    // Handle image from upload route
    if (req.app.locals.currentImageName) {
      imageName = req.app.locals.currentImageName;
      uploadedImagePath = req.app.locals.currentImagePath;
      // Clear after use
      req.app.locals.currentImageName = null;
      req.app.locals.currentImagePath = null;
    }

    // Format user input using provider factory
    const user_input = providerFactory.formatUserInput(
      modelID,
      user_message,
      fileContents,
      file_id,
      imageName,
      base64Image,
      uploadedFiles
    );

    // Prepare payload for provider
    const payload = {
      user_input,
      modelID,
      systemMessage,
      conversationHistory,
      claudeHistory,
      o1History,
      deepseekHistory,
      temperature,
      tokens
    };

    // Route to appropriate provider
    const result = await providerFactory.handleRequest(modelID, payload);

    if (result.success) {
      // Store conversation state in app.locals for export functionality
      req.app.locals.conversationHistory = conversationHistory;
      req.app.locals.claudeHistory = claudeHistory;
      req.app.locals.o1History = o1History;
      req.app.locals.deepseekHistory = deepseekHistory;
      req.app.locals.claudeInstructions = claudeInstructions;
      req.app.locals.currentModelID = modelID;
      req.app.locals.systemMessage = systemMessage;
      
      // Clean up file contents
      fileContents = null;
      file_id = "";
      imageName = "";
      
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
  conversationHistory = [];
  claudeHistory = [];
  o1History = [];
  deepseekHistory = [];
  geminiHistory = '';
  epochs = 0;
  fileContents = null;
  file_id = "";
  imageName = "";
  customPrompt = false;
  continueConv = false;
  
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
    chosenChat = req.body.chosenChat;
    continueConv = true;

    const contextAndSummary = await continueConversation(chosenChat);
    console.log('Context and Summary loaded');

    res.status(200).json({ message: 'Chat set successfully', chosenChat });
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
    customPrompt = true;
    promptName = chosenPrompt;
    const instructions = await readInstructionsFile();
    
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
    summariesOnly = req.body.summariesOnly;
    console.log('Summaries only mode:', summariesOnly);
    res.status(200).json({ message: 'Summaries only setting updated successfully', summariesOnly });
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