# Developer reference notes

Scratch reference material gathered while building GPTPortal — captured provider
documentation and internal working notes. **These are not user-facing docs.** Some
describe APIs or models that have since changed; the authoritative behavior is the
code and the root [`README.md`](../../README.md). Kept here for convenience, not as
a source of truth.

| File | What it is |
|---|---|
| `RULES.md` | A copy of the coding guidelines / pair-programming instructions used during development. |
| `api_formats.md` | OpenAI docs excerpt comparing the Responses API and Chat Completions API. |
| `claudes-new.md` | Anthropic model-overview excerpt. |
| `deep_research.md` | OpenAI deep-research docs excerpt (describes `o3-deep-research`/`o4-mini-deep-research`, which are not in the current catalog). |
| `gpt-5.2.md` | OpenAI function-calling / tool-use docs excerpt. |

For how to actually add models or providers, see [`MODEL_UPDATE.md`](../../MODEL_UPDATE.md).
For the backend design, see [`src/BACKEND_ARCHITECTURE.md`](../../src/BACKEND_ARCHITECTURE.md).
