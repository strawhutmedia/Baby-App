// Generates static, indexable SEO pages into dist/ after the app build:
//   /foods/            — index of all 100 foods
//   /foods/<id>/       — one page per food with serving guidance by age
//   /sitemap.xml       — regenerated to include every page
// Run automatically by `npm run build`.
import { FOODS, CATEGORIES, ALLERGENS, AGE_BANDS } from '../src/data/foods.js'
import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://first100.baby'
const dist = new URL('../dist', import.meta.url).pathname

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const HAZARD_LABEL = {
  high: '⚠️ High choking risk — preparation matters',
  moderate: '△ Moderate choking risk',
  low: '✓ Low choking risk',
}

const css = `
:root{--bg:#f3f8f5;--card:#fff;--ink:#16241e;--muted:#74857c;--green:#0ea472;--soft:#ddf4ea;--border:#e2ece6}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:'Nunito',-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6}
main{max-width:640px;margin:0 auto;padding:24px 16px 60px}
a{color:var(--green);font-weight:700}
.card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:18px;margin:14px 0;box-shadow:0 2px 10px rgba(14,62,43,.06)}
h1{font-weight:900;letter-spacing:-.02em;font-size:1.7rem;margin:6px 0}
h2{font-weight:800;font-size:1.05rem;color:var(--green);margin:0 0 6px}
.emoji{font-size:3rem;line-height:1}
.meta{color:var(--muted);font-size:.9rem;margin:2px 0 0}
.badge{display:inline-block;background:var(--soft);border-radius:999px;padding:5px 12px;font-size:.8rem;font-weight:800;margin:4px 6px 0 0}
.badge.warn{background:#fdeae8}
.cta{display:block;text-align:center;background:linear-gradient(135deg,#0ea472,#0a9c8b);color:#fff !important;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:800;margin:22px 0;box-shadow:0 3px 10px rgba(14,164,114,.35)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:0;list-style:none}
.grid a{display:block;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:10px 12px;text-decoration:none;color:var(--ink);font-weight:700;font-size:.9rem}
.grid a:hover{border-color:var(--green)}
.fineprint{color:var(--muted);font-size:.78rem;margin-top:28px}
nav{font-size:.85rem;margin-bottom:8px}
`.trim()

const head = (title, description, canonicalPath) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${canonicalPath}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:site_name" content="First Bites">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${canonicalPath}">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>`

const footer = `
<p class="fineprint">General information compiled from public pediatric feeding recommendations — not medical
advice. Always supervise your baby while eating and talk to your pediatrician about starting solids and
introducing allergens, especially if your baby has severe eczema or an existing food allergy.</p>
</main></body></html>`

const appCTA = `<a class="cta" href="/">🥣 Track your baby's first 100 foods — free, no subscription →</a>`

// ---------- per-food pages ----------
for (const f of FOODS) {
  const cat = CATEGORIES.find((c) => c.id === f.category)
  const title = `${f.name} for Babies: When & How to Serve It Safely | First Bites`
  const description = `Can babies eat ${f.name.toLowerCase()}? From ${f.minAge} months. How to serve ${f.name.toLowerCase()} at 6–8, 9–11 and 12+ months, choking-risk prep${f.allergen ? ', allergen guidance' : ''} — free baby-led weaning guide.`
  const related = FOODS.filter((x) => x.category === f.category && x.id !== f.id).slice(0, 6)
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${f.name} for babies: when and how to serve it safely`,
    description,
    about: f.name,
    url: `${SITE}/foods/${f.id}/`,
    publisher: { '@type': 'Organization', name: 'First Bites', url: SITE },
  }

  const html = `${head(title, description, `/foods/${f.id}/`)}
<main>
<nav><a href="/">First Bites</a> › <a href="/foods/">Food guide</a> › ${esc(f.name)}</nav>
<div class="emoji">${f.emoji}</div>
<h1>${esc(f.name)} for babies</h1>
<p class="meta">${esc(cat?.label || '')} · suitable from ${f.minAge} months</p>
<div>
<span class="badge${f.hazard === 'high' ? ' warn' : ''}">${esc(HAZARD_LABEL[f.hazard])}</span>
${f.allergen ? `<span class="badge warn">⚡ Common allergen: ${esc(ALLERGENS[f.allergen])}</span>` : ''}
${f.ironRich ? `<span class="badge">💪 Iron-rich</span>` : ''}
</div>
${f.hazardNote ? `<div class="card" style="background:#fdeae8"><strong>Safety first:</strong> ${esc(f.hazardNote)}</div>` : ''}
<div class="card"><h2>Why ${esc(f.name.toLowerCase())} is great for babies</h2><p>${esc(f.nutrition)}</p></div>
${AGE_BANDS.map(
  (b) => `<div class="card"><h2>How to serve at ${esc(b.label)}</h2><p>${esc(f.serve[b.key])}</p></div>`,
).join('\n')}
${f.allergen ? `<div class="card"><h2>Allergen note</h2><p>${esc(f.name)} counts as a ${esc(ALLERGENS[f.allergen].toLowerCase())} exposure — one of the 9 common allergens. Current pediatric guidance favors introducing allergens early (around 6 months), one at a time, and keeping them in the diet regularly once tolerated.</p></div>` : ''}
${appCTA}
<h2 style="color:var(--ink)">More ${esc((cat?.label || 'foods').toLowerCase())}</h2>
<ul class="grid">${related.map((r) => `<li><a href="/foods/${r.id}/">${r.emoji} ${esc(r.name)}</a></li>`).join('')}</ul>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${footer}`

  const dir = path.join(dist, 'foods', f.id)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
}

// ---------- foods index ----------
{
  const title = `Baby's First 100 Foods: Full Guide & Checklist | First Bites`
  const description =
    'All 100 first foods for babies with how-to-serve guides by age, choking-risk prep and allergen notes — fruits, vegetables, meats, fish, eggs, grains, dairy, legumes, nuts and seeds. Free.'
  const sections = CATEGORIES.map((c) => {
    const items = FOODS.filter((f) => f.category === c.id)
    return `<h2 style="color:var(--ink);margin-top:22px">${c.emoji} ${esc(c.label)} (${items.length})</h2>
<ul class="grid">${items.map((f) => `<li><a href="/foods/${f.id}/">${f.emoji} ${esc(f.name)}</a></li>`).join('')}</ul>`
  }).join('\n')
  const html = `${head(title, description, '/foods/')}
<main>
<nav><a href="/">First Bites</a> › Food guide</nav>
<h1>Baby's first 100 foods</h1>
<p>How to serve every first food safely — by age (6–8, 9–11, 12+ months), with choking-risk prep,
allergen introduction notes and iron-rich picks. Tap any food:</p>
${appCTA}
${sections}
${footer}`
  fs.mkdirSync(path.join(dist, 'foods'), { recursive: true })
  fs.writeFileSync(path.join(dist, 'foods', 'index.html'), html)
}

// ---------- sitemap ----------
{
  const urls = [
    `${SITE}/`,
    `${SITE}/foods/`,
    ...FOODS.map((f) => `${SITE}/foods/${f.id}/`),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>
`
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), xml)
}

console.log(`Generated ${FOODS.length} food pages + index + sitemap (${FOODS.length + 2} URLs)`)
