# Claude Web Search Implementation Documentation

## Overview

This document provides detailed technical documentation for the web search feature implementation in the Claude provider handler. The web search capability allows Claude models to access real-time information from the internet, automatically citing sources in responses.

## Implementation Details

### Supported Models

The web search feature is available for the following Claude models:
- `claude-opus-4-20250514` (Claude Opus 4)
- `claude-sonnet-4-20250514` (Claude Sonnet 4)
- `claude-3-7-sonnet-latest` (Claude 3.7 Sonnet)
- `claude-3-5-sonnet-latest` (Claude 3.5 Sonnet)
- `claude-3-5-sonnet-20241022` (Claude 3.5 Sonnet dated version)
- `claude-3-5-haiku-latest` (Claude 3.5 Haiku)
- `claude-3-5-haiku-20241022` (Claude 3.5 Haiku dated version)

### API Integration

The web search tool is integrated using Anthropic's official API specification:

```javascript
const webSearchTool = {
  type: "web_search_20250305",
  name: "web_search"
};
```

### Default Behavior

Web search is **enabled by default** for all supported models. When a supported Claude model is used, the web search tool is automatically included in the API request:

```javascript
// Check if web search is supported for this model
const supportsWebSearch = [
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-latest',
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-latest',
  'claude-3-5-haiku-20241022'
].includes(modelID);

// Add web search tool by default for supported models
if (supportsWebSearch) {
  const webSearchTool = {
    type: "web_search_20250305",
    name: "web_search"
  };
  
  // Add tools array to request data
  requestData.tools = [webSearchTool];
  
  console.log(`🔍 Web search enabled by default for ${modelID}`);
}
```

### Request Structure

When web search is enabled, the API request includes a `tools` array:

```json
{
  "model": "claude-3-5-sonnet-latest",
  "max_tokens": 4096,
  "temperature": 0.7,
  "system": "System message content",
  "messages": [...],
  "tools": [{
    "type": "web_search_20250305",
    "name": "web_search"
  }]
}
```

### Optional Configuration (Currently Disabled)

The implementation includes commented-out support for advanced configuration options. These can be enabled in the future by uncommenting the relevant code:

#### Disabling Web Search

To make web search optional rather than default:

1. Uncomment the conditional check:
```javascript
// if (webSearchConfig && supportsWebSearch) {
if (supportsWebSearch) {  // Change this line
```

2. Pass `webSearchConfig: false` in the payload to disable web search for specific requests.

#### Advanced Configuration Options

The following configuration options are implemented but currently commented out:

```javascript
webSearchConfig: {
  maxUses: 5,                                    // Maximum number of searches
  allowedDomains: ['example.com'],               // Whitelist domains
  blockedDomains: ['untrusted.com'],            // Blacklist domains
  userLocation: {                                // Location-based results
    type: 'approximate',
    city: 'San Francisco',
    region: 'California',
    country: 'US'
  }
}
```

To enable these options:
1. Uncomment the parameter processing code in the `handleChatCompletion` method
2. Pass the configuration object in the payload

### How Web Search Works

1. **Automatic Detection**: Claude automatically determines when web search would be helpful based on the query
2. **Query Generation**: Claude generates targeted search queries
3. **Search Execution**: The API performs the web search
4. **Result Analysis**: Claude analyzes search results for relevant information
5. **Response Generation**: Claude provides a comprehensive answer with citations

### Cost Implications

- Web search costs $10 per 1,000 searches
- Standard token costs apply in addition to search costs
- Each search counts against the usage limit

### Backward Compatibility

The implementation maintains full backward compatibility:
- Existing code continues to work without modification
- The `webSearchConfig` parameter is optional
- Models that don't support web search are unaffected
- No breaking changes to the API interface

### Error Handling

Web search errors are handled gracefully:
- If web search fails, Claude continues with its base knowledge
- Error messages are logged but don't break the conversation
- The response indicates if web search was unavailable

### Example Usage

Basic usage (web search enabled by default):
```javascript
const response = await claudeHandler.handleChatCompletion({
  user_input: { role: "user", content: "What's the latest news about AI?" },
  modelID: 'claude-3-5-sonnet-latest',
  systemMessage: "You are a helpful assistant",
  claudeHistory: [],
  temperature: 0.7,
  tokens: 4096
});
```

Future usage with configuration (when enabled):
```javascript
const response = await claudeHandler.handleChatCompletion({
  user_input: { role: "user", content: "Search for Python documentation" },
  modelID: 'claude-3-5-sonnet-latest',
  systemMessage: "You are a helpful assistant",
  claudeHistory: [],
  temperature: 0.7,
  tokens: 4096,
  webSearchConfig: {
    maxUses: 3,
    allowedDomains: ['docs.python.org', 'python.org']
  }
});
```

### Security Considerations

1. **Domain Filtering**: The implementation supports domain whitelisting/blacklisting (currently disabled)
2. **Search Limits**: Maximum search count can be configured to prevent abuse
3. **Source Citations**: All web-sourced information includes citations for verification
4. **API Key Security**: Web search uses the same secure API key handling as other Claude features

### Monitoring and Debugging

- Console logs indicate when web search is enabled: `🔍 Web search enabled by default for [model]`
- Search usage can be tracked through the API response's usage field
- Errors are logged to the console for debugging

### Future Enhancements

1. **Configurable Defaults**: Allow server-level configuration of default web search behavior
2. **Usage Analytics**: Track web search usage patterns and costs
3. **Caching**: Implement search result caching to reduce costs
4. **Fine-grained Control**: Per-conversation or per-message web search control
5. **Custom Search Providers**: Support for alternative search backends

## Implementation Checklist

- [x] Add web search tool type constant
- [x] Implement model support detection
- [x] Add web search tool to request payload
- [x] Enable by default for supported models
- [x] Include optional configuration structure (commented)
- [x] Update JSDoc documentation
- [x] Add console logging for debugging
- [x] Maintain backward compatibility
- [x] Document pricing implications
- [x] Create technical documentation

## References

- [Anthropic Web Search Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/web-search-tool)
- [Anthropic API Reference](https://docs.anthropic.com/en/api)
- [Claude Model Documentation](https://docs.anthropic.com/en/docs/models)