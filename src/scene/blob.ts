import { BufferGeometry, Color, Euler, Float32BufferAttribute, Matrix4, Vector3 } from 'three'
import type { V3 } from './parts'

/**
 * Des créatures « gummy » d'une seule peau : on décrit un corps avec quelques volumes (ellipsoïdes, cônes arrondis) qui se fondent
 * les uns dans les autres par union lisse, et `blob` en fait UN maillage continu, une seule fois, au chargement (surface nets sur
 * un champ de distance). Plus de jonctions visibles entre la tête, les joues, le museau, les pattes : le volume coule d'une forme
 * à l'autre comme dans une figurine en gomme. Chaque volume porte sa couleur ; elle se mélange aux jonctions (attribut `color` du
 * maillage : matériau en `vertexColors: true`). Un `paint` optionnel repeint chaque sommet (rayures, taches).
 *
 * Repère : celui de la pièce (y vers le haut). Un volume `add` s'unit au corps, un volume `sub` le creuse (orbite, creux d'oreille,
 * bouche). `k` est le rayon de fondu de l'union (plus il est grand, plus le raccord est doux) ; 0,03 à 0,06 pour un chat.
 *
 * Coût : ~30 à 80 ms par créature au premier appel, 4 000 à 10 000 triangles (h = 0,02) ; garde le résultat dans un `useMemo` / une
 * constante de module, et mets une créature immobile dans `<Static>` (la couleur des sommets est conservée à la fusion).
 */
export type Blob =
  | { t: 'ell'; c: V3; r: V3; rot?: V3; color?: number; k?: number; op?: 'add' | 'sub' }
  | { t: 'cone'; a: V3; b: V3; ra: number; rb: number; color?: number; k?: number; op?: 'add' | 'sub' }

/** Un ellipsoïde de centre `c` et de demi-axes `r` (un nombre pour une sphère), incliné de `rot` (Euler XYZ, radians). */
export const ell = (c: V3, r: V3 | number, o: { rot?: V3; color?: number; k?: number; op?: 'add' | 'sub' } = {}): Blob => ({ t: 'ell', c, r: typeof r === 'number' ? [r, r, r] : r, ...o })
/** Un cône arrondi (une capsule qui s'effile) de `a` (rayon `ra`) à `b` (rayon `rb`) : pattes, queue, cou, oreilles. */
export const cone = (a: V3, b: V3, ra: number, rb: number, o: { color?: number; k?: number; op?: 'add' | 'sub' } = {}): Blob => ({ t: 'cone', a, b, ra, rb, ...o })
/** Le même volume, en miroir par rapport au plan `axis` = 0 (x, y ou z) : la paire d'yeux, d'oreilles, de pattes. */
export function mirror(b: Blob, axis: 'x' | 'y' | 'z' = 'z'): Blob {
  const i = axis === 'x' ? 0 : axis === 'y' ? 1 : 2, f = (p: V3): V3 => p.map((v, j) => (j === i ? -v : v)) as V3
  if (b.t === 'cone') return { ...b, a: f(b.a), b: f(b.b) }
  // le miroir d'une rotation : les deux autres axes changent de signe
  const rot = b.rot && (b.rot.map((v, j) => (j === i ? v : -v)) as V3)
  return { ...b, c: f(b.c), rot }
}
/** Un volume et son miroir. */
export const pair = (b: Blob, axis: 'x' | 'y' | 'z' = 'z'): Blob[] => [b, mirror(b, axis)]

interface Opts {
  /** Taille d'une cellule du champ (0,02 : un chat de 50 cm, ~6 000 triangles ; 0,012 pour un gros plan, 25 000). */
  h?: number
  /** Fondu par défaut des unions. */
  k?: number
  /** Repeint un sommet : `p` position, `base` la couleur mélangée ; renvoie la couleur finale (modifie `base` et rends-la). */
  paint?: (p: Vector3, base: Color) => Color
  /** Marge autour de la boîte englobante (pour le fondu). */
  pad?: number
}

const tmp = new Vector3(), q = new Vector3()
const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b)
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

interface Compiled {
  src: Blob
  inv: Matrix4 | null
  c: Vector3
  /** Sphère qui contient le volume : sert à ne pas calculer ceux qui sont trop loin pour compter. */
  ctr: Vector3
  rad: number
  col: Color
  k: number
  sub: boolean
}

