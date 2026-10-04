import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { noteTexA, noteTexB } from '../textures'
import { O } from './materials'

const STRINGS = [-0.014, 0, 0.014] as const

/**
 * Un shamisen debout sur son petit support, sur l'engawa, la peau tournée vers la pièce. C'est l'objet « radio » de l'onsen :
 * les trois cordes vibrent quand la musique joue, des notes s'envolent sur le rythme et l'instrument rebondit.
 */
export function Shamisen({ position }: { position: V3 }) {
  const [px, py, pz] = position
  const g = useRef<Group>(null!), strings = useRef<Group[]>([])
  const notes = useParticles()
  const beat = useRef({ seen: useStore.getState().kicks, at: -10, flip: false })
  useFrame(({ clock }) => {
    const s = useStore.getState(), on = isActive(s, 'radio'), t = clock.elapsedTime, b = beat.current
    if (s.kicks !== b.seen) {
      b.seen = s.kicks
      b.at = t
      if (on) {
        b.flip = !b.flip
        notes.emit(b.flip ? noteTexA : noteTexB, px + rand(-0.3, 0.3), py + 1.0, pz + rand(-0.1, 0.25), { size: 0.26, life: 2.6, vy: 0.55, sway: 0.12 })
      }
    }
    strings.current.forEach((c, i) => {
      c.position.x = STRINGS[i] + (on && !reduceMotion ? Math.sin(t * (47 + i * 9)) * 0.004 : 0)
    })
  })
  useSquash('radio', g, (t) => (isActive(useStore.getState(), 'radio') ? Math.exp(-(t - beat.current.at) * 9) * 0.04 : 0))
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={Math.PI / 4}>
       <group scale={1.3}>
        {/* le support */}
        <Part geo={rbox(0.36, 0.04, 0.2, 0.015)} m={O.hinoki} p={[0, 0.02, 0]} />
        {/* la caisse (dō) en bois sombre, tendue de sa peau claire ; le chevalet de bois clair posé dessus */}
        <Part geo={rbox(0.3, 0.3, 0.12, 0.03)} m={O.cedar} p={[0, 0.19, 0]} />
        <Part geo={rbox(0.25, 0.25, 0.02, 0.01)} m={O.paper} p={[0, 0.19, 0.055]} />
        <Part geo={rbox(0.1, 0.025, 0.04, 0.008)} m={O.hinoki} p={[0, 0.17, 0.09]} castShadow={false} />
        {/* le manche (sao) et la tête avec ses trois chevilles */}
        <Part geo={rbox(0.055, 0.85, 0.055, 0.015)} m={O.deck} p={[0, 0.72, 0]} />
        <group position={[0, 1.2, -0.01]} rotation-x={-0.2}>
          <Part geo={rbox(0.075, 0.14, 0.06, 0.02)} m={O.deck} />
          {[-0.04, 0, 0.04].map((y) => (
            <group key={y} position={[0, y, 0]}>
              <Part geo={cyl(0.011, 0.011, 0.11, 8)} m={O.hinoki} rotation-z={Math.PI / 2} castShadow={false} />
              {[-1, 1].map((s) => (
                <Part key={s} geo={SPH} m={O.red} scale={0.016} p={[s * 0.058, 0, 0]} castShadow={false} />
              ))}
            </group>
          ))}
        </group>
        {/* les trois cordes, du chevalet à la tête */}
        {STRINGS.map((x, i) => (
          <group key={x} ref={(el) => void (el && (strings.current[i] = el))} position={[x, 0, 0]}>
            <Part geo={cyl(0.003, 0.003, 0.95, 4)} m={O.paper} p={[0, 0.66, 0.062]} rotation-x={-0.075} castShadow={false} />
          </group>
        ))}
       </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
