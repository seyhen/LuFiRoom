import { smooth } from '../../math'
import type { V3 } from '../parts'

// La forme de l'île de sable autour du bungalow : un contour (le rivage), une hauteur (dunes, pente de la plage, mer plate) et la
// couleur du sol. Tout vient de ces fonctions : le sol, l'écume qui suit le rivage et les objets posés (qui lisent `groundY`).

/** Le centre de l'île et la hauteur de la mer. Le sable sec est à `LAND` (le socle de la coque affleure : -0,165). */
export const C = { x: 0.2, z: 0.3 }
export const WATER = -0.62
export const LAND = -0.4
/** La largeur de la plage entre le sable sec et l'eau. */
const BEACH = 2.5
/** Le carré du sol : centre, côté. */
export const ISLE = { size: 26, x: C.x, z: C.z }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const sstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)))

/** Un bruit de valeurs lisse et déterministe (pas de dépendance) : de -1 à 1. */
const hash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}
export function noise(x: number, z: number) {
  const i = Math.floor(x), j = Math.floor(z), fx = smooth(x - i), fz = smooth(z - j)
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1)
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz
}

/** Le rayon du rivage dans la direction `a` (radians, 0 vers +x, π/2 vers +z, le devant) : une île plus large le long de l'écran que vers la caméra. */
export function shoreR(a: number) {
  // plus large le long de l'écran (vers -x+z et +x-z) que vers la caméra : le décor se voit à gauche et à droite de la pièce
  return 8.2 - 1.25 * Math.sin(2 * a) + 0.45 * Math.cos(3 * a + 0.7) + 0.28 * Math.sin(5 * a + 2.1) + 0.2 * Math.cos(a - 1.2) - 1.9 * Math.exp(-(((a + 1.0) / 0.3) ** 2))
}

/** Distance (approchée) du rivage : positive sur la terre, négative dans l'eau. */
export function inland(x: number, z: number) {
  const dx = x - C.x, dz = z - C.z
  return shoreR(Math.atan2(dz, dx)) - Math.hypot(dx, dz)
}

// Les dunes : [x, z, demi-largeur x, demi-largeur z, hauteur]
const DUNES: [number, number, number, number, number][] = [
  [-6.2, -2.0, 2.0, 2.6, 0.5],
  [-4.6, 4.8, 1.8, 1.4, 0.3],
  [-2.2, -5.2, 2.4, 1.2, 0.24],
  [5.6, 3.8, 1.4, 1.8, 0.2],
  [-7.0, 1.6, 1.2, 1.3, 0.34],
]

/** Le dessus du socle de la coque : le sable s'y adosse en congères douces. */
const HULL = { x0: -3.5, x1: 3.36, z0: -3.5, z1: 3.36 }
const hullGap = (x: number, z: number) => Math.max(HULL.x0 - x, x - HULL.x1, HULL.z0 - z, z - HULL.z1)

/** La hauteur du sol (le sable, ou la mer plate quand on est au large). */
export function groundY(x: number, z: number) {
  const d = inland(x, z)
  if (d <= 0) return WATER
  let h = LAND
  // dunes : seulement loin du rivage
  let dune = 0
  for (const [dx, dz, sx, sz, k] of DUNES) dune += k * Math.exp(-(((x - dx) / sx) ** 2 + ((z - dz) / sz) ** 2))
  h += dune * sstep(1.8, 3.6, d)
  // une ondulation douce du sable
  h += (noise(x * 0.5, z * 0.5) * 0.025 + noise(x * 1.3, z * 1.3) * 0.008) * sstep(0.6, 2.4, d)
  // les congères contre la coque (le bord du socle reste visible)
  const gap = hullGap(x, z)
  if (gap > 0) h += 0.15 * Math.exp(-((gap / 0.8) ** 2)) * (0.6 + 0.4 * noise(x * 0.9, z * 0.9)) * sstep(0, 0.4, gap)
  // la pente de la plage vers l'eau
  const t = clamp01(d / BEACH)
  return WATER + (h - WATER) * Math.pow(t, 0.85)
}

export type RGB = [number, number, number]
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const SAND: RGB = [250, 236, 204], SAND_HI: RGB = [255, 246, 226], SAND_LO: RGB = [240, 216, 178]
const WET: RGB = [222, 192, 152], WET_SEA: RGB = [186, 200, 170]
const SHALLOW: RGB = [150, 224, 208], MID: RGB = [84, 200, 196], DEEP: RGB = [46, 160, 176], FAR: RGB = [58, 130, 168], HAZE: RGB = [214, 168, 190]

/** La couleur du sol en un point : sable sec nuancé, sable mouillé, puis l'eau de plus en plus profonde et lointaine. */
export function groundColor(x: number, z: number): RGB {
  const d = inland(x, z), n = noise(x * 0.8, z * 0.8)
  if (d > 0) {
    // sable sec : des plaques plus claires (crêtes) ou plus chaudes (creux), le sable mouillé au bord de l'eau
    let c = mixc(SAND, n > 0 ? SAND_HI : SAND_LO, Math.abs(n) * 0.7)
    // les herbes des dunes verdissent un peu le sable alentour
    c = mixc(c, [214, 214, 150], clamp01(groundY(x, z) - LAND - 0.12) * 0.6)
    return mixc(c, WET, 1 - sstep(0, 1.5, d))
  }
  const s = -d
  let c = mixc(WET_SEA, SHALLOW, sstep(0, 0.5, s))
  c = mixc(c, MID, sstep(0.4, 1.8, s))
  c = mixc(c, DEEP, sstep(1.6, 4.5, s))
  c = mixc(c, FAR, sstep(4, 7.5, s))
  // loin, la mer prend le rose du ciel (reflet du couchant)
  const far = Math.hypot(x - C.x, z - C.z)
  return mixc(c, HAZE, sstep(9, 13, far) * 0.55)
}

/** Un point du rivage (d = 0) dans la direction `a`, décalé de `off` vers le large (négatif : vers la terre). */
export function shorePoint(a: number, off = 0): [number, number] {
  const r = shoreR(a) + off
  return [C.x + Math.cos(a) * r, C.z + Math.sin(a) * r]
}

/** Un point à poser sur le sol. */
export const onGround = (x: number, z: number, lift = 0): V3 => [x, groundY(x, z) + lift, z]
