# Chatbot Portal with GPT-4 API

Welcome to the Chatbot Portal, a Node.js-based web application that allows users to interact with a chatbot powered by OpenAI's GPT-4 API.

## Features

- Interactive chat interface with support for text messages.
- Image upload functionality for visual context in discussions.
- Server-side integration with OpenAI GPT-4 API.
- Basic authentication for secure access.
- Simple and intuitive UI with copy-to-clipboard feature for chat messages.

## Structure

- **portal.html**: This is the main HTML file that users will interact with. It contains the structure for the chat interface, including a text input for messages, a button for sending images, and a script link to your `script.js` file.

- **script.js**: This JavaScript file contains the client-side logic. It listens for user inputs, handles sending messages and images to the server, and displays responses in the chat interface. There's also functionality to handle file selection for image uploads and copying text to the clipboard.

- **server.js**: This is the server-side Node.js file using Express.js. It handles incoming POST requests to the `/message` endpoint, interacts with the OpenAI GPT-4 API to process the chat messages, and sends back the responses. It also deals with CORS, basic authentication, and static file serving.

## Prerequisites

- Node.js installed on the server.
- An OpenAI API key.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary Node.js packages:

   ```sh
   npm install
   ```

4. Set up your environment variables:

   - Create a `.env` file in the root directory.
   - Add your OpenAI API key:

     ```env
     OPENAI_API_KEY=your_api_key_here
     ```

5. Start the server:

   ```sh
   node server.js
   ```

6. Open your web browser and navigate to `http://localhost:3000/portal` to access the chat interface.

## Usage

- Type your message in the text box and press Enter or click the Send button.
- To send an image, click the 🖼️ button and select an image file. The image will be sent along with the next message.

## Contributions

Contributions are welcome! Please fork the repository and submit a pull request with your updates.

## License

This project is open source and available under the [MIT License](LICENSE.md).

