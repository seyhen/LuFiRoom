import { ExtrudeGeometry, Path, Shape } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Batch, Part, cyl, orient, type Item, type V3 } from '../parts'
import { B } from './materials'

// Une feuille de monstera : un cœur long, percé de trous (pointe vers +y, face vers +z).
const leaf = (() => {
  const s = new Shape()
  s.moveTo(0, 0.02)
  s.bezierCurveTo(-0.06, 0, -0.3, 0.02, -0.3, 0.26)
  s.bezierCurveTo(-0.3, 0.46, -0.12, 0.58, 0, 0.66)
  s.bezierCurveTo(0.12, 0.58, 0.3, 0.46, 0.3, 0.26)
  s.bezierCurveTo(0.3, 0.02, 0.06, 0, 0, 0.02)
  for (const [x, y, rx, ry, a] of [[-0.15, 0.25, 0.05, 0.022, 0.5], [0.15, 0.25, 0.05, 0.022, -0.5], [-0.14, 0.42, 0.045, 0.02, 0.7], [0.14, 0.42, 0.045, 0.02, -0.7], [-0.05, 0.52, 0.025, 0.014, 0.9], [0.05, 0.52, 0.025, 0.014, -0.9]]) {
    const h = new Path()
    h.absellipse(x, y, rx, ry, 0, TAU, false, a)
    s.holes.push(h)
  }
  return new ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 12 })
})()

const BASE: V3 = [0, 0.5, 0]
const GREENS = [0x3f9f78, 0x2f8a68, 0x58b58c, 0x3f9f78, 0x4aa885, 0x2f8a68, 0x58b58c]
const stems: Item[] = [], leaves: Item[] = []
GREENS.forEach((c, k) => {
  const phi = (k / GREENS.length) * TAU + 0.3, th = 0.28 + 0.2 * (k % 3), len = 0.46 + 0.14 * (k % 4)
  const d: V3 = [Math.sin(th) * Math.cos(phi), Math.cos(th), Math.sin(th) * Math.sin(phi)]
  const e: V3 = [BASE[0] + d[0] * len, BASE[1] + d[1] * len, BASE[2] + d[2] * len]
  stems.push({ p: [(BASE[0] + e[0]) / 2, (BASE[1] + e[1]) / 2, (BASE[2] + e[2]) / 2], s: [0.02, len, 0.02], r: orient(d), c: 0x58a07a })
  const t2 = th + 0.55 + 0.1 * (k % 2)
  const ld: V3 = [Math.sin(t2) * Math.cos(phi), Math.cos(t2), Math.sin(t2) * Math.sin(phi)]
  leaves.push({ p: e, s: 0.95 + 0.25 * ((k * 7) % 3) * 0.5, r: orient(ld), c })
})

/** Monstera dans un pot crème à liseré rose, dans le coin. */
export function Monstera({ position = [-2.5, 0, 2.45] }: { position?: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.3, 0.23, 0.46, 28)} m={M.cream} p={[0, 0.23, 0]} />
      <Part m={B.blush} p={[0, 0.455, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.3, 0.025, 8, 28]} />
      </Part>
      <Part geo={cyl(0.27, 0.27, 0.03, 24)} m={B.soil} p={[0, 0.48, 0]} />
      <Batch geo={cyl(1, 1, 1, 6)} m={B.trim} items={stems} />
      <Batch geo={leaf} m={B.trim} items={leaves} shadow />
    </group>
  )
}
