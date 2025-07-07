OpenAI Handler Refactoring Plan

     Current State Analysis

     The OpenAI handler is currently a monolithic class (917 lines) handling multiple responsibilities:
     - Chat completions (GPT models)
     - Reasoning models (o1/o3/o4) using Responses API
     - Image generation (DALL-E, GPT Image 1)
     - Audio transcription (Whisper, GPT-4o transcribe)
     - Text-to-speech (TTS models)
     - Assistants API

     Proposed Architecture

     1. Modular Handler Structure

     Break the monolithic openaiHandler.js into specialized modules:

     providers/openai/
     ├── index.js                    # Main OpenAI handler (orchestrator)
     ├── handlers/
     │   ├── chatHandler.js          # Chat Completions API
     │   ├── responsesHandler.js     # Responses API (reasoning + future web search)
     │   ├── imageHandler.js         # Image generation
     │   ├── audioHandler.js         # Transcription & TTS
     │   └── assistantsHandler.js    # Assistants API
     ├── services/
     │   ├── webSearchService.js     # Web search implementation
     │   └── apiClient.js            # Shared API client
     └── utils/
         ├── formatters.js           # Input/output formatting
         └── constants.js            # API endpoints, models, etc.

     2. Web Search Implementation

     For Chat Completions API:
     - Add support for gpt-4o-search-preview and gpt-4o-mini-search-preview models
     - Implement web_search_options parameter with location and context size
     - Handle URL citations in response annotations

     For Responses API:
     - Implement web search as a tool similar to Claude's approach
     - Support for standard GPT models (gpt-4.1, gpt-4o, etc.) with web search tool
     - Handle semantic events and state management

     3. API Compatibility Layer

     Create adapters to maintain backwards compatibility:
     - ChatCompletionsAdapter: Wraps new modular handlers for existing chat API
     - ResponsesAdapter: Handles Responses API with proper event handling
     - Unified response format that works with existing frontend

     4. Implementation Steps

     1. Create base structure (new directories and files)
     2. Extract chat functionality to chatHandler.js
     3. Extract reasoning functionality to responsesHandler.js
     4. Add web search support for both APIs
     5. Extract image generation to imageHandler.js
     6. Extract audio functionality to audioHandler.js
     7. Extract assistants functionality to assistantsHandler.js
     8. Create unified orchestrator in index.js
     9. Update provider factory to use new structure
     10. Add web search models to models.json
     11. Test backwards compatibility

     5. Web Search Features

     - Model Support:
       - Chat Completions: gpt-4o-search-preview, gpt-4o-mini-search-preview
       - Responses API: All GPT models with web search tool
     - Configuration Options:
       - User location (country, city, region, timezone)
       - Search context size (low, medium, high)
       - Domain filtering (allowed/blocked domains)
     - Response Handling:
       - URL citations with start/end indices
       - Inline citations in content
       - Proper citation display in UI

     6. Key Benefits

     - Modularity: Each handler has single responsibility
     - Maintainability: Easier to update individual features
     - Extensibility: Simple to add new OpenAI features
     - Reusability: Shared utilities and services
     - Testing: Easier to unit test individual modules
     - Performance: Can optimize specific handlers independently

     Migration Strategy

     1. Phase 1: Create new structure without breaking existing code
     2. Phase 2: Gradually move functionality to new modules
     3. Phase 3: Update provider factory to use new structure
     4. Phase 4: Remove old code after verification
