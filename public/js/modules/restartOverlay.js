// public/js/modules/restartOverlay.js
// Humane replacement for the old "wipe document.body + tell the user a wrong
// port" restart flow. Shows a blurred overlay, asks the server to shut down,
// then polls a cheap endpoint until it answers again and reloads the page.
// The server does NOT self-restart (it process.exit(99)s), so we instruct the
// user to run `node server.js` and reload automatically once it is back.

(function () {
  const POLL_INTERVAL = 1500;
  const PROBE = '/model';           // cheap JSON endpoint (config.js)
  const MAX_WAIT_MS = 5 * 60 * 1000;

  function build() {
    let el = document.getElementById('restart-overlay');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'restart-overlay';
    el.setAttribute('role', 'alertdialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML =
      '<div class="restart-card">' +
        '<div class="restart-spinner" aria-hidden="true"></div>' +
        '<h2 class="restart-title">Applying changes</h2>' +
        '<p class="restart-status"></p>' +
        '<p class="restart-hint">Run <code>node server.js</code> in your terminal — this page reloads automatically.</p>' +
        '<button class="btn-primary restart-reload-btn" hidden>Reload now</button>' +
      '</div>';
    document.body.appendChild(el);
    el.querySelector('.restart-reload-btn').addEventListener('click', () => location.reload());
    return el;
  }

  function setStatus(el, text) {
    const s = el.querySelector('.restart-status');
    if (s) s.textContent = text;
  }

  async function probe() {
    try {
      const res = await fetch(PROBE, { cache: 'no-store', signal: AbortSignal.timeout(1000) });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  const RestartOverlay = {
    async begin(opts = {}) {
      const el = build();
      el.classList.add('is-open');
      document.body.classList.add('modal-open');
      const shell = document.querySelector('.app-shell');
      if (shell) shell.setAttribute('aria-hidden', 'true');
      setStatus(el, opts.message || 'Saving and restarting the server…');

      // Ask the server to stop (endpoint unchanged).
      try {
        await fetch('/shutdown-server', { method: 'POST' });
      } catch (e) { /* the socket dropping mid-request is expected */ }

      let sawDown = false;
      let elapsed = 0;

      const tick = async () => {
        const up = await probe();
        if (!up) {
          sawDown = true;
          setStatus(el, 'Server stopped. Waiting for it to come back…');
        } else if (sawDown) {
          // Back online only counts after we observed it go down, so the
          // ~2s drain window before process.exit can't trigger a false reload.
          setStatus(el, 'Back online — reloading…');
          setTimeout(() => location.reload(), 500);
          return;
        }
        elapsed += POLL_INTERVAL;
        if (elapsed >= MAX_WAIT_MS) {
          setStatus(el, 'Still waiting. Start the server, then reload.');
          const btn = el.querySelector('.restart-reload-btn');
          if (btn) btn.hidden = false;
        }
        setTimeout(tick, POLL_INTERVAL);
      };
      setTimeout(tick, POLL_INTERVAL);
    }
  };

  window.RestartOverlay = RestartOverlay;
})();
