import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, LatheGeometry, Vector2, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { L } from './materials'

/** La cloche : son pivot sur la potence, au mur du fond. */
export const BELL = { x: 2.68, y: 2.1, z: -2.72 }

// Profil d'une cloche de navire : un dôme, des flancs qui s'évasent, une lèvre épaisse.
const profile = [[0.0, 0.0], [0.05, 0.02], [0.1, 0.07], [0.13, 0.15], [0.15, 0.25], [0.18, 0.34], [0.23, 0.41], [0.27, 0.45], [0.275, 0.48], [0.26, 0.48]] as const
const bellGeo = new LatheGeometry(profile.map(([r, y]) => new Vector2(r, 0.5 - y)), 28)
const bellMat = L.brass.clone()
bellMat.side = DoubleSide

/**
 * La cloche de bord, pendue à une potence de fer au mur : elle se balance et sonne, le battant tape à chaque oscillation, sa
 * corde de chanvre pend avec un nœud de marin. Elle s'agite quand on écoute la cloche de la bouée.
 */
export function Bell() {
  const g = useRef<Group>(null!), swing = useRef<Group>(null!), clapper = useRef<Group>(null!), on = useRef(0)
  useSquash('bell', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    on.current = approach(on.current, isActive(useStore.getState(), 'bell') ? 1 : 0, Math.min(delta, 0.05) * 1.1)
    const k = reduceMotion ? 0 : on.current, a = 0.025 + k * 0.26
    swing.current.rotation.z = Math.sin(t * 2.3) * a
    clapper.current.rotation.z = Math.sin(t * 2.3 - 0.9) * (0.1 + k * 0.6)
  })
  return (
    <group ref={g} userData={{ id: 'bell' }} position={[BELL.x, BELL.y, BELL.z]}>
      {/* la potence : un fer plat scellé au mur, un renfort en équerre */}
      <Part geo={rbox(0.14, 0.2, 0.05, 0.015)} m={L.iron} p={[0, 0.1, -0.25]} />
      <Part geo={rbox(0.06, 0.05, 0.42, 0.015)} m={L.iron} p={[0, 0.2, -0.05]} />
      <Part geo={rbox(0.04, 0.04, 0.34, 0.012)} m={L.iron} p={[0, 0.0, -0.1]} rotation-x={0.5} castShadow={false} />
      <group ref={swing} position={[0, 0.17, 0.12]}>
        <Part geo={cyl(0.012, 0.012, 0.09, 6)} m={L.iron} p={[0, -0.04, 0]} castShadow={false} />
        <Part geo={cyl(0.05, 0.05, 0.06, 12)} m={L.brassDull} p={[0, -0.1, 0]} castShadow={false} />
        <group position={[0, -0.64, 0]}>
          <mesh geometry={bellGeo} material={bellMat} castShadow receiveShadow />
          <group ref={clapper} position={[0, 0.42, 0]}>
            <Part geo={cyl(0.008, 0.008, 0.36, 6)} m={L.iron} p={[0, -0.18, 0]} castShadow={false} />
            <Part geo={SPH} m={L.iron} scale={0.045} p={[0, -0.38, 0]} castShadow={false} />
          </group>
          {/* la corde du battant, avec son nœud de marin, qui pend sous la lèvre */}
          <Part geo={cyl(0.01, 0.01, 0.46, 6)} m={L.rope} p={[0, -0.28, 0]} castShadow={false} />
          <Part geo={SPH} m={L.ropeDark} scale={[0.04, 0.05, 0.04]} p={[0, -0.52, 0]} castShadow={false} />
        </group>
      </group>
    </group>
  )
}
