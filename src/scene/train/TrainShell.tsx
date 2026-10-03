import { Part, cyl, rbox } from '../parts'
import { holedWall } from '../walls'
import { T } from './materials'

/** La fenêtre du compartiment, large et aux coins bien ronds. */
export const PANE = { x0: -0.6, x1: 2.4, y0: 1.35, y1: 3.25 }

// Les bogies sous la caisse : centre en x, et les deux essieux de chacun.
const BOGIES = [-2.1, 2.1]

/**
 * La caisse de la voiture-lits : le socle prend la livrée bleu nuit et son filet doré, avec des roues et des tampons qui
 * dépassent ; dedans, moquette rouge et boiseries d'acajou.
 */
export function TrainShell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={T.livery} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.9, 0.05, 6.9, 0.02)} m={T.gold} p={[-0.07, -0.3, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={T.mahoganyDark} p={[-0.07, -0.12, -0.07]} />
      <mesh material={T.carpet} position={[-0.07, 0.002, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      {/* les bogies : un châssis noir, deux essieux, des roues qui dépassent sous la caisse (côté devant) */}
      {BOGIES.map((bx) => (
        <group key={bx} position={[bx, -0.8, 2.9]}>
          <Part geo={rbox(1.5, 0.2, 0.3, 0.06)} m={T.iron} p={[0, 0, 0.12]} castShadow={false} />
          {[-0.5, 0.5].map((dx) => (
            <group key={dx} position={[dx, -0.06, 0.32]} rotation-x={Math.PI / 2}>
              <Part geo={cyl(0.26, 0.26, 0.08, 28)} m={T.iron} castShadow={false} />
              <Part geo={cyl(0.12, 0.12, 0.1, 20)} m={T.gold} castShadow={false} />
            </group>
          ))}
        </group>
      ))}
      {/* un bout de voie sous les roues : le rail et ses traverses */}
      <Part geo={rbox(6.7, 0.07, 0.09, 0.02)} m={T.iron} p={[-0.07, -1.14, 3.22]} castShadow={false} />
      {Array.from({ length: 11 }, (_, i) => (
        <Part key={i} geo={rbox(0.22, 0.07, 0.55, 0.03)} m={T.mahoganyDark} p={[-3.1 + i * 0.6, -1.21, 3.22]} castShadow={false} />
      ))}
      {/* les tampons, au bout de la voiture */}
      {[-1.6, 1.6].map((z) => (
        <group key={z} position={[3.42, -0.45, z]} rotation-z={Math.PI / 2}>
          <Part geo={cyl(0.06, 0.06, 0.2, 12)} m={T.iron} castShadow={false} />
          <Part geo={cyl(0.16, 0.16, 0.05, 20)} m={T.iron} p={[0, -0.12, 0]} castShadow={false} />
        </group>
      ))}
      <Part geo={holedWall([{ ...PANE, r: 0.32 }])} m={T.wall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={T.mahoganyDark} p={[-3.17, 2.125, -0.07]} />
      <mesh material={T.panels} position={[-2.995, 2.125, -0.07]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.44, 4.25]} />
      </mesh>
      {/* plinthes */}
      <Part geo={rbox(0.05, 0.12, 6.3, 0.02)} m={T.mahogany} p={[-2.97, 0.06, -0.07]} castShadow={false} />
      <Part geo={rbox(6.3, 0.12, 0.05, 0.02)} m={T.mahogany} p={[-0.07, 0.06, -2.97]} castShadow={false} />
    </>
  )
}
