import { noise, groundGrid } from '../../outdoor'
import { smooth } from '../../../math'

// Le terrain du jardin de cottage : un pré plat autour de la maison et de la pièce (le sol de la pièce repose dessus), puis des
// collines douces qui montent derrière et sur les côtés. Les pentes restent sous 0,5 là où le fondu commence (docs/ROOMS.md,
// « Un horizon en lame ») : la colline se noie dans la brume au lieu de faire une arête.

/** Le pré : un peu sous le socle de la pièce (qui dépasse de 0,3 comme un soubassement). */
export const GROUND = -0.5

/** Le plateau plat : la maison, le jardin, la pièce. Rectangle [x0, x1] × [z0, z1]. */
const PLATEAU = { x0: -11, x1: 15, z0: -13.2, z1: 10 }

/** Distance au plateau (0 dedans). */
function beyond(x: number, z: number) {
  const dx = Math.max(PLATEAU.x0 - x, 0, x - PLATEAU.x1), dz = Math.max(PLATEAU.z0 - z, 0, z - PLATEAU.z1)
  return Math.hypot(dx, dz)
}

/** La hauteur du sol en (x, z). */
export function terrainY(x: number, z: number) {
  const q = beyond(x, z)
  if (q <= 0) return GROUND
  const u = Math.min(1, q / 5)
  // la pente monte doucement (0,17 puis 0,3 au large), des bosses larges par-dessus : jamais plus de 0,45
  const rise = 0.17 * q + 0.13 * Math.max(0, q - 3) + (noise(x * 0.12 + 5, z * 0.12 - 3) * 0.5 + 0.5) * 1.4 * smooth(u) + noise(x * 0.31, z * 0.31) * 0.12 * u
  return GROUND + rise
}

const hex = (h: number): [number, number, number] => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]
const GRASS = [hex(0x6a915e), hex(0x7b9d68), hex(0x5c8456)]
const MEADOW = hex(0xaeb575)
const FIELD = hex(0x98b072)
const FAR = hex(0x9ab08e)
const mixc = (a: number[], b: number[], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/** Le sol : une grille de 0,7 m, couleur par sommet (herbe mouillée, pré, champs de loin, haies en rubans sur les collines). */
export function terrainGeo() {
  return groundGrid(0, 0, 64, 92, terrainY, (x, z) => {
    const q = beyond(x, z)
    let c = mixc(GRASS[0], GRASS[1], noise(x * 0.45, z * 0.45) * 0.5 + 0.5)
    c = mixc(c, GRASS[2], Math.max(0, noise(x * 0.9 + 9, z * 0.9)) * 0.45)
    // des champs de loin : des rubans de pré et de blé tendre séparés par des haies sombres
    const f = noise(x * 0.16 - 4, z * 0.16 + 7)
    c = mixc(c, f > 0.1 ? MEADOW : FIELD, Math.min(1, q / 6) * 0.55 * (f > 0.1 ? 1 : 0.7))
    const hedge = Math.abs(noise(x * 0.22 + 2, z * 0.22 - 5)) < 0.05 ? 1 : 0
    c = mixc(c, GRASS[2], hedge * Math.min(1, q / 5) * 0.8)
    return mixc(c, FAR, Math.min(1, q / 18) * 0.35)
  }, 4)
}
