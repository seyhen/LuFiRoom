import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { B } from './materials'

/** Les cinq phases de la lune pendues à l'étagère : elles brillent la nuit et se balancent quand le ventilo souffle. */
export function MoonGarland() {
  const m = useRef<Mesh>(null!), sway = useRef(0)
  useFrame(({ clock }, delta) => {
    B.moons.emissiveIntensity = smooth(mood.night) * 0.75
    const target = !reduceMotion && isActive(useStore.getState(), 'fan') ? 1 : 0
    sway.current += (target - sway.current) * Math.min(1, Math.min(delta, 0.05) * 1.5)
    m.current.rotation.z = sway.current * Math.sin(clock.elapsedTime * 1.8) * 0.08
  })
  return (
    <group position={[-2.1, 2.25, -2.9]}>
      <mesh ref={m} position={[0, -0.6, 0]} material={B.moons}>
        <planeGeometry args={[0.3, 1.2]} />
      </mesh>
    </group>
  )
}
