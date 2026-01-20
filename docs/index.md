---
layout: default
title: Home
---

# AI Forecasting Game

A serious policy simulation where players assume the role of the US government and interact with an AI game master to explore AI governance scenarios through an interactive timeline from 2025 onward.

**Status:** MVP complete - all core gameplay features implemented.

---

## What is this?

This is an educational simulation game designed to help policy experts, researchers, and interested players explore the challenges of AI governance. You make decisions as a government actor while an LLM-powered game master (Gemini 2.5 Flash) responds with plausible consequences, news events, and evolving scenarios.

The game uses event sourcing architecture - every action creates an immutable timeline that you can review, export, and analyze.

---

## Quick Links

- **[Project Vision](vision.md)** - Why this game exists and how to contribute
- **[Developer Quick Start](quickstart.md)** - Set up a local development environment
- **[GitHub Repository](https://github.com/JoernStoehler/ai-forecasting-hackathon)** - Source code and full documentation

---

## For Different Audiences

### Players
The game runs in your browser. You'll need a Gemini API key (free tier available) to play, or use mock mode for testing.

### Developers & Self-Hosters
See the [Quick Start guide](quickstart.md) to run locally. The app is a static React SPA - deploy anywhere that serves static files.

### Researchers & Funders
This project explores how interactive simulation can teach AI governance intuition. See the [Vision page](vision.md) for goals, design philosophy, and how to contribute.

---

## Technical Architecture

- **Frontend:** React 18 + TypeScript + Vite
- **AI Integration:** Google Gemini 2.5 Flash API
- **Data:** Event sourcing with localStorage persistence
- **Testing:** 234+ unit tests, comprehensive E2E suite
- **Deployment:** Static bundle (client-only)

---

## Design Specifications

These technical docs are available for developers:

- [spec-design.md](spec-design.md) - UX skeleton and UI guidelines
- [spec-scenario-logic.md](spec-scenario-logic.md) - Event sourcing model and turn sequence
- [spec-genai.md](spec-genai.md) - Gemini API integration
- [spec-pages.md](spec-pages.md) - Page routing structure
- [deployment.md](deployment.md) - AI Studio Build deployment guide
