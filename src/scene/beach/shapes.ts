import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3 } from 'three'
import { seeded } from '../paint'
import type { V3 } from '../parts'

// Les formes sur mesure du décor : tronc de palmier, palme, touffe d'herbe de dune, coque de barque.

const memo = <K, G>(m: Map<K, G>, k: K, make: () => G) => {
  let g = m.get(k)
  if (!g) m.set(k, (g = make()))
  return g
}

/**
 * Un tube qui suit un chemin et change de rayon (tronc), avec des repères transportés le long du chemin. `r(u)` le rayon de 0 à 1 ;
 * u de la texture tourne autour (0 → 1), v monte (une tuile tous les `tile` m).
 */
export function tube(pts: V3[], r: (u: number) => number, n = 16, radial = 10, tile = 0.6): BufferGeometry {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), len = curve.getLength()
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = []
  const P = new Vector3(), T = new Vector3(), N = new Vector3(1, 0, 0), B = new Vector3(), o = new Vector3()
  curve.getTangentAt(0, T)
  N.addScaledVector(T, -N.dot(T)).normalize()
  for (let i = 0; i <= n; i++) {
    const u = i / n, rr = r(u)
    curve.getPointAt(u, P)
    curve.getTangentAt(u, T)
    N.addScaledVector(T, -N.dot(T)).normalize()
    B.crossVectors(T, N).normalize()
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2
      o.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a))
      pos.push(P.x + o.x * rr, P.y + o.y * rr, P.z + o.z * rr)
      nor.push(o.x, o.y, o.z)
      uv.push(j / radial, (u * len) / tile)
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1
    idx.push(a, a + 1, b, b, a + 1, b + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** Le tronc d'un palmier : il monte en s'inclinant de `lean` (x, z) à sa hauteur `h`, s'évase au pied, s'amincit en haut. */
export function trunkGeo(h: number, lean: [number, number]): BufferGeometry {
  const pts: V3[] = [0, 0.25, 0.5, 0.75, 1].map((t): V3 => [lean[0] * t ** 1.9, h * t, lean[1] * t ** 1.9])
  return tube(pts, (u) => 0.15 * (1 - u) + 0.1 * u + 0.1 * Math.exp(-u * 16), 14, 10, 0.5)
}

const fronds = new Map<number, BufferGeometry>()
/**
 * Une palme de longueur 1 qui part de l'origine le long de +z : une nervure qui s'arque, de chaque côté des folioles longues qui
 * pendent en V et s'effilent en pointe (rien de rigide ni de pointu : le bout est arrondi par la brillance du matériau). v
 * (uv.y) va de 0 à la tige à 1 à la pointe : le vent s'en sert. Matériau double face.
 */
export function frondGeo(nl = 13): BufferGeometry {
  return memo(fronds, nl, () => {
    const pos: number[] = [], uv: number[] = []
    const rib = (u: number): [number, number] => [0.22 * u - 0.62 * u * u, u]
    const tri = (a: V3, b: V3, c: V3, ua: number[], ub: number[], uc: number[]) => { pos.push(...a, ...b, ...c); uv.push(...ua, ...ub, ...uc) }
    // la nervure : un ruban étroit, plus large à la tige
    const N = 14
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, [y0, z0] = rib(u0), [y1, z1] = rib(u1), w0 = 0.022 * (1 - u0 * 0.7), w1 = 0.022 * (1 - u1 * 0.7)
      const a: V3 = [-w0, y0, z0], b: V3 = [w0, y0, z0], c: V3 = [-w1, y1, z1], d: V3 = [w1, y1, z1]
      tri(a, b, c, [0.5, u0], [0.5, u0], [0.5, u1]); tri(c, b, d, [0.5, u1], [0.5, u0], [0.5, u1])
    }
    for (let i = 0; i < nl; i++) {
      const u = 0.1 + (0.89 * i) / (nl - 1), [ry, rz] = rib(u)
      // la longueur des folioles : courtes à la tige, les plus longues au premier tiers, puis elles raccourcissent jusqu'à la pointe
      const len = 0.27 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.95)), 0.7) * (1 - 0.35 * u)
      for (const s of [1, -1]) {
        // la foliole part sur le côté, en avant, et retombe
        const dx = s * 0.78, dy = -0.42, dz = 0.5 * (1 + u * 0.3), dl = Math.hypot(dx, dy, dz)
        const x = dx / dl, y = dy / dl, z = dz / dl, w = 0.036
        const A: V3 = [0, ry, rz - w], B: V3 = [0, ry, rz + w]
        const Ml: V3 = [x * len * 0.5, ry + y * len * 0.5 - 0.012, rz + z * len * 0.5 - w * 0.85], Mr: V3 = [x * len * 0.5, ry + y * len * 0.5 - 0.012, rz + z * len * 0.5 + w * 0.85]
        const Tp: V3 = [x * len, ry + y * len - 0.03 * len, rz + z * len]
        tri(A, B, Ml, [0.5, u], [0.5, u], [0.5, u]); tri(B, Mr, Ml, [0.5, u], [0.5, u], [0.5, u])
        tri(Ml, Mr, Tp, [0.5, u], [0.5, u], [0.5, u])
      }
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
    g.computeVertexNormals()
    return g
  })
}

let tuft: BufferGeometry | undefined
/**
 * Une touffe d'oyat (l'herbe des dunes) : des lames qui partent en gerbe et se courbent vers l'extérieur, sombres au pied, paille au
 * bout. Hauteur 1, couleurs de sommets ; v (uv.y) = la hauteur, pour le vent.
 */
