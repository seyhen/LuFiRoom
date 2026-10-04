import { useRef } from 'react'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { useBeat } from '../objects/useBeat'
import { R } from './materials'

/**
 * Un boombox des années 80, posé sur sa caisse : coque moutarde, deux gros haut-parleurs qui battent sur le rythme, la fenêtre
 * de la cassette dont les bobines tournent, une poignée. C'est l'objet « radio » du toit.
 */
export function Boombox({ position }: { position: V3 }) {
  const cones = useRef<Group[]>([]), reels = useRef<Group[]>([])
  const { g, notes } = useBeat(position, 0.9, (on, t, pulse) => {
    cones.current.forEach((c) => c.scale.setScalar(1 + (on ? pulse * 0.22 : 0)))
    reels.current.forEach((r) => (r.rotation.z = on ? -t * 3 : 0))
  }, 0.03)
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position}>
        <Part geo={rbox(1.0, 0.46, 0.3, 0.07)} m={R.mustard} p={[0, 0.23, 0]} />
        {/* les deux haut-parleurs : cadre noir, anneau crème, cône qui bat */}
        {[-0.31, 0.31].map((x, i) => (
          <group key={x} position={[x, 0.22, 0.155]}>
            <Part geo={cyl(0.15, 0.15, 0.03, 28)} m={R.steel} rotation-x={Math.PI / 2} />
            <Part m={R.cushion} p={[0, 0, 0.012]} castShadow={false}>
              <torusGeometry args={[0.15, 0.014, 8, 28]} />
            </Part>
            <group ref={(el) => void (el && (cones.current[i] = el))}>
              <Part geo={cyl(0.085, 0.085, 0.04, 22)} m={M.ink} rotation-x={Math.PI / 2} p={[0, 0, 0.012]} castShadow={false} />
              <Part geo={SPH} m={R.steel} scale={0.03} p={[0, 0, 0.034]} castShadow={false} />
            </group>
          </group>
        ))}
        {/* le centre : la fenêtre de la cassette et ses deux bobines, une réglette, trois touches */}
        <Part geo={rbox(0.3, 0.3, 0.03, 0.015)} m={R.steel} p={[0, 0.25, 0.155]} />
        <Part geo={rbox(0.24, 0.12, 0.02, 0.01)} m={R.glass} p={[0, 0.3, 0.17]} castShadow={false} />
        {[-0.055, 0.055].map((x, i) => (
          <group key={x} ref={(el) => void (el && (reels.current[i] = el))} position={[x, 0.3, 0.182]}>
            <Part geo={cyl(0.035, 0.035, 0.008, 12)} m={R.cushion} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={rbox(0.05, 0.01, 0.01, 0.003)} m={R.rust} castShadow={false} />
          </group>
        ))}
        <Part geo={rbox(0.2, 0.025, 0.012, 0.006)} m={R.cushion} p={[0, 0.2, 0.172]} castShadow={false} />
        {[-0.07, 0, 0.07].map((x, i) => (
          <Part key={x} geo={rbox(0.05, 0.03, 0.02, 0.008)} m={[R.rust, R.teal, R.cushion][i]} p={[x, 0.14, 0.17]} castShadow={false} />
        ))}
        {/* la poignée et l'antenne */}
        <Part m={R.steel} p={[0, 0.46, 0]}>
          <torusGeometry args={[0.3, 0.025, 8, 24, Math.PI]} />
        </Part>
        <Part geo={cyl(0.008, 0.008, 0.55, 6)} m={R.steel} p={[0.4, 0.7, -0.08]} rotation-z={-0.25} castShadow={false} />
      </group>
      <group ref={notes.group} />
    </>
  )
}
