// public/js/modules/presets.js
// Lightweight parameter presets. Save/name/apply bundles of
// { systemPrompt, temperature, maxTokens, reasoningEffort, verbosity } in
// localStorage — no build step, no framework, plain DOM + fetch. Applying a
// preset updates the composer controls immediately and persists the system
// prompt to the server (it takes effect on the next new conversation).
(function () {
  'use strict';

  const STORAGE_KEY = 'gptportal-presets';

  class PresetsManager {
    constructor() {
      this.presets = this.load();
      this.modal = document.getElementById('presets-container');
      this.listEl = document.getElementById('presets-list');
      this.nameInput = document.getElementById('preset-name-input');
      this.bindTriggers();
    }

    /* ---------- persistence ---------- */
    load() {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.presets));
      } catch (e) {
        console.warn('Presets: could not persist to localStorage', e);
      }
    }

    /* ---------- wiring ---------- */
    bindTriggers() {
      const open = document.getElementById('presets-btn');
      if (open) open.addEventListener('click', () => this.open());

      const close = document.getElementById('presets-close');
      if (close) close.addEventListener('click', () => this.close());

      const save = document.getElementById('preset-save-btn');
      if (save) save.addEventListener('click', () => this.saveCurrent());

      if (this.nameInput) {
        this.nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); this.saveCurrent(); }
        });
      }

      // Click on the backdrop (outside the dialog card) closes.
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.close();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
      });
    }

    isOpen() {
      return this.modal && this.modal.style.display !== 'none' && this.modal.style.display !== '';
    }

    open() {
      if (!this.modal) return;
      this.render();
      this.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (!this.modal) return;
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    /* ---------- capture / apply ---------- */

    // Read the current composer + system-prompt state into a plain object.
    async currentSettings() {
      let systemPrompt = '';
      try {
        const res = await fetch('/get-instructions');
        if (res.ok) systemPrompt = await res.text();
      } catch (e) {
        console.warn('Presets: could not read current instructions', e);
      }
      return {
        systemPrompt,
        temperature: typeof window.temperature === 'number' ? window.temperature : 1,
        maxTokens: typeof window.tokens === 'number' ? window.tokens : 8000,
        reasoningEffort: window.reasoningEffort || 'medium',
        verbosity: window.verbosity || 'medium'
      };
    }

    async saveCurrent() {
      const name = this.nameInput ? this.nameInput.value.trim() : '';
      if (!name) {
        if (this.nameInput) this.nameInput.focus();
        return;
      }
      const settings = await this.currentSettings();
      this.presets.push({ id: 'preset-' + Date.now(), name, ...settings });
      this.persist();
      if (this.nameInput) this.nameInput.value = '';
      this.render();
      this.toast(`Saved preset "${name}"`);
    }

    apply(id) {
      const p = this.presets.find((x) => x.id === id);
      if (!p) return;

      this.applySlider('temperature-slider', 'temperature-value', 'temperature', p.temperature,
        (v) => Number(v).toFixed(1));
      this.applySlider('tokens-slider', 'tokens-value', 'tokens', p.maxTokens,
        (v) => Number(v).toLocaleString());
      this.applySelect('reasoning-effort-select', 'reasoningEffort', p.reasoningEffort);
      this.applySelect('verbosity-select', 'verbosity', p.verbosity);

      // Persist the system prompt so it drives the next fresh conversation.
      if (typeof p.systemPrompt === 'string' && p.systemPrompt.length > 0) {
        fetch('/update-instructions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: p.systemPrompt })
        })
          .then(() => {
            const ta = document.getElementById('instructions-content');
            if (ta) ta.value = p.systemPrompt;
          })
          .catch((e) => console.warn('Presets: failed to apply system prompt', e));
      }

      this.close();
      this.toast(`Applied "${p.name}" — system prompt applies to a new chat`);
    }

    // Set a range input's value + display + backing global, then fire input so
    // any app.js listener reconciles too.
    applySlider(sliderId, valueId, globalName, value, fmt) {
      if (value === undefined || value === null) return;
      window[globalName] = value;
      const slider = document.getElementById(sliderId);
      const display = document.getElementById(valueId);
      if (display) display.textContent = fmt(value);
      if (slider) {
        slider.value = value;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    applySelect(selectId, globalName, value) {
      if (value === undefined || value === null) return;
      window[globalName] = value;
      const el = document.getElementById(selectId);
      if (el) {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    remove(id) {
      this.presets = this.presets.filter((p) => p.id !== id);
      this.persist();
      this.render();
    }

    /* ---------- rendering ---------- */
    render() {
      if (!this.listEl) return;
      this.listEl.innerHTML = '';

      if (!this.presets.length) {
        const empty = document.createElement('p');
        empty.className = 'presets-empty';
        empty.textContent = 'No presets yet. Save your current settings above.';
        this.listEl.appendChild(empty);
        return;
      }

      this.presets.forEach((p) => {
        const row = document.createElement('div');
        row.className = 'preset-row';

        const meta = document.createElement('div');
        meta.className = 'preset-meta';
        const name = document.createElement('span');
        name.className = 'preset-name';
        name.textContent = p.name;
        const params = document.createElement('span');
        params.className = 'preset-params';
        params.textContent = `temp ${p.temperature} · ${Number(p.maxTokens).toLocaleString()} tok · effort ${p.reasoningEffort} · verbosity ${p.verbosity}`;
        meta.appendChild(name);
        meta.appendChild(params);

        const actions = document.createElement('div');
        actions.className = 'preset-actions';
        const applyBtn = document.createElement('button');
        applyBtn.className = 'setup-action-btn primary';
        applyBtn.textContent = 'Apply';
        applyBtn.addEventListener('click', () => this.apply(p.id));
        const delBtn = document.createElement('button');
        delBtn.className = 'setup-action-btn secondary';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => this.remove(p.id));
        actions.appendChild(applyBtn);
        actions.appendChild(delBtn);

        row.appendChild(meta);
        row.appendChild(actions);
        this.listEl.appendChild(row);
      });
    }

    /* ---------- tiny transient toast ---------- */
    toast(message) {
      let el = document.getElementById('gp-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'gp-toast';
        el.className = 'gp-toast';
        document.body.appendChild(el);
      }
      el.textContent = message;
      el.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
    }
  }

  function init() {
    if (!window.presetsManager) window.presetsManager = new PresetsManager();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
