# GPTPortal Backend Architecture Documentation

## Overview

GPTPortal is a sophisticated multi-LLM chat interface built with Node.js and Express. The backend provides a unified API for interacting with multiple AI providers including OpenAI, Anthropic Claude, Google Gemini, Groq, Mistral, DeepSeek, and OpenRouter.

## Architecture Principles

### 1. **Modular Design**
- **Separation of Concerns**: Each component has a single responsibility
- **Provider Pattern**: Unified interface for different AI providers
- **Service Layer**: Business logic separated from routing
- **Middleware Pipeline**: Configurable request/response processing

### 2. **Scalability**
- **Service Manager**: Centralized service lifecycle management
- **Caching Strategies**: Token counting and model metadata caching
- **Resource Management**: Memory-efficient model loading and cleanup

### 3. **Reliability**
- **Error Handling**: Comprehensive error management with proper logging
- **Graceful Degradation**: Fallback mechanisms for AI providers
- **Health Checks**: Service monitoring and diagnostics

### 4. **Security**
- **Input Validation**: Comprehensive request validation and sanitization
- **Rate Limiting**: Multi-tier rate limiting for different endpoints
- **Security Headers**: Helmet.js integration for security headers

## Core Components

### 1. Application Core (`src/server/core/`)

#### **Application.js**
Central application orchestrator that manages the entire lifecycle:

```javascript
class Application extends EventEmitter {
  constructor() {
    this.middlewareManager = new MiddlewareManager(config);
    this.serviceManager = new ServiceManager(config);
    this.routeManager = new RouteManager(serviceManager);
    this.errorHandler = new ErrorHandler();
  }
}
```

**Key Features:**
- Event-driven architecture
- Graceful shutdown handling with multiple shutdown mechanisms
- Health monitoring
- Service coordination
- Server instance management for route access

#### **ServiceManager.js**
Manages all application services and their dependencies:

```javascript
class ServiceManager {
  async initialize() {
    this.providerFactory = new ProviderFactory(apiKeys);
    modelSyncService.start();
    // Register all services
  }
}
```

**Services Managed:**
- AI Provider Factory
- Prompt Cache Service
- Model Sync Service
- Token Counting Services
- Cost Calculation Service
- Export Service
- Title Generation Service

#### **RouteManager.js**
Centralized route registration and management:

```javascript
class RouteManager {
  setup(app) {
    this.setupCoreRoutes(app);
    this.setupAPIRoutes(app);
    this.setupAIRoutes(app);
    this.setupFileRoutes(app);
    this.setupAdminRoutes(app);
  }
}
```

**Route Categories:**
- Core application routes (auth, config, setup)
- API routes (models, health, system)
- AI service routes (chat, transcription, TTS, image generation)
- File management routes (upload, processing)
- Administrative routes (export, shutdown, instructions, environment)

### 2. Provider System (`src/server/services/providers/`)

#### **ProviderFactory.js**
Central orchestrator for all AI provider handlers:

```javascript
class ProviderFactory {
  constructor(apiKeys) {
    this.handlers = {
      openai: new OpenAIHandler(apiKeys.openai),
      claude: new ClaudeHandler(apiKeys.claude),
      // ... other providers
    };
  }
  
  async handleRequest(modelID, payload) {
    const provider = this.getProviderForModel(modelID);
    return await this.handlers[provider].handleRequest(payload);
  }
}
```

**Provider Implementations:**
- **OpenAIHandler**: GPT models, o1/o3 reasoning, DALL-E, Whisper, TTS
- **ClaudeHandler**: Anthropic Claude models with thinking support and prompt caching
- **GeminiHandler**: Google Generative AI models
- **GroqHandler**: High-speed inference models
- **MistralHandler**: Mistral AI models
- **DeepSeekHandler**: DeepSeek models
- **OpenRouterHandler**: OpenRouter model proxy

#### **Provider Features:**
- **Intelligent Routing**: Automatic provider selection based on model ID
- **Fallback Mechanisms**: Graceful degradation when providers fail
- **Format Normalization**: Consistent response format across providers
- **Enhanced Capabilities**: Advanced features like Claude thinking, o1 reasoning, prompt caching
- **Prompt Caching**: Intelligent caching for Claude models to reduce costs and latency

### 3. Model Management System

#### **ModelLoader.js** (`src/shared/modelLoader.js`)
Unified model data management:

