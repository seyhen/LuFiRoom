import { noise, slabGap, sstep } from '../../outdoor'

// Le sol du désert autour de l'oasis : des dunes dorées qui montent avec la distance (crêtes en lames, face sous le vent plus raide),
// du sable qui s'adosse au socle, un bosquet au creux d'une cuvette derrière à gauche (avec sa petite mare). Les objets posés lisent `groundY`.

export const GROUND = -0.5
/** Le bosquet : le centre de la cuvette, derrière à gauche (le haut gauche de l'écran), et sa mare. */
export const GROVE = { c: [-8.0, -2.2] as [number, number], r: 3.8 }
export const LAKE = { c: [-8.4, -3.0] as [number, number], rx: 1.8, rz: 1.25, y: GROUND - 0.2 }

/** Une dune : une rampe douce au vent et une chute raide sous le vent (0 à 1), de crête diagonale. */
function dune(x: number, z: number) {
  const w = (x * 0.62 + z * 0.78) * 0.085 + noise(x * 0.045 + 3, z * 0.045) * 0.9
  const s = w - Math.floor(w)
  return s < 0.72 ? (s / 0.72) ** 1.4 : (1 - (s - 0.72) / 0.28) ** 1.8
}

/** La hauteur du sol en (x, z) : plat autour du socle (un bourrelet de sable le long), des dunes de plus en plus hautes au-delà de 5 m. */
export function groundY(x: number, z: number) {
  const gap = slabGap(x, z), r = Math.hypot(x, z)
  const behind = -(x + z) / Math.SQRT2
  let h = GROUND
  // les rides fines, et la dérive de sable qui s'adosse au socle
  h += noise(x * 1.7 + 2, z * 1.7) * 0.025 * sstep(0.6, 2, gap)
  h += 0.22 * sstep(2.4, 0.2, gap)
  // les dunes : amplitude croissante, un peu plus hautes derrière que devant (le fond de l'écran est le haut)
  const amp = (0.1 + 1.25 * sstep(4.5, 10, r)) * (0.75 + 0.35 * sstep(-6, 8, behind)) * (1 - 0.3 * sstep(13, 18, r))
  h += dune(x, z) * amp * sstep(1.2, 6, gap)
  h += noise(x * 0.09 + 9, z * 0.09) * 0.35 * sstep(7, 14, r)
  // la cuvette du bosquet : plate, un peu plus basse ; le lac encore en dessous
  const gv = Math.hypot(x - GROVE.c[0], z - GROVE.c[1])
  const bowl = sstep(GROVE.r + 3, GROVE.r - 0.5, gv)
  h += (GROUND - 0.12 + noise(x * 0.5, z * 0.5) * 0.04 - h) * bowl
  const lk = Math.hypot((x - LAKE.c[0]) / LAKE.rx, (z - LAKE.c[1]) / LAKE.rz)
  h -= 0.28 * sstep(1.3, 0.7, lk)
  return h
}

const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/** La couleur du sol (0 à 1) : le côté éclairé de chaque dune est or pâle, l'autre rouille ; l'herbe et la terre noire du bosquet ; plus pâle et voilée au loin. */
export function groundCol(x: number, z: number): [number, number, number] {
  const e = 0.35
  // la pente vers le soleil (de la gauche, derrière) : la face qui regarde le soleil s'éclaire, l'autre tombe dans l'ombre
  const dx = groundY(x + e, z) - groundY(x - e, z), dz = groundY(x, z + e) - groundY(x, z - e)
  const lit = Math.max(-1, Math.min(1, -(dx * 0.62 + dz * 0.78) * 3.4))
  let c = lerp3([0.84, 0.66, 0.4], lit > 0 ? [0.97, 0.85, 0.58] : [0.66, 0.4, 0.23], Math.abs(lit))
  // les rides : un grain plus clair, plus sombre, fin
  const g = noise(x * 3.1, z * 3.1) * 0.035 + noise(x * 7.7 + 1, z * 7.7) * 0.02
  c = [c[0] + g, c[1] + g, c[2] + g * 0.6]
  // le bosquet : de l'herbe rase et de la terre sombre autour des palmiers et de la mare
  const gv = Math.hypot(x - GROVE.c[0], z - GROVE.c[1])
  const gr = sstep(GROVE.r + 1.5, GROVE.r - 1.4, gv)
  c = lerp3(c, [0.42 + noise(x * 1.1, z * 1.1) * 0.05, 0.5 + noise(x * 0.8, z * 0.8) * 0.05, 0.24], gr * 0.85)
  const lk = Math.hypot((x - LAKE.c[0]) / LAKE.rx, (z - LAKE.c[1]) / LAKE.rz)
  c = lerp3(c, [0.36, 0.3, 0.2], sstep(1.7, 1.05, lk) * 0.9)
  // le lointain : voilé de poussière
  return lerp3(c, [0.92, 0.8, 0.64], 0.38 * sstep(10, 19, Math.hypot(x, z)))
}
