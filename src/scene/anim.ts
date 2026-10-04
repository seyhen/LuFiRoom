import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sprite, SpriteMaterial, type ColorRepresentation, type Group, type Texture } from 'three'
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
  /** Teinte de la texture (la fumée est grise). */
  color?: ColorRepresentation
  /** Vapeur et fumée : fondu doux, la volute tourne lentement et dérive de plus en plus en montant, elle s'étale vite puis se calme. */
  soft?: boolean
}

interface Particle extends Required<Omit<EmitOptions, 'color' | 'soft'>> {
  s: Sprite
  age: number
  phase: number
  x0: number
  soft: boolean
  rot0: number
  spin: number
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
      if (p.soft) {
        // La vapeur monte droit puis se laisse porter ; elle apparaît en fondu (le quart du temps), s'étale vite puis ralentit.
        const rise = Math.min(1, k * 4)
        p.s.position.x = p.x0 + Math.sin(p.phase + p.age * 1.7) * p.sway * (0.4 + k * 1.3)
        p.s.material.opacity = rise * rise * (3 - 2 * rise) * (1 - k) ** 1.6 * 1.6 * p.peak
        p.s.material.rotation = p.rot0 + p.age * p.spin
        p.s.scale.setScalar(p.size * (1 + p.grow * (1 - (1 - k) ** 2)))
      } else {
        p.s.position.x = p.x0 + Math.sin(p.phase + p.age * 2.2) * p.sway
        p.s.material.opacity = Math.sin(Math.PI * k) * p.peak
        p.s.scale.setScalar(p.size * (1 + p.grow * k))
      }
    }
  })
  /** `tex` peut être une liste : chaque particule en tire une au hasard (les volutes ne se répètent pas). */
  const emit = (tex: Texture | Texture[], x: number, y: number, z: number, o: EmitOptions) => {
    const map = Array.isArray(tex) ? tex[(Math.random() * tex.length) | 0] : tex
    const s = new Sprite(new SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0, ...(o.color === undefined ? {} : { color: o.color }) }))
    s.raycast = noRay
    s.position.set(x, y, z)
    s.scale.setScalar(o.size)
    group.current.add(s)
    parts.current.push({ grow: 0, peak: 1, ...o, soft: o.soft === true, rot0: (Math.random() - 0.5) * 0.7, spin: (Math.random() - 0.5) * 0.22, s, age: 0, phase: Math.random() * TAU, x0: x })
  }
  return { group, emit }
}

/**
 * Taille d'un point lumineux (`pointsMaterial`) en unités de la pièce. Avec la caméra orthographique, three ignore
 * `sizeAttenuation` et lit `size` en pixels : on la recalcule à chaque image selon le zoom et la taille de l'écran.
 */
export function useWorldPointSize(mat: RefObject<{ size: number } | null>, world: number) {
  useFrame(({ camera, size, gl }) => {
    const m = mat.current
    const cam = camera as unknown as { top: number; bottom: number; zoom: number }
    if (!m || !cam.top) return
    m.size = world * (size.height / (cam.top - cam.bottom)) * cam.zoom * gl.getPixelRatio()
  })
}
