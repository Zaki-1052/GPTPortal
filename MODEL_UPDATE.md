# Model & Provider Update Guide

This document provides comprehensive instructions for adding new AI providers and models to GPTPortal. Follow these steps to ensure complete integration with zero functionality loss.

## What changed in the 2026 refresh (read first)

Several things that used to require manual edits are now automatic. Skim these before following the step-by-step guide — they shrink most tasks:

- **Routing follows the catalog.** `providerFactory.getProviderForModel()` now consults each model's `provider` field in `public/js/data/models.json` **first** (built once into a lookup by `_loadCatalogRoutes()`), and only falls back to string-prefix matching for ids not in the catalog. So **adding a core model to a provider family that already exists needs no `providerFactory` routing edit** — just give it the correct `provider` in `models.json`. You only add a routing branch when introducing a brand-new provider family. Note the catalog uses vendor names `anthropic`/`google`, which alias to the handler keys `claude`/`gemini`.
- **Streaming is a first-class contract.** Any handler that implements `async *streamCompletion(payload)` (yielding `{type:'thinking'|'text'|'error'|'usage'}` events) is auto-detected by `providerFactory.supportsStreaming()` / `handleRequestStream()` and used by the SSE path in `/message`. Handlers without it fall back to a single non-streaming turn. See **Streaming** below.
- **Chat state is per-session.** Conversation/image/file state lives in `req.session.chat`, not process globals. New handlers receive history arrays via the payload and must not stash per-conversation state on the singleton instance.
- **Local / OpenAI-compatible endpoints need no handler.** Ollama, LM Studio, vLLM, LocalAI, or any `{base_url, api_key}` are added purely via `CUSTOM_*` env vars (see **Custom OpenAI-compatible endpoints**). Do **not** write a handler for these.
- **A smoke test guards the catalog.** `npm test` (`scripts/smoke-test.js`) validates `models.json` schema, duplicate keys, category consistency, and that every id routes to an available handler. Run it after any catalog edit.

## Overview

Adding a brand-new provider/model touches the following files across backend, frontend, and configuration. For a new model in an **existing** provider family, most of these are skipped — usually only `models.json` (step 3) is required.

### Files
1. **Handler Implementation**: `src/server/services/providers/{provider}Handler.js`  *(new provider only)*
2. **Provider Factory**: `src/server/services/providers/providerFactory.js`  *(new provider family only — see routing note above)*
3. **Model Configuration**: `public/js/data/models.json`  *(always)*
4. **Environment Config**: `src/server/config/environment.js`  *(new provider only)*
5. **Environment Example**: `.env.example`  *(new provider only)*
6. **Setup Route**: `src/server/routes/setup.js`  *(new provider only)*
7. **Legacy Providers**: `src/server/services/aiProviders.js`  *(new provider only)*
8. **Frontend Display**: `public/js/modules/dynamicModelManager.js`  *(optional — display names/descriptions)*

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

#### 2.3 Add Model Routing (new provider family only)
Routing reads the catalog `provider` field first, so a core model with a correct `provider` in `models.json` already routes. Add a `getProviderForModel()` branch **only** when introducing a new provider family whose ids won't be in the catalog (or that need special prefix handling). Place it before the generic slash → OpenRouter fallback:
```javascript
// {Provider} models
if (modelID.includes('{model-identifier}')) {
  return '{provider}';
}
```
Also add the vendor→handler alias in `_loadCatalogRoutes()` if your catalog `provider` value differs from the handler key (as `anthropic`→`claude`, `google`→`gemini` do).

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
  "id": "string",           // Unique model identifier (routing key)
  "name": "string",         // User-friendly display name
  "provider": "string",     // Vendor name; drives routing (anthropic/google alias to claude/gemini)
  "category": "string",     // Category for grouping (must exist in `categories`)
  "source": "core",         // Catalog entries are "core"; OpenRouter/custom are injected at runtime
  "description": "string",  // Capability description
  "pricing": {              // Per million tokens
    "input": number,
    "output": number,
    "cached": number,       // Optional — cached-read price (prompt caching)
    "cacheWrite": number    // Optional — cache-write price
  },
  "contextWindow": number,  // Maximum context tokens
  "maxTokens": number,      // Maximum output tokens
  "supportsVision": boolean,
  "supportsFunction": boolean,
  "supportsReasoning": boolean,        // Optional — exposes reasoning-effort control
  "defaultReasoningEffort": "string"   // Optional — none|minimal|low|medium|high|xhigh
}
```

> The smoke test (`npm test`) requires `id, name, provider, category, source, description, pricing{input,output}, contextWindow, maxTokens` and non-zero pricing for core models. Keep `provider`/`category` consistent with the routing map and the `categories` block.

## Testing & Verification

### 1. Backend Verification
```bash
# Validate the catalog (schema, dup keys, routing) — run after any models.json edit
npm test

