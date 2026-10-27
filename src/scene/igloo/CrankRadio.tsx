import { useRef } from 'react'
import type { Group } from 'three'
import { reduceMotion } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { useBeat } from '../objects/useBeat'
import { I } from './materials'

// Les quatre coins de caoutchouc du boîtier : [x, y].
const CORNERS: [number, number][] = [[-0.21, 0.04], [0.21, 0.04], [-0.21, 0.25], [0.21, 0.25]]

/**
 * La radio de secours de l'expédition, posée au bout de la banquette. C'est l'objet « radio » de l'igloo. Un boîtier orange aux coins
 * de caoutchouc, sa façade grise : le haut-parleur rond à grille, le cadran gradué (FM, AM) et son aiguille, deux boutons crantés, un
 * voyant ; sur le dessus, le petit panneau solaire et la poignée de transport ; l'antenne télescopique déployée ; sur le flanc, la
 * manivelle (bras, moyeu, poignée qui tourne). Quand la musique joue : la manivelle tourne, le cadran s'allume, le voyant brille sur
 * le temps, la radio rebondit et des notes s'envolent.
 */
export function CrankRadio({ position, ry = 0 }: { position: V3; ry?: number }) {
  const crank = useRef<Group>(null!), turn = useRef(0)
  const { g, notes } = useBeat(position, 0.6, (on, _t, pulse) => {
    if (on && !reduceMotion) turn.current += 0.035
    crank.current.rotation.x = turn.current
    I.dialFace.emissiveIntensity = on ? 0.55 + pulse * 0.3 : 0.1
    I.led.emissiveIntensity = on ? 0.4 + pulse * 1.2 : 0
    // sous la voûte : les notes partent vers le centre du dôme et montent moins haut (sinon elles sortent par le toit)
  }, 0.04, { vy: 0.3, life: 2.4, dx: 0.47, dz: 0.17 })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <group scale={1.25}>
          <Static>
            {/* le boîtier, ses coins de caoutchouc, ses patins */}
            <Part geo={rbox(0.44, 0.27, 0.17, 0.05)} m={I.orange} p={[0, 0.145, 0]} />
            {CORNERS.map(([x, y]) => (
              <Part key={`${x}${y}`} geo={SPH} m={I.rubber} scale={[0.035, 0.035, 0.095]} p={[x, y, 0]} castShadow={false} />
            ))}
            {[-0.16, 0.16].map((x) => (
              <Part key={x} geo={rbox(0.08, 0.02, 0.14, 0.008)} m={I.rubber} p={[x, 0.008, 0]} castShadow={false} />
            ))}
            {/* la façade grise, en léger relief */}
            <Part geo={rbox(0.38, 0.21, 0.02, 0.02)} m={I.darkSteel} p={[0, 0.145, 0.083]} castShadow={false} />
            {/* le haut-parleur : la grille, sa bague */}
            <Part geo={cyl(0.075, 0.075, 0.01, 28)} m={I.grille} p={[-0.09, 0.14, 0.096]} rotation-x={Math.PI / 2} castShadow={false} />
            <Part m={I.steel} p={[-0.09, 0.14, 0.098]} castShadow={false}>
              <torusGeometry args={[0.078, 0.008, 8, 28]} />
            </Part>
            {/* les deux boutons crantés et leur repère */}
            {[0.055, 0.135].map((x) => (
              <group key={x} position={[x, 0.085, 0.1]}>
                <Part geo={cyl(0.022, 0.024, 0.025, 12)} m={I.rubber} rotation-x={Math.PI / 2} castShadow={false} />
                <Part geo={rbox(0.004, 0.016, 0.004, 0.001)} m={I.paper} p={[0, 0.01, 0.014]} castShadow={false} />
              </group>
            ))}
            {/* le dessus : la poignée de transport sur ses deux pattes, le panneau solaire et ses cellules */}
            {[-0.13, 0.13].map((x) => (
              <Part key={x} geo={rbox(0.03, 0.04, 0.05, 0.01)} m={I.rubber} p={[x, 0.29, -0.03]} castShadow={false} />
            ))}
            <Part m={I.rubber} p={[0, 0.3, -0.03]} castShadow={false}>
              <torusGeometry args={[0.13, 0.014, 8, 24, Math.PI]} />
            </Part>
            <Part geo={rbox(0.24, 0.008, 0.09, 0.004)} m={I.solar} p={[0, 0.284, 0.03]} castShadow={false} />
            {[-0.06, 0, 0.06].map((x) => (
              <Part key={x} geo={rbox(0.003, 0.009, 0.088, 0.001)} m={I.steel} p={[x, 0.285, 0.03]} castShadow={false} />
            ))}
            {/* l'antenne télescopique, déployée et penchée en arrière, sa petite boule au bout */}
            <group position={[-0.17, 0.28, -0.05]} rotation={[-0.35, 0, 0.3]}>
              <Part geo={cyl(0.012, 0.012, 0.04, 8)} m={I.rubber} p={[0, 0.01, 0]} castShadow={false} />
              <Part geo={cyl(0.009, 0.009, 0.3, 8)} m={I.steel} p={[0, 0.17, 0]} castShadow={false} />
              <Part geo={cyl(0.006, 0.006, 0.3, 8)} m={I.steel} p={[0, 0.45, 0]} castShadow={false} />
              <Part geo={SPH} m={I.steel} scale={0.016} p={[0, 0.605, 0]} castShadow={false} />
            </group>
            {/* le moyeu de la manivelle, sur le flanc droit */}
            <Part geo={cyl(0.045, 0.045, 0.03, 16)} m={I.rubber} p={[0.235, 0.15, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          </Static>
          {/* le cadran (il s'allume) et le voyant */}
          <mesh material={I.dialFace} position={[0.095, 0.195, 0.0945]} raycast={noRay}>
            <planeGeometry args={[0.15, 0.056]} />
          </mesh>
          <Part geo={SPH} m={I.led} scale={0.009} p={[0.165, 0.135, 0.095]} castShadow={false} />
          {/* la manivelle : son bras et sa poignée, qui tournent */}
          <group ref={crank} position={[0.255, 0.15, 0]}>
            <Part geo={rbox(0.018, 0.13, 0.03, 0.008)} m={I.darkSteel} p={[0, 0.05, 0]} castShadow={false} />
            <Part geo={cyl(0.017, 0.017, 0.075, 10)} m={I.orange} p={[0.04, 0.105, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={SPH} m={I.rubber} scale={0.019} p={[0.08, 0.105, 0]} castShadow={false} />
          </group>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
