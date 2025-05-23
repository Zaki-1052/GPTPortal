// Chat endpoints - extracted from original server.js for modularity
const express = require('express');
const axios = require('axios');
const fs = require('fs');

const router = express.Router();

// Global variables for chat state (preserving original behavior)
let systemMessage = [];
let epochs = 0;
let isAssistants = false;
let temperature = 1;
let tokens = 8000;
let fileContents = null;
let file_id = "";
let imageName = "";
let uploadedImagePath = "";
let isShuttingDown = false;

/**
 * Main chat endpoint - handles all AI model conversations
 * Preserves exact original functionality
 */
router.post('/message', async (req, res) => {
  let response;
  console.log("req.file:", req.file);
  console.log("Received model ID:", req.body.modelID);
  
  const user_message = req.body.message;
  const modelID = req.body.modelID || 'gpt-4o';
  const image_url = req.body.image;
  
  console.log("Received request with size: ", JSON.stringify(req.body).length);
  isAssistants = false;
  
  // Handle temperature parameter
  temperature = req.body.temperature;
  if (process.env.TEMPERATURE) {
    const parsedTemp = parseFloat(process.env.TEMPERATURE);
    if (!isNaN(parsedTemp)) {
      temperature = parsedTemp;
    } else {
      console.error('Invalid TEMPERATURE value in .env file. Using default.');
      if (req.body.temperature) {
        temperature = req.body.temperature;
      } else {
        temperature = 1;
      }
    }
  } else if (req.body.temperature) {
    temperature = req.body.temperature;
  } else {
    temperature = 1;
  }

  // Handle tokens parameter
  if (process.env.MAX_TOKENS) {
    const parsedTokens = parseInt(process.env.MAX_TOKENS);
    if (!isNaN(parsedTokens)) {
      tokens = parsedTokens;
    } else {
      console.error('Invalid MAX_TOKENS value in .env file. Using default.');
      if (req.body.tokens) {
        tokens = enforceTokenLimits(req.body.tokens, modelID);
      } else {
        tokens = 8000;
      }
    }
  } else if (req.body.tokens) {
    tokens = enforceTokenLimits(req.body.tokens, modelID);
  } else {
    tokens = 8000;
  }

  // Check for shutdown command
  if (user_message === "Bye!") {
    console.log("Shutdown message received. Exporting chat and closing server...");
    
    const htmlContent = await exportChatToHTML();
    
    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'attachment; filename="chat_history.html"');
    res.send(htmlContent);
    
    res.end(() => {
      console.log("Chat history sent to client, initiating shutdown...");
      
      if (isShuttingDown) {
        return res.status(503).send('Server is shutting down');
      }
      isShuttingDown = true;
      
      setTimeout(() => {
        console.log("Sending SIGTERM to self...");
        process.kill(process.pid, 'SIGINT');
        server.close(() => {
          console.log("Server successfully shut down.");
          process.exit(99);
        });
      }, 1000);
    });
    
    return;
  }

  let user_input = {
    role: "user",
    content: []
  };

  // Determine the structure of user_input.content based on modelID
  if (modelID.startsWith('gpt') || modelID.startsWith('claude')) {
    if (epochs === 0) {
      if (modelID.startsWith('gpt')) {
        systemMessage = await initializeConversationHistory();
        epochs = epochs + 1;
      } else if (modelID.startsWith('claude')) {
        const instructionsText = await initializeClaudeInstructions();
        const sections = parseInstructionsIntoSections(instructionsText);
        systemMessage = formatSectionsIntoSystemMessage(sections);
        epochs = epochs + 1;
      } else {
        systemMessage = await initializeConversationHistory();
        epochs = epochs + 1;
      }
    }
    
    // Add text content if present
    if (user_message) {
      if (modelID.startsWith('gpt')) {
        user_input.content.push({ type: "text", text: user_message });
      } else if (modelID.startsWith('claude')) {
        user_input.content.push({ type: "text", text: "<user_message>" });
        user_input.content.push({ type: "text", text: user_message });
        user_input.content.push({ type: "text", text: "</user_message>" });
      }
    }

    // Handle file contents
    if (fileContents || (req.body.sessionId && req.app.locals.uploadedFiles?.get(req.body.sessionId))) {
      console.log(fileContents);
      
      if (modelID.startsWith('gpt')) {
        user_input.content.push({ type: "text", text: file_id });
        user_input.content.push({ type: "text", text: fileContents });
      } else if (modelID.startsWith('claude')) {
        if (fileContents) {
          if (file_id.endsWith('.pdf')) {
            user_input.content.push({
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: fileContents
              }
            });
          } else {
            user_input.content.push({ type: "text", text: "<file_name>" });
            user_input.content.push({ type: "text", text: file_id });
            user_input.content.push({ type: "text", text: "</file_name>" });
            user_input.content.push({ type: "text", text: "<file_contents>" });
            user_input.content.push({ type: "text", text: fileContents });
            user_input.content.push({ type: "text", text: "</file_contents>" });
          }
        }
        
        const uploadedFiles = req.body.sessionId ? req.app.locals.uploadedFiles?.get(req.body.sessionId) : null;
        if (uploadedFiles) {
          for (const file of uploadedFiles) {
            if (file.type === 'pdf') {
              user_input.content.push({
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: file.contents
                }
              });
            } else {
              user_input.content.push({ type: "text", text: "<file_name>" });
              user_input.content.push({ type: "text", text: file.file_id });
              user_input.content.push({ type: "text", text: "</file_name>" });
              user_input.content.push({ type: "text", text: "<file_contents>" });
              user_input.content.push({ type: "text", text: file.contents });
              user_input.content.push({ type: "text", text: "</file_contents>" });
            }
          }
          req.app.locals.uploadedFiles.delete(req.body.sessionId);
        }
      }
      
      fileContents = null;
    }

    // Handle images
    if (req.body.image) {
      let base64Image;
      if (req.file) {
        console.log("first if", req.file.path);
        base64Image = imageToBase64(req.file.path);
      } else {
        console.log("second if", req.body.image);
        base64Image = await imageURLToBase64(req.body.image);
      }
      
      if (base64Image) {
        if (modelID.startsWith('gpt')) {
          user_input.content.push({ type: "text", text: imageName });
        }
        if (modelID.startsWith('claude')) {
          const [mediaPart, base64Data] = base64Image.split(';base64,');
          const mediaType = mediaPart.split(':')[1];
          user_input.content.push({ type: "text", text: "<image_name>" });
          user_input.content.push({ type: "text", text: imageName });
          user_input.content.push({ type: "text", text: "</image_name>" });
          user_input.content.push({ type: "text", text: "<image_content>" });
          user_input.content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data
            }
          });
          user_input.content.push({ type: "text", text: "</image_content>" });
        } else {
          user_input.content.push({ type: "image_url", image_url: { url: base64Image } });
        }
        
        fs.unlink(uploadedImagePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
          console.log("Temp file deleted");
        });
      }
    }
  } else {
    // Handle other models (Mistral, etc.)
    systemMessage = await initializeConversationHistory();
    epochs = epochs + 1;
    
    user_input = {
      role: "user",
      content: ''
    };
    
    if (user_message) {
      user_input.content = user_message;
    }

    if (fileContents) {
      console.log(fileContents);
      user_input.content += "\n";
      user_input.content += file_id;
      user_input.content += "\n";
      user_input.content += fileContents;
      fileContents = null;
    }
  }

  // Route to appropriate AI provider based on model
  try {
    if (modelID.startsWith('gpt') || modelID.startsWith('o1') || modelID.startsWith('o3')) {
      response = await handleOpenAIRequest(user_input, modelID, systemMessage, temperature, tokens);
    } else if (modelID.startsWith('claude')) {
      response = await handleClaudeRequest(user_input, modelID, systemMessage, temperature, tokens);
    } else if (modelID.startsWith('gemini')) {
      response = await handleGeminiRequest(user_input, modelID, systemMessage, temperature, tokens);
    } else if (modelID.startsWith('llama') || modelID.includes('groq')) {
      response = await handleGroqRequest(user_input, modelID, systemMessage, temperature, tokens);
    } else if (modelID.startsWith('mistral') || modelID.includes('codestral')) {
      response = await handleMistralRequest(user_input, modelID, systemMessage, temperature, tokens);
    } else if (modelID.startsWith('deepseek')) {
      response = await handleDeepSeekRequest(user_input, modelID, systemMessage, temperature, tokens);
    } else {
      // Default to OpenRouter for unknown models
      response = await handleOpenRouterRequest(user_input, modelID, systemMessage, temperature, tokens);
    }
    
    res.json({ response: response });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process message', 
      details: error.message 
    });
  }
});

