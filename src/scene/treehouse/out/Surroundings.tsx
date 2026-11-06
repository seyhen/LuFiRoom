import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, SpriteMaterial, TorusGeometry, TubeGeometry, Vector3, type Group } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../../parts'
import { gummy } from '../../materials'
import { glowTex } from '../../textures'
import { SkyFadeClock } from '../../outdoor'
import { Foliage } from '../../nature/Foliage'
import { treehouse } from '../../../rooms/treehouse'
import { GlowPoints } from '../../objects/GlowPoints'
import { T } from '../materials'
import { DECK } from '../layout'

// Le dehors de la cabane perchée : un pont de corde file au-dessus des cimes jusqu'à une vigie dans le chêne voisin (un petit
// plancher rond, un garde-corps, un toit pointu de bardeaux, une longue-vue, un fanion), des bocaux-lanternes pendus aux cordes
// qui s'allument le soir, et une balançoire-pneu sous une branche du voisin.

const tube = (pts: V3[], r: number, seg = 40) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), seg, r, 6, false)
const TIRE = new TorusGeometry(1, 0.38, 12, 28)

/** La vigie : le pied du chêne voisin, le plancher. */
const NEST = { x: 7.0, z: -1.9, y: 0.35, r: 1.05 }
/** Les deux bouts du pont : sur le bord droit de notre plancher (derrière l'échelle), sur le plancher de la vigie. */
const A: V3 = [DECK.x1 + 0.05, -0.02, -1.55], B: V3 = [NEST.x - NEST.r + 0.05, NEST.y, NEST.z + 0.1]
const SAG = 0.55

const at = (t: number, dy = 0, dz = 0): V3 => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - SAG * Math.sin(Math.PI * t) + dy, A[2] + (B[2] - A[2]) * t + dz]

const lanternGlass = gummy(0xfff2cc, { roughness: 0.15, clearcoat: 1, emissive: 0xffc070, emissiveIntensity: 0.1 })
const glow = new SpriteMaterial({ map: glowTex, color: 0xffcf80, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })
const pennant = gummy(0xd8794e, { roughness: 0.6, side: 2 })

/** Le pont de corde : des planches sur deux cordes porteuses, deux mains courantes, des suspentes, trois bocaux-lanternes. */
function RopeBridge() {
  const geo = useMemo(() => {
    const line = (dy: number, dz: number) => tube(Array.from({ length: 13 }, (_, i) => at(i / 12, dy, dz)), dy > 0 ? 0.02 : 0.025)
    return { feet: [line(-0.02, -0.32), line(-0.02, 0.32)], hands: [line(0.75, -0.36), line(0.75, 0.36)] }
  }, [])
  const planks = 16
  return (
    <group>
      {geo.feet.map((g, i) => <Part key={`f${i}`} geo={g} m={T.rope} castShadow={false} />)}
      {geo.hands.map((g, i) => <Part key={`h${i}`} geo={g} m={T.rope} castShadow={false} />)}
      {Array.from({ length: planks }, (_, i) => {
        const t = (i + 0.5) / planks, p = at(t), q = at(t + 0.01), slope = Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2]))
        const yaw = Math.atan2(-(B[2] - A[2]), B[0] - A[0])
        return <Part key={i} geo={rbox(0.14, 0.04, 0.72, 0.015)} m={i % 3 ? T.plank : T.plankDark} p={p} rotation={[0, yaw, slope]} />
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const t = (i + 1) / 8
        return [-0.34, 0.34].map((dz) => {
          const a = at(t, 0, dz), b = at(t, 0.75, dz * 1.06), d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
          return <Part key={`${i}${dz}`} geo={cyl(0.012, 0.012, Math.hypot(...d), 5)} m={T.twine} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} />
        })
      })}
      {/* les poteaux d'ancrage côté cabane */}
      {[-0.4, 0.4].map((dz) => <Part key={dz} geo={cyl(0.06, 0.07, 1.1, 10)} m={T.beam} p={[A[0] - 0.02, 0.45, A[2] + dz]} />)}
    </group>
  )
}

/** Un bocal-lanterne pendu à la main courante : verre, couvercle, anse de ficelle. */
function JarLantern({ t, dz }: { t: number; dz: number }) {
  const p = at(t, 0.75, dz)
  return (
    <group position={[p[0], p[1] - 0.22, p[2]]}>
      <Part geo={cyl(0.003, 0.003, 0.2, 4)} m={T.twine} p={[0, 0.12, 0]} castShadow={false} />
      <Part geo={cyl(0.055, 0.06, 0.03, 12)} m={T.iron} p={[0, 0.02, 0]} castShadow={false} />
      <Part geo={cyl(0.06, 0.055, 0.13, 14)} m={lanternGlass} p={[0, -0.06, 0]} castShadow={false} />
    </group>
  )
}

