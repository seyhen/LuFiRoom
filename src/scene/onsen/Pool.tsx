import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { rand } from '../../math'
import { seeded } from '../paint'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useParticles } from '../anim'
import { wispTex } from '../textures'
import { LIVE } from '../Static'
import { O } from './materials'
import { leafTex } from './textures'

/** Le bassin : une ellipse de centre (CX, CZ). */
export const POOL = { cx: 0.75, cz: -0.75, rx: 1.55, rz: 1.3, y: 0.05 }

// Les rochers qui bordent le bassin : angle, taille, matériau, moussu ou non. Plus gros au fond.
const ROCKS = (() => {
  const r = seeded(44), out: { a: number; s: number; m: number; moss: boolean; h: number }[] = []
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + (r() - 0.5) * 0.15, back = Math.sin(a) < 0 ? 1 : 0
    out.push({ a, s: 0.24 + r() * 0.14 + back * 0.12, m: (r() * 3) | 0, moss: r() < 0.45, h: 0.55 + r() * 0.35 + back * 0.4 })
  }
  return out
})()

/** La vapeur qui monte du bassin, et des feuilles d'érable qui flottent en tournant doucement. */
function SteamAndLeaves() {
  const steam = useParticles(), since = useRef(0), floats = useRef<Group[]>([])
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime
    since.current += dt
    if (!reduceMotion && since.current > 0.2) {
      since.current = 0
      const a = rand(0, Math.PI * 2), k = Math.sqrt(Math.random())
      steam.emit(wispTex, POOL.cx + Math.cos(a) * POOL.rx * 0.8 * k, POOL.y + 0.1, POOL.cz + Math.sin(a) * POOL.rz * 0.8 * k, { size: 0.7, life: 5, vy: 0.24, sway: 0.2, grow: 1.6, peak: 0.55 })
    }
    if (!reduceMotion) floats.current.forEach((f, i) => { f.rotation.y = t * 0.1 * (i % 2 ? 1 : -1) + i; f.position.y = POOL.y + 0.012 + Math.sin(t * 1.3 + i) * 0.006 })
  })
  return (
    <>
      <group ref={steam.group} />
      {[[0.2, -0.3], [1.5, -1.3], [0.9, 0.2], [-0.1, -1.4]].map(([x, z], i) => (
        <group key={i} ref={(el) => void (el && (floats.current[i] = el))} userData={LIVE} position={[x, POOL.y + 0.012, z]}>
          <mesh rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.16, 0.16]} />
            <meshBasicMaterial map={leafTex} transparent alphaTest={0.4} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** Le bassin d'eau chaude, laiteuse et turquoise, cerné de rochers moussus ; un plateau de saké qui flotte. */
export function Pool() {
  const ripples = useRef<Mesh>(null!)
  useFrame((_, delta) => {
    if (reduceMotion) return
    const map = O.ripples.map!
    map.offset.x = (map.offset.x + Math.min(delta, 0.05) * 0.012) % 1
    map.offset.y = (map.offset.y + Math.min(delta, 0.05) * 0.008) % 1
  })
  const { cx, cz, rx, rz, y } = POOL
  return (
    <>
      <mesh material={O.water} position={[cx, y, cz]} rotation-x={-Math.PI / 2} scale={[rx, rz, 1]} receiveShadow>
        <circleGeometry args={[1, 40]} />
      </mesh>
      <mesh ref={ripples} userData={LIVE} material={O.ripples} position={[cx, y + 0.004, cz]} rotation-x={-Math.PI / 2} scale={[rx, rz, 1]} raycast={noRay}>
        <circleGeometry args={[0.97, 40]} />
      </mesh>
      {ROCKS.map(({ a, s, m, moss, h }, i) => {
        const px = cx + Math.cos(a) * (rx + 0.05), pz = cz + Math.sin(a) * (rz + 0.05)
        return (
          <group key={i} position={[px, 0, pz]} rotation-y={-a}>
            <Part geo={SPH} m={O.stone[m]} scale={[s, s * h, s * 0.85]} p={[0, s * h * 0.35, 0]} />
            {moss && <Part geo={SPH} m={O.moss} scale={[s * 0.75, s * h * 0.3, s * 0.65]} p={[0.02, s * h * 0.95, 0]} castShadow={false} />}
          </group>
        )
      })}
      {/* le plateau de saké qui flotte : un flacon, deux coupelles */}
      <group position={[1.0, y + 0.02, -0.45]} rotation-y={0.4}>
        <Part geo={rbox(0.38, 0.04, 0.28, 0.015)} m={O.hinoki} />
        <Part geo={cyl(0.035, 0.05, 0.16, 14)} m={O.ceramic} p={[-0.08, 0.1, 0]} />
        <Part geo={cyl(0.015, 0.025, 0.05, 10)} m={O.ceramic} p={[-0.08, 0.2, 0]} castShadow={false} />
        {[[0.06, -0.06], [0.11, 0.06]].map(([x, z], i) => (
          <Part key={i} geo={cyl(0.035, 0.02, 0.03, 14)} m={O.celadon} p={[x, 0.035, z]} castShadow={false} />
        ))}
      </group>
      <SteamAndLeaves />
    </>
  )
}
