# OpenAI Provider Architecture Documentation

## Overview

The OpenAI Provider is a comprehensive, modular system that manages all interactions with OpenAI's APIs. It has been completely refactored from a monolithic handler into a sophisticated, modular architecture that supports multiple OpenAI API endpoints while maintaining full backwards compatibility. The system handles Chat Completions, Responses API (reasoning models), Image Generation, Audio Processing, and Assistants API with intelligent web search capabilities.

## Architecture Principles

### 1. **Modular Design**
- **Single Responsibility**: Each handler manages one specific OpenAI API
- **Separation of Concerns**: Clear boundaries between API types and shared services
- **Dependency Injection**: Services injected into handlers for testability
- **Unified Interface**: Common patterns across all specialized handlers

### 2. **API Compatibility**
- **Dual API Support**: Native support for both Chat Completions and Responses APIs
- **Backwards Compatibility**: All existing methods preserved and functional
- **Progressive Enhancement**: New features available without breaking changes
- **Intelligent Routing**: Automatic API selection based on model capabilities

### 3. **Web Search Integration**
- **Dual Implementation**: Support for both OpenAI API approaches to web search
- **Chat Completions Web Search**: Direct integration with `gpt-4o-search-preview` models
- **Responses API Web Search**: Tool-based web search for standard GPT models
- **Unified Configuration**: Consistent web search options across both approaches

### 4. **Reliability & Fallbacks**
- **Intelligent Fallbacks**: Automatic fallback chains for all services
- **Error Recovery**: Graceful degradation when services fail
- **Model Routing**: Smart routing based on capabilities and availability
- **State Management**: Proper state handling for stateful APIs

## Core Architecture

### Directory Structure
```
src/server/services/providers/openai/
├── index.js                    # Main orchestrator
├── handlers/                   # Specialized API handlers
│   ├── chatHandler.js          # Chat Completions API
│   ├── responsesHandler.js     # Responses API (reasoning + web search)
│   ├── imageHandler.js         # Image generation
│   ├── audioHandler.js         # Transcription & TTS
│   └── assistantsHandler.js    # Assistants API
├── services/                   # Shared services
│   ├── apiClient.js            # HTTP client abstraction
│   └── webSearchService.js     # Web search implementation
└── utils/                      # Utilities and constants
    ├── constants.js            # API constants and model definitions
    └── formatters.js           # Input/output formatting
```

## Core Components

### 1. Main Orchestrator (`index.js`)

#### **OpenAIHandler Class**
Central orchestrator that coordinates all specialized handlers:

```javascript
class OpenAIHandler {
  constructor(apiKey) {
    this.apiClient = new OpenAIApiClient(apiKey);
    this.webSearchService = new WebSearchService();
    
    // Initialize specialized handlers
    this.chatHandler = new ChatHandler(this.apiClient, this.webSearchService);
    this.responsesHandler = new ResponsesHandler(this.apiClient, this.webSearchService);
    this.imageHandler = new ImageHandler(this.apiClient);
    this.audioHandler = new AudioHandler(this.apiClient);
    this.assistantsHandler = new AssistantsHandler(this.apiClient);
  }
}
```

**Key Features:**
- **Intelligent Routing**: Routes requests to appropriate handlers based on model type
- **Unified Interface**: Maintains backwards compatibility with existing methods
- **Service Coordination**: Manages dependencies between handlers and services
- **Capability Detection**: Provides comprehensive model capability information

**Public Methods:**
- `handleRequest(payload)`: Main entry point for all requests
- `handleChatCompletion(payload)`: Legacy chat completion method
- `handleReasoningCompletion(payload)`: Legacy reasoning method
- `generateImage(prompt, options)`: Image generation
- `transcribeAudio(audioPath, filename, options)`: Audio transcription
- `textToSpeech(text, options)`: Text-to-speech generation
- `formatUserInput(...)`: User input formatting
- `getModelCapabilities(modelId)`: Capability detection
- `resetState()`: State management

