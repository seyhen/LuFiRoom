// Mesure des niveaux : rend chaque canal synthétisé de chaque pièce hors ligne (OfflineAudioContext, 20 s) dans Chromium
// (Playwright, comme scripts/smoke.mjs) et affiche sa sonie (LUFS approchées, pondération K de BS.1770) avec son gain de base.
//
//   npm run audio:levels                       tous les canaux de toutes les pièces
//   npm run audio:levels -- --ids brook,frogs  seulement ces sons ;  --rooms cabin,cafe  seulement ces pièces
//   npm run audio:levels -- --seconds 10       durée rendue par canal (20 par défaut) ;  --json  sortie en JSON
//
// Ce qui est mesuré : le canal en synthèse (sans enregistrement : `loops` vidé, radio générative) à gain de bus 1, puis ramené
// à son niveau par défaut (volume de la fiche × gain de base × master 0,9). « synth. » = sa sonie intégrée (portes -70 LUFS et -10 LU,
// les 2 premières secondes écartées) ; « moy. » = sans porte (un son à évènements rares y paraît plus faible).
// Mais la plupart des sons jouent un enregistrement (déclaré dans `loops`, ou les pistes de la radio), et c'est pour lui que `base`
// est réglé : son niveau vaut alors -20 LUFS (cible de npm run audio) × gain de la boucle × niveau par défaut. La colonne « niveau »
// est celle qu'on entend (enregistrement si la pièce en a un, sinon synthèse) : c'est elle qu'on compare à la médiane.
// La liste finale donne les canaux à plus de ±3 dB de la médiane, et ceux à plus de ±6 dB (écart flagrant, à corriger dans `base`
// de src/audio/engine.ts). Rien n'est corrigé tout seul.
// Variables : LOFI_URL = adresse d'un serveur de dev déjà lancé (sinon Vite démarre sur le port 5222) ; LOFI_CHROMIUM = chemin d'un Chromium.

import { chromium } from 'playwright'
import { createServer } from 'vite'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : null)
const onlyIds = list(opt('ids')), onlyRooms = list(opt('rooms')), seconds = Number(opt('seconds', 20)) || 20, json = args.includes('--json')
const WARN = 3, FLAGRANT = 6, REC_LUFS = -20
const log = (...a) => (json ? console.error(...a) : console.log(...a))

