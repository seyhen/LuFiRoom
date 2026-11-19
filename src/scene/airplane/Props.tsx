import { Part, SPH, SPH_MID, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { A } from './materials'

const SEAT_TOP = 0.512

/** Sur le siège du milieu de la rangée 1 : un livre de poche posé ouvert, face contre l'assise, et une trousse de toilette jaune dont la tirette est restée ouverte. `position` : le centre du siège, au sol. */
export function BookAndPouch({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Static>
        {/* le livre, retourné en toit : deux couvertures qui se rejoignent au dos, les pages dessous */}
        <group position={[0.02, SEAT_TOP, -0.12]} rotation-y={0.35}>
          <Part geo={rbox(0.15, 0.004, 0.21, 0.002)} m={A.book} p={[-0.068, 0.024, 0]} rotation-z={0.52} castShadow={false} />
          <Part geo={rbox(0.15, 0.004, 0.21, 0.002)} m={A.book} p={[0.068, 0.024, 0]} rotation-z={-0.52} castShadow={false} />
          <Part geo={rbox(0.12, 0.034, 0.19, 0.004)} m={A.pages} p={[-0.05, 0.018, 0]} rotation-z={0.52} castShadow={false} />
          <Part geo={rbox(0.12, 0.034, 0.19, 0.004)} m={A.pages} p={[0.05, 0.018, 0]} rotation-z={-0.52} castShadow={false} />
          <Part geo={rbox(0.02, 0.058, 0.21, 0.004)} m={A.book} p={[0, 0.047, 0]} castShadow={false} />
        </group>
        {/* la trousse : un boudin de toile, sa fermeture, sa tirette, une étiquette */}
        <group position={[-0.02, SEAT_TOP, 0.2]} rotation-y={-0.3}>
          <Part geo={rbox(0.22, 0.08, 0.13, 0.035)} m={A.pouch} p={[0, 0.04, 0]} />
          <Part geo={rbox(0.2, 0.008, 0.012, 0.003)} m={A.binDark} p={[0, 0.082, 0]} castShadow={false} />
          <Part geo={rbox(0.03, 0.012, 0.022, 0.005)} m={A.steel} p={[0.07, 0.086, 0.0]} castShadow={false} />
          <Part geo={rbox(0.05, 0.016, 0.01, 0.003)} m={A.pillow} p={[-0.08, 0.05, 0.068]} castShadow={false} />
        </group>
      </Static>
    </group>
  )
}

/** Sur le siège du couloir de la rangée 1 : un oreiller et un plaid de la compagnie, encore sous leur plastique, l'un sur l'autre. `position` : le centre du siège, au sol. */
export function PillowBag({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={rbox(0.36, 0.08, 0.3, 0.035)} m={A.blanketPlain} p={[-0.02, SEAT_TOP + 0.04, 0.0]} rotation-y={0.1} castShadow={false} />
      <Part geo={rbox(0.38, 0.1, 0.32, 0.04)} m={A.pillowBag} p={[-0.02, SEAT_TOP + 0.045, 0.0]} rotation-y={0.1} castShadow={false} />
      <Part geo={rbox(0.32, 0.075, 0.26, 0.035)} m={A.coverPlain} p={[0.0, SEAT_TOP + 0.13, 0.02]} rotation-y={-0.15} castShadow={false} />
      <Part geo={rbox(0.34, 0.095, 0.28, 0.04)} m={A.pillowBag} p={[0.0, SEAT_TOP + 0.135, 0.02]} rotation-y={-0.15} castShadow={false} />
    </group>
  )
}

/** Une paire de chaussons de la compagnie, éponge crème : le second est tombé sur le flanc. `position` : le sol, devant le siège. */
export function Slippers({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Static>
        <group position={[0, 0, -0.1]} rotation-y={0.12}>
          <Part geo={rbox(0.22, 0.048, 0.09, 0.024)} m={A.slipper} p={[0, 0.024, 0]} />
          <Part geo={rbox(0.07, 0.01, 0.075, 0.004)} m={A.sock} p={[-0.07, 0.052, 0]} castShadow={false} />
        </group>
        <group position={[0.02, 0.0, 0.14]} rotation-y={-0.5} rotation-x={Math.PI / 2 - 0.12}>
          <Part geo={rbox(0.22, 0.048, 0.09, 0.024)} m={A.slipper} p={[0, 0.045, 0.03]} />
          <Part geo={rbox(0.07, 0.01, 0.075, 0.004)} m={A.sock} p={[-0.07, 0.073, 0.03]} castShadow={false} />
        </group>
      </Static>
    </group>
  )
}

/**
 * Une valise cabine à roulettes, corail, qui attend dans l'allée : une coque rigide à nervures, sa poignée télescopique à moitié sortie,
 * sa poignée de portage, deux roulettes, une étiquette « TYO » au bout d'un cordon. `position` : le sol sous la valise ; la face avant regarde +x +z.
 */
export function Suitcase({ position, ry = Math.PI / 4 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        <Part geo={rbox(0.5, 0.78, 0.3, 0.07)} m={A.suitcase} p={[0, 0.5, 0]} />
        {[-0.17, -0.085, 0, 0.085, 0.17].map((x) => <Part key={x} geo={rbox(0.03, 0.62, 0.012, 0.005)} m={A.suitcaseRib} p={[x, 0.5, 0.152]} castShadow={false} />)}
        <Part geo={rbox(0.44, 0.03, 0.26, 0.01)} m={A.rubber} p={[0, 0.9, 0]} castShadow={false} />
        {/* la poignée télescopique : deux tiges d'aluminium, une poignée */}
        {[-0.12, 0.12].map((x) => <Part key={x} geo={cyl(0.012, 0.012, 0.36, 8)} m={A.aluminium} p={[x, 1.07, -0.06]} castShadow={false} />)}
        <Part geo={rbox(0.3, 0.036, 0.05, 0.016)} m={A.rubber} p={[0, 1.26, -0.06]} castShadow={false} />
        {/* les roulettes et le pied */}
        {[-0.19, 0.19].map((x) => <Part key={x} geo={cyl(0.04, 0.04, 0.03, 12)} m={A.rubber} p={[x, 0.04, 0.08]} rotation-x={Math.PI / 2} rotation-z={Math.PI / 2} castShadow={false} />)}
        <Part geo={rbox(0.22, 0.02, 0.1, 0.008)} m={A.rubber} p={[0, 0.095, -0.1]} castShadow={false} />
        {/* l'étiquette : un cordon qui part de la poignée de portage */}
        <Part geo={cyl(0.004, 0.004, 0.12, 4)} m={A.strap} p={[0.2, 0.84, 0.15]} castShadow={false} />
        <mesh material={A.tag} position={[0.21, 0.74, 0.157]}>
          <planeGeometry args={[0.1, 0.05]} />
        </mesh>
      </Static>
    </group>
  )
}

/** Un sac de sport bleu, posé sur le flanc : un boudin à deux calottes, ses anses, la fermeture, une poche. `position` : le sol sous le sac. */
export function Duffel({ position, ry = 0.4 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        <Part geo={cyl(0.15, 0.15, 0.5, 20)} m={A.duffel} p={[0, 0.15, 0]} rotation-z={Math.PI / 2} />
        {[-1, 1].map((s) => <Part key={s} geo={SPH_MID} m={A.duffel} scale={[0.07, 0.15, 0.15]} p={[s * 0.25, 0.15, 0]} />)}
        <Part geo={rbox(0.5, 0.012, 0.02, 0.005)} m={A.binDark} p={[0, 0.3, 0]} castShadow={false} />
        {/* les anses : deux arceaux de sangle */}
        {[-0.1, 0.1].map((x) => (
          <Part key={x} m={A.strap} p={[x, 0.3, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.07, 0.012, 6, 14, Math.PI]} />
          </Part>
        ))}
        {/* la poche du flanc */}
        <Part geo={rbox(0.26, 0.11, 0.025, 0.012)} m={A.suitcaseRib} p={[0, 0.14, 0.15]} castShadow={false} />
        <Part geo={SPH} m={A.steel} scale={0.012} p={[0.1, 0.17, 0.168]} castShadow={false} />
      </Static>
    </group>
  )
}
