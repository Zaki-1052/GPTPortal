// public/js/modules/shortcuts.js
// Keyboard-shortcut help sheet for GPTPortal (Cmd/Ctrl + /). The individual
// shortcut handlers still live in their existing modules; this surfaces them
// in one discoverable, on-brand overlay and owns the ⌘/ + Esc bindings for it.

(function () {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const MOD = isMac ? '⌘' : 'Ctrl';

  const GROUPS = [
    { title: 'Messaging', items: [
      { keys: ['Enter'], desc: 'Send message' },
      { keys: ['Shift', 'Enter'], desc: 'New line' },
      { keys: [MOD, 'Enter'], desc: 'Send message' },
      { keys: [MOD, 'L'], desc: 'Clear chat' },
    ]},
    { title: 'Actions', items: [
      { keys: [MOD, 'S'], desc: 'Export chat' },
      { keys: [MOD, 'Shift', 'X'], desc: 'Export chat' },
      { keys: [MOD, 'Shift', 'C'], desc: 'Copy last message' },
      { keys: [MOD, 'Shift', ';'], desc: 'Copy last code block' },
    ]},
    { title: 'Input', items: [
      { keys: ['Shift', 'Esc'], desc: 'Focus message input' },
      { keys: [MOD, 'Shift', 'V'], desc: 'Toggle voice input' },
      { keys: [MOD, 'Shift', 'F'], desc: 'Open file picker' },
      { keys: [MOD, 'Shift', 'A'], desc: 'Toggle Assistants mode' },
    ]},
    { title: 'Navigation', items: [
      { keys: [MOD, 'K'], desc: 'Open model selector' },
      { keys: ['Esc'], desc: 'Close dropdown / dialog' },
      { keys: [MOD, '/'], desc: 'Show this help' },
    ]},
  ];

  let overlay = null;

  function keysHTML(keys) {
    return keys.map(k => '<kbd class="key"></kbd>').join('');
  }

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'setup-editor-container shortcuts-overlay';
    overlay.style.display = 'none';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Keyboard shortcuts');

    const cols = GROUPS.map(g => {
      const rows = g.items.map(it =>
        '<div class="shortcut-row"><span class="shortcut-desc" data-desc></span>' +
        '<span class="shortcut-keys" data-keys>' + keysHTML(it.keys) + '</span></div>'
      ).join('');
      return '<div class="shortcut-col"><div class="setup-editor-title" style="margin-bottom:var(--space-2)">' +
             '<h4 data-group></h4></div>' + rows + '</div>';
    }).join('');

    overlay.innerHTML =
      '<div>' +
        '<div class="setup-editor-header">' +
          '<div class="setup-editor-title">' +
            '<span class="setup-editor-icon"><svg class="icon" viewBox="0 0 24 24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/></svg></span>' +
            '<h4>Keyboard Shortcuts</h4>' +
          '</div>' +
          '<button class="setup-editor-close" aria-label="Close"><svg class="icon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>' +
        '<div class="setup-editor-body shortcuts-grid">' + cols + '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Fill text content safely (no HTML interpolation of dynamic strings).
    const colEls = overlay.querySelectorAll('.shortcut-col');
    GROUPS.forEach((g, gi) => {
      colEls[gi].querySelector('[data-group]').textContent = g.title;
      const rows = colEls[gi].querySelectorAll('.shortcut-row');
      g.items.forEach((it, ri) => {
        rows[ri].querySelector('[data-desc]').textContent = it.desc;
        const kbds = rows[ri].querySelectorAll('kbd.key');
        it.keys.forEach((k, ki) => { kbds[ki].textContent = k; });
      });
    });

    overlay.querySelector('.setup-editor-close').addEventListener('click', hide);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) hide(); });
    return overlay;
  }

  function show() {
    const el = build();
    el.style.display = 'flex';
    document.body.classList.add('modal-open');
  }
  function hide() {
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
  function isVisible() { return overlay && overlay.style.display !== 'none'; }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      isVisible() ? hide() : show();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      // Command-palette style: ⌘K / Ctrl+K opens the model selector.
      e.preventDefault();
      const trigger = document.getElementById('selected-model');
      if (trigger) trigger.click();
    } else if (e.key === 'Escape' && isVisible()) {
      e.stopPropagation();
      hide();
    }
  });

  window.Shortcuts = { show, hide, groups: GROUPS };
})();
