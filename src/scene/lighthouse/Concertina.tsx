import { useRef } from 'react'
import type { Group } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { L } from './materials'

const HALF = 0.27 // demi-longueur du soufflet au repos
const FOLDS = 10

/**
 * Un concertina de marin posé sur le coffre : deux plateaux hexagonaux d'ébène à boutons de laiton, un soufflet rouge aux plis
 * crème qui respire. Joué, il s'ouvre et se referme ; il pulse à chaque kick et lâche des notes. C'est l'objet « radio » du phare.
 */
export function Concertina({ position }: { position: V3 }) {
  const bellows = useRef<Group>(null!), right = useRef<Group>(null!), left = useRef<Group>(null!)
  const { g, notes } = useBeat(position, 0.7, (on, t, pulse) => {
    const s = 1 + (on && !reduceMotion ? Math.sin(t * 1.7) * 0.2 + pulse * 0.1 : 0)
    bellows.current.scale.x = s
    right.current.position.x = HALF * s
    left.current.position.x = -HALF * s
  })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={0.45}>
        <group position={[0, 0.17, 0]} scale={0.85}>
          {/* le soufflet : une pile de plis hexagonaux, larges puis serrés */}
          <group ref={bellows}>
            {Array.from({ length: FOLDS }, (_, i) => (
              <Part key={i} geo={cyl(i % 2 ? 0.185 : 0.158, i % 2 ? 0.185 : 0.158, (HALF * 2) / FOLDS + 0.004, 6)} m={i % 2 ? L.cream : L.red} p={[-HALF + ((i + 0.5) * HALF * 2) / FOLDS, 0, 0]} rotation-z={Math.PI / 2} />
            ))}
          </group>
          {([[left, -1], [right, 1]] as const).map(([ref, s]) => (
            <group key={s} ref={ref} position={[s * HALF, 0, 0]}>
              <Part geo={cyl(0.2, 0.2, 0.05, 6)} m={L.navyDark} p={[s * 0.025, 0, 0]} rotation-z={Math.PI / 2} />
              <Part geo={cyl(0.205, 0.205, 0.012, 6)} m={L.brass} p={[s * 0.052, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
              {/* les boutons de laiton, deux rangées de quatre, et la sangle de cuir */}
              {[-0.09, 0.09].flatMap((y) => [-0.105, -0.035, 0.035, 0.105].map((z) => <Part key={`${y}${z}`} geo={SPH} m={L.brass} scale={0.016} p={[s * 0.07, y, z]} castShadow={false} />))}
              <Part geo={rbox(0.04, 0.04, 0.34, 0.012)} m={L.leatherDark} p={[s * 0.06, -0.19, 0]} castShadow={false} />
            </group>
          ))}
        </group>
        <Part geo={cyl(0.012, 0.012, 0.1, 6)} m={L.brass} p={[0, 0.34, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      <group ref={notes.group} />
    </>
  )
}