### 2. Shared Services

#### **OpenAIApiClient** (`services/apiClient.js`)
Centralized HTTP client for all OpenAI API interactions:

```javascript
class OpenAIApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }
  
  // Specialized methods for each API endpoint
  async chatCompletions(requestData) { /* Chat Completions API */ }
  async responses(requestData) { /* Responses API */ }
  async imageGeneration(requestData) { /* Image generation */ }
  async audioTranscription(formData) { /* Audio transcription */ }
  async textToSpeech(requestData) { /* Text-to-speech */ }
  
  // Assistants API methods
  async createAssistant(requestData) { /* Create assistant */ }
  async createThread(requestData) { /* Create thread */ }
  async createMessage(threadId, requestData) { /* Create message */ }
  async createRun(threadId, requestData) { /* Create run */ }
}
```

**Features:**
- **Unified Error Handling**: Consistent error processing across all APIs
- **Request Logging**: Structured logging for debugging and monitoring
- **Error Classification**: Categorizes errors by type (auth, rate limit, quota, etc.)
- **Health Checking**: Built-in connectivity verification

#### **WebSearchService** (`services/webSearchService.js`)
Comprehensive web search implementation supporting both OpenAI approaches:

```javascript
class WebSearchService {
  constructor() {
    this.supportedChatModels = ['gpt-4o-search-preview', 'gpt-4o-mini-search-preview'];
    this.supportedResponsesModels = ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'];
  }
  
  // Chat Completions API web search
  addWebSearchToChat(requestData, webSearchConfig) {
    // Adds web_search_options to request
    requestData.web_search_options = formatWebSearchOptions(webSearchConfig);
  }
  
  // Responses API web search
  addWebSearchToResponses(requestData, webSearchConfig) {
    // Adds web_search_preview tool to request
    const webSearchTool = formatWebSearchTool(webSearchConfig);
    requestData.tools = requestData.tools || [];
    requestData.tools.push(webSearchTool);
  }
}
```

**Web Search Configuration:**
```javascript
// Chat Completions configuration
{
  user_location: {
    type: "approximate",
    approximate: {
      country: "US",
      city: "San Francisco",
      region: "California"
    }
  },
  search_context_size: "medium" // low, medium, high
}

// Responses API configuration
{
  maxUses: 5,
  allowedDomains: ['example.com'],
  blockedDomains: ['spam.com'],
  userLocation: {
    type: "approximate",
    country: "US",
    city: "San Francisco"
  }
}
```

**Citation Processing:**
- **Chat Completions**: Extracts URL citations from `annotations` field
- **Responses API**: Processes citations from tool response events
- **Unified Format**: Consistent citation structure across both APIs

### 3. Specialized Handlers

#### **ChatHandler** (`handlers/chatHandler.js`)
Manages Chat Completions API with web search support:

```javascript
class ChatHandler {
  constructor(apiClient, webSearchService) {
    this.apiClient = apiClient;
    this.webSearchService = webSearchService;
  }
  
  async handleChatCompletion(payload) {
    const { modelID, webSearchConfig } = payload;
    
    // Build request data
    let requestData = {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };
    
    // Add web search if supported
    if (this.webSearchService.supportsChatWebSearch(modelID)) {
      requestData = this.webSearchService.addWebSearchToChat(
        requestData, 
        webSearchConfig
      );
    }
    
    const response = await this.apiClient.chatCompletions(requestData);
    return this.processResponse(response, modelID, webSearchConfig);
  }
}
```

**Supported Models:**
- **Standard Chat Models**: `gpt-4`, `gpt-4o`, `gpt-4.1`, `gpt-4o-mini`, `gpt-3.5-turbo`
- **Web Search Models**: `gpt-4o-search-preview`, `gpt-4o-mini-search-preview`

**Features:**
- **Automatic Web Search**: Enabled by default for web search models
- **Citation Processing**: Extracts and formats URL citations
- **Vision Support**: Handles image inputs for compatible models
- **Function Calling**: Supports function calling for compatible models

