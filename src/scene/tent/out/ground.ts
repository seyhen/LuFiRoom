import { noise, slabGap, sstep } from '../../outdoor'

// Le sol de la pinède autour de la tente : la hauteur (le socle de la tente va de -0,55 à 0), la couleur (aiguilles, mousse, boue du
// sentier), des collines boisées dans le fond. Les objets posés lisent `groundY`.

export const GROUND = -0.5

/** Le sentier qui part de la tente vers la droite de l'écran (x, z) : de la boue tassée entre les fougères. */
export const PATH: [number, number][] = [[3.9, 1.2], [5.4, 0.7], [7.0, -0.9], [8.8, -2.6], [11, -4.2]]

function segDist(px: number, pz: number, a: [number, number], b: [number, number]) {
  const vx = b[0] - a[0], vz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz)))
  return Math.hypot(px - a[0] - vx * t, pz - a[1] - vz * t)
}
export function pathDist(x: number, z: number) {
  let d = 99
  for (let i = 0; i < PATH.length - 1; i++) d = Math.min(d, segDist(x, z, PATH[i], PATH[i + 1]))
  return d
}

/** La hauteur du sol en (x, z) : plat autour de la tente, bosselé plus loin, de vraies collines à partir de 10 m derrière et sur les côtés. */
export function groundY(x: number, z: number) {
  const gap = slabGap(x, z), r = Math.hypot(x, z)
  const behind = -(x + z) / Math.SQRT2 // vers le fond de l'écran
  let h = GROUND
  h += noise(x * 0.3 + 2, z * 0.3) * 0.2 * sstep(2, 5, gap)
  h += noise(x * 1.2, z * 1.2 + 5) * 0.035 * sstep(1, 3, gap)
  // les collines : derrière (fond de l'écran) et sur les côtés, au-delà de 10 m, de plus en plus hautes
  h += (0.9 + 0.8 * (noise(x * 0.17 + 9, z * 0.17) + 1)) * sstep(9.5, 17, r) * (0.55 + 0.45 * sstep(-3, 8, behind)) * sstep(-4, 3, behind + Math.abs(x - z) * 0.3)
  // le sentier : un creux léger
  h -= 0.05 * sstep(0.7, 0.2, pathDist(x, z))
  return h
}

/** La couleur du sol (0 à 1) : mousse et aiguilles, boue du sentier, teinte plus froide et bleutée dans les collines. */
export function groundCol(x: number, z: number): [number, number, number] {
  const r = Math.hypot(x, z), n = noise(x * 0.8, z * 0.8) * 0.5 + 0.5, m = noise(x * 2.4 + 4, z * 2.4) * 0.5 + 0.5
  // aiguilles de pin (brun-roux) et mousse (vert profond), en plaques
  let c: [number, number, number] = [0.19 + 0.08 * n, 0.27 + 0.1 * (1 - n), 0.17 + 0.04 * m]
  const needles = sstep(0.55, 0.8, m)
  c = [c[0] + (0.33 - c[0]) * needles * 0.6, c[1] + (0.24 - c[1]) * needles * 0.6, c[2] + (0.14 - c[2]) * needles * 0.6]
  // la boue du sentier
  const mud = sstep(0.65, 0.2, pathDist(x, z))
  c = [c[0] + (0.26 - c[0]) * mud, c[1] + (0.19 - c[1]) * mud, c[2] + (0.12 - c[2]) * mud]
  // la forêt lointaine : plus froide, plus bleue
  const far = sstep(9, 17, r)
  return [c[0] + (0.2 - c[0]) * far * 0.6, c[1] + (0.33 - c[1]) * far * 0.6, c[2] + (0.32 - c[2]) * far * 0.6]
}
