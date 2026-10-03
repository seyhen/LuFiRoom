import { Part, cyl } from '../parts'
import { K } from './materials'

// Bûches : [x, y, z, rotation autour de y].
const LOGS = [[-0.08, 0.3, -0.06, 0.2], [0.08, 0.3, 0.04, -0.15], [0, 0.4, -0.01, 0.5], [-0.1, 0.4, 0.08, -0.6], [0.09, 0.41, -0.09, 0.9]] as const

/** Panier d'osier plein de bûches, au pied de la cheminée. */
export function LogBasket() {
  return (
    <group position={[-2.12, 0, 1.25]}>
      <Part geo={cyl(0.24, 0.2, 0.34, 18)} m={K.oak} p={[0, 0.17, 0]} />
      <Part m={K.walnut} p={[0, 0.34, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.24, 0.02, 6, 24]} />
      </Part>
      {[0, 1, 2].map((i) => (
        <Part key={i} m={K.walnut} p={[0, 0.08 + i * 0.09, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.215 + i * 0.012, 0.008, 4, 24]} />
        </Part>
      ))}
      {LOGS.map(([x, y, z, a], i) => (
        <group key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, a]}>
          <Part geo={cyl(0.05, 0.05, 0.42, 10)} m={K.walnut} />
          <Part geo={cyl(0.042, 0.042, 0.425, 10)} m={K.scone} castShadow={false} />
        </group>
      ))}
    </group>
  )
}
