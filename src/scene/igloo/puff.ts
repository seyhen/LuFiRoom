import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3 } from 'three'
import { TAU } from '../../math'

/**
 * Un boudin qui suit une courbe et dont le rayon change le long du chemin : le corps roulé du husky, sa queue, le sac de couchage,
 * la couverture jetée dessus. La section est une ellipse aplatie (`up` au-dessus, `down` en dessous : un ventre posé, un duvet
 * gonflé sur un fond plat). Les UV suivent la forme : u le long du chemin (0 → 1), v autour (0 en dessous, 0,25 côté B, 0,5
 * dessus, 0,75 côté opposé), pour peindre un pelage ou des coutures au bon endroit. B est T × haut : à gauche du chemin vu de dessus
 * (pour un chemin qui file vers +x, B est +z, le côté de la caméra). `phi0` / `phi1` ouvrent la section (une couverture).
 */
export function puff(
  pts: Vector3[],
  r: (u: number) => number,
  { n = 48, radial = 20, up = 1, down = 1, phi0 = -Math.PI / 2, phi1 = phi0 + TAU }: { n?: number; radial?: number; up?: number; down?: number; phi0?: number; phi1?: number } = {},
) {
  const curve = new CatmullRomCurve3(pts), pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = []
  const P = new Vector3(), T = new Vector3(), N = new Vector3(), B = new Vector3(), Y = new Vector3(0, 1, 0), o = new Vector3()
  for (let i = 0; i <= n; i++) {
    const u = i / n, rr = r(u)
    curve.getPointAt(u, P)
    curve.getTangentAt(u, T)
    N.copy(Y).addScaledVector(T, -Y.dot(T)).normalize()
    B.crossVectors(T, N).normalize()
    for (let j = 0; j <= radial; j++) {
      const f = phi0 + ((phi1 - phi0) * j) / radial, c = Math.cos(f), s = Math.sin(f), k = s > 0 ? up : down
      pos.push(P.x + rr * (c * B.x + s * k * N.x), P.y + rr * (c * B.y + s * k * N.y), P.z + rr * (c * B.z + s * k * N.z))
      // la normale d'une ellipse : le gradient (c, s / k), pas le rayon
      o.copy(B).multiplyScalar(c).addScaledVector(N, s / k).normalize()
      nor.push(o.x, o.y, o.z)
      uv.push(u, (f + Math.PI / 2) / TAU)
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** Des points sur un arc horizontal de centre (0, y, 0) et de rayon R, de l'angle a0 à a1 (degrés ; 0° vers +x, 90° vers +z). */
export const arc = (R: number, y: number, a0: number, a1: number, k = 12) =>
  Array.from({ length: k + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / k) * Math.PI) / 180
    return new Vector3(Math.cos(a) * R, y, Math.sin(a) * R)
  })
