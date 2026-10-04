import { useMemo } from 'react'
import type { Material } from 'three'
import { seeded } from '../paint'
import { Part, cyl, type V3 } from '../parts'
import { Leaf } from './Leaf'

interface VinesProps {
  /** Le bord du pot, d'où partent les tiges. */
  p: V3
  /** Les tiges : [x, z, longueur] depuis le bord du pot ; elles retombent vers -y. */
  strands: [number, number, number][]
  m: Material
  m2?: Material
  /** Longueur d'une feuille. */
  size?: number
  /** Une couronne de feuilles qui déborde du pot. */
  crown?: number
  seed?: number
}

/**
 * Une plante retombante (pothos, lierre, philodendron) : des tiges qui pendent du pot, garnies de feuilles en cœur qui
 * alternent de part et d'autre et s'écartent un peu du mur, plus une couronne qui déborde. Les feuilles rapetissent vers le bout.
 */
export function Vines({ p, strands, m, m2 = m, size = 0.08, crown = 6, seed = 1 }: VinesProps) {
  const leaves = useMemo(() => {
    const r = seeded(seed * 97 + 13), out: { p: V3; ry: number; tilt: number; s: number; k: number }[] = []
    strands.forEach(([x, z, len], si) => {
      const n = Math.max(2, Math.round(len / (size * 0.7)))
      for (let i = 0; i < n; i++) {
        const f = i / n, side = i % 2 ? 1 : -1
        out.push({ p: [x + Math.sin(f * 4 + si) * 0.03, -f * len, z + Math.cos(f * 3 + si) * 0.02], ry: Math.atan2(x, z) + side * (0.9 + r() * 0.5), tilt: 0.5 + r() * 0.5, s: 1 - f * 0.4, k: (i + si) % 3 })
      }
    })
    for (let i = 0; i < crown; i++) out.push({ p: [Math.cos(i * 2.4) * 0.04, 0.02, Math.sin(i * 2.4) * 0.04], ry: i * 2.4, tilt: -0.35 - r() * 0.3, s: 1.1, k: i % 3 })
    return out
  }, [strands, size, crown, seed])
  return (
    <group position={p}>
      {strands.map(([x, z, len], i) => (
        <Part key={i} geo={cyl(0.004, 0.005, len, 4)} m={m2} p={[x, -len / 2, z]} castShadow={false} />
      ))}
      {leaves.map((l, i) => (
        <group key={i} position={l.p} rotation-y={l.ry}>
          <Leaf kind="heart" r={[l.tilt, 0, 0]} w={size * 0.42 * l.s} l={size * l.s} m={l.k ? m : m2} />
        </group>
      ))}
    </group>
  )
}