function distance(p: Vector3, b: Compiled) {
  const s = b.src
  if (s.t === 'ell') {
    // un vecteur à part : `p` peut être `tmp` lui-même (le calcul des normales appelle field(tmp.set(...)))
    q.copy(p).sub(b.c)
    if (b.inv) q.applyMatrix4(b.inv)
    const [rx, ry, rz] = s.r
    const ax = q.x / rx, ay = q.y / ry, az = q.z / rz
    const k0 = Math.hypot(ax, ay, az)
    const k1 = Math.hypot(q.x / (rx * rx), q.y / (ry * ry), q.z / (rz * rz))
    return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1
  }
  // cône arrondi (Inigo Quilez)
  const [ax, ay, az] = s.a, [bx, by, bz] = s.b
  const bax = bx - ax, bay = by - ay, baz = bz - az, l2 = bax * bax + bay * bay + baz * baz
  const rr = s.ra - s.rb, a2 = l2 - rr * rr, il2 = 1 / l2
  const pax = p.x - ax, pay = p.y - ay, paz = p.z - az
  const y = pax * bax + pay * bay + paz * baz, z = y - l2
  const qx = pax * l2 - bax * y, qy = pay * l2 - bay * y, qz = paz * l2 - baz * y
  const x2 = qx * qx + qy * qy + qz * qz, y2 = y * y * l2, z2 = z * z * l2
  const k = Math.sign(rr) * rr * rr * x2
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - s.rb
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - s.ra
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - s.ra
}

/** Fabrique le maillage continu d'une liste de volumes (voir l'en-tête). */
/** Des volumes, ou des listes (imbriquées à volonté) de volumes. */
export type Parts = Blob | Parts[]
const flatten = (p: Parts): Blob[] => (Array.isArray(p) ? p.flatMap(flatten) : [p])

