import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, smooth } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { T } from './materials'

/** Le guéridon de la réussite, près du fauteuil vert et du chariot à thé : son pied au sol. */
export const CARDS = { x: 2.6, z: 1.05 }
const TOP = 0.632 // dessus du tapis de jeu
const CW = 0.115, CH = 0.165, CT = 0.006 // une carte : largeur, hauteur (le long de z), épaisseur
const STOCK: [number, number] = [-0.2, -0.12]
// les cinq colonnes de la réussite, en rang
const SLOTS: [number, number][] = [-0.2, -0.1, 0, 0.1, 0.2].map((x) => [x, 0.11])
const FLY = 0.9 // durée d'un vol (s)
const GAP = 1.0 // pause entre deux cartes (s)
const HOLD = 2.4 // pause quand la rangée est complète (s)

/**
 * Le guéridon de la réussite : un tapis de jeu vert, le talon (cartes dos bleu et or) à gauche, cinq colonnes de cartes. Quand le
 * son joue, une carte quitte le talon, se retourne en l'air et se pose face visible sur sa colonne, l'une après l'autre ; quand la
 * rangée est complète, les cartes se reposent un instant, puis la patience recommence. Au repos : la rangée reste étalée.
 */
export function CardTable() {
  const g = useRef<Group>(null!), fly = useRef<Group>(null!), landed = useRef<(Group | null)[]>([])
  const st = useRef({ t: 0, n: 0, phase: 'wait' as 'wait' | 'fly' | 'hold', done: SLOTS.length })
  useSquash('cards', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'cards')
    if (on && !reduceMotion) {
      s.t += dt
      if (s.done >= SLOTS.length && s.phase !== 'hold') {
        s.phase = 'hold'
        s.t = 0
      }
      if (s.phase === 'hold' && s.t > HOLD) {
        s.done = 0
        s.phase = 'wait'
        s.t = GAP - 0.4
      } else if (s.phase === 'wait' && s.t > GAP) {
        s.phase = 'fly'
        s.t = 0
      } else if (s.phase === 'fly' && s.t > FLY) {
        s.done++
        s.phase = 'wait'
        s.t = 0
      }
    } else if (!on) s.t = approach(s.t, 0, dt)
    const flying = on && !reduceMotion && s.phase === 'fly', k = Math.min(1, s.t / FLY), e = smooth(k)
    const [tx, tz] = SLOTS[Math.min(s.done, SLOTS.length - 1)]
    const f = fly.current
    f.visible = flying
    if (flying) {
      // du talon à sa colonne, en arc ; la carte se retourne autour de son grand axe (z), dos puis face
      f.position.set(STOCK[0] + (tx - STOCK[0]) * e, TOP + CT + Math.sin(Math.PI * k) * 0.14, STOCK[1] + (tz - STOCK[1]) * e)
      f.rotation.set(0, (1 - e) * 0.3, Math.PI * (1 - e))
    }
    landed.current.forEach((c, i) => {
      if (c) c.visible = i < s.done || !on || reduceMotion
    })
  })
  const card = (back: boolean, mark?: number) => (
    <>
      <Part geo={rbox(CW, CT, CH, 0.003)} m={back ? T.livery : T.cream} p={[0, back ? -0.0032 : 0.0032, 0]} castShadow={false} />
      {back ? (
        <Part geo={SPH} m={T.gold} scale={[0.026, 0.002, 0.04]} p={[0, -0.0072, 0]} castShadow={false} />
      ) : (
        <>
          <Part geo={SPH} m={mark ? T.rose : T.ink} scale={[0.024, 0.003, 0.03]} p={[0, 0.0068, 0]} castShadow={false} />
          <Part geo={rbox(0.014, 0.003, 0.014, 0.003)} m={mark ? T.rose : T.ink} p={[-0.032, 0.0068, -0.052]} castShadow={false} />
        </>
      )}
    </>
  )
  return (
    <group ref={g} userData={{ id: 'cards' }} position={[CARDS.x, 0, CARDS.z]} rotation-y={-0.3}>
      <Static>
        {/* le guéridon : un plateau d'acajou cerclé de laiton, un fût, un trépied */}
        <Part geo={cyl(0.34, 0.34, 0.04, 28)} m={T.mahogany} p={[0, 0.6, 0]} />
        <Part geo={cyl(0.345, 0.345, 0.015, 28)} m={T.brass} p={[0, 0.585, 0]} castShadow={false} />
        <Part geo={cyl(0.28, 0.28, 0.012, 28)} m={T.leaf} p={[0, TOP - 0.006, 0]} castShadow={false} />
        <Part geo={cyl(0.03, 0.05, 0.56, 10)} m={T.mahoganyDark} p={[0, 0.3, 0]} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU + 0.5
          return <Part key={i} geo={rbox(0.25, 0.04, 0.05, 0.02)} m={T.mahoganyDark} p={[Math.cos(a) * 0.12, 0.03, Math.sin(a) * 0.12]} rotation-y={-a} />
        })}
        {/* le talon : une pile de cartes dos bleu */}
        <group position={[STOCK[0], TOP, STOCK[1]]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Part key={i} geo={rbox(CW, CT, CH, 0.003)} m={T.livery} p={[(i % 2) * 0.002, CT / 2 + i * CT, 0]} rotation-y={(i - 2) * 0.03} castShadow={false} />
          ))}
          <Part geo={SPH} m={T.gold} scale={[0.026, 0.002, 0.04]} p={[0, 5 * CT + 0.001, 0]} castShadow={false} />
        </group>
        {/* les cinq colonnes : une carte dos visible en dessous de chaque carte retournée */}
        {SLOTS.map(([x, z], i) => (
          <Part key={i} geo={rbox(CW, CT, CH, 0.003)} m={T.livery} p={[x, TOP + CT / 2, z - 0.018]} castShadow={false} />
        ))}
      </Static>
      {/* les cartes retournées, qui se posent une à une */}
      {SLOTS.map(([x, z], i) => (
        <group key={i} ref={(r) => { landed.current[i] = r }} position={[x, TOP + CT + CT / 2, z + 0.012]}>
          {card(false, i % 2)}
        </group>
      ))}
      {/* la carte en vol : dos d'un côté, face de l'autre */}
      <group ref={fly} visible={false}>
        {card(true)}
        {card(false, 1)}
      </group>
    </group>
  )
}
