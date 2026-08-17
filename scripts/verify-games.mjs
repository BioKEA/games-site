#!/usr/bin/env node
// scripts/verify-games.mjs
//
// Post-build guard: every game listed in src/data/games.ts must have a
// built bundle under public/<slug>/ whose index.html carries the three
// injections build-games.mjs adds — back button to "/", an absolute
// subscribe pill on biokea.ai, and the GA snippet. Exits 1 with a report
// if anything is off, so a mis-rewritten base path can't ship silently.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GA_MEASUREMENT_ID = 'G-WYL7J2D7SG';

export function checkBundle(html, slug) {
  const problems = [];
  const back = html.match(/<a href="([^"]*)" id="biokea-back"/);
  if (!back) problems.push('back button missing');
  else if (back[1] !== '/') problems.push('back button href is not "/"');
  const sub = html.match(/<a href="([^"]*)" id="biokea-subscribe"/);
  if (!sub) problems.push('subscribe pill missing');
  else if (sub[1] !== `https://biokea.ai/subscribe?source=${encodeURIComponent(slug)}`)
    problems.push('subscribe pill is not absolute to biokea.ai');
  if (!html.includes(`gtag/js?id=${GA_MEASUREMENT_ID}`)) problems.push('GA snippet missing');
  return problems;
}

// Only repo-backed games are built by build-games.mjs; mirror its regex so
// a repo-less entry (documented in games.ts) can't hard-fail every deploy.
function readSlugs(root) {
  const src = readFileSync(join(root, 'src', 'data', 'games.ts'), 'utf-8');
  const re = /\{[^{}]*?slug:\s*['"]([^'"]+)['"][^{}]*?repo:\s*['"]([^'"]+)['"]/gs;
  return Array.from(src.matchAll(re), (m) => m[1]);
}

// Only run the CLI when executed directly (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  let failed = 0;
  for (const slug of readSlugs(root)) {
    const indexHtml = join(root, 'public', slug, 'index.html');
    if (!existsSync(indexHtml)) {
      console.error(`[games-verify] ${slug}: ✗ public/${slug}/index.html missing`);
      failed++;
      continue;
    }
    const problems = checkBundle(readFileSync(indexHtml, 'utf-8'), slug);
    if (problems.length) {
      console.error(`[games-verify] ${slug}: ✗ ${problems.join('; ')}`);
      failed++;
    } else {
      console.log(`[games-verify] ${slug}: ✓`);
    }
  }
  process.exit(failed ? 1 : 0);
}
