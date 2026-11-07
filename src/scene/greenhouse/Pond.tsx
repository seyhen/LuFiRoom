import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, MeshBasicMaterial, type Group, type Mesh } from 'three'
import { TAU } from '../../math'
import { useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { Vessel } from '../igloo/Vessel'
import { Rock } from '../nature/Rock'
import { G } from './materials'

const R = 1.05, WALL = 0.3, WATER = 0.2
// [x, z, rayon] des nénuphars, et des fleurs roses sur certains
const PADS: [number, number, number, boolean][] = [[-0.45, 0.25, 0.2, true], [0.2, 0.55, 0.16, false], [-0.15, -0.4, 0.18, false], [0.55, -0.15, 0.22, true], [-0.62, -0.35, 0.14, false], [0.1, 0.05, 0.13, false]]
const FROG = { x: 0.55, z: -0.15 } // la grenouille chanteuse est sur le nénuphar de droite

/** Une fleur de nénuphar : deux couronnes de pétales roses, un cœur d'or. */
function Lotus({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation-y={(i / 6) * TAU}>
          <Part geo={SPH} m={G.lily} scale={[0.025, 0.04, 0.012]} p={[0.04, 0.035, 0]} rotation-z={-0.5} castShadow={false} />
        </group>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation-y={(i / 5) * TAU + 0.3}>
          <Part geo={SPH} m={G.cream} scale={[0.02, 0.035, 0.01]} p={[0.018, 0.045, 0]} rotation-z={-0.2} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={G.horn} scale={0.02} p={[0, 0.03, 0]} castShadow={false} />
    </group>
  )
}

/**
 * La grenouille : le corps rond, la tête large, deux gros yeux saillants, les pattes arrière repliées, la gorge qui gonfle quand
 * le chœur chante (`pulses.frogs`) et le corps qui se soulève un peu.
 */
function Frog({ p, ry = 0 }: { p: V3; ry?: number }) {
  const throat = useRef<Group>(null!), body = useRef<Group>(null!), st = useRef({ seen: useStore.getState().pulses.frogs ?? 0, song: 0 })
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState()
    const n = store.pulses.frogs ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (store.on.frogs && !reduceMotion) s.song = 1
    }
    s.song = Math.max(0, s.song - dt * 1.4)
    const h = Math.sin(Math.min(1, s.song * 1.3) * Math.PI) * (s.song > 0 ? 1 : 0)
    throat.current.scale.setScalar(0.55 + h * 0.75)
    body.current.position.y = h * 0.012
  })
  return (
    <group position={p} rotation-y={ry} userData={LIVE}>
      <group ref={body}>
        <Part geo={SPH} m={G.frog} scale={[0.075, 0.05, 0.065]} p={[0, 0.045, 0]} castShadow={false} />
        <Part geo={SPH} m={G.frog} scale={[0.055, 0.04, 0.06]} p={[0.06, 0.06, 0]} castShadow={false} />
        {/* les yeux : une bille dorée à pupille, sur une bosse */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0.075, 0.095, s * 0.035]}>
            <Part geo={SPH} m={G.frog} scale={0.024} castShadow={false} />
            <Part geo={SPH} m={G.horn} scale={0.016} p={[0.008, 0.006, s * 0.004]} castShadow={false} />
            <Part geo={SPH} m={G.eye} scale={0.009} p={[0.018, 0.008, s * 0.006]} castShadow={false} />
          </group>
        ))}
        {/* la gorge : un sac clair sous le menton */}
        <group ref={throat} position={[0.1, 0.035, 0]}>
          <Part geo={SPH} m={G.frogBelly} scale={[0.04, 0.04, 0.045]} castShadow={false} />
        </group>
        {/* les pattes arrière repliées, les pieds palmés posés devant */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={SPH} m={G.frog} scale={[0.045, 0.028, 0.02]} p={[-0.02, 0.03, s * 0.065]} rotation-y={s * 0.3} castShadow={false} />
            <Part geo={SPH} m={G.frog} scale={[0.04, 0.008, 0.016]} p={[0.045, 0.01, s * 0.07]} castShadow={false} />
          </group>
        ))}
        <Part geo={SPH} m={G.frogBelly} scale={[0.04, 0.03, 0.045]} p={[0, 0.03, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Un rond dans l'eau qui s'élargit et s'efface, à chaque chant. */
function Ripple({ p }: { p: V3 }) {
  const ring = useRef<Mesh>(null!), mat = useMemo(() => new MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }), []), st = useRef({ seen: useStore.getState().pulses.frogs ?? 0, t: 9 })
  useFrame((_, delta) => {
    const s = st.current, n = useStore.getState().pulses.frogs ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (useStore.getState().on.frogs && !reduceMotion) s.t = 0
    }
    s.t += Math.min(delta, 0.05)
    const k = Math.min(1, s.t / 1.6)
    ring.current.visible = k < 1
    ring.current.scale.setScalar(0.06 + k * 0.55)
    mat.opacity = (1 - k) * 0.55
  })
  return (
    <mesh ref={ring} material={mat} position={p} rotation-x={-Math.PI / 2} raycast={() => {}} visible={false}>
      <ringGeometry args={[0.92, 1, 40]} />
    </mesh>
  )
}

