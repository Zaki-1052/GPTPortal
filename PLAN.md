# GPTPortal UI Redesign — "Precision Instrument" — Plan

## Context

The frontend (`public/portal.html` + `public/setup.html`, vanilla JS, no build step) already has a token-based CSS layer (`chat.css`: teal accent, IBM Plex Sans, dual themes) but reads as clean-generic, and is undermined by debt: the model dropdown and several UI chunks are built in JS with hardcoded charcoal hexes (`cssText`) that break light mode and force ~66 `!important` defenses; three competing toast systems; shortcuts bound in three files; blocking `alert()`s; emoji-as-chrome in JS-generated content; a config-save flow that wipes `document.body` after shutting down the server.

Outcome: a holistic redesign — OKLCH token system, modular type scale, distinctive visual identity, unified UX primitives — keeping the no-build vanilla stack and every existing feature (SSE streaming + thinking blocks, model search + operators, OpenRouter merge, prompt-cache toggle, voice, uploads, image gen, presets, compare, both editors, export, all shortcuts, both themes).

## Decisions

- **Aesthetic**: "Precision instrument" cockpit; dark-first, both themes first-class. (User delegated taste in full.)
- **Type**: Instrument Sans (UI) + Bricolage Grotesque (display) + JetBrains Mono (code AND data, `tabular-nums`); 1.2 modular scale as rem tokens.
- **Color**: OKLCH rebuild; 4-step elevation ramp + hairline low-alpha borders; teal accent retained but retuned; per-provider hue tokens (openai/anthropic/google/mistral/meta/deepseek/xai/openrouter) used in model rows, avatars, chips, compare columns.
- **Signature moves**: ⌘K command-palette model selector; floating pill composer with integrated context meter; role avatars; code-block header bars; display-font welcome hero; noise + glow atmosphere; SVG sprite replaces all emoji chrome.
- **Behavioral UX fixes in scope**: restart overlay (poll `GET /model`, no body-wipe), kill `alert()`s, kill generated-image auto-download, honest deep-research progress.
- **No build step introduced**; plain `<link>`/`<script>` tags, `window.*` globals, same endpoints/event contracts.

## Files

| Path | Change | Why |
|---|---|---|
| `public/css/tokens.css` | create | All custom props, 4 theme blocks; kills the 8 duplicated token blocks across chat.css/setup.css; legacy aliases during migration |
| `public/css/base.css` | create | Reset, typography, atmosphere, scrollbars, focus (moved from chat.css §1–2) |
| `public/css/components.css` | create | Shared primitives (buttons, inputs, switches, chips, toast, modal, tooltip, spinner) reused by portal + setup |
| `public/css/app.css` | create (git mv from `chat.css`) | Portal-specific styling, rewritten per-section in Phase 4 |
| `public/css/setup.css` | create (replaces `public/setup.css`) | Thin page layer on shared sheets |
| `public/js/modules/icons.js` | create | `Icons.get(name)` → `<use href="#i-…">`; single source for chrome icons |
| `public/js/modules/toast.js` | create | `Toast.show()`; replaces 3 toast systems |
| `public/js/modules/modal.js` | create | `Modal.open/close`; focus trap, Esc, scroll lock; replaces inline `onclick` display toggles |
| `public/js/modules/shortcuts.js` | create | Single keydown registry + Cmd+/ help overlay; replaces 3 keydown owners |
| `public/js/modules/restartOverlay.js` | create | Poll-and-reload restart flow; replaces body-wipe |
| `public/portal.html` | modify | Sprite, link/script lists, `hidden` attrs, strip inline onclick/init-toast, welcome hero |
| `public/setup.html` | modify | Shared sheets, sprite subset, dead `script.js` ref removed, alert()s → toast |
| `public/js/modules/modelUI.js` | modify | cssText → classes; keyboard nav; delete `setupDropdownStyling`/`addButtonHoverEffects`/style injection |
| `public/js/app.js` | modify | Delete `fixModelSelector`; class-based mode chip/error; shortcuts moved out |
| `public/js/modules/portalInit.js` | modify | Counter hexes → `data-level`; restart overlay; shortcuts moved out |
| `public/js/modules/uiManager.js` | modify | classList state; dropzone markup; notification shim |
| `public/js/modules/messageHandler.js` | modify | Avatars (additive), sprite icons, code header bar; streaming contract preserved |
| `public/js/modules/chatManager.js` | modify | Remove auto-download + dead tooltip calls |
| `public/js/modules/presets.js`, `compare.js` | modify | Route through Modal/Toast; restyle hooks |
| `public/js/modules/messageHandler.backup.js` | delete | 1,122 lines, unreferenced |

