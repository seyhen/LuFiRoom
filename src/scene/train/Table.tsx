import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { Steam } from '../objects/Steam'
import { LIVE } from '../Static'
import { T } from './materials'

const TOP = 1.0, Z = -2.68

/** La lampe de table à abat-jour plissé bordeaux, frangé : la lumière du compartiment, jour / nuit. */
function TableLamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), berth = useRef<PointLight>(null!), glow = useRef<Sprite>(null!), fringe = useRef<Group>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night)
    light.current.intensity = (0.25 + e * 1.55) * Math.PI // × π : voir materials.ts
    berth.current.intensity = e * 0.9 * Math.PI
    T.shade.emissiveIntensity = 0.12 + e * 0.75
    glow.current.material.opacity = 0.15 + e * 0.6
    if (!reduceMotion) fringe.current.rotation.z = Math.sin(clock.elapsedTime * 2.1) * 0.03
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[-0.05, TOP, Z]}>
      <Part geo={cyl(0.09, 0.11, 0.04, 20)} m={T.brass} p={[0, 0.02, 0]} />
      <Part geo={cyl(0.015, 0.02, 0.36, 10)} m={T.brass} p={[0, 0.22, 0]} />
      <Part geo={cyl(0.12, 0.2, 0.22, 16)} m={T.shade} p={[0, 0.46, 0]} />
      <group ref={fringe} userData={LIVE} position={[0, 0.34, 0]}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * TAU
          return <Part key={i} geo={cyl(0.006, 0.004, 0.06, 4)} m={T.gold} p={[Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2]} castShadow={false} />
        })}
      </group>
      <mesh geometry={SPH} material={T.bulb} scale={0.04} position={[0, 0.4, 0]} />
      <pointLight ref={light} color={0xffb36a} intensity={0} distance={8} decay={1.5} position={[0, 0.32, 0.25]} />
      {/* les appliques de lecture des couchettes, allumées avec elle */}
      <pointLight ref={berth} color={0xffc08a} intensity={0} distance={6} decay={1.5} position={[-2.0, 0.6, 1.0]} />
      <sprite ref={glow} scale={1.4} position={[0, 0.42, 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/** Le verre de thé dans son porte-verre ciselé : la cuillère tremble avec le train, et il fume quand on l'écoute. */
function TeaGlass() {
  const g = useRef<Group>(null!), spoon = useRef<Mesh>(null!), on = useRef(false)
  useSquash('tea', g)
  useFrame(({ clock }) => {
    on.current = isActive(useStore.getState(), 'tea')
    if (reduceMotion) return
    const t = clock.elapsedTime, k = on.current ? 1 : 0.3
    spoon.current.rotation.z = 0.18 + Math.sin(t * 23) * 0.04 * k + Math.sin(t * 7.1) * 0.03 * k
  })
  return (
    <group ref={g} userData={{ id: 'tea' }} position={[0.75, TOP, Z + 0.05]}>
      <Part geo={cyl(0.1, 0.1, 0.012, 22)} m={T.brass} p={[0, 0.006, 0]} castShadow={false} />
      <Part geo={cyl(0.058, 0.05, 0.08, 18)} m={T.brass} p={[0, 0.05, 0]} />
      <Part geo={cyl(0.05, 0.046, 0.15, 18)} m={T.tea} p={[0, 0.1, 0]} castShadow={false} />
      <Part geo={cyl(0.056, 0.05, 0.17, 18)} m={T.glass} p={[0, 0.11, 0]} castShadow={false} />
      <Part m={T.brass} p={[0.07, 0.09, 0]} castShadow={false}>
        <torusGeometry args={[0.035, 0.008, 6, 14, Math.PI * 1.2]} />
      </Part>
      <mesh ref={spoon} userData={LIVE} geometry={cyl(0.004, 0.004, 0.24, 5)} material={T.brass} position={[-0.015, 0.2, 0]} rotation-z={0.18} />
      <Part geo={cyl(0.03, 0.03, 0.006, 14)} m={T.mustard} p={[0.03, 0.18, 0.02]} rotation-z={0.8} castShadow={false} />
      <TeaSteam on={on} />
    </group>
  )
}

function TeaSteam({ on }: { on: { current: boolean } }) {
  const g = useRef<Group>(null!)
  useFrame(() => void (g.current.visible = on.current))
  return (
    <group ref={g}>
      <Steam at={[0, 0.2, 0]} every={0.7} />
    </group>
  )
}

/** La tablette sous la fenêtre : nappe de lin, lampe, thé, un croissant, une rose, le billet. */
export function Table() {
  return (
    <>
      <Part geo={rbox(2.6, 0.06, 0.6, 0.03)} m={T.mahogany} p={[0.9, TOP - 0.03, Z]} />
      <Part geo={rbox(2.64, 0.025, 0.64, 0.012)} m={T.brass} p={[0.9, TOP - 0.07, Z]} castShadow={false} />
      <Part geo={rbox(1.4, 0.01, 0.62, 0.005)} m={T.sheet} p={[0.9, TOP + 0.005, Z]} castShadow={false} />
      {[-0.25, 2.05].map((x) => (
        <Part key={x} geo={rbox(0.05, 0.7, 0.4, 0.02)} m={T.mahogany} p={[x, TOP - 0.42, Z - 0.08]} />
      ))}
      <TableLamp />
      <TeaGlass />
      {/* le croissant sur son assiette */}
      <Part geo={cyl(0.13, 0.11, 0.015, 24)} m={T.sheet} p={[1.3, TOP + 0.015, Z + 0.06]} castShadow={false} />
      <Part m={T.croissant} p={[1.3, TOP + 0.05, Z + 0.06]} rotation-x={Math.PI / 2} scale={[1, 1, 0.7]}>
        <torusGeometry args={[0.055, 0.035, 10, 18, Math.PI * 1.15]} />
      </Part>
      {/* une rose dans un soliflore d'argent */}
      <Part geo={cyl(0.025, 0.035, 0.16, 12)} m={T.brass} p={[1.85, TOP + 0.08, Z - 0.08]} />
      <Part geo={cyl(0.004, 0.004, 0.16, 4)} m={T.leaf} p={[1.85, TOP + 0.22, Z - 0.08]} castShadow={false} />
      <Part geo={SPH} m={T.rose} scale={[0.04, 0.035, 0.04]} p={[1.85, TOP + 0.31, Z - 0.08]} />
      <Part geo={SPH} m={T.leaf} scale={[0.035, 0.008, 0.02]} p={[1.87, TOP + 0.24, Z - 0.07]} rotation-z={0.5} castShadow={false} />
      {/* le billet et la montre de gousset */}
      <Part geo={rbox(0.2, 0.004, 0.09, 0.002)} m={T.cream} p={[1.55, TOP + 0.012, Z + 0.15]} rotation-y={0.3} castShadow={false} />
      <Part geo={cyl(0.04, 0.04, 0.015, 18)} m={T.gold} p={[1.0, TOP + 0.015, Z + 0.17]} castShadow={false} />
    </>
  )
}
