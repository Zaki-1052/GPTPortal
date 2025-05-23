# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GPTPortal is a multi-LLM chat interface that provides a unified frontend for interacting with various AI providers including OpenAI, Claude, Gemini, Groq, Mistral, OpenRouter, and DeepSeek. The application features a web-based chat interface with conversation history, prompt templates, and comprehensive AI model management.

## Development Commands

- `npm start` - Start the development server with nodemon (watches for changes)
- `node server.js` - Start the production server

## Architecture

### Backend Structure
- **Entry Point**: `server.js` - Main Express server with middleware and route initialization
- **Configuration**: `src/server/config/environment.js` - Environment variables and API key management
- **Routes**: `src/server/routes/` - Modular route handlers for different functionalities
  - `chat.js` - Main chat API endpoints with provider integration
  - `assistant.js` - Assistant-specific functionality  
  - `gemini.js` - Google Gemini integration
  - `setup.js` - Initial configuration setup
  - `config.js` - Configuration management
  - `models.js` - Model metadata and availability

### Provider System
- **Provider Factory**: `src/server/services/providers/providerFactory.js` - Central factory for AI provider handlers
- **Individual Handlers**: `src/server/services/providers/` - Dedicated handlers for each AI provider:
  - `openaiHandler.js`, `claudeHandler.js`, `geminiHandler.js`, `groqHandler.js`, `mistralHandler.js`, `openrouterHandler.js`, `deepseekHandler.js`
- **Model Management**: `src/server/services/modelProviders/` - Model registry and provider-specific model handling

### Core Services
- **Token Management**: `tokenService.js`, `tokenCountService.js` - Token counting and limits
- **Cost Tracking**: `costService.js` - API usage cost calculation
- **Export**: `exportService.js` - Chat export functionality
- **Title Generation**: `titleService.js` - Automatic conversation titles
- **Model Sync**: `modelSyncService.js` - Synchronizes available models from providers

### Frontend Structure
- **Main Interface**: `public/portal.html` - Chat interface with sidebar and prompt templates
- **Application Logic**: `public/js/app.js` - Main application class coordinating all frontend modules
- **Modular Components**: `public/js/modules/`
  - `chatManager.js` - Chat functionality and message handling
  - `uiManager.js` - UI state and interaction management
  - `modelConfig.js` - Model configuration and selection
  - `dynamicModelManager.js` - Dynamic model loading and management

### Configuration
- **Environment Variables**: Required API keys for various providers (OPENAI_API_KEY, CLAUDE_API_KEY, GOOGLE_API_KEY, etc.)
- **Authentication**: Basic HTTP auth via USER_USERNAME and USER_PASSWORD
- **Model Cache**: `src/cache/` - Caches model metadata from providers like OpenRouter

### Key Features
- **Multi-Provider Support**: Unified interface for multiple AI providers
- **Conversation Management**: Persistent chat history with export capabilities
- **Prompt Templates**: Pre-defined prompts stored in `public/uploads/prompts/`
- **File Upload**: Support for image and document uploads
- **Token Tracking**: Real-time token usage and cost estimation
- **Model Selection**: Dynamic model availability based on configured API keys

### Data Flow
1. Frontend sends chat requests to `/api/chat` endpoint
2. Chat router determines appropriate provider based on selected model
3. Provider factory creates/retrieves the appropriate handler
4. Handler processes the request and interfaces with the AI provider
5. Response is processed through token counting, cost tracking, and title generation services
6. Result is returned to frontend and conversation history is updated

The application maintains separate conversation histories for different providers and supports both streaming and non-streaming responses depending on the provider capabilities.