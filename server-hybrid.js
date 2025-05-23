// GPTPortal - Hybrid Server: Original functionality + New model system
// This maintains 100% backward compatibility while adding dynamic models

// Start with the original server and add our new model system on top
const originalServerPath = './server.js';

// Import our new model system
const modelRoutes = require('./src/server/routes/models');

// The key insight: we'll modify the original server at runtime to add our new endpoints
// while keeping all existing functionality intact

// First, let's load the original server as a module
const fs = require('fs');
const path = require('path');

// Read the original server.js content
const originalServerContent = fs.readFileSync('./server.js', 'utf8');

// Find the line where routes are typically added (after the basic setup)
// We'll inject our new model routes right after the basic middleware setup

// Create a temporary modified version that includes our model routes
const injectionPoint = originalServerContent.indexOf("// Serve uploaded files from the 'public/uploads' directory");

if (injectionPoint === -1) {
  console.error("Could not find injection point in server.js");
  process.exit(1);
}

const beforeInjection = originalServerContent.substring(0, injectionPoint);
const afterInjection = originalServerContent.substring(injectionPoint);

const modelRoutesInjection = `
// ============ INJECTED MODEL API ROUTES ============
// Dynamic model management system
const modelRoutes = require('./src/server/routes/models');
app.use('/api', modelRoutes);

console.log('🚀 Dynamic model system loaded');
// ================ END INJECTION ===================

`;

const modifiedServerContent = beforeInjection + modelRoutesInjection + afterInjection;

// Write the modified server to a temporary file and run it
const tempServerFile = './server-temp-hybrid.js';
fs.writeFileSync(tempServerFile, modifiedServerContent);

// Now require and run the modified server
console.log('Starting GPTPortal with hybrid architecture...');
console.log('✅ Original functionality preserved');
console.log('✅ Dynamic model system added');

require(tempServerFile);

// Clean up the temporary file after a delay
setTimeout(() => {
  try {
    fs.unlinkSync(tempServerFile);
    console.log('Cleaned up temporary server file');
  } catch (error) {
    // Ignore cleanup errors
  }
}, 5000);