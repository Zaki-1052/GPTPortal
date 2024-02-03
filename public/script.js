// script.js

  // detects safari browser

  function isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  let isGemini = false;


  const modelID = {
    "GPT-4": "gpt-4",
    "GPT-4-Turbo": "gpt-4-turbo-preview",
    "GPT-3.5-Turbo": "gpt-3.5-turbo",
  };

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4-turbo-preview": "GPT-4-Turbo",
    "gpt-3.5-turbo": "GPT-3.5-Turbo",
  };

  


// Default model functionality
  function setDefaultModel() {
  let selectedModelDiv = document.getElementById("selected-model");
  let defaultModel = "gpt-4-turbo-preview";

  // Check if a model has been selected, if not, set to default model ID and update display
  if (selectedModelDiv.textContent.trim() === "Select a Model") {
    currentModelID = defaultModel; // Set the default model ID
    selectedModelDiv.textContent = customModelNames[defaultModel]; // Update display to show default model name
  }
}

let currentModelID = 'gpt-4-turbo-preview'; // Global declaration

let selectedImage = null;

// Convert markdown to HTML using marked.js and sanitize it with DOMPurify
marked.setOptions({ breaks: true }); // Enable new lines to be interpreted as <br>

    
    // Function to select a model and update the displayed text
// Global variable to store the current model ID

// Function to update the current model ID
function updateCurrentModelID(modelID) {
  currentModelID = modelID;
}

// Modify your selectModel function
function selectModel(modelID) {
  const displayName = customModelNames[modelID];

  // Update the selected model display
  let selectedModelDiv = document.getElementById("selected-model");
  selectedModelDiv.textContent = displayName;

  // Update the current model ID
  currentModelID = modelID;
  toggleDropdown(); // Close the dropdown
}

// image generation

function isImageGenerationRequest(message) {
  return message.startsWith("Generate:"); // Simple check to see if the message is an image generation request
}

async function handleImageGenerationRequest(message) {
  const prompt = message.substring("Generate:".length).trim();

  try {
      const response = await fetch('http://localhost:3000/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt })
      });

      if (!response.ok) {
          throw new Error('Failed to generate image');
      }

      const result = await response.json();
      if (result.imageUrl) {
          displayGeneratedImage(result.imageUrl);
          sendMessageToServer("Generated image", result.imageUrl);
      } else {
          displayMessage('Image generation failed, please try again.', 'error');
      }
  } catch (error) {
      console.error('Error in image generation:', error);
      displayMessage('Error in image generation, please try again.', 'error');
  }
}

