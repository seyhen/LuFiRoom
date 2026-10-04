import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { useParticles, useSquash } from '../anim'
import { noteTexA, noteTexB } from '../textures'
import type { V3 } from '../parts'

/**
 * Ce que partagent les objets qui jouent la musique de la pièce (le son « radio ») : un rebond à chaque kick et des notes qui
 * s'envolent. `rise` : hauteur d'où partent les notes. `onFrame(on, t, pulse)` : `pulse` vaut 1 au kick puis retombe vers 0.
 * Le composant pose `g` sur son groupe (avec `userData={{ id: 'radio' }}`) et `notes.group` à la racine de la pièce.
 */
export function useBeat(position: V3, rise: number, onFrame?: (on: boolean, t: number, pulse: number) => void, bump = 0.04) {
  const [px, py, pz] = position
  const g = useRef<Group>(null!)
  const notes = useParticles()
  const beat = useRef({ seen: useStore.getState().kicks, at: -10, flip: false })
  useFrame(({ clock }) => {
    const s = useStore.getState(), on = isActive(s, 'radio'), t = clock.elapsedTime, b = beat.current
    if (s.kicks !== b.seen) {
      b.seen = s.kicks
      b.at = t
      if (on) {
        b.flip = !b.flip
        notes.emit(b.flip ? noteTexA : noteTexB, px + rand(-0.3, 0.3), py + rise, pz + rand(-0.1, 0.25), { size: 0.26, life: 2.6, vy: 0.55, sway: 0.12 })
      }
    }
    onFrame?.(on, t, Math.exp(-(t - b.at) * 9))
  })
  useSquash('radio', g, (t) => (isActive(useStore.getState(), 'radio') ? Math.exp(-(t - beat.current.at) * 9) * bump : 0))
  return { g, notes }
}
