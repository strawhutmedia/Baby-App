// Regenerates server/foods.json from the app's food database so the server
// can write rich notification emails. Run after editing src/data/foods.js:
//   node scripts/export-foods.mjs
import { FOODS } from '../src/data/foods.js'
import fs from 'node:fs'

const out = {}
for (const f of FOODS) {
  out[f.id] = {
    name: f.name,
    emoji: f.emoji,
    nutrition: f.nutrition,
    serve: f.serve,
    allergen: f.allergen,
    ironRich: f.ironRich,
    hazard: f.hazard,
    hazardNote: f.hazardNote || null,
  }
}
fs.writeFileSync(new URL('../server/foods.json', import.meta.url), JSON.stringify(out, null, 1))
console.log(`Wrote server/foods.json with ${Object.keys(out).length} foods`)
