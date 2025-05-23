// script.js

// configures host and port 

/// Initialize a variable to hold the base URL
let baseURL = window.location.origin;

// Function to fetch configuration from the server
async function fetchConfig() {
  try {
    const response = await fetch('/config');
    const config = await response.json();
    if (config.host && config.port) {
      baseURL = `http://${config.host}:${config.port}`;
    }
    console.log(`Base URL set to: ${baseURL}`);
  } catch (error) {
    console.error("Error fetching configuration:", error);
  }
}

fetchConfig();

let currentModelID;


async function fetchDefaultModel() {
  try {
    const response = await fetch('/model');
    const data = await response.json();
    currentModelID = data.model;
  } catch (error) {
    console.error('Error fetching default model:', error);
  }
}

fetchDefaultModel();


  // detects safari browser

  function isSafariBrowser() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  let isGemini = false;
  let assistantsMode = false;
  let isAssistants = false;



  const modelID = {
    "GPT-4": "gpt-4",
    "GPT-4.5": "gpt-4.5-preview",
    "GPT-4.1": "gpt-4.1",
    "GPT-4o": "gpt-4o",
    "GPT-4-32k": "gpt-4-32k",
    "GPT-4-Turbo": "gpt-4-turbo",
    "GPT-3.5-Turbo": "gpt-3.5-turbo-0125",
    "Claude-4-Opus": "claude-opus-4-20250514",
    "Claude-4-Sonnet": "claude-sonnet-4-20250514",
    "Claude-3.7-Sonnet": "claude-3-7-sonnet-latest",
    "Claude-3.5-Sonnet": "claude-3-5-sonnet-latest",
    "Claude-3.5-Haiku": "claude-3-5-haiku-latest",
    "GPT-o1-Mini": "o1-mini",
    "GPT-o3-Mini": "o3-mini",
    "GPT-o4-Mini": "o4-mini",
    "GPT-o1-Preview": "o1-preview",
    "GPT-o1": "o1",
    "GPT-o1": "o4",
    "DeepSeek-R1": "deepseek-reasoner",
    "DeepSeek-Chat": "deepseek-chat",
    "Gemini-Pro": "gemini-pro",
    "Gemini-Pro-Vision": "gemini-pro-vision",
    "Gemini-1.5-Pro": "gemini-1.5-pro",
    "Gemini-1.5-Flash": "gemini-1.5-flash",
    "Gemini-2.0-Flash": "gemini-2.0-flash-exp",
    "Gemini-Ultra": "gemini-1.0-ultra",
    "Claude-Opus": "claude-3-opus-20240229",
    "Claude-Sonnet": "claude-3-sonnet-20240229",
    "Claude-Haiku": "claude-3-haiku-20240307",
    "Claude-2.1": "claude-2.1",
    "Claude-2.0": "claude-2.0",
    "Claude-1.2": "claude-instant-1.2",
    "Mistral-Tiny": "open-mistral-7b",
    "Mistral-8x7b": "open-mixtral-8x7b",
    "Mistral-8x-22b": "open-mixtral-8x22b",
    "Mistral-Small": "mistral-small-latest",
    "Mistral-Medium": "mistral-medium-latest",
    "Mistral-Large": "mistral-large-latest",
    "Llama3-70b": "llama3-70b-8192",
    "Llama3-8b": "llama3-8b-8192",
    "Gemma-7b": "gemma-7b-it",
    "Codestral": "codestral-latest",
    "Free Mixtral 8x7b": "mixtral-8x7b-32768",
    "GPT-4o-Mini": "gpt-4o-mini",
    "Codestral-Mamba": "open-codestral-mamba",
    "Mathstral": "mathstral-temp-id",
    "Mistral-NeMo": "open-mistral-nemo",
    "Llama 3.1 8B": "llama-3.1-8b-instant",
    "Llama 3.1 70B": "llama-3.1-70b-versatile",
    "Llama 3.1 405B": "llama-3.1-405b-reasoning",
    // Open Router Models
    "Anthropic: Claude 3.7 Sonnet (self-moderated)": "anthropic/claude-3.7-sonnet:beta",
    "Anthropic: Claude 3.7 Sonnet": "anthropic/claude-3.7-sonnet",
    "Perplexity: R1 1776": "perplexity/r1-1776",
};

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4.5-preview": "GPT-4.5",
    "gpt-4.1": "GPT-4.1",
    "gpt-4o": "GPT-4o",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-turbo": "GPT-4-Turbo",
    "gpt-3.5-turbo-0125": "GPT-3.5-Turbo",
    "claude-opus-4-20250514": "Claude-4-Opus",
    "claude-sonnet-4-20250514": "Claude-4-Sonnet",
    "claude-3-7-sonnet-latest": "Claude-3.7-Sonnet",
    "claude-3-5-sonnet-latest": "Claude-3.5-Sonnet",
    "claude-3-5-haiku-latest": "Claude-3.5-Haiku",
    "o1-mini": "GPT-o1-Mini",
    "o3-mini": "GPT-o3-Mini",
    "o4-mini": "GPT-o4-Mini",
    "o1-preview": "GPT-o1-Preview",
    "o1": "GPT-o1",
    "o4": "GPT-o4",
    "deepseek-reasoner": "DeepSeek-R1",
    "deepseek-chat": "DeepSeek-Chat",
    "gemini-pro": "Gemini-Pro",
    "gemini-pro-vision": "Gemini-Pro-Vision",
    "gemini-1.5-pro": "Gemini-1.5-Pro",
    "gemini-1.5-flash": "Gemini-1.5-Flash",
    "gemini-2.0-flash-exp": "Gemini-2.0-Flash",
    "gemini-1.0-ultra": "Gemini-Ultra",
    "claude-3-opus-20240229": "Claude-Opus",
    "claude-3-sonnet-20240229": "Claude-Sonnet",
    "claude-3-haiku-20240307": "Claude-Haiku",
    "claude-2.1": "Claude-2.1",
    "claude-2.0": "Claude-2.0",
    "claude-instant-1.2": "Claude-1.2",
    "open-mistral-7b": "Mistral-Tiny",
    "open-mixtral-8x7b": "Mistral-8x7b",
    "open-mixtral-8x22b": "Mistral-8x22b",
    "mistral-small-latest": "Mistral-Small",
    "mistral-medium-latest": "Mistral-Medium",
    "mistral-large-latest": "Mistral-Large",
    "llama3-70b-8192": "Llama3-70b",
    "llama3-8b-8192": "Llama3-8b",
    "gemma-7b-it": "Gemma-7b",
    "codestral-latest": "Codestral",
    "mixtral-8x7b-32768": "Free Mixtral 8x7b",
    "gpt-4o-mini": "GPT-4o-Mini",
    "open-codestral-mamba": "Codestral-Mamba",
    "mathstral-temp-id": "Mathstral",
    "open-mistral-nemo": "Mistral-NeMo",
    "llama-3.1-8b-instant": "Llama 3.1 8B",
    "llama-3.1-70b-versatile": "Llama 3.1 70B",
    "llama-3.1-405b-reasoning": "Llama 3.1 405B",
    // Open Router Models
    "anthropic/claude-3.7-sonnet:beta": "Anthropic: Claude 3.7 Sonnet (self-moderated)",
    "anthropic/claude-3.7-sonnet": "Anthropic: Claude 3.7 Sonnet",
    "perplexity/r1-1776": "Perplexity: R1 1776",
};

  
// Set the Default Model

