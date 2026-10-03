import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { B } from './materials'

// Cinq tubes et un coquillage au bout de chaque fil : [x, longueur].
const TUBES = [[-0.16, 0.42], [-0.08, 0.52], [0, 0.6], [0.08, 0.5], [0.16, 0.4]] as const

/** Carillon de bois flotté et de tubes, pendu au linteau de la grande porte : il se balance dans la brise et tinte. */
export function WindChimes() {
  const g = useRef<Group>(null!), tubes = useRef<Group[]>([]), gust = useRef(0)
  useSquash('chimes', g)
  useFrame(({ clock }, delta) => {
    gust.current = approach(gust.current, isActive(useStore.getState(), 'chimes') ? 1 : 0.15, Math.min(delta, 0.05) * 1.5)
    if (reduceMotion) return
    const t = clock.elapsedTime, k = gust.current
    tubes.current.forEach((tube, i) => {
      tube.rotation.z = Math.sin(t * (2.1 + i * 0.37) + i) * 0.16 * k
      tube.rotation.x = Math.sin(t * (1.7 + i * 0.29) + i * 2) * 0.12 * k
    })
    g.current.rotation.z = Math.sin(t * 0.8) * 0.04 * k
  })
  return (
    <group position={[1.85, 3.52, -2.95]}>
      <Part geo={cyl(0.006, 0.006, 0.18, 4)} m={B.rope} p={[0, -0.09, 0]} castShadow={false} />
      <group ref={g} userData={{ id: 'chimes' }} position={[0, -0.18, 0]}>
        <Part geo={cyl(0.03, 0.03, 0.46, 10)} m={B.driftwood} rotation-z={Math.PI / 2} />
        {TUBES.map(([x, len], i) => (
          <group key={x} ref={(el) => void (el && (tubes.current[i] = el))} position={[x, -0.02, 0]}>
            <Part geo={cyl(0.003, 0.003, 0.12, 4)} m={B.rope} p={[0, -0.06, 0]} castShadow={false} />
            <Part geo={cyl(0.017, 0.017, len, 10)} m={i % 2 ? B.seaglass : B.shell} p={[0, -0.12 - len / 2, 0]} />
            <Part geo={SPH} m={B.shellPink} scale={[0.025, 0.035, 0.012]} p={[0, -0.16 - len, 0]} castShadow={false} />
          </group>
        ))}
      </group>
    </group>
  )
}
