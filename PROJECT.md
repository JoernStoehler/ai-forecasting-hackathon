# AI Forecasting Web Game - Project Overview

**Last Updated:** 2026-01-21 (Share game feature, monorepo restructure)

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

## Feature Tracking Workflow

**We use PROJECT.md (not GitHub Issues) for feature tracking.**

### For Autonomous Agent Work:
1. Read PROJECT.md to identify next feature (look for 🔵 READY or 🟡 IN PROGRESS)
2. Check test specs in `tests/unimplemented-features.spec.ts` for requirements
3. Implement feature following existing patterns
4. Update PROJECT.md in same PR:
   - Change status emoji (🟡 → 🟢 or 🔵 → 🟢)
   - Add completion date
   - Update implementation checklist
5. Commit: `"feat: implement X, mark complete in PROJECT.md"`

### Why PROJECT.md instead of GitHub Issues?
- ✅ Agents can read it directly (no API keys or rate limits)
- ✅ Single source of truth lives with code
- ✅ Atomic updates (code + status in same PR)
- ✅ Version controlled (see feature evolution over time)
- ✅ Lower overhead for agent-driven development

### Handling Merge Conflicts
If multiple PRs update PROJECT.md simultaneously:
- Features are in separate sections → clean merge
- Conflict resolution: keep correct status for each feature
- Rare occurrence due to independent features

### Task Classification: Agent vs Domain Expert

**🤖 Agent/Developer Tasks** (technical/engineering):
- UI/UX implementation
- State management and data flow
- API integration and service layer
- Testing infrastructure
- Build and deployment configuration
- Accessibility and keyboard navigation
- Dark mode and theming
- Performance optimization

**👤 Domain Expert Tasks** (requires specialized knowledge):
- ⚠️ **AI x-risk material content**: Requires deep understanding of AI safety, alignment research, governance proposals, threat models (e.g., List of Lethalities, technical alignment proposals, policy frameworks)
- ⚠️ **Scenario event authoring**: Creating realistic, expert-vetted timeline events that reflect actual AI governance dynamics
- ⚠️ **Material bundle curation**: Selecting and organizing background materials that inform the GM's forecasting

**🔀 Hybrid Tasks** (collaboration required):
- Initial scenario design (expert provides content, agent implements structure)
- GM prompt engineering (expert provides domain framing, agent implements technical integration)
- Post-game analysis features (expert defines pedagogical goals, agent builds UI)

**CRITICAL**: Agents should NOT attempt to create substantive AI x-risk content. The current materials are infrastructure placeholders only. Real content requires someone who has deeply studied the field.

---

## Development Backlog (Sequential MVP Roadmap)

**Status:** 🎯 **MVP DEVELOPMENT IN PROGRESS**

This section defines the sequential order for implementing MVP features. Work through these in order, marking each complete before moving to the next.

### MVP Must-Haves (Launch Blockers)

