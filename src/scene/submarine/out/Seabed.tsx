import { useMemo } from 'react'
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, TubeGeometry, Vector3 } from 'three'
import { seeded } from '../../../math'
import { Batch, SPH, cyl, noRay, type Item, type V3 } from '../../parts'
import { groundGrid, noise, sstep } from '../../outdoor'
import { Rock } from '../../nature/Rock'
import { D, coralOf } from './materials'

/** Le fond : sable à -3,4, des dunes douces, un récif qui monte derrière à gauche. */
export const FLOOR = -3.4
export function floorY(x: number, z: number) {
  const behind = -(x + z) / Math.SQRT2
  return FLOOR + noise(x * 0.3, z * 0.3) * 0.25 + 1.2 * sstep(4.5, 10, behind) + 0.6 * sstep(5, 9, -x)
}
const floorColor = (x: number, z: number): [number, number, number] => {
  const n = noise(x * 0.5 + 4, z * 0.5) * 0.06
  return [0.92 + n, 0.94 + n, 0.92 + n]
}

/** Un corail branchu : un tronc et des branches qui montent en s'écartant, bouts arrondis. */
function branchCoral(seed: number) {
  const r = seeded(seed), geos: BufferGeometry[] = []
  const add = (a: V3, b: V3, rad: number) => geos.push(new TubeGeometry(new CatmullRomCurve3([new Vector3(...a), new Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.03, (a[2] + b[2]) / 2), new Vector3(...b)]), 6, rad, 6, false))
  const tips: V3[] = []
  for (let i = 0; i < 6; i++) {
    const ang = r() * 6.3, h = 0.35 + r() * 0.3, mid: V3 = [Math.cos(ang) * 0.08, h * 0.5, Math.sin(ang) * 0.08]
    const tip: V3 = [Math.cos(ang) * (0.18 + r() * 0.12), h, Math.sin(ang) * (0.18 + r() * 0.12)]
    add([0, 0, 0], mid, 0.035); add(mid, tip, 0.028); tips.push(tip)
  }
  return { geos, tips }
}

/** Un éventail de mer : une feuille dentelée dressée (u en travers, v en hauteur : le courant la fait onduler). */
function fanGeo() {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], N = 10, M = 6
  for (let j = 0; j <= M; j++) for (let i = 0; i <= N; i++) {
    const u = i / N - 0.5, v = j / M, w = Math.sin(Math.PI * Math.min(1, v * 1.2 + 0.1)) * 0.5
    pos.push(u * w * 1.2, v * 0.7, Math.sin(u * 3) * 0.03); uv.push(u + 0.5, v)
  }
  for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + N + 1; idx.push(a, b, a + 1, a + 1, b, b + 1) }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals()
  return g
}

/** Les massifs du récif : [x, z, couleur des coraux branchus]. */
const PATCHES: [number, number, number][] = [[-5.2, 3.6, 0xf08a9a], [5.4, -3.0, 0xffb86a], [4.6, 4.8, 0xa8e0d0], [-6.2, -2.8, 0xff9a6a], [-2.2, 6.4, 0xd8a0f0], [7.0, 1.4, 0xf4d06a]]

/**
 * Le fond de la mer sous le sous-marin : du sable ridé où dansent les reflets de la surface, des roches, des massifs de corail
 * (branchus, cerveaux, éponges en tubes, éventails qui ondulent, anémones), des étoiles de mer.
 */
export function Seabed() {
  const ground = useMemo(() => {
    const g = groundGrid(0, 0, 30, 60, floorY, floorColor, 3)
    return g
  }, [])
  const reef = useMemo(() => {
    const r = seeded(41), corals: { geos: BufferGeometry[]; tips: V3[]; p: V3; s: number; c: number }[] = []
    const brains: Item[] = [], tubes: Item[] = [], anem: Item[] = [], stars: Item[] = [], fans: { p: V3; ry: number; s: number }[] = [], tipItems: Item[] = []
    PATCHES.forEach(([x, z, c], k) => {
      for (let i = 0; i < 3; i++) {
        const px = x + (r() - 0.5) * 1.4, pz = z + (r() - 0.5) * 1.4, y = floorY(px, pz), s = 0.9 + r() * 0.8
        const bc = branchCoral(k * 7 + i)
        corals.push({ ...bc, p: [px, y - 0.02, pz], s, c })
        bc.tips.forEach((t) => tipItems.push({ p: [px + t[0] * s, y + t[1] * s, pz + t[2] * s], s: 0.032 * s, c }))
      }
      const bx = x + 0.8, bz = z - 0.5
      brains.push({ p: [bx, floorY(bx, bz) + 0.08, bz], s: [0.32, 0.22, 0.3] })
      for (let i = 0; i < 4; i++) { const tx = x - 0.7 + i * 0.12, tz = z + 0.6 + (i % 2) * 0.1, h = 0.3 + r() * 0.35; tubes.push({ p: [tx, floorY(tx, tz) + h / 2, tz], s: [0.06, h, 0.06] }) }
      fans.push({ p: [x - 0.4, floorY(x - 0.4, z - 0.7), z - 0.7], ry: r() * 3, s: 0.9 + r() * 0.5 })
      for (let i = 0; i < 6; i++) { const a = r() * 6.3, ax = x + 1.0 + Math.cos(a) * 0.15, az = z + 0.4 + Math.sin(a) * 0.15; anem.push({ p: [ax, floorY(ax, az) + 0.12, az], s: [0.025, 0.14, 0.025], c: k % 2 ? 0xff7ab0 : 0x8affd8 }) }
      const sx = x + 1.2, sz = z + 1.0
      stars.push({ p: [sx, floorY(sx, sz) + 0.02, sz], s: [0.14, 0.03, 0.14], r: [0, r() * 6, 0] })
    })
    return { corals, brains, tubes, anem, stars, fans, tipItems }
  }, [])
  const fan = useMemo(fanGeo, [])
  const tube = useMemo(() => cyl(1, 0.8, 1, 10), [])
  return (
    <>
      <mesh geometry={ground} material={D.sand} receiveShadow raycast={noRay} />
      <mesh geometry={ground} material={D.caustic} position={[0, 0.02, 0]} renderOrder={2} raycast={noRay} />
      {reef.corals.map((c, i) => (
        <group key={i} position={c.p} scale={c.s}>
          {c.geos.map((g, j) => <mesh key={j} geometry={g} material={coralOf(c.c)} raycast={noRay} />)}
        </group>
      ))}
      <Batch geo={SPH} m={D.coral} items={reef.tipItems} />
      <Batch geo={SPH} m={D.brain} items={reef.brains} />
      <Batch geo={tube} m={D.sponge} items={reef.tubes} />
      <Batch geo={SPH} m={D.anemone} items={reef.anem} />
      <Batch geo={SPH} m={D.star} items={reef.stars} />
      {reef.fans.map((f, i) => <mesh key={i} geometry={fan} material={D.fan} position={f.p} rotation-y={f.ry} scale={f.s} raycast={noRay} />)}
      {[[-4.0, -4.4, 1.0, 1], [6.4, -0.8, 0.7, 3], [-1.0, 7.4, 0.6, 5], [8.0, -5.6, 1.2, 2], [-7.6, 1.0, 0.9, 4]].map(([x, z, s, v], i) => (
        <Rock key={i} v={v} p={[x, floorY(x, z) - 0.1, z]} s={[s, s * 0.7, s * 0.9]} ry={i} m={D.rock[i % 2]} shadow={false} />
      ))}
    </>
  )
}
