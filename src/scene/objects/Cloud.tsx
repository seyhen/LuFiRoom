import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { smooth } from '../../math'
import { COL, M } from '../materials'
import { SPH } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'

// Boules du nuage : x, y, z, rayon.
const PUFFS = [[0, 0, 0, 0.62], [-0.62, -0.12, 0.05, 0.45], [0.65, -0.1, 0, 0.5], [0.25, 0.32, -0.05, 0.48], [-0.3, 0.25, 0.1, 0.4], [1.05, -0.22, 0.05, 0.32], [-1.0, -0.25, 0, 0.3]]

/** Nuage dehors, au-dessus de la fenêtre : fonce et frémit quand il pleut. */
export function Cloud() {
  const g = useRef<Group>(null!)
  useSquash('cloud', g)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, raining = isActive(useStore.getState(), 'cloud')
    g.current.position.y = 4.95 + (reduceMotion ? 0 : Math.sin(t * 0.9) * 0.08)
    g.current.position.x = 1.3 + (raining ? Math.sin(t * 13) * 0.012 : 0)
    M.cloud.color.copy(COL.cloudDay).lerp(COL.cloudRain, smooth(mood.rain))
  })
  return (
    <group ref={g} userData={{ id: 'cloud' }} position={[1.3, 4.95, -3.85]}>
      {PUFFS.map(([x, y, z, r], i) => (
        <mesh key={i} geometry={SPH} material={M.cloud} scale={[r, r * 0.86, r]} position={[x, y, z]} />
      ))}
    </group>
  )
}
