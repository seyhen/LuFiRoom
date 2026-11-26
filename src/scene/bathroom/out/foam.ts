import { seeded, smooth } from '../../../math'
import { noise, slabGap } from '../../outdoor'
import type { Item, V3 } from '../../parts'
import { S, type View } from './layout'

// La mousse : le banc de mousse de bain rose qui porte la pièce, et les petits nuages de mousse lointains. Du pur calcul (aucun three) :
// des paquets de bulles (des sphères de 0,14 à 1,7 de rayon, en une seule série instanciée) posés en trois couches (gros paquets en
// fond, moyens, et une croûte de petites bulles du côté de la caméra : c'est elle qui fait la mousse) et de l'écume sur le flanc, avec la règle du socle : rien de la mousse ne perce le carrelage de la pièce (le haut d'un
// paquet reste sous y = 0 là où il mord sur le socle), mais elle monte contre le socle et déborde autour et dessous.

/** Les teintes de mousse : du blanc chaud à peine rosé (la mousse de bain n'est jamais en boules de couleurs franches), un souffle de rose et de lilas. */
const PINK = [0xfbdbe6, 0xf9d0df, 0xfce2ea]
const CREAM = [0xfff4e6, 0xffeedd, 0xfff1e8]
const WHITE = [0xfffafa, 0xfff3f6, 0xfdf6fb, 0xfff8f2]
const EXTRA = [0xf0d9ec, 0xffe2d4]
const PALE = [0xfff0e2, 0xf9eef0, 0xfbd9e2, 0xf3e6f1]
const pick = (r: () => number, a: number[]) => a[Math.floor(r() * a.length) % a.length]
const bank = (r: () => number) => {
  const u = r()
  return pick(r, u < 0.22 ? PINK : u < 0.42 ? CREAM : u < 0.94 ? WHITE : EXTRA)
}

export interface Puff {
  p: V3
  r: number
  c: number
}

const CX = -0.07, CZ = -0.07
const sm = (x: number) => smooth(Math.min(1, Math.max(0, x)))
/** Le rivage du banc, à partir du centre de la pièce : un peu irrégulier. */
const shore = (a: number) => 6.7 + 0.9 * Math.sin(3 * a + 0.4) + 0.6 * Math.sin(5 * a + 1.7)

/** La hauteur la plus haute qu'un paquet peut atteindre en (x, z) : bas devant la pièce, plus haut derrière et sur les côtés. */
function maxTop(x: number, z: number) {
  const g = slabGap(x, z), back = sm((-(x + z) + 1) / 4)
  return 0.12 + 0.7 * sm((g - 0.4) / 1.8) + back * 1.3 * sm((g - 0.8) / 2.2)
}

/** Le paquet (centre `x, y, z`, rayon `r`) peut-il exister sans percer le carrelage et sans dépasser le relief voulu ? */
function ok(x: number, y: number, z: number, r: number) {
  const g = slabGap(x, z), top = y + r
  if (g < -0.2) return top <= -0.1
  const bites = g < r && !(y < 0 && Math.sqrt(Math.max(0, r * r - y * y)) <= g) && top > 0
  return !bites && top <= maxTop(x, z) + 0.001
}

/** Le relief voulu, en (x, z) : bas contre le socle (on en voit le soubassement), un plateau doux qui monte, des bosses larges derrière. */
function surface(x: number, z: number) {
  const g = slabGap(x, z), a = Math.atan2(z - CZ, x - CX), rho = Math.hypot(x - CX, z - CZ), edge = sm((rho - (shore(a) - 2.4)) / 2.4)
  const back = sm((-(x + z) + 1) / 4)
  const h = -0.42 + 0.72 * sm((g - 0.3) / 2.2) + back * (0.45 + 0.7 * (noise(x * 0.4 + 3, z * 0.4) * 0.5 + 0.5)) * sm((g - 0.7) / 2) + 0.16 * noise(x * 0.9, z * 0.9)
  return h * (1 - edge * 0.75) - edge * 0.15
}

/** Un paquet de plus, s'il passe la règle du socle ; réduit un peu le rayon pour y arriver. */
function put(list: Puff[], x: number, y: number, z: number, r: number, c: number) {
  for (let k = 0; k < 5; k++, r *= 0.88, y += r * 0.04) {
    if (ok(x, y, z, r)) {
      list.push({ p: [x, y, z], r, c })
      return true
    }
  }
  return false
}