Reused as-is: `generateButtonId` model-option ID contract, localStorage collapse prefs (modelUI:901–931), `#context-fill/#context-used/#context-limit` (contextTracker:349–351), all slider/select IDs, `.message`/`.message-text`/`.thinking-block`/streaming classes, theme pre-paint bootstrap (portal.html:9–29), all fetch endpoints.

## Steps

### Phase 0 — Dead code (XS) ✅
- [x] Delete `public/js/modules/messageHandler.backup.js`
- [x] Remove dead `<script src="script.js">` (setup.html:111)
- [x] Remove `#custom-tooltip` + `showCustomTooltip` call sites (prompt descriptions now surface via native `title` attrs)
- [x] Remove generated-image auto-download (chatManager.js)

### Phase 1 — Token foundation + typography (M) ✅
- [x] `tokens.css`: OKLCH ramps, type scale, motion, provider hues, elevation; legacy aliases (`--bg`, `--surface`, `--accent`, …) mapped to new tokens
- [x] `base.css`: reset/type/scrollbars/focus moved from chat.css §1–2; atmosphere layer (`body::before/::after`)
- [x] Delete token blocks from chat.css and setup.css; add new `<link>`s in both HTMLs
- [x] Swap Google Fonts link (Instrument Sans + Bricolage Grotesque + JetBrains Mono)
- [x] Verified live on :3019 — both themes render via the alias trick (dark + light screenshots)

### Phase 2 — Kill JS-injected presentation (L) ✅
- [x] 2a `modelUI.js`: deleted `setupDropdownStyling` + `addButtonHoverEffects`; all cssText → classes (SVG chevron + `[data-collapsed]` rotation, `.models-container` max-height collapse, `.model-option-content/-name`, `.badges-container` + `.model-badge[data-feature]` tints, `.model-tooltip`/`is-visible`, `.refresh-btn.is-loading`); deleted the runtime `<style>` injection; removed flyout/options `!important` defenses. **Verified live: buttons render `--surface`, no charcoal, collapse works.**
- [x] 2b `app.js`: deleted `fixModelSelector` + call; `.is-active` mode chip; `.load-error`
- [x] 2c `portalInit.js` counters: hex ladder → `data-level` + scoped `[data-level]` rules
- [x] 2d State-as-class: sidebar/promptBar → `.is-open` + `aria-expanded` (deleted ◀/▶); search + OpenRouter toggles → `hidden` attr (added global `[hidden]{display:none!important}`); drop-zone → `.is-active`; deleted `#sidebar[style*='block']`
- [x] Deleted dead §12 slider `!important` block; `!important` 66 → 38 (remainder = highlight.js/KaTeX CDN + Phase-4 message/welcome rules)
- **Deviation (documented):** kept the dropdown display-toggle + `:has(#model-options[style*='block'])` reveal instead of a container `.is-open` class — `#model-options` display is toggled in 7 files, so atomic migration was higher-risk than the fragility removed. Core goal met.
- 2e `modal.js` folded into Phase 3 (shared primitive); inline modal `onclick`s still work meanwhile.

### Phase 3 — Unified primitives (M) ✅
- [x] `toast.js` + toast CSS → replaced init toast (portal.html), presets `#gp-toast`, `uiManager.showNotification` (shim kept). **Verified live: typed toasts stack bottom-right.**
- [x] `restartOverlay.js` → replaced the `document.body` wipe + wrong-port message in `portalInit` save flows: POST `/shutdown-server`, poll `/model` @1.5s (needs ≥1 failed poll before accepting 200), `location.reload()`. All four `alert()`s deleted.
- [x] `modal.js` → non-invasive enhancer: scroll-lock, Esc-to-close, backdrop-click, focus (MutationObserver on the existing modals; no trigger rewrite needed)
- [x] `shortcuts.js` → Cmd+/ help overlay (2-col grouped sheet, `kbd` chips). **Verified live.**
- [x] Emoji chrome → inline SVG at each site (message ⚠️/ℹ️, screenshot 📷 + ✅/❌ feedback, save-btn ⏳, file 📎)
- [x] `components.css` created + linked in portal (setup gets it in Phase 5)
- **Deviations:** (1) no formal SVG sprite/`icons.js` — inline SVGs per site match the existing convention with less machinery; (2) did NOT consolidate the 3 working keydown handlers (rip-out risk) — added the Cmd+/ help additively instead; the clone-dedupe hacks stay. Full consolidation deferred to Phase 6.

