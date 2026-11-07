import { Part, cyl, rbox } from '../parts'
import { holedWall } from '../walls'
import { T } from './materials'
import { Bogie } from './Bogie'

/** La fenêtre du compartiment, large et aux coins bien ronds. */
export const PANE = { x0: -0.6, x1: 2.4, y0: 1.35, y1: 3.25 }

/**
 * Les bogies aux deux bouts de la caisse (centre en x) : celui de l'avant (+x) se voit sous le bout de la voiture, ses roues
 * tournent ; celui de l'arrière est caché par la voiture suivante, il reste immobile (aucun tracé en plus).
 */
export const BOGIES = [-2.6, 2.45]
/** Les deux files de rails, centrées sous la voiture (écartement à l'échelle de la caisse : deux fois moins large qu'elle). */
export const RAILS = [1.63, -1.77]
/** La vitesse du train (m/s) : la voie défile (`out/Line.tsx`) et les roues tournent à la même vitesse. */
export const SPEED = 1.6
const WHEELS = { iron: T.iron, steel: T.steel, gold: T.gold }

/**
 * La caisse de la voiture-lits : le socle prend la livrée bleu nuit et son filet doré, avec des roues et des tampons qui
 * dépassent ; dedans, moquette rouge et boiseries d'acajou.
 */
export function TrainShell() {
  return (
    <>
      {/* la caisse s'arrête à -0,42 : dessous, au bout de la voiture, on voit les roues du bogie et la voie */}
      <Part geo={rbox(6.86, 0.255, 6.86, 0.11)} m={T.livery} p={[-0.07, -0.2925, -0.07]} />
      <Part geo={rbox(6.9, 0.05, 6.9, 0.02)} m={T.gold} p={[-0.07, -0.3, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={T.mahoganyDark} p={[-0.07, -0.12, -0.07]} />
      <mesh material={T.carpet} position={[-0.07, 0.002, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      {/* les bogies sur les deux files de rails */}
      {BOGIES.map((bx) => <Bogie key={bx} x={bx} rails={RAILS} m={WHEELS} spin={bx > 0} speed={SPEED} />)}
      {/* les tampons, au bout de la voiture, plus écartés que les rails : ils ne cachent pas les roues */}
      {[-2.47, 2.33].map((z) => (
        <group key={z} position={[3.42, -0.3, z]} rotation-z={Math.PI / 2}>
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
