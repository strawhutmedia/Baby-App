# 🥣 First Bites — Baby's First 100 Foods

A **free, open-source** baby-led weaning companion. No account. No subscription. No paywall. All data stays on your device.

## What it does

- **✅ The First 100 Foods checklist** — the heart of the app. One hundred first foods organized by category, each with a one-tap check-off and a personal notes field. Progress bar, per-category counts, and milestone celebrations at 1, 10, 25, 50, 75 and 100 foods.
- **Food guide** — every food has original, age-specific serving guidance (6–8mo, 9–11mo, 12mo+), automatically highlighting the band that matches your baby's age.
- **Safety first** — choking-hazard ratings and prep warnings for every food (quartered grapes, flattened blueberries, no raw carrot…).
- **Allergen tracker** — all 9 common allergens (egg, peanut, tree nut, milk, soy, wheat, fish, shellfish, sesame) with an early-introduction checklist and food suggestions for each.
- **First-foods log & journal** — record every try with a date, rating (loved / ok / refused), reaction flags and notes; browse it all as a timeline.
- **Smart "try next"** — suggestions prioritized by un-introduced allergens and iron-rich foods.
- **A real app, without the App Store** — installable PWA with full offline support. iPhone: Safari → Share → *Add to Home Screen*. Android: Chrome → ⋮ → *Install app*. Own icon, full-screen, works with no connection, $0 in store fees.
- **Yours forever** — everything is stored in your browser's localStorage, with one-tap JSON backup export.

## Running it

```bash
npm install
npm run dev        # local development
npm run build      # production build → dist/
npm run preview    # serve the production build
```

Built with React + Vite, no backend.

## Putting it online (free) + a cheap domain

1. **Free hosting** — push this repo to GitHub, then connect it to [Netlify](https://netlify.com) or [Vercel](https://vercel.com) (both free for this). Build command `npm run build`, output directory `dist`. You immediately get a free URL like `first-bites.netlify.app` — you can stop here and pay nothing at all.
2. **Optional custom domain** (~$5–15/year, the only cost in this whole project). At last check these were unregistered: `first100bites.com`, `first100bites.app`, `first100foods.app`, `babysfirstbites.com`, `100firstbites.com`, `firstbites100.com`. Cheapest registrars: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) and [Porkbun](https://porkbun.com) (at-cost pricing, no upsells). Point it at your Netlify/Vercel site in their dashboard — HTTPS is automatic.

## Disclaimer

The food guidance in this app is general information compiled from public pediatric feeding recommendations. It is **not medical advice**. Always supervise your baby while eating, and talk to your pediatrician about starting solids and introducing allergens — especially if your baby has severe eczema or an existing food allergy.

Golden rules worth repeating: no honey before 12 months, no whole nuts before age 4, always quarter grapes lengthwise, and baby sits upright to eat.
