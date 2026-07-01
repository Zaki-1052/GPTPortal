# GPTPortal

GPTPortal is a self-hosted, local-first web app that gives you one clean chat interface in front of every major LLM provider at once — OpenAI, Anthropic, Google, xAI, DeepSeek, Groq, Moonshot, Mistral, the entire OpenRouter catalog, and any OpenAI-compatible endpoint you run yourself (Ollama, LM Studio, vLLM). You bring your own API keys, run it on your own machine with a single `node server.js`, and talk to any model from any provider without juggling five different web UIs.

It is deliberately lightweight. There is no build step, no bundler, no frontend framework, and no database. The backend is modular Node/Express; the frontend is hand-written HTML, CSS, and vanilla JavaScript. You can read the whole thing, change it, and restart it in seconds. That constraint is a feature — this is meant to be a tool you *own and understand*, not a black box you deploy and forget.

This document is long on purpose. It is meant to get a non-technical user from zero to a working portal, and to give a developer enough of the map to extend it confidently. Skim the [Table of Contents](#table-of-contents) and jump to what you need.

---

## Table of Contents

- [What GPTPortal is (and what it isn't)](#what-gptportal-is-and-what-it-isnt)
- [Feature overview](#feature-overview)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Installation, step by step](#installation-step-by-step)
- [Configuration reference (`.env`)](#configuration-reference-env)
- [Providers and models](#providers-and-models)
- [Using the portal](#using-the-portal)
- [Custom and local endpoints (Ollama, LM Studio, vLLM)](#custom-and-local-endpoints-ollama-lm-studio-vllm)
- [Prompt caching (Claude)](#prompt-caching-claude)
- [Streaming, and how a message actually flows](#streaming-and-how-a-message-actually-flows)
- [HTTP API reference](#http-api-reference)
- [Extending: adding models and providers](#extending-adding-models-and-providers)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Security and privacy](#security-and-privacy)
- [Cost management](#cost-management)
- [Troubleshooting and FAQ](#troubleshooting-and-faq)
- [Testing](#testing)
- [Repository documents](#repository-documents)
- [Glossary](#glossary)
- [Contributing](#contributing)
- [License](#license)

---

## What GPTPortal is (and what it isn't)

**It is:**

- A **local-first** application. It runs on your computer (or your own server). Your API keys live in a `.env` file that is never committed. Your conversations are held in your browser session and, optionally, in files under `public/uploads/`. Nothing is sent anywhere except the actual API calls to whichever provider you chose for a given message.
- A **single unified interface** across many providers. Switch from GPT-5.5 to Claude Opus to Gemini 3 to a local Llama in one dropdown, mid-project, without changing anything else.
- **Pay-as-you-go by design.** You are billed directly by each provider for exactly what you use, through your own keys. There is no subscription and no middleman. For heavy users this is dramatically cheaper than paying for several chat subscriptions; for light users it can cost a few dollars a month.

**It is not:**

- A hosted, multi-tenant SaaS. There is a single Basic-Auth login gate and per-browser session state. You *can* expose it on a network, but it is designed for one person (or a trusted household) running it locally.
- A no-key demo. Every model call goes through a provider API, so you need at least one provider key. Most providers give new accounts some free credit; several models are effectively free through Groq or a local endpoint.
- A heavyweight "AI platform." There is intentionally no vector database, no RAG pipeline, no agent-orchestration subsystem, no packaged desktop binary. If you want those, this is a good base to build on, but they are out of scope here.

---

## Feature overview

**Models and providers**

- Curated **core catalog** of current models across OpenAI, Anthropic, Google, xAI, DeepSeek, Groq, Moonshot (Kimi), and Mistral, defined in a single JSON file.
- The **entire OpenRouter catalog** (hundreds of models) loaded live and cached, so anything OpenRouter serves is one click away.
- **Your own OpenAI-compatible endpoints** — Ollama, LM Studio, vLLM, LocalAI, or a remote gateway — added through environment variables with no code, auto-discovered into the model picker.
- A **searchable, categorized model picker** with per-provider logos, so you can find a model by name or family instead of scrolling.

**Conversation**

- **Token streaming** end to end. Answers appear as they are generated, and models that expose their reasoning stream that separately from the final answer.
- **Markdown rendering** with syntax-highlighted code blocks (highlight.js), math (KaTeX), and per-code-block copy buttons. Output is sanitized before it touches the DOM.
- **Reasoning and verbosity controls** for models that support them, plus temperature and max-token sliders, all wired through to the request.
- **Vision**: attach an image and ask a vision-capable model about it.
- **File uploads**: attach text-based files; their name and contents are added to your prompt.
- **Voice**: dictate a message (speech-to-text) and have replies read back to you (text-to-speech).
- **Image generation**: prefix a message with `Generate:` to produce an image inline.
- **Assistants mode** (OpenAI): a stateful, tool-using assistant with a persistent thread and code execution, for people who want that workflow.

**Workflow**

- **Compare view**: send one prompt to several models at once and read the answers side by side, each with its own cost.
- **Presets**: save and reapply bundles of system prompt + temperature + max tokens + reasoning effort + verbosity.
- **Context, token, and cost tracking**: a live indicator of how full the context window is and what the conversation has cost.
- **Export** the conversation to a self-contained HTML file.
- **Edit the system prompt and your `.env`** from inside the browser.
- **Prompt caching** for Claude, to cut the cost of long, stable system prompts.

**Interface**

- A **fully redesigned, token-driven UI** with light and dark themes (auto-detected from your OS, with a manual toggle that persists).
- A semantic, responsive shell: collapsible chat-history rail, main chat column, and a docked composer. It works on a laptop and degrades gracefully to a phone.
- **Keyboard shortcuts** for every common action.

---

## Architecture

The point of the 2.0 rewrite was to make the codebase legible. Here is the whole map.

```
node server.js
    │
    ▼
src/server/core/Application.js         ← wires everything together, emits lifecycle events
    ├── MiddlewareManager              ← Basic Auth, sessions, CORS, rate limiting, CSP, body parsing, static files
    ├── ServiceManager                 ← instantiates and holds the services below
    └── RouteManager                   ← mounts every HTTP route onto Express

Services (src/server/services/**)
    ├── providers/providerFactory.js   ← picks a handler for a given model id and dispatches to it
    │     ├── openai/**                ← Chat Completions + Responses API, images, audio, assistants
    │     ├── claudeHandler.js         ← Anthropic Messages API, adaptive thinking, web search, caching
    │     ├── geminiHandler.js         ← Google @google/genai SDK
    │     ├── grok / deepseek / groq / kimi / mistral / openrouterHandler.js
    │     ├── customEndpointHandler.js ← generic OpenAI-compatible handler for your own endpoints
    │     └── endpointResolver.js      ← turns `<prefix>/<model>` + config into a concrete call target
    ├── modelProviders/modelRegistry.js← unifies core + OpenRouter + custom models for the API/UI
    ├── costService / tokenService / contextWindowService / tokenCountService
    ├── promptCacheService             ← Claude cache-control breakpoints
    ├── titleService / exportService / modelSyncService
    └── shared/modelLoader.js          ← loads and caches the model catalog

Frontend (public/**, no build step)
    ├── portal.html + chat.css         ← app shell + the single design-token stylesheet
    └── js/modules/*.js                ← dynamicModelManager, modelUI, modelSearch, chatManager,
                                          messageHandler, uiManager, portalInit, presets, compare
```

A few design decisions worth knowing up front, because they explain how everything else behaves:

- **The model catalog is the source of truth.** `public/js/data/models.json` defines every core model. Routing, pricing, context windows, and capability flags are read from it. `providerFactory` consults each model's `provider` field first when deciding which handler to use, and only falls back to string-pattern matching for ids that aren't in the catalog (like OpenRouter's `vendor/model` ids). This means adding a model to an existing provider is usually a one-file change.
- **Handlers share one contract.** Every provider handler exposes `handleRequest(payload)` (non-streaming) and, where the provider supports it, `async *streamCompletion(payload)` that yields a small set of event types (`thinking`, `text`, `usage`, `error`). The rest of the system doesn't care which provider it's talking to.
- **State is per-session, not global.** Conversation history, the current image, and upload state live in `req.session.chat`, not in module-level variables, so two browsers don't step on each other.
- **The frontend has no framework.** Modules attach to `window` and coordinate through a handful of well-known objects (`window.chatManager`, `window.dynamicModelManager`, and so on). It is old-fashioned on purpose and easy to trace.

If you want to add a provider or model, read [Extending](#extending-adding-models-and-providers) and the dedicated [`MODEL_UPDATE.md`](MODEL_UPDATE.md).

---

## Requirements

- **Node.js 18 or newer.** The current LTS is recommended. Download it from [nodejs.org](https://nodejs.org/en/download). Check your version with `node --version`.
- **npm**, which ships with Node. Check with `npm --version`.
- **Git** (optional but recommended) to clone and update the repository. You can also download the repo as a ZIP.
- **At least one provider API key.** Which one is up to you — see [Providers and models](#providers-and-models). If you only have an OpenAI key, everything OpenAI works; the other providers simply stay disabled until you add their keys.
- A modern browser. Chrome, Edge, Firefox, Brave, Arc, and other Chromium/Firefox browsers all work well. **Safari** works for text but cannot do the voice features because WebKit lacks the audio codecs the recorder needs — use a Chromium browser or Firefox if you want voice.

---

## Quick start

If you already know your way around a terminal:

```bash
git clone https://github.com/Zaki-1052/GPTPortal.git
cd GPTPortal
npm install
cp .env.example .env      # then edit .env: set USER_USERNAME, USER_PASSWORD, and at least one API key
node server.js
```

Open `http://localhost:3000/portal`, sign in with the username and password you set, pick a model, and start typing. That's the whole thing.

If you'd rather not touch a text editor, you can instead run `node server.js` first and visit `http://localhost:3000/setup`, which gives you a browser form to enter your keys and writes the `.env` for you.

---

## Installation, step by step

This section assumes no prior experience. If you've done this kind of thing before, the [Quick start](#quick-start) above is all you need.

### 1. Install Node.js

Go to [nodejs.org](https://nodejs.org/en/download) and install the LTS build for your operating system. This also installs `npm`, the package manager the project uses. When it's done, open a terminal — **Terminal** on macOS, **Command Prompt** or **PowerShell** on Windows — and confirm it worked:

```bash
node --version
npm --version
```

Both should print a version number.

### 2. Get the code

With Git:

```bash
git clone https://github.com/Zaki-1052/GPTPortal.git
cd GPTPortal
```

Without Git: download the repository as a ZIP from GitHub, unzip it somewhere you'll remember, and `cd` into that folder in your terminal. Note that you must run the server from the project's root folder (the one containing `server.js`), so if you move or rename the folder, `cd` into its new location first.

### 3. Install dependencies

```bash
npm install
```

This reads `package.json` and downloads the handful of libraries the server needs (Express, the OpenAI and Google SDKs, a Markdown renderer, tokenizers, and so on). It only needs to be run once, or again after an update that changes dependencies.

### 4. Configure your keys and login

You have two options.

**Option A — the setup page (easiest).** Start the server with `node server.js` and open `http://localhost:3000/setup` in your browser. Fill in the form — a login username and password of your choosing, plus whichever provider keys you have — and save. It writes the `.env` file for you. Restart the server so it picks up the new values.

**Option B — edit `.env` directly.** Copy the template and open the copy in any text editor:

```bash
cp .env.example .env
```

On macOS, hidden files starting with a dot may not appear in Finder; press `Cmd + Shift + .` to reveal them, or just edit the file from your terminal or editor. At minimum, set:

```env
USER_USERNAME=pick_a_username
USER_PASSWORD=pick_a_password
OPENAI_API_KEY=sk-...           # and/or any other provider key you have
```

The username and password are yours to invent — they gate access to the portal and are checked locally. See the full [Configuration reference](#configuration-reference-env) for every option.

### 5. Run it

```bash
node server.js
```

You'll see startup logs ending in something like `🚀 GPTPortal server running at http://0.0.0.0:3000` and a list of which providers were enabled (a provider only initializes if its key is present).

### 6. Open the portal

Go to `http://localhost:3000/portal`. Your browser will ask for the username and password you set. After signing in you'll land on the chat interface. Pick a model from the selector at the top and send a message.

To stop the server, press `Ctrl + C` in the terminal.

---

## Configuration reference (`.env`)

Everything is configured through environment variables in `.env` (modeled on `.env.example`). Only the login and at least one provider key are truly required; everything else has a sensible default. Lines you don't need can be left commented out or omitted entirely.

### Authentication

| Variable | Description |
|---|---|
| `USER_USERNAME` | The username for the Basic-Auth login gate. Required. |
| `USER_PASSWORD` | The password for the login gate. Required. Choose something real if the machine is reachable by anyone else. |

### Provider API keys

Set the keys for the providers you want. Any provider whose key is missing simply stays disabled — its models won't route and won't appear as usable. You need at least one.

| Variable | Provider | Where to get a key |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI (GPT, o-series, image, voice) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `CLAUDE_API_KEY` | Anthropic Claude (`ANTHROPIC_API_KEY` also accepted) | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `GOOGLE_API_KEY` | Google Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `MISTRAL_API_KEY` | Mistral | [console.mistral.ai](https://console.mistral.ai/) |
| `CODESTRAL_API_KEY` | Mistral Codestral (code models) | [console.mistral.ai](https://console.mistral.ai/) |
| `GROQ_API_KEY` | Groq (fast Llama + open models) | [console.groq.com/keys](https://console.groq.com/keys) |
| `DEEPSEEK_API_KEY` | DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/) |
| `GROK_API_KEY` | xAI Grok | [console.x.ai](https://console.x.ai/) |
| `KIMI_API_KEY` | Moonshot Kimi | [platform.moonshot.ai](https://platform.moonshot.ai/) |
| `OPENROUTER_API_KEY` | OpenRouter (hundreds of models via one key) | [openrouter.ai/keys](https://openrouter.ai/keys) |

### Model defaults

| Variable | Default | Description |
|---|---|---|
| `DEFAULT_MODEL` | `gpt-5.5` | The model selected when the portal loads. |
| `TEMPERATURE` | `1` | Sampling randomness, 0–2. Lower is more deterministic. Applied where the provider accepts it. |
| `MAX_TOKENS` | `8000` | Default max output tokens. Also capped per-model by the catalog. |
| `REASONING_EFFORT` | `medium` | Default reasoning effort for models that support it: `none`, `minimal`, `low`, `medium`, `high`, `xhigh`. |
| `VERBOSITY` | `medium` | Default answer verbosity for models that support it: `low`, `medium`, `high`. |

These are defaults; the sliders and dropdowns in the composer override them per message.

### Assistants mode (OpenAI, optional)

| Variable | Description |
|---|---|
| `ASSISTANT_ID` | Reuse an existing OpenAI Assistant instead of creating a new one. Find it at [platform.openai.com/assistants](https://platform.openai.com/assistants). |
| `THREAD_ID` | Continue an existing Assistants thread. |

### Prompt caching (Claude, optional)

Claude can cache a stable prefix of your prompt so you're not billed full price for the same long system prompt every turn. See [Prompt caching](#prompt-caching-claude).

| Variable | Default | Description |
|---|---|---|
| `CLAUDE_CACHE_ENABLED` | `false` | Turn caching on. |
| `CLAUDE_CACHE_STRATEGY` | `conservative` | How aggressively to place cache breakpoints. |
| `CLAUDE_CACHE_ANALYTICS` | `true` | Log cache hit/miss analytics. |
| `CLAUDE_CACHE_MAX_BREAKPOINTS` | `4` | Maximum cache breakpoints (0–10). |
| `CLAUDE_CACHE_DEFAULT_PREFERENCE` | `auto` | Default caching preference. |

### Custom OpenAI-compatible endpoints (optional)

Point the portal at a local or remote OpenAI-compatible server. Fully opt-in — omit these and nothing changes. See [Custom and local endpoints](#custom-and-local-endpoints-ollama-lm-studio-vllm).

| Variable | Description |
|---|---|
| `CUSTOM_OPENAI_BASE_URL` | Base URL of one endpoint, e.g. `http://localhost:11434/v1` for Ollama. |
| `CUSTOM_OPENAI_API_KEY` | Key for that endpoint (often a dummy value for local servers). |
| `CUSTOM_OPENAI_PREFIX` | Routing prefix for its model ids, e.g. `ollama`. Default `local`. |
| `CUSTOM_OPENAI_LABEL` | Display label in the model picker, e.g. `Ollama`. |
| `CUSTOM_ENDPOINTS` | A JSON array to configure several endpoints at once (takes precedence over the single-endpoint variables above). |

### Server and security

| Variable | Default | Description |
|---|---|---|
| `PORT_SERVER` | `3000` | Port the server listens on. |
| `HOST` | `0.0.0.0` | Bind address. `0.0.0.0` accepts connections from your local network; use `127.0.0.1` to restrict to this machine only. |
| `NODE_ENV` | `development` | Set to `production` to enable secure session cookies. |
| `LOG_LEVEL` | `info` | Logging verbosity. |
| `SESSION_SECRET` | random | Secret for signing session cookies. Set a fixed value in production so sessions survive restarts. |
| `RATE_LIMIT_MAX` | `100` | Max requests per IP per 15 minutes (general). |
| `API_RATE_LIMIT_MAX` | `50` | Max requests per IP per 15 minutes for `/api/` routes. |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS allowlist. Restrict this if you expose the portal beyond localhost. |

---

## Providers and models

The **core catalog** lives in [`public/js/data/models.json`](public/js/data/models.json) and is organized into these categories. Model ids evolve quickly; treat the list below as a snapshot of the families present, and open the picker for the exact current ids.

| Category | What's in it | Examples |
|---|---|---|
| **GPT Models** | OpenAI's GPT line and small/fast variants | `gpt-5.5`, `gpt-5.5-pro`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.3-codex`, `gpt-4.1`, `gpt-4o` |
| **Claude Models** | Anthropic Claude | `claude-opus-4-8`, `claude-opus-4-7`, `claude-sonnet-5`, `claude-haiku-4-5`, `claude-fable-5` |
| **Gemini Models** | Google Gemini 3 line | `gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite` |
| **Reasoning Models** | Dedicated reasoning models | `o4-mini` |
| **DeepSeek & Kimi** | DeepSeek + Moonshot | `deepseek-v4-pro`, `deepseek-v4-flash`, `kimi-k2.6`, `kimi-k2.7-code`, `kimi-k2.5` |
| **Mistral Models** | Mistral family | `mistral-large-latest`, `mistral-medium-latest`, `mistral-small-latest`, `magistral-medium-latest`, `codestral-latest` |
| **Groq Models** | Fast open models via Groq | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`, `openai/gpt-oss-20b` |
| **Grok Models** | xAI Grok | `grok-4.3`, `grok-build-0.1` |
| **Voice Models** | Speech-to-text and text-to-speech | `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-mini-tts` |
| **Image Models** | Image generation | `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1-mini`, plus Gemini image models |

Beyond the core catalog you also get:

- **OpenRouter** — with an `OPENROUTER_API_KEY`, the full OpenRouter model list is fetched live, cached for an hour, and merged into the picker. Toggle "show OpenRouter models" in the picker to include them. Capability flags (vision, tools, reasoning) and pricing come straight from OpenRouter's metadata.
- **Your own endpoints** — see the next two sections.

Pricing and availability change constantly. The portal shows live cost estimates from the catalog's per-model pricing and refreshes OpenRouter automatically; there is also a refresh button in the picker. For authoritative pricing, check each provider's pricing page.

### A note on choosing keys

You do not need every key. A reasonable starting point:

- **OpenAI** if you want the broadest single-provider coverage (chat, reasoning, vision, image, and voice all come from one key).
- **Anthropic** for Claude, which many people prefer for writing and code.
- **Groq** for genuinely fast, often free open models — a good "no-cost" option to try the portal.
- **OpenRouter** if you'd rather hold one key and reach everything else through it.

---

## Using the portal

### Sending messages and streaming

Type in the composer and press **Enter** or click **Send** (`Ctrl/Cmd + Enter` also sends). The answer streams in token by token. For models that expose their chain of thought, the reasoning streams into a separate collapsible block above the answer, and the final answer is rendered with full Markdown, code highlighting, and math once it completes.

### Choosing a model

Click the model selector at the top. You can type to filter by name or family, and each model shows its provider. If you have an OpenRouter key, toggle its models on to search the full catalog. The model you pick applies to your next message; you can switch between messages. (One exception: once you've sent an image to a vision model, switching models mid-conversation can lose the image context — export and start fresh if you need to change models after an image.)

### Reasoning effort, verbosity, temperature, and tokens

Open **Model parameters** in the composer to reveal the sliders and dropdowns:

- **Temperature** (0–2): randomness. Lower is steadier and more repetitive; higher is more varied.
- **Max tokens**: the ceiling on the response length, capped per-model.
- **Reasoning effort** (for reasoning-capable models): `none` through `xhigh`. Higher effort produces better reasoning but is slower and costs more.
- **Verbosity** (for models that support it): how long and detailed the answer is.

These controls actually change the request — the reasoning-effort and verbosity values are passed through to the provider, not cosmetic.

### Presets

The **Presets** button (sliders icon) opens a panel where you can save the current system prompt plus temperature, max tokens, reasoning effort, and verbosity as a named bundle, then reapply it later with one click. Presets are stored in your browser's local storage. Applying a preset updates the composer controls immediately; because the system prompt is a server-side file, a preset's prompt takes effect on your next new conversation.

### Compare

The **Compare** button (two-columns icon) lets you send one prompt to several models at once (up to six) and read the answers side by side, each with its own cost. Compare runs are stateless — they don't touch your main conversation — so it's a safe way to see how models differ on the same question before committing to one.

### Vision (image input)

Click the attach button, choose an image, and send it with a message to a vision-capable model. The model receives the image and your text together.

### File uploads

Attach a text-based file the same way. Its filename and contents are appended to your message, which is handy for pasting in code, logs, or documents without copying by hand. All UTF-8 text file types are supported.

### Voice

Click the microphone to record; speak; click again to stop. Your speech is transcribed (and copied to your clipboard), placed in the input, and — after the model responds — the reply is read back to you. Voice needs a Chromium browser or Firefox; it does not work in Safari because of WebKit codec limitations.

### Image generation

Prefix a message with `Generate:` followed by your prompt to create an image inline, e.g. `Generate: a watercolor fox in a snowy forest`. The image appears in the chat and can be downloaded. This uses the current image models (such as `gpt-image-2`).

### Assistants mode (OpenAI)

Toggle **Assistants Mode** below the chat to switch into OpenAI's Assistants API, which keeps a persistent thread and can run code and read uploaded files. Your first message creates an assistant and a thread; you can reuse them across sessions by putting their ids in `.env` (`ASSISTANT_ID`, `THREAD_ID`). This is a distinct, stateful workflow from the normal chat path and is best treated as its own mode.

### Context, tokens, and cost

The composer shows a live indicator of how full the model's context window is and what the conversation has cost so far, computed from the catalog's per-model pricing. This is your early warning before a long conversation gets expensive or bumps the context limit.

### Editing the system prompt and environment

Two buttons in the header open in-browser editors: one for the **system instructions** (`public/instructions.md`, the prompt prepended to your conversations) and one for your **`.env`**. Editing instructions here is the intended way to give the models a persistent persona or background about you.

### Exporting

The export button downloads the current conversation as a standalone, Markdown-rendered HTML file. Exporting no longer shuts the server down — it's a pure download.

### Theme

The portal auto-detects light or dark from your OS. The sun/moon button toggles it manually, and your choice is remembered.

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Enter` | Send the message |
| `Ctrl/Cmd + L` | Clear the chat |
| `Ctrl/Cmd + S` | Export the conversation |
| `Shift + Esc` | Focus the input box |
| `Esc` | Close the model dropdown |
| `Ctrl/Cmd + Shift + V` | Toggle voice mode |
| `Ctrl/Cmd + Shift + F` | Open the file picker |
| `Ctrl/Cmd + Shift + A` | Toggle Assistants mode |

---

## Custom and local endpoints (Ollama, LM Studio, vLLM)

Any server that speaks the OpenAI Chat Completions format can be plugged in without writing code. This is how you run fully local, private models — Ollama, LM Studio, vLLM, LocalAI — or point at a remote OpenAI-compatible gateway.

You declare endpoints in `.env`. The single-endpoint form:

```env
CUSTOM_OPENAI_BASE_URL=http://localhost:11434/v1
CUSTOM_OPENAI_API_KEY=ollama
CUSTOM_OPENAI_PREFIX=ollama
CUSTOM_OPENAI_LABEL=Ollama
```

Or several endpoints at once, as a one-line JSON array:

```env
CUSTOM_ENDPOINTS=[{"prefix":"ollama","baseURL":"http://localhost:11434/v1","apiKey":"ollama","label":"Ollama"},{"prefix":"lmstudio","baseURL":"http://localhost:1234/v1","apiKey":"lm-studio","label":"LM Studio"}]
```

Once configured, the portal queries each endpoint's model list and folds those models into the picker under **Local / Custom Endpoints**. You address a model as `<prefix>/<model>` — for example `ollama/llama3.2` — and it routes to the right endpoint automatically. Local servers that need no API key can leave `apiKey` blank. This path supports streaming just like the hosted providers.

Because these models run on your own hardware, they are free to use and your prompts never leave your machine.

---

## Prompt caching (Claude)

Long conversations with a big, stable system prompt get expensive because you re-send that prompt every turn. Anthropic's prompt caching lets Claude cache a prefix of the request so repeated content is billed at a large discount. GPTPortal integrates this: enable it with `CLAUDE_CACHE_ENABLED=true` (and tune the related `CLAUDE_CACHE_*` variables), or toggle it per session with the cache control in the model picker when a Claude model is selected. The `promptCacheService` decides where to place cache breakpoints based on your chosen strategy. If you routinely use a large custom system prompt with Claude, turning this on can noticeably reduce cost with no change to output.

---

## Streaming, and how a message actually flows

For the curious or the contributing, here is the path a normal chat message takes:

1. The browser (`chatManager.js`) posts to `POST /message` and asks for a streaming response (`Accept: text/event-stream`).
2. `routes/chat.js` builds the request payload from your session, then asks `providerFactory` whether the chosen model can stream. If it can, the route opens a Server-Sent Events stream.
3. `providerFactory.handleRequestStream()` dispatches to the right handler's `streamCompletion()`, which opens the provider's own stream and yields normalized events: `thinking` deltas, `text` deltas, a final `usage` event, or an `error`.
4. The frontend renders `text` deltas into the answer bubble and `thinking` deltas into the reasoning block as they arrive, then runs the full Markdown/highlight/math pipeline once the answer completes and reconciles the final token usage and cost.
5. The assistant's message is appended to the session history so the next turn has context.

Models or providers that can't stream fall back to a single non-streaming response through the same interface, so the frontend doesn't need to special-case them.

---

## HTTP API reference

All routes are behind Basic Auth. These are the ones worth knowing if you want to script against the portal or understand the frontend.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/message` | Main chat. JSON body: `{ message, modelID, temperature?, tokens?, reasoningEffort?, verbosity?, image? }`. Returns JSON `{ text, usage }`, or a Server-Sent Events stream when `stream: true` or `Accept: text/event-stream`. |
| `POST` | `/compare` | Fan one prompt out to several models. Body: `{ message, models: [...], temperature?, tokens?, reasoningEffort?, verbosity? }`. Returns `{ results: [{ modelID, success, content, usage, cost, error }] }`. Stateless. |
| `POST` | `/reset` | Clear the conversation state for this session. |
| `POST` | `/generate-image` | Generate an image from a prompt. |
| `POST` | `/transcribe` | Speech-to-text. |
| `POST` | `/tts` | Text-to-speech. |
| `POST` | `/upload-file`, `/upload-image` | Attach a file or image for the next message. |
| `GET` | `/api/models` | The full model catalog (add `?format=frontend` for the picker's shape). Also `/api/models/core`, `/openrouter`, `/categories`, `/search`, `/statistics`. |
| `GET` / `POST` | `/get-instructions` / `/update-instructions` | Read or write the system prompt. |
| `GET` / `POST` | `/get-my-env` / `/update-my-env` | Read or write `.env` from the browser editor. |
| `GET` | `/health`, `/api/system/status` | Health and service status. |
| `POST` | `/shutdown-server` | Intentionally stop the server (used by the setup/save flow). |

There is also a legacy `POST /gemini` route retained for backward compatibility; new work should use `/message`, which routes Gemini like every other provider.

---

## Extending: adding models and providers

The most common task is adding a model to a provider that already exists. Because routing reads the catalog, that is usually a single edit to [`public/js/data/models.json`](public/js/data/models.json): add the model entry with the correct `provider` and `category`, and it will route, price, and appear in the picker on its own. Run `npm test` afterward to validate the catalog.

Adding a whole new provider means writing a handler in `src/server/services/providers/`, registering it in `providerFactory.js`, and adding its key to the config. Adding a new OpenAI-compatible *endpoint* (as opposed to a new provider) needs no code at all — use the `CUSTOM_*` variables.

The full, step-by-step guide with the exact files, the handler contract, the streaming interface, and the catalog schema lives in [`MODEL_UPDATE.md`](MODEL_UPDATE.md). Start there.

---

## Project structure

```
GPTPortal/
├── server.js                     # Entry point; boots src/server/core/Application
├── package.json                  # Dependencies and scripts (start, test)
├── .env / .env.example           # Configuration (yours is git-ignored)
├── Dockerfile / docker-compose.yml
├── vercel.json                   # Serverless deployment config
├── MODEL_UPDATE.md               # Guide for adding models/providers
├── scripts/
│   └── smoke-test.js             # Catalog + routing validation (npm test)
├── public/                       # Frontend (served statically, no build step)
│   ├── portal.html               # The app shell
│   ├── setup.html                # First-run key entry page
│   ├── chat.css                  # The single design-token stylesheet
│   ├── instructions.md           # System prompt (editable in-app)
│   ├── claudeInstructions.xml    # Claude-specific instructions
│   ├── js/
│   │   ├── app.js                # Frontend bootstrap
│   │   ├── data/models.json      # The model catalog (source of truth)
│   │   ├── modules/              # chatManager, messageHandler, uiManager,
│   │   │                         #   dynamicModelManager, modelUI, modelSearch,
│   │   │                         #   portalInit, presets, compare
│   │   └── services/             # contextTracker, tokenCounterClient
│   └── uploads/                  # Saved chats, prompts, and uploaded files
└── src/
    ├── server/
    │   ├── core/                 # Application, ServiceManager, RouteManager, MiddlewareManager
    │   ├── routes/               # chat, gemini, assistant, models, setup, config
    │   ├── services/             # providers/**, cost, token, context, export, modelRegistry, ...
    │   ├── middleware/           # auth, upload
    │   └── utils/                # Logger, validation, error handling
    └── shared/
        └── modelLoader.js        # Loads/caches the catalog
```

---

## Deployment

### Local (recommended)

The default. `node server.js`, reachable at `http://localhost:3000/portal`. If you want it available to other devices on your network, keep `HOST=0.0.0.0` and connect from another machine using this computer's LAN IP; if you want it strictly private, set `HOST=127.0.0.1`.

### Docker

A `Dockerfile` (multi-stage, production dependencies only, non-root user, `dumb-init` as PID 1) and a `docker-compose.yml` are included.

Build and run directly:

```bash
docker build -t gptportal .
docker run -p 3000:3000 --env-file ./.env --name gptportal gptportal
```

Or with Compose (which mounts your local `.env` into the container):

```bash
docker compose up
```

The container exposes port 3000. Adjust the port mapping if you change `PORT_SERVER`.

### Vercel and other serverless hosts

`vercel.json` is included and the app can run as a serverless function, but understand the trade-offs before relying on it: serverless instances are ephemeral and don't hold long-lived in-memory session state, streaming behaves differently behind some serverless proxies, and you'd be exposing your keys to a hosted environment. For a personal tool, running it locally or on a small always-on server (a VPS, a home server, a Raspberry Pi) matches the app's design far better than serverless does.

Wherever you deploy beyond your own machine, set a strong `USER_PASSWORD`, a fixed `SESSION_SECRET`, `NODE_ENV=production`, and a restrictive `ALLOWED_ORIGINS`.

---

## Security and privacy

- **Your keys stay in `.env`, which is git-ignored.** The repository cannot read or transmit them. The only places your keys go are the provider APIs you call.
- **Your conversations stay local.** History is held in your server-side session and, if you export or save, in files under `public/uploads/`. The app doesn't phone home. The only data leaving your machine is the content of the messages you send to whichever provider you selected — and, for local endpoints, not even that.
- **Access is gated by HTTP Basic Auth** using `USER_USERNAME` / `USER_PASSWORD`, applied to every route.
- **Rate limiting** is on by default (general and stricter `/api/` limits), configurable via `RATE_LIMIT_MAX` and `API_RATE_LIMIT_MAX`.
- **Security headers** (a Content-Security-Policy plus frame, MIME-sniffing, and referrer protections) are set on every response.
- **`trust proxy` is set to `loopback`**, which is correct for a local-first app. If you deploy behind a known reverse proxy, widen it deliberately.
- **A caution about exposure.** Basic Auth over plain HTTP sends credentials in an easily reversible encoding. If you make the portal reachable beyond your own machine, put it behind HTTPS (a reverse proxy such as Caddy or nginx with a certificate) rather than exposing it directly.

Treat your API keys like passwords: don't share them, don't paste them into screenshots, and rotate them if you suspect exposure.

---

## Cost management

You pay each provider directly for what you use, metered in tokens. The portal helps you stay aware of this in two ways: it shows a live cost estimate for the current conversation (from the catalog's per-model input/output pricing), and it shows how full the context window is.

The dynamic worth understanding is **context accumulation**. Each turn re-sends the whole conversation so far as input, so cost grows as the conversation lengthens even if your individual messages stay short:

- Turn 1 bills your system prompt + your message (input) and the reply (output).
- Turn 2 bills the system prompt + turn 1's message *and reply* + your new message (all input now) plus the new reply (output).
- And so on. The input side compounds; a long thread with an expensive model is where the money goes.

Practical ways to keep it in check:

- **Match the model to the task.** Use a small, cheap, or free model (a Groq open model, a `-mini`/`-nano` variant, or a local endpoint) for routine questions, and reserve the expensive flagships for work that needs them.
- **Reset when you change topics.** Starting a fresh conversation drops the accumulated context you no longer need.
- **Watch the live cost and context indicators.** They're there precisely so a long session doesn't surprise you.
- **Turn on prompt caching for Claude** if you use a large, stable system prompt.
- **Use Compare deliberately** — it multiplies cost by the number of models you select — but it's cheap and genuinely useful for picking the right model for a task up front.

For authoritative, current pricing, check each provider's own pricing page; the catalog's numbers are a convenience, not a billing source of truth.

---

## Troubleshooting and FAQ

**The server won't start: `EADDRINUSE`.** Port 3000 is already in use. Either stop whatever is using it, or set a different `PORT_SERVER` in `.env`.

**The browser keeps asking me to log in, or rejects my credentials.** The username and password come from `USER_USERNAME` and `USER_PASSWORD` in `.env`. Make sure both are set and that you restarted the server after editing `.env`.

**A model returns an error or a 400.** Usually one of: the provider's key isn't set (so the model can't route), the key is out of credit, or you selected a model your key doesn't have access to. Check the server logs — they name the provider and the underlying error. Also confirm the model still exists at the provider; model ids are retired regularly.

**A whole provider's models are missing or won't respond.** That provider's key isn't configured. Each provider only initializes when its key is present; the startup logs list which ones came up.

**`Cannot find module` on startup.** Run `npm install` again. This happens after an update that added a dependency, or if the first install was interrupted.

**Streaming doesn't show; the answer appears all at once.** Some models and providers don't support streaming and fall back to a single response — that's expected. If *nothing* streams, check that a proxy in front of the app isn't buffering `text/event-stream` responses.

**Voice doesn't work.** You're probably in Safari. WebKit lacks the codecs the recorder uses; switch to a Chromium browser or Firefox.

**Where do I add my key — I can't see the `.env` file?** On macOS, dotfiles are hidden in Finder; press `Cmd + Shift + .` to reveal them, or use the in-app `.env` editor, or edit the file from your terminal. On Windows it should be visible. The most common setup mistake is leaving the file named `.env.example` instead of `.env`.

**Is my data safe?** Your keys and conversations stay on your machine; the only outbound traffic is the API calls you make to the providers you chose (and none, for local endpoints). See [Security and privacy](#security-and-privacy).

**How do I update to a newer version?** From the project folder, `git pull origin main`, then `npm install` if dependencies changed, then restart. Your `.env` is preserved because it's git-ignored.

**Can I run models that never touch the internet?** Yes — configure a local endpoint (Ollama, LM Studio, vLLM) as described above. Those models run on your hardware and your prompts don't leave the machine.

---

## Testing

A smoke test validates the model catalog and routing without needing any API keys:

```bash
npm test
```

It checks that `models.json` is valid, has no duplicate ids, that every model has the required fields and non-zero pricing, that categories are consistent, that no known-retired ids linger, that every model routes to a handler, and that the streaming helpers are exported. Run it after any change to the catalog or the provider routing.

---

## Repository documents

- **[`README.md`](README.md)** — this file.
- **[`MODEL_UPDATE.md`](MODEL_UPDATE.md)** — how to add models and providers, including the handler and streaming contracts and the catalog schema.
- **[`AGENTS.md`](AGENTS.md)** — repository conventions for contributors and coding agents.
- **[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)** — community expectations.
- **[`src/BACKEND_ARCHITECTURE.md`](src/BACKEND_ARCHITECTURE.md)** — a deeper tour of the backend classes.

Developer reference notes and captured provider documentation gathered during development live under **[`docs/reference/`](docs/reference/)** (`api_formats.md`, `claudes-new.md`, `deep_research.md`, `gpt-5.2.md`, and a copy of the working coding guidelines `RULES.md`). These are not user-facing docs, and some describe APIs or models that have since changed. Treat them as scratch reference; the authoritative behavior is the code and this README.

---

## Glossary

- **API key** — a secret string that authenticates your requests to a provider and ties usage to your billing. Kept in `.env`.
- **Token** — the unit providers bill in. Roughly ¾ of a word of English. Both what you send (input) and what the model generates (output) count.
- **Context window** — the maximum number of tokens a model can consider at once. When a conversation approaches it, the oldest content must be dropped or summarized.
- **System prompt / instructions** — the standing instructions prepended to your conversation (`public/instructions.md`), used to set persona and background.
- **Streaming (SSE)** — Server-Sent Events; delivering the answer token by token as it's generated rather than all at once.
- **Reasoning effort** — a control on how much internal reasoning a reasoning-capable model does before answering; more is better but slower and costlier.
- **Prompt caching** — reusing a cached prefix of a prompt across turns so repeated content is billed at a discount (Claude).
- **OpenAI-compatible endpoint** — any server (Ollama, LM Studio, vLLM, a gateway) that speaks the OpenAI Chat Completions format, so it can be used without custom code.
- **Provider handler** — the server-side class that knows how to talk to one provider's API and normalize it to the portal's common interface.
- **Basic Auth** — the simple username/password gate the browser prompts for; here it protects the whole portal.

---

## Contributing

Contributions are welcome. Fork the repository, work on a focused branch, and open a pull request describing what changed and how you tested it — include curl examples or screenshots for UI changes. Keep the project's constraints in mind: no build step, no frontend framework, and new dependencies only when clearly justified. See [`AGENTS.md`](AGENTS.md) for conventions and [`MODEL_UPDATE.md`](MODEL_UPDATE.md) if your change touches models or providers. For bugs and ideas, open a GitHub issue with enough detail to reproduce.

## License

Released under the MIT License. See [`LICENSE`](LICENSE).

---

*GPTPortal began as a single-file GPT-4 chat portal and has since been rebuilt into the modular, multi-provider, streaming application documented here. The original v1 README is preserved as [`oldDocs.md`](oldDocs.md) for anyone curious about where it started.*