// Helper functions (placeholders - these would need to be implemented)
async function initializeConversationHistory() {
  // Implementation from original server
  return [];
}

async function initializeClaudeInstructions() {
  // Implementation from original server
  return "";
}

function parseInstructionsIntoSections(text) {
  // Implementation from original server
  return [];
}

function formatSectionsIntoSystemMessage(sections) {
  // Implementation from original server
  return [];
}

function enforceTokenLimits(requestedTokens, modelID) {
  // Implementation from original server
  const maxTokens = getMaxTokensByModel(modelID);
  const minTokens = 1000;
  return Math.min(Math.max(parseInt(requestedTokens) || 8000, minTokens), maxTokens);
}

function getMaxTokensByModel(modelID) {
  // Implementation from original server
  if (modelID === 'gpt-4') {
    return 6000;
  } else if (modelID === 'gpt-4o-mini' || modelID === 'gpt-4o') {
    return 16000;
  } else if (modelID.startsWith('llama-3.1')) {
    return 8000;
  } else if (modelID === 'claude-3-7-sonnet-latest') {
    return 100000;
  } else if (modelID.startsWith('claude')) {
    return 8000;
  } else {
    return 8000;
  }
}

async function exportChatToHTML() {
  // Implementation from original server
  return "<html><body>Chat history</body></html>";
}

function imageToBase64(filePath) {
  // Implementation from original server
  return "";
}

async function imageURLToBase64(url) {
  // Implementation from original server
  return "";
}

// AI Provider handlers (these would contain the actual API calls)
async function handleOpenAIRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // OpenAI API implementation
  throw new Error("OpenAI handler not implemented yet");
}

async function handleClaudeRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // Claude API implementation
  throw new Error("Claude handler not implemented yet");
}

async function handleGeminiRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // Gemini API implementation
  throw new Error("Gemini handler not implemented yet");
}

async function handleGroqRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // Groq API implementation
  throw new Error("Groq handler not implemented yet");
}

async function handleMistralRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // Mistral API implementation
  throw new Error("Mistral handler not implemented yet");
}

async function handleDeepSeekRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // DeepSeek API implementation
  throw new Error("DeepSeek handler not implemented yet");
}

async function handleOpenRouterRequest(userInput, modelID, systemMessage, temperature, tokens) {
  // OpenRouter API implementation
  throw new Error("OpenRouter handler not implemented yet");
}

module.exports = router;