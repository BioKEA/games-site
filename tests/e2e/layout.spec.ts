import { test, expect } from '@playwright/test';

test('nav links to biokea.ai, Games, Leaderboard, and the lab-updates subscribe page', async ({
  page,
}) => {
  await page.goto('/does-not-exist');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: /BioKEA home/i })).toHaveAttribute(
    'href',
    'https://biokea.ai',
  );
  await expect(nav.getByRole('link', { name: 'Games', exact: true })).toHaveAttribute('href', '/');
  await expect(nav.getByRole('link', { name: 'Leaderboard', exact: true })).toHaveAttribute(
    'href',
    '/leaderboard',
  );
  await expect(nav.getByRole('link', { name: /Lab updates/ })).toHaveAttribute(
    'href',
    'https://biokea.ai/subscribe?source=games',
  );
});

test('unknown routes render the 404 page with a way back', async ({ page }) => {
  const res = await page.goto('/does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nothing here.');
  await expect(page.getByRole('link', { name: /Back to all games/ })).toHaveAttribute('href', '/');
});

test('footer links back to the privacy policy on biokea.ai', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toHaveAttribute(
    'href',
    'https://biokea.ai/privacy',
  );
});
