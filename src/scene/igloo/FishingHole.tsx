import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Curve, ExtrudeGeometry, Object3D, Path, PlaneGeometry, Quaternion, Shape, TubeGeometry, Vector3, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { Batch, Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { LIVE, Static } from '../Static'
import { seeded } from '../paint'
import { I } from './materials'
import { SPH_LO, SPH_MID } from './spheres'
import { Vessel } from './Vessel'

const HOLE = 0.3
const TOP = 0.07 // le dessus de la glace dégagée
const WATER = 0.035 // l'eau, au fond du trou (la paroi de glace se voit entre les deux)
/** Le bord de la plaque de glace dégagée (rayon selon l'angle) : un rond qui ondule, comme dégagé à la pelle. */
const edge = (t: number) => 0.7 + 0.06 * Math.sin(3 * t + 1) + 0.04 * Math.sin(5 * t)
// La canne : le manche posé sur la glace, le corps qui passe dans le support en X, le scion au-dessus du trou.
const ROD = { p: [0.72, 0.1, -0.38] as V3, ry: 0.534, rz: -0.531, butt: 0.55, tip: 0.3 }
const FLOAT = { x: 0.06, z: 0.02 }
const UP = new Vector3(0, 1, 0), q = new Quaternion(), a = new Vector3(), b = new Vector3()

function sheetGeometry() {
  const s = new Shape(), n = 64
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * TAU, r = edge(t)
    i ? s.lineTo(Math.cos(t) * r, -Math.sin(t) * r) : s.moveTo(Math.cos(t) * r, -Math.sin(t) * r)
  }
  const hole = new Path()
  hole.absarc(0, 0, HOLE, 0, TAU, true)
  s.holes.push(hole)
  const g = new ExtrudeGeometry(s, { depth: TOP - 0.03, bevelEnabled: true, bevelThickness: 0.013, bevelSize: 0.02, bevelSegments: 2, curveSegments: 48 })
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0.017, 0)
  // les UV du dessus suivent la pièce : la texture (centrée sur le trou) couvre la plaque
  const p = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 1.6 + 0.5, p.getZ(i) / 1.6 + 0.5)
  return g
}

/** La lame de la tarière : une bande en hélice (de r0 à r1 autour de l'axe), `turns` tours sur la hauteur `h`. */
function helicoid(r0: number, r1: number, h: number, turns: number) {
  const g = new PlaneGeometry(1, 1, 96, 1), p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5, a = u * turns * TAU, r = r0 + (r1 - r0) * v
    p.setXYZ(i, Math.cos(a) * r, u * h, -Math.sin(a) * r)
  }
  g.computeVertexNormals()
  return g
}
/** Le bord de la lame : la même hélice, au rayon extérieur (un tube suit cette courbe). */
class Helix extends Curve<Vector3> {
  r: number; h: number; turns: number
  constructor(r: number, h: number, turns: number) {
    super()
    this.r = r; this.h = h; this.turns = turns
  }
  getPoint(u: number, out = new Vector3()) {
    const a = u * this.turns * TAU
    return out.set(Math.cos(a) * this.r, u * this.h, -Math.sin(a) * this.r)
  }
}
const AUGER = helicoid(0.016, 0.058, 0.32, 3)
const AUGER_EDGE = new TubeGeometry(new Helix(0.058, 0.32, 3), 120, 0.005, 5)

/**
 * Le coin de pêche, au devant à droite : un trou percé dans la glace du lac. Autour, la glace a été dégagée à la pelle (une plaque
 * bleue et vernie, ses fêlures et ses bulles) et la neige repoussée en bourrelet ; le trou a sa paroi de glace, l'eau sombre plus bas,
 * des éclats de glace qui flottent, l'ombre d'un poisson qui tourne. La canne (manche de liège, moulinet, scion rouge) repose dans
 * son support en X, son drapeau orange d'alerte replié ; la tarière qui a percé le trou est plantée dans la neige, la boîte d'appâts
 * ouverte et l'écumoire posées sur la glace.
 * Quand le son joue, le flotteur danse sur le clapotis ; à chaque bulle qu'on entend (`pulses.icehole`), un rond s'élargit, le
 * flotteur plonge, le scion plie et le drapeau se dresse en tremblant.
 */
