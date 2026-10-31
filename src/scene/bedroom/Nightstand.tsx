import { M } from '../materials'
import { Batch, Part, SPH, cyl, rbox, type Item } from '../parts'
import { B } from './materials'

// Deux livres empilés, de travers, dans le coin de devant, hors de l'ombre du chapeau de la lampe (rayon 0,335 autour de
// x = -2,68, z = -2,72) : couverture rose et menthe ; les pages dépassent un peu sur la tranche.
const book = (y: number, w: number, d: number, r: number, c: number): Item[] => [
  { p: [-2.25, y, -2.25], s: [w, 0.08, d], r: [0, r, 0], c },
  { p: [-2.25, y, -2.25], s: [w - 0.03, 0.06, d + 0.012], r: [0, r, 0], c: 0xfff5e6 },
]
const BOOKS: Item[] = [...book(0.8, 0.34, 0.25, 0.2, 0xf3afc6), ...book(0.88, 0.3, 0.22, -0.15, 0x8fd8c6)]

/** Table de chevet rose : deux tiroirs à boutons et deux livres. La lampe est posée dessus (voir BedroomScene). */
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
    </>
  )
}