1. **Prompt Projection Logic** - 🟢 COMPLETE (2026-01-18)
   - Filter/compress event log for GM prompt
   - Telemetry aggregation, hidden news marking
   - See: [Prompt Projection & Telemetry Aggregation](#prompt-projection--telemetry-aggregation)

2. **Pre-Game Menu & Setup UI** - 🟢 COMPLETE (2026-01-18)
   - Routing structure, menu page, game initialization
   - MVP: Single scenario, Continue/New Game flow
   - See: [Pre-Game Menu & Setup UI](#pre-game-menu--setup-ui)

3. **Post-Game Screen + Hidden News Completion** - 🟢 COMPLETE (2026-01-18)
   - Core pedagogical mechanic (teaches forecasting under uncertainty)
   - Tightly coupled features (implement together)
   - See: [Post-Game Analysis Screen](#post-game-analysis-screen) + [Hidden News System](#hidden-news-system)

4. **Tutorial/Onboarding** - 🟢 COMPLETE (2026-01-18)
   - Policy experts need guidance
   - Explains game mechanics, terminology, player role
   - See: [Tutorial/Onboarding](#tutorialonboarding)

5. **PRNG Integration** - 🟢 COMPLETE (2026-01-18)
   - Deterministic dice rolls via commands
   - GM requests percentile rolls for variability
   - See: [PRNG & Dice Rolling](#prng--dice-rolling)

6. **Dark Mode & Settings** - 🟢 COMPLETE (2026-01-18)
   - Professional polish for expert audience
   - Font size for accessibility
   - See: [Settings & Dark Mode](#settings--dark-mode)

7. **Accessibility & Keyboard Navigation** - 🟢 COMPLETE (2026-01-18)
   - Policy experts may rely on assistive tech
   - Full keyboard support, ARIA labels
   - See: [Keyboard Navigation & Accessibility](#keyboard-navigation--accessibility)

8. **Deployment to AI Studio Build** - 🔵 READY, ⚠️ ESSENTIAL
   - Primary deployment path using Google AI Studio Build
   - User quota model (viewers use their own AI Studio quota)
   - Multi-file project support via ZIP upload to agent
   - See: [AI Studio Build Deployment](#ai-studio-build-deployment)

### Post-MVP Nice-to-Haves

9. **Dashboard/LineChart System** - ⚪ IDEA
   - Visual charts (GDP, AI capabilities)
   - GM generates LineChart commands
   - See: [Dashboard & Visualizations](#dashboard--visualizations)

10. **LLM Assistant** - ⚪ IDEA
    - Player-facing AI helper
    - Chat overlay, sees public info only
    - See: [LLM Assistant](#llm-assistant)

11. **Sound Design** - ⚪ IDEA
    - Audio feedback and ambiance
    - See: [Sound Design](#sound-design)

12. **Materials Expansion** - ⚪ IDEA, 👤 **REQUIRES DOMAIN EXPERT**
    - Additional material bundles with substantive content
    - Variations on X-risk models
    - **This is content work, not engineering**
    - See: [Materials Dynamic Selection](#materials-dynamic-selection)

### Ongoing Polish Work

- **Visual Aesthetics** - Iterative improvements (focus on content, modern/serious tone)
- **Writing Style** - Content editing for clarity and tone
- **Performance** - Only if issues arise with large timelines

---

## MVP Status Summary

**Technical Development**: ✅ **COMPLETE** (7/7 MVP features)
- All core gameplay features implemented
- Full keyboard navigation and accessibility
- Dark mode with persistence
- Tutorial/onboarding system
- E2E test suite with 234 unit tests passing

**Remaining for Launch**: ⚠️ **2 BLOCKERS**

### 1. Deployment (Infrastructure Task)
**Status**: 🔵 READY - Technical but not coding
- Deploy to AI Studio Build platform (primary path)
- Verify per-user quota attribution (AI Studio proxy)
- Test share link in production environment
- **Owner**: Can be done by technical person with Google AI Studio access
- **See:** [docs/deployment.md](docs/deployment.md) for step-by-step guide

### 2. Material Content (Domain Expert Task)
**Status**: ⚠️ **CONTENT GAP** - Requires domain expertise
- Current: ~500 bytes of placeholder guidance
- Needed: Substantive expert-curated AI x-risk materials
- Topics: Threat models, alignment proposals, governance frameworks, historical precedents
- **Owner**: Must be done by someone with deep AI safety/governance expertise
- **Note**: App is technically functional but GM responses will lack expert grounding without this content

**Launch Options**:
1. **Soft launch** with placeholder materials (GM relies on base model knowledge)
2. **Full launch** after materials authored by domain expert
3. **Hybrid** - Deploy for testing, gather feedback, improve materials iteratively

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
**Tests:** [tests/import-export.spec.ts](packages/webapp/tests/import-export.spec.ts)

Export timeline as JSON and import with validation and deduplication.

**Implementation:**
- ✅ Export to JSON file (timestamped filename)
- ✅ Import with Zod validation
- ✅ Event deduplication on import
- ✅ Confirmation prompt before replacement
- ✅ Error handling with user feedback

**Dependencies:** Event Sourcing

---

### Share Game
**Stage:** 🟢 COMPLETE (2026-01-21)
**Files:** [ShareButton.tsx](packages/webapp/src/components/ShareButton.tsx), [SharedGameModal.tsx](packages/webapp/src/components/SharedGameModal.tsx), [shareService.ts](packages/webapp/src/services/shareService.ts)

Share game state via URL links and Twitter.

**Implementation:**
- ✅ Cloudflare Worker for storing shared games (`packages/share-worker/`)
- ✅ KV storage with 30-day TTL
- ✅ ShareButton component with copy link and Twitter sharing
- ✅ SharedGameModal for loading shared games via `?share=<id>` URL
- ✅ Options to view timeline, continue playing, or start fresh
- ✅ CORS allows all origins (game can run from any host)

**Worker URL:** https://share-worker.joern-stoehler.workers.dev

**Dependencies:** None (orthogonal)

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
**Stage:** 🟡 INFRASTRUCTURE COMPLETE, ⚠️ CONTENT PLACEHOLDER
**Tests:** [src/engine/test/materials.test.ts](src/engine/test/materials.test.ts)
**Docs:** Materials loaded in [src/engine/data/materials.ts](src/engine/data/materials.ts)

Material bundle infrastructure with minimal placeholder content.

**Implementation:**
- ✅ Material bundle type definition
- ✅ Materials injection into GM prompt
- ✅ Provenance metadata system
- ✅ HTML comment stripping
- ⚠️ **CONTENT GAP**: Current material is ~500 bytes of lightweight guidance, NOT substantive expert content
- ⚠️ **REQUIRES DOMAIN EXPERT**: Substantial AI x-risk materials need to be authored by someone with deep expertise in the field

**Current Content:** Minimal checklist with 4 axes (Capability Growth, Control & Alignment, Deployment Surface, Crisis Dynamics) and scenario tips

**What's Missing:** Substantive expert-curated background material on AI x-risk (e.g., detailed threat models, technical alignment proposals, governance frameworks, historical precedents)

**Dependencies:** None (orthogonal to gameplay)

---

### E2E Test Suite
**Stage:** 🟢 COMPLETE
**Tests:** [tests/](tests/)
**Docs:** [tests/README.md](tests/README.md)

Comprehensive Playwright test suite covering core features.

**Implementation:**
- ✅ Passing tests (smoke, timeline, search, persistence, import-export, turn-cycle with turn markers, cassette-replay)
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

### Prompt Projection & Telemetry Aggregation
**Stage:** 🟢 COMPLETE (2026-01-18)
**Tests:** [src/engine/test/prompt-projection.test.ts](src/engine/test/prompt-projection.test.ts) (21 tests passing)

Transform chatty event log into calm, focused prompt for GM. Filters/compresses events, aggregates telemetry, marks hidden news for GM visibility.

**Implementation:**
- ✅ Enhanced timeline projection with `isHidden` marking for hidden news
- ✅ Telemetry aggregation (tracks `viewedFirstTime`, `notViewed` per turn)
- ✅ Raw telemetry events (`news-opened`, `news-closed`) filtered from projection
- ✅ Player attention summary included when in active turn
- ✅ Turn-aware tracking (clears between turns)
- ✅ ID generation for news items without explicit IDs
- ✅ Comprehensive unit test coverage (21 tests)

**Projection Structure:**
```
# TIMELINE (JSONL)
{enhanced news events with isHidden field}
{turn markers and structural events}

# PLAYER ATTENTION
{"viewedFirstTime": [...], "notViewed": [...]}

# CURRENT STATE
{"latestDate": "...", "currentTurn": {...}}
```

**Note:** PRNG state integration will be added when PRNG feature (#5 in MVP backlog) is implemented.

**Dependencies:** Basic Telemetry (complete ✅), Event Sourcing (complete ✅)

---

## Unimplemented Features

### Pre-Game Menu & Setup UI
**Stage:** 🟢 COMPLETE (2026-01-18)
**Files:** [src/pages/MenuPage.tsx](src/pages/MenuPage.tsx), [src/App.tsx](src/App.tsx)

Pre-game menu with routing, game initialization, and Continue/New Game flow.

**Features:**
- Main menu screen (Continue vs New Game)
- Scenario picker (initially: "AI X-Risk 2025-2035")
- Start date picker (discrete options per scenario)
- Role picker with descriptions:
  - "US Government Strategist" (set agendas, GM executes details)
  - Potentially other roles in future
- "Start Game" button → initialize event log with chosen setup
- Seed events updated to be scenario-aware

**MVP Scope:**
- Single scenario to start ("AI X-Risk 2025-2035")
- One active game at a time (or persist "last played")
- Simple, clean UI (focus on getting into game quickly)

**Implementation Plan:**
1. Add routing (React Router or similar)
2. Create menu page components
3. Update seed events to accept scenario/date/role parameters
4. Wire up game initialization
5. Write E2E tests for setup flow

**Dependencies:** Event Sourcing (complete ✅)

---

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
**Stage:** 🟢 COMPLETE (2026-01-18)
**Tests:** [src/engine/test/prng.test.ts](src/engine/test/prng.test.ts) (17 tests passing)

Deterministic randomness for GM decision-making via roll-dice commands.

**Implementation:**
- ✅ `roll-dice` command type (LLM requests rolls)
- ✅ `dice-rolled` event type (records roll results)
- ✅ Deterministic PRNG (Mulberry32 algorithm)
- ✅ Seeded rolls based on event log context
- ✅ Percentile rolls (1-100) with optional labels
- ✅ System prompt documentation for GM usage
- ✅ Prompt projection includes dice rolls
- ✅ Streaming pipeline handles roll-dice commands
- ✅ Comprehensive unit test coverage (17 tests)

**How It Works:**
1. GM requests dice roll via `{"type": "roll-dice", "label": "AI capability growth"}`
2. Engine generates deterministic roll based on history + timestamp
3. `dice-rolled` event added to log with roll value (1-100)
4. Subsequent GM prompts include roll results for reference

**PRNG Algorithm:**
- Uses Mulberry32 for fast, deterministic generation
- Seed = hash(eventCount + timestamp + label)
- Ensures reproducibility from same event log state

**Future Enhancements (not implemented):**
- UI toggle for viewing rolls (advanced/debug mode)
- Initial scenario randomization via pre-seeded rolls

**Dependencies:** Event Sourcing (complete ✅), Prompt Projection (complete ✅)

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
**Stage:** 🟢 COMPLETE (2026-01-18)
**Tests:** [tests/unimplemented-features.spec.ts:112-150](tests/unimplemented-features.spec.ts)

User preferences and dark mode toggle.

**Implementation:**
- ✅ useTheme hook with localStorage persistence
- ✅ Dark mode toggle in Header (Moon/Sun icon)
- ✅ Dark mode styles across all pages and components
- ✅ Tailwind dark mode with class strategy
- ✅ Theme state managed in App.tsx

**Features:**
- Dark mode toggle
- Preference persistence (localStorage: 'takeoff-theme')
- Consistent dark/light theme across all pages

**Dependencies:** None (orthogonal)

---

### Keyboard Navigation & Accessibility
**Stage:** 🟢 COMPLETE (2026-01-18)
**Tests:** Partially covered in unimplemented features

Full keyboard support and accessibility enhancements.

**Implementation:**
- ✅ EventItem converted to button (semantic HTML)
- ✅ Keyboard event handlers (Enter/Space) for expand/collapse
- ✅ Visible focus indicators with :focus-visible CSS
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader support with role attributes
- ✅ Dark mode support for all interactive components

**Features:**
- Keyboard-accessible event expand/collapse
- Focus indicators
- ARIA labels on interactive elements
- Screen reader support
- Keyboard shortcuts (Enter/Space)

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
**Stage:** 🔵 READY, ⚠️ ESSENTIAL
**Tests:** [tests/unimplemented-features.spec.ts:172-190](tests/unimplemented-features.spec.ts)
**Docs:** [docs/deployment.md](docs/deployment.md) (step-by-step), [docs/deployment-options.md](docs/deployment-options.md) (research)

Deploy to Google AI Studio Build where viewers use their own Gemini API quota (not developer's).

**Why This Path:**
- Scales to unlimited users without developer cost
- No API key setup for end users (AI Studio login authentication)
- Free for all users (AI Studio free tier)
- Multi-file React/TypeScript projects supported via ZIP upload

**How It Works:**
AI Studio proxies API calls, injecting viewer's credentials for `process.env.GEMINI_API_KEY`. Upload ZIP of source to Build agent, share link, viewers automatically authenticated.

**Alternative:** Traditional hosting (Vercel/Netlify) where users provide their own API keys.

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

### Dashboard & Visualizations
**Stage:** ⚪ IDEA (Post-MVP)
**Priority:** Nice-to-have
**Tests:** Not yet written

GM-generated data visualizations (line charts, metrics) displayed in a dedicated dashboard tab.

**Design Philosophy:**
- KISS: Simple LineChart command type, avoid complicated syntax
- GM decides what to visualize based on player interest
- Client-side rendering, not image generation
- Charts are editable/replaceable by GM via new commands

**Implementation Readiness:**
- ✅ Design clarified (2026-01-18)
- ❌ No chart command types defined
- ❌ No chart rendering infrastructure
- ❌ No dashboard UI tab

**Features:**
- `LineChart` command type with structure:
  ```typescript
  LineChart {
    xlabel: string
    ylabel: string
    title: string
    isLogX: boolean
    isLogY: boolean
    data: Array<{
      color: string
      label: string
      x: number[]
      y: number[]
    }>
  }
  ```
- Chart aggregation in prompt projection (show current charts to GM, not as images)
- Dashboard tab UI with search function
- LineChart rendering (recharts or similar library)
- Chart edit commands (LineChartMerge, replace, delete)

**Use Cases:**
- Global GDP trends
- AI capability scores (US vs China on METR benchmark)
- Geopolitical tension metrics
- Research investment over time

**Implementation Plan:**
1. Define LineChart event/command schema
2. Add chart aggregation to prompt projection
3. Build dashboard tab UI
4. Integrate chart rendering library
5. Update GM system prompt to use charts
6. E2E tests for chart creation/display

**Dependencies:** Prompt Projection (for chart metadata in GM context)

---

### LLM Assistant
**Stage:** ⚪ IDEA (Post-MVP)
**Priority:** Nice-to-have
**Tests:** Not yet written

Second AI agent that helps players understand the game, provides recommendations, and explains terminology.

**Design Philosophy:**
- Player-facing helper (sees public info only, no hidden news)
- Moveable/hideable chat overlay (doesn't obstruct gameplay)
- Always available for consultation
- Uses same Gemini API key as GM

**Implementation Readiness:**
- ✅ Design clarified (2026-01-18)
- ❌ No chat UI components
- ❌ No second forecaster integration
- ❌ No assistant prompt projection

**Features:**
- Chat overlay UI (draggable, collapsible)
- Second Gemini agent with separate context
- Prompt projection imitating player's UI (text-only)
- Chat history with in-game and wall-time timestamps
- Assistant capabilities:
  - Answer questions about game mechanics
  - Explain terminology (AI x-risk, forecasting, etc.)
  - Provide strategy recommendations if asked
  - Rephrase/summarize news items
  - Clarify player options

**Context Restrictions:**
- Assistant sees: public timeline events, player decisions, game state
- Assistant does NOT see: hidden news, GM internal reasoning, future events

**Implementation Plan:**
1. Design assistant system prompt
2. Create chat overlay UI component
3. Build assistant prompt projection (player POV)
4. Integrate second Gemini client
5. Wire up chat message handling
6. Add conversation persistence
7. E2E tests for assistant interactions

**Dependencies:** Prompt Projection (for assistant context), Post-Game Screen (assistant continues in post-game)

---

### Sound Design
**Stage:** ⚪ IDEA (Post-MVP)
**Priority:** Polish (nice-to-have)
**Tests:** Not yet written

Audio feedback and ambient sound to enhance immersion and provide non-visual cues.

**Implementation Readiness:**
- ✅ Concept approved (2026-01-18)
- ❌ No audio assets
- ❌ No audio playback infrastructure
- ❌ No sound toggle in settings

**Features:**
- Event notification sounds (subtle, non-intrusive)
- Turn completion audio cues (player turn end, GM turn end)
- Optional ambient background audio (serious, policy-sim tone)
- Audio toggle in settings panel
- Respect system/browser audio preferences

**Design Considerations:**
- Default: sounds enabled but subtle
- Must not distract from content (serious sim, not arcade game)
- Accessibility: sounds complement visual cues, don't replace them
- Audio assets: royalty-free or commissioned

**Implementation Plan:**
1. Source/create audio assets
2. Build audio playback service
3. Add sound triggers to key events
4. Implement audio toggle in settings
5. Test across browsers
6. User testing for volume/frequency

**Dependencies:** Settings Panel (for audio toggle)

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

Testing Infrastructure (complete ✅)
├─ E2E Test Suite ✅
├─ Mock Forecaster ✅
└─ Cassette Replay ✅

MVP Critical Path (sequential, blocks deployment)
├─ 1. Prompt Projection ✅ COMPLETE (2026-01-18)
│  └─ depends on: Basic Telemetry ✅, Event Sourcing ✅
├─ 2. Pre-Game Menu & Setup ✅ COMPLETE (2026-01-18)
│  └─ depends on: Event Sourcing ✅
├─ 3. Post-Game Screen + Hidden News ✅ COMPLETE (2026-01-18)
│  └─ depends on: Prompt Projection (for hidden news filtering)
├─ 4. Tutorial/Onboarding ✅ COMPLETE (2026-01-18)
│  └─ depends on: Pre-Game Menu (for context-sensitive hints)
├─ 5. PRNG Integration ✅ COMPLETE (2026-01-18)
│  └─ depends on: Prompt Projection (to include PRNG in GM context)
├─ 6. Dark Mode & Settings ✅ COMPLETE (2026-01-18)
│  └─ depends on: Nothing (orthogonal)
├─ 7. Accessibility 🔵 READY (HIGH PRIORITY)
│  └─ depends on: Nothing (orthogonal)
└─ 8. Deployment 🔵 READY ⚠️ ESSENTIAL
   └─ depends on: All above features complete

Post-MVP Nice-to-Haves (not blocking deployment)
├─ Dashboard/LineChart ⚪ IDEA
│  └─ depends on: Prompt Projection (for chart metadata in GM context)
├─ LLM Assistant ⚪ IDEA
│  └─ depends on: Prompt Projection (for assistant context)
├─ Sound Design ⚪ IDEA
│  └─ depends on: Settings Panel (for audio toggle)
├─ Materials Dynamic Selection 🔵 READY
│  └─ depends on: Nothing (orthogonal)
└─ Performance Optimization ⚪ IDEA
   └─ depends on: Timeline Display (if issues arise)

Deprioritized
├─ Scenario Branching 🔴 DEPRIORITIZED
└─ Telemetry Server ⚪ IDEA (post-launch only)
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

### Why Prompt Projection is Essential?
**Rationale:** Event log can be chatty (verbose, noisy), but GM needs calm (filtered, summarized) context. Must filter hidden news, aggregate telemetry, include PRNG state. Without this, GM cannot work properly at scale.
**Decision Date:** 2026-01-18 (roadmap planning session)
**Priority:** Essential foundation work

### Why Pre-Game Setup is MVP?
**Rationale:** Complete user flow requires scenario selection, start date picking, and role selection. Players need context before starting. Currently drops straight into game with hardcoded scenario.
**Decision Date:** 2026-01-18 (roadmap planning session)
**Priority:** MVP requirement for proper UX

### Why Dashboard/LLM Assistant are Post-MVP?
**Rationale:** Nice-to-have enhancements that improve experience but aren't required for core pedagogical loop. Dashboard adds visual appeal, Assistant helps less experienced players. Both can be added after launch.
**Decision Date:** 2026-01-18 (roadmap planning session)
**Priority:** Post-MVP nice-to-haves

### Why Sound Design is Optional?
**Rationale:** Audio enhances immersion but isn't critical for policy simulation. Can be added post-launch based on user feedback. Must remain subtle and serious (not arcade-game style).
**Decision Date:** 2026-01-18 (roadmap planning session)
**Priority:** Polish feature, post-MVP

### Target Audience Considerations
**Audience:** Policy experts and researchers interested in AI x-risk (not just tech people)
**Implications:**
- Tutorial is essential (explain game mechanics, terminology)
- Accessibility is high priority (assistive tech, keyboard nav)
- Dark mode important (long reading sessions)
- Font size options (older professionals)
- Writing must be clear, jargon-free where possible
- Serious/professional aesthetic over flashy/gamified
**Decision Date:** 2026-01-18 (roadmap planning session)

---

# Test Status

## Test Coverage Overview

- ✅ **Passing E2E tests** - Core gameplay, persistence, UI interactions, turn markers
- ⚠️ **Skipped tests** - Unimplemented features (executable specs)
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
9. **`src/engine/test/prompt-projection.test.ts`** (21 tests) - Prompt projection with hidden news marking and telemetry aggregation (2026-01-18)
10. **`src/engine/test/prng.test.ts`** (17 tests) - PRNG dice rolling system (2026-01-18)

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

Run `npm test` and `npm run test:e2e` to get current counts.
**Confidence Level:** HIGH - Can replace most manual testing

## How to Run Tests

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

## Test Infrastructure

### Mock Forecaster
- E2E tests use mock forecaster automatically (via Playwright config)
- For manual dev: set `VITE_USE_MOCK_FORECASTER=true` in `.env.local`
- Mock returns deterministic placeholder events without API calls

### Cassette Replay
- Infrastructure complete (100%)
- Hand-written fixture available for testing
- Recording script available
- See [docs/cassette-replay.md](docs/cassette-replay.md) for design

## Next Steps (Aligned with MVP Backlog)

1. **Follow Development Backlog** - See [Development Backlog](#development-backlog-sequential-mvp-roadmap) for sequential feature order
2. **Un-skip Tests as Features Land** - Remove `.skip()` when implementing features
3. **Write Tests for New Features** - Pre-game menu, prompt projection logic need test specs
4. **Add to CI Pipeline** - Run passing tests on PR, smoke tests on push

---

# Product Vision

## Product Goal

Serious policy simulation game where the player alternates turns with an LLM-based forecaster that consults expert-curated and expert-written background material and instructions for the game.

**Deployment:** Static Vite/React SPA deployed to Google AI Studio Build where users consume their own AI Studio quota (not developer's quota). Traditional hosting (Vercel/Netlify) available as fallback.

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
- Primary: Google AI Studio Build (users consume their own quota via AI Studio proxy)
- Anyone can play in browser without installation
- No API key setup required (users authenticated via AI Studio login)
- Free LLM API budget for all players (AI Studio free tier)
- Fallback: Traditional hosting where users provide their own API keys

### Sharing
- Players can download/upload save files
- Transfer between devices
- **Maybe**: Google Drive integration
- **Maybe**: Telemetry server (opt-out, no fingerprinting, used for data analysis)

## Polish & Aesthetics

**Visual Design Philosophy:**
- Focus attention on content, not chrome
- Modern, clean, professional aesthetic
- Serious policy simulation tone (not gamified or flashy)
- Good ergonomic defaults
- Iterative refinement as features land

**Writing Style:**
- Clear, accessible language
- Explain jargon when necessary
- Direct and literal (optimize for skimming)
- Professional but not academic
- Content editing throughout development

**Ongoing Work:**
- Visual aesthetics improve with each feature
- Writing refined as content is added
- User testing informs both

## Settings

Minimal settings to avoid overcomplication:
- Dark/light mode
- Font size toggle (accessibility)
- Maybe: audio toggle (if sound design added)
- Focus on good ergonomic defaults

Target audience: policy experts and researchers interested in AI x-risk (not just tech people)

## Hard Constraints

- Static web app first (Vite/React SPA); no mandatory backend
- Client-only storage by default (local-first); sharing via import/export
- Primary deployment: Google AI Studio Build (user quota model)
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
npm test                  # Unit tests
npm run test:e2e         # E2E tests
npm run check            # Type check + lint + tests
```

## Environment Variables

```bash
# Required for Gemini API (production)
GEMINI_API_KEY=your_key_here

# Optional: use mock forecaster (development/testing)
VITE_USE_MOCK_FORECASTER=true

# Share worker URL (defaults to production worker)
VITE_SHARE_WORKER_URL=https://share-worker.joern-stoehler.workers.dev
```

## Project Structure

Monorepo with npm workspaces:
```
/
├── packages/
│   ├── webapp/                # React web application
│   │   ├── src/
│   │   │   ├── engine/       # Timeline engine (types, validation, adapters)
│   │   │   ├── components/   # React components
│   │   │   └── services/     # Business logic and integrations
│   │   └── tests/            # E2E test suite (Playwright)
│   └── share-worker/          # Cloudflare Worker for game sharing
│       └── src/index.ts      # KV-based share storage
├── docs/                      # Specifications and design documents
└── [config files]             # Root package.json with workspace scripts
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

**Last Updated:** 2026-01-21 (Share game feature, monorepo restructure)
**Maintained By:** Claude Code developers
**Owner:** Jörn Stöhler
