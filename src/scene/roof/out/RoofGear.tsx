import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { LatheGeometry, TorusGeometry, Vector2, type Group } from 'three'
import { reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, noRay, orient, rbox, type V3 } from '../../parts'
import { O } from './materials'
import { GlowPoints } from '../../objects/GlowPoints'

const RING = new TorusGeometry(1, 0.06, 6, 24)
const DISH = new LatheGeometry([[0, 0], [0.25, 0.02], [0.5, 0.08], [0.72, 0.18], [0.76, 0.2], [0.74, 0.215], [0.5, 0.1], [0.25, 0.04], [0, 0.02]].map(([r, y]) => new Vector2(r, y)), 24)

/** Une pièce qui tourne sur elle-même autour de y (pales, turbine), à `rate` tours par seconde. */
function Spin({ rate, children, ...rest }: { rate: number; children: ReactNode } & ThreeElements['group']) {
  const g = useRef<Group>(null!)
  useFrame((_, dt) => { if (!reduceMotion) g.current.rotation.y += Math.min(dt, 0.05) * rate * Math.PI * 2 })
  return <group ref={g} userData={LIVE} {...rest}><Static>{children}</Static></group>
}

/**
 * Un climatiseur de toit : caisson de tôle à persiennes, grille ronde sur le dessus et ses pales qui tournent, pieds, tuyaux
 * qui filent vers le parapet. `ry` l'oriente.
 */
export function AirCon({ p, ry = 0 }: { p: V3; ry?: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(1.0, 0.62, 0.78, 0.06)} m={O.metal} p={[0, 0.41, 0]} />
      {/* persiennes sur la face avant */}
      {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={rbox(0.86, 0.02, 0.03, 0.008)} m={O.metalDark} p={[0, 0.2 + i * 0.075, 0.4]} castShadow={false} />)}
      {[-0.4, 0.4].flatMap((dx) => [-0.3, 0.3].map((dz) => <Part key={`${dx}${dz}`} geo={rbox(0.08, 0.1, 0.08, 0.02)} m={O.steel} p={[dx, 0.05, dz]} castShadow={false} />))}
      <Part geo={cyl(0.3, 0.3, 0.06, 24)} m={O.metalDark} p={[0, 0.74, 0]} castShadow={false} />
      <Part geo={RING} m={O.steel} p={[0, 0.78, 0]} rotation-x={Math.PI / 2} scale={[0.3, 0.3, 0.4]} castShadow={false} />
      <Spin rate={1.6} position={[0, 0.76, 0]}>
        {[0, 1, 2, 3].map((k) => <Part key={k} geo={rbox(0.26, 0.012, 0.08, 0.01)} m={O.steel} p={[Math.cos(k * 1.571) * 0.14, 0, Math.sin(k * 1.571) * 0.14]} rotation={[0.35, -k * 1.571, 0]} castShadow={false} />)}
        <Part geo={SPH} m={O.steel} scale={[0.05, 0.03, 0.05]} castShadow={false} />
      </Spin>
      {/* deux tuyaux isolés qui partent sur le toit */}
      {[-0.15, 0.1].map((dx, i) => (
        <group key={i}>
          <Part geo={cyl(0.035, 0.035, 0.4, 8)} m={O.metalDark} p={[dx - 0.52, 0.3, 0]} castShadow={false} />
          <Part geo={cyl(0.035, 0.035, 0.6 + i * 0.3, 8)} m={O.metalDark} p={[dx - 0.52, 0.1, -0.3 - i * 0.15]} rotation-x={Math.PI / 2} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** La verrière : un toit de verre à deux pans sur un muret, ses montants de fer ; elle s'éclaire du dedans le soir. */
export function Skylight({ p, w = 1.4, d = 0.9 }: { p: V3; w?: number; d?: number }) {
  return (
    <group position={p}>
      <Part geo={rbox(w + 0.12, 0.28, d + 0.12, 0.04)} m={O.coping} p={[0, 0.14, 0]} />
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0.44, s * d * 0.25]} rotation-x={s * 0.62}>
          <Part geo={rbox(w, 0.025, d * 0.6, 0.01)} m={O.glass} castShadow={false} />
          {Array.from({ length: 5 }, (_, i) => <Part key={i} geo={rbox(0.03, 0.04, d * 0.62, 0.01)} m={O.steel} p={[-w / 2 + (i * w) / 4, 0.01, 0]} castShadow={false} />)}
        </group>
      ))}
      <Part geo={rbox(w + 0.04, 0.05, 0.05, 0.015)} m={O.steel} p={[0, 0.58, 0]} castShadow={false} />
    </group>
  )
}

