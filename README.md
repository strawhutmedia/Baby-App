# 🥣 First Bites — Baby's First Foods

A **free, open-source** baby-led weaning companion. No account. No subscription. No paywall. All data stays on your device.

## What it does

- **Food guide** — 58 first foods with original, age-specific serving guidance (6–8mo, 9–11mo, 12mo+), automatically highlighting the band that matches your baby's age.
- **Safety first** — choking-hazard ratings and prep warnings for every food (quartered grapes, flattened blueberries, no raw carrot…).
- **Allergen tracker** — all 9 common allergens (egg, peanut, tree nut, milk, soy, wheat, fish, shellfish, sesame) with an early-introduction checklist and food suggestions for each.
- **First-foods log** — record every try with a date, a rating (loved / ok / refused), reaction flags, and notes. Browse it all in a journal timeline.
- **Smart "try next"** — suggestions prioritized by un-introduced allergens and iron-rich foods, the two things that matter most in the first months of solids.
- **Yours forever** — everything is stored in your browser's localStorage. One-tap JSON export for backups. Installable as a PWA on your phone's home screen.

## Running it

```bash
npm install
npm run dev        # local development
npm run build      # production build → dist/
npm run preview    # serve the production build
```

Built with React + Vite. No backend required — deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, a Raspberry Pi in the closet…).

## Disclaimer

The food guidance in this app is general information compiled from public pediatric feeding recommendations. It is **not medical advice**. Always supervise your baby while eating, and talk to your pediatrician about starting solids and introducing allergens — especially if your baby has severe eczema or an existing food allergy.

Golden rules worth repeating: no honey before 12 months, no whole nuts before age 4, always quarter grapes lengthwise, and baby sits upright to eat.
