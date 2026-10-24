import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand } from '../../math'
import { M, gummy } from '../materials'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { Static } from '../Static'
import { mistTex } from '../textures'
import { B } from './materials'

/** Le diffuseur d'huiles : son pied, posé sur le tabouret du coin lecture (voir ReadingNook). */
export const DIFFUSER = { x: 2.72, y: 0.525, z: 0.42 }
const led = gummy(0xffd0e8, { emissive: 0xff9ccd, emissiveIntensity: 0.1 })

/**
 * Le diffuseur d'huiles essentielles : un pot de céramique lilas, un couvercle menthe percé, un anneau de lumière rose à sa base.
 * Quand le son joue, l'anneau s'éclaire et une colonne de brume douce monte du couvercle, s'étale et se dissout. Il prend la place
 * des livres sur le tabouret : la bougie reste sur le bord, à un pas.
 */
export function Diffuser() {
  const g = useRef<Group>(null!), mist = useParticles(), st = useRef({ k: 0, since: 0 })
  useSquash('mist', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'mist')
    s.k = approach(s.k, on ? 1 : 0, dt * 0.9)
    led.emissiveIntensity = 0.1 + s.k * 0.9
    if (!on || reduceMotion) return
    s.since += dt
    if (s.since > 0.3) {
      s.since = 0
      mist.emit(mistTex, rand(-0.015, 0.015), 0.4, rand(-0.012, 0.012), { size: 0.28, life: 4.2, vy: 0.2, sway: 0.06, grow: 2.2, peak: 1, soft: true })
    }
  })
  return (
    <group ref={g} userData={{ id: 'mist' }} position={[DIFFUSER.x, DIFFUSER.y, DIFFUSER.z]}>
      <group scale={1.45}>
      <Static>
        <Part geo={cyl(0.09, 0.095, 0.02, 24)} m={B.birch} p={[0, 0.01, 0]} />
        <Part geo={SPH} m={B.lilac} scale={[0.125, 0.105, 0.125]} p={[0, 0.11, 0]} />
        <Part geo={cyl(0.07, 0.1, 0.05, 24)} m={B.mintSoft} p={[0, 0.215, 0]} />
        <Part geo={cyl(0.034, 0.034, 0.006, 16)} m={M.plum} p={[0, 0.2405, 0]} castShadow={false} />
        <Part geo={SPH} m={B.blush} scale={0.022} p={[0.115, 0.14, 0.04]} castShadow={false} />
      </Static>
      {/* l'anneau de lumière douce, autour du pot */}
      <Part m={led} p={[0, 0.045, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.1, 0.012, 8, 28]} />
      </Part>
      </group>
      {/* la brume monte du couvercle, dans le repère du pot */}
      <group ref={mist.group} />
    </group>
  )
}
