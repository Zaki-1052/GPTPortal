# GPTPortal Frontend Architecture Documentation

## Overview

The GPTPortal frontend is a sophisticated multi-LLM chat interface built with vanilla JavaScript and modern ES6+ features. This documentation covers the refactored, modular architecture that provides better maintainability, performance, and extensibility while maintaining full backward compatibility with the existing backend.

## Architecture Principles

### 1. **Modular Design**
- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Loose Coupling**: Modules communicate through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together
- **Dependency Injection**: Dependencies are injected rather than hard-coded

### 2. **Progressive Enhancement**
- **Graceful Degradation**: Core functionality works even if advanced features fail
- **Feature Detection**: Capabilities are detected before use
- **Fallback Mechanisms**: Multiple fallback strategies for critical functionality

### 3. **Performance Optimization**
- **Lazy Loading**: Modules and features are loaded only when needed
- **Memory Management**: Proper cleanup and resource management
- **Caching Strategies**: Intelligent caching of models, preferences, and data
- **Event Delegation**: Efficient event handling patterns

### 4. **Maintainability**
- **Clear Documentation**: Comprehensive JSDoc comments and documentation
- **Consistent Naming**: Standardized naming conventions throughout
- **Error Handling**: Robust error handling with proper logging
- **Testing Hooks**: Structure supports future testing integration

## Core Architecture

### Module Structure

```
public/js/
├── app.js                     # Main application orchestrator
├── data/
│   └── models.json           # Model definitions and metadata
├── services/
│   ├── contextTracker.js    # Context window tracking service with accurate tiktoken
│   └── tokenCounterClient.js # Client-side accurate token counting service
└── modules/
    ├── portalInit.js         # Portal initialization and enhanced setup controls
    ├── dynamicModelManager.js # Main model management coordinator
    ├── modelSearch.js        # Model searching and filtering
    ├── modelUI.js           # Model selector UI management with custom ordering
    ├── messageHandler.js    # Message display and rendering
    ├── chatManager.js       # Chat functionality with context tracking
    ├── modelConfig.js       # Model configuration
    └── uiManager.js         # UI management
```

## Detailed Module Documentation

### 1. Context Tracker Service (`services/contextTracker.js`)

**Purpose**: Provides real-time context window usage tracking and visualization for all AI models with accurate tiktoken integration.

**Key Responsibilities**:
- Dynamic context window limit retrieval from server API
- **Accurate token counting** using tiktoken instead of 4-character approximation
- Real-time token estimation and usage calculation with visual feedback
- Context window usage visualization with progress indicators
- Integration with chat manager and model selection
- Fallback context window calculation for offline scenarios

**Key Classes**:
- `ContextTracker`: Main context tracking coordinator with tiktoken integration

**API**:
```javascript
// Initialize context tracker
contextTracker.initialize(chatManager, modelConfig);

// Get context window for model
const contextWindow = await contextTracker.getContextWindow('gpt-4o');

// Update indicator with current input (now with accurate counting)
contextTracker.updateIndicator('Current message text...');

// Set current model
contextTracker.setCurrentModel('claude-3-5-sonnet-latest');

// Update conversation history
contextTracker.updateConversationHistory(conversationArray);

// Accurate token estimation (upgraded from 4-char approximation)
const tokens = await contextTracker.estimateTokens(text, modelId);
```

**Enhanced Features**:
- **Accurate Token Counting**: Uses tiktoken library for precise token calculations
- **Visual Accuracy Indicators**: Green checkmark (✓) for accurate counting, orange tilde (~) for estimation
- **Model-Specific Tokenization**: Uses appropriate encoding for each model (cl100k_base, o200k_base)
- **Dynamic Context Limits**: Fetches actual context windows from `models.json` via server API
- **Real-time Tracking**: Updates as user types and conversation progresses with accurate feedback
- **Visual Indicators**: Color-coded progress bar with accuracy indicators
- **Graceful Fallback**: Falls back to improved estimation if tiktoken unavailable
- **Performance Optimized**: Efficient caching and async token counting

**Data Flow**:
1. Server `contextWindowService` reads from `models.json`
2. Client fetches context limits via `/api/models/:modelId/context-window`
3. **Accurate tiktoken-based token counting** for conversation history + current input
4. Visual indicator updates with usage percentage, color coding, and accuracy status

### 2. Portal Initialization Module (`portalInit.js`)

**Purpose**: Manages application initialization and provides backward compatibility with legacy functions.

**Key Responsibilities**:
- Application bootstrap and initialization sequence
- Legacy function registration for backward compatibility
- Global variable management
- Enhanced feature setup (voice, export, keyboard shortcuts)
- Error handling and fallback initialization

