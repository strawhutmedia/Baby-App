# 🥣 First Bites — Baby's First 100 Foods

A **free, open-source** baby-led weaning companion. No account. No subscription. No paywall. All data stays on your device.

## What it does

- **✅ The First 100 Foods checklist** — the heart of the app. One hundred first foods organized by category, each with a one-tap check-off and a personal notes field. Progress bar, per-category counts, and milestone celebrations at 1, 10, 25, 50, 75 and 100 foods.
- **Food guide** — every food has original, age-specific serving guidance (6–8mo, 9–11mo, 12mo+), automatically highlighting the band that matches your baby's age.
- **Safety first** — choking-hazard ratings and prep warnings for every food (quartered grapes, flattened blueberries, no raw carrot…).
- **Allergen tracker** — all 9 common allergens (egg, peanut, tree nut, milk, soy, wheat, fish, shellfish, sesame) with an early-introduction checklist and food suggestions for each.
- **First-foods log & journal** — record every try with a date, rating (loved / ok / refused), reaction flags and notes; browse it all as a timeline.
- **Smart "try next"** — suggestions prioritized by un-introduced allergens and iron-rich foods.
- **👨‍👩‍👧 Family accounts & sync (optional)** — Mom, Dad and Grandma each sign in on their own phone, join one family with a 6-letter code, and everyone sees the same live checklist. Every logged food shows who fed it. Powered by a free Supabase database (setup below); without it the app runs fully on-device with caregiver names and backup import/export instead.
- **A real app, without the App Store** — installable PWA with full offline support. iPhone: Safari → Share → *Add to Home Screen*. Android: Chrome → ⋮ → *Install app*. Own icon, full-screen, works with no connection, $0 in store fees.
- **Yours forever** — local-first storage with one-tap JSON backup export, and an import that merges backups from another phone.

## Running it

```bash
npm install
npm run dev        # local development
npm run build      # production build → dist/
npm run preview    # serve the production build
```

Built with React + Vite, no backend.

## Going live at first100.baby (free hosting on GitHub Pages)

Deployment is automated: `.github/workflows/deploy.yml` builds and publishes the site on every push. One-time setup:

1. **Enable Pages** — the workflow enables it automatically on its first run. If a run ever complains, go to repo **Settings → Pages** and set *Source* to **GitHub Actions**. The site appears at `https://strawhutmedia.github.io/Baby-App/`.
2. **Connect the domain** — in repo **Settings → Pages → Custom domain**, enter `first100.baby`, save, and tick **Enforce HTTPS** once it verifies.
3. **Point GoDaddy at GitHub** — in GoDaddy's DNS manager for `first100.baby`, delete any existing `A` or "Parked" records, then add:

   | Type  | Name | Value               |
   |-------|------|---------------------|
   | A     | @    | 185.199.108.153     |
   | A     | @    | 185.199.109.153     |
   | A     | @    | 185.199.110.153     |
   | A     | @    | 185.199.111.153     |
   | CNAME | www  | strawhutmedia.github.io |

   DNS can take from minutes to a couple of hours to propagate. After that, `https://first100.baby` is live, HTTPS included, at $0/month forever.

To enable family sync later, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in repo **Settings → Secrets and variables → Actions**, then re-run the deploy workflow.

## Enabling family sync (Railway, ~10 minutes)

Family accounts run on the small server in [`server/`](server/) — email/password sign-in, families with 6-letter join codes, shared checklist state, and optional email notifications. Deploy it on [Railway](https://railway.app):

1. Railway dashboard → **New Project → Deploy from GitHub repo** → pick `strawhutmedia/Baby-App`.
2. In the new service's **Settings → Root Directory**, enter `server` and redeploy.
3. Still in the service: **Settings → Volumes → Attach volume**, mount path `/data`, and add an environment variable `DATA_DIR=/data` (**Variables** tab). This keeps the database safe across redeploys — don't skip it.
4. **Settings → Networking → Generate Domain** — copy the public URL (like `https://baby-app-production.up.railway.app`).
5. In the GitHub repo: **Settings → Secrets and variables → Actions → Variables** → add `VITE_API_URL` = that Railway URL. Re-run the deploy workflow (Actions tab → Deploy to GitHub Pages → Re-run).

The Baby tab on first100.baby then shows **Family sync**: create an account, tap **Start our family** (history already on the phone uploads automatically), and share the 6-letter code. Everyone else signs up, taps **Join with a code**, and every check-off, note, and journal entry syncs to the whole family — labeled with who fed it.

### Optional: email notifications ("Grandma logged a food!")

Each family member gets an opt-in toggle once email is configured. Sign up free at [resend.com](https://resend.com), verify the `first100.baby` domain (two DNS records at GoDaddy — Resend shows them), create an API key, and set these variables on the Railway service:

```
RESEND_API_KEY=re_...
EMAIL_FROM=First Bites <hello@first100.baby>
APP_URL=https://first100.baby
```

## Disclaimer

The food guidance in this app is general information compiled from public pediatric feeding recommendations. It is **not medical advice**. Always supervise your baby while eating, and talk to your pediatrician about starting solids and introducing allergens — especially if your baby has severe eczema or an existing food allergy.

Golden rules worth repeating: no honey before 12 months, no whole nuts before age 4, always quarter grapes lengthwise, and baby sits upright to eat.
