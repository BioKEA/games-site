import { test, expect } from '@playwright/test';

test('leaderboard renders three tabs and no Hunt tab', async ({ page }) => {
  await page.goto('/leaderboard');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Leaderboard');
  await expect(page.locator('[data-tab="today"]')).toBeVisible();
  await expect(page.locator('[data-tab="week"]')).toBeVisible();
  await expect(page.locator('[data-tab="all"]')).toBeVisible();
  await expect(page.locator('[data-tab="hunt"]')).toHaveCount(0);
});

test('#week deep link selects the Week tab', async ({ page }) => {
  await page.goto('/leaderboard#week');
  await expect(page.locator('[data-tab="week"]')).toHaveAttribute('data-active', 'true');
  await expect(page.locator('[data-tab="today"]')).not.toHaveAttribute('data-active', 'true');
});

test('back links go to the games index on this origin', async ({ page }) => {
  await page.goto('/leaderboard');
  const back = page.getByRole('link', { name: /All games/i });
  await expect(back.first()).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: /Back to all games/i })).toHaveAttribute('href', '/');
});
