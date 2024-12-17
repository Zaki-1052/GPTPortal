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
    "GPT-4o": "gpt-4o",
    "GPT-4-32k": "gpt-4-32k",
    "GPT-4-Turbo": "gpt-4-turbo",
    "GPT-3.5-Turbo": "gpt-3.5-turbo-0125",
    "Claude-3.5-Sonnet": "claude-3-5-sonnet-latest",
    "Claude-3.5-Haiku": "claude-3-5-haiku-latest",
    "GPT-o1-Mini": "o1-mini",
    "GPT-o1-Preview": "o1-preview",
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
    "Eva Llama 3.33 70b": "eva-unit-01/eva-llama-3.33-70b",
    "xAI: Grok 2 Vision 1212": "x-ai/grok-2-vision-1212",
    "xAI: Grok 2 1212": "x-ai/grok-2-1212",
    "Cohere: Command R7B (12-2024)": "cohere/command-r7b-12-2024",
    "Google: Gemini Flash 2.0 Experimental (free)": "google/gemini-2.0-flash-exp:free",
    "Google: Gemini Experimental 1206 (free)": "google/gemini-exp-1206:free",
    "Meta: Llama 3.3 70B Instruct": "meta-llama/llama-3.3-70b-instruct",
    "Amazon: Nova Lite 1.0": "amazon/nova-lite-v1",
    "Amazon: Nova Micro 1.0": "amazon/nova-micro-v1",
    "Amazon: Nova Pro 1.0": "amazon/nova-pro-v1",
    "Qwen: QwQ 32B Preview": "qwen/qwq-32b-preview",
    "Google: Gemini Experimental 1121 (free)": "google/gemini-exp-1121:free",
    "Google: LearnLM 1.5 Pro Experimental (free)": "google/learnlm-1.5-pro-experimental:free",
    "EVA Qwen2.5 72B": "eva-unit-01/eva-qwen-2.5-72b",
    "OpenAI: GPT-4o (2024-11-20)": "openai/gpt-4o-2024-11-20",
    "Mistral Large 2411": "mistralai/mistral-large-2411",
    "Mistral Large 2407": "mistralai/mistral-large-2407",
    "Mistral: Pixtral Large 2411": "mistralai/pixtral-large-2411",
    "xAI: Grok Vision Beta": "x-ai/grok-vision-beta",
    "Google: Gemini Experimental 1114 (free)": "google/gemini-exp-1114:free",
    "Mistral Nemo Inferor 12B": "infermatic/mn-inferor-12b",
    "Qwen2.5 Coder 32B Instruct": "qwen/qwen-2.5-coder-32b-instruct",
    "SorcererLM 8x22B": "raifle/sorcererlm-8x22b",
    "EVA Qwen2.5 32B": "eva-unit-01/eva-qwen-2.5-32b",
    "Unslopnemo 12b": "thedrummer/unslopnemo-12b",
    "Anthropic: Claude 3.5 Haiku (2024-10-22) (self-moderated)": "anthropic/claude-3.5-haiku-20241022:beta",
    "Anthropic: Claude 3.5 Haiku (2024-10-22)": "anthropic/claude-3.5-haiku-20241022",
    "Anthropic: Claude 3.5 Haiku (self-moderated)": "anthropic/claude-3.5-haiku:beta",
    "Anthropic: Claude 3.5 Haiku": "anthropic/claude-3.5-haiku",
    "Lumimaid v0.2 70B": "neversleep/llama-3.1-lumimaid-70b",
    "Magnum v4 72B": "anthracite-org/magnum-v4-72b",
    "Anthropic: Claude 3.5 Sonnet (self-moderated)": "anthropic/claude-3.5-sonnet:beta",
    "Anthropic: Claude 3.5 Sonnet": "anthropic/claude-3.5-sonnet",
    "xAI: Grok Beta": "x-ai/grok-beta",
    "Ministral 8B": "mistralai/ministral-8b",
    "Ministral 3B": "mistralai/ministral-3b",
    "Qwen2.5 7B Instruct": "qwen/qwen-2.5-7b-instruct",
    "NVIDIA: Llama 3.1 Nemotron 70B Instruct": "nvidia/llama-3.1-nemotron-70b-instruct",
    "Inflection: Inflection 3 Pi": "inflection/inflection-3-pi",
    "Inflection: Inflection 3 Productivity": "inflection/inflection-3-productivity",
    "Google: Gemini Flash 1.5 8B": "google/gemini-flash-1.5-8b",
    "Magnum v2 72B": "anthracite-org/magnum-v2-72b",
    "Liquid: LFM 40B MoE": "liquid/lfm-40b",
    "Rocinante 12B": "thedrummer/rocinante-12b",
    "Meta: Llama 3.2 3B Instruct (free)": "meta-llama/llama-3.2-3b-instruct:free",
    "Meta: Llama 3.2 3B Instruct": "meta-llama/llama-3.2-3b-instruct",
    "Meta: Llama 3.2 1B Instruct (free)": "meta-llama/llama-3.2-1b-instruct:free",
    "Meta: Llama 3.2 1B Instruct": "meta-llama/llama-3.2-1b-instruct",
    "Meta: Llama 3.2 90B Vision Instruct (free)": "meta-llama/llama-3.2-90b-vision-instruct:free",
    "Meta: Llama 3.2 90B Vision Instruct": "meta-llama/llama-3.2-90b-vision-instruct",
    "Meta: Llama 3.2 11B Vision Instruct (free)": "meta-llama/llama-3.2-11b-vision-instruct:free",
    "Meta: Llama 3.2 11B Vision Instruct": "meta-llama/llama-3.2-11b-vision-instruct",
    "Qwen2.5 72B Instruct": "qwen/qwen-2.5-72b-instruct",
    "Qwen2-VL 72B Instruct": "qwen/qwen-2-vl-72b-instruct",
    "Lumimaid v0.2 8B": "neversleep/llama-3.1-lumimaid-8b",
    "OpenAI: o1-mini (2024-09-12)": "openai/o1-mini-2024-09-12",
    "OpenAI: o1-preview": "openai/o1-preview",
    "OpenAI: o1-preview (2024-09-12)": "openai/o1-preview-2024-09-12",
    "OpenAI: o1-mini": "openai/o1-mini",
    "Mistral: Pixtral 12B": "mistralai/pixtral-12b",
    "Cohere: Command R (08-2024)": "cohere/command-r-08-2024",
    "Cohere: Command R+ (08-2024)": "cohere/command-r-plus-08-2024",
    "Qwen2-VL 7B Instruct": "qwen/qwen-2-vl-7b-instruct",
    "Google: Gemini Flash 1.5 Experimental": "google/gemini-flash-1.5-exp",
    "Llama 3.1 Euryale 70B v2.2": "sao10k/l3.1-euryale-70b",
    "Google: Gemini Flash 1.5 8B Experimental": "google/gemini-flash-1.5-8b-exp",
    "AI21: Jamba 1.5 Large": "ai21/jamba-1-5-large",
    "AI21: Jamba 1.5 Mini": "ai21/jamba-1-5-mini",
    "Phi-3.5 Mini 128K Instruct": "microsoft/phi-3.5-mini-128k-instruct",
    "Nous: Hermes 3 70B Instruct": "nousresearch/hermes-3-llama-3.1-70b",
    "Nous: Hermes 3 405B Instruct": "nousresearch/hermes-3-llama-3.1-405b",
    "Perplexity: Llama 3.1 Sonar 405B Online": "perplexity/llama-3.1-sonar-huge-128k-online",
    "OpenAI: ChatGPT-4o": "openai/chatgpt-4o-latest",
    "Llama 3 8B Lunaris": "sao10k/l3-lunaris-8b",
    "Mistral Nemo 12B Starcannon": "aetherwiing/mn-starcannon-12b",
    "OpenAI: GPT-4o (2024-08-06)": "openai/gpt-4o-2024-08-06",
    "Meta: Llama 3.1 405B (base)": "meta-llama/llama-3.1-405b",
    "Mistral Nemo 12B Celeste": "nothingiisreal/mn-celeste-12b",
    "Perplexity: Llama 3.1 Sonar 8B": "perplexity/llama-3.1-sonar-small-128k-chat",
    "Google: Gemini Pro 1.5 Experimental": "google/gemini-pro-1.5-exp",
    "Perplexity: Llama 3.1 Sonar 70B": "perplexity/llama-3.1-sonar-large-128k-chat",
    "Perplexity: Llama 3.1 Sonar 70B Online": "perplexity/llama-3.1-sonar-large-128k-online",
    "Perplexity: Llama 3.1 Sonar 8B Online": "perplexity/llama-3.1-sonar-small-128k-online",
    "Meta: Llama 3.1 405B Instruct (free)": "meta-llama/llama-3.1-405b-instruct:free",
    "Meta: Llama 3.1 405B Instruct": "meta-llama/llama-3.1-405b-instruct",
    "Meta: Llama 3.1 405B Instruct (nitro)": "meta-llama/llama-3.1-405b-instruct:nitro",
    "Meta: Llama 3.1 8B Instruct (free)": "meta-llama/llama-3.1-8b-instruct:free",
    "Meta: Llama 3.1 8B Instruct": "meta-llama/llama-3.1-8b-instruct",
    "Meta: Llama 3.1 70B Instruct (free)": "meta-llama/llama-3.1-70b-instruct:free",
    "Meta: Llama 3.1 70B Instruct": "meta-llama/llama-3.1-70b-instruct",
    "Meta: Llama 3.1 70B Instruct (nitro)": "meta-llama/llama-3.1-70b-instruct:nitro",
    "Mistral: Mistral Nemo": "mistralai/mistral-nemo",
    "Mistral: Codestral Mamba": "mistralai/codestral-mamba",
    "OpenAI: GPT-4o-mini": "openai/gpt-4o-mini",
    "OpenAI: GPT-4o-mini (2024-07-18)": "openai/gpt-4o-mini-2024-07-18",
    "Qwen 2 7B Instruct (free)": "qwen/qwen-2-7b-instruct:free",
    "Qwen 2 7B Instruct": "qwen/qwen-2-7b-instruct",
    "Google: Gemma 2 27B": "google/gemma-2-27b-it",
    "Magnum 72B": "alpindale/magnum-72b",
    "Google: Gemma 2 9B (free)": "google/gemma-2-9b-it:free",
    "Google: Gemma 2 9B": "google/gemma-2-9b-it",
    "01.AI: Yi Large": "01-ai/yi-large",
    "AI21: Jamba Instruct": "ai21/jamba-instruct",
    "Anthropic: Claude 3.5 Sonnet (2024-06-20) (self-moderated)": "anthropic/claude-3.5-sonnet-20240620:beta",
    "Anthropic: Claude 3.5 Sonnet (2024-06-20)": "anthropic/claude-3.5-sonnet-20240620",
    "Llama 3 Euryale 70B v2.1": "sao10k/l3-euryale-70b",
    "Dolphin 2.9.2 Mixtral 8x22B \ud83d\udc2c": "cognitivecomputations/dolphin-mixtral-8x22b",
    "Qwen 2 72B Instruct": "qwen/qwen-2-72b-instruct",
    "Mistral: Mistral 7B Instruct (free)": "mistralai/mistral-7b-instruct:free",
    "Mistral: Mistral 7B Instruct": "mistralai/mistral-7b-instruct",
    "Mistral: Mistral 7B Instruct (nitro)": "mistralai/mistral-7b-instruct:nitro",
    "Mistral: Mistral 7B Instruct v0.3": "mistralai/mistral-7b-instruct-v0.3",
    "NousResearch: Hermes 2 Pro - Llama-3 8B": "nousresearch/hermes-2-pro-llama-3-8b",
    "Phi-3 Mini 128K Instruct (free)": "microsoft/phi-3-mini-128k-instruct:free",
    "Phi-3 Mini 128K Instruct": "microsoft/phi-3-mini-128k-instruct",
    "Phi-3 Medium 128K Instruct (free)": "microsoft/phi-3-medium-128k-instruct:free",
    "Phi-3 Medium 128K Instruct": "microsoft/phi-3-medium-128k-instruct",
    "Llama 3 Lumimaid 70B": "neversleep/llama-3-lumimaid-70b",
    "Google: Gemini Flash 1.5": "google/gemini-flash-1.5",
    "Perplexity: Llama3 Sonar 70B Online": "perplexity/llama-3-sonar-large-32k-online",
    "DeepSeek V2.5": "deepseek/deepseek-chat",
    "Perplexity: Llama3 Sonar 8B": "perplexity/llama-3-sonar-small-32k-chat",
    "Perplexity: Llama3 Sonar 70B": "perplexity/llama-3-sonar-large-32k-chat",
    "OpenAI: GPT-4o (2024-05-13)": "openai/gpt-4o-2024-05-13",
    "Meta: LlamaGuard 2 8B": "meta-llama/llama-guard-2-8b",
    "OpenAI: GPT-4o": "openai/gpt-4o",
    "OpenAI: GPT-4o (extended)": "openai/gpt-4o:extended",
    "Llama 3 Lumimaid 8B (extended)": "neversleep/llama-3-lumimaid-8b:extended",
    "Llama 3 Lumimaid 8B": "neversleep/llama-3-lumimaid-8b",
    "Meta: Llama 3 8B Instruct (free)": "meta-llama/llama-3-8b-instruct:free",
    "Meta: Llama 3 8B Instruct": "meta-llama/llama-3-8b-instruct",
    "Meta: Llama 3 8B Instruct (extended)": "meta-llama/llama-3-8b-instruct:extended",
    "Meta: Llama 3 8B Instruct (nitro)": "meta-llama/llama-3-8b-instruct:nitro",
    "Meta: Llama 3 70B Instruct": "meta-llama/llama-3-70b-instruct",
    "Meta: Llama 3 70B Instruct (nitro)": "meta-llama/llama-3-70b-instruct:nitro",
    "Mistral: Mixtral 8x22B Instruct": "mistralai/mixtral-8x22b-instruct",
    "WizardLM-2 8x22B": "microsoft/wizardlm-2-8x22b",
    "WizardLM-2 7B": "microsoft/wizardlm-2-7b",
    "Google: Gemini Pro 1.5": "google/gemini-pro-1.5",
    "OpenAI: GPT-4 Turbo": "openai/gpt-4-turbo",
    "Cohere: Command R+": "cohere/command-r-plus",
    "Cohere: Command R+ (04-2024)": "cohere/command-r-plus-04-2024",
    "Databricks: DBRX 132B Instruct": "databricks/dbrx-instruct",
    "Midnight Rose 70B": "sophosympatheia/midnight-rose-70b",
    "Cohere: Command": "cohere/command",
    "Cohere: Command R": "cohere/command-r",
    "Anthropic: Claude 3 Haiku (self-moderated)": "anthropic/claude-3-haiku:beta",
    "Anthropic: Claude 3 Haiku": "anthropic/claude-3-haiku",
    "Anthropic: Claude 3 Opus (self-moderated)": "anthropic/claude-3-opus:beta",
    "Anthropic: Claude 3 Opus": "anthropic/claude-3-opus",
    "Anthropic: Claude 3 Sonnet (self-moderated)": "anthropic/claude-3-sonnet:beta",
    "Anthropic: Claude 3 Sonnet": "anthropic/claude-3-sonnet",
    "Cohere: Command R (03-2024)": "cohere/command-r-03-2024",
    "Mistral Large": "mistralai/mistral-large",
    "OpenAI: GPT-3.5 Turbo (older v0613)": "openai/gpt-3.5-turbo-0613",
    "OpenAI: GPT-4 Turbo Preview": "openai/gpt-4-turbo-preview",
    "Nous: Hermes 2 Mixtral 8x7B DPO": "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    "Mistral Small": "mistralai/mistral-small",
    "Mistral Tiny": "mistralai/mistral-tiny",
    "Mistral Medium": "mistralai/mistral-medium",
    "Mistral: Mistral 7B Instruct v0.2": "mistralai/mistral-7b-instruct-v0.2",
    "Dolphin 2.6 Mixtral 8x7B \ud83d\udc2c": "cognitivecomputations/dolphin-mixtral-8x7b",
    "Google: Gemini Pro Vision 1.0": "google/gemini-pro-vision",
    "Google: Gemini Pro 1.0": "google/gemini-pro",
    "Mixtral 8x7B (base)": "mistralai/mixtral-8x7b",
    "Mixtral 8x7B Instruct": "mistralai/mixtral-8x7b-instruct",
    "Mixtral 8x7B Instruct (nitro)": "mistralai/mixtral-8x7b-instruct:nitro",
    "OpenChat 3.5 7B (free)": "openchat/openchat-7b:free",
    "OpenChat 3.5 7B": "openchat/openchat-7b",
    "Noromaid 20B": "neversleep/noromaid-20b",
    "Anthropic: Claude v2 (self-moderated)": "anthropic/claude-2:beta",
    "Anthropic: Claude v2": "anthropic/claude-2",
    "Anthropic: Claude v2.1 (self-moderated)": "anthropic/claude-2.1:beta",
    "Anthropic: Claude v2.1": "anthropic/claude-2.1",
    "OpenHermes 2.5 Mistral 7B": "teknium/openhermes-2.5-mistral-7b",
    "OpenAI: GPT-4 Vision": "openai/gpt-4-vision-preview",
    "lzlv 70B": "lizpreciatior/lzlv-70b-fp16-hf",
    "Toppy M 7B (free)": "undi95/toppy-m-7b:free",
    "Toppy M 7B (nitro)": "undi95/toppy-m-7b:nitro",
    "Toppy M 7B": "undi95/toppy-m-7b",
    "Goliath 120B": "alpindale/goliath-120b",
    "Auto (best for prompt)": "openrouter/auto",
    "OpenAI: GPT-3.5 Turbo 16k (older v1106)": "openai/gpt-3.5-turbo-1106",
    "OpenAI: GPT-4 Turbo (older v1106)": "openai/gpt-4-1106-preview",
    "Google: PaLM 2 Chat 32k": "google/palm-2-chat-bison-32k",
    "Google: PaLM 2 Code Chat 32k": "google/palm-2-codechat-bison-32k",
    "Airoboros 70B": "jondurbin/airoboros-l2-70b",
    "Xwin 70B": "xwin-lm/xwin-lm-70b",
    "OpenAI: GPT-3.5 Turbo Instruct": "openai/gpt-3.5-turbo-instruct",
    "Mistral: Mistral 7B Instruct v0.1": "mistralai/mistral-7b-instruct-v0.1",
    "Pygmalion: Mythalion 13B": "pygmalionai/mythalion-13b",
    "OpenAI: GPT-3.5 Turbo 16k": "openai/gpt-3.5-turbo-0125",
    "OpenAI: GPT-4 32k": "openai/gpt-4-32k",
    "OpenAI: GPT-4 32k (older v0314)": "openai/gpt-4-32k-0314",
    "Nous: Hermes 13B": "nousresearch/nous-hermes-llama2-13b",
    "Mancer: Weaver (alpha)": "mancer/weaver",
    "Hugging Face: Zephyr 7B (free)": "huggingfaceh4/zephyr-7b-beta:free",
    "Anthropic: Claude v2.0 (self-moderated)": "anthropic/claude-2.0:beta",
    "Anthropic: Claude v2.0": "anthropic/claude-2.0",
    "ReMM SLERP 13B": "undi95/remm-slerp-l2-13b",
    "ReMM SLERP 13B (extended)": "undi95/remm-slerp-l2-13b:extended",
    "Google: PaLM 2 Chat": "google/palm-2-chat-bison",
    "Google: PaLM 2 Code Chat": "google/palm-2-codechat-bison",
    "MythoMax 13B (free)": "gryphe/mythomax-l2-13b:free",
    "MythoMax 13B": "gryphe/mythomax-l2-13b",
    "MythoMax 13B (nitro)": "gryphe/mythomax-l2-13b:nitro",
    "MythoMax 13B (extended)": "gryphe/mythomax-l2-13b:extended",
    "Meta: Llama v2 13B Chat": "meta-llama/llama-2-13b-chat",
    "OpenAI: GPT-3.5 Turbo": "openai/gpt-3.5-turbo",
    "OpenAI: GPT-4": "openai/gpt-4",
    "OpenAI: GPT-4 (older v0314)": "openai/gpt-4-0314"
};

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4o": "GPT-4o",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-turbo": "GPT-4-Turbo",
    "gpt-3.5-turbo-0125": "GPT-3.5-Turbo",
    "claude-3-5-sonnet-latest": "Claude-3.5-Sonnet",
    "claude-3-5-haiku-latest": "Claude-3.5-Haiku",
    "o1-mini": "GPT-o1-Mini",
    "o1-preview": "GPT-o1-Preview",
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
    "eva-unit-01/eva-llama-3.33-70b": "Eva Llama 3.33 70b",
    "x-ai/grok-2-vision-1212": "xAI: Grok 2 Vision 1212",
    "x-ai/grok-2-1212": "xAI: Grok 2 1212",
    "cohere/command-r7b-12-2024": "Cohere: Command R7B (12-2024)",
    "google/gemini-2.0-flash-exp:free": "Google: Gemini Flash 2.0 Experimental (free)",
    "google/gemini-exp-1206:free": "Google: Gemini Experimental 1206 (free)",
    "meta-llama/llama-3.3-70b-instruct": "Meta: Llama 3.3 70B Instruct",
    "amazon/nova-lite-v1": "Amazon: Nova Lite 1.0",
    "amazon/nova-micro-v1": "Amazon: Nova Micro 1.0",
    "amazon/nova-pro-v1": "Amazon: Nova Pro 1.0",
    "qwen/qwq-32b-preview": "Qwen: QwQ 32B Preview",
    "google/gemini-exp-1121:free": "Google: Gemini Experimental 1121 (free)",
    "google/learnlm-1.5-pro-experimental:free": "Google: LearnLM 1.5 Pro Experimental (free)",
    "eva-unit-01/eva-qwen-2.5-72b": "EVA Qwen2.5 72B",
    "openai/gpt-4o-2024-11-20": "OpenAI: GPT-4o (2024-11-20)",
    "mistralai/mistral-large-2411": "Mistral Large 2411",
    "mistralai/mistral-large-2407": "Mistral Large 2407",
    "mistralai/pixtral-large-2411": "Mistral: Pixtral Large 2411",
    "x-ai/grok-vision-beta": "xAI: Grok Vision Beta",
    "google/gemini-exp-1114:free": "Google: Gemini Experimental 1114 (free)",
    "infermatic/mn-inferor-12b": "Mistral Nemo Inferor 12B",
    "qwen/qwen-2.5-coder-32b-instruct": "Qwen2.5 Coder 32B Instruct",
    "raifle/sorcererlm-8x22b": "SorcererLM 8x22B",
    "eva-unit-01/eva-qwen-2.5-32b": "EVA Qwen2.5 32B",
    "thedrummer/unslopnemo-12b": "Unslopnemo 12b",
    "anthropic/claude-3.5-haiku-20241022:beta": "Anthropic: Claude 3.5 Haiku (2024-10-22) (self-moderated)",
    "anthropic/claude-3.5-haiku-20241022": "Anthropic: Claude 3.5 Haiku (2024-10-22)",
    "anthropic/claude-3.5-haiku:beta": "Anthropic: Claude 3.5 Haiku (self-moderated)",
    "anthropic/claude-3.5-haiku": "Anthropic: Claude 3.5 Haiku",
    "neversleep/llama-3.1-lumimaid-70b": "Lumimaid v0.2 70B",
    "anthracite-org/magnum-v4-72b": "Magnum v4 72B",
    "anthropic/claude-3.5-sonnet:beta": "Anthropic: Claude 3.5 Sonnet (self-moderated)",
    "anthropic/claude-3.5-sonnet": "Anthropic: Claude 3.5 Sonnet",
    "x-ai/grok-beta": "xAI: Grok Beta",
    "mistralai/ministral-8b": "Ministral 8B",
    "mistralai/ministral-3b": "Ministral 3B",
    "qwen/qwen-2.5-7b-instruct": "Qwen2.5 7B Instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct": "NVIDIA: Llama 3.1 Nemotron 70B Instruct",
    "inflection/inflection-3-pi": "Inflection: Inflection 3 Pi",
    "inflection/inflection-3-productivity": "Inflection: Inflection 3 Productivity",
    "google/gemini-flash-1.5-8b": "Google: Gemini Flash 1.5 8B",
    "anthracite-org/magnum-v2-72b": "Magnum v2 72B",
    "liquid/lfm-40b": "Liquid: LFM 40B MoE",
    "thedrummer/rocinante-12b": "Rocinante 12B",
    "meta-llama/llama-3.2-3b-instruct:free": "Meta: Llama 3.2 3B Instruct (free)",
    "meta-llama/llama-3.2-3b-instruct": "Meta: Llama 3.2 3B Instruct",
    "meta-llama/llama-3.2-1b-instruct:free": "Meta: Llama 3.2 1B Instruct (free)",
    "meta-llama/llama-3.2-1b-instruct": "Meta: Llama 3.2 1B Instruct",
    "meta-llama/llama-3.2-90b-vision-instruct:free": "Meta: Llama 3.2 90B Vision Instruct (free)",
    "meta-llama/llama-3.2-90b-vision-instruct": "Meta: Llama 3.2 90B Vision Instruct",
    "meta-llama/llama-3.2-11b-vision-instruct:free": "Meta: Llama 3.2 11B Vision Instruct (free)",
    "meta-llama/llama-3.2-11b-vision-instruct": "Meta: Llama 3.2 11B Vision Instruct",
    "qwen/qwen-2.5-72b-instruct": "Qwen2.5 72B Instruct",
    "qwen/qwen-2-vl-72b-instruct": "Qwen2-VL 72B Instruct",
    "neversleep/llama-3.1-lumimaid-8b": "Lumimaid v0.2 8B",
    "openai/o1-mini-2024-09-12": "OpenAI: o1-mini (2024-09-12)",
    "openai/o1-preview": "OpenAI: o1-preview",
    "openai/o1-preview-2024-09-12": "OpenAI: o1-preview (2024-09-12)",
    "openai/o1-mini": "OpenAI: o1-mini",
    "mistralai/pixtral-12b": "Mistral: Pixtral 12B",
    "cohere/command-r-08-2024": "Cohere: Command R (08-2024)",
    "cohere/command-r-plus-08-2024": "Cohere: Command R+ (08-2024)",
    "qwen/qwen-2-vl-7b-instruct": "Qwen2-VL 7B Instruct",
    "google/gemini-flash-1.5-exp": "Google: Gemini Flash 1.5 Experimental",
    "sao10k/l3.1-euryale-70b": "Llama 3.1 Euryale 70B v2.2",
    "google/gemini-flash-1.5-8b-exp": "Google: Gemini Flash 1.5 8B Experimental",
    "ai21/jamba-1-5-large": "AI21: Jamba 1.5 Large",
    "ai21/jamba-1-5-mini": "AI21: Jamba 1.5 Mini",
    "microsoft/phi-3.5-mini-128k-instruct": "Phi-3.5 Mini 128K Instruct",
    "nousresearch/hermes-3-llama-3.1-70b": "Nous: Hermes 3 70B Instruct",
    "nousresearch/hermes-3-llama-3.1-405b": "Nous: Hermes 3 405B Instruct",
    "perplexity/llama-3.1-sonar-huge-128k-online": "Perplexity: Llama 3.1 Sonar 405B Online",
    "openai/chatgpt-4o-latest": "OpenAI: ChatGPT-4o",
    "sao10k/l3-lunaris-8b": "Llama 3 8B Lunaris",
    "aetherwiing/mn-starcannon-12b": "Mistral Nemo 12B Starcannon",
    "openai/gpt-4o-2024-08-06": "OpenAI: GPT-4o (2024-08-06)",
    "meta-llama/llama-3.1-405b": "Meta: Llama 3.1 405B (base)",
    "nothingiisreal/mn-celeste-12b": "Mistral Nemo 12B Celeste",
    "perplexity/llama-3.1-sonar-small-128k-chat": "Perplexity: Llama 3.1 Sonar 8B",
    "google/gemini-pro-1.5-exp": "Google: Gemini Pro 1.5 Experimental",
    "perplexity/llama-3.1-sonar-large-128k-chat": "Perplexity: Llama 3.1 Sonar 70B",
    "perplexity/llama-3.1-sonar-large-128k-online": "Perplexity: Llama 3.1 Sonar 70B Online",
    "perplexity/llama-3.1-sonar-small-128k-online": "Perplexity: Llama 3.1 Sonar 8B Online",
    "meta-llama/llama-3.1-405b-instruct:free": "Meta: Llama 3.1 405B Instruct (free)",
    "meta-llama/llama-3.1-405b-instruct": "Meta: Llama 3.1 405B Instruct",
    "meta-llama/llama-3.1-405b-instruct:nitro": "Meta: Llama 3.1 405B Instruct (nitro)",
    "meta-llama/llama-3.1-8b-instruct:free": "Meta: Llama 3.1 8B Instruct (free)",
    "meta-llama/llama-3.1-8b-instruct": "Meta: Llama 3.1 8B Instruct",
    "meta-llama/llama-3.1-70b-instruct:free": "Meta: Llama 3.1 70B Instruct (free)",
    "meta-llama/llama-3.1-70b-instruct": "Meta: Llama 3.1 70B Instruct",
    "meta-llama/llama-3.1-70b-instruct:nitro": "Meta: Llama 3.1 70B Instruct (nitro)",
    "mistralai/mistral-nemo": "Mistral: Mistral Nemo",
    "mistralai/codestral-mamba": "Mistral: Codestral Mamba",
    "openai/gpt-4o-mini": "OpenAI: GPT-4o-mini",
    "openai/gpt-4o-mini-2024-07-18": "OpenAI: GPT-4o-mini (2024-07-18)",
    "qwen/qwen-2-7b-instruct:free": "Qwen 2 7B Instruct (free)",
    "qwen/qwen-2-7b-instruct": "Qwen 2 7B Instruct",
    "google/gemma-2-27b-it": "Google: Gemma 2 27B",
    "alpindale/magnum-72b": "Magnum 72B",
    "google/gemma-2-9b-it:free": "Google: Gemma 2 9B (free)",
    "google/gemma-2-9b-it": "Google: Gemma 2 9B",
    "01-ai/yi-large": "01.AI: Yi Large",
    "ai21/jamba-instruct": "AI21: Jamba Instruct",
    "anthropic/claude-3.5-sonnet-20240620:beta": "Anthropic: Claude 3.5 Sonnet (2024-06-20) (self-moderated)",
    "anthropic/claude-3.5-sonnet-20240620": "Anthropic: Claude 3.5 Sonnet (2024-06-20)",
    "sao10k/l3-euryale-70b": "Llama 3 Euryale 70B v2.1",
    "cognitivecomputations/dolphin-mixtral-8x22b": "Dolphin 2.9.2 Mixtral 8x22B \ud83d\udc2c",
    "qwen/qwen-2-72b-instruct": "Qwen 2 72B Instruct",
    "mistralai/mistral-7b-instruct:free": "Mistral: Mistral 7B Instruct (free)",
    "mistralai/mistral-7b-instruct": "Mistral: Mistral 7B Instruct",
    "mistralai/mistral-7b-instruct:nitro": "Mistral: Mistral 7B Instruct (nitro)",
    "mistralai/mistral-7b-instruct-v0.3": "Mistral: Mistral 7B Instruct v0.3",
    "nousresearch/hermes-2-pro-llama-3-8b": "NousResearch: Hermes 2 Pro - Llama-3 8B",
    "microsoft/phi-3-mini-128k-instruct:free": "Phi-3 Mini 128K Instruct (free)",
    "microsoft/phi-3-mini-128k-instruct": "Phi-3 Mini 128K Instruct",
    "microsoft/phi-3-medium-128k-instruct:free": "Phi-3 Medium 128K Instruct (free)",
    "microsoft/phi-3-medium-128k-instruct": "Phi-3 Medium 128K Instruct",
    "neversleep/llama-3-lumimaid-70b": "Llama 3 Lumimaid 70B",
    "google/gemini-flash-1.5": "Google: Gemini Flash 1.5",
    "perplexity/llama-3-sonar-large-32k-online": "Perplexity: Llama3 Sonar 70B Online",
    "deepseek/deepseek-chat": "DeepSeek V2.5",
    "perplexity/llama-3-sonar-small-32k-chat": "Perplexity: Llama3 Sonar 8B",
    "perplexity/llama-3-sonar-large-32k-chat": "Perplexity: Llama3 Sonar 70B",
    "openai/gpt-4o-2024-05-13": "OpenAI: GPT-4o (2024-05-13)",
    "meta-llama/llama-guard-2-8b": "Meta: LlamaGuard 2 8B",
    "openai/gpt-4o": "OpenAI: GPT-4o",
    "openai/gpt-4o:extended": "OpenAI: GPT-4o (extended)",
    "neversleep/llama-3-lumimaid-8b:extended": "Llama 3 Lumimaid 8B (extended)",
    "neversleep/llama-3-lumimaid-8b": "Llama 3 Lumimaid 8B",
    "meta-llama/llama-3-8b-instruct:free": "Meta: Llama 3 8B Instruct (free)",
    "meta-llama/llama-3-8b-instruct": "Meta: Llama 3 8B Instruct",
    "meta-llama/llama-3-8b-instruct:extended": "Meta: Llama 3 8B Instruct (extended)",
    "meta-llama/llama-3-8b-instruct:nitro": "Meta: Llama 3 8B Instruct (nitro)",
    "meta-llama/llama-3-70b-instruct": "Meta: Llama 3 70B Instruct",
    "meta-llama/llama-3-70b-instruct:nitro": "Meta: Llama 3 70B Instruct (nitro)",
    "mistralai/mixtral-8x22b-instruct": "Mistral: Mixtral 8x22B Instruct",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B",
    "google/gemini-pro-1.5": "Google: Gemini Pro 1.5",
    "openai/gpt-4-turbo": "OpenAI: GPT-4 Turbo",
    "cohere/command-r-plus": "Cohere: Command R+",
    "cohere/command-r-plus-04-2024": "Cohere: Command R+ (04-2024)",
    "databricks/dbrx-instruct": "Databricks: DBRX 132B Instruct",
    "sophosympatheia/midnight-rose-70b": "Midnight Rose 70B",
    "cohere/command": "Cohere: Command",
    "cohere/command-r": "Cohere: Command R",
    "anthropic/claude-3-haiku:beta": "Anthropic: Claude 3 Haiku (self-moderated)",
    "anthropic/claude-3-haiku": "Anthropic: Claude 3 Haiku",
    "anthropic/claude-3-opus:beta": "Anthropic: Claude 3 Opus (self-moderated)",
    "anthropic/claude-3-opus": "Anthropic: Claude 3 Opus",
    "anthropic/claude-3-sonnet:beta": "Anthropic: Claude 3 Sonnet (self-moderated)",
    "anthropic/claude-3-sonnet": "Anthropic: Claude 3 Sonnet",
    "cohere/command-r-03-2024": "Cohere: Command R (03-2024)",
    "mistralai/mistral-large": "Mistral Large",
    "openai/gpt-3.5-turbo-0613": "OpenAI: GPT-3.5 Turbo (older v0613)",
    "openai/gpt-4-turbo-preview": "OpenAI: GPT-4 Turbo Preview",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous: Hermes 2 Mixtral 8x7B DPO",
    "mistralai/mistral-small": "Mistral Small",
    "mistralai/mistral-tiny": "Mistral Tiny",
    "mistralai/mistral-medium": "Mistral Medium",
    "mistralai/mistral-7b-instruct-v0.2": "Mistral: Mistral 7B Instruct v0.2",
    "cognitivecomputations/dolphin-mixtral-8x7b": "Dolphin 2.6 Mixtral 8x7B \ud83d\udc2c",
    "google/gemini-pro-vision": "Google: Gemini Pro Vision 1.0",
    "google/gemini-pro": "Google: Gemini Pro 1.0",
    "mistralai/mixtral-8x7b": "Mixtral 8x7B (base)",
    "mistralai/mixtral-8x7b-instruct": "Mixtral 8x7B Instruct",
    "mistralai/mixtral-8x7b-instruct:nitro": "Mixtral 8x7B Instruct (nitro)",
    "openchat/openchat-7b:free": "OpenChat 3.5 7B (free)",
    "openchat/openchat-7b": "OpenChat 3.5 7B",
    "neversleep/noromaid-20b": "Noromaid 20B",
    "anthropic/claude-2:beta": "Anthropic: Claude v2 (self-moderated)",
    "anthropic/claude-2": "Anthropic: Claude v2",
    "anthropic/claude-2.1:beta": "Anthropic: Claude v2.1 (self-moderated)",
    "anthropic/claude-2.1": "Anthropic: Claude v2.1",
    "teknium/openhermes-2.5-mistral-7b": "OpenHermes 2.5 Mistral 7B",
    "openai/gpt-4-vision-preview": "OpenAI: GPT-4 Vision",
    "lizpreciatior/lzlv-70b-fp16-hf": "lzlv 70B",
    "undi95/toppy-m-7b:free": "Toppy M 7B (free)",
    "undi95/toppy-m-7b:nitro": "Toppy M 7B (nitro)",
    "undi95/toppy-m-7b": "Toppy M 7B",
    "alpindale/goliath-120b": "Goliath 120B",
    "openrouter/auto": "Auto (best for prompt)",
    "openai/gpt-3.5-turbo-1106": "OpenAI: GPT-3.5 Turbo 16k (older v1106)",
    "openai/gpt-4-1106-preview": "OpenAI: GPT-4 Turbo (older v1106)",
    "google/palm-2-chat-bison-32k": "Google: PaLM 2 Chat 32k",
    "google/palm-2-codechat-bison-32k": "Google: PaLM 2 Code Chat 32k",
    "jondurbin/airoboros-l2-70b": "Airoboros 70B",
    "xwin-lm/xwin-lm-70b": "Xwin 70B",
    "openai/gpt-3.5-turbo-instruct": "OpenAI: GPT-3.5 Turbo Instruct",
    "mistralai/mistral-7b-instruct-v0.1": "Mistral: Mistral 7B Instruct v0.1",
    "pygmalionai/mythalion-13b": "Pygmalion: Mythalion 13B",
    "openai/gpt-3.5-turbo-16k": "OpenAI: GPT-3.5 Turbo 16k",
    "openai/gpt-4-32k": "OpenAI: GPT-4 32k",
    "openai/gpt-4-32k-0314": "OpenAI: GPT-4 32k (older v0314)",
    "nousresearch/nous-hermes-llama2-13b": "Nous: Hermes 13B",
    "mancer/weaver": "Mancer: Weaver (alpha)",
    "huggingfaceh4/zephyr-7b-beta:free": "Hugging Face: Zephyr 7B (free)",
    "anthropic/claude-2.0:beta": "Anthropic: Claude v2.0 (self-moderated)",
    "anthropic/claude-2.0": "Anthropic: Claude v2.0",
    "undi95/remm-slerp-l2-13b": "ReMM SLERP 13B",
    "undi95/remm-slerp-l2-13b:extended": "ReMM SLERP 13B (extended)",
    "google/palm-2-chat-bison": "Google: PaLM 2 Chat",
    "google/palm-2-codechat-bison": "Google: PaLM 2 Code Chat",
    "gryphe/mythomax-l2-13b:free": "MythoMax 13B (free)",
    "gryphe/mythomax-l2-13b": "MythoMax 13B",
    "gryphe/mythomax-l2-13b:nitro": "MythoMax 13B (nitro)",
    "gryphe/mythomax-l2-13b:extended": "MythoMax 13B (extended)",
    "meta-llama/llama-2-13b-chat": "Meta: Llama v2 13B Chat",
    "openai/gpt-3.5-turbo": "OpenAI: GPT-3.5 Turbo",
    "openai/gpt-3.5-turbo-0125": "OpenAI: GPT-3.5 Turbo 16k",
    "openai/gpt-4": "OpenAI: GPT-4",
    "openai/gpt-4-0314": "OpenAI: GPT-4 (older v0314)"
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
      "claude-3-5-sonnet-latest": "Most Advanced Anthropic Model",
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
    "eva-unit-01/eva-llama-3.33-70b": "A roleplay and storywriting specialist model. It is a full-parameter finetune of [Llama-3.3-70B-Instruct](https://openrouter.ai/meta-llama/llama-3.3-70b-instruct) on mixture of synthetic and natural data.\n\nIt uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and \"flavor\" of the resulting model\n\nThis model was built with Llama by Meta.\n",
    "x-ai/grok-2-vision-1212": "Grok 2 Vision 1212 advances image-based AI with stronger visual comprehension, refined instruction-following, and multilingual support. From object recognition to style analysis, it empowers developers to build more intuitive, visually aware applications. Its enhanced steerability and reasoning establish a robust foundation for next-generation image solutions.\n\nTo read more about this model, check out [xAI's announcement](https://x.ai/blog/grok-1212).",
    "x-ai/grok-2-1212": "Grok 2 1212 introduces significant enhancements to accuracy, instruction adherence, and multilingual support, making it a powerful and flexible choice for developers seeking a highly steerable, intelligent model.",
    "cohere/command-r7b-12-2024": "Command R7B (12-2024) is a small, fast update of the Command R+ model, delivered in December 2024. It excels at RAG, tool use, agents, and similar tasks requiring complex reasoning and multiple steps.",
    "google/gemini-2.0-flash-exp:free": "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    "google/gemini-exp-1206:free": "Experimental release (December 6, 2024) of Gemini.",
    "meta-llama/llama-3.3-70b-instruct": "The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.\n\nSupported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.\n\n[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)",
    "amazon/nova-lite-v1": "Amazon Nova Lite 1.0 is a very low-cost multimodal model from Amazon that focused on fast processing of image, video, and text inputs to generate text output. Amazon Nova Lite can handle real-time customer interactions, document analysis, and visual question-answering tasks with high accuracy.\n\nWith an input context of 300K tokens, it can analyze multiple images or up to 30 minutes of video in a single input.",
    "amazon/nova-micro-v1": "Amazon Nova Micro 1.0 is a text-only model that delivers the lowest latency responses in the Amazon Nova family of models at a very low cost. With a context length of 128K tokens and optimized for speed and cost, Amazon Nova Micro excels at tasks such as text summarization, translation, content classification, interactive chat, and brainstorming. It has  simple mathematical reasoning and coding abilities.",
    "amazon/nova-pro-v1": "Amazon Nova Pro 1.0 is a capable multimodal model from Amazon focused on providing a combination of accuracy, speed, and cost for a wide range of tasks. As of December 2024, it achieves state-of-the-art performance on key benchmarks including visual question answering (TextVQA) and video understanding (VATEX).\n\nAmazon Nova Pro demonstrates strong capabilities in processing both visual and textual information and at analyzing financial documents.\n\n**NOTE**: Video input is not supported at this time.",
    "qwen/qwq-32b-preview": "QwQ-32B-Preview is an experimental research model focused on AI reasoning capabilities developed by the Qwen Team. As a preview release, it demonstrates promising analytical abilities while having several important limitations:\n\n1. **Language Mixing and Code-Switching**: The model may mix languages or switch between them unexpectedly, affecting response clarity.\n2. **Recursive Reasoning Loops**: The model may enter circular reasoning patterns, leading to lengthy responses without a conclusive answer.\n3. **Safety and Ethical Considerations**: The model requires enhanced safety measures to ensure reliable and secure performance, and users should exercise caution when deploying it.\n4. **Performance and Benchmark Limitations**: The model excels in math and coding but has room for improvement in other areas, such as common sense reasoning and nuanced language understanding.\n\n",
    "google/gemini-exp-1121:free": "Experimental release (November 21st, 2024) of Gemini.",
    "google/learnlm-1.5-pro-experimental:free": "An experimental version of [Gemini 1.5 Pro](/google/gemini-pro-1.5) from Google.",
    "eva-unit-01/eva-qwen-2.5-72b": "A roleplay and storywriting specialist model, full-parameter finetune of Qwen2.5-72B on mixture of synthetic and natural data.\n\nIt uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and \"flavor\" of the resulting model.",
    "openai/gpt-4o-2024-11-20": "The 2024-11-20 version of GPT-4o offers a leveled-up creative writing ability with more natural, engaging, and tailored writing to improve relevance & readability. It\u2019s also better at working with uploaded files, providing deeper insights & more thorough responses.\n\nGPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.",
    "mistralai/mistral-large-2411": "Mistral Large 2 2411 is an update of [Mistral Large 2](/mistralai/mistral-large) released together with [Pixtral Large 2411](/mistralai/pixtral-large-2411)\n\nIt provides a significant upgrade on the previous [Mistral Large 24.07](/mistralai/mistral-large-2407), with notable improvements in long context understanding, a new system prompt, and more accurate function calling.",
    "mistralai/mistral-large-2407": "This is Mistral AI's flagship model, Mistral Large 2 (version mistral-large-2407). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).\n\nIt supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.\n",
    "mistralai/pixtral-large-2411": "Pixtral Large is a 124B parameter, open-weight, multimodal model built on top of [Mistral Large 2](/mistralai/mistral-large-2411). The model is able to understand documents, charts and natural images.\n\nThe model is available under the Mistral Research License (MRL) for research and educational use, and the Mistral Commercial License for experimentation, testing, and production for commercial purposes.\n\n",
    "x-ai/grok-vision-beta": "Grok Vision Beta is xAI's experimental language model with vision capability.\n\n",
    "google/gemini-exp-1114:free": "Gemini 11-14 (2024) experimental model features \"quality\" improvements.",
    "infermatic/mn-inferor-12b": "Inferor is a merge of top roleplay models, expert on immersive narratives and storytelling.\n\nThis model was merged using the [Model Stock](https://arxiv.org/abs/2403.19522) merge method using [anthracite-org/magnum-v4-12b](https://openrouter.ai/anthracite-org/magnum-v4-72b) as a base.\n",
    "qwen/qwen-2.5-coder-32b-instruct": "Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen). Qwen2.5-Coder brings the following improvements upon CodeQwen1.5:\n\n- Significantly improvements in **code generation**, **code reasoning** and **code fixing**. \n- A more comprehensive foundation for real-world applications such as **Code Agents**. Not only enhancing coding capabilities but also maintaining its strengths in mathematics and general competencies.\n\nTo read more about its evaluation results, check out [Qwen 2.5 Coder's blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).",
    "raifle/sorcererlm-8x22b": "SorcererLM is an advanced RP and storytelling model, built as a Low-rank 16-bit LoRA fine-tuned on [WizardLM-2 8x22B](/microsoft/wizardlm-2-8x22b).\n\n- Advanced reasoning and emotional intelligence for engaging and immersive interactions\n- Vivid writing capabilities enriched with spatial and contextual awareness\n- Enhanced narrative depth, promoting creative and dynamic storytelling",
    "eva-unit-01/eva-qwen-2.5-32b": "A roleplaying/storywriting specialist model, full-parameter finetune of Qwen2.5-32B on mixture of synthetic and natural data.\n\nIt uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and \"flavor\" of the resulting model.",
    "thedrummer/unslopnemo-12b": "UnslopNemo v4.1 is the latest addition from the creator of Rocinante, designed for adventure writing and role-play scenarios.",
    "anthropic/claude-3.5-haiku-20241022:beta": "Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.\n\nIt does not support image inputs.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)",
    "anthropic/claude-3.5-haiku-20241022": "Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.\n\nIt does not support image inputs.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)",
    "anthropic/claude-3.5-haiku:beta": "Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.\n\nThis makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.\n\nThis model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).",
    "anthropic/claude-3.5-haiku": "Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.\n\nThis makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.\n\nThis model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).",
    "neversleep/llama-3.1-lumimaid-70b": "Lumimaid v0.2 70B is a finetune of [Llama 3.1 70B](/meta-llama/llama-3.1-70b-instruct) with a \"HUGE step up dataset wise\" compared to Lumimaid v0.1. Sloppy chats output were purged.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "anthracite-org/magnum-v4-72b": "This is a series of models designed to replicate the prose quality of the Claude 3 models, specifically Sonnet(https://openrouter.ai/anthropic/claude-3.5-sonnet) and Opus(https://openrouter.ai/anthropic/claude-3-opus).\n\nThe model is fine-tuned on top of [Qwen2.5 72B](https://openrouter.ai/qwen/qwen-2.5-72b-instruct).",
    "anthropic/claude-3.5-sonnet:beta": "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
    "anthropic/claude-3.5-sonnet": "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
    "x-ai/grok-beta": "Grok Beta is xAI's experimental language model with state-of-the-art reasoning capabilities, best for complex and multi-step use cases.\n\nIt is the successor of [Grok 2](https://x.ai/blog/grok-2) with enhanced context length.",
    "mistralai/ministral-8b": "Ministral 8B is an 8B parameter model featuring a unique interleaved sliding-window attention pattern for faster, memory-efficient inference. Designed for edge use cases, it supports up to 128k context length and excels in knowledge and reasoning tasks. It outperforms peers in the sub-10B category, making it perfect for low-latency, privacy-first applications.",
    "mistralai/ministral-3b": "Ministral 3B is a 3B parameter model optimized for on-device and edge computing. It excels in knowledge, commonsense reasoning, and function-calling, outperforming larger models like Mistral 7B on most benchmarks. Supporting up to 128k context length, it\u2019s ideal for orchestrating agentic workflows and specialist tasks with efficient inference.",
    "qwen/qwen-2.5-7b-instruct": "Qwen2.5 7B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "nvidia/llama-3.1-nemotron-70b-instruct": "NVIDIA's Llama 3.1 Nemotron 70B is a language model designed for generating precise and useful responses. Leveraging [Llama 3.1 70B](/models/meta-llama/llama-3.1-70b-instruct) architecture and Reinforcement Learning from Human Feedback (RLHF), it excels in automatic alignment benchmarks. This model is tailored for applications requiring high accuracy in helpfulness and response generation, suitable for diverse user queries across multiple domains.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "inflection/inflection-3-pi": "Inflection 3 Pi powers Inflection's [Pi](https://pi.ai) chatbot, including backstory, emotional intelligence, productivity, and safety. It has access to recent news, and excels in scenarios like customer support and roleplay.\n\nPi has been trained to mirror your tone and style, if you use more emojis, so will Pi! Try experimenting with various prompts and conversation styles.",
    "inflection/inflection-3-productivity": "Inflection 3 Productivity is optimized for following instructions. It is better for tasks requiring JSON output or precise adherence to provided guidelines. It has access to recent news.\n\nFor emotional intelligence similar to Pi, see [Inflect 3 Pi](/inflection/inflection-3-pi)\n\nSee [Inflection's announcement](https://inflection.ai/blog/enterprise) for more details.",
    "google/gemini-flash-1.5-8b": "Gemini Flash 1.5 8B is optimized for speed and efficiency, offering enhanced performance in small prompt tasks like chat, transcription, and translation. With reduced latency, it is highly effective for real-time and large-scale operations. This model focuses on cost-effective solutions while maintaining high-quality results.\n\n[Click here to learn more about this model](https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).",
    "anthracite-org/magnum-v2-72b": "From the maker of [Goliath](https://openrouter.ai/models/alpindale/goliath-120b), Magnum 72B is the seventh in a family of models designed to achieve the prose quality of the Claude 3 models, notably Opus & Sonnet.\n\nThe model is based on [Qwen2 72B](https://openrouter.ai/models/qwen/qwen-2-72b-instruct) and trained with 55 million tokens of highly curated roleplay (RP) data.",
    "liquid/lfm-40b": "Liquid's 40.3B Mixture of Experts (MoE) model. Liquid Foundation Models (LFMs) are large neural networks built with computational units rooted in dynamic systems.\n\nLFMs are general-purpose AI models that can be used to model any kind of sequential data, including video, audio, text, time series, and signals.\n\nSee the [launch announcement](https://www.liquid.ai/liquid-foundation-models) for benchmarks and more info.",
    "thedrummer/rocinante-12b": "Rocinante 12B is designed for engaging storytelling and rich prose.\n\nEarly testers have reported:\n- Expanded vocabulary with unique and expressive word choices\n- Enhanced creativity for vivid narratives\n- Adventure-filled and captivating stories",
    "meta-llama/llama-3.2-3b-instruct:free": "Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.\n\nTrained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-3b-instruct": "Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.\n\nTrained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-1b-instruct:free": "Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.\n\nSupporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-1b-instruct": "Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.\n\nSupporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-90b-vision-instruct:free": "The Llama 90B Vision model is a top-tier, 90-billion-parameter multimodal model designed for the most challenging visual reasoning and language tasks. It offers unparalleled accuracy in image captioning, visual question answering, and advanced image-text comprehension. Pre-trained on vast multimodal datasets and fine-tuned with human feedback, the Llama 90B Vision is engineered to handle the most demanding image-based AI tasks.\n\nThis model is perfect for industries requiring cutting-edge multimodal AI capabilities, particularly those dealing with complex, real-time visual and textual analysis.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-90b-vision-instruct": "The Llama 90B Vision model is a top-tier, 90-billion-parameter multimodal model designed for the most challenging visual reasoning and language tasks. It offers unparalleled accuracy in image captioning, visual question answering, and advanced image-text comprehension. Pre-trained on vast multimodal datasets and fine-tuned with human feedback, the Llama 90B Vision is engineered to handle the most demanding image-based AI tasks.\n\nThis model is perfect for industries requiring cutting-edge multimodal AI capabilities, particularly those dealing with complex, real-time visual and textual analysis.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-11b-vision-instruct:free": "Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.\n\nIts ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-11b-vision-instruct": "Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.\n\nIts ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "qwen/qwen-2.5-72b-instruct": "Qwen2.5 72B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-2-vl-72b-instruct": "Qwen2 VL 72B is a multimodal LLM from the Qwen Team with the following key enhancements:\n\n- SoTA understanding of images of various resolution & ratio: Qwen2-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.\n\n- Understanding videos of 20min+: Qwen2-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.\n\n- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.\n\n- Multilingual Support: to serve global users, besides English and Chinese, Qwen2-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "neversleep/llama-3.1-lumimaid-8b": "Lumimaid v0.2 8B is a finetune of [Llama 3.1 8B](/models/meta-llama/llama-3.1-8b-instruct) with a \"HUGE step up dataset wise\" compared to Lumimaid v0.1. Sloppy chats output were purged.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "openai/o1-mini-2024-09-12": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "openai/o1-preview": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "openai/o1-preview-2024-09-12": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "openai/o1-mini": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "mistralai/pixtral-12b": "The first multi-modal, text+image-to-text model from Mistral AI. Its weights were launched via torrent: https://x.com/mistralai/status/1833758285167722836.",
    "cohere/command-r-08-2024": "command-r-08-2024 is an update of the [Command R](/models/cohere/command-r) with improved performance for multilingual retrieval-augmented generation (RAG) and tool use. More broadly, it is better at math, code and reasoning and is competitive with the previous version of the larger Command R+ model.\n\nRead the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "cohere/command-r-plus-08-2024": "command-r-plus-08-2024 is an update of the [Command R+](/models/cohere/command-r-plus) with roughly 50% higher throughput and 25% lower latencies as compared to the previous Command R+ version, while keeping the hardware footprint the same.\n\nRead the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "qwen/qwen-2-vl-7b-instruct": "Qwen2 VL 7B is a multimodal LLM from the Qwen Team with the following key enhancements:\n\n- SoTA understanding of images of various resolution & ratio: Qwen2-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.\n\n- Understanding videos of 20min+: Qwen2-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.\n\n- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.\n\n- Multilingual Support: to serve global users, besides English and Chinese, Qwen2-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "google/gemini-flash-1.5-exp": "Gemini 1.5 Flash Experimental is an experimental version of the [Gemini 1.5 Flash](/models/google/gemini-flash-1.5) model.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal\n\nNote: This model is experimental and not suited for production use-cases. It may be removed or redirected to another model in the future.",
    "sao10k/l3.1-euryale-70b": "Euryale L3.1 70B v2.2 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.1](/models/sao10k/l3-euryale-70b).",
    "google/gemini-flash-1.5-8b-exp": "Gemini Flash 1.5 8B Experimental is an experimental, 8B parameter version of the [Gemini Flash 1.5](/models/google/gemini-flash-1.5) model.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "ai21/jamba-1-5-large": "Jamba 1.5 Large is part of AI21's new family of open models, offering superior speed, efficiency, and quality.\n\nIt features a 256K effective context window, the longest among open models, enabling improved performance on tasks like document summarization and analysis.\n\nBuilt on a novel SSM-Transformer architecture, it outperforms larger models like Llama 3.1 70B on benchmarks while maintaining resource efficiency.\n\nRead their [announcement](https://www.ai21.com/blog/announcing-jamba-model-family) to learn more.",
    "ai21/jamba-1-5-mini": "Jamba 1.5 Mini is the world's first production-grade Mamba-based model, combining SSM and Transformer architectures for a 256K context window and high efficiency.\n\nIt works with 9 languages and can handle various writing and analysis tasks as well as or better than similar small models.\n\nThis model uses less computer memory and works faster with longer texts than previous designs.\n\nRead their [announcement](https://www.ai21.com/blog/announcing-jamba-model-family) to learn more.",
    "microsoft/phi-3.5-mini-128k-instruct": "Phi-3.5 models are lightweight, state-of-the-art open models. These models were trained with Phi-3 datasets that include both synthetic data and the filtered, publicly available websites data, with a focus on high quality and reasoning-dense properties. Phi-3.5 Mini uses 3.8B parameters, and is a dense decoder-only transformer model using the same tokenizer as [Phi-3 Mini](/models/microsoft/phi-3-mini-128k-instruct).\n\nThe models underwent a rigorous enhancement process, incorporating both supervised fine-tuning, proximal policy optimization, and direct preference optimization to ensure precise instruction adherence and robust safety measures. When assessed against benchmarks that test common sense, language understanding, math, code, long context and logical reasoning, Phi-3.5 models showcased robust and state-of-the-art performance among models with less than 13 billion parameters.",
    "nousresearch/hermes-3-llama-3.1-70b": "Hermes 3 is a generalist language model with many improvements over [Hermes 2](/models/nousresearch/nous-hermes-2-mistral-7b-dpo), including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.\n\nHermes 3 70B is a competitive, if not superior finetune of the [Llama-3.1 70B foundation model](/models/meta-llama/llama-3.1-70b-instruct), focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.\n\nThe Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.",
    "nousresearch/hermes-3-llama-3.1-405b": "Hermes 3 is a generalist language model with many improvements over Hermes 2, including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.\n\nHermes 3 405B is a frontier-level, full-parameter finetune of the Llama-3.1 405B foundation model, focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.\n\nThe Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.\n\nHermes 3 is competitive, if not superior, to Llama-3.1 Instruct models at general capabilities, with varying strengths and weaknesses attributable between the two.",
    "perplexity/llama-3.1-sonar-huge-128k-online": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance. The model is built upon the Llama 3.1 405B and has internet access.",
    "openai/chatgpt-4o-latest": "OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of [GPT-4o](/models/openai/gpt-4o) in that it has additional RLHF. It is intended for research and evaluation.\n\nOpenAI notes that this model is not suited for production use-cases as it may be removed or redirected to another model in the future.",
    "sao10k/l3-lunaris-8b": "Lunaris 8B is a versatile generalist and roleplaying model based on Llama 3. It's a strategic merge of multiple models, designed to balance creativity with improved logic and general knowledge.\n\nCreated by [Sao10k](https://huggingface.co/Sao10k), this model aims to offer an improved experience over Stheno v3.2, with enhanced creativity and logical reasoning.\n\nFor best results, use with Llama 3 Instruct context template, temperature 1.4, and min_p 0.1.",
    "aetherwiing/mn-starcannon-12b": "Starcannon 12B is a creative roleplay and story writing model, using [nothingiisreal/mn-celeste-12b](https://openrouter.ai/models/nothingiisreal/mn-celeste-12b) as a base and [intervitens/mini-magnum-12b-v1.1](https://huggingface.co/intervitens/mini-magnum-12b-v1.1) merged in using the [TIES](https://arxiv.org/abs/2306.01708) method.\n\nAlthough more similar to Magnum overall, the model remains very creative, with a pleasant writing style. It is recommended for people wanting more variety than Magnum, and yet more verbose prose than Celeste.",
    "openai/gpt-4o-2024-08-06": "The 2024-08-06 version of GPT-4o offers improved performance in structured outputs, with the ability to supply a JSON schema in the respone_format. Read more [here](https://openai.com/index/introducing-structured-outputs-in-the-api/).\n\nGPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)",
    "meta-llama/llama-3.1-405b": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This is the base 405B pre-trained version.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "nothingiisreal/mn-celeste-12b": "A specialized story writing and roleplaying model based on Mistral's NeMo 12B Instruct. Fine-tuned on curated datasets including Reddit Writing Prompts and Opus Instruct 25K.\n\nThis model excels at creative writing, offering improved NSFW capabilities, with smarter and more active narration. It demonstrates remarkable versatility in both SFW and NSFW scenarios, with strong Out of Character (OOC) steering capabilities, allowing fine-tuned control over narrative direction and character behavior.\n\nCheck out the model's [HuggingFace page](https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9) for details on what parameters and prompts work best!",
    "perplexity/llama-3.1-sonar-small-128k-chat": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3.1-sonar-small-128k-online) of this model has Internet access.",
    "google/gemini-pro-1.5-exp": "Gemini 1.5 Pro Experimental is a bleeding-edge version of the [Gemini 1.5 Pro](/models/google/gemini-pro-1.5) model. Because it's currently experimental, it will be **heavily rate-limited** by Google.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "perplexity/llama-3.1-sonar-large-128k-chat": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3.1-sonar-large-128k-online) of this model has Internet access.",
    "perplexity/llama-3.1-sonar-large-128k-online": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3.1-sonar-large-128k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "perplexity/llama-3.1-sonar-small-128k-online": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3.1-sonar-small-128k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "meta-llama/llama-3.1-405b-instruct:free": "The highly anticipated 400B class of Llama3 is here! Clocking in at 128k context with impressive eval scores, the Meta AI team continues to push the frontier of open-source LLMs.\n\nMeta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 405B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models including GPT-4o and Claude 3.5 Sonnet in evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-405b-instruct": "The highly anticipated 400B class of Llama3 is here! Clocking in at 128k context with impressive eval scores, the Meta AI team continues to push the frontier of open-source LLMs.\n\nMeta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 405B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models including GPT-4o and Claude 3.5 Sonnet in evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-405b-instruct:nitro": "The highly anticipated 400B class of Llama3 is here! Clocking in at 128k context with impressive eval scores, the Meta AI team continues to push the frontier of open-source LLMs.\n\nMeta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 405B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models including GPT-4o and Claude 3.5 Sonnet in evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-8b-instruct:free": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-8b-instruct": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-70b-instruct:free": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 70B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-70b-instruct": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 70B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-70b-instruct:nitro": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 70B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "mistralai/mistral-nemo": "A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.\n\nThe model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.\n\nIt supports function calling and is released under the Apache 2.0 license.",
    "mistralai/codestral-mamba": "A 7.3B parameter Mamba-based model designed for code and reasoning tasks.\n\n- Linear time inference, allowing for theoretically infinite sequence lengths\n- 256k token context window\n- Optimized for quick responses, especially beneficial for code productivity\n- Performs comparably to state-of-the-art transformer models in code and reasoning tasks\n- Available under the Apache 2.0 license for free use, modification, and distribution",
    "openai/gpt-4o-mini": "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
    "openai/gpt-4o-mini-2024-07-18": "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
    "qwen/qwen-2-7b-instruct:free": "Qwen2 7B is a transformer-based model that excels in language understanding, multilingual capabilities, coding, mathematics, and reasoning.\n\nIt features SwiGLU activation, attention QKV bias, and group query attention. It is pretrained on extensive data with supervised finetuning and direct preference optimization.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2/) and [GitHub repo](https://github.com/QwenLM/Qwen2).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-2-7b-instruct": "Qwen2 7B is a transformer-based model that excels in language understanding, multilingual capabilities, coding, mathematics, and reasoning.\n\nIt features SwiGLU activation, attention QKV bias, and group query attention. It is pretrained on extensive data with supervised finetuning and direct preference optimization.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2/) and [GitHub repo](https://github.com/QwenLM/Qwen2).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "google/gemma-2-27b-it": "Gemma 2 27B by Google is an open model built from the same research and technology used to create the [Gemini models](/models?q=gemini).\n\nGemma models are well-suited for a variety of text generation tasks, including question answering, summarization, and reasoning.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
    "alpindale/magnum-72b": "From the maker of [Goliath](https://openrouter.ai/models/alpindale/goliath-120b), Magnum 72B is the first in a new family of models designed to achieve the prose quality of the Claude 3 models, notably Opus & Sonnet.\n\nThe model is based on [Qwen2 72B](https://openrouter.ai/models/qwen/qwen-2-72b-instruct) and trained with 55 million tokens of highly curated roleplay (RP) data.",
    "google/gemma-2-9b-it:free": "Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.\n\nDesigned for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
    "google/gemma-2-9b-it": "Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.\n\nDesigned for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
    "01-ai/yi-large": "The Yi Large model was designed by 01.AI with the following usecases in mind: knowledge search, data classification, human-like chat bots, and customer service.\n\nIt stands out for its multilingual proficiency, particularly in Spanish, Chinese, Japanese, German, and French.\n\nCheck out the [launch announcement](https://01-ai.github.io/blog/01.ai-yi-large-llm-launch) to learn more.",
    "ai21/jamba-instruct": "The Jamba-Instruct model, introduced by AI21 Labs, is an instruction-tuned variant of their hybrid SSM-Transformer Jamba model, specifically optimized for enterprise applications.\n\n- 256K Context Window: It can process extensive information, equivalent to a 400-page novel, which is beneficial for tasks involving large documents such as financial reports or legal documents\n- Safety and Accuracy: Jamba-Instruct is designed with enhanced safety features to ensure secure deployment in enterprise environments, reducing the risk and cost of implementation\n\nRead their [announcement](https://www.ai21.com/blog/announcing-jamba) to learn more.\n\nJamba has a knowledge cutoff of February 2024.",
    "anthropic/claude-3.5-sonnet-20240620:beta": "Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\nFor the latest version (2024-10-23), check out [Claude 3.5 Sonnet](/anthropic/claude-3.5-sonnet).\n\n#multimodal",
    "anthropic/claude-3.5-sonnet-20240620": "Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\nFor the latest version (2024-10-23), check out [Claude 3.5 Sonnet](/anthropic/claude-3.5-sonnet).\n\n#multimodal",
    "sao10k/l3-euryale-70b": "Euryale 70B v2.1 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k).\n\n- Better prompt adherence.\n- Better anatomy / spatial awareness.\n- Adapts much better to unique and custom formatting / reply formats.\n- Very creative, lots of unique swipes.\n- Is not restrictive during roleplays.",
    "cognitivecomputations/dolphin-mixtral-8x22b": "Dolphin 2.9 is designed for instruction following, conversational, and coding. This model is a finetune of [Mixtral 8x22B Instruct](/models/mistralai/mixtral-8x22b-instruct). It features a 64k context length and was fine-tuned with a 16k sequence length using ChatML templates.\n\nThis model is a successor to [Dolphin Mixtral 8x7B](/models/cognitivecomputations/dolphin-mixtral-8x7b).\n\nThe model is uncensored and is stripped of alignment and bias. It requires an external alignment layer for ethical use. Users are cautioned to use this highly compliant model responsibly, as detailed in a blog post about uncensored models at [erichartford.com/uncensored-models](https://erichartford.com/uncensored-models).\n\n#moe #uncensored",
    "qwen/qwen-2-72b-instruct": "Qwen2 72B is a transformer-based model that excels in language understanding, multilingual capabilities, coding, mathematics, and reasoning.\n\nIt features SwiGLU activation, attention QKV bias, and group query attention. It is pretrained on extensive data with supervised finetuning and direct preference optimization.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2/) and [GitHub repo](https://github.com/QwenLM/Qwen2).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "mistralai/mistral-7b-instruct:free": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
    "mistralai/mistral-7b-instruct": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
    "mistralai/mistral-7b-instruct:nitro": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
    "mistralai/mistral-7b-instruct-v0.3": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nAn improved version of [Mistral 7B Instruct v0.2](/models/mistralai/mistral-7b-instruct-v0.2), with the following changes:\n\n- Extended vocabulary to 32768\n- Supports v3 Tokenizer\n- Supports function calling\n\nNOTE: Support for function calling depends on the provider.",
    "nousresearch/hermes-2-pro-llama-3-8b": "Hermes 2 Pro is an upgraded, retrained version of Nous Hermes 2, consisting of an updated and cleaned version of the OpenHermes 2.5 Dataset, as well as a newly introduced Function Calling and JSON Mode dataset developed in-house.",
    "microsoft/phi-3-mini-128k-instruct:free": "Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.",
    "microsoft/phi-3-mini-128k-instruct": "Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.",
    "microsoft/phi-3-medium-128k-instruct:free": "Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).",
    "microsoft/phi-3-medium-128k-instruct": "Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).",
    "neversleep/llama-3-lumimaid-70b": "The NeverSleep team is back, with a Llama 3 70B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "google/gemini-flash-1.5": "Gemini 1.5 Flash is a foundation model that performs well at a variety of multimodal tasks such as visual understanding, classification, summarization, and creating content from image, audio and video. It's adept at processing visual and text inputs such as photographs, documents, infographics, and screenshots.\n\nGemini 1.5 Flash is designed for high-volume, high-frequency tasks where cost and latency matter. On most common tasks, Flash achieves comparable quality to other Gemini Pro models at a significantly reduced cost. Flash is well-suited for applications like chat assistants and on-demand content generation where speed and scale matter.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "perplexity/llama-3-sonar-large-32k-online": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3-sonar-large-32k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "deepseek/deepseek-chat": "DeepSeek-V2.5 is an upgraded version that combines DeepSeek-V2-Chat and DeepSeek-Coder-V2-Instruct. The new model integrates the general and coding abilities of the two previous versions. For model details, please visit [DeepSeek-V2 page](https://github.com/deepseek-ai/DeepSeek-V2) for more information.",
    "perplexity/llama-3-sonar-small-32k-chat": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3-sonar-small-32k-online) of this model has Internet access.",
    "perplexity/llama-3-sonar-large-32k-chat": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3-sonar-large-32k-online) of this model has Internet access.",
    "openai/gpt-4o-2024-05-13": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "meta-llama/llama-guard-2-8b": "This safeguard model has 8B parameters and is based on the Llama 3 family. Just like is predecessor, [LlamaGuard 1](https://huggingface.co/meta-llama/LlamaGuard-7b), it can do both prompt and response classification.\n\nLlamaGuard 2 acts as a normal LLM would, generating text that indicates whether the given input/output is safe/unsafe. If deemed unsafe, it will also share the content categories violated.\n\nFor best results, please use raw prompt input or the `/completions` endpoint, instead of the chat API.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "openai/gpt-4o": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "openai/gpt-4o:extended": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "neversleep/llama-3-lumimaid-8b:extended": "The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "neversleep/llama-3-lumimaid-8b": "The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-8b-instruct:free": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-8b-instruct": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-8b-instruct:extended": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-8b-instruct:nitro": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-70b-instruct": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-70b-instruct:nitro": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "mistralai/mixtral-8x22b-instruct": "Mistral's official instruct fine-tuned version of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b). It uses 39B active parameters out of 141B, offering unparalleled cost efficiency for its size. Its strengths include:\n- strong math, coding, and reasoning\n- large context length (64k)\n- fluency in English, French, Italian, German, and Spanish\n\nSee benchmarks on the launch announcement [here](https://mistral.ai/news/mixtral-8x22b/).\n#moe",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B is Microsoft AI's most advanced Wizard model. It demonstrates highly competitive performance compared to leading proprietary models, and it consistently outperforms all existing state-of-the-art opensource models.\n\nIt is an instruct finetune of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b).\n\nTo read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).\n\n#moe",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B is the smaller variant of Microsoft AI's latest Wizard model. It is the fastest and achieves comparable performance with existing 10x larger opensource leading models\n\nIt is a finetune of [Mistral 7B Instruct](/models/mistralai/mistral-7b-instruct), using the same technique as [WizardLM-2 8x22B](/models/microsoft/wizardlm-2-8x22b).\n\nTo read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).\n\n#moe",
    "google/gemini-pro-1.5": "Google's latest multimodal model, supports image and video[0] in text or chat prompts.\n\nOptimized for language tasks including:\n\n- Code generation\n- Text generation\n- Text editing\n- Problem solving\n- Recommendations\n- Information extraction\n- Data extraction or generation\n- AI agents\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n* [0]: Video input is not available through OpenRouter at this time.",
    "openai/gpt-4-turbo": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to December 2023.",
    "cohere/command-r-plus": "Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).\n\nIt offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "cohere/command-r-plus-04-2024": "Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).\n\nIt offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "databricks/dbrx-instruct": "DBRX is a new open source large language model developed by Databricks. At 132B, it outperforms existing open source LLMs like Llama 2 70B and [Mixtral-8x7b](/models/mistralai/mixtral-8x7b) on standard industry benchmarks for language understanding, programming, math, and logic.\n\nIt uses a fine-grained mixture-of-experts (MoE) architecture. 36B parameters are active on any input. It was pre-trained on 12T tokens of text and code data. Compared to other open MoE models like Mixtral-8x7B and Grok-1, DBRX is fine-grained, meaning it uses a larger number of smaller experts.\n\nSee the launch announcement and benchmark results [here](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm).\n\n#moe",
    "sophosympatheia/midnight-rose-70b": "A merge with a complex family tree, this model was crafted for roleplaying and storytelling. Midnight Rose is a successor to Rogue Rose and Aurora Nights and improves upon them both. It wants to produce lengthy output by default and is the best creative writing merge produced so far by sophosympatheia.\n\nDescending from earlier versions of Midnight Rose and [Wizard Tulu Dolphin 70B](https://huggingface.co/sophosympatheia/Wizard-Tulu-Dolphin-70B-v1.0), it inherits the best qualities of each.",
    "cohere/command": "Command is an instruction-following conversational model that performs language tasks with high quality, more reliably and with a longer context than our base generative models.\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "cohere/command-r": "Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.\n\nRead the launch post [here](https://txt.cohere.com/command-r/).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "anthropic/claude-3-haiku:beta": "Claude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
    "anthropic/claude-3-haiku": "Claude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
    "anthropic/claude-3-opus:beta": "Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-opus": "Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-sonnet:beta": "Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-sonnet": "Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "cohere/command-r-03-2024": "Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.\n\nRead the launch post [here](https://txt.cohere.com/command-r/).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "mistralai/mistral-large": "This is Mistral AI's flagship model, Mistral Large 2 (version `mistral-large-2407`). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).\n\nIt supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.",
    "openai/gpt-3.5-turbo-0613": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
    "openai/gpt-4-turbo-preview": "The preview GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Dec 2023.\n\n**Note:** heavily rate limited by OpenAI while in preview.",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous Hermes 2 Mixtral 8x7B DPO is the new flagship Nous Research model trained over the [Mixtral 8x7B MoE LLM](/models/mistralai/mixtral-8x7b).\n\nThe model was trained on over 1,000,000 entries of primarily [GPT-4](/models/openai/gpt-4) generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.\n\n#moe",
    "mistralai/mistral-small": "With 22 billion parameters, Mistral Small v24.09 offers a convenient mid-point between (Mistral NeMo 12B)[/mistralai/mistral-nemo] and (Mistral Large 2)[/mistralai/mistral-large], providing a cost-effective solution that can be deployed across various platforms and environments. It has better reasoning, exhibits more capabilities, can produce and reason about code, and is multiligual, supporting English, French, German, Italian, and Spanish.",
    "mistralai/mistral-tiny": "This model is currently powered by Mistral-7B-v0.2, and incorporates a \"better\" fine-tuning than [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1), inspired by community work. It's best used for large batch processing tasks where cost is a significant factor but reasoning capabilities are not crucial.",
    "mistralai/mistral-medium": "This is Mistral AI's closed-source, medium-sided model. It's powered by a closed-source prototype and excels at reasoning, code, JSON, chat, and more. In benchmarks, it compares with many of the flagship models of other companies.",
    "mistralai/mistral-7b-instruct-v0.2": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nAn improved version of [Mistral 7B Instruct](/modelsmistralai/mistral-7b-instruct-v0.1), with the following changes:\n\n- 32k context window (vs 8k context in v0.1)\n- Rope-theta = 1e6\n- No Sliding-Window Attention",
    "cognitivecomputations/dolphin-mixtral-8x7b": "This is a 16k context fine-tune of [Mixtral-8x7b](/models/mistralai/mixtral-8x7b). It excels in coding tasks due to extensive training with coding data and is known for its obedience, although it lacks DPO tuning.\n\nThe model is uncensored and is stripped of alignment and bias. It requires an external alignment layer for ethical use. Users are cautioned to use this highly compliant model responsibly, as detailed in a blog post about uncensored models at [erichartford.com/uncensored-models](https://erichartford.com/uncensored-models).\n\n#moe #uncensored",
    "google/gemini-pro-vision": "Google's flagship multimodal model, supporting image and video in text or chat prompts for a text or code response.\n\nSee the benchmarks and prompting guidelines from [Deepmind](https://deepmind.google/technologies/gemini/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "google/gemini-pro": "Google's flagship text generation model. Designed to handle natural language tasks, multiturn text and code chat, and code generation.\n\nSee the benchmarks and prompting guidelines from [Deepmind](https://deepmind.google/technologies/gemini/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).",
    "mistralai/mixtral-8x7b": "A pretrained generative Sparse Mixture of Experts, by Mistral AI. Incorporates 8 experts (feed-forward networks) for a total of 47B parameters. Base model (not fine-tuned for instructions) - see [Mixtral 8x7B Instruct](/models/mistralai/mixtral-8x7b-instruct) for an instruct-tuned model.\n\n#moe",
    "mistralai/mixtral-8x7b-instruct": "A pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.\n\nInstruct model fine-tuned by Mistral. #moe",
    "mistralai/mixtral-8x7b-instruct:nitro": "A pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.\n\nInstruct model fine-tuned by Mistral. #moe",
    "openchat/openchat-7b:free": "OpenChat 7B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source",
    "openchat/openchat-7b": "OpenChat 7B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source",
    "neversleep/noromaid-20b": "A collab between IkariDev and Undi. This merge is suitable for RP, ERP, and general knowledge.\n\n#merge #uncensored",
    "anthropic/claude-2:beta": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2.1:beta": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2.1": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "teknium/openhermes-2.5-mistral-7b": "A continuation of [OpenHermes 2 model](/models/teknium/openhermes-2-mistral-7b), trained on additional code datasets.\nPotentially the most interesting finding from training on a good ratio (est. of around 7-14% of the total dataset) of code instruction was that it has boosted several non-code benchmarks, including TruthfulQA, AGIEval, and GPT4All suite. It did however reduce BigBench benchmark score, but the net gain overall is significant.",
    "openai/gpt-4-vision-preview": "Ability to understand images, in addition to all other [GPT-4 Turbo capabilties](/models/openai/gpt-4-turbo). Training data: up to Apr 2023.\n\n**Note:** heavily rate limited by OpenAI while in preview.\n\n#multimodal",
    "lizpreciatior/lzlv-70b-fp16-hf": "A Mythomax/MLewd_13B-style merge of selected 70B models.\nA multi-model merge of several LLaMA2 70B finetunes for roleplaying and creative work. The goal was to create a model that combines creativity with intelligence for an enhanced experience.\n\n#merge #uncensored",
    "undi95/toppy-m-7b:free": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored",
    "undi95/toppy-m-7b:nitro": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored",
    "undi95/toppy-m-7b": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored",
    "alpindale/goliath-120b": "A large LLM created by combining two fine-tuned Llama 70B models into one 120B model. Combines Xwin and Euryale.\n\nCredits to\n- [@chargoddard](https://huggingface.co/chargoddard) for developing the framework used to merge the model - [mergekit](https://github.com/cg123/mergekit).\n- [@Undi95](https://huggingface.co/Undi95) for helping with the merge ratios.\n\n#merge",
    "openrouter/auto": "Depending on their size, subject, and complexity, your prompts will be sent to [Llama 3 70B Instruct](/models/meta-llama/llama-3-70b-instruct), [Claude 3.5 Sonnet (self-moderated)](/models/anthropic/claude-3.5-sonnet:beta) or [GPT-4o](/models/openai/gpt-4o).  To see which model was used, visit [Activity](/activity).\n\nA major redesign of this router is coming soon. Stay tuned on [Discord](https://discord.gg/fVyRaUDgxW) for updates.",
    "openai/gpt-3.5-turbo-1106": "An older GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.",
    "openai/gpt-4-1106-preview": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to April 2023.",
    "google/palm-2-chat-bison-32k": "PaLM 2 is a language model by Google with improved multilingual, reasoning and coding capabilities.",
    "google/palm-2-codechat-bison-32k": "PaLM 2 fine-tuned for chatbot conversations that help with code-related questions.",
    "jondurbin/airoboros-l2-70b": "A Llama 2 70B fine-tune using synthetic data (the Airoboros dataset).\n\nCurrently based on [jondurbin/airoboros-l2-70b](https://huggingface.co/jondurbin/airoboros-l2-70b-2.2.1), but might get updated in the future.",
    "xwin-lm/xwin-lm-70b": "Xwin-LM aims to develop and open-source alignment tech for LLMs. Our first release, built-upon on the [Llama2](/models/${Model.Llama_2_13B_Chat}) base models, ranked TOP-1 on AlpacaEval. Notably, it's the first to surpass [GPT-4](/models/${Model.GPT_4}) on this benchmark. The project will be continuously updated.",
    "openai/gpt-3.5-turbo-instruct": "This model is a variant of GPT-3.5 Turbo tuned for instructional prompts and omitting chat-related optimizations. Training data: up to Sep 2021.",
    "mistralai/mistral-7b-instruct-v0.1": "A 7.3B parameter model that outperforms Llama 2 13B on all benchmarks, with optimizations for speed and context length.",
    "pygmalionai/mythalion-13b": "A blend of the new Pygmalion-13b and MythoMax. #merge",
    "openai/gpt-3.5-turbo-16k": "This model offers four times the context length of gpt-3.5-turbo, allowing it to support approximately 20 pages of text in a single request at a higher cost. Training data: up to Sep 2021.",
    "openai/gpt-4-32k": "GPT-4-32k is an extended version of GPT-4, with the same capabilities but quadrupled context length, allowing for processing up to 40 pages of text in a single pass. This is particularly beneficial for handling longer content like interacting with PDFs without an external vector database. Training data: up to Sep 2021.",
    "openai/gpt-4-32k-0314": "GPT-4-32k is an extended version of GPT-4, with the same capabilities but quadrupled context length, allowing for processing up to 40 pages of text in a single pass. This is particularly beneficial for handling longer content like interacting with PDFs without an external vector database. Training data: up to Sep 2021.",
    "nousresearch/nous-hermes-llama2-13b": "A state-of-the-art language model fine-tuned on over 300k instructions by Nous Research, with Teknium and Emozilla leading the fine tuning process.",
    "mancer/weaver": "An attempt to recreate Claude-style verbosity, but don't expect the same level of coherence or memory. Meant for use in roleplay/narrative situations.",
    "huggingfaceh4/zephyr-7b-beta:free": "Zephyr is a series of language models that are trained to act as helpful assistants. Zephyr-7B-\u03b2 is the second model in the series, and is a fine-tuned version of [mistralai/Mistral-7B-v0.1](/models/mistralai/mistral-7b-instruct-v0.1) that was trained on a mix of publicly available, synthetic datasets using Direct Preference Optimization (DPO).",
    "anthropic/claude-2.0:beta": "Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.",
    "anthropic/claude-2.0": "Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.",
    "undi95/remm-slerp-l2-13b": "A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge",
    "undi95/remm-slerp-l2-13b:extended": "A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge",
    "google/palm-2-chat-bison": "PaLM 2 is a language model by Google with improved multilingual, reasoning and coding capabilities.",
    "google/palm-2-codechat-bison": "PaLM 2 fine-tuned for chatbot conversations that help with code-related questions.",
    "gryphe/mythomax-l2-13b:free": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "gryphe/mythomax-l2-13b": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "gryphe/mythomax-l2-13b:nitro": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "gryphe/mythomax-l2-13b:extended": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "meta-llama/llama-2-13b-chat": "A 13 billion parameter language model from Meta, fine tuned for chat completions",
    "openai/gpt-3.5-turbo": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
    "openai/gpt-3.5-turbo-0125": "The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.\n\nThis version has a higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls.",
    "openai/gpt-4": "OpenAI's flagship model, GPT-4 is a large-scale multimodal language model capable of solving difficult problems with greater accuracy than previous models due to its broader general knowledge and advanced reasoning capabilities. Training data: up to Sep 2021.",
    "openai/gpt-4-0314": "GPT-4-0314 is the first version of GPT-4 released, with a context length of 8,192 tokens, and was supported until June 14. Training data: up to Sep 2021."
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
  
// Toggle dropdown on clicking the custom-select div
document.querySelector('.custom-select').addEventListener('click', toggleDropdown);

    // Function to hide the custom tooltip
    function hideCustomTooltip() {
      let tooltip = document.getElementById("custom-tooltip");
      tooltip.style.display = 'none';
    }
    
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
document.getElementById('model-gpt-4o').addEventListener('click', () => selectModel('gpt-4o'));
document.getElementById('model-gpt-4-32k').addEventListener('click', () => selectModel('gpt-4-32k'));
document.getElementById('model-gpt-4-turbo').addEventListener('click', () => selectModel('gpt-4-turbo'));
document.getElementById('model-gpt-3.5').addEventListener('click', () => selectModel('gpt-3.5-turbo-0125'));
document.getElementById('model-gpt-4o-mini').addEventListener('click', () => selectModel('gpt-4o-mini'));
document.getElementById('model-gpt-o1-preview').addEventListener('click', () => selectModel('o1-preview'));
document.getElementById('model-gpt-o1-mini').addEventListener('click', () => selectModel('o1-mini'));


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

document.getElementById('model-claude-3.5-sonnet').addEventListener('click', () => selectModel('claude-3-5-sonnet-latest'));
document.getElementById('model-claude-3.5-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-5-sonnet-latest"], event.currentTarget));
document.getElementById('model-claude-3.5-haiku').addEventListener('click', () => selectModel('claude-3-5-haiku-latest'));
document.getElementById('model-claude-3.5-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-5-haiku-latest"], event.currentTarget));


// select open router models lol

// Event listeners for additional models
document.getElementById('open-router-model-eva-unit-01-eva-llama-3.33-70b').addEventListener('click', () => selectModel('eva-unit-01/eva-llama-3.33-70b'));
document.getElementById('open-router-model-x-ai-grok-2-vision-1212').addEventListener('click', () => selectModel('x-ai/grok-2-vision-1212'));
document.getElementById('open-router-model-x-ai-grok-2-1212').addEventListener('click', () => selectModel('x-ai/grok-2-1212'));
document.getElementById('open-router-model-cohere-command-r7b-12-2024').addEventListener('click', () => selectModel('cohere/command-r7b-12-2024'));
document.getElementById('open-router-model-google-gemini-2.0-flash-exp-free').addEventListener('click', () => selectModel('google/gemini-2.0-flash-exp:free'));
document.getElementById('open-router-model-google-gemini-exp-1206-free').addEventListener('click', () => selectModel('google/gemini-exp-1206:free'));
document.getElementById('open-router-model-meta-llama-llama-3.3-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.3-70b-instruct'));
document.getElementById('open-router-model-amazon-nova-lite-v1').addEventListener('click', () => selectModel('amazon/nova-lite-v1'));
document.getElementById('open-router-model-amazon-nova-micro-v1').addEventListener('click', () => selectModel('amazon/nova-micro-v1'));
document.getElementById('open-router-model-amazon-nova-pro-v1').addEventListener('click', () => selectModel('amazon/nova-pro-v1'));
document.getElementById('open-router-model-qwen-qwq-32b-preview').addEventListener('click', () => selectModel('qwen/qwq-32b-preview'));
document.getElementById('open-router-model-google-gemini-exp-1121-free').addEventListener('click', () => selectModel('google/gemini-exp-1121:free'));
document.getElementById('open-router-model-google-learnlm-1.5-pro-experimental-free').addEventListener('click', () => selectModel('google/learnlm-1.5-pro-experimental:free'));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-72b').addEventListener('click', () => selectModel('eva-unit-01/eva-qwen-2.5-72b'));
document.getElementById('open-router-model-openai-gpt-4o-2024-11-20').addEventListener('click', () => selectModel('openai/gpt-4o-2024-11-20'));
document.getElementById('open-router-model-mistralai-mistral-large-2411').addEventListener('click', () => selectModel('mistralai/mistral-large-2411'));
document.getElementById('open-router-model-mistralai-mistral-large-2407').addEventListener('click', () => selectModel('mistralai/mistral-large-2407'));
document.getElementById('open-router-model-mistralai-pixtral-large-2411').addEventListener('click', () => selectModel('mistralai/pixtral-large-2411'));
document.getElementById('open-router-model-x-ai-grok-vision-beta').addEventListener('click', () => selectModel('x-ai/grok-vision-beta'));
document.getElementById('open-router-model-google-gemini-exp-1114-free').addEventListener('click', () => selectModel('google/gemini-exp-1114:free'));
document.getElementById('open-router-model-infermatic-mn-inferor-12b').addEventListener('click', () => selectModel('infermatic/mn-inferor-12b'));
document.getElementById('open-router-model-qwen-qwen-2.5-coder-32b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2.5-coder-32b-instruct'));
document.getElementById('open-router-model-raifle-sorcererlm-8x22b').addEventListener('click', () => selectModel('raifle/sorcererlm-8x22b'));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-32b').addEventListener('click', () => selectModel('eva-unit-01/eva-qwen-2.5-32b'));
document.getElementById('open-router-model-thedrummer-unslopnemo-12b').addEventListener('click', () => selectModel('thedrummer/unslopnemo-12b'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku-20241022:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku-20241022'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku'));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-70b').addEventListener('click', () => selectModel('neversleep/llama-3.1-lumimaid-70b'));
document.getElementById('open-router-model-anthracite-org-magnum-v4-72b').addEventListener('click', () => selectModel('anthracite-org/magnum-v4-72b'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet'));
document.getElementById('open-router-model-x-ai-grok-beta').addEventListener('click', () => selectModel('x-ai/grok-beta'));
document.getElementById('open-router-model-mistralai-ministral-8b').addEventListener('click', () => selectModel('mistralai/ministral-8b'));
document.getElementById('open-router-model-mistralai-ministral-3b').addEventListener('click', () => selectModel('mistralai/ministral-3b'));
document.getElementById('open-router-model-qwen-qwen-2.5-7b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2.5-7b-instruct'));
document.getElementById('open-router-model-nvidia-llama-3.1-nemotron-70b-instruct').addEventListener('click', () => selectModel('nvidia/llama-3.1-nemotron-70b-instruct'));
document.getElementById('open-router-model-inflection-inflection-3-pi').addEventListener('click', () => selectModel('inflection/inflection-3-pi'));
document.getElementById('open-router-model-inflection-inflection-3-productivity').addEventListener('click', () => selectModel('inflection/inflection-3-productivity'));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b').addEventListener('click', () => selectModel('google/gemini-flash-1.5-8b'));
document.getElementById('open-router-model-anthracite-org-magnum-v2-72b').addEventListener('click', () => selectModel('anthracite-org/magnum-v2-72b'));
document.getElementById('open-router-model-liquid-lfm-40b').addEventListener('click', () => selectModel('liquid/lfm-40b'));
document.getElementById('open-router-model-thedrummer-rocinante-12b').addEventListener('click', () => selectModel('thedrummer/rocinante-12b'));
document.getElementById('open-router-model-meta-llama-llama-3.2-3b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.2-3b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.2-3b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-3b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.2-1b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-1b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.2-90b-vision-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.2-90b-vision-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.2-90b-vision-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-90b-vision-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.2-11b-vision-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-11b-vision-instruct'));
document.getElementById('open-router-model-qwen-qwen-2.5-72b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2.5-72b-instruct'));
document.getElementById('open-router-model-qwen-qwen-2-vl-72b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-vl-72b-instruct'));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-8b').addEventListener('click', () => selectModel('neversleep/llama-3.1-lumimaid-8b'));
document.getElementById('open-router-model-openai-o1-mini-2024-09-12').addEventListener('click', () => selectModel('openai/o1-mini-2024-09-12'));
document.getElementById('open-router-model-openai-o1-preview').addEventListener('click', () => selectModel('openai/o1-preview'));
document.getElementById('open-router-model-openai-o1-preview-2024-09-12').addEventListener('click', () => selectModel('openai/o1-preview-2024-09-12'));
document.getElementById('open-router-model-openai-o1-mini').addEventListener('click', () => selectModel('openai/o1-mini'));
document.getElementById('open-router-model-mistralai-pixtral-12b').addEventListener('click', () => selectModel('mistralai/pixtral-12b'));
document.getElementById('open-router-model-cohere-command-r-08-2024').addEventListener('click', () => selectModel('cohere/command-r-08-2024'));
document.getElementById('open-router-model-cohere-command-r-plus-08-2024').addEventListener('click', () => selectModel('cohere/command-r-plus-08-2024'));
document.getElementById('open-router-model-qwen-qwen-2-vl-7b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-vl-7b-instruct'));
document.getElementById('open-router-model-google-gemini-flash-1.5-exp').addEventListener('click', () => selectModel('google/gemini-flash-1.5-exp'));
document.getElementById('open-router-model-sao10k-l3.1-euryale-70b').addEventListener('click', () => selectModel('sao10k/l3.1-euryale-70b'));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b-exp').addEventListener('click', () => selectModel('google/gemini-flash-1.5-8b-exp'));
document.getElementById('open-router-model-ai21-jamba-1-5-large').addEventListener('click', () => selectModel('ai21/jamba-1-5-large'));
document.getElementById('open-router-model-ai21-jamba-1-5-mini').addEventListener('click', () => selectModel('ai21/jamba-1-5-mini'));
document.getElementById('open-router-model-microsoft-phi-3.5-mini-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3.5-mini-128k-instruct'));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-70b').addEventListener('click', () => selectModel('nousresearch/hermes-3-llama-3.1-70b'));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-405b').addEventListener('click', () => selectModel('nousresearch/hermes-3-llama-3.1-405b'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-huge-128k-online').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-huge-128k-online'));
document.getElementById('open-router-model-openai-chatgpt-4o-latest').addEventListener('click', () => selectModel('openai/chatgpt-4o-latest'));
document.getElementById('open-router-model-sao10k-l3-lunaris-8b').addEventListener('click', () => selectModel('sao10k/l3-lunaris-8b'));
document.getElementById('open-router-model-aetherwiing-mn-starcannon-12b').addEventListener('click', () => selectModel('aetherwiing/mn-starcannon-12b'));
document.getElementById('open-router-model-openai-gpt-4o-2024-08-06').addEventListener('click', () => selectModel('openai/gpt-4o-2024-08-06'));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b').addEventListener('click', () => selectModel('meta-llama/llama-3.1-405b'));
document.getElementById('open-router-model-nothingiisreal-mn-celeste-12b').addEventListener('click', () => selectModel('nothingiisreal/mn-celeste-12b'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-chat').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-small-128k-chat'));
document.getElementById('open-router-model-google-gemini-pro-1.5-exp').addEventListener('click', () => selectModel('google/gemini-pro-1.5-exp'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-chat').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-large-128k-chat'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-online').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-large-128k-online'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-online').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-small-128k-online'));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.1-405b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.1-405b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3.1-405b-instruct:nitro'));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.1-8b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.1-8b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.1-70b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.1-70b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3.1-70b-instruct:nitro'));
document.getElementById('open-router-model-mistralai-mistral-nemo').addEventListener('click', () => selectModel('mistralai/mistral-nemo'));
document.getElementById('open-router-model-mistralai-codestral-mamba').addEventListener('click', () => selectModel('mistralai/codestral-mamba'));
document.getElementById('open-router-model-openai-gpt-4o-mini').addEventListener('click', () => selectModel('openai/gpt-4o-mini'));
document.getElementById('open-router-model-openai-gpt-4o-mini-2024-07-18').addEventListener('click', () => selectModel('openai/gpt-4o-mini-2024-07-18'));
document.getElementById('open-router-model-qwen-qwen-2-7b-instruct-free').addEventListener('click', () => selectModel('qwen/qwen-2-7b-instruct:free'));
document.getElementById('open-router-model-qwen-qwen-2-7b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-7b-instruct'));
document.getElementById('open-router-model-google-gemma-2-27b-it').addEventListener('click', () => selectModel('google/gemma-2-27b-it'));
document.getElementById('open-router-model-alpindale-magnum-72b').addEventListener('click', () => selectModel('alpindale/magnum-72b'));
document.getElementById('open-router-model-google-gemma-2-9b-it-free').addEventListener('click', () => selectModel('google/gemma-2-9b-it:free'));
document.getElementById('open-router-model-google-gemma-2-9b-it').addEventListener('click', () => selectModel('google/gemma-2-9b-it'));
document.getElementById('open-router-model-01-ai-yi-large').addEventListener('click', () => selectModel('01-ai/yi-large'));
document.getElementById('open-router-model-ai21-jamba-instruct').addEventListener('click', () => selectModel('ai21/jamba-instruct'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-20240620-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet-20240620:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-20240620').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet-20240620'));
document.getElementById('open-router-model-sao10k-l3-euryale-70b').addEventListener('click', () => selectModel('sao10k/l3-euryale-70b'));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x22b').addEventListener('click', () => selectModel('cognitivecomputations/dolphin-mixtral-8x22b'));
document.getElementById('open-router-model-qwen-qwen-2-72b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-72b-instruct'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-free').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:free'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-nitro').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:nitro'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.3').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.3'));
document.getElementById('open-router-model-nousresearch-hermes-2-pro-llama-3-8b').addEventListener('click', () => selectModel('nousresearch/hermes-2-pro-llama-3-8b'));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct-free').addEventListener('click', () => selectModel('microsoft/phi-3-mini-128k-instruct:free'));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-mini-128k-instruct'));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct-free').addEventListener('click', () => selectModel('microsoft/phi-3-medium-128k-instruct:free'));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-medium-128k-instruct'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-70b').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-70b'));
document.getElementById('open-router-model-google-gemini-flash-1.5').addEventListener('click', () => selectModel('google/gemini-flash-1.5'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-online').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-large-32k-online'));
document.getElementById('open-router-model-deepseek-deepseek-chat').addEventListener('click', () => selectModel('deepseek/deepseek-chat'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-small-32k-chat').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-small-32k-chat'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-chat').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-large-32k-chat'));
document.getElementById('open-router-model-openai-gpt-4o-2024-05-13').addEventListener('click', () => selectModel('openai/gpt-4o-2024-05-13'));
document.getElementById('open-router-model-meta-llama-llama-guard-2-8b').addEventListener('click', () => selectModel('meta-llama/llama-guard-2-8b'));
document.getElementById('open-router-model-openai-gpt-4o').addEventListener('click', () => selectModel('openai/gpt-4o'));
document.getElementById('open-router-model-openai-gpt-4o-extended').addEventListener('click', () => selectModel('openai/gpt-4o:extended'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b-extended').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-8b:extended'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-8b'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-extended').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:extended'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:nitro'));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct:nitro'));
document.getElementById('open-router-model-mistralai-mixtral-8x22b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x22b-instruct'));
document.getElementById('open-router-model-microsoft-wizardlm-2-8x22b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-8x22b'));
document.getElementById('open-router-model-microsoft-wizardlm-2-7b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-7b'));
document.getElementById('open-router-model-google-gemini-pro-1.5').addEventListener('click', () => selectModel('google/gemini-pro-1.5'));
document.getElementById('open-router-model-openai-gpt-4-turbo').addEventListener('click', () => selectModel('openai/gpt-4-turbo'));
document.getElementById('open-router-model-cohere-command-r-plus').addEventListener('click', () => selectModel('cohere/command-r-plus'));
document.getElementById('open-router-model-cohere-command-r-plus-04-2024').addEventListener('click', () => selectModel('cohere/command-r-plus-04-2024'));
document.getElementById('open-router-model-databricks-dbrx-instruct').addEventListener('click', () => selectModel('databricks/dbrx-instruct'));
document.getElementById('open-router-model-sophosympatheia-midnight-rose-70b').addEventListener('click', () => selectModel('sophosympatheia/midnight-rose-70b'));
document.getElementById('open-router-model-cohere-command').addEventListener('click', () => selectModel('cohere/command'));
document.getElementById('open-router-model-cohere-command-r').addEventListener('click', () => selectModel('cohere/command-r'));
document.getElementById('open-router-model-anthropic-claude-3-haiku-beta').addEventListener('click', () => selectModel('anthropic/claude-3-haiku:beta'));
document.getElementById('open-router-model-anthropic-claude-3-haiku').addEventListener('click', () => selectModel('anthropic/claude-3-haiku'));
document.getElementById('open-router-model-anthropic-claude-3-opus-beta').addEventListener('click', () => selectModel('anthropic/claude-3-opus:beta'));
document.getElementById('open-router-model-anthropic-claude-3-opus').addEventListener('click', () => selectModel('anthropic/claude-3-opus'));
document.getElementById('open-router-model-anthropic-claude-3-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet'));
document.getElementById('open-router-model-cohere-command-r-03-2024').addEventListener('click', () => selectModel('cohere/command-r-03-2024'));
document.getElementById('open-router-model-mistralai-mistral-large').addEventListener('click', () => selectModel('mistralai/mistral-large'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0613').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0613'));
document.getElementById('open-router-model-openai-gpt-4-turbo-preview').addEventListener('click', () => selectModel('openai/gpt-4-turbo-preview'));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mixtral-8x7b-dpo'));
document.getElementById('open-router-model-mistralai-mistral-small').addEventListener('click', () => selectModel('mistralai/mistral-small'));
document.getElementById('open-router-model-mistralai-mistral-tiny').addEventListener('click', () => selectModel('mistralai/mistral-tiny'));
document.getElementById('open-router-model-mistralai-mistral-medium').addEventListener('click', () => selectModel('mistralai/mistral-medium'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.2').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.2'));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x7b').addEventListener('click', () => selectModel('cognitivecomputations/dolphin-mixtral-8x7b'));
document.getElementById('open-router-model-google-gemini-pro-vision').addEventListener('click', () => selectModel('google/gemini-pro-vision'));
document.getElementById('open-router-model-google-gemini-pro').addEventListener('click', () => selectModel('google/gemini-pro'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct-nitro').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct:nitro'));
document.getElementById('open-router-model-openchat-openchat-7b-free').addEventListener('click', () => selectModel('openchat/openchat-7b:free'));
document.getElementById('open-router-model-openchat-openchat-7b').addEventListener('click', () => selectModel('openchat/openchat-7b'));
document.getElementById('open-router-model-neversleep-noromaid-20b').addEventListener('click', () => selectModel('neversleep/noromaid-20b'));
document.getElementById('open-router-model-anthropic-claude-2-beta').addEventListener('click', () => selectModel('anthropic/claude-2:beta'));
document.getElementById('open-router-model-anthropic-claude-2').addEventListener('click', () => selectModel('anthropic/claude-2'));
document.getElementById('open-router-model-anthropic-claude-2.1-beta').addEventListener('click', () => selectModel('anthropic/claude-2.1:beta'));
document.getElementById('open-router-model-anthropic-claude-2.1').addEventListener('click', () => selectModel('anthropic/claude-2.1'));
document.getElementById('open-router-model-teknium-openhermes-2.5-mistral-7b').addEventListener('click', () => selectModel('teknium/openhermes-2.5-mistral-7b'));
document.getElementById('open-router-model-openai-gpt-4-vision-preview').addEventListener('click', () => selectModel('openai/gpt-4-vision-preview'));
document.getElementById('open-router-model-lizpreciatior-lzlv-70b-fp16-hf').addEventListener('click', () => selectModel('lizpreciatior/lzlv-70b-fp16-hf'));
document.getElementById('open-router-model-undi95-toppy-m-7b-free').addEventListener('click', () => selectModel('undi95/toppy-m-7b:free'));
document.getElementById('open-router-model-undi95-toppy-m-7b-nitro').addEventListener('click', () => selectModel('undi95/toppy-m-7b:nitro'));
document.getElementById('open-router-model-undi95-toppy-m-7b').addEventListener('click', () => selectModel('undi95/toppy-m-7b'));
document.getElementById('open-router-model-alpindale-goliath-120b').addEventListener('click', () => selectModel('alpindale/goliath-120b'));
document.getElementById('open-router-model-openrouter-auto').addEventListener('click', () => selectModel('openrouter/auto'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-1106').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-1106'));
document.getElementById('open-router-model-openai-gpt-4-1106-preview').addEventListener('click', () => selectModel('openai/gpt-4-1106-preview'));
document.getElementById('open-router-model-google-palm-2-chat-bison-32k').addEventListener('click', () => selectModel('google/palm-2-chat-bison-32k'));
document.getElementById('open-router-model-google-palm-2-codechat-bison-32k').addEventListener('click', () => selectModel('google/palm-2-codechat-bison-32k'));
document.getElementById('open-router-model-jondurbin-airoboros-l2-70b').addEventListener('click', () => selectModel('jondurbin/airoboros-l2-70b'));
document.getElementById('open-router-model-xwin-lm-xwin-lm-70b').addEventListener('click', () => selectModel('xwin-lm/xwin-lm-70b'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-instruct').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-instruct'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.1').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.1'));
document.getElementById('open-router-model-pygmalionai-mythalion-13b').addEventListener('click', () => selectModel('pygmalionai/mythalion-13b'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-16k').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-16k'));
document.getElementById('open-router-model-openai-gpt-4-32k').addEventListener('click', () => selectModel('openai/gpt-4-32k'));
document.getElementById('open-router-model-openai-gpt-4-32k-0314').addEventListener('click', () => selectModel('openai/gpt-4-32k-0314'));
document.getElementById('open-router-model-nousresearch-nous-hermes-llama2-13b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-llama2-13b'));
document.getElementById('open-router-model-mancer-weaver').addEventListener('click', () => selectModel('mancer/weaver'));
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta-free').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-7b-beta:free'));
document.getElementById('open-router-model-anthropic-claude-2.0-beta').addEventListener('click', () => selectModel('anthropic/claude-2.0:beta'));
document.getElementById('open-router-model-anthropic-claude-2.0').addEventListener('click', () => selectModel('anthropic/claude-2.0'));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b'));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b-extended').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b:extended'));
document.getElementById('open-router-model-google-palm-2-chat-bison').addEventListener('click', () => selectModel('google/palm-2-chat-bison'));
document.getElementById('open-router-model-google-palm-2-codechat-bison').addEventListener('click', () => selectModel('google/palm-2-codechat-bison'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-free').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:free'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-nitro').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:nitro'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-extended').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:extended'));
document.getElementById('open-router-model-meta-llama-llama-2-13b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-13b-chat'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0125').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0125'));
document.getElementById('open-router-model-openai-gpt-4').addEventListener('click', () => selectModel('openai/gpt-4'));
document.getElementById('open-router-model-openai-gpt-4-0314').addEventListener('click', () => selectModel('openai/gpt-4-0314'));