**Key Classes**:
- `PortalInitializer`: Main initialization coordinator

**API**:
```javascript
// Initialize the portal
await portalInitializer.initialize();

// Check initialization status
const isReady = portalInitializer.isInitialized();

// Access legacy functions
const legacyFunctions = portalInitializer.getLegacyFunctions();

// Cleanup
portalInitializer.cleanup();
```

**Features**:
- **Progressive Initialization**: Handles both modular and basic initialization paths
- **Legacy Compatibility**: Maintains compatibility with original script.js functions
- **Voice Integration**: Complete voice recording and transcription support
- **File Upload**: Enhanced file upload with drag-and-drop support
- **Keyboard Shortcuts**: Advanced keyboard shortcuts for power users
- **Auto-expanding Textareas**: Dynamic textarea resizing

### 3. Dynamic Model Manager (`dynamicModelManager.js`)

**Purpose**: Central coordinator for model management, delegating specialized tasks to focused modules.

**Key Responsibilities**:
- Model data loading and caching
- Coordination between search and UI managers
- API communication and fallback handling
- Model selection and state management
- Token limit management
- Context tracker integration for model changes

**Key Classes**:
- `DynamicModelManager`: Main coordinator class

**API**:
```javascript
// Get model data
const model = modelManager.getModel('gpt-4o');
const allModels = modelManager.getAllModels();
const categoryModels = modelManager.getModelsByCategory('gpt');

// Search models
const searchResults = modelManager.searchModels('reasoning');

// Select model
modelManager.selectModel('claude-3-5-sonnet-latest');

// Refresh models
await modelManager.refreshModels();
```

**Data Sources**:
1. **Primary**: `/js/data/models.json` (comprehensive model definitions)
2. **Fallback**: `/api/models` (dynamic API endpoint)
3. **Emergency**: Hardcoded core models

### 4. Model Search Manager (`modelSearch.js`)

**Purpose**: Handles all model searching, filtering, and categorization logic.

**Key Responsibilities**:
- Real-time search with debouncing
- Advanced search operators (provider:, category:, etc.)
- Search history management
- OpenRouter model filtering
- Search suggestions and autocomplete

**Key Classes**:
- `ModelSearchManager`: Search functionality coordinator

**API**:
```javascript
// Initialize search
searchManager.initialize(modelManager);

// Perform search
searchManager.performSearch('openai');

// Advanced search
const criteria = searchManager.parseAdvancedSearch('provider:openai vision:true');
const results = searchManager.applyAdvancedSearch(models, criteria);

// Manage preferences
searchManager.setShowOpenRouter(true);
searchManager.loadPreferences();
```

**Search Features**:
- **Debounced Search**: Optimized search with configurable debouncing
- **Advanced Operators**: Support for complex search queries
- **Search History**: Persistent search history with preferences
- **Keyboard Navigation**: Enter to select first result, Escape to clear
- **Search Scoring**: Relevance-based result scoring

### 5. Model UI Manager (`modelUI.js`)

**Purpose**: Manages all model selector UI interactions, animations, and visual elements.

**Key Responsibilities**:
- Dropdown visibility and animations
- Model button creation and styling
- Category collapsing and expanding
- Tooltip management
- Hover effects and visual feedback
- Custom model ordering within categories

**Key Classes**:
- `ModelUIManager`: UI coordination and management

**API**:
```javascript
// Initialize UI
uiManager.initialize(modelManager);

// Populate selector
uiManager.populateModelSelector(models, categories);

// Control dropdown
uiManager.showDropdown();
uiManager.hideDropdown();

// Category management
uiManager.toggleCategoryCollapse('gpt');
```

**UI Features**:
- **Animated Dropdowns**: Smooth show/hide animations
- **Rich Tooltips**: Detailed model information on hover
- **Feature Badges**: Visual indicators for model capabilities
- **Category Collapsing**: Collapsible category sections with state persistence
- **Enhanced Styling**: Modern, responsive design with hover effects
- **Custom Model Ordering**: Intelligent ordering within categories (e.g., GPT-4 → GPT-4 Turbo → GPT-4o for OpenAI models)

### 6. Message Handler (`messageHandler.js`)

**Purpose**: Manages all message display, rendering, and interaction functionality.

**Key Responsibilities**:
- Message rendering with markdown support
- Code block syntax highlighting
- Copy functionality with visual feedback
- Message history management
- Export capabilities

**Key Classes**:
- `MessageHandler`: Message processing and display

