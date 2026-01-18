# AI Forecasting Web Game - Project Overview

**Last Updated:** 2026-01-18

**Quick Summary:** Serious policy simulation game where players assume the role of the US government and interact with an LLM-based "game master" (Gemini 2.5 Flash) to explore AI governance scenarios through an interactive timeline from 2025 onward.

**Tech Stack:** TypeScript, React 18, Vite, Event Sourcing, Gemini 2.5 Flash API

---

## Table of Contents

1. [Feature Registry](#feature-registry) - What's built, what's planned
2. [Test Status](#test-status) - Test coverage and infrastructure
3. [Product Vision](#product-vision) - Core experience and constraints
4. [Development Info](#development-info) - How to work on this project

---

# Feature Registry

Single source of truth for all features in the AI Forecasting project.

## Feature Stages Legend

- 🟢 **COMPLETE**: Fully implemented and tested
- 🟡 **IN PROGRESS**: Actively being built (partial implementation)
- 🔵 **READY**: Designed, specified, ready for implementation
- ⚪ **IDEA**: Concept stage, needs design/specification
- 🔴 **DEPRIORITIZED**: Not planned for near-term

---

## Core Gameplay Features

### Event Sourcing Foundation
**Stage:** 🟢 COMPLETE
**Tests:** [src/engine/test/state-consistency.test.ts](src/engine/test/state-consistency.test.ts)
**Docs:** [docs/spec-scenario-logic.md](docs/spec-scenario-logic.md)

Append-only event log with pure function state reduction. All application state derives from events. Enables replay, debugging, and audit trails.

**Implementation:**
- ✅ Event types defined with Zod schemas
- ✅ Type inference from schemas
- ✅ Event validation and coercion
- ✅ Event sorting and deduplication
- ✅ State reduction via `aggregate()` function

**Dependencies:** None (foundation layer)

---

### Turn Cycle (Player → GM → Timeline)
**Stage:** 🟢 COMPLETE
**Tests:** [tests/turn-cycle.spec.ts](tests/turn-cycle.spec.ts)
**Docs:** [docs/spec-genai.md](docs/spec-genai.md)

Core gameplay loop: player submits action → LLM forecaster generates events → timeline updates with consequences.

**Implementation:**
- ✅ Player input form (ComposePanel)
- ✅ Gemini 2.5 Flash integration
- ✅ Streaming event pipeline
- ✅ JSON parsing with error handling
- ✅ Turn markers (`turn-started`, `turn-finished`)
- ✅ Command normalization

**Dependencies:** Event Sourcing, Forecaster Adapters

---

### Timeline Display & Navigation
**Stage:** 🟢 COMPLETE
**Tests:** [tests/timeline.spec.ts](tests/timeline.spec.ts)

Chronological event rendering with expand/collapse, year/month headers, sticky positioning, and visual organization.

**Implementation:**
- ✅ Event rendering with icons
- ✅ Expand/collapse per event
- ✅ Year/month boundary headers (sticky)
- ✅ Scenario head markers
- ✅ Timeline virtualization (for performance)

**Dependencies:** Event Sourcing

---

### Search & Filtering
**Stage:** 🟢 COMPLETE
**Tests:** [tests/search.spec.ts](tests/search.spec.ts)

Case-insensitive search by title and description with highlighting.

**Implementation:**
- ✅ Search input in header
- ✅ Case-insensitive matching
- ✅ Text highlighting (mark tags)
- ✅ Clear search functionality

**Dependencies:** Timeline Display

---

### Data Persistence
**Stage:** 🟢 COMPLETE
**Tests:** [tests/persistence.spec.ts](tests/persistence.spec.ts)

LocalStorage-based persistence with multi-tab sync and corruption handling.

**Implementation:**
- ✅ Auto-save to localStorage (`takeoff-timeline-events-v2`)
- ✅ Multi-tab sync (storage event listener)
- ✅ Corruption fallback to seed events
- ✅ Session recovery after refresh

**Dependencies:** Event Sourcing

---

### Import/Export
**Stage:** 🟢 COMPLETE
**Tests:** [tests/import-export.spec.ts](tests/import-export.spec.ts)

Export timeline as JSON and import with validation and deduplication.

**Implementation:**
- ✅ Export to JSON file (timestamped filename)
- ✅ Import with Zod validation
- ✅ Event deduplication on import
- ✅ Confirmation prompt before replacement
- ✅ Error handling with user feedback

**Dependencies:** Event Sourcing

---

### Forecaster Adapters
**Stage:** 🟢 COMPLETE
**Tests:** [src/engine/test/command-normalization.test.ts](src/engine/test/command-normalization.test.ts)
**Docs:** [docs/spec-genai.md](docs/spec-genai.md)

Multiple forecaster implementations: browser Gemini, Node Gemini, mock, and replay.

**Implementation:**
- ✅ Browser Gemini adapter (GoogleGenerativeAI SDK)
- ✅ Node Gemini adapter (for CLI/scripts)
- ✅ Mock forecaster (returns deterministic placeholder)
- ✅ Streaming pipeline with JSON parsing
- ✅ Error handling and retries

**Dependencies:** None (orthogonal to gameplay)

---

### Basic Telemetry
**Stage:** 🟢 COMPLETE
**Tests:** Verified in turn-cycle tests

Records `news-opened` and `news-closed` events when users expand/collapse events.

**Implementation:**
- ✅ Event capture in EventItem component
- ✅ Events logged to event stream
- ✅ Timestamped telemetry events

**Dependencies:** Timeline Display

---

### Materials System (Minimal)
**Stage:** 🟢 COMPLETE
**Tests:** [src/engine/test/materials.test.ts](src/engine/test/materials.test.ts)
**Docs:** Materials loaded in [src/engine/data/materials.ts](src/engine/data/materials.ts)

Single static material bundle providing context for the GM.

**Implementation:**
- ✅ Material bundle type definition
- ✅ Single bundle: "Expert Model of X-Risk from Artificial Superintelligence" (17KB)
- ✅ Materials injection into GM prompt
- ✅ Provenance metadata

**Dependencies:** None (orthogonal to gameplay)

---

### E2E Test Suite
**Stage:** 🟢 COMPLETE
**Tests:** [tests/](tests/)
**Docs:** [tests/README.md](tests/README.md)

Comprehensive Playwright test suite covering core features.

**Implementation:**
- ✅ 113 passing tests (smoke, timeline, search, persistence, import-export, turn-cycle with turn markers, cassette-replay)
- ✅ 61 skipped tests (unimplemented feature specs)
- ✅ Mock forecaster integration
- ✅ Cassette replay system with fixtures
- ✅ Screenshots/traces on failure (2026-01-18)
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)

**Dependencies:** Mock Forecaster, Cassette Replay

---

### Cassette Replay System
**Stage:** 🟢 COMPLETE (2026-01-18)
**Tests:** [src/engine/test/replay.test.ts](src/engine/test/replay.test.ts), [tests/cassette-replay.spec.ts](tests/cassette-replay.spec.ts)
**Docs:** [docs/cassette-replay.md](docs/cassette-replay.md)

Record/replay LLM API interactions for deterministic testing without API calls.

**Implementation:**
- ✅ Replay client implementation
- ✅ Recording client wrapper
- ✅ Tape format with nanosecond delays
- ✅ Request matching (method + body)
- ✅ Unit tests (2/2 passing)
- ✅ E2E tests (9/9 passing)
- ✅ Hand-written fixture ([basic-turn.json](tests/fixtures/replays/basic-turn.json))
- ✅ Recording script ([record-fixture.ts](scripts/record-fixture.ts))

**Usage:**
```bash
# Record new fixture (requires GEMINI_API_KEY)
npx tsx scripts/record-fixture.ts [fixture-name]

# Tests automatically use fixtures
npm run test:e2e -- cassette-replay.spec.ts
```

**Dependencies:** None (orthogonal to gameplay)

---

### Turn Markers (Visual UI)
**Stage:** 🟢 COMPLETE (2026-01-18)
**Tests:** [tests/turn-cycle.spec.ts](tests/turn-cycle.spec.ts)

Visual boundaries showing player and GM turns in timeline.

**Implementation:**
- ✅ `turn-started` and `turn-finished` event types
- ✅ Events created and logged during turns
- ✅ Visual UI boundaries with actor and date range display
- ✅ Color-coded markers (blue for player, amber for GM)
- ✅ Chronological positioning in timeline
- ✅ E2E tests verify markers (33/33 passing)

**Visual Design:**
- Horizontal separator with rounded indicator
- Emoji icons (👤 for player, 🎲 for GM)
- Date range display (from → until)
- Styled consistently with other timeline markers

**Future Enhancements (not implemented):**
- Turn navigation controls (prev/next turn buttons)
- Turn summary/segmentation

**Dependencies:** Timeline Display (complete ✅)

---

## Partially Implemented Features

---

### Hidden News System
**Stage:** 🟡 IN PROGRESS (Schema only)
**Blockers:** Needs Post-Game Screen implementation
**Tests:** [tests/unimplemented-features.spec.ts:10-40](tests/unimplemented-features.spec.ts)

GM can publish hidden events revealed only after game ends. Teaches forecasting under uncertainty.

**Implementation Status:**
- ✅ Command/event types (`publish-hidden-news`, `hidden-news-published`)
- ✅ Streaming pipeline support
- ✅ System prompt documentation
- ✅ Event normalization
- ❌ No UI filtering during gameplay
- ❌ No post-game reveal mechanism
- ❌ No special styling for revealed events

**Next Steps:**
1. Filter hidden events from timeline during gameplay
2. Implement post-game reveal (depends on Post-Game Screen)
3. Add visual styling for revealed events

**Dependencies:** Post-Game Screen (for reveal)

---

### Telemetry Aggregation
**Stage:** 🟡 IN PROGRESS (Raw events only)
**Blockers:** Need aggregation logic and GM prompt integration

Aggregate telemetry data to inform GM pacing and content generation.

**Implementation Status:**
- ✅ `news-opened` and `news-closed` events recorded
- ✅ Events stored in event log
- ❌ No aggregation/compression
- ❌ No "attention metrics" calculation (e.g., which events player read)
- ❌ No prompt projection filtering
- ❌ No GM pacing based on telemetry

**Next Steps:**
1. Aggregate telemetry into attention metrics
2. Filter/summarize for GM prompt
3. Adjust GM pacing based on player engagement

**Dependencies:** Basic Telemetry (complete ✅)

---

## Unimplemented Features

### Post-Game Analysis Screen
**Stage:** 🔵 READY
**Tests:** [tests/unimplemented-features.spec.ts:10-50](tests/unimplemented-features.spec.ts)

After `game-over` event, show GM analysis with interactive Q&A and hidden news reveal.

**Implementation Readiness:**
- ✅ Executable test specs written (6 tests)
- ✅ `game-over` event type defined
- ✅ Forecaster Q&A pattern known (similar to turn cycle)
- ❌ Needs route/page structure decision
- ❌ Needs post-game UI design

**Features:**
- Game-over event trigger
- GM analysis display
- Interactive Q&A with forecaster
- Hidden news reveal
- Share/copy functionality
- Return to timeline navigation

**Dependencies:** Hidden News System (for reveal feature)

---

### PRNG & Dice Rolling
**Stage:** 🔵 READY
**Tests:** [tests/unimplemented-features.spec.ts:52-80](tests/unimplemented-features.spec.ts)

Deterministic randomness for GM decision-making.

**Implementation Readiness:**
- ✅ Test specs written (4 tests)
- ❌ PRNG state not in event log yet
- ❌ System prompt doesn't enforce dice rolls
- ❌ No UI for viewing rolls (advanced mode)

**Features:**
- PRNG state in event log
- Percentile rolls for GM turns
- Roll visibility in advanced view
- Initial scenario randomization

**Next Steps:**
1. Add PRNG state to event schema
2. Update system prompt to use dice rolls
3. Add UI toggle for advanced view

**Dependencies:** Event Sourcing (schema update needed)

---

### Tutorial/Onboarding
**Stage:** 🔵 READY
**Tests:** [tests/unimplemented-features.spec.ts:82-110](tests/unimplemented-features.spec.ts)

First-time user experience and game mechanic explanations.

**Implementation Readiness:**
- ✅ Test specs written (5 tests)
- ❌ No first-time detection logic
- ❌ No tutorial UI components

**Features:**
- First-time user detection (localStorage flag)
- Tutorial prompts with dismissal
- Game mechanic explanations
- UI hints/tooltips
- Help menu

**Dependencies:** None (orthogonal)

---

### Settings & Dark Mode
**Stage:** 🔵 READY
**Tests:** [tests/unimplemented-features.spec.ts:112-150](tests/unimplemented-features.spec.ts)

User preferences and dark mode toggle.

**Implementation Readiness:**
- ✅ Test specs written (8 tests)
- ❌ No settings panel
- ❌ No dark mode CSS

**Features:**
- Dark mode toggle
- Settings panel
- Preference persistence (localStorage)
- Accessibility options

**Dependencies:** None (orthogonal)

---

### Keyboard Navigation & Accessibility
**Stage:** 🔵 READY
**Tests:** Partially covered in unimplemented features

Full keyboard support and accessibility enhancements.

**Features:**
- Keyboard-accessible event expand/collapse
- Focus indicators
- ARIA labels on interactive elements
- Screen reader support
- Keyboard shortcuts

**Dependencies:** Timeline Display

---

### Materials Dynamic Selection
**Stage:** 🔵 READY
**Tests:** [tests/unimplemented-features.spec.ts:152-170](tests/unimplemented-features.spec.ts)

Algorithmic selection of relevant materials for GM context.

**Implementation Readiness:**
- ✅ Test specs written (3 tests)
- ✅ Material bundle infrastructure exists
- ❌ Only one static bundle available
- ❌ No selection algorithm

**Features:**
- Multiple material bundles
- Algorithmic relevance filtering
- Dynamic material injection
- Dev-mode metadata visibility

**Dependencies:** None (orthogonal)

---

### AI Studio Build Deployment
**Stage:** ⚪ IDEA
**Tests:** [tests/unimplemented-features.spec.ts:172-190](tests/unimplemented-features.spec.ts)
**Docs:** [docs/deployment.md](docs/deployment.md)

Deploy to Google AI Studio Build with per-user API key injection.

**Features:**
- Per-user API key injection
- Deployment smoke checklist
- Free API budget allocation
- AI Studio Build integration

**Dependencies:** None (deployment infrastructure)

---

### Performance Optimization
**Stage:** ⚪ IDEA
**Tests:** [tests/unimplemented-features.spec.ts:192-210](tests/unimplemented-features.spec.ts)

Performance enhancements for large timelines.

**Features:**
- Large timeline virtualization (100+ events)
- Search performance optimization
- Bundle size tracking
- Lazy loading

**Dependencies:** Timeline Display

---

### Telemetry Server
**Stage:** ⚪ IDEA
**Tests:** [tests/unimplemented-features.spec.ts:212-230](tests/unimplemented-features.spec.ts)

Optional telemetry upload and cloud save/sync.

**Features:**
- Optional telemetry upload
- Cloud save/sync functionality
- Privacy controls
- Usage analytics

**Dependencies:** Basic Telemetry

---

### Scenario Branching
**Stage:** 🔴 DEPRIORITIZED
**Tests:** [tests/unimplemented-features.spec.ts:232-250](tests/unimplemented-features.spec.ts)

Save points and timeline branching.

**Rationale:** Jörn says "feels boring" compared to other features. Save points add complexity without clear user value. Linear narrative is sufficient for MVP.

**Features:**
- Save point system
- Timeline branching visualization
- Branch navigation

**Dependencies:** Event Sourcing

---

## Feature Dependencies Graph

```
Foundation Layer (all complete ✅)
├─ Event Sourcing
├─ Type System (Zod schemas)
└─ Forecaster Adapter Interface

Core Gameplay (all complete ✅)
├─ Turn Cycle
├─ Timeline Display
├─ Search & Filter
└─ Persistence (localStorage + import/export)

Testing Infrastructure (partial ⚠️)
├─ E2E Test Suite ✅
├─ Mock Forecaster ✅
└─ Cassette Replay 🟡 (70% done - needs fixtures)

Advanced Features (not started ❌)
├─ Post-Game Screen 🔵 READY
│  └─ depends on: Hidden News (reveal)
├─ Hidden News 🟡 IN PROGRESS
│  └─ depends on: Post-Game Screen (for reveal UI)
├─ PRNG/Dice 🔵 READY
│  └─ depends on: Schema update, GM prompt changes
├─ Telemetry Aggregation 🟡 IN PROGRESS
│  └─ depends on: Basic Telemetry ✅
└─ Materials Dynamic Selection 🔵 READY
   └─ depends on: Nothing (orthogonal)

UX/Settings (independent ❌)
├─ Dark Mode 🔵 READY
├─ Tutorial/Onboarding 🔵 READY
├─ Accessibility 🔵 READY
└─ Keyboard Navigation 🔵 READY

Deployment & Infrastructure (⚪ ideas)
├─ AI Studio Build ⚪ IDEA
├─ Performance Optimization ⚪ IDEA
└─ Telemetry Server ⚪ IDEA
```

---

## Feature History & Context

### Why Event Sourcing?
**Rationale:** Simplifies state management, enables replay/debug, provides audit trail. Eliminates need for complex React state management.
**Decision Date:** Initial architecture (Nov 2024)
**Owner:** Jörn Stöhler

### Why Hidden News?
**Rationale:** Teaches forecasting under uncertainty. Players can't adjust strategy based on unknowable events. Core pedagogical mechanic.
**Decision Date:** Core game mechanic (Nov 2024)
**Owner:** Jörn Stöhler

### Why Gemini 2.5 Flash?
**Rationale:** Fast inference, good quality/cost ratio, streaming support, Google partnership potential.
**Decision Date:** Initial architecture (Nov 2024)
**Owner:** Jörn Stöhler

### Why Cassette Replay?
**Rationale:** Deterministic testing without API costs. Enable CI without API keys. Reproducible bug reports.
**Decision Date:** 2026-01-14 (test infrastructure sprint)
**Status:** Partially implemented, not blocking other work

### Why Deprioritize Scenario Branching?
**Rationale:** Jörn says "feels boring" compared to other features. Save points add complexity without clear user value. Linear narrative is sufficient for MVP.
**Decision Date:** VISION.md note
**Status:** 🔴 DEPRIORITIZED

### Why LocalStorage First?
**Rationale:** Client-first architecture, no backend needed for MVP, instant persistence, works offline.
**Decision Date:** Initial architecture (Nov 2024)
**Owner:** Jörn Stöhler

---

# Test Status

## Test Coverage Overview

- ✅ **113 passing tests** - Core gameplay, persistence, UI interactions, turn markers
- ⚠️ **61 skipped tests** - Unimplemented features (executable specs)
- 🧪 **Mock forecaster** - Enables testing without API calls

## Test Files

### Core Feature Tests (Passing)

1. **`smoke.spec.ts`** (3 tests) - App loads without errors (multi-browser)
2. **`timeline.spec.ts`** (24 tests) - Timeline display and navigation (multi-browser)
3. **`search.spec.ts`** (18 tests) - Search and filtering (multi-browser)
4. **`persistence.spec.ts`** (21 tests) - LocalStorage persistence and sync (multi-browser)
5. **`import-export.spec.ts`** (24 tests) - JSON import/export (multi-browser)
6. **`turn-cycle.spec.ts`** (32 tests) - Full GM turn cycle, turn markers with visual UI (multi-browser, 1 flaky timeout)
7. **`error-handling.spec.ts`** (9/18 passing) - Input validation and error scenarios
8. **`cassette-replay.spec.ts`** (9 tests) - Cassette replay system (2026-01-18)

### Unimplemented Feature Tests (Skipped)

8. **`unimplemented-features.spec.ts`** (61 tests, ALL SKIPPED)

Documents requirements for features not yet built:
- Post-Game Analysis (6 tests)
- Hidden News System (2 tests)
- Tutorial/Onboarding (5 tests)
- Materials System (3 tests)
- PRNG/Dice Rolling (4 tests)
- AI Studio Build (3 tests)
- Cassette Replay (4 tests)
- Advanced Telemetry (3 tests)
- Settings & Accessibility (8 tests)
- Performance (3 tests)

## Test Statistics

**Total tests:** 174 (E2E) + 196 (unit) = 370
**Passing:** 113 (E2E) + 196 (unit) = 309 (84%)
**Skipped:** 61 (E2E unimplemented feature specs)
**Confidence Level:** HIGH - Can replace most manual testing

## How to Run Tests

```bash
# Unit tests (196 tests, ~1 second)
npm test

# Smoke test (~10 seconds)
npm run test:e2e -- smoke.spec.ts

# Core features (~30 seconds)
npm run test:e2e -- --grep-invert "UNIMPLEMENTED"

# Full suite including unimplemented feature specs
npm run test:e2e
```

## Test Infrastructure

### Mock Forecaster
- E2E tests use mock forecaster automatically (via Playwright config)
- For manual dev: set `VITE_USE_MOCK_FORECASTER=true` in `.env.local`
- Mock returns deterministic placeholder events without API calls

### Cassette Replay (Partial)
- Infrastructure exists (70% complete)
- No fixture recordings yet
- See [docs/cassette-replay.md](docs/cassette-replay.md) for design

## Next Steps

1. **Add Cassette Replay Fixtures** - Record real API interactions for deterministic testing
2. **Un-skip Tests as Features Land** - Remove `.skip()` when implementing features
3. **Add to CI Pipeline** - Run passing tests on PR, smoke tests on push

---

# Product Vision

## Product Goal

Serious policy simulation game where the player alternates turns with an LLM-based forecaster that consults expert-curated and expert-written background material and instructions for the game.

**Deployment:** Static Vite/React SPA, client-only storage, deployable to AI Studio Build for wide audience access.

## Core Player Experience

### Game Flow

1. **Setup**: Player starts a new game with opt-out low-overhead tutorial messages for first-timers
2. **Read & Think**: Player reads through presented scenario state and history
3. **Make Decisions**: Player makes decisions via UI (editable text, toggles, all reversible until submitted)
4. **End Turn**: Player submits decisions, which become locked
5. **GM Processes**: LLM forecaster processes turn and updates scenario state/history
6. **Repeat**: Alternating turns continue
7. **Post-Game**: When forecaster declares game-over, transition to post-game analysis screen

### GM Turn Processing

- LLM receives generated prompt and streams back text output
- Output parsed into semantically meaningful commands
- Commands executed by simple flexible scenario engine
- UI updates as commands stream in
- **Intended pacing**: ~6 months of in-world time per GM turn, 1-5 key events

### Technical Architecture

**React Pattern:**
- UI = pure function of state
- State = reduced by commands/events
- Commands generated by player actions and LLM forecaster

**Event Sourcing:**
- Record all commands in append-only log
- Reduce log to get current state
- LLM prompt is filtered/optimized projection of state
- Event log can be "chatty", prompt must be "calm"

### Game Phases

1. **Initial Setup** - New game
2. **Alternating Turns** - Player ↔ GM
3. **Post-Game Screen** - GM analysis, hidden news reveal, interactive Q&A

### Post-Game Features

- GM analysis consulting extra materials
- Previously hidden notes and secret scenario knowledge revealed
- Interactive Q&A with GM (chat-style)
- Copy/share results for social media

## Domain Focus

### General Engine

The engine is domain-agnostic. All domain logic lives in materials provided to the LLM forecaster.

**Analogy:** We manufacture a table with figurines, a paintable map, and an empty notepad. The LLM forecaster uses these materials along with rulebooks to deliver a useful policy simulation.

### Material Bundles

- **Simple bundle**: Toy domain for testing/demoing/prototyping (faster, clearer feedback)
- **Complex bundle**: AI x-risk forecasting (exponential progress, alien minds, 6-month doubling times)

### Materials Selection

Materials inclusion is **algorithmic/deterministic**, not a player-facing picker feature. MVP includes everything; later versions may filter to relevant subsets.

## Replayability

**Non-determinism sources:**
- LLM forecaster output varies
- PRNG (pseudo-random number generator) managed by engine
- Initial randomness via material bundle variations

**PRNG Usage:**
- Engine state contains PRNG state and last rolled value
- GM uses PRNG for capability progress, diplomatic outcomes, etc.
- Example prompt injection: "After the next 6 months, total AI capability growth has fallen into the 76th percentile..."

## Deployment & Sharing

### Deployment
- Deploy via AI Studio Build
- Anyone can play in browser without installation
- Free LLM API budget for all players (no API keys or payment needed)

### Sharing
- Players can download/upload save files
- Transfer between devices
- **Maybe**: Google Drive integration
- **Maybe**: Telemetry server (opt-out, no fingerprinting, used for data analysis)

## Settings

Minimal settings to avoid overcomplication:
- Dark/light mode
- Maybe: audio toggle
- Maybe: font size toggle
- Focus on good ergonomic defaults

Target audience: anyone interested in policy and AI x-risk (not just tech people)

## Hard Constraints

- Static web app first (Vite/React SPA); no mandatory backend
- Client-only storage by default (local-first); sharing via import/export unless expanded
- Deployable to AI Studio Build for wide audience access
- "Serious policy sim" tone: optimize for clarity, interpretability, and consistent rules over novelty
- Single source of truth for scenario seed events and materials across frontends

---

# Development Info

## Quick Start

```bash
# Check everything
bash scripts/hello.sh

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test                  # Unit tests (196 tests)
npm run test:e2e         # E2E tests (83 passing)
npm run check            # Type check + lint + tests
```

## Environment Variables

```bash
# Required for Gemini API (production)
GEMINI_API_KEY=your_key_here

# Optional: use mock forecaster (development/testing)
VITE_USE_MOCK_FORECASTER=true
```

## Project Structure

Flat single-package structure (all code at root level):
```
/
├── src/                    # React application
│   ├── engine/            # Timeline engine (types, validation, adapters)
│   ├── engine/test/       # Engine unit tests (196 tests)
│   ├── components/        # React components
│   └── services/          # Business logic and integrations
├── tests/                 # E2E test suite (Playwright)
├── docs/                  # Specifications and design documents
└── [config files]         # tsconfig.json, vite.config.ts, etc.
```

## Code Conventions

### Never Ship Clever Hacks
- Simple, standard, well-known solutions only
- KISS and YAGNI apply everywhere
- Custom solutions increase complexity exponentially

### No Over-Engineering
- Don't add features beyond what's requested
- Don't refactor code you didn't change
- Don't add error handling for impossible scenarios
- Three lines of code > premature abstraction

### Aggressively Prune False Information
- Never document removed features or previous versions
- Only current state matters
- False or misleading information is worse than no documentation

## Key Files

### Essential Reading
- **PROJECT.md** (this file) - Feature registry, test status, product vision
- [README.md](README.md) - Quick start guide
- [CLAUDE.md](CLAUDE.md) - Developer guide for agents

### Design Documents
- [docs/cassette-replay.md](docs/cassette-replay.md) - Replay system design
- [docs/spec-pages.md](docs/spec-pages.md) - Page/routing structure
- [docs/spec-genai.md](docs/spec-genai.md) - Gemini API integration
- [docs/spec-scenario-logic.md](docs/spec-scenario-logic.md) - Event sourcing rules
- [docs/spec-design.md](docs/spec-design.md) - Overall architecture

### Test Documentation
- [tests/README.md](tests/README.md) - Test authoring guide
- [tests/unimplemented-features.spec.ts](tests/unimplemented-features.spec.ts) - Executable feature specifications

## Working with Jörn (Project Owner)

- **Be direct and literal** - optimize for skimming
- **Use numbered lists** for easy referencing
- **Ask explicit questions** when clarification needed
- **Push back** on unclear requirements or mistakes
- **Use his time wisely** - don't delegate work you can do yourself

## Common Tasks

### Adding a New Feature
1. Check PROJECT.md for feature status and dependencies
2. Check if E2E tests exist (may be skipped/unimplemented)
3. Implement feature following existing patterns
4. Update or un-skip relevant tests
5. Run full test suite before committing

### Fixing a Bug
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify test now passes
4. Check no regressions (run full test suite)
5. Commit with clear message

---

**Last Updated:** 2026-01-18
**Maintained By:** Claude Code developers
**Owner:** Jörn Stöhler
