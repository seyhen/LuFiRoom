import { useMemo } from 'react'
import { ExtrudeGeometry, RingGeometry, Shape, BufferGeometry, Float32BufferAttribute, Color } from 'three'
import { SphereGeometry } from 'three'
import { SPH_LO } from '../igloo/spheres'
const SPH_TINY = new SphereGeometry(1, 7, 5)
import { Rock } from '../nature/Rock'
import { Batch, cyl, rbox, type Item, type V3 } from '../parts'
import { Part } from './deco'
import { seeded } from '../paint'
import { B } from './materials'
import { C, LAND, WATER, groundY, inland, onGround } from './isle'
import { tube, tuftGeo } from './shapes'
import { S } from './surroundMaterials'

const hullClear = (x: number, z: number, m = 1.2) => Math.max(-3.5 - x, x - 3.36, -3.5 - z, z - 3.36) > m

/** Les rochers du rivage : à gauche en tas moussu, à droite des chicots dans l'eau (avec leur écume, voir `FoamRings`). */
export const ROCKS: { p: [number, number]; s: V3; v: number; ry: number; dark?: boolean; moss?: boolean }[] = [
  { p: [-8.4, 3.8], s: [0.7, 0.55, 0.6], v: 1, ry: 0.4, moss: true },
  // en mer
  { p: [8.9, -4.4], s: [0.9, 1.25, 0.8], v: 2, ry: 0.7 },
  { p: [9.9, -3.2], s: [0.5, 0.6, 0.45], v: 5, ry: 2.2, dark: true },
  { p: [-9.8, 1.2], s: [0.7, 0.9, 0.65], v: 2, ry: 3 },
]
/** Les ronds d'écume qui entourent ce qui sort de l'eau (rochers, poteaux du ponton). */
export const RING_AT: [number, number, number][] = [
  ...ROCKS.filter((r) => inland(r.p[0], r.p[1]) < 0.3).map((r): [number, number, number] => [r.p[0], r.p[1], Math.max(r.s[0], r.s[2]) * 1.5]),
]

export function Rocks() {
  return (
    <>
      {ROCKS.map((r, i) => (
        <Rock key={i} v={r.v} p={onGround(r.p[0], r.p[1], -0.04)} s={r.s} ry={r.ry} m={S.rock} moss={r.moss ? S.algaeMoss : undefined} shadow={false} />
      ))}
    </>
  )
}

const RING = new RingGeometry(0.62, 0.95, 20)
export function FoamRings({ extra = [] as [number, number, number][] }) {
  const items = useMemo<Item[]>(() => [...RING_AT, ...extra].map(([x, z, r]) => ({ p: [x, WATER + 0.02, z], s: r, r: [-Math.PI / 2, 0, 0] })), [extra])
  return <Batch geo={RING} m={S.foamRing} items={items} />
}

const star = (() => {
  const sh = new Shape(), n = 5
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 0.34 : 1
    i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const g = new ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.16, bevelSegments: 1 })
  g.rotateX(-Math.PI / 2)
  return g
})()

/** Des coquillages, des dollars des sables et des étoiles de mer, semés le long de la laisse de mer (là où la vague s'arrête). */
export function Shells() {
  const { shells, stars, dollars } = useMemo(() => {
    const r = seeded(8), sh: Item[] = [], st: Item[] = [], dl: Item[] = []
    const cols = [0xfde7da, 0xf7c3b4, 0xfff4e6, 0xe9b6a0, 0xf9d6c4]
    let tries = 0
    while (sh.length < 24 && tries++ < 900) {
      const a = r() * Math.PI * 2, d = 0.25 + r() * 1.5, rad = 8.5 + (r() - 0.5) * 3
      // on parcourt des points au hasard, on garde ceux qui sont sur la plage mouillée et visibles (pas derrière la pièce)
      const x = C.x + Math.cos(a) * rad, z = C.z + Math.sin(a) * rad
      if (Math.abs(inland(x, z) - d) > 0.35 || inland(x, z) < 0.25) continue
      const s = 0.05 + r() * 0.05, y = groundY(x, z)
      if (a > 0.1 && a < 3.0 && r() < 0.8 || r() < 0.4) {
        if (r() < 0.8) sh.push({ p: [x, y + s * 0.3, z], s: [s * 1.3, s * 0.7, s], r: [0, r() * 6, 0.1], c: cols[(r() * cols.length) | 0] })
        else dl.push({ p: [x, y + 0.012, z], s: [0.09, 0.025, 0.09], r: [0, 0, 0], c: 0xfaf3e6 })
      }
    }
    for (const [a, d] of [[0.9, 0.8], [2.2, 1.2], [-0.4, 0.9], [1.7, 0.6]]) {
      for (let k = 0; k < 40; k++) {
        const rad = 7.5 + k * 0.05, x = C.x + Math.cos(a) * rad, z = C.z + Math.sin(a) * rad
        if (inland(x, z) > d - 0.1 && inland(x, z) < d + 0.1) { st.push({ p: [x, groundY(x, z) + 0.02, z], s: 0.17, r: [0, r() * 6, 0], c: k % 2 ? 0xf08a76 : 0xf5a98e }); break }
      }
    }
    return { shells: sh, stars: st, dollars: dl }
  }, [])
  return (
    <>
      <Batch geo={SPH_TINY} m={B.shell} items={[...shells, ...dollars]} />
      <Batch geo={star} m={S.star} items={stars} />
    </>
  )
}

