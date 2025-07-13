// Setup and configuration routes
const express = require('express');
const fs = require('fs');
const router = express.Router();

/**
 * Setup routes for environment configuration
 * @param {Object} config - Application configuration
 * @returns {Object} Express router
 */
function createSetupRoutes(config) {
  // Serve setup page
  router.get('/setup', (req, res) => {
    res.sendFile('setup.html', { root: 'public' });
  });

  // Handle setup form submission
  router.post('/setup', (req, res) => {
    const { 
      username, 
      password, 
      openaiApiKey, 
      claudeApiKey, 
      googleApiKey, 
      mistralApiKey, 
      groqApiKey,
      openrouterApiKey, 
      codestralApiKey 
    } = req.body;

    let envContent = `USER_USERNAME=${username}\nUSER_PASSWORD=${password}\n`;

    // Add API keys if provided
    if (openaiApiKey) envContent += `OPENAI_API_KEY=${openaiApiKey}\n`;
    if (claudeApiKey) envContent += `CLAUDE_API_KEY=${claudeApiKey}\n`;
    if (googleApiKey) envContent += `GOOGLE_API_KEY=${googleApiKey}\n`;
    if (mistralApiKey) envContent += `MISTRAL_API_KEY=${mistralApiKey}\n`;
    if (groqApiKey) envContent += `GROQ_API_KEY=${groqApiKey}\n`;
    if (openrouterApiKey) envContent += `OPENROUTER_API_KEY=${openrouterApiKey}\n`;
    if (codestralApiKey) envContent += `CODESTRAL_API_KEY=${codestralApiKey}\n`;

    try {
      fs.writeFileSync('.env', envContent);
      res.json({ message: 'Environment variables successfully written' });
    } catch (error) {
      console.error('Error writing .env file:', error);
      res.status(500).json({ error: 'Failed to write environment variables' });
    }
  });

  // Get current environment variables
  router.get('/get-env', (req, res) => {
    try {
      const envContent = fs.readFileSync('.env', 'utf-8');
      res.send(envContent);
    } catch (error) {
      console.error('Error reading .env file:', error);
      res.status(500).json({ error: 'Failed to read environment variables' });
    }
  });

  // Update environment variables
  router.post('/update-env', (req, res) => {
    try {
      const { envContent } = req.body;
      fs.writeFileSync('.env', envContent);
      res.send('Environment variables updated successfully.');
    } catch (error) {
      console.error('Error updating .env file:', error);
      res.status(500).json({ error: 'Failed to update environment variables' });
    }
  });

  return router;
}

module.exports = {
  createSetupRoutes
};