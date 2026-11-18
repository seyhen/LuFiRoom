// La courbe de la toile de la tente-cloche, en maths pures (aucun import : testé dans tests/tent.test.mjs). Un mur droit de 1,1 m, puis un toit
// qui se resserre vers le sommet (4,8 m). Seule la moitié du fond est dessinée (le devant est ouvert vers la caméra).

/** Rayon de la tente au sol, hauteur du mur droit, hauteur du sommet. */
export const R0 = 3.2
export const WALL = 1.1
export const APEX = 4.8
/** La toile couvre l'arc de 2 × HALF_ARC rad centré sur la direction (-x, -z) : un peu plus que la moitié, pour que les bords ne se voient pas de face. */
export const CENTER = (5 * Math.PI) / 4
export const HALF_ARC = 1.7

/** Rayon de la toile à la hauteur y. */
export const radiusAt = (y: number) => {
  if (y <= WALL) return R0
  const t = Math.min(1, (y - WALL) / (APEX - WALL))
  return R0 * Math.pow(1 - t, 1.15) + 0.05 * t
}

/** Le profil (rayon, hauteur) : le mur, puis 14 pas de toit. */
export const PROFILE: [number, number][] = [[R0, 0], [R0, WALL]]
for (let j = 1; j <= 14; j++) {
  const y = WALL + ((APEX - WALL) * j) / 14
  PROFILE.push([radiusAt(y), y])
}
/** Longueur cumulée du profil, point par point. */
export const LENGTHS: number[] = [0]
for (let i = 1; i < PROFILE.length; i++) LENGTHS.push(LENGTHS[i - 1] + Math.hypot(PROFILE[i][0] - PROFILE[i - 1][0], PROFILE[i][1] - PROFILE[i - 1][1]))
/** Longueur du profil, en mètres : la texture de la toile est dessinée à cette échelle (V = longueur / LEN). */
export const LEN = LENGTHS[LENGTHS.length - 1]
/** La part du profil que fait le mur droit (la bande de tempête et la jupe se dessinent là). */
export const V_WALL = LENGTHS[1] / LEN

/** Un point de la toile : angle φ (comme `LatheGeometry` : x = r sin φ, z = r cos φ) et hauteur y, rentré de `inset` vers le mât. */
export const onCanvas = (phi: number, y: number, inset = 0): [number, number, number] => {
  const r = radiusAt(y) - inset
  return [r * Math.sin(phi), y, r * Math.cos(phi)]
}
/** Inclinaison de la toile par rapport à la verticale à la hauteur y (0 sur le mur, jusqu'à 0,9 rad en haut). */
export const tiltAt = (y: number) => {
  const e = 0.05
  return Math.atan2(radiusAt(y - e) - radiusAt(y + e), 2 * e)
}
