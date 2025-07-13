// importing required node packages

let isShuttingDown = false;
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const { marked } = require('marked');
const app = express();
const bodyParser = require('body-parser');
// Increase the limit for JSON bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.json()); // for parsing application/json
app.use(express.static('public')); // Serves your static files from 'public' directory
const download = require('image-downloader');
const cors = require('cors');
app.use(cors());
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

let temperature = process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 1;

let tokens = process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 8000;

// Add this function to enforce token limits
function getMaxTokensByModel(modelID) {
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
    return 8000; // Default for other models
  }
}

// Function to enforce token limits
function enforceTokenLimits(requestedTokens, modelID) {
  const maxTokens = getMaxTokensByModel(modelID);
  const minTokens = 1000;
  return Math.min(Math.max(parseInt(requestedTokens) || 8000, minTokens), maxTokens);
}

console.log(`The current temperature is: ${temperature}`);

// openai
/*
const OpenAI = require('openai').default;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});
*/

const OpenAI = require('openai').default;

// Check if the OPENAI_API_KEY environment variable is set
const apiKey = process.env.OPENAI_API_KEY;

let openai; // Declare openai outside the conditional block

if (!apiKey) {
  console.warn("Warning: The OPENAI_API_KEY environment variable is missing. OpenAI features will be disabled.");
} else {
  // Initialize OpenAI only if the API key is present
  openai = new OpenAI({
    apiKey: apiKey
  });
}

// integrate google gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const googleGenerativeAI = require("@google/generative-ai");
const HarmBlockThreshold = googleGenerativeAI.HarmBlockThreshold;
const HarmCategory = googleGenerativeAI.HarmCategory;

// Authenticates your login

// Basic Authentication users
const username = process.env.USER_USERNAME;
const password = process.env.USER_PASSWORD;

if (username && password) {
  const users = {
    [username]: password
  };

  // Apply basic authentication middleware
  app.use(basicAuth({
    users: users,
    challenge: true
  }));
  // Allow access to the '/portal' route
  app.get('/portal', (req, res) => {
    res.sendFile('portal.html', { root: 'public' });
  });

  // Redirect all other routes (except for '/config' and '/setup') to '/portal'
  app.get('*', (req, res, next) => {
    if (req.path !== '/setup') {
      next();
    } else {
      res.redirect('/portal');
    }
  });
} else {
  // Redirect to the setup page if username and password are not set
  app.get('*', (req, res, next) => {
    if (req.path !== '/portal') {
      next();
    } else {
      res.redirect('/setup');
    }
  });
}


app.get('/setup', (req, res) => {
  res.sendFile('setup.html', { root: 'public' });
});

app.post('/setup', (req, res) => {
  const { username, password, openaiApiKey, claudeApiKey, googleApiKey, mistralApiKey, groqApiKey, openrouterApiKey, codestralApiKey } = req.body;

  let envContent = `USER_USERNAME=${username}\nUSER_PASSWORD=${password}\n`;

  if (openaiApiKey) {
    envContent += `OPENAI_API_KEY=${openaiApiKey}\n`;
  }
  if (claudeApiKey) {
    envContent += `CLAUDE_API_KEY=${claudeApiKey}\n`;
  }
  if (googleApiKey) {
      envContent += `GOOGLE_API_KEY=${googleApiKey}\n`;
  }
  if (mistralApiKey) {
      envContent += `MISTRAL_API_KEY=${mistralApiKey}\n`;
  }
  if (groqApiKey) {
      envContent += `GROQ_API_KEY=${groqApiKey}\n`;
  }
  if (openrouterApiKey) {
      envContent += `OPENROUTER_API_KEY=${openrouterApiKey}\n`;
  }
  if (codestralApiKey) {
      envContent += `CODESTRAL_API_KEY=${codestralApiKey}\n`;
  }

  fs.writeFileSync('.env', envContent);

  res.json({ message: 'Environment variables successfully written' });

// Allow access to the '/portal' route
app.get('/portal', (req, res) => {
  res.sendFile('portal.html', { root: 'public' });
});

// Redirect all other routes (except for '/config' and '/setup') to '/portal'
app.get('*', (req, res, next) => {
  if (req.path === '/portal' || req.path === '/config' || req.path === '/model') {
    next();
  } else {
    res.redirect('/portal');
  }
});

});

app.get('/get-env', (req, res) => {
  const envContent = fs.readFileSync('.env', 'utf-8');
  res.send(envContent);
});

app.post('/update-env', (req, res) => {
  const newEnvContent = req.body.envContent;
  fs.writeFileSync('.env', newEnvContent);
  res.send('Environment variables updated successfully.');
});


// Endpoint to restart the server
app.post('/restart-server', (req, res) => {
  /*
  fs.appendFile('.env.example', '\nRESTART=TRUE', (err) => {
    if (err) {
      console.error('Failed to write to .env.example:', err);
      return res.status(500).send('Failed to write to .env.example');
    }
    res.send('Server is restarting...');
  });
  */
  
  server.close(() => {
    console.log("Server successfully shut down.");
    process.exit(0);
}, 100); // 1-second delay
});


// Serve uploaded files from the 'public/uploads' directory
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(filename, { root: 'public/uploads' });
});

app.use('/uploads', express.static('public/uploads'));

// image uploads

// File handling configurations
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/uploads';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
},
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);
    cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
  }
});

// Simplified Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 32 * 1024 * 1024, // 32MB
    files: 10
  }
});

// Simplified uploadMiddleware
const uploadMiddleware = (req, res, next) => {
  const uploadHandler = req.get('X-Upload-Mode') === 'multiple' ? 
      upload.array('file', 10) : 
      upload.single('file');
  
  uploadHandler(req, res, (err) => {
      if (err) {
          console.error('Upload error:', err);
          return res.status(400).json({ 
              error: err.message || 'Upload failed',
              details: err
          });
      }
      next();
  });
};
// Helper function to convert file to base64
async function fileToBase64(filePath) {
  try {
    const data = await fs.promises.readFile(filePath);
    return data.toString('base64');
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw error;
  }
}

// Helper function to check PDF page count
async function getPDFPageCount(filePath) {
  try {
    const pdfDoc = await pdf(fs.readFileSync(filePath));
    return pdfDoc.numPages;
  } catch (error) {
    console.error('Error counting PDF pages:', error);
    throw error;
  }
}

// const upload = multer({ storage: storage });



const FormData = require('form-data');
const path = require('path');

// transcribing audio with Whisper api

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  let transcription = "";
  try {
    // Use the direct path of the uploaded file
    const uploadedFilePath = req.file.path;

    // Create FormData and append the uploaded file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(uploadedFilePath), req.file.filename);
    let transcriptionResponse;
    if (process.env.QROQ_API_KEY) {
      formData.append('model', 'whisper-large-v3');

      // API request
      transcriptionResponse = await axios.post(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        formData,
        { 
          headers: { 
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.QROQ_API_KEY}` 
          } 
        }
      );
    } else {
      formData.append('model', 'whisper-1');

      // API request
      transcriptionResponse = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        { 
          headers: { 
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` 
          } 
        }
      );
    }
    

    // Cleanup: delete the temporary file
    fs.unlinkSync(uploadedFilePath);

    // Prepend "Voice Transcription: " to the transcription
    transcription = "Voice Transcription: " + transcriptionResponse.data.text;

    // Send the modified transcription back to the client
    res.json({ text: transcription });

    // Reset the transcription variable for future use
    transcription = ""; // Reset to empty string

  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    res.status(500).json({ error: "Error transcribing audio", details: error.message });
  }
});



// function to run text to speech api

app.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;

    // Call the OpenAI TTS API
    const ttsResponse = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      { model: "tts-1-hd", voice: "echo", input: text },
      { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }, responseType: 'arraybuffer' }
    );

    // Send the audio file back to the client
    res.set('Content-Type', 'audio/mpeg');
    res.send(ttsResponse.data);
  } catch (error) {
    console.error('Error generating speech:', error.message);
    res.status(500).json({ error: "Error generating speech", details: error.message });
  }
});



// END

// image generation 

