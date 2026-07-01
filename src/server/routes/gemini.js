// src/server/routes/gemini.js
// Gemini-specific routes for Google Gemini models (thin path over GeminiHandler).
const express = require('express');
const router = express.Router();

// Default text model for the legacy Gemini route.
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

// Module-level conversation state.
//  - geminiHistory: legacy string transcript kept for HTML export compatibility.
//  - geminiConversationHistory: structured turns passed to the modernized handler.
//  - geminiSystemMessage: the raw system prompt fed to config.systemInstruction.
let geminiHistory = '';
let geminiConversationHistory = [];
let geminiSystemMessage = '';

/**
 * Initialize Gemini conversation history with the system message (runs once).
 */
async function initializeGeminiConversationHistory(continueConv, chosenChat, summariesOnly) {
  if (geminiSystemMessage) return;

  try {
    const fs = require('fs');
    const geminiMessage = await fs.promises.readFile('./public/uploads/geminiMessage.txt', 'utf8');
    let systemMessage = geminiMessage;

    if (continueConv) {
      if (summariesOnly) {
        const contextAndSummary = await continueConversation(chosenChat);
        systemMessage += `\n---\n${contextAndSummary}`;
      } else {
        systemMessage = await continueConversation(chosenChat);
      }
    }

    geminiSystemMessage = systemMessage;
    geminiHistory += 'System Prompt: ' + systemMessage + '\n';
  } catch (error) {
    console.error('Error initializing Gemini conversation history:', error);
  }
}

/**
 * Continue conversation by loading chat context from a saved transcript.
 */
async function continueConversation(chosenChat) {
  try {
    const fs = require('fs');
    const path = require('path');
    const conversationFile = await fs.promises.readFile(
      path.join(__dirname, '../../../public/uploads/chats', `${chosenChat}.txt`),
      'utf8'
    );

    // Extract everything starting from CONTEXT.
    const regex = /\n\n-----\n\n(.+)/s;
    const match = conversationFile.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('Context and summary not found in the conversation file.');
  } catch (error) {
    console.error('Error in continueConversation:', error);
    throw error;
  }
}

/**
 * Main Gemini endpoint.
 */
router.post('/gemini', async (req, res) => {
  try {
    const { model, prompt, imageParts, history } = req.body;
    console.log('Prompt: ', prompt);

    // Initialize Gemini history (system prompt) if needed.
    await initializeGeminiConversationHistory();

    // Track the user turn in the legacy string transcript for export.
    geminiHistory += 'User Prompt: ' + prompt + '\n';

    // Get Gemini handler from provider factory.
    const ProviderFactory = require('../services/providers/providerFactory');
    const { config } = require('../config/environment');
    const providerFactory = new ProviderFactory(config.apiKeys);

    if (!providerFactory.isProviderAvailable('gemini')) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    const geminiHandler = providerFactory.getHandler('gemini');

    // Build the modernized handler payload (uses conversationHistory array).
    const payload = {
      user_input: { role: 'user', content: prompt },
      modelID: model || DEFAULT_GEMINI_MODEL,
      systemMessage: geminiSystemMessage,
      conversationHistory: geminiConversationHistory,
      temperature: 1,
      tokens: 8000,
      reasoningEffort: 'medium'
    };

    if (imageParts && imageParts.length > 0) {
      payload.imageParts = imageParts;
    }

    if (history && history.length > 0) {
      payload.chatHistory = history;
    }

    // Handle the request (handler mutates conversationHistory in place).
    const result = await geminiHandler.handleRequest(payload);

    if (result.success) {
      // Keep the legacy string transcript in sync for HTML export.
      geminiHistory += 'Response: ' + result.content + '\n';

      req.app.locals.geminiHistory = geminiHistory;
      req.app.locals.currentModelID = model || DEFAULT_GEMINI_MODEL;

      console.log('Response: ', result.content);

      res.json({ success: true, text: result.content });
    } else {
      res.status(500).json({ error: 'Failed to process Gemini request', details: result.error });
    }
  } catch (error) {
    console.error('Error with Gemini API:', error.message);
    res.status(500).json({ error: 'Error with Gemini API', details: error.message });
  }
});

/**
 * Reset Gemini conversation state.
 */
router.post('/gemini/reset', (req, res) => {
  geminiHistory = '';
  geminiConversationHistory = [];
  geminiSystemMessage = '';
  res.json({ success: true, message: 'Gemini conversation state reset' });
});

module.exports = router;
