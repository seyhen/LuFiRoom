import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { S } from './materials'

/** Le télégraphe de machines : son pied au sol, devant la droite de la pièce. */
export const TELEGRAPH = { x: 2.5, z: 1.8, head: 1.38 }
const FULL = -1.5 // « AVANT TOUTE » : trois crans de 0,5 rad vers la droite du cadran

/**
 * Le télégraphe de machines : un fût de laiton sur un socle de fonte, un grand cadran émaillé (STOP en haut, AVANT à droite,
 * ARRIÈRE à gauche) et sa poignée. Quand on lance la machine, la poignée plonge sur AVANT TOUTE et l'aiguille de réponse la suit,
 * un peu en retard, en tremblant comme le reste du bateau.
 */
export function Telegraph() {
  const g = useRef<Group>(null!), order = useRef<Group>(null!), answer = useRef<Group>(null!), head = useRef<Group>(null!)
  const o = useRef({ a: 0, v: 0 }), r = useRef(0)
  useSquash('telegraph', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime, on = isActive(useStore.getState(), 'telegraph')
    // la poignée est un ressort amorti (elle dépasse un peu son cran), la réponse un fil qui suit
    const s = o.current
    s.v += ((on ? FULL : 0) - s.a) * 70 * dt - s.v * 9 * dt
    s.a += s.v * dt
    r.current += (s.a - r.current) * Math.min(1, dt * 2.2)
    order.current.rotation.z = s.a
    answer.current.rotation.z = r.current
    head.current.position.x = reduceMotion ? 0 : on ? Math.sin(t * 43) * 0.0035 : 0
  })
  return (
    <group ref={g} userData={{ id: 'telegraph' }} position={[TELEGRAPH.x, 0, TELEGRAPH.z]} rotation-y={0.8}>
      <Part geo={cyl(0.3, 0.34, 0.1, 28)} m={S.hullDark} p={[0, 0.05, 0]} />
      <Part geo={cyl(0.22, 0.28, 0.14, 28)} m={S.brass} p={[0, 0.17, 0]} />
      <Part geo={cyl(0.075, 0.095, 1.0, 20)} m={S.brass} p={[0, 0.7, 0]} />
      {[0.45, 0.95].map((y) => (
        <Part key={y} geo={cyl(0.1, 0.1, 0.05, 20)} m={S.brassDull} p={[0, y, 0]} castShadow={false} />
      ))}
      <group ref={head} position={[0, TELEGRAPH.head, 0]}>
        {/* le boîtier du cadran : une lentille de laiton, la face émaillée et la vitre */}
        <Part geo={cyl(0.41, 0.41, 0.2, 40)} m={S.brass} rotation-x={Math.PI / 2} />
        <Part m={S.brassDull} p={[0, 0, 0.1]}>
          <torusGeometry args={[0.39, 0.03, 10, 44]} />
        </Part>
        <mesh material={S.telegraph} position={[0, 0, 0.101]}>
          <circleGeometry args={[0.37, 48]} />
        </mesh>
        <Part geo={cyl(0.37, 0.37, 0.008, 40)} m={S.glass} p={[0, 0, 0.16]} rotation-x={Math.PI / 2} castShadow={false} />
        {/* l'aiguille de réponse (laiton, fine) sous la poignée d'ordre (rouge, large) */}
        <group ref={answer} position={[0, 0, 0.115]}>
          <Part geo={rbox(0.026, 0.3, 0.01, 0.006)} m={S.brass} p={[0, 0.15, 0]} castShadow={false} />
          <Part geo={SPH} m={S.brass} scale={[0.026, 0.04, 0.012]} p={[0, 0.32, 0]} castShadow={false} />
        </group>
        <group ref={order} position={[0, 0, 0.135]}>
          <Part geo={rbox(0.05, 0.3, 0.014, 0.01)} m={S.red} p={[0, 0.15, 0]} castShadow={false} />
          <Part geo={SPH} m={S.red} scale={[0.045, 0.06, 0.02]} p={[0, 0.33, 0]} castShadow={false} />
        </group>
        <Part geo={SPH} m={S.brass} scale={0.04} p={[0, 0, 0.15]} castShadow={false} />
        {/* le petit timbre sur le dessus */}
        <Part geo={cyl(0.012, 0.012, 0.1, 6)} m={S.brassDull} p={[0, 0.45, 0]} castShadow={false} />
        <Part geo={SPH} m={S.brass} scale={[0.08, 0.04, 0.08]} p={[0, 0.51, 0]} />
      </group>
    </group>
  )
}