// Endpoint for handling image generation requests
app.post('/generate-image', async (req, res) => {
  const prompt = req.body.prompt;
  
  try {
    // Call to DALL·E API with the prompt
    const dalResponse = await axios.post('https://api.openai.com/v1/images/generations', {
      prompt: prompt,
      model: "dall-e-3",
      n: 1,
      quality: 'hd',
      response_format: 'url',
      size: '1024x1024'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    // Extract the image URL from the response
    const imageUrl = dalResponse.data.data[0].url;

    // Define a path to save the image
    const uploadsDir = path.join(__dirname, 'public/uploads');
    const imagePath = path.join(uploadsDir, `generated-${Date.now()}.jpg`);

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Download and save the image
    try {
        await download.image({ url: imageUrl, dest: imagePath });
        res.json({ imageUrl: imageUrl });
    } catch (error) {
        console.error('Error saving image:', error);
        res.status(500).json({ error: "Error saving image", details: error.message });
    }

  } catch (error) {
    console.error('Error calling DALL·E API:', error.message);
    res.status(500).json({ error: "Error calling DALL·E API", details: error.message });
  }
});


// custom instructions read

let continueConv = false;
let chosenChat = '';
let summariesOnly = true; // Default to summaries only
let customPrompt = false;
let chosenPrompt = '';


// Endpoint to list available prompts
app.get('/listPrompts', async (req, res) => {
  try {
    const promptDir = path.join(__dirname, 'public', 'uploads', 'prompts');
    const files = fs.readdirSync(promptDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const promptInfo = {};
    for (const file of markdownFiles) {
      const content = fs.readFileSync(path.join(promptDir, file), 'utf8');
      const nameMatch = content.match(/## \*\*(.*?)\*\*/);
      const descriptionMatch = content.match(/### Description\s*\n\s*\*(.*?)\./s);
      
      promptInfo[file.replace('.md', '')] = {
        name: nameMatch ? nameMatch[1].trim() : file.replace('.md', ''),
        description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available'
      };
    }
    
    res.json({ files: markdownFiles, promptInfo });
  } catch (error) {
    console.error('Error reading prompt directory:', error);
    res.status(500).json({ error: 'Error reading prompt directory' });
  }
});

// Endpoint to get a specific prompt's details
app.post('/setPrompt', async (req, res) => {
  const { chosenPrompt } = req.body;
  const promptFile = path.join(__dirname, 'public', 'uploads', 'prompts', `${chosenPrompt}.md`);
  
  try {
      const data = fs.readFileSync(promptFile, 'utf8');
      const promptData = parsePromptMarkdown(data);
      res.json({ prompt: promptData });
  } catch (error) {
      console.error('Error reading prompt file:', error);
      res.status(500).json({ error: 'Error reading prompt file' });
  }
});

let promptName;
// Endpoint to handle copying the prompt
app.post('/copyPrompt', async (req, res) => {
  try {
      const { chosenPrompt } = req.body;
      customPrompt = true;
      promptName = chosenPrompt;
      instructions = await readInstructionsFile();
      // Here you can implement any additional logic to handle the copied prompt
      // For example, you might want to save it to a different file or update a database
      res.json({ success: true, instructions });
  } catch (error) {
      console.error('Error copying prompt:', error);
      res.status(500).json({ error: 'Error copying prompt' });
  }
});

// Function to parse prompt markdown file
function parsePromptMarkdown(content) {
  console.log(content);
  const nameMatch = content.match(/## \*\*(.*?)\*\*/);
  const descriptionMatch = content.match(/### Description\s*\n\s*\*(.*?)\*/s);
  const bodyMatch = content.match(/#### Instructions\s*\n(.*?)\n##### Conversation starters/s);
  
  return {
    name: nameMatch ? nameMatch[1].trim() : 'No name found',
    description: descriptionMatch ? descriptionMatch[1].trim() : 'No description available',
    body: bodyMatch ? bodyMatch[1].trim() : 'No instructions available'
  };
}

/*
// Endpoint to handle copying the prompt
app.post('/copyPrompt', async (req, res) => {
  try {
    customPrompt = true;
    // call to read instructions file, inside custom prompt being true
    // send the name of that file so that it can read it
    // or just use the body text directlt?
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error copying prompt' });
  }
});
*/

let conversationHistory = [];
let o1History = [];
let deepseekHistory = []
let instructions;

// Function to read instructions from the file using fs promises
async function readInstructionsFile() {
  try {
      // Adjust the path if your folder structure is different
      if (customPrompt) {
        // file path goes to the the prompt file name we get from that separate async function
        // sets instructions equal to the contents of that file
        // instructions = await fs.promises.readFile(promptFile, 'utf8');
        const promptFile = path.join(__dirname, 'public', 'uploads', 'prompts', `${promptName}.md`);
        const content = fs.readFileSync(promptFile, 'utf8');
        const parsedContent = parsePromptMarkdown(content);
        return parsedContent.body;
      } else {
        instructions = await fs.promises.readFile('./public/instructions.md', 'utf8');
      }
      return instructions;
  } catch (error) {
      console.error('Error reading instructions file:', error);
      return ''; // Return empty string or handle error as needed
  }
}

// Function to initialize the conversation history with instructions
// giving the model a system prompt and adding tp 
async function initializeConversationHistory() {
  const fileInstructions = await readInstructionsFile();
  systemMessage = `You are a helpful and intelligent AI assistant, knowledgeable about a wide range of topics and highly capable of a great many tasks.\n Specifically:\n ${fileInstructions}`;
  if (continueConv) {
    console.log("continue conversation", continueConv);
    if (summariesOnly) {
      console.log("summaries only", summariesOnly);
      const contextAndSummary = await continueConversation(chosenChat);
      systemMessage += `\n---\n${contextAndSummary}`;
    } else {
      systemMessage = await continueConversation(chosenChat);
    }
    
  }
  conversationHistory.push({ role: "system", content: systemMessage });
  return systemMessage;
}

// Call this function when the server starts

async function initializeSystem() {
  const systemMessage = await initializeConversationHistory();
  // Make sure this systemMessage is passed where needed
  // Continue with the rest of your initialization logic
}

let geminiHistory = '';

async function readGeminiFile() {
  try {
      // Adjust the path if your folder structure is different
      const geminiFile = await fs.promises.readFile('./public/uploads/geminiMessage.txt', 'utf8');
      return geminiFile;
  } catch (error) {
      console.error('Error reading instructions file:', error);
      return ''; // Return empty string or handle error as needed
  }
}

// Function to initialize the Gemini conversation history with system message
async function initializeGeminiConversationHistory() {
  try {
      const geminiMessage = await readGeminiFile();
      let systemMessage = 'System Prompt: ' + geminiMessage;
      if (continueConv) {
        if (summariesOnly) {
          const contextAndSummary = await continueConversation(chosenChat);
          systemMessage += `\n---\n${contextAndSummary}`;
        } else {
          systemMessage = await continueConversation(chosenChat);
        }
        
      }
      geminiHistory += systemMessage + '\n';
  } catch (error) {
      console.error('Error initializing Gemini conversation history:', error);
  }
}

// Call this function when the server starts



// Async function to continue conversation by loading chat context and summary
async function continueConversation(chosenChat) {
  try {
    // Read the chosen chat file
    const conversationFile = await fs.promises.readFile(path.join(__dirname, 'public/uploads/chats', `${chosenChat}.txt`), 'utf8');
    if (summariesOnly) {
      // Regex to extract everything starting from CONTEXT
      const regex = /\n\n-----\n\n(.+)/s;
      const match = conversationFile.match(regex);
      if (match && match[1]) {
        const contextAndSummary = match[1];
        return contextAndSummary;
      } else {
        throw new Error('Context and summary not found in the conversation file.');
      }
    } else {
      console.log("summaries only", summariesOnly);
      return conversationFile
      
      }
    } catch (error) {
    console.error('Error in continueConversation:', error);
    throw error;
  }
}


// Endpoint to receive chosen chat info from the frontend
app.post('/setChat', async (req, res) => {
  try {
    // Extract chosen chat info from request body
    chosenChat = req.body.chosenChat;

    // Set continueConv to true
    continueConv = true;

    // Optionally call continueConversation to verify functionality
    const contextAndSummary = await continueConversation(chosenChat);
    console.log('Context and Summary:', contextAndSummary);

    // Send response back to frontend
    res.status(200).json({ message: 'Chat set successfully', chosenChat });
  } catch (error) {
    console.error('Error in /setChat endpoint:', error);
    res.status(500).json({ message: 'Failed to set chat', error: error.message });
  }
});

// Endpoint to list chat files
app.get('/listChats', (req, res) => {
  const folderPath = path.join(__dirname, 'public/uploads/chats');
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading chat files:', err);
      res.status(500).json({ message: 'Failed to list chat files', error: err.message });
      return;
    }
    const sortedFiles = files.sort((a, b) => fs.statSync(path.join(folderPath, b)).mtime - fs.statSync(path.join(folderPath, a)).mtime);
    res.status(200).json({ files: sortedFiles });
  });
});

// Endpoint to get chat summary
app.get('/getSummary/:chatName', async (req, res) => {
  try {
    const chatName = req.params.chatName;
    const conversationFile = await fs.promises.readFile(path.join(__dirname, 'public/uploads/chats', `${chatName}.txt`), 'utf8');
    const regex = /Conversation Summary: (.+)/s;
    const match = conversationFile.match(regex);
    if (match && match[1]) {
      const summary = match[1].split('\n\n')[0];
      res.status(200).json({ summary });
    } else {
      res.status(404).json({ message: 'Summary not found in the conversation file.' });
    }
  } catch (error) {
    console.error('Error in /getSummary endpoint:', error);
    res.status(500).json({ message: 'Failed to get summary', error: error.message });
  }
});

// Endpoint to set summaries only
app.post('/setSummariesOnly', (req, res) => {
  try {
    summariesOnly = req.body.summariesOnly;
    console.log(summariesOnly);
    res.status(200).json({ message: 'Summaries only setting updated successfully', summariesOnly });
  } catch (error) {
    console.error('Error in /setSummariesOnly endpoint:', error);
    res.status(500).json({ message: 'Failed to update summaries only setting', error: error.message });
  }
});

 // Function to convert conversation history to HTML
 async function exportChatToHTML() {
  // Log the current state of both conversation histories before deciding which one to use
  // console.log("Current GPT Conversation History: ", JSON.stringify(conversationHistory, null, 2));
  // console.log("Current Claude Conversation History: ", JSON.stringify(claudeHistory, null, 2));

  let containsAssistantMessage = conversationHistory.some(entry => entry.role === 'assistant');

  let chatHistory;
  let isClaudeChat = false;
  if (o1History.length > 0) {
      console.log("Using O1 conversation history because it's non-empty.");
      chatHistory = o1History;
  } else if (deepseekHistory.length > 0) {
      console.log("Using Deepseek conversation history because it's non-empty.");
      chatHistory = deepseekHistory;
  } else if (containsAssistantMessage && conversationHistory.length > 0) {
      console.log("Using GPT conversation history because it's non-empty.");
      chatHistory = conversationHistory;
  } else {
      console.log("Using Claude conversation history as GPT history is empty or undefined.");
      chatHistory = [...claudeHistory];
      chatHistory.unshift({
        role: 'system',
        content: claudeInstructions
      });
      isClaudeChat = true;
  }

  // Log the determined chatHistory
  // console.log("Determined Chat History: ", JSON.stringify(chatHistory, null, 2));

  console.log("Chat History: ", JSON.stringify(chatHistory, null, 2));


  // console.log(savedHistory);

  chatType = 'chat';
  const tokens = await tokenizeHistory(chatHistory, modelID, chatType);
  // console.log("Total Tokens: ", tokens);
  const cost = await calculateCost(tokens, modelID);
  console.log("Total Cost: ", cost);

  if (isClaudeChat) {
    console.log("Redefining the system prompt for html.");
    chatHistory = [...claudeHistory];
    chatHistory.unshift({
      role: 'system',
      content: 'Claude AI: You are a helpful and intelligent AI assistant, knowledgeable about a wide range of topics and highly capable of a great many tasks.'
    });
  }


// Convert chat history to a string for title generation
const savedHistory = chatHistory.map(entry => {
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


  // Generate title and save chat history
  const { title, summary } = await titleChat(savedHistory, tokens, cost);
  console.log(`Title: ${title}`);
  console.log(`Summary: ${summary}`);

  let htmlContent = `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .system { background-color: #f0f0f0; }
        .user { background-color: #d1e8ff; }
        .assistant { background-color: #c8e6c9; }
        .generated-image { max-width: 100%; height: auto; }
        .summary { background-color: #f9f9f9; padding: 10px; margin: 20px 0; border-radius: 5px; }
        .summary h3 { margin-top: 0; }
        .thinking {
          background-color: #e8eaed;
          padding: 10px;
          margin-bottom: 15px;
          border-left: 3px solid #6c757d;
          font-family: monospace;
        }

        .thinking h4 {
          color: #6c757d;
          margin-top: 0;
        }

        .response h4 {
          color: #28a745;
          margin-top: 0;
        }

        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
  `;  


  chatHistory.forEach(entry => {
    let formattedContent = '';
  
    if (entry.role === 'system' && typeof entry.content === 'string') {
      // Format Claude's system prompt
      formattedContent = `<pre>${entry.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
    } else if (Array.isArray(entry.content)) {
      // Check if this is a Claude response with thinking/text format
      const hasThinking = entry.content.some(item => item.type === 'thinking');
      
      entry.content.forEach(item => {
        if (item.type === 'thinking' && typeof item.thinking === 'string') {
          // Format thinking content with a special style
          formattedContent += `<div class="thinking"><h4>Thinking:</h4><pre>${item.thinking.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>`;
        } else if (item.type === 'text' && typeof item.text === 'string') {
          // If it has thinking, label the text portion as "Response:"
          if (hasThinking) {
            formattedContent += `<div class="response"><h4>Response:</h4>${marked(item.text)}</div>`;
          } else {
            formattedContent += marked(item.text); // Regular text without special header
          }
        } else if (item.type === 'image_url') {
          formattedContent += `<img src="${item.image_url.url}" alt="User Uploaded Image" class="generated-image"/>`;
        }
      });
    } else if (typeof entry.content === 'string') {
      formattedContent = marked(entry.content); // Directly convert string content
    } else {
      console.error('Unexpected content type in conversationHistory:', entry.content);
    }
  
    htmlContent += `<div class="message ${entry.role}"><strong>${entry.role.toUpperCase()}:</strong> ${formattedContent}</div>`;
  });

  htmlContent += `
    <div class="summary">
      <h3>Summary</h3>
      <p>Total Tokens: ${tokens.totalTokens}</p>
      <p>Total Cost: ¢${cost.toFixed(6)}</p>
      <p>Summary: ${summary}</p>
    </div>
  </body></html>`;

  return htmlContent;
}

// Function to get a unique file name
function getUniqueFilePath(basePath, baseTitle) {
  let counter = 1;
  let fileName = `${baseTitle}.txt`;
  let filePath = path.join(basePath, fileName);

  // Keep checking until we find a filename that doesn't exist
  while (fs.existsSync(filePath)) {
    counter++;
    fileName = `${baseTitle}-${counter}.txt`;
    filePath = path.join(basePath, fileName);
  }

  return filePath;
}

let summary = '';
let maxLength = 200;

async function returnTitle(history) {
  // Function to generate a title
  async function generateTitle() {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 10,
      messages: [
        { role: 'system', content: 'You will be given the contents of a conversation between a Human and an AI Assistant. Please title this chat by summarizing the topic of the conversation in under 5 plaintext words. Ignore the System Message and focus solely on the User-AI interaction. This will be the name of the file saved via Node, so keep it *extremely* short and concise! Examples: "Friendly AI Assistance", "Install Plex Media Server", "App Layout Feedback", "Calculating Indefinite Integrals", or "Total Cost Calculation", etc. The title should resemble a quick and easy reference point for the User to remember the conversation, and follow smart and short naming conventions. Do NOT use any special symbols; simply return the words in plaintext without any formatting, markdown, quotes, etc. The title needs to be compatible with a Node.js filename, so it needs to be short! Output should consist of a few words only, or there will be a ENAMETOOLONG error!.' },
        { role: 'user', content: history }
      ]
    });
    return completion.choices[0].message.content.trim().replace(/ /g, '_');
  }

  try {
  title = await generateTitle();

  if (title.length > maxLength) {
    title = 'chat_history';
  }
} catch (error) {
  console.error("Error generating title:", error);
  title = "chat_history";
}

  return title;
}

async function titleChat(history, tokens, cost) {
  /*
  // Request to OpenAI to generate a title
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You will be given the contents of a conversation between a Human and an AI Assistant. Please title this chat by summarizing the topic of the conversation in under 5 plaintext words. Ignore the System Message and focus solely on the User-AI interaction. This will be the name of the file saved via Node, so keep it *extremely* short and concise! Examples: "Friendly AI Assistance", "Install Plex Media Server", "App Layout Feedback", "Calculating Indefinite Integrals", or "Total Cost Calculation", etc. The title should resemble a quick and easy reference point for the User to remember the conversation, and follow smart and short naming conventions. Do NOT use any special symbols; simply return the words in plaintext without any formatting, markdown, quotes, etc. The title needs to be compatible with a Node.js filename, so it needs to be short! Output should consist of a few words only, or there will be a ENAMETOOLONG error!.' },
      { role: 'user', content: history }
    ]
  });
  */

  try {
    const summaryCompletion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You will be shown the contents of a conversation between a Human and an AI Assistant. Please summarize this chat in a brief paragraph consisting of no more than 4-6 sentences. Ignore the System Message and focus solely on the User-AI interaction. This description will be appended to the chat file for the user and AI to reference. Keep it extremely concise but thorough, shortly covering all important context necessary to retain.' },
      { role: 'user', content: history }
    ]
  });
  summary = summaryCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    summary = "No summary could be generated.";
  }

  // Extract the title from the response
  title = await returnTitle(history);
  console.log("Generated Title: ", title);
  const folderPath = path.join(__dirname, 'public/uploads/chats');
  // Ensure the nested folder exists
  fs.mkdirSync(folderPath, { recursive: true });

  // Get a unique file path
  const filePath = getUniqueFilePath(folderPath, title);

  // Define the full file path
  // const filePath = path.join(folderPath, `${title}.txt`);
  let chatText;
  chatText = `${history}\n---\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: ¢${cost.toFixed(6)}\n\n-----\n\nCONTEXT: Above, you may be shown a conversation between the User -- a Human -- and an AI Assistant (yourself). If not, a summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;
  /*
  if (summariesOnly) {
    console.log("summaries only ")
    chatText = `${history}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $${cost.toFixed(6)}\n\n-----\n\nCONTEXT: Below is a summary of the conversation between the User -- a Human -- and an AI Assistant (yourself). INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;
  } else {
    chatText = `${history}\n---\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $${cost.toFixed(6)}\n\n-----\n\nCONTEXT: Above, you may be shown a conversation between the User -- a Human -- and an AI Assistant (yourself). If not, summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;
  }
  */
  fs.writeFileSync(filePath, chatText);

// test...
//   const chatText = `${history}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $${cost.toFixed(6)}\n\n-----\n\nCONTEXT: Above may be the conversation between the User -- a Human -- and an AI Assistant (yourself); if you do not see it, the User has decided to display only a summary. The summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;


  // Save the chat history to a file with the generated title
  console.log(`Chat history saved to ${filePath}`);
  return { title, summary };
}


const { get_encoding, encoding_for_model } = require("tiktoken");

/**
 * Tokenize chat history based on a specified model and type
 * @param {string} history - The chat history as a string
 * @param {string} model - The OpenAI model to use for encoding
 * @param {string} type - The format type of the chat history (e.g., 'gemini')
 * @returns {Promise<Object>} - An object containing the total tokens and tokens per segment
 */
async function tokenizeHistory(history, model, type) {
  // Load the encoder for the specified model
  const encoder = encoding_for_model(model);

  // Function to split history into segments for 'gemini' format
  function splitGeminiSegments(chatHistory) {
      // Regex pattern to separate different parts of the conversation
      const segmentRegex = /(?:System Prompt:|User Prompt:|Response:)([^:]+)(?=System Prompt:|User Prompt:|Response:|$)/g;
      const matches = [];
      let match;
      while ((match = segmentRegex.exec(chatHistory)) !== null) {
          matches.push(match[1].trim());
      }
      return matches.map((text, index) => ({
          role: index % 3 === 0 ? 'System Prompt' : index % 3 === 1 ? 'User Prompt' : 'Response',
          text
      }));
  }

  // Function to split history into segments for 'assistant' format
function splitAssistantSegments(chatHistory) {
  // Regex pattern to separate different parts of the conversation starting from SYSTEM
  const segmentRegex = /(SYSTEM:|USER:|ASSISTANT:)(.*?)(?=(SYSTEM:|USER:|ASSISTANT:|$))/gs;
  const matches = [];
  let match;
  while ((match = segmentRegex.exec(chatHistory)) !== null) {
      matches.push({
          role: match[1].replace(':', '').trim(),
          text: match[2].trim()
      });
  }
  return matches;
}

// Function to split history into segments for 'chat' format
function splitChatSegments(chatHistory) {
  return chatHistory.map(entry => ({
    role: entry.role.toUpperCase(),
    text: Array.isArray(entry.content) ? entry.content.map(item => item.type === 'text' ? item.text : '').join(' ') : entry.content
  }));
}


  // Function to split history into segments based on the type
  function splitSegments(chatHistory, type) {
    if (type === 'gemini') {
        return splitGeminiSegments(chatHistory);
    } else if (type === 'assistant') {
        return splitAssistantSegments(chatHistory);
    } else if (type === 'chat') {
        return splitChatSegments(chatHistory);
    }
    throw new Error(`Unknown history type: ${type}`);
  }

  // Split the chat history into segments
  let segments;
  try {
      segments = splitSegments(history, type);
  } catch (error) {
      console.error(error.message);
      encoder.free();
      return;
  }

  // Calculate the number of tokens for each segment and the total
  let totalTokens = 0;
  const tokensPerSegment = segments.map(segment => {
      const tokens = encoder.encode(segment.text);
      totalTokens += tokens.length;
      return {
          role: segment.role,
          text: segment.text,
          tokens: tokens.length
      };
  });

  // Free the encoder
  encoder.free();

  // console.log("Total Tokens: ", totalTokens);
  // console.log("Tokens Per Segment: ", tokensPerSegment);

  return {
      totalTokens,
      tokensPerSegment
  };
}


/**
 * Calculate the total cost of a conversation based on token counts, model pricing, and role
 * @param {Object} tokens - Object containing totalTokens and tokensPerSegment
 * @param {string} model - String identifying the OpenAI or Claude model
 * @returns {Promise<number>} - Total cost of the conversation
 */
async function calculateCost(tokens, model) {
  let totalCost = 0;
  let cumulativeInputTokens = 0;

  // Define pricing based on model
  let inputCostPerMillion, outputCostPerMillion;
  if (model === 'gpt-4') {
      inputCostPerMillion = 30.00;
      outputCostPerMillion = 60.00;
  } else if (model === 'gpt-4-turbo') {
      inputCostPerMillion = 10.00;
      outputCostPerMillion = 30.00;
  } else if (model === 'gpt-4o') {
      inputCostPerMillion = 5.00;
      outputCostPerMillion = 15.00;
  } else if (model === 'gpt-4o-mini') {
    inputCostPerMillion = 0.150;
    outputCostPerMillion = 0.600;
  } else if (model === 'gpt-3.5-turbo-0125') {
      inputCostPerMillion = 0.50;
      outputCostPerMillion = 1.50;
  } else if (model === 'claude-opus-4-20250514') {
      inputCostPerMillion = 15.00;
      outputCostPerMillion = 75.00;
  } else if (model === 'claude-sonnet-4-20250514') {
      inputCostPerMillion = 3.00;
      outputCostPerMillion = 15.00;
  } else if (model === 'claude-3-5-sonnet-latest') {
      inputCostPerMillion = 3.00;
      outputCostPerMillion = 15.00;
  } else if (model === 'claude-3-opus-20240229') {
      inputCostPerMillion = 15.00;
      outputCostPerMillion = 75.00;
  } else if (model === 'claude-3-haiku-20240307') {
      inputCostPerMillion = 0.25;
      outputCostPerMillion = 1.25;
  } else if (model === 'claude-2.1' || model === 'claude-2.0') {
      inputCostPerMillion = 8.00;
      outputCostPerMillion = 24.00;
  } else if (model === 'claude-instant-1.2') {
      inputCostPerMillion = 0.80;
      outputCostPerMillion = 2.40;
  } else if (model === 'open-mistral-7b') {
      inputCostPerMillion = 0.25;
      outputCostPerMillion = 0.25;
  } else if (model === 'open-mixtral-8x7b') {
      inputCostPerMillion = 0.70;
      outputCostPerMillion = 0.70;
  } else if (model === 'open-mixtral-8x22b') {
      inputCostPerMillion = 2.00;
      outputCostPerMillion = 6.00;
  } else if (model === 'mistral-small-2402') {
      inputCostPerMillion = 1.00;
      outputCostPerMillion = 3.00;
  } else if (model === 'codestral-2405') {
      inputCostPerMillion = 1.00;
      outputCostPerMillion = 3.00;
  } else if (model === 'mistral-medium-2312') {
      inputCostPerMillion = 2.70;
      outputCostPerMillion = 8.10;
  } else if (model === 'mistral-large-2402') {
      inputCostPerMillion = 4.00;
      outputCostPerMillion = 12.00;
  } else if (model === 'open-mistral-nemo') {
    inputCostPerMillion = 0.3;
    outputCostPerMillion = 0.3;
  } else if (model === 'open-codestral-mamba') {
    inputCostPerMillion = 0.25;
    outputCostPerMillion = 0.25;
  } else if (model === 'gemini-pro') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'gemini-pro-vision') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'gemini-1.5-pro') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'gemini-1.5-flash') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'llama3-70b-8192') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'llama3-8b-8192') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'gemma-7b-it') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'mixtral-8x7b-32768') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'llama-3.1-405b-reasoning') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'llama-3.1-70b-versatile') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'llama-3.1-8b-instant') {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
  } else if (model === 'o1-preview') {
      inputCostPerMillion = 15.00;
      outputCostPerMillion = 60.00;
  } else if (model === 'o1-mini') {
      inputCostPerMillion = 3.00;
      outputCostPerMillion = 12.00;
  } else {
      inputCostPerMillion = 0;
      outputCostPerMillion = 0;
      throw new Error(`Unknown model: ${model}.`);
  }

  // Process each segment in tokensPerSegment
  for (const segment of tokens.tokensPerSegment) {
    if (segment.role === 'SYSTEM' || segment.role === 'USER') {
      cumulativeInputTokens += segment.tokens;
      if (segment.role === 'USER') {
        // Calculate the cost for the cumulative input tokens
        const inputCost = (cumulativeInputTokens / 1000000) * inputCostPerMillion;
        totalCost += inputCost;
      }
    } else if (segment.role === 'ASSISTANT') {
      // Calculate the output cost for the assistant tokens
      const outputCost = (segment.tokens / 1000000) * outputCostPerMillion;
      totalCost += outputCost;

      // Include assistant tokens in cumulative input tokens
      cumulativeInputTokens += segment.tokens;
    }
  }

  inputCostPerMillion = 0.600;
  let extraCost = (tokens.totalTokens / 1000000) * inputCostPerMillion;
  extraCost * 2;


  totalCost += extraCost;
  totalCost *= 100;

  return totalCost;
}



// Function to convert Gemini conversation history to HTML
async function exportGeminiChatToHTML() {
  
  // Convert newlines in each part of the chat history to <br> for HTML display
  const convertNewlinesToHtml = text => text.replace(/\n/g, '<br>');

  // Use a regular expression to match the prompts and responses in the history
  const messageRegex = /(System Prompt: |User Prompt: |Response: )/g;
  // Split the history by the regex, but keep the delimiters
  const messages = geminiHistory.split(messageRegex).slice(1); // slice to remove the first empty string if any
  console.log("Gemini History: ", JSON.stringify(geminiHistory, null, 2));

  
  chatType = 'gemini';
  const tokens = await tokenizeHistory(geminiHistory, modelID, chatType);
  console.log(tokens.totalTokens);
  // process chat history in a similar way
  const { title, summary } = await nameChat(geminiHistory, tokens);
  console.log(`Title: ${title}`);
  console.log(`Summary: ${summary}`);

  let htmlContent = `
    <html>
    <head>
      <title>Gemini: ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .system { background-color: #f0f0f0; }
        .user { background-color: #d1e8ff; }
        .assistant { background-color: #c8e6c9; }
        .generated-image { max-width: 100%; height: auto; }
        .summary { background-color: #f9f9f9; padding: 10px; margin: 20px 0; border-radius: 5px; }
        .summary h3 { margin-top: 0; }
      </style>
    </head>
    <body>
  `;

  // Process the messages in pairs (label + content)
  for (let i = 0; i < messages.length; i += 2) {
    const label = messages[i];
    const content = messages[i + 1];
    let roleClass = '';

    if (label === 'System Prompt: ') {
      roleClass = 'system';
    } else if (label === 'User Prompt: ') {
      roleClass = 'user';
    } else if (label === 'Response: ') {
      roleClass = 'assistant';
    }

    htmlContent += `<div class="message ${roleClass}"><strong>${label.trim()}</strong> ${convertNewlinesToHtml(content.trim())}</div>`;
  }

  htmlContent += `
    <div class="summary">
      <h3>Summary</h3>
      <p>Total Tokens: ${tokens.totalTokens}</p>
      <p>Total Cost: $0.00!</p>
      <p>Summary: ${summary}</p>
    </div>
  </body></html>`;
  return htmlContent;
}



// claude instructions

let claudeInstructions;

// Function to read instructions from the file using fs promises
async function readClaudeFile() {
  try {
      // Adjust the path if your folder structure is different
      let claudeFile = await fs.promises.readFile('./public/claudeInstructions.xml', 'utf8');
      // Adjust the path if your folder structure is different
      if (customPrompt) {
        // file path goes to the the prompt file name we get from that separate async function
        // sets instructions equal to the contents of that file
        // instructions = await fs.promises.readFile(promptFile, 'utf8');
        const promptFile = path.join(__dirname, 'public', 'uploads', 'prompts', `${promptName}.md`);
        const content = fs.readFileSync(promptFile, 'utf8');
        const parsedContent = parsePromptMarkdown(content);
        let customPrompt = parsedContent.body;
        claudeFile += "\n\n <prompt> \n\n" + customPrompt + "\n\n </prompt>";
      } else {
        return claudeFile;
      }
  } catch (error) {
      console.error('Error reading instructions file:', error);
      return ''; // Return empty string or handle error as needed
  }
}

// Function to initialize the conversation history with instructions
// giving the model a system prompt and adding tp 
async function initializeClaudeInstructions() {
  let instructions = await readClaudeFile();
  claudeInstructions = `${instructions}`;
  if (continueConv) {
    if (summariesOnly) {
      const contextAndSummary = await continueConversation(chosenChat);
      claudeInstructions += `\n---\n${contextAndSummary}`;
    } else {
      claudeInstructions += await continueConversation(chosenChat);
    }
  }
  return claudeInstructions;
}

// Call this function when the server starts

/*
let prompt;

async function loadPrompts() {
  try {
    // Adjust the path if your folder structure is different
    const file = await fs.promises.readFile('./public/uploads/prompts/template.md', 'utf8');
    let contents = file;
    prompt = `/n${contents}`;
} catch (error) {
    console.error('Error reading instructions file:', error);
    return ''; // Return empty string or handle error as needed
}
}

loadPrompts();
*/

// file upload

let file_id;
let fileContents;
let embedding;
let isAssistants = false;

// Endpoint to handle image upload
// Combined file upload endpoint
// Combined file upload endpoint - maintaining backwards compatibility
app.post('/upload-file', uploadMiddleware, async (req, res) => {
  // Handle both single file and multiple files cases
  const files = req.files || (req.file ? [req.file] : []);
  console.log("Files received in /upload-file:", files);

  if (files.length === 0) {
      return res.status(400).send({ error: 'No file provided.' });
  }

  // For backwards compatibility, use the first file as the primary file
  const tempFilePath = files[0].path;
  file_id = files[0].filename; // Maintaining original variable name

  try {
      if (isAssistants === false) {
          // Maintain original single-file behavior for backwards compatibility
// For PDFs, use base64 encoding
          if (files[0].mimetype === 'application/pdf') {
            console.log("PDF file detected");
            fileContents = await fs.promises.readFile(tempFilePath, { encoding: 'base64' });
          } else {
            console.log("Non-PDF file detected");
            // For text files, use UTF-8
            fileContents = await fs.promises.readFile(tempFilePath, 'utf8');
          }
          console.log("File Contents:", fileContents);
          console.log("File ID:", file_id);

          // Additional processing for multiple files if present
          if (files.length > 1) {
              const processedFiles = [];
              let totalPDFPages = 0;

              for (const file of files) {
                  if (file.mimetype === 'application/pdf') {
                      const pageCount = await getPDFPageCount(file.path);
                      totalPDFPages += pageCount;
                      
                      if (totalPDFPages > 100) {
                          throw new Error('Total PDF pages exceed the limit of 100 pages');
                      }

                      processedFiles.push({
                          file_id: file.filename,
                          contents: await fileToBase64(file.path),
                          type: 'pdf',
                          pageCount: pageCount
                      });
                  } else if (file.mimetype.startsWith('image/')) {
                      processedFiles.push({
                          file_id: file.filename,
                          contents: await fileToBase64(file.path),
                          type: 'image'
                      });
                  } else {
                      processedFiles.push({
                          file_id: file.filename,
                          contents: await fs.promises.readFile(file.path, 'utf8'),
                          type: 'text'
                      });
                  }

                  // Clean up additional files
                  if (file.path !== tempFilePath) { // Don't delete primary file yet
                      fs.unlink(file.path, (err) => {
                          if (err) console.error("Error deleting temp file:", err);
                          console.log(`Temp file deleted: ${file.filename}`);
                      });
                  }
              }

              // Store processed files
              if (!req.app.locals.uploadedFiles) {
                  req.app.locals.uploadedFiles = new Map();
              }
              const sessionId = Date.now().toString();
              req.app.locals.uploadedFiles.set(sessionId, processedFiles);

              // Clean up primary file after processing
              fs.unlink(tempFilePath, (err) => {
                  if (err) console.error("Error deleting temp file:", err);
                  console.log("Primary temp file deleted");
              });

              return res.json({
                  success: true,
                  fileId: file_id,
                  sessionId: sessionId,
                  additionalFiles: processedFiles
              });
          }

          // Clean up primary file for single file case
          fs.unlink(tempFilePath, (err) => {
              if (err) console.error("Error deleting temp file:", err);
              console.log("Temp file deleted");
          });

          // Original response structure for single file
          return res.json({ 
              success: true, 
              fileId: file_id,
              initialize: false
          });

      } else if (isAssistants === true) {
          if (!assistant) {
              const systemMessage = await initializeConversationHistory();
              await AssistantAndThread(modelID, systemMessage);
          }

          const assistantFiles = [];
          for (const file of files) {
              const openaiFile = await openai.files.create({
                  file: fs.createReadStream(file.path),
                  purpose: 'assistants'
              });

              const assistantFile = await openai.beta.assistants.files.create(
                  assistant.id,
                  {
                      file_id: openaiFile.id
                  }
              );

              assistantFiles.push(assistantFile);
              console.log("File attached to assistant:", assistantFile);

              fs.unlink(file.path, (err) => {
                  if (err) console.error("Error deleting temp file:", err);
                  console.log("Temp file deleted");
              });
          }

          initialize = false;
          console.log("Initialize:", initialize);

          return res.json({ 
              success: true, 
              fileId: file_id,
              initialize: initialize,
              assistantFiles: assistantFiles
          });
      }

  } catch (error) {
      console.error('Failed to process uploaded files:', error);
      return res.status(500).json({
          error: error.message || 'Failed to process uploaded files'
      });
  }
});

// Helper endpoint to check upload status (for non-assistant uploads)
app.get('/upload-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const files = req.app.locals.uploadedFiles?.get(sessionId);
  
  if (!files) {
    return res.status(404).json({ error: 'Upload session not found' });
  }
  
  res.json({ 
    sessionId,
    files: files.map(file => ({
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      pageCount: file.pageCount
    }))
  });
});

