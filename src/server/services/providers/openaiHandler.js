// OpenAI Provider Handler - GPT models, o1/o3 reasoning, DALL-E, Whisper, TTS
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class OpenAIHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.oCount = 0; // Counter for o1/o3 models
    this.lastResponseId = null;
    
    // Assistants API state
    this.assistant = null;
    this.thread = null;
    this.assistantId = process.env.ASSISTANT_ID || null;
    this.threadId = process.env.THREAD_ID || null;
    
    // Initialize OpenAI client
    const OpenAI = require('openai').default;
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  /**
   * Handle chat completion for GPT models
   */
  async handleChatCompletion(payload) {
    const { user_input, modelID, systemMessage, conversationHistory, temperature, tokens } = payload;

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
      console.error('OpenAI Chat API Error:', error.message);
      throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle o1/o3 reasoning models
   */
  async handleReasoningCompletion(payload) {
    const { user_input, modelID } = payload;

    let requestData;
    if (this.oCount > 0 && this.lastResponseId) {
      requestData = {
        model: modelID,
        previous_response_id: this.lastResponseId,
        reasoning: { effort: "high", summary: "auto" },
        input: user_input.content,
        store: true,
      };
    } else {
      requestData = {
        model: modelID,
        reasoning: { effort: "high", summary: "auto" },
        input: user_input.content,
        store: true,
      };
    }

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/responses`, requestData, { headers });
      this.oCount++;
      this.lastResponseId = response.data.id;

      // Process o1/o3 response format
      const outputArray = response.data.output;
      let reasoningContent = '';
      let assistantContent = '';
      
      outputArray.forEach(item => {
        if (item.type === 'reasoning' && item.summary) {
          if (Array.isArray(item.summary)) {
            item.summary.forEach(summaryItem => {
              if (typeof summaryItem === 'object' && summaryItem.text) {
                reasoningContent += summaryItem.text + '\n\n';
              } else if (typeof summaryItem === 'string') {
                reasoningContent += summaryItem + '\n\n';
              }
            });
          } else if (typeof item.summary === 'object') {
            if (item.summary.text) {
              reasoningContent += item.summary.text;
            } else {
              reasoningContent += JSON.stringify(item.summary);
            }
          } else {
            reasoningContent += item.summary;
          }
        }
        
        if (item.type === 'message' && item.role === 'assistant') {
          if (typeof item.content === 'object') {
            if (Array.isArray(item.content)) {
              item.content.forEach(contentItem => {
                if (typeof contentItem === 'object' && contentItem.text) {
                  assistantContent += contentItem.text;
                } else if (typeof contentItem === 'string') {
                  assistantContent += contentItem;
                }
              });
            } else if (item.content.text) {
              assistantContent += item.content.text;
            } else {
              assistantContent += JSON.stringify(item.content);
            }
          } else {
            assistantContent += item.content;
          }
        }
      });
      
      // Format the complete message with reasoning if available
      const formattedContent = reasoningContent ? 
        `# Thinking:\n${reasoningContent.trim()}\n\n---\n# Response:\n${assistantContent.trim()}` : 
        assistantContent.trim();
      
      return {
        success: true,
        content: formattedContent,
        reasoning: reasoningContent,
        response: assistantContent,
        responseId: this.lastResponseId
      };
    } catch (error) {
      console.error('OpenAI Reasoning API Error:', error.message);
      throw new Error(`OpenAI Reasoning API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle image generation with DALL-E
   */
  async generateImage(prompt) {
    const requestData = {
      prompt: prompt,
      model: "dall-e-3",
      n: 1,
      quality: 'hd',
      response_format: 'url',
      size: '1024x1024'
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/images/generations`, requestData, { headers });
      const imageUrl = response.data.data[0].url;
      
      return {
        success: true,
        imageUrl: imageUrl,
        prompt: prompt
      };
    } catch (error) {
      console.error('DALL-E API Error:', error.message);
      throw new Error(`DALL-E API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle audio transcription with Whisper
   */
  async transcribeAudio(audioFilePath, filename) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath), filename);
    formData.append('model', 'whisper-1');

    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${this.apiKey}`
    };

    try {
      const response = await axios.post(`${this.baseURL}/audio/transcriptions`, formData, { headers });
      const transcription = "Voice Transcription: " + response.data.text;
      
      return {
        success: true,
        text: transcription
      };
    } catch (error) {
      console.error('Whisper API Error:', error.message);
      throw new Error(`Whisper API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Handle text-to-speech conversion
   */
  async textToSpeech(text) {
    const requestData = {
      model: "tts-1-hd",
      voice: "echo",
      input: text
    };

    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(`${this.baseURL}/audio/speech`, requestData, {
        headers,
        responseType: 'arraybuffer'
      });
      
      return {
        success: true,
        audioData: response.data,
        contentType: 'audio/mpeg'
      };
    } catch (error) {
      console.error('TTS API Error:', error.message);
      throw new Error(`TTS API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Format user input for OpenAI models
   */
  formatUserInput(userMessage, fileContents = null, fileId = null, imageName = null, base64Image = null) {
    const user_input = {
      role: "user",
      content: []
    };

    // Add text content
    if (userMessage) {
      user_input.content.push({ type: "text", text: userMessage });
    }

    // Add file contents
    if (fileContents && fileId) {
      user_input.content.push({ type: "text", text: fileId });
      user_input.content.push({ type: "text", text: fileContents });
    }

    // Add image
    if (base64Image) {
      if (imageName) {
        user_input.content.push({ type: "text", text: imageName });
      }
      user_input.content.push({ type: "image_url", image_url: { url: base64Image } });
    }

    return user_input;
  }

  /**
   * Route request to appropriate handler based on model
   */
  async handleRequest(payload) {
    const { modelID } = payload;

    // Route to reasoning models
    if (modelID.includes('o1') || modelID.includes('o3') || modelID.includes('o4')) {
      return await this.handleReasoningCompletion(payload);
    }

    // Route to standard chat models
    if (modelID.startsWith('gpt')) {
      return await this.handleChatCompletion(payload);
    }

    throw new Error(`Unsupported OpenAI model: ${modelID}`);
  }

  /**
   * Initialize Assistant and Thread for Assistants API
   */
  async initializeAssistantAndThread(modelID, systemMessage) {
    // Use existing assistant if available
    if (!this.assistant && this.assistantId) {
      this.assistant = await this.openai.beta.assistants.retrieve(this.assistantId);
      console.log("Using existing Assistant ID", this.assistant);
    }
    
    // Use existing thread if available
    if (!this.thread && this.threadId) {
      this.thread = await this.openai.beta.threads.retrieve(this.threadId);
      console.log("Using existing Thread ID from .env", this.thread);
    } else if (!this.thread) {
      // Create new assistant if none exists
      if (!this.assistant) {
        this.assistant = await this.openai.beta.assistants.create({
          name: "Assistant",
          instructions: systemMessage,
          tools: [{type: "file_search"}, {type: "code_interpreter"}],
          model: modelID
        });
        console.log("Creating new Assistant:", this.assistant);
      }
      
      // Create new thread
      this.thread = await this.openai.beta.threads.create();
      console.log("New Thread created:", this.thread);
    }
  }

  /**
   * Handle message sending and responses for Assistants API
   */
  async handleAssistantMessage(userMessage) {
    try {
      // Create user message in thread
      let message = await this.openai.beta.threads.messages.create(this.thread.id, {
        role: "user",
        content: userMessage,
      });
      
      // Create run
      let run = await this.openai.beta.threads.runs.create(this.thread.id, {
        assistant_id: this.assistant.id,
      });

      // Poll for run completion
      let runStatus;
      do {
        runStatus = await this.openai.beta.threads.runs.retrieve(this.thread.id, run.id);
        console.log("Run Status:", runStatus.status);

        if (runStatus.status !== 'completed') {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } while (runStatus.status !== 'completed');

      // Fetch messages after completion
      const messages = await this.openai.beta.threads.messages.list(this.thread.id);
      
      // Get latest assistant message
      const sortedAndFilteredMessages = messages.body.data
        .sort((a, b) => b.created_at - a.created_at)
        .filter(msg => msg.role === 'assistant');

      if (sortedAndFilteredMessages.length > 0) {
        const latestAssistantMessage = sortedAndFilteredMessages[0];
        const formattedResponse = latestAssistantMessage.content.map(content => {
          return typeof content.text === 'object' ? content.text.value : content.text;
        }).join('\n');
        
        console.log("Assistant Response:", formattedResponse);
        return { text: formattedResponse };
      } else {
        throw new Error('No assistant messages found in the thread.');
      }
    } catch (error) {
      console.error("Error in assistant message handling:", error);
      throw error;
    }
  }

  /**
   * Attach file to assistant
   */
  async attachFileToAssistant(filePath, filename) {
    try {
      // Upload file to OpenAI
      const openaiFile = await this.openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'assistants'
      });

      // Attach file to assistant
      const assistantFile = await this.openai.beta.assistants.files.create(
        this.assistant.id,
        {
          file_id: openaiFile.id
        }
      );

      console.log("File attached to assistant:", assistantFile);
      return assistantFile;
    } catch (error) {
      console.error("Error attaching file to assistant:", error);
      throw error;
    }
  }

  /**
   * Reset state for new conversation
   */
  resetState() {
    this.oCount = 0;
    this.lastResponseId = null;
    this.assistant = null;
    this.thread = null;
  }
}

module.exports = OpenAIHandler;