export function FishingHole({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), float = useRef<Group>(null!), ring = useRef<Mesh>(null!), fish = useRef<Group>(null!), line = useRef<Mesh>(null!)
  const tip = useRef<Group>(null!), tipEnd = useRef<Object3D>(null!), flag = useRef<Group>(null!)
  const st = useRef({ seen: useStore.getState().pulses.icehole ?? 0, t: 9, ph: 0, k: 0, swim: 0, flag: 0 })
  const sheet = useMemo(sheetGeometry, [])
  // la neige repoussée autour de la plaque, et les éclats de glace qui flottent dans le trou
  const { berm, slush } = useMemo(() => {
    const r = seeded(41)
    // des tas de tailles et de hauteurs différentes, qui se chevauchent, plus hauts là où la pelle a jeté plus de neige
    const berm = Array.from({ length: 30 }, (_, i) => {
      const t = (i / 30) * TAU + (r() - 0.5) * 0.15, d = edge(t) + 0.04 + r() * 0.07, w = 0.07 + r() * 0.13
      const heap = 0.6 + 0.4 * Math.sin(t * 2 + 0.7)
      return { p: [Math.cos(t) * d, 0.01, Math.sin(t) * d] as V3, s: [w, (0.025 + r() * 0.035) * (0.6 + heap), w * (0.6 + r() * 0.4)] as V3, r: [0, -t + (r() - 0.5) * 0.6, 0] as V3 }
    })
    const slush = Array.from({ length: 7 }, () => {
      const t = r() * TAU, d = 0.06 + r() * 0.17, w = 0.012 + r() * 0.02
      return { p: [Math.cos(t) * d, WATER + 0.003, Math.sin(t) * d] as V3, s: [w, 0.004, w * 0.8] as V3, r: [0, r() * TAU, 0] as V3 }
    })
    return { berm, slush }
  }, [])
  useSquash('icehole', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'icehole')
    const n = store.pulses.icehole ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !reduceMotion) {
        s.t = 0
        s.flag = 1
      }
    }
    s.t += dt
    s.k = approach(s.k, on ? 1 : 0, dt)
    if (!reduceMotion) {
      s.ph += dt * 1.6
      s.swim += dt * (0.25 + s.k * 0.2)
    }
    // la touche : le flotteur plonge, le scion plie un instant
    const bite = s.t < 0.6 ? Math.sin((s.t / 0.6) * Math.PI) : 0
    float.current.position.y = WATER + 0.012 + Math.sin(s.ph) * 0.007 * s.k - bite * 0.025
    float.current.rotation.z = Math.sin(s.ph * 0.7) * 0.15 * s.k
    tip.current.rotation.z = -bite * 0.22 - Math.sin(s.ph) * 0.02 * s.k
    // le drapeau se dresse et tremble, puis se replie lentement
    s.flag = Math.max(0, s.flag - dt * 0.12)
    const up = Math.min(1, s.flag * 3)
    flag.current.rotation.z = (1 - up) * 1.35 + Math.sin(s.t * 14) * Math.exp(-s.t * 3) * 0.25 * up
    // la ligne, du bout du scion au flotteur
    tipEnd.current.getWorldPosition(a)
    g.current.worldToLocal(a)
    b.set(FLOAT.x, float.current.position.y + 0.05, FLOAT.z)
    line.current.position.copy(a).add(b).multiplyScalar(0.5)
    line.current.quaternion.copy(q.setFromUnitVectors(UP, b.clone().sub(a).normalize()))
    line.current.scale.set(1, a.distanceTo(b), 1)
    // le poisson tourne en rond sous la glace, la tête dans le sens de la nage
    fish.current.position.set(Math.cos(s.swim) * 0.15, 0, Math.sin(s.swim) * 0.15)
    fish.current.rotation.y = -s.swim
    // le rond dans l'eau : il s'élargit et s'efface en une seconde et demie
    const r = Math.min(1, s.t / 1.5)
    ring.current.scale.setScalar(0.06 + r * 0.5)
    I.ring.opacity = s.t < 1.5 ? (1 - r) * 0.7 : 0
  })
  return (
    <group ref={g} userData={{ id: 'icehole' }} position={position}>
      <Static>
        {/* la plaque de glace dégagée, et la neige repoussée en bourrelet tout autour */}
        <mesh geometry={sheet} material={I.lakeIce} castShadow receiveShadow />
        <Batch geo={SPH_MID} m={I.snow} items={berm} shadow />
        {/* la paroi du trou, dans l'épaisseur de la glace, et son bord arrondi */}
        <mesh material={I.holeWall} position={[0, (TOP + WATER) / 2, 0]}>
          <cylinderGeometry args={[HOLE, HOLE, TOP - WATER, 32, 1, true]} />
        </mesh>
        <Part m={I.iceRim} p={[0, TOP, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[HOLE, 0.016, 8, 40]} />
        </Part>
        {/* les éclats tirés du trou par la tarière, posés sur la glace */}
        {[[0.6, 0.42, 0.05], [1.7, 0.44, 0.04], [2.6, 0.4, 0.055], [3.9, 0.43, 0.045], [5.2, 0.41, 0.05]].map(([t, d, s], i) => (
          <Part key={i} geo={rbox(s * 1.4, s * 0.7, s, s * 0.3)} m={i % 2 ? I.iceRim : I.snow} p={[Math.cos(t) * d, TOP + s * 0.3, Math.sin(t) * d]} rotation-y={t * 1.7} castShadow={false} />
        ))}
        {/* le support en X de la canne, posé sur la glace */}
        <group position={[0.5, TOP, -0.25]} rotation-y={0.55}>
          {[-1, 1].map((sd) => (
            <Part key={sd} geo={cyl(0.012, 0.014, 0.3, 6)} m={I.wood} p={[0, 0.12, 0]} rotation-z={sd * 0.55} castShadow={false} />
          ))}
          {/* le drapeau d'alerte : sa tige de ressort, replié contre le support */}
          <group ref={flag} position={[0, 0.07, 0.03]} userData={LIVE}>
            <Part geo={cyl(0.006, 0.006, 0.3, 5)} m={I.darkSteel} p={[0, 0.15, 0]} castShadow={false} />
            <mesh material={I.flag} position={[0.05, 0.27, 0]}>
              <planeGeometry args={[0.1, 0.07]} />
            </mesh>
          </group>
        </group>
        {/* la tarière qui a percé le trou, plantée dans la neige : la spirale de sa mèche, le tube, la poignée en T et ses
            poignées rouges */}
        <group position={[-0.72, 0, 0.42]} rotation={[0.1, 0, 0.12]}>
          <Part geo={cyl(0.018, 0.018, 0.75, 8)} m={I.steel} p={[0, 0.375, 0]} />
          {/* la mèche : une lame en hélice continue autour de la tige, son bord roulé */}
          <Part geo={AUGER} m={I.auger} p={[0, 0.04, 0]} castShadow={false} />
          <Part geo={AUGER_EDGE} m={I.steel} p={[0, 0.04, 0]} castShadow={false} />
          <Part geo={cyl(0.012, 0.012, 0.4, 8)} m={I.steel} p={[0, 0.75, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {[-1, 1].map((sd) => (
            <Part key={sd} geo={cyl(0.022, 0.022, 0.1, 10)} m={I.collar} p={[sd * 0.16, 0.75, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          ))}
          {/* un peu de neige au pied, là où elle est plantée */}
          <Part geo={SPH} m={I.snow} scale={[0.09, 0.035, 0.08]} p={[0, 0.01, 0]} castShadow={false} />
        </group>
        {/* la boîte d'appâts ouverte, son couvercle à côté, les boulettes orange dedans */}
        <group position={[0.36, TOP, 0.48]} rotation-y={0.4}>
          <Vessel p={[0, 0, 0]} rt={0.07} rb={0.07} h={0.045} m={I.steel} inner={I.steelIn} />
          <Part geo={cyl(0.06, 0.06, 0.004, 18)} m={I.bark} p={[0, 0.03, 0]} castShadow={false} />
          {[[0.025, 0.012], [-0.018, 0.026], [0.004, -0.026], [-0.028, -0.008], [0.0, 0.0]].map(([x, z], i) => (
            <Part key={i} geo={SPH} m={I.bait} scale={0.015} p={[x, 0.036, z]} castShadow={false} />
          ))}
          {/* le couvercle, posé à plat à côté, retourné */}
          <Part geo={cyl(0.073, 0.073, 0.012, 18)} m={I.steel} p={[0.16, 0.006, 0.0]} castShadow={false} />
          <Part m={I.darkSteel} p={[0.16, 0.012, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.066, 0.004, 4, 20]} />
          </Part>
        </group>
        {/* l'écumoire à glace, posée sur la glace : son anneau, son fond percé, son manche */}
        <group position={[-0.48, TOP + 0.004, 0.28]} rotation-y={0.9}>
          <Part m={I.darkSteel} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.07, 0.008, 6, 20]} />
          </Part>
          <Part geo={cyl(0.067, 0.067, 0.004, 20)} m={I.grille} p={[0, -0.003, 0]} castShadow={false} />
          <Part geo={cyl(0.008, 0.008, 0.3, 6)} m={I.wood} p={[0.22, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </Static>
      {/* l'eau au fond du trou, les éclats qui flottent, l'ombre du poisson juste sous la surface */}
      <mesh material={I.holeWater} position={[0, WATER, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[HOLE, 36]} />
      </mesh>
      <Batch geo={SPH_LO} m={I.snow} items={slush} />
      <group ref={fish} position={[0, WATER + 0.002, 0]}>
        <mesh material={I.fishShadow} rotation-x={-Math.PI / 2} scale={[0.045, 0.12, 1]} raycast={noRay}>
          <circleGeometry args={[1, 16]} />
        </mesh>
        <mesh material={I.fishShadow} position={[0, 0, -0.135]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={[0.05, 0.05, 1]} raycast={noRay}>
          <circleGeometry args={[1, 3]} />
        </mesh>
      </group>
      <mesh ref={ring} material={I.ring} position={[FLOAT.x, WATER + 0.004, FLOAT.z]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* la canne : le manche de liège, le moulinet, le corps rouge ; le scion qui plie, et son bout, d'où part la ligne */}
      <group position={ROD.p} rotation={[0, ROD.ry, ROD.rz]}>
       <Static>
        <Part geo={cyl(0.022, 0.024, 0.18, 10)} m={I.cork} p={[-0.04, 0, 0]} rotation-z={Math.PI / 2} />
        <Part geo={cyl(0.026, 0.026, 0.02, 10)} m={I.darkSteel} p={[-0.14, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <group position={[-0.08, -0.045, 0]}>
          <Part geo={cyl(0.035, 0.035, 0.03, 16)} m={I.darkSteel} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.01, 0.045, 0.008, 0.003)} m={I.steel} p={[0.015, 0, 0.02]} castShadow={false} />
          <Part geo={SPH} m={I.cork} scale={0.009} p={[0.015, 0.02, 0.025]} castShadow={false} />
        </group>
        <Part geo={cyl(0.007, 0.01, ROD.butt - 0.15, 6)} m={I.rust} p={[-(0.15 + ROD.butt) / 2, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        {[-0.3, -0.48].map((x) => (
          <Part key={x} m={I.steel} p={[x, -0.013, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.011, 0.002, 4, 10]} />
          </Part>
        ))}
       </Static>
        <group ref={tip} position={[-ROD.butt, 0, 0]}>
          <Part geo={cyl(0.004, 0.007, ROD.tip, 6)} m={I.rust} p={[-ROD.tip / 2, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part m={I.steel} p={[-ROD.tip + 0.01, -0.008, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.007, 0.0018, 4, 8]} />
          </Part>
          <object3D ref={tipEnd} position={[-ROD.tip, 0, 0]} />
        </group>
      </group>
      {/* la ligne */}
      <mesh ref={line} material={I.thread}>
        <cylinderGeometry args={[0.0045, 0.0045, 1, 5]} />
      </mesh>
      {/* le flotteur, rouge dessus, blanc dessous, sa petite antenne */}
      <group ref={float} position={[FLOAT.x, WATER + 0.012, FLOAT.z]}>
       <Static>
        <Part geo={SPH} m={I.woolRed} scale={[0.035, 0.03, 0.035]} p={[0, 0.012, 0]} castShadow={false} />
        <Part geo={SPH} m={I.enamel} scale={[0.034, 0.022, 0.034]} p={[0, -0.006, 0]} castShadow={false} />
        <Part geo={cyl(0.008, 0.008, 0.05, 6)} m={I.ink} p={[0, 0.045, 0]} castShadow={false} />
       </Static>
      </group>
    </group>
  )
}