#### **ResponsesHandler** (`handlers/responsesHandler.js`)
Manages Responses API for reasoning models and web search:

```javascript
class ResponsesHandler {
  constructor(apiClient, webSearchService) {
    this.apiClient = apiClient;
    this.webSearchService = webSearchService;
    this.responseCount = 0;
    this.lastResponseId = null;
  }
  
  async handleReasoningCompletion(payload) {
    const { user_input, modelID } = payload;
    
    // Transform input for Responses API
    const transformedUserInput = formatUserInputForResponses(user_input);
    
    // Build request with state management
    let requestData = {
      model: modelID,
      input: [transformedUserInput],
      store: true
    };
    
    // Add previous response for continuation
    if (this.responseCount > 0 && this.lastResponseId) {
      requestData.previous_response_id = this.lastResponseId;
    }
    
    // Add reasoning configuration
    if (this.isReasoningModel(modelID)) {
      requestData.reasoning = { effort: "high", summary: "auto" };
    }
    
    const response = await this.apiClient.responses(requestData);
    return this.processResponsesOutput(response);
  }
  
  async handleCompletionWithWebSearch(payload) {
    // Handle standard models with web search via Responses API
    const requestData = this.buildWebSearchRequest(payload);
    requestData = this.webSearchService.addWebSearchToResponses(
      requestData, 
      payload.webSearchConfig
    );
    
    const response = await this.apiClient.responses(requestData);
    return this.processResponsesOutput(response);
  }
}
```

**State Management:**
- **Response Continuity**: Maintains `lastResponseId` for conversation context
- **State Tracking**: Tracks response count and conversation flow
- **Reset Capabilities**: Provides state reset for new conversations

**Content Processing:**
```javascript
function extractResponseContent(outputArray) {
  let reasoningContent = '';
  let assistantContent = '';
  
  outputArray.forEach(item => {
    if (item.type === 'reasoning' && item.summary) {
      reasoningContent += processReasoningSummary(item.summary);
    }
    if (item.type === 'message' && item.role === 'assistant') {
      assistantContent += processAssistantMessage(item.content);
    }
  });
  
  return { reasoning: reasoningContent.trim(), response: assistantContent.trim() };
}
```

#### **ImageHandler** (`handlers/imageHandler.js`)
Manages image generation with intelligent model selection:

```javascript
class ImageHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }
  
  async generateImage(prompt, options = {}) {
    const { preferredModel = 'gpt-image-1', enhancePrompt = true } = options;
    
    try {
      // Try GPT Image 1 first
      if (preferredModel === 'gpt-image-1') {
        try {
          return await this.generateImageWithGPTImage(prompt, options);
        } catch (gptImageError) {
          // Fallback to DALL-E 3
          try {
            const result = await this.generateImageWithDALLE(prompt, 'dall-e-3');
            return { ...result, usedFallback: true, fallbackReason: gptImageError.message };
          } catch (dalle3Error) {
            // Final fallback to DALL-E 2
            const result = await this.generateImageWithDALLE(prompt, 'dall-e-2');
            return { 
              ...result, 
              usedFallback: true, 
              fallbackReason: `GPT Image 1: ${gptImageError.message}, DALL-E 3: ${dalle3Error.message}` 
            };
          }
        }
      }
    } catch (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
  
  async enhanceImagePrompt(userPrompt) {
    // Uses GPT-4.1 to enhance prompts for better image generation
    const enhancementPrompt = `You are an expert at creating detailed, artistic image generation prompts...`;
    
    const response = await this.apiClient.chatCompletions({
      model: "gpt-4.1",
      messages: [{ role: "user", content: enhancementPrompt }],
      temperature: 0.7,
      max_tokens: 100
    });
    
    return response.data.choices[0].message.content.trim();
  }
}
```

**Model Support:**
- **GPT Image 1**: Advanced multimodal image generation with prompt enhancement
- **DALL-E 3**: High-quality image generation with style controls
- **DALL-E 2**: Fast image generation for basic needs

