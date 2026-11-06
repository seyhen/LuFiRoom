import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, SphereGeometry, TubeGeometry, Vector3, type Group, type Material } from 'three'
import { smooth } from '../../../math'
import { blob, cone, ell } from '../../blob'
import { mood, reduceMotion } from '../../anim'
import { Part, noRay, type Item, type V3 } from '../../parts'
import { S } from './layout'
import { K } from './materials'

// ───────── la lune en peluche : un croissant « en berceau » qui dort, joues roses, la même recette que la lune du lit ─────────
const PLUM = 0x7a5a82, BLUSH = 0xf59bb5, BUTTER = 0xf6d071
const MOON = blob(
  [
    ell([0, 0, 0.0], [0.29, 0.29, 0.12], { color: BUTTER }),
    ell([0.05, 0.19, 0.05], [0.22, 0.2, 0.3], { op: 'sub', k: 0.05 }),
    // les paupières closes (deux petits arcs), les joues
    ...[-1, 1].map((s) => ell([0.08 * s, -0.075, 0.1], [0.05, 0.017, 0.02], { color: PLUM, k: 0.015, rot: [0, 0, -0.3 * s] })),
    ...[-1, 1].map((s) => ell([0.16 * s, -0.125, 0.075], [0.04, 0.028, 0.02], { color: BLUSH, k: 0.02 })),
  ],
  { h: 0.012, k: 0.04 },
)

// ───────── une étoile en peluche : un cœur rond et cinq bras qui s'effilent, tous bouts arrondis ─────────
function starBlob() {
  const arms = Array.from({ length: 5 }, (_, i) => {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 5
    return cone([0, 0, 0], [Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0], 0.1, 0.045, { k: 0.06 })
  })
  return blob([ell([0, 0, 0], [0.14, 0.14, 0.1]), ...arms], { h: 0.024, k: 0.05 })
}

interface StarSpec { at: V3; scale: number; mat: Material; tilt: number; bob: number }
const STARS: StarSpec[] = [
  { at: S(5.0, 6.7, -4), scale: 1.7, mat: K.starPink, tilt: 0.25, bob: 0 },
  { at: S(-8.4, 3.6, -3), scale: 1.4, mat: K.starMint, tilt: -0.2, bob: 1.7 },
  { at: S(8.6, 2.4, -3), scale: 1.3, mat: K.starLilac, tilt: 0.3, bob: 3.1 },
  { at: S(-1.2, 7.6, -5), scale: 1.15, mat: K.starButter, tilt: -0.3, bob: 4.4 },
]

/** Un jouet qui flotte : monte et descend doucement (la phase avance image après image, jamais sin(t · f variable)). */
function Float({ at, amp = 0.12, speed = 0.5, phase = 0, children, rot }: { at: V3; amp?: number; speed?: number; phase?: number; children: React.ReactNode; rot?: V3 }) {
  const g = useRef<Group>(null!), ph = useRef(phase)
  useFrame((_, dt) => {
    if (!reduceMotion) ph.current += Math.min(dt, 0.05) * speed
    g.current.position.y = at[1] + Math.sin(ph.current) * amp
    if (rot) g.current.rotation.z = rot[2] + Math.sin(ph.current * 0.8 + 1) * 0.04
  })
  return (
    <group ref={g} position={at} rotation={rot ? [0, Math.PI / 4, rot[2]] : [0, Math.PI / 4, 0]}>
      {children}
    </group>
  )
}

/** La lune et les étoiles en peluche. La nuit, elles luisent un peu plus. */
export function Plushies() {
  const star = useMemo(starBlob, [])
  useFrame(() => {
    const e = smooth(mood.night)
    K.moon.emissiveIntensity = 0.14 + e * 0.3
    for (const m of [K.starButter, K.starPink, K.starMint, K.starLilac]) (m as unknown as { emissiveIntensity: number }).emissiveIntensity = 0.12 + e * 0.34
  })
  return (
    <>
      <Float at={S(-4.8, 4.8, -3)} amp={0.16} speed={0.45} rot={[0, 0, 0.18]}>
        <Part geo={MOON} m={K.moon} scale={3.4} castShadow={false} receiveShadow={false} />
      </Float>
      {STARS.map((s, i) => (
        <Float key={i} at={s.at} amp={0.1 + (i % 2) * 0.04} speed={0.55 + i * 0.07} phase={s.bob} rot={[0, 0, s.tilt]}>
          <Part geo={star} m={s.mat} scale={s.scale} castShadow={false} receiveShadow={false} />
        </Float>
      ))}
    </>
  )
}

