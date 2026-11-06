import { useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Material } from 'three'
import { seeded } from '../../../math'
import { Batch, Part, SPH, cyl, orient, type Item, type V3 } from '../../parts'
import { Foliage } from '../../nature/Foliage'
import { N } from './materials'
import { groundY } from './ground'

const branch = (pts: V3[], r0: number, r1: number) => {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)))
  const g = new TubeGeometry(curve, 16, 1, 8, false)
  // le tube s'affine de r0 à r1 : on resserre chaque anneau autour de la courbe
  const pos = g.attributes.position, n = 9, seg = 17
  for (let i = 0; i < seg; i++) {
    const c = curve.getPoint(i / 16), r = r0 + (r1 - r0) * (i / 16)
    for (let k = 0; k < n; k++) {
      const j = i * n + k, v = new Vector3().fromBufferAttribute(pos, j).sub(c).multiplyScalar(r).add(c)
      pos.setXYZ(j, v.x, v.y, v.z)
    }
  }
  g.computeVertexNormals()
  return g
}

/** Un érable du Japon : tronc qui se divise, trois ou quatre masses de feuillage rouge, orange et vermillon. */
export function Maple({ x, z, s = 1, seed = 1 }: { x: number; z: number; s?: number; seed?: number }) {
  const g = groundY(x, z)
  const r = useMemo(() => seeded(seed), [seed])
  const limbs = useMemo(() => [
    branch([[0, 0, 0], [0.05, 0.6, 0.02], [0.1, 1.1, 0.0]], 0.13, 0.08),
    branch([[0.08, 0.9, 0], [0.45, 1.35, 0.15], [0.7, 1.6, 0.25]], 0.07, 0.03),
    branch([[0.06, 0.95, 0], [-0.35, 1.4, -0.1], [-0.6, 1.65, -0.2]], 0.07, 0.03),
  ], [])
  const crowns: [V3, V3, number][] = [[[0.1, 1.75, 0], [0.75, 0.55, 0.7], 0], [[0.65, 1.62, 0.25], [0.55, 0.42, 0.5], 1], [[-0.55, 1.65, -0.2], [0.55, 0.45, 0.5], 2], [[0.0, 2.12, 0.05], [0.45, 0.35, 0.42], 1]]
  return (
    <group position={[x, g, z]} scale={s}>
      {limbs.map((l, i) => <Part key={i} geo={l} m={N.bark} />)}
      {crowns.map(([p, sc, k], i) => <Foliage key={i} v={(seed + i) % 6} p={p} s={sc} ry={r() * 6} m={N.maple[k]} shadow={false} />)}
    </group>
  )
}

/** Un pin taillé à la japonaise : tronc penché et tordu, branches horizontales, coussins de feuillage plats. */
export function Pine({ x, z, s = 1, lean = 1 }: { x: number; z: number; s?: number; lean?: number }) {
  const g = groundY(x, z)
  const geo = useMemo(() => ({
    trunk: branch([[0, 0, 0], [0.25 * lean, 0.8, 0.05], [0.05 * lean, 1.6, 0.1], [0.35 * lean, 2.3, 0.0]], 0.14, 0.06),
    a: branch([[0.1 * lean, 1.3, 0.08], [0.7 * lean, 1.4, 0.3], [1.1 * lean, 1.35, 0.4]], 0.06, 0.03),
    b: branch([[0.15 * lean, 1.9, 0.05], [-0.4 * lean, 2.0, -0.1], [-0.75 * lean, 1.95, -0.2]], 0.05, 0.025),
  }), [lean])
  const pads: [V3, V3][] = [[[1.05 * lean, 1.45, 0.4], [0.55, 0.2, 0.45]], [[-0.7 * lean, 2.05, -0.2], [0.5, 0.18, 0.4]], [[0.35 * lean, 2.42, 0], [0.55, 0.24, 0.48]], [[0.55 * lean, 1.8, 0.2], [0.35, 0.14, 0.3]]]
  return (
    <group position={[x, g, z]} scale={s}>
      <Part geo={geo.trunk} m={N.bark} />
      <Part geo={geo.a} m={N.bark} />
      <Part geo={geo.b} m={N.bark} />
      {pads.map(([p, sc], i) => <Foliage key={i} v={i + 2} p={p} s={sc} m={N.pine} style="clipped" shadow={false} />)}
    </group>
  )
}

/** La bambouseraie : des chaumes verts à nœuds, serrés, un peu penchés, et leurs bouquets de feuilles en haut. */
export function BambooGrove({ c, n = 34, r = 1.7, seed = 3 }: { c: [number, number]; n?: number; r?: number; seed?: number }) {
  const it = useMemo(() => {
    const rnd = seeded(seed), culms: Item[] = [], nodes: Item[] = [], leaves: Item[] = []
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.3, d = Math.sqrt(rnd()) * r, x = c[0] + Math.cos(a) * d, z = c[1] + Math.sin(a) * d, h = 2.8 + rnd() * 1.8
      const tx = (rnd() - 0.5) * 0.12, tz = (rnd() - 0.5) * 0.12, g = groundY(x, z), rad = 0.045 + rnd() * 0.025
      culms.push({ p: [x + tx * h / 2, g + h / 2, z + tz * h / 2], s: [rad, h, rad], r: [tz, 0, -tx] })
      for (let k = 1; k < h / 0.42; k++) nodes.push({ p: [x + tx * k * 0.42, g + k * 0.42, z + tz * k * 0.42], s: [rad * 1.18, 0.025, rad * 1.18] })
      // les feuilles en lance, par verticilles le long du haut du chaume, qui retombent un peu
      for (const f of [0.6, 0.72, 0.84, 0.96]) {
        const n0 = rnd() * 6.3
        for (let k = 0; k < 5; k++) {
          const a = n0 + k * 1.26, dir: V3 = [Math.cos(a), -0.3 - rnd() * 0.3, Math.sin(a)], y = g + h * f
          leaves.push({ p: [x + tx * h * f + dir[0] * 0.1, y + dir[1] * 0.1, z + tz * h * f + dir[2] * 0.1], s: [0.03, 0.2, 0.01], r: orient(dir, [0, 1, 0]) })
        }
      }
    }
    return { culms, nodes, leaves }
  }, [c, n, r, seed])
  const culm = useMemo(() => cyl(1, 1, 1, 8), [])
  const node = useMemo(() => cyl(1, 1, 1, 8), [])
  return (
    <>
      <Batch geo={culm} m={N.bamboo} items={it.culms} />
      <Batch geo={node} m={N.bambooNode} items={it.nodes} />
      <Batch geo={SPH} m={N.bambooLeaf as Material} items={it.leaves} />
    </>
  )
}
