import { TAU } from '../../math'
import { canvasTex, seeded } from '../paint'

// Textures du toit-terrasse : brique, lattes de teck, façades de la ville (et leurs fenêtres allumées), douelles du château d'eau.

/** Brique rouge de Brooklyn, joints clairs. Tuile : 1 × 1 unité (8 rangs). */
export const brickTex = canvasTex(256, 256, (x) => {
  const r = seeded(13), rows = 8, h = 256 / rows
  x.fillStyle = '#d8c8b4'; x.fillRect(0, 0, 256, 256)
  for (let j = 0; j < rows; j++) {
    const off = j % 2 ? -32 : 0
    for (let i = -1; i < 5; i++) {
      const t = r()
      x.fillStyle = `rgb(${150 + t * 40},${70 + t * 22},${55 + t * 15})`
      x.fillRect(off + i * 64 + 2, j * h + 2, 60, h - 4)
      if (r() < 0.2) { x.fillStyle = 'rgba(40,20,15,.15)'; x.fillRect(off + i * 64 + 2, j * h + 2, 60, h - 4) }
    }
  }
}, [1, 1])

/** Lattes de teck de la terrasse, grisées par le soleil. Tuile : 1 × 1 unité. */
export const deckTex = canvasTex(256, 256, (x) => {
  const r = seeded(29)
  for (let j = 0; j < 5; j++) {
    const t = r()
    x.fillStyle = `rgb(${150 + t * 25},${112 + t * 18},${80 + t * 12})`
    x.fillRect(0, j * 51.2, 256, 51.2)
    x.strokeStyle = 'rgba(80,55,35,.18)'; x.lineWidth = 1
    for (let k = 0; k < 4; k++) { const y = j * 51.2 + 8 + r() * 36; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(80, y + 3, 170, y - 3, 256, y); x.stroke() }
    x.fillStyle = 'rgba(50,35,25,.55)'; x.fillRect(0, j * 51.2, 256, 3)
    x.fillStyle = 'rgba(60,45,35,.6)'; for (const px of [30, 160]) { x.beginPath(); x.arc(px + r() * 40, j * 51.2 + 25, 2, 0, TAU); x.fill() }
  }
}, [1, 1])

/**
 * Façade d'immeuble : une grille de fenêtres. Deux textures de la même grille : l'une pour le jour (vitres sombres sur le mur),
 * l'autre ne garde que les fenêtres allumées, qui brillent la nuit (environ une sur trois, en chaud ou en bleu télé).
 * Tuile : 4 fenêtres de large, 6 de haut.
 */
const COLS = 4, ROWS = 6, WW = 64, WH = 64
const lit = (() => {
  const r = seeded(91), out: (string | null)[] = []
  for (let i = 0; i < COLS * ROWS; i++) out.push(r() < 0.38 ? (r() < 0.8 ? '#ffd28a' : '#a8c8ff') : null)
  return out
})()
export const facadeTex = canvasTex(COLS * WW, ROWS * WH, (x) => {
  x.fillStyle = 'rgba(255,255,255,0)'; x.clearRect(0, 0, COLS * WW, ROWS * WH)
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    x.fillStyle = '#2c3346'; x.fillRect(i * WW + 14, j * WH + 12, WW - 28, WH - 22)
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(i * WW + 14, j * WH + 12, WW - 28, 4)
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i * WW + 10, j * WH + WH - 10, WW - 20, 4)
  }
}, [1, 1])
export const facadeGlowTex = canvasTex(COLS * WW, ROWS * WH, (x) => {
  x.fillStyle = '#000'; x.fillRect(0, 0, COLS * WW, ROWS * WH)
  lit.forEach((c, k) => {
    if (!c) return
    const i = k % COLS, j = (k / COLS) | 0
    x.fillStyle = c; x.fillRect(i * WW + 14, j * WH + 12, WW - 28, WH - 22)
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i * WW + 14 + (WW - 28) / 2 - 1, j * WH + 12, 2, WH - 22)
  })
}, [1, 1])

/** Douelles de bois du château d'eau, cerclées d'acier. */
export const staveTex = canvasTex(256, 256, (x) => {
  const r = seeded(37)
  for (let i = 0; i < 16; i++) { const t = r(); x.fillStyle = `rgb(${120 + t * 30},${88 + t * 20},${62 + t * 14})`; x.fillRect(i * 16, 0, 16, 256); x.fillStyle = 'rgba(40,25,15,.35)'; x.fillRect(i * 16, 0, 1.5, 256) }
  for (const y of [30, 100, 170, 230]) { x.fillStyle = '#3a3a42'; x.fillRect(0, y, 256, 6); x.fillStyle = 'rgba(255,255,255,.15)'; x.fillRect(0, y, 256, 1.5) }
}, [3, 1])

/** Tapis d'extérieur à larges rayures. */
export const rugTex = canvasTex(256, 256, (x) => {
  const cols = ['#e9dcc4', '#2f6b6b', '#e9dcc4', '#d9a441', '#e9dcc4', '#c7563e', '#e9dcc4', '#2f6b6b']
  cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * 32, 256, 32) })
  x.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 256; i += 4) x.fillRect(i, 0, 1, 256)
})
