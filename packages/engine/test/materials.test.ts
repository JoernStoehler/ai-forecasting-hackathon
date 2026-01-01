import { describe, it, expect } from 'vitest';
import { stripHtmlComments, stripCommentsFromMaterials } from '../src/utils/materials.js';

describe('stripHtmlComments', () => {
  it('removes single HTML comment', () => {
    const input = 'Before <!-- comment --> after';
    const expected = 'Before  after';
    expect(stripHtmlComments(input)).toBe(expected);
  });

  it('removes multiple HTML comments', () => {
    const input = '<!-- first -->Text<!-- second -->More<!-- third -->';
    const expected = 'TextMore';
    expect(stripHtmlComments(input)).toBe(expected);
  });

  it('removes multi-line HTML comments', () => {
    const input = `Before
<!-- This is a
multi-line
comment -->
After`;
    const expected = `Before

After`;
    expect(stripHtmlComments(input)).toBe(expected);
  });

  it('handles text without comments', () => {
    const input = 'No comments here';
    expect(stripHtmlComments(input)).toBe(input);
  });

  it('handles empty string', () => {
    expect(stripHtmlComments('')).toBe('');
  });

  it('removes metadata header comment', () => {
    const input = `<!-- SNAPSHOT METADATA
  id: test-source
  url: https://example.com
  accessedAt: 2024-01-01T00:00:00.000Z
-->

# Actual Content`;
    const expected = `

# Actual Content`;
    expect(stripHtmlComments(input)).toBe(expected);
  });
});

describe('stripCommentsFromMaterials', () => {
  it('strips comments from material bodies', () => {
    const materials = [
      { id: 'mat1', title: 'Material 1', body: 'Before <!-- comment --> after' },
      { id: 'mat2', title: 'Material 2', body: '<!-- start -->Content<!-- end -->' },
    ];
    const result = stripCommentsFromMaterials(materials);
    expect(result).toEqual([
      { id: 'mat1', title: 'Material 1', body: 'Before  after' },
      { id: 'mat2', title: 'Material 2', body: 'Content' },
    ]);
  });

  it('preserves all material properties', () => {
    const materials = [
      { id: 'mat1', title: 'Material 1', body: 'Text<!-- comment -->', custom: 'property' },
    ];
    const result = stripCommentsFromMaterials(materials);
    expect(result[0]).toHaveProperty('custom', 'property');
    expect(result[0].id).toBe('mat1');
    expect(result[0].title).toBe('Material 1');
  });

  it('handles empty array', () => {
    expect(stripCommentsFromMaterials([])).toEqual([]);
  });
});