/** L'oyat des dunes : des touffes qui plient dans le vent, plus hautes sur les crêtes. */
export function DuneGrass() {
  const items = useMemo<Item[]>(() => {
    const r = seeded(14), out: Item[] = []
    let tries = 0
    while (out.length < 32 && tries++ < 3000) {
      const x = C.x + (r() - 0.5) * 18, z = C.z + (r() - 0.5) * 18, d = inland(x, z), y = groundY(x, z)
      // sur la dune ou en lisière du sable sec, jamais sur la plage mouillée ni contre la coque
      if (d < 2.4 || !hullClear(x, z, 1.4) || (y < LAND + 0.1 && r() < 0.85)) continue
      if (Math.abs(x - 5.1) < 1.6 && z < 0.4 || (x > 3.2 && x < 5 && Math.abs(z + 0.6) < 1.2)) continue
      const k = 0.5 + r() * 0.7
      out.push({ p: [x, y - 0.02, z], s: [k * 0.9, k * (0.8 + y * 0.8), k * 0.9], r: [0, r() * 6, 0], c: r() < 0.3 ? 0xf0e6b8 : 0xffffff })
    }
    return out
  }, [])
  return <Batch geo={tuftGeo()} m={S.grass} items={items} />
}

/** Une branche de bois flotté échouée, blanchie par le sel : un tronc qui se courbe, deux moignons, une extrémité cassée. */
export function Driftwood({ at, ry = 0, s = 1 }: { at: [number, number]; ry?: number; s?: number }) {
  const geo = useMemo(() => tube([[-0.9, 0.02, 0.1], [-0.3, 0.07, -0.05], [0.3, 0.1, 0.06], [0.95, 0.04, -0.1]], (u) => 0.1 - u * 0.045, 10, 8, 0.5), [])
  return (
    <group position={onGround(at[0], at[1], 0.03)} rotation-y={ry} scale={s}>
      <Part geo={geo} m={S.driftwood} castShadow={false} />
      <Part geo={cyl(0.03, 0.045, 0.3, 7)} m={S.driftwood} p={[0.1, 0.22, 0.04]} rotation={[0.4, 0, -0.3]} castShadow={false} />
      <Part geo={cyl(0.025, 0.035, 0.22, 7)} m={S.driftwood} p={[-0.45, 0.17, -0.03]} rotation={[-0.5, 0, 0.3]} castShadow={false} />
    </group>
  )
}

