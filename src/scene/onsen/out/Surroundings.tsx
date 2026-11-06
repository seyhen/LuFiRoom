import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { Static } from '../../Static'
import { noRay } from '../../parts'
import { SkyFadeClock, groundGrid } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { Firs, type Fir } from '../../nature/firs'
import { Foliage } from '../../nature/Foliage'
import { FLAT_ROCKS, Rock } from '../../nature/Rock'
import { onsen } from '../../../rooms/onsen'
import { N, stream } from './materials'
import { PATH, STREAM, groundColor, groundY, lineDist } from './ground'
import { Bridge, Torii, Toro, toroGlowAt } from './Shrine'
import { GlowPoints } from '../../objects/GlowPoints'
import { BambooGrove, Maple, Pine } from './Trees'

/** L'eau du ruisseau : un ruban le long du lit, un peu sous les berges ; la texture défile vers l'aval. */
function streamGeo() {
  const pts: [number, number][] = []
  for (let i = 0; i < STREAM.length - 1; i++) for (let k = 0; k < 8; k++) {
    const t = k / 8, a = STREAM[i], b = STREAM[i + 1]
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  pts.push(STREAM[STREAM.length - 1])
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  let len = 0
  pts.forEach((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)]
    const dx = q[0] - o[0], dz = q[1] - o[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l
    if (i > 0) len += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])
    const y = groundY(p[0], p[1]) + 0.17
    for (const s of [-0.62, 0.62]) { pos.push(p[0] + nx * s, y, p[1] + nz * s); uv.push(s > 0 ? 1 : 0, len / 1.6) }
  })
  for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const sugi = (x: number, z: number, h: number): Fir => ({ p: [x, groundY(x, z) - 0.05, z], h, w: 0.55, tiers: 5, snow: 0 })
/** Les cèdres du Japon (sugi), hauts et étroits, sur la pente derrière l'onsen. */
const SUGI: Fir[] = [
  sugi(-3.4, -5.4, 4.8), sugi(-1.4, -6.4, 5.4), sugi(0.9, -5.6, 4.6), sugi(2.8, -6.6, 5.0), sugi(-4.8, -6.8, 5.6), sugi(0.0, -8.0, 5.0),
  sugi(-6.0, -3.6, 5.0), sugi(-7.2, -1.4, 4.6), sugi(-6.6, -5.6, 5.4), sugi(4.4, -7.8, 4.4), sugi(7.8, -5.6, 4.0), sugi(-8.6, 1.6, 4.2),
]
/** Les rochers des berges et du jardin : [x, z, taille, forme]. */
const ROCKS: [number, number, number, number][] = [
  [5.9, -2.6, 0.45, 1], [4.4, -0.4, 0.35, 3], [6.2, 0.8, 0.3, 5], [4.0, 5.3, 0.4, 2], [6.0, 5.9, 0.32, 4], [3.9, 2.0, 0.28, 0],
  [-4.6, 7.2, 0.3, 4], [-7.4, 6.0, 0.5, 2], [7.6, -6.4, 0.55, 1],
]

/** Les halos des trois lanternes. */
const GLOWS = [toroGlowAt(-4.3, 5.4), toroGlowAt(-2.2, 5.4), toroGlowAt(3.9, -1.6, 0.8)]

/** Le soir, les lanternes s'allument ; l'eau du ruisseau file vers l'aval. */
function Tick() {
  useFrame((_, dt) => {
    const k = Math.min(1, smooth(mood.night) + mood.rain * 0.2)
    N.paper.emissiveIntensity = 0.1 + k * 1.6
    N.glow.opacity = k * 0.85
    if (!reduceMotion) stream.offset.y = (stream.offset.y - Math.min(dt, 0.05) * (0.35 + mood.storm * 0.4)) % 1
  })
  return null
}

/**
 * Le dehors de l'onsen : un versant de montagne. La mousse et les pierres autour du bassin, la pente boisée de cèdres derrière, une
 * bambouseraie à gauche, des érables rouges et des pins taillés ; un ruisseau descend à droite sous un pont vermillon ; devant à
 * gauche, un torii ouvre le sentier de pas japonais bordé de lanternes de pierre qui s'allument le soir.
 */
export function Surroundings() {
  const ground = useMemo(() => groundGrid(0, 0, 30, 96, groundY, groundColor, 2), [])
  const water = useMemo(streamGeo, [])
  const steps = useMemo(() => {
    const out: [number, number][] = []
    for (let i = 0; i < PATH.length - 1; i++) for (let t = 0.15; t < 1; t += 0.32) out.push([PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * t, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * t])
    return out
  }, [])
  return (
    <>
      <SkyFadeClock room={onsen} />
      <Tick />
      <mesh geometry={ground} material={N.ground} receiveShadow raycast={noRay} />
      <mesh geometry={water} material={N.water} renderOrder={2} raycast={noRay} />
      <Static>
        <Firs list={SUGI} m={N.sugi} snowM={N.snowCap} trunkM={N.bark} seed={9} />
        <BambooGrove c={[-5.6, -0.6]} n={30} r={1.5} />
        <Maple x={-5.6} z={3.2} s={1.15} seed={1} />
        <Maple x={7.3} z={-2.8} s={1.25} seed={2} />
        <Maple x={-1.6} z={-5.0} s={1.4} seed={3} />
        <Maple x={4.6} z={-5.0} s={1.3} seed={4} />
        <Pine x={-7.4} z={2.0} s={1.1} />
        <Pine x={8.2} z={1.6} s={1.0} lean={-1} />
        <Torii x={-3.1} z={6.7} ry={0} />
        <Toro x={-4.3} z={5.4} />
        <Toro x={-2.2} z={5.4} />
        <Toro x={3.9} z={-1.6} s={0.8} />
        <Bridge x={5.1} z={2.8} ry={-0.343} />
        {steps.map(([x, z], i) => (
          <Rock key={i} v={FLAT_ROCKS[i % 2]} p={[x, groundY(x, z) - 0.04, z]} s={[0.26, 0.1, 0.22]} ry={i * 1.3} m={N.rock} shadow={false} />
        ))}
        {ROCKS.map(([x, z, s, v]) => (
          <Rock key={`${x}${z}`} v={v} p={[x, groundY(x, z) - s * 0.15, z]} s={[s, s * 0.75, s * 0.85]} ry={x} m={lineDist(STREAM, x, z) < 1.4 ? N.rockDark : N.rock} moss={N.moss} shadow={false} />
        ))}
        {/* des azalées taillées en coussins */}
        {[[-5.2, 6.2, 0.45], [-6.9, 4.6, 0.5], [-1.4, 6.6, 0.35], [6.8, 3.6, 0.45], [-7.8, -2.6, 0.55]].map(([x, z, s], i) => (
          <Foliage key={i} v={i} p={[x, groundY(x, z) - 0.04, z]} s={[s, s * 0.6, s * 0.9]} m={N.shrub} style="clipped" shadow={false} />
        ))}
      </Static>
      <GlowPoints points={GLOWS} color={0xffc070} size={0.85} level={() => N.glow.opacity} />
      <OutdoorPrecip ground={groundY} area={[-13, 13, -12, 12]} />
    </>
  )
}
