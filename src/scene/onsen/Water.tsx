import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Euler, Quaternion, Vector3, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Vessel } from '../igloo/Vessel'
import { reduceMotion, useSquash } from '../anim'
import { LIVE } from '../Static'
import { O } from './materials'
import { POOL } from './Pool'
import { Rock } from '../nature/Rock'

const SPOUT = { x: 1.15, y: 1.0, z: -2.25 }

/** Le bec de bambou (kakehi) qui verse l'eau chaude de la source dans le bassin ; le filet grossit quand on l'écoute. */
export function Spout() {
  const g = useRef<Group>(null!), stream = useRef<Mesh>(null!), flow = useRef(0)
  useSquash('spring', g)
  useFrame(({ clock }, delta) => {
    flow.current = approach(flow.current, isActive(useStore.getState(), 'spring') ? 1 : 0.35, Math.min(delta, 0.05) * 2)
    const k = flow.current, w = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 23) * 0.12
    stream.current.scale.set(k * (1 + w), 1, k * (1 - w))
  })
  const len = SPOUT.y - POOL.y
  return (
    <group ref={g} userData={{ id: 'spring' }} position={[SPOUT.x, 0, SPOUT.z]}>
      {/* deux bambous croisés portent le bec */}
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.03, 0.03, 1.15, 8)} m={O.bambooDry} p={[s * 0.12, 0.55, -0.35]} rotation-z={s * 0.3} />
      ))}
      <Part geo={rbox(0.06, 0.06, 0.06, 0.02)} m={O.rope} p={[0, 1.02, -0.35]} castShadow={false} />
      <group position={[0, SPOUT.y + 0.05, -0.45]} rotation-x={-0.2}>
        <Part geo={cyl(0.05, 0.05, 1.0, 12)} m={O.bamboo} p={[0, 0, 0.4]} rotation-x={Math.PI / 2} />
        {[0.1, 0.55].map((z) => (
          <Part key={z} geo={cyl(0.056, 0.056, 0.03, 12)} m={O.bambooDry} p={[0, 0, z]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
      </group>
      {/* le filet d'eau, et l'éclaboussure en bas */}
      <mesh ref={stream} userData={LIVE} geometry={cyl(0.025, 0.035, len, 10)} material={O.stream} position={[0, POOL.y + len / 2, 0.02]} raycast={noRay} />
      <Part geo={SPH} m={O.stream} scale={[0.12, 0.03, 0.12]} p={[0, POOL.y + 0.01, 0.02]} castShadow={false} />
      {/* la pierre sous le bec */}
      <Rock v={2} p={[0, 0, -0.38]} s={[0.34, 0.34, 0.28]} ry={0.6} m={O.stone[1]} moss={O.moss} />
    </group>
  )
}

/**
 * Le shishi-odoshi près de la vasque de pierre : le bambou se remplit, bascule, se vide dans la vasque et retombe sur sa
 * pierre (« tok »). Il bat quand on l'écoute ; sinon il reste en attente, bouche en l'air.
 */
// Le bec : de la palissade (a) jusqu'au-dessus de la bouche du tube au repos (b) ; la bouche est à (0,175 ; 0,71 ; 0).
const FEED = (() => {
  const a = new Vector3(-0.05, 1.12, -0.6), b = new Vector3(0.17, 0.9, -0.01), d = b.clone().sub(a)
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize())
  const e = new Euler().setFromQuaternion(q)
  return { len: d.length(), mid: a.clone().add(b).multiplyScalar(0.5).toArray() as V3, b: b.toArray() as V3, rot: [e.x, e.y, e.z] as V3 }
})()
// La hauteur de la pierre du talon : le talon (au repos) descend à y ≈ 0,37.
const HEEL_ROCK = 0.36
const stoneIn = O.stone[2].clone()
stoneIn.side = BackSide

export function ShishiOdoshi() {
  const g = useRef<Group>(null!), tube = useRef<Group>(null!), phase = useRef(0)
  useSquash('bamboo', g)
  useFrame((_, delta) => {
    const on = isActive(useStore.getState(), 'bamboo')
    if (!on || reduceMotion) {
      tube.current.rotation.z = approach(tube.current.rotation.z, 0.32, Math.min(delta, 0.05) * 2)
      return
    }
    phase.current = (phase.current + Math.min(delta, 0.05)) % 11
    const p = phase.current
    // 0 → 9.6 s : il se remplit et s'incline peu à peu ; 9.6 → 10 : il bascule ; 10 → 10.25 : il retombe.
    // (angle positif : la bouche en l'air, le talon posé sur sa pierre)
    // (bascule jusqu'à -0,4 : la bouche descend au-dessus de l'eau de la vasque sans toucher son bord)
    tube.current.rotation.z = -(p < 9.6 ? -0.32 + (p / 9.6) * 0.34 : p < 10 ? 0.02 + ((p - 9.6) / 0.4) * 0.38 : p < 10.25 ? 0.4 - ((p - 10) / 0.25) * 0.72 : -0.32)
  })
  return (
    <group ref={g} userData={{ id: 'bamboo' }} position={[-1.05, 0, -2.4]}>
      {/* la vasque de pierre, creusée : sa paroi, son bord, l'eau à l'intérieur, juste sous la bouche du tube quand il bascule */}
      <Vessel p={[0.15, 0, 0]} rt={0.3} rb={0.34} h={0.34} m={O.stone[2]} inner={stoneIn} t={0.05} />
      <Part geo={cyl(0.245, 0.245, 0.02, 24)} m={O.water} p={[0.15, 0.29, 0]} castShadow={false} />
      {/* le bec de bambou qui descend de la palissade et verse au-dessus de la bouche du tube */}
      <Part geo={cyl(0.03, 0.03, FEED.len, 10)} m={O.bamboo} p={FEED.mid} rotation={FEED.rot} castShadow={false} />
      <Part geo={cyl(0.032, 0.032, 0.03, 10)} m={O.bambooDry} p={FEED.b} rotation={FEED.rot} castShadow={false} />
      {/* le filet d'eau, du bec à la bouche */}
      <Part geo={cyl(0.008, 0.012, 0.11, 6)} m={O.stream} p={[FEED.b[0], FEED.b[1] - 0.06, FEED.b[2]]} castShadow={false} />
      {/* les montants et le tube qui bascule */}
      {[-0.1, 0.1].map((z) => (
        <Part key={z} geo={cyl(0.03, 0.03, 0.6, 8)} m={O.bambooDry} p={[-0.3, 0.3, z]} />
      ))}
      <group ref={tube} userData={LIVE} position={[-0.3, 0.55, 0]} rotation-z={0.32}>
        <Part geo={cyl(0.055, 0.055, 0.9, 12)} m={O.bamboo} p={[0.05, 0, 0]} rotation-z={Math.PI / 2} />
        <Part geo={cyl(0.06, 0.06, 0.03, 12)} m={O.bambooDry} p={[0.0, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      {/* la pierre où le talon du tube retombe (« tok ») : sa tête juste sous le talon */}
      <Rock v={3} p={[-0.7, 0, 0]} s={[0.17, HEEL_ROCK, 0.16]} ry={1.2} m={O.stone[0]} />
    </group>
  )
}
