---
layout: default
title: Vision
---

# Project Vision

## Why This Game Exists

AI governance decisions are being made today that will shape the trajectory of advanced AI systems. But the people making these decisions - policymakers, researchers, funders - often lack intuition for how AI development might unfold.

This game is a **serious policy simulation** designed to build that intuition. Players take on the role of the US government and navigate a speculative timeline from 2025 onward, making decisions while an AI game master responds with plausible consequences.

The goal isn't to predict the future. It's to help players:
- Develop intuitions about AI governance dynamics
- Experience the difficulty of forecasting under uncertainty
- Understand how decisions compound over time
- Recognize patterns that might transfer to real-world situations

## How It Works

**Player's Role:** You are the US government. You make policy decisions, respond to crises, and navigate international dynamics around AI development.

**Game Master:** An LLM (Google Gemini 2.5 Flash) acts as the game master, generating news events, responding to your decisions, and evolving the scenario. The GM consults expert-curated background materials on AI x-risk to ground its responses.

**Timeline:** The game progresses in ~6-month turns. Each turn, you see what happened, make decisions, and the GM responds with consequences and new developments.

**Hidden Information:** Some events happen "off-screen" - the GM knows about them, but you don't. These are revealed at the end, teaching the crucial lesson that forecasters never have complete information.

## Design Philosophy

**Serious, not gamified.** This isn't about points or achievements. It's about building mental models for complex systems.

**Content-focused.** The interface stays out of the way. No flashy animations or distracting chrome - just you, the timeline, and the decisions ahead.

**Domain-agnostic engine.** The game engine itself is generic. All the AI x-risk specifics come from "material bundles" - expert-written content that guides the GM. This means the same engine could support different scenarios or domains.

**Event sourcing architecture.** Every action creates an immutable record. You can export your entire game history, analyze it, or share it with others.

## Current Status

**Technical MVP is complete:**
- Full gameplay loop working
- Tutorial/onboarding for new players
- Dark mode, accessibility features
- 234+ automated tests

**What's needed for launch:**
1. **Deployment** - Setting up AI Studio Build for public access
2. **Expert materials** - The current AI x-risk content is placeholder. Real launch needs substantive material authored by domain experts (threat models, alignment proposals, governance frameworks)

## How to Contribute

### Domain Experts
The most valuable contribution is **content**. The game needs expert-written materials on:
- AI capability trajectories and threat models
- Technical alignment approaches and their tradeoffs
- Governance frameworks and historical precedents
- Crisis scenarios and response patterns

See [materials-source/](https://github.com/JoernStoehler/ai-forecasting-hackathon/tree/main/materials-source) for the authoring workflow.

### Developers
The codebase is open source. See the [Quick Start guide](quickstart.md) to get running locally.

### Funders
If you're interested in supporting this project's development or deployment, reach out via GitHub issues or the repository contact info.

---

## Learn More

- **[GitHub Repository](https://github.com/JoernStoehler/ai-forecasting-hackathon)** - Full source code
- **[PROJECT.md](https://github.com/JoernStoehler/ai-forecasting-hackathon/blob/main/PROJECT.md)** - Complete feature registry and technical roadmap
- **[Developer Quick Start](quickstart.md)** - Run it locally
