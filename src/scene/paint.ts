import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, RepeatWrapping } from 'three'
import { smooth } from '../math'
import { mood } from './anim'
import { makeCanvas } from './textures'

// Outils des vues peintes (ce qu'on voit par une fenêtre, un fond de décor) : couleurs jour → nuit, tirage à graine,
// et une texture redessinée seulement quand le jour, la nuit ou la pluie changent.

export type RGB = [number, number, number]
export const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
export const rgb = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
/** Une couleur [jour, nuit] à l'instant `n` (0 jour → 1 nuit). */
export const dn = (pair: readonly [string, string], n: number) => mix(hex(pair[0]), hex(pair[1]), n)

/** Tirage pseudo-aléatoire à graine : le même décor à chaque visite. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function poly(x: CanvasRenderingContext2D, pts: number[][], fill: string | CanvasGradient) {
  x.fillStyle = fill
  x.beginPath()
  pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)))
  x.closePath()
  x.fill()
}

export function rr(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, R: number) {
  x.beginPath(); x.moveTo(X + R, Y)
  x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R)
  x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath()
}

/** Une texture qu'on dessine une fois (motif, enseigne…). */
export function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const [c, x] = makeCanvas(w, h)
  draw(x)
  const t = new CanvasTexture(c)
  if (repeat) {
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(...repeat)
  }
  return t
}

/** Le temps qu'il fait dehors, adouci (0 → 1) : nuit, mouillé (pluie, bruine à 0,55), neige (0,7 ; tempête de neige 1), orage. */
export interface Wx {
  n: number
  r: number
  s: number
  st: number
}

/**
 * Appelle `draw` quand le jour, la nuit ou la météo bougent assez (les transitions durent environ une seconde), puis une dernière
 * fois quand ils se sont posés (sur leur valeur finale, la bruine à 0,55 comprise). Rien entre deux : une vue peinte ne se
 * redessine pas à chaque image.
 */
export function useRepaint(draw: (w: Wx) => void) {
  const st = useRef({ drawn: [-1, -1, -1, -1], last: [-1, -1, -1, -1] })
  useFrame(() => {
    const { drawn, last } = st.current, now = [mood.night, mood.rain, mood.snow, mood.storm]
    let far = 0, moved = 0
    for (let i = 0; i < 4; i++) {
      far = Math.max(far, Math.abs(now[i] - drawn[i]))
      moved = Math.max(moved, Math.abs(now[i] - last[i]))
      last[i] = now[i]
    }
    if (far > 0.06 || (far > 0.001 && moved < 1e-4)) {
      draw({ n: smooth(mood.night), r: smooth(mood.rain), s: smooth(mood.snow), st: smooth(mood.storm) })
      for (let i = 0; i < 4; i++) drawn[i] = now[i]
    }
  })
}

/**
 * Texture peinte qui suit l'ambiance : `draw(x, n, r, w)` reçoit la nuit et la pluie (0 → 1, adoucies), et dans `w` la neige
 * et l'orage. Elle n'est redessinée que quand ils bougent (voir `useRepaint`).
 */
export function usePainted(w: number, h: number, draw: (x: CanvasRenderingContext2D, n: number, r: number, w: Wx) => void) {
  const { tex, x } = useMemo(() => {
    const [c, x] = makeCanvas(w, h)
    return { tex: new CanvasTexture(c), x }
  }, [w, h])
  useRepaint((wx) => {
    draw(x, wx.n, wx.r, wx)
    tex.needsUpdate = true
  })
  return tex
}

// La météo dans une vue peinte. Couleurs [jour, nuit] : le ciel d'orage (ardoise), le ciel de neige (blanc laiteux), la neige
// posée (bleutée sous la lune), son ombre, et la brume blanche de la tempête de neige.
export const WX = {
  storm: ['#59606e', '#0b0f1e'],
  snowSky: ['#dfe4eb', '#3c4568'],
  snow: ['#f6f8fc', '#a9b5d8'],
  snowShade: ['#d3dbe8', '#76839f'],
  haze: ['#eef1f5', '#4e587c'],
} as const

/** La brume blanche de la tempête de neige (0 par la neige, 1 par la tempête) : elle efface le lointain. */
export const whiteout = (w: Wx) => clamp01((w.s - 0.78) / 0.22)
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * Une couleur sous le temps qu'il fait : l'orage l'assombrit vers l'ardoise, la neige la pâlit, la tempête de neige l'efface
 * dans le blanc ; `far` (0 → 1) : d'autant plus que c'est loin.
 */
