import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { clamp, lerp, smooth } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { I } from './materials'

const SEAT = 0.4 // le dessus de la peau de mouton, sur la bûche
// La moufle est posée là, couchée et tournée, à 1,5 fois sa taille (repère partagé par la moufle, l'aiguille et le fil).
const GLOVE = { p: [0, SEAT + 0.005, -0.02] as V3, ry: 0.35, s: 1.5 }
// Les points de couture, le long du bord de la paume (repère de la moufle) : l'aiguille avance d'un point à chaque geste.
const STITCHES: V3[] = [-0.04, 0.0, 0.04, 0.08, 0.12, 0.16].map((x) => [x, 0.05, 0.095 - Math.abs(x - 0.04) * 0.35] as V3)
const UP = new Vector3(0, 1, 0), q = new Quaternion(), a = new Vector3(), b = new Vector3()

/**
 * La moufle qu'on coud, posée sur un billot couvert d'une peau de mouton, au devant à gauche, près de l'entrée : une moufle de cuir
 * fauve à manchette de fourrure grise, la bobine de fil à côté. Quand le son joue, à chaque point qu'on entend (le compteur
 * `pulses.sew`), l'aiguille pique dans le bord, ressort et tire le fil en arc, puis avance d'un point. À l'arrêt, elle reste plantée.
 */
