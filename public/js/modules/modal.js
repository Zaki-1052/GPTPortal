// public/js/modules/modal.js
// Lightweight modal controller for GPTPortal's editor/preset/compare dialogs.
// The existing triggers still toggle each .setup-editor-container's display;
// this module observes that and layers on the behaviours that were missing:
// body scroll-lock, Esc-to-close, backdrop-click-close, and focus handling.

(function () {
  const SEL = '.setup-editor-container';

  function isOpen(el) {
    return el && el.style.display !== 'none' && getComputedStyle(el).display !== 'none';
  }

  function anyOpen() {
    return Array.from(document.querySelectorAll(SEL)).some(isOpen);
  }

  function close(el) {
    if (!el) return;
    el.style.display = 'none';
    if (!anyOpen()) document.body.classList.remove('modal-open');
    if (el._opener && typeof el._opener.focus === 'function') el._opener.focus();
  }

  function onOpen(el) {
    document.body.classList.add('modal-open');
    // Focus the first sensible control inside the dialog card.
    const focusable = el.querySelector('textarea, input:not([type=hidden]), select, button');
    if (focusable) setTimeout(() => focusable.focus(), 30);
  }

  function init() {
    const modals = document.querySelectorAll(SEL);
    modals.forEach(el => {
      // Backdrop click (on the container itself, not the dialog card) closes.
      el.addEventListener('mousedown', (e) => { if (e.target === el) close(el); });

      // React to display flips driven by the existing open/close triggers.
      let wasOpen = isOpen(el);
      new MutationObserver(() => {
        const open = isOpen(el);
        if (open === wasOpen) return;
        wasOpen = open;
        if (open) { el._opener = document.activeElement; onOpen(el); }
        else if (!anyOpen()) document.body.classList.remove('modal-open');
      }).observe(el, { attributes: true, attributeFilter: ['style'] });
    });

    // Esc closes the top-most open modal.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = Array.from(document.querySelectorAll(SEL)).filter(isOpen);
      if (open.length) { e.stopPropagation(); close(open[open.length - 1]); }
    });
  }

  window.Modal = {
    open(id) {
      const el = document.getElementById(id);
      if (el) { el._opener = document.activeElement; el.style.display = 'flex'; }
    },
    close(id) { close(document.getElementById(id)); },
    closeTop() {
      const open = Array.from(document.querySelectorAll(SEL)).filter(isOpen);
      if (open.length) close(open[open.length - 1]);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
