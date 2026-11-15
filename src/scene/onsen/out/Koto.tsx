import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { approach } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { reduceMotion, useSquash } from '../../anim'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../../parts'
import { groundY } from './ground'

// La joueuse de koto : à genoux sur un tatami, au bord du sentier, devant son koto (treize cordes, treize chevalets d'ivoire, deux
// sabots de bois sombre). Interactive (`koto`) : touchée, elle joue (le son `koto`), son buste se balance et sa main droite plonge
// sur les cordes à chaque note entendue (`pulses.koto`). Un plateau de thé à côté d'elle.
const F = { c: [0, 0] as [number, number], r0: 8.5, r1: 14 }
const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.6, ...o }), F)
const M = {
  tatami: f(0xb8c488, { roughness: 0.95 }),
  border: f(0x2c3a3a, { roughness: 0.9 }),
  cushion: f(0x8a2f3c, { roughness: 0.9 }),
  wood: f(0xc99c6a, { roughness: 0.55, clearcoat: 0.4 }),
  rosewood: f(0x4a2c24, { roughness: 0.4, clearcoat: 0.7 }),
  ivory: f(0xf3ead2, { roughness: 0.4, clearcoat: 0.4 }),
  string: f(0xf8f2e4, { roughness: 0.3 }),
  yukata: f(0x3a4f80, { roughness: 0.75 }),
  collar: f(0xf2e8d8, { roughness: 0.8 }),
  obi: f(0xd9a441, { roughness: 0.6 }),
  hakama: f(0x2d3552, { roughness: 0.8 }),
  skin: f(0xe8b894),
  hair: f(0x2a2024, { roughness: 0.5 }),
  bamboo: f(0xa8905a, { roughness: 0.7 }),
  clay: f(0x3a3434, { roughness: 0.4, clearcoat: 0.5 }),
  cup: f(0xf2efe6, { roughness: 0.3, clearcoat: 0.6 }),
  tea: f(0x8a9a3a, { roughness: 0.2 }),
}

const TOP = 0.06
/** Les chevalets du koto : [x, indice de corde] ; en diagonale, comme sur un vrai koto. */
const STRINGS = 13, KZ = 0.53, KW = 0.22

/** Un bras de l'épaule `a` à la main `b` (coordonnées locales) : manche, coude arrondi, main. */
function Arm({ a, b }: { a: V3; b: V3 }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  return (
    <group>
      <Part geo={cyl(0.07, 0.06, len, 10)} m={M.yukata} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} />
      <Part geo={SPH} m={M.yukata} p={a} scale={0.085} castShadow={false} />
      <Part geo={SPH} m={M.skin} p={b} scale={0.055} castShadow={false} />
    </group>
  )
}