**Features:**
- **Intelligent Fallbacks**: Automatic fallback chain: GPT Image 1 → DALL-E 3 → DALL-E 2
- **Prompt Enhancement**: AI-powered prompt enhancement for better results
- **Format Support**: Multiple image formats and sizes
- **Quality Controls**: Quality and style options per model

#### **AudioHandler** (`handlers/audioHandler.js`)
Manages audio transcription and text-to-speech:

```javascript
class AudioHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }
  
  async transcribeAudio(audioFilePath, filename, options = {}) {
    const { preferredModel = 'gpt-4o-transcribe' } = options;
    
    try {
      // Try GPT-4o Transcribe first
      if (preferredModel === 'gpt-4o-transcribe') {
        try {
          return await this.transcribeWithGPTModel(audioFilePath, filename, 'gpt-4o-transcribe');
        } catch (gpt4oError) {
          // Fallback to GPT-4o Mini Transcribe
          try {
            const result = await this.transcribeWithGPTModel(audioFilePath, filename, 'gpt-4o-mini-transcribe');
            return { ...result, usedFallback: true, fallbackReason: gpt4oError.message };
          } catch (gpt4oMiniError) {
            // Final fallback to Whisper-1
            const result = await this.transcribeWithWhisper(audioFilePath, filename);
            return { 
              ...result, 
              usedFallback: true, 
              fallbackReason: `GPT-4o: ${gpt4oError.message}, GPT-4o Mini: ${gpt4oMiniError.message}` 
            };
          }
        }
      }
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
  
  async textToSpeech(text, options = {}) {
    const { preferredModel = 'gpt-4o-mini-tts', voice = 'coral' } = options;
    
    try {
      // Try GPT-4o Mini TTS with advanced features
      if (preferredModel === 'gpt-4o-mini-tts') {
        const requestData = {
          model: "gpt-4o-mini-tts",
          voice: voice,
          input: text,
          response_format: responseFormat,
          instructions: this.generateTTSInstructions(text) // AI-generated instructions
        };
        
        return await this.apiClient.textToSpeech(requestData);
      }
    } catch (error) {
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }
}
```

**Transcription Models:**
- **GPT-4o Transcribe**: Highest quality with intelligent prompting
- **GPT-4o Mini Transcribe**: Fast and affordable with smart features
- **Whisper-1**: Legacy model for basic transcription

**TTS Models:**
- **GPT-4o Mini TTS**: Advanced TTS with emotional control and intelligent instructions
- **TTS-1-HD**: High-definition legacy TTS
- **TTS-1**: Standard legacy TTS

**Intelligence Features:**
- **Context-Aware Prompting**: Generates transcription prompts based on filename and content
- **Intelligent TTS Instructions**: AI-generated speaking instructions based on text content
- **Format Support**: Multiple audio formats for input and output

### 4. Utilities and Constants

#### **Constants** (`utils/constants.js`)
Centralized configuration and model definitions:

```javascript
// API endpoints
const API_ENDPOINTS = {
  BASE_URL: 'https://api.openai.com/v1',
  CHAT_COMPLETIONS: '/chat/completions',
  RESPONSES: '/responses',
  IMAGES_GENERATIONS: '/images/generations',
  AUDIO_TRANSCRIPTIONS: '/audio/transcriptions',
  AUDIO_SPEECH: '/audio/speech'
};

// Model categories for routing
const CHAT_MODELS = [
  'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4.1',
  'gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1-nano',
  'gpt-3.5-turbo', 'gpt-3.5-turbo-0125'
];

const WEB_SEARCH_CHAT_MODELS = [
  'gpt-4o-search-preview',
  'gpt-4o-mini-search-preview'
];

const WEB_SEARCH_RESPONSES_MODELS = [
  'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'
];

const REASONING_MODELS = ['o1', 'o1-preview', 'o1-mini', 'o3', 'o3-mini', 'o4', 'o4-mini'];
```

