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
    "Claude-3.5-Sonnet": "claude-3-5-sonnet-20240620",
    "Gemini-Pro": "gemini-pro",
    "Gemini-Pro-Vision": "gemini-pro-vision",
    "Gemini-1.5-Pro": "gemini-1.5-pro",
    "Gemini-1.5-Flash": "gemini-1.5-flash",
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
    // Open Router Models
    "Auto (best for prompt)": "openrouter/auto",
    "Flavor of The Week": "openrouter/flavor-of-the-week",
    "Nous: Capybara 7B (free)": "nousresearch/nous-capybara-7b:free",
    "Mistral: Mistral 7B Instruct (free)": "mistralai/mistral-7b-instruct:free",
    "Hugging Face: Zephyr 7B (free)": "huggingfaceh4/zephyr-7b-beta:free",
    "OpenChat 3.5 7B (free)": "openchat/openchat-7b:free",
    "MythoMist 7B (free)": "gryphe/mythomist-7b:free",
    "Toppy M 7B (free)": "undi95/toppy-m-7b:free",
    "Google: Gemma 7B (free)": "google/gemma-7b-it:free",
    "Google: Gemma 2 9B (free)": "google/gemma-2-9b-it:free",
    "Meta: Llama 3 8B Instruct (free)": "meta-llama/llama-3-8b-instruct:free",
    "Phi-3 Mini 128K Instruct (free)": "microsoft/phi-3-mini-128k-instruct:free",
    "Phi-3 Medium 128K Instruct (free)": "microsoft/phi-3-medium-128k-instruct:free",
    "Psyfighter v2 13B": "koboldai/psyfighter-13b-2",
    "Neural Chat 7B v3.1": "intel/neural-chat-7b",
    "Mancer: Weaver (alpha)": "mancer/weaver",
    "Pygmalion: Mythalion 13B": "pygmalionai/mythalion-13b",
    "Xwin 70B": "xwin-lm/xwin-lm-70b",
    "Goliath 120B": "alpindale/goliath-120b",
    "Noromaid 20B": "neversleep/noromaid-20b",
    "MythoMist 7B": "gryphe/mythomist-7b",
    "Fimbulvetr 11B v2": "sao10k/fimbulvetr-11b-v2",
    "Llama 3 Lumimaid 8B": "neversleep/llama-3-lumimaid-8b",
    "Llama 3 Lumimaid 70B": "neversleep/llama-3-lumimaid-70b",
    "ReMM SLERP 13B (extended)": "undi95/remm-slerp-l2-13b:extended",
    "MythoMax 13B (extended)": "gryphe/mythomax-l2-13b:extended",
    "Meta: Llama 3 8B Instruct (extended)": "meta-llama/llama-3-8b-instruct:extended",
    "Llama 3 Lumimaid 8B (extended)": "neversleep/llama-3-lumimaid-8b:extended",
    "Meta: Llama v2 70B Chat": "meta-llama/llama-2-70b-chat",
    "Meta: Llama 3 8B (Base)": "meta-llama/llama-3-8b",
    "Meta: Llama 3 70B (Base)": "meta-llama/llama-3-70b",
    "Meta: CodeLlama 34B Instruct": "meta-llama/codellama-34b-instruct",
    "Meta: CodeLlama 70B Instruct": "meta-llama/codellama-70b-instruct",
    "Mistral: Mixtral 8x22B (base)": "mistralai/mixtral-8x22b",
    "Snowflake: Arctic Instruct": "snowflake/snowflake-arctic-instruct",
    "Qwen 1.5 110B Chat": "qwen/qwen-110b-chat",
    "Qwen 1.5 72B Chat": "qwen/qwen-72b-chat",
    "Qwen 1.5 32B Chat": "qwen/qwen-32b-chat",
    "Qwen 1.5 14B Chat": "qwen/qwen-14b-chat",
    "Qwen 1.5 7B Chat": "qwen/qwen-7b-chat",
    "Qwen 1.5 4B Chat": "qwen/qwen-4b-chat",
    "Yi 34B Chat": "01-ai/yi-34b-chat",
    "Yi 34B (base)": "01-ai/yi-34b",
    "Yi 6B (base)": "01-ai/yi-6b",
    "Mistral OpenOrca 7B": "open-orca/mistral-7b-openorca",
    "OpenHermes 2 Mistral 7B": "teknium/openhermes-2-mistral-7b",
    "ReMM SLERP 13B": "undi95/remm-slerp-l2-13b",
    "Phind: CodeLlama 34B v2": "phind/phind-codellama-34b",
    "Nous: Hermes 2 Yi 34B": "nousresearch/nous-hermes-yi-34b",
    "Nous: Hermes 2 Mixtral 8x7B SFT": "nousresearch/nous-hermes-2-mixtral-8x7b-sft",
    "Nous: Hermes 2 Mistral 7B DPO": "nousresearch/nous-hermes-2-mistral-7b-dpo",
    "Nous: Capybara 7B": "nousresearch/nous-capybara-7b",
    "StripedHyena Nous 7B": "togethercomputer/stripedhyena-nous-7b",
    "StripedHyena Hessian 7B (base)": "togethercomputer/stripedhyena-hessian-7b",
    "Databricks: DBRX 132B Instruct": "databricks/dbrx-instruct",
    "OLMo 7B Instruct": "allenai/olmo-7b-instruct",
    "Mixtral 8x7B Instruct (nitro)": "mistralai/mixtral-8x7b-instruct:nitro",
    "Meta: Llama 3 8B Instruct (nitro)": "meta-llama/llama-3-8b-instruct:nitro",
    "Meta: Llama v2 13B Chat": "meta-llama/llama-2-13b-chat",
    "OpenAI: GPT-3.5 Turbo": "openai/gpt-3.5-turbo",
    "OpenAI: GPT-3.5 Turbo 16k": "openai/gpt-3.5-turbo-16k",
    "OpenAI: GPT-3.5 Turbo 16k (older v1106)": "openai/gpt-3.5-turbo-1106",
    "OpenAI: GPT-3.5 Turbo (older v0613)": "openai/gpt-3.5-turbo-0613",
    "OpenAI: GPT-3.5 Turbo (older v0301)": "openai/gpt-3.5-turbo-0301",
    "OpenAI: GPT-4o": "openai/gpt-4o",
    "OpenAI: GPT-4o (2024-05-13)": "openai/gpt-4o-2024-05-13",
    "OpenAI: GPT-4 Turbo": "openai/gpt-4-turbo",
    "OpenAI: GPT-4 Turbo Preview": "openai/gpt-4-turbo-preview",
    "OpenAI: GPT-4 Turbo (older v1106)": "openai/gpt-4-1106-preview",
    "OpenAI: GPT-4": "openai/gpt-4",
    "OpenAI: GPT-4 (older v0314)": "openai/gpt-4-0314",
    "OpenAI: GPT-4 32k": "openai/gpt-4-32k",
    "OpenAI: GPT-4 32k (older v0314)": "openai/gpt-4-32k-0314",
    "OpenAI: GPT-4 Vision": "openai/gpt-4-vision-preview",
    "OpenAI: GPT-3.5 Turbo Instruct": "openai/gpt-3.5-turbo-instruct",
    "Google: PaLM 2 Chat": "google/palm-2-chat-bison",
    "Google: PaLM 2 Code Chat": "google/palm-2-codechat-bison",
    "Google: PaLM 2 Chat 32k": "google/palm-2-chat-bison-32k",
    "Google: PaLM 2 Code Chat 32k": "google/palm-2-codechat-bison-32k",
    "Google: Gemini Pro 1.0": "google/gemini-pro",
    "Google: Gemini Pro Vision 1.0": "google/gemini-pro-vision",
    "Google: Gemini Pro 1.5": "google/gemini-pro-1.5",
    "Google: Gemini Flash 1.5": "google/gemini-flash-1.5",
    "Mistral Tiny": "mistralai/mistral-tiny",
    "Mistral Small": "mistralai/mistral-small",
    "Mistral Medium": "mistralai/mistral-medium",
    "Mistral Large": "mistralai/mistral-large",
    "Yi Large": "01-ai/yi-large",
    "Perplexity: Llama3 Sonar 8B": "perplexity/llama-3-sonar-small-32k-chat",
    "Perplexity: Llama3 Sonar 8B Online": "perplexity/llama-3-sonar-small-32k-online",
    "Perplexity: Llama3 Sonar 70B": "perplexity/llama-3-sonar-large-32k-chat",
    "Perplexity: Llama3 Sonar 70B Online": "perplexity/llama-3-sonar-large-32k-online",
    "Anthropic: Claude 3 Opus": "anthropic/claude-3-opus",
    "Anthropic: Claude 3 Sonnet": "anthropic/claude-3-sonnet",
    "Anthropic: Claude 3.5 Sonnet": "anthropic/claude-3.5-sonnet",
    "Anthropic: Claude 3 Haiku": "anthropic/claude-3-haiku",
    "Anthropic: Claude v2": "anthropic/claude-2",
    "Anthropic: Claude v2.0": "anthropic/claude-2.0",
    "Anthropic: Claude v2.1": "anthropic/claude-2.1",
    "Anthropic: Claude Instant v1": "anthropic/claude-instant-1",
    "Cohere: Command": "cohere/command",
    "Cohere: Command R": "cohere/command-r",
    "Cohere: Command R+": "cohere/command-r-plus",
    "Anthropic: Claude v1": "anthropic/claude-1",
    "Anthropic: Claude v1.2": "anthropic/claude-1.2",
    "Anthropic: Claude Instant v1.0": "anthropic/claude-instant-1.0",
    "Anthropic: Claude Instant v1.1": "anthropic/claude-instant-1.1",
    "AI21: Jamba Instruct": "ai21/jamba-instruct",
    "Hugging Face: Zephyr 7B": "huggingfaceh4/zephyr-7b-beta",
    "Zephyr 141B-A35B": "huggingfaceh4/zephyr-orpo-141b-a35b",
    "Meta: Llama 3 8B Instruct": "meta-llama/llama-3-8b-instruct",
    "Meta: Llama 3 70B Instruct": "meta-llama/llama-3-70b-instruct",
    "Meta: LlamaGuard 2 8B": "meta-llama/llama-guard-2-8b",
    "WizardLM-2 8x22B": "microsoft/wizardlm-2-8x22b",
    "WizardLM-2 7B": "microsoft/wizardlm-2-7b",
    "Phi-3 Mini 128K Instruct": "microsoft/phi-3-mini-128k-instruct",
    "Phi-3 Medium 128K Instruct": "microsoft/phi-3-medium-128k-instruct",
    "Phi-3 Medium 4K Instruct": "microsoft/phi-3-medium-4k-instruct",
    "NVIDIA Nemotron-4 340B Instruct": "nvidia/nemotron-4-340b-instruct",
    "Mixtral 8x7B (base)": "mistralai/mixtral-8x7b",
    "Mixtral 8x7B Instruct": "mistralai/mixtral-8x7b-instruct",
    "Mistral: Mixtral 8x22B Instruct": "mistralai/mixtral-8x22b-instruct",
    "Mistral: Mistral 7B Instruct v0.1": "mistralai/mistral-7b-instruct-v0.1",
    "Mistral: Mistral 7B Instruct v0.2": "mistralai/mistral-7b-instruct-v0.2",
    "Mistral: Mistral 7B Instruct": "mistralai/mistral-7b-instruct",
    "Mistral: Mistral 7B Instruct v0.3": "mistralai/mistral-7b-instruct-v0.3",
    "Lynn: Llama 3 Soliloquy 8B v2": "lynn/soliloquy-l3",
    "Qwen 2 72B Instruct": "qwen/qwen-2-72b-instruct",
    "DeepSeek-V2 Chat": "deepseek/deepseek-chat",
    "DeepSeek-Coder-V2": "deepseek/deepseek-coder",
    "Google: Gemma 7B": "google/gemma-7b-it",
    "Google: Gemma 2 9B": "google/gemma-2-9b-it",
    "FireLLaVA 13B": "fireworks/firellava-13b",
    "Midnight Rose 70B": "sophosympatheia/midnight-rose-70b",
    "Airoboros 70B": "jondurbin/airoboros-l2-70b",
    "Chronos Hermes 13B v2": "austism/chronos-hermes-13b",
    "OpenHermes 2.5 Mistral 7B": "teknium/openhermes-2.5-mistral-7b",
    "MythoMax 13B": "gryphe/mythomax-l2-13b",
    "Toppy M 7B": "undi95/toppy-m-7b",
    "lzlv 70B": "lizpreciatior/lzlv-70b-fp16-hf",
    "Noromaid Mixtral 8x7B Instruct": "neversleep/noromaid-mixtral-8x7b-instruct",
    "Nous: Hermes 2 Mixtral 8x7B DPO": "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    "Nous: Hermes 13B": "nousresearch/nous-hermes-llama2-13b",
    "Nous: Capybara 34B": "nousresearch/nous-capybara-34b",
    "RWKV v5 World 3B": "rwkv/rwkv-5-world-3b",
    "RWKV v5 3B AI Town": "recursal/rwkv-5-3b-ai-town",
    "RWKV v5: Eagle 7B": "recursal/eagle-7b",
    "Nous: Hermes 70B": "nousresearch/nous-hermes-llama2-70b",
    "Yi 34B 200K": "01-ai/yi-34b-200k",
    "Cinematika 7B (alpha)": "openrouter/cinematika-7b",
    "Synthia 70B": "migtissera/synthia-70b",
    "Psyfighter 13B": "jebcarter/psyfighter-13b",
    "Bagel 34B v0.2": "jondurbin/bagel-34b",
    "Dolphin 2.6 Mixtral 8x7B \ud83d\udc2c": "cognitivecomputations/dolphin-mixtral-8x7b",
    "Dolphin 2.9.2 Mixtral 8x22B \ud83d\udc2c": "cognitivecomputations/dolphin-mixtral-8x22b",
    "LLaVA v1.6 34B": "liuhaotian/llava-yi-34b",
    "NousResearch: Hermes 2 Pro - Llama-3 8B": "nousresearch/hermes-2-pro-llama-3-8b",
    "OpenChat 3.5 7B": "openchat/openchat-7b",
    "OpenChat 3.6 8B": "openchat/openchat-8b",
    "StarCoder2 15B Instruct": "bigcode/starcoder2-15b-instruct",
    "Llama 3 Euryale 70B v2.1": "sao10k/l3-euryale-70b",
    "Llama 3 Stheno 8B v3.3 32K": "sao10k/l3-stheno-8b",
    "LLaVA 13B": "liuhaotian/llava-13b",
    "Nous: Hermes 2 Vision 7B (alpha)": "nousresearch/nous-hermes-2-vision-7b",
    "Meta: Llama v2 70B Chat (nitro)": "meta-llama/llama-2-70b-chat:nitro",
    "MythoMax 13B (nitro)": "gryphe/mythomax-l2-13b:nitro",
    "Mistral: Mistral 7B Instruct (nitro)": "mistralai/mistral-7b-instruct:nitro",
    "Google: Gemma 7B (nitro)": "google/gemma-7b-it:nitro",
    "Toppy M 7B (nitro)": "undi95/toppy-m-7b:nitro",
    "Meta: Llama 3 70B Instruct (nitro)": "meta-llama/llama-3-70b-instruct:nitro",
    "Anthropic: Claude 3 Opus (self-moderated)": "anthropic/claude-3-opus:beta",
    "Anthropic: Claude 3 Sonnet (self-moderated)": "anthropic/claude-3-sonnet:beta",
    "Anthropic: Claude 3.5 Sonnet (self-moderated)": "anthropic/claude-3.5-sonnet:beta",
    "Anthropic: Claude 3 Haiku (self-moderated)": "anthropic/claude-3-haiku:beta",
    "Anthropic: Claude v2 (self-moderated)": "anthropic/claude-2:beta",
    "Anthropic: Claude v2.0 (self-moderated)": "anthropic/claude-2.0:beta",
    "Anthropic: Claude v2.1 (self-moderated)": "anthropic/claude-2.1:beta",
    "Anthropic: Claude Instant v1 (self-moderated)": "anthropic/claude-instant-1:beta"
  };

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4o": "GPT-4o",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-turbo": "GPT-4-Turbo",
    "gpt-3.5-turbo-0125": "GPT-3.5-Turbo",
    "claude-3-5-sonnet-20240620": "Claude-3.5-Sonnet",
    "gemini-pro": "Gemini-Pro",
    "gemini-pro-vision": "Gemini-Pro-Vision",
    "gemini-1.5-pro": "Gemini-1.5-Pro",
    "gemini-1.5-flash": "Gemini-1.5-Flash",
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
    // Open Router Models
    "openrouter/auto": "Auto (best for prompt)",
    "openrouter/flavor-of-the-week": "Flavor of The Week",
    "nousresearch/nous-capybara-7b:free": "Nous: Capybara 7B (free)",
    "mistralai/mistral-7b-instruct:free": "Mistral: Mistral 7B Instruct (free)",
    "huggingfaceh4/zephyr-7b-beta:free": "Hugging Face: Zephyr 7B (free)",
    "openchat/openchat-7b:free": "OpenChat 3.5 7B (free)",
    "gryphe/mythomist-7b:free": "MythoMist 7B (free)",
    "undi95/toppy-m-7b:free": "Toppy M 7B (free)",
    "google/gemma-7b-it:free": "Google: Gemma 7B (free)",
    "google/gemma-2-9b-it:free": "Google: Gemma 2 9B (free)",
    "meta-llama/llama-3-8b-instruct:free": "Meta: Llama 3 8B Instruct (free)",
    "microsoft/phi-3-mini-128k-instruct:free": "Phi-3 Mini 128K Instruct (free)",
    "microsoft/phi-3-medium-128k-instruct:free": "Phi-3 Medium 128K Instruct (free)",
    "koboldai/psyfighter-13b-2": "Psyfighter v2 13B",
    "intel/neural-chat-7b": "Neural Chat 7B v3.1",
    "mancer/weaver": "Mancer: Weaver (alpha)",
    "pygmalionai/mythalion-13b": "Pygmalion: Mythalion 13B",
    "xwin-lm/xwin-lm-70b": "Xwin 70B",
    "alpindale/goliath-120b": "Goliath 120B",
    "neversleep/noromaid-20b": "Noromaid 20B",
    "gryphe/mythomist-7b": "MythoMist 7B",
    "sao10k/fimbulvetr-11b-v2": "Fimbulvetr 11B v2",
    "neversleep/llama-3-lumimaid-8b": "Llama 3 Lumimaid 8B",
    "neversleep/llama-3-lumimaid-70b": "Llama 3 Lumimaid 70B",
    "undi95/remm-slerp-l2-13b:extended": "ReMM SLERP 13B (extended)",
    "gryphe/mythomax-l2-13b:extended": "MythoMax 13B (extended)",
    "meta-llama/llama-3-8b-instruct:extended": "Meta: Llama 3 8B Instruct (extended)",
    "neversleep/llama-3-lumimaid-8b:extended": "Llama 3 Lumimaid 8B (extended)",
    "meta-llama/llama-2-70b-chat": "Meta: Llama v2 70B Chat",
    "meta-llama/llama-3-8b": "Meta: Llama 3 8B (Base)",
    "meta-llama/llama-3-70b": "Meta: Llama 3 70B (Base)",
    "meta-llama/codellama-34b-instruct": "Meta: CodeLlama 34B Instruct",
    "meta-llama/codellama-70b-instruct": "Meta: CodeLlama 70B Instruct",
    "mistralai/mixtral-8x22b": "Mistral: Mixtral 8x22B (base)",
    "snowflake/snowflake-arctic-instruct": "Snowflake: Arctic Instruct",
    "qwen/qwen-110b-chat": "Qwen 1.5 110B Chat",
    "qwen/qwen-72b-chat": "Qwen 1.5 72B Chat",
    "qwen/qwen-32b-chat": "Qwen 1.5 32B Chat",
    "qwen/qwen-14b-chat": "Qwen 1.5 14B Chat",
    "qwen/qwen-7b-chat": "Qwen 1.5 7B Chat",
    "qwen/qwen-4b-chat": "Qwen 1.5 4B Chat",
    "01-ai/yi-34b-chat": "Yi 34B Chat",
    "01-ai/yi-34b": "Yi 34B (base)",
    "01-ai/yi-6b": "Yi 6B (base)",
    "open-orca/mistral-7b-openorca": "Mistral OpenOrca 7B",
    "teknium/openhermes-2-mistral-7b": "OpenHermes 2 Mistral 7B",
    "undi95/remm-slerp-l2-13b": "ReMM SLERP 13B",
    "phind/phind-codellama-34b": "Phind: CodeLlama 34B v2",
    "nousresearch/nous-hermes-yi-34b": "Nous: Hermes 2 Yi 34B",
    "nousresearch/nous-hermes-2-mixtral-8x7b-sft": "Nous: Hermes 2 Mixtral 8x7B SFT",
    "nousresearch/nous-hermes-2-mistral-7b-dpo": "Nous: Hermes 2 Mistral 7B DPO",
    "nousresearch/nous-capybara-7b": "Nous: Capybara 7B",
    "togethercomputer/stripedhyena-nous-7b": "StripedHyena Nous 7B",
    "togethercomputer/stripedhyena-hessian-7b": "StripedHyena Hessian 7B (base)",
    "databricks/dbrx-instruct": "Databricks: DBRX 132B Instruct",
    "allenai/olmo-7b-instruct": "OLMo 7B Instruct",
    "mistralai/mixtral-8x7b-instruct:nitro": "Mixtral 8x7B Instruct (nitro)",
    "meta-llama/llama-3-8b-instruct:nitro": "Meta: Llama 3 8B Instruct (nitro)",
    "meta-llama/llama-2-13b-chat": "Meta: Llama v2 13B Chat",
    "openai/gpt-3.5-turbo": "OpenAI: GPT-3.5 Turbo",
    "openai/gpt-3.5-turbo-0125": "OpenAI: GPT-3.5 Turbo 16k",
    "openai/gpt-3.5-turbo-1106": "OpenAI: GPT-3.5 Turbo 16k (older v1106)",
    "openai/gpt-3.5-turbo-0613": "OpenAI: GPT-3.5 Turbo (older v0613)",
    "openai/gpt-3.5-turbo-0301": "OpenAI: GPT-3.5 Turbo (older v0301)",
    "openai/gpt-3.5-turbo-16k": "OpenAI: GPT-3.5 Turbo 16k",
    "openai/gpt-4o": "OpenAI: GPT-4o",
    "openai/gpt-4o-2024-05-13": "OpenAI: GPT-4o (2024-05-13)",
    "openai/gpt-4-turbo": "OpenAI: GPT-4 Turbo",
    "openai/gpt-4-turbo-preview": "OpenAI: GPT-4 Turbo Preview",
    "openai/gpt-4-1106-preview": "OpenAI: GPT-4 Turbo (older v1106)",
    "openai/gpt-4": "OpenAI: GPT-4",
    "openai/gpt-4-0314": "OpenAI: GPT-4 (older v0314)",
    "openai/gpt-4-32k": "OpenAI: GPT-4 32k",
    "openai/gpt-4-32k-0314": "OpenAI: GPT-4 32k (older v0314)",
    "openai/gpt-4-vision-preview": "OpenAI: GPT-4 Vision",
    "openai/gpt-3.5-turbo-instruct": "OpenAI: GPT-3.5 Turbo Instruct",
    "google/palm-2-chat-bison": "Google: PaLM 2 Chat",
    "google/palm-2-codechat-bison": "Google: PaLM 2 Code Chat",
    "google/palm-2-chat-bison-32k": "Google: PaLM 2 Chat 32k",
    "google/palm-2-codechat-bison-32k": "Google: PaLM 2 Code Chat 32k",
    "google/gemini-pro": "Google: Gemini Pro 1.0",
    "google/gemini-pro-vision": "Google: Gemini Pro Vision 1.0",
    "google/gemini-pro-1.5": "Google: Gemini Pro 1.5",
    "google/gemini-flash-1.5": "Google: Gemini Flash 1.5",
    "mistralai/mistral-tiny": "Mistral Tiny",
    "mistralai/mistral-small": "Mistral Small",
    "mistralai/mistral-medium": "Mistral Medium",
    "mistralai/mistral-large": "Mistral Large",
    "01-ai/yi-large": "Yi Large",
    "perplexity/llama-3-sonar-small-32k-chat": "Perplexity: Llama3 Sonar 8B",
    "perplexity/llama-3-sonar-small-32k-online": "Perplexity: Llama3 Sonar 8B Online",
    "perplexity/llama-3-sonar-large-32k-chat": "Perplexity: Llama3 Sonar 70B",
    "perplexity/llama-3-sonar-large-32k-online": "Perplexity: Llama3 Sonar 70B Online",
    "anthropic/claude-3-opus": "Anthropic: Claude 3 Opus",
    "anthropic/claude-3-sonnet": "Anthropic: Claude 3 Sonnet",
    "anthropic/claude-3.5-sonnet": "Anthropic: Claude 3.5 Sonnet",
    "anthropic/claude-3-haiku": "Anthropic: Claude 3 Haiku",
    "anthropic/claude-2": "Anthropic: Claude v2",
    "anthropic/claude-2.0": "Anthropic: Claude v2.0",
    "anthropic/claude-2.1": "Anthropic: Claude v2.1",
    "anthropic/claude-instant-1": "Anthropic: Claude Instant v1",
    "cohere/command": "Cohere: Command",
    "cohere/command-r": "Cohere: Command R",
    "cohere/command-r-plus": "Cohere: Command R+",
    "anthropic/claude-1": "Anthropic: Claude v1",
    "anthropic/claude-1.2": "Anthropic: Claude v1.2",
    "anthropic/claude-instant-1.0": "Anthropic: Claude Instant v1.0",
    "anthropic/claude-instant-1.1": "Anthropic: Claude Instant v1.1",
    "ai21/jamba-instruct": "AI21: Jamba Instruct",
    "huggingfaceh4/zephyr-7b-beta": "Hugging Face: Zephyr 7B",
    "huggingfaceh4/zephyr-orpo-141b-a35b": "Zephyr 141B-A35B",
    "meta-llama/llama-3-8b-instruct": "Meta: Llama 3 8B Instruct",
    "meta-llama/llama-3-70b-instruct": "Meta: Llama 3 70B Instruct",
    "meta-llama/llama-guard-2-8b": "Meta: LlamaGuard 2 8B",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B",
    "microsoft/phi-3-mini-128k-instruct": "Phi-3 Mini 128K Instruct",
    "microsoft/phi-3-medium-128k-instruct": "Phi-3 Medium 128K Instruct",
    "microsoft/phi-3-medium-4k-instruct": "Phi-3 Medium 4K Instruct",
    "nvidia/nemotron-4-340b-instruct": "NVIDIA Nemotron-4 340B Instruct",
    "mistralai/mixtral-8x7b": "Mixtral 8x7B (base)",
    "mistralai/mixtral-8x7b-instruct": "Mixtral 8x7B Instruct",
    "mistralai/mixtral-8x22b-instruct": "Mistral: Mixtral 8x22B Instruct",
    "mistralai/mistral-7b-instruct-v0.1": "Mistral: Mistral 7B Instruct v0.1",
    "mistralai/mistral-7b-instruct-v0.2": "Mistral: Mistral 7B Instruct v0.2",
    "mistralai/mistral-7b-instruct": "Mistral: Mistral 7B Instruct",
    "mistralai/mistral-7b-instruct-v0.3": "Mistral: Mistral 7B Instruct v0.3",
    "lynn/soliloquy-l3": "Lynn: Llama 3 Soliloquy 8B v2",
    "qwen/qwen-2-72b-instruct": "Qwen 2 72B Instruct",
    "deepseek/deepseek-chat": "DeepSeek-V2 Chat",
    "deepseek/deepseek-coder": "DeepSeek-Coder-V2",
    "google/gemma-7b-it": "Google: Gemma 7B",
    "google/gemma-2-9b-it": "Google: Gemma 2 9B",
    "fireworks/firellava-13b": "FireLLaVA 13B",
    "sophosympatheia/midnight-rose-70b": "Midnight Rose 70B",
    "jondurbin/airoboros-l2-70b": "Airoboros 70B",
    "austism/chronos-hermes-13b": "Chronos Hermes 13B v2",
    "teknium/openhermes-2.5-mistral-7b": "OpenHermes 2.5 Mistral 7B",
    "gryphe/mythomax-l2-13b": "MythoMax 13B",
    "undi95/toppy-m-7b": "Toppy M 7B",
    "lizpreciatior/lzlv-70b-fp16-hf": "lzlv 70B",
    "neversleep/noromaid-mixtral-8x7b-instruct": "Noromaid Mixtral 8x7B Instruct",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous: Hermes 2 Mixtral 8x7B DPO",
    "nousresearch/nous-hermes-llama2-13b": "Nous: Hermes 13B",
    "nousresearch/nous-capybara-34b": "Nous: Capybara 34B",
    "rwkv/rwkv-5-world-3b": "RWKV v5 World 3B",
    "recursal/rwkv-5-3b-ai-town": "RWKV v5 3B AI Town",
    "recursal/eagle-7b": "RWKV v5: Eagle 7B",
    "nousresearch/nous-hermes-llama2-70b": "Nous: Hermes 70B",
    "01-ai/yi-34b-200k": "Yi 34B 200K",
    "openrouter/cinematika-7b": "Cinematika 7B (alpha)",
    "migtissera/synthia-70b": "Synthia 70B",
    "jebcarter/psyfighter-13b": "Psyfighter 13B",
    "jondurbin/bagel-34b": "Bagel 34B v0.2",
    "cognitivecomputations/dolphin-mixtral-8x7b": "Dolphin 2.6 Mixtral 8x7B \ud83d\udc2c",
    "cognitivecomputations/dolphin-mixtral-8x22b": "Dolphin 2.9.2 Mixtral 8x22B \ud83d\udc2c",
    "liuhaotian/llava-yi-34b": "LLaVA v1.6 34B",
    "nousresearch/hermes-2-pro-llama-3-8b": "NousResearch: Hermes 2 Pro - Llama-3 8B",
    "openchat/openchat-7b": "OpenChat 3.5 7B",
    "openchat/openchat-8b": "OpenChat 3.6 8B",
    "bigcode/starcoder2-15b-instruct": "StarCoder2 15B Instruct",
    "sao10k/l3-euryale-70b": "Llama 3 Euryale 70B v2.1",
    "sao10k/l3-stheno-8b": "Llama 3 Stheno 8B v3.3 32K",
    "liuhaotian/llava-13b": "LLaVA 13B",
    "nousresearch/nous-hermes-2-vision-7b": "Nous: Hermes 2 Vision 7B (alpha)",
    "meta-llama/llama-2-70b-chat:nitro": "Meta: Llama v2 70B Chat (nitro)",
    "gryphe/mythomax-l2-13b:nitro": "MythoMax 13B (nitro)",
    "mistralai/mistral-7b-instruct:nitro": "Mistral: Mistral 7B Instruct (nitro)",
    "google/gemma-7b-it:nitro": "Google: Gemma 7B (nitro)",
    "undi95/toppy-m-7b:nitro": "Toppy M 7B (nitro)",
    "meta-llama/llama-3-70b-instruct:nitro": "Meta: Llama 3 70B Instruct (nitro)",
    "anthropic/claude-3-opus:beta": "Anthropic: Claude 3 Opus (self-moderated)",
    "anthropic/claude-3-sonnet:beta": "Anthropic: Claude 3 Sonnet (self-moderated)",
    "anthropic/claude-3.5-sonnet:beta": "Anthropic: Claude 3.5 Sonnet (self-moderated)",
    "anthropic/claude-3-haiku:beta": "Anthropic: Claude 3 Haiku (self-moderated)",
    "anthropic/claude-2:beta": "Anthropic: Claude v2 (self-moderated)",
    "anthropic/claude-2.0:beta": "Anthropic: Claude v2.0 (self-moderated)",
    "anthropic/claude-2.1:beta": "Anthropic: Claude v2.1 (self-moderated)",
    "anthropic/claude-instant-1:beta": "Anthropic: Claude Instant v1 (self-moderated)"
  };

  
