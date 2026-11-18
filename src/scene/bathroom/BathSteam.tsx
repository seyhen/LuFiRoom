import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../../math'
import { useStore } from '../../state/store'
import { reduceMotion, useParticles } from '../anim'
import { mistTex } from '../textures'
import type { SoundId } from '../../rooms/types'
import type { V3 } from '../parts'

/**
 * De la vapeur douce qui monte d'un point (le bain, le bac de douche) : un nuage de brume (`mistTex`) toutes les `every` secondes,
 * deux fois plus souvent tant que l'un des sons `hot` joue (l'eau chaude coule) ; avec `only`, rien tant qu'aucun de ces sons ne joue. Chaque nuage est un sprite, donc un tracé : on les espace.
 */
export function BathSteam({ at, every = 1.8, hot = [], only, size = 0.5, spread = 0.25 }: { at: V3; every?: number; hot?: SoundId[]; only?: SoundId[]; size?: number; spread?: number }) {
  const puffs = useParticles(), since = useRef(rand(0, every))
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    const s = useStore.getState(), warm = hot.some((id) => s.on[id])
    if (only && !only.some((id) => s.on[id])) return
    if (since.current > (warm ? every * 0.5 : every)) {
      since.current = 0
      puffs.emit(mistTex, at[0] + rand(-spread, spread), at[1], at[2] + rand(-spread, spread), { size: size * (warm ? 1.25 : 1), life: 3.2, vy: 0.16, sway: 0.06, grow: 1.1, peak: warm ? 0.5 : 0.32, soft: true })
    }
  })
  return <group ref={puffs.group} />
}