export function weathered(c: RGB, w: Wx, far = 0): RGB {
  let o = c
  if (w.st > 0.001) o = mix(o, dn(WX.storm, w.n), w.st * (0.3 + far * 0.35))
  if (w.s > 0.001) o = mix(o, dn(WX.haze, w.n), w.s * (0.08 + far * 0.3) + whiteout(w) * (0.12 + far * 0.45))
  return o
}

/** Le ciel sous le temps qu'il fait : ardoise à l'orage, blanc laiteux sous la neige. */
export function skyWx(c: RGB, w: Wx): RGB {
  let o = c
  if (w.st > 0.001) o = mix(o, dn(WX.storm, w.n), w.st * 0.62)
  if (w.s > 0.001) o = mix(o, dn(WX.snowSky, w.n), w.s * 0.8)
  return o
}

/** Ce qui reste du soleil, de la lune et des étoiles : la pluie, l'orage et la neige les voilent. */
export const clearOf = (w: Wx) => (1 - w.r * 0.95) * (1 - w.st) * Math.max(0, 1 - w.s * 1.15)

/**
 * De la neige posée sur une arête (le haut d'un toit, d'une colline, d'un rocher) : un bourrelet blanc qui suit la ligne `pts`,
 * épais de `thick` pixels, avec une ombre fine dessous. Rien quand il ne neige pas.
 */
export function snowLine(x: CanvasRenderingContext2D, pts: number[][], thick: number, w: Wx) {
  const a = clamp01(w.s * 1.4)
  if (a < 0.01 || pts.length < 2) return
  x.save()
  x.lineJoin = 'round'; x.lineCap = 'round'
  const path = () => { x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))) }
  x.translate(0, thick * 0.35)
  x.strokeStyle = rgb(dn(WX.snowShade, w.n), a); x.lineWidth = thick; path(); x.stroke()
  x.translate(0, -thick * 0.35)
  x.strokeStyle = rgb(dn(WX.snow, w.n), a); x.lineWidth = thick; path(); x.stroke()
  x.restore()
}

/** Un voile qui recouvre une forme de neige (un pré, un champ, une plage) : `alpha` de la neige, la forme donnée par `shape`. */
export function snowFill(x: CanvasRenderingContext2D, shape: () => void, w: Wx, k = 1) {
  const a = clamp01(w.s * 1.4) * k
  if (a < 0.01) return
  x.save(); x.fillStyle = rgb(dn(WX.snow, w.n), a); shape(); x.fill(); x.restore()
}

/** Des flocons peints, immobiles, pour la profondeur (les flocons qui bougent sont des `ViewFlakes`). La tempête en sème plus. */
export function paintFlakes(x: CanvasRenderingContext2D, W: number, H: number, w: Wx, seed = 7) {
  if (w.s < 0.01) return
  const r = seeded(seed), count = Math.round(40 + whiteout(w) * 120)
  x.fillStyle = rgb(dn(WX.snow, w.n), 0.55 * clamp01(w.s * 1.4))
  for (let i = 0; i < count; i++) { x.beginPath(); x.arc(r() * W, r() * H, 0.8 + r() * 1.6, 0, Math.PI * 2); x.fill() }
}

/** La brume blanche de la tempête de neige sur toute la vue, plus dense en haut (le lointain). */
export function paintWhiteout(x: CanvasRenderingContext2D, W: number, H: number, w: Wx, top = 0.55, bottom = 0.18) {
  const k = whiteout(w)
  if (k < 0.01) return
  const c = dn(WX.haze, w.n), g = x.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, rgb(c, top * k)); g.addColorStop(1, rgb(c, bottom * k))
  x.fillStyle = g; x.fillRect(0, 0, W, H)
}

/** La mer d'orage : des moutons blancs, plus serrés près de la côte. `y0`, `y1` : de l'horizon au rivage. */
export function paintWhitecaps(x: CanvasRenderingContext2D, W: number, y0: number, y1: number, w: Wx, seed = 5) {
  if (w.st < 0.01) return
  const r = seeded(seed)
  for (let i = 0; i < 90; i++) {
    const k = r(), py = y0 + 4 + k * (y1 - y0 - 8), len = 6 + k * 34
    x.fillStyle = `rgba(235,240,245,${((0.25 + k * 0.45) * w.st * (1 - w.n * 0.5)).toFixed(3)})`
    x.beginPath(); x.ellipse(r() * W, py, len, 1.2 + k * 2.2, 0, 0, Math.PI * 2); x.fill()
  }
}
