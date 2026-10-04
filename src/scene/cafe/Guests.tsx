import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { bubbleTex } from './textures'
import { LIVE, Static } from '../Static'
import { K } from './materials'
import { Candle } from '../objects/Candle'

const AT = [1.4, 0, -2.22] as const

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

type Mat = typeof K.skin
interface GuestProps { x: number; dir: 1 | -1; skin: Mat; hair: Mat; body: Mat; legs: Mat; shoes: Mat; style: 'bun' | 'curls'; scarf?: boolean; head: React.RefObject<Group> }

/**
 * Un client assis : cuisses sur la chaise, jambes et chaussures sous la table, buste un peu penché vers l'autre, avant-bras
 * posés sur la table et mains autour de la tasse ; tête aux oreilles rondes, joues roses, une coiffure à soi (chignon roux,
 * boucles brunes). `dir` : le côté de la table (+x ou -x).
 */
function Guest({ x, dir, skin, hair, body, legs, shoes, style, scarf, head }: GuestProps) {
  const f = (v: number) => v * dir
  return (
    <group position={[x, 0, 0]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* cuisse, tibia, chaussure */}
          <Part geo={rbox(0.36, 0.12, 0.12, 0.055)} m={legs} p={[f(0.14), 0.6, s * 0.085]} />
          <Part geo={rbox(0.11, 0.46, 0.11, 0.05)} m={legs} p={[f(0.3), 0.36, s * 0.085]} />
          <Part geo={rbox(0.18, 0.07, 0.1, 0.035)} m={shoes} p={[f(0.34), 0.035, s * 0.085]} />
        </group>
      ))}
      {/* le buste, penché vers la table, son col roulé ou son écharpe */}
      <group position={[f(0.02), 0.62, 0]} rotation-z={f(-0.12)}>
        <Part geo={cyl(0.15, 0.19, 0.44, 20)} m={body} p={[0, 0.24, 0]} scale={[1, 1, 0.78]} />
        <Part geo={SPH} m={body} scale={[0.17, 0.08, 0.15]} p={[0, 0.45, 0]} />
        {scarf ? (
          <>
            <Part m={K.tartan} p={[0, 0.5, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.085, 0.04, 10, 20]} />
            </Part>
            <Part geo={rbox(0.03, 0.2, 0.07, 0.015)} m={K.tartan} p={[f(0.13), 0.38, 0.05]} rotation-z={f(-0.1)} castShadow={false} />
          </>
        ) : (
          <Part geo={cyl(0.075, 0.085, 0.07, 16)} m={body} p={[0, 0.5, 0]} />
        )}
        {/* les bras : du haut de l'épaule jusqu'au coude, puis l'avant-bras à plat sur la table, la main */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={rbox(0.085, 0.27, 0.085, 0.04)} m={body} p={[f(0.07), 0.32, s * 0.17]} rotation-z={f(0.55)} />
            <Part geo={rbox(0.24, 0.075, 0.075, 0.035)} m={body} p={[f(0.27), 0.22, s * 0.13]} rotation={[0, f(s * 0.25), f(0.12)]} />
            <Part geo={SPH} m={skin} scale={[0.045, 0.035, 0.04]} p={[f(0.4), 0.235, s * 0.09]} castShadow={false} />
          </group>
        ))}
      </group>
      <group ref={head} userData={LIVE} position={[f(0.06), 1.27, 0]}>
        <Static>
        <Part geo={cyl(0.04, 0.045, 0.08, 10)} m={skin} p={[0, -0.13, 0]} castShadow={false} />
        <Part geo={SPH} m={skin} scale={[0.15, 0.145, 0.14]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={SPH} m={skin} scale={[0.03, 0.04, 0.02]} p={[f(-0.01), -0.005, s * 0.14]} castShadow={false} />
            <Part geo={SPH} m={M.ink} scale={[0.012, 0.018, 0.012]} p={[f(0.13), 0.015, s * 0.05]} castShadow={false} />
            <Part geo={SPH} m={M.nose} scale={[0.006, 0.018, 0.026]} p={[f(0.125), -0.035, s * 0.075]} castShadow={false} />
          </group>
        ))}
        <Part geo={SPH} m={skin} scale={[0.02, 0.018, 0.018]} p={[f(0.148), -0.015, 0]} castShadow={false} />
        {style === 'bun' ? (
          <>
            <Part geo={SPH} m={hair} scale={[0.158, 0.11, 0.152]} p={[f(-0.012), 0.06, 0]} />
            <Part geo={SPH} m={hair} scale={[0.15, 0.12, 0.15]} p={[f(-0.045), 0.0, 0]} />
            <Part geo={SPH} m={hair} scale={0.065} p={[f(-0.08), 0.15, 0]} />
            <Part geo={SPH} m={hair} scale={[0.04, 0.06, 0.03]} p={[f(0.08), 0.02, 0.12]} castShadow={false} />
          </>
        ) : (
          <>
            <Part geo={SPH} m={hair} scale={[0.16, 0.1, 0.155]} p={[f(-0.02), 0.07, 0]} />
            {Array.from({ length: 11 }, (_, i) => {
              const a = (i / 11) * Math.PI * 2
              return <Part key={i} geo={SPH} m={hair} scale={0.055} p={[f(-0.03) + Math.cos(a) * 0.1 * (a > Math.PI ? 1 : 0.6), 0.1 + Math.sin(i * 1.7) * 0.03, Math.sin(a) * 0.12]} castShadow={false} />
            })}
          </>
        )}
        </Static>
      </group>
    </group>
  )
}

