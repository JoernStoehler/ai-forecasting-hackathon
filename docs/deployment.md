# Deploying the Webapp

**Last Updated:** 2026-01-21
**Status:** Single-file HTML deployment (386 KB)

---

## Overview

This project builds to a **single self-contained HTML file** (386 KB) that can be deployed to:

1. **Google AI Studio Build** - Users consume their own Gemini API quota
2. **Claude Artifacts** - Direct paste deployment (under 10 MB limit)
3. **Traditional Hosting** - Any static file host (Cloudflare Pages, Vercel, Netlify)

**Key Benefits:**
- ✅ Single file = simple deployment
- ✅ No build step needed at deployment target
- ✅ Works offline after first load
- ✅ Easy to share and distribute

**See also:** [docs/deployment-options.md](./deployment-options.md) for comparison with other platforms.

---

## How AI Studio Build Works

### User Quota Model

When you share an app within AI Studio:
1. Your code uses `process.env.GEMINI_API_KEY` (placeholder variable)
2. AI Studio acts as a **proxy** and injects the viewer's API key
3. **Each viewer's quota is consumed**, not yours
4. Viewers are automatically authenticated via their AI Studio login

**Critical:** This only works when shared **within AI Studio**. Deploying to Cloud Run uses YOUR key for all users (not desired).

### Key Benefits
- **Scalable:** Works for 1 user or 10,000 users without cost to developer
- **Simple:** Users just click link, no API key setup needed
- **Secure:** Your API key is never exposed to viewers
- **Free:** AI Studio free tier provides generous quota per user

---

## Deployment Steps

### Prerequisites
- Repository cloned locally
- All code tested locally with `npm run dev`
- (For AI Studio Build) Google account with access to https://aistudio.google.com

### Step 1: Build Single-File Production Bundle
```bash
# Ensure all tests pass
npm run check

# Create single-file build (packages/webapp/dist/index.html)
npm run build:deploy
```

This creates a single `packages/webapp/dist/index.html` file (~386 KB) with all JavaScript and CSS inlined.

---

## Deployment Option A: Google AI Studio Build

**Best for:** Users consuming their own Gemini API quota (free for all users)

### Step 1: Open AI Studio Build
1. Navigate to https://aistudio.google.com
2. Select **Build mode** from the left sidebar
3. Create a new app

### Step 2: Upload Single HTML File
1. In the Build mode file browser, create a new file: `index.html`
2. Copy the entire contents of `packages/webapp/dist/index.html`
3. Paste into the AI Studio Build editor
4. Save the file

**Alternative:** Upload via file upload button if available in the interface.

### Step 3: Verify Functionality
1. Switch to **Preview tab**
2. Test core functionality:
   - App loads without errors
   - Can submit a player action
   - GM response streams in correctly
   - Timeline displays properly
   - Search works
3. Check browser console for errors

### Step 4: Share the App
1. Click the **Share** button (top right in Build mode)
2. Copy the generated share link
3. Test the link in a **different browser** or **incognito window**
4. Verify that user authentication works (should use their AI Studio quota)

### Step 5: Verify User Quota Attribution
Test with a different Google account:
1. Open share link in different account/browser
2. Submit several player actions (trigger GM responses)
3. Verify your own AI Studio quota is **not** consumed
4. Verify the viewer can make API calls without errors

---

## Deployment Option B: Claude Artifacts

**Best for:** Quick demos and prototypes (10 MB limit, 386 KB actual size)

### Step 1: Prepare HTML Content
1. Run `npm run build:deploy` to create single-file build
2. Open `packages/webapp/dist/index.html` in a text editor
3. Copy the entire contents (Ctrl+A, Ctrl+C)

### Step 2: Create Artifact
1. Start a conversation with Claude (claude.com)
2. Ask Claude to create an artifact with your HTML:
   ```
   Please create an artifact with this HTML content:
   [paste the full index.html contents]
   ```
3. Claude will render the app in an artifact viewer

### Step 3: Test Functionality
1. Test the app directly in the artifact viewer
2. Click the expand button to open in a larger view
3. Verify core functionality works

