import { Part, rbox } from '../parts'
import { holedWall } from '../walls'
import { B } from './materials'

/** La grande porte qui donne sur la terrasse et la plage. */
export const DOOR = { x0: -0.5, x1: 2.75, y0: 0.06, y1: 3.55 }

/** Socle de sable, plancher blanchi, murs de lambris, et le chambranle de la grande porte. */
export function BeachShell() {
  const { x0, x1, y0, y1 } = DOOR
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={B.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={B.slab} p={[-0.07, -0.12, -0.07]} />
      <mesh material={B.floor} position={[-0.07, 0.002, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.44, 6.44]} />
      </mesh>
      <Part geo={holedWall([{ ...DOOR, r: 0.12 }])} m={B.wall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={B.trim} p={[-3.17, 2.125, -0.07]} />
      <mesh material={B.boards} position={[-2.995, 2.125, -0.07]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.44, 4.25]} />
      </mesh>
      {/* chambranle et seuil */}
      {[x0 - 0.06, x1 + 0.06].map((x) => (
        <Part key={x} geo={rbox(0.14, y1 - y0 + 0.12, 0.42, 0.04)} m={B.trim} p={[x, (y0 + y1) / 2 + 0.03, -3.12]} />
      ))}
      <Part geo={rbox(x1 - x0 + 0.26, 0.16, 0.42, 0.05)} m={B.trim} p={[(x0 + x1) / 2, y1 + 0.06, -3.12]} />
      <Part geo={rbox(x1 - x0, 0.05, 0.5, 0.02)} m={B.driftwood} p={[(x0 + x1) / 2, 0.03, -3.13]} />
      {/* plinthe le long du mur de gauche */}
      <Part geo={rbox(0.05, 0.14, 6.3, 0.02)} m={B.trim} p={[-2.97, 0.07, -0.07]} castShadow={false} />
    </>
  )
}
