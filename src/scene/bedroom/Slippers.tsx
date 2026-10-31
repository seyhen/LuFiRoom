import { Color } from 'three'
import { Batch, Part, rbox, type Item } from '../parts'
import { blob, ell } from '../blob'
import { B } from './materials'

// Une paire de chaussons roses duveteux sur le tapis, et une pile de livres au pied du lit.
const SOLE = [[-1.52, 0.84, 0.28], [-1.44, 1.04, 0.08]]
// Un chausson d'une seule peau (repère : la pointe vers +x) : semelle plus foncée, dessus bombé, talon, l'ouverture creusée
// où entre le pied, bordée de fourrure crème, et un pompon sur le dessus.
const fluff = new Color(0xfffaf4)
const SLIPPER = blob(
  [
    ell([0, 0.026, 0], [0.17, 0.026, 0.07], { color: 0xee9db6, k: 0.02 }),
    ell([0.05, 0.06, 0], [0.12, 0.058, 0.072], { color: 0xf6c3d3, k: 0.04 }),
    ell([-0.1, 0.052, 0], [0.075, 0.048, 0.068], { color: 0xf6c3d3, k: 0.04 }),
    ell([-0.045, 0.1, 0], [0.085, 0.05, 0.05], { op: 'sub', k: 0.025 }),
    ell([0.085, 0.118, 0], [0.042, 0.038, 0.042], { color: 0xfffaf4, k: 0.015 }),
  ],
  {
    h: 0.011,
    k: 0.03,
    paint: (p, c) => {
      // le bord de l'ouverture : une collerette de fourrure
      const e = Math.hypot((p.x + 0.045) / 0.105, (p.z) / 0.07)
      if (p.y > 0.08 && e < 1.02 && e > 0.6) c.lerp(fluff, 0.85)
      return c
    },
  },
)
const BOOKS: Item[] = [
  { p: [-2.45, 0.06, 1.05], s: [0.62, 0.11, 0.44], r: [0, 0.3, 0], c: 0x37a3b5 },
  { p: [-2.45, 0.06, 1.05], s: [0.58, 0.085, 0.45], r: [0, 0.3, 0], c: 0xfff5e6 },
  { p: [-2.43, 0.17, 1.04], s: [0.56, 0.1, 0.4], r: [0, -0.2, 0], c: 0xf3afc6 },
  { p: [-2.43, 0.17, 1.04], s: [0.52, 0.08, 0.41], r: [0, -0.2, 0], c: 0xfff5e6 },
  { p: [-2.46, 0.27, 1.05], s: [0.5, 0.1, 0.36], r: [0, 0.5, 0], c: 0xf6d071 },
  { p: [-2.46, 0.27, 1.05], s: [0.46, 0.08, 0.37], r: [0, 0.5, 0], c: 0xfff5e6 },
]

/** Chaussons et pile de livres posés par terre. */
export function Slippers() {
  return (
    <>
      {SOLE.map(([x, z, r]) => (
        <Part key={x} geo={SLIPPER} m={B.plush} p={[x, 0.066, z]} rotation-y={r} />
      ))}
      <Batch geo={rbox(1, 1, 1, 0.1)} m={B.trim} items={BOOKS} shadow />
    </>
  )
}
