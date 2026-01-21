# AI Forecasting Game

Serious policy simulation for exploring AI governance scenarios. Players assume the role of the US government and interact with an LLM-based "game master" (Gemini 2.5 Flash) through an interactive timeline from 2025 onward.

**Tech Stack:** TypeScript, React 18, Vite, Event Sourcing, Gemini 2.5 Flash API
**Status:** MVP complete (2026-01-21)

---

## Quick Start

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (localhost:3000)
npm run check                  # Run all checks before committing
```

**Optional:** Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (or use mock forecaster)

---

## Documentation

For developers and agents working on this codebase:

- **[CLAUDE.md](./CLAUDE.md)** - Full developer guide (start here!)
- **[PROJECT.md](./PROJECT.md)** - Complete project overview (features, tests, vision, roadmap)
- **[docs/](./docs/)** - Design specifications and technical documentation

---

## Project Structure

Monorepo with npm workspaces:
- `packages/webapp/` - React web application (main codebase)
- `packages/share-worker/` - Cloudflare Worker for game sharing
- `docs/` - Design specifications

See [CLAUDE.md](./CLAUDE.md) for architecture details and development workflow.
