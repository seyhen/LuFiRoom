import type { V3 } from '../parts'

// Les cotes de la cabane perchée, partagées par le plancher, le toit, le chêne et les objets.

/** Le plancher : son dessus est à y = 0. */
export const DECK = { x0: -3.1, x1: 3.0, z0: -3.1, z1: 3.0, t: 0.16 }
/** Le tronc du chêne, qui traverse le plancher et le toit (centre, rayon au plancher, rayon en haut). */
export const TRUNK = { x: -2.05, z: -2.2, r: 0.42, rTop: 0.3, y0: -3.2, y1: 5.2 }
/** La seconde branche maîtresse, qui traverse le plancher à l'avant gauche (par un trou, avec du jeu) : le hamac s'y attache, le nichoir y est cloué. */
export const LIMB = { x: -2.65, z: 1.9, r: 0.2 }
/** Le toit en appentis, sur la bande du fond : haut au fond, bas devant. */
export const ROOF = { x0: -3.35, x1: 1.6, z0: -3.35, z1: -1.3, yBack: 3.45, yFront: 3.0, t: 0.1 }
/** La hauteur du dessous du toit à la profondeur z. */
export const roofY = (z: number) => ROOF.yBack + ((z - ROOF.z0) / (ROOF.z1 - ROOF.z0)) * (ROOF.yFront - ROOF.yBack)
/** Les poteaux du toit. */
export const POSTS: [number, number][] = [[1.4, -3.0], [1.4, -1.42], [-0.8, -3.0], [-0.8, -1.42]]
/** Les points d'attache du hamac : sur le tronc, et sur la branche de l'avant gauche. */
export const HAMMOCK: { a: V3; b: V3 } = { a: [-2.11, 1.42, -1.81], b: [-2.6, 1.42, 1.69] }
/** L'ouverture de l'échelle de corde dans le garde-corps de droite. */
export const LADDER = { z0: 0.55, z1: 1.55 }
/** L'ouverture du pont de corde dans le garde-corps de droite (entre ses deux poteaux, centrés en z0 et z1) : le pont part de son milieu. */
export const BRIDGE = { z0: -1.95, z1: -1.15 }

/** Le sol de la forêt, loin en contrebas : un plan carré (centre, côté), à y = GROUND.y. */
export const GROUND = { x: -1, z: -3, size: 20, y: -2.6 }
/** Un point du sol vers ses coordonnées de texture (0 → 1, l'origine du canvas en haut à gauche). */
export const groundUV = (x: number, z: number): [number, number] => [(x - (GROUND.x - GROUND.size / 2)) / GROUND.size, (z - (GROUND.z - GROUND.size / 2)) / GROUND.size]
/** Le ruisseau, en contrebas derrière la cabane : il vient de la gauche au loin, passe derrière le fond et file vers la droite. */
const BROOK: [number, number][] = [[-10.5, -0.5], [-8.2, -3.2], [-6.0, -6.0], [-3.4, -7.7], [-0.4, -7.5], [2.2, -8.6], [4.6, -10.6]]
/** `n + 1` points le long du ruisseau (x, z), lissés. */
export function brookPts(n: number): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const f = (i / n) * (BROOK.length - 1), k = Math.min(BROOK.length - 2, Math.floor(f)), t = f - k
    const p0 = BROOK[Math.max(0, k - 1)], p1 = BROOK[k], p2 = BROOK[k + 1], p3 = BROOK[Math.min(BROOK.length - 1, k + 2)]
    // Catmull-Rom
    const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
    out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])])
  }
  return out
}
