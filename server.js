require('dotenv').config();
const express = require('express');
const axios = require('axios');
const basicAuth = require('express-basic-auth');

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serves your static files from 'public' directory

const cors = require('cors');
app.use(cors());

// Basic Authentication users
const users = {
  'Zakir': '3003334'
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

// Handle POST request to '/message'
app.post('/message', async (req, res) => {
    const user_message = req.body.message;
  
    // Define the data payload with system message and additional parameters
    const data = {
      model: "gpt-3.5-turbo-0613",
      messages: [
        { role: "system", content: "You're a helpful assistant." },
        { role: "user", content: user_message }
      ],
      max_tokens: 50,
      temperature: 1.0,
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
  
    try {
      // Make the POST request to the OpenAI API with the defined data and headers
      const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
      
      // Send back the last message content from the response
      const messages = response.data.choices[0].message;
      const lastMessage = messages[messages.length - 1].content;
      res.json({ text: lastMessage.trim() });
    } catch (error) {
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
