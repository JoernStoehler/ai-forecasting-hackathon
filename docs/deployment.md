# Deploying the Webapp to AI Studio Build

**Last Updated:** 2026-01-21
**Status:** Primary deployment path for public access

---

## Overview

This project deploys to **Google AI Studio Build** to enable:
- ✅ Users consume their own Gemini API quota (not developer's quota)
- ✅ Free access for all users (AI Studio free tier)
- ✅ No API key management for end users
- ✅ Share via simple link

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
- Google account with access to AI Studio (https://aistudio.google.com)
- This repository cloned locally
- All code tested locally with `npm run dev`

### Step 1: Build Production Bundle
```bash
# Ensure all tests pass
npm run check

# Create production build
npm run build
```

### Step 2: Create ZIP of Source Code
```bash
# Create deployment ZIP (automated script)
npm run deploy:zip

# This creates webapp-deployment.zip in the project root
# Excludes: test files, test directories, node_modules, dist
```

### Step 3: Open AI Studio Build
1. Navigate to https://aistudio.google.com
2. Select **Build mode** from the left sidebar
3. Create a new app or open existing project

### Step 4: Upload Source Code
1. In the Build mode chat interface, **attach the ZIP file** (webapp-deployment.zip)
2. Send this prompt to the agent:
   ```
   Please replace the entire codebase with the contents of this ZIP file.
   This is a React/TypeScript/Vite application for AI forecasting.
   Preserve all file structure and configurations.
   ```
3. Wait for the agent to process and update the Code tab
4. Verify in the **Code tab** that your files are present

### Step 5: Verify Functionality
1. Switch to **Preview tab**
2. Test core functionality:
   - App loads without errors
   - Can submit a player action
   - GM response streams in correctly
   - Timeline displays properly
   - Search works
3. Check browser console for errors

### Step 6: Share the App
1. Click the **Share** button (top right in Build mode)
2. Copy the generated share link
3. Test the link in a **different browser** or **incognito window**
4. Verify that user authentication works (should use their AI Studio quota)

### Step 7: Verify User Quota Attribution
Test with a different Google account:
1. Open share link in different account/browser
2. Submit several player actions (trigger GM responses)
3. Verify your own AI Studio quota is **not** consumed
4. Verify the viewer can make API calls without errors

---

## Important Notes

### API Key Handling
- ✅ **Do this:** Use `process.env.GEMINI_API_KEY` in code
- ❌ **Don't do this:** Hardcode any API keys
- ❌ **Don't do this:** Deploy to Cloud Run for this use case

### Code Visibility
- **Source code is visible** to anyone with the share link
- Do not include secrets, credentials, or sensitive data
- Assume viewers can read and fork your code

### GitHub Integration (Optional)
AI Studio Build can export to GitHub:
1. Click the GitHub icon in Build mode
2. Connect your GitHub account
3. Select repository
4. AI Studio will create commits when you make changes

### Updating Deployed App
To update the deployed app:
1. Make changes locally and test
2. Create new ZIP with updated code
3. Upload to AI Studio Build agent
4. Prompt: "Update the codebase with this new version"
5. Test in Preview tab
6. Share link remains the same (no need to re-share)

---

## Troubleshooting

### Share Link Requires Login When It Shouldn't
**Known issue:** Some forum reports of public links requiring login.
- **Workaround:** Ensure app is marked as "public" in share settings
- **Check:** AI Studio share settings (if available)
- **Alternative:** Use traditional hosting as fallback

### API Calls Failing for Viewers
**Possible causes:**
1. Viewer doesn't have AI Studio access → Ask them to sign up
2. Viewer's quota exhausted → They need to wait for quota reset
3. App not properly shared → Re-check share settings

### Code Not Updating After ZIP Upload
**Solutions:**
1. Clear the Code tab manually before uploading new ZIP
2. Use more explicit prompt: "Delete all existing code first, then..."
3. Try creating a fresh Build project and uploading there

### Preview Works But Share Link Doesn't
**Possible issue:** App might be using absolute paths or localhost references
- **Check:** All API endpoints use relative paths
- **Check:** No hardcoded localhost URLs in code
- **Check:** `VITE_SHARE_WORKER_URL` uses production URL

---

## Alternative: Traditional Hosting

If AI Studio Build doesn't meet requirements, deploy to traditional hosting:

### Option A: Cloudflare Pages
```bash
npm run build
# Deploy dist/ folder to Cloudflare Pages
```

### Option B: Vercel
```bash
npm run build
vercel deploy
```

### Option C: Netlify
```bash
npm run build
netlify deploy --prod
```

**Important:** With traditional hosting, users must:
1. Create their own Gemini API key
2. Paste key into app settings
3. Manage key security themselves

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
