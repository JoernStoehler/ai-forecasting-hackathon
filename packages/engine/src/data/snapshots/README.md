# Materials Snapshots and Provenance

This directory contains downloaded snapshots of external sources used as research materials for the AI forecasting game.

## Directory Structure

- `sources.json` - List of URLs to download and their metadata
- `sources.example.json` - Example format for sources configuration
- `*.md` - Downloaded markdown snapshots with metadata headers

## Provenance Conventions

Snapshots include provenance information as HTML comments at the top of each file:

```markdown
<!-- SNAPSHOT METADATA
  id: example-source
  url: https://example.com/article
  accessedAt: 2024-01-01T00:00:00.000Z
  tags: ai-safety, governance
-->

# Article Content

...rest of content...
```

### Adding Inline Citations

You can add freeform HTML comments anywhere in materials to cite sources:

```markdown
Recent research shows that scaling laws continue to hold <!-- Source: Kaplan et al. 2020, https://arxiv.org/abs/2001.08361 -->

The safety community has raised concerns about misuse <!-- See: https://example.com/article -->
```

### Important Notes

1. **HTML comments are stripped during prompt building** - The LLM never sees URLs or file references it can't access
2. **No enforced citation syntax** - Use whatever format makes sense for your material
3. **Comments are preserved in source files** - For future post-game reports and player post-mortems

## Downloading Snapshots

### Using the CLI

```bash
# Build the CLI first
npm run build -w packages/cli

# Download snapshots from sources.json
node packages/cli/dist/index.js download-snapshots \
  --sources packages/engine/src/data/snapshots/sources.json \
  --output packages/engine/src/data/snapshots

# Force re-download existing snapshots
node packages/cli/dist/index.js download-snapshots \
  --sources packages/engine/src/data/snapshots/sources.json \
  --output packages/engine/src/data/snapshots \
  --force
```

### Sources File Format

Create a `sources.json` file with this structure:

```json
[
  {
    "id": "unique-identifier",
    "url": "https://example.com/article",
    "tags": ["ai-safety", "governance"]
  },
  {
    "id": "another-source",
    "url": "https://example.org/paper",
    "tags": ["scaling-laws"]
  }
]
```

**Fields:**
- `id` (required): Unique identifier for the snapshot. Used as filename: `{id}.md`
- `url` (required): URL to download and convert
- `tags` (optional): Array of tags for categorization

### How It Works

1. **Download**: Fetches HTML from each URL
2. **Clean**: Removes script/style tags
3. **Convert**: Uses Turndown to convert HTML to markdown
4. **Metadata**: Adds snapshot metadata as HTML comment header
5. **Save**: Writes to `{output}/{id}.md`

### Incremental Updates

By default, the tool skips already-downloaded snapshots:

```bash
# Only downloads new sources not already on disk
node packages/cli/dist/index.js download-snapshots \
  --sources sources.json \
  --output ./snapshots
```

Use `--force` to re-download everything (useful when sources are updated).

## Using Snapshots in Materials

Once downloaded, you can reference snapshots in your materials code:

```typescript
// In packages/engine/src/data/materials.ts
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load snapshots asynchronously at module initialization
const snapshotCache: Record<string, string> = {};

async function loadSnapshot(id: string): Promise<string> {
  if (!snapshotCache[id]) {
    snapshotCache[id] = await readFile(
      join(__dirname, 'snapshots', `${id}.md`),
      'utf-8'
    );
  }
  return snapshotCache[id];
}

// Note: For synchronous loading in module scope, you may need to use
// top-level await (ES2022+) or load materials lazily when needed.
```

Or keep materials as inline strings and add provenance comments:

```typescript
export const MATERIALS: MaterialDoc[] = [
  {
    id: 'custom-analysis',
    title: 'Custom Analysis',
    body: `# Analysis
    
<!-- Sources: 
  - https://example.com/article1
  - https://example.com/article2
  Accessed: 2024-01-01
-->

Content based on multiple sources...`,
  },
];
```

## Testing

The engine includes utilities to strip HTML comments:

```typescript
import { stripHtmlComments, stripCommentsFromMaterials } from '@ai-forecasting/engine';

// Strip comments from a single string
const cleaned = stripHtmlComments(textWithComments);

// Strip comments from materials array
const cleanedMats = stripCommentsFromMaterials(materials);
```

This happens automatically in `preparePrompt()` so prompts never include comments.
