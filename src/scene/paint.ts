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

/**
 * Texture peinte qui suit l'ambiance : `draw(x, n, r)` reçoit la nuit et la pluie (0 → 1, adoucies). Elle n'est redessinée
 * que quand elles bougent assez (les transitions durent moins d'une seconde), puis une dernière fois une fois posées.
 */
export function usePainted(w: number, h: number, draw: (x: CanvasRenderingContext2D, n: number, r: number) => void) {
  const { tex, x } = useMemo(() => {
    const [c, x] = makeCanvas(w, h)
    return { tex: new CanvasTexture(c), x }
  }, [w, h])
  const drawn = useRef({ n: -1, r: -1 })
  useFrame(() => {
    const d = drawn.current, dn = Math.abs(mood.night - d.n), dr = Math.abs(mood.rain - d.r)
    const settled = (v: number) => v === 0 || v === 1
    if (dn > 0.06 || dr > 0.06 || ((dn > 0.001 || dr > 0.001) && settled(mood.night) && settled(mood.rain))) {
      draw(x, smooth(mood.night), smooth(mood.rain))
      tex.needsUpdate = true
      d.n = mood.night
      d.r = mood.rain
    }
  })
  return tex
}
