import { BufferAttribute, Color, CylinderGeometry, Euler, Quaternion, Vector3, type BufferGeometry, type Material } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { TAU, seeded } from '../../../math'
import { Part } from '../../parts'

// La glace du dehors de l'igloo : des séracs (pics et blocs à facettes, arêtes adoucies par un sommet arrondi), pas des galets.
// Chaque forme est un empilement de prismes effilés (`CylinderGeometry` à 4 à 7 pans, déformé, à plat) dont les sommets portent la
// couleur : une base pâle turquoise à la ligne d'eau, une encoche bleue juste au-dessus, des strates blanches et bleu glacier,
// des crevasses bleues sur certaines arêtes, un sommet blanc. Un seul matériau (`vertexColors`) par série. Les géométries sont
// créées ici (jamais celles de `parts.tsx`) et mises en cache : `.clone()` avant de les transformer ailleurs.

const WHITE = new Color(0xeef5fb), BLUE = new Color(0x9bc3e3), DEEP = new Color(0x5f97c7), TURQ = new Color(0x8fd6d6), FOAM = new Color(0xd6eeee)
const tmp = new Color()
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

interface Spire {
  /** Nombre de pans. */
  n: number
  /** Rayon de base, hauteur. */
  R: number
  H: number
  /** Position de la base (dans le repère de la forme). */
  at: [number, number, number]
  /** Rotation y, inclinaison (z puis x), étirement en x. */
  ry?: number
  tilt?: [number, number]
  sx?: number
  /** Effilement (0 = prisme, 0,7 = très pointu), arrondi du sommet (0 = plat, 0,9 = pointe). */
  taper: number
  peak: number
  /** Le haut penche : décalage horizontal du sommet, en fraction de H. */
  lean?: number
}

interface Look { stripes: number; tq: number; crack: number; waterline: boolean }

function spireGeo(s: Spire, rnd: () => number, look: Look): BufferGeometry {
  const hs = 12
  const g = new CylinderGeometry(1, 1, 1, s.n, hs, false)
  const pos = g.getAttribute('position') as BufferAttribute
  // une valeur par pan et par anneau : les arêtes ne sont pas droites, les strates ne sont pas au cordeau
  const col = Array.from({ length: s.n }, () => 0.82 + rnd() * 0.36)
  const ring = Array.from({ length: hs + 1 }, () => Array.from({ length: s.n }, () => 0.92 + rnd() * 0.16))
  const topY = Array.from({ length: s.n }, () => (rnd() - 0.5) * 0.09)
  const cracks = new Set<number>(); for (let i = 0; i < look.crack; i++) cracks.add(Math.floor(rnd() * s.n))
  const phase = rnd() * TAU
  const colors = new Float32Array(pos.count * 3)
  const q = new Quaternion().setFromEuler(new Euler(s.tilt?.[1] ?? 0, s.ry ?? 0, s.tilt?.[0] ?? 0, 'YXZ'))
  const v = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) + 0.5
    const x0 = pos.getX(i), z0 = pos.getZ(i)
    const k = ((Math.round((Math.atan2(x0, z0) / TAU) * s.n) % s.n) + s.n) % s.n
    const j = Math.round(t * hs)
    const prof = (1 - s.taper * t) * (1 - s.peak * smooth(0.68, 1, t))
    const r = s.R * prof * col[k] * ring[j][k]
    const y = t * s.H + (t > 0.9 ? topY[k] * s.H * (t - 0.9) * 10 : 0)
    v.set(x0 * r * (s.sx ?? 1) + (s.lean ?? 0) * s.H * t * t, y, z0 * r)
    v.applyQuaternion(q).add(new Vector3(...s.at))
    pos.setXYZ(i, v.x, v.y, v.z)
    // la couleur, selon la hauteur dans la forme entière (v.y compté depuis la ligne d'eau) et la strate
    const h = v.y // la ligne d'eau est à 0,1 dans le repère de la forme (`Ice` abaisse le groupe de 0,1 × hauteur)
    const band = 0.5 + 0.5 * Math.sin(h * look.stripes * 6 + phase + (k % 2) * 0.7 + (ring[j][k] - 1) * 14)
    tmp.copy(WHITE).lerp(BLUE, 0.1 + 0.55 * band)
    if (look.tq > 0) tmp.lerp(TURQ, look.tq * smooth(0.35, 0.9, band) * 0.7)
    if (cracks.has(k) && t > 0.25 && t < 0.96) tmp.lerp(DEEP, 0.75 * smooth(0.25, 0.4, t) * (1 - smooth(0.88, 0.96, t)))
    tmp.lerp(WHITE, smooth(0.8, 1, t) * 0.75)
    if (look.waterline) {
      tmp.lerp(DEEP, smooth(0.2, 0.26, h) * (1 - smooth(0.3, 0.4, h)) * 0.6)
      tmp.lerp(FOAM, 1 - smooth(0.12, 0.22, h))
    }
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b
  }
  g.setAttribute('color', new BufferAttribute(colors, 3))
  const flat = g.toNonIndexed()
  flat.computeVertexNormals()
  return flat
}

const cache = new Map<string, BufferGeometry>()

