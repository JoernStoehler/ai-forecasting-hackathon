# CLI Test Suite

Comprehensive test coverage for the AI Forecasting CLI, covering all commands, error scenarios, and documenting unimplemented features.

## Test Files

### ✅ Command Tests (Should Pass)

- **`aggregate.test.ts`** - Tests for `aggregate` command (6 tests)
  - Event merging and deduplication
  - Chronological sorting
  - Empty history handling
  - Multiline JSONL support

- **`prepare.test.ts`** - Tests for `prepare` command (5 tests)
  - Prompt generation from history
  - Materials inclusion
  - JSON response configuration
  - Event projection into prompts

- **`parse.test.ts`** - Tests for `parse` command (1 test)
  - Command array to event JSONL conversion

- **`turn.test.ts`** - Tests for `turn` command (1 test)
  - Full turn pipeline with mock forecaster
  - Turn marker generation

### ⚠️ Conditional Tests (Require External Resources)

- **`call.test.ts`** - Tests for `call` command (3 tests, 2 skipped)
  - API key validation (passing)
  - Gemini API calls (skipped - requires API key)
  - Error handling (skipped - requires API)

- **`download-snapshots.test.ts`** - Tests for `download-snapshots` command (6 tests, 5 skipped)
  - Error handling for missing files (passing)
  - Network downloads (skipped - requires network)
  - HTML to Markdown conversion (skipped)
  - Provenance tracking (skipped)

### 🔍 Error Handling Tests

- **`error-handling.test.ts`** - Comprehensive error scenarios (12 tests)
  - Invalid JSON/JSONL handling
  - Missing file handling
  - Invalid event structures
  - Large file handling
  - Edge cases (empty logs, duplicate timestamps)

### ❌ Unimplemented Feature Tests (Intentionally Failing)

- **`unimplemented-features.test.ts`** - Tests for planned features (30+ tests, all skipped)
  - Cassette replay system (6 tests)
  - Advanced materials system (3 tests)
  - PRNG/dice rolling (3 tests)
  - Advanced turn features (4 tests)
  - Output formatting (4 tests)
  - Validation/linting (3 tests)
  - Development tools (4 tests)
  - AI Studio Build integration (2 tests)
  - Performance optimizations (3 tests)

## Running Tests

### Run All Tests
```bash
npm test -w @ai-forecasting/cli
```

### Run Specific Test File
```bash
npm test -w @ai-forecasting/cli aggregate.test.ts
```

### Run Only Passing Tests
```bash
npm test -w @ai-forecasting/cli -- --grep-invert "UNIMPLEMENTED|REQUIRES_API_KEY|REQUIRES_NETWORK"
```

### Run With Coverage
```bash
npm test -w @ai-forecasting/cli -- --coverage
```

## Test Markers

Tests use prefixes to indicate status:

- **No prefix** - Implemented feature, should pass
- **`REQUIRES_API_KEY:`** - Needs Gemini API key, skipped in CI
- **`REQUIRES_NETWORK:`** - Needs internet access, skipped in CI
- **`UNIMPLEMENTED:`** - Feature not yet built, documents requirements

## Test Statistics

### Current Coverage
- **Total test files**: 8
- **Total tests**: ~55
- **Passing**: ~25 (core commands, error handling)
- **Skipped (external dependencies)**: ~5
- **Skipped (unimplemented)**: ~30

### Commands Covered
- ✅ `aggregate` - 6 tests
- ✅ `prepare` - 5 tests
- ✅ `parse` - 1 test
- ✅ `turn` - 1 test
- ⚠️ `call` - 1 passing, 2 skipped
- ⚠️ `download-snapshots` - 1 passing, 5 skipped

### Error Scenarios Covered
- ✅ Invalid JSON/JSONL
- ✅ Missing files
- ✅ Invalid event structures
- ✅ Empty event logs
- ✅ Large files (1000+ events)
- ✅ Duplicate timestamps

## Adding New Tests

### For Existing Commands
1. Add tests to relevant command test file
2. Follow existing patterns for file I/O and assertions
3. Use temporary directories for isolation (`mkdtemp`)
4. Clean up is automatic (temp dirs deleted after tests)

### For New Commands
1. Create new test file: `test/command-name.test.ts`
2. Follow structure of existing command tests
3. Include basic happy path + error scenarios
4. Update this README with test count

### For Unimplemented Features
1. Add to `unimplemented-features.test.ts`
2. Use `.skip()` with `UNIMPLEMENTED:` marker
3. Write test as if feature exists (executable spec)
4. Include clear comment about what needs implementing

## Test Patterns

### File I/O Pattern
```typescript
const dir = await mkdtemp(join(tmpdir(), 'cli-test-'));
const inputFile = join(dir, 'input.jsonl');
const outputFile = join(dir, 'output.json');

await writeFile(inputFile, data, 'utf-8');
await runCommand({ inputFile, outputFile });

const result = JSON.parse(await readFile(outputFile, 'utf-8'));
expect(result).toMatchObject({ ... });
```

### Error Handling Pattern
```typescript
await expect(
  runCommand({ invalidInput })
).rejects.toThrow();
```

### Skipped Test Pattern
```typescript
it.skip('UNIMPLEMENTED: feature description', async () => {
  // Test code as if feature exists
  // This documents requirements
});
```

## CI Integration

Tests run automatically in GitHub Actions CI pipeline (`.github/workflows/ci.yml`).

**CI runs:**
- All unit tests (passing)
- Excludes tests marked `REQUIRES_API_KEY` or `REQUIRES_NETWORK`
- Excludes tests marked `UNIMPLEMENTED`

**To update CI:**
```yaml
- name: CLI Tests
  run: npm test -w @ai-forecasting/cli -- --grep-invert "UNIMPLEMENTED|REQUIRES"
```

## Common Issues

### "Cannot find module" errors
- Run `npm install` to ensure dependencies are installed
- Check that CLI package is built: `npm run build -w @ai-forecasting/cli`

### Tests hanging
- Check for missing `await` in async operations
- Ensure temporary files are properly cleaned up
- Use `--no-coverage` flag to speed up tests

### Flaky tests
- Increase timeouts if needed
- Check for race conditions in file I/O
- Use deterministic test data (avoid timestamps)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Node.js fs/promises API](https://nodejs.org/api/fs.html#promises-api)
- [CLI Source Code](../src/)
- [Main Project README](../../../README.md)