**API**:
```javascript
// Display messages
messageHandler.displayMessage('Hello!', 'user');
messageHandler.displayMessage('Response text', 'response', true); // with TTS

// Manage conversation
const history = messageHandler.getConversationHistory();
messageHandler.clearChat();

// Export functionality
const textExport = messageHandler.exportAsText();
const jsonExport = messageHandler.exportAsJSON();
```

**Message Features**:
- **Markdown Rendering**: Full markdown support with syntax highlighting
- **Code Blocks**: Syntax-highlighted code blocks with copy buttons
- **Message Types**: Support for user, assistant, error, system, and image messages
- **Visual Feedback**: Smooth animations and copy confirmations
- **Export Options**: Multiple export formats (text, JSON, HTML)

### 7. Chat Manager (`chatManager.js`)

**Purpose**: Manages all chat functionality including messaging, file uploads, and conversation state.

**Key Responsibilities**:
- Message sending and receiving
- File and image upload handling
- Conversation history management
- Context window tracking integration
- Auto-expanding textarea functionality
- Voice integration and transcription
- Export functionality

**Key Classes**:
- `ChatManager`: Main chat coordination class

**API**:
```javascript
// Send messages
chatManager.sendMessage();

// Display messages
chatManager.displayMessage('Hello!', 'user');
chatManager.displayMessage('Response', 'response', true); // with TTS

// Manage conversation
chatManager.clearChat();
const history = chatManager.conversationHistory;

// Context tracking
chatManager.updateCurrentModel('gpt-4o');

// File handling
chatManager.uploadFile(fileObject);
chatManager.uploadImageAndGetUrl(imageFile);
```

**Enhanced Features**:
- **Context Integration**: Real-time context window tracking via `ContextTracker` service
- **Auto-expanding Textareas**: Dynamic textarea resizing based on content
- **Smart File Handling**: Enhanced file upload with proper validation
- **Conversation State**: Integrated conversation history management
- **Export Capabilities**: Chat export to various formats

### 8. Model Configuration (`modelConfig.js`)

**Purpose**: Manages model configuration, endpoint determination, provider settings, and prompt caching preferences.

**Key Responsibilities**:
- Model selection and endpoint routing
- Prompt caching configuration and preferences
- Claude model detection and caching support validation
- Cache control UI visibility management
- Preference persistence and loading

**Prompt Caching Features**:
- **Claude Model Detection**: Automatically detects Claude models that support caching
- **Cache Preference Management**: Handles user preferences for caching behavior
- **UI Integration**: Shows/hides cache controls based on selected model
- **Persistence**: Saves cache preferences to localStorage
- **Backward Compatibility**: Works seamlessly with existing model configuration

**API**:
```javascript
// Check if current model supports caching
const supported = modelConfig.supportsPromptCaching();

// Update cache preferences
modelConfig.updatePromptCacheEnabled(true);
modelConfig.setPromptCachePreference('conservative');

// Get current cache preference for API requests
const preference = modelConfig.getPromptCachePreference();
```

### 9. UI Manager (`uiManager.js`)

**Purpose**: General UI management for non-model-specific interactions.

**Enhancement Opportunities**:
- Better separation of concerns with ModelUIManager
- Enhanced file upload UI
- Improved sidebar and navigation management

## Prompt Caching Frontend Integration

### Overview

The frontend provides a seamless interface for Claude's prompt caching feature, with intelligent UI controls that appear only when Claude models are selected. The system integrates deeply with the existing model configuration and chat management systems.

### UI Components

#### **Cache Control Toggle**
- **Location**: Model selector controls area
- **Visibility**: Automatically shown/hidden based on selected model
- **Persistence**: User preferences saved to localStorage
- **Integration**: Connected to ModelConfig for state management

#### **Dynamic Visibility**
```javascript
// Cache controls appear only for Claude models
const cacheContainer = document.getElementById('prompt-cache-container');
if (modelConfig.supportsPromptCaching(selectedModel)) {
  cacheContainer.style.display = 'flex';
} else {
  cacheContainer.style.display = 'none';
}
```

### Integration Points

#### **Model Configuration Integration**
- **Automatic Detection**: Detects Claude models that support caching
- **Preference Management**: Handles cache enable/disable state
- **UI Synchronization**: Updates UI controls when models change
- **Default Handling**: Provides sensible defaults for first-time users

#### **Chat Manager Integration**
- **Request Enhancement**: Adds cache preferences to API requests
- **Backward Compatibility**: Works seamlessly with existing chat flow
- **Graceful Degradation**: Falls back gracefully if caching unavailable

