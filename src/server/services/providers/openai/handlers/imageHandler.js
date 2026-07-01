// src/server/services/providers/openai/handlers/imageHandler.js
// Image generation handler for OpenAI DALL-E and GPT Image models

const { IMAGE_MODELS } = require('../utils/constants');

class ImageHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Check if model is supported by this handler
   */
  supportsModel(modelId) {
    return IMAGE_MODELS.includes(modelId);
  }

  /**
   * Enhance prompt using GPT-4o for better image generation
   */
  async enhanceImagePrompt(userPrompt) {
    const enhancementPrompt = `You are an expert at creating detailed, artistic image generation prompts. Take the user's simple request and expand it into a rich, detailed prompt that will generate a beautiful, high-quality image. Focus on:

1. Artistic style and medium
2. Lighting and atmosphere
3. Composition and perspective
4. Color palette and mood
5. Fine details and textures

Keep the enhanced prompt under 50 words. Make it vivid and specific.

User request: "${userPrompt}"

Enhanced prompt:`;

    try {
      const response = await this.apiClient.chatCompletions({
        model: "gpt-4.1",
        messages: [{ role: "user", content: enhancementPrompt }],
        temperature: 0.7,
        max_tokens: 100
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.warn('Prompt enhancement failed, using original prompt:', error.message);
      return userPrompt;
    }
  }

  /**
   * Generate image using GPT Image 1 with Images API
   */
  async generateImageWithGPTImage(prompt, options = {}) {
    const { model = 'gpt-image-2', enhancePrompt = true } = options;
    // gpt-image-* models reject the legacy 'response_format' field (they always
    // return b64_json); 'size' and 'quality' are the supported generation controls.
    const size = options.size && options.size !== 'auto' ? options.size : '1024x1024';
    const quality = options.quality && options.quality !== 'auto' ? options.quality : 'high';

    try {
      // Enhance prompt for better results (skip if enhancePrompt is false)
      const enhancedPrompt = enhancePrompt ? await this.enhanceImagePrompt(prompt) : prompt;

      const requestData = {
        model,
        prompt: enhancedPrompt,
        size,
        quality
      };

      const response = await this.apiClient.imageGeneration(requestData);

      if (response.data && response.data.data[0] && response.data.data[0].b64_json) {
        return {
          success: true,
          imageData: response.data.data[0].b64_json,
          enhancedPrompt: enhancedPrompt,
          originalPrompt: prompt,
          model,
          revisedPrompt: response.data.data[0].revised_prompt || enhancedPrompt
        };
      } else {
        throw new Error('No image data found in response');
      }
    } catch (error) {
      console.error(`${model} API Error:`, error.message);
      throw error;
    }
  }

  /**
   * Generate image using DALL-E as fallback
   */
  async generateImageWithDALLE(prompt, model = "dall-e-3") {
    const requestData = {
      prompt: prompt,
      model: model,
      n: 1,
      quality: model === "dall-e-3" ? 'hd' : 'standard',
      response_format: 'b64_json',
      size: model === "dall-e-3" ? '1024x1024' : '1024x1024'
    };

    try {
      const response = await this.apiClient.imageGeneration(requestData);
      
      return {
        success: true,
        imageData: response.data.data[0].b64_json,
        prompt: prompt,
        model: model,
        revisedPrompt: response.data.data[0].revised_prompt || prompt
      };
    } catch (error) {
      console.error(`${model} API Error:`, error.message);
      throw error;
    }
  }

  /**
   * Main image generation method with intelligent model selection and fallback
   */
  async generateImage(prompt, options = {}) {
    const {
      preferredModel = 'gpt-image-2',
      modelID = 'gpt-image-2',
      enhancePrompt = true,
      quality = 'high',
      size = '1024x1024'
    } = options;

    // Use modelID if provided, otherwise use preferredModel
    const selectedModel = modelID || preferredModel;

    console.log(`🎨 Starting image generation with model: ${selectedModel}, prompt: "${prompt}"`);
    console.log(`🎚️ Enhancement: ${enhancePrompt ? 'enabled' : 'disabled'}`);

    try {
      // Try the requested GPT Image model first (default gpt-image-2)
      if (selectedModel.startsWith('gpt-image')) {
        console.log(`📸 Attempting ${selectedModel}...`);
        try {
          const result = await this.generateImageWithGPTImage(prompt, {
            model: selectedModel,
            quality,
            size,
            enhancePrompt
          });
          console.log(`✅ ${selectedModel} successful`);
          return result;
        } catch (gptImageError) {
          console.warn(`⚠️ ${selectedModel} failed, trying DALL-E 3 fallback:`, gptImageError.message);

          // Fallback to DALL-E 3
          try {
            const result = await this.generateImageWithDALLE(prompt, 'dall-e-3');
            console.log('✅ DALL-E 3 fallback successful');
            return { ...result, usedFallback: true, fallbackReason: gptImageError.message };
          } catch (dalle3Error) {
            console.warn('⚠️ DALL-E 3 failed, trying DALL-E 2 fallback:', dalle3Error.message);

            // Final fallback to DALL-E 2
            const result = await this.generateImageWithDALLE(prompt, 'dall-e-2');
            console.log('✅ DALL-E 2 final fallback successful');
            return {
              ...result,
              usedFallback: true,
              fallbackReason: `${selectedModel}: ${gptImageError.message}, DALL-E 3: ${dalle3Error.message}`
            };
          }
        }
      } else if (selectedModel === 'dall-e-3' || selectedModel === 'dall-e-2') {
        // Direct DALL-E generation if specifically requested
        console.log(`📸 Using ${selectedModel} directly`);
        return await this.generateImageWithDALLE(prompt, selectedModel);
      } else {
        throw new Error(`Unsupported image model: ${selectedModel}`);
      }
    } catch (error) {
      console.error('🚨 All image generation methods failed:', error.message);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Get supported models
   */
  getSupportedModels() {
    return IMAGE_MODELS;
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelId) {
    const capabilities = {
      imageGeneration: this.supportsModel(modelId),
      promptEnhancement: modelId === 'gpt-image-1',
      qualityOptions: this.getQualityOptions(modelId),
      sizeOptions: this.getSizeOptions(modelId),
      styleOptions: this.getStyleOptions(modelId)
    };

    return capabilities;
  }

  /**
   * Get quality options for model
   */
  getQualityOptions(modelId) {
    switch (modelId) {
      case 'gpt-image-1':
        return ['standard'];
      case 'dall-e-3':
        return ['standard', 'hd'];
      case 'dall-e-2':
        return ['standard'];
      default:
        return ['standard'];
    }
  }

  /**
   * Get size options for model
   */
  getSizeOptions(modelId) {
    switch (modelId) {
      case 'gpt-image-1':
        return ['1024x1024', '1024x1536', '1536x1024'];
      case 'dall-e-3':
        return ['1024x1024', '1024x1792', '1792x1024'];
      case 'dall-e-2':
        return ['256x256', '512x512', '1024x1024'];
      default:
        return ['1024x1024'];
    }
  }

  /**
   * Get style options for model
   */
  getStyleOptions(modelId) {
    switch (modelId) {
      case 'dall-e-3':
      case 'dall-e-2':
        return ['vivid', 'natural'];
      default:
        return [];
    }
  }

  /**
   * Validate image generation options
   */
  validateOptions(modelId, options) {
    const capabilities = this.getModelCapabilities(modelId);
    const errors = [];

    if (options.quality && !capabilities.qualityOptions.includes(options.quality)) {
      errors.push(`Invalid quality '${options.quality}' for model '${modelId}'. Supported: ${capabilities.qualityOptions.join(', ')}`);
    }

    if (options.size && !capabilities.sizeOptions.includes(options.size)) {
      errors.push(`Invalid size '${options.size}' for model '${modelId}'. Supported: ${capabilities.sizeOptions.join(', ')}`);
    }

    if (options.style && capabilities.styleOptions.length > 0 && !capabilities.styleOptions.includes(options.style)) {
      errors.push(`Invalid style '${options.style}' for model '${modelId}'. Supported: ${capabilities.styleOptions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      supportedModels: IMAGE_MODELS.length,
      models: IMAGE_MODELS,
      apiType: 'Images'
    };
  }
}

module.exports = ImageHandler;