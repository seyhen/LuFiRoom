import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SphereGeometry, type Group, type PointLight, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay } from '../parts'
import { mood, useSquash } from '../anim'
import { glowTex } from '../textures'
import { B } from './materials'

const dome = new SphereGeometry(0.3, 28, 12, 0, TAU, 0, Math.PI / 2)
const AT = [-1.25, 0, -2.55] as const

/** Tabouret de bois flotté, et dessus une lampe à abat-jour de rotin tressé : bascule jour / nuit, lumière de miel. */
export function RattanLamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night)
    light.current.intensity = e * 1.7 * Math.PI // × π : voir materials.ts
    B.lampShade.emissiveIntensity = e * 0.85
    glow.current.material.opacity = e * 0.7
  })
  return (
    <group position={AT}>
      <Part geo={cyl(0.26, 0.24, 0.07, 22)} m={B.driftwood} p={[0, 0.52, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU
        return <Part key={i} geo={cyl(0.03, 0.025, 0.5, 8)} m={B.driftwood} p={[Math.cos(a) * 0.15, 0.25, Math.sin(a) * 0.15]} rotation={[-Math.sin(a) * 0.12, 0, Math.cos(a) * 0.12]} />
      })}
      <group ref={g} userData={{ id: 'lamp' }} position={[0, 0.56, 0]}>
        <Part geo={SPH} m={B.turquoise} scale={[0.13, 0.15, 0.13]} p={[0, 0.14, 0]} />
        <Part geo={cyl(0.012, 0.012, 0.25, 8)} m={B.wood} p={[0, 0.38, 0]} castShadow={false} />
        <Part geo={dome} m={B.lampShade} p={[0, 0.44, 0]} scale-y={0.75} />
        <Part geo={cyl(0.3, 0.3, 0.02, 28)} m={B.cane} p={[0, 0.44, 0]} castShadow={false} />
        <pointLight ref={light} color={0xffb877} intensity={0} distance={8} decay={1.5} position={[0, 0.38, 0.2]} />
        <sprite ref={glow} scale={1.6} position={[0, 0.48, 0]} raycast={noRay}>
          <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
    </group>
  )
}
