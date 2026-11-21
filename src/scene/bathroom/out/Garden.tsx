import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BoxGeometry, CatmullRomCurve3, Color, InstancedMesh, MeshBasicMaterial, Object3D, RingGeometry, TorusGeometry, Vector3, type Points, type PointsMaterial } from 'three'
import { rand, seeded, smooth } from '../../../math'
import { mood, reduceMotion, useWorldPointSize } from '../../anim'
import { Batch, Part, SPH_LO, cyl, noRay, type Item, type V3 } from '../../parts'
import { foliageGeo, rockGeo } from '../../nature/shapes'
import { box } from './geo'
import { Static } from '../../Static'
import { glowTex } from '../../textures'
import { GROUND, terrainY } from './terrain'
import { O } from './materials'

// Le jardin de cottage sous la pluie : hortensias roses et bleus, massifs de roses, glycine, chemin de dalles, bain d'oiseaux, mare à
// nénuphars, banc, cabane à outils, brouette, arrosoir, pots, barrière blanche, lanternes. Foisonnant et libre (pas de haies taillées),
// à l'échelle humaine : un hortensia fait 1,1 m, un pommier 4 m, le banc 1,4 m. Le décor immobile est en séries instanciées (un tracé
// par série) ou dans <Static> (un tracé par matériau) ; ce qui bouge (ronds de pluie, lucioles, fumée) est à part.

const G = GROUND
const g = (n: number) => G + n

/* ------------------------------------------------------------------ chemin de dalles */

const BOX = new BoxGeometry(1, 1, 1)
const PATH_MAIN: V3[] = [[-6.675, 0, 2.7], [-6.675, 0, 3.9], [-6.0, 0, 4.95], [-3.8, 0, 5.55], [-0.5, 0, 5.75], [3.0, 0, 5.5], [5.6, 0, 4.4], [6.8, 0, 2.2], [7.1, 0, -0.8], [7.0, 0, -3.5], [7.6, 0, -5.8], [9.3, 0, -7.1], [11.3, 0, -7.6]]
const PATH_COURT: V3[] = [[6.0, 0, -4.4], [5.1, 0, -5.5], [3.3, 0, -6.25], [1.2, 0, -6.75], [-0.3, 0, -7.45]]

/** Des dalles posées le long d'une courbe : deux rangs décalés, de tailles et de teintes un peu différentes. */
function flagsAlong(pts: V3[], seed: number, step = 0.66, half = 0.28): Item[] {
  const r = seeded(seed), curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)), false, 'centripetal')
  const len = curve.getLength(), n = Math.floor(len / step), out: Item[] = []
  for (let i = 0; i <= n; i++) {
    const u = Math.min(1, (i * step) / len), c = curve.getPointAt(u), t = curve.getTangentAt(u), a = Math.atan2(t.x, t.z)
    for (const side of [-1, 1]) {
      const w = 0.42 + r() * 0.1, l = 0.46 + r() * 0.1
      const off = side * (half + (r() - 0.5) * 0.05), along = (side > 0 ? 0.16 : -0.16) + (r() - 0.5) * 0.06
      const px = c.x - t.z * off + t.x * along, pz = c.z + t.x * off + t.z * along
      const tint = r() < 0.14 ? 0xb9c6a6 : [0xd6d0c2, 0xe2dccf, 0xcdc7ba, 0xddd6c6][Math.floor(r() * 4)]
      out.push({ p: [px, g(0.03 + (out.length % 3) * 0.012), pz], s: [w, 0.1, l], r: [0, a + (r() - 0.5) * 0.2, 0], c: tint })
    }
  }
  return out
}

/** Le parvis de pierre au pied du socle de la pièce, devant et à droite : la pièce repose sur le jardin. */
function apron(): Item[] {
  const r = seeded(77), out: Item[] = []
  for (let k = 0; k < 8; k++) { // le devant, du côté de la caméra
    const x = -3.2 + k * 0.92 + (r() - 0.5) * 0.05
    out.push({ p: [x, g(0.03), 3.78], s: [0.82 + r() * 0.08, 0.1, 0.6 + r() * 0.08], c: [0xd6d0c2, 0xe2dccf, 0xcdc7ba][k % 3] })
    out.push({ p: [x + 0.2, g(0.03), 4.42], s: [0.72, 0.1, 0.52 + r() * 0.08], c: [0xe2dccf, 0xcdc7ba, 0xddd6c6][k % 3] })
  }
  for (let k = 0; k < 7; k++) { // le côté droit
    const z = -3.1 + k * 0.92
    out.push({ p: [3.78, g(0.03), z], s: [0.6 + r() * 0.08, 0.1, 0.82], c: [0xdcd6c8, 0xcdc7ba, 0xe2dccf][k % 3] })
    out.push({ p: [4.42, g(0.03), z + 0.2], s: [0.5 + r() * 0.08, 0.1, 0.72], c: [0xe2dccf, 0xddd6c6, 0xcdc7ba][k % 3] })
  }
  out.push({ p: [3.95, g(0.03), 3.95], s: [0.86, 0.1, 0.84], c: 0xd6d0c2 }) // l'angle
  return out
}

