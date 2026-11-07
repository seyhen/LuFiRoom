import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3, type Group, type Material } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion, useSquash } from '../anim'
import { Foliage } from '../nature/Foliage'
import { Leaf } from '../nature/Leaf'
import { T } from './materials'
import { LIMB, TRUNK } from './layout'

/**
 * Une branche (ou le tronc) qui suit un chemin et s'amincit, avec l'écorce à l'échelle : une tuile de texture tous les 1,6 le long,
 * deux fois autour. `r(u)` le rayon, de 0 (le pied) à 1 (le bout).
 */
export function limb(pts: V3[], r: (u: number) => number, n = 40, radial = 16): BufferGeometry {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), len = curve.getLength()
  // des repères transportés en parallèle le long du chemin : un tronc presque vertical ne se tord pas (le repère de `puff`, calé sur
  // le haut du monde, vrille quand la tangente en est proche)
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = []
  const P = new Vector3(), T = new Vector3(), N = new Vector3(), B = new Vector3(), o = new Vector3()
  curve.getTangentAt(0, T)
  N.set(Math.abs(T.x) < 0.9 ? 1 : 0, Math.abs(T.x) < 0.9 ? 0 : 1, 0).addScaledVector(T, -(Math.abs(T.x) < 0.9 ? T.x : T.y)).normalize()
  for (let i = 0; i <= n; i++) {
    const u = i / n, rr = r(u)
    curve.getPointAt(u, P)
    curve.getTangentAt(u, T)
    N.addScaledVector(T, -N.dot(T)).normalize()
    B.crossVectors(T, N).normalize()
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a)
      o.copy(N).multiplyScalar(c).addScaledVector(B, s)
      pos.push(P.x + o.x * rr, P.y + o.y * rr, P.z + o.z * rr)
      nor.push(o.x, o.y, o.z)
      uv.push((u * len) / 1.6, (j / radial) * 2)
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1
    idx.push(a, a + 1, b, b, a + 1, b + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** Le chemin du tronc : il monte du sous-bois, à peine penché, traverse le plancher et le toit. */
const TRUNK_PTS: V3[] = [
  [TRUNK.x + 0.1, TRUNK.y0, TRUNK.z + 0.05],
  [TRUNK.x + 0.03, -1.2, TRUNK.z],
  [TRUNK.x, 0.8, TRUNK.z],
  [TRUNK.x - 0.02, 3.0, TRUNK.z - 0.02],
  [TRUNK.x + 0.04, TRUNK.y1, TRUNK.z - 0.08],
]
/** Le rayon du tronc à la hauteur y (pour poser ce qu'on y cloue ou y noue). */
export const trunkR = (y: number) => TRUNK.r + ((TRUNK.rTop - TRUNK.r) * Math.max(0, y)) / TRUNK.y1

// Les branches maîtresses, en chemins : [points, rayon au pied, rayon au bout]
const LIMBS: [V3[], number, number][] = [
  // sous le plancher, celles qui le portent (dessous les poutres, sans les traverser), et qui finissent dans le feuillage d'en bas
  [[[TRUNK.x + 0.2, -1.25, TRUNK.z + 0.1], [-0.4, -0.95, -1.5], [1.6, -0.86, -0.7], [3.3, -0.8, 0.1], [4.2, -0.55, 0.4]], 0.24, 0.08],
  [[[TRUNK.x + 0.12, -1.35, TRUNK.z + 0.2], [-1.4, -1.0, 0.2], [-0.9, -0.88, 1.9], [-0.6, -0.8, 3.4], [-0.5, -0.6, 4.2]], 0.22, 0.08],
  // en haut : vers la droite au-dessus du toit, et vers le fond à gauche
  [[[TRUNK.x + 0.1, 3.7, TRUNK.z], [-1.0, 4.05, -2.45], [0.6, 4.3, -2.75], [2.0, 4.55, -2.95]], 0.2, 0.07],
  [[[TRUNK.x - 0.1, 4.2, TRUNK.z], [-2.7, 4.6, -1.5], [-3.1, 4.9, -0.8]], 0.17, 0.06],
  // la seconde branche maîtresse : elle part du tronc sous le plancher et remonte à travers lui, à l'avant gauche
  [[[TRUNK.x - 0.15, -1.7, TRUNK.z + 0.3], [-2.95, -1.45, 0.3], [LIMB.x - 0.05, -1.05, LIMB.z - 0.15], [LIMB.x, -0.2, LIMB.z], [LIMB.x, 1.2, LIMB.z], [LIMB.x + 0.03, 2.4, LIMB.z + 0.05], [LIMB.x + 0.2, 3.3, LIMB.z + 0.35]], LIMB.r + 0.03, 0.08],
]

/** Un rameau de feuilles de chêne : une tige, des feuilles ovales en bouquet, un ou deux glands. */
function Sprig({ p, ry = 0, tilt = 0.5, n = 7, acorns = 0, s = 1 }: { p: V3; ry?: number; tilt?: number; n?: number; acorns?: number; s?: number }) {
  return (
    <group position={p} rotation={[0, ry, tilt]} scale={s}>
      <Part geo={cyl(0.012, 0.018, 0.5, 6)} m={T.barkDark} p={[0.0, -0.25, 0]} castShadow={false} />
      {Array.from({ length: n }, (_, i) => {
        const a = i * 2.4, y = -0.08 - i * 0.06
        return (
          <group key={i} position={[0, y, 0]} rotation-y={a}>
            <Leaf kind="ovate" r={[0.6 + (i % 3) * 0.2, 0, 0]} w={0.07} l={0.17} m={i % 3 ? T.leaf : T.leafLight} />
          </group>
        )
      })}
      {Array.from({ length: acorns }, (_, i) => (
        <group key={i} position={[0.04 * (i ? -1 : 1), -0.48, 0.02]}>
          <Part geo={SPH} m={T.acorn} scale={[0.035, 0.05, 0.035]} castShadow={false} />
          <Part geo={SPH} m={T.acornCap} scale={[0.04, 0.025, 0.04]} p={[0, 0.03, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** Le chêne immobile : le tronc, ses branches maîtresses, quelques chicots coupés, la mousse au pied des branches, des rameaux. */
export function Oak() {
  const geos = useMemo(
    () => ({
      trunk: limb(TRUNK_PTS, (u) => (u < 0.35 ? 0.5 - (0.5 - TRUNK.r) * (u / 0.35) : TRUNK.r + (TRUNK.rTop - TRUNK.r) * ((u - 0.35) / 0.65)), 60, 22),
      limbs: LIMBS.map(([pts, a, b]) => limb(pts, (u) => a + (b - a) * Math.pow(u, 0.8))),
    }),
    [],
  )
  return (
    <>
      <Part geometry={geos.trunk} m={T.bark} />
      {geos.limbs.map((g, i) => <Part key={i} geometry={g} m={T.bark} />)}
      {/* un chicot coupé sur le tronc, sa tranche claire et ses cernes, au-dessus du hamac */}
      <group position={[TRUNK.x + 0.32, 2.35, TRUNK.z + 0.22]} rotation={[0.5, 0.6, -1.0]}>
        <Part geo={cyl(0.09, 0.11, 0.2, 14)} m={T.bark} />
        <Part geo={cyl(0.085, 0.085, 0.01, 14)} m={T.cut} p={[0, 0.102, 0]} castShadow={false} />
      </group>
      {/* la mousse dans le creux des fourches, et au nord du tronc */}
      <Part geo={SPH} m={T.moss} scale={[0.32, 0.12, 0.3]} p={[TRUNK.x - 0.18, 3.72, TRUNK.z - 0.08]} castShadow={false} />
      <Part geo={SPH} m={T.moss} scale={[0.2, 0.5, 0.16]} p={[TRUNK.x - 0.3, 1.0, TRUNK.z - 0.22]} castShadow={false} />
      <Part geo={SPH} m={T.moss} scale={[0.14, 0.3, 0.12]} p={[LIMB.x - 0.12, 0.6, LIMB.z - 0.1]} castShadow={false} />
      {/* des rameaux de feuilles qui pendent dans la cabane, au-dessus du hamac et devant le toit */}
      <Sprig p={[LIMB.x - 0.2, 2.95, LIMB.z + 0.3]} ry={-0.4} tilt={0.5} acorns={2} />
      <Sprig p={[LIMB.x - 0.25, 2.5, LIMB.z - 0.05]} ry={0.6} tilt={0.4} n={6} />
      <Sprig p={[1.9, 4.2, -2.6]} ry={0.9} tilt={0.3} n={8} acorns={1} s={1.2} />
      <Sprig p={[-3.0, 4.55, -0.9]} ry={1.4} tilt={-0.3} n={7} s={1.1} />
    </>
  )
}

/** Les masses de feuillage du bas : sous le plancher, elles cachent le pied du tronc et font le nid de la cabane. */
export function LowerCrown() {
  const list: [number, V3, V3, Material][] = [
    [0, [2.6, -2.1, 1.2], [1.5, 1.5, 1.3], T.oak],
    [1, [0.6, -2.3, 2.9], [1.6, 1.5, 1.2], T.oakDeep],
    [2, [-2.2, -2.2, 2.4], [1.3, 1.4, 1.2], T.oak],
    [3, [3.6, -1.6, -1.3], [1.0, 1.1, 1.1], T.oakLight],
    [4, [-3.6, -1.9, 0.0], [1.0, 1.2, 1.2], T.oakDeep],
    [5, [4.0, -1.2, 0.5], [0.8, 0.9, 0.8], T.oakLight],
    [1, [-0.5, -1.5, 4.1], [0.8, 0.9, 0.8], T.oakLight],
    [2, [2.4, -2.6, 3.4], [1.0, 1.0, 1.0], T.oak],
  ]
  return (
    <>
      {list.map(([v, p, s, m], i) => <Foliage key={i} v={v} p={p} s={s} m={m} ry={i * 1.3} shadow={false} />)}
    </>
  )
}

// Les masses du haut du chêne : [forme, pied, demi-tailles, matériau]. La première est celle du bouton « le vent dans les feuilles ».
const UPPER: [number, V3, V3, Material][] = [
  [0, [2.0, 4.0, -2.9], [1.15, 1.0, 1.0], T.oakLight],
  [1, [0.3, 4.15, -3.1], [1.1, 1.0, 0.9], T.oak],
  [2, [-2.2, 4.3, -2.6], [1.3, 1.15, 1.2], T.oakDeep],
  [3, [-3.3, 4.4, -0.7], [0.9, 0.85, 1.0], T.oak],
  [4, [-2.45, 3.05, 2.35], [0.85, 0.85, 0.85], T.oakLight],
  [5, [-1.0, 4.9, -3.4], [0.9, 0.7, 0.8], T.oakLight],
]
/** Où pend le bouton du chêne : au cœur de la masse de droite. */
export const OAK_ANCHOR: V3 = [UPPER[0][1][0], UPPER[0][1][1] + 0.7, UPPER[0][1][2]]

/**
 * Le haut du chêne, qui bruisse : c'est l'objet « le vent dans les feuilles ». Quand le son joue, chaque masse de feuillage se balance
 * doucement, à son rythme (la phase s'additionne image après image), un peu plus fort dans les rafales qu'on entend ; sinon elle
 * respire à peine. Chaque masse est un groupe vivant qui fusionne ses maillages (un tracé par masse).
 */
export function UpperCrown() {
  const g = useRef<Group>(null!), masses = useRef<Group[]>([])
  const st = useRef({ amp: 0, ph: UPPER.map((_, i) => i * 1.7), next: 4, gust: 0 })
  useSquash('oak', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'oak')
    // une risée de loin en loin, tant que le vent se fait entendre
    s.next -= dt
    if (s.next <= 0) {
      s.next = 9 + Math.random() * 9
      if (on) s.gust = 1
    }
    s.gust = Math.max(0, s.gust - dt * 0.35)
    s.amp = approach(s.amp, reduceMotion ? 0 : on ? 1 : 0.15, dt * 0.5)
    masses.current.forEach((m, i) => {
      s.ph[i] += dt * (0.7 + i * 0.09) * (1 + s.gust * 0.6)
      const a = s.amp * (0.025 + s.gust * 0.03)
      m.rotation.set(Math.sin(s.ph[i]) * a, 0, Math.cos(s.ph[i] * 0.8 + i) * a)
    })
  })
  const [, p0] = UPPER[0]
  return (
    <group ref={g} userData={{ id: 'oak' }} position={p0}>
      {UPPER.map(([v, p, s, m], i) => (
        // chaque masse pivote autour de son pied (sa branche), pas autour du centre de la pièce
        <group key={i} ref={(o) => o && (masses.current[i] = o)} position={[p[0] - p0[0], p[1] - p0[1], p[2] - p0[2]]} userData={LIVE}>
          <Static>
            <Foliage v={v} p={[0, 0, 0]} s={s} m={m} ry={i * 0.9} />
          </Static>
        </group>
      ))}
    </group>
  )
}
