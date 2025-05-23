// Configuration and basic API routes
const express = require('express');
const router = express.Router();

/**
 * Create configuration routes
 * @param {Object} config - Application configuration
 * @returns {Object} Express router
 */
function createConfigRoutes(config) {
  // Configuration endpoint
  router.get('/config', (req, res) => {
    // Check if running on Vercel
    const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    // If it's Vercel, we don't need to specify host and port
    if (isVercelEnvironment) {
      res.json({
        // We could omit host and port entirely or set them to null/undefined
        host: undefined,
        port: undefined
      });
    } else {
      // For non-Vercel environments, return the necessary configuration
      res.json({
        host: process.env.HOST_CLIENT || 'localhost',
        port: process.env.PORT_CLIENT || 3000
      });
    }
  });

  // Default model endpoint
  router.get('/model', (req, res) => {
    const defaultModel = process.env.DEFAULT_MODEL;
    
    if (defaultModel) {
      res.json({ model: defaultModel });
    } else {
      res.json({ model: 'gpt-4o' });
    }
  });

  // Portal route (when authenticated)
  router.get('/portal', (req, res) => {
    res.sendFile('portal.html', { root: 'public' });
  });

  // File serving routes
  router.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(filename, { root: 'public/uploads' });
  });

  // Server restart endpoint
  router.post('/restart-server', (req, res) => {
    res.send('Server is restarting...');
    setTimeout(() => {
      console.log("Server shutdown initiated by user");
      process.exit(0);
    }, 100);
  });

  return router;
}

module.exports = {
  createConfigRoutes
};