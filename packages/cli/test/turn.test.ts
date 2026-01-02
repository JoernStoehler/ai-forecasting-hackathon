import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runTurn } from '../src/commands/turn.js';

describe('runTurn', () => {
  it('runs a full turn and emits player + GM markers in output history', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-turn-'));
    const newEvents = join(dir, 'new-events.jsonl');
    const outputPrompt = join(dir, 'prompt.json');
    const outputResponse = join(dir, 'response.json');
    const outputEvents = join(dir, 'events.jsonl');
    const outputHistory = join(dir, 'history.jsonl');
    const outputState = join(dir, 'state.json');

    const playerEvent = {
      type: 'news-published',
      date: '2025-01-02',
      icon: 'Landmark',
      title: 'Player event',
      description: 'Player action.',
    };
    await writeFile(newEvents, `${JSON.stringify(playerEvent)}\n`, 'utf-8');

    await runTurn({
      newEvents,
      outputPrompt,
      outputResponse,
      outputEvents,
      outputHistory,
      outputState,
      materials: 'none',
      model: 'gemini-2.5-flash',
      systemPrompt: '',
      mock: true,
    });

    const historyLines = (await readFile(outputHistory, 'utf-8')).split(/\r?\n/).filter(Boolean);
    const history = historyLines.map(line => JSON.parse(line));

    const markerTypes = history
      .filter((evt: { type: string }) => evt.type === 'turn-started' || evt.type === 'turn-finished')
      .map((evt: { actor: string }) => evt.actor);

    expect(markerTypes).toContain('player');
    expect(markerTypes).toContain('game_master');
    expect(markerTypes.filter(actor => actor === 'player')).toHaveLength(2);
    expect(markerTypes.filter(actor => actor === 'game_master')).toHaveLength(2);
  });
});