// ───────── les ballons attachés au banc de gauche ─────────
const BALLOON = new SphereGeometry(1, 14, 10)
const KNOT = new SphereGeometry(1, 7, 5)
const BALLOONS: { at: V3; mat: Material; s: number; ph: number }[] = [
  { at: S(-5.6, 0.9, 1.2), mat: K.balloonPink, s: 0.52, ph: 0 },
  { at: S(-6.4, 2.0, 0.4), mat: K.balloonMint, s: 0.46, ph: 2 },
  { at: S(-5.0, 2.9, 0.8), mat: K.balloonButter, s: 0.5, ph: 4 },
]
const KNOT_AT = S(-5.9, -2.9, 0.8)

/** Trois ballons gummy tenus par un fil au banc de nuages ; ils tanguent doucement. */
export function Balloons() {
  const g = useRef<(Group | null)[]>([]), ph = useRef(0)
  const threads = useMemo(
    () =>
      BALLOONS.map((b) => {
        const top = new Vector3(...b.at).add(new Vector3(0, -b.s * 1.05, 0))
        const mid = top.clone().lerp(new Vector3(...KNOT_AT), 0.5).add(new Vector3(0.12, 0, -0.12))
        return new TubeGeometry(new CatmullRomCurve3([top, mid, new Vector3(...KNOT_AT)]), 10, 0.012, 4)
      }),
    [],
  )
  useFrame((_, dt) => {
    if (!reduceMotion) ph.current += Math.min(dt, 0.05)
    g.current.forEach((o, i) => {
      if (!o) return
      o.position.y = BALLOONS[i].at[1] + Math.sin(ph.current * 0.7 + BALLOONS[i].ph) * 0.1
      o.rotation.z = Math.sin(ph.current * 0.5 + BALLOONS[i].ph) * 0.06
    })
  })
  return (
    <>
      {BALLOONS.map((b, i) => (
        <group key={i}>
          <group ref={(o) => void (g.current[i] = o)} position={b.at}>
            <Part geo={BALLOON} m={b.mat} scale={[b.s, b.s * 1.2, b.s]} castShadow={false} />
            <Part geo={KNOT} m={b.mat} p={[0, -b.s * 1.2 - 0.02, 0]} scale={[0.06, 0.05, 0.06]} castShadow={false} />
          </group>
          <mesh geometry={threads[i]} material={K.thread} raycast={noRay} />
        </group>
      ))}
    </>
  )
}

// ───────── la guirlande de petits nuages, tendue de la lune à un nuage du banc de droite ─────────
const A = S(-4.1, 5.7, -3), Bp = S(2.2, 7.2, -5), Cc = S(8.2, 4.4, -4)
function sag(a: V3, b: V3, drop: number, n = 24): V3[] {
  const pts: V3[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - drop * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t])
  }
  return pts
}
/** Le fil et ses fanions-nuages (des Items pour le Batch des nuages). */
export function garland(): { geos: TubeGeometry[]; flags: Item[] } {
  const geos: TubeGeometry[] = [], flags: Item[] = []
  for (const [a, b, drop] of [[A, Bp, 1.0], [Bp, Cc, 1.4]] as [V3, V3, number][]) {
    const pts = sag(a, b, drop)
    geos.push(new TubeGeometry(new CatmullRomCurve3(pts.map((q) => new Vector3(...q))), 40, 0.014, 4))
    for (let i = 2; i < pts.length - 1; i += 3) {
      const p = pts[i], k = 0.2 + 0.07 * ((i / 3) % 2)
      // un petit nuage : deux boules et une plus petite, accrochés par le dessus
      flags.push({ p: [p[0], p[1] - k * 0.9, p[2]], s: [k * 1.25, k, k * 1.25], c: 0xffffff })
      flags.push({ p: [p[0] + k * 0.9 * 0.7071, p[1] - k * 0.75, p[2] - k * 0.9 * 0.7071], s: [k * 0.8, k * 0.7, k * 0.8], c: 0xfdeef5 })
      flags.push({ p: [p[0] - k * 0.9 * 0.7071, p[1] - k * 0.8, p[2] + k * 0.9 * 0.7071], s: [k * 0.75, k * 0.65, k * 0.75], c: 0xfdeef5 })
    }
  }
  return { geos, flags }
}
