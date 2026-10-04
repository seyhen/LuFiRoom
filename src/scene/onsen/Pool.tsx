import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { rand } from '../../math'
import { seeded } from '../paint'
import { Batch, Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useParticles } from '../anim'
import { wispTex } from '../textures'
import { LIVE } from '../Static'
import { O } from './materials'
import { leafTex } from './textures'
import { Rock } from '../nature/Rock'
import { rockGeo } from '../nature/shapes'

/** Le bassin : une ellipse de centre (CX, CZ). */
export const POOL = { cx: 0.75, cz: -0.75, rx: 1.55, rz: 1.3, y: 0.05 }

/** Côté des pas japonais : la bordure s'y abaisse en une marche plate pour entrer dans l'eau. Sous le bec, des pierres basses. */
const ENTRY = 2.85, SPOUT_A = -1.31
const near = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

interface Spot { v: number; p: V3; s: V3; ry: number; m: number; moss: 0 | 1 | 2 }
interface Pebble { p: V3; s: V3; r: V3; c: number }
const PEBBLE_TINTS = [0xb8b2a6, 0x9fa3a6, 0xc4b8a8, 0x8c8682, 0xd2ccc0]

/**
 * La bordure de rochers, posés bord à bord en suivant l'ellipse : leur taille décide du pas, si bien qu'aucun espacement ne
 * se répète. Gros, hauts et étagés au fond (on les voit de face, ils ferment le bassin), bas devant pour laisser voir l'eau.
 * La mousse gagne les pierres du fond, à l'ombre de l'érable ; des galets se glissent entre les rochers de devant.
 */
const RIM = (() => {
  const r = seeded(44), rocks: Spot[] = [], pebbles: Pebble[] = [], tufts: V3[] = []
  const { cx, cz, rx, rz } = POOL
  const edge = (a: number, out: number): V3 => {
    const nx = Math.cos(a) / rx, nz = Math.sin(a) / rz, l = Math.hypot(nx, nz)
    return [cx + Math.cos(a) * rx + (nx / l) * out, 0, cz + Math.sin(a) * rz + (nz / l) * out]
  }
  const shape = () => (r() * 6) | 0
  // le basalte sombre reste aux petites pierres : en gros bloc, il ferait une stèle
  const tone = (w: number) => (w < 0.24 ? (r() * 4) | 0 : (r() * 3) | 0)
  let a = 0.35
  while (a < 0.35 + Math.PI * 2 - 0.2) {
    const front = (Math.cos(a) + Math.sin(a)) / Math.SQRT2, back = Math.max(0, -front), entry = near(a, ENTRY) < 0.32, spout = near(a, SPOUT_A) < 0.22
    let w = 0.2 + r() * 0.13 + back * (0.07 + r() * 0.1), h = w * (0.75 + r() * 0.3 + back * (0.45 + r() * 0.35))
    if (front > 0.3) h *= 0.75
    if (spout) (w *= 0.75), (h = w * 0.6)
    if (entry) {
      // la marche : une pierre plate et large, à moitié dans l'eau
      rocks.push({ v: 6, p: edge(a, 0.05), s: [0.36, 0.1, 0.3], ry: a, m: 0, moss: 0 })
      a += 0.5
      continue
    }
    const p = edge(a, w * 0.32)
    rocks.push({ v: shape(), p, s: [w, h, w * (0.8 + r() * 0.25)], ry: r() * Math.PI * 2, m: tone(w), moss: back > 0.35 ? (r() < 0.8 ? 1 : 2) : r() < 0.3 ? 2 : 0 })
    // au fond, une seconde rangée plus haute, derrière les joints : la bordure devient un petit massif
    if (back > 0.45 && r() < 0.65) {
      const w2 = w * (0.8 + r() * 0.4)
      rocks.push({ v: shape(), p: edge(a + 0.12, w * 0.9 + w2 * 0.5), s: [w2, Math.min(0.62, h * (1.0 + r() * 0.25)), w2 * 0.9], ry: r() * 6, m: tone(w2), moss: r() < 0.7 ? 1 : 0 })
      tufts.push(edge(a - 0.1, w * 1.4))
    }
    // devant, un petit rocher calé dans le joint, côté eau, et des galets côté jardin
    if (front > 0 && r() < 0.55) {
      const w3 = 0.09 + r() * 0.07
      rocks.push({ v: shape(), p: edge(a + (w * 0.7) / 1.4, w3 * 0.2), s: [w3, w3 * 0.8, w3 * 0.9], ry: r() * 6, m: (r() * 4) | 0, moss: 0 })
    }
    if (front > -0.2)
      for (let k = 0; k < 3 + r() * 3; k++) {
        const e = edge(a + (r() - 0.5) * 0.35, w * (1.05 + r() * 0.5)), ps = 0.035 + r() * 0.04
        pebbles.push({ p: [e[0], 0, e[2]], s: [ps, ps * (0.45 + r() * 0.3), ps * (0.7 + r() * 0.3)], r: [0, r() * 6, 0], c: PEBBLE_TINTS[(r() * PEBBLE_TINTS.length) | 0] })
      }
    a += (w * 1.3 + 0.03) / Math.hypot(rx * Math.sin(a), rz * Math.cos(a))
  }
  // deux pierres à demi immergées, que l'eau laiteuse voile
  for (const [ang, w] of [[0.95, 0.17], [3.9, 0.14]] as const) {
    const e = edge(ang, -0.28)
    rocks.push({ v: shape(), p: [e[0], -0.06, e[2]], s: [w, w * 0.85, w * 0.8], ry: ang * 3, m: 1, moss: 0 })
  }
  return { rocks, pebbles, tufts }
})()