// Store uploadedFiles in app.locals when initializing your app
app.locals.uploadedFiles = new Map();

// Cleanup old upload sessions periodically
setInterval(() => {
  const uploadedFiles = app.locals.uploadedFiles;
  if (!uploadedFiles) return;
  
  const now = Date.now();
  for (const [sessionId, files] of uploadedFiles.entries()) {
    if (now - parseInt(sessionId) > 30 * 60 * 1000) { // 30 minutes
      uploadedFiles.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes


// Assistant Handling

// At the top of server.js, after reading environment variables
const ASSISTANT_ID = process.env.ASSISTANT_ID || null;
const THREAD_ID = process.env.THREAD_ID || null;

let systemMessage;  // Global variable for systemMessage
let assistant = null;
let thread = null;
let response = '';
let initialize = true;
let messages;
let modelID = 'gpt-4o';

// Utility function to ensure Assistant and Thread initialization
async function AssistantAndThread(modelID, systemMessage) {
  // Conditional logic to either use provided IDs or create new instances
  if (!assistant && ASSISTANT_ID) {
    // Set the assistant using the ID from the environment
    assistant = await openai.beta.assistants.retrieve(
      ASSISTANT_ID
    );
    console.log("Using existing Assistant ID", assistant)
  }
  
  if (!thread && THREAD_ID) {
    // Directly use the provided Thread ID without creating a new thread
    thread = await openai.beta.threads.retrieve(
      THREAD_ID
    );
    console.log("Using existing Thread ID from .env", thread);
  } else if (!thread) {
    // Only create a new thread if it's not provided and an assistant exists
    // This could mean creating a new assistant if one wasn't provided
    if (!assistant) {
      assistant = await openai.beta.assistants.create({
        name: "Assistant",
        instructions: systemMessage,
        tools: [{type: "file_search"}, {type: "code_interpreter"}],
        model: modelID
      });
      console.log("Creating new Assistant:", assistant)
    }
    thread = await openai.beta.threads.create();
    console.log("New Thread ensured:", thread);
  }
}



// Function to handle message sending and responses
async function handleMessage(thread, assistant, userMessage) {
  try {
    
    let message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });
    
    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
      // Initialize runStatus variable
      let runStatus;
    
      // Poll for run completion
      do {
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log("Run Status:", runStatus.status); // Debugging: Log the current run status

        if(runStatus.status !== 'completed') {
          // If the run is not completed, wait for a bit before checking the status again
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } while(runStatus.status !== 'completed');

      // Once the run is completed, fetch the messages
      messages = await openai.beta.threads.messages.list(thread.id);
      
      // Sort messages by 'created_at' in descending order and then filter for the assistant's messages
        const sortedAndFilteredMessages = messages.body.data
        .sort((a, b) => b.created_at - a.created_at)
        .filter(msg => msg.role === 'assistant');

        if (sortedAndFilteredMessages.length > 0) {
        // The first message in the array is now the latest one from the assistant
        const latestAssistantMessage = sortedAndFilteredMessages[0];
        const formattedResponse = latestAssistantMessage.content.map(content => {
          // Assuming 'content.text' is the correct path to the message text.
          // Adjust according to the actual structure of the 'content' array items
          return typeof content.text === 'object' ? content.text.value : content.text;
        }).join('\n');
        let response = formattedResponse;
        console.log("Response:", response);
        return { text: response };
      } else {
        throw new Error('No assistant messages found in the thread.');
      }
  } catch (error) {
    console.error("Error sending messages:", error);
    throw error; // Rethrow the error for upstream handling
  }
}

app.post('/assistant', async (req, res) => {
  let userMessage = req.body.message;
  modelID = req.body.modelID;
  initialize = req.body.initialize;
  isAssistants = true;
  try {
    // Check if assistant and thread need to be initialized
    if (initialize === true) {
      console.log("Initialize:", initialize)
      const systemMessage = await initializeConversationHistory();
      await AssistantAndThread(modelID, systemMessage);

      response = await handleMessage(thread, assistant, userMessage);
      console.log("Try Response:", response)
      res.json({ text: response });

    } else if (initialize === false) {
      console.log("Initialize:", initialize)

      console.log("Assistant and Thread already exist");
      response = await handleMessage(thread, assistant, userMessage);
      console.log("Try Response:", response)
      res.json({ text: response });
    }
  } catch (error) {
    console.error('Error in /assistant endpoint:', error.message);
    res.status(500).json({ error: "An error occurred in the server.", details: error.message });
  }
});


// END 

// Assumes `thread` is available within this scope
async function fetchMessages() {

  try {
      const messagesResponse = await openai.beta.threads.messages.list(thread.id);
      if (messagesResponse && messagesResponse.body && messagesResponse.body.data) {
          return messagesResponse.body.data;
      } else {
          console.error("Failed to fetch messages or no messages available.");
          return [];
      }
  } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
  }
}

// Helper function to convert markdown to HTML
const convertMarkdownToHtml = markdown => marked(markdown);

// Function to export conversation history to HTML, including systemMessage and ensuring correct order
async function exportAssistantsChat() {
  let messages = await fetchMessages(); // Fetch messages using the new function
  
  // Assuming messages are in reverse chronological order; sort them to chronological order
  messages.sort((a, b) => a.created_at - b.created_at);

  const systemMessage = await initializeConversationHistory();
  // Convert systemMessage from markdown to HTML and ensure it's only added if defined
  const systemMessageHtml = systemMessage ? convertMarkdownToHtml(systemMessage) : '';

  chatType = 'assistant';
  

  console.log("Assistant History: ", JSON.stringify(messages, null, 2));

  // Get the latest message (last in the sorted array)
  const latestMessage = messages[messages.length - 1];
  const assistantId = latestMessage.assistant_id || 'N/A';
  const threadId = latestMessage.thread_id || 'N/A';
  const runId = latestMessage.run_id || 'N/A';

  // Prepend assistant ID, thread ID, and run ID to the chatHistory
  let chatHistory = `ASSISTANT ID: ${assistantId}\nTHREAD ID: ${threadId}\nRUN ID: ${runId}\n\n`;
  chatHistory += systemMessage ? `SYSTEM: ${systemMessage}\n` : '';

  const tokens = await tokenizeHistory(chatHistory, modelID, chatType);
  console.log("Total Tokens: ", tokens.totalTokens);
  const cost = await calculateCost(tokens, modelID);
  console.log("Total Cost: ", cost);
  
  // Generate title and save chat history
  const { title, summary } = await titleChat(chatHistory, tokens, cost);
  console.log(`Title: ${title}`);
  console.log(`Summary: ${summary}`);

  let htmlContent = `
  <html>
  <head>
      <title>${title}</title>
      <style>
          body { font-family: Arial, sans-serif; }
          .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
          .system-message { background-color: #ffffcc; } /* Styling for system message */
          .system { background-color: #f0f0f0; }
          .user { background-color: #d1e8ff; }
          .assistant { background-color: #c8e6c9; }
          .generated-image { max-width: 100%; height: auto; }
          .summary { background-color: #f9f9f9; padding: 10px; margin: 20px 0; border-radius: 5px; }
          .summary h3 { margin-top: 0; }
      </style>
  </head>
  <body>
  ${systemMessageHtml ? `<div class="message system-message"><strong>SYSTEM:</strong> ${systemMessageHtml}</div>` : ''}
  `; // Conditionally prepend the systemMessage in HTML format to the chat history

  messages.forEach(message => {
      const roleClass = message.role;
      let formattedContent = message.content.map(contentItem => {
          if (contentItem.type === 'text') {
              // Handle nested text object structure
              const textContent = typeof contentItem.text === 'object' ? (contentItem.text.value || "") : contentItem.text;
              chatHistory += `${roleClass.toUpperCase()}: ${textContent}\n`;
              return convertMarkdownToHtml(textContent);
          } else if (contentItem.type === 'image') {
              // Handle image content
              return `<img src="${contentItem.image_url}" alt="Generated Image" class="generated-image"/>`;
          }
      }).filter(Boolean).join(''); // Filter out undefined or null values and join

      htmlContent += `<div class="message ${roleClass}"><strong>${roleClass.toUpperCase()}:</strong> ${formattedContent}</div>`;
  });

  htmlContent += `
    <div class="summary">
      <h3>Summary</h3>
      <p>Total Tokens: ${tokens.totalTokens}</p>
      <p>Total Cost: ¢${cost.toFixed(6)}</p>
      <p>Summary: ${summary}</p>
    </div>
  </body></html>`;

  console.log("Chat History: ", JSON.stringify(chatHistory, null, 2));


  return htmlContent;
}

let title = '';
let chatType = '';

async function nameChat(chatHistory, tokens) {
  // Request to OpenAI to generate a title

  const googleModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: defaultConfig, safetySettings });
  // Generate content based on the geminiHistory
  const answer = await googleModel.generateContent(`You will be given the contents of a conversation between a Human and an AI Assistant. Please title this chat by summarizing the topic of the conversation in under 5 plaintext words. Ignore the System Message and focus solely on the User-AI interaction. This will be the name of the file saved via Node, so keep it *extremely* short and concise! Examples: "Friendly AI Assistance", "Install Plex Media Server", "App Layout Feedback", "Calculating Indefinite Integrals", or "Total Cost Calculation", etc. The title should resemble a quick and easy reference point for the User to remember the conversation, and follow smart and short naming conventions. Do NOT use any special symbols; simply return the words in plaintext without any formatting, markdown, quotes, etc. The title needs to be compatible with a Node.js filename.\n\n${chatHistory}`);

  title = answer.response.text().trim().replace(/ /g, '_');
  
  // Generate content based on the geminiHistory
  const result = await googleModel.generateContent(`You will be shown the contents of a conversation between a Human and an AI Assistant. Please summarize this chat in a brief paragraph consisting of no more than 4-6 sentences. Ignore the System Message and focus solely on the User-AI interaction. This description will be appended to the chat file for the user and AI to reference. Keep it extremely concise but thorough, shortly covering all important context necessary to retain.\n\n----\n\n${chatHistory}`);

  summary = result.response.text();


  // Extract the title from the response
  console.log("Generated Title: ", title);
  const folderPath = path.join(__dirname, 'public/uploads/chats');
  // Ensure the nested folder exists
  fs.mkdirSync(folderPath, { recursive: true });

  const filePath = getUniqueFilePath(folderPath, title);

  // Define the full file path
  // const filePath = path.join(folderPath, `${title}.txt`);
  let chatText;
  chatText = `${chatHistory}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $0.00!\n\n-----\n\nCONTEXT: Above, you may be shown a conversation between the User -- a Human -- and an AI Assistant (yourself). If not, a summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;
  /*
  if (summariesOnly) {
    chatText = `${chatHistory}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $0.00!\n\n-----\n\nCONTEXT: Below is a summary of the conversation between the User -- a Human -- and an AI Assistant (yourself). INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;
  } else {
    chatText = `${chatHistory}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $0.00!\n\n-----\n\nCONTEXT: Above, you may be shown a conversation between the User -- a Human -- and an AI Assistant (yourself). If not, a summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;
  }
  */
  fs.writeFileSync(filePath, chatText);

// test...
//   const chatText = `${history}\n\nTotal Tokens: ${tokens.totalTokens}\nTotal Cost: $${cost.toFixed(6)}\n\n-----\n\nCONTEXT: Above may be the conversation between the User -- a Human -- and an AI Assistant (yourself); if you do not see it, the User has decided to display only a summary. The summary of said conversation is below for you to reference. INSTRUCTION: The User will send a message/prompt with the expectation that you will pick up where you left off and seamlessly continue the conversation. Do not give any indication that the conversation had paused or resumed; simply answer the User's next query in the context of the above Chat, inferring the Context and asking for additional information if necessary.\n---\nConversation Summary: ${summary}`;


  // Save the chat history to a file with the generated title
  console.log(`Chat history saved to ${filePath}`);
  return { title, summary };
}



