import { useEffect, useMemo } from 'react'
import { BufferGeometry, Color, Float32BufferAttribute } from 'three'
import { noise, sstep } from '../../outdoor'
import { Part } from '../../parts'
import { Rock } from '../../nature/Rock'
import { groundY } from './ground'
import { O } from './materials'

// Les falaises de grès derrière à droite : de vraies masses de roche faites d'un seul maillage de révolution déformé (pas des boîtes empilées).
// Les strates sont des couches dures et tendres : la dure fait saillie, la tendre se creuse ; chaque couche a sa teinte (ocre, rouille, crème, rose
// poussiéreux, un lit gris) et ses éboulements, de longues rigoles verticales sillonnent la paroi, un talus de pierraille s'évase au pied (pente
// sous 0,5 : pas d'arête de lame sur l'horizon voilé) et le sommet est un dôme ensablé. Un maillage ≈ 3 000 triangles, fusionné dans `<Static>`.

export interface MesaSpec {
  /** Position au sol, rayons du pied (x, z), hauteur, graine, rotation. */
  at: [number, number]
  rx: number
  rz: number
  h: number
  seed: number
  ry: number
  /** Épaisseurs relatives des couches, de bas en haut ; `hard` : la couche fait saillie. */
  layers: { t: number; hard: boolean }[]
}

const TONES = ['#d9a672', '#b0603c', '#ecd0a0', '#8f553c', '#c98a58', '#a08478', '#e2bc84', '#b4704c', '#d6a06a']
const NA = 64
const SAND = new Color('#e6cfa0')

interface Ring { y: number; layer: number; t: number; link: boolean; cap?: number }

