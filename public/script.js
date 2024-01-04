// script.js

  // detects safari browser

  function isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  let isGemini = true;


  const modelID = {
    "GPT-4": "gpt-4",
    "GPT-4-Vision": "gpt-4-vision-preview",
    "GPT-4-32k": "gpt-4-32k",
    "GPT-4-Turbo": "gpt-4-1106-preview",
    "GPT-3.5-Turbo": "gpt-3.5-turbo-1106",
    "Gemini-Pro": "gemini-pro",
    "Gemini-Pro-Vision": "gemini-pro-vision"
  };

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4-vision-preview": "GPT-4-Vision",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-1106-preview": "GPT-4-Turbo",
    "gpt-3.5-turbo-1106": "GPT-3.5-Turbo",
    "gemini-pro": "Gemini-Pro",
    "gemini-pro-vision": "Gemini-Pro-Vision"
  };

  


// Default model functionality
  function setDefaultModel() {
  let selectedModelDiv = document.getElementById("selected-model");
  let defaultModel = "gemini-pro";

  // Check if a model has been selected, if not, set to default model ID and update display
  if (selectedModelDiv.textContent.trim() === "Select a Model") {
    currentModelID = defaultModel; // Set the default model ID
    selectedModelDiv.textContent = customModelNames[defaultModel]; // Update display to show default model name
  }
}

let currentModelID = 'gemini-pro'; // Global declaration


let transcriptionResult = '';


// Convert markdown to HTML using marked.js and sanitize it with DOMPurify
marked.setOptions({ breaks: true }); // Enable new lines to be interpreted as <br>

    
    // Function to select a model and update the displayed text
// Global variable to store the current model ID

// Function to update the current model ID
function updateCurrentModelID(modelID) {
  currentModelID = modelID;
  determineEndpoint(modelID);
  console.log(isGemini);
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
  determineEndpoint(modelID);
  console.log(modelID);
  console.log(isGemini);
  toggleDropdown(); // Close the dropdown
}


function determineEndpoint(modelID) {
  if (modelID.startsWith('gemini')) {
    isGemini = true;
    console.log(isGemini)
  } else {
    isGemini = false;
    console.log(isGemini)
  }
  console.log(isGemini)
}



const selectedModelDisplayName = document.getElementById('selected-model').textContent.trim();

  document.addEventListener('DOMContentLoaded', () => {
    // Define model descriptions
    const modelDescriptions = {
      "gpt-4": "GPT-4: Most Intelligent — Default",
      "gpt-4-vision-preview": "GPT-4-Vision: View & Analyze Images",
      "gpt-4-32k": "GPT-4-32k: Longer Context Window — Higher Price",
      "gpt-4-1106-preview": "GPT-4-Turbo: ChatGPT-Plus Model — 128k Tokens",
      "gpt-3.5-turbo-1106": "GPT-3.5-Turbo: Cheapest Option Available",
      "gemini-pro": "Gemini-Pro: Google Bard Model — 3.5 Equivalent",
      "gemini-pro-vision": "Gemini-Vision: View Images — One-Time Use"
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
    
    


    function determineEndpoint(modelID) {
      if (modelID.startsWith('gemini')) {
        isGemini = true;
        return 'http://localhost:3000/gemini'; // URL for the Gemini endpoint
      } else {
        isGemini = false;
        return 'http://localhost:3000/message'; // URL for the OpenAI endpoint
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

document.getElementById('model-gemini-pro').addEventListener('click', () => selectModel('gemini-pro'));
document.getElementById('model-gemini-pro-vision').addEventListener('click', () => selectModel('gemini-pro-vision'));
document.getElementById('model-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro"], event.currentTarget));
document.getElementById('model-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro-vision"], event.currentTarget));



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
  
        const voiceButton = document.getElementById('voice-button');
        voiceButton.addEventListener('click', function() {
          voice();
          // Immediately blur (remove focus) from the button after click
          this.blur();
        });
      
        // Add an event listener for 'keydown' instead of 'keypress'
        document.addEventListener('keydown', function(e) {
          // Check if Enter is pressed and focus is not on the voice button
          if (e.key === 'Enter' && document.activeElement !== voiceButton) {
            e.preventDefault(); // Prevent the default Enter key behavior
            voice();
          }
        });
      
        document.getElementById('export-button').addEventListener('click', exportChatHistory);
        
      });
      

async function processAndSendMessage() {
    const message = transcriptionResult.trim();
    setDefaultModel(); // Update default model if needed
    transcriptionResult = '';
    if (message) {
        displayMessage(message, 'user');
        try {
            await sendMessageToServer(message); // Pass the message to the server
            if (voiceMode) {
                // Call to TTS API to read the response
                // This will be implemented in the displayMessage function
            }
            if (message === "Bye!") {
                exportChatOnShutdown();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            displayMessage('Error sending message. Please try again.', 'error');
        }
    }
}

      // export chat history function

      // Function to export chat history based on the type (conversation or gemini)
      function exportChatHistory() {
        const historyType = isGemini ? 'gemini' : 'conversation';
        console.log("Exporting chat history for:", historyType);
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
      
// Modify exportChatOnShutdown to use the isGemini flag
function exportChatOnShutdown() {
  const historyType = isGemini ? 'gemini' : 'conversation';
  exportChatHistory(historyType);
}

    
      // VOICE
        
    
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
          voiceIndicator.style.visibility = 'visible'; // Change display to visibility
        } else {
            voiceIndicator.style.visibility = 'hidden'; // Change display to visibility
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
            transcriptionResult = data.text; // Store the transcription result
            processAndSendMessage(transcriptionResult); // Process and send the transcribed message
            isVoiceTranscription = true;
            voiceMode = false; // Turn off voice mode
        })
        .catch(console.error);
      }, 10); // 500ms delay
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
      
    
  
      // Send the message to the server and handle the response

      async function sendMessageToServer(message) {

        const instructions = await fetchInstructions();
        
        // Prepare the payload with the current model ID
        let payload, endpoint;
        if (currentModelID.startsWith('gemini')) {
          // Prepare the payload for Google Gemini API
          payload = {
            prompt: message,
            model: currentModelID,
          };
          endpoint = 'http://localhost:3000/gemini'; // Gemini endpoint
        } else {
          // Prepare the payload for OpenAI API
          payload = {
            message: message,
            modelID: currentModelID,
            instructions: instructions,
          };
          endpoint = 'http://localhost:3000/message'; // OpenAI endpoint
        }
      
        try {
          const response = await fetch(endpoint, {
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
      
          const data = await response.json();

          // Determine the source of the response and format the message accordingly
          let messageContent;
          if (endpoint.includes('gemini')) {
            // Direct text response from Gemini API
            messageContent = data.text || 'No response received.';
          } else {
            // Response from GPT API, expected to have a 'text' property
            messageContent = data.text || 'No response received.';
          }

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

  const chatBox = document.getElementById('chat-box');
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
  if (type === 'response') {
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
    
