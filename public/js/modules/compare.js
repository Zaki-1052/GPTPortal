// public/js/modules/compare.js
// Compare view: fan one prompt out to N selected models and render their answers
// side by side. Talks to the stateless POST /compare endpoint, so comparing never
// disturbs the main conversation. No build step — plain DOM + fetch, and it reuses
// the app's markdown/highlight/KaTeX pipeline (window.chatManager.messageHandler)
// when available.
(function () {
  'use strict';

  const MAX_MODELS = 6;

  class CompareView {
    constructor() {
      this.modal = document.getElementById('compare-container');
      this.modelListEl = document.getElementById('compare-model-list');
      this.promptEl = document.getElementById('compare-prompt');
      this.resultsEl = document.getElementById('compare-results');
      this.runBtn = document.getElementById('compare-run-btn');
      this.searchEl = document.getElementById('compare-model-search');
      this.selected = new Set();
      this.bind();
    }

    bind() {
      const open = document.getElementById('compare-btn');
      if (open) open.addEventListener('click', () => this.open());

      const close = document.getElementById('compare-close');
      if (close) close.addEventListener('click', () => this.close());

      if (this.runBtn) this.runBtn.addEventListener('click', () => this.run());
      if (this.searchEl) this.searchEl.addEventListener('input', () => this.renderModelList(this.searchEl.value));

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
      this.renderModelList(this.searchEl ? this.searchEl.value : '');
      this.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (!this.modal) return;
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    /* ---------- model source ---------- */
    models() {
      const dm = window.dynamicModelManager;
      return dm && dm.models ? dm.models : {};
    }

    displayName(id) {
      const m = this.models()[id];
      return (m && (m.name || m.displayName)) || id;
    }

    /* ---------- picker ---------- */
    renderModelList(filter) {
      if (!this.modelListEl) return;
      const models = this.models();
      const q = (filter || '').toLowerCase();

      const ids = Object.keys(models)
        .filter((id) => {
          if (!q) return true;
          const name = this.displayName(id);
          return id.toLowerCase().includes(q) || String(name).toLowerCase().includes(q);
        })
        .sort((a, b) => this.displayName(a).localeCompare(this.displayName(b)));

      this.modelListEl.innerHTML = '';

      if (!ids.length) {
        const empty = document.createElement('p');
        empty.className = 'compare-empty';
        empty.textContent = Object.keys(models).length ? 'No models match your filter.' : 'Models are still loading…';
        this.modelListEl.appendChild(empty);
        return;
      }

      // Cap rendered rows for performance with large OpenRouter catalogs.
      ids.slice(0, 500).forEach((id) => {
        const label = document.createElement('label');
        label.className = 'compare-model-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = id;
        cb.checked = this.selected.has(id);
        cb.addEventListener('change', () => this.toggle(id, cb));

        const name = document.createElement('span');
        name.className = 'compare-model-name';
        name.textContent = this.displayName(id);

        label.appendChild(cb);
        label.appendChild(name);
        this.modelListEl.appendChild(label);
      });

      this.updateCount();
    }

    toggle(id, cb) {
      if (cb.checked) {
        if (this.selected.size >= MAX_MODELS) {
          cb.checked = false;
          this.flashLimit();
          return;
        }
        this.selected.add(id);
      } else {
        this.selected.delete(id);
      }
      this.updateCount();
    }

    updateCount() {
      const el = document.getElementById('compare-selected-count');
      if (el) el.textContent = `${this.selected.size} / ${MAX_MODELS} selected`;
    }

    flashLimit() {
      const el = document.getElementById('compare-selected-count');
      if (el) {
        el.classList.add('at-limit');
        setTimeout(() => el.classList.remove('at-limit'), 700);
      }
    }

    /* ---------- run ---------- */
    async run() {
      const message = this.promptEl ? this.promptEl.value.trim() : '';
      if (!message) {
        if (this.promptEl) this.promptEl.focus();
        return;
      }
      if (!this.selected.size) return;

      const models = [...this.selected];
      this.renderColumns(models.map((id) => ({ modelID: id, loading: true })));
      if (this.runBtn) this.runBtn.disabled = true;

      try {
        const res = await fetch('/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            models,
            temperature: window.temperature,
            tokens: window.tokens,
            reasoningEffort: window.reasoningEffort,
            verbosity: window.verbosity
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Comparison failed');

        const byId = {};
        (data.results || []).forEach((r) => { byId[r.modelID] = r; });
        this.renderColumns(models.map((id) => byId[id] || { modelID: id, success: false, error: 'No response' }));
      } catch (e) {
        this.renderColumns(models.map((id) => ({ modelID: id, success: false, error: e.message })));
      } finally {
        if (this.runBtn) this.runBtn.disabled = false;
      }
    }

    /* ---------- results ---------- */
    renderColumns(rows) {
      if (!this.resultsEl) return;
      this.resultsEl.innerHTML = '';
      this.resultsEl.style.setProperty('--compare-cols', Math.min(Math.max(rows.length, 1), 3));

      rows.forEach((r) => {
        const col = document.createElement('div');
        col.className = 'compare-col';

        const head = document.createElement('div');
        head.className = 'compare-col-head';
        const title = document.createElement('span');
        title.className = 'compare-col-title';
        title.textContent = this.displayName(r.modelID);
        head.appendChild(title);

        if (r.success && typeof r.cost === 'number') {
          const cost = document.createElement('span');
          cost.className = 'compare-col-cost';
          cost.textContent = r.cost === 0 ? 'Free' : '$' + r.cost.toFixed(r.cost < 0.01 ? 5 : 4);
          head.appendChild(cost);
        }

        const body = document.createElement('div');
        body.className = 'compare-col-body';

        if (r.loading) {
          const spin = document.createElement('div');
          spin.className = 'compare-spinner';
          body.appendChild(spin);
        } else if (r.success) {
          this.renderContent(body, r.content || '');
        } else {
          const err = document.createElement('div');
          err.className = 'compare-col-error';
          err.textContent = r.error || 'Failed';
          body.appendChild(err);
        }

        col.appendChild(head);
        col.appendChild(body);
        this.resultsEl.appendChild(col);
      });
    }

    // Reuse the app's markdown pipeline when present; fall back to plain text
    // (textContent — never innerHTML — so untrusted model output can't inject).
    renderContent(container, text) {
      const mh = window.chatManager && window.chatManager.messageHandler;
      if (mh && typeof mh.renderRichText === 'function') {
        try {
          mh.renderRichText(container, text);
          return;
        } catch (e) {
          console.warn('Compare: markdown render failed, using plain text', e);
        }
      }
      container.textContent = text;
    }
  }

  function init() {
    if (!window.compareView) window.compareView = new CompareView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
