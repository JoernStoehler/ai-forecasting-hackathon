# Source Materials for AI Forecasting GM

This directory contains **source materials** written by domain experts. These are comprehensive documents optimized for human understanding and knowledge transfer.

## Purpose

**Two-pass workflow**:
1. **Domain experts write here**: Comprehensive markdown optimized for "conveying knowledge to a smart agent with lots of time"
2. **Technical distillation**: Scripts compress these into `src/engine/data/materials.ts` optimized for "conveying actionable knowledge to a medium intelligence LLM with very little time"

## File Organization

**You decide the structure.** Organize materials however makes sense for the domain:
- By topic/theme
- By priority/importance
- By type of knowledge (technical, policy, historical, etc.)
- By use case (early game, late game, specific scenarios)
- Whatever cuts reality at its joints for AI x-risk/governance

## Writing Guidelines

### What to Include
- Your expert mental models
- Technical details that matter for forecasting
- Nuanced positions and counterarguments
- Concrete examples with quantifiable details
- Decision-relevant frameworks
- Things LLMs typically get wrong or don't know

### Format
- Write in markdown
- Use headings, lists, tables as needed
- Include brief context for jargon (LLM may not know cutting-edge terms)
- Prioritize clarity and precision over brevity
- Don't worry about token budgets - that's the distillation pass

### What NOT to Worry About
- Token limits (handled in distillation)
- TypeScript syntax (handled in conversion)
- Compression (that's the technical pass)
- Whether LLM already knows basics (compression can remove redundancy)

## Distillation Process

A script will:
1. Read all markdown files in this directory
2. Apply compression rules (remove verbose explanations, keep decision-relevant info)
3. Generate `src/engine/data/materials.ts`
4. You review the output to ensure accuracy

## Provenance

Materials can include HTML comments for provenance metadata:
```markdown
<!-- MATERIAL METADATA
source: "Your Name / Organization"
created: 2026-01-18
topic: "threat-models"
-->

# Content here...
```

These comments are automatically stripped before sending to the LLM.
