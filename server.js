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

const cors = require('cors');
app.use(cors());


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



const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const FormData = require('form-data');
const path = require('path');

// transcribing audio with Whisper api

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Write the buffer to a temporary file
    const tempFilePath = path.join(__dirname, 'tempAudioFile.mpeg');
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Create FormData and append the temporary file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath), 'tempAudioFile.mpeg');
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
    fs.unlinkSync(tempFilePath);

    // Prepend "Voice Transcription: " to the transcription
    const transcription = "Voice Transcription: " + transcriptionResponse.data.text;

    // Send the modified transcription back to the client
    res.json({ text: transcription });
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
  let systemMessage = `You are a helpful and intelligent assistant, knowledgeable about a wide range of topics.\nSpecifically: ${fileInstructions}`;
  conversationHistory.push({ role: "system", content: systemMessage });
}

// Call this function when the server starts
initializeConversationHistory();

 // Function to convert conversation history to HTML
 function exportChatToHTML() {
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
        /* Add more styles as needed */
      </style>
    </head>
    <body>
  `;

  conversationHistory.forEach(entry => {
    let formattedContent = marked(entry.content); // Convert Markdown to HTML
    htmlContent += `<div class="message ${entry.role}"><strong>${entry.role.toUpperCase()}:</strong> ${formattedContent}</div>`;
  });

  htmlContent += '</body></html>';
  return htmlContent;
}

// Handle POST request to '/message'
app.post('/message', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).send('Server is shutting down');
}
  const user_message = req.body.message;
  const user_image = req.body.image; // Accepting an image in the request
  console.log("Received request with size: ", JSON.stringify(req.body).length);

  // Check for shutdown command
  if (user_message === "Bye!") {
    console.log("Shutdown message received. Exporting chat and closing server...");
    isShuttingDown = true; // Set the shutdown flag
    // Export chat history to HTML and send it as a response
    const htmlContent = exportChatToHTML();
    res.set('Content-Type', 'text/html');
    res.set('Content-Disposition', 'attachment; filename="chat_history.html"');
    res.send(htmlContent);

    // Delay before shutting down the server to allow file download
    setTimeout(() => {
      server.close(() => {
          console.log("Server successfully shut down.");
      });
    }, 5000); // 5 seconds delay

    return; // End the execution of the function here
  }

  // Include the user's input in the conversation history if it's not "Bye!"
  if (user_image) {
    user_input = {
      role: "user",
      content: [
        { type: "text", text: user_message },
        { type: "image_base64", image_base64: user_image }
      ]
    };
  } else {
    user_input = {
      role: "user",
      content: user_message
    };
  }
  conversationHistory.push(user_input);


 

     
  // Include the user's input in the conversation history
  let user_input = {
    role: "user",
    content: user_image ? [{ type: "text", text: user_message }, { type: "image_base64", image_base64: user_image }] : user_message
  };
  conversationHistory.push(user_input);





// Model Parameters Below!



    // Define the data payload with system message and additional parameters
    const data = {

      // model: "gpt-4-vision-preview", // Use "gpt-4" for non-vision capabilities.
      // Model is specified here as the vision-capable GPT-4. 
      // If users are using this portal solely for its intelligence, and do not care about "vision", then they should change the model name.
      // The Model Name can be changed to: 
      // model: "gpt-4",
      // So Delete the "// " before "model" labelling GPT-4 and add/put them before "model: "gpt-4-vision-preview", if you'd like to switch.
      // This is called "commenting out", and is good practice for code maintainability, like:
      // model: "gpt-4-vision-preview", 

      // UPDATE: Users will have to change to the Vision model manually if they would like to use it;
      // the default is now: 
      model: "gpt-4",

      messages: conversationHistory, // Includes the System Prompt, previous queries and responses, and your most recently sent message.
      
      max_tokens: 4000, // The maximum number of tokens to **generate** shared between the prompt and completion. The exact limit varies by model. 
      // (One token is roughly 4 characters for standard English text)
      
      temperature: 1.1, // Controls randomness: Lowering results in less random completions. 
      // As the temperature approaches zero, the model will become deterministic and repetitive.
      
      top_p: 1,  // Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.
      
      frequency_penalty: 0, // How much to penalize new tokens based on their existing frequency in the text so far. 
      // Decreases the model's likelihood to repeat the same line verbatim.
      
      presence_penalty: 0, // How much to penalize new tokens based on whether they appear in the text so far.
      // Increases the model's likelihood to talk about new topics.
      
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
    const headers = {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      // If you're using an organization ID, uncomment the following line
      // 'OpenAI-Organization': 'process.env.ORGANIZATION'
    }; // And add it to the `.env` file. This is inapplicable to most users.

    // Log the data payload just before sending it to the OpenAI API
  console.log("Sending to OpenAI API:", JSON.stringify(data, null, 2));
  
    try {
      // Make the POST request to the OpenAI API with the defined data and headers
      const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
      
      // Log the response data for debugging
      console.log(JSON.stringify(response.data, null, 2));

      
      // Send back the last message content from the response
      // Extract the last message content from the response
    // Extract the last message content from the response
    const lastMessageContent = response.data.choices[0].message.content;

    if (lastMessageContent) {
      // Add assistant's message to the conversation history
      conversationHistory.push({ role: "assistant", content: lastMessageContent.trim() });

      // Send this back to the client
      res.json({ text: lastMessageContent.trim() });
    } else {
      // Handle no content scenario
      res.status(500).json({ error: "No text was returned from the API" });
    }
  } catch (error) {
    // Handle request error
    console.error('Error calling OpenAI API:', error.message);
    if (error.response) {
      console.error(error.response.data);
    }
    res.status(500).json({ error: "An error occurred when communicating with the OpenAI API.", details: error.message });
  }
});


// export markdown to html


app.get('/export-chat-html', (req, res) => {
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
        /* Add more styles as needed for Markdown elements like headers, lists, etc. */
      </style>
    </head>
    <body>
  `;

  conversationHistory.forEach(entry => {
    let formattedContent = marked(entry.content); // Use marked to convert Markdown to HTML

    htmlContent += `<div class="message ${entry.role}"><strong>${entry.role.toUpperCase()}:</strong> ${formattedContent}</div>`;
  });

  htmlContent += '</body></html>';

  res.set('Content-Type', 'text/html');
  res.set('Content-Disposition', 'attachment; filename="chat_history.html"');
  res.send(htmlContent);
});



app.get('/portal', (req, res) => {
    res.sendFile('portal.html', { root: 'public' });
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});