import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { B } from './materials'

/**
 * Une mouette posée sur le poteau de la terrasse. Elle regarde autour d'elle ; quand on écoute les mouettes, elle lève la
 * tête et ouvre le bec pour crier, et s'ébroue des ailes de temps en temps.
 */
export function Gull() {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), beak = useRef<Group>(null!), wings = useRef<Group[]>([])
  const call = useRef(0)
  useSquash('gull', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, on = isActive(useStore.getState(), 'gull')
    // cri : une fois toutes les ~4 s quand elle est « allumée »
    const phase = (t % 4.3) / 4.3, crying = on && phase < 0.18
    call.current = approach(call.current, crying ? 1 : 0, Math.min(delta, 0.05) * 10)
    const k = call.current
    if (!reduceMotion) head.current.rotation.y = Math.sin(t * 0.7) * 0.6 * (1 - k) + Math.sin(t * 2.3) * 0.08
    head.current.rotation.z = k * 0.55
    beak.current.rotation.z = -k * 0.35
    const flap = on && !reduceMotion && (t % 9) < 0.6 ? Math.sin(t * 30) * 0.5 + 0.6 : 0
    wings.current.forEach((w, i) => (w.rotation.x = (i ? -1 : 1) * flap))
  })
  return (
    <group ref={g} userData={{ id: 'gull' }} position={[-0.25, 0.86, -3.6]} rotation-y={-0.5}>
      {/* pattes */}
      {[-0.04, 0.04].map((z) => (
        <Part key={z} geo={cyl(0.008, 0.008, 0.08, 5)} m={B.beak} p={[0, 0.04, z]} castShadow={false} />
      ))}
      {/* corps blanc, dos et ailes gris, bout des ailes noir */}
      <Part geo={SPH} m={B.gull} scale={[0.17, 0.1, 0.1]} p={[0, 0.15, 0]} rotation-z={0.15} />
      {[1, -1].map((s, i) => (
        <group key={s} ref={(el) => void (el && (wings.current[i] = el))} position={[-0.01, 0.19, s * 0.07]}>
          <Part geo={SPH} m={B.gullGrey} scale={[0.15, 0.04, 0.05]} p={[-0.04, 0, 0]} rotation-z={0.2} />
          <Part geo={SPH} m={B.ink} scale={[0.06, 0.025, 0.035]} p={[-0.18, -0.02, 0]} rotation-z={0.35} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={B.gull} scale={[0.07, 0.03, 0.05]} p={[-0.18, 0.15, 0]} rotation-z={0.3} castShadow={false} />
      <group ref={head} position={[0.13, 0.26, 0]}>
        <Part geo={SPH} m={B.gull} scale={0.075} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={B.ink} scale={0.012} p={[0.03, 0.02, s * 0.055]} castShadow={false} />
        ))}
        <group ref={beak} position={[0.06, -0.01, 0]}>
          <Part m={B.beak} p={[0.05, 0.005, 0]} rotation-z={-Math.PI / 2} castShadow={false}>
            <coneGeometry args={[0.02, 0.1, 10]} />
          </Part>
        </group>
        <Part m={B.beak} p={[0.1, -0.02, 0]} rotation-z={-Math.PI / 2 - 0.1} castShadow={false}>
          <coneGeometry args={[0.014, 0.08, 10]} />
        </Part>
      </group>
    </group>
  )
}