#### **Formatters** (`utils/formatters.js`)
Input/output formatting utilities:

```javascript
// Format user input for OpenAI models
function formatUserInput(userMessage, fileContents, fileId, imageName, base64Image) {
  const user_input = { role: "user", content: [] };
  
  if (userMessage) {
    user_input.content.push({ type: "text", text: userMessage });
  }
  
  if (base64Image) {
    if (imageName) {
      user_input.content.push({ type: "text", text: imageName });
    }
    user_input.content.push({ type: "image_url", image_url: { url: base64Image } });
  }
  
  return user_input;
}

// Transform content for Responses API
function transformContentForResponses(content) {
  return content.map(item => {
    if (item.type === 'text') {
      return { type: 'input_text', text: item.text };
    } else if (item.type === 'image_url') {
      return { type: 'input_image', image_url: item.image_url };
    }
    return item;
  });
}

// Format web search options for Chat Completions
function formatWebSearchOptions(options = {}) {
  const webSearchOptions = {};
  
  if (options.userLocation) {
    webSearchOptions.user_location = {
      type: "approximate",
      approximate: {
        country: options.userLocation.country,
        city: options.userLocation.city,
        region: options.userLocation.region
      }
    };
  }
  
  if (options.searchContextSize) {
    webSearchOptions.search_context_size = options.searchContextSize;
  }
  
  return webSearchOptions;
}
```

## Web Search Implementation

### Dual API Approach

The system supports OpenAI's two different approaches to web search:

#### **1. Chat Completions API with Search Models**
For dedicated web search models (`gpt-4o-search-preview`, `gpt-4o-mini-search-preview`):

```javascript
// Request format
{
  "model": "gpt-4o-search-preview",
  "web_search_options": {
    "user_location": {
      "type": "approximate",
      "approximate": {
        "country": "US",
        "city": "San Francisco",
        "region": "California"
      }
    },
    "search_context_size": "medium"
  },
  "messages": [
    { "role": "user", "content": "What's the latest news about AI?" }
  ]
}

// Response includes annotations with citations
{
  "choices": [{
    "message": {
      "content": "Based on recent developments, AI has seen significant advances...",
      "annotations": [{
        "type": "url_citation",
        "url_citation": {
          "url": "https://example.com/ai-news",
          "title": "Latest AI Developments",
          "start_index": 25,
          "end_index": 45
        }
      }]
    }
  }]
}
```

#### **2. Responses API with Web Search Tool**
For standard models with web search capability via tools:

```javascript
// Request format
{
  "model": "gpt-4.1",
  "tools": [{
    "type": "web_search_preview",
    "name": "web_search",
    "max_uses": 5,
    "allowed_domains": ["news.com", "tech.org"],
    "user_location": {
      "type": "approximate",
      "country": "US",
      "city": "San Francisco"
    }
  }],
  "input": [
    { "role": "user", "content": "What's the latest news about AI?" }
  ]
}

// Response includes tool usage in output array
{
  "output": [
    {
      "type": "tool_use",
      "name": "web_search",
      "query": "latest AI news developments 2025"
    },
    {
      "type": "message",
      "role": "assistant",
      "content": "Based on my web search, here are the latest AI developments..."
    }
  ]
}
```

### Configuration Options

#### **User Location**
```javascript
{
  userLocation: {
    type: "approximate",
    country: "US",        // ISO 3166-1 country code
    city: "San Francisco", // Free text
    region: "California",  // Free text
    timezone: "America/Los_Angeles" // IANA timezone (optional)
  }
}
```

#### **Search Context Size**
- **`low`**: Fastest, least comprehensive, lowest cost
- **`medium`**: Balanced performance and cost (default)
- **`high`**: Most comprehensive, highest cost, slower

#### **Domain Filtering**
```javascript
{
  allowedDomains: ["trusted-news.com", "official-docs.org"],
  blockedDomains: ["spam-site.com", "unreliable.net"],
  maxUses: 5 // Maximum search operations per request
}
```

