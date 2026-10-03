import { Part, SPH, WIN, cyl, rbox } from '../parts'
import { backWall } from '../objects/Shell'
import { C } from './materials'

// Les rangs de rondins : 15 rangs de 0.293, comme la texture des murs.
const ROWS = Array.from({ length: 15 }, (_, i) => 0.1 + i * (4.4 / 15))
const R = 0.15

/**
 * Bouts de rondins qui dépassent aux angles, comme dans un vrai chalet : au coin du fond à gauche ils se croisent, aux deux
 * autres bouts de murs ils dépassent tout droit.
 */
function LogEnds() {
  return (
    <>
      {ROWS.map((y, i) => (
        <group key={y}>
          {/* coin du fond : un rang sur deux dans chaque sens */}
          {i % 2 ? (
            <Part geo={cyl(R, R, 0.7, 12)} m={C.logEnd} p={[-3.42, y, -3.26]} rotation-z={Math.PI / 2} />
          ) : (
            <Part geo={cyl(R, R, 0.7, 12)} m={C.logEnd} p={[-3.17, y, -3.5]} rotation-x={Math.PI / 2} />
          )}
          {/* bout du mur du fond, à droite, et bout du mur de gauche, devant */}
          <Part geo={cyl(R, R, 0.36, 12)} m={C.logEnd} p={[3.3, y, -3.16]} rotation-z={Math.PI / 2} />
          <Part geo={cyl(R, R, 0.36, 12)} m={C.logEnd} p={[-3.17, y, 3.22]} rotation-x={Math.PI / 2} />
        </group>
      ))}
    </>
  )
}

// Des bosses de neige le long du haut des murs : [x, z, taille].
const SNOW_BACK = Array.from({ length: 14 }, (_, i) => [-3.3 + i * 0.5, -3.16, 0.28 + (i % 3) * 0.06] as const)
const SNOW_LEFT = Array.from({ length: 14 }, (_, i) => [-3.17, -3.2 + i * 0.5, 0.28 + ((i + 1) % 3) * 0.06] as const)
const ICICLES = [-2.6, -1.9, -0.7, 0.1, 0.9, 1.6, 2.4, 2.9].map((x, i) => [x, 0.12 + (i % 3) * 0.08] as const)

/** La neige sur les murs, sur le bord du socle, des glaçons au bord du toit et un petit tas sur l'appui de la fenêtre dehors. */
function Snow() {
  return (
    <>
      {[...SNOW_BACK, ...SNOW_LEFT].map(([x, z, s], i) => (
        <Part key={i} geo={SPH} m={C.snowCap} scale={[s * 1.3, s * 0.55, s * 1.1]} p={[x, 4.38, z]} castShadow={false} />
      ))}
      <Part geo={rbox(6.7, 0.12, 0.5, 0.06)} m={C.snowCap} p={[-0.07, 4.36, -3.16]} castShadow={false} />
      <Part geo={rbox(0.5, 0.12, 6.7, 0.06)} m={C.snowCap} p={[-3.17, 4.36, -0.07]} castShadow={false} />
      {ICICLES.map(([x, h], i) => (
        <Part key={i} m={C.ice} p={[x, 4.2 - h / 2, -3.42]} rotation-x={Math.PI} castShadow={false}>
          <coneGeometry args={[0.035, h, 6]} />
        </Part>
      ))}
      {/* congères sur le bord du socle, devant et à droite */}
      {Array.from({ length: 9 }, (_, i) => (
        <Part key={`f${i}`} geo={SPH} m={C.snowCap} scale={[0.5, 0.12, 0.3]} p={[-3.0 + i * 0.75, -0.17, 3.32]} castShadow={false} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Part key={`r${i}`} geo={SPH} m={C.snowCap} scale={[0.3, 0.12, 0.5]} p={[3.32, -0.17, -3.0 + i * 0.75]} castShadow={false} />
      ))}
      <Part geo={SPH} m={C.snowCap} scale={[1.25, 0.08, 0.16]} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 + 0.02, -3.38]} castShadow={false} />
    </>
  )
}

/** Socle sous la neige, plancher de larges lames, murs de rondins, bouts de rondins aux angles, neige sur le toit. */
export function CabinShell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={C.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={C.floor} p={[-0.07, -0.12, -0.07]} />
      <Part geo={backWall} m={C.logWall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={C.beam} p={[-3.17, 2.125, -0.07]} />
      <mesh material={C.logWallLeft} rotation-y={Math.PI / 2} position={[-2.995, 2.125, -0.07]} receiveShadow>
        <planeGeometry args={[6.44, 4.25]} />
      </mesh>
      <LogEnds />
      <Snow />
      {/* l'appui de la fenêtre, en bois brut, et le cadre de rondins autour */}
      <Part geo={rbox(2.7, 0.12, 0.34, 0.04)} m={C.beamDark} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.04, -2.9]} />
      <Part geo={rbox(2.75, 0.14, 0.12, 0.05)} m={C.beamDark} p={[(WIN.x0 + WIN.x1) / 2, WIN.y1 + 0.1, -2.98]} />
      {/* une plinthe de rondin le long des murs */}
      <Part geo={cyl(0.08, 0.08, 6.3, 10)} m={C.logBark} p={[-2.95, 0.08, -0.07]} rotation-x={Math.PI / 2} />
      <Part geo={cyl(0.08, 0.08, 6.3, 10)} m={C.logBark} p={[-0.07, 0.08, -2.95]} rotation-z={Math.PI / 2} />
      {/* une poutre maîtresse en haut du mur de gauche */}
      <Part geo={rbox(0.24, 0.26, 6.5, 0.06)} m={C.beamDark} p={[-2.9, 4.05, -0.07]} />
      <Part geo={rbox(6.5, 0.26, 0.24, 0.06)} m={C.beamDark} p={[-0.07, 4.05, -2.9]} />
    </>
  )
}
