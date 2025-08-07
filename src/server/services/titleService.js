// Title generation service for AI-powered chat naming and summarization
const fs = require('fs');
const path = require('path');

class TitleService {
  constructor() {
    this.maxTitleLength = 200;
  }

  /**
   * Generate a unique file path to avoid conflicts
   */
  getUniqueFilePath(basePath, baseTitle) {
    let counter = 1;
    let fileName = `${baseTitle}.txt`;
    let filePath = path.join(basePath, fileName);

    while (fs.existsSync(filePath)) {
      counter++;
      fileName = `${baseTitle}-${counter}.txt`;
      filePath = path.join(basePath, fileName);
    }

    return filePath;
  }

  /**
   * Generate title using OpenAI
   */
  async generateTitleWithOpenAI(history, openaiHandler) {
    try {
      const titlePrompt = {
        role: "user", 
        content: history
      };

      const payload = {
        user_input: titlePrompt,
        modelID: 'gpt-5-nano',
        systemMessage: 'You will be given the contents of a conversation between a Human and an AI Assistant. Please title this chat by summarizing the topic of the conversation in under 5 plaintext words. Ignore the System Message and focus solely on the User-AI interaction. This will be the name of the file saved via Node, so keep it *extremely* short and concise! Examples: "Friendly AI Assistance", "Install Plex Media Server", "App Layout Feedback", "Calculating Indefinite Integrals", or "Total Cost Calculation", etc. The title should resemble a quick and easy reference point for the User to remember the conversation, and follow smart and short naming conventions. Do NOT use any special symbols; simply return the words in plaintext without any formatting, markdown, quotes, etc. The title needs to be compatible with a Node.js filename, so it needs to be short! Output should consist of a few words only, or there will be a ENAMETOOLONG error!.',
        conversationHistory: [
          { role: 'system', content: 'You will be given the contents of a conversation between a Human and an AI Assistant. Please title this chat by summarizing the topic of the conversation in under 5 plaintext words. Ignore the System Message and focus solely on the User-AI interaction. This will be the name of the file saved via Node, so keep it *extremely* short and concise! Examples: "Friendly AI Assistance", "Install Plex Media Server", "App Layout Feedback", "Calculating Indefinite Integrals", or "Total Cost Calculation", etc. The title should resemble a quick and easy reference point for the User to remember the conversation, and follow smart and short naming conventions. Do NOT use any special symbols; simply return the words in plaintext without any formatting, markdown, quotes, etc. The title needs to be compatible with a Node.js filename, so it needs to be short! Output should consist of a few words only, or there will be a ENAMETOOLONG error!.' },
          { role: 'user', content: history }
        ],
        claudeHistory: [],
        o1History: [],
        deepseekHistory: [],
        temperature: 0.4,
        tokens: 10
      };

      const result = await openaiHandler.handleRequest(payload);
      if (result.success) {
        let title = result.content.trim().replace(/ /g, '_');
        if (title.length > this.maxTitleLength) {
          title = 'chat_history';
        }
        return title;
      }
    } catch (error) {
      console.error("Error generating title with OpenAI:", error);
    }
    
    return 'chat_history';
  }

  /**
   * Generate summary using OpenAI
   */
  async generateSummaryWithOpenAI(history, openaiHandler) {
    try {
      const summaryPrompt = {
        role: "user",
        content: history
      };

      const payload = {
        user_input: summaryPrompt,
        modelID: 'gpt-5-nano',
        systemMessage: 'You will be shown the contents of a conversation between a Human and an AI Assistant. Please summarize this chat in a brief paragraph consisting of no more than 4-6 sentences. Ignore the System Message and focus solely on the User-AI interaction. This description will be appended to the chat file for the user and AI to reference. Keep it extremely concise but thorough, shortly covering all important context necessary to retain.',
        conversationHistory: [
          { role: 'system', content: 'You will be shown the contents of a conversation between a Human and an AI Assistant. Please summarize this chat in a brief paragraph consisting of no more than 4-6 sentences. Ignore the System Message and focus solely on the User-AI interaction. This description will be appended to the chat file for the user and AI to reference. Keep it extremely concise but thorough, shortly covering all important context necessary to retain.' },
          { role: 'user', content: history }
        ],
        claudeHistory: [],
        o1History: [],
        deepseekHistory: [],
        temperature: 1,
        tokens: 200
      };

      const result = await openaiHandler.handleRequest(payload);
      if (result.success) {
        return result.content;
      }
    } catch (error) {
      console.error("Error generating summary with OpenAI:", error);
    }
    
    return "No summary could be generated.";
  }