#### **State Management**
```javascript
// Cache state is managed alongside other model preferences
const cacheState = {
  enabled: localStorage.getItem('promptCacheEnabled') === 'true',
  preference: localStorage.getItem('promptCachePreference') || 'auto',
  supported: modelConfig.supportsPromptCaching(currentModel)
};
```

### User Experience

#### **Progressive Enhancement**
- Cache controls only appear for supported models
- No disruption to existing workflow for non-Claude models
- Clear visual indicators for cache-enabled conversations
- Tooltip explanations for new users

#### **Smart Defaults**
- Caching disabled by default for conservative approach
- Automatic activation when users select Claude models
- Persistent preferences across browser sessions
- Contextual help and explanations

### Data Flow with Caching

#### **Model Selection with Cache Updates**
```
User Selects Claude Model
    ↓
ModelConfig.selectModel()
    ↓
Update Cache Control Visibility
    ↓
Load Saved Cache Preferences
    ↓
Update UI State
    ↓
Ready for Cache-Enabled Conversations
```

#### **Cache-Enabled Message Flow**
```
User Sends Message
    ↓
Determine Cache Preference
    ↓
Add cachePreference to Payload
    ↓
Backend Applies Cache Strategy
    ↓
Response with Cache Analytics
    ↓
Update UI (potential cost savings indication)
```

### Performance Considerations

#### **Lightweight Integration**
- Minimal additional JavaScript overhead
- Lazy loading of cache-related functionality
- Efficient state synchronization
- No impact on non-Claude model performance

#### **Memory Management**
- Cache preferences stored in localStorage only
- No client-side content caching
- Efficient event listener management
- Proper cleanup on model switches

### Future Enhancements

#### **Cache Analytics UI**
- Visual indicators for cache hit rates
- Cost savings summaries in conversation UI
- Performance metrics dashboard
- Cache strategy recommendations

#### **Advanced Controls**
- Per-conversation cache strategy selection
- Cache breakpoint visualization
- Manual cache control overrides
- Advanced analytics and reporting

## Data Flow Architecture

### 1. Initialization Flow

```
DOM Ready Event
    ↓
PortalInitializer.initialize()
    ↓
GPTPortalApp Creation (app.js)
    ↓
DynamicModelManager.init()
    ↓
ModelSearchManager.initialize()
    ↓
ModelUIManager.initialize()
    ↓
ContextTracker.initialize()
    ↓
Model Data Loading
    ↓
UI Population
    ↓
Event Binding
    ↓
Ready State
```

### 2. Model Selection Flow

```
User Clicks Model
    ↓
ModelUIManager.selectModel()
    ↓
DynamicModelManager.selectModel()
    ↓
Update Global State
    ↓
Update Token Limits
    ↓
Update Context Tracker
    ↓
Hide Dropdown
    ↓
Update Backend Config
```

### 3. Search Flow

```
User Types in Search
    ↓
ModelSearchManager.handleSearchInput()
    ↓
Debounced Search
    ↓
ModelSearchManager.performSearch()
    ↓
DynamicModelManager.filterModels()
    ↓
ModelUIManager.populateModelSelector()
    ↓
Updated UI Display
```

### 4. Message Flow

```
User Sends Message
    ↓
ChatManager.sendMessage()
    ↓
MessageHandler.displayMessage() (user)
    ↓
Cache Preference Determination
    ↓
API Communication (with cache controls)
    ↓
Response Processing
    ↓
MessageHandler.displayMessage() (assistant)
    ↓
History Update
    ↓
Context Tracker Update
    ↓
Optional TTS
```

## State Management

### 1. Application State

**Location**: Distributed across specialized managers
**Persistence**: LocalStorage for preferences, memory for session data

**State Categories**:
- **Model State**: Current selection, available models, categories
- **Search State**: Query, filters, history, preferences
- **UI State**: Dropdown visibility, collapsed categories, tooltips
- **Conversation State**: Message history, current conversation
- **Context State**: Context window usage, token estimates, model limits
- **Cache State**: Prompt caching preferences, cache analytics, cache control visibility
- **Preferences**: User settings, UI preferences, feature flags

### 2. State Synchronization

**Patterns Used**:
- **Observer Pattern**: Components observe relevant state changes
- **Event-Driven Updates**: State changes trigger UI updates
- **Centralized Coordination**: Main managers coordinate state changes
- **Preference Persistence**: User preferences saved to localStorage

### 3. State Recovery

**Mechanisms**:
- **Graceful Degradation**: Fallback states for failed initializations
- **Preference Loading**: Restore user preferences on startup
- **Session Recovery**: Maintain state across page refreshes
- **Error Recovery**: Reset to known good states on errors

## Performance Optimizations

