import { Part, SPH, cyl, noRay, rbox } from '../../parts'
import { R } from './materials'
import { RAILS } from '../TrainShell'

/** Le toit bombé : un cylindre couché le long de la voiture, aplati (son dessous est dans la caisse). */
const ROOF = cyl(1, 1, 1, 32)

/** La voiture suivante, accrochée derrière le compartiment (vers -x) : son centre en x, sa longueur. */
const CAR = { x: -7.25, len: 6.86 }
const BOGIES = [-2.1, 2.1]

/**
 * La voiture-lits suivante, derrière le mur de gauche : même livrée bleu nuit et même filet doré que la nôtre, un flanc à cinq
 * fenêtres aux rideaux à demi tirés (elles s'allument le soir), un toit gris bombé avec ses aérateurs, les bogies sur la voie et le
 * soufflet d'intercirculation qui la relie au compartiment.
 */
export function NextCar() {
  const { x, len } = CAR
  return (
    <group>
      {/* la caisse */}
      <Part geo={rbox(len, 4.6, 6.86, 0.24)} m={R.livery} p={[x, 1.58, -0.07]} />
      <mesh position={[x, 1.86, 3.37]} material={R.carSide} receiveShadow raycast={noRay}>
        <planeGeometry args={[len - 0.3, (len - 0.3) / 2]} />
      </mesh>
      <Part geo={rbox(len + 0.04, 0.05, 6.9, 0.02)} m={R.carGold} p={[x, -0.3, -0.07]} castShadow={false} />
      {/* le toit bombé, et ses aérateurs */}
      <Part geo={ROOF} m={R.roof} p={[x, 3.86, -0.07]} rotation-z={Math.PI / 2} scale={[0.5, len - 0.04, 3.4]} />
      {[-2.2, -0.7, 0.8, 2.3].map((dx) => (
        <group key={dx} position={[x + dx, 4.3, -0.07]}>
          <Part geo={cyl(0.16, 0.2, 0.2, 14)} m={R.roof} />
          <Part geo={SPH} m={R.carIron} p={[0, 0.12, 0]} scale={[0.17, 0.06, 0.17]} castShadow={false} />
        </group>
      ))}
      {/* le soufflet qui la relie au compartiment */}
      {Array.from({ length: 5 }, (_, i) => (
        <Part key={i} geo={rbox(0.07, 3.3, 2.5, 0.03)} m={R.bellows} p={[x + len / 2 + 0.03 + i * 0.07, 1.75, -0.4]} castShadow={false} />
      ))}
      {/* les bogies sur les deux rails */}
      {BOGIES.flatMap((bx) => RAILS.map((rz) => (
        <group key={`${bx}${rz}`} position={[x + bx, -0.8, rz - 0.32]}>
          <Part geo={rbox(1.5, 0.2, 0.3, 0.06)} m={R.carIron} p={[0, 0, 0.12]} castShadow={false} />
          {[-0.5, 0.5].map((dx) => (
            <group key={dx} position={[dx, -0.06, 0.32]} rotation-x={Math.PI / 2}>
              <Part geo={cyl(0.26, 0.26, 0.08, 28)} m={R.carIron} castShadow={false} />
              <Part geo={cyl(0.12, 0.12, 0.1, 20)} m={R.carGold} castShadow={false} />
            </group>
          ))}
        </group>
      )))}
      {/* le marchepied doré sous la porte */}
      <Part geo={rbox(0.8, 0.06, 0.3, 0.02)} m={R.carGold} p={[x + 2.7, -0.55, 3.5]} castShadow={false} />
    </group>
  )
}
