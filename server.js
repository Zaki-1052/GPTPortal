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
const OpenAI = require('openai').default;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

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

const users = {
  [username]: password
};


// Apply basic authentication middleware
app.use(basicAuth({
  users: users,
  challenge: true
}));

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
    transcription = transcriptionResponse.data.text;

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
  console.log("Current GPT Conversation History: ", JSON.stringify(conversationHistory, null, 2));
  console.log("Current Claude Conversation History: ", JSON.stringify(claudeHistory, null, 2));

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
        content: systemMessage
      });
  }

  // Log the determined chatHistory

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
    const { model, prompt, history } = req.body;
    console.log('Prompt: ', prompt)

// Add user's prompt to conversation history with a label
geminiHistory += 'User Prompt: ' + prompt + '\n';


  // Initialize the Google model for text-only input
  const googleModel = genAI.getGenerativeModel({ model: 'gemini-pro', generationConfig: defaultConfig, safetySettings });
  // Generate content based on the geminiHistory
  const result = await googleModel.generateContent(geminiHistory);

  const text = result.response.text();
  console.log('Response: ', text)
  // Add assistant's response to conversation history
  geminiHistory += 'Response: ' + text + '\n';
  console.log('Gemini History: ', geminiHistory)
      // Send the response
      res.json({ success: true, text: text });
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
  console.log("Received request with size: ", JSON.stringify(req.body).length);

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
      user_input.content.push({ type: "text", text: user_message });
  }

  if (fileContents) {
    console.log(fileContents);
    user_input.content.push({ type: "text", text: file_id });
    user_input.content.push({ type: "text", text: fileContents });
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
      user_input.content.push({ type: "text", text: imageName });
      if (modelID.startsWith('claude')) {
        // Split the base64 string to get the media type and actual base64 data
        const [mediaPart, base64Data] = base64Image.split(';base64,');
        const mediaType = mediaPart.split(':')[1]; // to get 'image/jpeg' from 'data:image/jpeg'

        user_input.content.push({
            type: "image",
            source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data
            }
        });
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

      temperature: 1, // Controls randomness: Lowering results in less random completions. 
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
    if (modelID.startsWith('gpt')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        // 'OpenAI-Organization': 'process.env.ORGANIZATION' // Uncomment if using an organization ID
      };
      apiUrl = 'https://api.openai.com/v1/chat/completions';
    } else if (modelID.includes('mistral') || modelID.includes('mixtral')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        // Add any Mistral-specific headers here if necessary
      };
      apiUrl = 'https://api.mistral.ai/v1/chat/completions';
    } else if (modelID.startsWith('claude')) {
      claudeHistory.push(user_input);
      data = {
        // New data structure for Claude model
        model: modelID,
        max_tokens: 4000,
        temperature: 1,
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
    } else if (modelID.startsWith('llama') || modelID.startsWith('Llama')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
      };
      apiUrl = 'https://api.llama-api.com/chat/completions';
    } else if (modelID.includes('/')) {
      conversationHistory.push(user_input);
      headers = {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      };
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
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
    server.close(() => {
      console.log("Server successfully shut down.");
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