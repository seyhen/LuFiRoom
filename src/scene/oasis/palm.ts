import { BufferGeometry, CatmullRomCurve3, Euler, Matrix4, Quaternion, TubeGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { seeded } from '../paint'
import { leafGeo } from '../nature/shapes'
import type { V3 } from '../parts'

// Les palmiers dattiers : le tronc (un tube qui s'effile, penché, avec les écailles de l'écorce en UV) et la couronne (des palmes
// pennées, les droites au centre, les arquées autour, les basses qui retombent), fabriqués une fois. Ils servent au palmier de la pièce
// (qui balance trois paquets de palmes) et au bosquet du dehors (la couronne en un seul maillage). Aucune géométrie de `parts.tsx` n'est transformée.

/** Un tronc de `h` de haut, dont le sommet est décalé de `lean` (x, z) ; rayon `r0` au pied (évasé), `r1` en haut. UV : écailles de 0,75 m. */
export function trunkGeo(h: number, lean: [number, number], r0 = 0.2, r1 = 0.12, bow = 0.12): BufferGeometry {
  const N = 28, R = 12
  const curve = new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(lean[0] * 0.2 - bow * 0.5, h * 0.35, lean[1] * 0.2 + bow * 0.4),
    new Vector3(lean[0] * 0.65 + bow * 0.3, h * 0.7, lean[1] * 0.65 - bow * 0.2),
    new Vector3(lean[0], h, lean[1]),
  ])
  const g = new TubeGeometry(curve, N, 1, R, false)
  const pos = g.attributes.position, uv = g.attributes.uv, c = new Vector3(), v = new Vector3()
  for (let i = 0; i <= N; i++) {
    const u = i / N
    curve.getPointAt(u, c)
    // le pied s'évase (les racines), le haut est un peu plus fin
    const r = r1 + (r0 - r1) * (1 - u) ** 2.4 + (0.05 * Math.max(0, 1 - u * 14))
    for (let j = 0; j <= R; j++) {
      const k = i * (R + 1) + j
      v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c)
      pos.setXYZ(k, v.x, v.y, v.z)
      uv.setXY(k, j / R, (u * h) / 0.75)
    }
  }
  g.computeVertexNormals()
  return g
}

/** Une palme : pennée, de demi-largeur `w` et de longueur `l`, sur la couronne (en 0, 0, 0), azimut `yaw`, élévation `pitch` (haute si grand), roulis `roll`. */
export function frondMatrix(yaw: number, pitch: number, l: number, w: number, roll = 0): Matrix4 {
  const q = new Quaternion().setFromEuler(new Euler(-pitch, yaw, 0, 'YXZ'))
  q.multiply(new Quaternion().setFromEuler(new Euler(0, 0, roll)))
  return new Matrix4().compose(new Vector3(0, 0, 0), q, new Vector3(w, (w + l) / 2, l))
}

/** Les palmes d'une couronne : `n` en tout, les plus hautes au centre. Rend leurs matrices, rangées de la plus haute à la plus basse. */
export function crownFronds(seed: number, n: number, size = 1) {
  const r = seeded(seed * 131 + 7), out: { m: Matrix4; pitch: number }[] = []
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1) // 0 : le cœur dressé, 1 : les palmes basses
    const pitch = 1.38 - k * 1.45 + (r() - 0.5) * 0.18
    const yaw = i * 2.399963 + r() * 0.3 // l'angle d'or : aucune palme n'en cache une autre
    const l = size * (1.75 + r() * 0.35 + (1 - Math.abs(k - 0.45)) * 0.25)
    out.push({ m: frondMatrix(yaw, pitch, l, size * (0.34 + r() * 0.06), (r() - 0.5) * 0.4), pitch })
  }
  return out
}

const PIN = () => leafGeo('pinnate')

/** Fusionne des palmes (leurs matrices) en un maillage, dans le repère de la couronne. */
export function mergeFronds(list: Matrix4[]): BufferGeometry {
  const geos = list.map((m) => PIN().clone().applyMatrix4(m))
  const g = mergeGeometries(geos, false)
  geos.forEach((x) => x.dispose())
  return g
}

/** Les écailles des bases de palmes autour du sommet du tronc, et un régime de dattes qui pend : deux petites couronnes, en un seul maillage chacune. */
export function bootsPoints(n: number, r: number): { p: V3; ry: number }[] {
  return Array.from({ length: n }, (_, i) => ({ p: [Math.cos((i / n) * Math.PI * 2) * r, 0, Math.sin((i / n) * Math.PI * 2) * r] as V3, ry: (i / n) * Math.PI * 2 }))
}