```javascript
class ModelLoader {
  async loadModels() {
    // Load from unified JSON
    // Support dynamic discovery
    // Cache model metadata
  }
  
  async syncWithAPIs(options) {
    // Sync with provider APIs
    // Update model definitions
    // Preserve core model data
  }
}
```

**Features:**
- Single source of truth for model data
- Dynamic model discovery from provider APIs
- Automatic pricing and capability detection
- Caching and performance optimization

#### **ModelRegistry.js**
Combines core models with OpenRouter models:

```javascript
class ModelRegistry {
  getAllModels() {
    return {
      core: this.getCoreModels(),
      openrouter: this.getOpenRouterModels(),
      combined: { ...coreModels, ...openRouterModels }
    };
  }
}
```

#### **ModelSyncService.js**
Automated model synchronization:

```javascript
class ModelSyncService {
  start(options) {
    // Periodic sync with provider APIs
    // Update model availability
    // Maintain cache freshness
  }
}
```

### 4. Services Layer (`src/server/services/`)

#### **PromptCacheService.js**
Intelligent prompt caching system for Claude models:

```javascript
class PromptCacheService {
  constructor(tokenService, costService, config) {
    this.tokenService = tokenService;
    this.costService = costService;
    this.config = config;
    this.analytics = new Map();
  }
  
  async analyzeCacheStrategy(payload, options) {
    // Analyze content for cache opportunities
    // Determine optimal caching strategy
    // Return cache strategy with cost estimates
  }
  
  async applyCacheControls(payload, strategy) {
    // Apply cache_control parameters to content
    // Support multiple cache breakpoints
    // Graceful degradation on errors
  }
}
```

**Features:**
- **Intelligent Strategy Detection**: Analyzes content to determine optimal caching approach
- **Multiple Cache Strategies**: Conservative, aggressive, system-only, and force modes
- **Token Minimum Validation**: Ensures content meets Claude's minimum token requirements
- **Cost Analysis**: Tracks cache hit/miss rates and cost savings
- **Graceful Degradation**: Falls back to non-cached requests on errors
- **Analytics Tracking**: Comprehensive caching performance metrics

**Cache Strategies:**
- **Conservative** (default): Cache only system messages meeting token minimums
- **Aggressive**: Cache system messages and conversation history with multiple breakpoints
- **System Only**: Cache only system/instruction content
- **Force**: Override minimums and cache all available content

#### **TokenService.js**
Enhanced token counting with caching:

```javascript
class TokenService {
  constructor() {
    this.encoderCache = new Map();
    this.tokenCache = new Map();
    this.setupCacheCleanup();
  }
  
  countTokensWithCache(text, model) {
    // Check cache first
    // Use tiktoken for accuracy
    // Cache results
  }
}
```

**Features:**
- Accurate token counting with tiktoken
- Multi-level caching (encoder + token cache)
- Cache cleanup and memory management
- Performance monitoring

#### **CostService.js**
Unified cost calculation across providers:

```javascript
class CostService {
  async calculateCost(modelId, inputTokens, outputTokens) {
    const pricing = await modelLoader.getModelPricing(modelId);
    return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000000;
  }
}
```

#### **ExportService.js**
Rich HTML export functionality with integrated shutdown capabilities:

```javascript
class ExportService {
  async exportChat(type, data, providerFactory) {
    // Generate rich HTML exports
    // Support multiple chat types (conversation, gemini, assistants)
    // Include metadata, styling, and cost analysis
    // Automatic title and summary generation
  }
}
```

**Export Features:**
- **Multi-format Support**: HTML exports with rich styling and metadata
- **Automatic Titling**: AI-generated titles and summaries for conversations
- **Cost Analysis**: Token usage and cost calculations included in exports
- **Shutdown Integration**: Export-and-shutdown functionality for session management

### 5. Middleware System

#### **MiddlewareManager.js**
Centralized middleware configuration:

- **Security Middleware**: Headers, CORS, rate limiting
- **Body Parsing**: JSON, form data, file uploads
- **Request Logging**: Structured logging with request tracking
- **Validation**: Input validation and sanitization
- **Authentication**: Basic auth and session management

#### **SecurityMiddleware.js**
Comprehensive security measures:

```javascript
class SecurityMiddleware {
  setup(app) {
    this.setupHelmet(app);          // Security headers
    this.setupRateLimiting(app);    // Multi-tier rate limits
    this.setupRequestLimits(app);   // Size and pattern validation
    this.setupAPIKeyValidation(app); // External API access
  }
}
```

