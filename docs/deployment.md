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

---

# Share Worker (Cloudflare)

The game includes a share feature that stores game state in Cloudflare KV.

**Production worker:** https://share-worker.joern-stoehler.workers.dev

**Source:** `packages/share-worker/`

## How it works
1. User clicks Share → game state POSTed to `/share` → returns 8-char ID
2. Share URL: `https://your-app.com?share=<id>`
3. Shared games stored for 30 days in KV
4. CORS allows all origins (game can run from any host)

## Deploy updates
```bash
npm run worker:login   # One-time Cloudflare auth
npm run worker:deploy  # Deploy changes
```

## Local development
```bash
npm run worker:dev     # Runs on localhost:8787
```

Set `VITE_SHARE_WORKER_URL=http://localhost:8787` to test locally.