/** Deux clients attablés à la fenêtre devant une théière : ils bavardent (têtes qui dodelinent, bulles) quand leur son joue. */
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
        <Static>
          {/* la table ronde et son service à thé */}
          <Part geo={cyl(0.5, 0.5, 0.06, 32)} m={K.oak} p={[0, 0.8, 0]} />
          <Part geo={cyl(0.07, 0.09, 0.76, 14)} m={K.walnut} p={[0, 0.4, 0]} />
          <Part geo={cyl(0.3, 0.32, 0.04, 24)} m={K.walnut} p={[0, 0.02, 0]} />
          <Part geo={SPH} m={M.pink} scale={[0.13, 0.11, 0.11]} p={[0, 0.96, 0]} />
          <Part geo={cyl(0.012, 0.025, 0.12, 8)} m={M.pink} p={[0.15, 0.98, 0]} rotation-z={-0.9} />
          <Part geo={SPH} m={M.cream} scale={0.025} p={[0, 1.07, 0]} />
          <Part geo={cyl(0.06, 0.052, 0.1, 18)} m={M.mug} p={[-0.28, 0.88, 0.2]} />
          <Part geo={cyl(0.06, 0.052, 0.1, 18)} m={M.mug} p={[0.3, 0.88, -0.18]} />
          <Part geo={cyl(0.1, 0.09, 0.012, 22)} m={M.cream} p={[0.06, 0.84, 0.28]} castShadow={false} />
          {[[-0.03, 0.02], [0.05, -0.02]].map(([dx, dz], i) => (
            <Part key={i} geo={rbox(0.07, 0.025, 0.035, 0.01)} m={K.scone} p={[0.06 + dx, 0.86, 0.28 + dz]} rotation-y={i * 0.6} castShadow={false} />
          ))}
          <Candle position={[-0.12, 0.83, -0.22]} holder="jar" height={0.07} radius={0.03} />
          <Chair x={-0.95} dir={1} />
          <Chair x={0.95} dir={-1} />
          <Guest x={-0.92} dir={1} skin={K.skin} hair={K.ginger} body={K.jumper} legs={K.navy} shoes={K.walnut} style="bun" head={a} />
          <Guest x={0.92} dir={-1} skin={K.skinDark} hair={K.darkHair} body={K.burgundy} legs={K.tweed} shoes={K.darkHair} style="curls" scarf head={b} />
        </Static>
      </group>
      <group ref={bubbles.group} />
    </>
  )
}
