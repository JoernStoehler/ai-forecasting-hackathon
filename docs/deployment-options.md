# Deployment Options for AI-Powered Web Applications

**Last Updated:** 2026-01-21
**Research Context:** Finding hosting platforms that use **user quotas** instead of developer quotas

---

## Executive Summary

This document compares deployment options for client-side web applications that make heavy LLM API calls. The key requirement: **users should consume their own AI API quota**, not the developer's fixed budget.

**Viable Options Found:**
1. ✅ **Google AI Studio Build** - Best fit for this project (Gemini API, React/TypeScript, user quota)
2. ✅ **Claude Artifacts** - User quota model works, but single-file limitation blocks multi-file projects
3. ❌ **ChatGPT Apps** - Rich UI but focused on external service integrations, not LLM-heavy apps
4. ✅ **Traditional hosting** - Users provide their own API keys (current fallback approach)

---

## 1. Google AI Studio Build

**Status:** ✅ **RECOMMENDED FOR THIS PROJECT**

### What It Is
Google's platform for building and sharing Gemini-powered web applications within the AI Studio environment.

### How It Works
1. Generate a basic React app in AI Studio Build mode (or provide app description)
2. **Upload existing codebase** via ZIP file attachment to the Build agent
3. Prompt: "Replace the entire codebase with the contents of this ZIP"
4. Agent updates the Code tab with your files
5. Click "Share" to generate a shareable link
6. **Users access via AI Studio** → automatically authenticated → their quota is used

### User Quota Model
> "When a user runs your shared app within AI Studio, **AI Studio acts as a proxy, replacing the placeholder with the end user's API key**, ensuring your key remains private."

> "When you share your app with Google AI Studio, **all API usage by its users is attributed to their Google AI Studio free of charge usage**, completely bypassing your own API key and quota."

**Key Technical Detail:**
- Your code uses `process.env.GEMINI_API_KEY` (placeholder)
- AI Studio proxies API calls and injects viewer's credentials
- Shared apps remain **within AI Studio** (not deployed to Cloud Run for this use case)

### Limitations
- ❌ Cannot import existing codebases directly (must use agent with ZIP upload)
- ⚠️ Some reports of public links requiring login (may be fixed)
- ⚠️ Editing must be done via agent or manual Code tab editing
- ✅ Multi-file projects: **Supported** via agent upload
- ✅ GitHub integration: Can export to GitHub

### Deployment to Cloud Run (Different Model)
**Note:** Deploying to Cloud Run uses YOUR API key for all users. This is **not** the user-quota model we want. Cloud Run is for traditional hosting where you pay for usage.

