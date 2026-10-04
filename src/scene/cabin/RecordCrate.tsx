import { Batch, Part, rbox, type Item } from '../parts'
import { C } from './materials'

// Contre le mur du fond, à droite du coffre. Les deux parois côté caméra (+x et +z) sont basses : on voit les pochettes se tenir
// debout dans la caisse, au lieu de les voir sortir d'un bloc plein.
const X = 2.9, Z = -2.62
const FRONT = 0.15, BACK = 0.3

// Pochettes debout, rangées contre la paroi du fond, un peu penchées : canneberge, crème, sapin, or, ciel, rose, bois.
const COVERS = [0xd25c72, 0xfff1dc, 0x2f7d6d, 0xf4c75a, 0x7fb4d6, 0xf3afc6, 0xb9794f, 0xd25c72]
const SLEEVES: Item[] = COVERS.map((c, i) => ({ p: [X - 0.02, 0.27, Z - 0.28 + i * 0.075], s: [0.3, 0.34, 0.014], r: [i % 3 === 0 ? 0.1 : -0.07, 0, 0], c }))

/** Une petite caisse de disques à côté du coffre, pour choisir le prochain. */
export function RecordCrate() {
  return (
    <>
      <Part geo={rbox(0.5, 0.05, 0.68, 0.02)} m={C.beam} p={[X, 0.04, Z]} />
      {/* parois du fond (hautes) et de devant (basses) */}
      <Part geo={rbox(0.5, BACK, 0.025, 0.012)} m={C.log} p={[X, 0.065 + BACK / 2, Z - 0.34]} />
      <Part geo={rbox(0.5, FRONT, 0.025, 0.012)} m={C.log} p={[X, 0.065 + FRONT / 2, Z + 0.34]} />
      <Part geo={rbox(0.025, BACK, 0.68, 0.012)} m={C.log} p={[X - 0.245, 0.065 + BACK / 2, Z]} />
      <Part geo={rbox(0.025, FRONT, 0.68, 0.012)} m={C.log} p={[X + 0.245, 0.065 + FRONT / 2, Z]} />
      <Batch geo={rbox(1, 1, 1, 0.2)} m={C.paper} items={SLEEVES} shadow />
    </>
  )
}
