import { Part, cyl, rbox, worldUV } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { ROW_X, SEAT_Z } from './layout'

const PAN = worldUV(rbox(0.62, 0.15, 0.78, 0.06), 1)
const BACK = worldUV(rbox(0.2, 0.98, 0.78, 0.08), 1)
const HEAD = worldUV(rbox(0.15, 0.3, 0.5, 0.07), 1)

/**
 * Un siège de cabine, vu de face (il regarde +x) : deux pieds et leurs platines d'aluminium, l'assise et sa coque, le dossier en
 * étoffe de constellations, l'appuie-tête avec sa housse blanche et ses deux ailes qui se rabattent, les accoudoirs, deux sangles de
 * ceinture posées en travers avec leur boucle. `recline` incline le dossier. `leftArm` : l'accoudoir côté hublot.
 * `position` : le sol sous le centre de l'assise.
 */
export function Seat({ position, recline = 0, leftArm = false, belt = true }: { position: [number, number, number]; recline?: number; leftArm?: boolean; belt?: boolean }) {
  return (
    <group position={position}>
      {/* les pieds et la traverse */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geo={cyl(0.028, 0.028, 0.34, 10)} m={A.aluminium} p={[-0.06, 0.2, s * 0.26]} castShadow={false} />
          <Part geo={rbox(0.34, 0.02, 0.09, 0.008)} m={A.aluminium} p={[-0.02, 0.013, s * 0.26]} castShadow={false} />
        </group>
      ))}
      <Part geo={cyl(0.02, 0.02, 0.56, 8)} m={A.aluminium} p={[-0.06, 0.34, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* l'assise, ses deux coques de côté, le dessous sombre */}
      <Part geo={PAN} m={A.seat} p={[0, 0.43, 0]} />
      {[-1, 1].map((s) => <Part key={s} geo={rbox(0.6, 0.17, 0.04, 0.02)} m={A.seatLeather} p={[0, 0.425, s * 0.405]} castShadow={false} />)}
      <Part geo={rbox(0.5, 0.03, 0.66, 0.012)} m={A.seatDark} p={[-0.02, 0.33, 0]} castShadow={false} />
      {/* le dossier et l'appuie-tête, qui basculent autour du bas du dossier */}
      <group position={[-0.24, 0.46, 0]} rotation-z={0.13 + recline}>
        <Part geo={BACK} m={A.seat} p={[-0.07, 0.43, 0]} />
        <Part geo={rbox(0.05, 0.86, 0.7, 0.02)} m={A.seatLeather} p={[-0.2, 0.4, 0]} castShadow={false} />
        <Part geo={HEAD} m={A.seat} p={[-0.12, 1.04, 0]} />
        <Part geo={rbox(0.155, 0.22, 0.52, 0.06)} m={A.cover} p={[-0.095, 1.04, 0]} />
        {[-1, 1].map((s) => <Part key={s} geo={rbox(0.05, 0.26, 0.14, 0.02)} m={A.seat} p={[-0.045, 1.02, s * 0.3]} rotation-y={s * 0.5} />)}
      </group>
      {/* les accoudoirs : un dessus de cuir, un montant, une pastille d'aluminium au bout */}
      {(leftArm ? [-1, 1] : [1]).map((s) => (
        <group key={s}>
          <Part geo={rbox(0.5, 0.075, 0.09, 0.03)} m={A.seatLeather} p={[-0.04, 0.77, s * 0.445]} />
          <Part geo={rbox(0.1, 0.3, 0.06, 0.02)} m={A.seatDark} p={[-0.2, 0.6, s * 0.445]} castShadow={false} />
          <Part geo={rbox(0.05, 0.02, 0.06, 0.008)} m={A.aluminium} p={[0.22, 0.77, s * 0.445]} castShadow={false} />
        </group>
      ))}
      {/* la ceinture : deux sangles en travers de l'assise, la boucle au milieu (on la voit de loin) */}
      {belt && (
        <>
          <Part geo={rbox(0.07, 0.012, 0.3, 0.004)} m={A.belt} p={[0.04, 0.512, -0.18]} castShadow={false} />
          <Part geo={rbox(0.07, 0.012, 0.3, 0.004)} m={A.belt} p={[0.04, 0.512, 0.18]} castShadow={false} />
          <Part geo={rbox(0.09, 0.02, 0.07, 0.008)} m={A.buckle} p={[0.04, 0.522, 0.0]} castShadow={false} />
        </>
      )}
    </group>
  )
}

/** Les sièges de la cabine (hors ceux qui portent un objet, qui prennent la même `Seat` dans leur fichier). */
export const SEATS: { row: number; id: keyof typeof SEAT_Z; p: [number, number, number] }[] = ROW_X.flatMap((x, row) =>
  (Object.keys(SEAT_Z) as (keyof typeof SEAT_Z)[]).map((id) => ({ row, id, p: [x, 0, SEAT_Z[id]] as [number, number, number] })),
)

export function Seats() {
  return (
    <Static>
      {SEATS.map(({ row, id, p }) => (
        <Seat key={`${row}${id}`} position={p} leftArm={id === 'A' || id === 'D'} belt />
      ))}
    </Static>
  )
}
