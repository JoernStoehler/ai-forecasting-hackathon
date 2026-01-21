#!/usr/bin/env node
/**
 * Create Deployment ZIP for AI Studio Build
 *
 * This script packages the webapp source code for deployment to Google AI Studio Build.
 * See docs/deployment.md for full deployment instructions.
 *
 * Usage: npm run deploy:zip
 */

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const OUTPUT_FILE = path.join(projectRoot, 'webapp-deployment.zip');

// Files and directories to include (relative to project root)
const INCLUDES = [
  'packages/webapp/src',
  'packages/webapp/index.html',
  'packages/webapp/vite.config.ts',
  'packages/webapp/tsconfig.json',
  'packages/webapp/package.json',
];

// Patterns to exclude
const EXCLUDES = [
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/tests/**',
  '**/node_modules/**',
  '**/.DS_Store',
  '**/dist/**',
];

async function createDeploymentZip() {
  console.log('Creating deployment ZIP for AI Studio Build...\n');

  // Remove existing ZIP if present
  if (fs.existsSync(OUTPUT_FILE)) {
    console.log('Removing existing webapp-deployment.zip...');
    fs.unlinkSync(OUTPUT_FILE);
  }

  // Create output stream
  const output = fs.createWriteStream(OUTPUT_FILE);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Handle completion
  output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Deployment ZIP created successfully!`);
    console.log(`   File: ${path.basename(OUTPUT_FILE)}`);
    console.log(`   Size: ${sizeInMB} MB`);
    console.log(`\nNext steps:`);
    console.log(`1. Upload webapp-deployment.zip to AI Studio Build`);
    console.log(`2. See docs/deployment.md for full deployment instructions`);
  });

  // Handle warnings
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err.message);
    } else {
      throw err;
    }
  });

  // Handle errors
  archive.on('error', (err) => {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add files to archive
  console.log('Adding files to archive:');
  for (const include of INCLUDES) {
    const fullPath = path.join(projectRoot, include);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      console.log(`  📁 ${include}/`);

      // Use glob pattern for archiver
      archive.glob('**/*', {
        cwd: fullPath,
        ignore: [
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/test/**',
          '**/tests/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/.DS_Store'
        ]
      }, {
        prefix: include
      });
    } else {
      console.log(`  📄 ${include}`);
      archive.file(fullPath, { name: include });
    }
  }

  // Finalize the archive
  await archive.finalize();
}

// Run the script
createDeploymentZip().catch((err) => {
  console.error('❌ Error creating deployment ZIP:', err);
  process.exit(1);
});
