import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Vessel } from '../igloo/Vessel'
import { Steam } from '../objects/Steam'
import { Part, SPH_MID, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { ROW_X, SEAT_Z } from './layout'

/** Le dessus d'une tablette rabattue. */
export const TY = 0.995
const TABLE_X = 0.55 // le centre de la tablette devant le siège

/**
 * Une tablette de siège rabattue au-dessus des genoux : un plateau arrondi gris perle à rebord d'aluminium, un creux rond pour le gobelet,
 * un bras qui part de l'accoudoir côté allée. `position` : le centre du siège, au sol.
 */
export function TrayTable({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={rbox(0.6, 0.03, 0.76, 0.025)} m={A.table} p={[TABLE_X, TY - 0.015, 0]} />
      <Part geo={rbox(0.025, 0.04, 0.76, 0.01)} m={A.tableEdge} p={[TABLE_X + 0.3, TY - 0.012, 0]} castShadow={false} />
      <Part geo={cyl(0.05, 0.05, 0.008, 18)} m={A.tableEdge} p={[TABLE_X - 0.18, TY + 0.004, -0.27]} castShadow={false} />
      {/* le bras : un montant qui sort de l'accoudoir, une barre sous le plateau, une charnière */}
      <Part geo={cyl(0.02, 0.02, 0.22, 10)} m={A.aluminium} p={[0.24, 0.88, 0.42]} castShadow={false} />
      <Part geo={rbox(0.36, 0.028, 0.05, 0.01)} m={A.aluminium} p={[0.4, TY - 0.044, 0.34]} castShadow={false} />
      <Part geo={cyl(0.026, 0.026, 0.05, 10)} m={A.aluminium} p={[0.24, TY - 0.044, 0.38]} rotation-x={Math.PI / 2} castShadow={false} />
    </group>
  )
}

/** La tablette tactile posée à plat avec la carte du vol, l'avion qui avance sur l'arc (très lentement). `position` : le dessus du plateau. */
export function Tablet({ position, ry = 0.28 }: { position: V3; ry?: number }) {
  const plane = useRef<Group>(null!)
  useFrame(({ clock }) => {
    // l'avion suit l'arc en pointillés de la carte (la courbe de Bézier de `mapTex`), de la gauche vers la droite, en deux heures
    const t = (clock.elapsedTime * 0.004) % 1, u = 1 - t
    const mx = u * u * 110 + 2 * u * t * 256 + t * t * 410, my = u * u * 200 + 2 * u * t * 20 + t * t * 160
    const dx = 2 * u * (256 - 110) + 2 * t * (410 - 256), dy = 2 * u * (20 - 200) + 2 * t * (160 - 20)
    plane.current.position.set((mx / 512 - 0.5) * 0.3, 0.0345, (my / 384 - 0.5) * 0.22)
    plane.current.rotation.y = -Math.atan2(dy, dx) + Math.PI / 2
  })
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        <Part geo={rbox(0.38, 0.016, 0.285, 0.014)} m={A.folio} p={[0.01, 0.008, 0.008]} />
        <Part geo={rbox(0.35, 0.016, 0.26, 0.012)} m={A.tablet} p={[0, 0.02, 0]} />
        <mesh material={A.screen} position={[0, 0.0335, 0]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.3, 0.225]} />
        </mesh>
        <Part geo={cyl(0.006, 0.006, 0.004, 10)} m={A.steel} p={[0.168, 0.031, 0]} castShadow={false} />
      </Static>
      {/* l'avion : un point, deux ailes, la queue */}
      <group ref={plane} position={[0, 0.0345, 0]}>
        <mesh material={A.planeIcon} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.012, 0.03]} />
        </mesh>
        <mesh material={A.planeIcon} rotation-x={-Math.PI / 2} position={[0, 0, 0.002]}>
          <planeGeometry args={[0.034, 0.008]} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Le plateau du repas, devant le siège du couloir de la rangée 2 : un plateau crème, un plat chaud sous son opercule d'aluminium à demi
 * levé (du riz, des tomates), une salade dans sa barquette, un pain rond et son beurre, une crème dessert, une tasse de thé qui fume
 * (le sachet pend), un gobelet d'eau, une serviette roulée avec ses couverts. `position` : le centre du siège, au sol.
 */
