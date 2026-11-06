import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Sprite } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { noRay } from '../parts'
import { glowTex } from '../textures'

/** Un halo chaud de lanterne, qui monte avec la nuit (et un peu avec la pluie : il fait sombre, la lanterne est allumée). */
export function GlowSprite({ scale = 1, y = 0, k = 1 }: { scale?: number; y?: number; k?: number }) {
  const ref = useRef<Sprite>(null!)
  useFrame(() => {
    ref.current.material.opacity = k * (0.15 + smooth(mood.night) * 0.75 + mood.rain * 0.1)
  })
  return (
    <sprite ref={ref} scale={scale} position={[0, y, 0.06]} raycast={noRay}>
      <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
    </sprite>
  )
}