### Citation Processing

The system extracts and normalizes citations from both APIs:

```javascript
// Unified citation format
{
  content: "Response text with citations...",
  citations: [
    {
      url: "https://example.com/article",
      title: "Article Title",
      startIndex: 25,
      endIndex: 45
    }
  ],
  webSearchUsed: true,
  hasCitations: true
}
```

## Model Routing and Capabilities

### Intelligent Model Detection

The system automatically detects model capabilities and routes requests appropriately:

```javascript
// Model type detection
isReasoningModel(modelId) {
  return REASONING_MODELS.some(pattern => modelId.includes(pattern));
}

isWebSearchModel(modelId) {
  return WEB_SEARCH_CHAT_MODELS.includes(modelId) || 
         WEB_SEARCH_RESPONSES_MODELS.includes(modelId);
}

isChatModel(modelId) {
  return CHAT_MODELS.includes(modelId);
}

// Capability detection
getModelCapabilities(modelId) {
  return {
    chat: this.isChatModel(modelId) || this.webSearchService.supportsChatWebSearch(modelId),
    reasoning: this.isReasoningModel(modelId),
    webSearch: this.isWebSearchModel(modelId),
    vision: this.supportsVision(modelId),
    function: this.supportsFunction(modelId),
    webSearchType: this.getWebSearchType(modelId) // 'chat_completions' or 'responses'
  };
}
```

### Request Routing Logic

```javascript
async handleRequest(payload) {
  const { modelID } = payload;
  
  // Route to reasoning models via Responses API
  if (this.isReasoningModel(modelID)) {
    return await this.responsesHandler.handleRequest(payload);
  }

  // Route to web search models
  if (this.isWebSearchModel(modelID)) {
    if (this.webSearchService.supportsChatWebSearch(modelID)) {
      return await this.chatHandler.handleChatCompletion(payload);
    } else if (this.webSearchService.supportsResponsesWebSearch(modelID)) {
      return await this.responsesHandler.handleRequest(payload);
    }
  }

  // Route to standard chat models
  if (this.isChatModel(modelID)) {
    return await this.chatHandler.handleChatCompletion(payload);
  }

  throw new Error(`Unsupported OpenAI model: ${modelID}`);
}
```

## Backwards Compatibility

### Legacy Method Support

All original methods are preserved and fully functional:

```javascript
// Original methods maintained
async handleChatCompletion(payload) {
  return this.chatHandler.handleChatCompletion(payload);
}

async handleReasoningCompletion(payload) {
  return this.responsesHandler.handleReasoningCompletion(payload);
}

// Enhanced methods
async generateImage(prompt, options = {}) {
  return this.imageHandler.generateImage(prompt, options);
}

async transcribeAudio(audioFilePath, filename, options = {}) {
  return this.audioHandler.transcribeAudio(audioFilePath, filename, options);
}

async textToSpeech(text, options = {}) {
  return this.audioHandler.textToSpeech(text, options);
}

// User input formatting
formatUserInput(userMessage, fileContents, fileId, imageName, base64Image) {
  return this.chatHandler.formatUserInput(userMessage, fileContents, fileId, imageName, base64Image);
}
```

### Provider Factory Integration

The system integrates seamlessly with the existing ProviderFactory:

```javascript
// providerFactory.js updated import
const OpenAIHandler = require('./openai/index');

// Existing initialization works unchanged
if (this.apiKeys.openai) {
  this.handlers.openai = new OpenAIHandler(this.apiKeys.openai);
  console.log('✅ OpenAI handler initialized');
}

// All existing methods work unchanged
async handleRequest(modelID, payload) {
  const provider = this.getProviderForModel(modelID);
  const handler = this.getHandler(provider);
  
  return await handler.handleRequest({
    ...payload,
    modelID
  });
}
```

## New Model Support

### Web Search Models Added

The system includes two new web search models in `models.json`:

