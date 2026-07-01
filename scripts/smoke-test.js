#!/usr/bin/env node
// scripts/smoke-test.js
// Lightweight, dependency-free validation of the model catalog and provider routing.
// Run with: node scripts/smoke-test.js   (wired to `npm test`)
// Exits non-zero if any check fails.

const fs = require('fs');
const path = require('path');

const failures = [];
const fail = (msg) => failures.push(msg);
const ok = (msg) => console.log(`  ✓ ${msg}`);

const catalogPath = path.join(__dirname, '..', 'public', 'js', 'data', 'models.json');
const raw = fs.readFileSync(catalogPath, 'utf8');

// --- 1. JSON validity ---
let catalog;
try {
  catalog = JSON.parse(raw);
  ok('models.json parses as valid JSON');
} catch (e) {
  fail(`models.json is not valid JSON: ${e.message}`);
  report();
}

const models = catalog.models || {};
const categories = catalog.categories || {};
const ids = Object.keys(models);

// --- 2. Duplicate top-level model keys (JSON.parse silently keeps the last; scan raw) ---
(() => {
  const seen = new Set();
  const dups = new Set();
  // Match keys at the model-object indentation (4 spaces) that open an object.
  const re = /^\s{4}"([^"]+)"\s*:\s*\{/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const key = m[1];
    if (seen.has(key)) dups.add(key);
    seen.add(key);
  }
  if (dups.size) fail(`Duplicate model keys in models.json: ${[...dups].join(', ')}`);
  else ok('no duplicate model keys');
})();

// --- 3. Required fields per model ---
const REQUIRED = ['id', 'name', 'provider', 'category', 'source', 'description', 'pricing', 'contextWindow', 'maxTokens'];
(() => {
  let bad = [];
  for (const id of ids) {
    const e = models[id];
    for (const f of REQUIRED) if (!(f in e)) bad.push(`${id}.${f}`);
    if (e.id !== id) bad.push(`${id}.id mismatch (${e.id})`);
    if (!e.pricing || typeof e.pricing.input !== 'number' || typeof e.pricing.output !== 'number') {
      bad.push(`${id}.pricing invalid`);
    } else if (e.pricing.input === 0 && e.pricing.output === 0 && e.category !== 'voice') {
      bad.push(`${id} priced {0,0}`);
    }
  }
  if (bad.length) fail(`Model field problems: ${bad.join(', ')}`);
  else ok(`all ${ids.length} models have required fields and non-zero pricing`);
})();

// --- 4. Category consistency ---
(() => {
  const inCat = new Set();
  let missing = [];
  for (const c of Object.keys(categories)) {
    for (const id of categories[c].models) {
      inCat.add(id);
      if (!models[id]) missing.push(`${c}/${id}`);
    }
  }
  const orphan = ids.filter((id) => !inCat.has(id));
  if (missing.length) fail(`Category references missing models: ${missing.join(', ')}`);
  else ok('every category id exists in models');
  if (orphan.length) fail(`Models not in any category: ${orphan.join(', ')}`);
  else ok('every model belongs to a category');
})();

// --- 5. No known-retired ids linger ---
(() => {
  const RETIRED = [
    'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-haiku-20240307',
    'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-2.0-flash-exp', 'gemini-2.5-pro-preview-05-06',
    'imagen-4.0-generate-preview', 'gemini-2.0-flash-preview-image-generation',
    'grok-4', 'grok-4-0709', 'grok-3', 'grok-2-vision-1212', 'grok-2-image-1212',
    'deepseek-chat', 'deepseek-reasoner', 'llama-3.1-405b-reasoning', 'llama-3.1-70b-versatile',
    'kimi-k2-0711-preview', 'dall-e-2', 'dall-e-3', 'gpt-4', 'gpt-3.5-turbo-0125', 'o1-preview', 'o3-pro',
  ];
  const lingering = RETIRED.filter((id) => models[id]);
  if (lingering.length) fail(`Retired/dead model ids still present: ${lingering.join(', ')}`);
  else ok('no known-retired model ids present');
})();

// --- 6. Provider routing: every catalog id routes to its provider's handler key ---
(() => {
  let ProviderFactory;
  try {
    ProviderFactory = require('../src/server/services/providers/providerFactory');
  } catch (e) {
    fail(`cannot load providerFactory: ${e.message}`);
    return;
  }
  const pf = new ProviderFactory({}, null);
  const expect = {
    openai: 'openai', anthropic: 'claude', google: 'gemini', deepseek: 'deepseek',
    groq: 'groq', mistral: 'mistral', grok: 'grok', kimi: 'kimi',
  };
  let bad = [];
  for (const id of ids) {
    const routed = pf.getProviderForModel(id);
    const want = expect[models[id].provider];
    if (want && routed !== want) bad.push(`${id}: provider=${models[id].provider} routed=${routed} want=${want}`);
  }
  if (bad.length) fail(`Routing mismatches: ${bad.join(' | ')}`);
  else ok(`all ${ids.length} models route to their provider handler`);
})();

// --- 7. streamUtils contract exports ---
(() => {
  try {
    const su = require('../src/server/services/providers/streamUtils');
    for (const fn of ['sseHeaders', 'writeSSE', 'parseOpenAISSE', 'parseAnthropicSSE']) {
      if (typeof su[fn] !== 'function') fail(`streamUtils missing ${fn}`);
    }
    ok('streamUtils exports the streaming contract helpers');
  } catch (e) {
    fail(`cannot load streamUtils: ${e.message}`);
  }
})();

report();

function report() {
  console.log('');
  if (failures.length) {
    console.error(`✗ SMOKE TEST FAILED (${failures.length}):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`✓ SMOKE TEST PASSED — ${ids.length} models, ${Object.keys(categories).length} categories`);
  process.exit(0);
}