export interface Bank {
  puffs: Puff[]
  /** La hauteur du dessus de la mousse en (x, z) : la pluie s'y arrête. */
  top: (x: number, z: number) => number
  /** Des points du dessus de la mousse où les gouttes éclatent en petites bulles. */
  spots: V3[]
}

export function makeBank(): Bank {
  const r = seeded(97), puffs: Puff[] = []
  // le flanc : quatre étages de gros paquets qui font le tour (un nuage qui se resserre vers le bas), pour que le socle repose dessus
  const rings: Puff[] = []
  const LEVELS: [number, number, number][] = [[-0.5, 0, 1.2], [-1.5, 0.35, 1.45], [-2.4, -0.7, 1.35], [-3.2, -2.0, 1.15]]
  LEVELS.forEach(([y, grow, rad], L) => {
    const n = 26 - L * 2
    for (let i = 0; i < n; i++) {
      const a = ((i + r() * 0.6) / n) * Math.PI * 2, d = shore(a) + grow - 0.2 - r() * 0.5, R = rad * (0.75 + r() * 0.5)
      const x = CX + Math.cos(a) * d, z = CZ + Math.sin(a) * d
      const ring: Puff = { p: [x, y - R * 0.1 + r() * 0.2, z], r: R, c: bank(r) }
      puffs.push({ ...ring, r: R * 0.6 })
      rings.push(ring)
    }
  })
  // un socle dessous, qu'on ne voit pas mais qui bouche le ciel entre le socle de la pièce et le flanc : tout reste sous le carrelage
  const under: Puff[] = []
  for (let i = 0; i < 14; i++) {
    const R = 1.5 + r() * 0.7
    under.push({ p: [CX + (r() - 0.5) * 6, -0.9 - R - r() * 0.3, CZ + (r() - 0.5) * 6], r: R, c: bank(r) })
  }
  puffs.push(...under.map((g) => ({ ...g, r: g.r * 0.8 })))
  // le dessus : une grille de gros paquets, posés sur le relief voulu
  const big: Puff[] = []
  for (let gx = -10; gx <= 10; gx += 1.15) for (let gz = -10; gz <= 10; gz += 1.15) {
    const x = gx + (r() - 0.5) * 0.7, z = gz + (r() - 0.5) * 0.7, a = Math.atan2(z - CZ, x - CX), rho = Math.hypot(x - CX, z - CZ)
    if (rho > shore(a) - 0.5 || slabGap(x, z) < -0.1) continue
    const R = 0.55 + r() * 0.3
    put(big, x, surface(x, z) - R * (1.1 + r() * 0.3), z, R, bank(r))
  }
  puffs.push(...big)
  // la peau : la mousse est un amas serré de bulles presque de même taille qui se recouvrent (jamais quelques points épars sur une boule lisse :
  // ça faisait des boutons). Dessus : une grille serrée posée sur le relief ; sur le flanc : le côté de la caméra de chaque gros paquet.
  const skin: Puff[] = []
  for (let gx = -9.6; gx <= 9.6; gx += 0.55) for (let gz = -9.6; gz <= 9.6; gz += 0.55) {
    const x = gx + (r() - 0.5) * 0.3, z = gz + (r() - 0.5) * 0.3, a = Math.atan2(z - CZ, x - CX), rho = Math.hypot(x - CX, z - CZ)
    if (rho > shore(a) - 0.2 || slabGap(x, z) < -0.1) continue
    const R = 0.3 + 0.14 * (noise(x * 1.7, z * 1.7) * 0.5 + 0.5) + r() * 0.06
    put(skin, x, surface(x, z) + 0.12 * noise(x * 1.1 + 9, z * 1.1) - R * 0.25, z, R, bank(r))
  }
  for (const g of rings) {
    for (let i = 0; i < 22; i++) {
      const az = Math.PI / 4 + (r() - 0.5) * Math.PI * 1.8, el = -1.3 + r() * 2.7, R = 0.34 + r() * 0.16, d = g.r * 0.96
      skin.push({ p: [g.p[0] + Math.cos(az) * Math.cos(el) * d, g.p[1] + Math.sin(el) * d, g.p[2] + Math.sin(az) * Math.cos(el) * d], r: R, c: bank(r) })
    }
  }
  // les gros paquets du dessous se voient sous la pièce : ils ont leur peau de bulles eux aussi
  for (const g of under) {
    const n = Math.ceil(g.r * g.r * 7)
    for (let i = 0; i < n; i++) {
      const az = Math.PI / 4 + (r() - 0.5) * Math.PI * 1.9, el = -1.3 + r() * 2.6, R = 0.36 + r() * 0.16, d = g.r * 0.97
      skin.push({ p: [g.p[0] + Math.cos(az) * Math.cos(el) * d, g.p[1] + Math.sin(el) * d, g.p[2] + Math.sin(az) * Math.cos(el) * d], r: R, c: bank(r) })
    }
  }
  puffs.push(...skin)

  // la carte des hauteurs (une case de 0,5), pour la pluie
  const N = 52, X0 = -13, CELL = 0.5, grid = new Float32Array(N * N).fill(-3.6)
  for (const { p, r: R } of puffs) {
    const i0 = Math.max(0, Math.floor((p[0] - R - X0) / CELL)), i1 = Math.min(N - 1, Math.ceil((p[0] + R - X0) / CELL))
    const j0 = Math.max(0, Math.floor((p[2] - R - X0) / CELL)), j1 = Math.min(N - 1, Math.ceil((p[2] + R - X0) / CELL))
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const dx = X0 + i * CELL - p[0], dz = X0 + j * CELL - p[2], d2 = dx * dx + dz * dz
      if (d2 < R * R) grid[j * N + i] = Math.max(grid[j * N + i], p[1] + Math.sqrt(R * R - d2))
    }
  }
  const top = (x: number, z: number) => {
    const fx = (x - X0) / CELL, fz = (z - X0) / CELL
    if (fx < 0 || fz < 0 || fx >= N - 1 || fz >= N - 1) return -3.6
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j
    return (grid[j * N + i] * (1 - u) + grid[j * N + i + 1] * u) * (1 - v) + (grid[(j + 1) * N + i] * (1 - u) + grid[(j + 1) * N + i + 1] * u) * v
  }
  // où éclatent les gouttes : sur le dessus, hors du socle de la pièce
  const spots: V3[] = []
  for (let k = 0; k < 400 && spots.length < 90; k++) {
    const x = CX + (r() - 0.5) * 17, z = CZ + (r() - 0.5) * 17, y = top(x, z)
    if (y > -0.9 && slabGap(x, z, 0.5) > 0 && Math.hypot(x - CX, z - CZ) < 8) spots.push([x, y, z])
  }
  return { puffs, top, spots }
}

