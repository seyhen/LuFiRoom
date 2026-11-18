import { useRef } from 'react'
import type { Group } from 'three'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { B } from './materials'

const N = 9
/** La longueur de chaque lame : la plus longue au milieu, comme sur un vrai kalimba (les graves au centre, les aigus aux bords). */
const LEN = Array.from({ length: N }, (_, i) => 0.14 + 0.085 * (1 - Math.abs(i - (N - 1) / 2) / ((N - 1) / 2)))

/**
 * Le kalimba, objet « radio » de la salle de bain : un piano à pouces de noyer, posé sur une serviette pliée, sur un tabouret.
 * Une caisse creuse (table, fond, trou de résonance en forme de cœur), un chevalet de laiton, une barre de maintien et neuf lames de
 * longueurs différentes qui sortent du chevalet. Sur le kick, les lames tremblent chacune à son tour et des notes s'envolent. À côté,
 * un petit sac de toile rose pour l'ranger et un cordon. `position` : le dessus de la serviette, sous l'instrument.
 */
export function Kalimba({ position, ry = 0 }: { position: V3; ry?: number }) {
  const tines = useRef<Group[]>([])
  const { g, notes } = useBeat(position, 0.5, (on, t, pulse) => {
    tines.current.forEach((tn, i) => {
      // un frémissement qui court d'une lame à l'autre ; au repos, rien ne bouge
      tn.rotation.z = on && !reduceMotion ? Math.sin(t * 52 + i * 1.9) * pulse * 0.07 : 0
    })
  }, 0.04, { vy: 0.4, dx: 0.0, dz: 0.0 })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <Static>
          {/* la caisse : une table, un fond, quatre côtés ; un trou de résonance en cœur, un cordon de poignet */}
          <Part geo={rbox(0.36, 0.075, 0.27, 0.025)} m={B.woodDark} p={[0, 0.0375, 0]} />
          <Part geo={rbox(0.345, 0.014, 0.255, 0.01)} m={B.wood} p={[0, 0.077, 0]} castShadow={false} />
          <Part geo={cyl(0.04, 0.04, 0.006, 20)} m={B.ink} p={[0.07, 0.0855, 0]} castShadow={false} />
          <Part geo={SPH} m={B.ink} scale={[0.012, 0.004, 0.012]} p={[0.07, 0.089, 0]} castShadow={false} />
          {/* le chevalet et la barre de maintien, tenus par deux petites vis */}
          <Part geo={rbox(0.022, 0.02, 0.23, 0.008)} m={B.brass} p={[-0.09, 0.094, 0]} castShadow={false} />
          <Part geo={rbox(0.018, 0.014, 0.24, 0.006)} m={B.brassDark} p={[-0.125, 0.092, 0]} castShadow={false} />
          {[-0.1, 0.1].map((z) => <Part key={z} geo={cyl(0.007, 0.007, 0.01, 8)} m={B.brass} p={[-0.125, 0.1, z]} castShadow={false} />)}
          {/* la table de lecture des notes : une planchette claire sous les lames */}
          <Part geo={rbox(0.05, 0.004, 0.2, 0.002)} m={B.trim} p={[-0.16, 0.086, 0]} castShadow={false} />
          {/* un cordon de poignet qui pend sur le côté */}
          <Part geo={cyl(0.004, 0.004, 0.14, 5)} m={B.cloth} p={[0.0, 0.03, 0.14]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={SPH} m={B.cloth} scale={[0.018, 0.018, 0.018]} p={[0.0, 0.03, 0.215]} castShadow={false} />
        </Static>
        {/* les lames : chacune tourne autour de son appui sur le chevalet, pour trembler */}
        {LEN.map((len, i) => (
          <group key={i} ref={(o) => void (o && (tines.current[i] = o))} position={[-0.09, 0.106, (i - (N - 1) / 2) * 0.0245]}>
            <Part geo={rbox(len, 0.007, 0.0135, 0.003)} m={B.tine} p={[len / 2 - 0.02, 0, 0]} castShadow={false} />
            <Part geo={rbox(0.022, 0.009, 0.0145, 0.004)} m={B.tine} p={[len - 0.02 + 0.006, 0, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      {/* le sac de toile du kalimba, à côté, sur la serviette (immobile) */}
      <group position={[position[0] - 0.02, position[1] + 0.03, position[2] + 0.2]} rotation-y={0.4}>
        <Part geo={rbox(0.15, 0.06, 0.1, 0.03)} m={B.cloth} castShadow={false} />
        <Part geo={cyl(0.003, 0.003, 0.13, 5)} m={B.paper} p={[0, 0.03, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      <group ref={notes.group} />
    </>
  )
}
