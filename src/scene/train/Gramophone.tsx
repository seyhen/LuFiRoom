import { useRef } from 'react'
import { DoubleSide, LatheGeometry, Vector2, type Group } from 'three'
import { M } from '../materials'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { T } from './materials'

// Le pavillon : une trompe qui s'évase de plus en plus vite, de 4 cm à 30 cm de rayon sur 62 cm.
const horn = new LatheGeometry(Array.from({ length: 25 }, (_, i) => new Vector2(0.035 + 0.3 * Math.pow(i / 24, 2.2), (i / 24) * 0.62)), 30)
const hornMat = T.brass.clone()
hornMat.side = DoubleSide
const HORN_DIR = orient([0.9, 0.72, 0.12])

/**
 * Un gramophone à pavillon sur la commode d'acajou : le disque tourne, le bras se pose, le pavillon de laiton bat sur le rythme
 * et la manivelle du côté. C'est l'objet « radio » du train de nuit.
 */
export function Gramophone({ position }: { position: V3 }) {
  const disc = useRef<Group>(null!), arm = useRef<Group>(null!), bell = useRef<Group>(null!)
  const { g, notes } = useBeat(position, 1.05, (on, t, pulse) => {
    if (!reduceMotion) disc.current.rotation.y = on ? -t * 3.4 : disc.current.rotation.y
    arm.current.rotation.y = on ? 0.5 : 0.05
    bell.current.scale.setScalar(1 + (on ? pulse * 0.05 : 0))
  }, 0.03)
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position}>
       <group scale={1.25}>
        {/* la caisse, son couvercle, les pieds */}
        <Part geo={rbox(0.5, 0.2, 0.46, 0.04)} m={T.mahogany} p={[0, 0.12, 0]} />
        <Part geo={rbox(0.52, 0.03, 0.48, 0.015)} m={T.mahoganyDark} p={[0, 0.235, 0]} />
        {[[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.025, 0.02, 0.04, 8)} m={T.mahoganyDark} p={[x, 0.02, z]} castShadow={false} />
        ))}
        {/* le plateau, le disque noir à étiquette velours, l'axe */}
        <Part geo={cyl(0.22, 0.22, 0.016, 32)} m={T.brass} p={[0, 0.258, 0.02]} castShadow={false} />
        <group ref={disc} position={[0, 0.272, 0.02]}>
          <Part geo={cyl(0.2, 0.2, 0.012, 32)} m={M.ink} castShadow={false} />
          <Part geo={cyl(0.06, 0.06, 0.016, 20)} m={T.velvet} castShadow={false} />
          <Part geo={rbox(0.02, 0.018, 0.1, 0.006)} m={T.gold} p={[0.1, 0.002, 0]} castShadow={false} />
        </group>
        <Part geo={SPH} m={T.brass} scale={0.014} p={[0, 0.285, 0.02]} castShadow={false} />
        {/* le bras de lecture, qui se pose sur le disque */}
        <group ref={arm} position={[0.2, 0.28, -0.17]}>
          <Part geo={cyl(0.03, 0.03, 0.03, 14)} m={T.brass} castShadow={false} />
          <Part geo={cyl(0.007, 0.007, 0.3, 6)} m={T.brass} p={[-0.1, 0.02, 0.1]} rotation={[Math.PI / 2, 0, 0.9]} castShadow={false} />
        </group>
        {/* la manivelle sur le côté */}
        <Part geo={cyl(0.008, 0.008, 0.1, 6)} m={T.brass} p={[0.31, 0.14, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={SPH} m={T.mahoganyDark} scale={0.03} p={[0.37, 0.14, 0.05]} castShadow={false} />
        {/* le pavillon, qui s'évase vers la pièce ; son col sort du fond du meuble */}
        <group ref={bell} position={[-0.12, 0.27, -0.14]}>
          <group rotation={HORN_DIR}>
            <mesh geometry={horn} material={hornMat} castShadow receiveShadow />
          </group>
        </group>
       </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