export function tuftGeo(): BufferGeometry {
  if (tuft) return tuft
  const r = seeded(11), pos: number[] = [], uv: number[] = [], col: number[] = []
  const base = new Color(0x6f8f4a), mid = new Color(0x9db35e), tip = new Color(0xe6d48c), c = new Color()
  const blades = 9
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + r() * 0.5, h = 0.7 + r() * 0.3, bend = 0.25 + r() * 0.35, w = 0.034
    const cx = Math.cos(a), cz = Math.sin(a), px = -cz, pz = cx
    const row = (t: number, ww: number): [V3, V3] => {
      const out = bend * t * t * h, up = h * t
      const x = cx * (0.03 + out), z = cz * (0.03 + out)
      return [[x - px * ww, up, z - pz * ww], [x + px * ww, up, z + pz * ww]]
    }
    const [a0, b0] = row(0, w), [a1, b1] = row(0.5, w * 0.8), [a2, b2] = row(0.85, w * 0.45)
    const [tp] = row(1, 0.002)
    const put = (p: V3, t: number) => { pos.push(...p); uv.push(0.5, t); c.copy(base).lerp(mid, Math.min(1, t * 1.6)).lerp(tip, Math.max(0, t * 2 - 1)); col.push(c.r, c.g, c.b) }
    // trois bandes : pied → milieu, milieu → haut, haut → pointe
    for (const [p, t] of [[a0, 0], [b0, 0], [a1, 0.5], [b0, 0], [b1, 0.5], [a1, 0.5], [a1, 0.5], [b1, 0.5], [a2, 0.85], [b1, 0.5], [b2, 0.85], [a2, 0.85], [a2, 0.85], [b2, 0.85], [tp, 1]] as [V3, number][]) put(p, t)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.computeVertexNormals()
  return (tuft = g)
}

const hulls = new Map<string, BufferGeometry>()
/**
 * Une coque de barque, ouverte, d'une seule pièce : une carène qui s'affine en étrave à l'avant (+x) et en tableau à l'arrière, le
 * plat-bord relevé aux bouts, une paroi intérieure en bois clair et le liston qui les relie. Couleurs de sommets : la coque, un
 * bandeau clair sous le plat-bord, le bois du dedans, le liston. Longueur `L`, largeur `W` (bord à bord), hauteur du plat-bord `H`.
 */
export function hullGeo(L: number, W: number, H: number, hull: number, stripe: number): BufferGeometry {
  return memo(hulls, `${L},${W},${H},${hull},${stripe}`, () => {
    const NU = 18, NT = 6, pos: number[] = [], col: number[] = [], idx: number[] = [], c = new Color()
    const inner = new Color(0xe8c896), trim = new Color(0xb98a5e), cHull = new Color(hull), cStripe = new Color(stripe)
    // la section en u (-1 : poupe, 1 : proue) et t (0 : quille, 1 : plat-bord)
    const half = (u: number) => (W / 2) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), u > 0 ? 2.1 : 3.4)), 0.62)
    const keel = (u: number) => 0.07 * Math.pow(Math.abs(u), 2.6) * (u > 0 ? 1.4 : 0.7)
    const gun = (u: number) => H * (1 + (u > 0 ? 0.42 : 0.12) * u * u)
    const at = (u: number, s: number, th: number) => {
      // s de -1 (bâbord) à 1 (tribord) ; th : épaisseur du bordé (la paroi intérieure)
      const t = Math.abs(s), lat = Math.sign(s) * Math.max(0, half(u) * Math.sin((t * Math.PI) / 2) - th), k = keel(u), g = gun(u)
      return [(u * L) / 2, k + (g - k) * (1 - Math.cos((t * Math.PI) / 2)) + th * (t < 0.999 ? 1 : 0), lat] as V3
    }
    const ring = (th: number, color: (u: number, t: number) => Color) => {
      const base = pos.length / 3
      for (let i = 0; i <= NU; i++) for (let j = -NT; j <= NT; j++) {
        const u = -1 + (2 * i) / NU, s = j / NT, p = at(u, s, th)
        pos.push(...p); const k = color(u, Math.abs(s)); col.push(k.r, k.g, k.b)
      }
      return base
    }
    const quads = (base: number, flip: boolean) => {
      for (let i = 0; i < NU; i++) for (let j = 0; j < NT * 2; j++) {
        const a = base + i * (NT * 2 + 1) + j, b = a + NT * 2 + 1
        flip ? idx.push(a, b, a + 1, a + 1, b, b + 1) : idx.push(a, a + 1, b, b, a + 1, b + 1)
      }
    }
    // dehors : la coque, le bandeau clair près du plat-bord
    quads(ring(0, (_u, t) => (t > 0.8 ? c.copy(cStripe) : c.copy(cHull))), true)
    // dedans : le bois clair, un peu plus sombre au fond
    quads(ring(0.05, (_u, t) => c.copy(inner).multiplyScalar(0.8 + 0.2 * t)), false)
    // le liston : le dessus du plat-bord, de la paroi extérieure à l'intérieure
    const rim = pos.length / 3
    for (let i = 0; i <= NU; i++) for (const s of [-1, 1]) for (const th of [0, 0.05]) {
      const u = -1 + (2 * i) / NU, p = at(u, s, th)
      pos.push(p[0], p[1] + 0.004, p[2]); col.push(trim.r, trim.g, trim.b)
    }
    for (let i = 0; i < NU; i++) for (const s of [0, 1]) {
      const a = rim + i * 4 + s * 2, b = a + 4
      s ? idx.push(a, b, a + 1, a + 1, b, b + 1) : idx.push(a, a + 1, b, b, a + 1, b + 1)
    }
    // la fermeture de la proue et de la poupe : les deux rives se rejoignent (largeur nulle), rien à ajouter
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new Float32BufferAttribute(col, 3))
    g.setAttribute('uv', new Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  })
}
