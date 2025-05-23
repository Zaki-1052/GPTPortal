# GPTPortal Technical Architecture & Implementation Details

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

This document provides detailed technical information about the GPTPortal modular architecture, including routes, services, providers, and integration patterns established during the refactoring process.

---

## 🌐 **API ROUTES & ENDPOINTS**

### **Dynamic Model Management (`/api/models/*`)**
```javascript
// Core model endpoints
GET /api/models                    // All models (core + OpenRouter)
GET /api/models?format=frontend    // UI-optimized format for dropdowns
GET /api/models/core               // Only static core models (47+)
GET /api/models/openrouter         // Only OpenRouter models (321+)
GET /api/models/categories         // Models organized by category

// Model operations
GET /api/models/search?q=claude    // Search models by name/description
GET /api/models/:modelId           // Specific model details
GET /api/models/provider/:modelId  // Get provider for routing decisions
POST /api/models/refresh           // Manual refresh of OpenRouter models
GET /api/models/status             // System health and cache status
```

### **Chat & Communication Routes**
```javascript
// Main chat endpoint
POST /message                      // Universal chat endpoint (all providers)
POST /gemini                       // Gemini-specific endpoint with vision support
POST /assistant                    // OpenAI Assistants API (fully extracted)

// Chat management
POST /reset                        // Reset conversation state
POST /setChat                      // Set chat continuation context
POST /copyPrompt                   // Copy custom prompt template
POST /setSummariesOnly             // Toggle summary-only mode
```

### **Media Processing Routes**
```javascript
// Audio processing
POST /transcribe                   // Audio transcription (Whisper via OpenAI/Groq)
POST /tts                         // Text-to-speech (OpenAI)

// Image processing
POST /generate-image              // Image generation (DALL-E)
POST /upload-image                // Image upload with preview
```

### **File Management Routes**
```javascript
// File operations
POST /upload-file                 // File upload (images, PDFs, text)
GET /uploads/:filename            // Static file serving

// Chat history
GET /listChats                    // List saved chat files
GET /getSummary/:chatName         // Get chat summary
GET /export-chat-html             // Export chat to HTML
```

### **Configuration & Setup Routes**
```javascript
// Setup and configuration
GET /setup                        // Setup page for initial configuration
POST /setup                       // Process setup form
GET /get-env                      // Get environment variables
POST /update-env                  // Update environment variables

// Application configuration
GET /config                       // Get server configuration
GET /model                        // Get default model
POST /restart-server              // Restart server
POST /shutdown-server             // Graceful shutdown
```

### **Content Management Routes**
```javascript
// Instructions and prompts
GET /get-instructions             // Get system instructions
POST /update-instructions         // Update system instructions
GET /listPrompts                  // List available prompt templates
POST /setPrompt                   // Set custom prompt template

// Environment management
GET /get-my-env                   // Get .env file contents
POST /update-my-env               // Update .env file
```

---

## 🔧 **SERVICE ARCHITECTURE**

### **Provider Factory Pattern**
```javascript
// Central provider routing
class ProviderFactory {
  // Route model requests to appropriate providers
  getProviderForModel(modelID)     // Determine provider from model ID
  getHandler(provider)             // Get specific provider handler
  handleRequest(modelID, payload)  // Route request to correct provider
  
  // Utility methods
  formatUserInput(...)             // Format input for specific providers
  generateImage(prompt)            // Image generation routing
  transcribeAudio(...)             // Audio transcription routing
  textToSpeech(text)              // TTS routing
}
```

### **Advanced Services Integration**

#### **Token Service (`tokenService.js`)**
```javascript
class TokenService {
  // Core tokenization
  getEncoder(model)                // Get tiktoken encoder for model
  tokenizeHistory(history, model, type) // Tokenize conversation history
  countTokens(text, model)         // Count tokens in text
  countMessageTokens(messages, model) // Count tokens in message array
  
  // Model-specific methods
  getTokensForModel(content, modelId) // Get tokens for any model
  estimateTokens(text)             // Fallback estimation
  getMessageOverhead(model)        // Per-message token overhead
}
```

