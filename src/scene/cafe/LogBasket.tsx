import { Part, cyl } from '../parts'
import { K } from './materials'

// Bûches : [x, y, z, rotation autour de y].
const LOGS = [[-0.08, 0.3, -0.07, 0.2], [0.08, 0.3, 0.05, -0.15], [0, 0.39, -0.01, 0.5], [-0.09, 0.4, 0.08, -0.6], [0.08, 0.41, -0.09, 0.9]] as const

/** Panier d'osier plein de bûches, au pied de la cheminée. */
export function LogBasket() {
  return (
    <group position={[-2.12, 0, 1.25]}>
      <Part geo={cyl(0.24, 0.2, 0.34, 18)} m={K.oak} p={[0, 0.17, 0]} />
      <Part m={K.walnut} p={[0, 0.34, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.24, 0.02, 6, 24]} />
      </Part>
      {/* deux anses de cuir */}
      {[-1, 1].map((sd) => (
        <Part key={sd} m={K.walnut} p={[sd * 0.25, 0.3, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.06, 0.012, 6, 12, Math.PI]} />
        </Part>
      ))}
      {[0, 1, 2].map((i) => (
        <Part key={i} m={K.walnut} p={[0, 0.08 + i * 0.09, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.215 + i * 0.012, 0.008, 4, 24]} />
        </Part>
      ))}
      {LOGS.map(([x, y, z, a], i) => (
        <group key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, a]}>
          {/* l'écorce, bosselée, et les deux bouts sciés : bois clair, cernes, cœur plus foncé */}
          <Part geo={cyl(0.05, 0.047, 0.34, 9)} m={K.walnut} />
          {[-1, 1].map((sd) => (
            <group key={sd} position={[0, sd * 0.171, 0]}>
              <Part geo={cyl(0.042, 0.042, 0.004, 14)} m={K.scone} castShadow={false} />
              <Part geo={cyl(0.026, 0.026, 0.006, 12)} m={K.oak} castShadow={false} />
              <Part geo={cyl(0.008, 0.008, 0.008, 8)} m={K.walnut} castShadow={false} />
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}