export function MealTray({ position }: { position: V3 }) {
  return (
    <group position={[position[0] + TABLE_X, TY, position[2]]}>
      <Static>
        <Part geo={rbox(0.52, 0.03, 0.7, 0.012)} m={A.table} p={[0, 0.015, 0]} castShadow={false} />
        <mesh material={A.tray} position={[0, 0.0365, 0]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.5, 0.68]} />
        </mesh>
        <group position={[0, 0.012, 0]}>
        {/* le plat chaud : une barquette d'aluminium, son opercule relevé, du riz et trois tomates */}
        <group position={[-0.06, 0.024, -0.2]}>
          <Part geo={rbox(0.2, 0.045, 0.17, 0.02)} m={A.foil} p={[0, 0.0225, 0]} />
          <Part geo={rbox(0.215, 0.008, 0.185, 0.003)} m={A.foilDark} p={[0, 0.047, 0]} castShadow={false} />
          <Part geo={SPH_MID} m={A.pudding} scale={[0.082, 0.032, 0.066]} p={[0, 0.05, 0]} />
          {[[-0.03, 0.03], [0.025, -0.01], [0.0, 0.04]].map(([x, z], i) => <Part key={i} geo={SPH_MID} m={A.tomato} scale={0.016} p={[x, 0.074, z]} castShadow={false} />)}
          <Part geo={rbox(0.2, 0.006, 0.17, 0.003)} m={A.foilDark} p={[0, 0.1, -0.1]} rotation-x={-1.1} castShadow={false} />
        </group>
        {/* la salade : une barquette transparente, des feuilles et une tomate cerise */}
        <group position={[-0.14, 0.024, 0.15]}>
          <Part geo={cyl(0.08, 0.06, 0.05, 20)} m={A.plastic} p={[0, 0.025, 0]} castShadow={false} />
          {[[0, 0.1, 0.02], [-0.03, 0.12, 0.03], [0.03, 0.12, 0.02]].map(([x, y, s], i) => <Part key={i} geo={SPH_MID} m={A.salad} scale={[0.035, 0.022, 0.03]} p={[x, 0.04 + (y - 0.1), s * 0.5]} castShadow={false} />)}
          <Part geo={SPH_MID} m={A.tomato} scale={0.015} p={[0.01, 0.062, -0.01]} castShadow={false} />
        </group>
        {/* le pain et le beurre */}
        <Part geo={SPH_MID} m={A.bread} scale={[0.065, 0.033, 0.05]} p={[0.14, 0.04, 0.22]} />
        <Part geo={rbox(0.045, 0.012, 0.035, 0.005)} m={A.butter} p={[0.15, 0.03, 0.12]} rotation-y={0.4} castShadow={false} />
        {/* la crème dessert : un gobelet, son dôme crème */}
        <Part geo={cyl(0.046, 0.036, 0.055, 18)} m={A.plastic} p={[0.17, 0.052, -0.06]} castShadow={false} />
        <Part geo={cyl(0.04, 0.04, 0.022, 18)} m={A.pudding} p={[0.17, 0.05, -0.06]} castShadow={false} />
        <Part geo={SPH_MID} m={A.cream} scale={[0.04, 0.02, 0.04]} p={[0.17, 0.086, -0.06]} castShadow={false} />
        {/* la serviette roulée et ses couverts : on voit dépasser un manche de fourchette et de couteau */}
        <group position={[0.17, 0.034, 0.0]} rotation-y={0.1}>
          <Part geo={cyl(0.03, 0.03, 0.24, 14)} m={A.napkin} rotation-z={Math.PI / 2} rotation-x={0} castShadow={false} />
        </group>
        <Part geo={rbox(0.05, 0.006, 0.014, 0.003)} m={A.steel} p={[0.165, 0.06, 0.12]} rotation-y={0.5} castShadow={false} />
        {/* le gobelet d'eau */}
        <Part geo={cyl(0.04, 0.032, 0.09, 16)} m={A.plastic} p={[-0.17, 0.069, -0.02]} castShadow={false} />
        <Part geo={cyl(0.034, 0.034, 0.05, 16)} m={A.bottle} p={[-0.17, 0.052, -0.02]} castShadow={false} />
        {/* la tasse de thé sur sa soucoupe, le sachet qui pend, sa languette */}
        <Part geo={cyl(0.075, 0.07, 0.01, 22)} m={A.ceramic} p={[0.1, 0.027, -0.21]} castShadow={false} />
        <Vessel p={[0.1, 0.032, -0.21]} rt={0.052} rb={0.04} h={0.07} m={A.ceramic} inner={A.ceramic} rim={A.ceramic} />
        <Part geo={cyl(0.044, 0.044, 0.004, 18)} m={A.tea} p={[0.1, 0.092, -0.21]} castShadow={false} />
        <Part geo={cyl(0.002, 0.002, 0.07, 4)} m={A.napkin} p={[0.14, 0.085, -0.21]} rotation-z={0.9} castShadow={false} />
        <Part geo={rbox(0.025, 0.003, 0.02, 0.001)} m={A.butter} p={[0.16, 0.058, -0.21]} castShadow={false} />
        </group>
      </Static>
      <Steam at={[0.1, 0.115, -0.21]} every={1.1} />
    </group>
  )
}

/** Les sièges qui portent une tablette rabattue : ceux du milieu et du couloir de la rangée 2. */
export const TABLE_SEATS: V3[] = [[ROW_X[1], 0, SEAT_Z.B], [ROW_X[1], 0, SEAT_Z.C]]
