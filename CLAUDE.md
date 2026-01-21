# Claude Code Developer Guide

**Project:** AI Forecasting Web Game - Serious policy simulation for AI x-risk scenarios
**Owner:** Jörn Stöhler
**Tech Stack:** TypeScript, React 18, Vite, Gemini 2.5 Flash, Event Sourcing

---

## Project Overview

This is a serious policy simulation game where players assume the role of the US government and interact with an LLM-based "game master" (powered by Google's Gemini 2.5 Flash) to explore AI governance scenarios through an interactive timeline from 2025 onward.

**Project Structure:**
Monorepo with npm workspaces:
- `packages/webapp/` - React web application
  - `packages/webapp/src/engine/` - Timeline engine (types, validation, forecaster adapters)
  - `packages/webapp/src/engine/test/` - Engine unit tests
  - `packages/webapp/src/components/` - React components
  - `packages/webapp/src/services/` - Business logic and integrations
  - `packages/webapp/tests/` - E2E test suite (Playwright)
- `packages/share-worker/` - Cloudflare Worker for game sharing
- `docs/` - Specifications and design documents
- Root config files (package.json with workspace scripts)

---

## Quick Start

### First Steps
1. **Run hello script:** `bash scripts/hello.sh` - Prints repo map and sanity checks
2. **Set up environment:** Copy `.env.example` to `.env.local` and optionally set `GEMINI_API_KEY`
3. **Install dependencies:** `npm install` (auto-runs on session start)
4. **Start dev server:** `npm run dev`
5. **Run tests:** See [Testing](#testing) section below

### Development Workflow
```bash
# Check everything before committing
npm run check

# Run E2E tests (uses mock forecaster by default)
npm run test:e2e

# Run unit tests only
npm test
```

---

## Architecture Principles

### Event Sourcing
- **Single source of truth:** Append-only event log
- **Reproducible state:** Pure function reduction from events
- **No manual state management:** UI derives from events

### Type Safety
- **Strict TypeScript** throughout
- **Runtime validation** with Zod as single source of truth for all types
- **Zod schema inference** - types derived automatically from validation schemas

### Isomorphic Engine
- Engine runs in browser (webapp) and can be used in Node.js
- Forecaster adapters: browser (Gemini), Node (Gemini), mock, replay
- Same event log format everywhere

---

## Testing

### Test Infrastructure (New!)
Comprehensive E2E test suite added 2026-01-14.

**Quick Test Commands:**
```bash
# Unit tests (~1 second)
npm test

# Smoke test (~10 seconds)
npm run test:e2e -- smoke.spec.ts

# Core features (~30 seconds)
npm run test:e2e -- --grep-invert "UNIMPLEMENTED"

# Full suite including unimplemented feature specs
npm run test:e2e
```

**Mock Forecaster:**
- E2E tests use mock forecaster automatically (via Playwright config)
- For manual dev: set `VITE_USE_MOCK_FORECASTER=true` in `.env.local`
- Mock returns deterministic placeholder events without API calls

**Test Coverage:**
- ✅ Timeline display and navigation
- ✅ Search and filtering
- ✅ Persistence (localStorage + import/export)
- ✅ UI interactions and validation
- ✅ Turn cycle (uses mock forecaster)
- ❌ Unimplemented features (documented as skipped tests)

---

## Code Conventions

### Never Ship Clever Hacks
- Simple, standard, well-known solutions only
- KISS (Keep It Simple, Stupid) and YAGNI (You Aren't Gonna Need It) apply everywhere
- Custom solutions increase complexity exponentially

### Progressive Disclosure
- Triage your own onboarding - read what's relevant to your task
- Documentation lives in code (literate programming style)
- Extra guidance in: `CLAUDE.md`, `docs/`, `E2E-TEST-STATUS.md`

### Aggressively Prune False Information
- **Never** document removed features or previous versions
- Only current state matters
- False or misleading information is worse than no documentation

### No Over-Engineering
- Don't add features beyond what's requested
- Don't refactor code you didn't change
- Don't add error handling for impossible scenarios
- Three lines of code > premature abstraction

---

## Key Files & Documentation

### Essential Reading
- [`PROJECT.md`](./PROJECT.md) - **Complete project overview** (features, tests, vision, development info)
- [`README.md`](./README.md) - Quick start guide
- [`tests/README.md`](./tests/README.md) - Test authoring guide

### Design Documents (`docs/`)
- `cassette-replay.md` - Replay system design (partially implemented)
- `spec-pages.md` - Page/routing structure
- `spec-genai.md` - Gemini API integration
- `spec-scenario-logic.md` - Event sourcing and game rules
- `spec-design.md` - Overall architecture

### Specs for Unimplemented Features
See [`tests/unimplemented-features.spec.ts`](./tests/unimplemented-features.spec.ts) for executable specifications of features not yet built.

---

## Development Environment

Environment is pre-configured with dependencies installed via `npm install`.

### Git Workflow
- **Main branch:** For quick fixes and PM work
- **Feature branches:** For implementing features (create PR)
- Branch naming: `claude/<description>-<session-id>`
- Commit messages: Clear, concise, imperative mood

---

## Working with the Owner

### Jörn Stöhler's Preferences
- **Be direct and literal** - optimize for skimming
- **Use numbered lists** for easy referencing
- **Ask explicit questions** when clarification needed
- **Push back** on unclear requirements or mistakes
- **Use his time wisely** - don't delegate work you can do yourself
- **Appreciate thesis experience** - he knows long-term project management

### Proposed Changes
- Proposals to VISION.md or core docs must be marked `[PROPOSED]`
- Don't overwrite accepted text until Jörn explicitly approves
- Remove `[PROPOSED]` markers only after approval

---

## Common Tasks

### Adding a New Feature
1. Read VISION.md to understand context
2. Check if E2E tests exist (may be skipped/unimplemented)
3. Implement feature following existing patterns
4. Update or un-skip relevant tests
5. Run full test suite before committing
6. Update documentation if needed

### Fixing a Bug
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify test now passes
4. Check no regressions (run full test suite)
5. Commit with clear message

### Improving Tests
1. Review test files for gaps
2. Add tests or un-skip existing tests
3. Update test README if patterns change
4. Mark unimplemented features as `.skip()` with clear comments

### Visual QA and Screenshots
Playwright includes a built-in screenshot command for visual inspection:

```bash
# Start dev server
npm run dev

# Take screenshot (adjust port if needed - check dev server output)
npx playwright screenshot http://localhost:3000/ scratch/screenshot.png

# Options:
npx playwright screenshot \
  --viewport-size=1280,720 \
  --full-page \
  --color-scheme=dark \
  http://localhost:3000/game scratch/game-dark.png
```

**Common use cases:**
- Visual design review before/after CSS changes
- Dark mode verification
- Responsive design checks
- Accessibility visual inspection

**Note:** Playwright uses its own bundled browsers, so this works even without Chrome/Chromium installed.

---

## Technical Details

### Environment Variables
```bash
# Required for Gemini API (production)
GEMINI_API_KEY=your_key_here

# Optional: use mock forecaster (development/testing)
VITE_USE_MOCK_FORECASTER=true
```

### Build Commands
```bash
npm run build              # Build webapp (standard Vite build → dist/)
npm run build:deploy       # Build single-file HTML (386 KB → dist/)
npm run build:ai-studio    # Build AI Studio ZIP (67 KB → ai-studio-deploy.zip)
npm run lint               # Lint all packages
npm run typecheck          # Type check all packages
npm run dev                # Start dev server (webapp)
```

### Deployment Targets

The project has three separate build outputs:

**1. Standard Build (`npm run build`)**
- Output: `packages/webapp/dist/`
- Uses: Vite bundler
- Produces: Minified JavaScript bundles, processed CSS
- For: Traditional web hosting (Netlify, Vercel, etc.)

**2. Single-File Deploy (`npm run build:deploy`)**
- Output: `packages/webapp/dist/index.html` (386 KB)
- Uses: Vite + vite-plugin-singlefile
- Produces: Single HTML file with inlined CSS/JS
- For: Easy distribution, email attachments, offline use

**3. AI Studio Build (`npm run build:ai-studio`)**
- Output: `ai-studio-deploy.zip` (67 KB)
- Uses: Custom script ([scripts/build-ai-studio.js](../scripts/build-ai-studio.js))
- Produces: ZIP with TypeScript source + compiled CSS
- For: [Google AI Studio Build Mode](https://aistudio.google.com) deployment
- **Important:** Must run `npm run build` first to generate compiled CSS

**AI Studio Build Process:**
```bash
# Two-step process required:
npm run build              # 1. Generate compiled CSS in dist/assets/
npm run build:ai-studio    # 2. Package TS source + compiled CSS into ZIP

# The script will error if dist/assets/ doesn't exist
```

**What is AI Studio Build Mode?**
- Web-based platform at [aistudio.google.com](https://aistudio.google.com)
- Allows uploading ZIP files with HTML/TypeScript/React code
- Runs apps using viewers' Gemini API quota (no backend needed)
- See [docs/deployment.md](../docs/deployment.md) for deployment guide

---

## Getting Help

### Resources
- **PROJECT.md** - Feature registry, test status, product vision, development info
- **Code itself** - Literate programming, documentation in code

### Questions?
- Check documentation first (PROJECT.md, docs/)
- Review existing code for patterns
- Ask Jörn directly if ambiguous or blocked

---

## Current State (2026-01-21)

### What Works ✅
- Core gameplay loop (player input → GM response)
- Timeline display with search and navigation
- Event sourcing with localStorage persistence
- Import/export JSON timelines
- Comprehensive E2E test suite
- Mock forecaster integration for testing

### What Needs Work ⚠️
- Cassette replay system (designed, partially implemented)

### What's Not Built ❌
None - all MVP features are complete. See [PROJECT.md](./PROJECT.md) for feature registry and post-MVP roadmap.

---

**Last Updated:** 2026-01-21
**Maintained By:** Claude Code developers
**Owner:** Jörn Stöhler