  /**
   * Generate title and summary using OpenAI (main titleChat function)
   */
  async titleChat(history, tokens, cost, openaiHandler) {
    try {
      // Generate both title and summary
      const title = await this.generateTitleWithOpenAI(history, openaiHandler);
      const summary = await this.generateSummaryWithOpenAI(history, openaiHandler);

      console.log("Generated Title: ", title);
      const folderPath = path.join(__dirname, '../../../public/uploads/chats');
      
      // Ensure the nested folder exists
      fs.mkdirSync(folderPath, { recursive: true });

      // Get a unique file path
      const filePath = this.getUniqueFilePath(folderPath, title);

      // Create chat file content
      const chatText = `${history}\n---\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: ¢${cost.toFixed(6)}\n\n-----\n\nCONTEXT: Above, you may be shown a conversation between the User -- a Human -- and an AI Assistant (yourself). If not, a summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;

      fs.writeFileSync(filePath, chatText);
      console.log(`Chat history saved to ${filePath}`);
      
      return { title, summary };
    } catch (error) {
      console.error("Error in titleChat:", error);
      return { title: 'chat_history', summary: 'Error generating summary' };
    }
  }

  /**
   * Generate title using Gemini (for Gemini chats)
   */
  async generateTitleWithGemini(chatHistory, geminiHandler) {
    try {
      const titlePrompt = `You will be given the contents of a conversation between a Human and an AI Assistant. Please title this chat by summarizing the topic of the conversation in under 5 plaintext words. Ignore the System Message and focus solely on the User-AI interaction. This will be the name of the file saved via Node, so keep it *extremely* short and concise! Examples: "Friendly AI Assistance", "Install Plex Media Server", "App Layout Feedback", "Calculating Indefinite Integrals", or "Total Cost Calculation", etc. The title should resemble a quick and easy reference point for the User to remember the conversation, and follow smart and short naming conventions. Do NOT use any special symbols; simply return the words in plaintext without any formatting, markdown, quotes, etc. The title needs to be compatible with a Node.js filename.\n\n${chatHistory}`;

      const payload = {
        user_input: { content: titlePrompt },
        modelID: 'gemini-1.5-flash',
        geminiHistory: '',
        temperature: 1,
        tokens: 50
      };

      const result = await geminiHandler.handleRequest(payload);
      if (result.success) {
        return result.content.trim().replace(/ /g, '_');
      }
    } catch (error) {
      console.error("Error generating title with Gemini:", error);
    }
    
    return 'gemini_chat';
  }

  /**
   * Generate summary using Gemini
   */
  async generateSummaryWithGemini(chatHistory, geminiHandler) {
    try {
      const summaryPrompt = `You will be shown the contents of a conversation between a Human and an AI Assistant. Please summarize this chat in a brief paragraph consisting of no more than 4-6 sentences. Ignore the System Message and focus solely on the User-AI interaction. This description will be appended to the chat file for the user and AI to reference. Keep it extremely concise but thorough, shortly covering all important context necessary to retain.\n\n----\n\n${chatHistory}`;

      const payload = {
        user_input: { content: summaryPrompt },
        modelID: 'gemini-1.5-flash',
        geminiHistory: '',
        temperature: 1,
        tokens: 200
      };

      const result = await geminiHandler.handleRequest(payload);
      if (result.success) {
        return result.content;
      }
    } catch (error) {
      console.error("Error generating summary with Gemini:", error);
    }
    
    return "No summary could be generated.";
  }

  /**
   * Name chat using Gemini (nameChat function for Gemini)
   */
  async nameChat(chatHistory, tokens, geminiHandler) {
    try {
      const title = await this.generateTitleWithGemini(chatHistory, geminiHandler);
      const summary = await this.generateSummaryWithGemini(chatHistory, geminiHandler);

      console.log("Generated Title: ", title);
      const folderPath = path.join(__dirname, '../../../public/uploads/chats');
      
      // Ensure the nested folder exists
      fs.mkdirSync(folderPath, { recursive: true });

      const filePath = this.getUniqueFilePath(folderPath, title);

      // Create chat file content (free model, so no cost)
      const chatText = `${chatHistory}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $0.00!\n\n-----\n\nCONTEXT: Above, you may be shown a conversation between the User -- a Human -- and an AI Assistant (yourself). If not, a summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;

      fs.writeFileSync(filePath, chatText);
      console.log(`Chat history saved to ${filePath}`);
      
      return { title, summary };
    } catch (error) {
      console.error("Error in nameChat:", error);
      return { title: 'gemini_chat', summary: 'Error generating summary' };
    }
  }

  /**
   * Generate title for assistant chats
   */
  async titleAssistantChat(history, tokens, cost, openaiHandler) {
    // Similar to titleChat but adapted for assistant format
    return await this.titleChat(history, tokens, cost, openaiHandler);
  }

  /**
   * Just return a simple title (returnTitle function)
   */
  async returnTitle(history, openaiHandler) {
    return await this.generateTitleWithOpenAI(history, openaiHandler);
  }

  /**
   * Format chat history for title generation
   */
  formatHistoryForTitleGeneration(chatHistory, chatType = 'chat') {
    if (chatType === 'gemini') {
      return chatHistory; // Already in string format
    }
    
    // Convert chat history to a formatted string
    return chatHistory.map(entry => {
      let formattedEntry = '';

      if (entry.role === 'system') {
        formattedEntry = `System: **You are an advanced *Large Language Model* serving as a helpful AI assistant, highly knowledgeable across various domains, and capable of performing a wide range of tasks with precision and thoroughness.**`;
      } else if (entry.role === 'user' || entry.role === 'assistant') {
        const role = entry.role.charAt(0).toUpperCase() + entry.role.slice(1);
        if (Array.isArray(entry.content)) {
          formattedEntry = `${role}: ${entry.content.map(item => {
            if (item.type === 'text') {
              return item.text;
            } else if (item.type === 'image_url') {
              return `[Image: ${item.image_url.url}]`;
            }
            return '';
          }).join(' ')}\n`;
        } else if (typeof entry.content === 'string') {
          formattedEntry = `${role}: \n${entry.content}\n`;
        }
      }

      return formattedEntry;
    }).join('\n');
  }
}

// Create singleton instance
const titleService = new TitleService();

module.exports = titleService;