# Check handler initialization
npm start
# Look for "✅ {Provider} handler initialized" in logs

# Test the chat endpoint (note: the route is /message, and it is behind basic auth)
curl -X POST http://localhost:3000/message \
  -u "$USER_USERNAME:$USER_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"modelID": "{model-id}", "message": "Hello"}'

# Confirm routing without booting the server
node -e "const F=require('./src/server/services/providers/providerFactory'); \
  console.log(new F({}).getProviderForModel('{model-id}'))"
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

## Streaming (optional but recommended)

Handlers opt into token streaming by implementing an async generator alongside `handleRequest`:

```javascript
// Yields the streaming contract; providerFactory auto-detects and uses it.
async *streamCompletion(payload) {
  const { user_input, conversationHistory } = payload;
  conversationHistory.push(user_input);            // mirror the non-streaming path
  let text = '';
  // ...open the provider stream...
  for await (const ev of parseOpenAISSE(response.data)) {   // from ./streamUtils
    if (ev.type === 'text') text += ev.value;      // accumulate the answer
    yield ev;                                      // {type:'thinking'|'text'|'error'|'usage'}
  }
  conversationHistory.push({ role: 'assistant', content: text }); // leave history normal
}
```

- OpenAI-compatible providers can reuse `parseOpenAISSE` from `src/server/services/providers/streamUtils.js`; Anthropic-style streams use `parseAnthropicSSE`.
- Emit reasoning/thinking deltas as `{type:'thinking'}` and answer deltas as `{type:'text'}`; end with `{type:'usage', usage}` when the provider reports it.
- No route changes are needed — `/message` already negotiates SSE (`Accept: text/event-stream` or `body.stream:true`) and calls `providerFactory.handleRequestStream()`, which falls back to a single non-streaming turn for handlers without `streamCompletion`.

## Custom OpenAI-compatible endpoints (no handler needed)

Ollama, LM Studio, vLLM, LocalAI, or any `{base_url, api_key}` are added via environment only — the generic `customEndpointHandler.js` + `endpointResolver.js` serve them, and `customEndpointProvider.js` auto-discovers their `/models` into the picker under "Local / Custom Endpoints". Models are addressed as `<prefix>/<model>` (e.g. `ollama/llama3.2`).

```bash
# Single endpoint
CUSTOM_OPENAI_BASE_URL=http://localhost:11434/v1
CUSTOM_OPENAI_API_KEY=ollama
CUSTOM_OPENAI_PREFIX=ollama
CUSTOM_OPENAI_LABEL=Ollama

# Or several (JSON array, one line)
CUSTOM_ENDPOINTS=[{"prefix":"ollama","baseURL":"http://localhost:11434/v1","apiKey":"ollama","label":"Ollama"},{"prefix":"lmstudio","baseURL":"http://localhost:1234/v1","apiKey":"lm-studio","label":"LM Studio"}]
```

Do not add these to `models.json` or `providerFactory` — routing to `custom` is handled by the resolver.

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