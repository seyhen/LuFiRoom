// Captures de LufiRoom sans navigateur outillé (session cloud, conteneur) : Playwright + le Chromium déjà installé.
//
//   npx vite --port 5173 &                      # le serveur de développement (le pont window.__lofi n'existe que là)
//   node .claude/skills/audit-room/capture.mjs <dossier> [pièces] [--mobile] [--sounds] [--check] [--once=d|n]
//
// - <dossier> reçoit <pièce>-d.png (jour) et <pièce>-n.png (nuit) ; `pair.sh` les met côte à côte.
// - [pièces] : identifiants séparés par des virgules (défaut : toutes, dans l'ordre du sélecteur).
// - --mobile : 390 × 844 tactile au lieu de 1440 × 900.   --sounds : allume tous les sons de la pièce avant la capture.
// - --check : lance aussi overlaps.js et coplanar.js (jour) et écrit leurs lignes dans <dossier>/checks.json.
// - --once=d ou n : une seule vue par pièce (moitié moins de temps).
// Une seule page, un seul navigateur : le rendu est logiciel (1 image par seconde), deux navigateurs font expirer les captures.
// LOFI_URL change l'adresse (défaut http://localhost:5173), LOFI_CHROMIUM le binaire.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2), flags = args.filter((a) => a.startsWith('--')), pos = args.filter((a) => !a.startsWith('--'))
const out = pos[0]
if (!out) { console.error('usage: capture.mjs <dossier> [pièces] [--mobile] [--sounds] [--check] [--once=d|n]'); process.exit(1) }
mkdirSync(out, { recursive: true })
const ALL = ['bedroom', 'cabin', 'cafe', 'beach', 'train', 'roof', 'atelier', 'onsen', 'lighthouse', 'submarine', 'market', 'igloo', 'treehouse', 'laundromat', 'greenhouse']
const ids = pos[1] ? pos[1].split(',') : ALL
const mobile = flags.includes('--mobile'), sounds = flags.includes('--sounds'), check = flags.includes('--check')
const once = flags.find((f) => f.startsWith('--once='))?.slice(7)
const url = process.env.LOFI_URL || 'http://localhost:5173'
const detectors = check ? { overlaps: readFileSync(join(here, 'overlaps.js'), 'utf8'), coplanar: readFileSync(join(here, 'coplanar.js'), 'utf8') } : null

const browser = await chromium.launch({
  executablePath: process.env.LOFI_CHROMIUM || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage(mobile
  ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
  : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
page.setDefaultTimeout(180000)
page.on('pageerror', (e) => console.log('ERREUR page :', e.message))
page.on('console', (m) => { if (m.type() === 'error') console.log('ERREUR console :', m.text().slice(0, 200)) })
await page.goto(`${url}/?room=${ids[0]}&go`, { waitUntil: 'load' })
await page.waitForFunction(() => window.__lofi && !document.getElementById('splash'), null, { timeout: 240000 })

// Change de pièce / de moment, attend des images (pas des secondes), rend les compteurs de dessin.
const go = (room, night, on) => page.evaluate(async ({ room, night, on }) => {
  const frames = (n) => new Promise((res) => { let i = 0; const t = () => (++i >= n ? res() : requestAnimationFrame(t)); requestAnimationFrame(t) })
  const st = window.__lofi.store
  if (st.getState().room !== room) { st.getState().goto(room); while (st.getState().room !== room || st.getState().leaving) await frames(1) }
  if (st.getState().night !== night) st.getState().toggleNight()
  st.getState().muteAll()
  if (on) {
    const { roomById } = await import('/src/rooms/index.ts')
    for (const s of roomById(room).sounds) st.getState().toggle(s.id)
  }
  await frames(60)
  const r = window.__lofi.three().gl.info.render
  return { calls: r.calls, triangles: r.triangles }
}, { room, night, on })

const checks = {}
for (const id of ids) {
  for (const night of [false, true]) {
    const tag = night ? 'n' : 'd'
    if (once && once !== tag) continue
    const t = Date.now()
    try {
      const r = await go(id, night, sounds)
      await page.screenshot({ path: join(out, `${id}-${tag}.png`), timeout: 120000 })
      if (check && !night) {
        checks[id] = {
          overlaps: await page.evaluate(`(${detectors.overlaps})()`).catch((e) => String(e)),
          coplanar: await page.evaluate(`(${detectors.coplanar})()`).catch((e) => String(e)),
        }
      }
      console.log(`${id} ${night ? 'nuit' : 'jour'} tracés ${r.calls} triangles ${r.triangles} (${Math.round((Date.now() - t) / 1000)} s)`)
    } catch (e) {
      console.log(`ÉCHEC ${id} ${tag} : ${String(e.message).split('\n')[0]}`)
    }
  }
}
if (check) writeFileSync(join(out, 'checks.json'), JSON.stringify(checks, null, 1))
await browser.close()
