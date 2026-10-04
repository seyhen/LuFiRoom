import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { S } from './materials'

/** Le manomètre : son centre sur le mur du fond, au-dessus de la console du sonar. */
export const GAUGE = { x: -1.75, y: 3.1 }
// L'aiguille part du centre ; le cadran va de 0 à 10 sur trois quarts de tour (voir textures.ts).
const needleAngle = (k: number) => -(Math.PI * 0.75 + k * Math.PI * 1.5 + Math.PI / 2)

/**
 * Le manomètre de pression : un grand cadran de laiton sous une vitre bombée, alimenté par un tuyau de cuivre qui monte au
 * plafond. Au calme l'aiguille tient autour de 3 ; quand la coque gémit, elle grimpe vers la zone rouge en tremblant.
 */
export function Gauge() {
  const g = useRef<Group>(null!), needle = useRef<Group>(null!), k = useRef(0.32)
  useSquash('gauge', g)
  useFrame(({ clock }, delta) => {
    const on = isActive(useStore.getState(), 'gauge'), t = clock.elapsedTime
    k.current = approach(k.current, on ? 0.76 : 0.32, Math.min(delta, 0.05) * (on ? 0.22 : 0.3))
    const shake = reduceMotion ? 0 : on ? Math.sin(t * 19) * 0.01 + Math.sin(t * 6.1) * 0.016 : Math.sin(t * 0.7) * 0.004
    needle.current.rotation.z = needleAngle(k.current + shake)
  })
  return (
    <group ref={g} userData={{ id: 'gauge' }} position={[GAUGE.x, GAUGE.y, -2.94]}>
      <Part geo={cyl(0.5, 0.5, 0.06, 40)} m={S.hullDark} rotation-x={Math.PI / 2} />
      <Part m={S.brass} p={[0, 0, 0.04]}>
        <torusGeometry args={[0.41, 0.06, 14, 48]} />
      </Part>
      <mesh material={S.gauge} position={[0, 0, 0.046]}>
        <circleGeometry args={[0.38, 48]} />
      </mesh>
      <Part geo={cyl(0.38, 0.38, 0.01, 40)} m={S.glass} p={[0, 0, 0.09]} rotation-x={Math.PI / 2} castShadow={false} />
      <group ref={needle} position={[0, 0, 0.065]}>
        <Part geo={rbox(0.018, 0.32, 0.008, 0.005)} m={S.iron} p={[0, 0.13, 0]} castShadow={false} />
        <Part geo={rbox(0.018, 0.08, 0.008, 0.005)} m={S.iron} p={[0, -0.05, 0]} castShadow={false} />
      </group>
      <Part geo={SPH} m={S.brass} scale={0.032} p={[0, 0, 0.074]} castShadow={false} />
      {/* les quatre vis du cadre, et le tuyau d'alimentation qui monte vers le plafond */}
      {[0.7, 2.3, 3.9, 5.5].map((a) => (
        <Part key={a} geo={SPH} m={S.brassDull} scale={0.026} p={[Math.cos(a) * 0.46, Math.sin(a) * 0.46, 0.05]} castShadow={false} />
      ))}
      <Part geo={cyl(0.04, 0.04, 0.55, 12)} m={S.copper} p={[0, 0.78, -0.02]} castShadow={false} />
      <Part geo={cyl(0.065, 0.065, 0.06, 12)} m={S.brass} p={[0, 0.54, -0.02]} castShadow={false} />
    </group>
  )
}
