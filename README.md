# AI Forecasting Hackathon

Vite + React 18 + TypeScript SPA for immersive scenario forecasting with Gemini 2.5 Flash. Client-only data (localStorage + JSON import/export); deploy as a static bundle.

**Status:** MVP complete, comprehensive E2E test suite, ready for feature development.

## Quick Start

### Development
1. Run `npm install` (dependencies auto-install on session start).
2. Copy `.env.example` to `.env.local` (optional: set `GEMINI_API_KEY` or use mock).
3. `npm run dev` - Start webapp (localhost:3000).
4. `npm run test:e2e` - Run E2E tests with mock forecaster.

### Testing Without API Key
Set `VITE_USE_MOCK_FORECASTER=true` in `.env.local` to test full gameplay loop without Gemini API.

### Before Committing
```bash
npm run check
npm run test:e2e -- --grep-invert "UNIMPLEMENTED"
```

## Project Structure

Monorepo with npm workspaces:

- **`packages/webapp/`** - React web application
  - `packages/webapp/src/engine/` - Timeline engine (types, validation, forecaster adapters)
  - `packages/webapp/src/engine/test/` - Engine unit tests
  - `packages/webapp/src/components/` - React UI components
  - `packages/webapp/src/services/` - Business logic and integrations
  - `packages/webapp/tests/` - E2E test suite (Playwright)
- **`packages/share-worker/`** - Cloudflare Worker for game sharing
- **`docs/`** - Design specifications and technical docs
- **Root config files** - package.json with workspace scripts

## Documentation

- **[PROJECT.md](./PROJECT.md)** - Complete project overview (features, tests, vision)
- **[CLAUDE.md](./CLAUDE.md)** - Full developer guide (start here!)
- **[tests/README.md](./tests/README.md)** - Test authoring guide

## Key Features

✅ **Implemented:**
- Timeline display with search and navigation
- Event sourcing architecture (append-only log)
- localStorage persistence + JSON import/export
- Gemini 2.5 Flash integration with streaming
- Mock forecaster for testing
- Comprehensive test suite (unit tests + E2E tests)
- Zod-based type system (single source of truth)

⚠️ **In Progress:**
- Cassette replay system (designed, partially implemented)

❌ **Planned:** (See PROJECT.md for details)
- Post-game analysis screen
- Hidden news reveal
- Tutorial/onboarding
- PRNG/dice rolling system
- AI Studio Build deployment

---

**For full onboarding:** See [CLAUDE.md](./CLAUDE.md)
