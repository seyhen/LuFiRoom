import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Sprite } from 'three'
import { smooth } from '../../math'
import { noRay } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'

/**
 * La nuit, les lumières d'une gare ou d'un village traversent le compartiment : une tache dorée qui glisse sur la paroi
 * et le plancher, de la fenêtre vers le fond, toutes les quelques secondes.
 */
export function PassingLights() {
  const a = useRef<Sprite>(null!), b = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const n = smooth(mood.night), t = clock.elapsedTime
    for (const [s, period, off] of [[a.current, 7, 0], [b.current, 11, 3.5]] as const) {
      const k = ((t + off) % period) / 2.2
      const on = !reduceMotion && k < 1
      s.visible = n > 0.05 && on
      if (!on) continue
      s.position.set(-2.9, 1.6 - k * 0.6, -2.6 + k * 5.2)
      s.material.opacity = n * Math.sin(k * Math.PI) * 0.55
    }
  })
  return (
    <group userData={LIVE}>
      {[a, b].map((r, i) => (
        <sprite key={i} ref={r} scale={[1.4, 2.2, 1]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xffd38a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  )
}
