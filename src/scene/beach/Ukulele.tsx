import { useRef } from 'react'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { B } from './materials'

const STRINGS = [-0.016, -0.005, 0.005, 0.016] as const

/**
 * Un ukulélé debout sur un petit support de bois flotté, sur la caisse : corps de bois miel en huit, rosace, quatre cordes qui
 * vibrent quand la musique joue, un ruban corail noué à la tête. C'est l'objet « radio » de la plage.
 */
export function Ukulele({ position }: { position: V3 }) {
  const strings = useRef<Group[]>([])
  const { g, notes } = useBeat(position, 1.2, (on, t) => {
    strings.current.forEach((c, i) => (c.position.x = STRINGS[i] + (on && !reduceMotion ? Math.sin(t * (53 + i * 8)) * 0.004 : 0)))
  })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={Math.PI / 4}>
        <group scale={1.3}>
          <Part geo={rbox(0.34, 0.03, 0.2, 0.012)} m={B.driftwood} p={[0, 0.015, 0]} />
          {/* le corps : deux renflements aplatis, le bas plus large */}
          <Part geo={SPH} m={B.cane} scale={[0.17, 0.18, 0.06]} p={[0, 0.22, 0]} />
          <Part geo={SPH} m={B.cane} scale={[0.125, 0.13, 0.058]} p={[0, 0.42, 0]} />
          <Part geo={cyl(0.052, 0.052, 0.012, 22)} m={M.ink} p={[0, 0.34, 0.056]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part m={B.wood} p={[0, 0.34, 0.058]} castShadow={false}>
            <torusGeometry args={[0.057, 0.008, 8, 24]} />
          </Part>
          <Part geo={rbox(0.12, 0.022, 0.03, 0.008)} m={B.wood} p={[0, 0.16, 0.062]} castShadow={false} />
          {/* le manche, sa touche sombre, la tête avec ses chevilles */}
          <Part geo={rbox(0.055, 0.5, 0.045, 0.014)} m={B.wood} p={[0, 0.72, 0]} />
          <Part geo={rbox(0.045, 0.48, 0.012, 0.005)} m={M.ink} p={[0, 0.73, 0.027]} castShadow={false} />
          <Part geo={rbox(0.08, 0.15, 0.04, 0.016)} m={B.wood} p={[0, 1.05, 0]} />
          {[-1, 1].flatMap((s) => [1.02, 1.08].map((y) => <Part key={`${s}${y}`} geo={SPH} m={B.butter} scale={0.014} p={[s * 0.052, y, 0]} castShadow={false} />))}
          {/* le ruban corail noué à la tête */}
          {[-1, 1].map((s) => (
            <Part key={s} geo={rbox(0.05, 0.1, 0.012, 0.005)} m={B.coral} p={[s * 0.03, 0.96, 0.03]} rotation-z={s * 0.5} castShadow={false} />
          ))}
          <Part geo={SPH} m={B.coral} scale={0.018} p={[0, 0.98, 0.034]} castShadow={false} />
          {/* les quatre cordes, du chevalet à la tête */}
          {STRINGS.map((x, i) => (
            <group key={x} ref={(el) => void (el && (strings.current[i] = el))} position={[x, 0, 0]}>
              <Part geo={cyl(0.0025, 0.0025, 0.84, 4)} m={B.linen} p={[0, 0.59, 0.058]} rotation-x={-0.02} castShadow={false} />
            </group>
          ))}
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
