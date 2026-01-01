#!/usr/bin/env node
/**
 * Demonstration: Loading snapshots with provenance and stripping comments for prompts
 * Run with: node packages/cli/demo-provenance.js
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { stripHtmlComments } from '../engine/dist/utils/materials.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function demo() {
  console.log('=== Provenance Demo ===\n');
  
  // Load the example snapshot
  const snapshotPath = join(__dirname, '../engine/src/data/snapshots/example-ai-safety-article.md');
  const rawContent = await readFile(snapshotPath, 'utf-8');
  
  console.log('1. RAW SNAPSHOT (with provenance comments):');
  console.log('---');
  console.log(rawContent.substring(0, 500) + '...\n');
  
  // Strip comments as done during prompt preparation
  const cleanedContent = stripHtmlComments(rawContent);
  
  console.log('2. CLEANED CONTENT (sent to LLM):');
  console.log('---');
  console.log(cleanedContent.substring(0, 500) + '...\n');
  
  // Show what was removed
  const commentCount = (rawContent.match(/<!--[\s\S]*?-->/g) || []).length;
  const sizeBefore = rawContent.length;
  const sizeAfter = cleanedContent.length;
  
  console.log('3. SUMMARY:');
  console.log(`   - Comments removed: ${commentCount}`);
  console.log(`   - Size before: ${sizeBefore} chars`);
  console.log(`   - Size after: ${sizeAfter} chars`);
  console.log(`   - Reduction: ${sizeBefore - sizeAfter} chars (${Math.round((1 - sizeAfter/sizeBefore) * 100)}%)`);
  
  // Verify no comments remain
  const hasComments = /<!--/.test(cleanedContent);
  console.log(`   - Comments in cleaned text: ${hasComments ? 'YES (ERROR!)' : 'NO (correct!)'}`);
  
  console.log('\n✓ Demo complete: Provenance comments are preserved in source but stripped from prompts');
}

demo().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