#### **Cost Service (`costService.js`)**
```javascript
class CostService {
  // Cost calculation
  calculateCost(tokens, model)     // Calculate cost from token usage
  calculateSimpleCost(modelId, inputTokens, outputTokens)
  estimateConversationCost(messages, modelId)
  
  // Model pricing
  getModelPricing(modelId)         // Get pricing for specific model
  isModelFree(modelId)             // Check if model is free
  getFreeModels()                  // Get list of free models
  updateModelPricing(modelId, inputPrice, outputPrice)
  
  // Display helpers
  formatCost(cost, currency)       // Format cost for display
  getPricingComparison(modelIds)   // Compare pricing across models
}
```

#### **Title Service (`titleService.js`)**
```javascript
class TitleService {
  // Title generation
  generateTitleWithOpenAI(history, handler) // AI-powered title generation
  generateSummaryWithOpenAI(history, handler) // AI-powered summary
  titleChat(history, tokens, cost, handler) // Complete title + save workflow
  
  // Gemini support
  generateTitleWithGemini(history, handler)
  generateSummaryWithGemini(history, handler)
  nameChat(chatHistory, tokens, handler) // Gemini title workflow
  
  // File management
  getUniqueFilePath(basePath, baseTitle) // Ensure unique filenames
  formatHistoryForTitleGeneration(chatHistory, type) // Format for AI processing
}
```

#### **Export Service (`exportService.js`)**
```javascript
class ExportService {
  // Export methods
  exportChatToHTML(conversationHistory, ...) // Standard chat export
  exportGeminiChatToHTML(geminiHistory, ...) // Gemini-specific export
  exportAssistantsChat(systemMessage, ...)   // Assistants export
  
  // Generic routing
  exportChat(type, data, providerFactory) // Route to appropriate exporter
  exportToFile(type, data, providerFactory, filename) // Save to file
  
  // Styling and formatting
  getExportStyles()                // CSS styling for exports
  setupMarkedOptions()             // Markdown rendering configuration
}
```

---

## 🤖 **AI PROVIDER HANDLERS**

### **Provider Handler Interface**
```javascript
// Standard interface for all providers
class ProviderHandler {
  constructor(apiKey)              // Initialize with API key
  handleRequest(payload)           // Main request handler
  formatUserInput(...)             // Format input for this provider
  
  // Provider-specific methods vary
}
```

### **OpenAI Handler (`openaiHandler.js`)**
```javascript
class OpenAIHandler {
  // Chat completion
  handleChatCompletion(payload)    // Standard GPT models
  handleO1Completion(payload)      // o1/o3 reasoning models
  
  // Specialized features
  generateImage(prompt)            // DALL-E image generation
  transcribeAudio(filePath, filename) // Whisper transcription
  textToSpeech(text)              // TTS generation
  
  // Assistants API (complete)
  initializeAssistantAndThread(...)  // Assistant and thread initialization
  handleAssistantMessage(...)        // Assistant conversation handling
  attachFileToAssistant(...)         // File attachment support
}
```

### **Claude Handler (`claudeHandler.js`)**
```javascript
class ClaudeHandler {
  // Chat with thinking support
  handleChatCompletion(payload)    // Standard Claude models
  
  // Advanced features
  parseInstructionsIntoSections(text) // Parse XML instructions
  formatSectionsIntoSystemMessage(sections) // Format with caching
  formatUserInput(...)             // XML-structured input formatting
  
  // Thinking model support
  // Handles Claude 4 thinking processes and response formatting
}
```

### **Gemini Handler (`geminiHandler.js`)**
```javascript
class GeminiHandler {
  // Vision and multimodal
  handleRequest(payload)           // Main Gemini handler
  handleVisionRequest(...)         // Vision-specific processing
  
  // Safety and configuration
  getSafetySettings()             // Configure safety filters
  formatGeminiInput(...)          // Format for Gemini API
}
```