// event listeners for descrptions
document.getElementById('open-router-model-eva-unit-01-eva-llama-3.33-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['eva-unit-01/eva-llama-3.33-70b'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-2-vision-1212').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-2-vision-1212'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-2-1212').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-2-1212'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r7b-12-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r7b-12-2024'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-flash-exp-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-flash-exp:free'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-exp-1206-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-exp-1206:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.3-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.3-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-amazon-nova-lite-v1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['amazon/nova-lite-v1'], event.currentTarget));
document.getElementById('open-router-model-amazon-nova-micro-v1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['amazon/nova-micro-v1'], event.currentTarget));
document.getElementById('open-router-model-amazon-nova-pro-v1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['amazon/nova-pro-v1'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwq-32b-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwq-32b-preview'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-exp-1121-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-exp-1121:free'], event.currentTarget));
document.getElementById('open-router-model-google-learnlm-1.5-pro-experimental-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/learnlm-1.5-pro-experimental:free'], event.currentTarget));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['eva-unit-01/eva-qwen-2.5-72b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-11-20').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-11-20'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large-2411').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large-2411'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large-2407').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large-2407'], event.currentTarget));
document.getElementById('open-router-model-mistralai-pixtral-large-2411').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/pixtral-large-2411'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-vision-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-vision-beta'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-exp-1114-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-exp-1114:free'], event.currentTarget));
document.getElementById('open-router-model-infermatic-mn-inferor-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['infermatic/mn-inferor-12b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2.5-coder-32b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2.5-coder-32b-instruct'], event.currentTarget));
document.getElementById('open-router-model-raifle-sorcererlm-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['raifle/sorcererlm-8x22b'], event.currentTarget));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-32b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['eva-unit-01/eva-qwen-2.5-32b'], event.currentTarget));
document.getElementById('open-router-model-thedrummer-unslopnemo-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['thedrummer/unslopnemo-12b'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku-20241022:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku-20241022'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3.1-lumimaid-70b'], event.currentTarget));
document.getElementById('open-router-model-anthracite-org-magnum-v4-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthracite-org/magnum-v4-72b'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-beta'], event.currentTarget));
document.getElementById('open-router-model-mistralai-ministral-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/ministral-8b'], event.currentTarget));
document.getElementById('open-router-model-mistralai-ministral-3b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/ministral-3b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2.5-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2.5-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-nvidia-llama-3.1-nemotron-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nvidia/llama-3.1-nemotron-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-inflection-inflection-3-pi').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['inflection/inflection-3-pi'], event.currentTarget));
document.getElementById('open-router-model-inflection-inflection-3-productivity').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['inflection/inflection-3-productivity'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5-8b'], event.currentTarget));
document.getElementById('open-router-model-anthracite-org-magnum-v2-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthracite-org/magnum-v2-72b'], event.currentTarget));
document.getElementById('open-router-model-liquid-lfm-40b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['liquid/lfm-40b'], event.currentTarget));
document.getElementById('open-router-model-thedrummer-rocinante-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['thedrummer/rocinante-12b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-3b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-3b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-3b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-3b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-1b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-1b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-90b-vision-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-90b-vision-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-90b-vision-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-90b-vision-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-11b-vision-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-11b-vision-instruct'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2.5-72b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2.5-72b-instruct'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-vl-72b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-vl-72b-instruct'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3.1-lumimaid-8b'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-mini-2024-09-12').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-mini-2024-09-12'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-preview'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-preview-2024-09-12').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-preview-2024-09-12'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-mini'], event.currentTarget));
document.getElementById('open-router-model-mistralai-pixtral-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/pixtral-12b'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-08-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-08-2024'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus-08-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus-08-2024'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-vl-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-vl-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5-exp').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5-exp'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3.1-euryale-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3.1-euryale-70b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b-exp').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5-8b-exp'], event.currentTarget));
document.getElementById('open-router-model-ai21-jamba-1-5-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['ai21/jamba-1-5-large'], event.currentTarget));
document.getElementById('open-router-model-ai21-jamba-1-5-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['ai21/jamba-1-5-mini'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3.5-mini-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3.5-mini-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-3-llama-3.1-70b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-405b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-3-llama-3.1-405b'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-huge-128k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-huge-128k-online'], event.currentTarget));
document.getElementById('open-router-model-openai-chatgpt-4o-latest').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/chatgpt-4o-latest'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3-lunaris-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3-lunaris-8b'], event.currentTarget));
document.getElementById('open-router-model-aetherwiing-mn-starcannon-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['aetherwiing/mn-starcannon-12b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-08-06').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-08-06'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-405b'], event.currentTarget));
document.getElementById('open-router-model-nothingiisreal-mn-celeste-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nothingiisreal/mn-celeste-12b'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-small-128k-chat'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-1.5-exp').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-1.5-exp'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-large-128k-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-large-128k-online'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-small-128k-online'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-405b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-405b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-405b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-8b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-8b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-70b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-70b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-nemo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-nemo'], event.currentTarget));
document.getElementById('open-router-model-mistralai-codestral-mamba').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/codestral-mamba'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-mini'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-mini-2024-07-18').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-mini-2024-07-18'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-7b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-7b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-2-27b-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-2-27b-it'], event.currentTarget));
document.getElementById('open-router-model-alpindale-magnum-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['alpindale/magnum-72b'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-2-9b-it-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-2-9b-it:free'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-2-9b-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-2-9b-it'], event.currentTarget));
document.getElementById('open-router-model-01-ai-yi-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['01-ai/yi-large'], event.currentTarget));
document.getElementById('open-router-model-ai21-jamba-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['ai21/jamba-instruct'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-20240620-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet-20240620:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-20240620').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet-20240620'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3-euryale-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3-euryale-70b'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin-mixtral-8x22b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-72b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-72b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.3').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.3'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-2-pro-llama-3-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-2-pro-llama-3-8b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-mini-128k-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-mini-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-128k-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-70b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-large-32k-online'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-small-32k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-small-32k-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-large-32k-chat'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-05-13').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-05-13'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-guard-2-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-guard-2-8b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o:extended'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-8b:extended'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-8b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:extended'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-70b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x22b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x22b-instruct'], event.currentTarget));
document.getElementById('open-router-model-microsoft-wizardlm-2-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/wizardlm-2-8x22b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-wizardlm-2-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/wizardlm-2-7b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-1.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-1.5'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-turbo'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus-04-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus-04-2024'], event.currentTarget));
document.getElementById('open-router-model-databricks-dbrx-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['databricks/dbrx-instruct'], event.currentTarget));
document.getElementById('open-router-model-sophosympatheia-midnight-rose-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sophosympatheia/midnight-rose-70b'], event.currentTarget));
document.getElementById('open-router-model-cohere-command').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-haiku-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-haiku:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-haiku'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-opus-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-opus:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-opus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-opus'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-sonnet'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-03-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-03-2024'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0613').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0613'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-turbo-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-turbo-preview'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-2-mixtral-8x7b-dpo'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-small').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-small'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-tiny').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-tiny'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-medium').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-medium'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.2'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin-mixtral-8x7b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-vision'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-7b:free'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-7b'], event.currentTarget));
document.getElementById('open-router-model-neversleep-noromaid-20b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/noromaid-20b'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.1-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.1:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.1'], event.currentTarget));
document.getElementById('open-router-model-teknium-openhermes-2.5-mistral-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['teknium/openhermes-2.5-mistral-7b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-vision-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-vision-preview'], event.currentTarget));
document.getElementById('open-router-model-lizpreciatior-lzlv-70b-fp16-hf').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['lizpreciatior/lzlv-70b-fp16-hf'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b:free'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b:nitro'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b'], event.currentTarget));
document.getElementById('open-router-model-alpindale-goliath-120b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['alpindale/goliath-120b'], event.currentTarget));
document.getElementById('open-router-model-openrouter-auto').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openrouter/auto'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-1106').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-1106'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-1106-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-1106-preview'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-chat-bison-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-chat-bison-32k'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-codechat-bison-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-codechat-bison-32k'], event.currentTarget));
document.getElementById('open-router-model-jondurbin-airoboros-l2-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['jondurbin/airoboros-l2-70b'], event.currentTarget));
document.getElementById('open-router-model-xwin-lm-xwin-lm-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['xwin-lm/xwin-lm-70b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.1'], event.currentTarget));
document.getElementById('open-router-model-pygmalionai-mythalion-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['pygmalionai/mythalion-13b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-16k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-16k'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-32k'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-32k-0314').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-32k-0314'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-llama2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-llama2-13b'], event.currentTarget));
document.getElementById('open-router-model-mancer-weaver').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mancer/weaver'], event.currentTarget));
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['huggingfaceh4/zephyr-7b-beta:free'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.0-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.0:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.0').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.0'], event.currentTarget));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/remm-slerp-l2-13b'], event.currentTarget));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/remm-slerp-l2-13b:extended'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-chat-bison').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-chat-bison'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-codechat-bison').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-codechat-bison'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b:free'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b:nitro'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b:extended'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-2-13b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-2-13b-chat'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0125').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0125'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-0314').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-0314'], event.currentTarget));


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
            temperature: temperature
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
            temperature: temperature
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

