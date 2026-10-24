import { useMemo } from 'react'
import type { Material } from 'three'
import { seeded } from '../paint'
import { Part, cyl, orient, type V3 } from '../parts'
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
  // Chaque tige est un chemin souple : elle s'écarte du pot et ondule en tombant, au lieu de pendre droite comme une baguette.
  const { stems, leaves } = useMemo(() => {
    const r = seeded(seed * 97 + 13)
    const stems: { p: V3; rot: V3; len: number }[] = []
    const leaves: { p: V3; ry: number; tilt: number; s: number; k: number }[] = []
    strands.forEach(([x, z, len], si) => {
      const at = (f: number): V3 => [x * (1 + f * 0.9) + Math.sin(f * 3.4 + si * 1.7) * 0.05 * f, -f * len, z * (1 + f * 0.5) + Math.cos(f * 2.7 + si) * 0.04 * f]
      const segs = Math.max(3, Math.round(len / 0.1))
      for (let i = 0; i < segs; i++) {
        const a = at(i / segs), b = at((i + 1) / segs), d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
        stems.push({ p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: orient(d), len: Math.hypot(...d) })
      }
      // une feuille tous les ~0,55 de sa longueur, un côté puis l'autre, un peu plus grandes au pot, qui s'affaissent vers le bout
      const n = Math.max(4, Math.round(len / (size * 0.38)))
      for (let i = 0; i < n; i++) {
        const f = (i + 0.4) / n, side = i % 2 ? 1 : -1
        leaves.push({ p: at(f), ry: Math.atan2(x, z) + side * (0.8 + r() * 0.7), tilt: 0.45 + f * 0.5 + r() * 0.35, s: (1 - f * 0.4) * (0.8 + r() * 0.4), k: (i + si) % 3 })
      }
    })
    for (let i = 0; i < crown; i++) leaves.push({ p: [Math.cos(i * 2.4) * 0.06 * (0.4 + (i % 3) * 0.3), 0.02 + (i % 4) * 0.015, Math.sin(i * 2.4) * 0.06 * (0.4 + (i % 3) * 0.3)], ry: i * 2.4, tilt: -0.3 - r() * 0.45, s: 1.0 + r() * 0.35, k: i % 3 })
    return { stems, leaves }
  }, [strands, size, crown, seed])
  return (
    <group position={p}>
      {stems.map((t, i) => (
        <Part key={i} geo={cyl(0.004, 0.004, 1, 4)} m={m2} scale={[1, t.len, 1]} p={t.p} rotation={t.rot} castShadow={false} />
      ))}
      {leaves.map((l, i) => (
        <group key={i} position={l.p} rotation-y={l.ry}>
          <Leaf kind="heart" r={[l.tilt, 0, 0]} w={size * 0.42 * l.s} l={size * l.s} m={l.k ? m : m2} />
        </group>
      ))}
    </group>
  )
}
