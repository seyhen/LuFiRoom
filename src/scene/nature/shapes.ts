import { BufferAttribute, BufferGeometry, IcosahedronGeometry, Vector3 } from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { seeded } from '../paint'

// Les formes de la nature, calculées une fois et partagées : pierres, masses de feuillage, feuilles.
// Rondes et douces comme le reste (style gummy), mais jamais régulières : c'est ce qui les fait lire comme vivantes.

const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

function dir(r: () => number, flatY = 1) {
  const v = new Vector3(r() * 2 - 1, (r() * 2 - 1) * flatY, r() * 2 - 1)
  return v.lengthSq() < 1e-4 ? v.set(1, 0, 0) : v.normalize()
}

/** Sphère sans couture (sommets partagés), à déformer. */
function blob(detail: number) {
  const g = new IcosahedronGeometry(1, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  return mergeVertices(g)
}

/** Recadre une forme : x et z de -1 à 1, y de 0 à 1. L'échelle d'un objet donne alors sa demi-largeur et sa hauteur. */
function frame(geo: BufferGeometry) {
  const pos = geo.attributes.position
  geo.computeBoundingBox()
  const { min, max } = geo.boundingBox!
  const sx = 2 / (max.x - min.x), sy = 1 / (max.y - min.y), sz = 2 / (max.z - min.z)
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, (pos.getX(i) - (min.x + max.x) / 2) * sx, (pos.getY(i) - min.y) * sy, (pos.getZ(i) - (min.z + max.z) / 2) * sz)
  geo.computeVertexNormals()
}

/* ------------------------------------------------------------------ pierres */

/** Nombre de formes de pierre. Les deux dernières ont le dessus plat (pas japonais, pierre à sandales). */
export const ROCK_VARIANTS = 8
export const FLAT_ROCKS = [6, 7]
const rocks = new Map<number, { rock: BufferGeometry; moss: BufferGeometry }>()

/**
 * Une pierre de rivière : une sphère gonflée de quelques bosses, taillée de faces planes aux arêtes très arrondies, posée sur
 * un dessous aplati. `moss` est une fine couche qui épouse son dessus, au bord irrégulier : la mousse qui l'a colonisée.
 */
export function rockGeo(v: number) {
  const hit = rocks.get(v)
  if (hit) return hit
  const r = seeded(211 + v * 37), flat = FLAT_ROCKS.includes(v)
  const geo = blob(7)
  const lobes = Array.from({ length: 4 }, () => ({ d: dir(r, 0.7), w: 0.1 + r() * 0.2 }))
  const cuts = Array.from({ length: 3 + ((r() * 3) | 0) }, () => ({ d: dir(r, 0.5), o: 0.66 + r() * 0.22 }))
  if (flat) cuts.push({ d: new Vector3(0, 1, 0), o: 0.32 })
  else if (r() < 0.6) cuts.push({ d: new Vector3(r() - 0.5, 2.2, r() - 0.5).normalize(), o: 0.6 + r() * 0.2 })
  const ph = [r() * 6, r() * 6, r() * 6]
  const pos = geo.attributes.position, p = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    let f = 1
    for (const l of lobes) f += l.w * Math.max(0, p.dot(l.d)) ** 2
    f += 0.03 * Math.sin(p.x * 5 + ph[0]) * Math.sin(p.y * 4 + ph[1]) * Math.sin(p.z * 6 + ph[2])
    for (const c of cuts) {
      const k = p.dot(c.d)
      if (k > 0.05) f = smin(f, c.o / k, flat ? 0.12 : 0.22)
    }
    p.multiplyScalar(f)
    p.y = smax(p.y, -0.42, 0.2)
    pos.setXYZ(i, p.x, p.y, p.z)
  }
  frame(geo)
  // UV projetées dans le plan de l'écran (la caméra regarde depuis +x +y +z) : la texture ne s'étire pas là où on la voit.
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    uv[i * 2] = (x - z) * 0.55 + v * 0.37
    uv[i * 2 + 1] = y * 1.1 - (x + z) * 0.3 + v * 0.21
  }
  geo.setAttribute('uv', new BufferAttribute(uv, 2))

  const moss = geo.clone(), mp = moss.attributes.position, nor = geo.attributes.normal
  const score = new Float32Array(pos.count)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    score[i] = nor.getY(i) * 0.8 + y * 0.5 + 0.28 * Math.sin(x * 3.1 + ph[1]) * Math.cos(z * 2.7 + ph[2]) + 0.12 * Math.sin(x * 9 + z * 7 + ph[0]) - 1.05
    mp.setXYZ(i, x + nor.getX(i) * 0.025, y + nor.getY(i) * 0.04, z + nor.getZ(i) * 0.025)
  }
  const idx = geo.index!, keep: number[] = []
  for (let t = 0; t < idx.count; t += 3) {
    const a = idx.getX(t), b = idx.getX(t + 1), c = idx.getX(t + 2)
    if (score[a] + score[b] + score[c] > 0) keep.push(a, b, c)
  }
  moss.setIndex(keep)
  const out = { rock: geo, moss }
  rocks.set(v, out)
  return out
}