/** Les petits nuages de mousse lointains, posés au hasard à travers le champ visible (loin de la pièce), pâles : un tracé avec le banc. */
export function makeCloudlets(v: View): Puff[] {
  const r = seeded(31), out: Puff[] = []
  const cell = [5.6, 4.4]
  for (let sx = Math.floor(v.l / cell[0]) * cell[0]; sx < v.r + cell[0]; sx += cell[0]) {
    for (let sy = Math.floor(v.b / cell[1]) * cell[1]; sy < v.t + cell[1]; sy += cell[1]) {
      const x = sx + (r() - 0.5) * cell[0] * 0.7, y = sy + (r() - 0.5) * cell[1] * 0.7
      // la place du banc et de la pièce à l'écran : rien ici
      if ((x / 9.6) ** 2 + ((y + 0.5) / 8) ** 2 < 1) continue
      // un nuage de mousse lointain : un petit amas de bulles de la taille de celles du banc (pas de grosses boules lisses)
      const w = 1.6 + r() * 2.2, dz = -5 - r() * 8
      for (let i = 0; i < 13; i++) {
        const u = r() * 2 - 1, v = r(), R = 0.32 + r() * 0.24, hh = (1 - u * u) ** 0.6 * (0.5 + 0.9 * v)
        out.push({ p: S(x + u * w * 0.5, y + R * 0.4 + hh * 0.8, dz + (r() - 0.5) * 0.8), r: R, c: pick(r, PALE) })
      }
    }
  }
  return out
}

export const toItems = (list: Puff[]): Item[] => list.map(({ p, r, c }) => ({ p, s: r, c }))
