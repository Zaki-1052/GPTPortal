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
    "GPT-4o": "gpt-4o",
    "GPT-4-32k": "gpt-4-32k",
    "GPT-4-Turbo": "gpt-4-turbo",
    "GPT-3.5-Turbo": "gpt-3.5-turbo-0125",
    "Claude-3.7-Sonnet": "claude-3-7-sonnet-latest",
    "Claude-3.5-Sonnet": "claude-3-5-sonnet-latest",
    "Claude-3.5-Haiku": "claude-3-5-haiku-latest",
    "GPT-o1-Mini": "o1-mini",
    "GPT-o3-Mini": "o3-mini",
    "GPT-o1-Preview": "o1-preview",
    "GPT-o1": "o1",
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
    "Mistral: Saba": "mistralai/mistral-saba",
    "Dolphin3.0 R1 Mistral 24B (free)": "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    "Dolphin3.0 Mistral 24B (free)": "cognitivecomputations/dolphin3.0-mistral-24b:free",
    "Llama Guard 3 8B": "meta-llama/llama-guard-3-8b",
    "OpenAI: o3 Mini High": "openai/o3-mini-high",
    "Llama 3.1 Tulu 3 405B": "allenai/llama-3.1-tulu-3-405b",
    "DeepSeek: R1 Distill Llama 8B": "deepseek/deepseek-r1-distill-llama-8b",
    "Google: Gemini Flash 2.0": "google/gemini-2.0-flash-001",
    "Google: Gemini Flash Lite 2.0 Preview (free)": "google/gemini-2.0-flash-lite-preview-02-05:free",
    "Google: Gemini Pro 2.0 Experimental (free)": "google/gemini-2.0-pro-exp-02-05:free",
    "Qwen: Qwen VL Plus (free)": "qwen/qwen-vl-plus:free",
    "AionLabs: Aion-1.0": "aion-labs/aion-1.0",
    "AionLabs: Aion-1.0-Mini": "aion-labs/aion-1.0-mini",
    "AionLabs: Aion-RP 1.0 (8B)": "aion-labs/aion-rp-llama-3.1-8b",
    "Qwen: Qwen-Turbo": "qwen/qwen-turbo",
    "Qwen: Qwen2.5 VL 72B Instruct (free)": "qwen/qwen2.5-vl-72b-instruct:free",
    "Qwen: Qwen-Plus": "qwen/qwen-plus",
    "Qwen: Qwen-Max ": "qwen/qwen-max",
    "OpenAI: o3 Mini": "openai/o3-mini",
    "DeepSeek: R1 Distill Qwen 1.5B": "deepseek/deepseek-r1-distill-qwen-1.5b",
    "Mistral: Mistral Small 3 (free)": "mistralai/mistral-small-24b-instruct-2501:free",
    "Mistral: Mistral Small 3": "mistralai/mistral-small-24b-instruct-2501",
    "DeepSeek: R1 Distill Qwen 32B": "deepseek/deepseek-r1-distill-qwen-32b",
    "DeepSeek: R1 Distill Qwen 14B": "deepseek/deepseek-r1-distill-qwen-14b",
    "Perplexity: Sonar Reasoning": "perplexity/sonar-reasoning",
    "Perplexity: Sonar": "perplexity/sonar",
    "Liquid: LFM 7B": "liquid/lfm-7b",
    "Liquid: LFM 3B": "liquid/lfm-3b",
    "DeepSeek: R1 Distill Llama 70B (free)": "deepseek/deepseek-r1-distill-llama-70b:free",
    "DeepSeek: R1 Distill Llama 70B": "deepseek/deepseek-r1-distill-llama-70b",
    "Google: Gemini 2.0 Flash Thinking Experimental 01-21 (free)": "google/gemini-2.0-flash-thinking-exp:free",
    "DeepSeek: R1 (free)": "deepseek/deepseek-r1:free",
    "DeepSeek: R1": "deepseek/deepseek-r1",
    "Rogue Rose 103B v0.2 (free)": "sophosympatheia/rogue-rose-103b-v0.2:free",
    "MiniMax: MiniMax-01": "minimax/minimax-01",
    "Mistral: Codestral 2501": "mistralai/codestral-2501",
    "Microsoft: Phi 4": "microsoft/phi-4",
    "Sao10K: Llama 3.1 70B Hanami x1": "sao10k/l3.1-70b-hanami-x1",
    "DeepSeek: DeepSeek V3 (free)": "deepseek/deepseek-chat:free",
    "DeepSeek: DeepSeek V3": "deepseek/deepseek-chat",
    "Qwen: QvQ 72B Preview": "qwen/qvq-72b-preview",
    "Google: Gemini 2.0 Flash Thinking Experimental (free)": "google/gemini-2.0-flash-thinking-exp-1219:free",
    "Sao10K: Llama 3.3 Euryale 70B": "sao10k/l3.3-euryale-70b",
    "OpenAI: o1": "openai/o1",
    "EVA Llama 3.33 70B": "eva-unit-01/eva-llama-3.33-70b",
    "xAI: Grok 2 Vision 1212": "x-ai/grok-2-vision-1212",
    "xAI: Grok 2 1212": "x-ai/grok-2-1212",
    "Cohere: Command R7B (12-2024)": "cohere/command-r7b-12-2024",
    "Google: Gemini Flash 2.0 Experimental (free)": "google/gemini-2.0-flash-exp:free",
    "Google: Gemini Experimental 1206 (free)": "google/gemini-exp-1206:free",
    "Meta: Llama 3.3 70B Instruct (free)": "meta-llama/llama-3.3-70b-instruct:free",
    "Meta: Llama 3.3 70B Instruct": "meta-llama/llama-3.3-70b-instruct",
    "Amazon: Nova Lite 1.0": "amazon/nova-lite-v1",
    "Amazon: Nova Micro 1.0": "amazon/nova-micro-v1",
    "Amazon: Nova Pro 1.0": "amazon/nova-pro-v1",
    "Qwen: QwQ 32B Preview": "qwen/qwq-32b-preview",
    "Google: LearnLM 1.5 Pro Experimental (free)": "google/learnlm-1.5-pro-experimental:free",
    "EVA Qwen2.5 72B": "eva-unit-01/eva-qwen-2.5-72b",
    "OpenAI: GPT-4o (2024-11-20)": "openai/gpt-4o-2024-11-20",
    "Mistral Large 2411": "mistralai/mistral-large-2411",
    "Mistral Large 2407": "mistralai/mistral-large-2407",
    "Mistral: Pixtral Large 2411": "mistralai/pixtral-large-2411",
    "xAI: Grok Vision Beta": "x-ai/grok-vision-beta",
    "Infermatic: Mistral Nemo Inferor 12B": "infermatic/mn-inferor-12b",
    "Qwen2.5 Coder 32B Instruct": "qwen/qwen-2.5-coder-32b-instruct",
    "SorcererLM 8x22B": "raifle/sorcererlm-8x22b",
    "EVA Qwen2.5 32B": "eva-unit-01/eva-qwen-2.5-32b",
    "Unslopnemo 12B": "thedrummer/unslopnemo-12b",
    "Anthropic: Claude 3.5 Haiku (self-moderated)": "anthropic/claude-3.5-haiku:beta",
    "Anthropic: Claude 3.5 Haiku": "anthropic/claude-3.5-haiku",
    "Anthropic: Claude 3.5 Haiku (2024-10-22) (self-moderated)": "anthropic/claude-3.5-haiku-20241022:beta",
    "Anthropic: Claude 3.5 Haiku (2024-10-22)": "anthropic/claude-3.5-haiku-20241022",
    "Anthropic: Claude 3.5 Sonnet (self-moderated)": "anthropic/claude-3.5-sonnet:beta",
    "Anthropic: Claude 3.5 Sonnet": "anthropic/claude-3.5-sonnet",
    "Magnum v4 72B": "anthracite-org/magnum-v4-72b",
    "NeverSleep: Lumimaid v0.2 70B": "neversleep/llama-3.1-lumimaid-70b",
    "xAI: Grok Beta": "x-ai/grok-beta",
    "Mistral: Ministral 3B": "mistralai/ministral-3b",
    "Mistral: Ministral 8B": "mistralai/ministral-8b",
    "Qwen2.5 7B Instruct": "qwen/qwen-2.5-7b-instruct",
    "NVIDIA: Llama 3.1 Nemotron 70B Instruct (free)": "nvidia/llama-3.1-nemotron-70b-instruct:free",
    "NVIDIA: Llama 3.1 Nemotron 70B Instruct": "nvidia/llama-3.1-nemotron-70b-instruct",
    "Inflection: Inflection 3 Productivity": "inflection/inflection-3-productivity",
    "Inflection: Inflection 3 Pi": "inflection/inflection-3-pi",
    "Google: Gemini Flash 1.5 8B": "google/gemini-flash-1.5-8b",
    "Rocinante 12B": "thedrummer/rocinante-12b",
    "Liquid: LFM 40B MoE": "liquid/lfm-40b",
    "Magnum v2 72B": "anthracite-org/magnum-v2-72b",
    "Meta: Llama 3.2 3B Instruct": "meta-llama/llama-3.2-3b-instruct",
    "Meta: Llama 3.2 11B Vision Instruct (free)": "meta-llama/llama-3.2-11b-vision-instruct:free",
    "Meta: Llama 3.2 11B Vision Instruct": "meta-llama/llama-3.2-11b-vision-instruct",
    "Meta: Llama 3.2 90B Vision Instruct": "meta-llama/llama-3.2-90b-vision-instruct",
    "Meta: Llama 3.2 1B Instruct (free)": "meta-llama/llama-3.2-1b-instruct:free",
    "Meta: Llama 3.2 1B Instruct": "meta-llama/llama-3.2-1b-instruct",
    "Qwen2.5 72B Instruct": "qwen/qwen-2.5-72b-instruct",
    "Qwen2-VL 72B Instruct": "qwen/qwen-2-vl-72b-instruct",
    "NeverSleep: Lumimaid v0.2 8B": "neversleep/llama-3.1-lumimaid-8b",
    "OpenAI: o1-mini": "openai/o1-mini",
    "OpenAI: o1-preview": "openai/o1-preview",
    "OpenAI: o1-preview (2024-09-12)": "openai/o1-preview-2024-09-12",
    "OpenAI: o1-mini (2024-09-12)": "openai/o1-mini-2024-09-12",
    "Mistral: Pixtral 12B": "mistralai/pixtral-12b",
    "Cohere: Command R+ (08-2024)": "cohere/command-r-plus-08-2024",
    "Cohere: Command R (08-2024)": "cohere/command-r-08-2024",
    "Google: Gemini Flash 1.5 8B Experimental": "google/gemini-flash-1.5-8b-exp",
    "Sao10K: Llama 3.1 Euryale 70B v2.2": "sao10k/l3.1-euryale-70b",
    "Qwen2-VL 7B Instruct": "qwen/qwen-2-vl-7b-instruct",
    "AI21: Jamba 1.5 Large": "ai21/jamba-1-5-large",
    "AI21: Jamba 1.5 Mini": "ai21/jamba-1-5-mini",
    "Microsoft: Phi-3.5 Mini 128K Instruct": "microsoft/phi-3.5-mini-128k-instruct",
    "Nous: Hermes 3 70B Instruct": "nousresearch/hermes-3-llama-3.1-70b",
    "Nous: Hermes 3 405B Instruct": "nousresearch/hermes-3-llama-3.1-405b",
    "Perplexity: Llama 3.1 Sonar 405B Online": "perplexity/llama-3.1-sonar-huge-128k-online",
    "OpenAI: ChatGPT-4o": "openai/chatgpt-4o-latest",
    "Aetherwiing: Starcannon 12B": "aetherwiing/mn-starcannon-12b",
    "Sao10K: Llama 3 8B Lunaris": "sao10k/l3-lunaris-8b",
    "OpenAI: GPT-4o (2024-08-06)": "openai/gpt-4o-2024-08-06",
    "Mistral Nemo 12B Celeste": "nothingiisreal/mn-celeste-12b",
    "Meta: Llama 3.1 405B (base)": "meta-llama/llama-3.1-405b",
    "Perplexity: Llama 3.1 Sonar 8B": "perplexity/llama-3.1-sonar-small-128k-chat",
    "Perplexity: Llama 3.1 Sonar 70B Online": "perplexity/llama-3.1-sonar-large-128k-online",
    "Perplexity: Llama 3.1 Sonar 70B": "perplexity/llama-3.1-sonar-large-128k-chat",
    "Perplexity: Llama 3.1 Sonar 8B Online": "perplexity/llama-3.1-sonar-small-128k-online",
    "Meta: Llama 3.1 405B Instruct": "meta-llama/llama-3.1-405b-instruct",
    "Meta: Llama 3.1 8B Instruct (free)": "meta-llama/llama-3.1-8b-instruct:free",
    "Meta: Llama 3.1 8B Instruct": "meta-llama/llama-3.1-8b-instruct",
    "Meta: Llama 3.1 70B Instruct": "meta-llama/llama-3.1-70b-instruct",
    "Mistral: Codestral Mamba": "mistralai/codestral-mamba",
    "Mistral: Mistral Nemo (free)": "mistralai/mistral-nemo:free",
    "Mistral: Mistral Nemo": "mistralai/mistral-nemo",
    "OpenAI: GPT-4o-mini (2024-07-18)": "openai/gpt-4o-mini-2024-07-18",
    "OpenAI: GPT-4o-mini": "openai/gpt-4o-mini",
    "Google: Gemma 2 27B": "google/gemma-2-27b-it",
    "Magnum 72B": "alpindale/magnum-72b",
    "Google: Gemma 2 9B (free)": "google/gemma-2-9b-it:free",
    "Google: Gemma 2 9B": "google/gemma-2-9b-it",
    "01.AI: Yi Large": "01-ai/yi-large",
    "AI21: Jamba Instruct": "ai21/jamba-instruct",
    "Anthropic: Claude 3.5 Sonnet (2024-06-20) (self-moderated)": "anthropic/claude-3.5-sonnet-20240620:beta",
    "Anthropic: Claude 3.5 Sonnet (2024-06-20)": "anthropic/claude-3.5-sonnet-20240620",
    "Sao10k: Llama 3 Euryale 70B v2.1": "sao10k/l3-euryale-70b",
    "Dolphin 2.9.2 Mixtral 8x22B \ud83d\udc2c": "cognitivecomputations/dolphin-mixtral-8x22b",
    "Qwen 2 72B Instruct": "qwen/qwen-2-72b-instruct",
    "Mistral: Mistral 7B Instruct v0.3": "mistralai/mistral-7b-instruct-v0.3",
    "Mistral: Mistral 7B Instruct (free)": "mistralai/mistral-7b-instruct:free",
    "Mistral: Mistral 7B Instruct": "mistralai/mistral-7b-instruct",
    "NousResearch: Hermes 2 Pro - Llama-3 8B": "nousresearch/hermes-2-pro-llama-3-8b",
    "Microsoft: Phi-3 Mini 128K Instruct (free)": "microsoft/phi-3-mini-128k-instruct:free",
    "Microsoft: Phi-3 Mini 128K Instruct": "microsoft/phi-3-mini-128k-instruct",
    "Microsoft: Phi-3 Medium 128K Instruct (free)": "microsoft/phi-3-medium-128k-instruct:free",
    "Microsoft: Phi-3 Medium 128K Instruct": "microsoft/phi-3-medium-128k-instruct",
    "NeverSleep: Llama 3 Lumimaid 70B": "neversleep/llama-3-lumimaid-70b",
    "DeepSeek V2.5": "deepseek/deepseek-chat-v2.5",
    "Google: Gemini Flash 1.5": "google/gemini-flash-1.5",
    "Meta: LlamaGuard 2 8B": "meta-llama/llama-guard-2-8b",
    "OpenAI: GPT-4o (2024-05-13)": "openai/gpt-4o-2024-05-13",
    "OpenAI: GPT-4o": "openai/gpt-4o",
    "OpenAI: GPT-4o (extended)": "openai/gpt-4o:extended",
    "NeverSleep: Llama 3 Lumimaid 8B (extended)": "neversleep/llama-3-lumimaid-8b:extended",
    "NeverSleep: Llama 3 Lumimaid 8B": "neversleep/llama-3-lumimaid-8b",
    "Fimbulvetr 11B v2": "sao10k/fimbulvetr-11b-v2",
    "Meta: Llama 3 8B Instruct (free)": "meta-llama/llama-3-8b-instruct:free",
    "Meta: Llama 3 8B Instruct": "meta-llama/llama-3-8b-instruct",
    "Meta: Llama 3 70B Instruct": "meta-llama/llama-3-70b-instruct",
    "Mistral: Mixtral 8x22B Instruct": "mistralai/mixtral-8x22b-instruct",
    "WizardLM-2 8x22B": "microsoft/wizardlm-2-8x22b",
    "WizardLM-2 7B": "microsoft/wizardlm-2-7b",
    "OpenAI: GPT-4 Turbo": "openai/gpt-4-turbo",
    "Google: Gemini Pro 1.5": "google/gemini-pro-1.5",
    "Cohere: Command R+": "cohere/command-r-plus",
    "Cohere: Command R+ (04-2024)": "cohere/command-r-plus-04-2024",
    "Databricks: DBRX 132B Instruct": "databricks/dbrx-instruct",
    "Midnight Rose 70B": "sophosympatheia/midnight-rose-70b",
    "Cohere: Command": "cohere/command",
    "Cohere: Command R": "cohere/command-r",
    "Anthropic: Claude 3 Haiku (self-moderated)": "anthropic/claude-3-haiku:beta",
    "Anthropic: Claude 3 Haiku": "anthropic/claude-3-haiku",
    "Anthropic: Claude 3 Sonnet (self-moderated)": "anthropic/claude-3-sonnet:beta",
    "Anthropic: Claude 3 Sonnet": "anthropic/claude-3-sonnet",
    "Anthropic: Claude 3 Opus (self-moderated)": "anthropic/claude-3-opus:beta",
    "Anthropic: Claude 3 Opus": "anthropic/claude-3-opus",
    "Cohere: Command R (03-2024)": "cohere/command-r-03-2024",
    "Mistral Large": "mistralai/mistral-large",
    "Google: Gemma 7B": "google/gemma-7b-it",
    "OpenAI: GPT-3.5 Turbo (older v0613)": "openai/gpt-3.5-turbo-0613",
    "OpenAI: GPT-4 Turbo Preview": "openai/gpt-4-turbo-preview",
    "Nous: Hermes 2 Mixtral 8x7B DPO": "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    "Mistral Tiny": "mistralai/mistral-tiny",
    "Mistral Small": "mistralai/mistral-small",
    "Mistral Medium": "mistralai/mistral-medium",
    "Dolphin 2.6 Mixtral 8x7B \ud83d\udc2c": "cognitivecomputations/dolphin-mixtral-8x7b",
    "Google: Gemini Pro 1.0": "google/gemini-pro",
    "Google: Gemini Pro Vision 1.0": "google/gemini-pro-vision",
    "Mistral: Mixtral 8x7B (base)": "mistralai/mixtral-8x7b",
    "Mistral: Mixtral 8x7B Instruct": "mistralai/mixtral-8x7b-instruct",
    "OpenChat 3.5 7B (free)": "openchat/openchat-7b:free",
    "OpenChat 3.5 7B": "openchat/openchat-7b",
    "Noromaid 20B": "neversleep/noromaid-20b",
    "Anthropic: Claude v2.1 (self-moderated)": "anthropic/claude-2.1:beta",
    "Anthropic: Claude v2.1": "anthropic/claude-2.1",
    "Anthropic: Claude v2 (self-moderated)": "anthropic/claude-2:beta",
    "Anthropic: Claude v2": "anthropic/claude-2",
    "OpenHermes 2.5 Mistral 7B": "teknium/openhermes-2.5-mistral-7b",
    "Toppy M 7B (free)": "undi95/toppy-m-7b:free",
    "Toppy M 7B": "undi95/toppy-m-7b",
    "Goliath 120B": "alpindale/goliath-120b",
    "Auto Router": "openrouter/auto",
    "OpenAI: GPT-4 Turbo (older v1106)": "openai/gpt-4-1106-preview",
    "OpenAI: GPT-3.5 Turbo 16k (older v1106)": "openai/gpt-3.5-turbo-1106",
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
    "Hugging Face: Zephyr 7B (free)": "huggingfaceh4/zephyr-7b-beta:free",
    "Mancer: Weaver (alpha)": "mancer/weaver",
    "Anthropic: Claude v2.0 (self-moderated)": "anthropic/claude-2.0:beta",
    "Anthropic: Claude v2.0": "anthropic/claude-2.0",
    "ReMM SLERP 13B": "undi95/remm-slerp-l2-13b",
    "Google: PaLM 2 Code Chat": "google/palm-2-codechat-bison",
    "Google: PaLM 2 Chat": "google/palm-2-chat-bison",
    "MythoMax 13B (free)": "gryphe/mythomax-l2-13b:free",
    "MythoMax 13B": "gryphe/mythomax-l2-13b",
    "Meta: Llama 2 13B Chat": "meta-llama/llama-2-13b-chat",
    "Meta: Llama 2 70B Chat": "meta-llama/llama-2-70b-chat",
    "OpenAI: GPT-4": "openai/gpt-4",
    "OpenAI: GPT-4 (older v0314)": "openai/gpt-4-0314",
    "OpenAI: GPT-3.5 Turbo": "openai/gpt-3.5-turbo"
};

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4.5-preview": "GPT-4.5",
    "gpt-4o": "GPT-4o",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-turbo": "GPT-4-Turbo",
    "gpt-3.5-turbo-0125": "GPT-3.5-Turbo",
    "claude-3-7-sonnet-latest": "Claude-3.7-Sonnet",
    "claude-3-5-sonnet-latest": "Claude-3.5-Sonnet",
    "claude-3-5-haiku-latest": "Claude-3.5-Haiku",
    "o1-mini": "GPT-o1-Mini",
    "o3-mini": "GPT-o3-Mini",
    "o1-preview": "GPT-o1-Preview",
    "o1": "GPT-o1",
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
    "mistralai/mistral-saba": "Mistral: Saba",
    "cognitivecomputations/dolphin3.0-r1-mistral-24b:free": "Dolphin3.0 R1 Mistral 24B (free)",
    "cognitivecomputations/dolphin3.0-mistral-24b:free": "Dolphin3.0 Mistral 24B (free)",
    "meta-llama/llama-guard-3-8b": "Llama Guard 3 8B",
    "openai/o3-mini-high": "OpenAI: o3 Mini High",
    "allenai/llama-3.1-tulu-3-405b": "Llama 3.1 Tulu 3 405B",
    "deepseek/deepseek-r1-distill-llama-8b": "DeepSeek: R1 Distill Llama 8B",
    "google/gemini-2.0-flash-001": "Google: Gemini Flash 2.0",
    "google/gemini-2.0-flash-lite-preview-02-05:free": "Google: Gemini Flash Lite 2.0 Preview (free)",
    "google/gemini-2.0-pro-exp-02-05:free": "Google: Gemini Pro 2.0 Experimental (free)",
    "qwen/qwen-vl-plus:free": "Qwen: Qwen VL Plus (free)",
    "aion-labs/aion-1.0": "AionLabs: Aion-1.0",
    "aion-labs/aion-1.0-mini": "AionLabs: Aion-1.0-Mini",
    "aion-labs/aion-rp-llama-3.1-8b": "AionLabs: Aion-RP 1.0 (8B)",
    "qwen/qwen-turbo": "Qwen: Qwen-Turbo",
    "qwen/qwen2.5-vl-72b-instruct:free": "Qwen: Qwen2.5 VL 72B Instruct (free)",
    "qwen/qwen-plus": "Qwen: Qwen-Plus",
    "qwen/qwen-max": "Qwen: Qwen-Max ",
    "openai/o3-mini": "OpenAI: o3 Mini",
    "deepseek/deepseek-r1-distill-qwen-1.5b": "DeepSeek: R1 Distill Qwen 1.5B",
    "mistralai/mistral-small-24b-instruct-2501:free": "Mistral: Mistral Small 3 (free)",
    "mistralai/mistral-small-24b-instruct-2501": "Mistral: Mistral Small 3",
    "deepseek/deepseek-r1-distill-qwen-32b": "DeepSeek: R1 Distill Qwen 32B",
    "deepseek/deepseek-r1-distill-qwen-14b": "DeepSeek: R1 Distill Qwen 14B",
    "perplexity/sonar-reasoning": "Perplexity: Sonar Reasoning",
    "perplexity/sonar": "Perplexity: Sonar",
    "liquid/lfm-7b": "Liquid: LFM 7B",
    "liquid/lfm-3b": "Liquid: LFM 3B",
    "deepseek/deepseek-r1-distill-llama-70b:free": "DeepSeek: R1 Distill Llama 70B (free)",
    "deepseek/deepseek-r1-distill-llama-70b": "DeepSeek: R1 Distill Llama 70B",
    "google/gemini-2.0-flash-thinking-exp:free": "Google: Gemini 2.0 Flash Thinking Experimental 01-21 (free)",
    "deepseek/deepseek-r1:free": "DeepSeek: R1 (free)",
    "deepseek/deepseek-r1": "DeepSeek: R1",
    "sophosympatheia/rogue-rose-103b-v0.2:free": "Rogue Rose 103B v0.2 (free)",
    "minimax/minimax-01": "MiniMax: MiniMax-01",
    "mistralai/codestral-2501": "Mistral: Codestral 2501",
    "microsoft/phi-4": "Microsoft: Phi 4",
    "sao10k/l3.1-70b-hanami-x1": "Sao10K: Llama 3.1 70B Hanami x1",
    "deepseek/deepseek-chat:free": "DeepSeek: DeepSeek V3 (free)",
    "deepseek/deepseek-chat": "DeepSeek: DeepSeek V3",
    "qwen/qvq-72b-preview": "Qwen: QvQ 72B Preview",
    "google/gemini-2.0-flash-thinking-exp-1219:free": "Google: Gemini 2.0 Flash Thinking Experimental (free)",
    "sao10k/l3.3-euryale-70b": "Sao10K: Llama 3.3 Euryale 70B",
    "openai/o1": "OpenAI: o1",
    "eva-unit-01/eva-llama-3.33-70b": "EVA Llama 3.33 70B",
    "x-ai/grok-2-vision-1212": "xAI: Grok 2 Vision 1212",
    "x-ai/grok-2-1212": "xAI: Grok 2 1212",
    "cohere/command-r7b-12-2024": "Cohere: Command R7B (12-2024)",
    "google/gemini-2.0-flash-exp:free": "Google: Gemini Flash 2.0 Experimental (free)",
    "google/gemini-exp-1206:free": "Google: Gemini Experimental 1206 (free)",
    "meta-llama/llama-3.3-70b-instruct:free": "Meta: Llama 3.3 70B Instruct (free)",
    "meta-llama/llama-3.3-70b-instruct": "Meta: Llama 3.3 70B Instruct",
    "amazon/nova-lite-v1": "Amazon: Nova Lite 1.0",
    "amazon/nova-micro-v1": "Amazon: Nova Micro 1.0",
    "amazon/nova-pro-v1": "Amazon: Nova Pro 1.0",
    "qwen/qwq-32b-preview": "Qwen: QwQ 32B Preview",
    "google/learnlm-1.5-pro-experimental:free": "Google: LearnLM 1.5 Pro Experimental (free)",
    "eva-unit-01/eva-qwen-2.5-72b": "EVA Qwen2.5 72B",
    "openai/gpt-4o-2024-11-20": "OpenAI: GPT-4o (2024-11-20)",
    "mistralai/mistral-large-2411": "Mistral Large 2411",
    "mistralai/mistral-large-2407": "Mistral Large 2407",
    "mistralai/pixtral-large-2411": "Mistral: Pixtral Large 2411",
    "x-ai/grok-vision-beta": "xAI: Grok Vision Beta",
    "infermatic/mn-inferor-12b": "Infermatic: Mistral Nemo Inferor 12B",
    "qwen/qwen-2.5-coder-32b-instruct": "Qwen2.5 Coder 32B Instruct",
    "raifle/sorcererlm-8x22b": "SorcererLM 8x22B",
    "eva-unit-01/eva-qwen-2.5-32b": "EVA Qwen2.5 32B",
    "thedrummer/unslopnemo-12b": "Unslopnemo 12B",
    "anthropic/claude-3.5-haiku:beta": "Anthropic: Claude 3.5 Haiku (self-moderated)",
    "anthropic/claude-3.5-haiku": "Anthropic: Claude 3.5 Haiku",
    "anthropic/claude-3.5-haiku-20241022:beta": "Anthropic: Claude 3.5 Haiku (2024-10-22) (self-moderated)",
    "anthropic/claude-3.5-haiku-20241022": "Anthropic: Claude 3.5 Haiku (2024-10-22)",
    "anthropic/claude-3.5-sonnet:beta": "Anthropic: Claude 3.5 Sonnet (self-moderated)",
    "anthropic/claude-3.5-sonnet": "Anthropic: Claude 3.5 Sonnet",
    "anthracite-org/magnum-v4-72b": "Magnum v4 72B",
    "neversleep/llama-3.1-lumimaid-70b": "NeverSleep: Lumimaid v0.2 70B",
    "x-ai/grok-beta": "xAI: Grok Beta",
    "mistralai/ministral-3b": "Mistral: Ministral 3B",
    "mistralai/ministral-8b": "Mistral: Ministral 8B",
    "qwen/qwen-2.5-7b-instruct": "Qwen2.5 7B Instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct:free": "NVIDIA: Llama 3.1 Nemotron 70B Instruct (free)",
    "nvidia/llama-3.1-nemotron-70b-instruct": "NVIDIA: Llama 3.1 Nemotron 70B Instruct",
    "inflection/inflection-3-productivity": "Inflection: Inflection 3 Productivity",
    "inflection/inflection-3-pi": "Inflection: Inflection 3 Pi",
    "google/gemini-flash-1.5-8b": "Google: Gemini Flash 1.5 8B",
    "thedrummer/rocinante-12b": "Rocinante 12B",
    "liquid/lfm-40b": "Liquid: LFM 40B MoE",
    "anthracite-org/magnum-v2-72b": "Magnum v2 72B",
    "meta-llama/llama-3.2-3b-instruct": "Meta: Llama 3.2 3B Instruct",
    "meta-llama/llama-3.2-11b-vision-instruct:free": "Meta: Llama 3.2 11B Vision Instruct (free)",
    "meta-llama/llama-3.2-11b-vision-instruct": "Meta: Llama 3.2 11B Vision Instruct",
    "meta-llama/llama-3.2-90b-vision-instruct": "Meta: Llama 3.2 90B Vision Instruct",
    "meta-llama/llama-3.2-1b-instruct:free": "Meta: Llama 3.2 1B Instruct (free)",
    "meta-llama/llama-3.2-1b-instruct": "Meta: Llama 3.2 1B Instruct",
    "qwen/qwen-2.5-72b-instruct": "Qwen2.5 72B Instruct",
    "qwen/qwen-2-vl-72b-instruct": "Qwen2-VL 72B Instruct",
    "neversleep/llama-3.1-lumimaid-8b": "NeverSleep: Lumimaid v0.2 8B",
    "openai/o1-mini": "OpenAI: o1-mini",
    "openai/o1-preview": "OpenAI: o1-preview",
    "openai/o1-preview-2024-09-12": "OpenAI: o1-preview (2024-09-12)",
    "openai/o1-mini-2024-09-12": "OpenAI: o1-mini (2024-09-12)",
    "mistralai/pixtral-12b": "Mistral: Pixtral 12B",
    "cohere/command-r-plus-08-2024": "Cohere: Command R+ (08-2024)",
    "cohere/command-r-08-2024": "Cohere: Command R (08-2024)",
    "google/gemini-flash-1.5-8b-exp": "Google: Gemini Flash 1.5 8B Experimental",
    "sao10k/l3.1-euryale-70b": "Sao10K: Llama 3.1 Euryale 70B v2.2",
    "qwen/qwen-2-vl-7b-instruct": "Qwen2-VL 7B Instruct",
    "ai21/jamba-1-5-large": "AI21: Jamba 1.5 Large",
    "ai21/jamba-1-5-mini": "AI21: Jamba 1.5 Mini",
    "microsoft/phi-3.5-mini-128k-instruct": "Microsoft: Phi-3.5 Mini 128K Instruct",
    "nousresearch/hermes-3-llama-3.1-70b": "Nous: Hermes 3 70B Instruct",
    "nousresearch/hermes-3-llama-3.1-405b": "Nous: Hermes 3 405B Instruct",
    "perplexity/llama-3.1-sonar-huge-128k-online": "Perplexity: Llama 3.1 Sonar 405B Online",
    "openai/chatgpt-4o-latest": "OpenAI: ChatGPT-4o",
    "aetherwiing/mn-starcannon-12b": "Aetherwiing: Starcannon 12B",
    "sao10k/l3-lunaris-8b": "Sao10K: Llama 3 8B Lunaris",
    "openai/gpt-4o-2024-08-06": "OpenAI: GPT-4o (2024-08-06)",
    "nothingiisreal/mn-celeste-12b": "Mistral Nemo 12B Celeste",
    "meta-llama/llama-3.1-405b": "Meta: Llama 3.1 405B (base)",
    "perplexity/llama-3.1-sonar-small-128k-chat": "Perplexity: Llama 3.1 Sonar 8B",
    "perplexity/llama-3.1-sonar-large-128k-online": "Perplexity: Llama 3.1 Sonar 70B Online",
    "perplexity/llama-3.1-sonar-large-128k-chat": "Perplexity: Llama 3.1 Sonar 70B",
    "perplexity/llama-3.1-sonar-small-128k-online": "Perplexity: Llama 3.1 Sonar 8B Online",
    "meta-llama/llama-3.1-405b-instruct": "Meta: Llama 3.1 405B Instruct",
    "meta-llama/llama-3.1-8b-instruct:free": "Meta: Llama 3.1 8B Instruct (free)",
    "meta-llama/llama-3.1-8b-instruct": "Meta: Llama 3.1 8B Instruct",
    "meta-llama/llama-3.1-70b-instruct": "Meta: Llama 3.1 70B Instruct",
    "mistralai/codestral-mamba": "Mistral: Codestral Mamba",
    "mistralai/mistral-nemo:free": "Mistral: Mistral Nemo (free)",
    "mistralai/mistral-nemo": "Mistral: Mistral Nemo",
    "openai/gpt-4o-mini-2024-07-18": "OpenAI: GPT-4o-mini (2024-07-18)",
    "openai/gpt-4o-mini": "OpenAI: GPT-4o-mini",
    "google/gemma-2-27b-it": "Google: Gemma 2 27B",
    "alpindale/magnum-72b": "Magnum 72B",
    "google/gemma-2-9b-it:free": "Google: Gemma 2 9B (free)",
    "google/gemma-2-9b-it": "Google: Gemma 2 9B",
    "01-ai/yi-large": "01.AI: Yi Large",
    "ai21/jamba-instruct": "AI21: Jamba Instruct",
    "anthropic/claude-3.5-sonnet-20240620:beta": "Anthropic: Claude 3.5 Sonnet (2024-06-20) (self-moderated)",
    "anthropic/claude-3.5-sonnet-20240620": "Anthropic: Claude 3.5 Sonnet (2024-06-20)",
    "sao10k/l3-euryale-70b": "Sao10k: Llama 3 Euryale 70B v2.1",
    "cognitivecomputations/dolphin-mixtral-8x22b": "Dolphin 2.9.2 Mixtral 8x22B \ud83d\udc2c",
    "qwen/qwen-2-72b-instruct": "Qwen 2 72B Instruct",
    "mistralai/mistral-7b-instruct-v0.3": "Mistral: Mistral 7B Instruct v0.3",
    "mistralai/mistral-7b-instruct:free": "Mistral: Mistral 7B Instruct (free)",
    "mistralai/mistral-7b-instruct": "Mistral: Mistral 7B Instruct",
    "nousresearch/hermes-2-pro-llama-3-8b": "NousResearch: Hermes 2 Pro - Llama-3 8B",
    "microsoft/phi-3-mini-128k-instruct:free": "Microsoft: Phi-3 Mini 128K Instruct (free)",
    "microsoft/phi-3-mini-128k-instruct": "Microsoft: Phi-3 Mini 128K Instruct",
    "microsoft/phi-3-medium-128k-instruct:free": "Microsoft: Phi-3 Medium 128K Instruct (free)",
    "microsoft/phi-3-medium-128k-instruct": "Microsoft: Phi-3 Medium 128K Instruct",
    "neversleep/llama-3-lumimaid-70b": "NeverSleep: Llama 3 Lumimaid 70B",
    "deepseek/deepseek-chat-v2.5": "DeepSeek V2.5",
    "google/gemini-flash-1.5": "Google: Gemini Flash 1.5",
    "meta-llama/llama-guard-2-8b": "Meta: LlamaGuard 2 8B",
    "openai/gpt-4o-2024-05-13": "OpenAI: GPT-4o (2024-05-13)",
    "openai/gpt-4o": "OpenAI: GPT-4o",
    "openai/gpt-4o:extended": "OpenAI: GPT-4o (extended)",
    "neversleep/llama-3-lumimaid-8b:extended": "NeverSleep: Llama 3 Lumimaid 8B (extended)",
    "neversleep/llama-3-lumimaid-8b": "NeverSleep: Llama 3 Lumimaid 8B",
    "sao10k/fimbulvetr-11b-v2": "Fimbulvetr 11B v2",
    "meta-llama/llama-3-8b-instruct:free": "Meta: Llama 3 8B Instruct (free)",
    "meta-llama/llama-3-8b-instruct": "Meta: Llama 3 8B Instruct",
    "meta-llama/llama-3-70b-instruct": "Meta: Llama 3 70B Instruct",
    "mistralai/mixtral-8x22b-instruct": "Mistral: Mixtral 8x22B Instruct",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B",
    "openai/gpt-4-turbo": "OpenAI: GPT-4 Turbo",
    "google/gemini-pro-1.5": "Google: Gemini Pro 1.5",
    "cohere/command-r-plus": "Cohere: Command R+",
    "cohere/command-r-plus-04-2024": "Cohere: Command R+ (04-2024)",
    "databricks/dbrx-instruct": "Databricks: DBRX 132B Instruct",
    "sophosympatheia/midnight-rose-70b": "Midnight Rose 70B",
    "cohere/command": "Cohere: Command",
    "cohere/command-r": "Cohere: Command R",
    "anthropic/claude-3-haiku:beta": "Anthropic: Claude 3 Haiku (self-moderated)",
    "anthropic/claude-3-haiku": "Anthropic: Claude 3 Haiku",
    "anthropic/claude-3-sonnet:beta": "Anthropic: Claude 3 Sonnet (self-moderated)",
    "anthropic/claude-3-sonnet": "Anthropic: Claude 3 Sonnet",
    "anthropic/claude-3-opus:beta": "Anthropic: Claude 3 Opus (self-moderated)",
    "anthropic/claude-3-opus": "Anthropic: Claude 3 Opus",
    "cohere/command-r-03-2024": "Cohere: Command R (03-2024)",
    "mistralai/mistral-large": "Mistral Large",
    "google/gemma-7b-it": "Google: Gemma 7B",
    "openai/gpt-3.5-turbo-0613": "OpenAI: GPT-3.5 Turbo (older v0613)",
    "openai/gpt-4-turbo-preview": "OpenAI: GPT-4 Turbo Preview",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous: Hermes 2 Mixtral 8x7B DPO",
    "mistralai/mistral-tiny": "Mistral Tiny",
    "mistralai/mistral-small": "Mistral Small",
    "mistralai/mistral-medium": "Mistral Medium",
    "cognitivecomputations/dolphin-mixtral-8x7b": "Dolphin 2.6 Mixtral 8x7B \ud83d\udc2c",
    "google/gemini-pro": "Google: Gemini Pro 1.0",
    "google/gemini-pro-vision": "Google: Gemini Pro Vision 1.0",
    "mistralai/mixtral-8x7b": "Mistral: Mixtral 8x7B (base)",
    "mistralai/mixtral-8x7b-instruct": "Mistral: Mixtral 8x7B Instruct",
    "openchat/openchat-7b:free": "OpenChat 3.5 7B (free)",
    "openchat/openchat-7b": "OpenChat 3.5 7B",
    "neversleep/noromaid-20b": "Noromaid 20B",
    "anthropic/claude-2.1:beta": "Anthropic: Claude v2.1 (self-moderated)",
    "anthropic/claude-2.1": "Anthropic: Claude v2.1",
    "anthropic/claude-2:beta": "Anthropic: Claude v2 (self-moderated)",
    "anthropic/claude-2": "Anthropic: Claude v2",
    "teknium/openhermes-2.5-mistral-7b": "OpenHermes 2.5 Mistral 7B",
    "undi95/toppy-m-7b:free": "Toppy M 7B (free)",
    "undi95/toppy-m-7b": "Toppy M 7B",
    "alpindale/goliath-120b": "Goliath 120B",
    "openrouter/auto": "Auto Router",
    "openai/gpt-4-1106-preview": "OpenAI: GPT-4 Turbo (older v1106)",
    "openai/gpt-3.5-turbo-1106": "OpenAI: GPT-3.5 Turbo 16k (older v1106)",
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
    "huggingfaceh4/zephyr-7b-beta:free": "Hugging Face: Zephyr 7B (free)",
    "mancer/weaver": "Mancer: Weaver (alpha)",
    "anthropic/claude-2.0:beta": "Anthropic: Claude v2.0 (self-moderated)",
    "anthropic/claude-2.0": "Anthropic: Claude v2.0",
    "undi95/remm-slerp-l2-13b": "ReMM SLERP 13B",
    "google/palm-2-codechat-bison": "Google: PaLM 2 Code Chat",
    "google/palm-2-chat-bison": "Google: PaLM 2 Chat",
    "gryphe/mythomax-l2-13b:free": "MythoMax 13B (free)",
    "gryphe/mythomax-l2-13b": "MythoMax 13B",
    "meta-llama/llama-2-13b-chat": "Meta: Llama 2 13B Chat",
    "meta-llama/llama-2-70b-chat": "Meta: Llama 2 70B Chat",
    "openai/gpt-4": "OpenAI: GPT-4",
    "openai/gpt-4-0314": "OpenAI: GPT-4 (older v0314)",
    "openai/gpt-3.5-turbo-0125": "OpenAI: GPT-3.5 Turbo 16k",
    "openai/gpt-3.5-turbo": "OpenAI: GPT-3.5 Turbo"
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
    "perplexity/r1-1776": "R1 1776 is a version of DeepSeek-R1 that has been post-trained to remove censorship constraints related to topics restricted by the Chinese government. The model retains its original reasoning capabilities while providing direct responses to a wider range of queries. R1 1776 is an offline chat model that does not use the perplexity search subsystem.\n\nThe model was tested on a multilingual dataset of over 1,000 examples covering sensitive topics to measure its likelihood of refusal or overly filtered responses. [Evaluation Results](https://cdn-uploads.huggingface.co/production/uploads/675c8332d01f593dc90817f5/GiN2VqC5hawUgAGJ6oHla.png) Its performance on math and reasoning benchmarks remains similar to the base R1 model. [Reasoning Performance](https://cdn-uploads.huggingface.co/production/uploads/675c8332d01f593dc90817f5/n4Z9Byqp2S7sKUvCvI40R.png)\n\nRead more on the [Blog Post](https://perplexity.ai/hub/blog/open-sourcing-r1-1776)",
    "mistralai/mistral-saba": "Mistral Saba is a 24B-parameter language model specifically designed for the Middle East and South Asia, delivering accurate and contextually relevant responses while maintaining efficient performance. Trained on curated regional datasets, it supports multiple Indian-origin languages\u2014including Tamil and Malayalam\u2014alongside Arabic. This makes it a versatile option for a range of regional and multilingual applications. Read more at the blog post [here](https://mistral.ai/en/news/mistral-saba)",
    "cognitivecomputations/dolphin3.0-r1-mistral-24b:free": "Dolphin 3.0 R1 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.\n\nThe R1 version has been trained for 3 epochs to reason using 800k reasoning traces from the Dolphin-R1 dataset.\n\nDolphin aims to be a general purpose reasoning instruct model, similar to the models behind ChatGPT, Claude, Gemini.\n\nPart of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)",
    "cognitivecomputations/dolphin3.0-mistral-24b:free": "Dolphin 3.0 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.\n\nDolphin aims to be a general purpose instruct model, similar to the models behind ChatGPT, Claude, Gemini. \n\nPart of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)",
    "meta-llama/llama-guard-3-8b": "Llama Guard 3 is a Llama-3.1-8B pretrained model, fine-tuned for content safety classification. Similar to previous versions, it can be used to classify content in both LLM inputs (prompt classification) and in LLM responses (response classification). It acts as an LLM \u2013 it generates text in its output that indicates whether a given prompt or response is safe or unsafe, and if unsafe, it also lists the content categories violated.\n\nLlama Guard 3 was aligned to safeguard against the MLCommons standardized hazards taxonomy and designed to support Llama 3.1 capabilities. Specifically, it provides content moderation in 8 languages, and was optimized to support safety and security for search and code interpreter tool calls.\n",
    "openai/o3-mini-high": "OpenAI o3-mini-high is the same model as [o3-mini](/openai/o3-mini) with reasoning_effort set to high. \n\no3-mini is a cost-efficient language model optimized for STEM reasoning tasks, particularly excelling in science, mathematics, and coding. The model features three adjustable reasoning effort levels and supports key developer capabilities including function calling, structured outputs, and streaming, though it does not include vision processing capabilities.\n\nThe model demonstrates significant improvements over its predecessor, with expert testers preferring its responses 56% of the time and noting a 39% reduction in major errors on complex questions. With medium reasoning effort settings, o3-mini matches the performance of the larger o1 model on challenging reasoning evaluations like AIME and GPQA, while maintaining lower latency and cost.",
    "allenai/llama-3.1-tulu-3-405b": "T\u00fclu 3 405B is the largest model in the T\u00fclu 3 family, applying fully open post-training recipes at a 405B parameter scale. Built on the Llama 3.1 405B base, it leverages Reinforcement Learning with Verifiable Rewards (RLVR) to enhance instruction following, MATH, GSM8K, and IFEval performance. As part of T\u00fclu 3\u2019s fully open-source approach, it offers state-of-the-art capabilities while surpassing prior open-weight models like Llama 3.1 405B Instruct and Nous Hermes 3 405B on multiple benchmarks. To read more, [click here.](https://allenai.org/blog/tulu-3-405B)",
    "deepseek/deepseek-r1-distill-llama-8b": "DeepSeek R1 Distill Llama 8B is a distilled large language model based on [Llama-3.1-8B-Instruct](/meta-llama/llama-3.1-8b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:\n\n- AIME 2024 pass@1: 50.4\n- MATH-500 pass@1: 89.1\n- CodeForces Rating: 1205\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.\n\nHugging Face: \n- [Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B) \n- [DeepSeek-R1-Distill-Llama-8B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B)   |",
    "google/gemini-2.0-flash-001": "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    "google/gemini-2.0-flash-lite-preview-02-05:free": "Gemini Flash Lite 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](google/gemini-pro-1.5). Because it's currently in preview, it will be **heavily rate-limited** by Google. This model will move from free to paid pending a general rollout on February 24th, at $0.075 / $0.30 per million input / ouput tokens respectively.",
    "google/gemini-2.0-pro-exp-02-05:free": "Gemini 2.0 Pro Experimental is a bleeding-edge version of the Gemini 2.0 Pro model. Because it's currently experimental, it will be **heavily rate-limited** by Google.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "qwen/qwen-vl-plus:free": "Qwen's Enhanced Large Visual Language Model. Significantly upgraded for detailed recognition capabilities and text recognition abilities, supporting ultra-high pixel resolutions up to millions of pixels and extreme aspect ratios for image input. It delivers significant performance across a broad range of visual tasks.\n",
    "aion-labs/aion-1.0": "Aion-1.0 is a multi-model system designed for high performance across various tasks, including reasoning and coding. It is built on DeepSeek-R1, augmented with additional models and techniques such as Tree of Thoughts (ToT) and Mixture of Experts (MoE). It is Aion Lab's most powerful reasoning model.",
    "aion-labs/aion-1.0-mini": "Aion-1.0-Mini 32B parameter model is a distilled version of the DeepSeek-R1 model, designed for strong performance in reasoning domains such as mathematics, coding, and logic. It is a modified variant of a FuseAI model that outperforms R1-Distill-Qwen-32B and R1-Distill-Llama-70B, with benchmark results available on its [Hugging Face page](https://huggingface.co/FuseAI/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview), independently replicated for verification.",
    "aion-labs/aion-rp-llama-3.1-8b": "Aion-RP-Llama-3.1-8B ranks the highest in the character evaluation portion of the RPBench-Auto benchmark, a roleplaying-specific variant of Arena-Hard-Auto, where LLMs evaluate each other\u2019s responses. It is a fine-tuned base model rather than an instruct model, designed to produce more natural and varied writing.",
    "qwen/qwen-turbo": "Qwen-Turbo, based on Qwen2.5, is a 1M context model that provides fast speed and low cost, suitable for simple tasks.",
    "qwen/qwen2.5-vl-72b-instruct:free": "Qwen2.5-VL is proficient in recognizing common objects such as flowers, birds, fish, and insects. It is also highly capable of analyzing texts, charts, icons, graphics, and layouts within images.",
    "qwen/qwen-plus": "Qwen-Plus, based on the Qwen2.5 foundation model, is a 131K context model with a balanced performance, speed, and cost combination.",
    "qwen/qwen-max": "Qwen-Max, based on Qwen2.5, provides the best inference performance among [Qwen models](/qwen), especially for complex multi-step tasks. It's a large-scale MoE model that has been pretrained on over 20 trillion tokens and further post-trained with curated Supervised Fine-Tuning (SFT) and Reinforcement Learning from Human Feedback (RLHF) methodologies. The parameter count is unknown.",
    "openai/o3-mini": "OpenAI o3-mini is a cost-efficient language model optimized for STEM reasoning tasks, particularly excelling in science, mathematics, and coding.\n\nThis model supports the `reasoning_effort` parameter, which can be set to \"high\", \"medium\", or \"low\" to control the thinking time of the model. The default is \"medium\". OpenRouter also offers the model slug `openai/o3-mini-high` to default the parameter to \"high\".\n\nThe model features three adjustable reasoning effort levels and supports key developer capabilities including function calling, structured outputs, and streaming, though it does not include vision processing capabilities.\n\nThe model demonstrates significant improvements over its predecessor, with expert testers preferring its responses 56% of the time and noting a 39% reduction in major errors on complex questions. With medium reasoning effort settings, o3-mini matches the performance of the larger o1 model on challenging reasoning evaluations like AIME and GPQA, while maintaining lower latency and cost.",
    "deepseek/deepseek-r1-distill-qwen-1.5b": "DeepSeek R1 Distill Qwen 1.5B is a distilled large language model based on  [Qwen 2.5 Math 1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It's a very small and efficient model which outperforms [GPT 4o 0513](/openai/gpt-4o-2024-05-13) on Math Benchmarks.\n\nOther benchmark results include:\n\n- AIME 2024 pass@1: 28.9\n- AIME 2024 cons@64: 52.7\n- MATH-500 pass@1: 83.9\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
    "mistralai/mistral-small-24b-instruct-2501:free": "Mistral Small 3 is a 24B-parameter language model optimized for low-latency performance across common AI tasks. Released under the Apache 2.0 license, it features both pre-trained and instruction-tuned versions designed for efficient local deployment.\n\nThe model achieves 81% accuracy on the MMLU benchmark and performs competitively with larger models like Llama 3.3 70B and Qwen 32B, while operating at three times the speed on equivalent hardware. [Read the blog post about the model here.](https://mistral.ai/news/mistral-small-3/)",
    "mistralai/mistral-small-24b-instruct-2501": "Mistral Small 3 is a 24B-parameter language model optimized for low-latency performance across common AI tasks. Released under the Apache 2.0 license, it features both pre-trained and instruction-tuned versions designed for efficient local deployment.\n\nThe model achieves 81% accuracy on the MMLU benchmark and performs competitively with larger models like Llama 3.3 70B and Qwen 32B, while operating at three times the speed on equivalent hardware. [Read the blog post about the model here.](https://mistral.ai/news/mistral-small-3/)",
    "deepseek/deepseek-r1-distill-qwen-32b": "DeepSeek R1 Distill Qwen 32B is a distilled large language model based on [Qwen 2.5 32B](https://huggingface.co/Qwen/Qwen2.5-32B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.\n\nOther benchmark results include:\n\n- AIME 2024 pass@1: 72.6\n- MATH-500 pass@1: 94.3\n- CodeForces Rating: 1691\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
    "deepseek/deepseek-r1-distill-qwen-14b": "DeepSeek R1 Distill Qwen 14B is a distilled large language model based on [Qwen 2.5 14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.\n\nOther benchmark results include:\n\n- AIME 2024 pass@1: 69.7\n- MATH-500 pass@1: 93.9\n- CodeForces Rating: 1481\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
    "perplexity/sonar-reasoning": "Sonar Reasoning is a reasoning model provided by Perplexity based on [DeepSeek R1](/deepseek/deepseek-r1).\n\nIt allows developers to utilize long chain of thought with built-in web search. Sonar Reasoning is uncensored and hosted in US datacenters. ",
    "perplexity/sonar": "Sonar is lightweight, affordable, fast, and simple to use \u2014 now featuring citations and the ability to customize sources. It is designed for companies seeking to integrate lightweight question-and-answer features optimized for speed.",
    "liquid/lfm-7b": "LFM-7B, a new best-in-class language model. LFM-7B is designed for exceptional chat capabilities, including languages like Arabic and Japanese. Powered by the Liquid Foundation Model (LFM) architecture, it exhibits unique features like low memory footprint and fast inference speed. \n\nLFM-7B is the world\u2019s best-in-class multilingual language model in English, Arabic, and Japanese.\n\nSee the [launch announcement](https://www.liquid.ai/lfm-7b) for benchmarks and more info.",
    "liquid/lfm-3b": "Liquid's LFM 3B delivers incredible performance for its size. It positions itself as first place among 3B parameter transformers, hybrids, and RNN models It is also on par with Phi-3.5-mini on multiple benchmarks, while being 18.4% smaller.\n\nLFM-3B is the ideal choice for mobile and other edge text-based applications.\n\nSee the [launch announcement](https://www.liquid.ai/liquid-foundation-models) for benchmarks and more info.",
    "deepseek/deepseek-r1-distill-llama-70b:free": "DeepSeek R1 Distill Llama 70B is a distilled large language model based on [Llama-3.3-70B-Instruct](/meta-llama/llama-3.3-70b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:\n\n- AIME 2024 pass@1: 70.0\n- MATH-500 pass@1: 94.5\n- CodeForces Rating: 1633\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
    "deepseek/deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B is a distilled large language model based on [Llama-3.3-70B-Instruct](/meta-llama/llama-3.3-70b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:\n\n- AIME 2024 pass@1: 70.0\n- MATH-500 pass@1: 94.5\n- CodeForces Rating: 1633\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.",
    "google/gemini-2.0-flash-thinking-exp:free": "Gemini 2.0 Flash Thinking Experimental (01-21) is a snapshot of Gemini 2.0 Flash Thinking Experimental.\n\nGemini 2.0 Flash Thinking Mode is an experimental model that's trained to generate the \"thinking process\" the model goes through as part of its response. As a result, Thinking Mode is capable of stronger reasoning capabilities in its responses than the [base Gemini 2.0 Flash model](/google/gemini-2.0-flash-exp).",
    "deepseek/deepseek-r1:free": "DeepSeek R1 is here: Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.\n\nFully open-source model & [technical report](https://api-docs.deepseek.com/news/news250120).\n\nMIT licensed: Distill & commercialize freely!",
    "deepseek/deepseek-r1": "DeepSeek R1 is here: Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.\n\nFully open-source model & [technical report](https://api-docs.deepseek.com/news/news250120).\n\nMIT licensed: Distill & commercialize freely!",
    "sophosympatheia/rogue-rose-103b-v0.2:free": "Rogue Rose demonstrates strong capabilities in roleplaying and storytelling applications, potentially surpassing other models in the 103-120B parameter range. While it occasionally exhibits inconsistencies with scene logic, the overall interaction quality represents an advancement in natural language processing for creative applications.\n\nIt is a 120-layer frankenmerge model combining two custom 70B architectures from November 2023, derived from the [xwin-stellarbright-erp-70b-v2](https://huggingface.co/sophosympatheia/xwin-stellarbright-erp-70b-v2) base.\n",
    "minimax/minimax-01": "MiniMax-01 is a combines MiniMax-Text-01 for text generation and MiniMax-VL-01 for image understanding. It has 456 billion parameters, with 45.9 billion parameters activated per inference, and can handle a context of up to 4 million tokens.\n\nThe text model adopts a hybrid architecture that combines Lightning Attention, Softmax Attention, and Mixture-of-Experts (MoE). The image model adopts the \u201cViT-MLP-LLM\u201d framework and is trained on top of the text model.\n\nTo read more about the release, see: https://www.minimaxi.com/en/news/minimax-01-series-2",
    "mistralai/codestral-2501": "[Mistral](/mistralai)'s cutting-edge language model for coding. Codestral specializes in low-latency, high-frequency tasks such as fill-in-the-middle (FIM), code correction and test generation. \n\nLearn more on their blog post: https://mistral.ai/news/codestral-2501/",
    "microsoft/phi-4": "[Microsoft Research](/microsoft) Phi-4 is designed to perform well in complex reasoning tasks and can operate efficiently in situations with limited memory or where quick responses are needed. \n\nAt 14 billion parameters, it was trained on a mix of high-quality synthetic datasets, data from curated websites, and academic materials. It has undergone careful improvement to follow instructions accurately and maintain strong safety standards. It works best with English language inputs.\n\nFor more information, please see [Phi-4 Technical Report](https://arxiv.org/pdf/2412.08905)\n",
    "sao10k/l3.1-70b-hanami-x1": "This is [Sao10K](/sao10k)'s experiment over [Euryale v2.2](/sao10k/l3.1-euryale-70b).",
    "deepseek/deepseek-chat:free": "DeepSeek-V3 is the latest model from the DeepSeek team, building upon the instruction following and coding abilities of the previous versions. Pre-trained on nearly 15 trillion tokens, the reported evaluations reveal that the model outperforms other open-source models and rivals leading closed-source models.\n\nFor model details, please visit [the DeepSeek-V3 repo](https://github.com/deepseek-ai/DeepSeek-V3) for more information, or see the [launch announcement](https://api-docs.deepseek.com/news/news1226).",
    "deepseek/deepseek-chat": "DeepSeek-V3 is the latest model from the DeepSeek team, building upon the instruction following and coding abilities of the previous versions. Pre-trained on nearly 15 trillion tokens, the reported evaluations reveal that the model outperforms other open-source models and rivals leading closed-source models.\n\nFor model details, please visit [the DeepSeek-V3 repo](https://github.com/deepseek-ai/DeepSeek-V3) for more information, or see the [launch announcement](https://api-docs.deepseek.com/news/news1226).",
    "qwen/qvq-72b-preview": "QVQ-72B-Preview is an experimental research model developed by the [Qwen](/qwen) team, focusing on enhancing visual reasoning capabilities.\n\n## Performance\n\n|                | **QVQ-72B-Preview** | o1-2024-12-17 | gpt-4o-2024-05-13 | Claude3.5 Sonnet-20241022 | Qwen2VL-72B |\n|----------------|-----------------|---------------|-------------------|----------------------------|-------------|\n| MMMU(val)      | 70.3            | 77.3          | 69.1              | 70.4                       | 64.5        |\n| MathVista(mini) | 71.4            | 71.0          | 63.8              | 65.3                       | 70.5        |\n| MathVision(full)   | 35.9            | \u2013             | 30.4              | 35.6                       | 25.9        |\n| OlympiadBench  | 20.4            | \u2013             | 25.9              | \u2013                          | 11.2        |\n\n\n## Limitations\n\n1. **Language Mixing and Code-Switching:** The model might occasionally mix different languages or unexpectedly switch between them, potentially affecting the clarity of its responses.\n2. **Recursive Reasoning Loops:**  There's a risk of the model getting caught in recursive reasoning loops, leading to lengthy responses that may not even arrive at a final answer.\n3. **Safety and Ethical Considerations:** Robust safety measures are needed to ensure reliable and safe performance. Users should exercise caution when deploying this model.\n4. **Performance and Benchmark Limitations:** Despite the improvements in visual reasoning, QVQ doesn\u2019t entirely replace the capabilities of [Qwen2-VL-72B](/qwen/qwen-2-vl-72b-instruct). During multi-step visual reasoning, the model might gradually lose focus on the image content, leading to hallucinations. Moreover, QVQ doesn\u2019t show significant improvement over [Qwen2-VL-72B](/qwen/qwen-2-vl-72b-instruct) in basic recognition tasks like identifying people, animals, or plants.\n\nNote: Currently, the model only supports single-round dialogues and image outputs. It does not support video inputs.",
    "google/gemini-2.0-flash-thinking-exp-1219:free": "Gemini 2.0 Flash Thinking Mode is an experimental model that's trained to generate the \"thinking process\" the model goes through as part of its response. As a result, Thinking Mode is capable of stronger reasoning capabilities in its responses than the [base Gemini 2.0 Flash model](/google/gemini-2.0-flash-exp).",
    "sao10k/l3.3-euryale-70b": "Euryale L3.3 70B is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.2](/models/sao10k/l3-euryale-70b).",
    "openai/o1": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding. The o1 model series is trained with large-scale reinforcement learning to reason using chain of thought. \n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n",
    "eva-unit-01/eva-llama-3.33-70b": "EVA Llama 3.33 70b is a roleplay and storywriting specialist model. It is a full-parameter finetune of [Llama-3.3-70B-Instruct](https://openrouter.ai/meta-llama/llama-3.3-70b-instruct) on mixture of synthetic and natural data.\n\nIt uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and \"flavor\" of the resulting model\n\nThis model was built with Llama by Meta.\n",
    "x-ai/grok-2-vision-1212": "Grok 2 Vision 1212 advances image-based AI with stronger visual comprehension, refined instruction-following, and multilingual support. From object recognition to style analysis, it empowers developers to build more intuitive, visually aware applications. Its enhanced steerability and reasoning establish a robust foundation for next-generation image solutions.\n\nTo read more about this model, check out [xAI's announcement](https://x.ai/blog/grok-1212).",
    "x-ai/grok-2-1212": "Grok 2 1212 introduces significant enhancements to accuracy, instruction adherence, and multilingual support, making it a powerful and flexible choice for developers seeking a highly steerable, intelligent model.",
    "cohere/command-r7b-12-2024": "Command R7B (12-2024) is a small, fast update of the Command R+ model, delivered in December 2024. It excels at RAG, tool use, agents, and similar tasks requiring complex reasoning and multiple steps.\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "google/gemini-2.0-flash-exp:free": "Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.",
    "google/gemini-exp-1206:free": "Experimental release (December 6, 2024) of Gemini.",
    "meta-llama/llama-3.3-70b-instruct:free": "The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.\n\nSupported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.\n\n[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)",
    "meta-llama/llama-3.3-70b-instruct": "The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.\n\nSupported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.\n\n[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)",
    "amazon/nova-lite-v1": "Amazon Nova Lite 1.0 is a very low-cost multimodal model from Amazon that focused on fast processing of image, video, and text inputs to generate text output. Amazon Nova Lite can handle real-time customer interactions, document analysis, and visual question-answering tasks with high accuracy.\n\nWith an input context of 300K tokens, it can analyze multiple images or up to 30 minutes of video in a single input.",
    "amazon/nova-micro-v1": "Amazon Nova Micro 1.0 is a text-only model that delivers the lowest latency responses in the Amazon Nova family of models at a very low cost. With a context length of 128K tokens and optimized for speed and cost, Amazon Nova Micro excels at tasks such as text summarization, translation, content classification, interactive chat, and brainstorming. It has  simple mathematical reasoning and coding abilities.",
    "amazon/nova-pro-v1": "Amazon Nova Pro 1.0 is a capable multimodal model from Amazon focused on providing a combination of accuracy, speed, and cost for a wide range of tasks. As of December 2024, it achieves state-of-the-art performance on key benchmarks including visual question answering (TextVQA) and video understanding (VATEX).\n\nAmazon Nova Pro demonstrates strong capabilities in processing both visual and textual information and at analyzing financial documents.\n\n**NOTE**: Video input is not supported at this time.",
    "qwen/qwq-32b-preview": "QwQ-32B-Preview is an experimental research model focused on AI reasoning capabilities developed by the Qwen Team. As a preview release, it demonstrates promising analytical abilities while having several important limitations:\n\n1. **Language Mixing and Code-Switching**: The model may mix languages or switch between them unexpectedly, affecting response clarity.\n2. **Recursive Reasoning Loops**: The model may enter circular reasoning patterns, leading to lengthy responses without a conclusive answer.\n3. **Safety and Ethical Considerations**: The model requires enhanced safety measures to ensure reliable and secure performance, and users should exercise caution when deploying it.\n4. **Performance and Benchmark Limitations**: The model excels in math and coding but has room for improvement in other areas, such as common sense reasoning and nuanced language understanding.\n\n",
    "google/learnlm-1.5-pro-experimental:free": "An experimental version of [Gemini 1.5 Pro](/google/gemini-pro-1.5) from Google.",
    "eva-unit-01/eva-qwen-2.5-72b": "EVA Qwen2.5 72B is a roleplay and storywriting specialist model. It's a full-parameter finetune of Qwen2.5-72B on mixture of synthetic and natural data.\n\nIt uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and \"flavor\" of the resulting model.",
    "openai/gpt-4o-2024-11-20": "The 2024-11-20 version of GPT-4o offers a leveled-up creative writing ability with more natural, engaging, and tailored writing to improve relevance & readability. It\u2019s also better at working with uploaded files, providing deeper insights & more thorough responses.\n\nGPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.",
    "mistralai/mistral-large-2411": "Mistral Large 2 2411 is an update of [Mistral Large 2](/mistralai/mistral-large) released together with [Pixtral Large 2411](/mistralai/pixtral-large-2411)\n\nIt provides a significant upgrade on the previous [Mistral Large 24.07](/mistralai/mistral-large-2407), with notable improvements in long context understanding, a new system prompt, and more accurate function calling.",
    "mistralai/mistral-large-2407": "This is Mistral AI's flagship model, Mistral Large 2 (version mistral-large-2407). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).\n\nIt supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.\n",
    "mistralai/pixtral-large-2411": "Pixtral Large is a 124B parameter, open-weight, multimodal model built on top of [Mistral Large 2](/mistralai/mistral-large-2411). The model is able to understand documents, charts and natural images.\n\nThe model is available under the Mistral Research License (MRL) for research and educational use, and the Mistral Commercial License for experimentation, testing, and production for commercial purposes.\n\n",
    "x-ai/grok-vision-beta": "Grok Vision Beta is xAI's experimental language model with vision capability.\n\n",
    "infermatic/mn-inferor-12b": "Inferor 12B is a merge of top roleplay models, expert on immersive narratives and storytelling.\n\nThis model was merged using the [Model Stock](https://arxiv.org/abs/2403.19522) merge method using [anthracite-org/magnum-v4-12b](https://openrouter.ai/anthracite-org/magnum-v4-72b) as a base.\n",
    "qwen/qwen-2.5-coder-32b-instruct": "Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen). Qwen2.5-Coder brings the following improvements upon CodeQwen1.5:\n\n- Significantly improvements in **code generation**, **code reasoning** and **code fixing**. \n- A more comprehensive foundation for real-world applications such as **Code Agents**. Not only enhancing coding capabilities but also maintaining its strengths in mathematics and general competencies.\n\nTo read more about its evaluation results, check out [Qwen 2.5 Coder's blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).",
    "raifle/sorcererlm-8x22b": "SorcererLM is an advanced RP and storytelling model, built as a Low-rank 16-bit LoRA fine-tuned on [WizardLM-2 8x22B](/microsoft/wizardlm-2-8x22b).\n\n- Advanced reasoning and emotional intelligence for engaging and immersive interactions\n- Vivid writing capabilities enriched with spatial and contextual awareness\n- Enhanced narrative depth, promoting creative and dynamic storytelling",
    "eva-unit-01/eva-qwen-2.5-32b": "EVA Qwen2.5 32B is a roleplaying/storywriting specialist model. It's a full-parameter finetune of Qwen2.5-32B on mixture of synthetic and natural data.\n\nIt uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and \"flavor\" of the resulting model.",
    "thedrummer/unslopnemo-12b": "UnslopNemo v4.1 is the latest addition from the creator of Rocinante, designed for adventure writing and role-play scenarios.",
    "anthropic/claude-3.5-haiku:beta": "Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.\n\nThis makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.\n\nThis model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).",
    "anthropic/claude-3.5-haiku": "Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.\n\nThis makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.\n\nThis model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).",
    "anthropic/claude-3.5-haiku-20241022:beta": "Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.\n\nIt does not support image inputs.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)",
    "anthropic/claude-3.5-haiku-20241022": "Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.\n\nIt does not support image inputs.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)",
    "anthropic/claude-3.5-sonnet:beta": "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
    "anthropic/claude-3.5-sonnet": "New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
    "anthracite-org/magnum-v4-72b": "This is a series of models designed to replicate the prose quality of the Claude 3 models, specifically Sonnet(https://openrouter.ai/anthropic/claude-3.5-sonnet) and Opus(https://openrouter.ai/anthropic/claude-3-opus).\n\nThe model is fine-tuned on top of [Qwen2.5 72B](https://openrouter.ai/qwen/qwen-2.5-72b-instruct).",
    "neversleep/llama-3.1-lumimaid-70b": "Lumimaid v0.2 70B is a finetune of [Llama 3.1 70B](/meta-llama/llama-3.1-70b-instruct) with a \"HUGE step up dataset wise\" compared to Lumimaid v0.1. Sloppy chats output were purged.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "x-ai/grok-beta": "Grok Beta is xAI's experimental language model with state-of-the-art reasoning capabilities, best for complex and multi-step use cases.\n\nIt is the successor of [Grok 2](https://x.ai/blog/grok-2) with enhanced context length.",
    "mistralai/ministral-3b": "Ministral 3B is a 3B parameter model optimized for on-device and edge computing. It excels in knowledge, commonsense reasoning, and function-calling, outperforming larger models like Mistral 7B on most benchmarks. Supporting up to 128k context length, it\u2019s ideal for orchestrating agentic workflows and specialist tasks with efficient inference.",
    "mistralai/ministral-8b": "Ministral 8B is an 8B parameter model featuring a unique interleaved sliding-window attention pattern for faster, memory-efficient inference. Designed for edge use cases, it supports up to 128k context length and excels in knowledge and reasoning tasks. It outperforms peers in the sub-10B category, making it perfect for low-latency, privacy-first applications.",
    "qwen/qwen-2.5-7b-instruct": "Qwen2.5 7B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "nvidia/llama-3.1-nemotron-70b-instruct:free": "NVIDIA's Llama 3.1 Nemotron 70B is a language model designed for generating precise and useful responses. Leveraging [Llama 3.1 70B](/models/meta-llama/llama-3.1-70b-instruct) architecture and Reinforcement Learning from Human Feedback (RLHF), it excels in automatic alignment benchmarks. This model is tailored for applications requiring high accuracy in helpfulness and response generation, suitable for diverse user queries across multiple domains.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "nvidia/llama-3.1-nemotron-70b-instruct": "NVIDIA's Llama 3.1 Nemotron 70B is a language model designed for generating precise and useful responses. Leveraging [Llama 3.1 70B](/models/meta-llama/llama-3.1-70b-instruct) architecture and Reinforcement Learning from Human Feedback (RLHF), it excels in automatic alignment benchmarks. This model is tailored for applications requiring high accuracy in helpfulness and response generation, suitable for diverse user queries across multiple domains.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "inflection/inflection-3-productivity": "Inflection 3 Productivity is optimized for following instructions. It is better for tasks requiring JSON output or precise adherence to provided guidelines. It has access to recent news.\n\nFor emotional intelligence similar to Pi, see [Inflect 3 Pi](/inflection/inflection-3-pi)\n\nSee [Inflection's announcement](https://inflection.ai/blog/enterprise) for more details.",
    "inflection/inflection-3-pi": "Inflection 3 Pi powers Inflection's [Pi](https://pi.ai) chatbot, including backstory, emotional intelligence, productivity, and safety. It has access to recent news, and excels in scenarios like customer support and roleplay.\n\nPi has been trained to mirror your tone and style, if you use more emojis, so will Pi! Try experimenting with various prompts and conversation styles.",
    "google/gemini-flash-1.5-8b": "Gemini Flash 1.5 8B is optimized for speed and efficiency, offering enhanced performance in small prompt tasks like chat, transcription, and translation. With reduced latency, it is highly effective for real-time and large-scale operations. This model focuses on cost-effective solutions while maintaining high-quality results.\n\n[Click here to learn more about this model](https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).",
    "thedrummer/rocinante-12b": "Rocinante 12B is designed for engaging storytelling and rich prose.\n\nEarly testers have reported:\n- Expanded vocabulary with unique and expressive word choices\n- Enhanced creativity for vivid narratives\n- Adventure-filled and captivating stories",
    "liquid/lfm-40b": "Liquid's 40.3B Mixture of Experts (MoE) model. Liquid Foundation Models (LFMs) are large neural networks built with computational units rooted in dynamic systems.\n\nLFMs are general-purpose AI models that can be used to model any kind of sequential data, including video, audio, text, time series, and signals.\n\nSee the [launch announcement](https://www.liquid.ai/liquid-foundation-models) for benchmarks and more info.",
    "anthracite-org/magnum-v2-72b": "From the maker of [Goliath](https://openrouter.ai/models/alpindale/goliath-120b), Magnum 72B is the seventh in a family of models designed to achieve the prose quality of the Claude 3 models, notably Opus & Sonnet.\n\nThe model is based on [Qwen2 72B](https://openrouter.ai/models/qwen/qwen-2-72b-instruct) and trained with 55 million tokens of highly curated roleplay (RP) data.",
    "meta-llama/llama-3.2-3b-instruct": "Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.\n\nTrained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-11b-vision-instruct:free": "Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.\n\nIts ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-11b-vision-instruct": "Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.\n\nIts ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-90b-vision-instruct": "The Llama 90B Vision model is a top-tier, 90-billion-parameter multimodal model designed for the most challenging visual reasoning and language tasks. It offers unparalleled accuracy in image captioning, visual question answering, and advanced image-text comprehension. Pre-trained on vast multimodal datasets and fine-tuned with human feedback, the Llama 90B Vision is engineered to handle the most demanding image-based AI tasks.\n\nThis model is perfect for industries requiring cutting-edge multimodal AI capabilities, particularly those dealing with complex, real-time visual and textual analysis.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-1b-instruct:free": "Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.\n\nSupporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "meta-llama/llama-3.2-1b-instruct": "Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.\n\nSupporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.\n\nClick here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).",
    "qwen/qwen-2.5-72b-instruct": "Qwen2.5 72B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:\n\n- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.\n\n- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.\n\n- Long-context Support up to 128K tokens and can generate up to 8K tokens.\n\n- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-2-vl-72b-instruct": "Qwen2 VL 72B is a multimodal LLM from the Qwen Team with the following key enhancements:\n\n- SoTA understanding of images of various resolution & ratio: Qwen2-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.\n\n- Understanding videos of 20min+: Qwen2-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.\n\n- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.\n\n- Multilingual Support: to serve global users, besides English and Chinese, Qwen2-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "neversleep/llama-3.1-lumimaid-8b": "Lumimaid v0.2 8B is a finetune of [Llama 3.1 8B](/models/meta-llama/llama-3.1-8b-instruct) with a \"HUGE step up dataset wise\" compared to Lumimaid v0.1. Sloppy chats output were purged.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "openai/o1-mini": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "openai/o1-preview": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "openai/o1-preview-2024-09-12": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "openai/o1-mini-2024-09-12": "The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.\n\nThe o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "mistralai/pixtral-12b": "The first multi-modal, text+image-to-text model from Mistral AI. Its weights were launched via torrent: https://x.com/mistralai/status/1833758285167722836.",
    "cohere/command-r-plus-08-2024": "command-r-plus-08-2024 is an update of the [Command R+](/models/cohere/command-r-plus) with roughly 50% higher throughput and 25% lower latencies as compared to the previous Command R+ version, while keeping the hardware footprint the same.\n\nRead the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "cohere/command-r-08-2024": "command-r-08-2024 is an update of the [Command R](/models/cohere/command-r) with improved performance for multilingual retrieval-augmented generation (RAG) and tool use. More broadly, it is better at math, code and reasoning and is competitive with the previous version of the larger Command R+ model.\n\nRead the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "google/gemini-flash-1.5-8b-exp": "Gemini Flash 1.5 8B Experimental is an experimental, 8B parameter version of the [Gemini Flash 1.5](/models/google/gemini-flash-1.5) model.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal\n\nNote: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.",
    "sao10k/l3.1-euryale-70b": "Euryale L3.1 70B v2.2 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.1](/models/sao10k/l3-euryale-70b).",
    "qwen/qwen-2-vl-7b-instruct": "Qwen2 VL 7B is a multimodal LLM from the Qwen Team with the following key enhancements:\n\n- SoTA understanding of images of various resolution & ratio: Qwen2-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.\n\n- Understanding videos of 20min+: Qwen2-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.\n\n- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.\n\n- Multilingual Support: to serve global users, besides English and Chinese, Qwen2-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "ai21/jamba-1-5-large": "Jamba 1.5 Large is part of AI21's new family of open models, offering superior speed, efficiency, and quality.\n\nIt features a 256K effective context window, the longest among open models, enabling improved performance on tasks like document summarization and analysis.\n\nBuilt on a novel SSM-Transformer architecture, it outperforms larger models like Llama 3.1 70B on benchmarks while maintaining resource efficiency.\n\nRead their [announcement](https://www.ai21.com/blog/announcing-jamba-model-family) to learn more.",
    "ai21/jamba-1-5-mini": "Jamba 1.5 Mini is the world's first production-grade Mamba-based model, combining SSM and Transformer architectures for a 256K context window and high efficiency.\n\nIt works with 9 languages and can handle various writing and analysis tasks as well as or better than similar small models.\n\nThis model uses less computer memory and works faster with longer texts than previous designs.\n\nRead their [announcement](https://www.ai21.com/blog/announcing-jamba-model-family) to learn more.",
    "microsoft/phi-3.5-mini-128k-instruct": "Phi-3.5 models are lightweight, state-of-the-art open models. These models were trained with Phi-3 datasets that include both synthetic data and the filtered, publicly available websites data, with a focus on high quality and reasoning-dense properties. Phi-3.5 Mini uses 3.8B parameters, and is a dense decoder-only transformer model using the same tokenizer as [Phi-3 Mini](/models/microsoft/phi-3-mini-128k-instruct).\n\nThe models underwent a rigorous enhancement process, incorporating both supervised fine-tuning, proximal policy optimization, and direct preference optimization to ensure precise instruction adherence and robust safety measures. When assessed against benchmarks that test common sense, language understanding, math, code, long context and logical reasoning, Phi-3.5 models showcased robust and state-of-the-art performance among models with less than 13 billion parameters.",
    "nousresearch/hermes-3-llama-3.1-70b": "Hermes 3 is a generalist language model with many improvements over [Hermes 2](/models/nousresearch/nous-hermes-2-mistral-7b-dpo), including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.\n\nHermes 3 70B is a competitive, if not superior finetune of the [Llama-3.1 70B foundation model](/models/meta-llama/llama-3.1-70b-instruct), focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.\n\nThe Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.",
    "nousresearch/hermes-3-llama-3.1-405b": "Hermes 3 is a generalist language model with many improvements over Hermes 2, including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.\n\nHermes 3 405B is a frontier-level, full-parameter finetune of the Llama-3.1 405B foundation model, focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.\n\nThe Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.\n\nHermes 3 is competitive, if not superior, to Llama-3.1 Instruct models at general capabilities, with varying strengths and weaknesses attributable between the two.",
    "perplexity/llama-3.1-sonar-huge-128k-online": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance. The model is built upon the Llama 3.1 405B and has internet access.",
    "openai/chatgpt-4o-latest": "OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of [GPT-4o](/models/openai/gpt-4o) in that it has additional RLHF. It is intended for research and evaluation.\n\nOpenAI notes that this model is not suited for production use-cases as it may be removed or redirected to another model in the future.",
    "aetherwiing/mn-starcannon-12b": "Starcannon 12B v2 is a creative roleplay and story writing model, based on Mistral Nemo, using [nothingiisreal/mn-celeste-12b](/nothingiisreal/mn-celeste-12b) as a base, with [intervitens/mini-magnum-12b-v1.1](https://huggingface.co/intervitens/mini-magnum-12b-v1.1) merged in using the [TIES](https://arxiv.org/abs/2306.01708) method.\n\nAlthough more similar to Magnum overall, the model remains very creative, with a pleasant writing style. It is recommended for people wanting more variety than Magnum, and yet more verbose prose than Celeste.",
    "sao10k/l3-lunaris-8b": "Lunaris 8B is a versatile generalist and roleplaying model based on Llama 3. It's a strategic merge of multiple models, designed to balance creativity with improved logic and general knowledge.\n\nCreated by [Sao10k](https://huggingface.co/Sao10k), this model aims to offer an improved experience over Stheno v3.2, with enhanced creativity and logical reasoning.\n\nFor best results, use with Llama 3 Instruct context template, temperature 1.4, and min_p 0.1.",
    "openai/gpt-4o-2024-08-06": "The 2024-08-06 version of GPT-4o offers improved performance in structured outputs, with the ability to supply a JSON schema in the respone_format. Read more [here](https://openai.com/index/introducing-structured-outputs-in-the-api/).\n\nGPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)",
    "nothingiisreal/mn-celeste-12b": "A specialized story writing and roleplaying model based on Mistral's NeMo 12B Instruct. Fine-tuned on curated datasets including Reddit Writing Prompts and Opus Instruct 25K.\n\nThis model excels at creative writing, offering improved NSFW capabilities, with smarter and more active narration. It demonstrates remarkable versatility in both SFW and NSFW scenarios, with strong Out of Character (OOC) steering capabilities, allowing fine-tuned control over narrative direction and character behavior.\n\nCheck out the model's [HuggingFace page](https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9) for details on what parameters and prompts work best!",
    "meta-llama/llama-3.1-405b": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This is the base 405B pre-trained version.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "perplexity/llama-3.1-sonar-small-128k-chat": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3.1-sonar-small-128k-online) of this model has Internet access.",
    "perplexity/llama-3.1-sonar-large-128k-online": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3.1-sonar-large-128k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "perplexity/llama-3.1-sonar-large-128k-chat": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3.1-sonar-large-128k-online) of this model has Internet access.",
    "perplexity/llama-3.1-sonar-small-128k-online": "Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3.1-sonar-small-128k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "meta-llama/llama-3.1-405b-instruct": "The highly anticipated 400B class of Llama3 is here! Clocking in at 128k context with impressive eval scores, the Meta AI team continues to push the frontier of open-source LLMs.\n\nMeta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 405B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models including GPT-4o and Claude 3.5 Sonnet in evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-8b-instruct:free": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-8b-instruct": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3.1-70b-instruct": "Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 70B instruct-tuned version is optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "mistralai/codestral-mamba": "A 7.3B parameter Mamba-based model designed for code and reasoning tasks.\n\n- Linear time inference, allowing for theoretically infinite sequence lengths\n- 256k token context window\n- Optimized for quick responses, especially beneficial for code productivity\n- Performs comparably to state-of-the-art transformer models in code and reasoning tasks\n- Available under the Apache 2.0 license for free use, modification, and distribution",
    "mistralai/mistral-nemo:free": "A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.\n\nThe model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.\n\nIt supports function calling and is released under the Apache 2.0 license.",
    "mistralai/mistral-nemo": "A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.\n\nThe model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.\n\nIt supports function calling and is released under the Apache 2.0 license.",
    "openai/gpt-4o-mini-2024-07-18": "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
    "openai/gpt-4o-mini": "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
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
    "mistralai/mistral-7b-instruct-v0.3": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nAn improved version of [Mistral 7B Instruct v0.2](/models/mistralai/mistral-7b-instruct-v0.2), with the following changes:\n\n- Extended vocabulary to 32768\n- Supports v3 Tokenizer\n- Supports function calling\n\nNOTE: Support for function calling depends on the provider.",
    "mistralai/mistral-7b-instruct:free": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
    "mistralai/mistral-7b-instruct": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\n*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*",
    "nousresearch/hermes-2-pro-llama-3-8b": "Hermes 2 Pro is an upgraded, retrained version of Nous Hermes 2, consisting of an updated and cleaned version of the OpenHermes 2.5 Dataset, as well as a newly introduced Function Calling and JSON Mode dataset developed in-house.",
    "microsoft/phi-3-mini-128k-instruct:free": "Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.",
    "microsoft/phi-3-mini-128k-instruct": "Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.",
    "microsoft/phi-3-medium-128k-instruct:free": "Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).",
    "microsoft/phi-3-medium-128k-instruct": "Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).",
    "neversleep/llama-3-lumimaid-70b": "The NeverSleep team is back, with a Llama 3 70B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "deepseek/deepseek-chat-v2.5": "DeepSeek-V2.5 is an upgraded version that combines DeepSeek-V2-Chat and DeepSeek-Coder-V2-Instruct. The new model integrates the general and coding abilities of the two previous versions. For model details, please visit [DeepSeek-V2 page](https://github.com/deepseek-ai/DeepSeek-V2) for more information.",
    "google/gemini-flash-1.5": "Gemini 1.5 Flash is a foundation model that performs well at a variety of multimodal tasks such as visual understanding, classification, summarization, and creating content from image, audio and video. It's adept at processing visual and text inputs such as photographs, documents, infographics, and screenshots.\n\nGemini 1.5 Flash is designed for high-volume, high-frequency tasks where cost and latency matter. On most common tasks, Flash achieves comparable quality to other Gemini Pro models at a significantly reduced cost. Flash is well-suited for applications like chat assistants and on-demand content generation where speed and scale matter.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "meta-llama/llama-guard-2-8b": "This safeguard model has 8B parameters and is based on the Llama 3 family. Just like is predecessor, [LlamaGuard 1](https://huggingface.co/meta-llama/LlamaGuard-7b), it can do both prompt and response classification.\n\nLlamaGuard 2 acts as a normal LLM would, generating text that indicates whether the given input/output is safe/unsafe. If deemed unsafe, it will also share the content categories violated.\n\nFor best results, please use raw prompt input or the `/completions` endpoint, instead of the chat API.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "openai/gpt-4o-2024-05-13": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "openai/gpt-4o": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "openai/gpt-4o:extended": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "neversleep/llama-3-lumimaid-8b:extended": "The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "neversleep/llama-3-lumimaid-8b": "The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "sao10k/fimbulvetr-11b-v2": "Creative writing model, routed with permission. It's fast, it keeps the conversation going, and it stays in character.\n\nIf you submit a raw prompt, you can use Alpaca or Vicuna formats.",
    "meta-llama/llama-3-8b-instruct:free": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-8b-instruct": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-70b-instruct": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "mistralai/mixtral-8x22b-instruct": "Mistral's official instruct fine-tuned version of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b). It uses 39B active parameters out of 141B, offering unparalleled cost efficiency for its size. Its strengths include:\n- strong math, coding, and reasoning\n- large context length (64k)\n- fluency in English, French, Italian, German, and Spanish\n\nSee benchmarks on the launch announcement [here](https://mistral.ai/news/mixtral-8x22b/).\n#moe",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B is Microsoft AI's most advanced Wizard model. It demonstrates highly competitive performance compared to leading proprietary models, and it consistently outperforms all existing state-of-the-art opensource models.\n\nIt is an instruct finetune of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b).\n\nTo read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).\n\n#moe",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B is the smaller variant of Microsoft AI's latest Wizard model. It is the fastest and achieves comparable performance with existing 10x larger opensource leading models\n\nIt is a finetune of [Mistral 7B Instruct](/models/mistralai/mistral-7b-instruct), using the same technique as [WizardLM-2 8x22B](/models/microsoft/wizardlm-2-8x22b).\n\nTo read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).\n\n#moe",
    "openai/gpt-4-turbo": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to December 2023.",
    "google/gemini-pro-1.5": "Google's latest multimodal model, supports image and video[0] in text or chat prompts.\n\nOptimized for language tasks including:\n\n- Code generation\n- Text generation\n- Text editing\n- Problem solving\n- Recommendations\n- Information extraction\n- Data extraction or generation\n- AI agents\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n* [0]: Video input is not available through OpenRouter at this time.",
    "cohere/command-r-plus": "Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).\n\nIt offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "cohere/command-r-plus-04-2024": "Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).\n\nIt offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "databricks/dbrx-instruct": "DBRX is a new open source large language model developed by Databricks. At 132B, it outperforms existing open source LLMs like Llama 2 70B and [Mixtral-8x7b](/models/mistralai/mixtral-8x7b) on standard industry benchmarks for language understanding, programming, math, and logic.\n\nIt uses a fine-grained mixture-of-experts (MoE) architecture. 36B parameters are active on any input. It was pre-trained on 12T tokens of text and code data. Compared to other open MoE models like Mixtral-8x7B and Grok-1, DBRX is fine-grained, meaning it uses a larger number of smaller experts.\n\nSee the launch announcement and benchmark results [here](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm).\n\n#moe",
    "sophosympatheia/midnight-rose-70b": "A merge with a complex family tree, this model was crafted for roleplaying and storytelling. Midnight Rose is a successor to Rogue Rose and Aurora Nights and improves upon them both. It wants to produce lengthy output by default and is the best creative writing merge produced so far by sophosympatheia.\n\nDescending from earlier versions of Midnight Rose and [Wizard Tulu Dolphin 70B](https://huggingface.co/sophosympatheia/Wizard-Tulu-Dolphin-70B-v1.0), it inherits the best qualities of each.",
    "cohere/command": "Command is an instruction-following conversational model that performs language tasks with high quality, more reliably and with a longer context than our base generative models.\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "cohere/command-r": "Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.\n\nRead the launch post [here](https://txt.cohere.com/command-r/).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "anthropic/claude-3-haiku:beta": "Claude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
    "anthropic/claude-3-haiku": "Claude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
    "anthropic/claude-3-sonnet:beta": "Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-sonnet": "Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-opus:beta": "Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-opus": "Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "cohere/command-r-03-2024": "Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.\n\nRead the launch post [here](https://txt.cohere.com/command-r/).\n\nUse of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).",
    "mistralai/mistral-large": "This is Mistral AI's flagship model, Mistral Large 2 (version `mistral-large-2407`). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).\n\nIt supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.",
    "google/gemma-7b-it": "Gemma by Google is an advanced, open-source language model family, leveraging the latest in decoder-only, text-to-text technology. It offers English language capabilities across text generation tasks like question answering, summarization, and reasoning. The Gemma 7B variant is comparable in performance to leading open source models.\n\nUsage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
    "openai/gpt-3.5-turbo-0613": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
    "openai/gpt-4-turbo-preview": "The preview GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Dec 2023.\n\n**Note:** heavily rate limited by OpenAI while in preview.",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous Hermes 2 Mixtral 8x7B DPO is the new flagship Nous Research model trained over the [Mixtral 8x7B MoE LLM](/models/mistralai/mixtral-8x7b).\n\nThe model was trained on over 1,000,000 entries of primarily [GPT-4](/models/openai/gpt-4) generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.\n\n#moe",
    "mistralai/mistral-tiny": "This model is currently powered by Mistral-7B-v0.2, and incorporates a \"better\" fine-tuning than [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1), inspired by community work. It's best used for large batch processing tasks where cost is a significant factor but reasoning capabilities are not crucial.",
    "mistralai/mistral-small": "With 22 billion parameters, Mistral Small v24.09 offers a convenient mid-point between (Mistral NeMo 12B)[/mistralai/mistral-nemo] and (Mistral Large 2)[/mistralai/mistral-large], providing a cost-effective solution that can be deployed across various platforms and environments. It has better reasoning, exhibits more capabilities, can produce and reason about code, and is multiligual, supporting English, French, German, Italian, and Spanish.",
    "mistralai/mistral-medium": "This is Mistral AI's closed-source, medium-sided model. It's powered by a closed-source prototype and excels at reasoning, code, JSON, chat, and more. In benchmarks, it compares with many of the flagship models of other companies.",
    "cognitivecomputations/dolphin-mixtral-8x7b": "This is a 16k context fine-tune of [Mixtral-8x7b](/models/mistralai/mixtral-8x7b). It excels in coding tasks due to extensive training with coding data and is known for its obedience, although it lacks DPO tuning.\n\nThe model is uncensored and is stripped of alignment and bias. It requires an external alignment layer for ethical use. Users are cautioned to use this highly compliant model responsibly, as detailed in a blog post about uncensored models at [erichartford.com/uncensored-models](https://erichartford.com/uncensored-models).\n\n#moe #uncensored",
    "google/gemini-pro": "Google's flagship text generation model. Designed to handle natural language tasks, multiturn text and code chat, and code generation.\n\nSee the benchmarks and prompting guidelines from [Deepmind](https://deepmind.google/technologies/gemini/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).",
    "google/gemini-pro-vision": "Google's flagship multimodal model, supporting image and video in text or chat prompts for a text or code response.\n\nSee the benchmarks and prompting guidelines from [Deepmind](https://deepmind.google/technologies/gemini/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "mistralai/mixtral-8x7b": "Mixtral 8x7B is a pretrained generative Sparse Mixture of Experts, by Mistral AI. Incorporates 8 experts (feed-forward networks) for a total of 47B parameters. Base model (not fine-tuned for instructions) - see [Mixtral 8x7B Instruct](/models/mistralai/mixtral-8x7b-instruct) for an instruct-tuned model.\n\n#moe",
    "mistralai/mixtral-8x7b-instruct": "Mixtral 8x7B Instruct is a pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.\n\nInstruct model fine-tuned by Mistral. #moe",
    "openchat/openchat-7b:free": "OpenChat 7B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source",
    "openchat/openchat-7b": "OpenChat 7B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source",
    "neversleep/noromaid-20b": "A collab between IkariDev and Undi. This merge is suitable for RP, ERP, and general knowledge.\n\n#merge #uncensored",
    "anthropic/claude-2.1:beta": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2.1": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2:beta": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "teknium/openhermes-2.5-mistral-7b": "A continuation of [OpenHermes 2 model](/models/teknium/openhermes-2-mistral-7b), trained on additional code datasets.\nPotentially the most interesting finding from training on a good ratio (est. of around 7-14% of the total dataset) of code instruction was that it has boosted several non-code benchmarks, including TruthfulQA, AGIEval, and GPT4All suite. It did however reduce BigBench benchmark score, but the net gain overall is significant.",
    "undi95/toppy-m-7b:free": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored",
    "undi95/toppy-m-7b": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored",
    "alpindale/goliath-120b": "A large LLM created by combining two fine-tuned Llama 70B models into one 120B model. Combines Xwin and Euryale.\n\nCredits to\n- [@chargoddard](https://huggingface.co/chargoddard) for developing the framework used to merge the model - [mergekit](https://github.com/cg123/mergekit).\n- [@Undi95](https://huggingface.co/Undi95) for helping with the merge ratios.\n\n#merge",
    "openrouter/auto": "Your prompt will be processed by a meta-model and routed to one of dozens of models (see below), optimizing for the best possible output.\n\nTo see which model was used, visit [Activity](/activity), or read the `model` attribute of the response. Your response will be priced at the same rate as the routed model.\n\nThe meta-model is powered by [Not Diamond](https://docs.notdiamond.ai/docs/how-not-diamond-works). Learn more in our [docs](/docs/model-routing).\n\nRequests will be routed to the following models:\n- [openai/gpt-4o-2024-08-06](/openai/gpt-4o-2024-08-06)\n- [openai/gpt-4o-2024-05-13](/openai/gpt-4o-2024-05-13)\n- [openai/gpt-4o-mini-2024-07-18](/openai/gpt-4o-mini-2024-07-18)\n- [openai/chatgpt-4o-latest](/openai/chatgpt-4o-latest)\n- [openai/o1-preview-2024-09-12](/openai/o1-preview-2024-09-12)\n- [openai/o1-mini-2024-09-12](/openai/o1-mini-2024-09-12)\n- [anthropic/claude-3.5-sonnet](/anthropic/claude-3.5-sonnet)\n- [anthropic/claude-3.5-haiku](/anthropic/claude-3.5-haiku)\n- [anthropic/claude-3-opus](/anthropic/claude-3-opus)\n- [anthropic/claude-2.1](/anthropic/claude-2.1)\n- [google/gemini-pro-1.5](/google/gemini-pro-1.5)\n- [google/gemini-flash-1.5](/google/gemini-flash-1.5)\n- [mistralai/mistral-large-2407](/mistralai/mistral-large-2407)\n- [mistralai/mistral-nemo](/mistralai/mistral-nemo)\n- [deepseek/deepseek-r1](/deepseek/deepseek-r1)\n- [meta-llama/llama-3.1-70b-instruct](/meta-llama/llama-3.1-70b-instruct)\n- [meta-llama/llama-3.1-405b-instruct](/meta-llama/llama-3.1-405b-instruct)\n- [mistralai/mixtral-8x22b-instruct](/mistralai/mixtral-8x22b-instruct)\n- [cohere/command-r-plus](/cohere/command-r-plus)\n- [cohere/command-r](/cohere/command-r)",
    "openai/gpt-4-1106-preview": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to April 2023.",
    "openai/gpt-3.5-turbo-1106": "An older GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.",
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
    "huggingfaceh4/zephyr-7b-beta:free": "Zephyr is a series of language models that are trained to act as helpful assistants. Zephyr-7B-\u03b2 is the second model in the series, and is a fine-tuned version of [mistralai/Mistral-7B-v0.1](/models/mistralai/mistral-7b-instruct-v0.1) that was trained on a mix of publicly available, synthetic datasets using Direct Preference Optimization (DPO).",
    "mancer/weaver": "An attempt to recreate Claude-style verbosity, but don't expect the same level of coherence or memory. Meant for use in roleplay/narrative situations.",
    "anthropic/claude-2.0:beta": "Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.",
    "anthropic/claude-2.0": "Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.",
    "undi95/remm-slerp-l2-13b": "A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge",
    "google/palm-2-codechat-bison": "PaLM 2 fine-tuned for chatbot conversations that help with code-related questions.",
    "google/palm-2-chat-bison": "PaLM 2 is a language model by Google with improved multilingual, reasoning and coding capabilities.",
    "gryphe/mythomax-l2-13b:free": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "gryphe/mythomax-l2-13b": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "meta-llama/llama-2-13b-chat": "A 13 billion parameter language model from Meta, fine tuned for chat completions",
    "meta-llama/llama-2-70b-chat": "The flagship, 70 billion parameter language model from Meta, fine tuned for chat completions. Llama 2 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align to human preferences for helpfulness and safety.",
    "openai/gpt-4": "OpenAI's flagship model, GPT-4 is a large-scale multimodal language model capable of solving difficult problems with greater accuracy than previous models due to its broader general knowledge and advanced reasoning capabilities. Training data: up to Sep 2021.",
    "openai/gpt-4-0314": "GPT-4-0314 is the first version of GPT-4 released, with a context length of 8,192 tokens, and was supported until June 14. Training data: up to Sep 2021.",
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
document.getElementById('model-gpt-4o').addEventListener('click', () => selectModel('gpt-4o'));
document.getElementById('model-gpt-4-32k').addEventListener('click', () => selectModel('gpt-4-32k'));
document.getElementById('model-gpt-4-turbo').addEventListener('click', () => selectModel('gpt-4-turbo'));
document.getElementById('model-gpt-3.5').addEventListener('click', () => selectModel('gpt-3.5-turbo-0125'));
document.getElementById('model-gpt-4o-mini').addEventListener('click', () => selectModel('gpt-4o-mini'));
document.getElementById('model-gpt-o1-preview').addEventListener('click', () => selectModel('o1-preview'));
document.getElementById('model-gpt-o1').addEventListener('click', () => selectModel('o1'));
document.getElementById('model-gpt-o1-mini').addEventListener('click', () => selectModel('o1-mini'));
document.getElementById('model-gpt-o3-mini').addEventListener('click', () => selectModel('o3-mini'));

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
document.getElementById('open-router-model-mistralai-mistral-saba').addEventListener('click', () => selectModel('mistralai/mistral-saba'));
document.getElementById('open-router-model-cognitivecomputations-dolphin3.0-r1-mistral-24b-free').addEventListener('click', () => selectModel('cognitivecomputations/dolphin3.0-r1-mistral-24b:free'));
document.getElementById('open-router-model-cognitivecomputations-dolphin3.0-mistral-24b-free').addEventListener('click', () => selectModel('cognitivecomputations/dolphin3.0-mistral-24b:free'));
document.getElementById('open-router-model-meta-llama-llama-guard-3-8b').addEventListener('click', () => selectModel('meta-llama/llama-guard-3-8b'));
document.getElementById('open-router-model-openai-o3-mini-high').addEventListener('click', () => selectModel('openai/o3-mini-high'));
document.getElementById('open-router-model-allenai-llama-3.1-tulu-3-405b').addEventListener('click', () => selectModel('allenai/llama-3.1-tulu-3-405b'));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-llama-8b').addEventListener('click', () => selectModel('deepseek/deepseek-r1-distill-llama-8b'));
document.getElementById('open-router-model-google-gemini-2.0-flash-001').addEventListener('click', () => selectModel('google/gemini-2.0-flash-001'));
document.getElementById('open-router-model-google-gemini-2.0-flash-lite-preview-02-05-free').addEventListener('click', () => selectModel('google/gemini-2.0-flash-lite-preview-02-05:free'));
document.getElementById('open-router-model-google-gemini-2.0-pro-exp-02-05-free').addEventListener('click', () => selectModel('google/gemini-2.0-pro-exp-02-05:free'));
document.getElementById('open-router-model-qwen-qwen-vl-plus-free').addEventListener('click', () => selectModel('qwen/qwen-vl-plus:free'));
document.getElementById('open-router-model-aion-labs-aion-1.0').addEventListener('click', () => selectModel('aion-labs/aion-1.0'));
document.getElementById('open-router-model-aion-labs-aion-1.0-mini').addEventListener('click', () => selectModel('aion-labs/aion-1.0-mini'));
document.getElementById('open-router-model-aion-labs-aion-rp-llama-3.1-8b').addEventListener('click', () => selectModel('aion-labs/aion-rp-llama-3.1-8b'));
document.getElementById('open-router-model-qwen-qwen-turbo').addEventListener('click', () => selectModel('qwen/qwen-turbo'));
document.getElementById('open-router-model-qwen-qwen2.5-vl-72b-instruct-free').addEventListener('click', () => selectModel('qwen/qwen2.5-vl-72b-instruct:free'));
document.getElementById('open-router-model-qwen-qwen-plus').addEventListener('click', () => selectModel('qwen/qwen-plus'));
document.getElementById('open-router-model-qwen-qwen-max').addEventListener('click', () => selectModel('qwen/qwen-max'));
document.getElementById('open-router-model-openai-o3-mini').addEventListener('click', () => selectModel('openai/o3-mini'));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-qwen-1.5b').addEventListener('click', () => selectModel('deepseek/deepseek-r1-distill-qwen-1.5b'));
document.getElementById('open-router-model-mistralai-mistral-small-24b-instruct-2501-free').addEventListener('click', () => selectModel('mistralai/mistral-small-24b-instruct-2501:free'));
document.getElementById('open-router-model-mistralai-mistral-small-24b-instruct-2501').addEventListener('click', () => selectModel('mistralai/mistral-small-24b-instruct-2501'));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-qwen-32b').addEventListener('click', () => selectModel('deepseek/deepseek-r1-distill-qwen-32b'));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-qwen-14b').addEventListener('click', () => selectModel('deepseek/deepseek-r1-distill-qwen-14b'));
document.getElementById('open-router-model-perplexity-sonar-reasoning').addEventListener('click', () => selectModel('perplexity/sonar-reasoning'));
document.getElementById('open-router-model-perplexity-sonar').addEventListener('click', () => selectModel('perplexity/sonar'));
document.getElementById('open-router-model-liquid-lfm-7b').addEventListener('click', () => selectModel('liquid/lfm-7b'));
document.getElementById('open-router-model-liquid-lfm-3b').addEventListener('click', () => selectModel('liquid/lfm-3b'));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-llama-70b-free').addEventListener('click', () => selectModel('deepseek/deepseek-r1-distill-llama-70b:free'));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-llama-70b').addEventListener('click', () => selectModel('deepseek/deepseek-r1-distill-llama-70b'));
document.getElementById('open-router-model-google-gemini-2.0-flash-thinking-exp-free').addEventListener('click', () => selectModel('google/gemini-2.0-flash-thinking-exp:free'));
document.getElementById('open-router-model-deepseek-deepseek-r1-free').addEventListener('click', () => selectModel('deepseek/deepseek-r1:free'));
document.getElementById('open-router-model-deepseek-deepseek-r1').addEventListener('click', () => selectModel('deepseek/deepseek-r1'));
document.getElementById('open-router-model-sophosympatheia-rogue-rose-103b-v0.2-free').addEventListener('click', () => selectModel('sophosympatheia/rogue-rose-103b-v0.2:free'));
document.getElementById('open-router-model-minimax-minimax-01').addEventListener('click', () => selectModel('minimax/minimax-01'));
document.getElementById('open-router-model-mistralai-codestral-2501').addEventListener('click', () => selectModel('mistralai/codestral-2501'));
document.getElementById('open-router-model-microsoft-phi-4').addEventListener('click', () => selectModel('microsoft/phi-4'));
document.getElementById('open-router-model-sao10k-l3.1-70b-hanami-x1').addEventListener('click', () => selectModel('sao10k/l3.1-70b-hanami-x1'));
document.getElementById('open-router-model-deepseek-deepseek-chat-free').addEventListener('click', () => selectModel('deepseek/deepseek-chat:free'));
document.getElementById('open-router-model-deepseek-deepseek-chat').addEventListener('click', () => selectModel('deepseek/deepseek-chat'));
document.getElementById('open-router-model-qwen-qvq-72b-preview').addEventListener('click', () => selectModel('qwen/qvq-72b-preview'));
document.getElementById('open-router-model-google-gemini-2.0-flash-thinking-exp-1219-free').addEventListener('click', () => selectModel('google/gemini-2.0-flash-thinking-exp-1219:free'));
document.getElementById('open-router-model-sao10k-l3.3-euryale-70b').addEventListener('click', () => selectModel('sao10k/l3.3-euryale-70b'));
document.getElementById('open-router-model-openai-o1').addEventListener('click', () => selectModel('openai/o1'));
document.getElementById('open-router-model-eva-unit-01-eva-llama-3.33-70b').addEventListener('click', () => selectModel('eva-unit-01/eva-llama-3.33-70b'));
document.getElementById('open-router-model-x-ai-grok-2-vision-1212').addEventListener('click', () => selectModel('x-ai/grok-2-vision-1212'));
document.getElementById('open-router-model-x-ai-grok-2-1212').addEventListener('click', () => selectModel('x-ai/grok-2-1212'));
document.getElementById('open-router-model-cohere-command-r7b-12-2024').addEventListener('click', () => selectModel('cohere/command-r7b-12-2024'));
document.getElementById('open-router-model-google-gemini-2.0-flash-exp-free').addEventListener('click', () => selectModel('google/gemini-2.0-flash-exp:free'));
document.getElementById('open-router-model-google-gemini-exp-1206-free').addEventListener('click', () => selectModel('google/gemini-exp-1206:free'));
document.getElementById('open-router-model-meta-llama-llama-3.3-70b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.3-70b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.3-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.3-70b-instruct'));
document.getElementById('open-router-model-amazon-nova-lite-v1').addEventListener('click', () => selectModel('amazon/nova-lite-v1'));
document.getElementById('open-router-model-amazon-nova-micro-v1').addEventListener('click', () => selectModel('amazon/nova-micro-v1'));
document.getElementById('open-router-model-amazon-nova-pro-v1').addEventListener('click', () => selectModel('amazon/nova-pro-v1'));
document.getElementById('open-router-model-qwen-qwq-32b-preview').addEventListener('click', () => selectModel('qwen/qwq-32b-preview'));
document.getElementById('open-router-model-google-learnlm-1.5-pro-experimental-free').addEventListener('click', () => selectModel('google/learnlm-1.5-pro-experimental:free'));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-72b').addEventListener('click', () => selectModel('eva-unit-01/eva-qwen-2.5-72b'));
document.getElementById('open-router-model-openai-gpt-4o-2024-11-20').addEventListener('click', () => selectModel('openai/gpt-4o-2024-11-20'));
document.getElementById('open-router-model-mistralai-mistral-large-2411').addEventListener('click', () => selectModel('mistralai/mistral-large-2411'));
document.getElementById('open-router-model-mistralai-mistral-large-2407').addEventListener('click', () => selectModel('mistralai/mistral-large-2407'));
document.getElementById('open-router-model-mistralai-pixtral-large-2411').addEventListener('click', () => selectModel('mistralai/pixtral-large-2411'));
document.getElementById('open-router-model-x-ai-grok-vision-beta').addEventListener('click', () => selectModel('x-ai/grok-vision-beta'));
document.getElementById('open-router-model-infermatic-mn-inferor-12b').addEventListener('click', () => selectModel('infermatic/mn-inferor-12b'));
document.getElementById('open-router-model-qwen-qwen-2.5-coder-32b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2.5-coder-32b-instruct'));
document.getElementById('open-router-model-raifle-sorcererlm-8x22b').addEventListener('click', () => selectModel('raifle/sorcererlm-8x22b'));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-32b').addEventListener('click', () => selectModel('eva-unit-01/eva-qwen-2.5-32b'));
document.getElementById('open-router-model-thedrummer-unslopnemo-12b').addEventListener('click', () => selectModel('thedrummer/unslopnemo-12b'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku-20241022:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022').addEventListener('click', () => selectModel('anthropic/claude-3.5-haiku-20241022'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet'));
document.getElementById('open-router-model-anthracite-org-magnum-v4-72b').addEventListener('click', () => selectModel('anthracite-org/magnum-v4-72b'));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-70b').addEventListener('click', () => selectModel('neversleep/llama-3.1-lumimaid-70b'));
document.getElementById('open-router-model-x-ai-grok-beta').addEventListener('click', () => selectModel('x-ai/grok-beta'));
document.getElementById('open-router-model-mistralai-ministral-3b').addEventListener('click', () => selectModel('mistralai/ministral-3b'));
document.getElementById('open-router-model-mistralai-ministral-8b').addEventListener('click', () => selectModel('mistralai/ministral-8b'));
document.getElementById('open-router-model-qwen-qwen-2.5-7b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2.5-7b-instruct'));
document.getElementById('open-router-model-nvidia-llama-3.1-nemotron-70b-instruct-free').addEventListener('click', () => selectModel('nvidia/llama-3.1-nemotron-70b-instruct:free'));
document.getElementById('open-router-model-nvidia-llama-3.1-nemotron-70b-instruct').addEventListener('click', () => selectModel('nvidia/llama-3.1-nemotron-70b-instruct'));
document.getElementById('open-router-model-inflection-inflection-3-productivity').addEventListener('click', () => selectModel('inflection/inflection-3-productivity'));
document.getElementById('open-router-model-inflection-inflection-3-pi').addEventListener('click', () => selectModel('inflection/inflection-3-pi'));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b').addEventListener('click', () => selectModel('google/gemini-flash-1.5-8b'));
document.getElementById('open-router-model-thedrummer-rocinante-12b').addEventListener('click', () => selectModel('thedrummer/rocinante-12b'));
document.getElementById('open-router-model-liquid-lfm-40b').addEventListener('click', () => selectModel('liquid/lfm-40b'));
document.getElementById('open-router-model-anthracite-org-magnum-v2-72b').addEventListener('click', () => selectModel('anthracite-org/magnum-v2-72b'));
document.getElementById('open-router-model-meta-llama-llama-3.2-3b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-3b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.2-11b-vision-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-11b-vision-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.2-90b-vision-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-90b-vision-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.2-1b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.2-1b-instruct'));
document.getElementById('open-router-model-qwen-qwen-2.5-72b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2.5-72b-instruct'));
document.getElementById('open-router-model-qwen-qwen-2-vl-72b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-vl-72b-instruct'));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-8b').addEventListener('click', () => selectModel('neversleep/llama-3.1-lumimaid-8b'));
document.getElementById('open-router-model-openai-o1-mini').addEventListener('click', () => selectModel('openai/o1-mini'));
document.getElementById('open-router-model-openai-o1-preview').addEventListener('click', () => selectModel('openai/o1-preview'));
document.getElementById('open-router-model-openai-o1-preview-2024-09-12').addEventListener('click', () => selectModel('openai/o1-preview-2024-09-12'));
document.getElementById('open-router-model-openai-o1-mini-2024-09-12').addEventListener('click', () => selectModel('openai/o1-mini-2024-09-12'));
document.getElementById('open-router-model-mistralai-pixtral-12b').addEventListener('click', () => selectModel('mistralai/pixtral-12b'));
document.getElementById('open-router-model-cohere-command-r-plus-08-2024').addEventListener('click', () => selectModel('cohere/command-r-plus-08-2024'));
document.getElementById('open-router-model-cohere-command-r-08-2024').addEventListener('click', () => selectModel('cohere/command-r-08-2024'));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b-exp').addEventListener('click', () => selectModel('google/gemini-flash-1.5-8b-exp'));
document.getElementById('open-router-model-sao10k-l3.1-euryale-70b').addEventListener('click', () => selectModel('sao10k/l3.1-euryale-70b'));
document.getElementById('open-router-model-qwen-qwen-2-vl-7b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-vl-7b-instruct'));
document.getElementById('open-router-model-ai21-jamba-1-5-large').addEventListener('click', () => selectModel('ai21/jamba-1-5-large'));
document.getElementById('open-router-model-ai21-jamba-1-5-mini').addEventListener('click', () => selectModel('ai21/jamba-1-5-mini'));
document.getElementById('open-router-model-microsoft-phi-3.5-mini-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3.5-mini-128k-instruct'));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-70b').addEventListener('click', () => selectModel('nousresearch/hermes-3-llama-3.1-70b'));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-405b').addEventListener('click', () => selectModel('nousresearch/hermes-3-llama-3.1-405b'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-huge-128k-online').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-huge-128k-online'));
document.getElementById('open-router-model-openai-chatgpt-4o-latest').addEventListener('click', () => selectModel('openai/chatgpt-4o-latest'));
document.getElementById('open-router-model-aetherwiing-mn-starcannon-12b').addEventListener('click', () => selectModel('aetherwiing/mn-starcannon-12b'));
document.getElementById('open-router-model-sao10k-l3-lunaris-8b').addEventListener('click', () => selectModel('sao10k/l3-lunaris-8b'));
document.getElementById('open-router-model-openai-gpt-4o-2024-08-06').addEventListener('click', () => selectModel('openai/gpt-4o-2024-08-06'));
document.getElementById('open-router-model-nothingiisreal-mn-celeste-12b').addEventListener('click', () => selectModel('nothingiisreal/mn-celeste-12b'));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b').addEventListener('click', () => selectModel('meta-llama/llama-3.1-405b'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-chat').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-small-128k-chat'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-online').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-large-128k-online'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-chat').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-large-128k-chat'));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-online').addEventListener('click', () => selectModel('perplexity/llama-3.1-sonar-small-128k-online'));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.1-405b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3.1-8b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.1-8b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3.1-70b-instruct'));
document.getElementById('open-router-model-mistralai-codestral-mamba').addEventListener('click', () => selectModel('mistralai/codestral-mamba'));
document.getElementById('open-router-model-mistralai-mistral-nemo-free').addEventListener('click', () => selectModel('mistralai/mistral-nemo:free'));
document.getElementById('open-router-model-mistralai-mistral-nemo').addEventListener('click', () => selectModel('mistralai/mistral-nemo'));
document.getElementById('open-router-model-openai-gpt-4o-mini-2024-07-18').addEventListener('click', () => selectModel('openai/gpt-4o-mini-2024-07-18'));
document.getElementById('open-router-model-openai-gpt-4o-mini').addEventListener('click', () => selectModel('openai/gpt-4o-mini'));
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
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.3').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.3'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-free').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:free'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct'));
document.getElementById('open-router-model-nousresearch-hermes-2-pro-llama-3-8b').addEventListener('click', () => selectModel('nousresearch/hermes-2-pro-llama-3-8b'));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct-free').addEventListener('click', () => selectModel('microsoft/phi-3-mini-128k-instruct:free'));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-mini-128k-instruct'));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct-free').addEventListener('click', () => selectModel('microsoft/phi-3-medium-128k-instruct:free'));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-medium-128k-instruct'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-70b').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-70b'));
document.getElementById('open-router-model-deepseek-deepseek-chat-v2.5').addEventListener('click', () => selectModel('deepseek/deepseek-chat-v2.5'));
document.getElementById('open-router-model-google-gemini-flash-1.5').addEventListener('click', () => selectModel('google/gemini-flash-1.5'));
document.getElementById('open-router-model-meta-llama-llama-guard-2-8b').addEventListener('click', () => selectModel('meta-llama/llama-guard-2-8b'));
document.getElementById('open-router-model-openai-gpt-4o-2024-05-13').addEventListener('click', () => selectModel('openai/gpt-4o-2024-05-13'));
document.getElementById('open-router-model-openai-gpt-4o').addEventListener('click', () => selectModel('openai/gpt-4o'));
document.getElementById('open-router-model-openai-gpt-4o-extended').addEventListener('click', () => selectModel('openai/gpt-4o:extended'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b-extended').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-8b:extended'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-8b'));
document.getElementById('open-router-model-sao10k-fimbulvetr-11b-v2').addEventListener('click', () => selectModel('sao10k/fimbulvetr-11b-v2'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:free'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct'));
document.getElementById('open-router-model-mistralai-mixtral-8x22b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x22b-instruct'));
document.getElementById('open-router-model-microsoft-wizardlm-2-8x22b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-8x22b'));
document.getElementById('open-router-model-microsoft-wizardlm-2-7b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-7b'));
document.getElementById('open-router-model-openai-gpt-4-turbo').addEventListener('click', () => selectModel('openai/gpt-4-turbo'));
document.getElementById('open-router-model-google-gemini-pro-1.5').addEventListener('click', () => selectModel('google/gemini-pro-1.5'));
document.getElementById('open-router-model-cohere-command-r-plus').addEventListener('click', () => selectModel('cohere/command-r-plus'));
document.getElementById('open-router-model-cohere-command-r-plus-04-2024').addEventListener('click', () => selectModel('cohere/command-r-plus-04-2024'));
document.getElementById('open-router-model-databricks-dbrx-instruct').addEventListener('click', () => selectModel('databricks/dbrx-instruct'));
document.getElementById('open-router-model-sophosympatheia-midnight-rose-70b').addEventListener('click', () => selectModel('sophosympatheia/midnight-rose-70b'));
document.getElementById('open-router-model-cohere-command').addEventListener('click', () => selectModel('cohere/command'));
document.getElementById('open-router-model-cohere-command-r').addEventListener('click', () => selectModel('cohere/command-r'));
document.getElementById('open-router-model-anthropic-claude-3-haiku-beta').addEventListener('click', () => selectModel('anthropic/claude-3-haiku:beta'));
document.getElementById('open-router-model-anthropic-claude-3-haiku').addEventListener('click', () => selectModel('anthropic/claude-3-haiku'));
document.getElementById('open-router-model-anthropic-claude-3-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet'));
document.getElementById('open-router-model-anthropic-claude-3-opus-beta').addEventListener('click', () => selectModel('anthropic/claude-3-opus:beta'));
document.getElementById('open-router-model-anthropic-claude-3-opus').addEventListener('click', () => selectModel('anthropic/claude-3-opus'));
document.getElementById('open-router-model-cohere-command-r-03-2024').addEventListener('click', () => selectModel('cohere/command-r-03-2024'));
document.getElementById('open-router-model-mistralai-mistral-large').addEventListener('click', () => selectModel('mistralai/mistral-large'));
document.getElementById('open-router-model-google-gemma-7b-it').addEventListener('click', () => selectModel('google/gemma-7b-it'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0613').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0613'));
document.getElementById('open-router-model-openai-gpt-4-turbo-preview').addEventListener('click', () => selectModel('openai/gpt-4-turbo-preview'));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mixtral-8x7b-dpo'));
document.getElementById('open-router-model-mistralai-mistral-tiny').addEventListener('click', () => selectModel('mistralai/mistral-tiny'));
document.getElementById('open-router-model-mistralai-mistral-small').addEventListener('click', () => selectModel('mistralai/mistral-small'));
document.getElementById('open-router-model-mistralai-mistral-medium').addEventListener('click', () => selectModel('mistralai/mistral-medium'));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x7b').addEventListener('click', () => selectModel('cognitivecomputations/dolphin-mixtral-8x7b'));
document.getElementById('open-router-model-google-gemini-pro').addEventListener('click', () => selectModel('google/gemini-pro'));
document.getElementById('open-router-model-google-gemini-pro-vision').addEventListener('click', () => selectModel('google/gemini-pro-vision'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct'));
document.getElementById('open-router-model-openchat-openchat-7b-free').addEventListener('click', () => selectModel('openchat/openchat-7b:free'));
document.getElementById('open-router-model-openchat-openchat-7b').addEventListener('click', () => selectModel('openchat/openchat-7b'));
document.getElementById('open-router-model-neversleep-noromaid-20b').addEventListener('click', () => selectModel('neversleep/noromaid-20b'));
document.getElementById('open-router-model-anthropic-claude-2.1-beta').addEventListener('click', () => selectModel('anthropic/claude-2.1:beta'));
document.getElementById('open-router-model-anthropic-claude-2.1').addEventListener('click', () => selectModel('anthropic/claude-2.1'));
document.getElementById('open-router-model-anthropic-claude-2-beta').addEventListener('click', () => selectModel('anthropic/claude-2:beta'));
document.getElementById('open-router-model-anthropic-claude-2').addEventListener('click', () => selectModel('anthropic/claude-2'));
document.getElementById('open-router-model-teknium-openhermes-2.5-mistral-7b').addEventListener('click', () => selectModel('teknium/openhermes-2.5-mistral-7b'));
document.getElementById('open-router-model-undi95-toppy-m-7b-free').addEventListener('click', () => selectModel('undi95/toppy-m-7b:free'));
document.getElementById('open-router-model-undi95-toppy-m-7b').addEventListener('click', () => selectModel('undi95/toppy-m-7b'));
document.getElementById('open-router-model-alpindale-goliath-120b').addEventListener('click', () => selectModel('alpindale/goliath-120b'));
document.getElementById('open-router-model-openrouter-auto').addEventListener('click', () => selectModel('openrouter/auto'));
document.getElementById('open-router-model-openai-gpt-4-1106-preview').addEventListener('click', () => selectModel('openai/gpt-4-1106-preview'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-1106').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-1106'));
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
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta-free').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-7b-beta:free'));
document.getElementById('open-router-model-mancer-weaver').addEventListener('click', () => selectModel('mancer/weaver'));
document.getElementById('open-router-model-anthropic-claude-2.0-beta').addEventListener('click', () => selectModel('anthropic/claude-2.0:beta'));
document.getElementById('open-router-model-anthropic-claude-2.0').addEventListener('click', () => selectModel('anthropic/claude-2.0'));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b'));
document.getElementById('open-router-model-google-palm-2-codechat-bison').addEventListener('click', () => selectModel('google/palm-2-codechat-bison'));
document.getElementById('open-router-model-google-palm-2-chat-bison').addEventListener('click', () => selectModel('google/palm-2-chat-bison'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-free').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:free'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b'));
document.getElementById('open-router-model-meta-llama-llama-2-13b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-13b-chat'));
document.getElementById('open-router-model-meta-llama-llama-2-70b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-70b-chat'));
document.getElementById('open-router-model-openai-gpt-4').addEventListener('click', () => selectModel('openai/gpt-4'));
document.getElementById('open-router-model-openai-gpt-4-0314').addEventListener('click', () => selectModel('openai/gpt-4-0314'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0125').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0125'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo'));

// event listeners for descrptions
document.getElementById('open-router-model-anthropic-claude-3.7-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.7-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.7-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.7-sonnet'], event.currentTarget));
document.getElementById('open-router-model-perplexity-r1-1776').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/r1-1776'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-saba').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-saba'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin3.0-r1-mistral-24b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin3.0-r1-mistral-24b:free'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin3.0-mistral-24b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin3.0-mistral-24b:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-guard-3-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-guard-3-8b'], event.currentTarget));
document.getElementById('open-router-model-openai-o3-mini-high').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o3-mini-high'], event.currentTarget));
document.getElementById('open-router-model-allenai-llama-3.1-tulu-3-405b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['allenai/llama-3.1-tulu-3-405b'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-llama-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1-distill-llama-8b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-flash-001').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-flash-001'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-flash-lite-preview-02-05-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-flash-lite-preview-02-05:free'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-pro-exp-02-05-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-pro-exp-02-05:free'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-vl-plus-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-vl-plus:free'], event.currentTarget));
document.getElementById('open-router-model-aion-labs-aion-1.0').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['aion-labs/aion-1.0'], event.currentTarget));
document.getElementById('open-router-model-aion-labs-aion-1.0-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['aion-labs/aion-1.0-mini'], event.currentTarget));
document.getElementById('open-router-model-aion-labs-aion-rp-llama-3.1-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['aion-labs/aion-rp-llama-3.1-8b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-turbo'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen2.5-vl-72b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen2.5-vl-72b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-plus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-plus'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-max').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-max'], event.currentTarget));
document.getElementById('open-router-model-openai-o3-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o3-mini'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-qwen-1.5b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1-distill-qwen-1.5b'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-small-24b-instruct-2501-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-small-24b-instruct-2501:free'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-small-24b-instruct-2501').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-small-24b-instruct-2501'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-qwen-32b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1-distill-qwen-32b'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-qwen-14b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1-distill-qwen-14b'], event.currentTarget));
document.getElementById('open-router-model-perplexity-sonar-reasoning').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/sonar-reasoning'], event.currentTarget));
document.getElementById('open-router-model-perplexity-sonar').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/sonar'], event.currentTarget));
document.getElementById('open-router-model-liquid-lfm-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['liquid/lfm-7b'], event.currentTarget));
document.getElementById('open-router-model-liquid-lfm-3b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['liquid/lfm-3b'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-llama-70b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1-distill-llama-70b:free'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-distill-llama-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1-distill-llama-70b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-flash-thinking-exp-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-flash-thinking-exp:free'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1:free'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-r1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-r1'], event.currentTarget));
document.getElementById('open-router-model-sophosympatheia-rogue-rose-103b-v0.2-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sophosympatheia/rogue-rose-103b-v0.2:free'], event.currentTarget));
document.getElementById('open-router-model-minimax-minimax-01').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['minimax/minimax-01'], event.currentTarget));
document.getElementById('open-router-model-mistralai-codestral-2501').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/codestral-2501'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-4'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3.1-70b-hanami-x1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3.1-70b-hanami-x1'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-chat-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-chat:free'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-chat'], event.currentTarget));
document.getElementById('open-router-model-qwen-qvq-72b-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qvq-72b-preview'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-flash-thinking-exp-1219-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-flash-thinking-exp-1219:free'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3.3-euryale-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3.3-euryale-70b'], event.currentTarget));
document.getElementById('open-router-model-openai-o1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1'], event.currentTarget));
document.getElementById('open-router-model-eva-unit-01-eva-llama-3.33-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['eva-unit-01/eva-llama-3.33-70b'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-2-vision-1212').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-2-vision-1212'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-2-1212').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-2-1212'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r7b-12-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r7b-12-2024'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-2.0-flash-exp-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-2.0-flash-exp:free'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-exp-1206-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-exp-1206:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.3-70b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.3-70b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.3-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.3-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-amazon-nova-lite-v1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['amazon/nova-lite-v1'], event.currentTarget));
document.getElementById('open-router-model-amazon-nova-micro-v1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['amazon/nova-micro-v1'], event.currentTarget));
document.getElementById('open-router-model-amazon-nova-pro-v1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['amazon/nova-pro-v1'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwq-32b-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwq-32b-preview'], event.currentTarget));
document.getElementById('open-router-model-google-learnlm-1.5-pro-experimental-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/learnlm-1.5-pro-experimental:free'], event.currentTarget));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['eva-unit-01/eva-qwen-2.5-72b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-11-20').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-11-20'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large-2411').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large-2411'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large-2407').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large-2407'], event.currentTarget));
document.getElementById('open-router-model-mistralai-pixtral-large-2411').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/pixtral-large-2411'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-vision-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-vision-beta'], event.currentTarget));
document.getElementById('open-router-model-infermatic-mn-inferor-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['infermatic/mn-inferor-12b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2.5-coder-32b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2.5-coder-32b-instruct'], event.currentTarget));
document.getElementById('open-router-model-raifle-sorcererlm-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['raifle/sorcererlm-8x22b'], event.currentTarget));
document.getElementById('open-router-model-eva-unit-01-eva-qwen-2.5-32b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['eva-unit-01/eva-qwen-2.5-32b'], event.currentTarget));
document.getElementById('open-router-model-thedrummer-unslopnemo-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['thedrummer/unslopnemo-12b'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku-20241022:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-haiku-20241022').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-haiku-20241022'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet'], event.currentTarget));
document.getElementById('open-router-model-anthracite-org-magnum-v4-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthracite-org/magnum-v4-72b'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3.1-lumimaid-70b'], event.currentTarget));
document.getElementById('open-router-model-x-ai-grok-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['x-ai/grok-beta'], event.currentTarget));
document.getElementById('open-router-model-mistralai-ministral-3b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/ministral-3b'], event.currentTarget));
document.getElementById('open-router-model-mistralai-ministral-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/ministral-8b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2.5-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2.5-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-nvidia-llama-3.1-nemotron-70b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nvidia/llama-3.1-nemotron-70b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-nvidia-llama-3.1-nemotron-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nvidia/llama-3.1-nemotron-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-inflection-inflection-3-productivity').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['inflection/inflection-3-productivity'], event.currentTarget));
document.getElementById('open-router-model-inflection-inflection-3-pi').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['inflection/inflection-3-pi'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5-8b'], event.currentTarget));
document.getElementById('open-router-model-thedrummer-rocinante-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['thedrummer/rocinante-12b'], event.currentTarget));
document.getElementById('open-router-model-liquid-lfm-40b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['liquid/lfm-40b'], event.currentTarget));
document.getElementById('open-router-model-anthracite-org-magnum-v2-72b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthracite-org/magnum-v2-72b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-3b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-3b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-11b-vision-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-11b-vision-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-11b-vision-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-90b-vision-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-90b-vision-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-1b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.2-1b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.2-1b-instruct'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2.5-72b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2.5-72b-instruct'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-vl-72b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-vl-72b-instruct'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3.1-lumimaid-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3.1-lumimaid-8b'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-mini'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-preview'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-preview-2024-09-12').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-preview-2024-09-12'], event.currentTarget));
document.getElementById('open-router-model-openai-o1-mini-2024-09-12').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/o1-mini-2024-09-12'], event.currentTarget));
document.getElementById('open-router-model-mistralai-pixtral-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/pixtral-12b'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus-08-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus-08-2024'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-08-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-08-2024'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5-8b-exp').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5-8b-exp'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3.1-euryale-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3.1-euryale-70b'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-vl-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-vl-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-ai21-jamba-1-5-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['ai21/jamba-1-5-large'], event.currentTarget));
document.getElementById('open-router-model-ai21-jamba-1-5-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['ai21/jamba-1-5-mini'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3.5-mini-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3.5-mini-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-3-llama-3.1-70b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-3-llama-3.1-405b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-3-llama-3.1-405b'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-huge-128k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-huge-128k-online'], event.currentTarget));
document.getElementById('open-router-model-openai-chatgpt-4o-latest').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/chatgpt-4o-latest'], event.currentTarget));
document.getElementById('open-router-model-aetherwiing-mn-starcannon-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['aetherwiing/mn-starcannon-12b'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3-lunaris-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3-lunaris-8b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-08-06').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-08-06'], event.currentTarget));
document.getElementById('open-router-model-nothingiisreal-mn-celeste-12b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nothingiisreal/mn-celeste-12b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-405b'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-small-128k-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-large-128k-online'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-large-128k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-large-128k-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3.1-sonar-small-128k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3.1-sonar-small-128k-online'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-405b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-405b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-8b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-8b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-8b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3.1-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3.1-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-codestral-mamba').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/codestral-mamba'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-nemo-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-nemo:free'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-nemo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-nemo'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-mini-2024-07-18').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-mini-2024-07-18'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-mini').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-mini'], event.currentTarget));
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
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.3').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.3'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-2-pro-llama-3-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-2-pro-llama-3-8b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-mini-128k-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-mini-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-128k-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-70b'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-chat-v2.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-chat-v2.5'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-guard-2-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-guard-2-8b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-05-13').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-05-13'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o:extended'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-8b:extended'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-8b'], event.currentTarget));
document.getElementById('open-router-model-sao10k-fimbulvetr-11b-v2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/fimbulvetr-11b-v2'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x22b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x22b-instruct'], event.currentTarget));
document.getElementById('open-router-model-microsoft-wizardlm-2-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/wizardlm-2-8x22b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-wizardlm-2-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/wizardlm-2-7b'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-turbo'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-1.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-1.5'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus-04-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus-04-2024'], event.currentTarget));
document.getElementById('open-router-model-databricks-dbrx-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['databricks/dbrx-instruct'], event.currentTarget));
document.getElementById('open-router-model-sophosympatheia-midnight-rose-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sophosympatheia/midnight-rose-70b'], event.currentTarget));
document.getElementById('open-router-model-cohere-command').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-haiku-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-haiku:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-haiku'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-sonnet'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-opus-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-opus:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-opus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-opus'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-03-2024').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-03-2024'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-7b-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-7b-it'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0613').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0613'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-turbo-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-turbo-preview'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-2-mixtral-8x7b-dpo'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-tiny').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-tiny'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-small').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-small'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-medium').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-medium'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin-mixtral-8x7b'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-vision'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-7b:free'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-7b'], event.currentTarget));
document.getElementById('open-router-model-neversleep-noromaid-20b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/noromaid-20b'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.1-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.1:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.1'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2'], event.currentTarget));
document.getElementById('open-router-model-teknium-openhermes-2.5-mistral-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['teknium/openhermes-2.5-mistral-7b'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b:free'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b'], event.currentTarget));
document.getElementById('open-router-model-alpindale-goliath-120b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['alpindale/goliath-120b'], event.currentTarget));
document.getElementById('open-router-model-openrouter-auto').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openrouter/auto'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-1106-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-1106-preview'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-1106').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-1106'], event.currentTarget));
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
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['huggingfaceh4/zephyr-7b-beta:free'], event.currentTarget));
document.getElementById('open-router-model-mancer-weaver').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mancer/weaver'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.0-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.0:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.0').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.0'], event.currentTarget));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/remm-slerp-l2-13b'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-codechat-bison').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-codechat-bison'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-chat-bison').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-chat-bison'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b:free'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-2-13b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-2-13b-chat'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-2-70b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-2-70b-chat'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-0314').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-0314'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0125').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0125'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo'], event.currentTarget));

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
    return 20000;
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
  tokensSlider.max = '20000';
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