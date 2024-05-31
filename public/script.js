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
    "Gemini-Pro": "gemini-pro",
    "Gemini-Pro-Vision": "gemini-pro-vision",
    "Gemini-1.5-Pro": "gemini-1.5-pro-latest",
    "Gemini-1.5-Flash": "gemini-1.5-flash-latest",
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
    // Open Router Models
    "OpenRouter Auto": "openrouter/auto",
    "Nous: Capybara 7B (free)": "nousresearch/nous-capybara-7b:free",
    "Mistral 7B Instruct (free)": "mistralai/mistral-7b-instruct:free",
    "OpenChat 3.5 (free)": "openchat/openchat-7b:free",
    "MythoMist 7B (free)": "gryphe/mythomist-7b:free",
    "Toppy M 7B (free)": "undi95/toppy-m-7b:free",
    "Cinematika 7B (alpha) (free)": "openrouter/cinematika-7b:free",
    "Google: Gemma 7B (free)": "google/gemma-7b-it:free",
    "Psyfighter v2 13B": "koboldai/psyfighter-13b-2",
    "Neural Chat 7B v3.1": "intel/neural-chat-7b",
    "MythoMax 13B": "gryphe/mythomax-l2-13b",
    "Pygmalion: Mythalion 13B": "pygmalionai/mythalion-13b",
    "Xwin 70B": "xwin-lm/xwin-lm-70b",
    "Goliath 120B": "alpindale/goliath-120b",
    "Noromaid 20B": "neversleep/noromaid-20b",
    "MythoMist 7B": "gryphe/mythomist-7b",
    "Midnight Rose 70B": "sophosympatheia/midnight-rose-70b",
    "Fimbulvetr 11B v2": "sao10k/fimbulvetr-11b-v2",
    "ReMM SLERP 13B (extended)": "undi95/remm-slerp-l2-13b:extended",
    "MythoMax 13B (extended)": "gryphe/mythomax-l2-13b:extended",
    "Meta: Llama 3 8B Instruct (extended)": "meta-llama/llama-3-8b-instruct:extended",
    "Mancer: Weaver (alpha)": "mancer/weaver",
    "Nous: Capybara 7B": "nousresearch/nous-capybara-7b",
    "Meta: CodeLlama 34B Instruct": "meta-llama/codellama-34b-instruct",
    "Meta: CodeLlama 70B Instruct": "codellama/codellama-70b-instruct",
    "Phind: CodeLlama 34B v2": "phind/phind-codellama-34b",
    "OpenHermes 2 Mistral 7B": "teknium/openhermes-2-mistral-7b",
    "ReMM SLERP 13B": "undi95/remm-slerp-l2-13b",
    "Cinematika 7B (alpha)": "openrouter/cinematika-7b",
    "Yi 34B Chat": "01-ai/yi-34b-chat",
    "Yi 34B (base)": "01-ai/yi-34b",
    "Yi 6B (base)": "01-ai/yi-6b",
    "StripedHyena Nous 7B": "togethercomputer/stripedhyena-nous-7b",
    "StripedHyena Hessian 7B (base)": "togethercomputer/stripedhyena-hessian-7b",
    "Mixtral 8x7B (base)": "mistralai/mixtral-8x7b",
    "Nous: Hermes 2 Yi 34B": "nousresearch/nous-hermes-yi-34b",
    "Nous: Hermes 2 Mixtral 8x7B SFT": "nousresearch/nous-hermes-2-mixtral-8x7b-sft",
    "Nous: Hermes 2 Mistral 7B DPO": "nousresearch/nous-hermes-2-mistral-7b-dpo",
    "Meta: Llama 3 70B Instruct": "meta-llama/llama-3-70b-instruct",
    "Mixtral 8x7b Instruct (nitro)": "mistralai/mixtral-8x7b-instruct:nitro",
    "Mistral OpenOrca 7B": "open-orca/mistral-7b-openorca",
    "Hugging Face: Zephyr 7B": "huggingfaceh4/zephyr-7b-beta",
    "OpenAI: GPT-3.5 Turbo": "openai/gpt-3.5-turbo",
    "OpenAI: GPT-3.5 Turbo 16k": "openai/gpt-3.5-turbo-16k",
    "OpenAI: GPT-4 Turbo": "openai/gpt-4-turbo",
    "OpenAI: GPT-4 Turbo Preview": "openai/gpt-4-turbo-preview",
    "OpenAI: GPT-4": "openai/gpt-4",
    "OpenAI: GPT-4 32k": "openai/gpt-4-32k",
    "OpenAI: GPT-4 Vision": "openai/gpt-4-vision-preview",
    "OpenAI: GPT-3.5 Turbo Instruct": "openai/gpt-3.5-turbo-instruct",
    "Google: PaLM 2 Chat": "google/palm-2-chat-bison",
    "Google: PaLM 2 Code Chat": "google/palm-2-codechat-bison",
    "Google: PaLM 2 Chat 32k": "google/palm-2-chat-bison-32k",
    "Google: PaLM 2 Code Chat 32k": "google/palm-2-codechat-bison-32k",
    "Google: Gemini Pro 1.0": "google/gemini-pro",
    "Google: Gemini Pro Vision 1.0": "google/gemini-pro-vision",
    "Google: Gemini Pro 1.5 (preview)": "google/gemini-pro-1.5",
    "Perplexity: PPLX 70B Online": "perplexity/pplx-70b-online",
    "Perplexity: PPLX 7B Online": "perplexity/pplx-7b-online",
    "Perplexity: PPLX 7B Chat": "perplexity/pplx-7b-chat",
    "Perplexity: PPLX 70B Chat": "perplexity/pplx-70b-chat",
    "Perplexity: Sonar 7B": "perplexity/sonar-small-chat",
    "Perplexity: Sonar 8x7B": "perplexity/sonar-medium-chat",
    "Perplexity: Sonar 7B Online": "perplexity/sonar-small-online",
    "Perplexity: Sonar 8x7B Online": "perplexity/sonar-medium-online",
    "Fireworks: FireLLaVA 13B": "fireworks/firellava-13b",
    "Anthropic: Claude 3 Opus": "anthropic/claude-3-opus",
    "Anthropic: Claude 3 Sonnet": "anthropic/claude-3-sonnet",
    "Anthropic: Claude 3 Haiku": "anthropic/claude-3-haiku",
    "Anthropic: Claude v2": "anthropic/claude-2",
    "Anthropic: Claude v2.0": "anthropic/claude-2.0",
    "Anthropic: Claude v2.1": "anthropic/claude-2.1",
    "Anthropic: Claude Instant v1": "anthropic/claude-instant-1",
    "Anthropic: Claude 3 Opus (self-moderated)": "anthropic/claude-3-opus:beta",
    "Anthropic: Claude 3 Sonnet (self-moderated)": "anthropic/claude-3-sonnet:beta",
    "Anthropic: Claude 3 Haiku (self-moderated)": "anthropic/claude-3-haiku:beta",
    "Anthropic: Claude v2 (self-moderated)": "anthropic/claude-2:beta",
    "Anthropic: Claude v2.0 (self-moderated)": "anthropic/claude-2.0:beta",
    "Anthropic: Claude v2.1 (self-moderated)": "anthropic/claude-2.1:beta",
    "Anthropic: Claude Instant v1 (self-moderated)": "anthropic/claude-instant-1:beta",
    "Meta: Llama v2 13B Chat": "meta-llama/llama-2-13b-chat",
    "Meta: Llama v2 70B Chat": "meta-llama/llama-2-70b-chat",
    "Nous: Hermes 13B": "nousresearch/nous-hermes-llama2-13b",
    "Nous: Capybara 34B": "nousresearch/nous-capybara-34b",
    "Airoboros 70B": "jondurbin/airoboros-l2-70b",
    "Chronos Hermes 13B v2": "autism/chronos-hermes-13b",
    "Mistral 7B Instruct": "mistralai/mistral-7b-instruct",
    "OpenHermes 2.5 Mistral 7B": "teknium/openhermes-2.5-mistral-7b",
    "OpenChat 3.5": "openchat/openchat-7b",
    "Toppy M 7B": "undi95/toppy-m-7b",
    "lzlv 70B": "lizpreciatior/lzlv-70b-fp16-hf",
    "Mixtral 8x7B Instruct": "mistralai/mixtral-8x7b-instruct",
    "Dolphin 2.6 Mixtral 8x7B": "cognitivecomputations/dolphin-mixtral-8x7b",
    "Noromaid Mixtral 8x7B Instruct": "neversleep/noromaid-mixtral-8x7b-instruct",
    "Nous: Hermes 2 Mixtral 8x7B DPO": "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    "RWKV v5 World 3B": "rwkv/rwkv-5-world-3b",
    "RWKV v5 3B AI Town": "recursal/rwkv-5-3b-ai-town",
    "RWKV v5: Eagle 7B": "recursal/eagle-7b",
    "Google: Gemma 7B": "google/gemma-7b-it",
    "Databricks: DBRX 132B Instruct": "databricks/dbrx-instruct",
    "Zephyr 141B-A35B": "huggingfaceh4/zephyr-orpo-141b-a35b",
    "Meta: Llama 3 8B Instruct": "meta-llama/llama-3-8b-instruct",
    "WizardLM-2 8x22B": "microsoft/wizardlm-2-8x22b",
    "WizardLM-2 7B": "microsoft/wizardlm-2-7b",
    "Mistral: Mixtral 8x22B (base)": "mistralai/mixtral-8x22b",
    "Mistral: Mixtral 8x22B Instruct": "mistralai/mixtral-8x22b-instruct",
    "Lynn: Llama 3 Soliloquy 8B": "lynn/soliloquy-l3",
    "Hugging Face: Zephyr 7B (free)": "huggingfaceh4/zephyr-7b-beta:free",
    "Meta: Llama v2 70B Chat (nitro)": "meta-llama/llama-2-70b-chat:nitro",
    "MythoMax 13B (nitro)": "gryphe/mythomax-l2-13b:nitro",
    "Mistral 7B Instruct (nitro)": "mistralai/mistral-7b-instruct:nitro",
    "Google: Gemma 7B (nitro)": "google/gemma-7b-it:nitro",
    "Toppy M 7B (nitro)": "undi95/toppy-m-7b:nitro",
    "WizardLM-2 8x22B (nitro)": "microsoft/wizardlm-2-8x22b:nitro",
    "Meta: Llama 3 8B Instruct (nitro)": "meta-llama/llama-3-8b-instruct:nitro",
    "Meta: Llama 3 70B Instruct (nitro)": "meta-llama/llama-3-70b-instruct:nitro",
    "Llava 13B": "haotian-liu/llava-13b",
    "Nous: Hermes 2 Vision 7B (alpha)": "nousresearch/nous-hermes-2-vision-7b",
    "Mistral Tiny": "mistralai/mistral-tiny",
    "Mistral Small": "mistralai/mistral-small",
    "Mistral Medium": "mistralai/mistral-medium",
    "Mistral Large": "mistralai/mistral-large",
    "Cohere: Command": "cohere/command",
    "Cohere: Command R": "cohere/command-r",
    "Cohere: Command R+": "cohere/command-r-plus"
  };

  
  const customModelNames = {
    "gpt-4": "GPT-4",
    "gpt-4o": "GPT-4o",
    "gpt-4-32k": "GPT-4-32k",
    "gpt-4-turbo": "GPT-4-Turbo",
    "gpt-3.5-turbo-0125": "GPT-3.5-Turbo",
    "gemini-pro": "Gemini-Pro",
    "gemini-pro-vision": "Gemini-Pro-Vision",
    "gemini-1.5-pro-latest": "Gemini-1.5-Pro",
    "gemini-1.5-flash-latest": "Gemini-1.5-Flash",
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
    // Open Router Models
    "openrouter/auto": "OpenRouter Auto",
    "nousresearch/nous-capybara-7b:free": "Nous: Capybara 7B (free)",
    "mistralai/mistral-7b-instruct:free": "Mistral 7B Instruct (free)",
    "openchat/openchat-7b:free": "OpenChat 3.5 (free)",
    "gryphe/mythomist-7b:free": "MythoMist 7B (free)",
    "undi95/toppy-m-7b:free": "Toppy M 7B (free)",
    "openrouter/cinematika-7b:free": "Cinematika 7B (alpha) (free)",
    "google/gemma-7b-it:free": "Google: Gemma 7B (free)",
    "koboldai/psyfighter-13b-2": "Psyfighter v2 13B",
    "intel/neural-chat-7b": "Neural Chat 7B v3.1",
    "gryphe/mythomax-l2-13b": "MythoMax 13B",
    "pygmalionai/mythalion-13b": "Pygmalion: Mythalion 13B",
    "xwin-lm/xwin-lm-70b": "Xwin 70B",
    "alpindale/goliath-120b": "Goliath 120B",
    "neversleep/noromaid-20b": "Noromaid 20B",
    "gryphe/mythomist-7b": "MythoMist 7B",
    "sophosympatheia/midnight-rose-70b": "Midnight Rose 70B",
    "sao10k/fimbulvetr-11b-v2": "Fimbulvetr 11B v2",
    "undi95/remm-slerp-l2-13b:extended": "ReMM SLERP 13B (extended)",
    "gryphe/mythomax-l2-13b:extended": "MythoMax 13B (extended)",
    "meta-llama/llama-3-8b-instruct:extended": "Meta: Llama 3 8B Instruct (extended)",
    "mancer/weaver": "Mancer: Weaver (alpha)",
    "nousresearch/nous-capybara-7b": "Nous: Capybara 7B",
    "meta-llama/codellama-34b-instruct": "Meta: CodeLlama 34B Instruct",
    "codellama/codellama-70b-instruct": "Meta: CodeLlama 70B Instruct",
    "phind/phind-codellama-34b": "Phind: CodeLlama 34B v2",
    "teknium/openhermes-2-mistral-7b": "OpenHermes 2 Mistral 7B",
    "undi95/remm-slerp-l2-13b": "ReMM SLERP 13B",
    "openrouter/cinematika-7b": "Cinematika 7B (alpha)",
    "01-ai/yi-34b-chat": "Yi 34B Chat",
    "01-ai/yi-34b": "Yi 34B (base)",
    "01-ai/yi-6b": "Yi 6B (base)",
    "togethercomputer/stripedhyena-nous-7b": "StripedHyena Nous 7B",
    "togethercomputer/stripedhyena-hessian-7b": "StripedHyena Hessian 7B (base)",
    "mistralai/mixtral-8x7b": "Mixtral 8x7B (base)",
    "nousresearch/nous-hermes-yi-34b": "Nous: Hermes 2 Yi 34B",
    "nousresearch/nous-hermes-2-mixtral-8x7b-sft": "Nous: Hermes 2 Mixtral 8x7B SFT",
    "nousresearch/nous-hermes-2-mistral-7b-dpo": "Nous: Hermes 2 Mistral 7B DPO",
    "meta-llama/llama-3-70b-instruct": "Meta: Llama 3 70B Instruct",
    "mistralai/mixtral-8x7b-instruct:nitro": "Mixtral 8x7b Instruct (nitro)",
    "open-orca/mistral-7b-openorca": "Mistral OpenOrca 7B",
    "huggingfaceh4/zephyr-7b-beta": "Hugging Face: Zephyr 7B",
    "openai/gpt-3.5-turbo": "OpenAI: GPT-3.5 Turbo",
    "openai/gpt-3.5-turbo-16k": "OpenAI: GPT-3.5 Turbo 16k",
    "openai/gpt-4-turbo": "OpenAI: GPT-4 Turbo",
    "openai/gpt-4-turbo-preview": "OpenAI: GPT-4 Turbo Preview",
    "openai/gpt-4": "OpenAI: GPT-4",
    "openai/gpt-4-32k": "OpenAI: GPT-4 32k",
    "openai/gpt-4-vision-preview": "OpenAI: GPT-4 Vision",
    "openai/gpt-3.5-turbo-instruct": "OpenAI: GPT-3.5 Turbo Instruct",
    "google/palm-2-chat-bison": "Google: PaLM 2 Chat",
    "google/palm-2-codechat-bison": "Google: PaLM 2 Code Chat",
    "google/palm-2-chat-bison-32k": "Google: PaLM 2 Chat 32k",
    "google/palm-2-codechat-bison-32k": "Google: PaLM 2 Code Chat 32k",
    "google/gemini-pro": "Google: Gemini Pro 1.0",
    "google/gemini-pro-vision": "Google: Gemini Pro Vision 1.0",
    "google/gemini-pro-1.5": "Google: Gemini Pro 1.5 (preview)",
    "perplexity/pplx-70b-online": "Perplexity: PPLX 70B Online",
    "perplexity/pplx-7b-online": "Perplexity: PPLX 7B Online",
    "perplexity/pplx-7b-chat": "Perplexity: PPLX 7B Chat",
    "perplexity/pplx-70b-chat": "Perplexity: PPLX 70B Chat",
    "perplexity/sonar-small-chat": "Perplexity: Sonar 7B",
    "perplexity/sonar-medium-chat": "Perplexity: Sonar 8x7B",
    "perplexity/sonar-small-online": "Perplexity: Sonar 7B Online",
    "perplexity/sonar-medium-online": "Perplexity: Sonar 8x7B Online",
    "fireworks/firellava-13b": "Fireworks: FireLLaVA 13B",
    "anthropic/claude-3-opus": "Anthropic: Claude 3 Opus",
    "anthropic/claude-3-sonnet": "Anthropic: Claude 3 Sonnet",
    "anthropic/claude-3-haiku": "Anthropic: Claude 3 Haiku",
    "anthropic/claude-2": "Anthropic: Claude v2",
    "anthropic/claude-2.0": "Anthropic: Claude v2.0",
    "anthropic/claude-2.1": "Anthropic: Claude v2.1",
    "anthropic/claude-instant-1": "Anthropic: Claude Instant v1",
    "anthropic/claude-3-opus:beta": "Anthropic: Claude 3 Opus (self-moderated)",
    "anthropic/claude-3-sonnet:beta": "Anthropic: Claude 3 Sonnet (self-moderated)",
    "anthropic/claude-3-haiku:beta": "Anthropic: Claude 3 Haiku (self-moderated)",
    "anthropic/claude-2:beta": "Anthropic: Claude v2 (self-moderated)",
    "anthropic/claude-2.0:beta": "Anthropic: Claude v2.0 (self-moderated)",
    "anthropic/claude-2.1:beta": "Anthropic: Claude v2.1 (self-moderated)",
    "anthropic/claude-instant-1:beta": "Anthropic: Claude Instant v1 (self-moderated)",
    "meta-llama/llama-2-13b-chat": "Meta: Llama v2 13B Chat",
    "meta-llama/llama-2-70b-chat": "Meta: Llama v2 70B Chat",
    "nousresearch/nous-hermes-llama2-13b": "Nous: Hermes 13B",
    "nousresearch/nous-capybara-34b": "Nous: Capybara 34B",
    "jondurbin/airoboros-l2-70b": "Airoboros 70B",
    "autism/chronos-hermes-13b": "Chronos Hermes 13B v2",
    "mistralai/mistral-7b-instruct": "Mistral 7B Instruct",
    "teknium/openhermes-2.5-mistral-7b": "OpenHermes 2.5 Mistral 7B",
    "openchat/openchat-7b": "OpenChat 3.5",
    "undi95/toppy-m-7b": "Toppy M 7B",
    "lizpreciatior/lzlv-70b-fp16-hf": "lzlv 70B",
    "mistralai/mixtral-8x7b-instruct": "Mixtral 8x7B Instruct",
    "cognitivecomputations/dolphin-mixtral-8x7b": "Dolphin 2.6 Mixtral 8x7B",
    "neversleep/noromaid-mixtral-8x7b-instruct": "Noromaid Mixtral 8x7B Instruct",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo": "Nous: Hermes 2 Mixtral 8x7B DPO",
    "rwkv/rwkv-5-world-3b": "RWKV v5 World 3B",
    "recursal/rwkv-5-3b-ai-town": "RWKV v5 3B AI Town",
    "recursal/eagle-7b": "RWKV v5: Eagle 7B",
    "google/gemma-7b-it": "Google: Gemma 7B",
    "databricks/dbrx-instruct": "Databricks: DBRX 132B Instruct",
    "huggingfaceh4/zephyr-orpo-141b-a35b": "Zephyr 141B-A35B",
    "meta-llama/llama-3-8b-instruct": "Meta: Llama 3 8B Instruct",
    "microsoft/wizardlm-2-8x22b": "WizardLM-2 8x22B",
    "microsoft/wizardlm-2-7b": "WizardLM-2 7B",
    "mistralai/mixtral-8x22b": "Mistral: Mixtral 8x22B (base)",
    "mistralai/mixtral-8x22b-instruct": "Mistral: Mixtral 8x22B Instruct",
    "lynn/soliloquy-l3": "Lynn: Llama 3 Soliloquy 8B",
    "huggingfaceh4/zephyr-7b-beta:free": "Hugging Face: Zephyr 7B (free)",
    "meta-llama/llama-2-70b-chat:nitro": "Meta: Llama v2 70B Chat (nitro)",
    "gryphe/mythomax-l2-13b:nitro": "MythoMax 13B (nitro)",
    "mistralai/mistral-7b-instruct:nitro": "Mistral 7B Instruct (nitro)",
    "google/gemma-7b-it:nitro": "Google: Gemma 7B (nitro)",
    "undi95/toppy-m-7b:nitro": "Toppy M 7B (nitro)",
    "microsoft/wizardlm-2-8x22b:nitro": "WizardLM-2 8x22B (nitro)",
    "meta-llama/llama-3-8b-instruct:nitro": "Meta: Llama 3 8B Instruct (nitro)",
    "meta-llama/llama-3-70b-instruct:nitro": "Meta: Llama 3 70B Instruct (nitro)",
    "haotian-liu/llava-13b": "Llava 13B",
    "nousresearch/nous-hermes-2-vision-7b": "Nous: Hermes 2 Vision 7B (alpha)",
    "mistralai/mistral-tiny": "Mistral Tiny",
    "mistralai/mistral-small": "Mistral Small",
    "mistralai/mistral-medium": "Mistral Medium",
    "mistralai/mistral-large": "Mistral Large",
    "cohere/command": "Cohere: Command",
    "cohere/command-r": "Cohere: Command R",
    "cohere/command-r-plus": "Cohere: Command R+",
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
      "gemini-pro": "Gemini-Pro: Google Bard Model — 3.5 Equivalent",
      "gemini-pro-vision": "Gemini-Vision: View Images — One-Time Use",
      "gemini-1.5-pro": "Gemini-Pro-1.5: Early Access — 1 Million Tokens",
      "gemini-1.0-ultra": "Gemini-Ultra: Largest Google Model — Unreleased",
      "claude-3-opus-20240229": "Claude-Opus: Most Powerful — GPT-4 Level",
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
      "Llama3-8b": "Llama3 8b: Smaller, Faster Model — Cheaper",
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
document.getElementById('model-gemini-pro-vision').addEventListener('click', () => selectModel('gemini-pro-vision'));
document.getElementById('model-gemini-1.5-pro').addEventListener('click', () => selectModel('gemini-1.5-pro-latest'));
document.getElementById('model-gemini-1.5-flash').addEventListener('click', () => selectModel('gemini-1.5-flash-latest'));
document.getElementById('model-gemini-ultra').addEventListener('click', () => selectModel('gemini-1.0-ultra'));

// Event listeners for showing Gemini model descriptions on hover
document.getElementById('model-gemini-pro').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro"], event.currentTarget));
document.getElementById('model-gemini-pro-vision').addEventListener('mouseover', (event) => showCustomTooltip(modelDescriptions["gemini-pro-vision"], event.currentTarget));
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


// select open router models lol

// Event listeners for additional models
document.getElementById('model-openrouter-auto').addEventListener('click', () => selectModel('openrouter/auto'));
document.getElementById('model-nous-capybara-7b-free').addEventListener('click', () => selectModel('nousresearch/nous-capybara-7b:free'));
document.getElementById('model-mistral-7b-instruct-free').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:free'));
document.getElementById('model-openchat-7b-free').addEventListener('click', () => selectModel('openchat/openchat-7b:free'));
document.getElementById('model-mythomist-7b-free').addEventListener('click', () => selectModel('gryphe/mythomist-7b:free'));
document.getElementById('model-toppy-m-7b-free').addEventListener('click', () => selectModel('undi95/toppy-m-7b:free'));
document.getElementById('model-cinematika-7b-free').addEventListener('click', () => selectModel('openrouter/cinematika-7b:free'));
document.getElementById('model-gemma-7b-free').addEventListener('click', () => selectModel('google/gemma-7b-it:free'));
document.getElementById('model-psyfighter-v2-13b').addEventListener('click', () => selectModel('koboldai/psyfighter-13b-2'));
document.getElementById('model-neural-chat-7b').addEventListener('click', () => selectModel('intel/neural-chat-7b'));
document.getElementById('model-mythomax-13b').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b'));
document.getElementById('model-mythalion-13b').addEventListener('click', () => selectModel('pygmalionai/mythalion-13b'));
document.getElementById('model-xwin-70b').addEventListener('click', () => selectModel('xwin-lm/xwin-lm-70b'));
document.getElementById('model-goliath-120b').addEventListener('click', () => selectModel('alpindale/goliath-120b'));
document.getElementById('model-noromaid-20b').addEventListener('click', () => selectModel('neversleep/noromaid-20b'));
document.getElementById('model-mythomist-7b').addEventListener('click', () => selectModel('gryphe/mythomist-7b'));
document.getElementById('model-midnight-rose-70b').addEventListener('click', () => selectModel('sophosympatheia/midnight-rose-70b'));
document.getElementById('model-fimbulvetr-11b-v2').addEventListener('click', () => selectModel('sao10k/fimbulvetr-11b-v2'));
document.getElementById('model-remm-slerp-13b-extended').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b:extended'));
document.getElementById('model-mythomax-13b-extended').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:extended'));
document.getElementById('model-llama-3-8b-instruct-extended').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:extended'));
document.getElementById('model-weaver').addEventListener('click', () => selectModel('mancer/weaver'));
document.getElementById('model-nous-capybara-7b').addEventListener('click', () => selectModel('nousresearch/nous-capybara-7b'));
document.getElementById('model-codellama-34b-instruct').addEventListener('click', () => selectModel('meta-llama/codellama-34b-instruct'));
document.getElementById('model-codellama-70b-instruct').addEventListener('click', () => selectModel('codellama/codellama-70b-instruct'));
document.getElementById('model-phind-codellama-34b').addEventListener('click', () => selectModel('phind/phind-codellama-34b'));
document.getElementById('model-openhermes-2-mistral-7b').addEventListener('click', () => selectModel('teknium/openhermes-2-mistral-7b'));
document.getElementById('model-remm-slerp-13b').addEventListener('click', () => selectModel('undi95/remm-slerp-l2-13b'));
document.getElementById('model-cinematika-7b').addEventListener('click', () => selectModel('openrouter/cinematika-7b'));
document.getElementById('model-yi-34b-chat').addEventListener('click', () => selectModel('01-ai/yi-34b-chat'));
document.getElementById('model-yi-34b').addEventListener('click', () => selectModel('01-ai/yi-34b'));
document.getElementById('model-yi-6b').addEventListener('click', () => selectModel('01-ai/yi-6b'));
document.getElementById('model-stripedhyena-nous-7b').addEventListener('click', () => selectModel('togethercomputer/stripedhyena-nous-7b'));
document.getElementById('model-stripedhyena-hessian-7b').addEventListener('click', () => selectModel('togethercomputer/stripedhyena-hessian-7b'));
document.getElementById('model-mixtral-8x7b').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b'));
document.getElementById('model-nous-hermes-yi-34b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-yi-34b'));
document.getElementById('model-nous-hermes-2-mixtral-8x7b-sft').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mixtral-8x7b-sft'));
document.getElementById('model-nous-hermes-2-mistral-7b-dpo').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mistral-7b-dpo'));
document.getElementById('model-llama-3-70b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct'));
document.getElementById('model-mixtral-8x7b-instruct-nitro').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct:nitro'));
document.getElementById('model-mistral-7b-openorca').addEventListener('click', () => selectModel('open-orca/mistral-7b-openorca'));
document.getElementById('model-zephyr-7b-beta').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-7b-beta'));
document.getElementById('model-gpt-3-5-turbo').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo'));
document.getElementById('model-gpt-3-5-turbo-0125').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-0125'));
document.getElementById('model-gpt-3-5-turbo-16k').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-16k'));
document.getElementById('model-open-gpt-4-turbo').addEventListener('click', () => selectModel('openai/gpt-4-turbo'));
document.getElementById('model-gpt-4-turbo-preview').addEventListener('click', () => selectModel('openai/gpt-4-turbo-preview'));
document.getElementById('model-open-gpt-4').addEventListener('click', () => selectModel('openai/gpt-4'));
document.getElementById('model-open-gpt-4-32k').addEventListener('click', () => selectModel('openai/gpt-4-32k'));
document.getElementById('model-gpt-4-vision').addEventListener('click', () => selectModel('openai/gpt-4-vision-preview'));
document.getElementById('model-gpt-3-5-turbo-instruct').addEventListener('click', () => selectModel('openai/gpt-3.5-turbo-instruct'));
document.getElementById('model-palm-2-chat').addEventListener('click', () => selectModel('google/palm-2-chat-bison'));
document.getElementById('model-palm-2-code-chat').addEventListener('click', () => selectModel('google/palm-2-codechat-bison'));
document.getElementById('model-palm-2-chat-32k').addEventListener('click', () => selectModel('google/palm-2-chat-bison-32k'));
document.getElementById('model-palm-2-code-chat-32k').addEventListener('click', () => selectModel('google/palm-2-codechat-bison-32k'));
document.getElementById('model-open-gemini-pro').addEventListener('click', () => selectModel('google/gemini-pro'));
document.getElementById('model-open-gemini-pro-vision').addEventListener('click', () => selectModel('google/gemini-pro-vision'));
document.getElementById('model-gemini-pro-1-5').addEventListener('click', () => selectModel('google/gemini-pro-1.5'));
document.getElementById('model-pplx-70b-online').addEventListener('click', () => selectModel('perplexity/pplx-70b-online'));
document.getElementById('model-pplx-7b-online').addEventListener('click', () => selectModel('perplexity/pplx-7b-online'));
document.getElementById('model-pplx-7b-chat').addEventListener('click', () => selectModel('perplexity/pplx-7b-chat'));
document.getElementById('model-pplx-70b-chat').addEventListener('click', () => selectModel('perplexity/pplx-70b-chat'));
document.getElementById('model-sonar-7b').addEventListener('click', () => selectModel('perplexity/sonar-small-chat'));
document.getElementById('model-sonar-8x7b').addEventListener('click', () => selectModel('perplexity/sonar-medium-chat'));
document.getElementById('model-sonar-7b-online').addEventListener('click', () => selectModel('perplexity/sonar-small-online'));
document.getElementById('model-sonar-8x7b-online').addEventListener('click', () => selectModel('perplexity/sonar-medium-online'));
document.getElementById('model-firellava-13b').addEventListener('click', () => selectModel('fireworks/firellava-13b'));
document.getElementById('model-claude-3-opus').addEventListener('click', () => selectModel('anthropic/claude-3-opus'));
document.getElementById('model-claude-3-sonnet').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet'));
document.getElementById('model-claude-3-haiku').addEventListener('click', () => selectModel('anthropic/claude-3-haiku'));
document.getElementById('model-claude-v2').addEventListener('click', () => selectModel('anthropic/claude-2'));
document.getElementById('model-claude-2-0').addEventListener('click', () => selectModel('anthropic/claude-2.0'));
document.getElementById('model-claude-2-1').addEventListener('click', () => selectModel('anthropic/claude-2.1'));
document.getElementById('model-claude-instant-1').addEventListener('click', () => selectModel('anthropic/claude-instant-1'));
document.getElementById('model-claude-3-opus-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-3-opus:beta'));
document.getElementById('model-claude-3-sonnet-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-3-sonnet:beta'));
document.getElementById('model-claude-3-haiku-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-3-haiku:beta'));
document.getElementById('model-claude-v2-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-2:beta'));
document.getElementById('model-claude-2-0-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-2.0:beta'));
document.getElementById('model-claude-2-1-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-2.1:beta'));
document.getElementById('model-claude-instant-1-self-moderated').addEventListener('click', () => selectModel('anthropic/claude-instant-1:beta'));
document.getElementById('model-llama-v2-13b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-13b-chat'));
document.getElementById('model-llama-v2-70b-chat').addEventListener('click', () => selectModel('meta-llama/llama-2-70b-chat'));
document.getElementById('model-nous-hermes-13b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-llama2-13b'));
document.getElementById('model-nous-capybara-34b').addEventListener('click', () => selectModel('nousresearch/nous-capybara-34b'));
document.getElementById('model-airoboros-70b').addEventListener('click', () => selectModel('jondurbin/airoboros-l2-70b'));
document.getElementById('model-chronos-hermes-13b').addEventListener('click', () => selectModel('austism/chronos-hermes-13b'));
document.getElementById('model-mistral-7b-instruct').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct'));
document.getElementById('model-openhermes-2-5-mistral-7b').addEventListener('click', () => selectModel('teknium/openhermes-2.5-mistral-7b'));
document.getElementById('model-openchat-3-5').addEventListener('click', () => selectModel('openchat/openchat-7b'));
document.getElementById('model-toppy-m-7b').addEventListener('click', () => selectModel('undi95/toppy-m-7b'));
document.getElementById('model-lzlv-70b').addEventListener('click', () => selectModel('lizpreciatior/lzlv-70b-fp16-hf'));
document.getElementById('model-mixtral-8x7b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x7b-instruct'));
document.getElementById('model-dolphin-2-6-mixtral-8x7b').addEventListener('click', () => selectModel('cognitivecomputations/dolphin-mixtral-8x7b'));
document.getElementById('model-noromaid-mixtral-8x7b-instruct').addEventListener('click', () => selectModel('neversleep/noromaid-mixtral-8x7b-instruct'));
document.getElementById('model-nous-hermes-2-mixtral-8x7b-dpo').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-mixtral-8x7b-dpo'));
document.getElementById('model-rwkv-5-world-3b').addEventListener('click', () => selectModel('rwkv/rwkv-5-world-3b'));
document.getElementById('model-rwkv-5-3b-ai-town').addEventListener('click', () => selectModel('recursal/rwkv-5-3b-ai-town'));
document.getElementById('model-rwkv-5-eagle-7b').addEventListener('click', () => selectModel('recursal/eagle-7b'));
document.getElementById('model-gemma-7b').addEventListener('click', () => selectModel('google/gemma-7b-it'));
document.getElementById('model-dbrx-132b-instruct').addEventListener('click', () => selectModel('databricks/dbrx-instruct'));
document.getElementById('model-zephyr-141b-a35b').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-orpo-141b-a35b'));
document.getElementById('model-meta-llama-3-8b-instruct').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct'));
document.getElementById('model-wizardlm-2-8x22b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-8x22b'));
document.getElementById('model-wizardlm-2-7b').addEventListener('click', () => selectModel('microsoft/wizardlm-2-7b'));
document.getElementById('model-mixtral-8x22b').addEventListener('click', () => selectModel('mistralai/mixtral-8x22b'));
document.getElementById('model-mixtral-8x22b-instruct').addEventListener('click', () => selectModel('mistralai/mixtral-8x22b-instruct'));
document.getElementById('model-soliloquy-l3').addEventListener('click', () => selectModel('lynn/soliloquy-l3'));
document.getElementById('model-zephyr-7b-beta-free').addEventListener('click', () => selectModel('huggingfaceh4/zephyr-7b-beta:free'));
document.getElementById('model-llama-2-70b-chat-nitro').addEventListener('click', () => selectModel('meta-llama/llama-2-70b-chat:nitro'));
document.getElementById('model-mythomax-13b-nitro').addEventListener('click', () => selectModel('gryphe/mythomax-l2-13b:nitro'));
document.getElementById('model-mistral-7b-instruct-nitro').addEventListener('click', () => selectModel('mistralai/mistral-7b-instruct:nitro'));
document.getElementById('model-gemma-7b-nitro').addEventListener('click', () => selectModel('google/gemma-7b-it:nitro'));
document.getElementById('model-toppy-m-7b-nitro').addEventListener('click', () => selectModel('undi95/toppy-m-7b:nitro'));
document.getElementById('model-wizardlm-2-8x22b-nitro').addEventListener('click', () => selectModel('microsoft/wizardlm-2-8x22b:nitro'));
document.getElementById('model-llama-3-8b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3-8b-instruct:nitro'));
document.getElementById('model-llama-3-70b-instruct-nitro').addEventListener('click', () => selectModel('meta-llama/llama-3-70b-instruct:nitro'));
document.getElementById('model-llava-13b').addEventListener('click', () => selectModel('haotian-liu/llava-13b'));
document.getElementById('model-nous-hermes-2-vision-7b').addEventListener('click', () => selectModel('nousresearch/nous-hermes-2-vision-7b'));
document.getElementById('model-open-mistral-tiny').addEventListener('click', () => selectModel('mistralai/mistral-tiny'));
document.getElementById('model-open-mistral-small').addEventListener('click', () => selectModel('mistralai/mistral-small'));
document.getElementById('model-open-mistral-medium').addEventListener('click', () => selectModel('mistralai/mistral-medium'));
document.getElementById('model-open-mistral-large').addEventListener('click', () => selectModel('mistralai/mistral-large'));
document.getElementById('model-command').addEventListener('click', () => selectModel('cohere/command'));
document.getElementById('model-command-r').addEventListener('click', () => selectModel('cohere/command-r'));
document.getElementById('model-command-r-plus').addEventListener('click', () => selectModel('cohere/command-r-plus'));


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
            initialize: isFirstMessage
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
            file: fileUrl
          };
          endpoint = `${baseURL}/message`; // OpenAI endpoint
        }
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
          } else if (endpoint.includes('assistant')) {
            messageContent = data.text.text || 'No response received.';
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

  if (type === 'image') {
      const imageElement = document.createElement('img');
      imageElement.src = message;
      imageElement.alt = "Generated Image";
      imageElement.classList.add('generated-image'); // A class for styling images

      messageElement.appendChild(imageElement);
  } else {
    // Check if message contains a code block
  if (message.includes('```')) {
    // Improved regex pattern to correctly identify and split code blocks
    const parts = message.split(/(```[\s\S]+?```)/);
    parts.forEach(part => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Handle code blocks
        const codeContent = part.substring(3, part.length - 3);
        const pre = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.innerText = codeContent; // Use innerText to display raw code content
        pre.appendChild(codeElement);
        messageElement.appendChild(pre);
        // Add a "Copy Code" button for this code block
        const copyCodeButton = document.createElement('button');
        copyCodeButton.textContent = 'Copy Code';
        copyCodeButton.onclick = function() { copyToClipboard(codeContent); };
        pre.appendChild(copyCodeButton);
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
  })
  .catch(error => {
    console.error('Error:', error);
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
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