/** L'aérateur à turbine : un conduit, et la boule à ailettes qui tourne au vent. */
export function Turbine({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={cyl(0.13, 0.15, 0.55, 14)} m={O.metal} p={[0, 0.27, 0]} />
      <Part geo={cyl(0.17, 0.17, 0.05, 14)} m={O.metalDark} p={[0, 0.56, 0]} castShadow={false} />
      <Spin rate={0.45} position={[0, 0.75, 0]}>
        <Part geo={SPH} m={O.metal} scale={[0.22, 0.2, 0.22]} />
        {Array.from({ length: 10 }, (_, k) => (
          <Part key={k} geo={RING} m={O.metalDark} rotation={[0, (k / 10) * Math.PI, 0]} scale={[0.222, 0.205, 0.2]} castShadow={false} />
        ))}
        <Part geo={SPH} m={O.metalDark} p={[0, 0.2, 0]} scale={0.04} castShadow={false} />
      </Spin>
    </group>
  )
}

/** Une antenne parabolique tournée vers le ciel du sud, sur son pied lesté. */
export function Dish({ p, ry = 0 }: { p: V3; ry?: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(0.5, 0.1, 0.5, 0.03)} m={O.coping} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={cyl(0.03, 0.035, 0.7, 8)} m={O.steel} p={[0, 0.42, 0]} />
      <group position={[0, 0.78, 0]} rotation-x={0.9}>
        <Part geo={DISH} m={O.metal} scale={0.62} />
        <Part geo={cyl(0.012, 0.012, 0.5, 5)} m={O.steel} p={[0, 0.3, 0]} castShadow={false} />
        <Part geo={rbox(0.06, 0.08, 0.06, 0.015)} m={O.steel} p={[0, 0.55, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Un conduit de cheminée de brique et ses mitrons de terre cuite. */
export function Chimney({ p, b = 0, pots = 3 }: { p: V3; b?: number; pots?: number }) {
  return (
    <group position={p}>
      <Part geo={rbox(0.32 * pots + 0.1, 0.9, 0.42, 0.04)} m={O.brick[b]} p={[0, 0.45, 0]} />
      <Part geo={rbox(0.32 * pots + 0.18, 0.08, 0.5, 0.03)} m={O.coping} p={[0, 0.92, 0]} castShadow={false} />
      {Array.from({ length: pots }, (_, i) => (
        <Part key={i} geo={cyl(0.08, 0.1, 0.32, 12)} m={O.terracotta} p={[-0.16 * (pots - 1) + i * 0.32, 1.12, 0]} castShadow={false} />
      ))}
    </group>
  )
}

/** Des bacs de jardin potager, leurs plants et deux chaises pliantes : le toit d'en face cultive aussi. */
export function RoofGarden({ p }: { p: V3 }) {
  const plants = useMemo(() => [[-0.9, 0], [-0.3, 0.05], [0.3, -0.04], [0.9, 0.02]] as const, [])
  return (
    <group position={p}>
      {[0, 1].map((row) => (
        <group key={row} position={[0, 0, row * 1.1]}>
          <Part geo={rbox(2.4, 0.38, 0.55, 0.04)} m={O.wood} p={[0, 0.19, 0]} />
          {plants.map(([x, z], i) => (
            <group key={i} position={[x, 0.38, z]}>
              <Part geo={SPH} m={O.leaf} p={[0, 0.12, 0]} scale={[0.2, 0.16, 0.18]} />
              <Part geo={SPH} m={O.leaf} p={[0.08, 0.2, 0.04]} scale={[0.12, 0.1, 0.11]} castShadow={false} />
            </group>
          ))}
        </group>
      ))}
      {/* deux chaises pliantes rouille */}
      {[[1.8, 0.4, -0.6], [1.9, 1.3, -1.1]].map(([x, z, ry], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={ry}>
          <Part geo={rbox(0.36, 0.03, 0.34, 0.01)} m={O.rust} p={[0, 0.42, 0]} />
          <Part geo={rbox(0.36, 0.34, 0.03, 0.01)} m={O.rust} p={[0, 0.62, -0.17]} rotation-x={-0.12} />
          {[-0.16, 0.16].map((dx) => <Part key={dx} geo={cyl(0.012, 0.012, 0.6, 5)} m={O.steel} p={[dx, 0.24, 0]} rotation-x={0.4} castShadow={false} />)}
          {[-0.16, 0.16].map((dx) => <Part key={dx + 1} geo={cyl(0.012, 0.012, 0.6, 5)} m={O.steel} p={[dx, 0.24, 0]} rotation-x={-0.4} castShadow={false} />)}
        </group>
      ))}
    </group>
  )
}

/** La cage d'escalier qui sort sur le toit voisin : un cube de brique, sa porte de fer et sa petite lampe. */
export function Bulkhead({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={rbox(1.3, 1.9, 1.2, 0.05)} m={O.brick[1]} p={[0, 0.95, 0]} />
      <Part geo={rbox(1.42, 0.08, 1.32, 0.03)} m={O.coping} p={[0, 1.93, 0]} castShadow={false} />
      <Part geo={rbox(0.72, 1.45, 0.05, 0.02)} m={O.rust} p={[0.05, 0.73, 0.61]} castShadow={false} />
      <Part geo={SPH} m={O.steel} p={[0.3, 0.75, 0.65]} scale={0.03} castShadow={false} />
      <Part geo={cyl(0.06, 0.09, 0.08, 10)} m={O.lampHead} p={[0.05, 1.62, 0.68]} rotation-x={0.4} castShadow={false} />
      <Part geo={SPH} m={O.bulb} p={[0.05, 1.58, 0.7]} scale={0.035} castShadow={false} />
    </group>
  )
}

const LAMPS = [-1.1, 0, 1.1]

/**
 * Le panneau publicitaire sur le toit voisin : l'affiche peinte (une tasse fumante, « COFFEE · day & night »), son cadre, ses deux
 * jambes de fer et la passerelle, trois lampes en col de cygne qui l'éclairent le soir. Tourné vers la caméra.
 */
export function Billboard({ p, ry = Math.PI / 4 }: { p: V3; ry?: number }) {
  const W = 3.4, H = 1.5, Y = 1.5
  return (
    <group position={p} rotation-y={ry}>
      <Static>
        {/* jambes et contreventement */}
        {[-1.2, 1.2].map((x) => (
          <group key={x}>
            <Part geo={rbox(0.12, Y + 0.2, 0.12, 0.02)} m={O.steel} p={[x, (Y + 0.2) / 2, -0.25]} />
            <Part geo={cyl(0.02, 0.02, 1.4, 5)} m={O.steel} p={[x, Y * 0.5, -0.55]} rotation-x={0.55} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.02, 0.02, 2.6, 5)} m={O.steel} p={[0, Y * 0.5, -0.25]} rotation-z={0.48} castShadow={false} />
        {/* le cadre et l'affiche */}
        <Part geo={rbox(W + 0.16, H + 0.16, 0.1, 0.03)} m={O.steel} p={[0, Y + H / 2 + 0.1, -0.18]} />
        <mesh position={[0, Y + H / 2 + 0.1, -0.125]} material={O.billboard} raycast={noRay}>
          <planeGeometry args={[W, H]} />
        </mesh>
        {/* la passerelle et sa rambarde */}
        <Part geo={rbox(W + 0.2, 0.04, 0.4, 0.01)} m={O.steel} p={[0, Y + 0.02, 0.05]} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, W + 0.2, 5)} m={O.steel} p={[0, Y + 0.45, 0.24]} rotation-z={Math.PI / 2} castShadow={false} />
        {Array.from({ length: 7 }, (_, i) => <Part key={i} geo={cyl(0.01, 0.01, 0.45, 5)} m={O.steel} p={[-W / 2 + (i * W) / 6, Y + 0.24, 0.24]} castShadow={false} />)}
        {/* les lampes en col de cygne */}
        {LAMPS.map((x) => {
          const a: V3 = [x, Y + H + 0.18, -0.2], b: V3 = [x, Y + H + 0.5, 0.25]
          const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
          return (
            <group key={x}>
              <Part geo={cyl(0.015, 0.015, Math.hypot(...d), 5)} m={O.steel} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} />
              <Part geo={cyl(0.05, 0.13, 0.12, 12)} m={O.lampHead} p={[x, Y + H + 0.48, 0.32]} rotation-x={0.6} castShadow={false} />
              <Part geo={SPH} m={O.bulb} p={[x, Y + H + 0.43, 0.36]} scale={0.045} castShadow={false} />
            </group>
          )
        })}
      </Static>
      <GlowPoints points={LAMPS.map((x): V3 => [x, Y + H + 0.38, 0.42])} color={0xffcf80} size={0.8} level={() => O.glow.opacity} />
    </group>
  )
}
