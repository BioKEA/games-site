#!/usr/bin/env node
// scripts/verify-games.mjs
//
// Post-build guard: every game listed in src/data/games.ts must have a
// built bundle under public/<slug>/ whose index.html carries the three
// injections build-games.mjs adds — back button to "/", an absolute
// subscribe pill on biokea.ai, and the GA snippet — and no file in the
// bundle may still hardcode the retired biokea.ai/mission/games/… URLs
// (biokea.ai no longer redirects them). Exits 1 with a report if anything
// is off, so a mis-rewritten base path or a stale game repo can't ship
// silently.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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

// The games used to live at biokea.ai/mission/games/<slug>/ with the
// leaderboard at biokea.ai/mission/games/leaderboard. Those paths now 404;
// any bundle text still pointing there (score toasts, consent copy, links)
// means the game repo was not rebuilt after its URL fix.
const STALE_URL = 'biokea.ai/mission/games';

export function findStaleGameUrls(files) {
  return files
    .filter((f) => f.content.includes(STALE_URL))
    .map((f) => `${f.name} references retired ${STALE_URL} URL`);
}

function walkTextFiles(dir, base = '') {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) out.push(...walkTextFiles(full, rel));
    else if (/\.(js|mjs|html|css|json)$/.test(entry))
      out.push({ name: rel, content: readFileSync(full, 'utf-8') });
  }
  return out;
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
    const problems = [
      ...checkBundle(readFileSync(indexHtml, 'utf-8'), slug),
      ...findStaleGameUrls(walkTextFiles(join(root, 'public', slug))),
    ];
    if (problems.length) {
      console.error(`[games-verify] ${slug}: ✗ ${problems.join('; ')}`);
      failed++;
    } else {
      console.log(`[games-verify] ${slug}: ✓`);
    }
  }
  process.exit(failed ? 1 : 0);
}