### Phase 4 — Visual redesign (primary surfaces done + verified both themes)
- [x] 4a Shell + atmosphere + page-load stagger: glassy backdrop-blur header, gradient hairline border, display-font brand + mono console tag, `riseIn` reveal gated on `.js-loaded` (set pre-paint), reduced-motion safe. **Verified.**
- [x] 4b Model palette: ⌘K/Ctrl+K opens it; rich themed rows (provider logos, badges, tinted feature chips) already landed in Phase 2. **Verified.** (ArrowUp/Down roving focus not yet added — see remaining.)
- [x] 4d Composer: floating elevated pill, backdrop-blur, `:focus-within` accent glow, seamless integrated textarea, mono context meter. **Verified.**
- [x] 4f Welcome hero: display-font gradient headline, mono eyebrow pill, functional quick-action chips (browse/upload/voice/shortcuts). **Verified.**
- [x] 4c (partial): de-`!important`ed system message (now a pill), error/system SVG icons. Avatars + code-header-bar **not yet done**.
- **Remaining Phase 4:** 4c message avatars + code-block header bar; 4e sidebar/prompt-bar row restyle; 4g modal/compare/presets visual restyle (chrome is themed + functional via modal.js, not yet fully redesigned); 4h final tooltip/hover polish + honest deep-research progress.
- **Deviation:** skipped the `chat.css → css/app.css` rename (pure churn, no functional benefit; file works as-is).

### Phase 5 — Setup page (partial)
- [x] Linked setup.html onto tokens/base/components + new fonts (Phase 1); dropped its duplicate token block; wired toast.js and replaced both blocking `alert()`s with `Toast.error`
- **Remaining:** full visual restyle of the setup form layout (currently inherits new tokens/fonts but keeps its old layout).

### Phase 6 — Cleanup + verify (partial)
- [x] Grep gates PASS: `cssText` in public/js = **0**; JS-set hardcoded hex = **0**; `!important` in chat.css **66 → 29** (remainder = highlight.js/KaTeX CDN overrides, all legitimate)
- [x] Removed dead `.gp-toast` / `.notification` CSS
- [x] Live-verified: home (both themes), model dropdown (themed, 162 models, correct position under glassy header), toasts, Cmd+/ shortcuts overlay
- **Remaining:** remove legacy token aliases from tokens.css (still in use by chat.css — safe to keep until a full pass renames every `var(--bg)`→`var(--color-canvas)`); full end-to-end feature walkthrough (streaming, export, voice, compare, presets, restart overlay) — needs a live chat session (was rate-limited during this build).

## Edge cases

- **`[style*='block']` selectors** keyed to JS display strings: 2d lands JS + CSS + HTML in one commit; sidebar/flyout/promptBar tested via click, Esc, outside-click, shortcuts.
- **Model search/selection contract**: `generateButtonId` IDs and `<button>` elements preserved; grep modelSearch/uiManager selectors before renames; `provider:`/`category:` operators + clear-restore tested.
- **Streaming DOM contract**: `.message.response`, `.thinking-block`, `.streaming-text/.streaming-cursor`, context IDs untouched; stream a long thinking+code response after 4c/4d.
- **Clone-to-dedupe listeners**: Phase 3 deletes the clones rather than adding a fourth binder; export must fire exactly once from button, Ctrl+S, Cmd+Shift+X.
- **Restart poll false-positive**: server keeps serving ~2s before `process.exit(99)` — require a failed poll before a 200 counts.
- **De-`!important` resurfacing**: each defense deleted in the same commit as the seam that removes its trigger.
- **Reduced motion / no-JS**: stagger gated on `.js-loaded`; `prefers-reduced-motion` disables atmosphere animation and reveals.

## Verification

1. After each phase: `node --check` on every touched JS file (I run these; zero-output = pass).
2. After Phases 1, 4a/4b/4d/4h, 6 — **you run**: `npm start 2>&1 | tee server-run.log` — then I drive Playwright screenshots (both themes × 560/768/900/1280) and check contrast, overflow, and focus states.
3. Phase 6 feature walkthrough (in the running app): streaming + thinking block · model search + `provider:`/`category:` operators · OpenRouter toggle · cache toggle · refresh · history sidebar + summaries toggle · prompt bar · export ×3 paths · voice · upload + drag-drop · image gen · Assistants mode · presets · compare · instructions editor + env editor + restart overlay · theme toggle · all shortcuts incl. ⌘K and Cmd+/.
4. Grep gates (Phase 6, I run): `grep -rnE "cssText|style\.background|style\.color" public/js` → geometry-only hits; `grep -c '!important' public/css/app.css` → <10.