export function blob(parts: Parts, { h = 0.02, k: K = 0.04, paint, pad = 0.06 }: Opts = {}): BufferGeometry {
  const list: Compiled[] = flatten(parts).map((src) => {
    let inv: Matrix4 | null = null
    if (src.t === 'ell' && src.rot) inv = new Matrix4().makeRotationFromEuler(new Euler(...src.rot)).invert()
    const ctr = new Vector3(...(src.t === 'ell' ? src.c : [(src.a[0] + src.b[0]) / 2, (src.a[1] + src.b[1]) / 2, (src.a[2] + src.b[2]) / 2]))
    const rad = src.t === 'ell' ? Math.max(...src.r) : new Vector3(...src.a).distanceTo(new Vector3(...src.b)) / 2 + Math.max(src.ra, src.rb)
    return { src, inv, c: new Vector3(...(src.t === 'ell' ? src.c : [0, 0, 0])), ctr, rad, col: new Color(src.color ?? 0xffffff), k: src.k ?? K, sub: src.op === 'sub' }
  })
  const adds = list.filter((b) => !b.sub), subs = list.filter((b) => b.sub)
  const field = (p: Vector3) => {
    // un volume dont toute la sphère englobante est à plus de `k` au-delà de ce qu'on a déjà ne change rien à l'union lisse
    // (smin vaut alors le minimum) : on ne le calcule pas. Même résultat, bien moins d'appels.
    let d = 1e9
    for (const b of adds) if (p.distanceTo(b.ctr) - b.rad < d + b.k) d = smin(d, distance(p, b), b.k)
    for (const b of subs) if (p.distanceTo(b.ctr) - b.rad < b.k - d) d = smax(d, -distance(p, b), b.k)
    return d
  }
  // la boîte englobante des volumes « add »
  const lo = new Vector3(1e9, 1e9, 1e9), hi = new Vector3(-1e9, -1e9, -1e9)
  for (const { src } of adds) {
    const pts: V3[] = src.t === 'ell' ? [src.c] : [src.a, src.b], r = src.t === 'ell' ? Math.max(...src.r) : Math.max(src.ra, src.rb)
    for (const q of pts) for (let i = 0; i < 3; i++) { lo.setComponent(i, Math.min(lo.getComponent(i), q[i] - r)); hi.setComponent(i, Math.max(hi.getComponent(i), q[i] + r)) }
  }
  lo.subScalar(pad); hi.addScalar(pad)
  const nx = Math.ceil((hi.x - lo.x) / h) + 1, ny = Math.ceil((hi.y - lo.y) / h) + 1, nz = Math.ceil((hi.z - lo.z) / h) + 1
  const val = new Float32Array(nx * ny * nz), id = (i: number, j: number, k: number) => i + nx * (j + ny * k)
  const P = new Vector3()
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) val[id(i, j, k)] = field(P.set(lo.x + i * h, lo.y + j * h, lo.z + k * h))

  // surface nets : un sommet par cellule traversée par la surface, un quad par arête traversée
  const cellOf = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1), cid = (i: number, j: number, k: number) => i + (nx - 1) * (j + (ny - 1) * k)
  const pos: number[] = [], idx: number[] = []
  const CORNER = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]]
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]]
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const v = CORNER.map(([a, b, c]) => val[id(i + a, j + b, k + c)])
    let neg = 0
    for (const x of v) if (x < 0) neg++
    if (neg === 0 || neg === 8) continue
    let sx = 0, sy = 0, sz = 0, n = 0
    for (const [a, b] of EDGES) {
      if (v[a] < 0 === v[b] < 0) continue
      const t = v[a] / (v[a] - v[b]), ca = CORNER[a], cb = CORNER[b]
      sx += ca[0] + (cb[0] - ca[0]) * t; sy += ca[1] + (cb[1] - ca[1]) * t; sz += ca[2] + (cb[2] - ca[2]) * t
      n++
    }
    cellOf[cid(i, j, k)] = pos.length / 3
    pos.push(lo.x + (i + sx / n) * h, lo.y + (j + sy / n) * h, lo.z + (k + sz / n) * h)
  }
  // les quads : pour chaque arête du champ qui change de signe, les quatre cellules qui la partagent
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => (flip ? idx.push(a, c, b, a, d, c) : idx.push(a, b, c, a, c, d))
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const a = val[id(i, j, k)] < 0
    for (let axis = 0; axis < 3; axis++) {
      const di = axis === 0 ? 1 : 0, dj = axis === 1 ? 1 : 0, dk = axis === 2 ? 1 : 0
      if (a === val[id(i + di, j + dj, k + dk)] < 0) continue
      // les quatre cellules autour de l'arête, dans l'ordre du tour
      const u = axis === 0 ? [0, 1, 0] : axis === 1 ? [0, 0, 1] : [1, 0, 0], w = axis === 0 ? [0, 0, 1] : axis === 1 ? [1, 0, 0] : [0, 1, 0]
      const c = (s: number, t: number) => cellOf[cid(i - (s ? u[0] : 0) - (t ? w[0] : 0), j - (s ? u[1] : 0) - (t ? w[1] : 0), k - (s ? u[2] : 0) - (t ? w[2] : 0))]
      const q0 = c(0, 0), q1 = c(1, 0), q2 = c(1, 1), q3 = c(0, 1)
      if (q0 < 0 || q1 < 0 || q2 < 0 || q3 < 0) continue
      quad(q0, q1, q2, q3, !a)
    }
  }
  // un peu de lissage des sommets (Laplacien léger), puis projection sur la vraie surface ; normales = gradient du champ
  const nv = pos.length / 3, nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), uv = new Float32Array(nv * 2)
  const g = new Vector3(), C = new Color(), eps = h * 0.5
  for (let v = 0; v < nv; v++) {
    P.set(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])
    for (let it = 0; it < 1; it++) {
      const d = field(P)
      g.set(field(tmp.set(P.x + eps, P.y, P.z)) - field(tmp.set(P.x - eps, P.y, P.z)), field(tmp.set(P.x, P.y + eps, P.z)) - field(tmp.set(P.x, P.y - eps, P.z)), field(tmp.set(P.x, P.y, P.z + eps)) - field(tmp.set(P.x, P.y, P.z - eps)))
      const len = g.length() || 1
      P.addScaledVector(g, -d / len)
    }
    pos[v * 3] = P.x; pos[v * 3 + 1] = P.y; pos[v * 3 + 2] = P.z
    g.set(field(tmp.set(P.x + eps, P.y, P.z)) - field(tmp.set(P.x - eps, P.y, P.z)), field(tmp.set(P.x, P.y + eps, P.z)) - field(tmp.set(P.x, P.y - eps, P.z)), field(tmp.set(P.x, P.y, P.z + eps)) - field(tmp.set(P.x, P.y, P.z - eps))).normalize()
    nor[v * 3] = g.x; nor[v * 3 + 1] = g.y; nor[v * 3 + 2] = g.z
    // la couleur : moyenne des volumes qui comptent ici, pondérée par leur proximité de la surface
    let wsum = 0, r = 0, gg = 0, bb = 0, dmin = 1e9
    // (les volumes à plus de 3 k + 3 cm n'ont plus de poids : on ne les calcule pas)
    const ds = adds.map((b) => { if (P.distanceTo(b.ctr) - b.rad > b.k * 3 + 0.03) return 1e9; const d = distance(P, b); if (d < dmin) dmin = d; return d })
    adds.forEach((b, i) => {
      if (ds[i] > 1e8) return
      const w = Math.exp(-Math.max(0, ds[i] - dmin) / (b.k * 0.5 + 1e-4))
      wsum += w; r += b.col.r * w; gg += b.col.g * w; bb += b.col.b * w
    })
    C.setRGB(r / wsum, gg / wsum, bb / wsum)
    if (paint) C.copy(paint(P, C))
    col[v * 3] = C.r; col[v * 3 + 1] = C.g; col[v * 3 + 2] = C.b
    uv[v * 2] = P.x * 2; uv[v * 2 + 1] = P.z * 2
  }
  // l'orientation des faces suit les normales du champ (le sens du tour des quads varie selon l'axe de l'arête)
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2]
    const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2]
    const vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1], vz = pos[c * 3 + 2] - pos[a * 3 + 2]
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx
    const d = fx * (nor[a * 3] + nor[b * 3] + nor[c * 3]) + fy * (nor[a * 3 + 1] + nor[b * 3 + 1] + nor[c * 3 + 1]) + fz * (nor[a * 3 + 2] + nor[b * 3 + 2] + nor[c * 3 + 2])
    if (d < 0) { idx[t + 1] = c; idx[t + 2] = b }
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  geo.setAttribute('color', new Float32BufferAttribute(col, 3))
  geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeBoundingSphere()
  return geo
}
