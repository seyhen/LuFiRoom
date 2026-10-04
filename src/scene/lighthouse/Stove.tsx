import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { Static } from '../Static'
import { Flames } from '../objects/Flames'
import { Steam } from '../objects/Steam'
import { L } from './materials'

/** Le poêle : son centre au sol. Le tuyau monte jusqu'au haut du mur et sort de la pièce. */
export const STOVE = { x: -2.2, z: -2.35 }

/**
 * Le poêle à bois du gardien : un ventre de fonte sur quatre pieds, une porte à vitre de mica qui rougeoie, un long tuyau qui
 * monte sous le plafond, et la bouilloire qui chante dessus. On l'allume : le feu gronde, la vitre luit, la vapeur monte.
 */
export function Stove() {
  const g = useRef<Group>(null!), steam = useRef<Group>(null!)
  useSquash('stove', g)
  useFrame(() => void (steam.current.visible = isActive(useStore.getState(), 'stove')))
  return (
    <group ref={g} userData={{ id: 'stove' }} position={[STOVE.x, 0, STOVE.z]}>
      <Static>
        {/* un socle de brique réfractaire, quatre pieds, le ventre, le couvercle */}
        <Part geo={rbox(1.0, 0.05, 0.82, 0.02)} m={L.rockDark} p={[0, 0.025, 0.02]} />
        {[[-0.3, -0.22], [0.3, -0.22], [-0.3, 0.26], [0.3, 0.26]].map(([dx, dz]) => (
          <Part key={`${dx}${dz}`} geo={cyl(0.04, 0.05, 0.18, 8)} m={L.iron} p={[dx, 0.14, dz]} castShadow={false} />
        ))}
        <Part geo={rbox(0.78, 0.66, 0.62, 0.12)} m={L.iron} p={[0, 0.55, 0.02]} />
        <Part geo={rbox(0.84, 0.06, 0.68, 0.025)} m={L.ironLight} p={[0, 0.9, 0.02]} />
        <Part geo={rbox(0.5, 0.05, 0.38, 0.02)} m={L.iron} p={[0, 0.5, -0.13]} castShadow={false} />
        {/* la porte : cadre de fonte, mica rougeoyant, poignée de laiton */}
        <Part geo={rbox(0.42, 0.32, 0.05, 0.03)} m={L.ironLight} p={[0, 0.5, 0.34]} />
        <Part geo={cyl(0.012, 0.012, 0.16, 6)} m={L.brass} p={[0.2, 0.5, 0.39]} castShadow={false} />
        <Part geo={SPH} m={L.brass} scale={0.028} p={[0.2, 0.43, 0.395]} castShadow={false} />
        {/* le cendrier, et le tuyau qui part droit vers le haut */}
        <Part geo={rbox(0.36, 0.1, 0.04, 0.015)} m={L.ironLight} p={[0, 0.28, 0.34]} castShadow={false} />
        <Part geo={cyl(0.09, 0.09, 0.14, 14)} m={L.iron} p={[0, 0.98, -0.12]} />
        <Part geo={cyl(0.07, 0.07, 3.4, 14)} m={L.iron} p={[0, 2.75, -0.12]} />
        {[1.5, 2.4, 3.3].map((y) => (
          <Part key={y} geo={cyl(0.085, 0.085, 0.05, 14)} m={L.brassDull} p={[0, y, -0.12]} castShadow={false} />
        ))}
        {/* la bouilloire, noire et ventrue, sur le coin de la plaque */}
        <group position={[0.2, 0.93, 0.08]}>
          <Part geo={SPH} m={L.navyDark} scale={[0.17, 0.14, 0.17]} p={[0, 0.14, 0]} />
          <Part geo={cyl(0.1, 0.12, 0.04, 16)} m={L.navyDark} p={[0, 0.27, 0]} castShadow={false} />
          <Part geo={SPH} m={L.brass} scale={0.028} p={[0, 0.31, 0]} castShadow={false} />
          <Part geo={cyl(0.012, 0.03, 0.2, 8)} m={L.navyDark} p={[0.2, 0.2, 0]} rotation-z={-0.9} castShadow={false} />
          <Part m={L.brass} p={[0, 0.3, 0]} castShadow={false}>
            <torusGeometry args={[0.13, 0.014, 6, 16, Math.PI]} />
          </Part>
          <Part m={L.brassDull} p={[-0.15, 0.17, 0]} rotation-z={Math.PI / 2 + 0.3} castShadow={false}>
            <torusGeometry args={[0.07, 0.012, 6, 12, Math.PI]} />
          </Part>
        </group>
      </Static>
      {/* le mica : il brille de la lueur du feu */}
      <mesh material={L.ember} position={[0, 0.5, 0.366]}>
        <planeGeometry args={[0.28, 0.2]} />
      </mesh>
      <group ref={steam}>
        <Steam at={[0.4, 1.33, 0.08]} every={0.45} />
      </group>
      <Flames
        id="stove"
        position={[0, 0.34, 0.1]}
        size={0.45}
        light={{ at: [0, 0.6, 0.8], intensity: 1.5, distance: 7 }}
        glow={{ at: [0, 0.5, 0.6], scale: 1.7 }}
        onFrame={(k, t) => (L.ember.emissiveIntensity = 0.12 + k * (1.4 + Math.sin(t * 2.6) * 0.25))}
      />
    </group>
  )
}
