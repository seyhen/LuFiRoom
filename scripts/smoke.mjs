// Test de fumée dans un vrai navigateur (Chromium sans écran, Playwright) : le site construit (dist/) s'ouvre, et chacune
// des pièces se charge, dessine, a ses boutons et son mixeur, et un son s'allume au toucher, sans aucune erreur.
//
//   npm run build && npm run test:smoke      (ou npm test, qui fait aussi les stations)
//
// Deux tailles d'écran : téléphone (390 × 844, tactile) et ordinateur (1440 × 900). Pour chaque pièce :
//   - le sélecteur montre la pièce choisie, la transition est finie ;
//   - le canvas WebGL dessine la pièce (des tracés à chaque image, une image ni vide ni d'une seule couleur) ;
//   - un <button> par objet interactif, avec son aria-label (le libellé de l'objet) et aria-pressed ;
//   - une carte par son de la pièce dans le mixeur, avec son nom ;
//   - un clic sur une carte allume le son (aria-pressed, AudioContext « running »), un second l'éteint ;
//   - aucune erreur en console, aucune exception de page, aucune requête en échec, aucun « Enregistrement indisponible ».
// Ce qu'on attend vient des fiches des pièces (src/rooms/), lues par Vite : une pièce ajoutée est testée d'office.
//
// Le WebGL est logiciel (SwiftShader, sans carte graphique) : quelques images par seconde, et chaque pièce compile ses shaders.
// Le travail est donc réparti entre plusieurs navigateurs en parallèle (un par cœur, 4 au plus).
//
// Variables : LOFI_CHROMIUM = chemin d'un Chromium à utiliser (sinon celui de Playwright) ; LOFI_SMOKE_ROOMS = identifiants
// séparés par des virgules pour n'en tester que quelques-uns ; LOFI_SMOKE_WORKERS = nombre de navigateurs en parallèle ;
// LOFI_SMOKE_HEADED=1 pour voir le navigateur. En cas d'échec, une capture par pièce fautive est écrite dans test-results/.

import { existsSync, mkdirSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { join } from 'node:path'
import { createServer, preview } from 'vite'
import { chromium } from 'playwright'

const t0 = performance.now()
const since = (t) => ((performance.now() - t) / 1000).toFixed(1)
const OUT = 'test-results'

if (!existsSync(join('dist', 'index.html'))) {
  console.error("Pas de dist/index.html : lance d'abord npm run build.")
  process.exit(1)
}

// 1. Ce qu'on attend : les fiches des pièces, chargées par Vite comme dans l'app (TypeScript compris).
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] } })
const { rooms } = await vite.ssrLoadModule('/src/rooms/index.ts')
await vite.close()
const only = process.env.LOFI_SMOKE_ROOMS?.split(',').map((s) => s.trim()).filter(Boolean)
const expected = rooms
  .filter((r) => !only || only.includes(r.id))
  .map((r) => ({ id: r.id, name: r.name, objects: r.objects.map((o) => o.label), sounds: r.sounds.map((s) => ({ id: s.id, name: s.name })) }))
if (!expected.length) {
  console.error(`Aucune pièce à tester (LOFI_SMOKE_ROOMS=${process.env.LOFI_SMOKE_ROOMS}).`)
  process.exit(1)
}

// 2. Le site construit, servi comme en production (vite preview).
const server = await preview({ logLevel: 'silent', preview: { port: 4317, strictPort: false, open: false } })
const base = server.resolvedUrls.local[0]

const VIEWPORTS = [
  { name: 'mobile 390', options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
  { name: 'desktop', options: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
]

// 3. Les lots : les pièces, coupées en lots qui tournent chacun dans son navigateur. Dans un lot, l'écran de téléphone passe
// d'abord, puis celui d'ordinateur, dans le même navigateur : il garde les shaders déjà compilés, la 2e passe va bien plus vite.
const workers = Math.max(1, Number(process.env.LOFI_SMOKE_WORKERS) || Math.min(4, availableParallelism()))
const size = Math.ceil(expected.length / Math.min(workers, expected.length))
const shards = []
for (let i = 0; i < expected.length; i += size) shards.push(expected.slice(i, i + size))

// Avant le code de l'app : garde l'image WebGL lisible après affichage (pour la mesurer), compte les tracés, note les AudioContext.
function instrument() {
  const get = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === 'webgl' || type === 'webgl2') attrs = { ...attrs, preserveDrawingBuffer: true }
    return get.call(this, type, attrs)
  }
  window.__smokeDraws = 0
  for (const P of [window.WebGL2RenderingContext?.prototype, window.WebGLRenderingContext?.prototype]) {
    if (!P) continue
    for (const nm of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      const o = P[nm]
      if (o)
        P[nm] = function (...a) {
          window.__smokeDraws++
          return o.apply(this, a)
        }
    }
  }
  window.__smokeCtx = []
  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const C = window[name]
    if (!C) continue
    window[name] = class extends C {
      constructor(...a) {
        super(...a)
        window.__smokeCtx.push(this)
      }
    }
  }
}

