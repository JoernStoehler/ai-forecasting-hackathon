---
name: ui-development
description: Implement and verify UI changes with autonomous screenshot validation. Use when building or modifying React components, pages, or styling.
---

# UI Development with Visual Verification

## Core Workflow

When implementing UI changes, follow the autonomous screenshot validation loop:

1. **Implement** the UI change in code
2. **Start dev server** in background if not running
3. **Take screenshots** of affected pages/components
4. **Review screenshots yourself** for visual issues
5. **Iterate** until output matches requirements
6. **Only then commit**

**Critical:** Do NOT commit UI changes without visual verification. Tests pass ✓ doesn't mean it looks right.

## Taking Screenshots

Use Playwright's built-in screenshot command:

```bash
# Start dev server (check output for actual port)
npm run dev &

# Wait for server
sleep 3

# Take screenshots
npx playwright screenshot \
  --viewport-size=1280,720 \
  --full-page \
  http://localhost:PORT/path scratch/page-name.png

# For dark mode
npx playwright screenshot \
  --viewport-size=1280,720 \
  --color-scheme=dark \
  http://localhost:PORT/path scratch/page-name-dark.png
```

**Note:** `--color-scheme=dark` sets browser preference, but won't work if app uses manual toggle (like this project does). In that case, you need to navigate and click the toggle.

## What to Screenshot

**After implementing any UI feature:**
- All affected pages in light mode
- All affected pages in dark mode
- Different viewport sizes if responsive
- Key interaction states (hover, focus, error states)
- Empty states and loading states

**Standard pages for this project:**
- Menu page (light/dark)
- Game page with timeline (light/dark)
- Tutorial modal (light/dark)
- Post-game page (light/dark)
- Compose panel states (empty, filled, loading, error)

## Review Criteria

When reviewing your screenshots, check:

**Visual Consistency:**
- Does dark mode work for all elements?
- Are colors consistent with design system?
- Is spacing/padding consistent?
- Do icons render correctly?

**Accessibility:**
- Sufficient color contrast (WCAG AA minimum)
- Focus indicators visible
- Touch targets adequate size (44x44px minimum)
- Text readable at default zoom

**Typography:**
- Font sizes appropriate
- Line heights comfortable
- Text color vs background contrast good

**No "AI Slop":**
- Avoid generic Inter/Roboto fonts (this project uses custom palette)
- No purple gradients on white
- No cookie-cutter layouts
- Context-specific, polished design

## Iteration Pattern

**Official Anthropic guidance:** "Like humans, Claude's outputs tend to improve significantly with iteration - while the first version might be good, after 2-3 iterations it will typically look much better."

**Expected iterations: 2-3 minimum for any UI work.**

1. First pass: Get it working
2. Review screenshots: Identify issues
3. Second pass: Fix visual issues
4. Review again: Verify improvements
5. Third pass: Polish details
6. Final review: Commit only when satisfied

## MCP Server Option (Advanced)

For automated screenshot feedback loops, use Playwright MCP server:
- Install: See [Playwright MCP guide](https://testdino.com/blog/playwright-mcp/)
- Enables browser control via tool calls
- Better for complex scenarios (navigation, interaction, form filling)
- Not required for basic screenshot validation

## This Project's Specifics

**Tech stack:**
- React 18 + Vite
- Tailwind CSS with dark mode (class strategy)
- Beige/warm color palette (not white)
- Event-sourced timeline UI

**Dark mode implementation:**
- Uses `darkMode: 'class'` in tailwind.config.js
- Toggle button in header updates `<html class="dark">`
- All components should have `dark:` variant styles

**Common issues to watch for:**
- Modals/overlays missing dark mode styles
- Focus indicators not visible in dark mode
- Beige backgrounds turning white
- Icon colors not adapting to theme

## References

- [Official Anthropic best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Playwright screenshot docs](https://playwright.dev/docs/screenshots)
- [Frontend design skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md) (official)
