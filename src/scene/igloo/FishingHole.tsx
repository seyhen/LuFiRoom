import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { I } from './materials'

const HOLE = 0.36
// Les éclats de glace autour du trou : [angle, distance, taille].
const CHUNKS: [number, number, number][] = [[0.3, 0.47, 0.07], [1.4, 0.48, 0.05], [2.3, 0.46, 0.08], [3.5, 0.49, 0.06], [4.4, 0.47, 0.07], [5.5, 0.48, 0.05]]
// La canne : posée sur sa fourche, le scion qui s'avance au-dessus du trou. Le bout du scion (repère du trou), d'où tombe la ligne.
const TIP = new Vector3(0.11, 0.233, -0.38)
const FLOAT = { x: 0.04, z: 0.06, y: 0.03 }
const UP = new Vector3(0, 1, 0), q = new Quaternion(), a = new Vector3(), b = new Vector3()

/**
 * Le trou de pêche, creusé dans la glace au devant à droite. L'eau sombre en dégradé (claire au bord, noire au fond) et son reflet,
 * cerclée d'un bourrelet de glace et d'éclats ; sous la surface, l'ombre d'un poisson qui tourne lentement. La canne à pêche sur glace
 * (manche de liège, moulinet, anneaux, scion rouge) repose sur sa fourche de bois, la ligne tombe du bout du scion jusqu'au flotteur
 * rouge et blanc ; l'écumoire à glace est posée à côté. Quand le son joue, le flotteur danse sur le clapotis ; à chaque bulle qu'on
 * entend (le compteur `pulses.icehole`), un rond s'élargit et le flotteur plonge un instant.
 */
export function FishingHole({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), float = useRef<Group>(null!), ring = useRef<Mesh>(null!), fish = useRef<Group>(null!), line = useRef<Mesh>(null!)
  const st = useRef({ seen: useStore.getState().pulses.icehole ?? 0, t: 9, ph: 0, k: 0, swim: 0 })
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
    if (!reduceMotion) {
      s.ph += dt * 1.6
      s.swim += dt * (0.25 + s.k * 0.2)
    }
    const dip = s.t < 0.6 ? Math.sin((s.t / 0.6) * Math.PI) * 0.03 : 0
    float.current.position.y = FLOAT.y + Math.sin(s.ph) * 0.008 * s.k - dip
    float.current.rotation.z = Math.sin(s.ph * 0.7) * 0.15 * s.k
    // la ligne, du bout du scion au flotteur
    a.copy(TIP)
    b.set(FLOAT.x, float.current.position.y + 0.06, FLOAT.z)
    line.current.position.copy(a).add(b).multiplyScalar(0.5)
    line.current.quaternion.copy(q.setFromUnitVectors(UP, b.clone().sub(a).normalize()))
    line.current.scale.set(1, a.distanceTo(b), 1)
    // le poisson tourne en rond sous la glace, la tête dans le sens de la nage
    fish.current.position.set(Math.cos(s.swim) * 0.17, 0.006, Math.sin(s.swim) * 0.17)
    fish.current.rotation.y = -s.swim - Math.PI / 2
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
        {/* la fourche de bois plantée dans la neige */}
        <group position={[0.51, 0, -0.28]}>
          <Part geo={cyl(0.013, 0.016, 0.09, 6)} m={I.wood} p={[0, 0.045, 0]} castShadow={false} />
          {[-1, 1].map((sd) => (
            <Part key={sd} geo={cyl(0.009, 0.011, 0.07, 6)} m={I.wood} p={[0, 0.115, sd * 0.02]} rotation-x={sd * 0.5} castShadow={false} />
          ))}
        </group>
        {/* la canne : le manche de liège posé dans la neige, le moulinet et sa manivelle, le scion rouge et ses anneaux, qui
            passe dans la fourche et s'avance au-dessus du trou */}
        <group position={[0.82, 0.03, -0.2]} rotation={[0, -0.25, -0.27]}>
          <Part geo={cyl(0.022, 0.022, 0.2, 10)} m={I.cork} p={[0, 0, 0]} rotation-z={Math.PI / 2} />
          <Part geo={cyl(0.024, 0.024, 0.02, 10)} m={I.darkSteel} p={[-0.11, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <group position={[-0.06, -0.045, 0]}>
            <Part geo={cyl(0.035, 0.035, 0.03, 16)} m={I.darkSteel} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={rbox(0.01, 0.045, 0.008, 0.003)} m={I.steel} p={[0.015, 0.0, 0.02]} castShadow={false} />
            <Part geo={SPH} m={I.cork} scale={0.009} p={[0.015, 0.02, 0.025]} castShadow={false} />
          </group>
          <Part geo={cyl(0.005, 0.008, 0.66, 6)} m={I.rust} p={[-0.43, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {[-0.25, -0.45, -0.66].map((x) => (
            <Part key={x} m={I.steel} p={[x, -0.012, 0]} rotation-y={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.01, 0.002, 4, 10]} />
            </Part>
          ))}
        </group>
        {/* l'écumoire à glace, posée sur la neige : son anneau, son fond percé, son manche */}
        <group position={[-0.25, 0.012, 0.58]} rotation-y={0.7}>
          <Part m={I.darkSteel} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.075, 0.008, 6, 20]} />
          </Part>
          <Part geo={cyl(0.072, 0.072, 0.004, 20)} m={I.grille} p={[0, -0.004, 0]} castShadow={false} />
          <Part geo={cyl(0.008, 0.008, 0.34, 6)} m={I.wood} p={[0.24, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </Static>
      {/* l'eau, à peine sous le bord de glace, et l'ombre du poisson juste dessous */}
      <mesh material={I.holeWater} position={[0, 0.012, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[HOLE, 36]} />
      </mesh>
      <group ref={fish}>
        <mesh material={I.fishShadow} position={[0, 0.011, 0]} rotation-x={-Math.PI / 2} scale={[0.05, 0.13, 1]} raycast={noRay}>
          <circleGeometry args={[1, 16]} />
        </mesh>
        <mesh material={I.fishShadow} position={[0, 0.011, -0.15]} rotation-x={-Math.PI / 2} scale={[0.04, 0.035, 1]} raycast={noRay}>
          <circleGeometry args={[1, 3]} />
        </mesh>
      </group>
      <mesh ref={ring} material={I.ring} position={[FLOAT.x, 0.02, FLOAT.z]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* la ligne */}
      <mesh ref={line} material={I.thread}>
        <cylinderGeometry args={[0.0022, 0.0022, 1, 4]} />
      </mesh>
      {/* le flotteur, rouge dessus, blanc dessous, sa petite antenne */}
      <group ref={float} position={[FLOAT.x, FLOAT.y, FLOAT.z]}>
        <Part geo={SPH} m={I.woolRed} scale={[0.035, 0.03, 0.035]} p={[0, 0.012, 0]} castShadow={false} />
        <Part geo={SPH} m={I.enamel} scale={[0.034, 0.022, 0.034]} p={[0, -0.006, 0]} castShadow={false} />
        <Part geo={cyl(0.004, 0.004, 0.05, 6)} m={I.ink} p={[0, 0.045, 0]} castShadow={false} />
      </group>
    </group>
  )
}