```json
{
  "gpt-4o-search-preview": {
    "id": "gpt-4o-search-preview",
    "name": "GPT-4o Search: Web-Enabled",
    "provider": "openai",
    "category": "search",
    "source": "core",
    "description": "GPT-4o with integrated web search capabilities",
    "pricing": { "input": 5.00, "output": 15.00, "search": 10.00 },
    "contextWindow": 128000,
    "maxTokens": 16000,
    "supportsVision": true,
    "supportsFunction": true,
    "supportsWebSearch": true,
    "webSearchType": "chat_completions"
  },
  "gpt-4o-mini-search-preview": {
    "id": "gpt-4o-mini-search-preview",
    "name": "GPT-4o Mini Search: Fast Web",
    "provider": "openai",
    "category": "search",
    "source": "core",
    "description": "GPT-4o Mini with integrated web search capabilities",
    "pricing": { "input": 0.15, "output": 0.60, "search": 10.00 },
    "contextWindow": 128000,
    "maxTokens": 16000,
    "supportsVision": true,
    "supportsFunction": true,
    "supportsWebSearch": true,
    "webSearchType": "chat_completions"
  }
}
```

### New Search Category

A dedicated "search" category has been added to the models system:

```json
{
  "categories": {
    "search": {
      "name": "Web Search Models",
      "models": ["gpt-4o-search-preview", "gpt-4o-mini-search-preview"]
    }
  }
}
```

## Error Handling and Fallbacks

### Comprehensive Error Management

```javascript
class OpenAIApiClient {
  handleError(error, endpoint) {
    const errorData = error.response?.data?.error;
    const statusCode = error.response?.status;
    
    let errorType = ERROR_TYPES.API_ERROR;
    
    // Classify error types
    if (statusCode === 401) {
      errorType = ERROR_TYPES.AUTHENTICATION;
    } else if (statusCode === 429) {
      errorType = ERROR_TYPES.RATE_LIMIT;
    } else if (statusCode === 403 && errorData.code === 'quota_exceeded') {
      errorType = ERROR_TYPES.QUOTA_EXCEEDED;
    } else if (statusCode >= 500) {
      errorType = ERROR_TYPES.SERVER_ERROR;
    }
    
    const enhancedError = new Error(`OpenAI API Error: ${errorData.message}`);
    enhancedError.type = errorType;
    enhancedError.statusCode = statusCode;
    enhancedError.endpoint = endpoint;
    
    throw enhancedError;
  }
}
```

### Intelligent Fallback Chains

Each handler implements intelligent fallback mechanisms:

**Image Generation Fallbacks:**
1. GPT Image 1 (primary)
2. DALL-E 3 (fallback)
3. DALL-E 2 (final fallback)

**Audio Transcription Fallbacks:**
1. GPT-4o Transcribe (primary)
2. GPT-4o Mini Transcribe (fallback)
3. Whisper-1 (final fallback)

**TTS Fallbacks:**
1. GPT-4o Mini TTS (primary)
2. TTS-1-HD (fallback)
3. TTS-1 (final fallback)

## Performance Optimizations

### Connection Reuse

The API client implements connection pooling and reuse:

```javascript
class OpenAIApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Axios automatically handles connection pooling
  }
  
  async post(endpoint, data, options = {}) {
    // Reuse connections for better performance
    const response = await axios.post(url, data, config);
    return response;
  }
}
```

### Efficient State Management

The Responses handler efficiently manages conversation state:

```javascript
class ResponsesHandler {
  constructor(apiClient, webSearchService) {
    this.responseCount = 0;
    this.lastResponseId = null;
  }
  
  resetState() {
    this.responseCount = 0;
    this.lastResponseId = null;
  }
  
  getCurrentState() {
    return {
      responseCount: this.responseCount,
      lastResponseId: this.lastResponseId,
      hasState: this.responseCount > 0
    };
  }
}
```

### Intelligent Prompt Enhancement

The image handler includes AI-powered prompt enhancement:

