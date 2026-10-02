import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { BoxGeometry, Color, CylinderGeometry, Euler, ExtrudeGeometry, Matrix4, Object3D, Path, Shape, SphereGeometry, Vector3, type BufferGeometry, type InstancedMesh, type Material } from 'three'
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

/**
 * Copie de `g` dont les UV suivent les unités de la scène (projetées selon l'orientation de chaque face) :
 * une texture répétée (pierre, tartan) garde la même taille sur toutes les faces, sans s'étirer. `size` : unités par texture.
 * Sur le dessus, la texture file le long de x, ou de z avec `along: 'z'` (le sens des lames d'un parquet).
 */
export function worldUV(g: BufferGeometry, size = 1, along: 'x' | 'z' = 'x') {
  return memo(`w${g.uuid},${size},${along}`, () => {
    const c = g.clone(), p = c.attributes.position, n = c.attributes.normal, uv = c.attributes.uv
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i))
      if (ay >= ax && ay >= az) along === 'x' ? uv.setXY(i, p.getX(i) / size, p.getZ(i) / size) : uv.setXY(i, p.getZ(i) / size, p.getX(i) / size)
      else if (ax >= az) uv.setXY(i, p.getZ(i) / size, p.getY(i) / size)
      else uv.setXY(i, p.getX(i) / size, p.getY(i) / size)
    }
    return c
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

// Mur du fond, percé de la fenêtre. Deux emplois pour le matériau : [grandes faces, chants (dont l'embrasure)].
const wallShape = rrPath(new Shape(), -3.34, -0.05, 6.54, 4.35, 0.12)
wallShape.holes.push(rrPath(new Path(), WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 0.16))
export const backWall = new ExtrudeGeometry(wallShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 10 })

const radii = new WeakMap<BufferGeometry, number>()
const radiusOf = (g: BufferGeometry) => {
  let r = radii.get(g)
  if (r === undefined) {
    g.computeBoundingSphere()
    radii.set(g, (r = g.boundingSphere?.radius ?? 1))
  }
  return r
}
const biggest = (s: unknown) => (typeof s === 'number' ? s : Array.isArray(s) ? Math.max(...s.map(Math.abs)) : 1)

/**
 * Un maillage qui reçoit les ombres, et qui en porte sauf s'il est tout petit (boutons, crayons, perles : leur ombre ne se voit pas
 * et chaque ombre coûte un tracé de plus). `geo` ou une géométrie en enfant ; `castShadow` force le choix.
 */
export function Part({ geo, m, p, ...rest }: { geo?: BufferGeometry; m: Material | Material[]; p?: V3 } & ThreeElements['mesh']) {
  const tiny = geo !== undefined && radiusOf(geo) * biggest(rest.scale) < 0.09
  return <mesh geometry={geo} material={m} position={p} castShadow={!tiny} receiveShadow {...rest} />
}

const bx = new Vector3(), by = new Vector3(), bz = new Vector3(), bm = new Matrix4(), be = new Euler()
/**
 * Rotation (x, y, z) qui met l'axe y d'une forme le long de `y` et son axe z du côté de `up` : un tronc dans sa direction,
 * une feuille dont la pointe suit sa tige et dont le dessus regarde le ciel.
 */
export function orient(y: V3, up: V3 = [0, 1, 0]): V3 {
  by.set(...y).normalize()
  bz.set(...up)
  bx.crossVectors(by, bz)
  if (bx.lengthSq() < 1e-6) bx.crossVectors(by, bz.set(1, 0, 0))
  bx.normalize()
  bz.crossVectors(bx, by)
  be.setFromRotationMatrix(bm.makeBasis(bx, by, bz))
  return [be.x, be.y, be.z]
}

/** Une copie dans un `Batch` : position, échelle, rotation (XYZ), teinte. */
export interface Item {
  p: V3
  s: V3 | number
  r?: V3
  c?: number
}
const dummy = new Object3D(), tint = new Color()

/**
 * Une série de copies d'une même forme (boules du sapin, feuillage, paquets) : un seul tracé pour toute la série.
 * Posées une fois ; `c` teinte chaque copie (le matériau reste blanc). La ref donne accès aux copies (ampoules qui scintillent).
 */
export const Batch = forwardRef<InstancedMesh, { geo: BufferGeometry; m: Material; items: Item[]; shadow?: boolean }>(function Batch(
  { geo, m, items, shadow = false },
  ref,
) {
  const mesh = useRef<InstancedMesh>(null!)
  useImperativeHandle(ref, () => mesh.current)
  useLayoutEffect(() => {
    const g = mesh.current
    items.forEach(({ p, s, r = [0, 0, 0], c }, i) => {
      dummy.position.set(...p)
      if (typeof s === 'number') dummy.scale.setScalar(s)
      else dummy.scale.set(...s)
      dummy.rotation.set(...r)
      dummy.updateMatrix()
      g.setMatrixAt(i, dummy.matrix)
      if (c !== undefined) g.setColorAt(i, tint.setHex(c))
    })
    g.instanceMatrix.needsUpdate = true
    if (g.instanceColor) g.instanceColor.needsUpdate = true
    g.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={mesh} args={[geo, m, items.length]} castShadow={shadow} receiveShadow raycast={noRay} />
})
