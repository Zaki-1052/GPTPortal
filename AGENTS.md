# Repository Guidelines

## Project Structure & Module Organization
- Root entrypoint: `server.js` (starts Express via `src/server/core/Application`).
- Server code: `src/server/` with `core/` (app wiring), `routes/` (HTTP endpoints), `services/` (AI providers, export, tokens), `middleware/` (auth, uploads), `utils/`.
- Client assets: `public/` (static files, `uploads/` for chats, prompts, images).
- Configuration: `.env` (use `.env.example` as a template); Docker: `dockerfile`, `docker-compose.yml`.

## Build, Test, and Development Commands
- Install: `npm install` — install Node dependencies.
- Run: `npm start` — start the server (reads `PORT_SERVER`, `HOST`).
- Docker run: `docker compose up` — run via Docker (respects env vars).
- Health check: `curl http://localhost:3000/health` — quick server status.

## Coding Style & Naming Conventions
- JavaScript (CommonJS): `require/module.exports` with semicolons; 2‑space indentation.
- Naming: camelCase for variables/functions; PascalCase for classes (e.g., `Application.js`, `Logger.js`); route files are lower‑case (e.g., `chat.js`).
- Structure: keep routing in `src/server/routes/`, business logic in `src/server/services/`, wiring in `src/server/core/`.
- Formatting: no enforced linter; match existing style and file layout.

## Testing Guidelines
- Framework: no formal test suite yet. Prefer targeted manual checks:
  - `GET /health`, `GET /api/system/status`
  - Chat and AI endpoints mounted by `RouteManager` (e.g., `/transcribe`, `/tts`, `/generate-image`).
- Suggested (optional): add Jest + Supertest for routes; place tests under `src/__tests__/` mirroring paths.

## Commit & Pull Request Guidelines
- Commits: keep concise, imperative summaries (project history favors short, lower‑case lines). Optional scope prefix, e.g., `routes: add tts fallback`.
- PRs: include purpose, linked issues, key changes, test steps (commands or curl examples), and screenshots for UI changes (`public/portal.html`). Small, focused PRs are preferred.

## Security & Configuration Tips
- Credentials: set `USER_USERNAME` and `USER_PASSWORD` to enable Basic Auth; never commit `.env`.
- API keys: configure in `.env` (`OPENAI_API_KEY`, `GOOGLE_API_KEY`, etc.).
- CORS: restrict `ALLOWED_ORIGINS` in production.
- Uploads: files are saved under `public/uploads/`; validate inputs and avoid large files beyond configured limits.
