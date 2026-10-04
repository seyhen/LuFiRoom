import { BufferAttribute, IcosahedronGeometry, Vector3, type BufferGeometry, type Material } from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { seeded } from '../paint'
import { Part, type V3 } from '../parts'

/** Nombre de formes de pierre. Les deux dernières ont le dessus plat (pas japonais, pierre à sandales). */
export const ROCK_VARIANTS = 8
export const FLAT_ROCKS = [6, 7]

const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

function dir(r: () => number, flatY = 1) {
  const v = new Vector3(r() * 2 - 1, (r() * 2 - 1) * flatY, r() * 2 - 1)
  return v.lengthSq() < 1e-4 ? v.set(1, 0, 0) : v.normalize()
}

const cache = new Map<number, { rock: BufferGeometry; moss: BufferGeometry }>()

/**
 * Une pierre de rivière, ronde et douce (style gummy) mais jamais régulière : une sphère gonflée de quelques bosses, taillée
 * de faces planes aux arêtes très arrondies, posée sur un dessous aplati. Sa boîte va de -1 à 1 en x et z, de 0 à 1 en y :
 * l'échelle donne directement la demi-largeur et la hauteur.
 * `moss` est une fine couche qui épouse le dessus de la pierre, avec un bord irrégulier : la mousse qui l'a colonisée.
 */
export function rockGeo(v: number) {
  const hit = cache.get(v)
  if (hit) return hit
  const r = seeded(211 + v * 37), flat = FLAT_ROCKS.includes(v)
  let geo: BufferGeometry = new IcosahedronGeometry(1, 7)
  geo.deleteAttribute('normal')
  geo.deleteAttribute('uv')
  geo = mergeVertices(geo)
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
  // Recadre : x et z de -1 à 1, y de 0 à 1.
  geo.computeBoundingBox()
  const { min, max } = geo.boundingBox!
  const sx = 2 / (max.x - min.x), sy = 1 / (max.y - min.y), sz = 2 / (max.z - min.z)
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, (pos.getX(i) - (min.x + max.x) / 2) * sx, (pos.getY(i) - min.y) * sy, (pos.getZ(i) - (min.z + max.z) / 2) * sz)
  geo.computeVertexNormals()
  // UV : projetées dans le plan de l'écran (la caméra regarde depuis +x +y +z), la texture ne s'étire pas là où on la voit.
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    uv[i * 2] = (x - z) * 0.55 + v * 0.37
    uv[i * 2 + 1] = y * 1.1 - (x + z) * 0.3 + v * 0.21
  }
  geo.setAttribute('uv', new BufferAttribute(uv, 2))

  // La mousse : les triangles du dessus, choisis par un seuil bruité, poussés un peu vers l'extérieur.
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
  cache.set(v, out)
  return out
}

export interface RockProps {
  /** Forme (0 à ROCK_VARIANTS - 1). */
  v: number
  p: V3
  /** Demi-largeur, hauteur, demi-profondeur. */
  s: V3
  ry?: number
  m: Material
  moss?: Material
  shadow?: boolean
}

/** Une pierre posée au sol (le bas de sa forme en `p`), avec sa mousse si on lui en donne. */
export function Rock({ v, p, s, ry = 0, m, moss, shadow = true }: RockProps) {
  const g = rockGeo(v % ROCK_VARIANTS)
  return (
    <group position={p} rotation-y={ry} scale={s}>
      <Part geo={g.rock} m={m} castShadow={shadow} />
      {moss && <Part geo={g.moss} m={moss} castShadow={false} />}
    </group>
  )
}
