/**
 * Icon validation tests
 *
 * Purpose: Verify only valid Lucide icons are accepted in events
 * Why: Invalid icons would break UI rendering and should be caught early
 */
import { describe, it, expect } from 'vitest';
import { coerceEngineEvents } from '../src/utils/events.js';
import { ICON_SET } from '../src/constants.js';

describe('Valid Icon Acceptance', () => {
  it('accepts all icons from ICON_SET', () => {
    const events = ICON_SET.map((icon, i) => ({
      type: 'news-published',
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      icon,
      title: `Event with ${icon}`,
      description: `Test event for ${icon} icon`,
    }));

    const result = coerceEngineEvents(events, 'icon-test');

    expect(result).toHaveLength(ICON_SET.length);
    expect(result.every((e, i) => e.icon === ICON_SET[i])).toBe(true);
  });

  it('accepts Globe icon (commonly used)', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'Test',
      description: 'Test',
    };

    const result = coerceEngineEvents([event], 'test');
    expect(result[0].icon).toBe('Globe');
  });

  it('accepts Landmark icon', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Landmark',
      title: 'Test',
      description: 'Test',
    };

    const result = coerceEngineEvents([event], 'test');
    expect(result[0].icon).toBe('Landmark');
  });

  it('accepts BrainCircuit icon', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'BrainCircuit',
      title: 'Test',
      description: 'Test',
    };

    const result = coerceEngineEvents([event], 'test');
    expect(result[0].icon).toBe('BrainCircuit');
  });
});

describe('Invalid Icon Rejection', () => {
  it('rejects lowercase icon names', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'globe', // Should be 'Globe'
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects kebab-case icon names', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'brain-circuit', // Should be 'BrainCircuit'
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects camelCase icon names', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'brainCircuit', // Should be 'BrainCircuit'
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects non-existent icon names', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 'Unicorn', // Not in ICON_SET
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects empty string icon', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: '',
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects numeric icon values', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: 123,
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects null icon', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: null,
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects undefined icon', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: undefined,
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('rejects similar but wrong icon names', () => {
    const invalidIcons = [
      'World', // Similar to Globe
      'Brain', // Similar to BrainCircuit
      'Factory2', // Similar to Factory
      'Landmarks', // Plural of Landmark
      'DollarSigns', // Plural of DollarSign
    ];

    for (const icon of invalidIcons) {
      const event = {
        type: 'news-published',
        date: '2025-01-01',
        icon,
        title: 'Test',
        description: 'Test',
      };

      expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
    }
  });
});

describe('Icon Validation in Different Event Types', () => {
  it('validates icons in hidden-news-published events', () => {
    const validEvent = {
      type: 'hidden-news-published',
      date: '2025-01-01',
      icon: 'Landmark',
      title: 'Hidden Event',
      description: 'Test',
    };

    const result = coerceEngineEvents([validEvent], 'test');
    expect(result[0].icon).toBe('Landmark');

    // Invalid icon should be rejected
    const invalidEvent = {
      type: 'hidden-news-published',
      date: '2025-01-01',
      icon: 'InvalidIcon',
      title: 'Hidden Event',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([invalidEvent] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('validates icons in patched events', () => {
    const baseEvent = {
      type: 'news-published',
      id: 'event-1',
      date: '2025-01-01',
      icon: 'Globe',
      title: 'Original',
      description: 'Original',
    };

    const patchEvent = {
      type: 'news-patched',
      targetId: 'event-1',
      date: '2025-01-02',
      patch: {
        icon: 'Landmark', // Valid icon change
      },
    };

    const result = coerceEngineEvents([baseEvent, patchEvent], 'test');
    expect(result).toHaveLength(2);

    // Invalid icon in patch should be rejected
    const invalidPatch = {
      type: 'news-patched',
      targetId: 'event-1',
      date: '2025-01-02',
      patch: {
        icon: 'InvalidIcon',
      },
    };

    expect(() => coerceEngineEvents([baseEvent, invalidPatch] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });
});

describe('Icon Case Sensitivity', () => {
  it('is case-sensitive (exact match required)', () => {
    const testCases = [
      { icon: 'GLOBE', expected: false },
      { icon: 'Globe', expected: true },
      { icon: 'globe', expected: false },
      { icon: 'gLoBe', expected: false },
      { icon: 'BRAINCIRCUIT', expected: false },
      { icon: 'BrainCircuit', expected: true },
      { icon: 'braincircuit', expected: false },
    ];

    for (const { icon, expected } of testCases) {
      const event = {
        type: 'news-published',
        date: '2025-01-01',
        icon,
        title: 'Test',
        description: 'Test',
      };

      if (expected) {
        const result = coerceEngineEvents([event] as any, 'test');
        expect(result).toHaveLength(1);
      } else {
        expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
      }
    }
  });
});

describe('Icon Edge Cases', () => {
  it('handles icon with extra whitespace (should reject)', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: ' Globe ',
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('handles icon as object (should reject)', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: { name: 'Globe' },
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('handles icon as array (should reject)', () => {
    const event = {
      type: 'news-published',
      date: '2025-01-01',
      icon: ['Globe'],
      title: 'Test',
      description: 'Test',
    };

    expect(() => coerceEngineEvents([event] as any, 'test')).toThrow('Invalid EngineEvent payload');
  });

  it('verifies all 27 icons in ICON_SET are unique', () => {
    const iconSet = new Set(ICON_SET);
    expect(iconSet.size).toBe(ICON_SET.length); // No duplicates
  });
});