// Function to convert an image URL to base64
async function imageURLToBase64(url) {
  try {
    console.log('imageURLToBase64 1');
    const response = await axios.get(url, {
      responseType: 'arraybuffer' // Ensure the image data is received in the correct format
    });
    return `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    //return null; // Return null if there is an error
  }
}
  

// Function to convert an image URL to base64
async function imageURLToBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer' // Ensure the image data is received in the correct format
    });

    // Extract the MIME type from the response headers
    const contentType = response.headers['content-type'];

    // Convert the image data to base64
    const base64Image = Buffer.from(response.data).toString('base64');

    // Return the base64-encoded image with the appropriate MIME type
    return `data:${contentType};base64,${base64Image}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    //return null; // Return null if there is an error
  }
}

let imageName;
let uploadedImagePath;

// Endpoint to handle image upload
app.post('/upload-image', upload.single('image'), async (req, res) => {
  console.log("File received in /upload-image:", req.file);
  if (!req.file) {
    return res.status(400).send({ error: 'No image file provided.' });
  }

  uploadedImagePath = req.file.path;

  imageName = req.file.filename;

  // Generate URL for the uploaded image
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; 

  // Send the image URL back to the client
  res.send({ imageUrl: imageUrl });
});


// Function to convert an image file to base64
function imageToBase64(filePath) {
  const image = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${image.toString('base64')}`;
}


// Google Gemini Endpoint


// Converts an image file directly to the format required by the Gemini model
function convertImageForGemini(filePath, mimeType) {
  try {
    // Validate input parameters
    if (!filePath || !mimeType) {
      throw new Error('Invalid arguments: filePath and mimeType are required');
    }

    // Read file and encode in base64
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');

    return {
      inlineData: {
        data: base64Data,
        mimeType
      },
    };
  } catch (error) {
    console.error('Error in convertImageForGemini:', error.message);
    return null;
  }
}

// Gemini Safety settings reduced to none for each required category.
// Feel free to adjust, but be aware that the RLHP severely neuters the model.

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];


// Define a default configuration for generation parameters
// These are the settings for Gemini
const defaultConfig = {
  candidate_count: 1, // How many responses the model gives
  // stop_sequences: ["\n"], // Model stops generating at these
  max_output_tokens: 2000, // Completion lengths
  // top_p: 0.9,
  // nucleus sampling, temperature alternative
  // top_k: 40,
  // random sampling
  temperature: 1 // random sampling
};

// see my comments on the GPT API parameters for more explanations
// Docs: https://ai.google.dev/docs/concepts#model_parameters


app.post('/gemini', async (req, res) => {
  try {
    initializeGeminiConversationHistory();
    const { model, prompt, imageParts, history } = req.body;
    console.log('Prompt: ', prompt)
isAssistants = false;
// Check for shutdown command
if (prompt === "Bye!") {
  console.log("Shutdown message received. Exporting chat and closing server...");

  // Export chat history to HTML
  const htmlContent = await exportGeminiChatToHTML();

  // Set headers for file download
  res.set('Content-Type', 'text/html');
  res.set('Content-Disposition', 'attachment; filename="gemini_history.html"');

  // Send the HTML content
  res.send(htmlContent);

  // Wait for the response to be fully sent before shutting down
  res.end(() => {
    console.log("Chat history sent to client, initiating shutdown...");

    if (isShuttingDown) {
      return res.status(503).send('Server is shutting down');
  }
    isShuttingDown = true; // Set the shutdown flag

    // Delay before shutting down the server to allow file download
    setTimeout(() => {
      console.log("Sending SIGTERM to self...");
        process.kill(process.pid, 'SIGINT'); // Send SIGTERM to self
      server.close(() => {
        console.log("Server successfully shut down.");
        process.exit(99);
      });
    }, 1000); // 10 seconds delay
  });

  return; // End the execution of the function here
}

// Add user's prompt to conversation history with a label
geminiHistory += 'User Prompt: ' + prompt + '\n';

// Handle text-only input
if (!history && (!imageParts || imageParts.length === 0)) {

  // Initialize the Google model for text-only input
  const googleModel = genAI.getGenerativeModel({ model: model, generationConfig: defaultConfig, safetySettings });
  // Generate content based on the geminiHistory
  const result = await googleModel.generateContent(geminiHistory);

  const text = result.response.text();
  console.log('Response: ', text)
  // Add assistant's response to conversation history
  geminiHistory += 'Response: ' + text + '\n';
  console.log('Gemini History: ', geminiHistory)
      // Send the response
      res.json({ success: true, text: text });
    }
    // Handle text-and-image input (multimodal)
    else if (imageParts && imageParts.length > 0 && !history) {

      // Initialize the Google model for text-and-image input
      const googleModel = genAI.getGenerativeModel({ model: model, generationConfig: defaultConfig, safetySettings });
console.log(googleModel);
      // Convert image parts to the required format using the new function
      // Construct file paths from received filenames and convert image parts
      const convertedImageParts = imageParts.map(part => {
        // Construct the file path from the filename
        const filePath = `public/uploads/${part.filename}`; // Update with the actual path to uploaded images
        return convertImageForGemini(filePath, part.mimeType);
      });

      // Generate content based on the prompt and images
      const result = await googleModel.generateContent([prompt, ...convertedImageParts]);
      const response = result.response;
      const text = response.text();
      console.log(text);

      // Send the response
      res.json({ success: true, text: text });
    }
    // Handle multi-turn chat functionality
    else if (history && history.length > 0) {
      if (model !== 'gemini-pro') {
        return res.status(400).json({ error: 'Invalid model for chat. Use gemini-pro.' });
      }

      // Initialize the Google model for chat
      const googleModel = genAI.getGenerativeModel({ model: 'gemini-pro', generationConfig: defaultConfig, safetySettings });

      // Start the chat with the provided history
      const chat = googleModel.startChat({ history });
      console.log(chat);
      console.log(history);
      // Send the user's message and get the response
      const result = await chat.sendMessage({ role: "user", parts: prompt });
      const response = result.response;
      const text = response.text();
      console.log("Chat", text);

      // Send the response
      res.json({ success: true, text: text });
    }
  } catch (error) {
    console.error('Error with Gemini API:', error.message);
    res.status(500).json({ error: "Error with Gemini API", details: error.message });
  }
});



// Optional streaming implementation
    // let text = '';
    // for await (const chunk of response.stream) {
    //   text += chunk.text();
    // }


// Streaming can only be properly implemented via 
// certain APIs that would defeat the whole purpose.

// See closed issue on this repo for more details.

// formatting claude array

function parseInstructionsIntoSections(instructionsText) {
  // Find the major section boundaries
  const roleAssignmentEnd = instructionsText.indexOf('</role_assignment>') + '</role_assignment>'.length;
  const claudeInfoStart = instructionsText.indexOf('<claude_info>');
  const claudeInfoEnd = instructionsText.indexOf('</claude_info>') + '</claude_info>'.length;
  const taskInstructionsStart = instructionsText.indexOf('<task_instructions>');
  const methodsEnd = instructionsText.indexOf('</methods>') + '</methods>'.length;
  const finalStart = instructionsText.indexOf('<final>');
  
  // Create the four main sections
  const sections = [
    {
      // Section 1: From <instructions> through </role_assignment>
      content: instructionsText.substring(0, roleAssignmentEnd)
    },
    {
      // Section 2: <claude_info> section
      content: instructionsText.substring(claudeInfoStart, claudeInfoEnd)
    },
    {
      // Section 3: From <task_instructions> through </methods>
      content: instructionsText.substring(taskInstructionsStart, methodsEnd)
    },
    {
      // Section 4: From <final> through </instructions>
      content: instructionsText.substring(finalStart)
    }
  ];

  return sections;
}

function formatSectionsIntoSystemMessage(sections) {
  return sections.map(section => ({
    type: "text",
    text: section.content,
    cache_control: { type: "ephemeral" }
  }));
}

// Handle POST request to '/message'

let headers;
let apiUrl = '';
let data;
let claudeHistory = [];
let epochs = 0;
let ocount = 0;
app.post('/message', async (req, res) => {
  let response;
  console.log("req.file:", req.file); // Check if the file is received
  console.log("Received model ID:", req.body.modelID); // Add this line
  const user_message = req.body.message;
  const modelID = req.body.modelID || 'gpt-4o'; // Extracting model ID from the request
  const image_url = req.body.image; // This will now be an URL
  console.log("Received request with size: ", JSON.stringify(req.body).length);
  isAssistants = false;
  temperature = req.body.temperature;
  if (process.env.TEMPERATURE) {
    const parsedTemp = parseFloat(process.env.TEMPERATURE);
    if (!isNaN(parsedTemp)) {
      temperature = parsedTemp;
    } else {
      console.error('Invalid TEMPERATURE value in .env file. Using default.');
      if (req.temperature) {
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

  // Export chat history to HTML
  const htmlContent = await exportChatToHTML();

  // Set headers for file download
  res.set('Content-Type', 'text/html');
  res.set('Content-Disposition', 'attachment; filename="chat_history.html"');

  // Send the HTML content
  res.send(htmlContent);

  // Wait for the response to be fully sent before shutting down
  res.end(() => {
    console.log("Chat history sent to client, initiating shutdown...");

    if (isShuttingDown) {
      return res.status(503).send('Server is shutting down');
  }
    isShuttingDown = true; // Set the shutdown flag

    // Delay before shutting down the server to allow file download
    setTimeout(() => {
      console.log("Sending SIGTERM to self...");
        process.kill(process.pid, 'SIGINT'); // Send SIGTERM to self
      server.close(() => {
        console.log("Server successfully shut down.");
        process.exit(99);
      });
    }, 1000); // 1 seconds delay
  });

  return; // End the execution of the function here
}


   // Retrieve model from the request

   let user_input = {
    role: "user",
    content: [] // Default initialization
  };

   // Assuming modelID is declared globally and available here
// Determine the structure of user_input.content based on modelID
if (modelID.startsWith('gpt') || modelID.startsWith('claude')) {
  if (epochs === 0) {
    if (modelID.startsWith('gpt')) {
      systemMessage = await initializeConversationHistory();
      epochs = epochs + 1;
    } else if (modelID.startsWith('claude')) {
      // Get the instructions text first
      const instructionsText = await initializeClaudeInstructions();
      
      // Parse the instructions into sections
      const sections = parseInstructionsIntoSections(instructionsText);
      
      // Format the sections into the system message array
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

  if (fileContents || (req.body.sessionId && req.app.locals.uploadedFiles?.get(req.body.sessionId))) {
    console.log(fileContents);
    
    if (modelID.startsWith('gpt')) {
      // Maintain existing GPT behavior
      user_input.content.push({ type: "text", text: file_id });
      user_input.content.push({ type: "text", text: fileContents });
    } else if (modelID.startsWith('claude')) {
      // Handle single file (backwards compatibility)
      if (fileContents) {
        if (file_id.endsWith('.pdf')) {
          // If it's a PDF, use Claude's PDF format
          user_input.content.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: fileContents // Assuming fileContents is already base64 for PDFs
            }
          });
        } else {
          // Maintain existing Claude XML format for non-PDFs
          user_input.content.push({ type: "text", text: "<file_name>" });
          user_input.content.push({ type: "text", text: file_id });
          user_input.content.push({ type: "text", text: "</file_name>" });
          user_input.content.push({ type: "text", text: "<file_contents>" });
          user_input.content.push({ type: "text", text: fileContents });
          user_input.content.push({ type: "text", text: "</file_contents>" });
        }
      }
      
      // Handle multiple files if present
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
            // Use existing XML format for non-PDFs
            user_input.content.push({ type: "text", text: "<file_name>" });
            user_input.content.push({ type: "text", text: file.file_id });
            user_input.content.push({ type: "text", text: "</file_name>" });
            user_input.content.push({ type: "text", text: "<file_contents>" });
            user_input.content.push({ type: "text", text: file.contents });
            user_input.content.push({ type: "text", text: "</file_contents>" });
          }
        }
        // Clean up after processing
        req.app.locals.uploadedFiles.delete(req.body.sessionId);
      }
    }
    
    fileContents = null;
}

  // Check for image in the payload
  if (req.body.image) {
    let base64Image;
    // If req.file is defined, it means the image is uploaded as a file
    if (req.file) {
      console.log("first if", req.file.path)
      base64Image = imageToBase64(req.file.path);
    } else {
      console.log("second if", req.body.image)
      // If req.file is not present, fetch the image from the URL
      base64Image = await imageURLToBase64(req.body.image);
    }
    if (base64Image) {
      if (modelID.startsWith('gpt')) {
      user_input.content.push({ type: "text", text: imageName });
      }
      if (modelID.startsWith('claude')) {
        // Split the base64 string to get the media type and actual base64 data
        const [mediaPart, base64Data] = base64Image.split(';base64,');
        const mediaType = mediaPart.split(':')[1]; // to get 'image/jpeg' from 'data:image/jpeg'
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
      
      // Optional: Clean up the uploaded file after sending to OpenAI
    fs.unlink(uploadedImagePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
      console.log("Temp file deleted");
    });
    }
  }
} else {
  systemMessage = await initializeConversationHistory();
  epochs = epochs + 1;
  // For Mistral models, user_input.content is a string and set to user_message
  user_input = {
    role: "user",
    content: ''
  };
  
  if (user_message) {
    // Directly assign user_message to content
    user_input.content = user_message; // Assuming user_message is a string
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


/*
let tokens = 4000;

if (modelID === 'gpt-4') {
  tokens = 6000; // If 'modelID' is 'gpt-4', set 'tokens' to 6000
}

if (modelID === 'gpt-4o-mini') {
  tokens = 12000;
}

if (modelID === 'gpt-4o') {
  tokens = 12000; // If 'modelID' is 'gpt-4', set 'tokens' to 6000
}

if (modelID.startsWith('llama-3.1')) {
  tokens = 8000;
}


if (modelID === 'claude-3-7-sonnet-latest') {
  tokens = 20000;
} else if (modelID.startsWith('claude')) {
  tokens = 8000;
}
*/


// Model Parameters Below!



    // Define the data payload with system message and additional parameters
    data = {

// UPDATE: Model Selector added for variability

      model: modelID, // Use the model specified by the client

      messages: conversationHistory, // Includes the System Prompt, previous queries and responses, and your most recently sent message.

      temperature: temperature, // Controls randomness: Lowering results in less random completions. 
      // As the temperature approaches zero, the model will become deterministic and repetitive.
      
      // top_p: 1,  // Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.

      max_tokens: tokens, // The maximum number of tokens to **generate** shared between the prompt and completion. The exact limit varies by model. 
      // (One token is roughly 4 characters for standard English text)
      
      // frequency_penalty: 0, 
      // How much to penalize new tokens based on their existing frequency in the text so far. 
      // Decreases the model's likelihood to repeat the same line verbatim.
      
      // presence_penalty: 0, 
      // How much to penalize new tokens based on whether they appear in the text so far.
      // Increases the model's likelihood to talk about new topics.

      // stream: true, // streaming messages from server to api for better memory efficiency
      
       // Additional Parameters
  // Stop Sequences
    // stop: ["<YOUR_STOP_SEQUENCE_HERE>", "<ANOTHER_STOP_SEQUENCE>"],
      // Up to four sequences where the API will stop generating further tokens. 
      // The returned text will not contain the stop sequence.

  // Best Of - returns the best one out of multiple generations
    // best_of: 3,
      // Uncomment this line for better responses; Warning: This is expensive.
      // This parameter allows you to generate multiple completions in the backend and return the best one.

  // Logprobs - number of log probabilities to return
    // logprobs: 10,
      // This parameter specifies the number of log probabilities to return. 
      // For example, setting logprobs: 10 will return the top 10 log probabilities for each token generated.

  // N - number of completions to generate
    // n: 2,
      // This parameter determines how many completions to generate for each prompt.
      // If set to a number greater than 1, the model will return multiple responses, 
      // Useful if you want options.

  // Logit Bias - adjusts likelihood of certain tokens
  // logit_bias: {"<TOKEN_ID>": <BIAS_VALUE>, "<ANOTHER_TOKEN_ID>": <BIAS_VALUE>},
      // This allows you to increase or decrease the likelihood of certain tokens appearing in the output.
      // It can be used to guide the model towards or away from specific themes or topics.

  // Add more parameters here as needed

    };

    // END
  let budget = tokens - 100;
  let ID;
    // Define the headers with the Authorization and, if needed, Organization
    // Determine the API to use based on modelID prefix
    if (modelID.includes('/')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      };
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    } else if (modelID.startsWith('gpt')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        // 'OpenAI-Organization': 'process.env.ORGANIZATION' // Uncomment if using an organization ID
      };
      apiUrl = 'https://api.openai.com/v1/chat/completions';
    } else if (modelID.startsWith('llama') || modelID.startsWith('gemma') || modelID === 'mixtral-8x7b-32768') {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.QROQ_API_KEY}`,
      };
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (modelID.includes('mistral') || modelID.includes('mixtral')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        // Add any Mistral-specific headers here if necessary
      };
      apiUrl = 'https://api.mistral.ai/v1/chat/completions';
    } else if (modelID === 'codestral-latest') {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.CODESTRAL_API_KEY}`,
        // Add any Mistral-specific headers here if necessary
      };
      apiUrl = 'https://codestral.mistral.ai/v1/chat/completions';
    } else if (modelID === 'claude-3-7-sonnet-latest' || modelID === 'claude-opus-4-20250514' || modelID === 'claude-sonnet-4-20250514') {
      claudeHistory.push(user_input);
      data = {
        // New data structure for Claude model
        model: modelID,
        max_tokens: tokens,
        thinking: {
          type: "enabled",
          budget_tokens: budget
        },
        temperature: 1,
        system: systemMessage,
        messages: claudeHistory,
      };
      headers = {
        'x-api-key': `${process.env.CLAUDE_API_KEY}`,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'output-128k-2025-02-19',
        // Add any Mistral-specific headers here if necessary
      };
      apiUrl = 'https://api.anthropic.com/v1/messages';
    } else if (modelID.startsWith('claude')) {
      claudeHistory.push(user_input);
      data = {
      // New data structure for Claude model
      model: modelID,
      max_tokens: tokens,
      temperature: temperature,
      system: systemMessage,
      messages: claudeHistory,
    };
      headers = {
        'x-api-key': `${process.env.CLAUDE_API_KEY}`,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        // Add any Mistral-specific headers here if necessary
      };
      apiUrl = 'https://api.anthropic.com/v1/messages';
    } else if (modelID.includes('o1') || modelID.includes('o3') || modelID.includes('o4')) {
      console.log("ocount", ocount);
      o1History.push(user_input);
      if (ocount > 0) {
      data = {
        model: modelID, // Use the model specified by the client
        previous_response_id: ID,
        reasoning: { effort: "high", summary: "auto" },
        input: user_input.content,
        store: true,
      }
    } else {
      data = {
        model: modelID, // Use the model specified by the client
        reasoning: { effort: "high", summary: "auto" },
        input: user_input.content,
        store: true,
      }
    }
      headers = {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        // 'OpenAI-Organization': 'process.env.ORGANIZATION' // Uncomment if using an organization ID
      };
      apiUrl = 'https://api.openai.com/v1/responses';
  } else if (modelID.includes('deepseek')) {
    conversationHistory.push(user_input);
    deepseekHistory.push(user_input);
    headers = {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      // Add any Mistral-specific headers here if necessary
    };
    apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  }


    // Log the data payload just before sending it to the chosen API
    console.log("API URL", apiUrl);
    console.log(`Sending to ${modelID.startsWith('gpt') ? 'OpenAI' : 'Mistral/Claude'} API:`, JSON.stringify(data, null, 2));

    try {
      // const response = await axios.post(apiUrl, data, { headers, responseType: 'stream' });
      response = await axios.post(apiUrl, data, { headers });
      console.log(response.data.id);
      ocount = ocount+1;
      console.log(ocount);
      ID = response.data.id;
      console.log("ID", ID);
      console.log(response.data);
      //console.log(response)
      // Process the response as needed
        // optional streaming implentation (currently disabled)

        /*
    let buffer = '';
  
    response.data.on('data', (chunk) => {
      buffer += chunk.toString(); // Accumulate the chunks in a buffer
    });
  
    response.data.on('end', () => {
      try {
        const lines = buffer.split('\n');
        let messageContent = '';
  
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.substring(6).trim();
            if (jsonString !== '[DONE]') {
              const parsedChunk = JSON.parse(jsonString);
              messageContent += parsedChunk.choices.map(choice => choice.delta?.content).join('');
            }
          }
        }
        */
       let messageContent;
       console.log(response.data.content)
       if (modelID === 'claude-3-7-sonnet-latest' || modelID === 'claude-opus-4-20250514' || modelID === 'claude-sonnet-4-20250514') {
        messageContent = response.data.content;
        // Initialize variables to hold 'thinking' and 'text' parts
        let thinkingContent = '';
        let textContent = '';

        // Check if messageContent is an array before proceeding
        if (Array.isArray(messageContent)) {
          // Iterate through the response array to extract contents
          messageContent.forEach((item) => {
            if (item.type === 'thinking') {
              thinkingContent += item.thinking + '\n'; // Append thinking content
            } else if (item.type === 'text') {
              textContent += item.text + '\n'; // Append text content
            }
          });

          // Combine both parts into a single formatted messageContent
          messageContent = `# Thinking:\n${thinkingContent}\n---\n# Response:\n${textContent}`;
        }
      } else if (modelID.startsWith('claude')) {
        //console.log(response.data.content)
        messageContent = response.data.content;
  } else if (modelID.includes('o1') || modelID.includes('o3') || modelID.includes('o4')) {
    // New handling for o1/o3/o4 models
    const outputArray = response.data.output;
    let reasoningContent = '';
    let assistantContent = '';
    
    // Loop through output items to find reasoning and message
    outputArray.forEach(item => {
      if (item.type === 'reasoning' && item.summary) {
        // Extract text from summary items
        if (Array.isArray(item.summary)) {
          // Handle array of summaries
          item.summary.forEach(summaryItem => {
            if (typeof summaryItem === 'object' && summaryItem.text) {
              reasoningContent += summaryItem.text + '\n\n';
            } else if (typeof summaryItem === 'string') {
              reasoningContent += summaryItem + '\n\n';
            }
          });
        } else if (typeof item.summary === 'object') {
          // Handle single summary object
          if (item.summary.text) {
            reasoningContent += item.summary.text;
          } else {
            reasoningContent += JSON.stringify(item.summary);
          }
        } else {
          // Handle plain string summary
          reasoningContent += item.summary;
        }
      }
      
      if (item.type === 'message' && item.role === 'assistant') {
        // Extract text from content
        if (typeof item.content === 'object') {
          if (Array.isArray(item.content)) {
            // Handle array of content objects
            item.content.forEach(contentItem => {
              if (typeof contentItem === 'object' && contentItem.text) {
                assistantContent += contentItem.text;
              } else if (typeof contentItem === 'string') {
                assistantContent += contentItem;
              }
            });
          } else if (item.content.text) {
            // Handle single content object with text property
            assistantContent += item.content.text;
          } else {
            assistantContent += JSON.stringify(item.content);
          }
        } else {
          // Handle plain string content
          assistantContent += item.content;
        }
      }
    });
    
    // Format the complete message with reasoning if available
    messageContent = reasoningContent ? 
      `# Thinking:\n${reasoningContent.trim()}\n\n---\n# Response:\n${assistantContent.trim()}` : 
      assistantContent.trim();
  } else if (modelID.includes('deepseek')) {
        // Extract both reasoning content and message content from DeepSeek response
        let reasoningContent = response.data.choices[0].message.reasoning_content || '';
        let textContent = response.data.choices[0].message.content || '';
        
        // Combine both parts into a single formatted messageContent with clear headings
        messageContent = `# Thinking:\n${reasoningContent}\n\n\n---\n# Response:\n${textContent}`;
      } else {
        messageContent = response.data.choices[0].message.content;
      }
      const lastMessageContent = messageContent;
        
  
        if (lastMessageContent) {

          console.log("Assistant Response: \n", lastMessageContent)

          if (modelID === 'claude-3-7-sonnet-latest' || modelID === 'claude-opus-4-20250514' || modelID === 'claude-sonnet-4-20250514') {
            claudeHistory.push({ role: "assistant", content: response.data.content });
            res.json({ text: messageContent });
          } else if (modelID.startsWith('claude')) {
            claudeHistory.push({ role: "assistant", content: response.data.content });
            //console.log("Claude History");
            res.json({ text: lastMessageContent[0].text });
          } else if (modelID.includes('o1') || modelID.includes('o3') || modelID.includes('o4')) {
            // Find the assistant message content in the output array
            const assistantMessageItem = response.data.output.find(item => 
              item.type === 'message' && item.role === 'assistant');
            // Push to history - make sure to store the full content for future context
            //o1History.push({ role: "assistant", content: assistantMessageItem.content });
            o1History.push({ role: "assistant", content: lastMessageContent });
            console.log("O1 History");
            res.json({ text: lastMessageContent });
          } else if (modelID === 'deepseek-reasoner') {
            conversationHistory.push({ role: "assistant", content: response.data.choices[0].message.content });
            deepseekHistory.push({ role: "assistant", content: lastMessageContent });
            console.log("DeepSeek History");
            res.json({ text: lastMessageContent });
          } else {
            // Add assistant's message to the conversation history
            conversationHistory.push({ role: "assistant", content: lastMessageContent });
            console.log("Conversation History");
            // Send this back to the client
            res.json({ text: lastMessageContent });
          }
          
          
          
        } else {
          // Handle no content scenario
          res.status(500).json({ error: "No text was returned from the API" });
        }
        /*
      } catch (parseError) {
        console.error('Error parsing complete response:', parseError.message);
        res.status(500).json({ error: "Error parsing the response from OpenAI API" });
      }
    });
  */
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    res.status(500).json({ error: "An error occurred when communicating with the OpenAI API.", details: error.message });
  }
  
});