/**
 * Un massif de glace, dans un volume d'à peu près 1 de large (demi-largeur) et 1 de haut : un pic principal, un ou deux pics plus bas
 * et plus pointus, une muraille inclinée, un bloc tombé au pied. Dix formes (`v`), à poser dans un groupe mis à l'échelle.
 */
export function glacierGeo(v: number, look: Partial<Look> = {}): BufferGeometry {
  const key = `g${v}${JSON.stringify(look)}`
  let g = cache.get(key)
  if (g) return g
  const rnd = seeded(40 + v * 7)
  const o: Look = { stripes: 2.4 + rnd() * 2, tq: v % 3 === 0 ? 0.7 : v % 3 === 1 ? 0.2 : 0, crack: 1 + (v % 2), waterline: true, ...look }
  const side = v % 2 ? 1 : -1
  const parts: Spire[] = [
    { n: 6 + (v % 2), R: 0.85, H: 1, at: [0, 0, 0], ry: rnd() * 3, taper: 0.45 + rnd() * 0.15, peak: 0.55 + rnd() * 0.3, lean: side * (0.05 + rnd() * 0.12) },
    { n: 5, R: 0.5, H: 0.66 + rnd() * 0.12, at: [0.85 * side, 0, 0.25], ry: rnd() * 3, taper: 0.55, peak: 0.7, lean: -side * 0.1 },
    { n: 5, R: 0.42, H: 0.78 + rnd() * 0.1, at: [-0.7 * side, 0, -0.35], ry: rnd() * 3, taper: 0.62, peak: 0.85, lean: side * 0.08 },
    { n: 4, R: 0.55, H: 0.42, at: [0.1, 0, 0.95], ry: 0.5 + rnd(), sx: 1.7, taper: 0.2, peak: 0.3, tilt: [side * 0.12, 0.05] },
    { n: 4, R: 0.22, H: 0.26, at: [1.15 * side, 0, 0.95], ry: rnd() * 3, taper: 0.15, peak: 0.25, tilt: [0.3 * side, -0.2] },
  ]
  if (v % 3 === 2) parts.push({ n: 5, R: 0.3, H: 0.5 + rnd() * 0.15, at: [-0.15, 0, -0.95], ry: rnd() * 3, taper: 0.6, peak: 0.8, lean: 0.06 })
  g = mergeGeometries(parts.map((p) => spireGeo(p, rnd, o)))
  cache.set(key, g)
  return g
}

/**
 * Une table de glace : un gros bloc à huit pans à l'encoche creusée par la houle, strates fines, crevasses, dessus presque plat.
 * Demi-largeur 1, hauteur 1 (à mettre à l'échelle [largeur / 2, hauteur, profondeur / 2]).
 */
export function tableGeo(v: number): BufferGeometry {
  const key = `t${v}`
  let g = cache.get(key)
  if (g) return g
  const rnd = seeded(90 + v * 11)
  const o: Look = { stripes: 5 + rnd() * 2, tq: v % 2 ? 0.5 : 0.15, crack: 2, waterline: true }
  g = mergeGeometries([
    spireGeo({ n: 8, R: 1, H: 1, at: [0, 0, 0], ry: rnd() * 3, taper: 0.1, peak: 0.28 }, rnd, o),
    // un éclat détaché au pied, incliné
    spireGeo({ n: 5, R: 0.22, H: 0.3, at: [0.95, 0, 0.7], ry: rnd() * 3, taper: 0.2, peak: 0.4, tilt: [0.25, -0.2] }, rnd, { ...o, crack: 0 }),
  ])
  cache.set(key, g)
  return g
}

/** Un pic de glace seul (pinacle) : un fût penché, deux éclats contre lui. */
export function pinnacleGeo(v: number): BufferGeometry {
  const key = `p${v}`
  let g = cache.get(key)
  if (g) return g
  const rnd = seeded(150 + v * 5)
  const o: Look = { stripes: 4 + rnd() * 2, tq: 0.3, crack: 2, waterline: true }
  g = mergeGeometries([
    spireGeo({ n: 6, R: 0.9, H: 1, at: [0, 0, 0], ry: rnd() * 3, taper: 0.5, peak: 0.7, lean: 0.14 }, rnd, o),
    spireGeo({ n: 5, R: 0.45, H: 0.55, at: [0.8, 0, 0.1], ry: rnd() * 3, taper: 0.6, peak: 0.8, lean: -0.08 }, rnd, o),
    spireGeo({ n: 4, R: 0.3, H: 0.38, at: [-0.7, 0, 0.35], ry: rnd() * 3, taper: 0.4, peak: 0.6, tilt: [-0.15, 0.1] }, rnd, o),
  ])
  cache.set(key, g)
  return g
}

/** Un massif posé sur l'eau : `p[1]` est le niveau de la mer ; la ligne d'eau de la forme (0,1 de haut) est mise à ce niveau. */
export function Ice({ geo, m, p, s, ry = 0 }: { geo: BufferGeometry; m: Material; p: [number, number, number]; s: [number, number, number]; ry?: number }) {
  return (
    <group position={[p[0], p[1] - 0.1 * s[1], p[2]]} rotation-y={ry} scale={s}>
      <Part geo={geo} m={m} castShadow={false} />
    </group>
  )
}
