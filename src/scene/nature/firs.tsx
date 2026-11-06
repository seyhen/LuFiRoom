import { useMemo } from 'react'
import { LatheGeometry, Vector2, type Material } from 'three'
import { seeded } from '../../math'
import { Batch, cyl, type Item } from '../parts'

// Des sapins gummy : des jupes de branches empilées (un tour de tour, au bord arrondi qui se relève à peine), un capuchon de neige
// sur chaque étage, un bout de tronc. Une forêt entière tient en trois tracés (trois `Batch`), quel que soit le nombre d'arbres.

const lathe = (pts: [number, number][], seg = 18) => new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), seg)

/** Un étage de branches : haut arrondi, flanc légèrement creusé, bord épais et doux qui rentre dessous. Rayon 1, hauteur 1. */
export const TIER = lathe([[0, 1], [0.08, 0.993], [0.16, 0.97], [0.24, 0.92], [0.42, 0.7], [0.66, 0.42], [0.88, 0.2], [0.99, 0.11], [1, 0.05], [0.94, 0], [0.7, 0.03], [0.3, 0.12], [0, 0.14]])
/** La neige posée sur un étage : elle couvre le haut et s'arrête en bourrelet avant le bord. */
export const TIER_SNOW = lathe([[0, 1.04], [0.09, 1.033], [0.18, 1.01], [0.26, 0.95], [0.44, 0.73], [0.62, 0.5], [0.72, 0.4], [0.75, 0.35], [0.7, 0.31], [0.5, 0.42], [0.25, 0.7], [0, 0.8]])
const TRUNK = cyl(0.5, 0.6, 1, 10)

export interface Fir {
  /** Le pied (x, y du sol, z). */
  p: [number, number, number]
  /** La hauteur totale. */
  h: number
  /** Largeur relative (1 : un sapin ordinaire). */
  w?: number
  /** Nombre d'étages (3 à 5). */
  tiers?: number
  /** Teinte du feuillage (sinon celle du matériau). */
  c?: number
  /** Quantité de neige : 0 aucune, 1 tous les étages. */
  snow?: number
}

/** Les copies des trois séries (feuillage, neige, tronc) pour une liste de sapins. */
export function firItems(list: Fir[], seed = 1) {
  const r = seeded(seed), leaves: Item[] = [], snow: Item[] = [], trunks: Item[] = []
  for (const { p, h, w = 1, tiers = 4, c, snow: sn = 1 } of list) {
    const trunkH = h * 0.12, R = h * 0.36 * w, tierH = (h - trunkH) / (1 + (tiers - 1) * 0.55)
    trunks.push({ p: [p[0], p[1] + trunkH * 0.5, p[2]], s: [R * 0.18, trunkH * 1.2, R * 0.18] })
    for (let i = 0; i < tiers; i++) {
      const k = 1 - (i / tiers) * 0.62, y = p[1] + trunkH + i * tierH * 0.55, ry = r() * 6.3
      const tilt: [number, number, number] = [(r() - 0.5) * 0.08, ry, (r() - 0.5) * 0.08]
      leaves.push({ p: [p[0], y, p[2]], s: [R * k, tierH * (i === tiers - 1 ? 0.85 : 1), R * k], r: tilt, c })
      if (sn > 0 && (i >= tiers - Math.ceil(tiers * sn) || r() < sn)) snow.push({ p: [p[0], y + tierH * 0.012, p[2]], s: [R * k * 0.99, tierH * (i === tiers - 1 ? 0.85 : 1), R * k * 0.99], r: tilt })
    }
  }
  return { leaves, snow, trunks }
}

/** Une forêt : trois tracés. `m` le feuillage, `snowM` la neige, `trunkM` le tronc. */
export function Firs({ list, m, snowM, trunkM, seed = 1, shadow = false }: { list: Fir[]; m: Material; snowM: Material; trunkM: Material; seed?: number; shadow?: boolean }) {
  const it = useMemo(() => firItems(list, seed), [list, seed])
  return (
    <>
      <Batch geo={TIER} m={m} items={it.leaves} shadow={shadow} />
      {it.snow.length > 0 && <Batch geo={TIER_SNOW} m={snowM} items={it.snow} shadow={false} />}
      <Batch geo={TRUNK} m={trunkM} items={it.trunks} shadow={shadow} />
    </>
  )
}
