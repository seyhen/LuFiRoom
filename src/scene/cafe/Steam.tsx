import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../../math'
import { reduceMotion, useParticles } from '../anim'
import { puffTex } from '../textures'
import type { V3 } from '../parts'

/** Un filet de vapeur au-dessus d'une tasse de thé chaud. */
export function Steam({ at, every = 0.9 }: { at: V3; every?: number }) {
  const puffs = useParticles(), since = useRef(rand(0, every))
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > every) {
      since.current = 0
      puffs.emit(puffTex, at[0] + rand(-0.01, 0.01), at[1], at[2], { size: 0.07, life: 2.2, vy: 0.13, sway: 0.025, grow: 1.4, peak: 0.32 })
    }
  })
  return <group ref={puffs.group} />
}
