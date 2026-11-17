import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { approach } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { reduceMotion, useSquash } from '../../anim'
import { LIVE } from '../../Static'
import { Part, SPH, cyl, rbox } from '../../parts'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { snowY } from './ground'

// Le hibou de la clairière : perché sur un vieux chicot enneigé au bord du sentier, tourné vers la cabane. Interactif (`owl`) :
// touché, la forêt de nuit se fait entendre et il tourne lentement la tête, les plumes gonflées. Éteint, il dort, le bec dans le plumage.
const F = { c: [0, 0] as [number, number], r0: 9, r1: 16.5 }
const M = {
  bark: skyFade(far(0x7a5a46, { roughness: 0.85 }), F),
  barkDark: skyFade(far(0x5e4334, { roughness: 0.9 }), F),
  snow: skyFade(far(0xf3f7ff, { roughness: 0.5, clearcoat: 0.3 }), F),
  feather: skyFade(far(0xa27a56, { roughness: 0.75 }), F),
  featherDark: skyFade(far(0x6f5038, { roughness: 0.8 }), F),
  cream: skyFade(far(0xf0e2c8, { roughness: 0.8 }), F),
  amber: skyFade(far(0xf2b33c, { roughness: 0.3, clearcoat: 0.8 }), F),
  black: skyFade(far(0x2a2224, { roughness: 0.3, clearcoat: 0.8 }), F),
  beak: skyFade(far(0xd9a05a, { roughness: 0.5, clearcoat: 0.3 }), F),
}
const TRUNK = 1.45

/** `at` : le pied du chicot (x, z) ; la hauteur de neige vient de `snowY`. */
export function Owl({ at, ry = Math.PI / 4 }: { at: [number, number]; ry?: number }) {
  const root = useRef<Group>(null!), head = useRef<Group>(null!), body = useRef<Group>(null!)
  const s = useRef({ amp: 0, phase: 0, puff: 0 })
  useSquash('owl', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current
    S.amp = approach(S.amp, isActive(useStore.getState(), 'owl') && !reduceMotion ? 1 : 0, dt * 0.9)
    S.phase += dt * 0.55
    S.puff += dt * 1.1
    // la tête tourne d'un côté, marque une pause, revient ; le corps respire un peu plus large quand la forêt est éveillée
    head.current.rotation.y = Math.sin(S.phase) * 0.9 * S.amp
    head.current.rotation.z = Math.sin(S.phase * 0.5) * 0.12 * S.amp
    const k = 1 + Math.sin(S.puff) * 0.025 * S.amp + 0.04 * S.amp
    body.current.scale.set(k, 1 + (k - 1) * 0.6, k)
  })
  const g = snowY(at[0], at[1])
  return (
    <group position={[at[0], g, at[1]]} userData={{ id: 'owl' }} ref={root}>
      {/* le chicot : un tronc qui s'effile, une cassure en biais, une branche, la neige sur le dessus */}
      <Part geo={cyl(0.15, 0.24, TRUNK, 10)} m={M.bark} p={[0, TRUNK / 2, 0]} />
      <Part geo={cyl(0.12, 0.15, 0.1, 10)} m={M.barkDark} p={[0, TRUNK - 0.02, 0]} castShadow={false} />
      <Part geo={SPH} m={M.snow} p={[0, TRUNK + 0.06, 0]} scale={[0.16, 0.04, 0.16]} castShadow={false} />
      <group position={[0.1, 0.8, -0.04]} rotation={[0, 0, -0.9]}>
        <Part geo={cyl(0.04, 0.07, 0.5, 7)} m={M.barkDark} p={[0, 0.22, 0]} castShadow={false} />
        <Part geo={SPH} m={M.snow} p={[0, 0.3, 0.03]} scale={[0.05, 0.03, 0.05]} castShadow={false} />
      </group>
      <Part geo={SPH} m={M.snow} p={[0.05, 0.05, 0.18]} scale={[0.28, 0.12, 0.26]} castShadow={false} />
      {/* le hibou, posé au sommet, de face */}
      <group position={[0, TRUNK + 0.07, 0]} rotation-y={ry} scale={1.1}>
        <group ref={body} userData={LIVE}>
          <Part geo={SPH} m={M.feather} p={[0, 0.27, 0]} scale={[0.2, 0.27, 0.19]} />
          {/* le ventre crème, strié de brun */}
          <Part geo={SPH} m={M.cream} p={[0, 0.24, 0.1]} scale={[0.14, 0.2, 0.1]} castShadow={false} />
          {[-0.05, 0.05].map((x) => <Part key={x} geo={rbox(0.025, 0.1, 0.02, 0.01, 1)} m={M.featherDark} p={[x, 0.22, 0.195]} castShadow={false} />)}
          {/* les ailes repliées le long du corps, la queue en bas */}
          {[-1, 1].map((d) => <Part key={d} geo={SPH} m={M.featherDark} p={[d * 0.175, 0.27, -0.02]} scale={[0.055, 0.2, 0.14]} rotation={[0.12, 0, d * 0.1]} castShadow={false} />)}
          <Part geo={rbox(0.15, 0.04, 0.2, 0.02, 1)} m={M.featherDark} p={[0, 0.08, -0.17]} rotation-x={-0.5} castShadow={false} />
          {/* les serres sur le bord du chicot */}
          {[-0.06, 0.06].map((x) => <Part key={x} geo={SPH} m={M.beak} p={[x, 0.025, 0.1]} scale={[0.04, 0.025, 0.07]} castShadow={false} />)}
        </group>
        <group ref={head} position={[0, 0.57, 0.01]} userData={LIVE}>
          <Part geo={SPH} m={M.feather} scale={[0.19, 0.16, 0.165]} />
          {/* le masque clair, en deux disques ; les yeux ambre, leur pupille ; le bec */}
          {[-1, 1].map((d) => (
            <group key={d}>
              <Part geo={SPH} m={M.cream} p={[d * 0.075, 0, 0.12]} scale={[0.09, 0.095, 0.05]} castShadow={false} />
              <Part geo={SPH} m={M.amber} p={[d * 0.075, 0.01, 0.16]} scale={[0.052, 0.056, 0.03]} castShadow={false} />
              <Part geo={SPH} m={M.black} p={[d * 0.075, 0.01, 0.186]} scale={[0.028, 0.03, 0.016]} castShadow={false} />
              {/* l'aigrette : une touffe pointue de chaque côté du front */}
              <Part geo={cyl(0, 0.04, 0.1, 6)} m={M.featherDark} p={[d * 0.1, 0.16, 0]} rotation={[0, 0, -d * 0.35]} castShadow={false} />
            </group>
          ))}
          <Part geo={cyl(0, 0.032, 0.07, 6)} m={M.beak} p={[0, -0.02, 0.185]} rotation-x={Math.PI / 2 + 0.25} castShadow={false} />
        </group>
      </group>
    </group>
  )
}
