/**
 * Tests for the 'download-snapshots' command
 */
import { mkdtemp, readFile, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { runDownloadSnapshots } from '../src/commands/downloadSnapshots.js';

describe('download-snapshots command', () => {
  it.skip('REQUIRES_NETWORK: downloads snapshots from URLs', async () => {
    // This test requires network access and is slow
    // Skip in automated tests

    const dir = await mkdtemp(join(tmpdir(), 'cli-snapshots-'));
    const sources = join(dir, 'sources.json');
    const output = join(dir, 'snapshots');

    // Create minimal sources file
    const sourcesData = {
      snapshots: [
        {
          url: 'https://example.com/test.html',
          filename: 'test-snapshot.md',
        },
      ],
    };

    await writeFile(sources, JSON.stringify(sourcesData), 'utf-8');

    await runDownloadSnapshots({
      sources,
      output,
      force: false,
    });

    // Check that snapshot file was created
    const snapshotPath = join(output, 'test-snapshot.md');
    await expect(access(snapshotPath)).resolves.toBeUndefined();
  });

  it('throws error when sources file is missing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-snapshots-nosources-'));
    const sources = join(dir, 'nonexistent.json');
    const output = join(dir, 'snapshots');

    await expect(
      runDownloadSnapshots({
        sources,
        output,
        force: false,
      })
    ).rejects.toThrow();
  });

  it.skip('REQUIRES_NETWORK: respects force flag for re-downloading', async () => {
    // Test that --force re-downloads existing snapshots
  });

  it.skip('REQUIRES_NETWORK: handles download failures gracefully', async () => {
    // Test error handling for 404s, timeouts, etc.
  });

  it.skip('REQUIRES_NETWORK: converts HTML to Markdown', async () => {
    // Test that downloaded HTML is properly converted
  });

  it.skip('REQUIRES_NETWORK: adds provenance comments to snapshots', async () => {
    // Test that HTML comments with source URLs are added
  });
});