function displayGeneratedImage(imageUrl) {
  const imageElement = document.createElement('img');
  imageElement.src = imageUrl;
  imageElement.alt = "Generated Image";
  imageElement.classList.add('generated-image'); // Add a class for styling

  // Trigger image download
  const downloadLink = document.createElement('a');
  downloadLink.href = imageUrl;
  downloadLink.download = 'generated-image.jpg'; // or use a dynamic name
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  const chatBox = document.getElementById('chat-box');
  chatBox.appendChild(imageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest image

}


const selectedModelDisplayName = document.getElementById('selected-model').textContent.trim();

  document.addEventListener('DOMContentLoaded', () => {
    // Define model descriptions
    const modelDescriptions = {
      "gpt-4": "GPT-4: Most Intelligent — Default",
      "gpt-4-turbo-preview": "GPT-4-Turbo: ChatGPT-Plus Model — 128k Tokens",
      "gpt-3.5-turbo": "GPT-3.5-Turbo: Cheapest Option Available",
    };
    
  
    // Function to show the custom tooltip
    function showCustomTooltip(text, targetElement) {
      let tooltip = document.getElementById("custom-tooltip");
      let rect = targetElement.getBoundingClientRect();
  
      tooltip.textContent = text;
      tooltip.style.display = 'block';
  
      // Position the tooltip to the right and slightly above the targetElement
      tooltip.style.left = `${rect.right + 10}px`; // 10 pixels to the right of the element
      tooltip.style.top = `${window.scrollY + rect.top}px`; // 10 pixels above the top of the element
    }
  
// Toggle dropdown on clicking the custom-select div
document.querySelector('.custom-select').addEventListener('click', toggleDropdown);

    // Function to hide the custom tooltip
    function hideCustomTooltip() {
      let tooltip = document.getElementById("custom-tooltip");
      tooltip.style.display = 'none';
    }
    
    document.getElementById('selected-model').addEventListener('click', toggleDropdown);

    function toggleDropdown(event) {
      console.log("toggleDropdown triggered", event.target); // Debugging line
      let isClickInside = event.target.closest('.custom-select') || event.target.id === 'selected-model';
      console.log("Is Click Inside: ", isClickInside); // Debugging line
      if (isClickInside) {
        let options = document.getElementById("model-options");
        console.log("Current display: ", options.style.display); // Debugging line
        options.style.display = options.style.display === "block" ? "none" : "block";
        console.log("New display: ", options.style.display); // Debugging line
      }
    }
    
    



// Add event listeners for selecting a model
document.getElementById('model-gpt-4').addEventListener('click', () => selectModel('gpt-4'));
    // Add event listeners for model buttons
    document.getElementById('model-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4"], event.currentTarget));

    document.getElementById('model-gpt-4-turbo').addEventListener('click', () => selectModel('gpt-4-turbo-preview'));
document.getElementById('model-gpt-3.5').addEventListener('click', () => selectModel('gpt-3.5-turbo'));

document.getElementById('model-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-turbo-preview"], event.currentTarget));
document.getElementById('model-gpt-3.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-3.5-turbo"], event.currentTarget));



  // Add mouseout event listener for all model buttons
  document.querySelectorAll('.select-options button').forEach(button => {
    button.addEventListener('mouseout', hideCustomTooltip);
  });   
  
    // Close the dropdown if clicked outside
    window.onclick = function(event) {
      if (!event.target.matches('.custom-select') && !event.target.matches('.select-options button')) {
        let options = document.getElementById("model-options");
        if (options.style.display === "block") {
          options.style.display = "none";
        }
      }
    };
  });


  
    // Event Listener for buttons
  
    document.addEventListener('DOMContentLoaded', () => {
      const sendButton = document.getElementById('send-button');
      const messageInput = document.getElementById('message-input');
  
      function autoExpand(field) {
        // Reset field height
        field.style.height = 'inherit';
      
        // Get the computed styles for the element
        const computed = window.getComputedStyle(field);
      
        // Calculate the height
  const borderTop = parseInt(computed.getPropertyValue('border-top-width'), 10);
  const borderBottom = parseInt(computed.getPropertyValue('border-bottom-width'), 10);
  const paddingTop = parseInt(computed.getPropertyValue('padding-top'), 10);
  const paddingBottom = parseInt(computed.getPropertyValue('padding-bottom'), 10);

  // Calculate the total height needed
  const heightNeeded = field.scrollHeight + borderTop + borderBottom;

  // Check if the content exceeds the current height
  if (field.scrollHeight > field.clientHeight - paddingTop - paddingBottom - borderTop - borderBottom) {
    field.style.height = `${heightNeeded}px`;
  }
}
      

  messageInput.addEventListener('input', function() {
    autoExpand(this);
  });

      const chatBox = document.getElementById('chat-box');
      const voiceButton = document.getElementById('voice-button');
      voiceButton.addEventListener('click', voice);
      document.getElementById('export-button').addEventListener('click', exportChatHistory);
      
      // Existing event listener for messageInput keypress
      messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // Prevent the default action (new line) when Enter alone is pressed
          sendButton.click(); // Trigger the send button click on Enter key press
        }
      });


      

    
      
      // Result of Send Button
sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  messageInput.value = '';

  // Get the selected model's display name and convert it to the actual model ID
  setDefaultModel(); // Update default model if needed

  if (message) {
      displayMessage(message, 'user');
      // Check if it's an image generation request
      if (isImageGenerationRequest(message)) {
          await handleImageGenerationRequest(message);
      } else {
          // Existing code to handle regular messages
          try {
              await sendMessageToServer(message); // Pass the message, image file, and model to the server
              if (voiceMode) {
                  // Call to TTS API to read the response
                  // This will be implemented in the displayMessage function
              }
          } catch (error) {
              // Handle error
              console.error('Error sending message:', error);
              displayMessage('Error sending message. Please try again.', 'error');
          }
      }
  }
});

      

      // export chat history function

      // Function to export chat history based on the type (conversation or gemini)
      function exportChatHistory() {
        const historyType = 'conversation';
        const exportUrl = '/export-chat-html?type=' + historyType;
        fetch(exportUrl)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = historyType + '_chat_history.html';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(err => console.error('Error exporting chat history:', err));
      }
      

    
      // VOICE
    
      let isVoiceTranscription = false;
    
    
      let voiceMode = false;
      let mediaRecorder;
      let audioChunks = [];
    
      // Voice Function
    
      function voice() {
        console.log("Voice button clicked. Current mode:", voiceMode);
        
        if (isSafariBrowser()) {
          displayErrorMessage('Safari browser detected. Please use a Chromium or non-WebKit browser for full Voice functionality. See the ReadMe on GitHub for more details.');
          return; // Stop execution if Safari is detected
        }
      
        if (voiceMode) {
          stopRecordingAndTranscribe();
        } else {
          startRecording();
        }
        toggleVoiceMode();
      }
  
      // displays error for voice on safari
  
      function displayErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message error';
        errorMessage.textContent = message;
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
      }
      
    
      // Recording Functions
    
      function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => {
              audioChunks.push(e.data);
            };
            mediaRecorder.onstop = sendAudioToServer;
            mediaRecorder.start();
            console.log("Recording started. MediaRecorder state:", mediaRecorder.state);
          })
          .catch(error => {
            console.error("Error accessing media devices:", error);
          });
      }
    
      function stopRecordingAndTranscribe() {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          console.log("Recording stopped. MediaRecorder state:", mediaRecorder.state);
        } else {
          console.error("MediaRecorder not initialized or not recording. Current state:", mediaRecorder ? mediaRecorder.state : "undefined");
        }
      }
    
      // Voice Mode
    
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
    
    
      
     
    
    // Sending the audio to the backend
    function sendAudioToServer() {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3');

      // Clear the audioChunks array to prepare for the next recording
      audioChunks = []; // Reset audioChunks array

      // Introduce a delay before making the fetch call
      setTimeout(() => {
        fetch('/transcribe', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          messageInput.value = data.text;
          isVoiceTranscription = data.text.startsWith("Voice Transcription: ");
          voiceMode = false; // Turn off voice mode
        })
        .catch(console.error);
      }, 100); // 500ms delay
    }

    
      
      
      // Calling Text to speech
    
    function callTTSAPI(text) {
      fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      })
      .then(response => response.blob())
      .then(blob => {
        const audioURL = URL.createObjectURL(blob);
        new Audio(audioURL).play();
      })
      .catch(console.error);
    }
    
    
    // END
      
    // Functions for handling  input files
    
      // function for clipboard button
      document.getElementById('clipboard-button').addEventListener('click', () => {
        document.getElementById('file-input').click(); // Trigger file input
      });
      document.getElementById('file-input').addEventListener('change', handleFileSelect, false);
    
      function handleFileSelect(event) {
        const user_file = event.target.files[0];
      }

      let messageCounter = 0;
      let file;
      let fileUrl = null;
      let filename = null;

      document.getElementById('file-input').addEventListener('change', async (event) => {
        const user_file = event.target.files[0];
        if (user_file) {
          fileUrl = await uploadFile(user_file); // Update this to handle the file upload and receive the file URL or ID
          // Proceed with any additional logic needed after file upload, e.g., preparing messages
        }
      });
      
      async function uploadFile(user_file) {
        const formData = new FormData();
        formData.append('file', user_file); // Fix: Use the parameter `user_file` instead of `File`
      
        try {
          const response = await fetch('http://localhost:3000/upload-file', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          return data.fileId; // Update according to the actual response structure
        } catch (error) {
          console.error('Error uploading file:', error);
          // Handle error appropriately
        }
      }

      // Send the message to the server and handle the response

      let initialize = false;

      async function sendMessageToServer(message) {
      
        
        if (messageCounter === 0) {
          isFirstMessage = true
          messageCounter +=1
        } else {
          isFirstMessage = false;
        }

        const instructions = await fetchInstructions();
        // Prepare the payload with the current model ID
        let payload = {
            message: message,
            modelID: currentModelID,
            instructions: instructions,
            file: fileUrl, // Existing image handling for OpenAI
            initialize: isFirstMessage
          };
          let endpoint = 'http://localhost:3000/assistant'; // OpenAI endpoint
      
        try {
          let response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add other headers as needed
            },
            body: JSON.stringify(payload)
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log("Client Response:", response);
          const data = await response.json();
          console.log("Data:", data);
          console.log("Data:", data.text);
          // Determine the source of the response and format the message accordingly
          let messageContent = data.text.text || 'No response received.';
          console.log("Message Content:", messageContent);

          displayMessage(messageContent, 'response', isVoiceTranscription); // Display the response in the chat box
          isVoiceTranscription = false; // Reset the flag for the next message
        } catch (error) {
          console.error('Error sending message to server:', error);
          displayMessage('Error sending message. Please try again.', 'error');
        }
      }
      
    
    
    
    // function to get custom instructions
    
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
    
    
      // code for showing the message and speaking it
    
    // Display the message in the chat box
