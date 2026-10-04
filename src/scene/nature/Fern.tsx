import type { Material } from 'three'
import { TAU } from '../../math'
import type { V3 } from '../parts'
import { Leaf } from './Leaf'

interface FernProps {
  p: V3
  /** Longueur des frondes. */
  size?: number
  n?: number
  m: Material
  /** Second matériau, une fronde sur deux (jeunes frondes plus claires). */
  m2?: Material
  ry?: number
}

/** Une fougère : des frondes pennées qui jaillissent du centre et retombent en arc, à des hauteurs et longueurs variées. */
export function Fern({ p, size = 0.4, n = 7, m, m2 = m, ry = 0 }: FernProps) {
  return (
    <group position={p} rotation-y={ry}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * TAU + (i % 2) * 0.3, l = size * (0.75 + ((i * 7) % 5) * 0.08)
        return (
          <group key={i} rotation-y={a}>
            <Leaf kind="pinnate" r={[-0.95 - (i % 3) * 0.18, 0, 0]} w={l * 0.22} l={l} m={i % 2 ? m2 : m} p={[0, 0.02, 0]} />
          </group>
        )
      })}
    </group>
  )
}