/**
 * Le bassin de la serre, objet « grenouilles » : une margelle de pierre, l'eau verte et profonde, des nénuphars (deux en fleur), une
 * grenouille qui chante sur l'un d'eux, des roseaux et des massettes, des pierres moussues au bord. Quand le chœur chante, la
 * grenouille gonfle sa gorge et un rond s'élargit autour d'elle.
 */
export function Pond({ position }: { position: V3 }) {
  const g = useRef<Group>(null!)
  useSquash('pond', g)
  return (
    <group ref={g} userData={{ id: 'pond' }} position={position}>
      <Static>
        <Vessel p={[0, 0, 0]} rt={R} rb={R - 0.04} h={WALL} m={G.stone} inner={G.pondDeep} rim={G.stoneDark} t={0.012} />
        {/* le fond sombre, puis l'eau, un peu sous le bord */}
        <Part geo={cyl(R - 0.06, R - 0.06, 0.01, 40)} m={G.pondDeep} p={[0, 0.02, 0]} castShadow={false} />
        <Part geo={cyl(R - 0.045, R - 0.045, 0.012, 40)} m={G.pond} p={[0, WATER, 0]} castShadow={false} />
        {/* la margelle : une dalle plate de pierre, tout autour */}
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * TAU
          return <Part key={i} geo={cyl(0.2, 0.2, 0.05, 6)} m={i % 2 ? G.stone : G.stoneDark} p={[Math.cos(a) * (R + 0.1), WALL + 0.0, Math.sin(a) * (R + 0.1)]} rotation-y={a} castShadow={false} />
        })}
        {/* les nénuphars : une feuille ronde échancrée, ses nervures, une fleur parfois */}
        {PADS.map(([x, z, r, flower], i) => (
          <group key={i} position={[x, WATER + 0.012, z]} rotation-y={i * 1.3}>
            <Part geo={cyl(r, r, 0.008, 20)} m={G.padLeaf} castShadow={false} />
            <Part geo={cyl(r * 0.2, r * 0.2, 0.01, 8)} m={G.leafLight} p={[0, 0.001, 0]} castShadow={false} />
            {flower && <Lotus p={[0, 0.0, 0]} />}
          </group>
        ))}
        {/* les massettes au bord : tiges fines, épi brun */}
        {[[-0.85, 0.6], [-0.95, 0.3], [-0.78, 0.8], [-0.9, -0.55]].map(([x, z], i) => (
          <group key={i} position={[x, WALL - 0.05, z]}>
            <Part geo={cyl(0.008, 0.01, 0.9 + (i % 2) * 0.2, 5)} m={G.leafDark} p={[0, 0.45, 0]} rotation-z={0.06} castShadow={false} />
            <Part geo={cyl(0.02, 0.02, 0.14, 8)} m={G.lacquer} p={[0.025, 0.95 + (i % 2) * 0.2, 0]} castShadow={false} />
          </group>
        ))}
        {/* deux pierres moussues, à l'arrière du bassin */}
        <Rock v={1} p={[-0.2, WALL - 0.04, -1.15]} s={[0.3, 0.22, 0.26]} ry={0.6} m={G.stone} moss={G.moss} />
        <Rock v={4} p={[0.5, WALL - 0.05, -1.2]} s={[0.22, 0.16, 0.2]} ry={2} m={G.stoneDark} moss={G.moss} />
      </Static>
      <Frog p={[FROG.x, WATER + 0.02, FROG.z]} ry={-0.4} />
      <Ripple p={[FROG.x, WATER + 0.018, FROG.z]} />
    </group>
  )
}
