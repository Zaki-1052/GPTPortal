// script.js

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
  
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendButton.click(); // Trigger the send button click on Enter key press
      }
    });

    sendButton.addEventListener('click', () => {
      const message = messageInput.value.trim();
      if (message) {
        displayMessage(message, 'user');
        sendMessageToServer(message);
        messageInput.value = ''; // Clear the input after sending
      }
    });

    // Placeholder function for clipboard button (to be implemented)
document.getElementById('clipboard-button').addEventListener('click', () => {
  // This will handle the file upload functionality in the future
});
  
    // Send the message to the server and handle the response
async function sendMessageToServer(message) {
  try {
    const response = await fetch('http://localhost:3000/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add an Authorization header if your Flask server requires authentication
        // 'Authorization': 'Bearer YOUR_SECRET_TOKEN'
      },
      body: JSON.stringify({ message }) // Send the message content as JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Use the response from the server
    displayMessage(data.text, 'response'); // Changed from data.response to data.text
  } catch (error) {
    console.error('Error sending message to server:', error);
    // Handle any errors that occurred during the send
    displayMessage('Error sending message. Please try again.', 'error');
  }
}

  
    // ... existing code ...

// Display the message in the chat box
function displayMessage(message, type) {
  const messageElement = document.createElement('div');
  const messageText = document.createElement('span'); // Create a span for the text
  const copyButton = document.createElement('button'); // Create a copy button
  
  messageText.textContent = message;
  copyButton.textContent = 'Copy';
  copyButton.onclick = function() { copyToClipboard(messageText); }; // Set the click handler
  
  messageElement.classList.add('message', type);
  messageElement.appendChild(messageText);
  messageElement.appendChild(copyButton); // Append the button to the message element
  
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}

function copyToClipboard(messageText) {
  navigator.clipboard.writeText(messageText.textContent).then(() => {
    // Confirmation
    console.log('Response copied to clipboard!');
  }).catch(err => {
    console.error('Error copying text: ', err);
  });
}

    
  });
  