const FLAGS: Item[] = [...flagsAlong(PATH_MAIN, 5), ...flagsAlong(PATH_COURT, 9), ...apron()].map((it, i) => ({ ...it, p: [it.p[0], g(0.01 + (i % 3) * 0.012), it.p[2]] as V3 }))

/* ------------------------------------------------------------------ plantes */

const PAL = {
  pink: [0xf2a6c0, 0xe98bb2, 0xf8c6d6, 0xee9db8],
  blue: [0x8fb2ea, 0x7a9fe0, 0xb4c8f2, 0x6f93dc],
  lilac: [0xb9a2e4, 0xa58ad8, 0xd2c2f0, 0xc4aee8],
  white: [0xeaf2e4, 0xf6f6ee, 0xdfeadb],
}
const LEAVES = [0x4f8a4e, 0x5e9a56, 0x3f7a4a, 0x6aa65c]

/** [x, z, échelle, couleur] : des hortensias sous les fenêtres, le long du chemin, au pied de la maison, près de la mare. */
const HYD: [number, number, number, keyof typeof PAL][] = [
  [-8.75, 3.55, 1.05, 'pink'], [-9.3, 4.6, 0.9, 'blue'], [-8.3, 4.75, 0.8, 'lilac'], [-4.85, 3.45, 1.05, 'blue'], [-4.25, 4.5, 0.8, 'pink'],
  [-2.2, -7.2, 0.95, 'blue'], [5.7, -7.4, 0.9, 'lilac'],
  [5.4, 1.7, 1.0, 'pink'], [6.2, 5.9, 0.85, 'blue'], [8.4, 1.4, 0.95, 'blue'], [8.7, -0.4, 0.8, 'lilac'], [5.9, -2.4, 0.85, 'pink'],
  [-11.4, 5.4, 0.9, 'blue'], [-11.0, 8.6, 0.85, 'pink'],
]

const ROSE_COL = [0xf29bb6, 0xf7c2cf, 0xfff0e2, 0xf4b19a, 0xe0607f]
/** Les rosiers, le long de la barrière de droite et près des portes : [x, z, échelle]. */
const ROSES: [number, number, number][] = [[12.35, -6.4, 1.0], [12.4, -4.7, 0.9], [12.3, -3.0, 1.05], [12.4, -1.2, 0.9], [12.35, 0.6, 1.0], [12.4, 2.4, 0.95], [12.3, 4.2, 0.9], [-3.3, 7.0, 0.85], [1.9, 6.7, 0.8], [-1.6, 6.9, 0.7]]

