import { noise, slabGap, sstep } from '../../outdoor'

// La clairière autour de la cabane : la hauteur de la neige (congères contre le socle, collines boisées derrière, le sentier
// tassé, la mare gelée) et sa couleur. Les objets posés lisent `snowY`.

/** Le niveau de la neige dans la clairière (le socle de la cabane va de -0,715 à -0,165). */
export const SNOW_Y = -0.42

/** Le sentier tassé : de l'abri à bois, il longe la cabane puis part vers le devant. */
export const PATH: [number, number][] = [[5.3, -1.6], [4.75, 0.4], [4.8, 2.4], [5.6, 4.4], [6.9, 6.6], [8.4, 8.6]]

/** La mare gelée, à droite derrière l'abri. */
export const POND = { x: 7.4, z: -5.2, r: 1.55 }

function segDist(px: number, pz: number, a: [number, number], b: [number, number]) {
  const vx = b[0] - a[0], vz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz)))
  return Math.hypot(px - a[0] - vx * t, pz - a[1] - vz * t)
}
export function pathDist(x: number, z: number) {
  let d = 99
  for (let i = 0; i < PATH.length - 1; i++) d = Math.min(d, segDist(x, z, PATH[i], PATH[i + 1]))
  return d
}

/** La hauteur de la neige en (x, z). */
export function snowY(x: number, z: number) {
  const gap = slabGap(x, z)
  let h = SNOW_Y
  // congères adossées au socle : la neige monte presque au ras du plancher
  h += 0.24 * sstep(1.3, 0, gap)
  // les collines boisées derrière la cabane (vers -x, -z) ; douces bosses ailleurs
  const behind = -(x + z) / Math.SQRT2
  h += 1.5 * sstep(4.2, 10.5, behind) + 0.55 * sstep(5, 10, -x) * sstep(-2, 4, z)
  h += noise(x * 0.35 + 3, z * 0.35) * 0.22 * sstep(1.5, 4, gap)
  h += noise(x * 1.1, z * 1.1 + 7) * 0.04 * sstep(0.6, 2, gap)
  // le sentier, tassé par les bottes
  h -= 0.06 * sstep(0.55, 0.15, pathDist(x, z))
  // la mare : un creux plat
  const dp = Math.hypot(x - POND.x, z - POND.z)
  h = h + (SNOW_Y - 0.08 - h) * sstep(POND.r + 0.7, POND.r - 0.1, dp)
  h += 0.07 * Math.exp(-(((dp - POND.r - 0.15) / 0.22) ** 2))
  return h
}

/** La couleur de la neige : blanc bleuté, le sentier un peu gris, l'ombre des creux plus bleue. */
export function snowColor(x: number, z: number): [number, number, number] {
  const p = sstep(0.6, 0.12, pathDist(x, z)), n = noise(x * 0.6, z * 0.6) * 0.03
  return [0.95 - p * 0.12 + n, 0.97 - p * 0.1 + n, 1.0 - p * 0.05 + n]
}