// export markdown to html

app.get('/export-chat-html', async (req, res) => {
  console.log("Export request received for type:", req.query.type);
  const type = req.query.type; // Expecting 'gemini' or 'conversation' as query parameter
  console.log("Export request received for type:", type);
  let htmlContent;
  if (type === 'gemini') {
    htmlContent = await exportGeminiChatToHTML();
  } else if (type === 'assistants') {
    htmlContent = await exportAssistantsChat();
  } else if (type === 'conversation') {
    htmlContent = await exportChatToHTML();
  }

  res.set('Content-Type', 'text/html');
  res.set('Content-Disposition', `attachment; filename="${title}.html"`);
  // console.log(htmlContent);
  res.send(htmlContent);

  // No need to call res.end() after res.send(), as send() ends the response.
  console.log("Chat history sent to client, initiating shutdown...");
    
  // This part might need to be moved or adjusted depending on your shutdown logic
  if (isShuttingDown) {
    return res.status(503).send('Server is shutting down');
  }
  
  isShuttingDown = true; // Set the shutdown flag
  // Delay before shutting down the server to allow file download
  setTimeout(() => {
    console.log("Sending SIGTERM to self...");
    process.kill(process.pid, 'SIGINT'); // Send SIGTERM to self
    server.close(() => {
      console.log("Server successfully shut down.");
      process.exit(99);
    });
  }, 100); // 1-second delay
});

