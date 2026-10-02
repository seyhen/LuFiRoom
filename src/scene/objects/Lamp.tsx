import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SphereGeometry, type Group, type PointLight, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { M } from '../materials'
import { Part, cyl, noRay } from '../parts'
import { mood, useSquash } from '../anim'
import { glowTex } from '../textures'

const capGeo = new SphereGeometry(0.34, 32, 16, 0, TAU, 0, Math.PI / 2)

/** Lampe champignon sur la table de chevet : bascule jour / nuit, éclaire la pièce la nuit. */
export function Lamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night)
    light.current.intensity = e * 1.8 * Math.PI // × π : voir materials.ts
    M.lampCap.emissiveIntensity = 0.04 + e * 1.0
    glow.current.material.opacity = e * 0.75
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[-2.55, 0.68, -2.55]}>
      <Part geo={cyl(0.16, 0.18, 0.06, 24)} m={M.cream} p={[0, 0.03, 0]} />
      <Part geo={cyl(0.06, 0.08, 0.32, 18)} m={M.cream} p={[0, 0.2, 0]} />
      <Part geo={capGeo} m={M.lampCap} p={[0, 0.33, 0]} scale-y={0.72} />
      <Part geo={cyl(0.335, 0.335, 0.03, 32)} m={M.lampCap} p={[0, 0.33, 0]} />
      <pointLight ref={light} color={0xffb070} intensity={0} distance={9} decay={1.5} position={[0, 0.28, 0.15]} />
      <sprite ref={glow} scale={1.9} position={[0, 0.36, 0]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}
