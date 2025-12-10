# Deploying the webapp to AI Studio (Gemini App / Build mode)

Bullet list of authoritative URLs (open these for details):
- AI Studio Build mode docs: https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- API key setup (env var): https://ai.google.dev/tutorials/setup
- Streaming / responseMimeType usage: https://ai.google.dev/gemini-api/docs/quickstart

Key takeaways (Dec 2025):
- Build mode keeps `process.env.*` placeholders in the bundled JS; when a user runs the app inside AI Studio, the platform proxies requests and injects **that user’s** Gemini API key at runtime. Shared apps never expose the author’s key; do not hardcode keys.
- Keep using the same `GEMINI_API_KEY` name in dev and prod. In local dev add it to `.env.local`; in AI Studio the placeholder is auto-injected per viewer.
- Apps are pure static frontends; no backend. If exporting outside AI Studio (e.g., Vercel), you must supply a key yourself and it will be exposed client-side—avoid for production unless you add a server proxy.
- Streaming works with `generateContentStream` and `responseMimeType: 'application/json'`/`responseSchema`; matches what the webapp uses.
- Security: never commit real keys; assume anyone you share the AI Studio app with can read your source but not your key. Restrict keys and rotate if leaked.
