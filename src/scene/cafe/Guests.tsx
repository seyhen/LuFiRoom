import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { bubbleTex } from './textures'
import { K } from './materials'

const AT = [0.6, 0, 0.1] as const

function Chair({ x, dir }: { x: number; dir: 1 | -1 }) {
  return (
    <group position={[x, 0, 0]}>
      {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([dx, dz]) => (
        <Part key={`${dx}${dz}`} geo={cyl(0.025, 0.02, 0.5, 8)} m={K.walnut} p={[dx, 0.25, dz]} />
      ))}
      <Part geo={cyl(0.25, 0.25, 0.07, 22)} m={M.pink} p={[0, 0.5, 0]} />
      <Part geo={rbox(0.06, 0.5, 0.42, 0.025)} m={K.walnut} p={[-0.22 * dir, 0.78, 0]} />
    </group>
  )
}

/** Un client : jersey, tête, cheveux, yeux tournés vers l'autre côté de la table. */
function Guest({ x, dir, skin, hair, body, ginger, scarf, head }: { x: number; dir: 1 | -1; skin: typeof K.skin; hair: typeof K.ginger; body: typeof K.jumper; ginger?: boolean; scarf?: boolean; head: React.RefObject<Group> }) {
  return (
    <group position={[x, 0, 0]}>
      <Part geo={SPH} m={body} scale={[0.25, 0.3, 0.23]} p={[0, 0.8, 0]} />
      {scarf && (
        <Part m={K.tartan} p={[0.02 * dir, 1.08, 0]} rotation-x={Math.PI / 2} scale={[1, 1.1, 1]}>
          <torusGeometry args={[0.14, 0.05, 10, 20]} />
        </Part>
      )}
      <group ref={head} position={[0.03 * dir, 1.22, 0]}>
        <Part geo={SPH} m={skin} scale={0.15} />
        <Part geo={SPH} m={hair} scale={[0.165, ginger ? 0.1 : 0.13, 0.17]} p={[-0.015 * dir, 0.08, 0]} />
        {ginger ? <Part geo={SPH} m={hair} scale={0.06} p={[-0.1 * dir, 0.13, 0]} /> : <Part geo={SPH} m={hair} scale={[0.17, 0.16, 0.18]} p={[-0.05 * dir, -0.03, 0]} />}
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={M.ink} scale={[0.012, 0.018, 0.012]} p={[0.13 * dir, 0.015, 0.05 * s]} />
        ))}
        <Part geo={SPH} m={M.nose} scale={[0.014, 0.01, 0.01]} p={[0.145 * dir, -0.02, 0]} />
      </group>
      {/* les bras, vers la table */}
      {[-1, 1].map((s) => (
        <Part key={s} geo={SPH} m={body} scale={[0.09, 0.07, 0.07]} p={[0.2 * dir, 0.85, 0.2 * s]} />
      ))}
    </group>
  )
}

/** Deux clients attablés devant une théière : ils bavardent (têtes qui dodelinent, bulles) quand leur son joue. */
export function Guests() {
  const g = useRef<Group>(null!), a = useRef<Group>(null!), b = useRef<Group>(null!)
  const bubbles = useParticles(), since = useRef(0), turn = useRef(0), talk = useRef(0)
  useSquash('guests', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime, on = isActive(useStore.getState(), 'guests')
    talk.current = approach(talk.current, on ? 1 : 0, dt * 3)
    const k = talk.current
    a.current.rotation.z = Math.sin(t * 7.3) * 0.07 * k
    a.current.rotation.y = Math.sin(t * 1.3) * 0.15 * k
    b.current.rotation.z = Math.sin(t * 6.1 + 1.7) * 0.07 * k
    b.current.rotation.y = Math.sin(t * 1.1 + 1) * 0.15 * k
    since.current += dt
    if (on && since.current > 1.1) {
      since.current = 0
      turn.current = (turn.current + 1) % 2
      bubbles.emit(bubbleTex, AT[0] + (turn.current ? 0.95 : -0.95) * 0.9, 1.65, AT[2], { size: 0.32, life: 2.1, vy: 0.22, sway: 0.05, grow: 0.3, peak: 0.95 })
    }
  })
  return (
    <>
      <group ref={g} userData={{ id: 'guests' }} position={AT as unknown as [number, number, number]}>
        {/* la table ronde et son service à thé */}
        <Part geo={cyl(0.58, 0.58, 0.06, 32)} m={K.oak} p={[0, 0.8, 0]} />
        <Part geo={cyl(0.07, 0.09, 0.76, 14)} m={K.walnut} p={[0, 0.4, 0]} />
        <Part geo={cyl(0.3, 0.32, 0.04, 24)} m={K.walnut} p={[0, 0.02, 0]} />
        <Part geo={SPH} m={M.pink} scale={[0.13, 0.11, 0.11]} p={[0, 0.96, 0]} />
        <Part geo={cyl(0.012, 0.025, 0.12, 8)} m={M.pink} p={[0.15, 0.98, 0]} rotation-z={-0.9} />
        <Part geo={SPH} m={M.cream} scale={0.025} p={[0, 1.07, 0]} />
        <Part geo={cyl(0.06, 0.052, 0.1, 18)} m={M.mug} p={[-0.28, 0.88, 0.2]} />
        <Part geo={cyl(0.06, 0.052, 0.1, 18)} m={M.mug} p={[0.3, 0.88, -0.18]} />
        <Chair x={-0.95} dir={1} />
        <Chair x={0.95} dir={-1} />
        <Guest x={-0.88} dir={1} skin={K.skin} hair={K.ginger} body={K.jumper} ginger head={a} />
        <Guest x={0.88} dir={-1} skin={K.skinDark} hair={K.darkHair} body={K.burgundy} scarf head={b} />
      </group>
      <group ref={bubbles.group} />
    </>
  )
}