function displayMessage(message, type) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);

  if (type === 'image') {
      const imageElement = document.createElement('img');
      imageElement.src = message;
      imageElement.alt = "Generated Image";
      imageElement.classList.add('generated-image'); // A class for styling images

      messageElement.appendChild(imageElement);
  } else {
      const messageText = document.createElement('span');

      // Convert markdown to HTML using marked.js and sanitize it with DOMPurify
      const rawHtml = marked.parse(message);
      const safeHtml = DOMPurify.sanitize(rawHtml);
      messageText.innerHTML = safeHtml;

      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy';
      copyButton.onclick = function() { copyToClipboard(messageText); };

      messageElement.appendChild(messageText);
      messageElement.appendChild(copyButton);
  }

  const chatBox = document.getElementById('chat-box');
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message

  if (type === 'response' && isVoiceTranscription) {
      callTTSAPI(message); // Read out the response message only if it should be read aloud
  }
}

    
    // copy button feature
    
    function copyToClipboard(messageText) {
    navigator.clipboard.writeText(messageText.textContent).then(() => {
      // Confirmation
      console.log('Response copied to clipboard!');
    }).catch(err => {
      console.error('Error copying text: ', err);
    });
    }
    
      
    });
    

// Function to update upload status message
function updateUploadStatus(message) {
  const statusElement = document.getElementById('upload-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Modifying handleFileSelect function to include upload status update
document.getElementById('file-input').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) { // Removed the type check for demonstration purposes
    updateUploadStatus('File Uploaded: ' + file.name);
  } else {
    updateUploadStatus('No file selected or unsupported file type');
  }
});