**Security Features:**
- **Rate Limiting**: Different limits for general, AI, and image endpoints
- **Request Validation**: Pattern detection for common attacks
- **Security Headers**: CSP, XSS protection, frame options
- **Suspicious Activity Detection**: Pattern-based threat detection

### 6. Utilities (`src/server/utils/`)

#### **Logger.js**
Structured logging system:

```javascript
class Logger {
  constructor(component) {
    this.component = component;
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }
  
  logRequest(req, startTime) {
    // Log request details with timing
  }
  
  logPerformance(operation, duration, meta) {
    // Log performance metrics
  }
}
```

#### **ValidationUtils.js**
Comprehensive input validation:

```javascript
class ValidationUtils {
  validateMessagePayload(payload) {
    // Validate chat message requests
  }
  
  validateFileUpload(file) {
    // Validate file uploads
  }
  
  sanitizeInput(input) {
    // Sanitize user input
  }
}
```

### 7. Error Handling

#### **ErrorHandler.js**
Centralized error management:

```javascript
class ErrorHandler {
  globalErrorHandler(error, req, res, next) {
    // Log error with context
    // Return appropriate response
    // Hide sensitive information in production
  }
  
  static createError(message, code, status, context) {
    // Factory for standardized errors
  }
}
```

**Error Types:**
- Validation errors
- Authentication/authorization errors
- Provider errors
- Rate limit errors
- File upload errors

## API Endpoints

### Chat Endpoints
- `POST /message` - Main chat interface for all providers
- `POST /gemini` - Google Gemini specific endpoint
- `POST /assistant` - OpenAI Assistants API
- `POST /reset` - Reset conversation state

### AI Services
- `POST /transcribe` - Audio transcription (OpenAI/Groq)
- `POST /tts` - Text-to-speech generation
- `POST /generate-image` - Image generation (DALL-E/GPT Image)

### File Management
- `POST /upload-file` - File upload and processing
- `POST /upload-image` - Image upload
- `GET /uploads/:filename` - File serving
- `GET /upload-status/:sessionId` - Check file upload progress and status

### Model Management
- `GET /api/models` - Get all available models
- `GET /api/models/core` - Get core models only
- `GET /api/models/openrouter` - Get OpenRouter models
- `GET /api/models/search?q=query` - Search models
- `POST /api/models/refresh` - Refresh OpenRouter models
- `POST /api/models/sync` - Sync with provider APIs

### Token Analysis
- `POST /api/models/tokens/count` - Count tokens for specific model
- `POST /api/models/tokens/analyze` - Analyze text across multiple models
- `POST /api/models/tokens/calculate-cost` - Calculate usage cost

### System Endpoints
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed service health
- `GET /api/system/status` - System information

### Administrative Endpoints
- `GET /export-chat-html` - Export conversation with automatic server shutdown
- `POST /shutdown-server` - Standalone server shutdown endpoint
- `GET /listChats` - List available chat history files
- `GET /listPrompts` - List available prompt templates
- `POST /setPrompt` - Configure prompt template settings
- `GET /getSummary/:chatName` - Retrieve conversation summary

### Configuration Management
- `GET /get-instructions` - Read system instructions file
- `POST /update-instructions` - Update system instructions
- `GET /get-my-env` - Read environment configuration
- `POST /update-my-env` - Update environment variables

### Context Window API
- `GET /api/models/:modelId/context-window` - Get context window for specific model
- `POST /api/models/context-windows` - Get context windows for multiple models
- `POST /api/context-usage` - Calculate context window usage

### Prompt Caching API
- `GET /api/cache/analytics` - Get prompt caching performance analytics
- `POST /api/cache/strategy` - Analyze optimal caching strategy for content
- `PUT /api/cache/config` - Update prompt caching configuration
- `GET /api/cache/status` - Get caching service health and status

## Prompt Caching System

### Overview

The Prompt Caching System is a modular service that implements Anthropic's prompt caching feature to reduce costs and latency for Claude models. The system provides intelligent caching strategies, comprehensive analytics, and full backward compatibility.

### Key Components

#### **PromptCacheService**
- **Location**: `src/server/services/promptCacheService.js`
- **Purpose**: Core caching logic and strategy determination
- **Dependencies**: TokenService, CostService

