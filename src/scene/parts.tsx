import { BoxGeometry, CylinderGeometry, SphereGeometry, Vector3, type BufferGeometry, type Material, type Path } from 'three'
import type { ThreeElements } from '@react-three/fiber'

export type V3 = [number, number, number]

/** À mettre en `raycast` : l'objet ne capte pas les taps (ciel, gouttes, sprites). */
export const noRay = () => {}

/** Ouverture de la fenêtre dans le mur du fond. */
export const WIN = { x0: 0.2, x1: 2.6, y0: 2.1, y1: 3.85 }

const cache = new Map<string, BufferGeometry>()
function memo<G extends BufferGeometry>(key: string, make: () => G) {
  let g = cache.get(key) as G | undefined
  if (!g) cache.set(key, (g = make()))
  return g
}

/**
 * Boîte aux arêtes arrondies, reprise telle quelle du prototype plutôt que `RoundedBox` de drei :
 * mêmes formes, et surtout mêmes UV (le parquet n'affiche qu'un septième de sa texture, d'où ses larges lames).
 */
export function rbox(w: number, h: number, d: number, r = 0.06, seg = 3) {
  return memo(`b${w},${h},${d},${r},${seg}`, () => {
    const s = seg * 2 + 1
    const g = new BoxGeometry(1, 1, 1, s, s, s)
    const rr = Math.min(r, Math.min(w, h, d) / 2 - 1e-4)
    const half = 0.5 / s, bx = w / 2 - rr, by = h / 2 - rr, bz = d / 2 - rr
    const pos = g.attributes.position, nor = g.attributes.normal, n = new Vector3()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const sx = Math.sign(x), sy = Math.sign(y), sz = Math.sign(z)
      n.set(x - sx * half, y - sy * half, z - sz * half).normalize()
      pos.setXYZ(i, sx * bx + n.x * rr, sy * by + n.y * rr, sz * bz + n.z * rr)
      nor.setXYZ(i, n.x, n.y, n.z)
    }
    return g
  })
}

export const cyl = (rt: number, rb: number, h: number, seg = 24) =>
  memo(`c${rt},${rb},${h},${seg}`, () => new CylinderGeometry(rt, rb, h, seg))

/** Sphère unité : mise à l'échelle, elle fait toutes les formes ovales. */
export const SPH = new SphereGeometry(1, 32, 22)

/** Contour de rectangle arrondi (mur, cadre de fenêtre). */
export function rrPath<P extends Path>(p: P, x: number, y: number, w: number, h: number, r: number) {
  p.moveTo(x + r, y)
  p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r)
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r)
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y)
  return p
}

/** Un maillage qui porte et reçoit les ombres. `geo` ou une géométrie en enfant. */
export function Part({ geo, m, p, ...rest }: { geo?: BufferGeometry; m: Material; p?: V3 } & ThreeElements['mesh']) {
  return <mesh geometry={geo} material={m} position={p} castShadow receiveShadow {...rest} />
}
