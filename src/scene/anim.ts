import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sprite, SpriteMaterial, type Group, type Texture } from 'three'
import { useStore } from '../state/store'
import type { ObjectId } from '../rooms/types'
import { TAU, approach } from '../math'
import { noRay } from './parts'

export { reduceMotion } from '../motion'

/** Transitions partagées (0 → 1), avancées par <Lights> avant le reste de la frame. */
export const mood = { night: useStore.getState().night ? 1 : 0, rain: 0 }

/** Objet sous la souris, tenu à jour par la scène. */
export const pointer = { hover: null as ObjectId | null }

/** Rebond quand on touche l'objet, +4 % au survol. `bump(t)` ajoute une pulsation (la radio sur le kick). */
export function useSquash(id: ObjectId, ref: RefObject<Group>, bump?: (t: number) => number) {
  const hover = useRef(0)
  useFrame(({ clock }, delta) => {
    const g = ref.current
    if (!g) return
    hover.current = approach(hover.current, pointer.hover === id ? 1 : 0, Math.min(delta, 0.05) * 6)
    const at = useStore.getState().squashAt[id]
    const a = at === undefined ? Infinity : (performance.now() - at) / 1000
    const sq = a < 1.4 ? Math.sin(a * 17) * Math.exp(-a * 5.5) : 0
    const b = bump ? bump(clock.elapsedTime) : 0
    const h = 1 + hover.current * 0.04
    const xz = (1 + sq * 0.1 - b * 0.4) * h
    g.scale.set(xz, (1 - sq * 0.16 + b) * h, xz)
  })
}

export interface EmitOptions {
  size: number
  life: number
  /** Vitesse de montée. */
  vy: number
  /** Balancement horizontal. */
  sway: number
  grow?: number
  /** Opacité maximale. */
  peak?: number
}

interface Particle extends Required<EmitOptions> {
  s: Sprite
  age: number
  phase: number
  x0: number
}

/** Petits sprites qui montent en se balançant (notes, cœurs, vapeur). Le groupe va à la racine de la pièce. */
export function useParticles() {
  const group = useRef<Group>(null!)
  const parts = useRef<Particle[]>([])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), list = parts.current
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i]
      p.age += dt
      const k = p.age / p.life
      if (k >= 1) {
        group.current.remove(p.s)
        p.s.material.dispose()
        list.splice(i, 1)
        continue
      }
      p.s.position.y += p.vy * dt
      p.s.position.x = p.x0 + Math.sin(p.phase + p.age * 2.2) * p.sway
      p.s.material.opacity = Math.sin(Math.PI * k) * p.peak
      p.s.scale.setScalar(p.size * (1 + p.grow * k))
    }
  })
  const emit = (tex: Texture, x: number, y: number, z: number, o: EmitOptions) => {
    const s = new Sprite(new SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }))
    s.raycast = noRay
    s.position.set(x, y, z)
    s.scale.setScalar(o.size)
    group.current.add(s)
    parts.current.push({ grow: 0, peak: 1, ...o, s, age: 0, phase: Math.random() * TAU, x0: x })
  }
  return { group, emit }
}