#### **Cache Integration**
- **ClaudeHandler Integration**: Seamless integration with existing Claude provider
- **ServiceManager Registration**: Managed as a first-class service
- **Configuration System**: Environment-based configuration with runtime updates

### Supported Models

All Claude models support prompt caching with specific token minimums:
- **Claude 4 Models** (Opus, Sonnet): 1024 token minimum
- **Claude 3.x Models** (3.5 Sonnet, 3.7 Sonnet): 1024 token minimum  
- **Claude Haiku Models** (3.5, 3): 2048 token minimum

### Cache Strategies

#### **Conservative Strategy** (Default)
- Caches only system messages/instructions
- Safest approach with predictable performance
- Ideal for conversations with stable system prompts

#### **Aggressive Strategy**
- Caches system messages and conversation history
- Uses multiple cache breakpoints (up to 4)
- Maximum cost savings but requires careful content analysis

#### **System-Only Strategy**
- Only caches system/instruction content
- Equivalent to conservative but explicit

#### **Force Strategy**
- Overrides token minimums and caches all content
- Used for testing or specific optimization scenarios

### Performance Benefits

#### **Cost Reduction**
- **Cache Hits**: 90% cost reduction (10% of normal input token cost)
- **Cache Writes**: 25% overhead (125% of normal input token cost)
- **Break-even**: Achieved after 1.4 cache hits per cache write

#### **Latency Reduction**
- **Cache Hits**: Up to 80% latency reduction
- **Instant Context**: Previously cached content loads instantly
- **Streaming Benefits**: Faster response initiation

### Analytics and Monitoring

#### **Real-time Metrics**
- Cache hit/miss rates by model
- Token savings and cost analysis
- Performance impact measurement
- Strategy effectiveness tracking

#### **Cost Analysis**
```javascript
{
  overall: {
    requests: 150,
    cacheAttempts: 45,
    cacheHits: 32,
    hitRate: 71.11,
    tokensSaved: 45280,
    costSavingsUSD: 0.6792
  },
  byModel: {
    "claude-3-5-sonnet-latest": {
      cacheHits: 28,
      tokensSaved: 38400,
      costSavingsUSD: 0.576
    }
  }
}
```

### Configuration Options

#### **Environment Variables**
```bash
# Enable/disable prompt caching
CLAUDE_CACHE_ENABLED=true

# Default caching strategy
CLAUDE_CACHE_STRATEGY=conservative

# Enable analytics tracking
CLAUDE_CACHE_ANALYTICS=true

# Maximum cache breakpoints per request
CLAUDE_CACHE_MAX_BREAKPOINTS=4

# Default user preference
CLAUDE_CACHE_DEFAULT_PREFERENCE=auto
```

#### **Runtime Configuration**
- Dynamic strategy updates
- Per-request cache preferences
- Analytics enable/disable
- Strategy performance tuning

### Integration Architecture

#### **Request Flow with Caching**
```
1. Chat Request → ClaudeHandler
2. Cache Strategy Analysis → PromptCacheService
3. Content Analysis → TokenService integration
4. Cache Control Application → Request modification
5. API Request → Anthropic Claude API
6. Response Processing → Cache performance tracking
7. Analytics Update → Cost savings calculation
```

#### **Fallback Mechanisms**
- **Service Unavailable**: Falls back to standard requests
- **Analysis Errors**: Continues without caching
- **Token Minimum Not Met**: Skips caching gracefully
- **Configuration Issues**: Uses safe defaults

### Best Practices

#### **Content Optimization**
- Structure system prompts to exceed token minimums
- Place stable content at prompt beginning
- Use consistent instruction formatting
- Minimize dynamic content in cached sections

#### **Strategy Selection**
- **Conservative**: Production environments, cost-sensitive applications
- **Aggressive**: High-volume applications with stable conversation patterns
- **System-Only**: Applications with minimal system prompt changes

#### **Monitoring**
- Track cache hit rates for optimization opportunities
- Monitor cost savings to validate caching effectiveness
- Analyze token distribution for strategy tuning
- Review error rates for system health

### Security Considerations

#### **Content Safety**
- No sensitive data cached without explicit consent
- Cache content follows same security policies as regular requests
- Analytics data excludes actual content, only metadata

#### **Configuration Security**
- Environment variable validation
- Secure default configurations
- Runtime configuration access controls

## Configuration

