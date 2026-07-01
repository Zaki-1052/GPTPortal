// src/server/services/providers/endpointResolver.js
// Data-driven chokepoint for OpenAI-compatible endpoints (Ollama, LM Studio,
// vLLM, LocalAI, any {base_url, api_key} pair). Instead of writing a new handler
// per provider, a user declares endpoints in the environment and addresses their
// models as `<prefix>/<model>` (e.g. `ollama/llama3.2`). This module turns that
// id + the configured endpoint list into a concrete call target.

/**
 * Normalize one endpoint definition: trim trailing slashes, default the label.
 * @param {{prefix:string, baseURL:string, apiKey?:string, label?:string}} e
 * @returns {{prefix:string, baseURL:string, apiKey:string, label:string}}
 */
function normalize(e) {
  const prefix = String(e.prefix).trim().replace(/\/+$/, '');
  const baseURL = String(e.baseURL).trim().replace(/\/+$/, '');
  return {
    prefix,
    baseURL,
    apiKey: e.apiKey ? String(e.apiKey) : '',
    label: e.label ? String(e.label) : prefix
  };
}

/**
 * Parse configured endpoints from the environment. Two forms are supported:
 *   1. CUSTOM_ENDPOINTS — a JSON array of {prefix, baseURL, apiKey?, label?}.
 *   2. CUSTOM_OPENAI_BASE_URL (+ _API_KEY / _PREFIX / _LABEL) — single endpoint.
 * Returns [] when nothing is configured, so the feature is fully opt-in and adds
 * zero overhead to a default install.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Array<{prefix:string, baseURL:string, apiKey:string, label:string}>}
 */
function loadEndpointsFromEnv(env = process.env) {
  const endpoints = [];
  const seen = new Set();

  const add = (candidate) => {
    if (!candidate || !candidate.prefix || !candidate.baseURL) return;
    const normalized = normalize(candidate);
    if (!normalized.prefix || !normalized.baseURL || seen.has(normalized.prefix)) return;
    seen.add(normalized.prefix);
    endpoints.push(normalized);
  };

  // Form 1: JSON array (multiple endpoints)
  if (env.CUSTOM_ENDPOINTS) {
    try {
      const parsed = JSON.parse(env.CUSTOM_ENDPOINTS);
      if (Array.isArray(parsed)) {
        parsed.forEach(add);
      } else {
        console.warn('⚠️  CUSTOM_ENDPOINTS must be a JSON array; ignoring.');
      }
    } catch (error) {
      console.warn('⚠️  CUSTOM_ENDPOINTS is not valid JSON; ignoring:', error.message);
    }
  }

  // Form 2: single-endpoint convenience variables
  if (env.CUSTOM_OPENAI_BASE_URL) {
    add({
      prefix: env.CUSTOM_OPENAI_PREFIX || 'local',
      baseURL: env.CUSTOM_OPENAI_BASE_URL,
      apiKey: env.CUSTOM_OPENAI_API_KEY || '',
      label: env.CUSTOM_OPENAI_LABEL || 'Custom'
    });
  }

  return endpoints;
}

/**
 * Resolve a prefixed model id against the configured endpoints.
 * `ollama/llama3.2` → { endpoint: <ollama>, upstreamModel: 'llama3.2' }.
 * Only the FIRST '/' splits prefix from model, so upstream ids may contain
 * slashes themselves (e.g. `local/library/model:tag`).
 * @param {string} modelID
 * @param {Array} endpoints - output of loadEndpointsFromEnv
 * @returns {{endpoint:Object, upstreamModel:string}|null}
 */
function resolveEndpoint(modelID, endpoints) {
  if (!modelID || !Array.isArray(endpoints) || endpoints.length === 0) return null;
  const slash = modelID.indexOf('/');
  if (slash <= 0) return null;

  const prefix = modelID.slice(0, slash);
  const upstreamModel = modelID.slice(slash + 1);
  if (!upstreamModel) return null;

  const endpoint = endpoints.find(e => e.prefix === prefix);
  return endpoint ? { endpoint, upstreamModel } : null;
}

module.exports = { loadEndpointsFromEnv, resolveEndpoint, normalize };
