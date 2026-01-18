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

Single-package React SPA (consolidated from previous 3-package monorepo):

- **`packages/webapp/`** - React SPA (all code consolidated here)
  - `src/engine/` - Timeline engine (types, validation, forecaster adapters)
  - `src/engine/test/` - Engine unit tests (196 tests)
  - `src/components/` - React UI components
  - `tests/` - E2E test suite (Playwright)
- **`docs/`** - Design specifications and technical docs
- **`package.json`** (root) - Webapp package.json (no workspace config)

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Full developer guide (start here!)
- **[VISION.md](./VISION.md)** - Product goals, constraints, feature roadmap
- **[E2E-TEST-STATUS.md](./E2E-TEST-STATUS.md)** - Test infrastructure and status
- **[packages/webapp/tests/README.md](./packages/webapp/tests/README.md)** - Test authoring guide

## Key Features

✅ **Implemented:**
- Timeline display with search and navigation
- Event sourcing architecture (append-only log)
- localStorage persistence + JSON import/export
- Gemini 2.5 Flash integration with streaming
- Mock forecaster for testing
- Comprehensive test suite (196 unit tests + E2E tests)
- Zod-based type system (single source of truth)

⚠️ **In Progress:**
- Cassette replay system (designed, partially implemented)

❌ **Planned:** (See VISION.md for details)
- Post-game analysis screen
- Hidden news reveal
- Tutorial/onboarding
- PRNG/dice rolling system
- AI Studio Build deployment

---

**For full onboarding:** See [CLAUDE.md](./CLAUDE.md)