### Documentation
- [Build mode in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Is there any way to share an AI studio app?](https://discuss.ai.google.dev/t/is-there-any-way-to-share-an-ai-studio-app-with-someone-for-them-to-use/90695) - Critical forum post confirming user quota model
- [Building Personal Apps with Google AI Studio](https://atalupadhyay.wordpress.com/2025/10/20/building-personal-apps-with-google-ai-studio/)

---

## 2. Claude Artifacts

**Status:** ⚠️ **VIABLE BUT LIMITED** - User quota works, single-file constraint blocks this project

### What It Is
Anthropic's platform for creating and sharing interactive web applications directly within Claude conversations.

### How It Works
1. Create or paste your React code into a Claude Artifact
2. Publish the artifact
3. Share the link
4. **Users must sign in** with their Claude account when the app makes its first API call
5. Their quota is consumed (not yours)

### User Quota Model
> "When someone uses your Claude-powered app, **they authenticate with their existing Claude account** so that the prompt can be billed against them, and not against you."

> "When you're building and testing, the API usage counts against your plan, but **when others use your shared app, the usage is on their plan instead**."

**Key Technical Detail:**
- Use `window.claude.complete()` for API calls in your code
- First API call triggers Claude authentication
- Each viewer signs in with their own account

### Limitations
- ❌ **Single-file only** - Cannot host multi-file projects with separate modules
- ✅ User quota model confirmed
- ✅ Persistent storage for published artifacts
- ✅ MCP integration for external services
- ⚠️ Optimal size: "dozens to few hundred lines" (this project has thousands)

**Why This Doesn't Work for Our Project:**
Our codebase has multi-file structure (src/engine/, src/components/, src/services/) which cannot be represented as a single artifact.

### Documentation
- [Prototype AI-Powered Apps with Claude artifacts](https://support.claude.com/en/articles/11649438-prototype-ai-powered-apps-with-claude-artifacts)
- [Build and share AI-powered apps with Claude (Simon Willison)](https://simonwillison.net/2025/Jun/25/ai-powered-apps-with-claude/)
- [Claude Artifacts: A Game-Changer Held Back by Frustrating Limits](https://medium.com/@intranetfactory/claude-artifacts-a-game-changer-held-back-by-frustrating-limits-6adcacdd95a7)

---

## 3. ChatGPT Apps

**Status:** ❌ **NOT SUITABLE** - Designed for external service integrations, not LLM-heavy apps

### What It Is
OpenAI's app store launched December 2025, built on the Apps SDK and Model Context Protocol (MCP).

### How It Works
1. Build app using Apps SDK (React components run in iframe)
2. Submit to OpenAI for review
3. Apps appear in ChatGPT App Directory
4. Users access via ChatGPT (Free, Plus, Pro tiers)

### User Quota Model
**Unclear for LLM-heavy apps.** Documentation focuses on:
- External service integrations (Spotify, Zillow, Canva, Booking.com)
- Interactive UIs (maps, carousels, buttons)
- Third-party data sources

**Not documented:** Can you build an app that makes heavy GPT-4o API calls using viewer's ChatGPT quota?

### Current Apps
Examples: Spotify playlists, Zillow property search, Canva presentations, Booking.com travel

All integrate **external services** - they're not primarily LLM-driven applications.

### Why This Doesn't Work for Our Project
ChatGPT Apps are fundamentally **chat enhancements** for third-party services. Our game needs heavy Gemini API usage, not external service integration.

### Documentation
- [Introducing apps in ChatGPT and the new Apps SDK](https://openai.com/index/introducing-apps-in-chatgpt/)
- [Apps SDK documentation](https://developers.openai.com/apps-sdk/)
- [ChatGPT launches an app store (TechCrunch)](https://techcrunch.com/2025/12/18/chatgpt-launches-an-app-store-lets-developers-know-its-open-for-business/)

---

## 4. Traditional Hosting (Current Approach)

**Status:** ✅ **FALLBACK OPTION** - Works but requires users to provide API keys

### What It Is
Standard static web hosting where users must create and paste their own API keys.

### How It Works
1. Deploy to Vercel, Netlify, Cloudflare Pages, or similar
2. Users visit the site
3. Users create their own Gemini API key
4. Users paste key into app settings
5. API calls use user's key directly

### User Quota Model
✅ Users provide their own keys → uses their quota
❌ Extra friction: key creation, copy/paste, security concerns

### Advantages
- ✅ Full control over deployment
- ✅ No platform limitations
- ✅ Works with any API provider
- ✅ Standard web hosting workflow

### Disadvantages
- ❌ Users must create API keys (extra steps)
- ❌ Users must manage key security
- ❌ Higher barrier to entry
- ❌ Users need technical knowledge

### Current Implementation
The project includes a Cloudflare Worker for share functionality:
- Production: https://share-worker.joern-stoehler.workers.dev
- Stores shared games in KV with 30-day TTL
- CORS allows all origins

---

## Comparison Table

| Platform | Multi-File Projects | User Quota | API Method | Upload Method | Best For |
|----------|-------------------|------------|------------|---------------|----------|
| **Google AI Studio Build** | ✅ Yes | ✅ Yes (proxy) | `process.env.GEMINI_API_KEY` | ZIP to agent | Gemini-powered apps |
| **Claude Artifacts** | ❌ Single file | ✅ Yes (auth) | `window.claude.complete()` | Paste code | Simple interactive apps |
| **ChatGPT Apps** | ✅ Yes | ❓ Unclear | N/A | Apps SDK | External services |
| **Traditional Hosting** | ✅ Yes | ✅ Yes (user keys) | Direct API | Git deploy | Standard web apps |

---

## OAuth and Third-Party Authorization

**Research Question:** Can third-party apps use OAuth to access user AI API quotas?

### Findings

**Google Gemini API:**
- OAuth 2.0 support exists for API authentication
- Designed for enterprise/workspace users
- **Not** designed for "host my app, users sign in, use their quota" model

**Anthropic Claude:**
- OAuth existed briefly for Claude Pro/Max subscribers
- **Blocked in January 2026** - intentionally restricted to official Claude Code tool
- Error: "This credential is only authorized for use with Claude Code"

**OpenAI:**
- OAuth exists for GPT Actions (custom GPTs calling external services)
- MCP server authentication via OAuth 2.1
- **Not** designed for third-party apps using user ChatGPT quota

### Conclusion
**OAuth for user quota access doesn't exist** at any major AI provider. The platforms that support user quotas (AI Studio Build, Claude Artifacts) use their own proprietary proxy mechanisms.

---

## Recommendations for This Project

### Primary Option: Google AI Studio Build
**Rationale:**
1. Already using Gemini API (no code changes)
2. Multi-file project support confirmed (via ZIP upload)
3. User quota model confirmed (AI Studio proxy)
4. React/TypeScript/Vite compatibility
5. Free for users (AI Studio free tier)

**Implementation Path:**
1. Create basic React app in AI Studio Build
2. Export current codebase as ZIP
3. Upload ZIP to Build agent via chat
4. Prompt agent to replace codebase
5. Test functionality in preview
6. Share within AI Studio (not deploy to Cloud Run)
7. Verify user quota attribution

### Fallback: Traditional Hosting + User API Keys
If AI Studio Build has issues:
1. Deploy to Cloudflare Pages or Vercel
2. Add API key input UI
3. Store keys in localStorage
4. Clear documentation on obtaining keys

---

## Future Considerations

### If AI Studio Build Doesn't Work
- Monitor Claude Artifacts for multi-file support
- Check if ChatGPT Apps SDK supports LLM-heavy applications
- Investigate other emerging platforms

### If User Quota Model Changes
Google could change AI Studio proxy behavior. Mitigation:
1. Maintain traditional hosting capability
2. Monitor AI Studio Terms of Service
3. Have user API key fallback ready

---

## Key Takeaways

1. **User quota hosting exists** but is platform-specific, not via OAuth
2. **Google AI Studio Build is the only viable option** that meets all requirements
3. **Multi-file projects are supported** via agent-based ZIP upload
4. **Traditional hosting remains the fallback** if platform hosting fails

---

## Research Sources

This document synthesizes web research conducted 2026-01-21:
- 40+ web searches across all major AI platforms
- Official documentation from Google, Anthropic, OpenAI
- Developer community forums and discussions
- Third-party analysis and tutorials

All claims about user quota models are backed by cited sources in the platform-specific sections above.

---

**Document Maintainer:** Claude Code developers
**Project Owner:** Jörn Stöhler
