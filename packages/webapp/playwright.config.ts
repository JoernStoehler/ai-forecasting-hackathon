/**
 * Playwright config for the webapp: run e2e checks against the Vite dev server.
 * Update baseURL or webServer command if ports change.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Start each test with clean localStorage
    storageState: { cookies: [], origins: [] },
  },
  webServer: {
    // Use mock forecaster for E2E tests (deterministic, no API key required)
    command: 'VITE_USE_MOCK_FORECASTER=true npm run dev -- --host --port 4173',
    port: 4173,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      VITE_USE_MOCK_FORECASTER: 'true',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