// Default model functionality
  function setDefaultModel() {
  let selectedModelDiv = document.getElementById("selected-model");
  let defaultModel = currentModelID;

  // Check if a model has been selected, if not, set to default model ID and update display
  if (selectedModelDiv.textContent.trim() === "Select a Model") {
    currentModelID = defaultModel; // Set the default model ID
    selectedModelDiv.textContent = customModelNames[defaultModel]; // Update display to show default model name
  }
}

let selectedImage = null;

// Convert markdown to HTML using marked.js and sanitize it with DOMPurify
marked.setOptions({
  // Enable new lines to be interpreted as <br>
  breaks: true,

  // Syntax highlighting for code blocks
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
});    


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
  // Close the dropdown
  const options = document.getElementById('model-options');
  if (options) {
    options.style.display = 'none';
  }
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

// image generation

function isImageGenerationRequest(message) {
  return message.startsWith("Generate:"); // Simple check to see if the message is an image generation request
}

async function handleImageGenerationRequest(message) {
  const prompt = message.substring("Generate:".length).trim();

  try {
      const response = await fetch(`${baseURL}/generate-image`, {
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

function sendShutdownMessage() {
  // Sending "Bye!" to both /message and Gemini endpoints
  const messagePayload = JSON.stringify({ message: "Bye!" });
  const messageRequest = fetch(`${baseURL}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: messagePayload
  });

  const geminiRequest = fetch(`${baseURL}/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: messagePayload
  });

  // Wait for both requests to complete
  Promise.all([messageRequest, geminiRequest])
    .then(() => {
      exportChatOnShutdown(isGemini); // Export chat history based on the isGemini flag
    })
    .catch(err => console.error('Error during shutdown:', err));
}


const selectedModelDisplayName = document.getElementById('selected-model').textContent.trim();


  document.addEventListener('DOMContentLoaded', () => {

    // Define model descriptions
    const modelDescriptions = {
      "gpt-4": "GPT-4: Oldest Intelligent Model",
      "gpt-4o": "GPT-4o: Latest OpenAI Intelligent Model",
      "gpt-4-32k": "GPT-4-32k: Longer Context Window — Higher Price",
      "gpt-4-turbo": "GPT-4-Turbo: ChatGPT-Plus Model — 128k Tokens",
      "gpt-3.5-turbo-0125": "GPT-3.5-Turbo: Older Cheap Option",
      "claude-3-7-sonnet-latest": "Most Advanced Anthropic Model",
      "claude-3-5-sonnet-latest": "Best Normal Claude Model",
      "claude-3-5-haiku-latest": "Fast & Cheap Anthropic Model",
      "gemini-pro": "Gemini-Pro: Google Bard Model — 3.5 Equivalent",
      "gemini-pro-vision": "Gemini-Vision: View Images — One-Time Use",
      "gemini-1.5-pro": "Gemini-Pro-1.5: Best Gemini Model — 2 Million Tokens",
      "gemini-1.5-flash": "Gemini-Flash-1.5: Fastest & Cheapest Google Model",
      "gemini-2.0-flash": "Gemini-Flash-2.0: Newest & Best Google Model",
      "gemini-1.0-ultra": "Gemini-Ultra: Largest Google Model — Unreleased",
      "claude-3-opus-20240229": "Claude-Opus: Very Powerful — GPT-4 Level",
      "claude-3-sonnet-20240229": "Claude-Sonnet: Hard-Working — Turbo Level",
      "claude-3-haiku-20240307": "Claude-Haiku: Light, Cheap, & Fast — New",
      "claude-2.1": "Claude-2.1: Best Instant Model — 200k Tokens",
      "claude-2.0": "Claude-2.0: Average Cheap Model — 100k Tokens",
      "claude-1.2": "Claude-1.2: Cheapest Instant Model — 100k Context",
      "open-mistral-7b": "Mistral-Tiny: Cheapest — Open Source 7B",
      "open-mixtral-8x7b": "Mixtral 8x7B: Mixture of Experts (MoE) Model",
      "open-mixtral-8x22b": "Mixtral 8x22b: Strongest Open Source Model",
      "mistral-small-latest": "Mistral-Small: Smarter — More Costly",
      "mistral-medium-latest": "Mistral-Medium: Intelligent — Beats Gemini-Pro",
      "mistral-large-latest": "Mistral-Large: Most Expensive and Intelligent",
      "llama3-70b": "Llama3 70b: GPT-4 Level Performance — Intelligent",
      "llama3-8b": "Llama3 8b: Smaller, Faster Model — Cheaper",
      "codestral-latest": "Codestral: Best Mistral Model for Coding",
      "gemma-7b-it": "Smallest Open-Source Google Model",
      "open-codestral-mamba": "Codestral Mamba: A Mamba 2 language model specialized in code generation",
      "mathstral-temp-id": "Mathstral: A math-specific 7B model designed for math reasoning and scientific tasks",
      "open-mistral-nemo": "Mistral NeMo: A 12B model built in partnership with Nvidia, easy to use and a drop-in replacement for Mistral 7B",
      "gpt-4o-mini": "GPT-4o-Mini: Small, fast, and cheap model from OpenAI with relatively high intelligence.",
      "mixtral-8x7b-32768": "Qroq API: Free Mixtral 8x7b",
      // open router models
    "anthropic/claude-3.7-sonnet:beta": "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
    "anthropic/claude-3.7-sonnet": "Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. \n\nClaude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.\n\nRead more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)",
    "openai/gpt-3.5-turbo-0125": "The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.\n\nThis version has a higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls.",
    "openai/gpt-3.5-turbo": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021."
};
    
  
    // Function to show the custom tooltip
    function showCustomTooltip(text, targetElement) {
      let tooltip = document.getElementById("custom-tooltip");
      let rect = targetElement.getBoundingClientRect();
  
      tooltip.textContent = text;
      tooltip.style.display = 'block';
  
      // Position the tooltip to the right and slightly above the targetElement
      tooltip.style.left = `${rect.left - tooltip.offsetWidth - 10}px`; // 10 pixels to the left of the element
      tooltip.style.top = `${window.scrollY + rect.top}px`; // 10 pixels above the top of the element
    }

    function toggleDropdown(event) {
      let isClickInside = event.target.closest('.custom-select') || event.target.id === 'selected-model';
      if (isClickInside) {
        let options = document.getElementById("model-options");
        options.style.display = options.style.display === "block" ? "none" : "block";
        
        // If opening the dropdown, reset the search and focus the search input
        if (options.style.display === "block") {
          document.getElementById("model-search").value = "";
          filterModels("");
          document.getElementById("model-search").focus();
        }
      }
    }
    
    // Function to filter models based on search input
    function filterModels(searchText) {
      const showOpenRouter = document.getElementById("show-open-router").checked;
      const modelButtons = document.querySelectorAll("#model-options button");
      const searchTerms = searchText.toLowerCase().split(" ");
      
      modelButtons.forEach(button => {
        const modelName = button.textContent.toLowerCase();
        const isOpenRouterModel = button.classList.contains("openrouter-model");
        const isStandardModel = button.classList.contains("standard-model");
        
        // Check if model name matches all search terms (AND logic)
        const matchesSearch = searchTerms.every(term => modelName.includes(term));
        
        // Show/hide based on search and toggle state
        if (matchesSearch && (isStandardModel || (isOpenRouterModel && showOpenRouter))) {
          button.style.display = "block";
        } else {
          button.style.display = "none";
        }
      });
    }
  
// Toggle dropdown on clicking the custom-select div
document.querySelector('.custom-select').addEventListener('click', toggleDropdown);
// Collapse dropdown when clicking outside the model selector
document.addEventListener('click', function(event) {
  const container = document.getElementById('model-selector-container');
  const options = document.getElementById('model-options');
  if (options && options.style.display === 'block' && !container.contains(event.target)) {
    options.style.display = 'none';
  }
});

// Add event listener for search input
document.getElementById('model-search').addEventListener('input', (e) => {
  filterModels(e.target.value);
});

// Add event listener for OpenRouter toggle
document.getElementById('show-open-router').addEventListener('change', () => {
  filterModels(document.getElementById('model-search').value);
});

// Initialize model filtering on page load
window.addEventListener('DOMContentLoaded', () => {
  // Hide OpenRouter models by default
  const modelButtons = document.querySelectorAll('.openrouter-model');
  modelButtons.forEach(button => {
    button.style.display = 'none';
  });
});

    // Function to hide the custom tooltip
    function hideCustomTooltip() {
      let tooltip = document.getElementById("custom-tooltip");
      tooltip.style.display = 'none';
    }
    // Hide tooltip on model button mouseout
    document.querySelectorAll('#model-options button').forEach(button => {
      button.addEventListener('mouseout', hideCustomTooltip);
    });
    
    document.getElementById('selected-model').addEventListener('click', toggleDropdown);

    
    // Toggle Assistants Mode on clicking the custom-select div
  document.getElementById('mode-selector').addEventListener('click', () => {
    // Toggle assistantsMode
    assistantsMode = !assistantsMode;

    // Update the visual indicator for Assistants Mode
    const modeSelectorDiv = document.getElementById('mode-selector');
    if (assistantsMode) {
      modeSelectorDiv.style.backgroundColor = '#4CAF50'; // Example: change background to green
      modeSelectorDiv.textContent = 'Assistants Mode ON'; // Update text to indicate mode is on
      isAssistants = true;
      currentModelID = 'gpt-4-turbo';
    } else {
      modeSelectorDiv.style.backgroundColor = ''; // Reset background
      modeSelectorDiv.textContent = 'Assistants Mode'; // Reset text
      isAssistants = false;
    }

    console.log("Assistants Mode:", assistantsMode); // For debugging
  });


    function determineEndpoint(modelID) {
      if (modelID.startsWith('gemini')) {
        isGemini = true;
        return `${baseURL}/gemini`; // URL for the Gemini endpoint
      } if (assistantsMode = true) {
        isAssistants = true;
        return `${baseURL}/assistant`;
      } else {
        isGemini = false;
        isAssistants = false;
        return `${baseURL}/message`; // URL for the OpenAI endpoint
      }
    }
    



// Event listeners for selecting GPT models
document.getElementById('model-gpt-4').addEventListener('click', () => selectModel('gpt-4'));
document.getElementById('model-gpt-4.5').addEventListener('click', () => selectModel('gpt-4.5-preview'));
document.getElementById('model-gpt-4.1').addEventListener('click', () => selectModel('gpt-4.1'));
document.getElementById('model-gpt-4o').addEventListener('click', () => selectModel('gpt-4o'));
document.getElementById('model-gpt-4-32k').addEventListener('click', () => selectModel('gpt-4-32k'));
document.getElementById('model-gpt-4-turbo').addEventListener('click', () => selectModel('gpt-4-turbo'));
document.getElementById('model-gpt-3.5').addEventListener('click', () => selectModel('gpt-3.5-turbo-0125'));
document.getElementById('model-gpt-4o-mini').addEventListener('click', () => selectModel('gpt-4o-mini'));
document.getElementById('model-gpt-o1-preview').addEventListener('click', () => selectModel('o1-preview'));
document.getElementById('model-gpt-o1').addEventListener('click', () => selectModel('o1'));
document.getElementById('model-gpt-o3').addEventListener('click', () => selectModel('o3'));
document.getElementById('model-gpt-o1-mini').addEventListener('click', () => selectModel('o1-mini'));
document.getElementById('model-gpt-o3-mini').addEventListener('click', () => selectModel('o3-mini'));
document.getElementById('model-gpt-o4-mini').addEventListener('click', () => selectModel('o4-mini'));

document.getElementById('model-deepseek-r1').addEventListener('click', () => selectModel('deepseek-reasoner'));
document.getElementById('model-deepseek-chat').addEventListener('click', () => selectModel('deepseek-chat'));


// Event listeners for showing GPT model descriptions on hover
document.getElementById('model-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4"], event.currentTarget));
document.getElementById('model-gpt-4o').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4o"], event.currentTarget));
document.getElementById('model-gpt-4-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-32k"], event.currentTarget));
document.getElementById('model-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-turbo"], event.currentTarget));
document.getElementById('model-gpt-3.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-3.5-turbo-0125"], event.currentTarget));
document.getElementById('model-gpt-4o-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4o-mini"], event.currentTarget));

// Event listeners for selecting Gemini models
document.getElementById('model-gemini-pro').addEventListener('click', () => selectModel('gemini-pro'));
// document.getElementById('model-gemini-pro-vision').addEventListener('click', () => selectModel('gemini-pro-vision'));
document.getElementById('model-gemini-1.5-pro').addEventListener('click', () => selectModel('gemini-1.5-pro'));
document.getElementById('model-gemini-1.5-flash').addEventListener('click', () => selectModel('gemini-1.5-flash'));
document.getElementById('model-gemini-2.0-flash').addEventListener('click', () => selectModel('gemini-2.0-flash-exp'));
document.getElementById('model-gemini-ultra').addEventListener('click', () => selectModel('gemini-1.0-ultra'));

// Event listeners for showing Gemini model descriptions on hover
document.getElementById('model-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro"], event.currentTarget));
// document.getElementById('model-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro-vision"], event.currentTarget));
document.getElementById('model-gemini-1.5-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-1.5-pro"], event.currentTarget));
document.getElementById('model-gemini-1.5-flash').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-1.5-flash"], event.currentTarget));
document.getElementById('model-gemini-2.0-flash').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-2.0-flash-exp"], event.currentTarget));
document.getElementById('model-gemini-ultra').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-1.0-ultra"], event.currentTarget));

// Event listeners for selecting Mistral models
document.getElementById('model-mistral-tiny').addEventListener('click', () => selectModel('open-mistral-7b'));
document.getElementById('model-mistral-8x7b').addEventListener('click', () => selectModel('open-mixtral-8x7b'));
document.getElementById('model-mistral-8x22b').addEventListener('click', () => selectModel('open-mixtral-8x22b'));
document.getElementById('model-mistral-small').addEventListener('click', () => selectModel('mistral-small-latest'));
document.getElementById('model-mistral-medium').addEventListener('click', () => selectModel('mistral-medium-latest'));
document.getElementById('model-mistral-large').addEventListener('click', () => selectModel('mistral-large-latest'));

// Event listeners for showing Mistral model descriptions on hover
document.getElementById('model-mistral-tiny').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["open-mistral-7b"], event.currentTarget));
document.getElementById('model-mistral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["open-mixtral-8x7b"], event.currentTarget));
document.getElementById('model-mistral-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["open-mixtral-8x22b"], event.currentTarget));
document.getElementById('model-mistral-small').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["mistral-small-latest"], event.currentTarget));
document.getElementById('model-mistral-medium').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["mistral-medium-latest"], event.currentTarget));
document.getElementById('model-mistral-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["mistral-medium-latest"], event.currentTarget));

document.getElementById('model-codestral-mamba').addEventListener('click', () => selectModel('open-codestral-mamba'));
document.getElementById('model-mathstral').addEventListener('click', () => selectModel('mathstral-temp-id'));
document.getElementById('model-mistral-nemo').addEventListener('click', () => selectModel('open-mistral-nemo'));

document.getElementById('model-codestral-mamba').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["open-codestral-mamba"], event.currentTarget));
document.getElementById('model-mathstral').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["mathstral-temp-id"], event.currentTarget));
document.getElementById('model-mistral-nemo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["open-mistral-nemo"], event.currentTarget));

// Event listeners for selecting Claude models
document.getElementById('model-claude-opus').addEventListener('click', () => selectModel('claude-3-opus-20240229'));
document.getElementById('model-claude-sonnet').addEventListener('click', () => selectModel('claude-3-sonnet-20240229'));
document.getElementById('model-claude-haiku').addEventListener('click', () => selectModel('claude-3-haiku-20240307'));
document.getElementById('model-claude-2.1').addEventListener('click', () => selectModel('claude-2.1'));
document.getElementById('model-claude-2.0').addEventListener('click', () => selectModel('claude-2.0'));
document.getElementById('model-claude-1.2').addEventListener('click', () => selectModel('claude-instant-1.2'));

// Event listeners for showing Claude model descriptions on hover
document.getElementById('model-claude-opus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-opus-20240229"], event.currentTarget));
document.getElementById('model-claude-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-sonnet-20240229"], event.currentTarget));
document.getElementById('model-claude-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-haiku-20240307"], event.currentTarget));
document.getElementById('model-claude-2.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-2.1"], event.currentTarget));
document.getElementById('model-claude-2.0').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-2.0"], event.currentTarget));
document.getElementById('model-claude-1.2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-instant-1.2"], event.currentTarget));

// Event listeners for selecting Llama3 models
document.getElementById('model-llama-70b').addEventListener('click', () => selectModel('llama3-70b-8192'));
document.getElementById('model-llama-8b').addEventListener('click', () => selectModel('llama3-8b-8192'));

document.getElementById('model-llama-3.1-8b').addEventListener('click', () => selectModel('llama-3.1-8b-instant'));
document.getElementById('model-llama-3.1-70b').addEventListener('click', () => selectModel('llama-3.1-70b-versatile'));
document.getElementById('model-llama-3.1-405b').addEventListener('click', () => selectModel('llama-3.1-405b-reasoning'));

// Event listeners for showing Llama3 model descriptions on hover
document.getElementById('model-llama-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama3-70b-8192"], event.currentTarget));
document.getElementById('model-llama-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama3-8b-8192"], event.currentTarget));

document.getElementById('model-llama-3.1-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama-3.1-8b-instant"], event.currentTarget));
document.getElementById('model-llama-3.1-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama-3.1-8b-instant"], event.currentTarget));
document.getElementById('model-llama-3.1-405b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama-3.1-8b-instant"], event.currentTarget));

// gemma it via qroq
document.getElementById('model-gemma-it').addEventListener('click', () => selectModel('gemma-7b-it'));
document.getElementById('model-gemma-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemma-7b-it"], event.currentTarget));
document.getElementById('model-codestral').addEventListener('click', () => selectModel('codestral-latest'));
document.getElementById('model-codestral').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["codestral-latest"], event.currentTarget));
document.getElementById('model-qroq-mistral-8x7b').addEventListener('click', () => selectModel('mixtral-8x7b-32768'));
document.getElementById('model-qroq-mistral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["mixtral-8x7b-32768"], event.currentTarget));

document.getElementById('model-claude-4-opus').addEventListener('click', () => selectModel('claude-opus-4-20250514'));
document.getElementById('model-claude-4-opus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-opus-4-20250514"], event.currentTarget));
document.getElementById('model-claude-4-sonnet').addEventListener('click', () => selectModel('claude-sonnet-4-20250514'));
document.getElementById('model-claude-4-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-sonnet-4-20250514"], event.currentTarget));
document.getElementById('model-claude-3.5-sonnet').addEventListener('click', () => selectModel('claude-3-5-sonnet-latest'));
document.getElementById('model-claude-3.5-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-5-sonnet-latest"], event.currentTarget));
document.getElementById('model-claude-3.7-sonnet').addEventListener('click', () => selectModel('claude-3-7-sonnet-latest'));
document.getElementById('model-claude-3.7-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-7-sonnet-latest"], event.currentTarget));
document.getElementById('model-claude-3.5-haiku').addEventListener('click', () => selectModel('claude-3-5-haiku-latest'));
document.getElementById('model-claude-3.5-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-5-haiku-latest"], event.currentTarget));


// select open router models lol

// Event listeners for additional models
document.getElementById('open-router-model-anthropic-claude-3.7-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3.7-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3.7-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3.7-sonnet'));
document.getElementById('open-router-model-perplexity-r1-1776').addEventListener('click', () => selectModel('perplexity/r1-1776'));
///there are a lot more here but ive elided them for context 


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

      const sidebar = document.getElementById('sidebar');
      const toggleArrow = document.getElementById('toggleArrow');
      const promptBar = document.getElementById('promptBar');
      const toggleRightArrow = document.getElementById('toggleRightArrow');
      const summariesButton = document.getElementById('summariesButton');
      const copyPromptButton = document.getElementById('copyPromptButton');
      let summariesOnly = true;
      let currentSelectedPrompt = null;

      // Fetch the list of chats from the backend and display them in the sidebar
      async function fetchChatList() {
        try {
          console.log("fetching chat list");
          const response = await fetch('/listChats');
          const data = await response.json();
          console.log("response", data);
          const chatList = document.getElementById('chatList');
          chatList.innerHTML = data.files.map(file => {
            // Remove the .txt extension
            let fileNameWithoutExt = file.replace('.txt', '');
            // Replace underscores with spaces
            let displayName = fileNameWithoutExt.replace(/_/g, ' ');
            return `<li><a href="#" data-chat="${fileNameWithoutExt}">${displayName}</a></li>`;
          }).join('');
        } catch (error) {
          console.error('Error fetching chat list:', error);
        }
      }

      // Fetch the list of prompts from the backend and display them in the sidebar
      async function fetchPromptList() {
        try {
          const response = await fetch('/listPrompts');
          const data = await response.json();
          const promptList = document.getElementById('promptList');
          const promptInfo = data.promptInfo;

          promptList.innerHTML = data.files.map(file => {
            let fileNameWithoutExt = file.replace('.md', '');
            let displayName = fileNameWithoutExt.charAt(0).toUpperCase() + fileNameWithoutExt.slice(1);
            return `
              <li>
                <a href="#" data-prompt="${fileNameWithoutExt}">${displayName}</a>
                <button class="copyPromptButton" data-prompt="${fileNameWithoutExt}">Copy</button>
              </li>`;
          }).join('');

          // Add event listeners for tooltip functionality
          document.querySelectorAll('#promptList li a').forEach(item => {
            item.addEventListener('mouseover', (event) => {
              const promptName = event.currentTarget.getAttribute('data-prompt');
              const info = promptInfo[promptName];
              showCustomTooltip(`${info.name}: ${info.description}`, event.currentTarget);
            });
            item.addEventListener('mouseout', () => {
              hideCustomTooltip();
            });
          });


          // Add event listeners for prompt selection and copy buttons
          document.querySelectorAll('#promptList li a').forEach(item => {
            item.addEventListener('click', handlePromptSelection);
        });
        document.querySelectorAll('.copyPromptButton').forEach(button => {
          button.addEventListener('click', handleCopyPrompt);
      });
          /*
          // Add event listeners for copy prompt buttons
          document.querySelectorAll('.copyPromptButton').forEach(button => {
            button.addEventListener('click', async (event) => {
              const promptName = event.target.getAttribute('data-prompt');
              try {
                const response = await fetch('/copyPrompt', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chosenPrompt: promptName })
                });
                copyPromptButton.textContent = 'Copied!';
                setTimeout(() => {
                  copyPromptButton.textContent = 'Copy Prompt';
                }, 1000);
                const data = await response.json();

                if (data.prompt) {
                  // Assume there is a function to set instructions from the prompt
                  setInstructionsFromPrompt(data.prompt.body);
                } else {
                  console.error('Prompt not found.');
                }
              } catch (error) {
                console.error('Error setting prompt:', error);
              }
            });
          });
          */

        } catch (error) {
          console.error('Error fetching prompt list:', error);
        }
      }
      
      // Handle chat selection
      document.getElementById('chatList').addEventListener('click', async (event) => {
        if (event.target.tagName === 'A') {
          event.preventDefault();
          const chatName = event.target.getAttribute('data-chat');
          if (chatName) {
            try {
              console.log("clicked");
              await fetch('/setChat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chosenChat: `${chatName}` })
              });
      
              const summaryResponse = await fetch(`/getSummary/${chatName}`);
              const summaryData = await summaryResponse.json();
      
              if (summaryData.summary) {
                displayMessage(summaryData.summary, 'response', false);
              } else {
                console.error('Summary not found.');
              }
            } catch (error) {
              console.error('Error setting chat:', error);
            }
          }
        }
      });

      // Handle prompt selection
    async function handlePromptSelection(event) {
      event.preventDefault();
      const promptName = event.target.getAttribute('data-prompt');
      currentSelectedPrompt = promptName;
      
      try {
          const promptResponse = await fetch('/setPrompt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chosenPrompt: promptName })
          });

          const promptData = await promptResponse.json();

          if (promptData.prompt) {
              displayMessage(promptData.prompt.body, 'response', false);
          } else {
              console.error('Prompt not found.');
          }
      } catch (error) {
          console.error('Error setting prompt:', error);
      }
  }

  // Handle copy prompt
  async function handleCopyPrompt(event) {
      const promptName = event.target.getAttribute('data-prompt');
      try {
          const response = await fetch('/copyPrompt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chosenPrompt: promptName })
          });
          
          if (response.ok) {
              event.target.textContent = 'Copied!';
              setTimeout(() => {
                  event.target.textContent = 'Copy';
              }, 1000);
          } else {
              throw new Error('Copy failed');
          }
      } catch (error) {
          console.error('Error copying prompt:', error);
      }
  }
      /*
      // Handle prompt selection
      document.getElementById('promptList').addEventListener('click', async (event) => {
        if (event.target.tagName === 'A') {
          event.preventDefault();
          const promptName = event.target.getAttribute('data-prompt');
          if (promptName) {
            try {
              const promptResponse = await fetch('/setPrompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chosenPrompt: promptName })
              });

              const promptData = await promptResponse.json();

              if (promptData.prompt) {
                displayMessage(promptData.prompt.body, 'response', false);
              } else {
                console.error('Prompt not found.');
              }
            } catch (error) {
              console.error('Error setting prompt:', error);
            }
          }
        }
      });
      */

      // Toggle sidebar visibility
      toggleArrow.addEventListener('click', () => {
        if (sidebar.style.display === 'block') {
          sidebar.style.display = 'none';
          toggleArrow.innerHTML = '&#x25B6;';
        } else {
          sidebar.style.display = 'block';
          toggleArrow.innerHTML = '&#x25C0;';
        }
      });

      // Toggle prompt bar visibility
      toggleRightArrow.addEventListener('click', () => {
        if (promptBar.style.display === 'block') {
          promptBar.style.display = 'none';
          toggleRightArrow.innerHTML = '&#x25C0;';
        } else {
          promptBar.style.display = 'block';
          toggleRightArrow.innerHTML = '&#x25B6;';
        }
      });

      // Handle summariesButton click
      summariesButton.addEventListener('click', async () => {
        summariesOnly = !summariesOnly;
        summariesButton.textContent = summariesOnly ? 'Summaries Only' : 'Whole Conversations';

        try {
          await fetch('/setSummariesOnly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summariesOnly })
          });
        } catch (error) {
          console.error('Error setting summaries only:', error);
        }
      });

      /*
      // Handle copy prompt button click
      // IMPORTANT: I think this is irrelevant now???
      copyPromptButton.addEventListener('click', async () => {
        try {
          const response = await fetch('/copyPrompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summariesOnly })
          });
          if (response.ok) {
            copyPromptButton.textContent = 'Copied!';
            setTimeout(() => {
              copyPromptButton.textContent = 'Copy Prompt';
            }, 1000);
          } else {
            throw new Error('Copy failed');
          }
        } catch (error) {
          console.error('Error copying prompt:', error);
        }
      });
      */

      // Function to set instructions from prompt
    function setInstructionsFromPrompt(promptBody) {
      // This function will be called when a prompt is selected
      console.log("Setting instructions:", promptBody);
      // You can implement any additional logic here to handle the new instructions
  }

      
// Function to show the custom tooltip
function showCustomTooltip(text, targetElement) {
  let tooltip = document.getElementById("custom-tooltip");
  let rect = targetElement.getBoundingClientRect();

  tooltip.textContent = text;
  tooltip.style.display = 'block';

  // Position the tooltip to the right and slightly above the targetElement
  tooltip.style.left = `${rect.left - tooltip.offsetWidth - 10}px`; // 10 pixels to the left of the element
  tooltip.style.top = `${window.scrollY + rect.top}px`; // 10 pixels above the top of the element
}

function toggleDropdown(event) {
  let isClickInside = event.target.closest('.custom-select') || event.target.id === 'selected-model';
  if (isClickInside) {
    let options = document.getElementById("model-options");
    options.style.display = options.style.display === "block" ? "none" : "block";
    
    // If opening the dropdown, reset the search and focus the search input
    if (options.style.display === "block") {
      document.getElementById("model-search").value = "";
      filterModels("");
      document.getElementById("model-search").focus();
    }
  }
}

// Function to filter models based on search input
function filterModels(searchText) {
  const showOpenRouter = document.getElementById("show-open-router").checked;
  const modelButtons = document.querySelectorAll("#model-options button");
  const searchTerms = searchText.toLowerCase().split(" ");
  
  modelButtons.forEach(button => {
    const modelName = button.textContent.toLowerCase();
    const isOpenRouterModel = button.classList.contains("openrouter-model");
    const isStandardModel = button.classList.contains("standard-model");
    
    // Check if model name matches all search terms (AND logic)
    const matchesSearch = searchTerms.every(term => modelName.includes(term));
    
    // Show/hide based on search and toggle state
    if (matchesSearch && (isStandardModel || (isOpenRouterModel && showOpenRouter))) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}


// Function to hide the custom tooltip
function hideCustomTooltip() {
  let tooltip = document.getElementById("custom-tooltip");
  tooltip.style.display = 'none';
}

      

      document.addEventListener('keydown', (event) => {

        // SHIFT+ESC for focusing the chat input
        if (event.shiftKey && event.key === 'Escape') {
          event.preventDefault();
          messageInput.focus();
        }
    
        // CMD+SHIFT+X for exporting chat history
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'X') {
          console.log("exporting");
          event.preventDefault();
          exportChatHistory();
        }
    
        // CMD+SHIFT+R for toggling voice mode
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'V') {
          event.preventDefault();
          voice();
        }

        // CMD+SHIFT+C for copying the latest chat message
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      const copyButtons = document.querySelectorAll('.message button'); // Get all buttons in messages
      const latestCopyButton = Array.from(copyButtons).reverse().find(btn => btn.textContent.includes('Copy') && !btn.textContent.includes('Copy Code'));
      if (latestCopyButton) {
        latestCopyButton.click();
      }
    }

    // CMD+SHIFT+; for copying the latest code block
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === ';') {
      event.preventDefault();
      const copyCodeButtons = document.querySelectorAll('.message button'); // Get all buttons in messages
      const latestCopyCodeButton = Array.from(copyCodeButtons).reverse().find(btn => btn.textContent.includes('Copy Code'));
      if (latestCopyCodeButton) {
        latestCopyCodeButton.click();
      }
    }

    // CMD+SHIFT+F for focusing the file input
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
      event.preventDefault();
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.click(); // Trigger the file input dialog
      }
    }

    // CMD+SHIFT+A for toggling Assistant Mode
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'A') {
      event.preventDefault();
      document.getElementById('mode-selector').click(); // Programmatically click the mode-selector
  }

      });
  
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

// New function to reset text area height
function resetTextAreaHeight(field) {
  field.style.height = '40px'; // Set to your default height
  autoExpand(field); // Call autoExpand to adjust if there's any remaining content
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
          resetTextAreaHeight(this); // Add this line to reset the height
        }
      });


      

    
      
      // Result of Send Button
sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  messageInput.value = '';
  resetTextAreaHeight(messageInput); // Add this line to reset the height


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

      // Function to export chat history based on the type (conversation or gemini)
      function exportChatHistory() {
        // Determine the history type based on isGemini and isAssistants flags
        let historyType;
        if (isGemini) {
          historyType = 'gemini';
        } else if (isAssistants) {
          historyType = 'assistants';
        } else {
          historyType = 'conversation';
        }
        
        console.log("Exporting chat history for:", historyType);
        const exportUrl = '/export-chat-html?type=' + historyType;
        fetch(exportUrl)
          .then(async response => {
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'chat_history.html';
            if (contentDisposition) {
              const match = contentDisposition.match(/filename="(.+)"/);
              if (match.length > 1) {
                filename = match[1];
              }
            }
            const blob = await response.blob();
            return ({ blob, filename });
          })
          .then(({ blob, filename }) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          })
          .catch(err => console.error('Error exporting chat history:', err));
      }
      
// Modify exportChatOnShutdown to use the isGemini flag
function exportChatOnShutdown() {
  let historyType;
  if (isGemini) {
    historyType = 'gemini';
  } else if (isAssistants) {
    historyType = 'assistants';
  } else {
    historyType = 'conversation';
  }
  exportChatHistory(historyType);
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
          copyToClipboard(data.text);
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
      
    // Functions for handling image input files
      let fileId;
      // Placeholder function for clipboard button (to be implemented)
      document.getElementById('clipboard-button').addEventListener('click', () => {
        document.getElementById('file-input').click(); // Trigger file input
      });
    
      document.getElementById('file-input').addEventListener('change', async (event) => {
        let file = event.target.files[0];
        // Check if the file is an image by looking at its MIME type
        if (file && file.type.startsWith('image/')) {
          selectedImage = file; // If it's an image, set it as the selectedImage
          file = null;
        } else if (file) {
          fileUrl = await uploadFile(file);
        }
      });

      async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
      
        try {
          const response = await fetch(`${baseURL}/upload-file`, {
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

      
    
      // Defining the messages sent
          
    // converting image to base64
// deprecated function, now on backend
/*
    async function convertImageToBase64(imageFile) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(imageFile);
      });
  }
  */

  // Function to upload the image and return its URL
async function uploadImageAndGetUrl(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(`${baseURL}/upload-image`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.imageUrl; // Assuming the server returns the URL in this format
  } catch (error) {
    console.error('Error uploading image:', error);
    // Handle error
  }
}
  
      // Send the message to the server and handle the response

      let initialize = false;
      let messageCounter = 0;
      let file;
      let fileUrl;

      async function sendMessageToServer(message) {    
        let imageUrl = null;
        let imageFilename = null;
        if (selectedImage) {
          imageUrl = await uploadImageAndGetUrl(selectedImage);
          // Extract filename from the imageUrl
          imageFilename = imageUrl.split('/').pop();
        }    
        if (file) {
          // If it's not an image, treat it as a different type of file
          fileUrl = await uploadFile(file); // Assume uploadFile is a function similar to uploadImageAndGetUrl for handling other files
          // Extract filename from the fileUrl if necessary
          const filename = fileUrl.split('/').pop();
          // Proceed with any additional logic needed after the file upload
        }
        // Prepare the payload with the current model ID
        let payload, endpoint;
        const instructions = await fetchInstructions();
        if (isAssistants === true) {
          if (messageCounter === 0) {
            isFirstMessage = true
            messageCounter +=1
          } else {
            isFirstMessage = false;
          }
          payload = {
            message: message,
            modelID: currentModelID,
            instructions: instructions,
            file: fileUrl, // Existing image handling for OpenAI
            initialize: isFirstMessage,
            temperature: temperature,
            tokens: tokens
          };
          endpoint = `${baseURL}/assistant`; // OpenAI endpoint
        } else {
        if (currentModelID.includes('gemini')) {
          // Prepare the payload for Google Gemini API
          payload = {
            prompt: message,
            model: currentModelID,
            imageParts: imageFilename ? [{ filename: imageFilename, mimeType: 'image/jpeg' }] : []
          };
          endpoint = `${baseURL}/gemini`; // Gemini endpoint
        } else {
          // Prepare the payload for OpenAI API
          payload = {
            message: message,
            modelID: currentModelID,
            instructions: instructions,
            image: imageUrl, // Existing image handling for OpenAI
            file: fileUrl,
            temperature: temperature,
            tokens: tokens
          };
          endpoint = `${baseURL}/message`; // OpenAI endpoint
        }
      }
        try {
          console.log(payload);
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
          } else if (endpoint.includes('assistant')) {
            messageContent = data.text.text || 'No response received.';
          } else {
            // Response from GPT API, expected to have a 'text' property
            messageContent = data.text || 'No response received.';
          }
          console.log()
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
    imageElement.classList.add('generated-image');
    messageElement.appendChild(imageElement);
  } else {
    // Check if message contains a code block
    if (message.includes('\`\`\`')) {
      // Improved regex pattern to correctly identify and split code blocks
      const parts = message.split(/(\`\`\`[\s\S]+?\`\`\`)/);
      parts.forEach(part => {
        if (part.startsWith('\`\`\`') && part.endsWith('\`\`\`')) {
          // Handle code blocks
          const codeContent = part.substring(3, part.length - 3);
          const languageMatch = codeContent.match(/^[^\n]+/);
          const language = languageMatch ? languageMatch[0].trim() : '';
          const actualCode = codeContent.replace(/^[^\n]+/, '').trim();

          const pre = document.createElement('pre');
          const codeElement = document.createElement('code');
          /*
          if (language) {
            codeElement.classList.add(`language-${language}`);
          }
          */
          codeElement.textContent = actualCode;
          pre.appendChild(codeElement);
          messageElement.appendChild(pre);

          // Add a "Copy Code" button on a new line after the code block
          const copyCodeButtonWrapper = document.createElement('div');
          copyCodeButtonWrapper.style.marginTop = '10px'; // Add some space above the button
          const copyCodeButton = document.createElement('button');
          copyCodeButton.textContent = 'Copy Code';
          copyCodeButton.onclick = function() { copyToClipboard(actualCode); };
          copyCodeButtonWrapper.appendChild(copyCodeButton);
          messageElement.appendChild(copyCodeButtonWrapper);
        } else {
          // This is regular text, render as markdown
          const textSpan = document.createElement('span');
          const rawHtml = marked.parse(part);
          const safeHtml = DOMPurify.sanitize(rawHtml);
          textSpan.innerHTML = safeHtml;
          messageElement.appendChild(textSpan);
        }
      });
      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy';
      copyButton.onclick = function() { copyToClipboard(messageElement.innerText); };
      messageElement.appendChild(copyButton);
    } else {
      const messageText = document.createElement('span');
      // Convert markdown to HTML using marked.js and sanitize it with DOMPurify
      const rawHtml = marked.parse(message);
      const safeHtml = DOMPurify.sanitize(rawHtml);
      messageText.innerHTML = safeHtml;

      const copyButton = document.createElement('button');
      copyButton.textContent = 'Copy';
      copyButton.onclick = function() { copyToClipboard(messageText.textContent); };

      messageElement.appendChild(messageText);
      messageElement.appendChild(copyButton);
    }
  }

  const chatBox = document.getElementById('chat-box');
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message

  if (type === 'response' && isVoiceTranscription) {
    callTTSAPI(message); // Read out the response message only if it should be read aloud
  }
}
    
    // copy button feature
    
    // Updated copyToClipboard function to handle text parameter
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard!');
  }).catch(err => {
    console.error('Error copying text: ', err);
  });
}


fetchChatList();
fetchPromptList();
    
      
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

document.getElementById('edit-instructions-btn').addEventListener('click', function() {
  const container = document.getElementById('edit-instructions-container');
  const isHidden = container.style.display === 'none';
  
  // Toggle the display of the container
  container.style.display = isHidden ? 'block' : 'none';
  
  // If we're showing the container, load the content and scroll to it
  if (isHidden) {
    fetch('/get-instructions')
      .then(response => response.text())
      .then(data => {
        document.getElementById('instructions-content').value = data;
        container.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});

function saveChanges() {
  const content = document.getElementById('instructions-content').value;
  
  // Copy 'node server.js' to clipboard
  navigator.clipboard.writeText('node server.js').then(() => {
    console.log('Text copied to clipboard');
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });

  fetch('/update-instructions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: content })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // Show a success message
    alert('Changes saved successfully');
    // Hide the edit container
    document.getElementById('edit-instructions-container').style.display = 'none';

    // Display the restart server message
    document.body.innerHTML = '<h2>Complete. Please restart the server and access the web app at <a href="http://localhost:3000">localhost:3000</a>. Simply paste `node server.js` into your Terminal to start again, reloading the page.</h2>';

    // Call the endpoint to shutdown the server
    fetch('/shutdown-server', {
      method: 'POST'
    }).then(restartResponse => {
      if (restartResponse.ok) {
        console.log('Server shutdown initiated');
      } else {
        console.error('Failed to initiate server shutdown');
      }
    }).catch(err => {
      console.error('Error:', err);
    });
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred during setup. Please try again.');
  });
}




document.getElementById('edit-env-btn').addEventListener('click', function() {
  const container = document.getElementById('edit-env-container');
  const isHidden = container.style.display === 'none';
  
  // Toggle the display of the container
  container.style.display = isHidden ? 'block' : 'none';
  
  // If we're showing the container, load the content and scroll to it
  if (isHidden) {
    fetch('/get-my-env')
      .then(response => response.text())
      .then(data => {
        document.getElementById('env-content').value = data;
        container.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});

function saveEnvChanges() {
  const content = document.getElementById('env-content').value;
  
  // Copy 'node server.js' to clipboard
  navigator.clipboard.writeText('node server.js').then(() => {
    console.log('Text copied to clipboard');
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });

  fetch('/update-my-env', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: content })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // Show a success message
    alert('Changes saved successfully');
    // Hide the edit container
    document.getElementById('edit-env-container').style.display = 'none';

    // Display the restart server message
    document.body.innerHTML = '<h2>Setup is complete. Please restart the server and access the web app at <a href="http://localhost:3000">localhost:3000</a>. Simply paste `node server.js` into your Terminal to start again, reloading the page.</h2>';

    // Call the endpoint to shutdown the server
    fetch('/shutdown-server', {
      method: 'POST'
    }).then(restartResponse => {
      if (restartResponse.ok) {
        console.log('Server shutdown initiated');
      } else {
        console.error('Failed to initiate server shutdown');
      }
    }).catch(err => {
      console.error('Error:', err);
    });
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred during setup. Please try again.');
  });
}

function setInstructionsFromPrompt(promptBody) {
  // Implement this function to set instructions from the prompt body
  console.log(promptBody); // Example implementation
  // it will need to call to the backend and do something like this?
}

/*
when someone clicks on the prompt, it displays it, when they click the copy prompt button, 
sends the name of that file for the backend to process, read, and load that file, and 
then use a regex to retrieve the actual contents of the prompt itself. 
it then sets customPrompt to true. then on the backend: 

// Function to read instructions from the file using fs promises
async function readInstructionsFile() {
  try {
    let instructions;
      // Adjust the path if your folder structure is different
      if (customPrompt) {
        // file path goes to the the prompt file name we get from that separate async function
        // sets instructions equal to the contents of that file
      } else {
        instructions = await fs.promises.readFile('./public/instructions.md', 'utf8');
      }
      return instructions;
  } catch (error) {
      console.error('Error reading instructions file:', error);
      return ''; // Return empty string or handle error as needed
  }
}

*/
// Global variables for sliders
let temperature = 1;
let tokens = 8000;

// Define token limits for different models
function getMaxTokensByModel(modelID) {
  if (modelID === 'gpt-4') {
    return 6000;
  } else if (modelID === 'gpt-4o-mini') {
    return 16000;
  } else if (modelID === 'gpt-4o') {
    return 16000;
  } else if (modelID.startsWith('llama-3.1')) {
    return 8000;
  } else if (modelID === 'claude-3-7-sonnet-latest') {
    return 100000;
  } else if (modelID === 'claude-opus-4-20250514' || modelID === 'claude-sonnet-4-20250514') {
    return 100000;
  } else if (modelID.startsWith('claude')) {
    return 8000;
  } else {
    return 8000; // Default for other models
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // ==================== TEMPERATURE SLIDER ====================
  const tempSliderContainer = document.getElementById('temperature-slider-container');
  
  if (!tempSliderContainer) {
    // If the container doesn't exist, create it
    const tempContainer = document.createElement('div');
    tempContainer.id = 'temperature-slider-container';
    tempContainer.className = 'slider-container';
    document.getElementById('chat-container').appendChild(tempContainer);
  }

  // Create or select the temperature slider
  let tempSlider = document.getElementById('temperature-slider');
  if (!tempSlider) {
    tempSlider = document.createElement('input');
    tempSlider.type = 'range';
    tempSlider.id = 'temperature-slider';
    tempSlider.min = '0';
    tempSlider.max = '2';
    tempSlider.step = '0.1';
    tempSlider.value = temperature;
    tempSliderContainer.appendChild(tempSlider);
  }

  // Create or select the temperature value display
  let tempValueDisplay = document.getElementById('temperature-value');
  if (!tempValueDisplay) {
    tempValueDisplay = document.createElement('span');
    tempValueDisplay.id = 'temperature-value';
    tempSliderContainer.appendChild(tempValueDisplay);
  }

  // Set initial temperature value
  tempValueDisplay.textContent = temperature.toFixed(1);

  // Add event listener to temperature slider
  tempSlider.addEventListener('input', function() {
    temperature = parseFloat(this.value);
    tempValueDisplay.textContent = temperature.toFixed(1);
    
    // Update temperature slider color based on value
    const tempPercentage = (temperature - 0) / (2 - 0) * 100;
    const tempColor = tempPercentage < 50 
      ? `rgb(${tempPercentage * 2.55}, ${255}, 0)` 
      : `rgb(255, ${255 - (tempPercentage - 50) * 5.1}, 0)`;
    
    tempValueDisplay.style.color = tempColor;
    this.style.setProperty('--thumb-color', tempColor);

    console.log('Temperature updated:', temperature);
  });

  // ==================== TOKENS SLIDER ====================
  // Find or create the tokens slider container
  let tokensSliderContainer = document.getElementById('tokens-slider-container');
  if (!tokensSliderContainer) {
    tokensSliderContainer = document.createElement('div');
    tokensSliderContainer.id = 'tokens-slider-container';
    tokensSliderContainer.className = 'slider-container';
    
    // Position tokens slider after temperature slider
    if (tempSliderContainer && tempSliderContainer.parentNode) {
      tempSliderContainer.parentNode.insertBefore(tokensSliderContainer, tempSliderContainer.nextSibling);
    } else {
      // Fallback
      document.getElementById('chat-container').appendChild(tokensSliderContainer);
    }
  }

  // Create tokens label
  let tokensLabel = document.createElement('label');
  tokensLabel.htmlFor = 'tokens-slider';
  tokensLabel.textContent = 'Max Tokens:';
  tokensSliderContainer.appendChild(tokensLabel);

  // Create tokens slider
  let tokensSlider = document.createElement('input');
  tokensSlider.type = 'range';
  tokensSlider.id = 'tokens-slider';
  tokensSlider.min = '1000';
  tokensSlider.max = '100000';
  tokensSlider.step = '500';
  tokensSlider.value = tokens;
  tokensSliderContainer.appendChild(tokensSlider);

  // Create tokens value display
  let tokensValueDisplay = document.createElement('span');
  tokensValueDisplay.id = 'tokens-value';
  tokensValueDisplay.textContent = tokens;
  tokensSliderContainer.appendChild(tokensValueDisplay);

  // Create model limit display
  let tokensLimitDisplay = document.createElement('span');
  tokensLimitDisplay.id = 'tokens-limit';
  tokensLimitDisplay.innerHTML = ' (Model limit: <span id="model-token-limit">8000</span>)';
  tokensSliderContainer.appendChild(tokensLimitDisplay);

  // Set initial tokens values
  document.getElementById('model-token-limit').textContent = 
    getMaxTokensByModel(currentModelID || 'default');

  // Add event listener to tokens slider
  tokensSlider.addEventListener('input', function() {
    tokens = parseInt(this.value);
    tokensValueDisplay.textContent = tokens;
    
    // Update tokens slider color based on value
    const maxTokens = getMaxTokensByModel(currentModelID || 'default');
    const tokensPercentage = (tokens - 1000) / (maxTokens - 1000) * 100;
    const tokensColor = tokensPercentage < 50 
      ? `rgb(${tokensPercentage * 2.55}, ${255}, 0)` 
      : `rgb(255, ${255 - (tokensPercentage - 50) * 5.1}, 0)`;
    
    tokensValueDisplay.style.color = tokensColor;
    this.style.setProperty('--thumb-color', tokensColor);

    console.log('Tokens updated:', tokens);
  });
  
  // Initialize both sliders
  console.log('Temperature and tokens sliders initialized');
  
  // Add CSS for the sliders
  const style = document.createElement('style');
  style.textContent = `
    .slider-container {
      margin: 10px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #temperature-slider, #tokens-slider {
      flex-grow: 1;
      --thumb-color: rgb(0, 255, 0);
    }
    #temperature-slider::-webkit-slider-thumb, #tokens-slider::-webkit-slider-thumb {
      background-color: var(--thumb-color);
    }
    #temperature-value, #tokens-value {
      font-weight: bold;
      min-width: 40px;
    }
    #tokens-limit {
      font-size: 0.9em;
      color: #666;
    }
  `;
  document.head.appendChild(style);
  
  // If currentModelID is already defined, update the tokens slider to match
  if (typeof currentModelID !== 'undefined') {
    updateTokensSlider(currentModelID);
  }
});

// Function to update the tokens slider based on selected model
function updateTokensSlider(modelID) {
  const tokensSlider = document.getElementById('tokens-slider');
  const modelTokenLimit = document.getElementById('model-token-limit');
  if (!tokensSlider || !modelTokenLimit) return;

  const maxTokens = getMaxTokensByModel(modelID);
  
  // Update the displayed limit
  modelTokenLimit.textContent = maxTokens;
  
  // Update slider max attribute
  tokensSlider.max = maxTokens;
  
  // If current value exceeds new max, adjust it
  if (parseInt(tokensSlider.value) > maxTokens) {
    tokensSlider.value = maxTokens;
    document.getElementById('tokens-value').textContent = maxTokens;
    tokens = maxTokens;
  }
}

// Hook into the model selection function to update tokens limits
const originalSelectModel = window.selectModel || function() {};
window.selectModel = function(modelID) {
  originalSelectModel(modelID);
  updateTokensSlider(modelID);
};