const { leafItems, bloomItems, spikeItems, lawnLeaves } = (() => {
  const r = seeded(101), leaf: Item[] = [], bloom: Item[] = [], spike: Item[] = [], lawn: Item[] = []
  // les hortensias : un monticule de grandes feuilles, des têtes rondes par-dessus
  for (const [x, z, s, pal] of HYD) {
    for (let k = 0; k < 7; k++) {
      const a = r() * 6.28, d = (0.1 + r() * 0.42) * s
      leaf.push({ p: [x + Math.cos(a) * d, g(0.3 * s + r() * 0.12), z + Math.sin(a) * d], s: [0.42 * s, 0.34 * s, 0.42 * s], c: LEAVES[Math.floor(r() * 4)] })
    }
    const heads = 9 + Math.floor(r() * 3)
    for (let k = 0; k < heads; k++) {
      const a = (k / heads) * 6.28 + r() * 0.5, d = (k === 0 ? 0 : 0.22 + r() * 0.3) * s, hh = (0.78 - d * 0.55 + r() * 0.1) * s
      const hr = (0.16 + r() * 0.07) * s
      bloom.push({ p: [x + Math.cos(a) * d, g(hh + 0.1), z + Math.sin(a) * d], s: [hr, hr * 0.9, hr], c: PAL[pal][Math.floor(r() * PAL[pal].length)] })
    }
  }
  // les rosiers : un buisson de feuilles et des roses
  for (const [x, z, s] of ROSES) {
    for (let k = 0; k < 6; k++) {
      const a = r() * 6.28, d = (0.05 + r() * 0.35) * s
      leaf.push({ p: [x + Math.cos(a) * d, g(0.34 * s + r() * 0.2), z + Math.sin(a) * d], s: [0.3 * s, 0.3 * s, 0.3 * s], c: [0x3f7a4a, 0x57934f, 0x4a8a50][k % 3] })
    }
    for (let k = 0; k < 9; k++) {
      const a = r() * 6.28, d = (0.1 + r() * 0.38) * s
      bloom.push({ p: [x + Math.cos(a) * d, g((0.4 + r() * 0.45) * s), z + Math.sin(a) * d], s: 0.075 + r() * 0.025, c: ROSE_COL[Math.floor(r() * ROSE_COL.length)] })
    }
  }
  // les digitales et les delphiniums, au pied de la façade du fond (et quelques-unes le long du mur de l'aile)
  const SPK = [0xf1c8dc, 0xfff4ee, 0xc8aee8, 0xe6a6cb, 0xa6b6ee]
  for (let k = 0; k < 16; k++) {
    const x = -1.9 + (k % 8) * 0.78 + r() * 0.4 + (k >= 8 ? 0.3 : 0), z = -7.55 + (k >= 8 ? 0.35 : 0) + r() * 0.2, h = 0.8 + r() * 0.5
    if (Math.abs(x + 0.3) < 0.9 || (x > 1.4 && x < 3.85) || (x > 3.95 && x < 4.7) || Math.abs(x + 2.2) < 0.7 || Math.abs(x - 0.9) < 0.3 || Math.abs(x - 0.62) < 0.4) continue // la porte, le banc, le tonneau, un hortensia, le tronc de la glycine, le pot
    spike.push({ p: [x, g(h * 0.5 + 0.1), z], s: [0.065, h * 0.5, 0.065], c: SPK[k % 5] })
    leaf.push({ p: [x, g(0.14), z], s: [0.22, 0.14, 0.22], c: LEAVES[k % 4] })
  }
  // un gazon plus haut au pied des murs et de la barrière : des touffes de feuilles
  for (let k = 0; k < 40; k++) {
    const x = -12 + r() * 26, z = -7 + r() * 15
    if (Math.abs(x - 12.6) > 0.5 && Math.abs(z + 7.4) > 0.5) continue
    lawn.push({ p: [x, g(0.1), z], s: [0.3, 0.14, 0.3], c: LEAVES[k % 4] })
  }
  // des touffes de fleurs libres dans l'herbe : lavande, marguerites, soucis
  const CL: [number, number, number][] = [[-10.6, -0.4, 0], [-12.2, 1.6, 1], [-7.6, 7.0, 0], [-6.2, 7.5, 2], [-3.4, 7.7, 1], [4.0, 7.7, 0], [7.4, 6.9, 2], [9.8, 3.4, 1], [-10.0, 5.6, 2], [11.4, 6.0, 1]]
  const CCOL = [[0xb69ce8, 0xa58ad8, 0xc8b4ee], [0xfffaf0, 0xfff2c4, 0xffffff], [0xf6b36e, 0xf2c14e, 0xf29a6a]]
  for (const [x, z, kind] of CL) {
    for (let k = 0; k < 3; k++) leaf.push({ p: [x + (r() - 0.5) * 0.5, g(0.12), z + (r() - 0.5) * 0.5], s: [0.26, 0.16, 0.26], c: LEAVES[k % 4] })
    for (let k = 0; k < 7; k++) {
      const px = x + (r() - 0.5) * 0.75, pz = z + (r() - 0.5) * 0.75
      if (kind === 0) spike.push({ p: [px, g(0.3), pz], s: [0.045, 0.22, 0.045], c: CCOL[0][k % 3] })
      else bloom.push({ p: [px, g(0.28 + r() * 0.12), pz], s: [0.075, 0.05, 0.075], c: CCOL[kind][k % 3] })
    }
  }
  return { leafItems: leaf, bloomItems: bloom, spikeItems: spike, lawnLeaves: lawn }
})()

/** La glycine de la façade : un tronc tordu, une branche le long de l'avant-toit, des grappes violettes qui pendent, des feuilles. */
const WISTERIA = (() => {
  const r = seeded(211), bloom: Item[] = [], leaf: Item[] = []
  const BY = 2.3 // la branche court à 2,3 m
  for (let k = 0; k < 44; k++) {
    const x = -2.9 + (k / 43) * 7.4 + (r() - 0.5) * 0.14, len = 0.4 + r() * 0.6
    const gap = Math.abs(x + 0.3) < 0.55 ? 0.28 : 0 // l'entrée reste dégagée sous les grappes
    const col = [0xb9a2e4, 0xa58ad8, 0xc8b4ee, 0x9a80d2, 0xd6c8f2][k % 5], l = len - gap, z = -7.74 + (r() - 0.5) * 0.12
    // une grappe qui s'effile : trois masses de plus en plus fines
    bloom.push({ p: [x, BY - 0.1 - l * 0.2, z], s: [0.1, l * 0.24, 0.1], c: col })
    bloom.push({ p: [x + (r() - 0.5) * 0.03, BY - 0.1 - l * 0.52, z], s: [0.075, l * 0.26, 0.075], c: col })
    bloom.push({ p: [x + (r() - 0.5) * 0.04, BY - 0.1 - l * 0.84, z], s: [0.045, l * 0.2, 0.045], c: col })
  }
  for (let k = 0; k < 34; k++) {
    const x = -3.0 + (k / 33) * 7.5 + (r() - 0.5) * 0.3
    leaf.push({ p: [x, BY + 0.05 + r() * 0.3, -7.82 + r() * 0.1], s: [0.2 + r() * 0.1, 0.1, 0.16], r: [0, 0, (r() - 0.5) * 0.6], c: LEAVES[k % 4] })
  }
  return { bloom, leaf }
})()