/** Le maillage d'une falaise. Ses coordonnées : pied à y = 0 (le talus s'enfonce jusqu'à -0,5), sommet à y = h. */
export function mesaGeo(s: MesaSpec): BufferGeometry {
  const { rx, rz, h, seed, layers } = s
  const total = layers.reduce((a, l) => a + l.t, 0)
  const edges: number[] = [0]
  layers.forEach((l, i) => edges.push(edges[i] + (l.t / total) * h))
  const pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = []
  const c = new Color()
  const tones = layers.map((_, i) => new Color(TONES[(i * 4 + seed * 3) % TONES.length]))
  // chaque couche a son retrait propre : les saillies ne s'alignent pas d'une couche à l'autre
  const off = layers.map((_, i) => noise(i * 3.7 + seed * 11, 1.3) * 0.07)
  const rings: Ring[] = [{ y: -0.5, layer: 0, t: 0, link: false }]
  layers.forEach((_, i) => {
    const n = Math.max(4, Math.round(((edges[i + 1] - edges[i]) / h) * 30))
    // la tranche : l'arête haute de la couche d'en dessous, puis la corniche plate (deux anneaux au même niveau, non reliés au mur)
    if (i > 0) {
      rings.push({ y: edges[i], layer: i - 1, t: 1, link: false })
      rings.push({ y: edges[i], layer: i, t: 0, link: true })
    }
    for (let j = 0; j <= n; j++) rings.push({ y: edges[i] + (j / n) * (edges[i + 1] - edges[i]), layer: i, t: j / n, link: j > 0 || i === 0 })
  })
  const capK = [0.97, 0.78, 0.55, 0.3]
  capK.forEach((k, i) => rings.push({ y: h, layer: layers.length - 1, t: 1, link: i > 0, cap: k }))
  rings.forEach((rg, ri) => {
    const hard = layers[rg.layer].hard
    for (let i = 0; i < NA; i++) {
      const th = (i / NA) * Math.PI * 2, cx = Math.cos(th), sz = Math.sin(th)
      const y = Math.max(0, rg.y), fy = y / h
      // le profil d'une couche : la dure tombe droite avec un fruit ; la tendre est un talus qui s'évase vers le haut ; la corniche entre les deux
      let r = hard ? 1 - 0.025 * rg.t : 0.82 + 0.15 * rg.t ** 0.8
      r += off[rg.layer] - 0.17 * fy
      // des facettes (la roche se fracture en pans), des rigoles verticales en crête vive, des éboulements propres à chaque couche
      const facet = 1 - 0.1 * Math.abs(Math.sin(th * 1.5 + seed + rg.layer * 0.9)) + 0.1 * noise(cx * 1.3 + seed * 5, sz * 1.3)
      const ridge = 1 - Math.abs(noise(cx * 3.2 + seed * 7, sz * 3.2 + y * 0.18))
      const gully = noise(cx * 7 + seed, sz * 7 + y * 0.3) * 0.5
      // les diaclases : la roche se casse en blocs, chaque secteur d'une couche avance ou recule d'un cran
      const sec = Math.floor((th / (Math.PI * 2)) * (7 + (seed % 3)) + rg.layer * 0.37)
      const joint = (Math.sin(sec * 91.7 + rg.layer * 17.3 + seed) * 43758.5453 % 1) * 0.07
      const bite = noise(cx * 4.5 + seed * 3, sz * 4.5 + rg.layer * 5.3)
      r *= facet * (1 - 0.12 * (1 - ridge) * sstep(0, 0.25, fy) + 0.06 * gully + joint + (hard ? 0.13 : 0.2) * bite)
      // le talus de pierraille : s'évase au pied en pente douce
      const flare = sstep(0.36, 0, fy)
      r *= 1 + 0.28 * flare * flare + 0.1 * noise(cx * 3 + 1, sz * 3 + 2) * flare
      if (rg.y < -0.01) r = 1.42 + 0.12 * noise(cx * 3, sz * 3)
      // deux entailles verticales (ravines) qui coupent les couches hautes
      for (let q = 0; q < 2; q++) {
        let dth = Math.abs(((th - (seed * 1.7 + q * 3.1 + 0.4)) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI)
        dth = Math.PI - dth
        r *= 1 - 0.3 * Math.exp(-((dth / 0.13) ** 2)) * sstep(0.15, 0.35, fy) * (rg.cap === undefined ? 1 : 0.5)
      }
      if (rg.cap !== undefined) r *= rg.cap
      const lift = rg.cap !== undefined ? (0.04 + 0.1 * (1 - rg.cap) ** 2 + 0.035 * noise(cx * 1.6 + seed, sz * 1.6 + 4)) : 0
      const dip = rg.y < 0.01 ? 0 : (0.16 * cx * (seed % 2 ? 1 : -1) + 0.12 * sz + 0.08 * noise(cx * 1.4 + seed, sz * 1.4)) * sstep(0.04, 0.3, fy) * h * 0.4
      pos.push(Math.sign(cx) * Math.abs(cx) ** 0.62 * rx * r, rg.y + lift + dip, Math.sign(sz) * Math.abs(sz) ** 0.62 * rz * r)
      // la couleur : la teinte de la couche ; la tendre plus rouge et plus sombre ; des coulées sombres ; le sable sur les corniches, le dessus et le pied
      c.copy(tones[rg.layer])
      const cp = rg.cap !== undefined
      const grain = noise(cx * 12 + seed, sz * 12 + y * 6) * (cp ? 0.02 : 0.05)
      const streak = cp ? 0 : Math.max(0, noise(cx * 13 + seed * 2, sz * 13 + y * 0.1) - 0.35) * 0.55
      let k = 1 - (hard ? 0 : 0.12) + grain - streak - (cp ? 0 : 0.2) * (1 - ridge) * sstep(0, 0.25, fy)
      if (rg.cap !== undefined) c.lerp(SAND, 0.75)
      else if (rg.t === 0 && rg.layer > 0 && !rg.link) c.lerp(SAND, 0.6)
      else if (rg.t === 0 && rg.link && rg.layer > 0) c.lerp(SAND, 0.6)
      if (rg.y < 0.01 || flare > 0.2) c.lerp(new Color('#d6b07a'), 0.6 * flare)
      col.push(c.r * k, c.g * k, c.b * k)
      uv.push(i / NA, rg.y / h)
    }
    if (ri > 0 && rg.link) {
      const a = (ri - 1) * NA, b = ri * NA
      for (let i = 0; i < NA; i++) {
        const n = (i + 1) % NA
        idx.push(a + i, b + i, a + n, a + n, b + i, b + n)
      }
    }
  })
  // le centre du dessus
  const top = pos.length / 3
  pos.push(0, h + 0.1, 0); col.push(SAND.r, SAND.g, SAND.b); uv.push(0.5, 1)
  const last = (rings.length - 1) * NA
  for (let i = 0; i < NA; i++) idx.push(last + i, top, last + (i + 1) % NA)
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  // le dessus est un replat ensablé : ses normales regardent le ciel (sinon la fan de triangles raye le sable)
  const nrm = g.attributes.normal
  const from = (rings.length - capK.length) * NA
  for (let v = from; v <= top; v++) nrm.setXYZ(v, 0, 1, 0)
  return g
}

const L = (...t: [number, boolean][]) => t.map(([t, hard]) => ({ t, hard }))

/** Trois masses étagées aux bords différents, une aiguille, un banc bas qui les relie. Au fond à droite, entre 5 et 11 du centre. */
export const MESAS: MesaSpec[] = [
  { at: [6.4, -8.8], rx: 2.5, rz: 1.8, h: 3.9, seed: 1, ry: 0.5, layers: L([1.4, true], [0.8, false], [1.1, true], [0.5, false], [0.9, true], [0.35, false], [0.8, true]) },
  { at: [10.0, -6.6], rx: 1.5, rz: 1.7, h: 2.7, seed: 2, ry: 1.3, layers: L([1.2, true], [0.6, false], [0.9, true], [0.7, false], [0.6, true]) },
  { at: [10.2, -10.4], rx: 1.9, rz: 1.3, h: 3.5, seed: 4, ry: 0.2, layers: L([0.9, false], [1.0, true], [0.6, false], [1.0, true], [0.4, false], [0.7, true]) },
  { at: [8.0, -6.0], rx: 0.9, rz: 0.8, h: 1.7, seed: 5, ry: 0.9, layers: L([0.9, true], [0.5, false], [0.7, true], [0.4, false], [0.5, true]) },
]

/** Le lointain des coins du haut (grand écran) : des tables de grès basses et pâles à 14 à 16 du centre, que le fondu large voile. Haut droit (-z) et haut gauche (-x). */
export const FAR_MESAS: MesaSpec[] = [
  { at: [1.0, -15.4], rx: 2.6, rz: 1.5, h: 2.1, seed: 3, ry: 0.1, layers: L([1.0, true], [0.6, false], [0.9, true], [0.5, false], [0.6, true]) },
  { at: [-3.8, -16.0], rx: 1.8, rz: 1.2, h: 1.6, seed: 6, ry: 0.5, layers: L([0.8, false], [1.0, true], [0.5, false], [0.7, true]) },
  { at: [-15.4, -6.5], rx: 1.4, rz: 2.4, h: 1.9, seed: 7, ry: 0.0, layers: L([0.9, true], [0.5, false], [1.0, true], [0.5, false], [0.5, true]) },
  { at: [-15.0, -11.8], rx: 1.8, rz: 1.4, h: 2.4, seed: 8, ry: 0.7, layers: L([1.0, true], [0.6, false], [0.8, true], [0.5, false], [0.7, true]) },
]

/** L'éboulis au pied : des blocs de grès de tailles et de teintes variées, du gros près de la paroi au gravier plus loin. */
const SCREE: [number, number, number, number, number][] = [
  // x, z, taille, rotation, teinte (0 rouge, 1 sable, 2 sombre, 3 crème)
  [4.6, -6.7, 0.5, 0.3, 0], [7.4, -6.9, 0.38, 1.6, 2], [8.4, -8.4, 0.52, 2.2, 1], [12.0, -7.8, 0.48, 0.8, 0],
  [11.6, -4.6, 0.36, 2.6, 3], [9.0, -4.7, 0.3, 0.1, 1], [5.2, -10.1, 0.42, 1.2, 3], [7.8, -11.4, 0.5, 2.9, 2],
  [12.0, -9.8, 0.38, 0.5, 1], [4.0, -8.4, 0.34, 1.9, 2], [10.6, -3.9, 0.26, 1.0, 0], [8.0, -9.8, 0.28, 2.0, 0],
  [6.0, -6.2, 0.26, 0.7, 3], [12.6, -6.2, 0.3, 1.4, 2], [9.2, -12.0, 0.4, 2.3, 0],
]

export function Buttes() {
  const geos = useMemo(() => [...MESAS, ...FAR_MESAS].map(mesaGeo), [])
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])
  const mats = [O.stoneRed, O.stone, O.stoneDark, O.stoneCream]
  return (
    <>
      {[...MESAS, ...FAR_MESAS].map(({ at: [x, z], ry }, i) => (
        <Part key={i} geo={geos[i]} m={O.cliff} p={[x, groundY(x, z) - 0.05, z]} rotation-y={ry} castShadow={false} />
      ))}
      {SCREE.map(([x, z, k, ry, t], i) => (
        <Rock key={i} v={i + 3} p={[x, groundY(x, z) - 0.1, z]} s={[k * 1.25, k * 0.75, k]} ry={ry} m={mats[t]} shadow={false} />
      ))}
    </>
  )
}