app.get('/get-instructions', (req, res) => {
  fs.readFile('./public/instructions.md', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading the file');
    }
    res.send(data);
  });
});

app.post('/update-instructions', (req, res) => {
  const newContent = req.body.content;
  fs.writeFile('./public/instructions.md', newContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error saving the file' });
    }
    res.send({ message: 'File updated successfully' });
  });
});

app.get('/get-my-env', (req, res) => {
  fs.readFile('.env', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading the file');
    }
    res.send(data);
  });
});

app.post('/update-my-env', (req, res) => {
  const newContent = req.body.content;
  fs.writeFile('.env', newContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error saving the file' });
    }
    res.send({ message: 'File updated successfully' });
  });
});


app.post('/shutdown-server', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send('Server is already shutting down');
  }

  isShuttingDown = true;
  res.send('Server shutdown initiated');

  setTimeout(() => {
    console.log("Sending SIGTERM to self...");
        process.kill(process.pid, 'SIGINT'); // Send SIGTERM to self
    server.close(() => {
      console.log('Server successfully shut down.');
      process.exit(99);
    });
  }, 1000); // 1-second delay for the response to be sent
});
  

// Start the server
// Ensure that the server can be accessed via any host
// Set trust proxy to ensure the server can be accessed via any host
app.set('trust proxy', true);