// Set the Default Model

// Default model functionality
  function setDefaultModel() {
  let selectedModelDiv = document.getElementById("selected-model");
  let defaultModel = "gpt-4o";

  // Check if a model has been selected, if not, set to default model ID and update display
  if (selectedModelDiv.textContent.trim() === "Select a Model") {
    currentModelID = defaultModel; // Set the default model ID
    selectedModelDiv.textContent = customModelNames[defaultModel]; // Update display to show default model name
  }
}

let currentModelID = 'gpt-40';

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
      "gpt-3.5-turbo-0125": "GPT-3.5-Turbo: Cheapest Option Available",
      "claude-3-5-sonnet-20240620": "Most Advanced Anthropic Model",
      "gemini-pro": "Gemini-Pro: Google Bard Model — 3.5 Equivalent",
      "gemini-pro-vision": "Gemini-Vision: View Images — One-Time Use",
      "gemini-1.5-pro": "Gemini-Pro-1.5: Best Gemini Model — 2 Million Tokens",
      "gemini-1.5-flash": "Gemini-Flash-1.5: Fastest & Cheapest Google Model",
      "gemini-1.0-ultra": "Gemini-Ultra: Largest Google Model — Unreleased",
      "claude-3-opus-20240229": "Claude-Opus: Very Powerful — GPT-4 Level",
      "claude-3-sonnet-20240229": "Claude-Sonnet: Hard-Working — 3.5 Level",
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
      // open router models
    "openrouter/auto": "Depending on their size, subject, and complexity, your prompts will be sent to [Mistral Large](/models/mistralai/mistral-large), [Claude 3.5 Sonnet (self-moderated)](/models/anthropic/claude-3.5-sonnet:beta) or [GPT-4o](/models/openai/gpt-4o).  To see which model was used, visit [Activity](/activity).\n\nA major redesign of this router is coming soon. Stay tuned on [Discord](https://discord.gg/fVyRaUDgxW) for updates.",
    "openrouter/flavor-of-the-week": "This is a router model that rotates its underlying model weekly. It aims to be a simple way to explore the capabilities of new models while using the same model ID.\n\nThe current underlying model is [Llama 3 Stheno 8B v3.3 32K](/models/sao10k/l3-stheno-8b).\n\nNOTE: Pricing depends on the underlying model as well as the provider routed to. To see which model and provider were used, visit [Activity](/activity).",
    "nousresearch/nous-capybara-7b:free": "The Capybara series is a collection of datasets and models made by fine-tuning on data created by Nous, mostly in-house.\n\nV1.9 uses unalignment techniques for more consistent and dynamic control. It also leverages a significantly better foundation model, [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1).\n\nNote: this is a free, rate-limited version of [Capybara 7B](/models/nousresearch/nous-capybara-7b). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "mistralai/mistral-7b-instruct:free": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nNote: this is a free, rate-limited version of [Mistral 7B Instruct](/models/mistralai/mistral-7b-instruct). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "huggingfaceh4/zephyr-7b-beta:free": "Zephyr is a series of language models that are trained to act as helpful assistants. Zephyr-7B-\u03b2 is the second model in the series, and is a fine-tuned version of [mistralai/Mistral-7B-v0.1](/models/mistralai/mistral-7b-instruct-v0.1) that was trained on a mix of publicly available, synthetic datasets using Direct Preference Optimization (DPO).\n\nNote: this is a free, rate-limited version of [Zephyr 7B](/models/huggingfaceh4/zephyr-7b-beta). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "openchat/openchat-7b:free": "OpenChat 7B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source\n\nNote: this is a free, rate-limited version of [OpenChat 3.5 7B](/models/openchat/openchat-7b). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "gryphe/mythomist-7b:free": "From the creator of [MythoMax](/models/gryphe/mythomax-l2-13b), merges a suite of models to reduce word anticipation, ministrations, and other undesirable words in ChatGPT roleplaying data.\n\nIt combines [Neural Chat 7B](/models/intel/neural-chat-7b), Airoboros 7b, [Toppy M 7B](/models/undi95/toppy-m-7b), [Zepher 7b beta](/models/huggingfaceh4/zephyr-7b-beta), [Nous Capybara 34B](/models/nousresearch/nous-capybara-34b), [OpenHeremes 2.5](/models/teknium/openhermes-2.5-mistral-7b), and many others.\n\n#merge\n\nNote: this is a free, rate-limited version of [MythoMist 7B](/models/gryphe/mythomist-7b). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "undi95/toppy-m-7b:free": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored\n\nNote: this is a free, rate-limited version of [Toppy M 7B](/models/undi95/toppy-m-7b). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "google/gemma-7b-it:free": "Gemma by Google is an advanced, open-source language model family, leveraging the latest in decoder-only, text-to-text technology. It offers English language capabilities across text generation tasks like question answering, summarization, and reasoning. The Gemma 7B variant is comparable in performance to leading open source models.\n\nUsage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).\n\nNote: this is a free, rate-limited version of [Gemma 7B](/models/google/gemma-7b-it). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "google/gemma-2-9b-it:free": "Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.\n\nDesigned for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).\n\nNote: this is a free, rate-limited version of [Gemma 2 9B](/models/google/gemma-2-9b-it). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "meta-llama/llama-3-8b-instruct:free": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).\n\nNote: this is a free, rate-limited version of [Llama 3 8B Instruct](/models/meta-llama/llama-3-8b-instruct). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "microsoft/phi-3-mini-128k-instruct:free": "Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.\n\nNote: this is a free, rate-limited version of [Phi-3 Mini 128K Instruct](/models/microsoft/phi-3-mini-128k-instruct). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "microsoft/phi-3-medium-128k-instruct:free": "Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).\n\nNote: this is a free, rate-limited version of [Phi-3 Medium 128K Instruct](/models/microsoft/phi-3-medium-128k-instruct). Outputs may be cached. Read about rate limits [here](/docs/limits).",
    "koboldai/psyfighter-13b-2": "The v2 of [Psyfighter](/models/jebcarter/psyfighter-13b) - a merged model created by the KoboldAI community members Jeb Carter and TwistedShadows, made possible thanks to the KoboldAI merge request service.\n\nThe intent was to add medical data to supplement the model's fictional ability with more details on anatomy and mental states. This model should not be used for medical advice or therapy because of its high likelihood of pulling in fictional data.\n\nIt's a merge between:\n\n- [KoboldAI/LLaMA2-13B-Tiefighter](https://huggingface.co/KoboldAI/LLaMA2-13B-Tiefighter)\n- [Doctor-Shotgun/cat-v1.0-13b](https://huggingface.co/Doctor-Shotgun/cat-v1.0-13b)\n- [Doctor-Shotgun/llama-2-13b-chat-limarp-v2-merged](https://huggingface.co/Doctor-Shotgun/llama-2-13b-chat-limarp-v2-merged).\n\n#merge",
    "intel/neural-chat-7b": "A fine-tuned model based on [mistralai/Mistral-7B-v0.1](/models/mistralai/mistral-7b-instruct-v0.1) on the open source dataset [Open-Orca/SlimOrca](https://huggingface.co/datasets/Open-Orca/SlimOrca), aligned with DPO algorithm. For more details, refer to the blog: [The Practice of Supervised Fine-tuning and Direct Preference Optimization on Habana Gaudi2](https://medium.com/@NeuralCompressor/the-practice-of-supervised-finetuning-and-direct-preference-optimization-on-habana-gaudi2-a1197d8a3cd3).",
    "mancer/weaver": "An attempt to recreate Claude-style verbosity, but don't expect the same level of coherence or memory. Meant for use in roleplay/narrative situations.",
    "pygmalionai/mythalion-13b": "A blend of the new Pygmalion-13b and MythoMax. #merge",
    "xwin-lm/xwin-lm-70b": "Xwin-LM aims to develop and open-source alignment tech for LLMs. Our first release, built-upon on the [Llama2](/models/${Model.Llama_2_13B_Chat}) base models, ranked TOP-1 on AlpacaEval. Notably, it's the first to surpass [GPT-4](/models/${Model.GPT_4}) on this benchmark. The project will be continuously updated.",
    "alpindale/goliath-120b": "A large LLM created by combining two fine-tuned Llama 70B models into one 120B model. Combines Xwin and Euryale.\n\nCredits to\n- [@chargoddard](https://huggingface.co/chargoddard) for developing the framework used to merge the model - [mergekit](https://github.com/cg123/mergekit).\n- [@Undi95](https://huggingface.co/Undi95) for helping with the merge ratios.\n\n#merge",
    "neversleep/noromaid-20b": "A collab between IkariDev and Undi. This merge is suitable for RP, ERP, and general knowledge.\n\n#merge #uncensored",
    "gryphe/mythomist-7b": "From the creator of [MythoMax](/models/gryphe/mythomax-l2-13b), merges a suite of models to reduce word anticipation, ministrations, and other undesirable words in ChatGPT roleplaying data.\n\nIt combines [Neural Chat 7B](/models/intel/neural-chat-7b), Airoboros 7b, [Toppy M 7B](/models/undi95/toppy-m-7b), [Zepher 7b beta](/models/huggingfaceh4/zephyr-7b-beta), [Nous Capybara 34B](/models/nousresearch/nous-capybara-34b), [OpenHeremes 2.5](/models/teknium/openhermes-2.5-mistral-7b), and many others.\n\n#merge",
    "sao10k/fimbulvetr-11b-v2": "Creative writing model, routed with permission. It's fast, it keeps the conversation going, and it stays in character.\n\nIf you submit a raw prompt, you can use Alpaca or Vicuna formats.",
    "neversleep/llama-3-lumimaid-8b": "The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "neversleep/llama-3-lumimaid-70b": "The NeverSleep team is back, with a Llama 3 70B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "undi95/remm-slerp-l2-13b:extended": "A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge\n\nNote: this is an extended-context version of [ReMM SLERP 13B](/models/undi95/remm-slerp-l2-13b). It may have higher prices and different outputs.",
    "gryphe/mythomax-l2-13b:extended": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge\n\nNote: this is an extended-context version of [MythoMax 13B](/models/gryphe/mythomax-l2-13b). It may have higher prices and different outputs.",
    "meta-llama/llama-3-8b-instruct:extended": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).\n\nNote: this is an extended-context version of [Llama 3 8B Instruct](/models/meta-llama/llama-3-8b-instruct). It may have higher prices and different outputs.",
    "neversleep/llama-3-lumimaid-8b:extended": "The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.\n\nTo enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).\n\nNote: this is an extended-context version of [Llama 3 Lumimaid 8B](/models/neversleep/llama-3-lumimaid-8b). It may have higher prices and different outputs.",
    "meta-llama/llama-2-70b-chat": "The flagship, 70 billion parameter language model from Meta, fine tuned for chat completions. Llama 2 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align to human preferences for helpfulness and safety.",
    "meta-llama/llama-3-8b": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This is the base 8B pre-trained version.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-70b": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This is the base 70B pre-trained version.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/codellama-34b-instruct": "Code Llama is built upon Llama 2 and excels at filling in code, handling extensive input contexts, and following programming instructions without prior training for various programming tasks.",
    "meta-llama/codellama-70b-instruct": "Code Llama is a family of large language models for code. This one is based on [Llama 2 70B](/models/meta-llama/llama-2-70b-chat) and provides zero-shot instruction-following ability for programming tasks.",
    "mistralai/mixtral-8x22b": "Mixtral 8x22B is a large-scale language model from Mistral AI. It consists of 8 experts, each 22 billion parameters, with each token using 2 experts at a time.\n\nIt was released via [X](https://twitter.com/MistralAI/status/1777869263778291896).\n\n#moe",
    "snowflake/snowflake-arctic-instruct": "Arctic is a dense-MoE Hybrid transformer architecture pre-trained from scratch by the Snowflake AI Research Team. Arctic combines a 10B dense transformer model with a residual 128x3.66B MoE MLP resulting in 480B total and 17B active parameters chosen using a top-2 gating.\n\nTo read more about this model's release, [click here](https://www.snowflake.com/blog/arctic-open-efficient-foundation-language-models-snowflake/).",
    "qwen/qwen-110b-chat": "Qwen1.5 110B is the beta version of Qwen2, a transformer-based decoder-only language model pretrained on a large amount of data. In comparison with the previous released Qwen, the improvements include:\n\n- Significant performance improvement in human preference for chat models\n- Multilingual support of both base and chat models\n- Stable support of 32K context length for models of all sizes\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen1.5/) and [GitHub repo](https://github.com/QwenLM/Qwen1.5).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-72b-chat": "Qwen1.5 72B is the beta version of Qwen2, a transformer-based decoder-only language model pretrained on a large amount of data. In comparison with the previous released Qwen, the improvements include:\n\n- Significant performance improvement in human preference for chat models\n- Multilingual support of both base and chat models\n- Stable support of 32K context length for models of all sizes\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen1.5/) and [GitHub repo](https://github.com/QwenLM/Qwen1.5).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-32b-chat": "Qwen1.5 32B is the beta version of Qwen2, a transformer-based decoder-only language model pretrained on a large amount of data. In comparison with the previous released Qwen, the improvements include:\n\n- Significant performance improvement in human preference for chat models\n- Multilingual support of both base and chat models\n- Stable support of 32K context length for models of all sizes\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen1.5/) and [GitHub repo](https://github.com/QwenLM/Qwen1.5).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-14b-chat": "Qwen1.5 14B is the beta version of Qwen2, a transformer-based decoder-only language model pretrained on a large amount of data. In comparison with the previous released Qwen, the improvements include:\n\n- Significant performance improvement in human preference for chat models\n- Multilingual support of both base and chat models\n- Stable support of 32K context length for models of all sizes\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen1.5/) and [GitHub repo](https://github.com/QwenLM/Qwen1.5).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-7b-chat": "Qwen1.5 7B is the beta version of Qwen2, a transformer-based decoder-only language model pretrained on a large amount of data. In comparison with the previous released Qwen, the improvements include:\n\n- Significant performance improvement in human preference for chat models\n- Multilingual support of both base and chat models\n- Stable support of 32K context length for models of all sizes\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen1.5/) and [GitHub repo](https://github.com/QwenLM/Qwen1.5).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "qwen/qwen-4b-chat": "Qwen1.5 4B is the beta version of Qwen2, a transformer-based decoder-only language model pretrained on a large amount of data. In comparison with the previous released Qwen, the improvements include:\n\n- Significant performance improvement in human preference for chat models\n- Multilingual support of both base and chat models\n- Stable support of 32K context length for models of all sizes\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen1.5/) and [GitHub repo](https://github.com/QwenLM/Qwen1.5).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "01-ai/yi-34b-chat": "The Yi series models are large language models trained from scratch by developers at [01.AI](https://01.ai/). This 34B parameter model has been instruct-tuned for chat.",
    "01-ai/yi-34b": "The Yi series models are large language models trained from scratch by developers at [01.AI](https://01.ai/). This is the base 34B parameter model.",
    "01-ai/yi-6b": "The Yi series models are large language models trained from scratch by developers at [01.AI](https://01.ai/). This is the base 6B parameter model.",
    "open-orca/mistral-7b-openorca": "A fine-tune of Mistral using the OpenOrca dataset. First 7B model to beat all other models <30B.",
    "teknium/openhermes-2-mistral-7b": "Trained on 900k instructions, surpasses all previous versions of Hermes 13B and below, and matches 70B on some benchmarks. Hermes 2 has strong multiturn chat skills and system prompt capabilities.",
    "undi95/remm-slerp-l2-13b": "A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge",
    "phind/phind-codellama-34b": "A fine-tune of CodeLlama-34B on an internal dataset that helps it exceed GPT-4 on some benchmarks, including HumanEval.",
    "nousresearch/nous-hermes-yi-34b": "Nous Hermes 2 Yi 34B was trained on 1,000,000 entries of primarily GPT-4 generated data, as well as other high quality data from open datasets across the AI landscape.\n\nNous-Hermes 2 on Yi 34B outperforms all Nous-Hermes & Open-Hermes models of the past, achieving new heights in all benchmarks for a Nous Research LLM as well as surpassing many popular finetunes.",
    "nousresearch/nous-hermes-2-mixtral-8x7b-sft": "Nous Hermes 2 Mixtral 8x7B SFT is the supervised finetune only version of [the Nous Research model](/models/nousresearch/nous-hermes-2-mixtral-8x7b-dpo) trained over the [Mixtral 8x7B MoE LLM](/models/mistralai/mixtral-8x7b).\n\nThe model was trained on over 1,000,000 entries of primarily GPT-4 generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.\n\n#moe",
    "nousresearch/nous-hermes-2-mistral-7b-dpo": "This is the flagship 7B Hermes model, a Direct Preference Optimization (DPO) of [Teknium/OpenHermes-2.5-Mistral-7B](/models/teknium/openhermes-2.5-mistral-7b). It shows improvement across the board on all benchmarks tested - AGIEval, BigBench Reasoning, GPT4All, and TruthfulQA.\n\nThe model prior to DPO was trained on 1,000,000 instructions/chats of GPT-4 quality or better, primarily synthetic data as well as other high quality datasets.",
    "nousresearch/nous-capybara-7b": "The Capybara series is a collection of datasets and models made by fine-tuning on data created by Nous, mostly in-house.\n\nV1.9 uses unalignment techniques for more consistent and dynamic control. It also leverages a significantly better foundation model, [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1).",
    "togethercomputer/stripedhyena-nous-7b": "This is the chat model variant of the [StripedHyena series](/models?q=stripedhyena) developed by Together in collaboration with Nous Research.\n\nStripedHyena uses a new architecture that competes with traditional Transformers, particularly in long-context data processing. It combines attention mechanisms with gated convolutions for improved speed, efficiency, and scaling. This model marks a significant advancement in AI architecture for sequence modeling tasks.",
    "togethercomputer/stripedhyena-hessian-7b": "This is the base model variant of the [StripedHyena series](/models?q=stripedhyena), developed by Together.\n\nStripedHyena uses a new architecture that competes with traditional Transformers, particularly in long-context data processing. It combines attention mechanisms with gated convolutions for improved speed, efficiency, and scaling. This model marks an advancement in AI architecture for sequence modeling tasks.",
    "databricks/dbrx-instruct": "DBRX is a new open source large language model developed by Databricks. At 132B, it outperforms existing open source LLMs like Llama 2 70B and [Mixtral-8x7b](/models/mistralai/mixtral-8x7b) on standard industry benchmarks for language understanding, programming, math, and logic.\n\nIt uses a fine-grained mixture-of-experts (MoE) architecture. 36B parameters are active on any input. It was pre-trained on 12T tokens of text and code data. Compared to other open MoE models like Mixtral-8x7B and Grok-1, DBRX is fine-grained, meaning it uses a larger number of smaller experts.\n\nSee the launch announcement and benchmark results [here](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm).\n\n#moe",
    "allenai/olmo-7b-instruct": "OLMo 7B Instruct by the Allen Institute for AI is a model finetuned for question answering. It demonstrates **notable performance** across multiple benchmarks including TruthfulQA and ToxiGen.\n\n**Open Source**: The model, its code, checkpoints, logs are released under the [Apache 2.0 license](https://choosealicense.com/licenses/apache-2.0).\n\n- [Core repo (training, inference, fine-tuning etc.)](https://github.com/allenai/OLMo)\n- [Evaluation code](https://github.com/allenai/OLMo-Eval)\n- [Further fine-tuning code](https://github.com/allenai/open-instruct)\n- [Paper](https://arxiv.org/abs/2402.00838)\n- [Technical blog post](https://blog.allenai.org/olmo-open-language-model-87ccfc95f580)\n- [W&B Logs](https://wandb.ai/ai2-llm/OLMo-7B/reports/OLMo-7B--Vmlldzo2NzQyMzk5)",
    "mistralai/mixtral-8x7b-instruct:nitro": "A pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.\n\nInstruct model fine-tuned by Mistral. #moe\n\nNote: this is a higher-throughput version of [Mixtral 8x7B Instruct](/models/mistralai/mixtral-8x7b-instruct). It may have higher prices and slightly different outputs.",
    "meta-llama/llama-3-8b-instruct:nitro": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).\n\nNote: this is a higher-throughput version of [Llama 3 8B Instruct](/models/meta-llama/llama-3-8b-instruct). It may have higher prices and slightly different outputs.",
    "meta-llama/llama-2-13b-chat": "A 13 billion parameter language model from Meta, fine tuned for chat completions",
    "openai/gpt-3.5-turbo": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
    "openai/gpt-3.5-turbo-0125": "The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.\n\nThis version has a higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls.",
    "openai/gpt-3.5-turbo-1106": "An older GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.",
    "openai/gpt-3.5-turbo-0613": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
    "openai/gpt-3.5-turbo-0301": "GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.\n\nTraining data up to Sep 2021.",
    "openai/gpt-3.5-turbo-16k": "This model offers four times the context length of gpt-3.5-turbo, allowing it to support approximately 20 pages of text in a single request at a higher cost. Training data: up to Sep 2021.",
    "openai/gpt-4o": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "openai/gpt-4o-2024-05-13": "GPT-4o (\"o\" for \"omni\") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.\n\nFor benchmarking against other models, it was briefly called [\"im-also-a-good-gpt2-chatbot\"](https://twitter.com/LiamFedus/status/1790064963966370209)\n\n#multimodal",
    "openai/gpt-4-turbo": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to December 2023.",
    "openai/gpt-4-turbo-preview": "The preview GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Dec 2023.\n\n**Note:** heavily rate limited by OpenAI while in preview.",
    "openai/gpt-4-1106-preview": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.\n\nTraining data: up to April 2023.",
    "openai/gpt-4": "OpenAI's flagship model, GPT-4 is a large-scale multimodal language model capable of solving difficult problems with greater accuracy than previous models due to its broader general knowledge and advanced reasoning capabilities. Training data: up to Sep 2021.",
    "openai/gpt-4-0314": "GPT-4-0314 is the first version of GPT-4 released, with a context length of 8,192 tokens, and was supported until June 14. Training data: up to Sep 2021.",
    "openai/gpt-4-32k": "GPT-4-32k is an extended version of GPT-4, with the same capabilities but quadrupled context length, allowing for processing up to 40 pages of text in a single pass. This is particularly beneficial for handling longer content like interacting with PDFs without an external vector database. Training data: up to Sep 2021.",
    "openai/gpt-4-32k-0314": "GPT-4-32k is an extended version of GPT-4, with the same capabilities but quadrupled context length, allowing for processing up to 40 pages of text in a single pass. This is particularly beneficial for handling longer content like interacting with PDFs without an external vector database. Training data: up to Sep 2021.",
    "openai/gpt-4-vision-preview": "Ability to understand images, in addition to all other [GPT-4 Turbo capabilties](/models/openai/gpt-4-turbo). Training data: up to Apr 2023.\n\n**Note:** heavily rate limited by OpenAI while in preview.\n\n#multimodal",
    "openai/gpt-3.5-turbo-instruct": "This model is a variant of GPT-3.5 Turbo tuned for instructional prompts and omitting chat-related optimizations. Training data: up to Sep 2021.",
    "google/palm-2-chat-bison": "PaLM 2 is a language model by Google with improved multilingual, reasoning and coding capabilities.",
    "google/palm-2-codechat-bison": "PaLM 2 fine-tuned for chatbot conversations that help with code-related questions.",
    "google/palm-2-chat-bison-32k": "PaLM 2 is a language model by Google with improved multilingual, reasoning and coding capabilities.",
    "google/palm-2-codechat-bison-32k": "PaLM 2 fine-tuned for chatbot conversations that help with code-related questions.",
    "google/gemini-pro": "Google's flagship text generation model. Designed to handle natural language tasks, multiturn text and code chat, and code generation.\n\nSee the benchmarks and prompting guidelines from [Deepmind](https://deepmind.google/technologies/gemini/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).",
    "google/gemini-pro-vision": "Google's flagship multimodal model, supporting image and video in text or chat prompts for a text or code response.\n\nSee the benchmarks and prompting guidelines from [Deepmind](https://deepmind.google/technologies/gemini/).\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "google/gemini-pro-1.5": "Google's latest multimodal model, supporting image and video in text or chat prompts.\n\nOptimized for language tasks including:\n\n- Code generation\n- Text generation\n- Text editing\n- Problem solving\n- Recommendations\n- Information extraction\n- Data extraction or generation\n- AI agents\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "google/gemini-flash-1.5": "Gemini 1.5 Flash is a foundation model that performs well at a variety of multimodal tasks such as visual understanding, classification, summarization, and creating content from image, audio and video. It's adept at processing visual and text inputs such as photographs, documents, infographics, and screenshots.\n\nGemini 1.5 Flash is designed for high-volume, high-frequency tasks where cost and latency matter. On most common tasks, Flash achieves comparable quality to other Gemini Pro models at a significantly reduced cost. Flash is well-suited for applications like chat assistants and on-demand content generation where speed and scale matter.\n\nUsage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).\n\n#multimodal",
    "mistralai/mistral-tiny": "This model is currently powered by Mistral-7B-v0.2, and incorporates a \"better\" fine-tuning than [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1), inspired by community work. It's best used for large batch processing tasks where cost is a significant factor but reasoning capabilities are not crucial.",
    "mistralai/mistral-small": "This model is currently powered by Mixtral-8X7B-v0.1, a sparse mixture of experts model with 12B active parameters. It has better reasoning, exhibits more capabilities, can produce and reason about code, and is multiligual, supporting English, French, German, Italian, and Spanish.\n#moe",
    "mistralai/mistral-medium": "This is Mistral AI's closed-source, medium-sided model. It's powered by a closed-source prototype and excels at reasoning, code, JSON, chat, and more. In benchmarks, it compares with many of the flagship models of other companies.",
    "mistralai/mistral-large": "This is Mistral AI's closed-source, flagship model. It's powered by a closed-source prototype and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large/).\n\nIt is fluent in English, French, Spanish, German, and Italian, with high grammatical accuracy, and its 32K tokens context window allows precise information recall from large documents.",
    "01-ai/yi-large": "The Yi Large model was designed by 01.AI with the following usecases in mind: knowledge search, data classification, human-like chat bots, and customer service.\n\nIt stands out for its multilingual proficiency, particularly in Spanish, Chinese, Japanese, German, and French.\n\nCheck out the [launch announcement](https://01-ai.github.io/blog/01.ai-yi-large-llm-launch) to learn more.",
    "perplexity/llama-3-sonar-small-32k-chat": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3-sonar-small-32k-online) of this model has Internet access.",
    "perplexity/llama-3-sonar-small-32k-online": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3-sonar-small-32k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "perplexity/llama-3-sonar-large-32k-chat": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is a normal offline LLM, but the [online version](/models/perplexity/llama-3-sonar-large-32k-online) of this model has Internet access.",
    "perplexity/llama-3-sonar-large-32k-online": "Llama3 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.\n\nThis is the online version of the [offline chat model](/models/perplexity/llama-3-sonar-large-32k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online",
    "anthropic/claude-3-opus": "Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-sonnet": "Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
    "anthropic/claude-3-haiku": "Claude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
    "anthropic/claude-2": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2.0": "Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.",
    "anthropic/claude-2.1": "Claude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-instant-1": "Anthropic's model for low-latency, high throughput text generation. Supports hundreds of pages of text.",
    "cohere/command": "Command is an instruction-following conversational model that performs language tasks with high quality, more reliably and with a longer context than our base generative models.\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "cohere/command-r": "Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.\n\nRead the launch post [here](https://txt.cohere.com/command-r/).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "cohere/command-r-plus": "Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).\n\nIt offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).\n\nUse of this model is subject to Cohere's [Acceptable Use Policy](https://docs.cohere.com/docs/c4ai-acceptable-use-policy).",
    "anthropic/claude-1": "Anthropic's model for low-latency, high throughput text generation. Supports hundreds of pages of text.",
    "anthropic/claude-1.2": "Anthropic's model for low-latency, high throughput text generation. Supports hundreds of pages of text.",
    "anthropic/claude-instant-1.0": "Anthropic's model for low-latency, high throughput text generation. Supports hundreds of pages of text.",
    "anthropic/claude-instant-1.1": "Anthropic's model for low-latency, high throughput text generation. Supports hundreds of pages of text.",
    "ai21/jamba-instruct": "The Jamba-Instruct model, introduced by AI21 Labs, is an instruction-tuned variant of their hybrid SSM-Transformer Jamba model, specifically optimized for enterprise applications.\n\n- 256K Context Window: It can process extensive information, equivalent to a 400-page novel, which is beneficial for tasks involving large documents such as financial reports or legal documents\n- Safety and Accuracy: Jamba-Instruct is designed with enhanced safety features to ensure secure deployment in enterprise environments, reducing the risk and cost of implementation\n\nRead their [announcement](https://www.ai21.com/blog/announcing-jamba) to learn more.\n\nJamba has a knowledge cutoff of February 2024.",
    "huggingfaceh4/zephyr-7b-beta": "Zephyr is a series of language models that are trained to act as helpful assistants. Zephyr-7B-\u03b2 is the second model in the series, and is a fine-tuned version of [mistralai/Mistral-7B-v0.1](/models/mistralai/mistral-7b-instruct-v0.1) that was trained on a mix of publicly available, synthetic datasets using Direct Preference Optimization (DPO).",
    "huggingfaceh4/zephyr-orpo-141b-a35b": "Zephyr 141B-A35B is A Mixture of Experts (MoE) model with 141B total parameters and 35B active parameters. Fine-tuned on a mix of publicly available, synthetic datasets.\n\nIt is an instruct finetune of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b).\n\n#moe",
    "meta-llama/llama-3-8b-instruct": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-3-70b-instruct": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "meta-llama/llama-guard-2-8b": "This safeguard model has 8B parameters and is based on the Llama 3 family. Just like is predecessor, [LlamaGuard 1](https://huggingface.co/meta-llama/LlamaGuard-7b), it can do both prompt and response classification.\n\nLlamaGuard 2 acts as a normal LLM would, generating text that indicates whether the given input/output is safe/unsafe. If deemed unsafe, it will also share the content categories violated.\n\nFor best results, please use raw prompt input or the `/completions` endpoint, instead of the chat API.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B is Microsoft AI's most advanced Wizard model. It demonstrates highly competitive performance compared to leading proprietary models, and it consistently outperforms all existing state-of-the-art opensource models.\n\nIt is an instruct finetune of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b).\n\nTo read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).\n\n#moe",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B is the smaller variant of Microsoft AI's latest Wizard model. It is the fastest and achieves comparable performance with existing 10x larger opensource leading models\n\nIt is a finetune of [Mistral 7B Instruct](/models/mistralai/mistral-7b-instruct), using the same technique as [WizardLM-2 8x22B](/models/microsoft/wizardlm-2-8x22b).\n\nTo read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).\n\n#moe",
    "microsoft/phi-3-mini-128k-instruct": "Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.",
    "microsoft/phi-3-medium-128k-instruct": "Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).",
    "microsoft/phi-3-medium-4k-instruct": "Phi-3 4K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.\n\nAt time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.\n\nFor 128k context length, try [Phi-3 Medium 128K](/models/microsoft/phi-3-medium-128k-instruct).",
    "nvidia/nemotron-4-340b-instruct": "Nemotron-4-340B-Instruct is an English-language chat model optimized for synthetic data generation. This large language model (LLM) is a fine-tuned version of Nemotron-4-340B-Base, designed for single and multi-turn chat use-cases with a 4,096 token context length.\n\nThe base model was pre-trained on 9 trillion tokens from diverse English texts, 50+ natural languages, and 40+ coding languages. The instruct model underwent additional alignment steps:\n\n1. Supervised Fine-tuning (SFT)\n2. Direct Preference Optimization (DPO)\n3. Reward-aware Preference Optimization (RPO)\n\nThe alignment process used approximately 20K human-annotated samples, while 98% of the data for fine-tuning was synthetically generated. Detailed information about the synthetic data generation pipeline is available in the [technical report](https://arxiv.org/html/2406.11704v1).",
    "mistralai/mixtral-8x7b": "A pretrained generative Sparse Mixture of Experts, by Mistral AI. Incorporates 8 experts (feed-forward networks) for a total of 47B parameters. Base model (not fine-tuned for instructions) - see [Mixtral 8x7B Instruct](/models/mistralai/mixtral-8x7b-instruct) for an instruct-tuned model.\n\n#moe",
    "mistralai/mixtral-8x7b-instruct": "A pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.\n\nInstruct model fine-tuned by Mistral. #moe",
    "mistralai/mixtral-8x22b-instruct": "Mistral's official instruct fine-tuned version of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b). It uses 39B active parameters out of 141B, offering unparalleled cost efficiency for its size. Its strengths include:\n- strong math, coding, and reasoning\n- large context length (64k)\n- fluency in English, French, Italian, German, and Spanish\n\nSee benchmarks on the launch announcement [here](https://mistral.ai/news/mixtral-8x22b/).\n#moe",
    "mistralai/mistral-7b-instruct-v0.1": "A 7.3B parameter model that outperforms Llama 2 13B on all benchmarks, with optimizations for speed and context length.",
    "mistralai/mistral-7b-instruct-v0.2": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nAn improved version of [Mistral 7B Instruct](/modelsmistralai/mistral-7b-instruct-v0.1), with the following changes:\n\n- 32k context window (vs 8k context in v0.1)\n- Rope-theta = 1e6\n- No Sliding-Window Attention",
    "mistralai/mistral-7b-instruct": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.",
    "mistralai/mistral-7b-instruct-v0.3": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nAn improved version of [Mistral 7B Instruct v0.2](/models/mistralai/mistral-7b-instruct-v0.2), with the following changes:\n\n- Extended vocabulary to 32768\n- Supports v3 Tokenizer\n- Supports function calling\n\nNOTE: Support for function calling depends on the provider.",
    "lynn/soliloquy-l3": "Soliloquy-L3 v2 is a fast, highly capable roleplaying model designed for immersive, dynamic experiences. Trained on over 250 million tokens of roleplaying data, Soliloquy-L3 has a vast knowledge base, rich literary expression, and support for up to 24k context length. It outperforms existing ~13B models, delivering enhanced roleplaying capabilities.\n\nUsage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).",
    "qwen/qwen-2-72b-instruct": "Qwen2 72B is a transformer-based model that excels in language understanding, multilingual capabilities, coding, mathematics, and reasoning.\n\nIt features SwiGLU activation, attention QKV bias, and group query attention. It is pretrained on extensive data with supervised finetuning and direct preference optimization.\n\nFor more details, see this [blog post](https://qwenlm.github.io/blog/qwen2/) and [GitHub repo](https://github.com/QwenLM/Qwen2).\n\nUsage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).",
    "deepseek/deepseek-chat": "DeepSeek-V2 Chat is a conversational finetune of DeepSeek-V2, a Mixture-of-Experts (MoE) language model. It comprises 236B total parameters, of which 21B are activated for each token.\n\nCompared with DeepSeek 67B, DeepSeek-V2 achieves stronger performance, and meanwhile saves 42.5% of training costs, reduces the KV cache by 93.3%, and boosts the maximum generation throughput to 5.76 times.\n\nDeepSeek-V2 achieves remarkable performance on both standard benchmarks and open-ended generation evaluations.",
    "deepseek/deepseek-coder": "DeepSeek-Coder-V2, an open-source Mixture-of-Experts (MoE) code language model. It is further pre-trained from an intermediate checkpoint of DeepSeek-V2 with additional 6 trillion tokens.\n\nThe original V1 model was trained from scratch on 2T tokens, with a composition of 87% code and 13% natural language in both English and Chinese. It was pre-trained on project-level code corpus by employing a extra fill-in-the-blank task.",
    "google/gemma-7b-it": "Gemma by Google is an advanced, open-source language model family, leveraging the latest in decoder-only, text-to-text technology. It offers English language capabilities across text generation tasks like question answering, summarization, and reasoning. The Gemma 7B variant is comparable in performance to leading open source models.\n\nUsage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
    "google/gemma-2-9b-it": "Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.\n\nDesigned for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.\n\nSee the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).",
    "fireworks/firellava-13b": "A blazing fast vision-language model, FireLLaVA quickly understands both text and images. It achieves impressive chat skills in tests, and was designed to mimic multimodal GPT-4.\n\nThe first commercially permissive open source LLaVA model, trained entirely on open source LLM generated instruction following data.",
    "sophosympatheia/midnight-rose-70b": "A merge with a complex family tree, this model was crafted for roleplaying and storytelling. Midnight Rose is a successor to Rogue Rose and Aurora Nights and improves upon them both. It wants to produce lengthy output by default and is the best creative writing merge produced so far by sophosympatheia.\n\nDescending from earlier versions of Midnight Rose and [Wizard Tulu Dolphin 70B](https://huggingface.co/sophosympatheia/Wizard-Tulu-Dolphin-70B-v1.0), it inherits the best qualities of each.",
    "jondurbin/airoboros-l2-70b": "A Llama 2 70B fine-tune using synthetic data (the Airoboros dataset).\n\nCurrently based on [jondurbin/airoboros-l2-70b](https://huggingface.co/jondurbin/airoboros-l2-70b-2.2.1), but might get updated in the future.",
    "austism/chronos-hermes-13b": "A 75/25 merge of [Chronos 13b v2](https://huggingface.co/elinas/chronos-13b-v2) and [Nous Hermes Llama2 13b](/models/nousresearch/nous-hermes-llama2-13b). This offers the imaginative writing style of Chronos while retaining coherency. Outputs are long and use exceptional prose. #merge",
    "teknium/openhermes-2.5-mistral-7b": "A continuation of [OpenHermes 2 model](/models/teknium/openhermes-2-mistral-7b), trained on additional code datasets.\nPotentially the most interesting finding from training on a good ratio (est. of around 7-14% of the total dataset) of code instruction was that it has boosted several non-code benchmarks, including TruthfulQA, AGIEval, and GPT4All suite. It did however reduce BigBench benchmark score, but the net gain overall is significant.",
    "gryphe/mythomax-l2-13b": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge",
    "undi95/toppy-m-7b": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored",
    "lizpreciatior/lzlv-70b-fp16-hf": "A Mythomax/MLewd_13B-style merge of selected 70B models.\nA multi-model merge of several LLaMA2 70B finetunes for roleplaying and creative work. The goal was to create a model that combines creativity with intelligence for an enhanced experience.\n\n#merge #uncensored",
    "neversleep/noromaid-mixtral-8x7b-instruct": "This model was trained for 8h(v1) + 8h(v2) + 12h(v3) on customized modified datasets, focusing on RP, uncensoring, and a modified version of the Alpaca prompting (that was already used in LimaRP), which should be at the same conversational level as ChatLM or Llama2-Chat without adding any additional special tokens.",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous Hermes 2 Mixtral 8x7B DPO is the new flagship Nous Research model trained over the [Mixtral 8x7B MoE LLM](/models/mistralai/mixtral-8x7b).\n\nThe model was trained on over 1,000,000 entries of primarily [GPT-4](/models/openai/gpt-4) generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.\n\n#moe",
    "nousresearch/nous-hermes-llama2-13b": "A state-of-the-art language model fine-tuned on over 300k instructions by Nous Research, with Teknium and Emozilla leading the fine tuning process.",
    "nousresearch/nous-capybara-34b": "This model is trained on the Yi-34B model for 3 epochs on the Capybara dataset. It's the first 34B Nous model and first 200K context length Nous model.",
    "rwkv/rwkv-5-world-3b": "[RWKV](https://wiki.rwkv.com) is an RNN (recurrent neural network) with transformer-level performance. It aims to combine the best of RNNs and transformers - great performance, fast inference, low VRAM, fast training, \"infinite\" context length, and free sentence embedding.\n\nRWKV-5 is trained on 100+ world languages (70% English, 15% multilang, 15% code).\n\nRWKV 3B models are provided for free, by Recursal.AI, for the beta period. More details [here](https://substack.recursal.ai/p/public-rwkv-3b-model-via-openrouter).\n\n#rnn",
    "recursal/rwkv-5-3b-ai-town": "This is an [RWKV 3B model](/models/rwkv/rwkv-5-world-3b) finetuned specifically for the [AI Town](https://github.com/a16z-infra/ai-town) project.\n\n[RWKV](https://wiki.rwkv.com) is an RNN (recurrent neural network) with transformer-level performance. It aims to combine the best of RNNs and transformers - great performance, fast inference, low VRAM, fast training, \"infinite\" context length, and free sentence embedding.\n\nRWKV 3B models are provided for free, by Recursal.AI, for the beta period. More details [here](https://substack.recursal.ai/p/public-rwkv-3b-model-via-openrouter).\n\n#rnn",
    "recursal/eagle-7b": "Eagle 7B is trained on 1.1 Trillion Tokens across 100+ world languages (70% English, 15% multilang, 15% code).\n\n- Built on the [RWKV-v5](/models?q=rwkv) architecture (a linear transformer with 10-100x+ lower inference cost)\n- Ranks as the world's greenest 7B model (per token)\n- Outperforms all 7B class models in multi-lingual benchmarks\n- Approaches Falcon (1.5T), LLaMA2 (2T), Mistral (>2T?) level of performance in English evals\n- Trade blows with MPT-7B (1T) in English evals\n- All while being an [\"Attention-Free Transformer\"](https://www.isattentionallyouneed.com/)\n\nEagle 7B models are provided for free, by [Recursal.AI](https://recursal.ai), for the beta period till end of March 2024\n\nFind out more [here](https://blog.rwkv.com/p/eagle-7b-soaring-past-transformers)\n\n[rnn](/models?q=rwkv)",
    "nousresearch/nous-hermes-llama2-70b": "A state-of-the-art language model fine-tuned on over 300k instructions by Nous Research, with Teknium and Emozilla leading the fine tuning process.",
    "01-ai/yi-34b-200k": "The Yi series models are large language models trained from scratch by developers at [01.AI](https://01.ai/). This version was trained on a large context length, allowing ~200k words (1000 paragraphs) of combined input and output.",
    "openrouter/cinematika-7b": "This model is under development. Check the [OpenRouter Discord](https://discord.gg/fVyRaUDgxW) for updates.",
    "migtissera/synthia-70b": "SynthIA (Synthetic Intelligent Agent) is a LLama-2 70B model trained on Orca style datasets. It has been fine-tuned for instruction following as well as having long-form conversations.",
    "jebcarter/psyfighter-13b": "A merge model based on [Llama-2-13B](/models/meta-llama/llama-2-13b-chat) and made possible thanks to the compute provided by the KoboldAI community. It's a merge between:\n\n- [KoboldAI/LLaMA2-13B-Tiefighter](https://huggingface.co/KoboldAI/LLaMA2-13B-Tiefighter)\n- [chaoyi-wu/MedLLaMA_13B](https://huggingface.co/chaoyi-wu/MedLLaMA_13B)\n- [Doctor-Shotgun/llama-2-13b-chat-limarp-v2-merged](https://huggingface.co/Doctor-Shotgun/llama-2-13b-chat-limarp-v2-merged).\n\n#merge",
    "jondurbin/bagel-34b": "An experimental fine-tune of [Yi 34b 200k](/models/01-ai/yi-34b-200k) using [bagel](https://github.com/jondurbin/bagel). This is the version of the fine-tune before direct preference optimization (DPO) has been applied. DPO performs better on benchmarks, but this version is likely better for creative writing, roleplay, etc.",
    "cognitivecomputations/dolphin-mixtral-8x7b": "This is a 16k context fine-tune of [Mixtral-8x7b](/models/mistralai/mixtral-8x7b). It excels in coding tasks due to extensive training with coding data and is known for its obedience, although it lacks DPO tuning.\n\nThe model is uncensored and is stripped of alignment and bias. It requires an external alignment layer for ethical use. Users are cautioned to use this highly compliant model responsibly, as detailed in a blog post about uncensored models at [erichartford.com/uncensored-models](https://erichartford.com/uncensored-models).\n\n#moe #uncensored",
    "cognitivecomputations/dolphin-mixtral-8x22b": "Dolphin 2.9 is designed for instruction following, conversational, and coding. This model is a finetune of [Mixtral 8x22B Instruct](/models/mistralai/mixtral-8x22b-instruct). It features a 64k context length and was fine-tuned with a 16k sequence length using ChatML templates.\n\nThis model is a successor to [Dolphin Mixtral 8x7B](/models/cognitivecomputations/dolphin-mixtral-8x7b).\n\nThe model is uncensored and is stripped of alignment and bias. It requires an external alignment layer for ethical use. Users are cautioned to use this highly compliant model responsibly, as detailed in a blog post about uncensored models at [erichartford.com/uncensored-models](https://erichartford.com/uncensored-models).\n\n#moe #uncensored",
    "liuhaotian/llava-yi-34b": "LLaVA Yi 34B is an open-source model trained by fine-tuning LLM on multimodal instruction-following data. It is an auto-regressive language model, based on the transformer architecture. Base LLM: [NousResearch/Nous-Hermes-2-Yi-34B](/models/nousresearch/nous-hermes-yi-34b)\n\nIt was trained in December 2023.",
    "nousresearch/hermes-2-pro-llama-3-8b": "Hermes 2 Pro is an upgraded, retrained version of Nous Hermes 2, consisting of an updated and cleaned version of the OpenHermes 2.5 Dataset, as well as a newly introduced Function Calling and JSON Mode dataset developed in-house.",
    "openchat/openchat-7b": "OpenChat 7B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source",
    "openchat/openchat-8b": "OpenChat 8B is a library of open-source language models, fine-tuned with \"C-RLFT (Conditioned Reinforcement Learning Fine-Tuning)\" - a strategy inspired by offline reinforcement learning. It has been trained on mixed-quality data without preference labels.\n\nIt outperforms many similarly sized models including [Llama 3 8B Instruct](/models/meta-llama/llama-3-8b-instruct) and various fine-tuned models. It excels in general conversation, coding assistance, and mathematical reasoning.\n\n- For OpenChat fine-tuned on Mistral 7B, check out [OpenChat 7B](/models/openchat/openchat-7b).\n- For OpenChat fine-tuned on Llama 8B, check out [OpenChat 8B](/models/openchat/openchat-8b).\n\n#open-source",
    "bigcode/starcoder2-15b-instruct": "StarCoder2 15B Instruct excels in coding-related tasks, primarily in Python. It is the first self-aligned open-source LLM developed by BigCode. This model was fine-tuned without any human annotations or distilled data from proprietary LLMs.\n\nThe base model uses [Grouped Query Attention](https://arxiv.org/abs/2305.13245) and was trained using the [Fill-in-the-Middle objective](https://arxiv.org/abs/2207.14255) objective on 4+ trillion tokens.",
    "sao10k/l3-euryale-70b": "Euryale 70B v2.1 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k).\n\n- Better prompt adherence.\n- Better anatomy / spatial awareness.\n- Adapts much better to unique and custom formatting / reply formats.\n- Very creative, lots of unique swipes.\n- Is not restrictive during roleplays.",
    "sao10k/l3-stheno-8b": "Stheno 8B 32K is a creative writing/roleplay model from [Sao10k](https://ko-fi.com/sao10k). It was trained at 8K context, then expanded to 32K context.\n\nCompared to older Stheno version, this model is trained on:\n- 2x the amount of creative writing samples\n- Cleaned up roleplaying samples\n- Fewer low quality samples",
    "liuhaotian/llava-13b": "LLaVA is a large multimodal model that combines a vision encoder and Vicuna for general-purpose visual and language understanding, achieving impressive chat capabilities and setting a new state-of-the-art accuracy on Science QA.\n\n#multimodal",
    "nousresearch/nous-hermes-2-vision-7b": "This vision-language model builds on innovations from the popular [OpenHermes-2.5](/models/teknium/openhermes-2.5-mistral-7b) model, by Teknium. It adds vision support, and is trained on a custom dataset enriched with function calling\n\nThis project is led by [qnguyen3](https://twitter.com/stablequan) and [teknium](https://twitter.com/Teknium1).\n\n#multimodal",
    "meta-llama/llama-2-70b-chat:nitro": "The flagship, 70 billion parameter language model from Meta, fine tuned for chat completions. Llama 2 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align to human preferences for helpfulness and safety.\n\nNote: this is a higher-throughput version of [Llama v2 70B Chat](/models/meta-llama/llama-2-70b-chat). It may have higher prices and slightly different outputs.",
    "gryphe/mythomax-l2-13b:nitro": "One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge\n\nNote: this is a higher-throughput version of [MythoMax 13B](/models/gryphe/mythomax-l2-13b). It may have higher prices and slightly different outputs.",
    "mistralai/mistral-7b-instruct:nitro": "A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.\n\nNote: this is a higher-throughput version of [Mistral 7B Instruct](/models/mistralai/mistral-7b-instruct). It may have higher prices and slightly different outputs.",
    "google/gemma-7b-it:nitro": "Gemma by Google is an advanced, open-source language model family, leveraging the latest in decoder-only, text-to-text technology. It offers English language capabilities across text generation tasks like question answering, summarization, and reasoning. The Gemma 7B variant is comparable in performance to leading open source models.\n\nUsage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).\n\nNote: this is a higher-throughput version of [Gemma 7B](/models/google/gemma-7b-it). It may have higher prices and slightly different outputs.",
    "undi95/toppy-m-7b:nitro": "A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.\nList of merged models:\n- NousResearch/Nous-Capybara-7B-V1.9\n- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)\n- lemonilia/AshhLimaRP-Mistral-7B\n- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b\n- Undi95/Mistral-pippa-sharegpt-7b-qlora\n\n#merge #uncensored\n\nNote: this is a higher-throughput version of [Toppy M 7B](/models/undi95/toppy-m-7b). It may have higher prices and slightly different outputs.",
    "meta-llama/llama-3-70b-instruct:nitro": "Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.\n\nIt has demonstrated strong performance compared to leading closed-source models in human evaluations.\n\nTo read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).\n\nNote: this is a higher-throughput version of [Llama 3 70B Instruct](/models/meta-llama/llama-3-70b-instruct). It may have higher prices and slightly different outputs.",
    "anthropic/claude-3-opus:beta": "This is a lower-latency version of [Claude 3 Opus](/models/anthropic/claude-3-opus), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nClaude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3-sonnet:beta": "This is a lower-latency version of [Claude 3 Sonnet](/models/anthropic/claude-3-sonnet), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nClaude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)\n\n#multimodal",
    "anthropic/claude-3.5-sonnet:beta": "This is a lower-latency version of [Claude 3.5 Sonnet](/models/anthropic/claude-3.5-sonnet), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nClaude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:\n\n- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting\n- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights\n- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone\n- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)\n\n#multimodal",
    "anthropic/claude-3-haiku:beta": "This is a lower-latency version of [Claude 3 Haiku](/models/anthropic/claude-3-haiku), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nClaude 3 Haiku is Anthropic's fastest and most compact model for\nnear-instant responsiveness. Quick and accurate targeted performance.\n\nSee the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)\n\n#multimodal",
    "anthropic/claude-2:beta": "This is a lower-latency version of [Claude v2](/models/anthropic/claude-2), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nClaude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-2.0:beta": "This is a lower-latency version of [Claude v2.0](/models/anthropic/claude-2.0), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nAnthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.",
    "anthropic/claude-2.1:beta": "This is a lower-latency version of [Claude v2.1](/models/anthropic/claude-2.1), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nClaude 2 delivers advancements in key capabilities for enterprises\u2014including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.",
    "anthropic/claude-instant-1:beta": "This is a lower-latency version of [Claude Instant v1](/models/anthropic/claude-instant-1), made available in collaboration with Anthropic, that is self-moderated: response moderation happens on the model's side instead of OpenRouter's. It's in beta, and may change in the future.\n\nAnthropic's model for low-latency, high throughput text generation. Supports hundreds of pages of text."
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

// Event listeners for showing GPT model descriptions on hover
document.getElementById('model-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4"], event.currentTarget));
document.getElementById('model-gpt-4o').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4o"], event.currentTarget));
document.getElementById('model-gpt-4-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-32k"], event.currentTarget));
document.getElementById('model-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-4-turbo"], event.currentTarget));
document.getElementById('model-gpt-3.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gpt-3.5-turbo-0125"], event.currentTarget));

// Event listeners for selecting Gemini models
document.getElementById('model-gemini-pro').addEventListener('click', () => selectModel('gemini-pro'));
// document.getElementById('model-gemini-pro-vision').addEventListener('click', () => selectModel('gemini-pro-vision'));
document.getElementById('model-gemini-1.5-pro').addEventListener('click', () => selectModel('gemini-1.5-pro'));
document.getElementById('model-gemini-1.5-flash').addEventListener('click', () => selectModel('gemini-1.5-flash'));
document.getElementById('model-gemini-ultra').addEventListener('click', () => selectModel('gemini-1.0-ultra'));

// Event listeners for showing Gemini model descriptions on hover
document.getElementById('model-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro"], event.currentTarget));
// document.getElementById('model-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro-vision"], event.currentTarget));
document.getElementById('model-gemini-1.5-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-1.5-pro"], event.currentTarget));
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

// Event listeners for showing Llama3 model descriptions on hover
document.getElementById('model-llama-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama3-70b-8192"], event.currentTarget));
document.getElementById('model-llama-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["llama3-8b-8192"], event.currentTarget));

// gemma it via qroq
document.getElementById('model-gemma-it').addEventListener('click', () => selectModel('gemma-7b-it'));
document.getElementById('model-gemma-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemma-7b-it"], event.currentTarget));
document.getElementById('model-codestral').addEventListener('click', () => selectModel('codestral-latest'));
document.getElementById('model-codestral').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["codestral-latest"], event.currentTarget));
document.getElementById('model-qroq-mistral-8x7b').addEventListener('click', () => selectModel('mixtral-8x7b-32768'));
document.getElementById('model-qroq-mistral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["mixtral-8x7b-32768"], event.currentTarget));

document.getElementById('model-claude-3.5-sonnet').addEventListener('click', () => selectModel('claude-3-5-sonnet-20240620'));
document.getElementById('model-claude-3.5-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["claude-3-5-sonnet-20240620"], event.currentTarget));



// select open router models lol

// Event listeners for additional models
document.getElementById('open-router-model-openrouter-auto').addEventListener('click', () => selectModel('openrouter/auto'));
document.getElementById('open-router-model-openrouter-flavor-of-the-week').addEventListener('click', () => selectModel('openrouter/flavor-of-the-week'));
document.getElementById('open-router-model-nousresearch-nous-capybara-7b-free').addEventListener('click', () => selectModel('nousresearch/nous-capybara-7b:free'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-free').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:free'));
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta-free').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-7b-beta:free'));
document.getElementById('open-router-model-openchat-openchat-7b-free').addEventListener('click', () => selectModel('openchat/openchat-7b:free'));
document.getElementById('open-router-model-gryphe-mythomist-7b-free').addEventListener('click', () => selectModel('gryphe/mythomist-7b:free'));
document.getElementById('open-router-model-undi95-toppy-m-7b-free').addEventListener('click', () => selectModel('undi95/toppy-m-7b:free'));
document.getElementById('open-router-model-google-gemma-7b-it-free').addEventListener('click', () => selectModel('google/gemma-7b-it:free'));
document.getElementById('open-router-model-google-gemma-2-9b-it-free').addEventListener('click', () => selectModel('google/gemma-2-9b-it:free'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-free').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:free'));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct-free').addEventListener('click', () => selectModel('microsoft/phi-3-mini-128k-instruct:free'));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct-free').addEventListener('click', () => selectModel('microsoft/phi-3-medium-128k-instruct:free'));
document.getElementById('open-router-model-koboldai-psyfighter-13b-2').addEventListener('click', () => selectModel('koboldai/psyfighter-13b-2'));
document.getElementById('open-router-model-intel-neural-chat-7b').addEventListener('click', () => selectModel('intel/neural-chat-7b'));
document.getElementById('open-router-model-mancer-weaver').addEventListener('click', () => selectModel('mancer/weaver'));
document.getElementById('open-router-model-pygmalionai-mythalion-13b').addEventListener('click', () => selectModel('pygmalionai/mythalion-13b'));
document.getElementById('open-router-model-xwin-lm-xwin-lm-70b').addEventListener('click', () => selectModel('xwin-lm/xwin-lm-70b'));
document.getElementById('open-router-model-alpindale-goliath-120b').addEventListener('click', () => selectModel('alpindale/goliath-120b'));
document.getElementById('open-router-model-neversleep-noromaid-20b').addEventListener('click', () => selectModel('neversleep/noromaid-20b'));
document.getElementById('open-router-model-gryphe-mythomist-7b').addEventListener('click', () => selectModel('gryphe/mythomist-7b'));
document.getElementById('open-router-model-sao10k-fimbulvetr-11b-v2').addEventListener('click', () => selectModel('sao10k/fimbulvetr-11b-v2'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-8b'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-70b').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-70b'));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b-extended').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b:extended'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-extended').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:extended'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-extended').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:extended'));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b-extended').addEventListener('click', () => selectModel('neversleep/llama-3-lumimaid-8b:extended'));
document.getElementById('open-router-model-meta-llama-llama-2-70b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-70b-chat'));
document.getElementById('open-router-model-meta-llama-llama-3-8b').addEventListener('click', () => selectModel('meta-llama/llama-3-8b'));
document.getElementById('open-router-model-meta-llama-llama-3-70b').addEventListener('click', () => selectModel('meta-llama/llama-3-70b'));
document.getElementById('open-router-model-meta-llama-codellama-34b-instruct').addEventListener('click', () => selectModel('meta-llama/codellama-34b-instruct'));
document.getElementById('open-router-model-meta-llama-codellama-70b-instruct').addEventListener('click', () => selectModel('meta-llama/codellama-70b-instruct'));
document.getElementById('open-router-model-mistralai-mixtral-8x22b').addEventListener('click', () => selectModel('mistralai/mixtral-8x22b'));
document.getElementById('open-router-model-snowflake-snowflake-arctic-instruct').addEventListener('click', () => selectModel('snowflake/snowflake-arctic-instruct'));
document.getElementById('open-router-model-qwen-qwen-110b-chat').addEventListener('click', () => selectModel('qwen/qwen-110b-chat'));
document.getElementById('open-router-model-qwen-qwen-72b-chat').addEventListener('click', () => selectModel('qwen/qwen-72b-chat'));
document.getElementById('open-router-model-qwen-qwen-32b-chat').addEventListener('click', () => selectModel('qwen/qwen-32b-chat'));
document.getElementById('open-router-model-qwen-qwen-14b-chat').addEventListener('click', () => selectModel('qwen/qwen-14b-chat'));
document.getElementById('open-router-model-qwen-qwen-7b-chat').addEventListener('click', () => selectModel('qwen/qwen-7b-chat'));
document.getElementById('open-router-model-qwen-qwen-4b-chat').addEventListener('click', () => selectModel('qwen/qwen-4b-chat'));
document.getElementById('open-router-model-01-ai-yi-34b-chat').addEventListener('click', () => selectModel('01-ai/yi-34b-chat'));
document.getElementById('open-router-model-01-ai-yi-34b').addEventListener('click', () => selectModel('01-ai/yi-34b'));
document.getElementById('open-router-model-01-ai-yi-6b').addEventListener('click', () => selectModel('01-ai/yi-6b'));
document.getElementById('open-router-model-open-orca-mistral-7b-openorca').addEventListener('click', () => selectModel('open-orca/mistral-7b-openorca'));
document.getElementById('open-router-model-teknium-openhermes-2-mistral-7b').addEventListener('click', () => selectModel('teknium/openhermes-2-mistral-7b'));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b'));
document.getElementById('open-router-model-phind-phind-codellama-34b').addEventListener('click', () => selectModel('phind/phind-codellama-34b'));
document.getElementById('open-router-model-nousresearch-nous-hermes-yi-34b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-yi-34b'));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-sft').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mixtral-8x7b-sft'));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mistral-7b-dpo').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mistral-7b-dpo'));
document.getElementById('open-router-model-nousresearch-nous-capybara-7b').addEventListener('click', () => selectModel('nousresearch/nous-capybara-7b'));
document.getElementById('open-router-model-togethercomputer-stripedhyena-nous-7b').addEventListener('click', () => selectModel('togethercomputer/stripedhyena-nous-7b'));
document.getElementById('open-router-model-togethercomputer-stripedhyena-hessian-7b').addEventListener('click', () => selectModel('togethercomputer/stripedhyena-hessian-7b'));
document.getElementById('open-router-model-databricks-dbrx-instruct').addEventListener('click', () => selectModel('databricks/dbrx-instruct'));
document.getElementById('open-router-model-allenai-olmo-7b-instruct').addEventListener('click', () => selectModel('allenai/olmo-7b-instruct'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct-nitro').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct:nitro'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:nitro'));
document.getElementById('open-router-model-meta-llama-llama-2-13b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-13b-chat'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0125').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0125'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-1106').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-1106'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0613').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0613'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0301').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0301'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-16k').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-16k'));
document.getElementById('open-router-model-openai-gpt-4o').addEventListener('click', () => selectModel('openai/gpt-4o'));
document.getElementById('open-router-model-openai-gpt-4o-2024-05-13').addEventListener('click', () => selectModel('openai/gpt-4o-2024-05-13'));
document.getElementById('open-router-model-openai-gpt-4-turbo').addEventListener('click', () => selectModel('openai/gpt-4-turbo'));
document.getElementById('open-router-model-openai-gpt-4-turbo-preview').addEventListener('click', () => selectModel('openai/gpt-4-turbo-preview'));
document.getElementById('open-router-model-openai-gpt-4-1106-preview').addEventListener('click', () => selectModel('openai/gpt-4-1106-preview'));
document.getElementById('open-router-model-openai-gpt-4').addEventListener('click', () => selectModel('openai/gpt-4'));
document.getElementById('open-router-model-openai-gpt-4-0314').addEventListener('click', () => selectModel('openai/gpt-4-0314'));
document.getElementById('open-router-model-openai-gpt-4-32k').addEventListener('click', () => selectModel('openai/gpt-4-32k'));
document.getElementById('open-router-model-openai-gpt-4-32k-0314').addEventListener('click', () => selectModel('openai/gpt-4-32k-0314'));
document.getElementById('open-router-model-openai-gpt-4-vision-preview').addEventListener('click', () => selectModel('openai/gpt-4-vision-preview'));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-instruct').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-instruct'));
document.getElementById('open-router-model-google-palm-2-chat-bison').addEventListener('click', () => selectModel('google/palm-2-chat-bison'));
document.getElementById('open-router-model-google-palm-2-codechat-bison').addEventListener('click', () => selectModel('google/palm-2-codechat-bison'));
document.getElementById('open-router-model-google-palm-2-chat-bison-32k').addEventListener('click', () => selectModel('google/palm-2-chat-bison-32k'));
document.getElementById('open-router-model-google-palm-2-codechat-bison-32k').addEventListener('click', () => selectModel('google/palm-2-codechat-bison-32k'));
document.getElementById('open-router-model-google-gemini-pro').addEventListener('click', () => selectModel('google/gemini-pro'));
document.getElementById('open-router-model-google-gemini-pro-vision').addEventListener('click', () => selectModel('google/gemini-pro-vision'));
document.getElementById('open-router-model-google-gemini-pro-1.5').addEventListener('click', () => selectModel('google/gemini-pro-1.5'));
document.getElementById('open-router-model-google-gemini-flash-1.5').addEventListener('click', () => selectModel('google/gemini-flash-1.5'));
document.getElementById('open-router-model-mistralai-mistral-tiny').addEventListener('click', () => selectModel('mistralai/mistral-tiny'));
document.getElementById('open-router-model-mistralai-mistral-small').addEventListener('click', () => selectModel('mistralai/mistral-small'));
document.getElementById('open-router-model-mistralai-mistral-medium').addEventListener('click', () => selectModel('mistralai/mistral-medium'));
document.getElementById('open-router-model-mistralai-mistral-large').addEventListener('click', () => selectModel('mistralai/mistral-large'));
document.getElementById('open-router-model-01-ai-yi-large').addEventListener('click', () => selectModel('01-ai/yi-large'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-small-32k-chat').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-small-32k-chat'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-small-32k-online').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-small-32k-online'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-chat').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-large-32k-chat'));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-online').addEventListener('click', () => selectModel('perplexity/llama-3-sonar-large-32k-online'));
document.getElementById('open-router-model-anthropic-claude-3-opus').addEventListener('click', () => selectModel('anthropic/claude-3-opus'));
document.getElementById('open-router-model-anthropic-claude-3-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet'));
document.getElementById('open-router-model-anthropic-claude-3-haiku').addEventListener('click', () => selectModel('anthropic/claude-3-haiku'));
document.getElementById('open-router-model-anthropic-claude-2').addEventListener('click', () => selectModel('anthropic/claude-2'));
document.getElementById('open-router-model-anthropic-claude-2.0').addEventListener('click', () => selectModel('anthropic/claude-2.0'));
document.getElementById('open-router-model-anthropic-claude-2.1').addEventListener('click', () => selectModel('anthropic/claude-2.1'));
document.getElementById('open-router-model-anthropic-claude-instant-1').addEventListener('click', () => selectModel('anthropic/claude-instant-1'));
document.getElementById('open-router-model-cohere-command').addEventListener('click', () => selectModel('cohere/command'));
document.getElementById('open-router-model-cohere-command-r').addEventListener('click', () => selectModel('cohere/command-r'));
document.getElementById('open-router-model-cohere-command-r-plus').addEventListener('click', () => selectModel('cohere/command-r-plus'));
document.getElementById('open-router-model-anthropic-claude-1').addEventListener('click', () => selectModel('anthropic/claude-1'));
document.getElementById('open-router-model-anthropic-claude-1.2').addEventListener('click', () => selectModel('anthropic/claude-1.2'));
document.getElementById('open-router-model-anthropic-claude-instant-1.0').addEventListener('click', () => selectModel('anthropic/claude-instant-1.0'));
document.getElementById('open-router-model-anthropic-claude-instant-1.1').addEventListener('click', () => selectModel('anthropic/claude-instant-1.1'));
document.getElementById('open-router-model-ai21-jamba-instruct').addEventListener('click', () => selectModel('ai21/jamba-instruct'));
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-7b-beta'));
document.getElementById('open-router-model-huggingfaceh4-zephyr-orpo-141b-a35b').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-orpo-141b-a35b'));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct'));
document.getElementById('open-router-model-meta-llama-llama-guard-2-8b').addEventListener('click', () => selectModel('meta-llama/llama-guard-2-8b'));
document.getElementById('open-router-model-microsoft-wizardlm-2-8x22b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-8x22b'));
document.getElementById('open-router-model-microsoft-wizardlm-2-7b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-7b'));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-mini-128k-instruct'));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-medium-128k-instruct'));
document.getElementById('open-router-model-microsoft-phi-3-medium-4k-instruct').addEventListener('click', () => selectModel('microsoft/phi-3-medium-4k-instruct'));
document.getElementById('open-router-model-nvidia-nemotron-4-340b-instruct').addEventListener('click', () => selectModel('nvidia/nemotron-4-340b-instruct'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b'));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct'));
document.getElementById('open-router-model-mistralai-mixtral-8x22b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x22b-instruct'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.1').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.1'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.2').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.2'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.3').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct-v0.3'));
document.getElementById('open-router-model-lynn-soliloquy-l3').addEventListener('click', () => selectModel('lynn/soliloquy-l3'));
document.getElementById('open-router-model-qwen-qwen-2-72b-instruct').addEventListener('click', () => selectModel('qwen/qwen-2-72b-instruct'));
document.getElementById('open-router-model-deepseek-deepseek-chat').addEventListener('click', () => selectModel('deepseek/deepseek-chat'));
document.getElementById('open-router-model-deepseek-deepseek-coder').addEventListener('click', () => selectModel('deepseek/deepseek-coder'));
document.getElementById('open-router-model-google-gemma-7b-it').addEventListener('click', () => selectModel('google/gemma-7b-it'));
document.getElementById('open-router-model-google-gemma-2-9b-it').addEventListener('click', () => selectModel('google/gemma-2-9b-it'));
document.getElementById('open-router-model-fireworks-firellava-13b').addEventListener('click', () => selectModel('fireworks/firellava-13b'));
document.getElementById('open-router-model-sophosympatheia-midnight-rose-70b').addEventListener('click', () => selectModel('sophosympatheia/midnight-rose-70b'));
document.getElementById('open-router-model-jondurbin-airoboros-l2-70b').addEventListener('click', () => selectModel('jondurbin/airoboros-l2-70b'));
document.getElementById('open-router-model-austism-chronos-hermes-13b').addEventListener('click', () => selectModel('austism/chronos-hermes-13b'));
document.getElementById('open-router-model-teknium-openhermes-2.5-mistral-7b').addEventListener('click', () => selectModel('teknium/openhermes-2.5-mistral-7b'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b'));
document.getElementById('open-router-model-undi95-toppy-m-7b').addEventListener('click', () => selectModel('undi95/toppy-m-7b'));
document.getElementById('open-router-model-lizpreciatior-lzlv-70b-fp16-hf').addEventListener('click', () => selectModel('lizpreciatior/lzlv-70b-fp16-hf'));
document.getElementById('open-router-model-neversleep-noromaid-mixtral-8x7b-instruct').addEventListener('click', () => selectModel('neversleep/noromaid-mixtral-8x7b-instruct'));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mixtral-8x7b-dpo'));
document.getElementById('open-router-model-nousresearch-nous-hermes-llama2-13b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-llama2-13b'));
document.getElementById('open-router-model-nousresearch-nous-capybara-34b').addEventListener('click', () => selectModel('nousresearch/nous-capybara-34b'));
document.getElementById('open-router-model-rwkv-rwkv-5-world-3b').addEventListener('click', () => selectModel('rwkv/rwkv-5-world-3b'));
document.getElementById('open-router-model-recursal-rwkv-5-3b-ai-town').addEventListener('click', () => selectModel('recursal/rwkv-5-3b-ai-town'));
document.getElementById('open-router-model-recursal-eagle-7b').addEventListener('click', () => selectModel('recursal/eagle-7b'));
document.getElementById('open-router-model-nousresearch-nous-hermes-llama2-70b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-llama2-70b'));
document.getElementById('open-router-model-01-ai-yi-34b-200k').addEventListener('click', () => selectModel('01-ai/yi-34b-200k'));
document.getElementById('open-router-model-openrouter-cinematika-7b').addEventListener('click', () => selectModel('openrouter/cinematika-7b'));
document.getElementById('open-router-model-migtissera-synthia-70b').addEventListener('click', () => selectModel('migtissera/synthia-70b'));
document.getElementById('open-router-model-jebcarter-psyfighter-13b').addEventListener('click', () => selectModel('jebcarter/psyfighter-13b'));
document.getElementById('open-router-model-jondurbin-bagel-34b').addEventListener('click', () => selectModel('jondurbin/bagel-34b'));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x7b').addEventListener('click', () => selectModel('cognitivecomputations/dolphin-mixtral-8x7b'));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x22b').addEventListener('click', () => selectModel('cognitivecomputations/dolphin-mixtral-8x22b'));
document.getElementById('open-router-model-liuhaotian-llava-yi-34b').addEventListener('click', () => selectModel('liuhaotian/llava-yi-34b'));
document.getElementById('open-router-model-nousresearch-hermes-2-pro-llama-3-8b').addEventListener('click', () => selectModel('nousresearch/hermes-2-pro-llama-3-8b'));
document.getElementById('open-router-model-openchat-openchat-7b').addEventListener('click', () => selectModel('openchat/openchat-7b'));
document.getElementById('open-router-model-openchat-openchat-8b').addEventListener('click', () => selectModel('openchat/openchat-8b'));
document.getElementById('open-router-model-bigcode-starcoder2-15b-instruct').addEventListener('click', () => selectModel('bigcode/starcoder2-15b-instruct'));
document.getElementById('open-router-model-sao10k-l3-euryale-70b').addEventListener('click', () => selectModel('sao10k/l3-euryale-70b'));
document.getElementById('open-router-model-sao10k-l3-stheno-8b').addEventListener('click', () => selectModel('sao10k/l3-stheno-8b'));
document.getElementById('open-router-model-liuhaotian-llava-13b').addEventListener('click', () => selectModel('liuhaotian/llava-13b'));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-vision-7b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-vision-7b'));
document.getElementById('open-router-model-meta-llama-llama-2-70b-chat-nitro').addEventListener('click', () => selectModel('meta-llama/llama-2-70b-chat:nitro'));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-nitro').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:nitro'));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-nitro').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:nitro'));
document.getElementById('open-router-model-google-gemma-7b-it-nitro').addEventListener('click', () => selectModel('google/gemma-7b-it:nitro'));
document.getElementById('open-router-model-undi95-toppy-m-7b-nitro').addEventListener('click', () => selectModel('undi95/toppy-m-7b:nitro'));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct:nitro'));
document.getElementById('open-router-model-anthropic-claude-3-opus-beta').addEventListener('click', () => selectModel('anthropic/claude-3-opus:beta'));
document.getElementById('open-router-model-anthropic-claude-3-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-beta').addEventListener('click', () => selectModel('anthropic/claude-3.5-sonnet:beta'));
document.getElementById('open-router-model-anthropic-claude-3-haiku-beta').addEventListener('click', () => selectModel('anthropic/claude-3-haiku:beta'));
document.getElementById('open-router-model-anthropic-claude-2-beta').addEventListener('click', () => selectModel('anthropic/claude-2:beta'));
document.getElementById('open-router-model-anthropic-claude-2.0-beta').addEventListener('click', () => selectModel('anthropic/claude-2.0:beta'));
document.getElementById('open-router-model-anthropic-claude-2.1-beta').addEventListener('click', () => selectModel('anthropic/claude-2.1:beta'));
document.getElementById('open-router-model-anthropic-claude-instant-1-beta').addEventListener('click', () => selectModel('anthropic/claude-instant-1:beta'));

