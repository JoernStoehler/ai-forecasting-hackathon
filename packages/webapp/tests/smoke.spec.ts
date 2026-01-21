import { test, expect } from '@playwright/test';

test('app loads without console or page errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Menu page is the landing page - verify it loads (use exact match for h1, not tutorial h2)
  await expect(page.getByRole('heading', { name: 'AI Forecasting Simulation', exact: true })).toBeVisible();

  expect(errors, `Console/page errors found:\n${errors.join('\n')}`).toEqual([]);
});
