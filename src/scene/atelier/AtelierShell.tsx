import { Part, rbox } from '../parts'
import { holedWall } from '../walls'
import { A } from './materials'

/** La verrière d'atelier : une grande baie à petits carreaux d'acier noir. */
export const BAY = { x0: -1.3, x1: 2.9, y0: 0.55, y1: 4.0 }
const COLS = 8, ROWS = 6

/** Socle de pierre de taille (le haut d'un immeuble parisien) et sa corniche de zinc, parquet, murs enduits, la verrière. */
export function AtelierShell() {
  const { x0, x1, y0, y1 } = BAY, w = x1 - x0, h = y1 - y0
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={A.stone} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.98, 0.1, 6.98, 0.04)} m={A.zinc} p={[-0.07, -0.19, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={A.slab} p={[-0.07, -0.12, -0.07]} />
      <mesh material={A.floor} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      <Part geo={holedWall([{ ...BAY, r: 0.05 }])} m={A.wall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={A.white} p={[-3.17, 2.125, -0.07]} />
      <mesh material={A.plaster} position={[-2.995, 2.125, -0.07]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.44, 4.25]} />
      </mesh>
      {/* la grille d'acier de la verrière */}
      <group position={[x0, y0, -3.07]}>
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <Part key={`c${i}`} geo={rbox(i % COLS ? 0.035 : 0.08, h, 0.06, 0.012)} m={A.steel} p={[(i * w) / COLS, h / 2, 0]} castShadow={false} />
        ))}
        {Array.from({ length: ROWS + 1 }, (_, j) => (
          <Part key={`r${j}`} geo={rbox(w, j % ROWS ? 0.035 : 0.08, 0.06, 0.012)} m={A.steel} p={[w / 2, (j * h) / ROWS, 0]} castShadow={false} />
        ))}
        <mesh material={A.glass} position={[w / 2, h / 2, -0.02]}>
          <planeGeometry args={[w, h]} />
        </mesh>
      </group>
      {/* l'appui de la verrière, et les plinthes */}
      <Part geo={rbox(w + 0.2, 0.08, 0.36, 0.03)} m={A.oak} p={[(x0 + x1) / 2, y0 - 0.02, -2.9]} />
      <Part geo={rbox(0.05, 0.14, 6.3, 0.02)} m={A.white} p={[-2.97, 0.07, -0.07]} castShadow={false} />
      <Part geo={rbox(6.3, 0.14, 0.05, 0.02)} m={A.white} p={[-0.07, 0.07, -2.97]} castShadow={false} />
    </>
  )
}
