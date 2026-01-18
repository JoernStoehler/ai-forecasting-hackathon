#!/usr/bin/env tsx
/**
 * Distill source materials into GM-optimized materials.ts
 *
 * Reads markdown files from materials-source/
 * Applies compression rules
 * Generates src/engine/data/materials.ts
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface SourceMaterial {
  filename: string;
  content: string;
}

// Simple compression rules - adjust based on expert feedback
function compress(text: string): string {
  // Remove HTML comments (provenance metadata)
  let compressed = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove multiple blank lines
  compressed = compressed.replace(/\n\n+/g, '\n\n');

  // Trim whitespace
  compressed = compressed.trim();

  // TODO: Add more sophisticated compression based on expert review
  // - Remove verbose explanations while keeping core content
  // - Compress examples while preserving key details
  // - Keep technical precision

  return compressed;
}

// Generate material ID from filename
function generateId(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/^[0-9]+-/, '') // Remove number prefixes like "01-"
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
}

// Generate title from content (first heading) or filename
function extractTitle(content: string, filename: string): string {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1];
  }
  // Fallback to filename
  return filename
    .replace(/\.md$/, '')
    .replace(/^[0-9]+-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

async function loadSourceMaterials(): Promise<SourceMaterial[]> {
  const sourceDir = join(process.cwd(), 'materials-source');
  const files = await readdir(sourceDir);

  const materials: SourceMaterial[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    if (file === 'README.md') continue; // Skip documentation
    if (file === 'example.md') continue; // Skip example

    const content = await readFile(join(sourceDir, file), 'utf-8');
    materials.push({ filename: file, content });
  }

  return materials;
}

async function generateMaterialsTs(materials: SourceMaterial[]): Promise<void> {
  const outputPath = join(process.cwd(), 'src/engine/data/materials.ts');

  // Generate TypeScript file
  let output = `/**
 * Shared prompt/background materials for all frontends.
 * Keeping the content in TS avoids bundler quirks across environments.
 *
 * GENERATED FILE - DO NOT EDIT MANUALLY
 * Source: materials-source/*.md
 * Generated: ${new Date().toISOString()}
 * Run: npm run distill-materials
 */
export interface MaterialDoc {
  id: string;
  title: string;
  body: string;
}

export const MATERIALS: MaterialDoc[] = [\n`;

  for (const material of materials) {
    const id = generateId(material.filename);
    const title = extractTitle(material.content, material.filename);
    const body = compress(material.content);

    // Escape backticks and backslashes for template literal
    const escapedBody = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');

    output += `  {\n`;
    output += `    id: '${id}',\n`;
    output += `    title: '${title}',\n`;
    output += `    body: \`${escapedBody}\`,\n`;
    output += `  },\n`;
  }

  output += `];\n`;

  await writeFile(outputPath, output, 'utf-8');

  console.log(`✓ Generated materials.ts with ${materials.length} material(s)`);
  for (const material of materials) {
    const compressed = compress(material.content);
    console.log(`  - ${material.filename} → ${compressed.length} chars`);
  }
}

async function main() {
  try {
    console.log('Loading source materials from materials-source/...');
    const materials = await loadSourceMaterials();

    if (materials.length === 0) {
      console.log('⚠️  No source materials found (excluding README.md and example.md)');
      console.log('   Add .md files to materials-source/ and run this script again');
      process.exit(0);
    }

    console.log(`Found ${materials.length} source material(s)`);

    await generateMaterialsTs(materials);

    console.log('\n✓ Done! Review the generated src/engine/data/materials.ts');
    console.log('  Then test with: npm run build && npm test');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
