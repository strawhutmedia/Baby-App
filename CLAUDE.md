# First Bites — first100.baby

Free baby-led weaning app ("Solid Starts, but free"): a first-100-foods checklist
with per-food safety/serving guidance, family accounts, and email updates.
Built for Ryan (strawhutmedia) and family; his real family actively uses it.

**Live:** https://first100.baby (site + installable PWA) · Food guide pages: /foods/

## Architecture

| Piece | What | Where | Deploys |
|---|---|---|---|
| Frontend | React + Vite PWA, `src/` | GitHub Pages (custom domain first100.baby, Enforce HTTPS on) | `.github/workflows/deploy.yml` on push to **main only** |
| Family server | Node/Express + better-sqlite3, `server/` | Railway project "First 100" (service "First 100", volume at `/data`, `DATA_DIR=/data`) | Railway auto-deploys `main` when `server/**` changes (watchPatterns in `server/railway.json`) |
| Email | Amazon SES (SESv2), sender `updates@first100.baby` | SES creds are Railway env vars (`SES_ACCESS_KEY_ID/SECRET`, `SES_REGION`, `SES_CONFIG_SET`) | — |
| Domain | first100.baby at GoDaddy | A records → GitHub Pages IPs; `www` CNAME → strawhutmedia.github.io; SES DNS records | — |

Railway server URL: `https://first-100-production-552d.up.railway.app` (baked into
`src/lib/cloud.js` as the default API; `VITE_API_URL` overrides for local testing).

## Workflow conventions (follow these)

- Develop on `claude/baby-food-tracking-app-7zihd0`, push it, then ff-only merge to
  `main` and push — main is what deploys. **Other Claude sessions also merge PRs to
  main** (e.g. the AWS SES migration came from another session) — always
  `git fetch origin main` and reconcile before pushing.
- `npm run build` = `vite build` **+ `scripts/generate-food-pages.mjs`** (writes 100
  static SEO pages `/foods/<id>/`, a /foods/ index, and the full sitemap into dist/).
- After editing `src/data/foods.js`, run `node scripts/export-foods.mjs` to regenerate
  `server/foods.json` (used for rich notification emails). Invariant: **exactly 100
  foods**, all 9 common allergens represented.
- Email sends: single `sendEmail()` in `server/index.js`; SES preferred, tagged
  `app=first100` + `category` (fleet-wide convention across Ryan's apps — keep it).
- User is non-technical and gets frustrated by failure-noise emails; every deploy
  path has been hardened to be silent (see gotchas). Keep it that way.

## Hard-won gotchas (do not regress)

1. **Railway start command is `node index.js` directly** (`server/railway.json`) —
   `npm start` swallows SIGTERM and every container retirement emailed the owner a
   "Deploy Crashed". The server has a graceful SIGTERM handler (exit 0).
2. SQLite: `busy_timeout` is set **before** any other pragma/schema (deploy overlap
   locks), and the DB open retries (volume handover). Don't reorder.
3. GH Pages workflow: main-only trigger (branch runs get blocked by the environment
   → failure emails), `cancel-in-progress: false` (cancelled runs also email).
4. The sandbox test browser can't reach the internet; test against a **local server**
   (`DATA_DIR=<scratch> PORT=xxxx node server/index.js`) and build with
   `VITE_API_URL=http://localhost:xxxx`. Playwright: chromium at
   `/opt/pw-browsers/chromium`; if proxying, bypass localhost.
   `EMAIL_DEBUG_FILE=<path>` makes the server capture emails to a file instead of sending.
5. Service worker caches aggressively; users may see the previous version for one
   load. "Refresh twice" is the standard advice after a deploy.
6. A smoke-test family ("SmokeTest") exists in the production DB for end-to-end
   verification (owner account email `ryan+first100test@strawhutmedia.com`;
   credentials are simple and known to Ryan — ask, don't guess). Its junk data is
   invisible to real families.

## Product decisions already made

- **No App Store** (Ryan doesn't want the $99/yr) — PWA install is the app story.
- **Email is the only notification channel.** Web push was built and its server
  plumbing still exists (dormant), but the UI was removed at Ryan's request. SMS was
  ruled out (costs money; the app must stay $0 to run beyond domain + Railway).
- **Resend account was deleted** (Sept 2026) — SES is the sole engine;
  `RESEND_API_KEY` on Railway was blanked; the Resend fallback code path remains but
  is unreachable. Leftover Resend DNS records at GoDaddy (`resend._domainkey`,
  `send` MX/TXT) are inert and can be deleted whenever.
- Family model: one family per account; creator = owner (remove members / transfer
  ownership); 6-letter join codes; invite links `first100.baby/?join=CODE`; allergen
  tracker counts distinct exposure days (target 3) and flags reactions.

## Open items / next-session candidates

- **Google Search Console**: Ryan was given steps (DNS TXT verify + submit
  sitemap.xml) — unknown if done; ask, and check indexing/impressions if so.
- Fleet email-tagging audit for Podbooster/Slate/shows/sales was offered — needs
  their repos added to a session.
- Ideas floated but not requested: analytics (privacy-friendly), "first 100 days"
  meal plan, dark mode, Resend-leftover DNS cleanup.
- If crash/failure emails ever reappear: diagnose via Railway MCP (`get-logs`,
  `list-deployments`) before touching anything — the service itself has never
  actually gone down.

## Session history (very short)

Built Aug 18, 2026 in one session: app + 100-food DB + checklist/notes + family
accounts (own server) + design + SEO + deploy pipeline. Sept 2: rich emails via
Resend, invite links, owner controls, crash-email hardening saga. Sept 7–8 (other
session): fleet migration to AWS SES + email tagging. Sept 13: allergen exposure
dots. All shipped, all verified live.
