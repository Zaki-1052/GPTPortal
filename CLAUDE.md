# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GPTPortal is a Node.js-based multi-modal chat application that provides a unified interface for multiple LLM APIs including OpenAI GPT-4, Anthropic Claude, Google Gemini, Mistral AI, and others. It features a web-based chat interface with support for voice, images, file uploads, and custom prompt templates.

## Architecture

- **Backend**: Express.js server (`server.js`) handling API routing and LLM integrations
- **Frontend**: Static HTML/CSS/JS served from `public/` directory
  - `portal.html` - Main chat interface
  - `script.js` - Frontend logic and API communication
  - `chat.css` - Styling
- **File Structure**:
  - `public/uploads/` - User uploaded files and chat backups
  - `public/uploads/prompts/` - Custom prompt templates
  - `public/uploads/chats/` - Chat history storage

## Development Commands

- **Start development server**: `npm start` (uses nodemon for auto-reload)
- **Default port**: 3000 (configurable via `PORT_SERVER` env var)
- **Docker**: Use `docker-compose up` with provided docker-compose.yml

## Key Configuration

- Environment variables in `.env` file control:
  - API keys for various LLM providers (OPENAI_API_KEY, GOOGLE_API_KEY, etc.)
  - Authentication (USER_USERNAME, USER_PASSWORD)
  - Model parameters (TEMPERATURE, MAX_TOKENS)
- Authentication uses express-basic-auth when credentials are provided
- File uploads handled via multer with 50MB limit

## API Integration Points

The server integrates with multiple LLM providers through dedicated endpoints:
- OpenAI GPT models (including Assistants API)
- Anthropic Claude models 
- Google Gemini models
- Mistral AI models
- Meta LLaMA via Groq
- OpenRouter for additional models

Each provider has specific token limits and pricing models enforced in `enforceTokenLimits()` and `getMaxTokensByModel()` functions.

## Frontend Architecture

- Model selection dropdown with search and OpenRouter toggle
- Chat history sidebar with conversation management
- Prompt templates sidebar for reusable system instructions
- Voice recording, image upload, and file upload capabilities
- Real-time token cost calculations and conversation export

## Important Implementation Notes

- Token limits are model-specific and enforced server-side
- File concatenation system for handling large text uploads
- Chat history stored as JSON files in `public/uploads/chats/`
- Graceful shutdown on "Bye!" command
- Image generation triggered by "Generate:" prefix
- Markdown rendering with DOMPurify sanitization

## Refactored Architecture (Available)

The codebase has been refactored into a modular structure while maintaining full backward compatibility:

**Server Modules** (in `src/server/`):
- `config/environment.js` - Configuration management
- `middleware/auth.js` - Authentication handling
- `middleware/upload.js` - File upload processing
- `services/aiProviders.js` - AI provider initialization
- `services/modelService.js` - Model utilities and token management
- `routes/setup.js` - Setup and configuration endpoints
- `routes/config.js` - Basic API routes

**Frontend Modules** (in `public/js/modules/`):
- `modelConfig.js` - Model selection and configuration
- `chatManager.js` - Chat functionality and conversation handling
- `uiManager.js` - UI controls and interface management
- `app.js` - Main application coordinator

**Usage**: Both original (`server.js`, `script.js`) and refactored (`server-new.js`, modular JS) versions available. See `REFACTORING_GUIDE.md` for detailed migration information.