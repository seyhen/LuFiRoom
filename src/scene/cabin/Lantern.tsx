import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type PointLight, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { flameMats } from '../materials'
import { LIVE } from '../Static'
import { C } from './materials'

/** Une lampe-tempête sur le guéridon : sa mèche s'allume le soir (bascule jour / nuit) et dore toute la pièce. */
export function Lantern({ position }: { position: [number, number, number] }) {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!), flame = useRef<Group>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime, f = reduceMotion ? 0 : Math.sin(t * 9) * 0.06 + Math.sin(t * 14.3) * 0.04
    light.current.intensity = e * (1.7 + f) * Math.PI // × π : voir materials.ts
    C.lanternGlass.emissiveIntensity = e * (0.7 + f)
    glow.current.material.opacity = e * 0.8
    flame.current.visible = e > 0.05
    flame.current.scale.y = 1 + f * 2
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={position}>
      <Part geo={cyl(0.13, 0.15, 0.08, 18)} m={C.red} p={[0, 0.04, 0]} />
      <Part geo={cyl(0.09, 0.12, 0.05, 18)} m={C.iron} p={[0, 0.1, 0]} />
      <Part geo={SPH} m={C.lanternGlass} scale={[0.12, 0.17, 0.12]} p={[0, 0.27, 0]} castShadow={false} />
      <group ref={flame} userData={LIVE} position={[0, 0.25, 0]}>
        <mesh geometry={SPH} material={flameMats.core} scale={[0.02, 0.045, 0.02]} position={[0, 0.03, 0]} raycast={noRay} />
      </group>
      <Part geo={cyl(0.07, 0.1, 0.06, 18)} m={C.red} p={[0, 0.45, 0]} />
      <Part m={C.iron} p={[0, 0.5, 0]} castShadow={false}>
        <torusGeometry args={[0.1, 0.008, 6, 18, Math.PI]} />
      </Part>
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.006, 0.006, 0.36, 5)} m={C.iron} p={[s * 0.13, 0.27, 0]} castShadow={false} />
      ))}
      <pointLight ref={light} color={0xffb36a} intensity={0} distance={9} decay={1.5} position={[0, 0.3, 0.2]} />
      <sprite ref={glow} scale={1.6} position={[0, 0.28, 0]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}
