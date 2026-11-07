import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, LatheGeometry, TubeGeometry, Vector2, Vector3, type Group } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, rbox, type V3 } from '../../parts'
import { S } from './materials'
import { SEA } from './Sea'

const tube = (pts: V3[], r: number) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 30, r, 6, false)
/** La coque de la barque : un bol allongé, ouvert (on voit le dedans), bord épais. */
const HULL = new LatheGeometry([[0, 0], [0.45, 0.04], [0.82, 0.18], [0.98, 0.38], [1, 0.46], [0.95, 0.47], [0.78, 0.22], [0.42, 0.1], [0, 0.07]].map(([r, y]) => new Vector2(r, y)), 28)

/**
 * Le ponton du gardien, contre la face +x du socle (côté caméra, entre la pièce et le phare) : son centre et son orientation. Le
 * ponton est dessiné l'échelle vers -z ; tourné d'un quart de tour, l'échelle se plaque contre la roche sous la pièce.
 */
export const DOCK = { x: 3.98, z: -0.5, ry: Math.PI / 2 }

/**
 * Le ponton du gardien : une échelle de fer qui descend le long de la roche, un plancher sur pilotis au ras de l'eau, un anneau
 * d'amarrage, et la barque bleue qui danse sur la houle (elle tangue plus fort dans la tempête), ses avirons rangés dedans.
 */
export function Landing() {
  const boat = useRef<Group>(null!), ph = useRef(0)
  const rope = useMemo(() => tube([[0.45, SEA + 0.4, 0.3], [0.75, SEA + 0.12, 0.55], [1.05, SEA + 0.25, 0.85]], 0.014), [])
  useFrame((_, dt) => {
    const st = smooth(mood.storm)
    if (!reduceMotion) ph.current += Math.min(dt, 0.05) * (1.1 + st * 1.4)
    const p = ph.current, k = 1 + st * 2.2
    boat.current.position.y = SEA + 0.02 + Math.sin(p) * 0.035 * k
    boat.current.rotation.set(Math.sin(p * 0.8 + 1) * 0.05 * k, -0.5, Math.sin(p * 1.1) * 0.06 * k)
  })
  return (
    <group position={[DOCK.x, 0, DOCK.z]} rotation-y={DOCK.ry}>
      <Static>
        {/* l'échelle, de la pièce jusqu'au ponton */}
        {[-0.2, 0.2].map((dx) => <Part key={dx} geo={cyl(0.025, 0.025, 2.2, 6)} m={S.iron} p={[-0.6 + dx, SEA + 1.05, -0.62]} rotation-x={0.18} castShadow={false} />)}
        {Array.from({ length: 8 }, (_, i) => <Part key={i} geo={cyl(0.016, 0.016, 0.4, 5)} m={S.iron} p={[-0.6, SEA + 0.15 + i * 0.27, -0.78 + i * 0.048]} rotation-z={Math.PI / 2} castShadow={false} />)}
        {/* le ponton sur ses pieux */}
        <Part geo={rbox(1.5, 0.07, 0.95, 0.02)} m={S.wood} p={[0, SEA + 0.28, 0]} />
        {[-0.62, 0.62].flatMap((dx) => [-0.38, 0.38].map((dz) => (
          <Part key={`${dx}${dz}`} geo={cyl(0.06, 0.06, 0.85, 8)} m={S.woodDark} p={[dx, SEA + 0.0, dz]} castShadow={false} />
        )))}
        {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={rbox(0.02, 0.075, 0.95, 0.008)} m={S.woodDark} p={[-0.62 + i * 0.25, SEA + 0.285, 0]} castShadow={false} />)}
        <Part geo={cyl(0.06, 0.06, 0.2, 8)} m={S.iron} p={[0.45, SEA + 0.4, 0.3]} castShadow={false} />
        <Part geo={rope} m={S.rope} castShadow={false} />
        {/* un casier à homards sur le ponton */}
        <group position={[-0.3, SEA + 0.43, 0.15]} rotation-y={0.3}>
          <Part geo={rbox(0.42, 0.22, 0.3, 0.05)} m={S.woodDark} />
          {[-0.12, 0, 0.12].map((dx) => <Part key={dx} geo={rbox(0.02, 0.23, 0.31, 0.008)} m={S.rope} p={[dx, 0, 0]} castShadow={false} />)}
        </group>
      </Static>
      <group ref={boat} position={[1.15, SEA, 0.95]} userData={LIVE}>
        <Static>
          <Part geo={HULL} m={S.hull} scale={[0.95, 0.55, 0.42]} />
          <Part geo={HULL} m={S.hullIn} scale={[0.93, 0.54, 0.4]} p={[0, 0.012, 0]} castShadow={false} />
          {[-0.28, 0.22].map((dx) => <Part key={dx} geo={rbox(0.12, 0.03, 0.66, 0.01)} m={S.wood} p={[dx, 0.17, 0]} castShadow={false} />)}
          {[-0.1, 0.1].map((dz) => <Part key={dz} geo={cyl(0.018, 0.018, 1.4, 6)} m={S.wood} p={[0, 0.23, dz]} rotation-z={Math.PI / 2 - 0.04} castShadow={false} />)}
          <Part geo={SPH} m={S.buoyWhite} p={[0.86, 0.2, 0]} scale={0.05} castShadow={false} />
        </Static>
      </group>
    </group>
  )
}

/** La bouée à cloche qui roule sur la houle : flotteur rouge et blanc, cage, cloche, lanterne verte. */
export function BellBuoy({ x, z }: { x: number; z: number }) {
  const g = useRef<Group>(null!), ph = useRef(0)
  useFrame((_, dt) => {
    const st = smooth(mood.storm)
    if (!reduceMotion) ph.current += Math.min(dt, 0.05) * (0.9 + st)
    const p = ph.current, k = 1 + st * 2
    g.current.position.y = SEA + Math.sin(p) * 0.05 * k
    g.current.rotation.set(Math.sin(p * 0.9) * 0.08 * k, 0, Math.cos(p * 0.7) * 0.08 * k)
  })
  return (
    <group ref={g} position={[x, SEA, z]} userData={LIVE}>
      <Static>
        <Part geo={SPH} m={S.buoyRed} p={[0, 0.05, 0]} scale={[0.42, 0.24, 0.42]} />
        <Part geo={cyl(0.42, 0.42, 0.1, 20)} m={S.buoyWhite} p={[0, 0.12, 0]} castShadow={false} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + 0.4
          return <Part key={i} geo={cyl(0.025, 0.025, 0.9, 6)} m={S.buoyRed} p={[Math.cos(a) * 0.2, 0.6, Math.sin(a) * 0.2]} rotation={[Math.sin(a) * -0.2, 0, Math.cos(a) * 0.2]} castShadow={false} />
        })}
        <Part geo={SPH} m={S.brass} p={[0, 0.62, 0]} scale={[0.13, 0.15, 0.13]} />
        <Part geo={cyl(0.1, 0.1, 0.06, 12)} m={S.buoyRed} p={[0, 1.06, 0]} castShadow={false} />
        <Part geo={SPH} m={S.lamp} p={[0, 1.15, 0]} scale={0.07} castShadow={false} />
      </Static>
    </group>
  )
}
