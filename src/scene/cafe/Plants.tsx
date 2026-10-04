import { TAU } from '../../math'
import { Part, cyl } from '../parts'
import { Leaf } from '../nature/Leaf'
import { K } from './materials'

// Grandes feuilles de figuier lyre : [hauteur, angle autour du tronc, inclinaison].
const LEAVES = Array.from({ length: 13 }, (_, i) => [0.75 + i * 0.1, i * 2.4, 0.5 + (i % 3) * 0.2] as const)

/** Un grand figuier lyre aux larges feuilles vernies dans un cache-pot de laiton, dans le coin près de la fenêtre. */
export function FigTree() {
  return (
    <group position={[2.82, 0, -2.78]}>
      <Part geo={cyl(0.26, 0.21, 0.5, 24)} m={K.brass} p={[0, 0.25, 0]} />
      <Part geo={cyl(0.24, 0.24, 0.03, 20)} m={K.walnut} p={[0, 0.49, 0]} castShadow={false} />
      <Part geo={cyl(0.025, 0.035, 1.3, 8)} m={K.walnut} p={[0, 1.1, 0]} />
      {LEAVES.map(([y, a, tilt], i) => (
        <group key={i} position={[0, y, 0]} rotation={[0, a % TAU, 0]}>
          <Part geo={cyl(0.008, 0.01, 0.06, 5)} m={K.walnut} p={[0, 0.01, 0.025]} rotation-x={1.2} castShadow={false} />
          <Leaf kind="round" p={[0, 0.02, 0.05]} r={[-tilt * 0.8, 0, (i % 2 ? 1 : -1) * 0.15]} w={0.11 - (i > 9 ? 0.02 : 0)} l={0.3 - (i > 9 ? 0.06 : 0)} m={i % 3 ? K.fig : K.leafVDark} shadow={i % 2 === 0} />
        </group>
      ))}
    </group>
  )
}
