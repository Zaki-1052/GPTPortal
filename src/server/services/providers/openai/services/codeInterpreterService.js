// src/server/services/providers/openai/services/codeInterpreterService.js

/**
 * Code Interpreter service for OpenAI Responses API
 * Provides Python code execution capabilities with file generation and processing
 */
class CodeInterpreterService {
  constructor() {
    // Models that support Code Interpreter via Responses API
    this.supportedModels = [
      'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini',
      'gpt-4.1-nano', 'o1', 'o1-preview', 'o1-mini', 'o3', 'o3-mini', 'o4', 'o4-mini'
    ];
  }

  /**
   * Check if a model supports Code Interpreter
   * @param {string} modelId - The model identifier
   * @returns {boolean} Whether the model supports Code Interpreter
   */
  supportsCodeInterpreter(modelId) {
    return this.supportedModels.some(pattern => modelId.includes(pattern));
  }

  /**
   * Add Code Interpreter tool to Responses API request
   * @param {Object} requestData - The API request data
   * @param {Object} codeInterpreterConfig - Configuration for Code Interpreter
   * @returns {Object} Modified request data with Code Interpreter tool
   */
  addCodeInterpreterToResponses(requestData, codeInterpreterConfig = {}) {
    try {
      // Don't add if explicitly disabled
      if (codeInterpreterConfig === false) {
        return requestData;
      }

      const codeInterpreterTool = this.formatCodeInterpreterTool(codeInterpreterConfig);
      
      // Initialize tools array if it doesn't exist
      if (!requestData.tools) {
        requestData.tools = [];
      }

      // Add Code Interpreter tool
      requestData.tools.push(codeInterpreterTool);

      console.log(`🐍 Code Interpreter tool added to request for enhanced Python capabilities`);
      
      return requestData;
    } catch (error) {
      console.error('❌ Error adding Code Interpreter tool:', error.message);
      // Return original request data on error (graceful degradation)
      return requestData;
    }
  }

  /**
   * Format Code Interpreter tool for Responses API
   * @param {Object} config - Code Interpreter configuration
   * @returns {Object} Formatted tool object
   */
  formatCodeInterpreterTool(config = {}) {
    const tool = {
      type: "code_interpreter"
    };

    // Handle container configuration
    if (config.containerId) {
      // Use explicit container ID
      tool.container = config.containerId;
    } else if (config.container && typeof config.container === 'object') {
      // Use provided container object
      tool.container = config.container;
    } else {
      // Default to auto mode for simplicity
      tool.container = { type: "auto" };
    }

    // Add files to container if specified
    if (config.files && Array.isArray(config.files)) {
      if (tool.container.type === "auto") {
        tool.container.files = config.files;
      }
    }

    return tool;
  }

  /**
   * Extract Code Interpreter results from Responses API output
   * @param {Array} outputArray - The output array from Responses API
   * @returns {Object} Extracted code execution results and file citations
   */
  extractCodeInterpreterResults(outputArray) {
    const results = {
      codeExecutions: [],
      generatedFiles: [],
      hasCodeExecution: false,
      containerUsed: null
    };

    try {
      outputArray.forEach(item => {
        // Extract code execution tool calls
        if (item.type === 'tool_use' && item.name === 'python') {
          results.codeExecutions.push({
            input: item.input || '',
            output: item.output || '',
            error: item.error || null
          });
          results.hasCodeExecution = true;
        }

        // Extract container information from code interpreter calls
        if (item.type === 'code_interpreter_call') {
          results.containerUsed = item.container_id;
        }

        // Extract file citations from assistant messages
        if (item.type === 'message' && item.role === 'assistant' && item.content) {
          item.content.forEach(contentItem => {
            if (contentItem.annotations) {
              contentItem.annotations.forEach(annotation => {
                if (annotation.type === 'container_file_citation') {
                  results.generatedFiles.push({
                    fileId: annotation.file_id,
                    filename: annotation.filename,
                    containerId: annotation.container_id,
                    startIndex: annotation.start_index,
                    endIndex: annotation.end_index
                  });
                }
              });
            }
          });
        }
      });

      return results;
    } catch (error) {
      console.error('❌ Error extracting Code Interpreter results:', error.message);
      return results;
    }
  }

  /**
   * Process Code Interpreter response and format for unified response
   * @param {Object} response - Raw API response
   * @returns {Object} Processed response with Code Interpreter metadata
   */
  processCodeInterpreterResponse(response) {
    try {
      if (!response.output) {
        return response;
      }

      const codeResults = this.extractCodeInterpreterResults(response.output);
      
      // Add Code Interpreter metadata to response
      if (codeResults.hasCodeExecution) {
        response.codeInterpreter = {
          used: true,
          executions: codeResults.codeExecutions.length,
          generatedFiles: codeResults.generatedFiles.length,
          containerId: codeResults.containerUsed,
          files: codeResults.generatedFiles
        };

        console.log(`🐍 Code Interpreter executed ${codeResults.codeExecutions.length} code blocks, generated ${codeResults.generatedFiles.length} files`);
      }

      return response;
    } catch (error) {
      console.error('❌ Error processing Code Interpreter response:', error.message);
      return response;
    }
  }

  /**
   * Get configuration for Code Interpreter based on use case
   * @param {string} useCase - The intended use case ('auto', 'math', 'data_analysis', 'visualization')
   * @returns {Object} Optimized configuration
   */
  getOptimizedConfig(useCase = 'auto') {
    const configs = {
      auto: {
        container: { type: "auto" }
      },
      math: {
        container: { type: "auto" },
        instructions: "You are a math tutor. Use Python to solve mathematical problems step by step."
      },
      data_analysis: {
        container: { type: "auto" },
        instructions: "You are a data analyst. Use Python with pandas, numpy, and matplotlib for data analysis."
      },
      visualization: {
        container: { type: "auto" },
        instructions: "You are a data visualization expert. Create clear, informative charts and graphs using matplotlib, seaborn, or plotly."
      }
    };

    return configs[useCase] || configs.auto;
  }

  /**
   * Health check for Code Interpreter service
   * @returns {Object} Service health status
   */
  healthCheck() {
    return {
      service: 'CodeInterpreterService',
      status: 'healthy',
      supportedModels: this.supportedModels.length,
      capabilities: [
        'Python code execution',
        'File generation and processing',
        'Data analysis and visualization',
        'Mathematical computations',
        'Container management'
      ]
    };
  }
}

module.exports = CodeInterpreterService;