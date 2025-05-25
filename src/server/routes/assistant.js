// OpenAI Assistants API routes
const express = require('express');
const router = express.Router();

// Initialize provider factory (will be set by main server)
let providerFactory = null;

// Assistant state variables
let isAssistants = false;
let initialize = true;

/**
 * Initialize the assistant routes with provider factory
 */
function initializeAssistantRoutes(factory) {
  providerFactory = factory;
  console.log('✅ Assistant routes initialized with provider factory');
}

/**
 * Read conversation history for assistant initialization
 */
async function initializeConversationHistory() {
  try {
    const fs = require('fs');
    const instructions = await fs.promises.readFile('./public/instructions.md', 'utf8');
    return `You are a helpful and intelligent AI assistant, knowledgeable about a wide range of topics and highly capable of a great many tasks.\n Specifically:\n ${instructions}`;
  } catch (error) {
    console.error('Error reading instructions file:', error);
    return 'You are a helpful and intelligent AI assistant.';
  }
}

/**
 * Main assistant endpoint
 */
router.post('/assistant', async (req, res) => {
  try {
    if (!providerFactory || !providerFactory.isProviderAvailable('openai')) {
      return res.status(400).json({ error: 'OpenAI provider not available for Assistants API' });
    }

    const userMessage = req.body.message;
    const modelID = req.body.modelID || 'gpt-4o';
    const shouldInitialize = req.body.initialize;
    
    isAssistants = true;
    
    // Get OpenAI handler
    const openaiHandler = providerFactory.getHandler('openai');
    
    // Check if assistant and thread need to be initialized
    if (shouldInitialize === true) {
      console.log("Initializing assistant and thread");
      const systemMessage = await initializeConversationHistory();
      
      // Store system message for export functionality
      req.app.locals.systemMessage = systemMessage;
      req.app.locals.currentModelID = modelID;
      
      await openaiHandler.initializeAssistantAndThread(modelID, systemMessage);
      
      const response = await openaiHandler.handleAssistantMessage(userMessage);
      console.log("Assistant Response:", response);
      res.json(response);
      
    } else if (shouldInitialize === false) {
      console.log("Using existing assistant and thread");
      
      // Update current model ID for export
      req.app.locals.currentModelID = modelID;
      
      const response = await openaiHandler.handleAssistantMessage(userMessage);
      console.log("Assistant Response:", response);
      res.json(response);
    } else {
      res.status(400).json({ error: 'Initialize parameter must be specified' });
    }
    
  } catch (error) {
    console.error('Error in /assistant endpoint:', error.message);
    res.status(500).json({ 
      error: "An error occurred in the assistant endpoint.", 
      details: error.message 
    });
  }
});

/**
 * Reset assistant state
 */
router.post('/assistant/reset', (req, res) => {
  try {
    if (providerFactory && providerFactory.isProviderAvailable('openai')) {
      const openaiHandler = providerFactory.getHandler('openai');
      openaiHandler.resetState();
    }
    
    isAssistants = false;
    initialize = true;
    
    res.json({ success: true, message: 'Assistant state reset' });
  } catch (error) {
    console.error('Error resetting assistant state:', error);
    res.status(500).json({ error: 'Failed to reset assistant state' });
  }
});

/**
 * Get assistant status
 */
router.get('/assistant/status', (req, res) => {
  try {
    if (!providerFactory || !providerFactory.isProviderAvailable('openai')) {
      return res.json({ 
        available: false, 
        reason: 'OpenAI provider not available' 
      });
    }

    const openaiHandler = providerFactory.getHandler('openai');
    
    res.json({
      available: true,
      isAssistants,
      initialize,
      hasAssistant: !!openaiHandler.assistant,
      hasThread: !!openaiHandler.thread,
      assistantId: openaiHandler.assistantId,
      threadId: openaiHandler.threadId
    });
  } catch (error) {
    console.error('Error getting assistant status:', error);
    res.status(500).json({ error: 'Failed to get assistant status' });
  }
});

// Export both the router and initialization function
module.exports = {
  router,
  initializeAssistantRoutes
};