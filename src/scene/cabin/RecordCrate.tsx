import { Batch, Part, rbox, type Item } from '../parts'
import { C } from './materials'

// Les disques debout dans la caisse, rangés côté mur, un peu penchés : pochettes canneberge, crème, sapin, or, ciel, rose.
const COVERS = [0xd25c72, 0xfff1dc, 0x2f7d6d, 0xf4c75a, 0x7fb4d6, 0xf3afc6, 0xb9794f]
const SLEEVES: Item[] = COVERS.map((c, i) => ({ p: [2.9, 0.33, -2.88 + i * 0.075], s: [0.3, 0.3, 0.014], r: [i % 3 === 0 ? 0.1 : -0.07, 0, 0], c }))

/** Une petite caisse de disques à côté du coffre, pour choisir le prochain. */
export function RecordCrate() {
  return (
    <>
      <Part geo={rbox(0.5, 0.05, 0.68, 0.02)} m={C.beam} p={[2.9, 0.04, -2.62]} />
      {[[-0.34, 0.68, 0.025], [0.34, 0.68, 0.025]].map(([dz, d]) => (
        <Part key={dz} geo={rbox(0.5, 0.3, d, 0.015)} m={C.log} p={[2.9, 0.19, -2.62 + dz]} />
      ))}
      {[-0.245, 0.245].map((dx) => (
        <Part key={dx} geo={rbox(0.025, 0.3, 0.68, 0.015)} m={C.log} p={[2.9 + dx, 0.19, -2.62]} />
      ))}
      <Batch geo={rbox(1, 1, 1, 0.2)} m={C.paper} items={SLEEVES} shadow />
    </>
  )
}
