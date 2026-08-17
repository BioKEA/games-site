import { test, expect } from '@playwright/test';

test('picking a handle stores biokea:player:handle and survives a reload', async ({ page }) => {
  // handle-check needs the service-role secret; mock the allow response so
  // this test is deterministic in dev and CI.
  await page.route('**/api/handle-check**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, allowed: true }),
    }),
  );
  await page.goto('/');
  const picker = page.locator('[data-handle-picker]');
  await picker.locator('input').fill('DrBio');
  await picker.locator('[data-handle-save]').click();
  await expect(picker.locator('[data-handle-display]')).toHaveText('DrBio');

  const stored = await page.evaluate(() => localStorage.getItem('biokea:player:handle'));
  expect(stored).toBe('DrBio');

  await page.reload();
  await expect(page.locator('[data-handle-picker] [data-handle-display]')).toHaveText('DrBio');
});

test('a blocked handle is rejected with a message and not stored', async ({ page }) => {
  await page.route('**/api/handle-check**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, allowed: false, reason: 'forbidden' }),
    }),
  );
  await page.goto('/');
  const picker = page.locator('[data-handle-picker]');
  await picker.locator('input').fill('badword');
  await picker.locator('[data-handle-save]').click();
  await expect(picker.locator('[data-handle-status]')).toContainText("isn't allowed");
  expect(await page.evaluate(() => localStorage.getItem('biokea:player:handle'))).toBeNull();
});
