import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SphereGeometry, type Group, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, rand, smooth } from '../../math'
import { seeded } from '../paint'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion, useParticles, useSquash } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { O } from './materials'
import { leafTex } from './textures'

const bell = new SphereGeometry(0.075, 20, 10, 0, TAU, 0, Math.PI / 2)

/** Le furin, clochette de verre pendue à l'avant-toit, et sa bande de papier qui prend le vent. */
export function Furin() {
  const g = useRef<Group>(null!), swing = useRef<Group>(null!), strip = useRef<Group>(null!), k = useRef(0.2)
  useSquash('furin', g)
  useFrame(({ clock }, delta) => {
    k.current = approach(k.current, isActive(useStore.getState(), 'furin') ? 1 : 0.2, Math.min(delta, 0.05) * 1.5)
    if (reduceMotion) return
    const t = clock.elapsedTime
    swing.current.rotation.z = Math.sin(t * 1.6) * 0.08 * k.current
    swing.current.rotation.x = Math.sin(t * 1.1 + 1) * 0.06 * k.current
    strip.current.rotation.z = Math.sin(t * 2.6) * 0.35 * k.current
    strip.current.rotation.x = Math.sin(t * 1.9) * 0.25 * k.current
  })
  return (
    <group ref={g} userData={{ id: 'furin' }} position={[-2.0, 3.02, 0.95]}>
      <group ref={swing} userData={LIVE}>
        <Part geo={cyl(0.004, 0.004, 0.3, 4)} m={O.ink} p={[0, -0.15, 0]} castShadow={false} />
        <Part geo={bell} m={O.furin} p={[0, -0.32, 0]} />
        <Part geo={SPH} m={O.red} scale={[0.02, 0.012, 0.02]} p={[0, -0.25, 0]} castShadow={false} />
        <Part geo={cyl(0.003, 0.003, 0.14, 4)} m={O.ink} p={[0, -0.39, 0]} castShadow={false} />
        <Part geo={SPH} m={O.furin} scale={0.012} p={[0, -0.38, 0]} castShadow={false} />
        <group ref={strip} userData={LIVE} position={[0, -0.46, 0]}>
          <Part geo={rbox(0.06, 0.2, 0.004, 0.002)} m={O.tanzaku} p={[0, -0.1, 0]} castShadow={false} />
        </group>
      </group>
    </group>
  )
}

/** La lanterne de pierre (tōrō), moussue : sa lumière s'allume le soir et fait luire le bassin. Bascule jour / nuit. */
export function StoneLantern() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), f = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 7) * 0.05 + Math.sin(clock.elapsedTime * 13) * 0.03
    light.current.intensity = e * (1.5 + f) * Math.PI // × π : voir materials.ts
    O.lanternGlow.emissiveIntensity = 0.05 + e * (1.1 + f)
    glow.current.material.opacity = e * 0.75
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[2.78, 0, -0.55]}>
      <Part geo={cyl(0.3, 0.34, 0.14, 6)} m={O.stone[0]} p={[0, 0.07, 0]} />
      <Part geo={cyl(0.1, 0.13, 0.7, 8)} m={O.stone[1]} p={[0, 0.49, 0]} />
      <Part geo={cyl(0.3, 0.22, 0.12, 6)} m={O.stone[0]} p={[0, 0.9, 0]} />
      {/* la chambre du feu, ses fenêtres de papier */}
      <Part geo={cyl(0.19, 0.19, 0.3, 6)} m={O.stone[2]} p={[0, 1.11, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU + Math.PI / 6
        return <Part key={i} geo={rbox(0.15, 0.17, 0.02, 0.01)} m={O.lanternGlow} p={[Math.cos(a) * 0.17, 1.11, Math.sin(a) * 0.17]} rotation-y={-a + Math.PI / 2} castShadow={false} />
      })}
      {/* le toit large aux bords relevés, et son bouton */}
      <Part m={O.stone[1]} p={[0, 1.38, 0]}>
        <coneGeometry args={[0.46, 0.26, 6]} />
      </Part>
      <Part geo={cyl(0.44, 0.46, 0.04, 6)} m={O.stone[1]} p={[0, 1.27, 0]} />
      <Part geo={SPH} m={O.moss} scale={[0.3, 0.06, 0.3]} p={[0.05, 1.36, 0.02]} castShadow={false} />
      <Part geo={SPH} m={O.stone[2]} scale={[0.07, 0.09, 0.07]} p={[0, 1.55, 0]} />
      <pointLight ref={light} color={0xffb35e} intensity={0} distance={6} decay={1.5} position={[0, 1.1, 0.3]} />
      <sprite ref={glow} scale={1.3} position={[0, 1.11, 0.1]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

// Les bouquets de feuilles de l'érable : position, taille, couleur.
const CLUSTERS = (() => {
  const r = seeded(71), out: [number, number, number, number, number][] = []
  for (let i = 0; i < 26; i++) out.push([0.9 + r() * 2.3, 2.3 + r() * 1.4, -3.3 + r() * 1.7, 0.28 + r() * 0.24, (r() * 4) | 0])
  return out
})()

/**
 * L'érable du Japon (momiji) penché au-dessus du bassin, rouge et orange : ses feuilles tombent doucement, un peu plus
 * quand on écoute le jardin (les oiseaux le jour, les grillons la nuit).
 */
export function Maple() {
  const g = useRef<Group>(null!), leaves = useParticles(), since = useRef(0)
  useSquash('maple', g)
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    const every = isActive(useStore.getState(), 'maple') ? 0.6 : 1.6
    if (since.current > every) {
      since.current = 0
      const [x, y, z] = CLUSTERS[(Math.random() * CLUSTERS.length) | 0]
      leaves.emit(leafTex, x + rand(-0.2, 0.2), y - 0.2, z + rand(-0.1, 0.4), { size: 0.13, life: 5.5, vy: -0.42, sway: 0.25, peak: 1 })
    }
  })
  return (
    <>
      <group ref={g} userData={{ id: 'maple' }} position={[2.75, 0, -2.75]}>
        {/* le tronc qui s'incline vers le bassin, deux branches */}
        <Part geo={cyl(0.07, 0.12, 1.5, 10)} m={O.bark} p={[-0.1, 0.72, 0.05]} rotation-z={0.15} />
        <Part geo={cyl(0.05, 0.07, 1.2, 8)} m={O.bark} p={[-0.55, 1.8, 0.25]} rotation={[0.25, 0, 0.75]} />
        <Part geo={cyl(0.04, 0.06, 1.0, 8)} m={O.bark} p={[0.1, 2.0, -0.05]} rotation-z={-0.2} />
        {CLUSTERS.map(([x, y, z, s, m], i) => (
          <Part key={i} geo={SPH} m={O.maple[m]} scale={[s, s * 0.6, s]} p={[x - 2.75, y, z + 2.75]} castShadow={i % 3 === 0} />
        ))}
        <Part geo={SPH} m={O.moss} scale={[0.4, 0.08, 0.35]} p={[0, 0.03, 0]} castShadow={false} />
      </group>
      <group ref={leaves.group} />
    </>
  )
}
