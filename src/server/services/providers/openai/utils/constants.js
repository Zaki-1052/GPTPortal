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
const CHAT_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4.1',
  'gpt-4o-mini',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0125'
];

// Chat Completions models with web search
const WEB_SEARCH_CHAT_MODELS = [
  'gpt-4o-search-preview',
  'gpt-4o-mini-search-preview'
];

// Reasoning models (use Responses API)
const REASONING_MODELS = [
  'o1',
  'o1-preview',
  'o1-mini',
  'o3',
  'o3-mini',
  'o4',
  'o4-mini',
  'o1-pro',
  'o3-pro'
];

// Models that support web search via Responses API
const WEB_SEARCH_RESPONSES_MODELS = [
  'gpt-4.1',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.1-mini'
];

// Image generation models
const IMAGE_MODELS = [
  'gpt-image-1',
  'dall-e-3',
  'dall-e-2'
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
  WEB_SEARCH_RESPONSES_MODELS,
  IMAGE_MODELS,
  AUDIO_MODELS,
  WEB_SEARCH_CONFIG,
  DEFAULTS,
  AUDIO_CONFIG,
  CONTENT_TYPES,
  ERROR_TYPES
};