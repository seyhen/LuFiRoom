import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, clamp, lerp, smooth } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { Steam } from '../objects/Steam'
import { I } from './materials'
import { Vessel } from './Vessel'

const TOP = 0.32 // le dessus de la caisse
const MUG = { x: 0.12, z: 0.04 }
// le geste, en secondes, calé sur le son (channels/cocoa.ts) : lever, verser, reposer (le « toc » tombe à la fin)
const LIFT = 0.8, FLOW = 2.4, DOWN = 0.6

/**
 * Le thermos de cacao, sur une petite caisse de bois au devant de la pièce, à côté d'un quart émaillé blanc cerclé de bleu.
 * Quand le son joue, à chaque fois qu'on entend le cacao couler (le compteur `pulses.cocoa`, avancé par le canal audio), le thermos
 * se lève, se penche au-dessus du quart, un filet de cacao coule et le quart se remplit ; puis il se repose. Le quart fume.
 */
export function Thermos({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), flask = useRef<Group>(null!), stream = useRef<Mesh>(null!), level = useRef<Group>(null!)
  const st = useRef({ seen: useStore.getState().pulses.cocoa ?? 0, t: 99, fill: 0.75, on: 0 })
  useSquash('thermos', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'thermos')
    const n = store.pulses.cocoa ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !reduceMotion) s.t = 0
    }
    s.t += dt
    s.on = approach(s.on, on ? 1 : 0, dt)
    const t = s.t, end = LIFT + FLOW
    const k = smooth(clamp(t / LIFT, 0, 1)) * (1 - smooth(clamp((t - end) / DOWN, 0, 1)))
    flask.current.position.set(lerp(-0.12, MUG.x - 0.13, k), TOP + 0.135 + 0.26 * k, lerp(-0.02, MUG.z, k))
    flask.current.rotation.z = -1.85 * k
    const pouring = t > LIFT && t < end
    stream.current.visible = pouring
    if (pouring) s.fill = Math.min(0.95, s.fill + dt * 0.1)
    else s.fill = Math.max(0.6, s.fill - dt * 0.004) // on boit, lentement
    // le quart est ouvert (Vessel) : le cacao reste haut, sinon le bord de devant le cache
    level.current.position.y = TOP + 0.025 + 0.09 * s.fill
  })
  return (
    <group ref={g} userData={{ id: 'thermos' }} position={position} rotation-y={-0.5} scale={1.3}>
      <Static>
        {/* la caisse : ses planches, ses tasseaux, son pochoir */}
        <Part geo={rbox(0.62, TOP - 0.02, 0.44, 0.03)} m={I.crate} p={[0, (TOP - 0.02) / 2, 0]} />
        {[-0.24, 0.24].map((x) => (
          <Part key={x} geo={rbox(0.05, TOP - 0.02, 0.47, 0.015)} m={I.crateDark} p={[x, (TOP - 0.02) / 2, 0]} castShadow={false} />
        ))}
        <Part geo={rbox(0.64, 0.025, 0.46, 0.01)} m={I.crateDark} p={[0, TOP - 0.008, 0]} castShadow={false} />
        {/* le pochoir de l'expédition sur la face avant, entre les tasseaux */}
        <mesh material={I.stencil} position={[0, 0.15, 0.238]}>
          <planeGeometry args={[0.38, 0.19]} />
        </mesh>
        {/* la boîte de cacao, son couvercle, et une cuillère posée en travers */}
        <Part geo={cyl(0.048, 0.048, 0.11, 20)} m={I.tin} p={[-0.21, TOP + 0.055, 0.12]} />
        <Part geo={cyl(0.05, 0.05, 0.015, 20)} m={I.darkSteel} p={[-0.21, TOP + 0.117, 0.12]} castShadow={false} />
        <group position={[0.07, TOP + 0.006, 0.18]} rotation-y={0.4}>
          <Part geo={rbox(0.11, 0.008, 0.016, 0.004)} m={I.steel} p={[0, 0, 0]} castShadow={false} />
          <Part geo={SPH} m={I.steel} scale={[0.024, 0.008, 0.017]} p={[0.07, 0.002, 0]} castShadow={false} />
        </group>
        {/* le quart émaillé : le corps blanc, son bord bleu, son anse */}
        <group position={[MUG.x, TOP, MUG.z]}>
          <Vessel p={[0, 0, 0]} rt={0.065} rb={0.06} h={0.13} m={I.enamel} inner={I.enamelIn} rim={I.enamelRim} />
          <Part m={I.enamel} p={[0.075, 0.07, 0]} castShadow={false}>
            <torusGeometry args={[0.035, 0.009, 8, 16]} />
          </Part>
          {/* deux éclats d'émail, qui montrent le métal sombre : un quart qui a voyagé */}
          <Part geo={SPH} m={I.darkSteel} scale={[0.012, 0.009, 0.004]} p={[0.02, 0.09, 0.062]} castShadow={false} />
          <Part geo={SPH} m={I.darkSteel} scale={[0.008, 0.006, 0.004]} p={[-0.03, 0.04, 0.058]} castShadow={false} />
          {/* la cuillère dans le quart */}
          <Part geo={cyl(0.005, 0.005, 0.16, 6)} m={I.steel} p={[-0.025, 0.13, -0.01]} rotation={[0.25, 0, 0.35]} castShadow={false} />
        </group>
        {/* le bouchon-gobelet du thermos, posé à côté, à l'envers */}
        <Part geo={cyl(0.045, 0.05, 0.06, 20)} m={I.steel} p={[-0.05, TOP + 0.03, 0.15]} />
      </Static>
      {/* le cacao dans le quart, qui monte quand on verse */}
      <group ref={level} position={[MUG.x, TOP + 0.07, MUG.z]}>
        <mesh material={I.cocoa}>
          <cylinderGeometry args={[0.054, 0.054, 0.006, 24]} />
        </mesh>
        {/* deux guimauves qui flottent */}
        <Part geo={rbox(0.028, 0.02, 0.028, 0.009)} m={I.marsh} p={[0.02, 0.008, 0.012]} rotation-y={0.5} castShadow={false} />
        <Part geo={rbox(0.026, 0.02, 0.026, 0.009)} m={I.marsh} p={[-0.018, 0.008, -0.014]} rotation-y={1.1} castShadow={false} />
      </group>
      {/* le thermos : son corps vert, sa bague d'acier, le bec ouvert, son anse */}
      <group ref={flask} position={[-0.12, TOP + 0.135, -0.02]}>
        <Part geo={cyl(0.055, 0.058, 0.25, 24)} m={I.thermos} p={[0, 0, 0]} />
        <Part geo={cyl(0.058, 0.058, 0.02, 24)} m={I.steel} p={[0, -0.12, 0]} castShadow={false} />
        <Part geo={cyl(0.04, 0.052, 0.035, 20)} m={I.steel} p={[0, 0.14, 0]} castShadow={false} />
        <Part geo={cyl(0.022, 0.022, 0.02, 12)} m={I.darkSteel} p={[0, 0.165, 0]} castShadow={false} />
        {/* le bandeau rouille du milieu, l'anse (une boucle de métal fixée par deux bagues) */}
        <Part geo={cyl(0.057, 0.057, 0.07, 24)} m={I.rust} p={[0, 0.02, 0]} castShadow={false} />
        {[0.07, -0.06].map((y) => (
          <Part key={y} geo={cyl(0.06, 0.06, 0.014, 24)} m={I.darkSteel} p={[0, y, 0]} castShadow={false} />
        ))}
        <Part m={I.darkSteel} p={[-0.06, 0.005, 0]} rotation-z={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.066, 0.009, 6, 16, Math.PI]} />
        </Part>
      </group>
      {/* le filet de cacao, du bec au quart, pendant qu'on verse */}
      <mesh ref={stream} material={I.cocoa} position={[MUG.x + 0.02, TOP + 0.225, MUG.z]} visible={false}>
        <cylinderGeometry args={[0.007, 0.009, 0.24, 8]} />
      </mesh>
      <Steam at={[MUG.x, TOP + 0.15, MUG.z]} every={1.4} />
    </group>
  )
}
