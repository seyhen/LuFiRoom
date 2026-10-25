import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { reduceMotion, useParticles } from '../anim'
import { useEvery } from '../life'
import { mistTex } from '../textures'

/** La buse vapeur de la machine à expresso (voir `Counter.tsx` : la machine est en (-1.85, 1.08, -2.62), la buse sur sa droite). */
const WAND = [-1.48, 1.2, -2.4] as const

/**
 * Quand la machine à expresso est allumée, de loin en loin (toutes les demi-minutes à la minute), on fait mousser un lait : la buse
 * crache un jet de vapeur plus franc qu'à l'ordinaire, une dizaine de nuages en une seconde et demie, qui montent vite puis s'étalent.
 * Le filet de vapeur continu de la buse reste celui de `Counter`. Éteinte, rien.
 */
export function EspressoPuff() {
  const puffs = useParticles(), burst = useRef(0), gap = useRef(0)
  useEvery(30, 60, () => (burst.current = 11), () => isActive(useStore.getState(), 'espresso'))
  useFrame((_, delta) => {
    if (reduceMotion || burst.current <= 0) return
    gap.current -= Math.min(delta, 0.05)
    if (gap.current > 0) return
    gap.current = 0.14
    // Le jet part plus fort au début et faiblit à la fin.
    const k = burst.current / 11
    burst.current--
    puffs.emit(mistTex, WAND[0] + rand(-0.02, 0.02), WAND[1] + 0.02, WAND[2] + rand(-0.02, 0.02), {
      size: 0.15 + k * 0.06, life: 1.9, vy: 0.4 + k * 0.35, sway: 0.06, grow: 1.9, peak: 0.45 + k * 0.2, soft: true,
    })
  })
  return <group ref={puffs.group} />
}
