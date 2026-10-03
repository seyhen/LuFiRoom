import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SphereGeometry, type Group, type PointLight, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood, useSquash } from '../anim'
import { Static } from '../Static'
import { K } from './materials'
import { bulbGlowTex } from './textures'
import { Steam } from './Steam'

const dome = new SphereGeometry(1, 28, 10, 0, TAU, 0, Math.PI / 2)
const AT: V3 = [-1.0, 0, -1.2]

/** Guéridon de noyer à côté du fauteuil : une tasse de thé, deux livres. */
function SideTable() {
  return (
    <>
      <Part geo={cyl(0.3, 0.3, 0.045, 28)} m={K.walnut} p={[0, 0.64, 0]} />
      <Part geo={cyl(0.035, 0.05, 0.6, 12)} m={K.walnut} p={[0, 0.32, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU
        return <Part key={i} geo={rbox(0.24, 0.05, 0.06, 0.02)} m={K.walnut} p={[Math.cos(a) * 0.12, 0.03, Math.sin(a) * 0.12]} rotation-y={-a} />
      })}
      <Part geo={rbox(0.26, 0.05, 0.19, 0.015)} m={K.green} p={[-0.08, 0.69, 0.1]} rotation-y={0.3} />
      <Part geo={rbox(0.22, 0.04, 0.16, 0.015)} m={K.burgundy} p={[-0.08, 0.735, 0.1]} rotation-y={0.1} />
      <Part geo={cyl(0.075, 0.07, 0.012, 20)} m={M.cream} p={[0.15, 0.668, 0.12]} castShadow={false} />
      <Part geo={cyl(0.045, 0.035, 0.06, 16)} m={M.cream} p={[0.15, 0.705, 0.12]} castShadow={false} />
      <Steam at={[0.15, 0.75, 0.12]} every={1.1} />
    </>
  )
}

/** Lampe de banquier, abat-jour de verre vert : bascule jour / nuit et fait une flaque de lumière chaude le soir. */
export function LibraryLamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night)
    light.current.intensity = e * 1.6 * Math.PI // × π : voir materials.ts
    K.bankerGlass.emissiveIntensity = 0.05 + e * 0.8
    glow.current.material.opacity = e * 0.85
  })
  return (
    <group position={AT}>
      <SideTable />
      <group ref={g} userData={{ id: 'lamp' }} position={[0.02, 0.665, -0.08]} rotation-y={0.5}>
        <Static>
          <Part geo={rbox(0.28, 0.04, 0.16, 0.02)} m={K.brass} p={[0, 0.02, 0]} />
          <Part geo={cyl(0.014, 0.018, 0.3, 10)} m={K.brass} p={[0, 0.18, -0.03]} />
          <Part geo={cyl(0.01, 0.01, 0.16, 8)} m={K.brass} p={[0, 0.33, -0.03]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={dome} m={K.bankerGlass} scale={[0.17, 0.085, 0.09]} p={[0, 0.33, 0.02]} />
          <mesh geometry={SPH} material={K.bulb} scale={[0.07, 0.02, 0.03]} position={[0, 0.325, 0.02]} />
          <Part geo={cyl(0.003, 0.003, 0.09, 4)} m={K.brass} p={[0.07, 0.28, 0.06]} castShadow={false} />
          <Part geo={SPH} m={K.brass} scale={0.012} p={[0.07, 0.235, 0.06]} castShadow={false} />
        </Static>
        <pointLight ref={light} color={0xffc286} intensity={0} distance={6} decay={1.6} position={[0, 0.25, 0.1]} />
        <sprite ref={glow} scale={1.0} position={[0, 0.27, 0.06]} raycast={noRay}>
          <spriteMaterial map={bulbGlowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
    </group>
  )
}
