import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { reduceMotion } from '../anim'
import { LIVE, Static } from '../Static'
import { cyl, rbox } from '../parts'
import { Part } from './deco'
import { WATER, groundY } from './isle'
import { hullGeo } from './shapes'
import { S } from './surroundMaterials'

/** Ce qu'il y a dans une barque : deux bancs, une paire de rames, un seau et un cordage lové. Repère de la coque (proue vers +x). */
function Gear({ W }: { W: number }) {
  return (
    <>
      {[-0.3, 0.35].map((x) => <Part key={x} geo={rbox(0.11, 0.035, W * 0.84, 0.012, 1)} m={S.pierBeam} p={[x, 0.2, 0]} castShadow={false} />)}
      {/* deux rames posées en travers des bancs, pelles dehors */}
      {[0.1, -0.1].map((o, i) => (
        <group key={i} position={[0.05 + o, 0.26, 0]} rotation-y={0.12 * (i ? -1 : 1)}>
          <Part geo={cyl(0.016, 0.016, W * 1.2, 6)} m={S.pierBeam} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.2, 0.014, 0.1, 0.006, 1)} m={S.pierBeam} p={[0, 0, W * 0.6]} castShadow={false} />
          <Part geo={rbox(0.2, 0.014, 0.1, 0.006, 1)} m={S.pierBeam} p={[0, 0, -W * 0.6]} castShadow={false} />
        </group>
      ))}
      <Part geo={cyl(0.07, 0.055, 0.11, 10)} m={S.canvasCoral} p={[-0.62, 0.13, 0.08]} castShadow={false} />
      <Part geo={cyl(0.075, 0.075, 0.03, 10)} m={S.rope} p={[0.72, 0.1, -0.1]} castShadow={false} />
    </>
  )
}

const L = 1.9, W = 0.8, H = 0.32
const slope = (x: number, z: number, ry: number, dx: number) => groundY(x + Math.cos(ry) * dx, z - Math.sin(ry) * dx)

/** La barque tirée sur le sable, proue vers la mer, un peu de travers, penchée sur la pente de la plage. */
export function BeachedBoat({ at, ry }: { at: [number, number]; ry: number }) {
  const [x, z] = at, a = slope(x, z, ry, -0.8), b = slope(x, z, ry, 0.8)
  return (
    <group position={[x, (a + b) / 2 + 0.02, z]} rotation={[0.07, ry, -Math.atan2(b - a, 1.6)]}>
      <Part geo={hullGeo(L, W, H, 0xe9806c, 0xfbf1e2)} m={S.hullOuter} p={[0, 0.02, 0]} />
      <Gear W={W} />
    </group>
  )
}

/** La barque amarrée au ponton : elle se balance doucement sur l'eau (plus fort sous l'orage). */
export function FloatBoat({ at, ry }: { at: [number, number]; ry: number }) {
  const g = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    g.current.position.y = WATER - 0.08 + (reduceMotion ? 0 : Math.sin(t * 1.1) * 0.015)
    g.current.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.9 + 1) * 0.03
    g.current.rotation.x = reduceMotion ? 0 : Math.sin(t * 0.7) * 0.02
  })
  return (
    <group position={[at[0], WATER - 0.08, at[1]]} rotation-y={ry}>
      <group ref={g} userData={LIVE} position={[0, 0, 0]}>
        <Part geo={hullGeo(L * 0.85, W * 0.85, H, 0x2f6a86, 0xfbf1e2)} m={S.hullOuter} />
        <Static><group scale={0.85}><Gear W={W} /></group></Static>
      </group>
    </group>
  )
}

