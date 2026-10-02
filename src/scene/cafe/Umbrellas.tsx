import { M } from '../materials'
import { Part, cyl } from '../parts'
import { K } from './materials'

// Trois parapluies fermés : [x, y, inclinaison, matériau].
const UMBRELLAS = [[-0.07, 0, 0.22, K.tartan], [0.05, 0, -0.1, K.navy], [0.14, 0, -0.3, K.burgundy]] as const

/** Porte-parapluies près de l'entrée : il pleut, on est à Édimbourg. */
export function Umbrellas() {
  return (
    <group position={[2.75, 0, 0.55]}>
      <Part geo={cyl(0.2, 0.17, 0.55, 22)} m={K.green} p={[0, 0.275, 0]} />
      <Part geo={cyl(0.205, 0.205, 0.035, 22)} m={K.brass} p={[0, 0.54, 0]} />
      {UMBRELLAS.map(([x, , tilt, m], i) => (
        <group key={i} position={[x, 0.3, 0]} rotation-z={tilt} rotation-x={i === 1 ? 0.1 : -0.06}>
          <Part geo={cyl(0.011, 0.011, 1.0, 8)} m={M.plum} p={[0, 0.5, 0]} />
          <Part m={m} p={[0, 0.82, 0]} rotation-x={Math.PI}>
            <coneGeometry args={[0.06, 0.5, 14]} />
          </Part>
          <Part m={M.plum} p={[0.045, 1.0, 0]}>
            <torusGeometry args={[0.045, 0.011, 8, 14, Math.PI]} />
          </Part>
        </group>
      ))}
    </group>
  )
}
