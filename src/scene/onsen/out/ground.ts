import { noise, slabGap, sstep } from '../../outdoor'

// Le versant autour de l'onsen : un sol de mousse et de terre, la pente qui monte derrière (cèdres, bambous), le ruisseau qui
// descend à droite sous le pont rouge, le sentier de pas japonais qui part du torii à gauche.

export const GROUND = -0.42

/** Le ruisseau : de derrière à droite jusque devant, en lacets. */
export const STREAM: [number, number][] = [[9.5, -7.5], [6.6, -4.6], [5.2, -1.6], [5.6, 1.4], [4.6, 4.2], [5.4, 7.0], [7.0, 9.5]]
/** Le sentier : du torii (devant à gauche) jusqu'au coin de l'onsen, face à la caméra. */
export const PATH: [number, number][] = [[-3.0, 7.8], [-3.2, 6.0], [-3.6, 4.2]]

function segDist(px: number, pz: number, a: [number, number], b: [number, number]) {
  const vx = b[0] - a[0], vz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz)))
  return Math.hypot(px - a[0] - vx * t, pz - a[1] - vz * t)
}
export const lineDist = (line: [number, number][], x: number, z: number) => {
  let d = 99
  for (let i = 0; i < line.length - 1; i++) d = Math.min(d, segDist(x, z, line[i], line[i + 1]))
  return d
}

/** La hauteur du sol. */
export function groundY(x: number, z: number) {
  const gap = slabGap(x, z)
  let h = GROUND + 0.18 * sstep(1.0, 0, gap)
  // la pente boisée derrière (vers -x, -z), et une butte à gauche
  const behind = -(x + z) / Math.SQRT2
  h += 1.6 * sstep(4.0, 10.5, behind) + 0.5 * sstep(4.5, 9, -x) * sstep(-3, 5, z)
  h += noise(x * 0.4, z * 0.4 + 2) * 0.2 * sstep(1.2, 3.5, gap)
  // le lit du ruisseau
  const ds = lineDist(STREAM, x, z)
  h -= 0.32 * sstep(1.25, 0.5, ds)
  return h
}

/** La couleur du sol : mousse, terre plus claire sur le sentier, berges grises. */
export function groundColor(x: number, z: number): [number, number, number] {
  const n = noise(x * 0.7, z * 0.7) * 0.05, ds = lineDist(STREAM, x, z), bank = sstep(1.3, 0.6, ds)
  const path = sstep(0.7, 0.25, lineDist(PATH, x, z))
  const moss: [number, number, number] = [0.42 + n, 0.56 + n, 0.36 + n], earth: [number, number, number] = [0.62, 0.55, 0.44], stone: [number, number, number] = [0.6, 0.6, 0.58]
  const c = moss.map((v, i) => v + (stone[i] - v) * bank * 0.8) as [number, number, number]
  return c.map((v, i) => v + (earth[i] - v) * path * 0.7) as [number, number, number]
}
