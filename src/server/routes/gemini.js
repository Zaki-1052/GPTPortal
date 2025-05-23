// Gemini-specific routes for Google Generative AI
const express = require('express');
const router = express.Router();

// Global state for Gemini conversations
let geminiHistory = '';
let isShuttingDown = false;

/**
 * Initialize Gemini conversation history with system message
 */
async function initializeGeminiConversationHistory(continueConv, chosenChat, summariesOnly) {
  try {
    const fs = require('fs');
    const path = require('path');
    const geminiMessage = await fs.promises.readFile('./public/uploads/geminiMessage.txt', 'utf8');
    let systemMessage = 'System Prompt: ' + geminiMessage;
    
    if (continueConv) {
      if (summariesOnly) {
        const contextAndSummary = await continueConversation(chosenChat);
        systemMessage += `\n---\n${contextAndSummary}`;
      } else {
        systemMessage = await continueConversation(chosenChat);
      }
    }
    
    geminiHistory += systemMessage + '\n';
  } catch (error) {
    console.error('Error initializing Gemini conversation history:', error);
  }
}

/**
 * Continue conversation by loading chat context
 */
async function continueConversation(chosenChat) {
  try {
    const fs = require('fs');
    const path = require('path');
    const conversationFile = await fs.promises.readFile(
      path.join(__dirname, '../../../public/uploads/chats', `${chosenChat}.txt`), 
      'utf8'
    );
    
    // Extract everything starting from CONTEXT
    const regex = /\n\n-----\n\n(.+)/s;
    const match = conversationFile.match(regex);
    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error('Context and summary not found in the conversation file.');
    }
  } catch (error) {
    console.error('Error in continueConversation:', error);
    throw error;
  }
}

/**
 * Export Gemini chat to HTML
 */
async function exportGeminiChatToHTML(modelID) {
  const convertNewlinesToHtml = text => text.replace(/\n/g, '<br>');
  const messageRegex = /(System Prompt: |User Prompt: |Response: )/g;
  const messages = geminiHistory.split(messageRegex).slice(1);
  
  console.log("Gemini History: ", JSON.stringify(geminiHistory, null, 2));
  
  // Import token and title services (would need to be implemented)
  const chatType = 'gemini';
  // const tokens = await tokenizeHistory(geminiHistory, modelID, chatType);
  // const { title, summary } = await nameChat(geminiHistory, tokens);
  
  // For now, use placeholder values
  const tokens = { totalTokens: 0 };
  const title = 'Gemini Chat';
  const summary = 'Gemini conversation export';
  
  let htmlContent = `
    <html>
    <head>
      <title>Gemini: ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .system { background-color: #f0f0f0; }
        .user { background-color: #d1e8ff; }
        .assistant { background-color: #c8e6c9; }
        .generated-image { max-width: 100%; height: auto; }
        .summary { background-color: #f9f9f9; padding: 10px; margin: 20px 0; border-radius: 5px; }
        .summary h3 { margin-top: 0; }
      </style>
    </head>
    <body>
  `;

  // Process the messages in pairs (label + content)
  for (let i = 0; i < messages.length; i += 2) {
    const label = messages[i];
    const content = messages[i + 1];
    let roleClass = '';

    if (label === 'System Prompt: ') {
      roleClass = 'system';
    } else if (label === 'User Prompt: ') {
      roleClass = 'user';
    } else if (label === 'Response: ') {
      roleClass = 'assistant';
    }

    htmlContent += `<div class="message ${roleClass}"><strong>${label.trim()}</strong> ${convertNewlinesToHtml(content.trim())}</div>`;
  }

  htmlContent += `
    <div class="summary">
      <h3>Summary</h3>
      <p>Total Tokens: ${tokens.totalTokens}</p>
      <p>Total Cost: $0.00!</p>
      <p>Summary: ${summary}</p>
    </div>
  </body></html>`;
  
  return htmlContent;
}

/**
 * Main Gemini endpoint
 */
router.post('/gemini', async (req, res) => {
  try {
    const { model, prompt, imageParts, history } = req.body;
    console.log('Prompt: ', prompt);
    
    // Check for shutdown command
    if (prompt === "Bye!") {
      console.log("Shutdown message received. Exporting chat and closing server...");
      
      const htmlContent = await exportGeminiChatToHTML(model);
      
      res.set('Content-Type', 'text/html');
      res.set('Content-Disposition', 'attachment; filename="gemini_history.html"');
      res.send(htmlContent);
      
      return;
    }

    // Initialize Gemini history if needed
    await initializeGeminiConversationHistory();
    
    // Add user's prompt to conversation history
    geminiHistory += 'User Prompt: ' + prompt + '\n';

    // Get Gemini handler from provider factory
    const ProviderFactory = require('../services/providers/providerFactory');
    const { config } = require('../config/environment');
    const providerFactory = new ProviderFactory(config.apiKeys);
    
    if (!providerFactory.isProviderAvailable('gemini')) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    const geminiHandler = providerFactory.getHandler('gemini');
    
    // Prepare payload based on request type
    const payload = {
      user_input: { content: prompt },
      modelID: model,
      geminiHistory: geminiHistory,
      temperature: 1,
      tokens: 2000
    };

    // Add image parts if present
    if (imageParts && imageParts.length > 0) {
      payload.imageParts = imageParts;
    }

    // Add chat history if present
    if (history && history.length > 0) {
      payload.chatHistory = history;
    }

    // Handle the request
    const result = await geminiHandler.handleRequest(payload);
    
    if (result.success) {
      // Update global history if available
      if (result.updatedHistory) {
        geminiHistory = result.updatedHistory;
      } else {
        geminiHistory += 'Response: ' + result.content + '\n';
      }
      
      // Store gemini state in app.locals for export functionality
      req.app.locals.geminiHistory = geminiHistory;
      req.app.locals.currentModelID = model;
      
      console.log('Response: ', result.content);
      console.log('Gemini History: ', geminiHistory);
      
      res.json({ success: true, text: result.content });
    } else {
      res.status(500).json({ error: "Failed to process Gemini request", details: result.error });
    }

  } catch (error) {
    console.error('Error with Gemini API:', error.message);
    res.status(500).json({ error: "Error with Gemini API", details: error.message });
  }
});

/**
 * Reset Gemini conversation state
 */
router.post('/gemini/reset', (req, res) => {
  geminiHistory = '';
  res.json({ success: true, message: 'Gemini conversation state reset' });
});

module.exports = router;