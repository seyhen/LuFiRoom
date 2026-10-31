import { Part, cyl } from '../parts'
import { Vessel } from '../igloo/Vessel'
import { K } from './materials'

// Le panier est ouvert (Vessel) : les bûches y sont couchées en trois lits, assez courtes (28 cm) et assez près du milieu pour
// que leurs bouts restent dans le panier (rayon intérieur 0,21 à 0,23) ; celle du dessus dépasse du bord. [x, y, z, rotation y].
const LOGS = [[-0.085, 0.2, 0, 0.1], [0, 0.2, 0, 0.05], [0.085, 0.2, 0, -0.05], [-0.05, 0.29, 0, 0.55], [0.05, 0.29, 0, 0.45], [0, 0.38, 0.01, -0.85]] as const

/** Panier d'osier ouvert, rempli de bûches, au pied de la cheminée. */
export function LogBasket() {
  return (
    <group position={[-2.12, 0, 1.25]}>
      <Vessel p={[0, 0, 0]} rt={0.24} rb={0.2} h={0.34} m={K.oak} inner={K.wickerInner} rim={K.walnut} t={0.012} />
      <Part m={K.walnut} p={[0, 0.34, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.236, 0.02, 6, 28]} />
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
          <Part geo={cyl(0.045, 0.043, 0.28, 9)} m={K.walnut} />
          {[-1, 1].map((sd) => (
            <group key={sd} position={[0, sd * 0.141, 0]}>
              <Part geo={cyl(0.038, 0.038, 0.004, 14)} m={K.scone} castShadow={false} />
              <Part geo={cyl(0.026, 0.026, 0.006, 12)} m={K.oak} castShadow={false} />
              <Part geo={cyl(0.008, 0.008, 0.008, 8)} m={K.walnut} castShadow={false} />
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}