/* --------------------------------------------------------------- feuillages */

export const FOLIAGE_VARIANTS = 6
/** `wild` : un houppier libre, lobes marqués. `clipped` : un arbuste taillé (azalée, buis, coussin de pin), dôme doux. */
export type FoliageStyle = 'wild' | 'clipped'
const foliages = new Map<string, BufferGeometry>()

/**
 * Une masse de feuillage : quelques lobes fondus ensemble, couverts de petites touffes. Les UV portent la lumière plutôt
 * qu'un motif : v va de l'ombre (dessous, creux) au soleil (dessus), et la texture de feuillage (`foliageTex`) peint ce
 * dégradé de feuilles. u fait défiler les feuilles autour de la masse.
 */
export function foliageGeo(v: number, style: FoliageStyle = 'wild') {
  const key = `${style}${v}`, hit = foliages.get(key)
  if (hit) return hit
  const r = seeded(503 + v * 29 + (style === 'clipped' ? 7 : 0)), clipped = style === 'clipped'
  const geo = blob(8)
  const lobes = [{ c: new Vector3(0, clipped ? -0.05 : 0, 0), rr: clipped ? 0.8 : 0.66 }]
  const n = clipped ? 3 + ((r() * 2) | 0) : 5 + ((r() * 3) | 0)
  for (let k = 0; k < n; k++) {
    const c = dir(r, 0.6).multiplyScalar(clipped ? 0.22 + r() * 0.12 : 0.3 + r() * 0.22)
    c.y = Math.abs(c.y) * 0.8
    lobes.push({ c, rr: clipped ? 0.5 + r() * 0.12 : 0.4 + r() * 0.18 })
  }
  const ph = Array.from({ length: 6 }, () => r() * 6), big = clipped ? 0.025 : 0.04, fine = clipped ? 0.018 : 0.022
  const pos = geo.attributes.position, p = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    let t = 0
    for (const { c, rr } of lobes) {
      const b = p.dot(c), disc = b * b - (c.lengthSq() - rr * rr)
      if (disc > 0) t = t === 0 ? b + Math.sqrt(disc) : smax(t, b + Math.sqrt(disc), clipped ? 0.4 : 0.26)
    }
    // les touffes de feuilles : deux trames de bosses, l'une tournée par rapport à l'autre
    const q = 1 + big * Math.sin(p.x * 8 + ph[0]) * Math.sin(p.y * 8 + ph[1]) * Math.sin(p.z * 8 + ph[2])
      + fine * Math.sin((p.x + p.z) * 16 + ph[3]) * Math.sin((p.y - p.x) * 15 + ph[4]) * Math.sin((p.z - p.y) * 16 + ph[5])
    p.multiplyScalar(t * q)
    p.y = smax(p.y, clipped ? -0.2 : -0.3, 0.2)
    pos.setXYZ(i, p.x, p.y, p.z)
  }
  frame(geo)
  const nor = geo.attributes.normal, uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const light = 0.1 + y * 0.48 + (nor.getY(i) * 0.5 + 0.5) * 0.34 + Math.min(0, Math.hypot(x, z) - 0.7) * 0.2
    uv[i * 2] = (x - z) * 0.45 + v * 0.31
    uv[i * 2 + 1] = Math.min(0.98, Math.max(0.02, light))
  }
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
  foliages.set(key, geo)
  return geo
}

