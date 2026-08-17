# BioKEA Games — games.biokea.ai

The six BioKEA browser games, their daily leaderboard, and the shared
handle picker. Astro v6 on a Cloudflare Worker. Game code lives in the
`BioKEA/game-*` repos; this repo builds them into `public/<slug>/` at
deploy time and serves them at `https://games.biokea.ai/<slug>/`.

## Run locally

```bash
npm install
npm run games:build    # clones + builds the six games (needs `gh auth login` or GITHUB_TOKEN)
npm run dev            # http://localhost:4321
```

`/api/handle-check` needs `SUPABASE_SERVICE_ROLE_KEY` in `.dev.vars`
(see `.dev.vars.example`); without it the handle picker reports
"Handle check is not configured."

## Test

```bash
npm run check          # astro check
npm test               # vitest (scripts/verify-games)
npm run test:e2e       # playwright
```

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`: test → build (games +
astro) → `games:verify` → `wrangler deploy` of the `biokea-games` Worker.

Repo secrets (Settings → Secrets → Actions): `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` — same
values as `BioKEA/website-biokea`.

Worker secret, once: `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`.

Custom domain, once: Cloudflare dashboard → Workers & Pages →
`biokea-games` → Settings → Domains & Routes → Add → Custom domain
`games.biokea.ai`. Cloudflare creates the DNS record.

## Adding a game

1. Add an entry to `src/data/games.ts` (slug, title, tagline, thumb, `playUrl: '/<slug>/'`, repo).
2. If it posts scores: insert a `ranked_modes` row, add it to `LEADERBOARD_GAMES`
   in `src/data/leaderboard-games.ts`, and to `LEADERBOARD_ENABLED` in
   `scripts/build-games.mjs`.
3. Drop a 1200×675 thumbnail in `public/assets/games/`.
