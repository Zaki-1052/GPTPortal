# Model & Provider Update Guide

This document provides comprehensive instructions for adding new AI providers and models to GPTPortal. Follow these steps to ensure complete integration with zero functionality loss.

## Overview

Adding a new provider/model requires updates to 8 core files across backend, frontend, and configuration layers:

### Required Files
1. **Handler Implementation**: `src/server/services/providers/{provider}Handler.js`
2. **Provider Factory**: `src/server/services/providers/providerFactory.js`
3. **Model Configuration**: `public/js/data/models.json`
4. **Environment Config**: `src/server/config/environment.js`
5. **Environment Example**: `.env.example`
6. **Setup Route**: `src/server/routes/setup.js`
7. **Legacy Providers**: `src/server/services/aiProviders.js`
8. **Frontend Display**: `public/js/modules/dynamicModelManager.js`

## Step-by-Step Implementation

### Step 1: Create Provider Handler
**File**: `src/server/services/providers/{provider}Handler.js`

Create a new handler class following the established pattern:

```javascript
// {Provider} Provider Handler - {Description}
const axios = require('axios');

class {Provider}Handler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.{provider}.com/v1'; // Provider's API base URL
  }

  /**
   * Handle chat completion
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, conversationHistory, temperature, tokens } = payload;

    // Add user input to conversation history
    conversationHistory.push(user_input);

    const requestData = {
      model: modelID,
      messages: conversationHistory,
      temperature: temperature,
      max_tokens: tokens
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestData, { headers });
      const messageContent = response.data.choices[0].message.content;
      
      // Add assistant response to history
      conversationHistory.push({ role: "assistant", content: messageContent });
      
      return {
        success: true,
        content: messageContent,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('{Provider} API Error:', error.message);
      throw new Error(`{Provider} API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for {provider} models (OpenAI-compatible)
   */
  formatUserInput(userMessage, fileContents = null, fileId = null) {
    let user_input = {
      role: "user",
      content: userMessage || ''
    };

    // Add file contents for text-based models
    if (fileContents && fileId) {
      user_input.content += "\n" + fileId + "\n" + fileContents;
    }

    return user_input;
  }

  /**
   * Handle request routing for {provider} models
   */
  async handleRequest(payload) {
    return await this.handleChatCompletion(payload);
  }
}

