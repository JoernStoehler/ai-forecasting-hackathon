import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import TurndownService from 'turndown';

/**
 * Downloads URLs and converts them to cleaned markdown snapshots.
 * Stores metadata (url, accessedAt) as HTML comments at the top of each file.
 */

interface Source {
  id: string;
  url: string;
  tags?: string[];
}

interface SnapshotMetadata {
  id: string;
  url: string;
  accessedAt: string;
  tags?: string[];
}

export async function runDownloadSnapshots(opts: {
  sources: string;
  output: string;
  force?: boolean;
}) {
  const sources = await readSources(opts.sources);
  const outputDir = opts.output;

  await mkdir(outputDir, { recursive: true });

  const results: { id: string; status: 'downloaded' | 'skipped' | 'failed'; error?: string }[] = [];

  for (const source of sources) {
    const outputPath = join(outputDir, `${source.id}.md`);
    
    // Skip if file exists and not force
    if (!opts.force && existsSync(outputPath)) {
      console.log(`[skip] ${source.id} (already exists, use --force to re-download)`);
      results.push({ id: source.id, status: 'skipped' });
      continue;
    }

    try {
      console.log(`[download] ${source.id} from ${source.url}`);
      const markdown = await downloadAndConvert(source);
      await writeFile(outputPath, markdown, 'utf-8');
      console.log(`[saved] ${outputPath}`);
      results.push({ id: source.id, status: 'downloaded' });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[failed] ${source.id}: ${errorMsg}`);
      results.push({ id: source.id, status: 'failed', error: errorMsg });
    }
  }

  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Downloaded: ${results.filter(r => r.status === 'downloaded').length}`);
  console.log(`Skipped: ${results.filter(r => r.status === 'skipped').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);

  const failed = results.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    console.log('\nFailed downloads:');
    failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
  }
}

async function readSources(path: string): Promise<Source[]> {
  const content = await readFile(path, 'utf-8');
  const sources = JSON.parse(content);
  
  if (!Array.isArray(sources)) {
    throw new Error('sources.json must contain an array');
  }

  for (const source of sources) {
    if (!source.id || typeof source.id !== 'string') {
      throw new Error('Each source must have a string "id" field');
    }
    if (!source.url || typeof source.url !== 'string') {
      throw new Error('Each source must have a string "url" field');
    }
  }

  return sources;
}

async function downloadAndConvert(source: Source): Promise<string> {
  const response = await fetch(source.url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  // Basic cleanup: remove script and style tags
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  const markdown = turndown.turndown(cleaned);

  // Create metadata header
  const metadata: SnapshotMetadata = {
    id: source.id,
    url: source.url,
    accessedAt: new Date().toISOString(),
    tags: source.tags,
  };

  const header = createMetadataHeader(metadata);
  
  return `${header}\n\n${markdown.trim()}\n`;
}

function createMetadataHeader(metadata: SnapshotMetadata): string {
  const lines = [
    '<!-- SNAPSHOT METADATA',
    `  id: ${metadata.id}`,
    `  url: ${metadata.url}`,
    `  accessedAt: ${metadata.accessedAt}`,
  ];
  
  if (metadata.tags && metadata.tags.length > 0) {
    lines.push(`  tags: ${metadata.tags.join(', ')}`);
  }
  
  lines.push('-->');
  
  return lines.join('\n');
}