**Note:** Users will need their own Gemini API key for Claude Artifacts deployment (Claude can't inject API keys like AI Studio Build does).

---

## Deployment Option C: Traditional Hosting

**Best for:** Custom domain, advanced hosting features

Deploy the single HTML file to any static host:

### Cloudflare Pages
```bash
npm run build:deploy
cd packages/webapp/dist
# Upload index.html via Cloudflare Pages dashboard
```

### Vercel
```bash
npm run build:deploy
vercel deploy packages/webapp/dist
```

### Netlify
```bash
npm run build:deploy
netlify deploy --dir=packages/webapp/dist --prod
```

**Note:** Users will need their own Gemini API key for traditional hosting.

---

## Important Notes

### API Key Handling
- ✅ **Do this:** Use `process.env.GEMINI_API_KEY` in code
- ❌ **Don't do this:** Hardcode any API keys
- ❌ **Don't do this:** Deploy to Cloud Run for this use case

### Code Visibility
- **Built code is visible** to anyone with access to the HTML file
- Code is minified but not obfuscated
- Do not include secrets or credentials (use environment variables)

### Updating Deployed App
1. Make changes locally and test
2. Rebuild: `npm run build:deploy`
3. For AI Studio Build: Update the index.html file contents
4. For Claude Artifacts: Create a new artifact with updated HTML
5. For traditional hosting: Re-upload index.html

### Single-File Build Details
- All JavaScript (~390 KB minified) inlined in `<script>` tags
- All CSS (~24 KB) inlined in `<style>` tags
- No external dependencies or network requests (except Gemini API)
- Works offline after first load
- Gzip size: ~116 KB (what users actually download)

---

## Troubleshooting

### AI Studio Build: Share Link Requires Login
**Known issue:** Some reports of public links requiring login.
- **Workaround:** Ensure app is marked as "public" in share settings
- **Check:** AI Studio share settings (if available)
- **Alternative:** Use Claude Artifacts or traditional hosting

### AI Studio Build: API Calls Failing for Viewers
**Possible causes:**
1. Viewer doesn't have AI Studio access → Ask them to sign up
2. Viewer's quota exhausted → They need to wait for quota reset
3. App not properly shared → Re-check share settings

### Claude Artifacts: App Not Rendering
**Possible causes:**
1. HTML content too large (exceeded 10 MB limit - unlikely with 386 KB)
2. Syntax error in HTML (verify file is valid)
3. Browser security restrictions (check console for errors)

### Traditional Hosting: API Key Not Working
**Check:**
1. Users have set their own Gemini API key in app settings
2. API key has correct permissions
3. Check browser console for API errors

---

## Resources

### Official Documentation
- [Build mode in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [API key setup](https://ai.google.dev/tutorials/setup)
- [Streaming with Gemini](https://ai.google.dev/gemini-api/docs/quickstart)

### Community Resources
- [Is there any way to share an AI studio app?](https://discuss.ai.google.dev/t/is-there-any-way-to-share-an-ai-studio-app-with-someone-for-them-to-use/90695) - User quota confirmation
- [Building Personal Apps with Google AI Studio](https://atalupadhyay.wordpress.com/2025/10/20/building-personal-apps-with-google-ai-studio/)

### Related Documentation
- [Deployment Options Comparison](./deployment-options.md) - Why we chose AI Studio Build
- [PROJECT.md](../PROJECT.md) - Feature status and roadmap

---

# Share Worker (Cloudflare)

The game includes a share feature that stores game state in Cloudflare KV.

**Production worker:** https://share-worker.joern-stoehler.workers.dev

**Source:** `packages/share-worker/`

## How it works
1. User clicks Share → game state POSTed to `/share` → returns 8-char ID
2. Share URL: `https://your-app.com?share=<id>`
3. Shared games stored for 30 days in KV
4. CORS allows all origins (game can run from any host)

## Deploy updates
```bash
npm run worker:login   # One-time Cloudflare auth
npm run worker:deploy  # Deploy changes
```

## Local development
```bash
npm run worker:dev     # Runs on localhost:8787
```

Set `VITE_SHARE_WORKER_URL=http://localhost:8787` to test locally.
