import { describe, expect, it } from 'vitest';
import { coerceScenarioEvents, sortAndDedupEvents, nextDateAfter } from '../src/utils/events.js';
import { ICON_SET } from '../src/constants.js';

const baseEvent = {
  date: '2025-01-01',
  icon: ICON_SET[0],
  title: 'A',
  description: 'B',
};

describe('event utils', () => {
  it('coerces valid payloads', () => {
    const result = coerceScenarioEvents([baseEvent], 'test');
    expect(result).toHaveLength(1);
  });

  it('sorts and dedups by date-title', () => {
    const dup = [{ ...baseEvent, title: 'A' }, { ...baseEvent, title: 'a' }];
    const sorted = sortAndDedupEvents(dup);
    expect(sorted).toHaveLength(1);
  });

  it('increments date correctly', () => {
    const next = nextDateAfter([{ ...baseEvent, date: '2025-02-10' }]);
    expect(next).toBe('2025-02-11');
  });

  it('rejects invalid payload', () => {
    // @ts-expect-error testing invalid path
    expect(() => coerceScenarioEvents([{}], 'bad')).toThrow();
  });
});
