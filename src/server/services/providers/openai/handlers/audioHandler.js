// src/server/services/providers/openai/handlers/audioHandler.js
// Audio transcription and text-to-speech handler for OpenAI models

const FormData = require('form-data');
const fs = require('fs');
const { AUDIO_MODELS, AUDIO_CONFIG, CONTENT_TYPES } = require('../utils/constants');
const { generateTranscriptionPrompt, generateTTSInstructions } = require('../utils/formatters');

class AudioHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Check if model supports transcription
   */
  supportsTranscription(modelId) {
    return AUDIO_MODELS.TRANSCRIPTION.includes(modelId);
  }

  /**
   * Check if model supports text-to-speech
   */
  supportsTTS(modelId) {
    return AUDIO_MODELS.TTS.includes(modelId);
  }

  /**
   * Enhanced transcription with GPT-4o models
   */
  async transcribeWithGPTModel(audioFilePath, filename, model = 'gpt-4o-transcribe') {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath), filename);
    formData.append('model', model);
    formData.append('response_format', 'json');
    
    // Add intelligent prompting for better quality
    const contextPrompt = generateTranscriptionPrompt(filename);
    formData.append('prompt', contextPrompt);

    try {
      const response = await this.apiClient.audioTranscription(formData);
      const transcription = "Voice Transcription: " + response.data.text;
      
      return {
        success: true,
        text: transcription,
        model: model,
        duration: response.data.duration
      };
    } catch (error) {
      console.error(`${model} API Error:`, error.message);
      throw error;
    }
  }

  /**
   * Fallback transcription with Whisper-1
   */
  async transcribeWithWhisper(audioFilePath, filename) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath), filename);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    try {
      const response = await this.apiClient.audioTranscription(formData);
      const transcription = "Voice Transcription: " + response.data.text;
      
      return {
        success: true,
        text: transcription,
        model: 'whisper-1',
        duration: response.data.duration
      };
    } catch (error) {
      console.error('Whisper-1 API Error:', error.message);
      throw error;
    }
  }

  /**
   * Main transcription method with intelligent model selection and fallback
   */
  async transcribeAudio(audioFilePath, filename, options = {}) {
    const {
      preferredModel = 'gpt-4o-transcribe',
      usePrompting = true
    } = options;

    console.log(`🎤 Starting transcription of: "${filename}"`);

    try {
      // Try GPT-4o Transcribe first (highest quality)
      if (preferredModel === 'gpt-4o-transcribe') {
        console.log('📝 Attempting GPT-4o Transcribe...');
        try {
          const result = await this.transcribeWithGPTModel(audioFilePath, filename, 'gpt-4o-transcribe');
          console.log('✅ GPT-4o Transcribe successful');
          return result;
        } catch (gpt4oError) {
          console.warn('⚠️ GPT-4o Transcribe failed, trying GPT-4o Mini fallback:', gpt4oError.message);
          
          // Fallback to GPT-4o Mini Transcribe
          try {
            const result = await this.transcribeWithGPTModel(audioFilePath, filename, 'gpt-4o-mini-transcribe');
            console.log('✅ GPT-4o Mini Transcribe fallback successful');
            return { ...result, usedFallback: true, fallbackReason: gpt4oError.message };
          } catch (gpt4oMiniError) {
            console.warn('⚠️ GPT-4o Mini Transcribe failed, trying Whisper-1 fallback:', gpt4oMiniError.message);
            
            // Final fallback to Whisper-1
            const result = await this.transcribeWithWhisper(audioFilePath, filename);
            console.log('✅ Whisper-1 final fallback successful');
            return { 
              ...result, 
              usedFallback: true, 
              fallbackReason: `GPT-4o: ${gpt4oError.message}, GPT-4o Mini: ${gpt4oMiniError.message}` 
            };
          }
        }
      } else if (preferredModel === 'gpt-4o-mini-transcribe') {
        // Start with GPT-4o Mini if specifically requested
        try {
          const result = await this.transcribeWithGPTModel(audioFilePath, filename, 'gpt-4o-mini-transcribe');
          console.log('✅ GPT-4o Mini Transcribe successful');
          return result;
        } catch (gpt4oMiniError) {
          console.warn('⚠️ GPT-4o Mini Transcribe failed, trying Whisper-1 fallback:', gpt4oMiniError.message);
          const result = await this.transcribeWithWhisper(audioFilePath, filename);
          console.log('✅ Whisper-1 fallback successful');
          return { ...result, usedFallback: true, fallbackReason: gpt4oMiniError.message };
        }
      } else {
        // Direct Whisper-1 transcription if specifically requested
        return await this.transcribeWithWhisper(audioFilePath, filename);
      }
    } catch (error) {
      console.error('🚨 All transcription methods failed:', error.message);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Enhanced TTS with GPT-4o Mini TTS model
   */
  async textToSpeechWithGPTModel(text, options = {}) {
    const {
      voice = 'coral',
      responseFormat = 'mp3',
      instructions = null
    } = options;

    const requestData = {
      model: "gpt-4o-mini-tts",
      voice: voice,
      input: text,
      response_format: responseFormat
    };

    // Add intelligent instructions if not provided
    if (instructions) {
      requestData.instructions = instructions;
    } else {
      requestData.instructions = generateTTSInstructions(text);
    }

    try {
      const response = await this.apiClient.textToSpeech(requestData);
      
      const contentType = this.getContentTypeForFormat(responseFormat);
      
      return {
        success: true,
        audioData: response.data,
        contentType: contentType,
        model: 'gpt-4o-mini-tts',
        voice: voice,
        instructions: requestData.instructions
      };
    } catch (error) {
      console.error('GPT-4o Mini TTS API Error:', error.message);
      throw error;
    }
  }

  /**
   * Fallback TTS with legacy models
   */
  async textToSpeechWithLegacyModel(text, model = 'tts-1-hd', options = {}) {
    const {
      voice = 'echo',
      responseFormat = 'mp3'
    } = options;

    const requestData = {
      model: model,
      voice: voice,
      input: text,
      response_format: responseFormat
    };

    try {
      const response = await this.apiClient.textToSpeech(requestData);
      
      const contentType = this.getContentTypeForFormat(responseFormat);
      
      return {
        success: true,
        audioData: response.data,
        contentType: contentType,
        model: model,
        voice: voice
      };
    } catch (error) {
      console.error(`${model} API Error:`, error.message);
      throw error;
    }
  }

  /**
   * Get content type for audio format
   */
  getContentTypeForFormat(format) {
    return CONTENT_TYPES[format] || 'audio/mpeg';
  }

  /**
   * Main TTS method with intelligent model selection and fallback
   */
  async textToSpeech(text, options = {}) {
    const {
      preferredModel = 'gpt-4o-mini-tts',
      voice = 'coral',
      responseFormat = 'mp3',
      instructions = null,
      useIntelligentInstructions = true
    } = options;

    console.log(`🔊 Starting TTS generation for: "${text.substring(0, 50)}..."`);

    try {
      // Try GPT-4o Mini TTS first (default with advanced features)
      if (preferredModel === 'gpt-4o-mini-tts') {
        console.log('🎙️ Attempting GPT-4o Mini TTS...');
        try {
          const result = await this.textToSpeechWithGPTModel(text, {
            voice,
            responseFormat,
            instructions: useIntelligentInstructions ? instructions : null
          });
          console.log('✅ GPT-4o Mini TTS successful');
          return result;
        } catch (gpt4oTTSError) {
          console.warn('⚠️ GPT-4o Mini TTS failed, trying TTS-1-HD fallback:', gpt4oTTSError.message);
          
          // Fallback to TTS-1-HD
          try {
            const result = await this.textToSpeechWithLegacyModel(text, 'tts-1-hd', {
              voice: voice === 'coral' ? 'echo' : voice, // coral not available in legacy models
              responseFormat
            });
            console.log('✅ TTS-1-HD fallback successful');
            return { ...result, usedFallback: true, fallbackReason: gpt4oTTSError.message };
          } catch (tts1HDError) {
            console.warn('⚠️ TTS-1-HD failed, trying TTS-1 fallback:', tts1HDError.message);
            
            // Final fallback to TTS-1
            const result = await this.textToSpeechWithLegacyModel(text, 'tts-1', {
              voice: voice === 'coral' ? 'echo' : voice, // coral not available in legacy models
              responseFormat
            });
            console.log('✅ TTS-1 final fallback successful');
            return { 
              ...result, 
              usedFallback: true, 
              fallbackReason: `GPT-4o Mini TTS: ${gpt4oTTSError.message}, TTS-1-HD: ${tts1HDError.message}` 
            };
          }
        }
      } else if (preferredModel === 'tts-1-hd') {
        // Start with TTS-1-HD if specifically requested
        try {
          const result = await this.textToSpeechWithLegacyModel(text, 'tts-1-hd', {
            voice,
            responseFormat
          });
          console.log('✅ TTS-1-HD successful');
          return result;
        } catch (tts1HDError) {
          console.warn('⚠️ TTS-1-HD failed, trying TTS-1 fallback:', tts1HDError.message);
          const result = await this.textToSpeechWithLegacyModel(text, 'tts-1', {
            voice,
            responseFormat
          });
          console.log('✅ TTS-1 fallback successful');
          return { ...result, usedFallback: true, fallbackReason: tts1HDError.message };
        }
      } else {
        // Direct TTS-1 generation if specifically requested
        return await this.textToSpeechWithLegacyModel(text, 'tts-1', {
          voice,
          responseFormat
        });
      }
    } catch (error) {
      console.error('🚨 All TTS methods failed:', error.message);
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }

  /**
   * Get supported models
   */
  getSupportedModels() {
    return {
      transcription: AUDIO_MODELS.TRANSCRIPTION,
      tts: AUDIO_MODELS.TTS,
      all: [...AUDIO_MODELS.TRANSCRIPTION, ...AUDIO_MODELS.TTS]
    };
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelId) {
    const capabilities = {
      transcription: this.supportsTranscription(modelId),
      textToSpeech: this.supportsTTS(modelId),
      voiceOptions: this.getVoiceOptions(modelId),
      formats: this.getSupportedFormats(modelId),
      intelligentFeatures: this.hasIntelligentFeatures(modelId)
    };

    return capabilities;
  }

  /**
   * Get voice options for model
   */
  getVoiceOptions(modelId) {
    if (modelId === 'gpt-4o-mini-tts') {
      return [...AUDIO_CONFIG.TTS.VOICES.STANDARD, ...AUDIO_CONFIG.TTS.VOICES.ADVANCED];
    } else if (this.supportsTTS(modelId)) {
      return AUDIO_CONFIG.TTS.VOICES.STANDARD;
    }
    return [];
  }

  /**
   * Get supported formats for model
   */
  getSupportedFormats(modelId) {
    if (this.supportsTranscription(modelId)) {
      return AUDIO_CONFIG.TRANSCRIPTION.SUPPORTED_FORMATS;
    } else if (this.supportsTTS(modelId)) {
      return AUDIO_CONFIG.TTS.FORMATS;
    }
    return [];
  }

  /**
   * Check if model has intelligent features
   */
  hasIntelligentFeatures(modelId) {
    return ['gpt-4o-transcribe', 'gpt-4o-mini-transcribe', 'gpt-4o-mini-tts'].includes(modelId);
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      supportedModels: this.getSupportedModels().all.length,
      transcriptionModels: AUDIO_MODELS.TRANSCRIPTION.length,
      ttsModels: AUDIO_MODELS.TTS.length,
      apiType: 'Audio'
    };
  }
}

module.exports = AudioHandler;