/** Les arbres : [x, z, échelle, sorte]. Un pommier, un cerisier en fleurs et des fruitiers au fond, autour de la maison. */
const TREES: [number, number, number, 'apple' | 'cherry' | 'oak'][] = [
  [-12.6, 3.6, 1.0, 'apple'], [-11.8, -3.2, 1.05, 'cherry'], [-12.4, 9.5, 0.9, 'oak'], [13.9, -10.5, 1.0, 'oak'], [14.6, 5.5, 0.9, 'apple'], [9.0, 9.2, 0.9, 'cherry'],
]
const CANOPY_GREEN = [0x6fae5e, 0x5a9a54, 0x7fb865, 0x4f8e4f]
const CANOPY_PINK = [0xf3bfd0, 0xf0aac0, 0xf8d2de]
const canopyItems = (() => {
  const r = seeded(303), out: Item[] = [], fruit: Item[] = []
  for (const [x, z, k, kind] of TREES) {
    const cols = kind === 'cherry' ? CANOPY_PINK : CANOPY_GREEN
    const blobs: [number, number, number, number][] = [[0, 1.9, 0, 1.15], [0.95, 1.55, 0.3, 0.8], [-0.9, 1.7, -0.35, 0.85], [0.2, 2.55, -0.45, 0.7], [-0.3, 2.35, 0.75, 0.65], [0.5, 2.7, 0.4, 0.55]]
    blobs.forEach(([dx, dy, dz, rr], i) => out.push({ p: [x + dx * k, g(dy * k), z + dz * k], s: [rr * k * 1.1, rr * k * 0.85, rr * k * 1.1], r: [0, r() * 6, 0], c: cols[i % cols.length] }))
    if (kind === 'apple') for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = 0.8 + r() * 0.7; fruit.push({ p: [x + Math.cos(a) * d * k, g((2.0 + r() * 0.9) * k), z + Math.sin(a) * d * k], s: 0.075, c: [0xdc4a4a, 0xe86a52, 0xf2c14e][i % 3] }) }
  }
  // des arbres de haie sur les collines, de loin : trois masses rondes, pâles, jamais devant la maison
  for (let i = 0; i < 12; i++) {
    const a = -3.4 + (i / 11) * 3.6 + (r() - 0.5) * 0.12, d = 15 + r() * 4.5
    const x = Math.cos(a) * d - 2, z = Math.sin(a) * d - 2
    if (z > 11 || x > 20) continue
    const s = 0.62 + r() * 0.35, y = terrainY(x, z) - 0.1, c = [0x6a9a5c, 0x7aa862, 0x58884f, 0x87ad6a][i % 4]
    out.push({ p: [x, y + 0.5 * s, z], s: [s * 1.3, s * 1.3, s * 1.3], r: [0, r() * 6, 0], c })
    out.push({ p: [x + 0.8 * s, y, z + 0.2 * s], s: [s * 0.85, s * 0.95, s * 0.85], r: [0, r() * 6, 0], c: [0x7aa862, 0x6a9a5c][i % 2] })
  }
  return { canopy: out, fruit }
})()

/* ------------------------------------------------------------------ la mare */

const POND = { x: 10.0, z: -3.8, r: 1.5 }
const PADS: [number, number, number][] = [[-0.45, 0.25, 0.22], [0.25, 0.55, 0.18], [-0.1, -0.5, 0.2], [0.65, -0.15, 0.24], [-0.85, -0.3, 0.16], [0.1, 0.05, 0.15], [0.55, 0.7, 0.14]]
const RIM = (() => {
  const r = seeded(401), out: Item[] = []
  for (let k = 0; k < 17; k++) {
    const a = (k / 17) * 6.28 + (r() - 0.5) * 0.12, d = POND.r + 0.1 + r() * 0.1
    out.push({ p: [POND.x + Math.cos(a) * d, G - 0.04, POND.z + Math.sin(a) * d], s: [0.26 + r() * 0.12, 0.2 + r() * 0.08, 0.22 + r() * 0.1], r: [0, r() * 6, 0], c: [0xd2ccbf, 0xc4beb0, 0xded8c9][k % 3] })
  }
  return out
})()
const ROCK_GEO = rockGeo(2).rock