/* ------------------------------------------------------------------ feuilles */

export type LeafKind = 'ovate' | 'heart' | 'lance' | 'round' | 'pinnate' | 'split'

// Largeur de la feuille le long de sa nervure (u : 0 au pétiole, 1 à la pointe), de 0 à 1.
const WIDTH: Record<LeafKind, (u: number) => number> = {
  ovate: (u) => Math.sin(Math.PI * u ** 0.8) ** 0.85,
  heart: (u) => (1 - u) ** 0.8 * (0.62 + 0.38 * Math.min(1, u * 3.5)) * Math.min(1, u * 14 + 0.25),
  lance: (u) => Math.sin(Math.PI * u ** 0.9) ** 0.7,
  round: (u) => Math.sin(Math.PI * u) ** 0.5,
  pinnate: (u) => Math.sin(Math.PI * u ** 0.7) ** 0.8 * (0.07 + 0.93 * Math.abs(Math.sin(Math.PI * u * 11)) ** 0.6),
  // le monstera adulte : une feuille ronde fendue presque jusqu'à la nervure
  split: (u) => Math.sin(Math.PI * u) ** 0.55 * (1 - 0.78 * Math.max(0, Math.cos(Math.PI * 2 * (u * 3.5 - 0.15))) ** 14 * (u > 0.12 && u < 0.92 ? 1 : 0)),
}
const FOLD: Record<LeafKind, number> = { ovate: 0.16, heart: 0.12, lance: 0.2, round: 0.1, pinnate: 0.05, split: 0.1 }
const ARCH: Record<LeafKind, number> = { ovate: 0.16, heart: 0.12, lance: 0.22, round: 0.1, pinnate: 0.3, split: 0.14 }
const leaves = new Map<LeafKind, BufferGeometry>()

/**
 * Une feuille : une coque fine et bombée aux bords arrondis (pas besoin de matériau double face), pliée le long de sa
 * nervure et arquée vers la pointe. Elle part de l'origine le long de +z (longueur 1), x de -1 à 1 au plus large, dessus vers +y.
 * UV : u en travers (0,5 sur la nervure), v le long ; la texture de nervures (`leafTex`) s'y pose.
 */
export function leafGeo(kind: LeafKind) {
  const hit = leaves.get(kind)
  if (hit) return hit
  const NU = kind === 'pinnate' ? 66 : kind === 'split' ? 56 : 16, NV = kind === 'pinnate' ? 4 : 6
  const w = WIDTH[kind], fold = FOLD[kind], arch = ARCH[kind], thick = kind === 'pinnate' ? 0.035 : 0.05
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (const side of [1, -1]) {
    const base = pos.length / 3
    for (let i = 0; i <= NU; i++) {
      const u = i / NU, wu = w(u)
      for (let j = 0; j <= NV; j++) {
        const s = (j / NV) * 2 - 1, x = s * wu
        const t = thick * (1 - s * s) * Math.sqrt(Math.max(0, wu)) * side
        pos.push(x, -fold * Math.abs(x) ** 1.2 - arch * u * u + t, u)
        uv.push(s * 0.5 + 0.5, u)
      }
    }
    for (let i = 0; i < NU; i++)
      for (let j = 0; j < NV; j++) {
        const a = base + i * (NV + 1) + j, b = a + NV + 1
        if (side > 0) idx.push(a, b, a + 1, a + 1, b, b + 1)
        else idx.push(a, a + 1, b, a + 1, b + 1, b)
      }
  }
  let geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  geo.setIndex(idx)
  geo = mergeVertices(geo, 1e-5) // les bords du dessus et du dessous se rejoignent : arête douce
  geo.computeVertexNormals()
  leaves.set(kind, geo)
  return geo
}