/** Le koto : caisse en paulownia à dos cambré, sabots rosewood, treize cordes, treize chevalets, un fin liseré clair. */
function Koto() {
  return (
    <group>
      <Part geo={rbox(0.12, 0.05, 0.2, 0.015)} m={M.rosewood} p={[0.05, 0.085, KZ]} castShadow={false} />
      <Part geo={rbox(0.12, 0.05, 0.2, 0.015)} m={M.rosewood} p={[1.25, 0.085, KZ]} castShadow={false} />
      <Part geo={rbox(1.8, 0.08, 0.27, 0.035)} m={M.wood} p={[0.65, 0.15, KZ]} />
      <Part geo={SPH} m={M.wood} p={[0.65, 0.19, KZ]} scale={[0.9, 0.075, 0.14]} castShadow={false} />
      <Part geo={rbox(1.78, 0.012, 0.012, 0.005)} m={M.ivory} p={[0.65, 0.108, KZ + 0.138]} castShadow={false} />
      <Part geo={rbox(0.1, 0.12, 0.29, 0.035)} m={M.rosewood} p={[-0.23, 0.18, KZ]} />
      <Part geo={rbox(0.1, 0.12, 0.29, 0.035)} m={M.rosewood} p={[1.53, 0.18, KZ]} />
      {Array.from({ length: STRINGS }, (_, i) => {
        const z = KZ - KW / 2 + (i * KW) / (STRINGS - 1)
        return (
          <group key={i}>
            <Part geo={cyl(0.005, 0.005, 1.7, 4)} m={M.string} p={[0.65, 0.272, z]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={rbox(0.03, 0.05, 0.02, 0.008)} m={M.ivory} p={[1.25 - i * 0.07, 0.255, z]} castShadow={false} />
          </group>
        )
      })}
    </group>
  )
}

/** Le plateau de thé : plateau de bambou, théière de terre cuite, une tasse. */
function TeaTray() {
  return (
    <group position={[-0.8, TOP, 0.2]}>
      <Part geo={cyl(0.2, 0.2, 0.03, 18)} m={M.bamboo} p={[0, 0.015, 0]} castShadow={false} />
      <Part geo={SPH} m={M.clay} p={[-0.05, 0.1, 0]} scale={[0.09, 0.075, 0.09]} castShadow={false} />
      <Part geo={cyl(0.03, 0.04, 0.02, 10)} m={M.clay} p={[-0.05, 0.17, 0]} castShadow={false} />
      <Part geo={cyl(0.012, 0.022, 0.07, 6)} m={M.clay} p={[0.03, 0.115, 0]} rotation-z={-1.0} castShadow={false} />
      <Part geo={rbox(0.014, 0.06, 0.03, 0.006)} m={M.clay} p={[-0.14, 0.11, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.032, 0.055, 12)} m={M.cup} p={[0.1, 0.0575, 0.07]} castShadow={false} />
      <Part geo={cyl(0.034, 0.034, 0.01, 12)} m={M.tea} p={[0.1, 0.0825, 0.07]} castShadow={false} />
    </group>
  )
}

/** `at` : le centre du tatami au sol (x, z) ; la joueuse regarde vers +z tourné de `ry`. */
export function KotoPlayer({ at, ry = 0.5, scale = 0.9 }: { at: [number, number]; ry?: number; scale?: number }) {
  const root = useRef<Group>(null!), upper = useRef<Group>(null!), hand = useRef<Group>(null!)
  const s = useRef({ amp: 0, phase: 0, dip: 0, seen: 0 })
  useSquash('koto', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current
    S.amp = approach(S.amp, isActive(useStore.getState(), 'koto') && !reduceMotion ? 1 : 0, dt * 1.2)
    S.phase += dt * 1.1
    // chaque note entendue fait plonger la main droite, qui remonte ensuite
    const n = useStore.getState().pulses.koto ?? 0
    if (n !== S.seen) { S.seen = n; S.dip = 1 }
    S.dip = approach(S.dip, 0, dt * 5) * S.amp
    upper.current.rotation.z = Math.sin(S.phase) * 0.045 * S.amp
    upper.current.rotation.x = 0.14 + Math.sin(S.phase * 0.5 + 1) * 0.03 * S.amp
    hand.current.rotation.x = 0.16 * S.dip
  })
  // le tatami suit le sol : on le pose à la plus haute des hauteurs sous lui, et on l'épaissit vers le bas
  const g = Math.max(...[[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]].map(([a, b]) => groundY(at[0] + a, at[1] + b)))
  return (
    <group ref={root} position={[at[0], g + 0.02, at[1]]} rotation-y={ry} userData={{ id: 'koto' }}>
      <group scale={scale}>
        <Static>
          <Part geo={rbox(2.8, 0.26, 1.5, 0.03)} m={M.tatami} p={[0.4, -0.07, 0.3]} />
          {[-0.45, 1.05].map((z) => <Part key={z} geo={rbox(2.8, 0.012, 0.07, 0.004)} m={M.border} p={[0.4, TOP + 0.002, z + (z < 0 ? 0.035 : -0.035)]} castShadow={false} />)}
          <Part geo={rbox(0.025, 0.012, 1.5, 0.004)} m={M.border} p={[0.4, TOP + 0.002, 0.3]} castShadow={false} />
          {/* le coussin et la jupe pliée sous elle */}
          <Part geo={rbox(0.64, 0.07, 0.62, 0.03)} m={M.cushion} p={[0, TOP + 0.04, 0.05]} castShadow={false} />
          <Part geo={rbox(0.56, 0.18, 0.5, 0.09)} m={M.hakama} p={[0, TOP + 0.16, 0.1]} castShadow={false} />
          <Koto />
          <TeaTray />
        </Static>
        {/* le buste, penché vers les cordes, pivote autour des hanches */}
        <group position={[0, 0.3, 0]} ref={upper} userData={LIVE}>
          <Static>
            <group position={[0, -0.3, 0]}>
              <Part geo={rbox(0.42, 0.52, 0.27, 0.1)} m={M.yukata} p={[0, 0.54, 0]} castShadow={false} />
              <Part geo={rbox(0.46, 0.11, 0.3, 0.04)} m={M.obi} p={[0, 0.37, 0]} castShadow={false} />
              {/* le col croisé du yukata : deux bandes claires en V */}
              {[-1, 1].map((d) => <Part key={d} geo={rbox(0.045, 0.24, 0.02, 0.01)} m={M.collar} p={[d * 0.05, 0.7, 0.14]} rotation-z={d * 0.3} castShadow={false} />)}
              <Part geo={cyl(0.06, 0.07, 0.08, 10)} m={M.skin} p={[0, 0.84, 0]} castShadow={false} />
              <Part geo={SPH} m={M.skin} p={[0, 0.98, 0]} scale={[0.15, 0.16, 0.145]} castShadow={false} />
              <Part geo={SPH} m={M.hair} p={[0, 1.04, -0.03]} scale={[0.165, 0.14, 0.16]} castShadow={false} />
              <Part geo={SPH} m={M.hair} p={[0, 1.13, -0.1]} scale={0.075} castShadow={false} />
              {[-0.055, 0.055].map((x) => <Part key={x} geo={SPH} m={M.hair} p={[x, 0.99, 0.14]} scale={[0.026, 0.009, 0.008]} castShadow={false} />)}
              <Part geo={SPH} m={M.skin} p={[0, 0.955, 0.152]} scale={0.022} castShadow={false} />
              <group position={[0.2, 0.72, 0]}><Arm a={[0, 0, 0]} b={[0.3, -0.42, 0.5]} /></group>
            </group>
          </Static>
          {/* la main droite : elle plonge sur les cordes à chaque note */}
          <group position={[-0.2, 0.42, 0]} ref={hand} userData={LIVE}>
            <Static>
              <Arm a={[0, 0, 0]} b={[0.11, -0.4, 0.43]} />
            </Static>
          </group>
        </group>
      </group>
    </group>
  )
}
