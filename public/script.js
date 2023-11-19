// script.js

  // detects safari browser

  function isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }


  const modelID = {
    "GPT-4": "gpt-4",
    "GPT-4-Vision": "gpt-4-vision-preview",
    "GPT-4-32k": "gpt-4-32k",
    "GPT-4-Turbo": "gpt-4-1106-preview",
    "GPT-3.5-Turbo": "gpt-3.5-turbo-1106"
  };
  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4-vision-preview": "GPT-4-Vision",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-1106-preview": "GPT-4-Turbo",
    "gpt-3.5-turbo-1106": "GPT-3.5-Turbo"
  };
  


// Default model functionality
  function setDefaultModel() {
  let selectedModelDiv = document.getElementById("selected-model");
  let defaultModel = "gpt-4";

  // Check if a model has been selected, if not, set to default model ID and update display
  if (selectedModelDiv.textContent.trim() === "Select a Model") {
    currentModelID = defaultModel; // Set the default model ID
    selectedModelDiv.textContent = customModelNames[defaultModel]; // Update display to show default model name
  }
}

let currentModelID = 'gpt-4'; // Global declaration


    
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
  console.log("Selected model ID:", modelID); // Add this line

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

  // Set a timer to send "Bye!" message to the server
  setTimeout(() => {
    sendShutdownMessage();
}, 5000); // Adjust the delay time as needed
}

function sendShutdownMessage() {
// Modify the payload to send "Bye!" as the user message
const payload = { message: "Bye!" };

fetch('http://localhost:3000/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: "Bye!" })
        })
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'chat_history.html';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        })
.catch(err => console.error('Error during shutdown:', err));
}

const selectedModelDisplayName = document.getElementById('selected-model').textContent.trim();

  document.addEventListener('DOMContentLoaded', () => {
    // Define model descriptions
    const modelDescriptions = {
      "gpt-4": "GPT-4: Most Intelligent - Default",
      "gpt-4-vision-preview": "GPT-4-Vision: View & Analyze Images",
      "gpt-4-32k": "GPT-4 32k: Longer Context Window - Higher Price",
      "gpt-4-1106-preview": "GPT-4-Turbo: Current Plus Model in ChatGPT",
      "gpt-3.5-turbo-1106": "GPT-3.5-Turbo: Cheapest Option Available"
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
document.getElementById('model-gpt-4-vision').addEventListener('click', () => selectModel('gpt-4-vision-preview'));
document.getElementById('model-gpt-4-32k').addEventListener('click', () => selectModel('gpt-4-32k'));
  
    // Add event listeners for model buttons
    document.getElementById('model-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4"], event.currentTarget));
    document.getElementById('model-gpt-4-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-vision-preview"], event.currentTarget));
    document.getElementById('model-gpt-4-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-32k"], event.currentTarget)); 
  
    // Add click event listeners for selecting a model
    document.getElementById('model-gpt-4').addEventListener('click', () => selectModel('gpt-4'));
    document.getElementById('model-gpt-4-vision').addEventListener('click', () => selectModel('gpt-4-vision-preview'));
    document.getElementById('model-gpt-4-32k').addEventListener('click', () => selectModel('gpt-4-32k'));

    document.getElementById('model-gpt-4-turbo').addEventListener('click', () => selectModel('gpt-4-1106-preview'));
document.getElementById('model-gpt-3.5').addEventListener('click', () => selectModel('gpt-3.5-turbo-1106'));

document.getElementById('model-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-1106-preview"], event.currentTarget));
document.getElementById('model-gpt-3.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-3.5-turbo-1106"], event.currentTarget));


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
      const chatBox = document.getElementById('chat-box');
      const voiceButton = document.getElementById('voice-button');
      voiceButton.addEventListener('click', voice);
      document.getElementById('export-button').addEventListener('click', exportChatHistory);
      messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendButton.click(); // Trigger the send button click on Enter key press
        }
      });

    
      
      // Result of Send Button
sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  const user_image = document.getElementById('file-input').files[0];
  messageInput.value = '';
  selectedImage = null;

  // Get the selected model's display name and convert it to the actual model ID
  setDefaultModel(); // Update default model if needed

  if (message || user_image) {
      displayMessage(message, 'user');
      // Check if it's an image generation request
      if (isImageGenerationRequest(message)) {
          await handleImageGenerationRequest(message);
      } else {
          // Existing code to handle regular messages
          try {
              await sendMessageToServer(message, user_image); // Pass the message, image file, and model to the server
              if (voiceMode) {
                  // Call to TTS API to read the response
                  // This will be implemented in the displayMessage function
              }
              if (message === "Bye!") {
                  exportChatOnShutdown();
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

      function exportChatHistory() {
        fetch('/export-chat-html')
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'chat_history.html'; // or .json if you prefer
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(err => console.error('Error exporting chat history:', err));
      }
      
      // Function to handle chat export on shutdown
      function exportChatOnShutdown() {
        fetch('http://localhost:3000/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: "Bye!" })
        })
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'chat_history.html';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Error exporting chat history on shutdown:', err));
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
      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' }); // Set MIME type to 'audio/mpeg'
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.mp3'); // The file extension can remain .mp3
    
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
      }, 500); // 500ms delay
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
      
    // Functions for handling image input files
    
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
    
      // Defining the messages sent
          
    // converting image to base64

    async function convertImageToBase64(imageFile) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(imageFile);
      });
  }
  
      // Send the message to the server and handle the response

      async function sendMessageToServer(message, imageFile = null) {
      const instructions = await fetchInstructions();
      
      // Prepare the payload with the current model ID
  let payload = {
    message: message,
    modelID: currentModelID, // Include the current model ID in the payload
    instructions: instructions
  };
      
      if (imageFile) {
          try {
              const base64Image = await convertImageToBase64(imageFile);
              payload.image = base64Image; // Add the base64 image to the payload
          } catch (error) {
              console.error("Error converting image to base64:", error);
          }
      }
      console.log("Sending payload: ", payload); // Debugging
    
      // Uses localhost server to send
    
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
        displayMessage(data.text, 'response', isVoiceTranscription); // Display the response in the chat box
        isVoiceTranscription = false; // Reset the flag for the next message
      } catch (error) {
        console.error('Error sending message to server:', error);
        // Handle any errors that occurred during the send
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
    
    // reading the image
    
    let selectedImage = null;
    
    function handleFileSelect(event) {
    const reader = new FileReader();
    reader.onload = function (fileLoadEvent) {
      selectedImage = fileLoadEvent.target.result; // Store the base64Image
    };
    reader.readAsDataURL(event.target.files[0]); // Read the image file as a data URL.
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
      messageText.textContent = message;

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
    