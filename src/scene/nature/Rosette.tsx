import type { Material } from 'three'
import type { V3 } from '../parts'
import { Leaf } from './Leaf'
import type { LeafKind } from './shapes'

interface RosetteProps {
  p: V3
  /** Longueur des plus grandes feuilles. */
  size?: number
  n?: number
  /** `lance` pour un aloès (feuilles pointues qui montent), `round` pour une échévéria (feuilles charnues en étoile). */
  kind?: LeafKind
  /** Redressement des feuilles du cœur (rad au-dessus de l'horizontale) ; celles du tour s'ouvrent davantage. */
  rise?: number
  m: Material
  m2?: Material
}

/**
 * Une plante en rosette (aloès, échévéria, agave) : des feuilles charnues disposées en spirale (l'angle d'or), les plus
 * jeunes au cœur, petites et dressées, les plus vieilles au tour, grandes et ouvertes.
 */
export function Rosette({ p, size = 0.18, n = 12, kind = 'lance', rise = 1.1, m, m2 = m }: RosetteProps) {
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => {
        const age = 1 - i / n, l = size * (0.45 + 0.55 * age)
        return (
          <group key={i} rotation-y={i * 2.39996}>
            <Leaf kind={kind} r={[-(rise - age * 0.75), 0, 0]} w={l * (kind === 'round' ? 0.42 : 0.2)} l={l} m={i % 3 ? m : m2} />
          </group>
        )
      })}
    </group>
  )
}
