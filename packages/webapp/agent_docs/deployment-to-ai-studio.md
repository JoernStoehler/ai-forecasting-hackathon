# Deployment to AI Studio (Gemini App) — quick notes

- https://ai.google.dev/gemini-api/docs/aistudio-build-mode
  - Build mode hosts a static front-end; it substitutes `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) at runtime for each viewer.
  - Keep the placeholder env reference in the code (don’t hardcode real keys); the host injects per-user keys via proxying.
  - Code is visible to viewers; exporting to other hosts with a real key would expose and bill that key.
- https://ai.google.dev/tutorials/setup
  - SDKs expect `GEMINI_API_KEY`; browser usage still requires explicitly passing the key, so the injected placeholder must stay in the build.
  - Local dev must supply the key manually (e.g., `.env.local`); there is no automatic import from AI Studio when running locally.

Practical rules we follow here
- Single env name everywhere: `GEMINI_API_KEY` (exposed to Vite via `envPrefix: ['GEMINI_']`).
- No fallbacks (`VITE_*`, `GOOGLE_API_KEY`, `window.*`) to keep dev/prod symmetry.
- Static-only deployment; if we ever host elsewhere, add a backend proxy to avoid shipping a real key.
- Mark any placeholder/heuristic logic explicitly; replace with real logic only when intended.
