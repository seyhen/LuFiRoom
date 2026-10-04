import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type PointLight, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { K } from './materials'

/**
 * La grande lanterne rouge du milieu, pendue à un bras de la poutre : c'est la « lampe » du marché. De jour son papier est
 * mat ; la nuit il rougeoie, la flamme du fond vacille, et la lanterne éclaire le comptoir et les tabourets de sa lumière rose-orangé.
 * Toutes les lanternes de la carriole partagent le même papier : elles s'allument ensemble.
 */
export function Lantern({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), swing = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime, f = 1 + (reduceMotion ? 0 : Math.sin(t * 6.3) * 0.03 + Math.sin(t * 15.1) * 0.015)
    light.current.intensity = e * 1.5 * f * Math.PI // × π : voir materials.ts
    K.lantern.emissiveIntensity = 0.12 + e * 1.15
    glow.current.material.opacity = e * 0.85 * f
    swing.current.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.8) * 0.04 + Math.sin(t * 1.9) * 0.012
  })
  return (
    <group position={position}>
      {/* le bras de la poutre, la corde */}
      <Part geo={rbox(0.03, 0.03, 0.4, 0.01)} m={K.woodDark} p={[0, 0, 0.2]} castShadow={false} />
      <group ref={swing} position={[0, 0, 0.32]}>
        <group ref={g} userData={{ id: 'lamp' }} position={[0, -0.35, 0]}>
          <Part geo={cyl(0.006, 0.006, 0.3, 4)} m={K.iron} p={[0, 0.29, 0]} castShadow={false} />
          <Part geo={SPH} m={K.lantern} scale={[0.26, 0.3, 0.26]} rotation-y={0.5} />
          <Part geo={cyl(0.12, 0.12, 0.04, 18)} m={K.lanternCap} p={[0, 0.3, 0]} castShadow={false} />
          <Part geo={cyl(0.12, 0.12, 0.04, 18)} m={K.lanternCap} p={[0, -0.3, 0]} castShadow={false} />
          {[0, 1, 2].map((i) => (
            <Part key={i} geo={cyl(0.004, 0.004, 0.16, 4)} m={K.red} p={[(i - 1) * 0.025, -0.4, 0]} castShadow={false} />
          ))}
          <Part geo={SPH} m={K.red} scale={0.03} p={[0, -0.33, 0]} castShadow={false} />
          <pointLight ref={light} color={0xff7a5a} intensity={0} distance={7} decay={1.5} position={[0, 0, 0.2]} />
          <sprite ref={glow} scale={2.0} position={[0, 0, 0.05]} raycast={noRay}>
            <spriteMaterial map={glowTex} color={0xff6a4a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
          </sprite>
        </group>
      </group>
    </group>
  )
}
