// Environment configuration and validation
require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT_SERVER || 3000,
  host: process.env.HOST || '0.0.0.0',
  isVercelEnvironment: !!process.env.VERCEL,
  
  // Authentication
  auth: {
    username: process.env.USER_USERNAME,
    password: process.env.USER_PASSWORD
  },
  
  // AI API Keys
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.CLAUDE_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    qroq: process.env.QROQ_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    codestral: process.env.CODESTRAL_API_KEY
  },
  
  // Model parameters
  model: {
    temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 1,
    maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 8000
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 32 * 1024 * 1024, // 32MB
    maxFiles: 10,
    uploadPath: 'public/uploads'
  }
};

// Validation functions
const validateConfig = () => {
  // Log warnings for missing API keys
  if (!config.apiKeys.openai) {
    console.warn("Warning: OPENAI_API_KEY environment variable is missing. OpenAI features will be disabled.");
  }
  
  console.log(`Server configuration loaded:`);
  console.log(`- Port: ${config.port}`);
  console.log(`- Temperature: ${config.model.temperature}`);
  console.log(`- Max Tokens: ${config.model.maxTokens}`);
};

module.exports = {
  config,
  validateConfig
};