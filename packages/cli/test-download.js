#!/usr/bin/env node
/**
 * Test script for download-snapshots functionality
 * Run with: node packages/cli/test-download.js
 */
import { runDownloadSnapshots } from './dist/src/commands/downloadSnapshots.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourcesPath = join(__dirname, '../engine/src/data/snapshots/sources.json');
const outputPath = join(__dirname, '../engine/src/data/snapshots');

console.log('Testing download-snapshots command...');
console.log(`Sources: ${sourcesPath}`);
console.log(`Output: ${outputPath}`);
console.log('');

runDownloadSnapshots({
  sources: sourcesPath,
  output: outputPath,
  force: false,
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
