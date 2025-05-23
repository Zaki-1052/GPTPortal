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
    res.json({
      host: config.host,
      port: config.port
    });
  });

  // Default model endpoint
  router.get('/model', (req, res) => {
    res.json({
      model: 'gpt-4o' // Default model
    });
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