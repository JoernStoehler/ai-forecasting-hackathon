import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createReplayForecaster } from '@/engine/adapters/replayForecaster.js';
import { buildGenerateContentRequest } from '@/engine/forecaster/geminiStreaming.js';
import { createEngine } from '@/engine/index.js';
import { ICON_SET } from '@/engine/constants.js';

const baseHistory = [
  {
    type: 'news-published',
    date: '2025-01-01',
    icon: ICON_SET[0],
    title: 'Seed',
    description: 'Seed event',
  },
];

function writeTape(overrides: Partial<Record<'systemPrompt', string>> = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'replay-'));
  const path = join(dir, 'tape.json');
  const request = buildGenerateContentRequest({
    model: 'gemini-2.5-flash',
    history: baseHistory,
    systemPrompt: overrides.systemPrompt ?? 'PROMPT',
  });
  const tape = {
    meta: {
      model: 'gemini-2.5-flash',
      recordedAt: '2025-12-10T00:00:00Z',
    },
    request,
    stream: [
      {
        delayNs: 0,
        text: JSON.stringify([
          {
            type: 'publish-news',
            date: '2025-01-02',
            icon: ICON_SET[1],
            title: 'Replay event',
            description: 'From tape',
          },
        ]),
      },
    ],
  };
  writeFileSync(path, JSON.stringify(tape, null, 2));
  return path;
}

describe('replay forecaster', () => {
  it('replays events from tape', async () => {
    const tapePath = writeTape();
    const forecaster = createReplayForecaster({ tapePath });
    const engine = createEngine({ forecaster, systemPrompt: 'PROMPT' });

    const result = await engine.forecast(baseHistory);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Replay event');
  });

  it('throws on systemPrompt mismatch when strict', async () => {
    const tapePath = writeTape({ systemPrompt: 'PROMPT-A' });
    const forecaster = createReplayForecaster({ tapePath, strict: true });
    const engine = createEngine({ forecaster, systemPrompt: 'PROMPT-B' });
    await expect(engine.forecast(baseHistory)).rejects.toThrow(/request mismatch/i);
  });
});