/** La vapeur qui monte du bassin, et des feuilles d'érable qui flottent en tournant doucement. */
function SteamAndLeaves() {
  const steam = useParticles(), since = useRef(0), floats = useRef<Group[]>([])
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime
    since.current += dt
    if (!reduceMotion && since.current > 0.2) {
      since.current = 0
      const a = rand(0, Math.PI * 2), k = Math.sqrt(Math.random())
      steam.emit(wispTex, POOL.cx + Math.cos(a) * POOL.rx * 0.8 * k, POOL.y + 0.1, POOL.cz + Math.sin(a) * POOL.rz * 0.8 * k, { size: 0.7, life: 5, vy: 0.24, sway: 0.2, grow: 1.6, peak: 0.55 })
    }
    if (!reduceMotion) floats.current.forEach((f, i) => { f.rotation.y = t * 0.1 * (i % 2 ? 1 : -1) + i; f.position.y = POOL.y + 0.012 + Math.sin(t * 1.3 + i) * 0.006 })
  })
  return (
    <>
      <group ref={steam.group} />
      {[[0.2, -0.3], [1.5, -1.3], [0.9, 0.2], [-0.1, -1.4]].map(([x, z], i) => (
        <group key={i} ref={(el) => void (el && (floats.current[i] = el))} userData={LIVE} position={[x, POOL.y + 0.012, z]}>
          <mesh rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.16, 0.16]} />
            <meshBasicMaterial map={leafTex} transparent alphaTest={0.4} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** Le bassin d'eau chaude, laiteuse et turquoise, cerné de rochers moussus ; un plateau de saké qui flotte. */
export function Pool() {
  const ripples = useRef<Mesh>(null!)
  useFrame((_, delta) => {
    if (reduceMotion) return
    const map = O.ripples.map!
    map.offset.x = (map.offset.x + Math.min(delta, 0.05) * 0.012) % 1
    map.offset.y = (map.offset.y + Math.min(delta, 0.05) * 0.008) % 1
  })
  const { cx, cz, rx, rz, y } = POOL
  return (
    <>
      <mesh material={O.water} position={[cx, y, cz]} rotation-x={-Math.PI / 2} scale={[rx, rz, 1]} receiveShadow>
        <circleGeometry args={[1, 40]} />
      </mesh>
      <mesh ref={ripples} userData={LIVE} material={O.ripples} position={[cx, y + 0.004, cz]} rotation-x={-Math.PI / 2} scale={[rx, rz, 1]} raycast={noRay}>
        <circleGeometry args={[0.97, 40]} />
      </mesh>
      {RIM.rocks.map(({ v, p, s, ry, m, moss }, i) => (
        <Rock key={i} v={v} p={p} s={s} ry={ry} m={O.stone[m]} moss={moss ? (moss === 1 ? O.moss : O.mossDark) : undefined} shadow={s[0] > 0.12} />
      ))}
      <Batch geo={rockGeo(5).rock} m={O.pebble} items={RIM.pebbles} />
      {RIM.tufts.map(([x, , z], i) => (
        <Part key={i} geo={SPH} m={i % 2 ? O.moss : O.mossDark} scale={[0.16, 0.05, 0.12]} p={[x, 0.01, z]} rotation-y={i} castShadow={false} />
      ))}
      {/* le plateau de saké qui flotte : un flacon, deux coupelles */}
      <group position={[1.0, y + 0.02, -0.45]} rotation-y={0.4}>
        <Part geo={rbox(0.38, 0.04, 0.28, 0.015)} m={O.hinoki} />
        <Part geo={cyl(0.035, 0.05, 0.16, 14)} m={O.ceramic} p={[-0.08, 0.1, 0]} />
        <Part geo={cyl(0.015, 0.025, 0.05, 10)} m={O.ceramic} p={[-0.08, 0.2, 0]} castShadow={false} />
        {[[0.06, -0.06], [0.11, 0.06]].map(([x, z], i) => (
          <Part key={i} geo={cyl(0.035, 0.02, 0.03, 14)} m={O.celadon} p={[x, 0.035, z]} castShadow={false} />
        ))}
      </group>
      <SteamAndLeaves />
    </>
  )
}