let server = null, url = process.env.LOFI_URL
if (!url) {
  server = await createServer({ logLevel: 'silent', server: { port: 5222, strictPort: false, open: false } })
  await server.listen()
  url = server.resolvedUrls.local[0]
}
const browser = await chromium.launch({
  executablePath: process.env.LOFI_CHROMIUM || undefined,
  args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
})
const rows = [], failures = []
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 240 } })
  page.on('pageerror', (e) => failures.push(`page : ${e.message}`))
  // Une page de mesure à la place de l'app : le moteur audio et le store seuls, sans scène 3D à dessiner (qui prendrait le processeur).
  const measureUrl = new URL('__measure', url).href
  await page.route(measureUrl, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>mesure</title><script type="module">import "/src/state/store.ts"; import "/src/audio/engine.ts"</script>' }),
  )
  await page.goto(measureUrl, { waitUntil: 'load' })
  await page.waitForFunction(() => window.__lofi?.audio?.renderOffline && window.__lofi?.store, null, { timeout: 90_000 })
  // Les sons de chaque pièce, lus dans les fiches (le bridge de dev charge les mêmes modules que l'app).
  const jobs = await page.evaluate(async ({ onlyIds, onlyRooms }) => {
    const { rooms } = await import('/src/rooms/index.ts')
    // `rec` : gain de l'enregistrement qui joue à la place de la synthèse (boucle de la fiche, ou pistes de la radio), sinon null.
    return rooms
      .filter((r) => !onlyRooms || onlyRooms.includes(r.id))
      .flatMap((r) => r.sounds.filter((s) => !onlyIds || onlyIds.includes(s.id)).map((s) => ({ room: r.id, id: s.id, rec: s.id === 'radio' ? (r.playlist.length ? 2.2 : null) : (r.loops[s.id]?.gain ?? null) })))
  }, { onlyIds, onlyRooms })
  if (!jobs.length) throw new Error('Aucun canal à mesurer (--ids / --rooms).')
  log(`${jobs.length} canaux, ${seconds} s chacun…`)
  let n = 0
  for (const job of jobs) {
    const t0 = performance.now()
    try {
      const r = await page.evaluate(({ id, room, seconds }) => {
        // Graine fixe par canal (mulberry32) : les évènements au hasard (cloche, grenouilles) tombent aux mêmes instants d'une mesure à l'autre.
        let a = 0
        for (const c of `${room}/${id}`) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0
        Math.random = () => {
          a = (a + 0x6d2b79f5) | 0
          let t = Math.imul(a ^ (a >>> 15), 1 | a)
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296
        }
        return window.__lofi.audio.renderOffline(id, room, seconds)
      }, { ...job, seconds })
      // Niveau réel : un enregistrement sort à -20 LUFS (npm run audio) × son gain de boucle ; sinon, c'est la synthèse mesurée.
      r.rec = job.rec
      r.level = job.rec === null ? r.lufsDef : REC_LUFS + 20 * Math.log10(job.rec * r.gainDef)
      rows.push(r)
      log(`  ${String(++n).padStart(3)}/${jobs.length}  ${job.room}/${job.id}  ${r.level.toFixed(1)} LUFS ${job.rec === null ? 'synthèse' : 'enreg.'}  (${((performance.now() - t0) / 1000).toFixed(1)} s)`)
    } catch (e) {
      failures.push(`${job.room}/${job.id} : ${String(e.message ?? e).split('\n')[0]}`)
      n++
    }
  }
} finally {
  await browser.close()
  await server?.close()
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const med = rows.length ? median(rows.map((r) => r.level)) : 0
for (const r of rows) r.dev = r.level - med
rows.sort((a, b) => a.dev - b.dev)

if (json) {
  console.log(JSON.stringify({ median: med, rows, failures }, null, 1))
} else {
  const f = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '-')
  console.log(`\n${'canal'.padEnd(26)}${'source'.padEnd(9)} base  volume  synth.  moy.  crête(brut)  niveau  écart`)
  for (const r of rows) {
    const flag = Math.abs(r.dev) > FLAGRANT ? ' !!' : Math.abs(r.dev) > WARN ? ' !' : ''
    console.log(
      `${(r.room + '/' + r.id).padEnd(26)}${(r.rec === null ? 'synthèse' : 'enreg.').padEnd(9)}${f(r.base, 2).padStart(5)} ${f(r.volume, 2).padStart(7)} ${f(r.lufsDef).padStart(7)} ${f(r.lufsMean + 20 * Math.log10(r.gainDef)).padStart(5)} ${f(20 * Math.log10(r.peak)).padStart(9)} dB ${f(r.level).padStart(7)} ${(r.dev > 0 ? '+' : '') + f(r.dev)}${flag}`,
    )
  }
  console.log(`\nMédiane des niveaux par défaut : ${f(med)} LUFS (${rows.length} canaux).`)
  const off = rows.filter((r) => Math.abs(r.dev) > WARN)
  console.log(`\nÀ plus de ±${WARN} dB de la médiane : ${off.length ? '' : 'aucun'}`)
  for (const r of off) {
    const fix = Math.abs(r.dev) > FLAGRANT ? `  FLAGRANT : base ${f(r.base, 2)} → ${f(r.base * 10 ** (-r.dev / 20), 2)} pour revenir à la médiane` : ''
    console.log(`  ${(r.room + '/' + r.id).padEnd(26)} ${(r.rec === null ? 'synthèse' : 'enreg.').padEnd(9)} ${(r.dev > 0 ? '+' : '') + f(r.dev)} dB${fix}`)
  }
  if (failures.length) console.log(`\nNon mesurés :\n${failures.map((x) => '  ' + x).join('\n')}`)
}
process.exit(failures.length && !rows.length ? 1 : 0)