app.get('*', (req, res, next) => {
  if (req.path === '/portal' || req.path === '/config' || req.path === '/model') {
    next();
  } else {
    res.redirect('/portal');
  }
});

app.get('/portal', (req, res) => {
  res.sendFile('portal.html', { root: 'public' });
});

// Expose a configuration endpoint for the client
app.get('/config', (req, res) => {
  // Check if running on Vercel
  const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  // If it's Vercel, we don't need to specify host and port
  if (isVercelEnvironment) {
    res.json({
      // We could omit host and port entirely or set them to null/undefined
      host: undefined,
      port: undefined
    });
  } else {
    // For non-Vercel environments, return the necessary configuration
    res.json({
      host: process.env.HOST_CLIENT || 'localhost',
      port: process.env.PORT_CLIENT || 3000
    });
  }
});

// Route to send the default model to the frontend
app.get('/model', (req, res) => {
  const defaultModel = process.env.DEFAULT_MODEL;
  
  if (defaultModel) {
    res.json({ model: defaultModel });
  } else {
    res.json({ model: 'gpt-4o' });
  }
});

app.use(cors({
  origin: '*'
}));

// ============ DYNAMIC MODEL SYSTEM ============
// Add new model API routes for enhanced model management
try {
  const modelRoutes = require('./src/server/routes/models');
  app.use('/api', modelRoutes);
  console.log('🚀 Dynamic model system loaded successfully');
} catch (error) {
  console.log('⚠️  Dynamic model system not available (using core models only)');
  // Graceful degradation - original functionality still works
}
// ===============================================


const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const PORT = isVercelEnvironment ? process.env.PORT : process.env.PORT_SERVER || 3000;
const HOST = isVercelEnvironment ? '0.0.0.0' : process.env.HOST_SERVER || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

/*
// Gracefully handle SIGINT
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('Server successfully shut down.');
    process.exit(99); // Custom exit code to signal nodemon
  });
});



// Prevent nodemon from restarting on shutdown
if (process.env.NODE_ENV === 'development') {
  const nodemonShutdown = () => {
    console.log("Killing nodemon process...");
    process.kill(process.ppid, 'SIGUSR2');
  };

  process.on('SIGTERM', nodemonShutdown);
  process.on('SIGINT', nodemonShutdown);
  process.on('exit', nodemonShutdown);
}

*/
