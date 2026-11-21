import { BoxGeometry, ExtrudeGeometry, Shape } from 'three'
import { seeded } from '../../../math'
import { Batch, type Item } from '../../parts'
import { O } from './materials'
import { terrainY } from './terrain'

// Le village du fond : de petites maisons pâles sur les collines, un clocher bas, des toits d'ardoise et de tuile. Très loin (15 à 20
// du centre) : le fondu du ciel les voile, ils ne servent qu'à remplir le haut de l'écran. Deux séries instanciées (murs, toits).

const WALL = new BoxGeometry(1, 1, 1)
/** Un toit à deux pans : un prisme de 1 de large, 1 de haut, 1 de long (le faîtage court le long de z). */
const PRISM = (() => {
  const s = new Shape()
  s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.closePath()
  return new ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5)
})()

const WALLS = [0xf0e2cc, 0xf2d6c8, 0xe8dcc6, 0xf4e8d4, 0xe6d2c0, 0xdfe0d2]
const ROOFS = [0x9893a8, 0xa89c9c, 0x8a859e, 0x9c9096]

interface Cluster {
  cx: number
  cz: number
  n: number
  spread: [number, number]
  seed: number
  /** Une église au centre. */
  church?: boolean
}

const CLUSTERS: Cluster[] = [
  { cx: -17.5, cz: 1.5, n: 9, spread: [3.6, 4.6], seed: 7, church: true },
  { cx: 3.5, cz: -19, n: 7, spread: [6, 2.2], seed: 11 },
  { cx: -2.0, cz: -23, n: 5, spread: [6, 1.6], seed: 17 },
]

const { walls, roofs, windows } = (() => {
  const walls: Item[] = [], roofs: Item[] = [], windows: Item[] = []
  for (const k of CLUSTERS) {
    const r = seeded(k.seed), placed: [number, number][] = []
    if (k.church) {
      // la nef, le clocher carré à l'angle et sa flèche d'ardoise : bas, à l'échelle des maisons (un clocher de village)
      const x = k.cx, z = k.cz, y = terrainY(x, z) - 0.1
      walls.push({ p: [x, y + 0.9, z], s: [2.4, 1.8, 3.8], c: 0xf4ead8, r: [0, 0.3, 0] })
      roofs.push({ p: [x, y + 1.8 - 0.02, z], s: [2.8, 1.1, 4.3], c: 0x8a859c, r: [0, 0.3, 0] })
      const tx = x + 1.3 * Math.cos(0.3) + 1.4 * Math.sin(0.3), tz = z - 1.3 * Math.sin(0.3) + 1.4 * Math.cos(0.3)
      for (const [lx, lz, sx, sz] of [[0, 0.64, 0.3, 0.06], [0.64, 0, 0.06, 0.3]] as [number, number, number, number][]) {
        const ca = Math.cos(0.3), sa = Math.sin(0.3)
        windows.push({ p: [tx + lx * ca + lz * sa, y + 2.9, tz - lx * sa + lz * ca], s: [sx, 0.6, sz], r: [0, 0.3, 0] })
      }
      walls.push({ p: [tx, y + 1.7, tz], s: [1.25, 3.4, 1.25], c: 0xf1e6d2, r: [0, 0.3, 0] })
      roofs.push({ p: [tx, y + 3.4 - 0.02, tz], s: [1.6, 1.5, 1.6], c: 0x7a7592, r: [0, 0.3, 0] })
      placed.push([x, z], [tx, tz])
    }
    for (let i = 0, tries = 0; i < k.n && tries < 200; tries++) {
      const x = k.cx + (r() - 0.5) * 2 * k.spread[0], z = k.cz + (r() - 0.5) * 2 * k.spread[1]
      if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 3.0)) continue
      placed.push([x, z]); i++
      const w = 2.0 + r() * 0.9, d = 1.9 + r() * 0.7, h = 1.5 + r() * 0.4, rh = 0.8 + r() * 0.35, y = terrainY(x, z) - 0.1, a = (r() - 0.5) * 0.9
      walls.push({ p: [x, y + h / 2, z], s: [w, h, d], c: WALLS[Math.floor(r() * WALLS.length)], r: [0, a, 0] })
      // deux fenêtres sur la façade de devant, une sur le côté, un seuil : de quoi lire « une maison » même sous la brume
      const ca = Math.cos(a), sa = Math.sin(a), put = (lx: number, ly: number, lz: number, sx: number, sz: number) => windows.push({ p: [x + lx * ca + lz * sa, y + ly, z - lx * sa + lz * ca], s: [sx, 0.5, sz], r: [0, a, 0] })
      put(-w * 0.24, h * 0.58, d / 2 + 0.02, 0.42, 0.06); put(w * 0.24, h * 0.58, d / 2 + 0.02, 0.42, 0.06); put(w / 2 + 0.02, h * 0.58, 0, 0.06, 0.42)
      roofs.push({ p: [x, y + h - 0.02, z], s: [w + 0.35, rh, d + 0.35], c: ROOFS[Math.floor(r() * ROOFS.length)], r: [0, a, 0] })
    }
  }
  return { walls, roofs, windows }
})()

export function Village() {
  return (
    <>
      <Batch geo={WALL} m={O.vwall} items={walls} />
      <Batch geo={PRISM} m={O.vroof} items={roofs} />
      <Batch geo={WALL} m={O.glass} items={windows} />
    </>
  )
}
