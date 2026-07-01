// src/server/services/modelProviders/customEndpointProvider.js
// Discovers the models served by user-configured OpenAI-compatible endpoints
// (Ollama/LM Studio/vLLM/…) so they appear in the model picker alongside core
// and OpenRouter models. Discovery hits each endpoint's `GET {baseURL}/models`
// (the OpenAI-compatible listing) in the background with a short timeout, so a
// down endpoint never blocks startup or the models API. Fully opt-in: with no
// CUSTOM_* env configured, the endpoint list is empty and this does nothing.
const axios = require('axios');
const { loadEndpointsFromEnv } = require('../providers/endpointResolver');

const DISCOVERY_TIMEOUT_MS = 4000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // re-scan every 5 min (local servers change often)

class CustomEndpointProvider {
  constructor(endpoints = null) {
    this.endpoints = endpoints || loadEndpointsFromEnv();
    this.models = new Map(); // id (`<prefix>/<model>`) -> catalog-shaped entry
    this.refreshInterval = null;

    if (this.endpoints.length > 0) {
      // Kick off a non-blocking discovery + periodic refresh.
      this.refresh();
      this.refreshInterval = setInterval(() => this.refresh(), REFRESH_INTERVAL_MS);
      if (this.refreshInterval.unref) this.refreshInterval.unref();
    }
  }

  /**
   * Query one endpoint's OpenAI-compatible model list. Returns [] on any error
   * (endpoint down, no /models route, timeout) so one bad endpoint is isolated.
   * @param {{prefix,baseURL,apiKey,label}} endpoint
   * @returns {Promise<Array<[string, Object]>>} [id, model] pairs
   */
  async discoverEndpoint(endpoint) {
    const headers = { 'Content-Type': 'application/json' };
    if (endpoint.apiKey) headers['Authorization'] = `Bearer ${endpoint.apiKey}`;

    try {
      const response = await axios.get(`${endpoint.baseURL}/models`, {
        headers,
        timeout: DISCOVERY_TIMEOUT_MS
      });
      const list = response.data?.data || response.data?.models || [];
      if (!Array.isArray(list)) return [];

      return list
        .map(m => (typeof m === 'string' ? { id: m } : m))
        .filter(m => m && m.id)
        .map(m => {
          const id = `${endpoint.prefix}/${m.id}`;
          return [id, this.transformModel(endpoint, m)];
        });
    } catch (error) {
      console.warn(`⚠️  Custom endpoint "${endpoint.label}" (${endpoint.baseURL}) discovery failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Shape a discovered model into the catalog entry format the picker expects.
   */
  transformModel(endpoint, apiModel) {
    return {
      name: `${endpoint.label}: ${apiModel.id}`,
      provider: 'custom',
      category: 'local',
      description: `Self-hosted / local model served by ${endpoint.label} at ${endpoint.baseURL}.`,
      pricing: { input: 0, output: 0 },
      contextWindow: apiModel.context_length || apiModel.context_window || 8192,
      maxTokens: 8000,
      supportsVision: false,
      supportsFunction: false,
      supportsReasoning: false,
      source: 'custom'
    };
  }

  /**
   * Re-scan every configured endpoint and replace the in-memory cache.
   */
  async refresh() {
    if (this.endpoints.length === 0) return;
    try {
      const results = await Promise.all(this.endpoints.map(e => this.discoverEndpoint(e)));
      const next = new Map();
      results.flat().forEach(([id, model]) => next.set(id, model));
      this.models = next;
      if (next.size > 0) {
        console.log(`Discovered ${next.size} model(s) across ${this.endpoints.length} custom endpoint(s)`);
      }
    } catch (error) {
      console.warn('⚠️  Custom endpoint discovery error:', error.message);
    }
  }

  /**
   * Current discovered models keyed by prefixed id.
   * @returns {Object<string, Object>}
   */
  getModels() {
    return Object.fromEntries(this.models);
  }

  /**
   * Look up a single discovered model.
   */
  getModel(modelId) {
    return this.models.get(modelId) || null;
  }

  /**
   * Stop the background refresh timer.
   */
  shutdown() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

module.exports = CustomEndpointProvider;
