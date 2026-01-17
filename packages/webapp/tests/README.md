# E2E Test Suite

Comprehensive end-to-end tests for the AI Forecasting webapp using Playwright.

## Test Files

### ✅ Implemented Feature Tests (Should Pass)

- **`smoke.spec.ts`** - Basic smoke test (app loads without errors)
- **`timeline.spec.ts`** - Timeline display, navigation, event interactions
- **`search.spec.ts`** - Search functionality and filtering
- **`import-export.spec.ts`** - JSON import/export functionality
- **`persistence.spec.ts`** - localStorage persistence and recovery

### ⚠️ Partially Testable (Some tests skipped, require mocks)

- **`turn-cycle.spec.ts`** - Player turn creation and GM response cycle
  - Basic UI tests pass
  - Full turn cycle tests skipped (require Gemini API mock)
- **`error-handling.spec.ts`** - Error scenarios and edge cases
  - Input validation tests pass
  - Network/API failure tests skipped (require failure mocks)

### ❌ Unimplemented Feature Tests (Intentionally Failing)

- **`unimplemented-features.spec.ts`** - Tests for features not yet built
  - Post-game analysis screen
  - Hidden news system
  - Tutorial/onboarding
  - Advanced materials selection
  - PRNG/dice rolling system
  - AI Studio Build deployment
  - Complete cassette replay
  - Dark mode and settings
  - Full accessibility
  - Performance optimizations

## Running Tests

### Run All Tests
```bash
npm run test:e2e -w packages/webapp
```

### Run Specific Test File
```bash
npm run test:e2e -w packages/webapp -- timeline.spec.ts
```

### Run by Browser
```bash
# Firefox only
npm run test:e2e -w packages/webapp -- --project=firefox

# Chromium only
npm run test:e2e -w packages/webapp -- --project=chromium

# WebKit/Safari
npm run test:e2e -w packages/webapp -- --project=webkit
```

### Run Without Skipped Tests
```bash
npm run test:e2e -w packages/webapp -- --grep-invert "UNIMPLEMENTED|REQUIRES_MOCK"
```

### Run Only Implemented Features
```bash
npm run test:e2e -w packages/webapp -- timeline.spec.ts search.spec.ts import-export.spec.ts persistence.spec.ts
```

### Debug Mode (Headed Browser)
```bash
npm run test:e2e -w packages/webapp -- --headed --project=chromium
```

### Debug with Inspector
```bash
npm run test:e2e -w packages/webapp -- --debug
```

## Test Organization

### Test Markers

Tests use prefixes in their names to indicate status:

- **No prefix** - Implemented feature, should pass
- **`REQUIRES_MOCK:`** - Requires API/network mocking, skipped for now
- **`REQUIRES_IMPLEMENTATION:`** - Feature exists but test needs updates
- **`UNIMPLEMENTED:`** - Feature not yet built, test documents requirements
- **`FUTURE:`** - Possible future feature, low priority
- **`DEPRIORITIZED:`** - Explicitly deprioritized in VISION.md

### Skipped Tests

Tests marked with `.skip()` are:
1. **Waiting for mocks** - Need Gemini API mocking or cassette replay
2. **Documenting unimplemented features** - Serve as specifications
3. **Require test setup improvements** - Need fixtures or test utilities

## Test Coverage Goals

### Current Coverage (Implemented)
- ✅ Timeline display and structure
- ✅ Event expansion/collapse
- ✅ Search and filtering
- ✅ Import/export JSON
- ✅ localStorage persistence
- ✅ Basic UI interactions
- ✅ Input validation
- ✅ Browser compatibility basics

### Missing Coverage (Needs Implementation)
- ❌ Full turn cycle with GM response
- ❌ Error handling with real failures
- ❌ Network retry logic
- ❌ Post-game screen
- ❌ Hidden news reveal
- ❌ Tutorial system
- ❌ Performance under load
- ❌ Full accessibility audit

## Adding New Tests

### For Existing Features
1. Add tests to appropriate spec file (timeline, search, etc.)
2. Use descriptive test names
3. Ensure tests are independent (don't rely on order)
4. Clean up any created resources (files, localStorage)

### For New Features
1. Create new spec file if feature is substantial
2. Start with failing tests that document requirements
3. Use `.skip()` with appropriate marker (UNIMPLEMENTED, REQUIRES_MOCK)
4. Update this README with the new test file
5. Remove `.skip()` as feature is implemented

### Example Test Structure
```typescript
test('descriptive test name', async ({ page }) => {
  // Arrange: Set up test conditions
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Act: Perform the action being tested
  await page.getByPlaceholder('Search...').fill('test');

  // Assert: Verify expected outcome
  await expect(page.locator('[aria-expanded]')).toHaveCount(3);
});
```

## Mock Data and Fixtures

### Current Fixtures
- None yet - all tests use seed data from engine

### Planned Fixtures
- `fixtures/replays/` - Cassette recordings of Gemini API calls
- `fixtures/events/` - Sample event logs for testing
- `fixtures/materials/` - Test material bundles
- `fixtures/timelines/` - Pre-built timeline scenarios

## Integration with CI

Current CI setup (`.github/workflows/ci.yml`):
- ✅ Lint, typecheck, build all packages
- ✅ Run engine unit tests
- ⚠️ Webapp E2E tests run manually with `npm run smoke:webapp`

### Recommended CI Updates
1. Run full E2E suite on PR (excluding skipped tests)
2. Run smoke tests on every push
3. Nightly full test run including slow tests
4. Performance benchmarks on main branch

## Common Issues

### "Page didn't load" or timeout errors
- Check dev server is running on port 4173
- Increase timeout for slow operations: `{ timeout: 10000 }`
- Verify network conditions in test

### "Element not found" errors
- Use `waitForLoadState('networkidle')` before assertions
- Check selector accuracy with Playwright Inspector
- Ensure element is visible before interaction

### Flaky tests
- Add explicit waits: `await page.waitForTimeout(100)`
- Use `waitForSelector` instead of immediate assertions
- Check for race conditions in async operations

### localStorage not persisting
- Use `context.addInitScript()` to set before page load
- Check storage key matches application: `takeoff-timeline-events-v2`

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Project VISION.md](../../../VISION.md) - Feature roadmap
- [Engine Package](../../engine/) - Shared types and logic
- [Cassette Replay Spec](../../../docs/cassette-replay.md)

## Questions or Issues?

- Check existing test files for examples
- Review Playwright best practices
- Ask in project discussions or issues
