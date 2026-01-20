---
layout: default
title: Quick Start
---

# Developer Quick Start

Get the AI Forecasting Game running locally in under 5 minutes.

---

## Prerequisites

- **Node.js 20+** (check with `node --version`)
- **npm** (comes with Node.js)
- **Git**

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/JoernStoehler/ai-forecasting-hackathon.git
cd ai-forecasting-hackathon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` to add your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

**Don't have an API key?** Use mock mode instead:

```
VITE_USE_MOCK_FORECASTER=true
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verify Your Setup

Run the test suite to confirm everything works:

```bash
# Unit tests (fast, ~1 second)
npm test

# E2E tests with mock forecaster (~30 seconds)
npm run test:e2e -- --grep-invert "UNIMPLEMENTED"

# Full validation
npm run check
```

---

## Project Structure

```
src/
├── engine/         # Timeline engine (types, validation, forecaster adapters)
├── components/     # React UI components
├── services/       # Business logic and integrations
└── pages/          # Page components (routes)

tests/              # E2E tests (Playwright)
docs/               # Design specifications
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run check` | Lint + typecheck + test + build |

---

## Next Steps

- **[CLAUDE.md](https://github.com/JoernStoehler/ai-forecasting-hackathon/blob/main/CLAUDE.md)** - Full developer guide with architecture details
- **[PROJECT.md](https://github.com/JoernStoehler/ai-forecasting-hackathon/blob/main/PROJECT.md)** - Feature registry and roadmap
- **[tests/README.md](https://github.com/JoernStoehler/ai-forecasting-hackathon/blob/main/tests/README.md)** - Test authoring guide

---

## Self-Hosting

The app builds to a static bundle with no backend requirements:

```bash
npm run build
```

The `dist/` folder contains everything needed. Serve it from any static file host:
- GitHub Pages
- Netlify / Vercel
- Any web server (nginx, Apache, etc.)

**Note:** Players will need their own Gemini API key (entered in-app) or you can deploy via AI Studio Build for integrated API key management.
