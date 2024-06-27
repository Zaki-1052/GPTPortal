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
  const { username, password, openaiApiKey, googleApiKey, mistralApiKey, claudeApiKey } = req.body;

  let envContent = `USER_USERNAME=${username}\nUSER_PASSWORD=${password}\n`;

  if (openaiApiKey) {
    envContent += `OPENAI_API_KEY=${openaiApiKey}\n`;
  }
  if (googleApiKey) {
    envContent += `GOOGLE_API_KEY=${googleApiKey}\n`;
  }
  if (mistralApiKey) {
    envContent += `MISTRAL_API_KEY=${mistralApiKey}\n`;
  }
  if (claudeApiKey) {
    envContent += `CLAUDE_API_KEY=${claudeApiKey}\n`;
  }

  fs.writeFileSync('.env', envContent);

  res.json({ message: 'Environment variables successfully written' });

// Allow access to the '/portal' route
app.get('/portal', (req, res) => {
  res.sendFile('portal.html', { root: 'public' });
});

// Redirect all other routes (except for '/config' and '/setup') to '/portal'
app.get('*', (req, res, next) => {
  if (req.path === '/portal' || req.path === '/config') {
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

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    let uploadPath = 'public/uploads/';
    let originalName = file.originalname;
    let fileExt = path.extname(originalName);
    let baseName = path.basename(originalName, fileExt);
    let finalName = originalName;
    let counter = 1;
  
    while (fs.existsSync(path.join(uploadPath, finalName))) {
      finalName = `${baseName}(${counter})${fileExt}`;
      counter++;
    }
  
    cb(null, finalName); // Use a modified file name if the original exists
  }
});

