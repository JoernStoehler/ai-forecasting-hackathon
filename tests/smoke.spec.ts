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

  await expect(page.getByPlaceholder('Search timeline...')).toBeVisible();

  expect(errors, `Console/page errors found:\n${errors.join('\n')}`).toEqual([]);
});
