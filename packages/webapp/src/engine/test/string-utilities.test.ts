/**
 * String utility function tests
 *
 * Purpose: Verify slugify generates valid, consistent slugs for event IDs
 * Why: Slugs are used in auto-generated event IDs; must be URL-safe and unique
 */
import { describe, it, expect } from 'vitest';
import { slugify } from '@/engine/utils/strings.js';

describe('Slugify Basic Functionality', () => {
  it('converts simple text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('This Is A Test')).toBe('this-is-a-test');
  });

  it('removes special characters', () => {
    expect(slugify('Test@#$%Event')).toBe('test-event');
  });

  it('handles already lowercase text', () => {
    expect(slugify('already-lowercase')).toBe('already-lowercase');
  });

  it('handles single word', () => {
    expect(slugify('Event')).toBe('event');
  });

  it('handles numbers', () => {
    expect(slugify('Event 123')).toBe('event-123');
  });

  it('preserves alphanumeric characters', () => {
    expect(slugify('abc123xyz789')).toBe('abc123xyz789');
  });
});

describe('Slugify Special Characters', () => {
  it('removes punctuation', () => {
    expect(slugify('Test, Event!')).toBe('test-event');
  });

  it('removes quotes', () => {
    expect(slugify('Test "Event"')).toBe('test-event');
  });

  it('removes apostrophes', () => {
    expect(slugify("Test's Event")).toBe('test-s-event');
  });

  it('removes parentheses', () => {
    expect(slugify('Test (Event)')).toBe('test-event');
  });

  it('removes brackets', () => {
    expect(slugify('Test [Event]')).toBe('test-event');
  });

  it('removes slashes', () => {
    expect(slugify('Test/Event\\Test')).toBe('test-event-test');
  });

  it('removes ampersands', () => {
    expect(slugify('Test & Event')).toBe('test-event');
  });

  it('removes unicode punctuation', () => {
    expect(slugify('Test — Event')).toBe('test-event');
  });
});

describe('Slugify Whitespace Handling', () => {
  it('collapses multiple spaces', () => {
    expect(slugify('Test    Event')).toBe('test-event');
  });

  it('removes leading whitespace', () => {
    expect(slugify('   Test Event')).toBe('test-event');
  });

  it('removes trailing whitespace', () => {
    expect(slugify('Test Event   ')).toBe('test-event');
  });

  it('handles tabs', () => {
    expect(slugify('Test\tEvent')).toBe('test-event');
  });

  it('handles newlines', () => {
    expect(slugify('Test\nEvent')).toBe('test-event');
  });

  it('handles mixed whitespace', () => {
    expect(slugify(' \t Test \n Event \r ')).toBe('test-event');
  });
});

describe('Slugify Edge Cases', () => {
  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles only spaces', () => {
    expect(slugify('   ')).toBe('');
  });

  it('handles only special characters', () => {
    expect(slugify('@#$%^&*()')).toBe('');
  });

  it('handles single character', () => {
    expect(slugify('A')).toBe('a');
  });

  it('handles hyphen-like characters', () => {
    expect(slugify('Test--Event')).toBe('test-event');
  });

  it('handles consecutive hyphens in output', () => {
    expect(slugify('Test!!!Event')).toBe('test-event');
  });

  it('removes leading hyphens', () => {
    expect(slugify('---Test')).toBe('test');
  });

  it('removes trailing hyphens', () => {
    expect(slugify('Test---')).toBe('test');
  });
});

describe('Slugify Length Limiting', () => {
  it('truncates at 48 characters', () => {
    const longText = 'a'.repeat(100);
    const slug = slugify(longText);
    expect(slug.length).toBe(48);
  });

  it('truncates long sentences', () => {
    const longText = 'This is a very long sentence that should be truncated to forty eight characters maximum';
    const slug = slugify(longText);
    expect(slug.length).toBeLessThanOrEqual(48);
  });

  it('handles text shorter than 48 chars unchanged', () => {
    const shortText = 'Short text';
    const slug = slugify(shortText);
    expect(slug).toBe('short-text');
    expect(slug.length).toBeLessThan(48);
  });

  it('truncates at word boundary (after slug conversion)', () => {
    const text = 'word '.repeat(20); // 100 chars
    const slug = slugify(text);
    expect(slug.length).toBe(48);
    // Should not end with hyphen after truncation (removed by cleanup)
    expect(slug.endsWith('-')).toBe(false);
  });
});

describe('Slugify Unicode Handling', () => {
  it('removes non-ASCII letters', () => {
    expect(slugify('Café')).toBe('caf');
  });

  it('removes accented characters', () => {
    expect(slugify('résumé')).toBe('r-sum');
  });

  it('removes emoji', () => {
    expect(slugify('Test 🎉 Event')).toBe('test-event');
  });

  it('removes Chinese characters', () => {
    expect(slugify('Test 中文 Event')).toBe('test-event');
  });

  it('removes Arabic characters', () => {
    expect(slugify('Test العربية Event')).toBe('test-event');
  });

  it('handles mixed ASCII and Unicode', () => {
    expect(slugify('Test café résumé 123')).toBe('test-caf-r-sum-123');
  });
});

describe('Slugify Real-World Event Titles', () => {
  it('handles typical news headline', () => {
    expect(slugify('OpenAI Releases GPT-5')).toBe('openai-releases-gpt-5');
  });

  it('handles corporate announcement', () => {
    expect(slugify('Google DeepMind Merger Announced')).toBe('google-deepmind-merger-announced');
  });

  it('handles regulatory event', () => {
    expect(slugify('EU AI Act Passes Final Vote')).toBe('eu-ai-act-passes-final-vote');
  });

  it('handles technical benchmark', () => {
    expect(slugify('MMLU Score Reaches 95.5%')).toBe('mmlu-score-reaches-95-5');
  });

  it('handles geopolitical event', () => {
    expect(slugify('U.S.-China AI Treaty Signed')).toBe('u-s-china-ai-treaty-signed');
  });

  it('handles safety incident', () => {
    expect(slugify('Model Alignment Failure Detected')).toBe('model-alignment-failure-detected');
  });

  it('handles market event', () => {
    expect(slugify('NVIDIA Stock Hits $1,000/Share')).toBe('nvidia-stock-hits-1-000-share');
  });
});

describe('Slugify Determinism', () => {
  it('produces consistent output for same input', () => {
    const input = 'Test Event 123';
    expect(slugify(input)).toBe(slugify(input));
  });

  it('produces consistent output across multiple calls', () => {
    const input = 'Complex Event @ 2025!';
    const results = [
      slugify(input),
      slugify(input),
      slugify(input),
    ];
    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
  });
});

describe('Slugify URL Safety', () => {
  it('produces URL-safe output (only a-z0-9 and hyphens)', () => {
    const slug = slugify('Test@#Event!123&Special');
    expect(slug).toMatch(/^[a-z0-9-]*$/);
  });

  it('does not produce double hyphens', () => {
    const slug = slugify('Test!!!Event???123');
    expect(slug).not.toContain('--');
  });

  it('does not start with hyphen', () => {
    const slug = slugify('!!!Test');
    expect(slug.startsWith('-')).toBe(false);
  });

  it('does not end with hyphen', () => {
    const slug = slugify('Test!!!');
    expect(slug.endsWith('-')).toBe(false);
  });
});
