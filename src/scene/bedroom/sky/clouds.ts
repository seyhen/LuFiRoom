import { seeded } from '../../paint'
import type { Item } from '../../parts'
import type { V3 } from '../../parts'
import { S, SLAB } from './layout'

// Les nuages : des paquets de boules aplaties, tous dans un seul `Batch`. Teintes par copie : le dessus crème, le côté rosé,
// le dessous lilas (le matériau, lui, change avec le jour, la nuit et la pluie).
const TOP = 0xf3edf8, SIDE = 0xf0e0ec, UNDER = 0xded2f2, DEEP = 0xcfc0ec

/** Un tas de boules autour de `c` : `n` boules sur une demi-ellipse, plus grosses au milieu. */
function heap(out: Item[], r: () => number, c: V3, w: number, h: number, n: number, size: number, flat = 0.8) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1), x = (t - 0.5) * 2 * w, mid = 1 - Math.abs(t - 0.5) * 1.5
    const s = size * (0.55 + 0.6 * mid) * (0.85 + 0.3 * r())
    const y = h * mid * (0.6 + 0.5 * r()) - s * 0.2
    // l'axe de la rangée est horizontal, dans le plan de l'écran : on le tourne avec la caméra (RX)
    out.push({ p: [c[0] + x * 0.7071, c[1] + y, c[2] - x * 0.7071 + (r() - 0.5) * 0.5], s: [s, s * flat, s], c: y > h * 0.5 ? TOP : i % 2 ? SIDE : TOP })
  }
  // un ventre plus sombre et plat dessous
  out.push({ p: [c[0], c[1] - size * 0.28, c[2]], s: [w * 0.95, size * 0.45, w * 0.55], r: [0, Math.PI / 4, 0], c: UNDER })
}

/** Le banc de nuages sur lequel la chambre flotte, ses bancs latéraux, et les petits nuages au loin. */
export function cloudItems(): Item[] {
  const r = seeded(31), out: Item[] = []
  const half = SLAB.h + 0.08
  // la jupe : une couronne de boules autour du socle, plus basse devant (on voit le sol) que derrière
  const N = 24
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.14, dx = Math.cos(a), dz = Math.sin(a)
    const edge = half / Math.max(Math.abs(dx), Math.abs(dz))
    const rad = 0.72 + r() * 0.5, d = edge + 0.35 + r() * 0.55
    const front = dx > 0.3 || dz > 0.3
    const y = (front ? -0.98 : -0.58) + (r() - 0.5) * 0.22
    out.push({ p: [SLAB.c + dx * d, y, SLAB.c + dz * d], s: [rad, rad * 0.78, rad], c: i % 3 === 0 ? SIDE : TOP })
  }
  // le dessous : trois couronnes qui rétrécissent, pour que le banc ait un ventre rond
  for (const [y, k, n, sz] of [[-1.5, 0.92, 14, 1.25], [-2.25, 0.68, 9, 1.2], [-2.95, 0.4, 5, 1]] as const) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + y + (r() - 0.5) * 0.2
      const d = SLAB.h * k + 0.4
      const rad = sz * (0.85 + r() * 0.35)
      out.push({ p: [SLAB.c + Math.cos(a) * d, y + (r() - 0.5) * 0.2, SLAB.c + Math.sin(a) * d], s: [rad, rad * 0.8, rad], c: i % 2 ? UNDER : DEEP })
    }
  }
  out.push({ p: [SLAB.c, -3.3, SLAB.c], s: [1.5, 0.8, 1.5], c: DEEP })
  // les bancs de côté (gauche et droite de l'écran), et ce qui flotte plus loin
  heap(out, r, S(-7.3, -3.5, -0.5), 2.7, 1.0, 7, 1.15)
  heap(out, r, S(7.6, -2.6, -2.5), 2.6, 0.95, 7, 1.1)
  // le pied de l'arc-en-ciel s'enfonce dans un nuage, et l'îlot du village a sa jupe de nuages
  heap(out, r, S(8.2, 4.4, -4), 0.8, 0.3, 3, 0.5)
  heap(out, r, S(9.9, -3.7, -10), 1.5, 0.7, 6, 1.1)
  heap(out, r, S(7.5, -0.7, -1.2), 1.6, 0.35, 6, 0.55)
  heap(out, r, S(-4.6, -7.4, -2), 2.4, 0.7, 5, 1.1)
  heap(out, r, S(4.2, -7.0, -2), 2.4, 0.7, 5, 1.1)
  heap(out, r, S(-9.8, 3.4, -9), 1.5, 0.55, 5, 0.65)
  heap(out, r, S(9.6, 4.8, -9), 1.6, 0.55, 5, 0.7)
  heap(out, r, S(2.0, 8.6, -9), 1.5, 0.5, 5, 0.6)
  heap(out, r, S(-3.2, 9.4, -9), 1.3, 0.45, 4, 0.55)
  heap(out, r, S(7.2, 8.0, -6), 1.0, 0.4, 4, 0.5)
  return out
}
