import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SphereGeometry, type Group, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { A } from './materials'

const AT: [number, number, number] = [0.2, 0, -2.05]
const TILT = -0.62
const head = new SphereGeometry(0.11, 22, 10, 0, TAU, 0, Math.PI / 2)

/** La lampe d'architecte, pincée au bord de la table : deux bras, un ressort, une tête qui éclaire le dessin. Jour / nuit. */
function DraftLamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night)
    light.current.intensity = e * 1.9 * Math.PI // × π : voir materials.ts
    A.shade.emissiveIntensity = e * 0.3
    A.lampShade.emissiveIntensity = e * 0.75
    A.bulb.emissiveIntensity = 0.3 + e * 1.3
    glow.current.material.opacity = e * 0.7
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[0.62, 1.05, 0.05]}>
      <Part geo={rbox(0.08, 0.1, 0.08, 0.02)} m={A.steel} />
      <group rotation-z={0.35}>
        <Part geo={cyl(0.012, 0.012, 0.6, 6)} m={A.steel} p={[0, 0.3, 0]} />
        <group position={[0, 0.6, 0]} rotation-z={1.7}>
          <Part geo={SPH} m={A.steel} scale={0.022} />
          <Part geo={cyl(0.012, 0.012, 0.55, 6)} m={A.steel} p={[0, 0.27, 0]} />
          <group position={[0, 0.55, 0]} rotation-z={0.9}>
            <Part geo={head} m={A.shade} rotation-x={Math.PI} />
            <mesh geometry={SPH} material={A.bulb} scale={0.045} position={[0, -0.02, 0]} />
          </group>
        </group>
      </group>
      <pointLight ref={light} color={0xffc98a} intensity={0} distance={6} decay={1.6} position={[-0.55, 0.35, 0.1]} />
      <sprite ref={glow} scale={1.1} position={[-0.55, 0.3, 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/** Le crayon qui bouge sur la feuille quand on écoute le dessin. */
function Pencil() {
  const p = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const on = isActive(useStore.getState(), 'pencil'), t = clock.elapsedTime
    if (reduceMotion || !on) return
    p.current.position.x = -0.1 + Math.sin(t * 3.1) * 0.12 + Math.sin(t * 11) * 0.02
    p.current.position.z = 0.05 + Math.sin(t * 1.7) * 0.06
  })
  return (
    <group ref={p} userData={LIVE} position={[-0.1, 0.03, 0.05]} rotation={[0.9, 0.4, 0]}>
      <Part geo={cyl(0.008, 0.008, 0.22, 6)} m={A.ochre} p={[0, 0.11, 0]} castShadow={false} />
      <Part m={A.cream} p={[0, -0.01, 0]} rotation-x={Math.PI} castShadow={false}>
        <coneGeometry args={[0.008, 0.03, 6]} />
      </Part>
    </group>
  )
}

/** La table à dessin inclinée, son croquis d'immeuble, la règle, les crayons, et la lampe d'architecte. */
export function DraftingTable() {
  const g = useRef<Group>(null!)
  useSquash('pencil', g)
  return (
    <group position={AT}>
      {/* le piètement : deux montants en A et une traverse */}
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Part geo={rbox(0.05, 1.0, 0.05, 0.02)} m={A.oakDark} p={[0, 0.5, 0.25]} rotation-x={0.18} />
          <Part geo={rbox(0.05, 1.0, 0.05, 0.02)} m={A.oakDark} p={[0, 0.5, -0.25]} rotation-x={-0.18} />
        </group>
      ))}
      <Part geo={rbox(1.15, 0.04, 0.04, 0.015)} m={A.oakDark} p={[0, 0.3, 0]} castShadow={false} />
      <group ref={g} userData={{ id: 'pencil' }} position={[0, 1.0, 0]} rotation-x={TILT}>
        <Part geo={rbox(1.3, 0.04, 0.9, 0.02)} m={A.white} />
        <mesh material={A.sketch} position={[-0.05, 0.022, 0.02]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.84, 0.6]} />
        </mesh>
        {/* la règle parallèle et ses câbles */}
        <Part geo={rbox(1.28, 0.02, 0.05, 0.01)} m={A.steel} p={[0, 0.03, 0.2]} castShadow={false} />
        <Part geo={rbox(0.06, 0.02, 0.5, 0.01)} m={A.blush} p={[0.45, 0.03, -0.05]} rotation-y={0.2} castShadow={false} />
        <Pencil />
        {/* l'auget à crayons, en bas */}
        <Part geo={rbox(1.3, 0.05, 0.06, 0.015)} m={A.oak} p={[0, 0.03, 0.46]} />
        {[[-0.4, A.prussian], [-0.32, A.terracotta], [-0.2, A.sage]].map(([x, m], i) => (
          <Part key={i} geo={cyl(0.007, 0.007, 0.2, 6)} m={m as typeof A.sage} p={[x as number, 0.07, 0.45]} rotation-z={Math.PI / 2} castShadow={false} />
        ))}
      </group>
      <DraftLamp />
      {/* le pot à crayons et la tasse, sur une petite desserte */}
      <group position={[-0.85, 0, 0.1]}>
        <Part geo={cyl(0.2, 0.2, 0.03, 18)} m={A.oak} p={[0, 0.82, 0]} />
        <Part geo={cyl(0.02, 0.02, 0.8, 8)} m={A.steel} p={[0, 0.4, 0]} />
        <Part geo={cyl(0.18, 0.2, 0.03, 18)} m={A.steel} p={[0, 0.015, 0]} castShadow={false} />
        <Part geo={cyl(0.05, 0.05, 0.12, 14)} m={A.terracotta} p={[-0.05, 0.9, 0]} />
        {[[-0.07, 0.02, A.ochre], [-0.04, -0.02, A.prussian], [-0.03, 0.02, A.sage], [-0.06, -0.01, A.blush]].map(([x, z, m], i) => (
          <Part key={i} geo={cyl(0.007, 0.007, 0.2, 5)} m={m as typeof A.sage} p={[x as number, 0.98, z as number]} rotation={[(i - 1.5) * 0.12, 0, (i - 1.5) * 0.1]} castShadow={false} />
        ))}
        <Part geo={cyl(0.05, 0.042, 0.09, 16)} m={A.cream} p={[0.08, 0.88, 0.05]} />
      </group>
    </group>
  )
}

/** Le tabouret d'atelier, réglable, devant la table. */
export function Stool() {
  return (
    <group position={[0.25, 0, -1.2]}>
      <Part geo={cyl(0.2, 0.2, 0.06, 20)} m={A.oak} p={[0, 0.66, 0]} />
      <Part geo={cyl(0.025, 0.025, 0.6, 8)} m={A.steel} p={[0, 0.35, 0]} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * TAU + 0.4
        return <Part key={i} geo={cyl(0.015, 0.015, 0.42, 6)} m={A.steel} p={[Math.cos(a) * 0.12, 0.17, Math.sin(a) * 0.12]} rotation={[Math.sin(a) * 0.65, 0, -Math.cos(a) * 0.65]} />
      })}
      <Part m={A.steel} p={[0, 0.22, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.17, 0.01, 6, 20]} />
      </Part>
    </group>
  )
}
