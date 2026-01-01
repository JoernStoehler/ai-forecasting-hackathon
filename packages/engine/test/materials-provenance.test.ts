import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { stripHtmlComments } from '../src/utils/materials.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('materials provenance integration', () => {
  it('strips comments from snapshot metadata', () => {
    const snapshot = `<!-- SNAPSHOT METADATA
  id: test-source
  url: https://example.com
  accessedAt: 2024-01-01T00:00:00.000Z
  tags: ai-safety
-->

# Article Title

Content here <!-- inline citation: https://example.com/ref -->

More content.`;

    const cleaned = stripHtmlComments(snapshot);
    
    // Verify metadata comment is removed
    expect(cleaned).not.toContain('SNAPSHOT METADATA');
    expect(cleaned).not.toContain('test-source');
    expect(cleaned).not.toContain('https://example.com');
    
    // Verify inline citation is removed
    expect(cleaned).not.toContain('inline citation');
    expect(cleaned).not.toContain('https://example.com/ref');
    
    // Verify content is preserved
    expect(cleaned).toContain('# Article Title');
    expect(cleaned).toContain('Content here');
    expect(cleaned).toContain('More content.');
  });

  it('handles materials with provenance comments', () => {
    const materialWithProvenance = `# Research Summary

<!-- Sources:
  - https://arxiv.org/abs/2001.08361 (Kaplan et al. 2020)
  - https://example.com/article
  Accessed: 2024-01-01
-->

Recent research shows that scaling laws continue to hold.

The safety community has raised concerns <!-- See: https://example.com/safety --> about misuse.`;

    const cleaned = stripHtmlComments(materialWithProvenance);
    
    expect(cleaned).not.toContain('Sources:');
    expect(cleaned).not.toContain('arxiv.org');
    expect(cleaned).not.toContain('Accessed:');
    expect(cleaned).not.toContain('See:');
    expect(cleaned).toContain('Recent research');
    expect(cleaned).toContain('about misuse.');
  });
});