```javascript
async enhanceImagePrompt(userPrompt) {
  const enhancementPrompt = `You are an expert at creating detailed, artistic image generation prompts. Take the user's simple request and expand it into a rich, detailed prompt...`;
  
  try {
    const response = await this.apiClient.chatCompletions({
      model: "gpt-4.1",
      messages: [{ role: "user", content: enhancementPrompt }],
      temperature: 0.7,
      max_tokens: 100
    });
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.warn('Prompt enhancement failed, using original prompt:', error.message);
    return userPrompt;
  }
}
```

## Monitoring and Diagnostics

### Health Checking

```javascript
async healthCheck() {
  try {
    const apiHealth = await this.apiClient.healthCheck();
    
    return {
      healthy: apiHealth.healthy,
      services: {
        apiClient: apiHealth.healthy,
        chatHandler: true,
        responsesHandler: true,
        imageHandler: true,
        audioHandler: true,
        assistantsHandler: true,
        webSearchService: true
      },
      supportedModels: this.getSupportedModels(),
      error: apiHealth.error
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      services: { apiClient: false }
    };
  }
}
```

### Usage Statistics

```javascript
getUsageStats() {
  return {
    totalModels: Object.values(this.getSupportedModels()).flat().length,
    handlers: {
      chat: this.chatHandler.getUsageStats(),
      responses: this.responsesHandler.getUsageStats(),
      image: this.imageHandler.getUsageStats(),
      audio: this.audioHandler.getUsageStats(),
      assistants: this.assistantsHandler.getUsageStats()
    },
    webSearch: this.webSearchService.getSupportedModels()
  };
}
```

### Comprehensive Logging

Each component includes structured logging:

```javascript
console.log(`🔀 Routing ${modelID} to ${provider} provider`);
console.log(`🔍 Web search enabled by default for ${modelID}`);
console.log(`🎨 Starting image generation with prompt: "${prompt}"`);
console.log(`✅ GPT Image 1 successful`);
console.warn(`⚠️ GPT Image 1 failed, trying DALL-E 3 fallback: ${error.message}`);
```

## Migration Benefits

### From Monolithic to Modular

The refactoring provides significant benefits over the original monolithic handler:

**Before (917 lines, single file):**
- Single responsibility violations
- Difficult to test individual components
- Hard to maintain and extend
- Mixed concerns across different APIs

**After (Modular architecture):**
- **Single Responsibility**: Each handler manages one API
- **Testability**: Each component can be unit tested independently
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new OpenAI APIs or features

### Enhanced Capabilities

**New Features Added:**
- **Dual Web Search Support**: Both Chat Completions and Responses API approaches
- **Intelligent Fallbacks**: Robust error recovery across all services
- **State Management**: Proper handling of stateful APIs like Responses
- **Enhanced Configuration**: Comprehensive web search configuration options
- **Capability Detection**: Intelligent model capability detection and routing

**Improved Performance:**
- **Connection Reuse**: Better HTTP connection management
- **Efficient State Tracking**: Optimized state management for conversation continuity
- **Smart Caching**: Intelligent prompt enhancement caching

### Full Backwards Compatibility

All existing functionality is preserved:
- ✅ All original methods work unchanged
- ✅ Same response formats maintained
- ✅ Provider factory integration seamless
- ✅ No breaking changes to existing code
- ✅ Enhanced error handling improves reliability

## Future Extensibility

The modular architecture makes it easy to add new OpenAI features:

### Adding New APIs
```javascript
// Easy to add new specialized handlers
class VisionHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }
  
  async analyzeImage(imageData, prompt) {
    // New vision-specific functionality
  }
}

// Register in main orchestrator
this.visionHandler = new VisionHandler(this.apiClient);
```

### Extending Web Search
```javascript
// Easy to add new web search features
class WebSearchService {
  async addAdvancedWebSearch(requestData, config) {
    // Support for new web search capabilities
    // as OpenAI releases them
  }
}
```

The modular architecture ensures that GPTPortal can quickly adapt to new OpenAI capabilities while maintaining stability and backwards compatibility.