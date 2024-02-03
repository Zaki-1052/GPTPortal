// importing required node packages

let isShuttingDown = false;
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const basicAuth = require('express-basic-auth');
const fs = require('fs');
const { marked } = require('marked');
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.static('public')); // Serves your static files from 'public' directory
const download = require('image-downloader');
const cors = require('cors');
app.use(cors());
const router = express.Router();


const OpenAI = require('openai').default;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});


// Authenticates your login

// Basic Authentication users
const username = process.env.USER_USERNAME;
const password = process.env.USER_PASSWORD;

const users = {
  [username]: password
};


// Apply basic authentication middleware
app.use(basicAuth({
  users: users,
  challenge: true
}));

const bodyParser = require('body-parser');

// Increase the limit for JSON bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));


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
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Retain original file extension
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
}

// Call this function when the server starts
initializeConversationHistory();


 // Helper function to convert markdown to HTML
const convertMarkdownToHtml = markdown => marked(markdown);

// Function to export conversation history to HTML, including systemMessage and ensuring correct order
async function exportChatToHTML() {
  let messages = await fetchMessages(); // Fetch messages using the new function
  
  // Assuming messages are in reverse chronological order; sort them to chronological order
  messages.sort((a, b) => a.created_at - b.created_at);

  console.log("Messages Response:", JSON.stringify(messages, null, 2)); // Enhanced debugging: Log the messages response with formatting

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



let file_id;

// Endpoint to handle image upload
app.post('/upload-file', upload.single('file'), async (req, res) => {
  console.log("File received in /upload-file:", req.file);
  if (!req.file) {
    return res.status(400).send({ error: 'No image file provided.' });
  }
  
  if (!assistant) {
    await AssistantAndThread(modelID);
  }

  const tempFilePath = req.file.path;

  try {
    if (!assistant || !assistant.id) {
      throw new Error("Assistant is not initialized.");
    }
    // Create a file for the assistants
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

    file_id = file.id;
    console.log("File ID:", file_id)

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


let systemMessage = null;  // Global variable for systemMessage
let assistant = null;
let thread = null;
let response = '';
let initialize = true;
let messages;

// Utility function to ensure Assistant and Thread initialization
async function AssistantAndThread(modelID) {
  if (!assistant || !thread) {
    assistant = await openai.beta.assistants.create({
      name: "Assistant",
      instructions: systemMessage,
      tools: [{ type: "code_interpreter" }],
      model: modelID
    });
    thread = await openai.beta.threads.create();
    console.log("Assistant and Thread ensured:", assistant, thread);
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

let modelID = 'gpt-4-turbo-preview';

app.post('/assistant', async (req, res) => {
  let userMessage = req.body.message;
  modelID = req.body.modelID;
  initialize = req.body.initialize;

  try {
    // Check if assistant and thread need to be initialized
    if (initialize = true) {
      console.log("Initialize:", initialize)
      await AssistantAndThread(modelID);

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



// export markdown to html

// Export markdown to html
app.get('/export-chat-html', async (req, res) => {
  try {
    const htmlContent = await exportChatToHTML(); // Make sure to await the async function

    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'attachment; filename=chat_history.html');
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
      server.close(() => {
        console.log("Server successfully shut down.");
      });
    }, 100); // 1-second delay

  } catch (error) {
    console.error('Failed to export chat to HTML:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/portal', (req, res) => {
    res.sendFile('portal.html', { root: 'public' });
  });
  

// Start the server
// Assuming `app` is an instance of your server (like an Express app)
const PORT = process.env.PORT || 3000;

// Listen only on the loopback interface (localhost)
const HOST = 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
