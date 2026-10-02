import { M } from '../materials'
import { Batch, Part, SPH, rbox, type Item } from '../parts'
import { B } from './materials'

// Une paire de chaussons roses duveteux sur le tapis, et une pile de livres au pied du lit.
const SOLE = [[-1.55, 0.95, 0.3], [-1.3, 0.9, 0.18]]
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
        <group key={x} position={[x, 0.07, z]} rotation-y={r}>
          <Part geo={SPH} m={B.blushDeep} scale={[0.2, 0.05, 0.11]} p={[0, 0.03, 0]} />
          <Part geo={SPH} m={B.blush} scale={[0.1, 0.07, 0.1]} p={[0.1, 0.09, 0]} />
          <Part geo={SPH} m={M.pillow} scale={[0.06, 0.04, 0.095]} p={[-0.1, 0.08, 0]} />
        </group>
      ))}
      <Batch geo={rbox(1, 1, 1, 0.1)} m={B.trim} items={BOOKS} shadow />
    </>
  )
}