// event listeners for descrptions
document.getElementById('open-router-model-openrouter-auto').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openrouter/auto'], event.currentTarget));
document.getElementById('open-router-model-openrouter-flavor-of-the-week').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openrouter/flavor-of-the-week'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-capybara-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-capybara-7b:free'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['huggingfaceh4/zephyr-7b-beta:free'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-7b:free'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomist-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomist-7b:free'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b:free'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-7b-it-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-7b-it:free'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-2-9b-it-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-2-9b-it:free'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-mini-128k-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct-free').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-128k-instruct:free'], event.currentTarget));
document.getElementById('open-router-model-koboldai-psyfighter-13b-2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['koboldai/psyfighter-13b-2'], event.currentTarget));
document.getElementById('open-router-model-intel-neural-chat-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['intel/neural-chat-7b'], event.currentTarget));
document.getElementById('open-router-model-mancer-weaver').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mancer/weaver'], event.currentTarget));
document.getElementById('open-router-model-pygmalionai-mythalion-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['pygmalionai/mythalion-13b'], event.currentTarget));
document.getElementById('open-router-model-xwin-lm-xwin-lm-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['xwin-lm/xwin-lm-70b'], event.currentTarget));
document.getElementById('open-router-model-alpindale-goliath-120b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['alpindale/goliath-120b'], event.currentTarget));
document.getElementById('open-router-model-neversleep-noromaid-20b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/noromaid-20b'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomist-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomist-7b'], event.currentTarget));
document.getElementById('open-router-model-sao10k-fimbulvetr-11b-v2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/fimbulvetr-11b-v2'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-8b'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-70b'], event.currentTarget));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/remm-slerp-l2-13b:extended'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b:extended'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:extended'], event.currentTarget));
document.getElementById('open-router-model-neversleep-llama-3-lumimaid-8b-extended').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/llama-3-lumimaid-8b:extended'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-2-70b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-2-70b-chat'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-70b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-codellama-34b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/codellama-34b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-codellama-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/codellama-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x22b'], event.currentTarget));
document.getElementById('open-router-model-snowflake-snowflake-arctic-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['snowflake/snowflake-arctic-instruct'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-110b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-110b-chat'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-72b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-72b-chat'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-32b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-32b-chat'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-14b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-14b-chat'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-7b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-7b-chat'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-4b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-4b-chat'], event.currentTarget));
document.getElementById('open-router-model-01-ai-yi-34b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['01-ai/yi-34b-chat'], event.currentTarget));
document.getElementById('open-router-model-01-ai-yi-34b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['01-ai/yi-34b'], event.currentTarget));
document.getElementById('open-router-model-01-ai-yi-6b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['01-ai/yi-6b'], event.currentTarget));
document.getElementById('open-router-model-open-orca-mistral-7b-openorca').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['open-orca/mistral-7b-openorca'], event.currentTarget));
document.getElementById('open-router-model-teknium-openhermes-2-mistral-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['teknium/openhermes-2-mistral-7b'], event.currentTarget));
document.getElementById('open-router-model-undi95-remm-slerp-l2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/remm-slerp-l2-13b'], event.currentTarget));
document.getElementById('open-router-model-phind-phind-codellama-34b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['phind/phind-codellama-34b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-yi-34b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-yi-34b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-sft').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-2-mixtral-8x7b-sft'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mistral-7b-dpo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-2-mistral-7b-dpo'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-capybara-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-capybara-7b'], event.currentTarget));
document.getElementById('open-router-model-togethercomputer-stripedhyena-nous-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['togethercomputer/stripedhyena-nous-7b'], event.currentTarget));
document.getElementById('open-router-model-togethercomputer-stripedhyena-hessian-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['togethercomputer/stripedhyena-hessian-7b'], event.currentTarget));
document.getElementById('open-router-model-databricks-dbrx-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['databricks/dbrx-instruct'], event.currentTarget));
document.getElementById('open-router-model-allenai-olmo-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['allenai/olmo-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-2-13b-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-2-13b-chat'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0125').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0125'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-1106').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-1106'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0613').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0613'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-0301').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-0301'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-16k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-16k'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4o-2024-05-13').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4o-2024-05-13'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-turbo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-turbo'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-turbo-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-turbo-preview'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-1106-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-1106-preview'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-0314').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-0314'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-32k'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-32k-0314').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-32k-0314'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-4-vision-preview').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-4-vision-preview'], event.currentTarget));
document.getElementById('open-router-model-openai-gpt-3.5-turbo-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openai/gpt-3.5-turbo-instruct'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-chat-bison').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-chat-bison'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-codechat-bison').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-codechat-bison'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-chat-bison-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-chat-bison-32k'], event.currentTarget));
document.getElementById('open-router-model-google-palm-2-codechat-bison-32k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/palm-2-codechat-bison-32k'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-vision'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-pro-1.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-pro-1.5'], event.currentTarget));
document.getElementById('open-router-model-google-gemini-flash-1.5').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemini-flash-1.5'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-tiny').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-tiny'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-small').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-small'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-medium').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-medium'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-large'], event.currentTarget));
document.getElementById('open-router-model-01-ai-yi-large').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['01-ai/yi-large'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-small-32k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-small-32k-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-small-32k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-small-32k-online'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-large-32k-chat'], event.currentTarget));
document.getElementById('open-router-model-perplexity-llama-3-sonar-large-32k-online').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['perplexity/llama-3-sonar-large-32k-online'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-opus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-opus'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-sonnet'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-haiku').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-haiku'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.0').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.0'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.1'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-instant-1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-instant-1'], event.currentTarget));
document.getElementById('open-router-model-cohere-command').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r'], event.currentTarget));
document.getElementById('open-router-model-cohere-command-r-plus').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cohere/command-r-plus'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-1'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-1.2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-1.2'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-instant-1.0').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-instant-1.0'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-instant-1.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-instant-1.1'], event.currentTarget));
document.getElementById('open-router-model-ai21-jamba-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['ai21/jamba-instruct'], event.currentTarget));
document.getElementById('open-router-model-huggingfaceh4-zephyr-7b-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['huggingfaceh4/zephyr-7b-beta'], event.currentTarget));
document.getElementById('open-router-model-huggingfaceh4-zephyr-orpo-141b-a35b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['huggingfaceh4/zephyr-orpo-141b-a35b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-8b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-8b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-70b-instruct'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-guard-2-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-guard-2-8b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-wizardlm-2-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/wizardlm-2-8x22b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-wizardlm-2-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/wizardlm-2-7b'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-mini-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-mini-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-128k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-128k-instruct'], event.currentTarget));
document.getElementById('open-router-model-microsoft-phi-3-medium-4k-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['microsoft/phi-3-medium-4k-instruct'], event.currentTarget));
document.getElementById('open-router-model-nvidia-nemotron-4-340b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nvidia/nemotron-4-340b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mixtral-8x22b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mixtral-8x22b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.1').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.1'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.2').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.2'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-v0.3').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct-v0.3'], event.currentTarget));
document.getElementById('open-router-model-lynn-soliloquy-l3').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['lynn/soliloquy-l3'], event.currentTarget));
document.getElementById('open-router-model-qwen-qwen-2-72b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['qwen/qwen-2-72b-instruct'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-chat').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-chat'], event.currentTarget));
document.getElementById('open-router-model-deepseek-deepseek-coder').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['deepseek/deepseek-coder'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-7b-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-7b-it'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-2-9b-it').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-2-9b-it'], event.currentTarget));
document.getElementById('open-router-model-fireworks-firellava-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['fireworks/firellava-13b'], event.currentTarget));
document.getElementById('open-router-model-sophosympatheia-midnight-rose-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sophosympatheia/midnight-rose-70b'], event.currentTarget));
document.getElementById('open-router-model-jondurbin-airoboros-l2-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['jondurbin/airoboros-l2-70b'], event.currentTarget));
document.getElementById('open-router-model-austism-chronos-hermes-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['austism/chronos-hermes-13b'], event.currentTarget));
document.getElementById('open-router-model-teknium-openhermes-2.5-mistral-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['teknium/openhermes-2.5-mistral-7b'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b'], event.currentTarget));
document.getElementById('open-router-model-lizpreciatior-lzlv-70b-fp16-hf').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['lizpreciatior/lzlv-70b-fp16-hf'], event.currentTarget));
document.getElementById('open-router-model-neversleep-noromaid-mixtral-8x7b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['neversleep/noromaid-mixtral-8x7b-instruct'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-2-mixtral-8x7b-dpo'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-llama2-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-llama2-13b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-capybara-34b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-capybara-34b'], event.currentTarget));
document.getElementById('open-router-model-rwkv-rwkv-5-world-3b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['rwkv/rwkv-5-world-3b'], event.currentTarget));
document.getElementById('open-router-model-recursal-rwkv-5-3b-ai-town').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['recursal/rwkv-5-3b-ai-town'], event.currentTarget));
document.getElementById('open-router-model-recursal-eagle-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['recursal/eagle-7b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-llama2-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-llama2-70b'], event.currentTarget));
document.getElementById('open-router-model-01-ai-yi-34b-200k').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['01-ai/yi-34b-200k'], event.currentTarget));
document.getElementById('open-router-model-openrouter-cinematika-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openrouter/cinematika-7b'], event.currentTarget));
document.getElementById('open-router-model-migtissera-synthia-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['migtissera/synthia-70b'], event.currentTarget));
document.getElementById('open-router-model-jebcarter-psyfighter-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['jebcarter/psyfighter-13b'], event.currentTarget));
document.getElementById('open-router-model-jondurbin-bagel-34b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['jondurbin/bagel-34b'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin-mixtral-8x7b'], event.currentTarget));
document.getElementById('open-router-model-cognitivecomputations-dolphin-mixtral-8x22b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['cognitivecomputations/dolphin-mixtral-8x22b'], event.currentTarget));
document.getElementById('open-router-model-liuhaotian-llava-yi-34b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['liuhaotian/llava-yi-34b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-hermes-2-pro-llama-3-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/hermes-2-pro-llama-3-8b'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-7b'], event.currentTarget));
document.getElementById('open-router-model-openchat-openchat-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['openchat/openchat-8b'], event.currentTarget));
document.getElementById('open-router-model-bigcode-starcoder2-15b-instruct').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['bigcode/starcoder2-15b-instruct'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3-euryale-70b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3-euryale-70b'], event.currentTarget));
document.getElementById('open-router-model-sao10k-l3-stheno-8b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['sao10k/l3-stheno-8b'], event.currentTarget));
document.getElementById('open-router-model-liuhaotian-llava-13b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['liuhaotian/llava-13b'], event.currentTarget));
document.getElementById('open-router-model-nousresearch-nous-hermes-2-vision-7b').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['nousresearch/nous-hermes-2-vision-7b'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-2-70b-chat-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-2-70b-chat:nitro'], event.currentTarget));
document.getElementById('open-router-model-gryphe-mythomax-l2-13b-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['gryphe/mythomax-l2-13b:nitro'], event.currentTarget));
document.getElementById('open-router-model-mistralai-mistral-7b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['mistralai/mistral-7b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-google-gemma-7b-it-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['google/gemma-7b-it:nitro'], event.currentTarget));
document.getElementById('open-router-model-undi95-toppy-m-7b-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['undi95/toppy-m-7b:nitro'], event.currentTarget));
document.getElementById('open-router-model-meta-llama-llama-3-70b-instruct-nitro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['meta-llama/llama-3-70b-instruct:nitro'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-opus-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-opus:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3.5-sonnet-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3.5-sonnet:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-3-haiku-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-3-haiku:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.0-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.0:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-2.1-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-2.1:beta'], event.currentTarget));
document.getElementById('open-router-model-anthropic-claude-instant-1-beta').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions['anthropic/claude-instant-1:beta'], event.currentTarget));



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