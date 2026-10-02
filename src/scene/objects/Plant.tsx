import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl } from '../parts'

const LEAVES = Array.from({ length: 8 }, (_, i) => i)

/** Plante en pot, dans le coin. */
export function Plant() {
  return (
    <group position={[-2.5, 0, 2.45]}>
      <Part geo={cyl(0.3, 0.23, 0.5, 26)} m={M.terracotta} p={[0, 0.25, 0]} />
      <Part geo={cyl(0.27, 0.27, 0.03, 22)} m={M.toffee} p={[0, 0.49, 0]} />
      {LEAVES.map((i) => (
        <group key={i} position={[0, 0.48, 0]} rotation={[-0.45 - (i % 3) * 0.22, (i / 8) * TAU + (i % 2) * 0.3, 0]}>
          <Part geo={SPH} m={i % 2 ? M.leaf : M.leaf2} scale={[0.12, 0.035, 0.38]} p={[0, 0, 0.32]} />
        </group>
      ))}
    </group>
  )
}