// Mesure dans la page : part de pixels opaques et nombre de couleurs distinctes (sur une réduction 96 × 96 du canvas).
function canvasStats() {
  const c = document.querySelector('canvas')
  if (!c || !c.width || !c.height) return { opaque: 0, colors: 0, size: '0x0' }
  const W = 96, H = 96, t = document.createElement('canvas')
  t.width = W
  t.height = H
  const g = t.getContext('2d', { willReadFrequently: true })
  g.drawImage(c, 0, 0, W, H)
  const d = g.getImageData(0, 0, W, H).data, seen = new Set()
  let opaque = 0
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue
    opaque++
    seen.add(((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4))
  }
  return { opaque: opaque / (W * H), colors: seen.size, size: `${c.width}x${c.height}` }
}

const exact = (text) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
const failures = [], timings = []

async function testRoom(page, vp, room, problems) {
  const errs = [], phases = [], tRoom = performance.now()
  const mark = (what) => phases.push(`${what} ${since(tRoom)}`)
  try {
    const chip = page.locator('.rooms button.room', { hasText: exact(room.name) })
    if ((await chip.getAttribute('aria-pressed')) !== 'true') await chip.click()
    // La pièce est là : puce choisie, transition finie, un bouton par objet, une carte par son.
    await page.waitForFunction(
      ({ name, nObjects, nSounds }) => {
        const chip = [...document.querySelectorAll('.rooms button.room')].find((b) => b.textContent.trim() === name)
        return (
          chip?.getAttribute('aria-pressed') === 'true' &&
          !document.documentElement.classList.contains('leaving') &&
          document.querySelectorAll('.hotspots button').length === nObjects &&
          document.querySelectorAll('.mix .card').length === nSounds
        )
      },
      { name: room.name, nObjects: room.objects.length, nSounds: room.sounds.length },
      { timeout: 60_000 },
    )
    mark('pièce')

    // Le canvas dessine la nouvelle pièce : plus de 100 tracés depuis qu'elle est là (une image de pièce en fait 150 à 300),
    // et l'image n'est ni vide (transparente) ni d'une seule couleur (noire).
    const drawsAtStart = await page.evaluate(() => window.__smokeDraws)
    await page.waitForFunction((n) => window.__smokeDraws - n > 100, drawsAtStart, { timeout: 30_000, polling: 250 }).catch(() => {
      errs.push('le canvas ne dessine pas (moins de 100 tracés en 30 s)')
    })
    const stats = await page.evaluate(canvasStats)
    if (!(stats.opaque > 0.05 && stats.colors >= 24)) errs.push(`canvas vide ou uni (${stats.size}, ${Math.round(stats.opaque * 100)} % opaque, ${stats.colors} couleurs)`)
    mark('dessin')

    // Les hotspots : de vrais boutons, aria-label = libellé de l'objet, aria-pressed présent.
    const hs = await page.$$eval('.hotspots button', (bs) => bs.map((b) => ({ tag: b.tagName, label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed') })))
    const labels = hs.map((h) => h.label)
    for (const want of room.objects) if (!labels.includes(want)) errs.push(`hotspot manquant : « ${want} »`)
    for (const h of hs) if (h.tag !== 'BUTTON' || !h.label || !['true', 'false'].includes(h.pressed)) errs.push(`hotspot mal formé : ${JSON.stringify(h)}`)

    // Le mixeur : une carte par son, avec son nom, un bouton à bascule et un curseur de volume.
    const cards = await page.$$eval('.mix .card', (cs) =>
      cs.map((c) => ({ name: c.querySelector('.nm')?.textContent.trim(), pressed: c.querySelector('button.tg')?.getAttribute('aria-pressed'), range: !!c.querySelector('input[type=range][aria-label]') })),
    )
    const names = cards.map((c) => c.name)
    for (const s of room.sounds) if (!names.includes(s.name)) errs.push(`carte manquante dans le mixeur : « ${s.name} »`)
    for (const c of cards) if (!['true', 'false'].includes(c.pressed) || !c.range) errs.push(`carte mal formée : ${JSON.stringify(c)}`)

    // Un geste : clic sur la carte d'un son (pas la radio, qui télécharge un morceau entier) ; il s'allume, puis s'éteint.
    const sound = room.sounds.find((s) => s.id !== 'radio') ?? room.sounds[0]
    const toggle = page.locator('.mix .card').filter({ has: page.locator('.nm', { hasText: exact(sound.name) }) }).locator('button.tg')
    await toggle.click()
    await page.waitForFunction((el) => el.getAttribute('aria-pressed') === 'true', await toggle.elementHandle(), { timeout: 10_000 })
    await page.waitForFunction(() => window.__smokeCtx.some((c) => c.state === 'running'), null, { timeout: 10_000 })
    await page.waitForTimeout(800) // le son se construit (son enregistrement se charge) : une erreur aurait le temps de sortir
    await toggle.click()
    await page.waitForFunction((el) => el.getAttribute('aria-pressed') === 'false', await toggle.elementHandle(), { timeout: 10_000 })
    mark(`son « ${sound.id} »`)
  } catch (e) {
    errs.push(String(e.message ?? e).split('\n')[0])
  }
  // Une exception dans la boucle d'images revient à chaque image : on la compte au lieu de la répéter.
  const counts = new Map()
  for (const e of [...errs, ...problems.splice(0)]) counts.set(e, (counts.get(e) ?? 0) + 1)
  errs.splice(0, errs.length, ...[...counts].map(([e, n]) => (n > 1 ? `${e} (× ${n})` : e)))
  const label = `${vp.name} / ${room.id}`
  if (errs.length) {
    mkdirSync(OUT, { recursive: true })
    const shot = join(OUT, `${vp.name.replace(/\W+/g, '-')}-${room.id}.png`)
    await page.screenshot({ path: shot }).catch(() => {})
    failures.push(label)
    console.log(`ÉCHEC ${label} (${since(tRoom)} s)\n  - ${errs.join('\n  - ')}\n  capture : ${shot}`)
  } else console.log(`ok    ${label} (${since(tRoom)} s : ${phases.join(', ')})`)
}

async function runShard(rooms) {
  // Chromium sans écran, avec un WebGL logiciel (SwiftShader) : marche sans carte graphique, en CI comme ici.
  const browser = await chromium.launch({
    headless: process.env.LOFI_SMOKE_HEADED !== '1',
    executablePath: process.env.LOFI_CHROMIUM || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  try {
    for (const vp of VIEWPORTS) await runViewport(browser, vp, rooms)
  } finally {
    await browser.close()
  }
}

async function runViewport(browser, vp, rooms) {
  const context = await browser.newContext({ ...vp.options, locale: 'fr-FR', serviceWorkers: 'block' })
  try {
    await context.addInitScript(instrument)
    const page = await context.newPage()
    const problems = [] // erreurs de la pièce en cours
    page.on('console', (m) => {
      if (m.type() === 'error' || /Enregistrement indisponible/.test(m.text())) problems.push(`console ${m.type()} : ${m.text()}`)
    })
    page.on('pageerror', (e) => problems.push(`exception : ${e.message}`))
    page.on('requestfailed', (r) => {
      // Une requête abandonnée exprès (changement de pièce, son coupé pendant son chargement) n'est pas une panne.
      if (!/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) problems.push(`requête échouée : ${r.url()} (${r.failure()?.errorText})`)
    })
    page.on('response', (r) => {
      if (r.status() >= 400) problems.push(`réponse ${r.status()} : ${r.url()}`)
    })

    const tLoad = performance.now()
    await page.goto(base)
    // L'écran de chargement s'efface quand la première pièce est dessinée, ou au bout de 12 s (filet de sécurité de l'app) :
    // c'est pourquoi le dessin est vérifié à part, pièce par pièce.
    await page.waitForFunction(() => !document.getElementById('splash'), null, { timeout: 60_000 })
    timings.push(`${vp.name} ${since(tLoad)} s`)
    for (const room of rooms) await testRoom(page, vp, room, problems)
  } catch (e) {
    failures.push(`${vp.name} : ${rooms.map((r) => r.id).join(', ')}`)
    console.log(`ÉCHEC ${vp.name} (${rooms.map((r) => r.id).join(', ')}) : ${String(e.message ?? e).split('\n')[0]}`)
  } finally {
    await context.close()
  }
}

console.log(`${expected.length} pièce${expected.length > 1 ? 's' : ''} × ${VIEWPORTS.length} écrans, ${shards.length} navigateur${shards.length > 1 ? 's' : ''} en parallèle, sur ${base}`)
await Promise.all(shards.map(runShard))
await new Promise((r) => server.httpServer.close(r))

console.log(`Écran de chargement : ${timings.join(', ')}`)
console.log(`Fini en ${since(t0)} s : ${failures.length ? `${failures.length} échec${failures.length > 1 ? 's' : ''}` : 'tout passe'}.`)
process.exit(failures.length ? 1 : 0)
