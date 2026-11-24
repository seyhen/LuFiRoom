import { seeded, smooth } from '../../../math'
import { noise, slabGap } from '../../outdoor'
import type { Item, V3 } from '../../parts'
import { S, type View } from './layout'

// La mousse : le banc de mousse de bain rose qui porte la pièce, et les petits nuages de mousse lointains. Du pur calcul (aucun three) :
// des paquets de bulles opaques (des sphères de 0,2 à 1,7 de rayon, en une seule série instanciée) posés en trois couches (gros paquets,
// moyens, petits) et de l'écume sur le flanc, avec la règle du socle : rien de la mousse ne perce le carrelage de la pièce (le haut d'un
// paquet reste sous y = 0 là où il mord sur le socle), mais elle monte contre le socle et déborde autour et dessous.

/** Les teintes de mousse : rose bonbon, crème, blanc cassé, un peu de lilas et de pêche. */
const PINK = [0xf6b4c7, 0xf2a4bd, 0xfac1d1, 0xf7bdcb]
const CREAM = [0xfff0da, 0xffe8cf, 0xfdf0e0]
const WHITE = [0xf7eeee, 0xf2e9f0, 0xfaf3ef]
const EXTRA = [0xe9c2e0, 0xffd0bd]
const PALE = [0xfff0e2, 0xf9eef0, 0xfbd9e2, 0xf3e6f1]
const pick = (r: () => number, a: number[]) => a[Math.floor(r() * a.length) % a.length]
const bank = (r: () => number) => {
  const u = r()
  return pick(r, u < 0.42 ? PINK : u < 0.68 ? CREAM : u < 0.92 ? WHITE : EXTRA)
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
  const LEVELS: [number, number, number][] = [[-0.5, 0, 1.2], [-1.5, 0.35, 1.45], [-2.4, -0.7, 1.35], [-3.2, -2.0, 1.15]]
  LEVELS.forEach(([y, grow, rad], L) => {
    const n = 26 - L * 2
    for (let i = 0; i < n; i++) {
      const a = ((i + r() * 0.6) / n) * Math.PI * 2, d = shore(a) + grow - 0.2 - r() * 0.5, R = rad * (0.75 + r() * 0.5)
      const x = CX + Math.cos(a) * d, z = CZ + Math.sin(a) * d
      const ring: Puff = { p: [x, y - R * 0.1 + r() * 0.2, z], r: R, c: bank(r) }
      puffs.push(ring)
      // de l'écume sur le flanc : de petites bulles sur le dessus de chaque gros paquet des deux étages du haut
      if (L < 2) for (let k = 0; k < 3; k++) {
        const az = a + (r() - 0.5) * 2.2, el = 0.15 + r() * 1.1, q = 0.2 + r() * 0.2, dd = R * 0.93
        puffs.push({ p: [x + Math.cos(az) * Math.cos(el) * dd, ring.p[1] + Math.sin(el) * dd, z + Math.sin(az) * Math.cos(el) * dd], r: q, c: bank(r) })
      }
    }
  })
  // un socle dessous, qu'on ne voit pas mais qui bouche le ciel entre le socle de la pièce et le flanc : tout reste sous le carrelage
  for (let i = 0; i < 14; i++) {
    const R = 1.5 + r() * 0.7
    puffs.push({ p: [CX + (r() - 0.5) * 6, -0.9 - R - r() * 0.3, CZ + (r() - 0.5) * 6], r: R, c: bank(r) })
  }
  // le dessus : une grille de gros paquets, posés sur le relief voulu
  const big: Puff[] = []
  for (let gx = -10; gx <= 10; gx += 1.15) for (let gz = -10; gz <= 10; gz += 1.15) {
    const x = gx + (r() - 0.5) * 0.7, z = gz + (r() - 0.5) * 0.7, a = Math.atan2(z - CZ, x - CX), rho = Math.hypot(x - CX, z - CZ)
    if (rho > shore(a) - 0.5 || slabGap(x, z) < -0.1) continue
    const R = 0.8 + r() * 0.55
    put(big, x, surface(x, z) - R * (0.78 + r() * 0.3), z, R, bank(r))
  }
  puffs.push(...big)
  // les paquets moyens, puis les petits, posés sur les flancs des précédents
  const mids: Puff[] = []
  for (const b of big) {
    const k = r() < 0.8 ? (r() < 0.45 ? 2 : 1) : 0
    for (let i = 0; i < k; i++) {
      const az = r() * Math.PI * 2, el = 0.35 + r() * 0.9, R = b.r * (0.5 + r() * 0.32), d = b.r * 0.8
      put(mids, b.p[0] + Math.cos(az) * Math.cos(el) * d, b.p[1] + Math.sin(el) * d, b.p[2] + Math.sin(az) * Math.cos(el) * d, R, bank(r))
    }
  }
  puffs.push(...mids)
  const smalls: Puff[] = []
  for (const b of [...big, ...mids]) {
    if (r() < 0.55) continue
    const az = r() * Math.PI * 2, el = 0.5 + r() * 0.9, R = 0.24 + r() * 0.2, d = b.r * 0.9
    put(smalls, b.p[0] + Math.cos(az) * Math.cos(el) * d, b.p[1] + Math.sin(el) * d, b.p[2] + Math.sin(az) * Math.cos(el) * d, R, bank(r))
  }
  puffs.push(...smalls)

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
      const w = 2.2 + r() * 3.2, n = 5 + Math.floor(r() * 4), dz = -5 - r() * 8
      for (let i = 0; i < n; i++) {
        const u = (i / (n - 1)) * 2 - 1, R = (0.55 + r() * 0.5) * (1.45 - Math.abs(u) * 0.7), p = S(x + u * w * 0.5 + (r() - 0.5) * 0.4, y + R * 0.45 + (r() - 0.5) * 0.25, dz + (r() - 0.5) * 1.2)
        out.push({ p, r: R, c: pick(r, PALE) })
      }
      for (let i = 0; i < 2 + Math.floor(r() * 2); i++) {
        const u = r() * 1.2 - 0.6, R = 0.4 + r() * 0.3
        out.push({ p: S(x + u * w * 0.5, y + 0.85 + r() * 0.3, dz + (r() - 0.5)), r: R, c: pick(r, PALE) })
      }
    }
  }
  return out
}

export const toItems = (list: Puff[]): Item[] => list.map(({ p, r, c }) => ({ p, s: r, c }))