module.exports = {Provider}Handler;
```

### Step 2: Update Provider Factory
**File**: `src/server/services/providers/providerFactory.js`

#### 2.1 Add Import
```javascript
const {Provider}Handler = require('./{provider}Handler');
```

#### 2.2 Add Handler Initialization
In `initializeHandlers()` method:
```javascript
if (this.apiKeys.{provider}) {
  this.handlers.{provider} = new {Provider}Handler(this.apiKeys.{provider});
  console.log('✅ {Provider} handler initialized');
}
```

#### 2.3 Add Model Routing
In `getProviderForModel()` method:
```javascript
// {Provider} models
if (modelID.includes('{model-identifier}')) {
  return '{provider}';
}
```

#### 2.4 Add Format User Input Routing
In `formatUserInput()` method:
```javascript
} else if (provider === '{provider}') {
  return handler.formatUserInput(userMessage, fileContents, fileId);
```

### Step 3: Add Model Configuration
**File**: `public/js/data/models.json`

#### 3.1 Add Model Entry
In the `models` section:
```json
"{model-id}": {
  "id": "{model-id}",
  "name": "{Model Display Name}",
  "provider": "{provider}",
  "category": "{category}",
  "source": "core",
  "description": "Model description highlighting key capabilities",
  "pricing": { 
    "input": 0.15, 
    "output": 2.50 
  },
  "contextWindow": 200000,
  "maxTokens": 8000,
  "supportsVision": false,
  "supportsFunction": true,
  "supportsReasoning": true
}
```

#### 3.2 Update Categories
In the `categories` section, either create new category or add to existing:
```json
"{category}": {
  "name": "{Category Display Name}",
  "models": ["existing-model", "{model-id}"]
}
```

### Step 4: Add Environment Configuration
**File**: `src/server/config/environment.js`

Add to the `apiKeys` object:
```javascript
apiKeys: {
  // ... existing keys
  {provider}: process.env.{PROVIDER}_API_KEY
},
```

### Step 5: Update Environment Example
**File**: `.env.example`

Add the API key placeholder:
```bash
{PROVIDER}_API_KEY=your_{provider}_api_key_here
```

### Step 6: Update Setup Routes
**File**: `src/server/routes/setup.js`

#### 6.1 Add to Request Body Destructuring
```javascript
const { 
  // ... existing keys
  {provider}ApiKey
} = req.body;
```

#### 6.2 Add to Environment Content Writing
```javascript
if ({provider}ApiKey) envContent += `{PROVIDER}_API_KEY=${${provider}ApiKey}\n`;
```

### Step 7: Update Legacy Providers
**File**: `src/server/services/aiProviders.js`

Add provider configuration in `initializeAIProviders()`:
```javascript
// {Provider} API
if (apiKeys.{provider}) {
  providers.{provider} = { apiKey: apiKeys.{provider} };
  console.log('{Provider} provider configured');
}
```

### Step 8: Update Frontend Display
**File**: `public/js/modules/dynamicModelManager.js`

#### 8.1 Add Display Name
In `getDisplayName()` method:
```javascript
"{model-id}": "{Model Display Name}",
```

#### 8.2 Add Category Display Name (if new category)
In `getCategoryDisplayName()` method:
```javascript
{category}: '{Category Display Name}',
```

#### 8.3 Add Model Description
In `getModelDescriptions()` method:
```javascript
"{model-id}": "Detailed description of model capabilities and use cases",
```

## File-Specific Patterns

### Handler Implementation Patterns
- **OpenAI-compatible**: Most providers (Groq, Mistral, DeepSeek, Kimi)
- **Custom format**: Gemini, Claude (require special handling)
- **Reasoning models**: DeepSeek-R1, o1 models (special response parsing)

### Provider Factory Routing Logic
- **Model ID patterns**: Use `startsWith()` for prefixes, `includes()` for keywords
- **Provider precedence**: Core models override OpenRouter models
- **Fallback handling**: Unknown models default to OpenRouter

### Model Configuration Schema
```json
{
  "id": "string",           // Unique model identifier
  "name": "string",         // User-friendly display name
  "provider": "string",     // Provider key matching handler
  "category": "string",     // Category for grouping
  "source": "core|openrouter", // Model source
  "description": "string",  // Capability description
  "pricing": {              // Per million tokens
    "input": number,
    "output": number,
    "cached": number        // Optional for cache-enabled models
  },
  "contextWindow": number,  // Maximum context tokens
  "maxTokens": number,      // Maximum output tokens
  "supportsVision": boolean,
  "supportsFunction": boolean,
  "supportsReasoning": boolean
}
```

## Testing & Verification

### 1. Backend Verification
```bash
# Check handler initialization
npm start
# Look for "✅ {Provider} handler initialized" in logs

# Test API endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"modelID": "{model-id}", "message": "Hello"}'
```

### 2. Frontend Verification
1. Check model appears in dropdown under correct category
2. Verify display name and description are correct
3. Test model selection and conversation

### 3. Configuration Verification
```bash
# Verify environment variables
node -e "const config = require('./src/server/config/environment'); console.log(config.config.apiKeys.{provider})"
```

## Troubleshooting

### Common Issues

1. **Handler not initialized**: Check API key is set in environment
2. **Model not in dropdown**: Verify models.json syntax and category exists
3. **Routing errors**: Check model ID pattern in `getProviderForModel()`
4. **Display issues**: Verify frontend display names are added

### Debug Commands

```bash
# Check API key configuration
grep {PROVIDER}_API_KEY .env

# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('public/js/data/models.json', 'utf8'))"

# Test provider factory routing
node -e "
const ProviderFactory = require('./src/server/services/providers/providerFactory');
const factory = new ProviderFactory({});
console.log(factory.getProviderForModel('{model-id}'));
"
```

## Cost Service Integration

**Note**: Cost calculations are automatically handled through the JSON configuration. The `costService.js` uses `modelLoader.getModelPricing()` to dynamically load pricing from `models.json`, so no additional changes are needed.

## Summary Checklist

- [ ] Created provider handler class
- [ ] Updated providerFactory.js (import, init, routing, format)
- [ ] Added model to models.json (model entry + category)
- [ ] Added API key to environment.js
- [ ] Added API key to .env.example
- [ ] Updated setup.js (destructuring + env writing)
- [ ] Updated aiProviders.js (legacy support)
- [ ] Updated dynamicModelManager.js (display names + descriptions)
- [ ] Tested backend initialization
- [ ] Tested frontend model selection
- [ ] Verified conversation functionality

---

*This guide was created based on the implementation of Moonshot AI's Kimi K2 model integration. Adapt patterns as needed for provider-specific requirements.*