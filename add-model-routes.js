// Add dynamic model routes to existing server.js
// This file can be required at the end of server.js to add the new model API

const modelRoutes = require('./src/server/routes/models');

module.exports = function(app) {
  // Add our new model API routes
  app.use('/api', modelRoutes);
  
  console.log('🚀 Dynamic model API routes added to existing server');
};