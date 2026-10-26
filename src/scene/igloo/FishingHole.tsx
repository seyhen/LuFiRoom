import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { I } from './materials'

const HOLE = 0.36
// Les éclats de glace autour du trou : [angle, distance, taille].
const CHUNKS: [number, number, number][] = [[0.3, 0.46, 0.07], [1.4, 0.47, 0.05], [2.3, 0.45, 0.08], [3.5, 0.48, 0.06], [4.4, 0.46, 0.07], [5.5, 0.47, 0.05]]

/**
 * Le trou de pêche, creusé dans la glace au devant à droite : l'eau noire et bleue, cerclée d'un bourrelet de glace et de quelques
 * éclats, une petite canne à pêche sur la glace posée sur sa fourche de bois, la ligne qui plonge et son flotteur rouge et blanc.
 * Quand le son joue, le flotteur danse sur le clapotis ; à chaque bulle qu'on entend (le compteur `pulses.icehole`), un rond
 * s'élargit à la surface et le flotteur plonge un instant.
 */
export function FishingHole({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), float = useRef<Group>(null!), ring = useRef<Mesh>(null!)
  const st = useRef({ seen: useStore.getState().pulses.icehole ?? 0, t: 9, ph: 0, k: 0 })
  useSquash('icehole', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'icehole')
    const n = store.pulses.icehole ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !reduceMotion) s.t = 0
    }
    s.t += dt
    s.k = approach(s.k, on ? 1 : 0, dt)
    if (!reduceMotion) s.ph += dt * 1.6
    const dip = s.t < 0.6 ? Math.sin((s.t / 0.6) * Math.PI) * 0.03 : 0
    float.current.position.y = 0.028 + Math.sin(s.ph) * 0.008 * s.k - dip
    float.current.rotation.z = Math.sin(s.ph * 0.7) * 0.15 * s.k
    // le rond dans l'eau : il s'élargit et s'efface en une seconde et demie
    const r = Math.min(1, s.t / 1.5)
    ring.current.scale.setScalar(0.08 + r * 0.6)
    I.ring.opacity = s.t < 1.5 ? (1 - r) * 0.7 : 0
  })
  return (
    <group ref={g} userData={{ id: 'icehole' }} position={position}>
      <Static>
        {/* le bourrelet de glace bleutée autour du trou, et les éclats */}
        <Part m={I.iceRim} p={[0, 0.035, 0]} rotation-x={Math.PI / 2} scale={[1, 1, 0.6]}>
          <torusGeometry args={[HOLE + 0.04, 0.06, 10, 36]} />
        </Part>
        {CHUNKS.map(([a, d, s], i) => (
          <Part key={i} geo={rbox(s * 1.4, s * 0.7, s, s * 0.3)} m={i % 2 ? I.iceRim : I.snow} p={[Math.cos(a) * d, s * 0.35, Math.sin(a) * d]} rotation-y={a * 1.7} castShadow={false} />
        ))}
        {/* la canne : sa fourche plantée dans la neige, le manche de liège, le scion, le moulinet */}
        <group position={[0.62, 0, -0.18]} rotation-y={0.5}>
          <Part geo={cyl(0.012, 0.014, 0.2, 6)} m={I.wood} p={[0, 0.1, 0]} castShadow={false} />
          {[-1, 1].map((sd) => (
            <Part key={sd} geo={cyl(0.008, 0.01, 0.07, 6)} m={I.wood} p={[0, 0.215, sd * 0.018]} rotation-x={sd * 0.5} castShadow={false} />
          ))}
        </group>
        <group position={[0.75, 0.05, -0.25]} rotation={[0, 0.55, 0.22]}>
          <Part geo={cyl(0.02, 0.022, 0.2, 10)} m={I.crate} p={[0, 0, 0]} rotation-z={Math.PI / 2} />
          <Part geo={cyl(0.035, 0.035, 0.03, 16)} m={I.darkSteel} p={[0.02, -0.04, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.006, 0.008, 0.62, 6)} m={I.rust} p={[-0.4, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </Static>
      {/* l'eau, à peine sous le bord de glace */}
      <mesh material={I.water} position={[0, 0.012, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[HOLE, 36]} />
      </mesh>
      <mesh ref={ring} material={I.ring} position={[0.04, 0.02, 0.05]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* la ligne, du bout du scion au flotteur */}
      <Part geo={cyl(0.002, 0.002, 0.38, 4)} m={I.thread} p={[0.15, 0.2, 0.0]} rotation-z={0.55} castShadow={false} />
      {/* le flotteur, rouge dessus, blanc dessous */}
      <group ref={float} position={[0.04, 0.028, 0.05]}>
        <Part geo={SPH} m={I.woolRed} scale={[0.035, 0.03, 0.035]} p={[0, 0.012, 0]} castShadow={false} />
        <Part geo={SPH} m={I.enamel} scale={[0.034, 0.022, 0.034]} p={[0, -0.006, 0]} castShadow={false} />
        <Part geo={cyl(0.004, 0.004, 0.05, 6)} m={I.ink} p={[0, 0.045, 0]} castShadow={false} />
      </group>
    </group>
  )
}