### **Additional Providers**
- **Groq Handler**: LLaMA models + Whisper transcription
- **DeepSeek Handler**: Reasoning models with thinking output
- **Mistral Handler**: Mistral + Codestral models
- **OpenRouter Handler**: Generic routing for 300+ models

---

## 📊 **MODEL MANAGEMENT SYSTEM**

### **Core Models (`coreModels.js`)**
```javascript
// Static reliable models (47+)
const coreModels = {
  // OpenAI models
  "gpt-4o": { name: "GPT-4o: Latest", provider: "openai", ... },
  "o1-preview": { name: "GPT-o1 Preview: Reasoning", ... },
  
  // Claude models
  "claude-opus-4-20250514": { name: "Claude 4 Opus", ... },
  "claude-3-5-sonnet-latest": { name: "Claude 3.5 Sonnet", ... },
  
  // Gemini models
  "gemini-2.0-flash-exp": { name: "Gemini 2.0 Flash", ... },
  
  // Other providers...
};
```

### **OpenRouter Provider (`openRouterProvider.js`)**
```javascript
class OpenRouterProvider {
  // Automatic model fetching
  fetchModelsFromAPI()             // Fetch from OpenRouter API
  transformModel(apiModel)         // Transform to internal format
  inferCategory(modelId)           // Categorize models
  
  // Caching system
  loadFromCache()                  // Load cached models
  saveToCache()                    // Save models to cache
  isCacheStale()                   // Check cache validity
  
  // Background operations
  refreshModels(retries)           // Refresh with retry logic
  startAutoRefresh()               // Hourly background refresh
}
```

### **Model Registry (`modelRegistry.js`)**
```javascript
class ModelRegistry {
  // Unified interface
  getAllModels()                   // Core + OpenRouter combined
  getModel(modelId)                // Get specific model
  searchModels(query)              // Search across all models
  
  // Frontend support
  getModelsForFrontend()           // UI-optimized format
  getModelsByCategories()          // Organized by category
  getModelProvider(modelId)        // Provider for routing
  
  // Status and statistics
  getStatus()                      // System status
  getStatistics()                  // Usage statistics
}
```

---

## 🔄 **INTEGRATION PATTERNS**

### **Conversation State Management**
```javascript
// Chat routes store state in app.locals
req.app.locals.conversationHistory = conversationHistory;
req.app.locals.claudeHistory = claudeHistory;
req.app.locals.currentModelID = modelID;

// Export service accesses real state
const exportData = {
  conversationHistory: app.locals.conversationHistory || [],
  claudeHistory: app.locals.claudeHistory || [],
  currentModelID: app.locals.currentModelID || 'gpt-4o'
};
```

### **Provider Factory Routing**
```javascript
// Automatic provider determination
const provider = providerFactory.getProviderForModel(modelID);
const handler = providerFactory.getHandler(provider);
const result = await handler.handleRequest(payload);
```

### **Service Integration**
```javascript
// Services work together seamlessly
const tokens = await tokenService.tokenizeHistory(chatHistory, modelID, 'chat');
const cost = await costService.calculateCost(tokens, modelID);
const { title, summary } = await titleService.titleChat(savedHistory, tokens, cost, openaiHandler);
const htmlContent = await exportService.exportChat('conversation', exportData, providerFactory);
```

---

## 🛡️ **ERROR HANDLING & RELIABILITY**

### **Graceful Degradation**
```javascript
// Model loading fallback
if (openRouterAPI.fails) {
  fallbackToCoreModels();        // 47+ core models always available
}

// Provider fallback
if (primaryProvider.fails) {
  routeToAlternativeProvider();  // Alternative routing when possible
}

// Service fallback
if (advancedService.fails) {
  provideBasicFunctionality();   // Core features continue working
}
```

