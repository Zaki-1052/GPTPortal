// public/js/modules/toast.js
// Single toast notification system for GPTPortal. Replaces the former three
// ad-hoc notifiers (init status toast, presets #gp-toast, showNotification).
// Usage: Toast.show('Saved', { type: 'success', title: 'Instructions' })

(function () {
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const DEFAULT_DURATION = { info: 4000, success: 4000, warning: 6000, error: 7000 };

  function region() {
    let el = document.getElementById('toast-region');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-region';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    return el;
  }

  function dismiss(toast) {
    if (!toast || toast.dataset.leaving) return;
    toast.dataset.leaving = '1';
    toast.classList.add('is-leaving');
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 220);
  }

  const Toast = {
    show(message, opts = {}) {
      const type = opts.type && ICONS[opts.type] ? opts.type : 'info';
      const duration = opts.duration != null ? opts.duration : DEFAULT_DURATION[type];

      const toast = document.createElement('div');
      toast.className = 'toast toast--' + type;
      toast.innerHTML =
        '<span class="toast-icon">' + ICONS[type] + '</span>' +
        '<div class="toast-body">' +
          (opts.title ? '<div class="toast-title"></div>' : '') +
          '<div class="toast-message"></div>' +
        '</div>' +
        '<button class="toast-close" aria-label="Dismiss">' + CLOSE_ICON + '</button>';

      if (opts.title) toast.querySelector('.toast-title').textContent = opts.title;
      toast.querySelector('.toast-message').textContent = message;
      toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

      region().appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('is-visible'));

      if (duration > 0) setTimeout(() => dismiss(toast), duration);
      return toast;
    },
    success(m, o) { return this.show(m, Object.assign({ type: 'success' }, o)); },
    error(m, o)   { return this.show(m, Object.assign({ type: 'error' }, o)); },
    warning(m, o) { return this.show(m, Object.assign({ type: 'warning' }, o)); },
    info(m, o)    { return this.show(m, Object.assign({ type: 'info' }, o)); }
  };

  window.Toast = Toast;
})();
