import type { V3 } from '../../parts'

// Les repères du décor autour de la chambre. On compose en coordonnées d'écran, puis `S` les rend en coordonnées du monde :
// la caméra regarde dans la direction (1, 0,8, 1) le point (0, 1,85, 0) ; `sx` va vers la droite de l'écran, `sy` vers le haut,
// `dz` vers la caméra (négatif : derrière la chambre, que la pièce cache là où elle se superpose).
const LOOK: V3 = [0, 1.85, 0]
const RX: V3 = [0.7071, 0, -0.7071]
const UP: V3 = [-0.344, 0.861, -0.344]
const TO: V3 = [0.615, 0.492, 0.615]
export const S = (sx: number, sy: number, dz = 0): V3 => [
  LOOK[0] + RX[0] * sx + UP[0] * sy + TO[0] * dz,
  LOOK[1] + RX[1] * sx + UP[1] * sy + TO[1] * dz,
  LOOK[2] + RX[2] * sx + UP[2] * sy + TO[2] * dz,
]
/** Position d'un point du monde dans l'écran : [sx, sy, dz]. */
export const toScreen = (p: V3): V3 => {
  const d: V3 = [p[0] - LOOK[0], p[1] - LOOK[1], p[2] - LOOK[2]]
  return [d[0] * RX[0] + d[2] * RX[2], d[0] * UP[0] + d[1] * UP[1] + d[2] * UP[2], d[0] * TO[0] + d[1] * TO[1] + d[2] * TO[2]]
}

/** Le demi-côté du socle de la chambre et son centre (le sol est un carré). */
export const SLAB = { c: -0.07, h: 3.43 }
