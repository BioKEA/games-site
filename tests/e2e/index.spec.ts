import { test, expect } from '@playwright/test';

const TITLES = [
  'Codon Collider',
  'Pipette Rush',
  'Plasmid Plinko',
  'Particle Accelerator',
  'Biodiversity Discovery Lab',
  'WildCal',
];

test('index renders headline and six game tiles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Biology, played.');
  await expect(page.locator('[data-game-slug]')).toHaveCount(6);
  for (const t of TITLES) {
    await expect(page.getByRole('heading', { name: t, exact: true })).toBeVisible();
  }
});

test('tile play links resolve to /<slug>/ on this origin', async ({ page }) => {
  await page.goto('/');
  await expect(
    page
      .locator('[data-game-slug="codon2048"]')
      .getByRole('link', { name: 'Play Codon Collider ↗' }),
  ).toHaveAttribute('href', '/codon2048/');
  await expect(
    page
      .locator('[data-game-slug="3d-biodiversity-collect-em-all"]')
      .getByRole('link', { name: 'Play WildCal ↗' }),
  ).toHaveAttribute('href', '/3d-biodiversity-collect-em-all/');
});

test('daily card links to /leaderboard and the newsletter block links out to biokea.ai', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Full leaderboard/ })).toHaveAttribute(
    'href',
    '/leaderboard',
  );
  await expect(page.getByRole('link', { name: /Get lab updates/ })).toHaveAttribute(
    'href',
    'https://biokea.ai/subscribe?source=games',
  );
  // The embedded subscribe form is not ported — no email input on this page.
  await expect(page.locator('#main input[type="email"]')).toHaveCount(0);
});
