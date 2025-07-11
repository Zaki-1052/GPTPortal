// src/server/services/providers/openai/handlers/assistantsHandler.js
// Assistants API handler for OpenAI

const fs = require('fs');

class AssistantsHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.assistant = null;
    this.thread = null;
    this.assistantId = process.env.ASSISTANT_ID || null;
    this.threadId = process.env.THREAD_ID || null;
  }

  /**
   * Initialize Assistant and Thread for Assistants API
   */
  async initializeAssistantAndThread(modelID, systemMessage) {
    // Use existing assistant if available
    if (!this.assistant && this.assistantId) {
      const response = await this.apiClient.getAssistant(this.assistantId);
      this.assistant = response.data;
      console.log("Using existing Assistant ID", this.assistant);
    }
    
    // Use existing thread if available
    if (!this.thread && this.threadId) {
      const response = await this.apiClient.getThread(this.threadId);
      this.thread = response.data;
      console.log("Using existing Thread ID from .env", this.thread);
    } else if (!this.thread) {
      // Create new assistant if none exists
      if (!this.assistant) {
        const assistantData = {
          name: "Assistant",
          instructions: systemMessage,
          tools: [{type: "file_search"}, {type: "code_interpreter"}],
          model: modelID
        };
        const response = await this.apiClient.createAssistant(assistantData);
        this.assistant = response.data;
        console.log("Creating new Assistant:", this.assistant);
      }
      
      // Create new thread
      const response = await this.apiClient.createThread();
      this.thread = response.data;
      console.log("New Thread created:", this.thread);
    }
  }

  /**
   * Handle message sending and responses for Assistants API
   */
  async handleAssistantMessage(userMessage) {
    try {
      // Create user message in thread
      let messageData = {
        role: "user",
        content: userMessage,
      };
      let message = await this.apiClient.createMessage(this.thread.id, messageData);
      
      // Create run
      let runData = {
        assistant_id: this.assistant.id,
      };
      let run = await this.apiClient.createRun(this.thread.id, runData);

      // Poll for run completion
      let runStatus;
      do {
        const response = await this.apiClient.getRun(this.thread.id, run.data.id);
        runStatus = response.data;
        console.log("Run Status:", runStatus.status);

        if (runStatus.status !== 'completed') {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } while (runStatus.status !== 'completed');

      // Fetch messages after completion
      const messagesResponse = await this.apiClient.listMessages(this.thread.id);
      const messages = messagesResponse.data;
      
      // Get latest assistant message
      const sortedAndFilteredMessages = messages.data
        .sort((a, b) => b.created_at - a.created_at)
        .filter(msg => msg.role === 'assistant');

      if (sortedAndFilteredMessages.length > 0) {
        const latestAssistantMessage = sortedAndFilteredMessages[0];
        const formattedResponse = latestAssistantMessage.content.map(content => {
          return typeof content.text === 'object' ? content.text.value : content.text;
        }).join('\n');
        
        console.log("Assistant Response:", formattedResponse);
        return { 
          success: true,
          content: formattedResponse,
          type: 'assistant'
        };
      } else {
        throw new Error('No assistant messages found in the thread.');
      }
    } catch (error) {
      console.error("Error in assistant message handling:", error);
      throw error;
    }
  }

  /**
   * Fetch all messages from the current thread
   */
  async fetchThreadMessages() {
    try {
      if (!this.thread) {
        throw new Error('No thread available. Initialize assistant first.');
      }

      const messagesResponse = await this.apiClient.listMessages(this.thread.id);
      
      if (messagesResponse && messagesResponse.data) {
        // Sort messages by created_at in chronological order (oldest first)
        const sortedMessages = messagesResponse.data.data.sort((a, b) => a.created_at - b.created_at);
        return sortedMessages;
      } else {
        console.error("Failed to fetch messages or no messages available.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching thread messages:", error);
      return [];
    }
  }

  /**
   * Attach file to assistant
   */
  async attachFileToAssistant(filePath, filename) {
    try {
      // Upload file to OpenAI
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('purpose', 'assistants');
      
      const fileResponse = await this.apiClient.uploadFile(formData);
      const openaiFile = fileResponse.data;

      // Note: File attachment to assistants has changed in the API
      // This is a simplified version - actual implementation may need updates
      console.log("File uploaded:", openaiFile);
      return openaiFile;
    } catch (error) {
      console.error("Error attaching file to assistant:", error);
      throw error;
    }
  }

  /**
   * Reset assistant state
   */
  resetState() {
    this.assistant = null;
    this.thread = null;
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return {
      hasAssistant: !!this.assistant,
      hasThread: !!this.thread,
      assistantId: this.assistant?.id || null,
      threadId: this.thread?.id || null
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      apiType: 'Assistants',
      currentState: this.getCurrentState()
    };
  }
}

module.exports = AssistantsHandler;