# Source Materials for AI Forecasting GM

## Two-Pass Workflow

1. **Expert writes here**: Comprehensive markdown optimized for conveying knowledge clearly. Don't worry about token limits or LLM optimization.
2. **Claude compresses**: In a separate session, Claude reads the expert materials and produces LLM-optimized prompt content for `src/engine/data/materials.ts`.

## Writing Guidelines (for the expert)

Write whatever helps convey your knowledge:
- Mental models and heuristics
- Technical details that matter
- Concrete examples with numbers
- Nuanced positions and counterarguments
- Things LLMs typically get wrong

Prioritize clarity over brevity. The compression pass handles token optimization.

## Format

- Markdown files in this directory
- Organize however makes sense for the domain
- Optional metadata (stripped during compression):

```markdown
<!-- source: Your Name, created: 2026-01-18 -->
```

## Compression Pass

When materials are ready, ask Claude to read them and produce `src/engine/data/materials.ts` with LLM-optimized content.
