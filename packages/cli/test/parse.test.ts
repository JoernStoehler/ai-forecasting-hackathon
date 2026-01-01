import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runParse } from '../src/commands/parse.js';

describe('runParse', () => {
  it('parses Command[] from response.text into EngineEvent JSONL', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-parse-'));
    const inputJson = join(dir, 'input.json');
    const outputEvents = join(dir, 'output.jsonl');
    const commands = [
      {
        type: 'publish-news',
        date: '2025-01-02',
        icon: 'Landmark',
        title: 'Test headline',
        description: 'Test description',
      },
      {
        type: 'publish-hidden-news',
        date: '2025-01-03',
        icon: 'Cpu',
        title: 'Hidden headline',
        description: 'Hidden description',
      },
      {
        type: 'patch-news',
        id: 'news-2025-01-02-test-headline',
        date: '2025-01-02',
        patch: {
          title: 'Updated headline',
        },
      },
      {
        type: 'game-over',
        date: '2025-01-04',
        summary: 'Simulation ends.',
      },
    ];

    await writeFile(inputJson, JSON.stringify({ response: { text: JSON.stringify(commands) } }), 'utf-8');
    await runParse({ inputJson, outputEvents });

    const lines = (await readFile(outputEvents, 'utf-8')).split(/\r?\n/).filter(Boolean);
    const events = lines.map(line => JSON.parse(line));

    expect(events).toHaveLength(4);
    expect(events[0]).toMatchObject({
      type: 'news-published',
      title: 'Test headline',
    });
    expect(events[1]).toMatchObject({
      type: 'hidden-news-published',
      title: 'Hidden headline',
    });
    expect(events[2]).toMatchObject({
      type: 'news-patched',
      id: 'news-2025-01-02-test-headline',
    });
    expect(events[3]).toMatchObject({
      type: 'game-over',
      summary: 'Simulation ends.',
    });
  });
});