/** Les ronds que la pluie dessine sur l'eau de la mare : un anneau plat qui s'élargit et s'efface, six à la fois, un seul tracé. */
function PondRipples() {
  const mesh = useRef<InstancedMesh>(null!)
  const geo = useMemo(() => new RingGeometry(0.82, 1, 28).rotateX(-Math.PI / 2), [])
  const mat = useMemo(() => new MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: 0.8 }), [])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])
  const st = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: 0, z: 0, t: i / 7 })), [])
  const dummy = useMemo(() => new Object3D(), [])
  const col = useMemo(() => new Color(), [])
  useFrame((_, delta) => {
    const m = mesh.current, k = Math.min(1, mood.rain * 1.4) * (1 - smooth(Math.min(1, mood.snow)))
    m.visible = k > 0.03 && !reduceMotion
    if (!m.visible) return
    const dt = Math.min(delta, 0.05)
    st.forEach((s, i) => {
      s.t += dt / (1.4 + mood.storm * -0.5)
      if (s.t >= 1) { s.t = 0; const a = rand(0, 6.28), d = Math.sqrt(Math.random()) * (POND.r - 0.25); s.x = Math.cos(a) * d; s.z = Math.sin(a) * d }
      const size = 0.04 + s.t * 0.34
      dummy.position.set(POND.x + s.x, g(0.125), POND.z + s.z)
      dummy.scale.set(size, 1, size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, col.setScalar((1 - s.t) * (1 - s.t) * 0.7 * k))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[geo, mat, 7]} frustumCulled={false} renderOrder={3} raycast={noRay} visible={false} />
}

/* ------------------------------------------------------------------ lumière du soir */

const LANTERNS: V3[] = [[-5.85, 0, 3.4], [-2.2, 0, 6.5], [3.4, 0, 6.4], [6.15, 0, 0.6], [5.4, 0, -3.6], [-0.4, 0, -6.35]]
const LAMP_Y = 1.15

/** Le soir (ou sous la pluie) : les fenêtres du cottage et les lanternes du chemin s'allument. */
export const evening = () => Math.min(1, smooth(mood.night) + mood.rain * 0.22)
export const LAMP_GLOWS: V3[] = LANTERNS.map(([x, , z]): V3 => [x, g(LAMP_Y + 0.12), z])

const FLY = Array.from({ length: 18 }, (_, i) => {
  const r = seeded(500 + i)
  return { x: -9 + r() * 24, z: -7 + r() * 14, y: g(0.5 + r() * 1.1), ph: r() * 6.3, f: 0.4 + r() * 0.5 }
}).filter((f) => !(f.x > -4 && f.x < 4 && f.z > -4 && f.z < 4))

/** Les lucioles : de petits points qui flottent dans le jardin, la nuit. Un tracé, aucun le jour. */
function Fireflies() {
  const pts = useRef<Points>(null!), mat = useRef<PointsMaterial>(null!), phase = useRef(0)
  const buf = useMemo(() => new Float32Array(FLY.length * 3), [])
  useWorldPointSize(mat, 0.2)
  useFrame((_, delta) => {
    const p = pts.current, m = mat.current
    const k = smooth(mood.night) * (1 - Math.min(1, mood.storm)) * (1 - mood.snow)
    m.visible = p.visible = k > 0.02
    if (!p.visible) return
    m.opacity = k * 0.95
    if (!reduceMotion) phase.current += Math.min(delta, 0.05)
    const t = phase.current
    FLY.forEach((f, i) => {
      buf[i * 3] = f.x + Math.sin(t * f.f + f.ph) * 0.5
      buf[i * 3 + 1] = f.y + Math.sin(t * f.f * 1.3 + f.ph * 2) * 0.22
      buf[i * 3 + 2] = f.z + Math.cos(t * f.f * 0.8 + f.ph) * 0.5
    })
    p.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={pts} frustumCulled={false} renderOrder={4} raycast={noRay} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buf, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={mat} map={glowTex} color={0xe6f4a0} size={10} sizeAttenuation={false} transparent depthWrite={false} blending={AdditiveBlending} opacity={0} />
    </points>
  )
}

/* ------------------------------------------------------------------ les objets du jardin */

const TORUS = new TorusGeometry(1, 0.12, 6, 16)

/** Un coin de thé sur la pelouse de gauche : une table ronde, deux chaises menthe, une théière et deux tasses. */
function TeaCorner({ at }: { at: V3 }) {
  const seats: [number, number][] = [[-0.78, 0.5], [0.75, 0.62]]
  return (
    <group position={at}>
      <Part geo={cyl(0.1, 0.18, 0.04, 14)} m={O.iron} p={[0, g(0.02), 0]} castShadow={false} />
      <Part geo={cyl(0.03, 0.03, 0.7, 8)} m={O.iron} p={[0, g(0.37), 0]} castShadow={false} />
      <Part geo={cyl(0.46, 0.46, 0.04, 22)} m={O.trim} p={[0, g(0.74), 0]} castShadow={false} />
      <Part geo={cyl(0.47, 0.47, 0.025, 22)} m={O.mint} p={[0, g(0.715), 0]} castShadow={false} />
      <Part geo={cyl(0.08, 0.09, 0.1, 12)} m={O.trim} p={[0.05, g(0.81), -0.02]} castShadow={false} />
      <Part geo={cyl(0.03, 0.05, 0.05, 10)} m={O.trim} p={[0.05, g(0.885), -0.02]} castShadow={false} />
      <Part geo={cyl(0.012, 0.02, 0.1, 6)} m={O.trim} p={[0.15, g(0.84), -0.02]} rotation-z={-0.9} castShadow={false} />
      {([[-0.22, 0.12], [0.2, 0.2]] as [number, number][]).map(([x, z], i) => <Part key={i} geo={cyl(0.04, 0.03, 0.05, 10)} m={i ? O.clay : O.trim} p={[x, g(0.785), z]} castShadow={false} />)}
      {seats.map(([dx, dz], i) => (
        <group key={i} position={[dx, 0, dz]} rotation-y={Math.atan2(-dx, -dz)}>
          {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([x, z]) => <Part key={`${x}${z}`} geo={box(0.035, 0.45, 0.035)} m={O.mint} p={[x, g(0.225), z]} castShadow={false} />)}
          <Part geo={box(0.42, 0.04, 0.42)} m={O.mint} p={[0, g(0.46), 0]} castShadow={false} />
          <Part geo={box(0.4, 0.035, 0.06)} m={O.mint} p={[0, g(0.92), -0.2]} castShadow={false} />
          <Part geo={box(0.4, 0.035, 0.06)} m={O.mint} p={[0, g(0.72), -0.2]} castShadow={false} />
          {[-0.17, 0.17].map((x) => <Part key={x} geo={box(0.035, 0.5, 0.035)} m={O.mint} p={[x, g(0.7), -0.2]} castShadow={false} />)}
        </group>
      ))}
    </group>
  )
}

function Bench({ at, ry = 0 }: { at: V3; ry?: number }) {
  return (
    <group position={at} rotation-y={ry}>
      {[-0.62, 0.62].map((x) => (
        <group key={x}>
          <Part geo={box(0.06, 0.45, 0.06)} m={O.mint} p={[x, g(0.225), 0.18]} castShadow={false} />
          <Part geo={box(0.06, 0.95, 0.06)} m={O.mint} p={[x, g(0.475), -0.2]} rotation-x={-0.1} castShadow={false} />
          <Part geo={box(0.06, 0.05, 0.5)} m={O.mint} p={[x, g(0.66), -0.02]} castShadow={false} />
        </group>
      ))}
      {[-0.16, 0, 0.16].map((z) => <Part key={z} geo={box(1.5, 0.04, 0.12)} m={O.wood} p={[0, g(0.46), z + 0.02]} castShadow={false} />)}
      {[0.62, 0.78, 0.94].map((y, i) => <Part key={y} geo={box(1.5, 0.11, 0.03)} m={O.wood} p={[0, g(y), -0.2 - i * 0.012]} rotation-x={-0.1} castShadow={false} />)}
    </group>
  )
}

function Birdbath({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Part geo={cyl(0.24, 0.28, 0.1, 18)} m={O.stone} p={[0, g(0.05), 0]} castShadow={false} />
      <Part geo={cyl(0.1, 0.14, 0.62, 14)} m={O.stone} p={[0, g(0.4), 0]} castShadow={false} />
      <Part geo={cyl(0.46, 0.2, 0.14, 22)} m={O.stone} p={[0, g(0.78), 0]} castShadow={false} />
      <Part geo={cyl(0.37, 0.37, 0.02, 22)} m={O.water} p={[0, g(0.865), 0]} castShadow={false} />
    </group>
  )
}

function Barrel({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Part geo={cyl(0.36, 0.32, 0.85, 16)} m={O.wood} p={[0, g(0.425), 0]} castShadow={false} />
      {[0.12, 0.45, 0.74].map((y) => <Part key={y} geo={cyl(0.368 - (y - 0.45) * 0.1 * 0.2, 0.368 - (y - 0.45) * 0.1 * 0.2, 0.035, 16)} m={O.iron} p={[0, g(y), 0]} castShadow={false} />)}
      <Part geo={cyl(0.31, 0.31, 0.02, 16)} m={O.water} p={[0, g(0.862), 0]} castShadow={false} />
    </group>
  )
}

function Shed({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Part geo={box(2.2, 2.1, 1.7)} m={O.mint} p={[0, g(1.05), 0]} castShadow={false} />
      {/* les couvre-joints : des lattes blanches verticales sur la façade, la porte de planches, la fenêtre */}
      {[-0.95, -0.55, 0.55, 0.95].map((x) => <Part key={x} geo={box(0.06, 2.0, 0.03)} m={O.trim} p={[x, g(1.05), 0.86]} castShadow={false} />)}
      <Part geo={box(0.76, 1.7, 0.05)} m={O.wood} p={[-0.2, g(0.9), 0.875]} castShadow={false} />
      {[-0.5, -0.2, 0.1].map((x) => <Part key={x} geo={box(0.02, 1.7, 0.02)} m={O.trunk} p={[x, g(0.9), 0.91]} castShadow={false} />)}
      <Part geo={box(0.62, 0.5, 0.04)} m={O.glass} p={[0.72, g(1.25), 0.87]} castShadow={false} />
      <Part geo={box(0.74, 0.62, 0.03)} m={O.trim} p={[0.72, g(1.25), 0.86]} castShadow={false} />
      <Part geo={box(0.76, 0.05, 0.14)} m={O.trim} p={[0.72, g(0.9), 0.93]} castShadow={false} />
      {/* le toit à un pan, ardoise, rives blanches */}
      <Part geo={box(2.6, 0.1, 2.3)} m={O.roof} p={[0, g(2.3), 0]} rotation-x={0.17} castShadow={false} />
      <Part geo={box(2.64, 0.14, 0.05)} m={O.trim} p={[0, g(2.25), 1.15]} rotation-x={0.17} castShadow={false} />
      {/* un seuil, des pots empilés, un râteau appuyé au mur */}
      <Part geo={box(1.2, 0.1, 0.5)} m={O.stone} p={[-0.2, g(0.05), 1.13]} castShadow={false} />
      {[0, 1, 2].map((i) => <Part key={i} geo={cyl(0.17 - i * 0.012, 0.12 - i * 0.012, 0.26, 12)} m={O.clay} p={[1.35, g(0.13 + i * 0.2), 0.75]} castShadow={false} />)}
      <Part geo={cyl(0.015, 0.015, 1.7, 6)} m={O.wood} p={[-1.0, g(0.9), 0.95]} rotation-z={0.12} castShadow={false} />
      <Part geo={box(0.32, 0.03, 0.04)} m={O.iron} p={[-1.1, g(0.08 + 0.04), 0.95]} castShadow={false} />
    </group>
  )
}

function Wheelbarrow({ at, ry }: { at: V3; ry: number }) {
  return (
    <group position={at} rotation-y={ry}>
      <Part geo={box(0.62, 0.2, 0.46)} m={O.zinc} p={[0.05, g(0.42), 0]} rotation-z={0.08} castShadow={false} />
      <Part geo={box(0.4, 0.14, 0.32)} m={O.zinc} p={[0.4, g(0.4), 0]} castShadow={false} />
      <Part geo={SPH_LO} m={O.soil} scale={[0.26, 0.08, 0.18]} p={[0.02, g(0.54), 0]} castShadow={false} />
      <Part geo={TORUS} m={O.iron} scale={[0.17, 0.17, 0.17]} p={[0.62, g(0.18), 0]} rotation-y={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.03, 0.03, 0.06, 8)} m={O.iron} p={[0.62, g(0.18), 0]} rotation-x={Math.PI / 2} castShadow={false} />
      {[-0.2, 0.2].map((z) => (
        <group key={z}>
          <Part geo={cyl(0.017, 0.017, 1.0, 6)} m={O.wood} p={[-0.38, g(0.46), z]} rotation-z={Math.PI / 2 - 0.1} castShadow={false} />
          <Part geo={box(0.04, 0.34, 0.04)} m={O.wood} p={[-0.1, g(0.17), z * 1.2]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

function WateringCan({ at, ry = 0 }: { at: V3; ry?: number }) {
  return (
    <group position={at} rotation-y={ry}>
      <Part geo={cyl(0.1, 0.1, 0.21, 14)} m={O.zinc} p={[0, g(0.105), 0]} castShadow={false} />
      <Part geo={cyl(0.1, 0.1, 0.02, 14)} m={O.iron} p={[0, g(0.215), 0]} castShadow={false} />
      <Part geo={cyl(0.014, 0.026, 0.3, 8)} m={O.zinc} p={[0.19, g(0.21), 0]} rotation-z={-0.85} castShadow={false} />
      <Part geo={cyl(0.04, 0.03, 0.025, 10)} m={O.zinc} p={[0.31, g(0.325), 0]} rotation-z={-0.85} castShadow={false} />
      <Part geo={TORUS} m={O.zinc} scale={[0.08, 0.08, 0.08]} p={[-0.08, g(0.25), 0]} rotation-y={Math.PI / 2} castShadow={false} />
    </group>
  )
}

function Pot({ at, h = 0.26 }: { at: V3; h?: number }) {
  return (
    <group position={at}>
      <Part geo={cyl(0.18, 0.12, h, 14)} m={O.clay} p={[0, g(h / 2), 0]} castShadow={false} />
      <Part geo={cyl(0.19, 0.19, 0.04, 14)} m={O.clay} p={[0, g(h + 0.01), 0]} castShadow={false} />
      <Part geo={cyl(0.16, 0.16, 0.012, 14)} m={O.soil} p={[0, g(h + 0.036), 0]} castShadow={false} />
    </group>
  )
}

/** Un lampadaire de jardin : un piquet, une lanterne vitrée, un chapeau. La flamme (le halo) vient de `LAMP_GLOWS`. */
function Lamp({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Part geo={cyl(0.025, 0.035, LAMP_Y, 8)} m={O.iron} p={[0, g(LAMP_Y / 2), 0]} castShadow={false} />
      <Part geo={cyl(0.06, 0.06, 0.03, 8)} m={O.iron} p={[0, g(LAMP_Y), 0]} castShadow={false} />
      <Part geo={box(0.15, 0.22, 0.15)} m={O.lantern} p={[0, g(LAMP_Y + 0.13), 0]} castShadow={false} />
      <Part geo={cyl(0.01, 0.12, 0.09, 4)} m={O.iron} p={[0, g(LAMP_Y + 0.29), 0]} rotation-y={Math.PI / 4} castShadow={false} />
    </group>
  )
}

/** La barrière blanche de droite : des piquets (une série), deux lisses, des poteaux. */
const FENCE_X = 13.2
const PICKETS: Item[] = Array.from({ length: 98 }, (_, i) => ({ p: [FENCE_X, g(0.4), -9.2 + i * 0.165], s: [0.025, 0.8, 0.07] as V3 }))
const SKIP_PICKET = 0

export function Garden() {
  const posts = Array.from({ length: 12 }, (_, i) => -9.2 + i * 1.5)
  return (
    <>
      <Static>
      <Batch geo={BOX} m={O.stone} items={FLAGS} />
      <Batch geo={SPH_LO} m={O.leaf} items={leafItems} />
      <Batch geo={SPH_LO} m={O.leaf} items={lawnLeaves} />
      <Batch geo={SPH_LO} m={O.bloom} items={[...bloomItems, ...canopyItems.fruit]} />
      <Batch geo={SPH_LO} m={O.bloom} items={[...spikeItems, ...WISTERIA.bloom]} />
      <Batch geo={SPH_LO} m={O.leaf} items={WISTERIA.leaf} />
      <Batch geo={foliageGeo(1)} m={O.leaf} items={canopyItems.canopy} />
      <Batch geo={ROCK_GEO} m={O.stone} items={RIM} />
      <Batch geo={BOX} m={O.trim} items={PICKETS.slice(SKIP_PICKET)} />
      {/* la glycine : un tronc qui monte contre le mur, une branche le long de l'avant-toit */}
      <Part geo={cyl(0.09, 0.13, 2.8, 8)} m={O.trunk} p={[0.9, g(1.4), -7.9]} rotation-z={0.05} castShadow={false} />
      <Part geo={cyl(0.05, 0.07, 7.8, 8)} m={O.trunk} p={[0.9, 2.3, -7.95]} rotation-z={Math.PI / 2} castShadow={false} />
      {/* la pierre de la mare et du bord : de l'eau un peu au-dessus de l'herbe, bordée de pierres */}
      <Part geo={cyl(1, 1, 0.13, 36)} m={O.water} scale={[POND.r, 1, POND.r]} p={[POND.x, g(0.045), POND.z]} castShadow={false} />
      {PADS.map(([dx, dz, r], i) => <Part key={i} geo={cyl(1, 1, 0.012, 12)} m={O.pad} scale={[r, 1, r]} p={[POND.x + dx, g(0.118), POND.z + dz]} rotation-y={i} castShadow={false} />)}
      {/* les roseaux et les massettes du fond de la mare */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = -2.2 + i * 0.27, d = POND.r - 0.18 + (i % 2) * 0.08, h = 0.9 + (i % 3) * 0.28
        return (
          <group key={i} position={[POND.x + Math.cos(a) * d, g(0.05), POND.z + Math.sin(a) * d]} rotation-z={(i % 2 ? 1 : -1) * 0.08}>
            <Part geo={cyl(0.012, 0.016, h, 5)} m={O.pad} p={[0, h / 2, 0]} castShadow={false} />
            {i % 3 === 0 && <Part geo={cyl(0.03, 0.03, 0.2, 8)} m={O.trunk} p={[0, h - 0.05, 0]} castShadow={false} />}
          </group>
        )
      })}
      {/* les flaques sur l'herbe : l'eau calme qui reflète le ciel */}
      {([[-1.6, 4.55, 0.55], [2.9, 4.6, 0.45], [5.0, 2.2, 0.5], [-9.8, 1.2, 0.5]] as [number, number, number][]).map(([x, z, r], i) => (
        <Part key={i} geo={cyl(1, 1, 0.012, 16)} m={O.water} scale={[r * 1.4, 1, r]} p={[x, g(0.008), z]} rotation-y={i} castShadow={false} />
      ))}
      {/* les troncs des arbres */}
      {TREES.map(([x, z, k], i) => (
        <group key={i}>
          <Part geo={cyl(0.17 * k, 0.28 * k, 1.9 * k, 10)} m={O.trunk} p={[x, g(0.95 * k), z]} castShadow={false} />
          <Part geo={cyl(0.07 * k, 0.12 * k, 0.9 * k, 7)} m={O.trunk} p={[x + 0.36 * k, g(1.9 * k), z + 0.05]} rotation-z={-0.8} castShadow={false} />
        </group>
      ))}
      {/* la barrière : lisses et poteaux (les piquets sont une série) */}
      {[0.28, 0.62].map((y) => <Part key={y} geo={box(0.05, 0.07, 17.6)} m={O.trim} p={[FENCE_X - 0.035, g(y), -0.4]} castShadow={false} />)}
      {posts.map((z) => <Part key={z} geo={box(0.1, 0.95, 0.1)} m={O.trim} p={[FENCE_X - 0.04, g(0.47), z]} castShadow={false} />)}
      {/* le banc, adossé à la façade du fond, un arrosoir à ses pieds ; le bain d'oiseaux ; le tonneau sous la descente d'eau */}
      <Bench at={[2.9, 0, -7.35]} />
      <TeaCorner at={[-9.2, 0, 7.2]} />
      <WateringCan at={[1.7, 0, -7.6]} ry={0.6} />
      <Birdbath at={[5.4, 0, 0.3]} />
      <Barrel at={[4.3, 0, -7.6]} />
      <Part geo={cyl(0.04, 0.04, 2.05, 8)} m={O.zinc} p={[4.3, 1.375, -7.93]} castShadow={false} />
      <Shed at={[11.8, 0, -9.0]} />
      <Wheelbarrow at={[8.0, 0, -8.4]} ry={0.45} />
      <WateringCan at={[-8.1, 0, 2.85]} ry={-0.5} />
      <Pot at={[-7.7, 0, 2.8]} />
      <Pot at={[-5.6, 0, 2.8]} />
      <Pot at={[0.62, 0, -7.62]} h={0.3} />
      {LANTERNS.map((p, i) => <Lamp key={i} at={p} />)}
      </Static>
      <PondRipples />
      <Fireflies />
    </>
  )
}
