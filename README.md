# AI Forecasting Hackathon

Vite + React 18 + TypeScript SPA for immersive scenario forecasting with Gemini 2.5 Flash. Client-only data (localStorage + JSON import/export); deploy as a static bundle.

**Status:** MVP complete, 89% E2E test coverage, ready for feature development.

## Quick Start

### Development
1. Open in devcontainer (auto-installs dependencies).
2. Copy `.env.example` to `.env.local` (optional: set `GEMINI_API_KEY` or use mock).
3. `npm run dev` - Start webapp (localhost:5173).
4. `npm run test:e2e -w packages/webapp` - Run E2E tests with mock forecaster.

### Testing Without API Key
Set `VITE_USE_MOCK_FORECASTER=true` in `.env.local` to test full gameplay loop without Gemini API.

### Before Committing
```bash
npm run lint && npm run typecheck && npm run build
npm run test:e2e -w packages/webapp -- --grep-invert "UNIMPLEMENTED"
```

## Project Structure

- **`packages/engine/`** - Isomorphic timeline engine (shared types, validation, forecaster adapters)
- **`packages/webapp/`** - React SPA (Vite + Tailwind) with comprehensive E2E tests
- **`packages/cli/`** - CLI for testing and engine development
- **`docs/`** - Design specifications and technical docs
- **`E2E-TEST-STATUS.md`** - Test coverage status and roadmap

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Full developer guide (start here!)
- **[VISION.md](./VISION.md)** - Product goals, constraints, feature roadmap
- **[E2E-TEST-STATUS.md](./E2E-TEST-STATUS.md)** - Webapp test infrastructure and status
- **[CLI-TEST-STATUS.md](./CLI-TEST-STATUS.md)** - CLI test infrastructure and status
- **[packages/webapp/tests/README.md](./packages/webapp/tests/README.md)** - Webapp test authoring guide
- **[packages/cli/test/README.md](./packages/cli/test/README.md)** - CLI test authoring guide

## CLI Usage

```bash
# Build first
npm run build

# One-turn run with mock forecaster
node packages/cli/dist/index.js \
  --input-player player.jsonl \
  --output-game-master gm.jsonl \
  --output-state state.jsonl \
  --mock

# With real Gemini API (requires GEMINI_API_KEY in env)
node packages/cli/dist/index.js \
  --input-player player.jsonl \
  --output-game-master gm.jsonl \
  --output-state state.jsonl
```

## Key Features

✅ **Implemented:**
- Timeline display with search and navigation
- Event sourcing architecture (append-only log)
- localStorage persistence + JSON import/export
- Gemini 2.5 Flash integration with streaming
- Mock forecaster for testing
- Comprehensive E2E test suite (89% passing)

⚠️ **In Progress:**
- Cassette replay system (designed, partially implemented)
- Full turn cycle E2E tests (infrastructure ready, tests need debugging)

❌ **Planned:** (See VISION.md for details)
- Post-game analysis screen
- Hidden news reveal
- Tutorial/onboarding
- PRNG/dice rolling system
- AI Studio Build deployment

---

**For full onboarding:** See [CLAUDE.md](./CLAUDE.md)
**For legacy docs:** See `AGENTS.md` (older codex-cli specific guidance)
