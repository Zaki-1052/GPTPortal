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
      sendMessageToServer(message, selectedImage); // Pass the image data
      if (voiceMode) {
        // Call to TTS API to read the response
        // This will be implemented in the displayMessage function
      }
      messageInput.value = ''; // Clear the input after sending
      selectedImage = null; // Reset the image variable
    }
  });
  

  // VOICE

  let voiceMode = false;

  function voice() {
    if (voiceMode) {
      // If already in voice mode, we stop and process the recording
      stopRecordingAndTranscribe();
    } else {
      // If not in voice mode, start recording
      startRecording();
    }
    toggleVoiceMode();
  }
  

// Toggle Voice Mode
function toggleVoiceMode() {
  voiceMode = !voiceMode;
  const voiceIndicator = document.getElementById('voice-indicator');
  if (voiceMode) {
    voiceIndicator.textContent = 'Voice Mode ON';
    voiceIndicator.style.display = 'block';
  } else {
    voiceIndicator.style.display = 'none';
  }
}



let mediaRecorder;
let audioChunks = [];

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
      };
      mediaRecorder.onstop = sendAudioToServer;
      mediaRecorder.start();
    });
}

function stopRecordingAndTranscribe() {
  mediaRecorder.stop();
}

function sendAudioToServer() {
  const audioBlob = new Blob(audioChunks);
  const formData = new FormData();
  formData.append('audio', audioBlob);

  fetch('/transcribe', {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(transcribedText => {
    document.getElementById('message-input').value = transcribedText;
  })
  .catch(console.error);
}


async function recordAndTranscribe() {
  toggleVoiceMode();
  // Implement audio recording here
  // Send recorded audio to the server for transcription
  // Update message input with the transcribed text
  // toggleVoiceMode(); // Consider turning off voice mode after transcription
}

sendButton.addEventListener('click', () => {
  if (voiceMode) {
    // Call TTS API to read the response after it's received
  }
  // Rest of the send logic
});

// Modify the existing displayMessage function to handle TTS
function displayMessage(message, type) {
  if (voiceMode && type === 'response') {
    // Call TTS API to read the message
  }
  // Rest of the displayMessage logic
}

// END
  

  // Placeholder function for clipboard button (to be implemented)
  document.getElementById('clipboard-button').addEventListener('click', () => {
    document.getElementById('file-input').click(); // Trigger file input
  });
  document.getElementById('file-input').addEventListener('change', handleFileSelect, false);

  function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function (fileLoadEvent) {
      // Include the MIME type in the base64 string
      const base64Image = 'data:' + file.type + ';base64,' + btoa(fileLoadEvent.target.result);
      selectedImage = base64Image;
    };
  
    reader.readAsBinaryString(file); // Read the file as a binary string
  }
      

  // Send the message to the server and handle the response
  async function sendMessageToServer(message, image = null) {
    const instructions = await fetchInstructions();
    
    let payload = { message, instructions };
    if (image) {
      payload.image = image; // Add the image to the payload
    }
    console.log("Sending payload: ", payload); // Add this line for debugging
    try {
      const response = await fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add other headers as needed
        },
        body: JSON.stringify(payload) // Use the updated payload
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
async function fetchInstructions() {
try {
  const response = await fetch('/instructions.md');
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.text();
} catch (error) {
  console.error('Error fetching instructions:', error);
  return ''; // Return empty string in case of an error
}
}

let selectedImage = null;

function handleFileSelect(event) {
const reader = new FileReader();
reader.onload = function (fileLoadEvent) {
  selectedImage = fileLoadEvent.target.result; // Store the base64Image
};
reader.readAsDataURL(event.target.files[0]); // Read the image file as a data URL.
}


  // ... existing code ...

// Display the message in the chat box
function displayMessage(message, type) {
const messageElement = document.createElement('div');
const messageText = document.createElement('span'); // Create a span for the text
const copyButton = document.createElement('button'); // Create a copy button

if (voiceMode && type === 'response') {
  // Call TTS API to read the message
  fetch('/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: message })
  })
  .then(response => response.blob())
  .then(blob => {
    const audioURL = URL.createObjectURL(blob);
    new Audio(audioURL).play();
  })
  .catch(console.error);
}


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