export function Mitten({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), needle = useRef<Group>(null!), thread = useRef<Mesh>(null!)
  const st = useRef({ seen: useStore.getState().pulses.sew ?? 0, t: 9, i: 2 })
  useSquash('mitten', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'mitten')
    const n = store.pulses.sew ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !reduceMotion) {
        s.t = 0
        s.i = (s.i + 1) % STITCHES.length
      }
    }
    s.t += dt
    const [px, py, pz] = STITCHES[s.i]
    // 0 → 0,15 s : l'aiguille plonge ; 0,15 → 1 s : elle ressort et monte en arc, le fil se tend ; puis elle attend, levée
    const dive = smooth(clamp(s.t / 0.15, 0, 1)), rise = smooth(clamp((s.t - 0.15) / 0.85, 0, 1))
    const resting = s.t > 8 // longtemps sans geste : l'aiguille repose plantée dans le cuir
    const lift = resting ? 0 : rise
    const nx = px + lerp(0, 0.03, lift), ny = py + lerp(0.04 - dive * 0.05, 0.16, lift), nz = pz + lerp(0, 0.09, lift)
    needle.current.position.set(nx, ny, nz)
    needle.current.rotation.set(lerp(0.5, -0.6, lift), 0, lerp(0.25, -0.35, lift))
    // le fil : du point de couture au chas de l'aiguille
    a.set(px, py, pz)
    b.set(0, 0.118, 0).applyEuler(needle.current.rotation).add(needle.current.position)
    const len = a.distanceTo(b)
    thread.current.position.copy(a).add(b).multiplyScalar(0.5)
    thread.current.quaternion.copy(q.setFromUnitVectors(UP, b.sub(a).normalize()))
    thread.current.scale.set(1, Math.max(0.001, len), 1)
  })
  return (
    <group ref={g} userData={{ id: 'mitten' }} position={position}>
      <Static>
        {/* le billot de bois, ses cernes sur le dessus, et la peau de mouton qui le couvre en débordant */}
        <Part geo={cyl(0.25, 0.27, SEAT - 0.06, 24)} m={I.wood} p={[0, (SEAT - 0.06) / 2, 0]} />
        {/* l'écorce du billot, en bourrelets plus sombres */}
        {[0.08, 0.2].map((y) => (
          <Part key={y} m={I.bark} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.262, 0.012, 6, 28]} />
          </Part>
        ))}
        <Part geo={SPH} m={I.fleece} scale={[0.33, 0.07, 0.31]} p={[0, SEAT - 0.04, 0]} />
        {/* la moufle, couchée : la paume, le pouce, la manchette de fourrure (grande, pour qu'on la lise de loin) */}
        <group position={GLOVE.p} rotation-y={GLOVE.ry} scale={GLOVE.s}>
          <Part geo={SPH} m={I.leather} scale={[0.14, 0.045, 0.1]} p={[0.04, 0.03, 0]} />
          <Part geo={SPH} m={I.leather} scale={[0.06, 0.035, 0.04]} p={[-0.02, 0.025, -0.1]} rotation-y={0.6} />
          <Part geo={cyl(0.075, 0.08, 0.1, 18)} m={I.greyFur} p={[-0.14, 0.04, 0]} rotation-z={Math.PI / 2} />
          {/* la bande de laine rouge entre la manchette et la paume */}
          <Part geo={cyl(0.07, 0.07, 0.025, 18)} m={I.woolRed} p={[-0.085, 0.035, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {/* la broderie sur le dos : une fleur à cinq pétales, son cœur jaune */}
          {Array.from({ length: 5 }, (_, k) => {
            const a = (k / 5) * Math.PI * 2
            return <Part key={k} geo={SPH} m={I.woolRed} scale={[0.016, 0.006, 0.011]} p={[0.06 + Math.cos(a) * 0.02, 0.073, Math.sin(a) * 0.02]} rotation-y={-a} castShadow={false} />
          })}
          <Part geo={SPH} m={I.marsh} scale={[0.009, 0.006, 0.009]} p={[0.06, 0.076, 0]} castShadow={false} />
          {/* la couture déjà faite, en points clairs sur le bord */}
          {[-0.06, -0.01, 0.04, 0.09, 0.14].map((x) => (
            <Part key={x} geo={SPH} m={I.thread} scale={[0.012, 0.006, 0.004]} p={[x, 0.05, 0.095 - Math.abs(x - 0.04) * 0.35]} castShadow={false} />
          ))}
        </group>
        {/* la paire de ciseaux posée sur la peau : deux lames croisées, deux anneaux rouges */}
        <group position={[-0.17, SEAT + 0.01, 0.14]} rotation-y={0.8}>
          {[-1, 1].map((sd) => (
            <group key={sd} rotation-y={sd * 0.18}>
              <Part geo={rbox(0.11, 0.006, 0.014, 0.003)} m={I.steel} p={[0.05, 0, 0]} castShadow={false} />
              <Part m={I.collar} p={[-0.025, 0, sd * 0.02]} rotation-x={Math.PI / 2} castShadow={false}>
                <torusGeometry args={[0.018, 0.006, 6, 14]} />
              </Part>
            </group>
          ))}
        </group>
        {/* la bobine de fil, debout sur le bord de la peau */}
        <group position={[0.17, SEAT, -0.13]}>
          <Part geo={cyl(0.028, 0.028, 0.07, 14)} m={I.thread} p={[0, 0.035, 0]} castShadow={false} />
          {[0.004, 0.066].map((y) => (
            <Part key={y} geo={cyl(0.038, 0.038, 0.01, 14)} m={I.wood} p={[0, y, 0]} castShadow={false} />
          ))}
        </group>
      </Static>
      {/* l'aiguille (sa pointe à l'origine du groupe, le chas en haut) et son fil, dans le repère de la moufle */}
      <group position={GLOVE.p} rotation-y={GLOVE.ry} scale={GLOVE.s}>
        <group ref={needle}>
          <Part geo={cyl(0.0045, 0.0015, 0.12, 6)} m={I.needle} p={[0, 0.06, 0]} castShadow={false} />
          {/* le chas */}
          <Part m={I.needle} p={[0, 0.123, 0]} castShadow={false}>
            <torusGeometry args={[0.007, 0.0022, 4, 10]} />
          </Part>
        </group>
        <mesh ref={thread} material={I.thread}>
          <cylinderGeometry args={[0.003, 0.003, 1, 5]} />
        </mesh>
      </group>
    </group>
  )
}
