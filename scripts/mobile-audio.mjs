// Les apps des stores n'embarquent qu'un format de son : chaque enregistrement existe en Opus/WebM et en MP3 (public/audio/),
// et garder les deux doublait le paquet (250 Mo, au-delà des 200 Mo du paquet de base de Google Play).
//   node scripts/mobile-audio.mjs webm   # Android : la WebView (Chromium) lit l'Opus, plus léger
//   node scripts/mobile-audio.mjs mp3    # iOS : la WebView de Safari, MP3 partout
// Supprime de dist/audio/ l'autre format, seulement là où le format gardé existe ; un son qui n'existe que dans l'autre format
// est une erreur (l'app ne le trouverait pas : src/audio/recordings.ts n'essaie que le format de sa plateforme).
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const keep = process.argv[2]
if (keep !== 'webm' && keep !== 'mp3') {
  console.error('usage : node scripts/mobile-audio.mjs webm|mp3')
  process.exit(1)
}
const drop = keep === 'webm' ? 'mp3' : 'webm'
const root = join('dist', 'audio')
if (!existsSync(root)) {
  console.error(`${root} introuvable : construis d'abord le site (vite build).`)
  process.exit(1)
}

const files = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else files.push(p)
  }
}
walk(root)

const mb = (n) => `${(n / 1e6).toFixed(1)} Mo`
const size = (list) => list.reduce((s, p) => s + statSync(p).size, 0)
const before = size(files)
const orphans = [], removed = []
for (const p of files) {
  if (!p.endsWith(`.${drop}`)) continue
  const twin = p.slice(0, -drop.length) + keep
  if (existsSync(twin)) removed.push(p)
  else orphans.push(p)
}
if (orphans.length) {
  console.error(`Sons sans version .${keep} (l'app ne les trouverait pas) :\n  ${orphans.join('\n  ')}`)
  process.exit(1)
}
const freed = size(removed)
for (const p of removed) unlinkSync(p)
console.log(`Sons de l'app : .${keep} seulement, ${removed.length} fichiers .${drop} retirés, ${mb(before)} → ${mb(before - freed)}.`)