const upload = multer({ storage: storage });


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
    formData.append('model', 'whisper-1');

    // API request
    const transcriptionResponse = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      { 
        headers: { 
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` 
        } 
      }
    );

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

let conversationHistory = [];

// Function to read instructions from the file using fs promises
async function readInstructionsFile() {
  try {
      // Adjust the path if your folder structure is different
      const instructions = await fs.promises.readFile('./public/instructions.md', 'utf8');
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
  conversationHistory.push({ role: "system", content: systemMessage });
  return systemMessage;
}

// Call this function when the server starts
initializeConversationHistory();

async function initializeSystem() {
  const systemMessage = await initializeConversationHistory();
  // Make sure this systemMessage is passed where needed
  // Continue with the rest of your initialization logic
}

let geminiHistory = '';

async function readGeminiFile() {
  try {
      // Adjust the path if your folder structure is different
      const geminiFile = await fs.promises.readFile('./public/geminiMessage.txt', 'utf8');
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
      geminiHistory += systemMessage + '\n';
  } catch (error) {
      console.error('Error initializing Gemini conversation history:', error);
  }
}

// Call this function when the server starts
initializeGeminiConversationHistory();

 // Function to convert conversation history to HTML
 function exportChatToHTML() {
  // Log the current state of both conversation histories before deciding which one to use
  // console.log("Current GPT Conversation History: ", JSON.stringify(conversationHistory, null, 2));
  // console.log("Current Claude Conversation History: ", JSON.stringify(claudeHistory, null, 2));

  let containsAssistantMessage = conversationHistory.some(entry => entry.role === 'assistant');

  let chatHistory;
  if (containsAssistantMessage) {
      console.log("Using GPT conversation history because it's non-empty.");
      chatHistory = conversationHistory;
  } else {
      console.log("Using Claude conversation history as GPT history is empty or undefined.");
      chatHistory = [...claudeHistory];
      chatHistory.unshift({
        role: 'system',
        content: claudeInstructions
      });
  }

  // Log the determined chatHistory
  // console.log("Determined Chat History: ", JSON.stringify(chatHistory, null, 2));

  let htmlContent = `
    <html>
    <head>
      <title>Chat History</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .system { background-color: #f0f0f0; }
        .user { background-color: #d1e8ff; }
        .assistant { background-color: #c8e6c9; }
        .generated-image { max-width: 100%; height: auto; }
        /* Add more styles as needed for Markdown elements like headers, lists, etc. */
      </style>
    </head>
    <body>
  `;

  console.log("Chat History: ", JSON.stringify(chatHistory, null, 2));

  chatHistory.forEach(entry => {
    let formattedContent = '';

    if (Array.isArray(entry.content)) {
      entry.content.forEach(item => {
        if (item.type === 'text' && typeof item.text === 'string') {
          formattedContent += marked(item.text); // Convert Markdown to HTML
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

  htmlContent += '</body></html>';
  return htmlContent;
}


// Function to convert Gemini conversation history to HTML
function exportGeminiChatToHTML() {
  let htmlContent = `
    <html>
    <head>
      <title>Gemini Chat History</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .system { background-color: #f0f0f0; }
        .user { background-color: #d1e8ff; }
        .assistant { background-color: #c8e6c9; }
        .generated-image { max-width: 100%; height: auto; }
        /* Additional styles */
      </style>
    </head>
    <body>
  `;

  // Convert newlines in each part of the chat history to <br> for HTML display
  const convertNewlinesToHtml = text => text.replace(/\n/g, '<br>');

  // Use a regular expression to match the prompts and responses in the history
  const messageRegex = /(System Prompt: |User Prompt: |Response: )/g;
  // Split the history by the regex, but keep the delimiters
  const messages = geminiHistory.split(messageRegex).slice(1); // slice to remove the first empty string if any

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

  htmlContent += '</body></html>';
  return htmlContent;
}



// claude instructions

let claudeInstructions;

// Function to read instructions from the file using fs promises
async function readClaudeFile() {
  try {
      // Adjust the path if your folder structure is different
      const claudeFile = await fs.promises.readFile('./public/claudeInstructions.xml', 'utf8');
      return claudeFile;
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
}

// Call this function when the server starts
initializeClaudeInstructions();


// file upload

let file_id;
let fileContents;
let embedding;
let isAssistants = false;

// Endpoint to handle image upload
app.post('/upload-file', upload.single('file'), async (req, res) => {
  console.log("File received in /upload-file:", req.file);
  if (!req.file) {
    return res.status(400).send({ error: 'No image file provided.' });
  }

  const tempFilePath = req.file.path;

  try {

    if (isAssistants === false) {
      file_id = req.file.filename;
      fileContents = await fs.promises.readFile(tempFilePath, 'utf8');
      console.log("File Contents:", fileContents);
      console.log("File ID:", file_id);
      console.log(fileContents);

    // embedding = send to /embeddings python backend in FlaskApp
      console.log("File ID:", file_id)
    } else if (isAssistants === true) {
    // Create a file for the assistants
    if (!assistant) {
      const systemMessage = await initializeConversationHistory();
      await AssistantAndThread(modelID, systemMessage);
    }
  const file = await openai.files.create({
    file: fs.createReadStream(tempFilePath),
    purpose: 'assistants'
  });

  const assistantFile = await openai.beta.assistants.files.create(
    assistant.id,
    {
      file_id: file.id
    }
  );

  console.log("File attached to assistant:", assistantFile);
  }

    // Optional: Clean up the uploaded file after sending to OpenAI
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
      console.log("Temp file deleted");
    });

    initialize = false;
    console.log("Initialize:", initialize)

    res.json({ success: true, fileId: file_id, initialize });
  } catch (error) {
    console.error('Failed to upload file to OpenAI:', error);
  }
});


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

  console.log("Messages Response:", JSON.stringify(messages, null, 2)); // Enhanced debugging: Log the messages response with formatting
  const systemMessage = await initializeConversationHistory();
  // Convert systemMessage from markdown to HTML and ensure it's only added if defined
  const systemMessageHtml = systemMessage ? convertMarkdownToHtml(systemMessage) : '';

  let htmlContent = `
  <html>
  <head>
      <title>Chat History</title>
      <style>
          body { font-family: Arial, sans-serif; }
          .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
          .system-message { background-color: #ffffcc; } /* Styling for system message */
          .system { background-color: #f0f0f0; }
          .user { background-color: #d1e8ff; }
          .assistant { background-color: #c8e6c9; }
          .generated-image { max-width: 100%; height: auto; }
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
              return convertMarkdownToHtml(textContent);
          } else if (contentItem.type === 'image') {
              // Handle image content
              return `<img src="${contentItem.image_url}" alt="Generated Image" class="generated-image"/>`;
          }
      }).filter(Boolean).join(''); // Filter out undefined or null values and join

      htmlContent += `<div class="message ${roleClass}"><strong>${roleClass.toUpperCase()}:</strong> ${formattedContent}</div>`;
  });

  htmlContent += '</body></html>';
  return htmlContent;
}



// Function to convert an image URL to base64
async function imageURLToBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer' // Ensure the image data is received in the correct format
    });
    return `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null; // Return null if there is an error
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
    const { model, prompt, imageParts, history } = req.body;
    console.log('Prompt: ', prompt)
isAssistants = false;
// Check for shutdown command
if (prompt === "Bye!") {
  console.log("Shutdown message received. Exporting chat and closing server...");

  // Export chat history to HTML
  const htmlContent = exportGeminiChatToHTML();

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
    }, 1000); // 10 seconds delay
  });

  return; // End the execution of the function here
}

// Add user's prompt to conversation history with a label
geminiHistory += 'User Prompt: ' + prompt + '\n';

// Handle text-only input
if (!history && (!imageParts || imageParts.length === 0)) {
console.log("this endpoint");

  // Initialize the Google model for text-only input
  const googleModel = genAI.getGenerativeModel({ model: model, generationConfig: defaultConfig, safetySettings });
  console.log(googleModel);
  // Generate content based on the geminiHistory
  const result = await googleModel.generateContent(geminiHistory);
  console.log(result);

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


// Handle POST request to '/message'

let headers;
let apiUrl = '';
let data;
let claudeHistory = [];

app.post('/message', async (req, res) => {
  console.log("req.file:", req.file); // Check if the file is received
  console.log("Received model ID:", req.body.modelID); // Add this line
  const user_message = req.body.message;
  const modelID = req.body.modelID || 'gpt-4'; // Extracting model ID from the request
  const image_url = req.body.image; // This will now be an URL
  console.log("Received request with size: ", JSON.stringify(req.body).length);
  isAssistants = false;
 // Check for shutdown command
if (user_message === "Bye!") {
  console.log("Shutdown message received. Exporting chat and closing server...");

  // Export chat history to HTML
  const htmlContent = exportChatToHTML();

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

  if (fileContents) {
    console.log(fileContents);
    if (modelID.startsWith('gpt')) {
      user_input.content.push({ type: "text", text: file_id });
      user_input.content.push({ type: "text", text: fileContents });
    } else if (modelID.startsWith('claude')) {
      user_input.content.push({ type: "text", text: "<file_name>" });
      user_input.content.push({ type: "text", text: file_id });
      user_input.content.push({ type: "text", text: "</file_name>" });
      user_input.content.push({ type: "text", text: "<file_contents>" });
      user_input.content.push({ type: "text", text: fileContents });
      user_input.content.push({ type: "text", text: "</file_contents>" });
    }
    
    
    fileContents = null;
  }

  // Check for image in the payload
  if (req.body.image) {
    let base64Image;
    // If req.file is defined, it means the image is uploaded as a file
    if (req.file) {
      base64Image = imageToBase64(req.file.path);
    } else {
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



let tokens = 4000;

if (modelID === 'gpt-4') {
  tokens = 6000; // If 'modelID' is 'gpt-4', set 'tokens' to 6000
}


// Model Parameters Below!



    // Define the data payload with system message and additional parameters
    data = {

// UPDATE: Model Selector added for variability

      model: modelID, // Use the model specified by the client

      messages: conversationHistory, // Includes the System Prompt, previous queries and responses, and your most recently sent message.

      temperature: 0.8, // Controls randomness: Lowering results in less random completions. 
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
    } else if (modelID.startsWith('claude')) {
      claudeHistory.push(user_input);
      data = {
        // New data structure for Claude model
        model: modelID,
        max_tokens: 4000,
        temperature: 1,
        system: claudeInstructions,
        messages: claudeHistory,
      };
      headers = {
        'x-api-key': `${process.env.CLAUDE_API_KEY}`,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        // Add any Mistral-specific headers here if necessary
      };
      apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    // Log the data payload just before sending it to the chosen API
    console.log("API URL", apiUrl);
    console.log(`Sending to ${modelID.startsWith('gpt') ? 'OpenAI' : 'Mistral/Claude'} API:`, JSON.stringify(data, null, 2));

    try {
      // const response = await axios.post(apiUrl, data, { headers, responseType: 'stream' });
      const response = await axios.post(apiUrl, data, { headers });
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

       if (modelID.startsWith('claude')) {
        messageContent = response.data.content;
      } else {
        messageContent = response.data.choices[0].message.content;
      }
      const lastMessageContent = messageContent;
        
  
        if (lastMessageContent) {

          console.log("Assistant Response: ", lastMessageContent)

          if (modelID.startsWith('claude')) {
            claudeHistory.push({ role: "assistant", content: lastMessageContent[0].text });
            console.log("Claude History: ", claudeHistory);
            res.json({ text: lastMessageContent[0].text });
          } else {
            // Add assistant's message to the conversation history
            conversationHistory.push({ role: "assistant", content: lastMessageContent });
            console.log("Conversation History: ", conversationHistory);
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
    htmlContent = exportGeminiChatToHTML();
  } else if (type === 'assistants') {
    htmlContent = await exportAssistantsChat();
  } else if (type === 'conversation') {
    htmlContent = exportChatToHTML();
  }

  res.set('Content-Type', 'text/html');
  res.set('Content-Disposition', 'attachment; filename="' + (type === 'gemini' ? 'gemini_chat_history.html' : 'chat_history.html') + '"');
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
  if (req.path === '/portal' || req.path === '/config') {
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

app.use(cors({
  origin: '*'
}));


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