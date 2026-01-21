#!/usr/bin/env node
/**
 * Build AI Studio Build-compatible deployment
 *
 * Prerequisites:
 * - Run `npm run build` first to generate compiled CSS
 *
 * Transforms source code to work in AI Studio Build environment:
 * - Copies pre-compiled CSS from dist/assets/ as styles.css
 * - Replaces import.meta.env.GEMINI_API_KEY with process.env.API_KEY
 * - Converts @/ path aliases to relative paths
 * - Creates flat structure with index.html, index.tsx, metadata.json
 * - Preserves directory structure (engine/, components/, services/)
 * - Outputs to ai-studio-build/ directory and zips it
 *
 * Output: ai-studio-deploy.zip
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const webappSrc = path.join(projectRoot, 'packages/webapp/src');
const webappDist = path.join(projectRoot, 'packages/webapp/dist');
const buildDir = path.join(projectRoot, 'ai-studio-build');
const outputZip = path.join(projectRoot, 'ai-studio-deploy.zip');

// Files to exclude from source copy
const EXCLUDE_PATTERNS = [
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /\/tests?\//,
  // Node.js-only files (use node:fs, node:path, etc.)
  /\/replayClient\.ts$/,
  /\/node\.ts$/,
  /\/geminiNodeForecaster\.ts$/,
  /\/replayForecaster\.ts$/, // depends on replayClient
];

/**
 * Transform TypeScript/TSX source code for AI Studio Build
 */
function transformSourceCode(content, filePath) {
  let transformed = content;

  // Replace ALL import.meta.env with process.env for Vite env vars
  // This makes the code work in AI Studio Build which uses process.env
  transformed = transformed.replace(
    /import\.meta\.env\./g,
    'process.env.'
  );

  // Replace @/ path aliases with relative paths
  // Calculate correct relative path based on file location
  transformed = transformed.replace(
    /@\/([^'"\s]+)/g,
    (match, importPath) => {
      // Calculate relative path from current file to root
      const relativePath = getRelativePathToRoot(filePath);
      return relativePath + importPath;
    }
  );

  // Remove import attributes (with { type: 'json' }) which aren't widely supported
  // Transform: import foo from './bar.json' with { type: 'json' };
  // To: import foo from './bar.json';
  transformed = transformed.replace(
    /from\s+(['"][^'"]+\.json['"])\s+with\s+\{[^}]+\}\s*;/g,
    'from $1;'
  );

  return transformed;
}

/**
 * Get relative path from a file back to the src root
 */
function getRelativePathToRoot(filePath) {
  // filePath is the relative path from build root (e.g., "services/geminiService.ts")
  // We need to go up the directory tree to get back to root
  if (!filePath || filePath === '') return './';

  const depth = filePath.split(path.sep).filter(p => p !== '.').length - 1;
  if (depth <= 0) return './';
  return '../'.repeat(depth);
}

/**
 * Copy and transform source files
 */
function copyAndTransformFiles(srcDir, destDir, relativePath = '') {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const relPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyAndTransformFiles(srcPath, destPath, relPath);
    } else {
      // Check if file should be excluded
      if (EXCLUDE_PATTERNS.some(pattern => pattern.test(relPath))) {
        continue;
      }

      // Transform .ts and .tsx files
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(srcPath, 'utf-8');
        // Pass the relative path for import calculation
        const transformed = transformSourceCode(content, relPath);
        fs.writeFileSync(destPath, transformed, 'utf-8');
        console.log(`  ✓ ${relPath}`);
      } else {
        // Copy other files as-is
        fs.copyFileSync(srcPath, destPath);
        console.log(`  → ${relPath}`);
      }
    }
  }
}

/**
 * Create index.html entry point
 */
function createIndexHtml() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Forecasting Game</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(buildDir, 'index.html'), html, 'utf-8');
  console.log('  ✓ index.html');
}

/**
 * Create index.tsx entry point (copy from src/index.tsx)
 */
function createIndexTsx() {
  const indexTsxPath = path.join(webappSrc, 'index.tsx');
  const content = fs.readFileSync(indexTsxPath, 'utf-8');

  // Transform the content
  const transformed = transformSourceCode(content, '');

  fs.writeFileSync(path.join(buildDir, 'index.tsx'), transformed, 'utf-8');
  console.log('  ✓ index.tsx');
}

/**
 * Create metadata.json
 */
function createMetadataJson() {
  const metadata = {
    name: "AI Forecasting Game",
    description: "Serious policy simulation for AI x-risk scenarios",
    version: "0.1.0"
  };

  fs.writeFileSync(
    path.join(buildDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );
  console.log('  ✓ metadata.json');
}

/**
 * Copy compiled CSS from dist/assets
 */
function copyCss() {
  const assetsDir = path.join(webappDist, 'assets');

  if (!fs.existsSync(assetsDir)) {
    throw new Error('dist/assets not found. Please run "npm run build" first.');
  }

  // Find the CSS file (it has a hash in the name like index-D51Jb6Cm.css)
  const files = fs.readdirSync(assetsDir);
  const cssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));

  if (!cssFile) {
    throw new Error('No compiled CSS file found in dist/assets. Please run "npm run build" first.');
  }

  const srcCss = path.join(assetsDir, cssFile);
  const destCss = path.join(buildDir, 'styles.css');

  fs.copyFileSync(srcCss, destCss);
  console.log('  ✓ styles.css');
}

/**
 * Create ZIP archive
 */
async function createZip() {
  // Delete existing zip if it exists
  if (fs.existsSync(outputZip)) {
    fs.unlinkSync(outputZip);
  }

  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeKB = (archive.pointer() / 1024).toFixed(0);
      console.log(`\n✅ ZIP created: ai-studio-deploy.zip (${sizeKB} KB)`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all files from build directory to ZIP root
    archive.directory(buildDir, false);

    archive.finalize();
  });
}

/**
 * Main build process
 */
async function build() {
  console.log('🏗️  Building AI Studio Build deployment...\n');

  // Clean and create build directory
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  console.log('📝 Creating entry files:');
  createIndexHtml();
  createIndexTsx();
  createMetadataJson();

  console.log('\n🎨 Copying compiled CSS:');
  copyCss();

  console.log('\n📦 Copying and transforming source files:');
  copyAndTransformFiles(webappSrc, buildDir);

  console.log('\n🗜️  Creating ZIP archive...');
  await createZip();

  console.log('\n📋 Next steps:');
  console.log('1. Go to https://aistudio.google.com');
  console.log('2. Select "Build mode" from left sidebar');
  console.log('3. Create a new app');
  console.log('4. Click "Upload zip file" button');
  console.log('5. Upload ai-studio-deploy.zip');
  console.log('6. Test in Preview tab');
  console.log('\n💡 The app will use viewers\' Gemini API quota automatically');
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
