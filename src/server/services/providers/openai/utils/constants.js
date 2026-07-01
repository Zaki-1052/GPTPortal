// src/server/services/providers/openai/utils/constants.js
// OpenAI API constants and configuration

const API_ENDPOINTS = {
  BASE_URL: 'https://api.openai.com/v1',
  CHAT_COMPLETIONS: '/chat/completions',
  RESPONSES: '/responses',
  IMAGES_GENERATIONS: '/images/generations',
  AUDIO_TRANSCRIPTIONS: '/audio/transcriptions',
  AUDIO_SPEECH: '/audio/speech',
  ASSISTANTS: '/assistants',
  THREADS: '/threads',
  FILES: '/files'
};

// Model categories for routing
const MODEL_TYPES = {
  CHAT: 'chat',
  REASONING: 'reasoning',
  IMAGE: 'image',
  AUDIO: 'audio',
  ASSISTANT: 'assistant'
};

// Chat Completions models
// Legacy, non-reasoning chat models -> Chat Completions API
const CHAT_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano'
];

// Chat Completions models with web search (dedicated search-preview models retired)
const WEB_SEARCH_CHAT_MODELS = [];

// Reasoning models -> Responses API (reasoning.effort control)
const REASONING_MODELS = [
  'gpt-5.5',
  'gpt-5.5-pro',
  'gpt-5.4',
  'gpt-5.4-mini',
  'gpt-5.4-nano',
  'gpt-5.3-codex',
  'gpt-5.2',
  'o4-mini'
];

// Dedicated deep-research models retired; use gpt-5.x + web search instead
const DEEP_RESEARCH_MODELS = [];

// Models that AUTO-enable web search via the Responses API. Kept empty by default so
// reasoning requests stay clean; add ids here to opt a model into always-on web search.
const WEB_SEARCH_RESPONSES_MODELS = [];

// Models that AUTO-enable Code Interpreter via the Responses API. Kept empty by default;
// add ids here to opt a model into always-on code execution.
const CODE_INTERPRETER_MODELS = [];

// Image generation models
const IMAGE_MODELS = [
  'gpt-image-2',
  'gpt-image-1.5',
  'gpt-image-1-mini',
  'gpt-image-1'
];

// Audio models
const AUDIO_MODELS = {
  TRANSCRIPTION: [
    'gpt-4o-transcribe',
    'gpt-4o-mini-transcribe',
    'whisper-1'
  ],
  TTS: [
    'gpt-4o-mini-tts',
    'tts-1-hd',
    'tts-1'
  ]
};

// Web search configuration
const WEB_SEARCH_CONFIG = {
  TOOL_TYPE: 'web_search_preview',
  CONTEXT_SIZES: ['low', 'medium', 'high'],
  DEFAULT_CONTEXT_SIZE: 'medium',
  SUPPORTED_LOCATION_FIELDS: ['country', 'city', 'region', 'timezone']
};

// Code Interpreter configuration
const CODE_INTERPRETER_CONFIG = {
  TOOL_TYPE: 'code_interpreter',
  CONTAINER_TYPES: ['auto', 'explicit'],
  DEFAULT_CONTAINER_TYPE: 'auto',
  SUPPORTED_FILE_FORMATS: [
    'txt', 'csv', 'json', 'py', 'ipynb', 'md', 'html', 'xml',
    'jpg', 'jpeg', 'png', 'gif', 'pdf', 'xlsx', 'docx', 'zip'
  ]
};

// Default parameters
const DEFAULTS = {
  TEMPERATURE: 0.7,
  MAX_TOKENS: 4096,
  TOP_P: 1,
  FREQUENCY_PENALTY: 0,
  PRESENCE_PENALTY: 0
};

// Audio formats and configurations
const AUDIO_CONFIG = {
  TRANSCRIPTION: {
    SUPPORTED_FORMATS: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
    MAX_FILE_SIZE: '25MB',
    RESPONSE_FORMATS: ['json', 'text', 'srt', 'verbose_json', 'vtt']
  },
  TTS: {
    VOICES: {
      STANDARD: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      ADVANCED: ['coral'] // GPT-4o Mini TTS only
    },
    FORMATS: ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm']
  }
};

// Content type mappings
const CONTENT_TYPES = {
  'mp3': 'audio/mpeg',
  'opus': 'audio/opus',
  'aac': 'audio/aac',
  'flac': 'audio/flac',
  'wav': 'audio/wav',
  'pcm': 'audio/pcm'
};

// Error types
const ERROR_TYPES = {
  API_ERROR: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_MODEL: 'INVALID_MODEL',
  AUTHENTICATION: 'AUTHENTICATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR'
};

module.exports = {
  API_ENDPOINTS,
  MODEL_TYPES,
  CHAT_MODELS,
  WEB_SEARCH_CHAT_MODELS,
  REASONING_MODELS,
  DEEP_RESEARCH_MODELS,
  WEB_SEARCH_RESPONSES_MODELS,
  CODE_INTERPRETER_MODELS,
  IMAGE_MODELS,
  AUDIO_MODELS,
  WEB_SEARCH_CONFIG,
  CODE_INTERPRETER_CONFIG,
  DEFAULTS,
  AUDIO_CONFIG,
  CONTENT_TYPES,
  ERROR_TYPES
};