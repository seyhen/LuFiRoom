import { M } from '../materials'
import { Batch, Part, SPH, cyl, rbox, type Item } from '../parts'
import { B } from './materials'

// Trois livres empilés, de travers : couverture rose, menthe, beurre ; les pages dépassent un peu sur la tranche.
const book = (y: number, w: number, d: number, r: number, c: number): Item[] => [
  { p: [-2.3, y, -2.33], s: [w, 0.08, d], r: [0, r, 0], c },
  { p: [-2.3, y, -2.33], s: [w - 0.03, 0.06, d + 0.012], r: [0, r, 0], c: 0xfff5e6 },
]
const BOOKS: Item[] = [...book(0.77, 0.42, 0.3, 0.2, 0xf3afc6), ...book(0.85, 0.38, 0.27, -0.12, 0x8fd8c6), ...book(0.93, 0.33, 0.24, 0.3, 0xf6d071)]

/** Table de chevet rose : deux tiroirs à boutons, une pile de livres et un petit cactus. La lampe est posée dessus (voir BedroomScene). */
export function Nightstand() {
  return (
    <>
      {[[-2.9, -2.9], [-2.1, -2.9], [-2.9, -2.14], [-2.1, -2.14]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.05, 0.04, 0.12, 12)} m={M.woodLeg} p={[x, 0.06, z]} />
      ))}
      <Part geo={rbox(0.95, 0.6, 0.9, 0.1)} m={B.blush} p={[-2.5, 0.4, -2.52]} />
      <Part geo={rbox(1.0, 0.06, 0.95, 0.04)} m={M.cream} p={[-2.5, 0.73, -2.52]} />
      {[0.55, 0.26].map((y) => (
        <group key={y}>
          <Part geo={rbox(0.04, 0.24, 0.72, 0.03)} m={B.blushDeep} p={[-2.025, y - 0.05, -2.52]} />
          <Part geo={SPH} m={M.butter} scale={0.04} p={[-2.0, y - 0.05, -2.52]} />
        </group>
      ))}
      <Batch geo={rbox(1, 1, 1, 0.1)} m={B.trim} items={BOOKS} shadow />
      {/* cactus sur les livres */}
      <Part geo={cyl(0.075, 0.06, 0.1, 14)} m={M.terracotta} p={[-2.31, 1.02, -2.33]} />
      <Part geo={SPH} m={M.leaf} scale={[0.06, 0.1, 0.06]} p={[-2.31, 1.14, -2.33]} />
      <Part geo={SPH} m={M.leaf} scale={[0.03, 0.05, 0.03]} p={[-2.25, 1.13, -2.33]} />
    </>
  )
}
