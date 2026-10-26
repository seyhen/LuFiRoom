import { useRef } from 'react'
import type { Group } from 'three'
import { reduceMotion } from '../anim'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { useBeat } from '../objects/useBeat'
import { I } from './materials'

/**
 * La radio de secours de l'expédition, orange et caoutchoutée, posée au bout de la banquette. C'est l'objet « radio » de l'igloo :
 * l'antenne déployée, un haut-parleur rond, le cadran qui s'allume ; quand la musique joue, la manivelle tourne toute seule (on
 * l'a bien remontée), le cadran brille, la radio rebondit sur le rythme et des notes s'envolent.
 */
export function CrankRadio({ position, ry = 0 }: { position: V3; ry?: number }) {
  const crank = useRef<Group>(null!), turn = useRef(0)
  const { g, notes } = useBeat(position, 0.6, (on, _t, pulse) => {
    if (on && !reduceMotion) turn.current += 0.035
    crank.current.rotation.x = turn.current
    I.dial.emissiveIntensity = on ? 0.6 + pulse * 0.4 : 0.15
  })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <group scale={1.25}>
          {/* le corps caoutchouté, ses coins de caoutchouc plus sombre */}
          <Part geo={rbox(0.44, 0.27, 0.17, 0.05)} m={I.orange} p={[0, 0.145, 0]} />
          <Part geo={rbox(0.46, 0.05, 0.19, 0.025)} m={I.darkSteel} p={[0, 0.025, 0]} />
          {/* la façade : le haut-parleur rond à gauche, le cadran et deux boutons à droite */}
          <Part geo={cyl(0.085, 0.085, 0.02, 28)} m={I.grille} p={[-0.1, 0.15, 0.086]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part m={I.darkSteel} p={[-0.1, 0.15, 0.088]} castShadow={false}>
            <torusGeometry args={[0.088, 0.01, 8, 28]} />
          </Part>
          <Part geo={rbox(0.15, 0.06, 0.02, 0.01)} m={I.dial} p={[0.1, 0.2, 0.088]} castShadow={false} />
          <Part geo={rbox(0.004, 0.05, 0.022, 0.001)} m={I.rust} p={[0.08, 0.2, 0.089]} castShadow={false} />
          {[0.06, 0.14].map((x) => (
            <Part key={x} geo={cyl(0.022, 0.022, 0.025, 14)} m={I.darkSteel} p={[x, 0.1, 0.092]} rotation-x={Math.PI / 2} castShadow={false} />
          ))}
          {/* la poignée de transport */}
          <Part m={I.darkSteel} p={[0, 0.285, 0]} castShadow={false}>
            <torusGeometry args={[0.13, 0.016, 8, 24, Math.PI]} />
          </Part>
          {/* l'antenne télescopique, déployée et penchée en arrière, sa petite boule au bout */}
          <group position={[-0.17, 0.28, -0.05]} rotation={[-0.35, 0, 0.3]}>
            <Part geo={cyl(0.009, 0.009, 0.3, 8)} m={I.steel} p={[0, 0.15, 0]} castShadow={false} />
            <Part geo={cyl(0.006, 0.006, 0.3, 8)} m={I.steel} p={[0, 0.43, 0]} castShadow={false} />
            <Part geo={SPH} m={I.steel} scale={0.016} p={[0, 0.585, 0]} castShadow={false} />
          </group>
          {/* la manivelle, sur le flanc droit : son moyeu, son bras et sa poignée qui tournent */}
          <Part geo={cyl(0.04, 0.04, 0.03, 16)} m={I.darkSteel} p={[0.235, 0.15, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <group ref={crank} position={[0.255, 0.15, 0]}>
            <Part geo={rbox(0.018, 0.13, 0.03, 0.008)} m={I.darkSteel} p={[0, 0.05, 0]} castShadow={false} />
            <Part geo={cyl(0.016, 0.016, 0.07, 10)} m={I.orange} p={[0.04, 0.105, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          </group>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