// La toile du parasol : un dôme de huit fuseaux alternés corail et crème, au bord festonné.
const canopy = (() => {
  const G = 8, SEG = 4, RINGS = 6, R = 1.25, Hh = 0.42, pos: number[] = [], col: number[] = [], idx: number[] = [], c = new Color()
  const a = new Color(0xf08a76), b = new Color(0xfbf1e2)
  for (let k = 0; k <= RINGS; k++) for (let i = 0; i <= G * SEG; i++) {
    const t = k / RINGS, ph = (k / RINGS) * 1.15, th = (i / (G * SEG)) * Math.PI * 2
    const scallop = k === RINGS ? 0.07 * Math.pow(Math.abs(Math.sin((i / SEG) * Math.PI)), 0.6) : 0
    pos.push(Math.cos(th) * R * Math.sin(ph) * (1 + (k === RINGS ? 0.03 : 0)), Hh * Math.cos(ph) - scallop, Math.sin(th) * R * Math.sin(ph))
    c.copy(Math.floor(i / SEG) % 2 ? a : b); col.push(c.r, c.g, c.b)
    void t
  }
  for (let k = 0; k < RINGS; k++) for (let i = 0; i < G * SEG; i++) {
    const p = k * (G * SEG + 1) + i, q = p + G * SEG + 1
    idx.push(p, q, p + 1, p + 1, q, q + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.setAttribute('uv', new Float32BufferAttribute(new Array(pos.length / 3 * 2).fill(0), 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
})()

/** Le coin du baigneur : parasol rayé, serviette, tongs, noix de coco et son bouquin. */
export function Parasol({ at }: { at: [number, number] }) {
  return (
    <group position={onGround(at[0], at[1], 0)}>
      <group rotation={[0.05, 0, -0.1]}>
        <Part geo={cyl(0.028, 0.034, 2.35, 8)} m={B.trim} p={[0, 1.05, 0]} castShadow={false} />
        <Part geo={canopy} m={S.canvas} p={[0, 2.05, 0]} />
        <Part geo={SPH_LO} m={B.coral} p={[0, 2.5, 0]} scale={0.06} castShadow={false} />
        <Part geo={cyl(0.05, 0.05, 0.05, 8)} m={S.iron} p={[0, 1.9, 0]} castShadow={false} />
      </group>
      <Part geo={cyl(0.07, 0.1, 0.1, 8)} m={B.sand} p={[0, 0.02, 0]} castShadow={false} />
      <group position={[0.55, 0.012, 0.55]} rotation-y={-0.5}>
        <Part geo={rbox(0.85, 0.02, 1.6, 0.008, 1)} m={S.towel} castShadow={false} />
        <Part geo={rbox(0.5, 0.06, 0.2, 0.025, 2)} m={B.linen} p={[0, 0.05, -0.62]} castShadow={false} />
        <Part geo={rbox(0.24, 0.045, 0.32, 0.015, 1)} m={B.navy} p={[0.12, 0.04, 0.2]} rotation-y={0.3} castShadow={false} />
        <Part geo={rbox(0.2, 0.012, 0.28, 0.006, 1)} m={B.linen} p={[0.12, 0.066, 0.2]} rotation-y={0.3} castShadow={false} />
      </group>
      {[-0.1, 0.1].map((o) => <Part key={o} geo={rbox(0.11, 0.03, 0.26, 0.012, 1)} m={B.turquoise} p={[1.3 + o, 0.02, 1.15 - o]} rotation-y={0.5 + o} castShadow={false} />)}
      {/* la noix de coco et sa paille */}
      <Part geo={SPH_LO} m={S.coconut} p={[-0.6, 0.12, 0.7]} scale={[0.11, 0.1, 0.11]} castShadow={false} />
      <Part geo={cyl(0.008, 0.008, 0.26, 5)} m={B.coral} p={[-0.58, 0.28, 0.7]} rotation-z={0.3} castShadow={false} />
    </group>
  )
}

/** Un château de sable, à trois tours crénelées autour du donjon, un fanion planté dessus. */
export function SandCastle({ at }: { at: [number, number] }) {
  return (
    <group position={onGround(at[0], at[1], -0.03)}>
      <Part geo={cyl(0.55, 0.62, 0.14, 14)} m={S.castle} p={[0, 0.07, 0]} castShadow={false} />
      <Part geo={cyl(0.2, 0.26, 0.5, 12)} m={S.castle} p={[0, 0.38, 0]} castShadow={false} />
      <Part geo={cyl(0.24, 0.2, 0.07, 12)} m={S.castle} p={[0, 0.66, 0]} castShadow={false} />
      {[0, 1, 2].map((i) => {
        const a = i * 2.1 + 0.4
        return (
          <group key={i} position={[Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42]}>
            <Part geo={cyl(0.1, 0.13, 0.36, 10)} m={S.castle} p={[0, 0.3, 0]} castShadow={false} />
            <Part geo={cyl(0.125, 0.1, 0.05, 10)} m={S.castle} p={[0, 0.5, 0]} castShadow={false} />
          </group>
        )
      })}
      <Part geo={cyl(0.007, 0.007, 0.3, 5)} m={B.trim} p={[0, 0.85, 0]} castShadow={false} />
      <Part geo={rbox(0.14, 0.08, 0.012, 0.005, 1)} m={B.coral} p={[0.08, 0.95, 0]} castShadow={false} />
    </group>
  )
}