### **Retry Logic**
```javascript
// Exponential backoff for API calls
for (let attempt = 1; attempt <= retries; attempt++) {
  const success = await fetchModelsFromAPI();
  if (success) return true;
  
  const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
  await new Promise(resolve => setTimeout(resolve, delay));
}
```

---

## 🔧 **CONFIGURATION MANAGEMENT**

### **Environment Configuration (`environment.js`)**
```javascript
const config = {
  // Server configuration
  port: process.env.PORT_SERVER || 3000,
  host: process.env.HOST || '0.0.0.0',
  
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
    codestral: process.env.CODESTRAL_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY
  },
  
  // Model parameters
  model: {
    temperature: parseFloat(process.env.TEMPERATURE) || 1,
    maxTokens: parseInt(process.env.MAX_TOKENS) || 8000
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 32 * 1024 * 1024, // 32MB
    maxFiles: 10,
    uploadPath: 'public/uploads'
  }
};
```

---

## 📁 **FILE ORGANIZATION**

### **Middleware Organization**
- `auth.js`: Authentication using express-basic-auth
- `upload.js`: File upload handling with multer

### **Service Organization**
- `aiProviders.js`: Provider initialization
- `modelService.js`: Token limits and utilities
- `costService.js`: Cost calculation and pricing
- `exportService.js`: HTML export with styling
- `titleService.js`: AI-powered chat naming
- `tokenService.js`: tiktoken integration

### **Route Organization**
- `assistant.js`: Complete OpenAI Assistants API integration
- `chat.js`: Main chat functionality with all providers  
- `gemini.js`: Gemini-specific routes and features
- `models.js`: Dynamic model management API (10+ endpoints)
- `config.js`: Enhanced configuration routes with Vercel detection
- `setup.js`: Setup and environment management

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Server Options**
```javascript
// Enhanced modular server (recommended for production)
node server-complete.js
// Features: 100% original functionality + advanced services + dynamic models
// Status: Complete refactoring with full feature parity + enhancements

// Original monolithic server (backup/reference)
node server.js  
// Features: 100% original functionality
// Status: Preserved for reference and emergency fallback
```

### **Frontend Integration**
```javascript
// API connection for dynamic models
fetch('/api/models?format=frontend')
  .then(res => res.json())
  .then(data => populateModelSelector(data.data.models));

// Chat API integration
fetch('/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userInput,
    modelID: selectedModel,
    temperature: temperature,
    tokens: maxTokens
  })
});
```

---

## 🎯 **PERFORMANCE OPTIMIZATIONS**

### **Caching Strategy**
- **Memory Cache**: Fast in-memory storage for active models
- **Persistent Cache**: JSON files for reliability across restarts
- **TTL Management**: 1-hour expiration with automatic refresh
- **Intelligent Loading**: Background updates without blocking requests

### **Request Optimization**
- **Provider Routing**: Direct routing to appropriate handlers
- **Token Counting**: Cached encoders for faster processing
- **Error Handling**: Fast fallbacks without long timeouts
- **Service Integration**: Efficient service communication

---

## 🏆 **TECHNICAL ACHIEVEMENTS**

### **Architecture Quality**
- ✅ **Modular Design**: Clean separation of concerns
- ✅ **Service Integration**: Advanced services working together
- ✅ **Provider Pattern**: Unified interface for all AI providers
- ✅ **Configuration Management**: Centralized environment handling
- ✅ **Error Handling**: Comprehensive error management
- ✅ **API Design**: RESTful endpoints with proper status codes

### **Integration Success**
- ✅ **Frontend-Backend**: Seamless API communication
- ✅ **Service Communication**: Services properly integrated
- ✅ **State Management**: Conversation state properly shared
- ✅ **Provider Factory**: Unified routing and management
- ✅ **Dynamic Models**: Real-time model management

---

**Technical Architecture Status: ✅ COMPLETE MODULAR ARCHITECTURE - PRODUCTION READY**

*The technical architecture has achieved complete success with 100% feature extraction from the original monolithic system. The modular foundation provides superior maintainability, testability, and extensibility while preserving all original functionality.*