### Environment Variables
```bash
# Authentication
USER_USERNAME=admin
USER_PASSWORD=secure_password

# AI Provider API Keys
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
MISTRAL_API_KEY=...
QROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
DEEPSEEK_API_KEY=...

# Server Configuration
PORT_SERVER=3000
HOST=0.0.0.0
LOG_LEVEL=info
NODE_ENV=production

# Model Parameters
TEMPERATURE=1
MAX_TOKENS=8000
DEFAULT_MODEL=gpt-4o

# Prompt Caching Configuration
CLAUDE_CACHE_ENABLED=true
CLAUDE_CACHE_STRATEGY=conservative
CLAUDE_CACHE_ANALYTICS=true
CLAUDE_CACHE_MAX_BREAKPOINTS=4
CLAUDE_CACHE_DEFAULT_PREFERENCE=auto
```

### Configuration Management
- **Environment Validation**: Startup validation of required configuration
- **Dynamic Configuration**: Runtime configuration updates
- **Security**: Sensitive data protection and sanitization

## Performance Optimizations

### Caching Strategies
1. **Token Counting Cache**: Hash-based caching of token calculations
2. **Model Metadata Cache**: Cached model information and pricing
3. **Prompt Caching**: Claude-specific prompt caching for cost and latency reduction
4. **Provider Response Cache**: Optional caching of AI responses
5. **Static Asset Caching**: CDN-ready static file serving

### Memory Management
1. **Token Encoder Caching**: Reuse tiktoken encoders across requests
2. **Automatic Cleanup**: Periodic cache cleanup to prevent memory leaks
3. **Resource Monitoring**: Memory usage tracking and alerts

### Request Optimization
1. **Connection Pooling**: HTTP connection reuse for provider APIs
2. **Streaming Responses**: Support for streaming AI responses
3. **Compression**: Gzip compression for API responses

## Security Features

### Input Validation
- **Payload Validation**: Comprehensive request validation
- **File Upload Security**: Type, size, and content validation
- **Sanitization**: XSS and injection prevention

### Rate Limiting
- **Multi-Tier Limits**: Different limits for different endpoint types
- **IP-Based Tracking**: Per-IP rate limiting with fingerprinting
- **Adaptive Limiting**: Dynamic rate adjustment based on load

### Security Headers
- **CSP**: Content Security Policy for XSS prevention
- **HSTS**: HTTP Strict Transport Security
- **Frame Options**: Clickjacking prevention
- **Content Type Options**: MIME sniffing prevention

## Monitoring and Observability

### Logging
- **Structured Logging**: JSON-formatted logs with metadata
- **Request Tracking**: Request ID propagation
- **Performance Metrics**: Response time and resource usage tracking

### Health Checks
- **Service Health**: Individual service health monitoring
- **Dependency Checks**: External service availability
- **Resource Monitoring**: Memory, CPU, and disk usage

### Metrics
- **Provider Usage**: AI provider request/response metrics
- **Prompt Caching**: Cache hit rates, cost savings, and performance metrics
- **Error Rates**: Error frequency and categorization
- **Performance**: Response times and throughput

## Deployment Considerations

### Environment Support
- **Development**: Local development with hot reloading
- **Production**: Optimized production deployment
- **Vercel**: Serverless deployment support

### Scaling
- **Horizontal Scaling**: Multi-instance deployment support
- **Load Balancing**: Request distribution across instances
- **Database Integration**: Ready for external database integration

### Monitoring
- **Health Endpoints**: Built-in health check endpoints
- **Logging Integration**: Compatible with log aggregation services
- **Metrics Export**: Prometheus-compatible metrics (future)

## Migration from Original Server

The refactored architecture maintains full backward compatibility while providing:

1. **Improved Maintainability**: Modular, well-organized codebase
2. **Enhanced Security**: Comprehensive security measures
3. **Better Performance**: Caching and optimization strategies including prompt caching
4. **Cost Optimization**: Intelligent prompt caching reduces Claude API costs by up to 90%
5. **Robust Error Handling**: Centralized error management
6. **Observability**: Structured logging and monitoring

### Migration Steps
1. **Gradual Migration**: Run both servers in parallel during transition
2. **Feature Parity**: Ensure all original features are preserved
3. **Configuration Transfer**: Migrate environment variables and settings
4. **Testing**: Comprehensive testing of all endpoints and features
5. **Deployment**: Seamless deployment with rollback capability

This architecture provides a solid foundation for future enhancements while maintaining the existing functionality that users depend on.