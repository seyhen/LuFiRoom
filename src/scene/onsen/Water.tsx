import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { LIVE } from '../Static'
import { O } from './materials'
import { POOL } from './Pool'
import { Rock } from '../nature/Rock'

const SPOUT = { x: 1.15, y: 1.0, z: -2.25 }

/** Le bec de bambou (kakehi) qui verse l'eau chaude de la source dans le bassin ; le filet grossit quand on l'écoute. */
export function Spout() {
  const g = useRef<Group>(null!), stream = useRef<Mesh>(null!), flow = useRef(0)
  useSquash('spring', g)
  useFrame(({ clock }, delta) => {
    flow.current = approach(flow.current, isActive(useStore.getState(), 'spring') ? 1 : 0.35, Math.min(delta, 0.05) * 2)
    const k = flow.current, w = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 23) * 0.12
    stream.current.scale.set(k * (1 + w), 1, k * (1 - w))
  })
  const len = SPOUT.y - POOL.y
  return (
    <group ref={g} userData={{ id: 'spring' }} position={[SPOUT.x, 0, SPOUT.z]}>
      {/* deux bambous croisés portent le bec */}
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.03, 0.03, 1.15, 8)} m={O.bambooDry} p={[s * 0.12, 0.55, -0.35]} rotation-z={s * 0.3} />
      ))}
      <Part geo={rbox(0.06, 0.06, 0.06, 0.02)} m={O.rope} p={[0, 1.02, -0.35]} castShadow={false} />
      <group position={[0, SPOUT.y + 0.05, -0.45]} rotation-x={-0.2}>
        <Part geo={cyl(0.05, 0.05, 1.0, 12)} m={O.bamboo} p={[0, 0, 0.4]} rotation-x={Math.PI / 2} />
        {[0.1, 0.55].map((z) => (
          <Part key={z} geo={cyl(0.056, 0.056, 0.03, 12)} m={O.bambooDry} p={[0, 0, z]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
      </group>
      {/* le filet d'eau, et l'éclaboussure en bas */}
      <mesh ref={stream} userData={LIVE} geometry={cyl(0.025, 0.035, len, 10)} material={O.stream} position={[0, POOL.y + len / 2, 0.02]} raycast={noRay} />
      <Part geo={SPH} m={O.stream} scale={[0.12, 0.03, 0.12]} p={[0, POOL.y + 0.01, 0.02]} castShadow={false} />
      {/* la pierre sous le bec */}
      <Rock v={2} p={[0, 0, -0.38]} s={[0.34, 0.34, 0.28]} ry={0.6} m={O.stone[1]} moss={O.moss} />
    </group>
  )
}