### 1. Loading Optimizations

- **Lazy Module Loading**: Modules loaded only when needed
- **Progressive Enhancement**: Core functionality loads first
- **Debounced Operations**: Search and UI updates are debounced
- **Efficient Event Handling**: Event delegation and cleanup

### 2. Memory Management

- **Resource Cleanup**: Proper cleanup on module destruction
- **Cache Management**: Intelligent cache expiration and cleanup
- **Event Listener Cleanup**: Proper event listener removal
- **Reference Management**: Avoid memory leaks from circular references

### 3. UI Performance

- **Animation Optimization**: CSS transitions over JavaScript animations
- **Efficient DOM Updates**: Batch DOM operations where possible
- **Virtual Scrolling**: For large model lists (future enhancement)
- **Image Optimization**: Lazy loading and compression for generated images

## Error Handling Strategy

### 1. Error Categories

- **Initialization Errors**: Module loading and setup failures
- **Network Errors**: API communication failures
- **Validation Errors**: Input validation and sanitization
- **Runtime Errors**: Unexpected exceptions during operation

### 2. Error Recovery

- **Graceful Degradation**: Core functionality remains available
- **Fallback Mechanisms**: Multiple fallback strategies
- **User Feedback**: Clear error messages and recovery suggestions
- **Logging**: Comprehensive error logging for debugging

### 3. Error Boundaries

- **Module Isolation**: Errors in one module don't crash others
- **Try-Catch Wrapping**: Critical operations wrapped in error handling
- **Promise Rejection Handling**: Proper async error handling
- **Global Error Handler**: Catch-all for unhandled errors

## Browser Compatibility

### 1. Supported Features

- **ES6+ Features**: Modern JavaScript features with fallbacks
- **Fetch API**: With polyfill support for older browsers
- **CSS Grid/Flexbox**: Modern layout with fallbacks
- **Local Storage**: With cookie fallback for storage

### 2. Feature Detection

- **Progressive Enhancement**: Features enabled based on capability
- **Polyfill Loading**: Conditional polyfill loading
- **Fallback Strategies**: Graceful degradation for unsupported features
- **Browser-Specific Handling**: Safari-specific workarounds

### 3. Testing Strategy

- **Cross-Browser Testing**: Manual testing on major browsers
- **Feature Testing**: Automated feature detection tests
- **Compatibility Monitoring**: Error tracking for compatibility issues
- **Progressive Enhancement Validation**: Ensure core functionality works everywhere

## Security Considerations

### 1. Input Sanitization

- **HTML Sanitization**: DOMPurify for safe HTML rendering
- **Markdown Security**: Safe markdown rendering
- **XSS Prevention**: Input validation and output encoding
- **CSRF Protection**: Proper request headers and validation

### 2. Content Security

- **Content Security Policy**: Strict CSP headers
- **Safe Dynamic Content**: Secure dynamic content injection
- **File Upload Security**: Proper file validation and handling
- **API Security**: Secure API communication patterns

## Future Enhancements

### 1. Planned Improvements

- **TypeScript Migration**: Gradual migration to TypeScript
- **Component System**: Move towards a component-based architecture
- **State Management Library**: Consider Redux or similar for complex state
- **Testing Framework**: Comprehensive unit and integration tests

### 2. Feature Roadmap

- **Real-time Collaboration**: Multi-user chat sessions
- **Plugin System**: Extensible plugin architecture
- **Advanced Search**: Full-text search with indexing
- **Accessibility**: Enhanced accessibility features

### 3. Performance Goals

- **Bundle Optimization**: Code splitting and tree shaking
- **Cache Strategies**: Advanced caching and offline support
- **Performance Monitoring**: Real-time performance metrics
- **Mobile Optimization**: Enhanced mobile experience

## Migration Guide

### From Original to Refactored Architecture

1. **Backward Compatibility**: All existing functionality is preserved
2. **Gradual Migration**: Can be deployed alongside existing code
3. **Feature Parity**: All original features are maintained
4. **Enhanced Capabilities**: New features and improved performance
5. **Configuration**: Minimal configuration changes required

### Deployment Considerations

1. **Asset Loading**: New module loading order
2. **Cache Invalidation**: Browser cache considerations
3. **Fallback Support**: Graceful degradation for issues
4. **Monitoring**: Enhanced error tracking and monitoring
5. **Rollback Strategy**: Easy rollback to original implementation

This refactored architecture provides a solid foundation for future development while maintaining the robustness and functionality that users depend on. The modular design makes the codebase more maintainable, testable, and extensible, while the comprehensive error handling and fallback mechanisms ensure reliable operation across different environments and use cases.