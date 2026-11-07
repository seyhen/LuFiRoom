import { useRef } from 'react'
import { LatheGeometry, Vector2, type Group } from 'three'
import { reduceMotion } from '../anim'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { useBeat } from '../objects/useBeat'
import { G } from './materials'

// Le pavillon : une corolle qui s'évase de 0,03 à 0,36 de rayon sur 0,62 de long, bord roulé.
const HORN = new LatheGeometry(
  [[0.03, 0], [0.04, 0.06], [0.06, 0.14], [0.09, 0.24], [0.14, 0.36], [0.21, 0.46], [0.29, 0.54], [0.36, 0.6], [0.37, 0.62], [0.35, 0.625]].map(([r, y]) => new Vector2(r, y)),
  28,
)

/**
 * Le phonographe à pavillon, objet « radio » de la serre : un coffret de bois verni sur ses quatre pieds, le plateau et son disque
 * (ils tournent quand la musique joue), le bras et son diaphragme, la manivelle de laiton, et le grand pavillon qui s'évase vers la
 * caméra. Sur le kick : le pavillon vibre un peu, des notes s'envolent. À côté, deux disques rangés dans leur pochette.
 */
export function Phonograph({ position, ry = 0 }: { position: V3; ry?: number }) {
  const disc = useRef<Group>(null!), crank = useRef<Group>(null!), horn = useRef<Group>(null!), spin = useRef(0)
  const { g, notes } = useBeat(position, 1.05, (on, _t, pulse) => {
    if (on && !reduceMotion) spin.current += 0.09
    disc.current.rotation.y = -spin.current
    crank.current.rotation.x = spin.current * 0.5
    const k = on ? 1 + pulse * 0.025 : 1
    horn.current.scale.set(k, 1, k)
  }, 0.03, { vy: 0.42, dx: 0.3 })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <Static>
          {/* le coffret, ses pieds tournés, son couvercle, sa moulure */}
          <Part geo={rbox(0.62, 0.22, 0.52, 0.04)} m={G.lacquer} p={[0, 0.2, 0]} />
          <Part geo={rbox(0.66, 0.04, 0.56, 0.02)} m={G.woodDark} p={[0, 0.32, 0]} castShadow={false} />
          {[-0.26, 0.26].flatMap((x) => [-0.21, 0.21].map((z) => <Part key={`${x}${z}`} geo={cyl(0.03, 0.04, 0.1, 10)} m={G.woodDark} p={[x, 0.05, z]} castShadow={false} />))}
          {/* la plaque de laiton de la marque, face au visiteur */}
          <Part geo={rbox(0.014, 0.07, 0.2, 0.006)} m={G.brass} p={[0.32, 0.2, 0]} castShadow={false} />
          {/* le plateau : feutre vert, axe central */}
          <Part geo={cyl(0.22, 0.22, 0.02, 32)} m={G.plaid} p={[0, 0.35, 0]} castShadow={false} />
          {/* le support du pavillon et son coude de laiton */}
          <Part geo={cyl(0.03, 0.04, 0.2, 10)} m={G.brass} p={[-0.2, 0.46, 0]} />
          <Part geo={SPH} m={G.horn} scale={[0.07, 0.07, 0.07]} p={[-0.2, 0.57, 0]} castShadow={false} />
        </Static>
        {/* le disque qui tourne, son étiquette crème et ses sillons */}
        <group ref={disc} position={[0.02, 0.37, 0]}>
          <Static>
            <Part geo={cyl(0.2, 0.2, 0.012, 32)} m={G.record} castShadow={false} />
            <Part geo={cyl(0.07, 0.07, 0.014, 20)} m={G.cream} p={[0, 0.002, 0]} castShadow={false} />
            <Part geo={cyl(0.12, 0.12, 0.0125, 28)} m={G.plaid} p={[0, -0.0005, 0]} castShadow={false} />
            <Part geo={cyl(0.012, 0.012, 0.03, 8)} m={G.steel} p={[0, 0.01, 0]} castShadow={false} />
          </Static>
        </group>
        <Static>
          {/* le bras : un tube de laiton coudé, le diaphragme sur le disque */}
          <Part geo={cyl(0.012, 0.012, 0.26, 8)} m={G.horn} p={[-0.07, 0.5, 0.08]} rotation-z={Math.PI / 2 - 0.1} rotation-y={0.5} castShadow={false} />
          <Part geo={cyl(0.03, 0.03, 0.02, 12)} m={G.brass} p={[0.07, 0.4, 0.15]} castShadow={false} />
        </Static>
        {/* la manivelle sur le flanc : bras de laiton et poignée de bois */}
        <group ref={crank} position={[0, 0.22, 0.28]}>
          <Static>
            <Part geo={cyl(0.012, 0.012, 0.1, 8)} m={G.brass} p={[0, 0, 0.04]} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.01, 0.01, 0.14, 8)} m={G.brass} p={[0, 0.07, 0.09]} castShadow={false} />
            <Part geo={cyl(0.018, 0.018, 0.06, 10)} m={G.woodDark} p={[0, 0.14, 0.09]} castShadow={false} />
          </Static>
        </group>
        {/* le pavillon : il part du coude et s'évase vers la caméra (+x, un peu levé) */}
        <group ref={horn} position={[-0.2, 0.57, 0]} rotation-z={-Math.PI / 2 + 0.25}>
          <Part geo={HORN} m={G.horn} castShadow />
        </group>
        {/* les disques rangés à côté, dans leur pochette */}
        <group position={[0.06, 0.34, -0.36]}>
          <Static>
            <Part geo={rbox(0.26, 0.012, 0.26, 0.005)} m={G.cushion2} p={[0, 0.01, 0]} rotation-y={0.2} castShadow={false} />
            <Part geo={rbox(0.26, 0.012, 0.26, 0.005)} m={G.plaid} p={[0, 0.024, 0]} rotation-y={-0.1} castShadow={false} />
          </Static>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