let temperature = 1;
// Assuming temperature is already declared globally
document.addEventListener('DOMContentLoaded', function() {
  // Assuming temperature is already declared globally

  const sliderContainer = document.getElementById('temperature-slider-container');
  
  if (!sliderContainer) {
    // If the container doesn't exist, create it
    const container = document.createElement('div');
    container.id = 'temperature-slider-container';
    document.getElementById('chat-container').appendChild(container);
  }

  // Create or select the slider
  let slider = document.getElementById('temperature-slider');
  if (!slider) {
    slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'temperature-slider';
    slider.min = '0';
    slider.max = '2';
    slider.step = '0.1';
    slider.value = temperature;
    sliderContainer.appendChild(slider);
  }

  // Create or select the value display
  let valueDisplay = document.getElementById('temperature-value');
  if (!valueDisplay) {
    valueDisplay = document.createElement('span');
    valueDisplay.id = 'temperature-value';
    sliderContainer.appendChild(valueDisplay);
  }

  // Set initial value
  valueDisplay.textContent = temperature.toFixed(1);

  // Add event listener to slider
  slider.addEventListener('input', function() {
    temperature = parseFloat(this.value);
    valueDisplay.textContent = temperature.toFixed(1);
    
    // Update slider color based on value
    const percentage = (temperature - 0) / (2 - 0) * 100;
    const color = percentage < 50 
      ? `rgb(${percentage * 2.55}, ${255}, 0)` 
      : `rgb(255, ${255 - (percentage - 50) * 5.1}, 0)`;
    
    // this.style.backgroundColor = color;
    valueDisplay.style.color = color;
    this.style.setProperty('--thumb-color', color);

    console.log('Temperature updated:', temperature); // Debug log
  });

  console.log('Temperature slider initialized'); // Debug log
});