import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { reduceMotion, useParticles } from '../anim'
import { useEvery } from '../life'
import { wispTexes } from '../textures'

/** Où se trouve la buse vapeur de la machine à expresso (au bout du comptoir, contre le mur du fond). */
const WAND = [-1.82, 1.5, -2.38] as const

/**
 * Quand la machine à expresso est allumée, elle crache de temps en temps (toutes les 10 à 22 s) un jet de vapeur : huit volutes en
 * une seconde et demie, le bruit de la machine qui monte en pression. Éteinte, rien.
 */
export function EspressoPuff() {
  const puffs = useParticles(), burst = useRef(0), gap = useRef(0)
  useEvery(10, 22, () => (burst.current = 8), () => isActive(useStore.getState(), 'espresso'), 3)
  useFrame((_, delta) => {
    if (reduceMotion || burst.current <= 0) return
    gap.current -= Math.min(delta, 0.05)
    if (gap.current > 0) return
    gap.current = 0.18
    burst.current--
    puffs.emit(wispTexes, WAND[0] + rand(-0.02, 0.02), WAND[1], WAND[2] + rand(-0.02, 0.02), { size: 0.26, life: 2.4, vy: 0.26, sway: 0.05, grow: 1.1, peak: 0.6, soft: true })
  })
  return <group ref={puffs.group} />
}
