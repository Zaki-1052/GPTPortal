require('dotenv').config();
const express = require('express');
const axios = require('axios');
const basicAuth = require('express-basic-auth');
const fs = require('fs').promises;
const app = express();
app.use(express.static('public')); // Serves your static files from 'public' directory

const cors = require('cors');
app.use(cors());

// Basic Authentication users
const users = {
  'Username': 'Password'
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

let conversationHistory = [];

// Function to read instructions from the file
async function readInstructionsFile() {
  try {
      // Adjust the path if your folder structure is different
      const instructions = await fs.readFile('./public/instructions.md', 'utf8');
      return instructions;
  } catch (error) {
      console.error('Error reading instructions file:', error);
      return ''; // Return empty string or handle error as needed
  }
}

// Function to initialize the conversation history with instructions
async function initializeConversationHistory() {
  const fileInstructions = await readInstructionsFile();
  let systemMessage = `You are a helpful and intelligent assistant, knowledgeable about a wide range of topics.\nSpecifically: ${fileInstructions}`;
  conversationHistory.push({ role: "system", content: systemMessage });
}

// Call this function when the server starts
initializeConversationHistory();


// Handle POST request to '/message'
app.post('/message', async (req, res) => {
  const user_message = req.body.message;
  const user_image = req.body.image; // Add this line to accept an image in the request
  console.log("Received request with size: ", JSON.stringify(req.body).length);
  // Check for shutdown command
  if (user_message === "Bye!") {
      console.log("Shutdown message received. Closing server...");

      // Optionally, respond to the user before shutting down
      res.json({ text: "Shutting down the server. Goodbye!" });

      // Gracefully shut down the server
      server.close(() => {
          console.log("Server successfully shut down.");
      });

      // If using Node.js 17+, use the following line instead
      // process.exit(0);
      return; // End the execution of the function here
  }

  // Check if there's an image and format the message accordingly
  if (user_image) {
    user_input = {
      role: "user",
      content: [
        { type: "text", text: user_message },
        { type: "image_base64", image_base64: user_image }
      ]
    };
  }

     
  // Include the user's input in the conversation history
  let user_input = {
    role: "user",
    content: user_image ? [{ type: "text", text: user_message }, { type: "image_base64", image_base64: user_image }] : user_message
  };
  conversationHistory.push(user_input);


    // Define the data payload with system message and additional parameters
    const data = {
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      max_tokens: 2000,
      temperature: 1.1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      // Add more parameters here as needed
    };
  
    // Define the headers with the Authorization and, if needed, Organization
    const headers = {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      // If you're using an organization ID, uncomment the following line
      // 'OpenAI-Organization': 'org-0HgL8mXie7vQHDsWYemKZgkz'
    };

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

  

app.get('/portal', (req, res) => {
    res.sendFile('portal.html', { root: 'public' });
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});