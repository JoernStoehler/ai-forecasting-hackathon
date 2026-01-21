# AI Studio Build - Knowledge Base with Sources

**Last Updated:** 2026-01-21
**Purpose:** Authoritative knowledge about Google AI Studio Build with precise citations

---

## Source Registry

All knowledge items below cite one of these sources:

1. **[OFFICIAL-DOCS]** - [Build mode in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode) (Google official documentation)
2. **[FORUM-QUOTA]** - [Is there any way to share an AI studio app?](https://discuss.ai.google.dev/t/is-there-any-way-to-share-an-ai-studio-app-with-someone-for-them-to-use/90695) (Google AI Studio forum discussion, user quota confirmation)
3. **[SYSTEM-PROMPT]** - AI Studio Build agent system prompt (extracted 2026-01-21 from AI Studio Build agent, documented in [ai-studio-build-system-prompt.md](./ai-studio-build-system-prompt.md))
4. **[OBSERVATION]** - Direct observation from implementing deployment in this codebase

---

## Confirmed Knowledge

### Platform Basics

**FACT:** AI Studio Build is a web-based platform at https://aistudio.google.com for building and sharing apps
**SOURCE:** [OFFICIAL-DOCS], [OBSERVATION]

**FACT:** Accepts ZIP file uploads containing HTML/TypeScript/React code
**SOURCE:** [SYSTEM-PROMPT] lines 48-49, [OBSERVATION]

**FACT:** ZIP structure requires `index.html` and `index.tsx` at root (no nested `src/` directory)
**SOURCE:** [SYSTEM-PROMPT] lines 48-50

**FACT:** Uses ES6 modules (`<script type="module">`)
**SOURCE:** [SYSTEM-PROMPT] line 48

### API Key Handling & User Quota

**FACT:** Code must use `process.env.API_KEY` to access Gemini API
**SOURCE:** [SYSTEM-PROMPT] lines 128-137

**FACT:** AI Studio acts as proxy and injects viewer's API key at runtime
**SOURCE:** [FORUM-QUOTA] (confirmed by users testing share links), [OBSERVATION]

**FACT:** Each viewer consumes their own Gemini API quota, not the developer's
**SOURCE:** [FORUM-QUOTA] (multiple user confirmations), [OBSERVATION]

**FACT:** Viewers are authenticated via their AI Studio login (no manual API key setup)
**SOURCE:** [FORUM-QUOTA], [OBSERVATION]

### File Requirements

**FACT:** Requires `index.html`, `index.tsx`, and optionally `metadata.json`
**SOURCE:** [SYSTEM-PROMPT] lines 48-85

**FACT:** `metadata.json` is used for requesting frame permissions (camera, microphone, geolocation)
**SOURCE:** [SYSTEM-PROMPT] lines 75-85

### SDK Requirements

**FACT:** Must use `@google/genai` SDK (specifically `GoogleGenAI` class, not deprecated `GoogleGenerativeAI`)
**SOURCE:** [SYSTEM-PROMPT] lines 94-176

**FACT:** Initialization format: `new GoogleGenAI({apiKey: process.env.API_KEY})`
**SOURCE:** [SYSTEM-PROMPT] lines 128-129

---

## Uncertain / Undocumented

### TypeScript Processing

**UNKNOWN:** How TypeScript files are processed (compiled? transpiled? direct browser execution?)
**EVIDENCE:** [SYSTEM-PROMPT] describes file structure but does not explain execution mechanism
**IMPACT:** Cannot verify if complex TS features (decorators, advanced types) work

**UNKNOWN:** Whether there's a build step on ZIP upload or TS runs directly
**EVIDENCE:** No build process mentioned in [SYSTEM-PROMPT], no official docs found
**IMPACT:** Unclear what preprocessing occurs before execution

### CSS Processing

**UNKNOWN:** Native CSS processing mechanism in AI Studio Build
**EVIDENCE:** No CSS handling mentioned in [SYSTEM-PROMPT]
**WORKAROUND:** [OBSERVATION] We pre-compile CSS with Tailwind/PostCSS and include compiled CSS file in ZIP
**SOURCE:** [scripts/build-ai-studio.js](../scripts/build-ai-studio.js) copyCss() function

### Runtime Environment

**UNKNOWN:** What Node.js/browser APIs are available at runtime
**EVIDENCE:** [SYSTEM-PROMPT] shows Web APIs usage (AudioContext, fetch) but doesn't document full environment
**IMPACT:** Cannot predict compatibility of Node-specific or experimental browser APIs

**UNKNOWN:** Bundle size limits or performance constraints
**EVIDENCE:** No limits documented in sources
**OBSERVATION:** Our ZIP is ~67 KB (TypeScript source + compiled CSS)

### Deployment & Sharing

**UNCONFIRMED:** Whether shared apps require viewer login or can be public
**EVIDENCE:** [FORUM-QUOTA] mentions some reports of login requirements
**STATUS:** Conflicting user reports, needs testing

---

## Implementation Decisions

### Two-Step Build Process

**DECISION:** Run `npm run build` first, then `npm run build:ai-studio`
**RATIONALE:** [OBSERVATION] Pre-compile CSS with Tailwind/PostCSS since CSS processing mechanism is undocumented
**SOURCE:** [scripts/build-ai-studio.js](../scripts/build-ai-studio.js)

**BUILD SCRIPT ACTIONS:**
1. Copies TypeScript source files (`.ts`, `.tsx`) from `packages/webapp/src/`
2. Transforms imports:
   - Replaces `import.meta.env.API_KEY` → `process.env.API_KEY`
   - Converts `@/` path aliases to relative paths
3. Copies pre-compiled CSS from `dist/assets/` as `styles.css`
4. Creates `index.html` with `<link rel="stylesheet" href="./styles.css">`
5. Creates `metadata.json`
6. Packages everything into `ai-studio-deploy.zip`

**SOURCE:** [OBSERVATION], [scripts/build-ai-studio.js](../scripts/build-ai-studio.js)

### Path Transformations

**DECISION:** Transform `@/` path aliases to relative paths in TypeScript source
**RATIONALE:** [SYSTEM-PROMPT] line 50 requires flat structure; import paths must resolve correctly
**IMPLEMENTATION:** [scripts/build-ai-studio.js](../scripts/build-ai-studio.js) lines 57-66
**SOURCE:** [OBSERVATION]

---

## Gaps in Knowledge

**CRITICAL:** No official documentation about TypeScript execution mechanism
**MISSING:** CSS processing documentation (our solution is a workaround)
**MISSING:** Bundle size limits
**MISSING:** Full runtime environment specification
**MISSING:** Share link visibility/privacy settings documentation

---

## Verification Status

✅ **Verified:** API key injection works (users confirm quota attribution)
✅ **Verified:** ZIP upload accepts TypeScript source files
✅ **Verified:** ES6 modules work in runtime environment
⚠️ **Unverified:** TypeScript processing mechanism
⚠️ **Unverified:** CSS handling (we use workaround)
⚠️ **Unverified:** Share link public accessibility

---

## Recommendations

1. **Test in AI Studio Build:** Deploy and verify per-user quota attribution
2. **Monitor official docs:** [OFFICIAL-DOCS] may be updated with processing details
3. **Keep CSS workaround:** Pre-compilation works, no need to change until mechanism is documented
4. **Document observations:** Update this file with any new findings from production deployment

---

**Maintenance:** Add new sources to Source Registry with unique tags. Cite sources for all claims.
