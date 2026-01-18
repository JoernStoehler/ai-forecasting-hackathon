# Deploying the webapp to AI Studio (Gemini App / Build mode)

Bullet list of authoritative URLs (open these for details):
- AI Studio Build mode docs: https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- API key setup (env var): https://ai.google.dev/tutorials/setup
- Streaming / responseMimeType usage: https://ai.google.dev/gemini-api/docs/quickstart

Key takeaways:
- AI Studio Build injects a **per-viewer** Gemini API key so shared apps do not expose the author’s key. Do not hardcode keys.
- Keep using the same `GEMINI_API_KEY` name in dev and prod. In local dev add it to `.env.local`.
- Apps are pure static frontends; no backend. If exporting outside AI Studio (e.g., Vercel), you must supply a key yourself and it will be exposed client-side—avoid for production unless you add a server proxy.
- Streaming works with `generateContentStream` and `responseMimeType: 'application/json'`/`responseSchema`; matches what the engine uses.
- Security: never commit real keys; assume anyone you share the AI Studio app with can read your source but not your key. Restrict keys and rotate if leaked.
