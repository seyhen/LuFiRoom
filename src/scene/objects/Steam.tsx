import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../../math'
import { reduceMotion, useParticles } from '../anim'
import { wispTexes } from '../textures'
import type { V3 } from '../parts'

/** Un filet de vapeur au-dessus d'une tasse de thé chaud : de fines volutes qui se retournent, tournent et s'effacent en montant. */
export function Steam({ at, every = 0.9 }: { at: V3; every?: number }) {
  const puffs = useParticles(), since = useRef(rand(0, every))
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > every * 0.6) {
      since.current = 0
      puffs.emit(wispTexes, at[0] + rand(-0.012, 0.012), at[1], at[2], { size: 0.14, life: 2.4, vy: 0.14, sway: 0.03, grow: 0.9, peak: 0.5, soft: true })
    }
  })
  return <group ref={puffs.group} />
}