/** La vigie dans le chêne voisin : tronc, plancher rond, garde-corps, toit pointu de bardeaux, longue-vue, fanion. */
function Nest() {
  const { x, z, y, r } = NEST
  return (
    <group>
      <Part geo={cyl(0.32, 0.45, 5.2, 14)} m={T.bark} p={[x, y - 1.6, z]} />
      <Part geo={cyl(0.22, 0.3, 2.6, 12)} m={T.bark} p={[x, y + 1.3, z]} />
      <Part geo={cyl(r, r, 0.12, 24)} m={T.plank} p={[x, y - 0.06, z]} />
      {/* les jambes de force sous le plancher */}
      {[0, 1, 2].map((i) => { const a = i * 2.1; return <Part key={i} geo={cyl(0.04, 0.04, 1.1, 6)} m={T.beam} p={[x + Math.cos(a) * 0.45, y - 0.45, z + Math.sin(a) * 0.45]} rotation={[Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6]} castShadow={false} /> })}
      {/* le garde-corps, ouvert côté pont */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        if (Math.cos(a) < -0.85) return null
        return <Part key={i} geo={cyl(0.03, 0.03, 0.62, 6)} m={T.beam} p={[x + Math.cos(a) * (r - 0.06), y + 0.31, z + Math.sin(a) * (r - 0.06)]} castShadow={false} />
      })}
      <Part geo={new TorusGeometry(r - 0.06, 0.035, 6, 32, Math.PI * 1.65)} m={T.beam} p={[x, y + 0.62, z]} rotation={[Math.PI / 2, 0, Math.PI * 1.17]} castShadow={false} />
      {/* le toit pointu de bardeaux et son mât */}
      <Part geo={cyl(0.08, 0.08, 1.7, 8)} m={T.beam} p={[x + 0.55, y + 0.85, z - 0.55]} castShadow={false} />
      <Part geo={cyl(0.02, r + 0.25, 0.85, 12)} m={T.shingles} p={[x, y + 2.05, z]} />
      <Part geo={SPH} m={T.ridge} p={[x, y + 2.5, z]} scale={0.07} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.5, 5)} m={T.iron} p={[x, y + 2.75, z]} castShadow={false} />
      <Part geo={rbox(0.3, 0.16, 0.01, 0.005)} m={pennant} p={[x + 0.16, y + 2.9, z]} castShadow={false} />
      {/* la longue-vue sur son trépied */}
      <group position={[x + 0.3, y, z + 0.45]}>
        {[0, 2.1, 4.2].map((a) => <Part key={a} geo={cyl(0.015, 0.015, 0.55, 5)} m={T.walnut} p={[Math.cos(a) * 0.1, 0.26, Math.sin(a) * 0.1]} rotation={[-Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2]} castShadow={false} />)}
        <Part geo={cyl(0.035, 0.05, 0.5, 12)} m={T.brass} p={[0.08, 0.58, 0.05]} rotation={[0.2, 0, -1.2]} castShadow={false} />
      </group>
      {/* le feuillage du chêne voisin, au-dessus et autour */}
      <Foliage v={2} p={[x - 0.6, y + 2.2, z - 1.0]} s={[1.3, 0.9, 1.1]} m={T.oak} shadow={false} />
      <Foliage v={4} p={[x + 1.0, y + 1.8, z - 0.6]} s={[1.0, 0.75, 0.9]} m={T.oakLight} shadow={false} />
      <Foliage v={1} p={[x + 0.7, y + 2.8, z - 1.2]} s={[0.9, 0.6, 0.8]} m={T.oakDeep} shadow={false} />
    </group>
  )
}

/** La balançoire-pneu sous une branche du voisin, qui se balance doucement. */
function TireSwing() {
  const g = useRef<Group>(null!), ph = useRef(0)
  const top: V3 = [NEST.x + 1.3, NEST.y - 0.25, NEST.z + 1.0]
  useFrame((_, dt) => {
    if (!reduceMotion) ph.current += Math.min(dt, 0.05) * 1.1
    g.current.rotation.z = Math.sin(ph.current) * 0.08
    g.current.rotation.x = Math.sin(ph.current * 0.7) * 0.05
  })
  return (
    <group>
      <Part geo={cyl(0.08, 0.12, 1.6, 10)} m={T.bark} p={[NEST.x + 0.75, NEST.y - 0.3, NEST.z + 0.6]} rotation={[0.6, 0, -1.1]} />
      <group ref={g} position={top} userData={LIVE}>
        <Static>
          <Part geo={cyl(0.015, 0.015, 1.6, 5)} m={T.rope} p={[0, -0.8, 0]} castShadow={false} />
          <Part geo={TIRE} m={T.iron} p={[0, -1.72, 0]} rotation-x={Math.PI / 2 - 0.1} scale={0.28} />
        </Static>
      </group>
    </group>
  )
}

const LANTERNS: [number, number][] = [[0.22, 0.36], [0.5, -0.36], [0.78, 0.36]]

export function Surroundings() {
  useFrame(() => {
    const k = Math.min(1, smooth(mood.night) + mood.rain * 0.2)
    lanternGlass.emissiveIntensity = 0.1 + k * 1.8
    glow.opacity = k * 0.8
  })
  return (
    <>
      <SkyFadeClock room={treehouse} />
      <Static>
        <RopeBridge />
        {LANTERNS.map(([t, dz]) => <JarLantern key={t} t={t} dz={dz} />)}
        <Nest />
      </Static>
      <GlowPoints points={LANTERNS.map(([t, dz]): V3 => { const p = at(t, 0.75, dz); return [p[0], p[1] - 0.28, p[2] + 0.05] })} color={0xffcf80} size={0.55} level={() => glow.opacity} />
      <TireSwing />
    </>
  )
}
