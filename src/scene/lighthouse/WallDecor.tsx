import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Garment } from '../objects/Garment'
import { L } from './materials'
import { shipPainting } from './textures'

/** Une botte de marin : tige, pied, semelle crantée. */
function Boot({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <Part geo={cyl(0.075, 0.085, 0.36, 14)} m={L.boot} p={[0, 0.2, -0.04]} />
      <Part geo={rbox(0.17, 0.12, 0.32, 0.05)} m={L.boot} p={[0, 0.08, 0.06]} />
      <Part geo={rbox(0.185, 0.04, 0.34, 0.02)} m={L.sole} p={[0, 0.02, 0.06]} castShadow={false} />
      <Part geo={cyl(0.082, 0.082, 0.025, 14)} m={L.red} p={[0, 0.375, -0.04]} castShadow={false} />
    </group>
  )
}

/**
 * Le décor des murs et du sol, autour des objets qui sonnent : une bouée de sauvetage, le plan du phare, une étagère de mugs
 * et de laiton, l'ciré du gardien et son suroît sur la paroi, une ancre, des bottes qui sèchent devant le poêle.
 */
export function WallDecor() {
  return (
    <>
      {/* la bouée de sauvetage, à droite du hublot, avec sa ligne de vie */}
      <group position={[2.7, 3.05, -2.94]}>
        <Part m={L.buoy}>
          <torusGeometry args={[0.3, 0.095, 14, 36]} />
        </Part>
        <Part m={L.rope} p={[0, 0, 0.02]} castShadow={false}>
          <torusGeometry args={[0.4, 0.012, 6, 36]} />
        </Part>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * TAU + Math.PI / 4
          return <Part key={i} geo={SPH} m={L.ropeDark} scale={0.02} p={[Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0.03]} castShadow={false} />
        })}
        <Part geo={cyl(0.02, 0.02, 0.1, 6)} m={L.iron} p={[0, 0.5, -0.02]} castShadow={false} />
      </group>
      {/* la barre à roue d'un vieux voilier, au-dessus du hublot : jante, moyeu, huit manetons */}
      <group position={[1.35, 4.0, -2.95]}>
        <Part m={L.oak}>
          <torusGeometry args={[0.3, 0.032, 10, 36]} />
        </Part>
        <Part geo={cyl(0.07, 0.07, 0.07, 16)} m={L.brass} rotation-x={Math.PI / 2} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * TAU
          return (
            <group key={i} rotation-z={a}>
              <Part geo={cyl(0.014, 0.014, 0.52, 6)} m={L.oakDark} p={[0, 0.3, 0]} castShadow={false} />
              <Part geo={SPH} m={L.oak} scale={[0.026, 0.05, 0.026]} p={[0, 0.58, 0]} castShadow={false} />
            </group>
          )
        })}
        <Part geo={cyl(0.012, 0.012, 0.1, 6)} m={L.iron} p={[0, 0, -0.06]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
      {/* le plan du phare, sous verre, dans un cadre de chêne */}
      <group position={[-1.5, 2.85, -2.96]}>
        <Part geo={rbox(0.6, 0.86, 0.045, 0.02)} m={L.oakDark} />
        <mesh material={L.plan} position={[0, 0, 0.025]}>
          <planeGeometry args={[0.5, 0.76]} />
        </mesh>
      </group>
      {/* l'étagère au-dessus de la table : mugs, lanterne, une longue-vue de laiton */}
      <group position={[-0.55, 2.05, -2.85]}>
        <Part geo={rbox(1.5, 0.05, 0.3, 0.02)} m={L.oak} />
        {[-0.6, 0.6].map((x) => (
          <Part key={x} geo={rbox(0.05, 0.22, 0.22, 0.015)} m={L.oakDark} p={[x, -0.13, -0.02]} castShadow={false} />
        ))}
        {[[-0.55, L.mugBlue], [-0.42, L.mug], [-0.29, L.mugBlue]].map(([x, m], i) => (
          <Part key={i} geo={cyl(0.04, 0.036, 0.09, 12)} m={m as typeof L.mug} p={[x as number, 0.07, 0.02]} />
        ))}
        <Part geo={cyl(0.026, 0.026, 0.5, 10)} m={L.brass} p={[0.15, 0.05, 0.02]} rotation-z={Math.PI / 2} />
        <Part geo={cyl(0.032, 0.032, 0.14, 10)} m={L.leather} p={[0.34, 0.05, 0.02]} rotation-z={Math.PI / 2} />
        <Part geo={cyl(0.042, 0.042, 0.06, 10)} m={L.brassDull} p={[-0.1, 0.05, 0.02]} rotation-z={Math.PI / 2} castShadow={false} />
        {[0.5, 0.58].map((x, i) => (
          <Part key={x} geo={rbox(0.07, 0.19 - i * 0.03, 0.2, 0.01)} m={i ? L.red : L.navy} p={[x, 0.12 - i * 0.015, 0]} />
        ))}
      </group>
      {/* l'ciré jaune et le suroît du gardien, pendus à la paroi de gauche, près de l'angle */}
      <group position={[-2.93, 0, -1.0]}>
        <Part geo={rbox(0.05, 0.05, 0.5, 0.015)} m={L.oakDark} p={[0, 2.78, 0]} castShadow={false} />
        <Garment kind="coat" p={[0.1, 2.75, 0]} r={[0, Math.PI / 2, 0]} s={1.35} m={L.oilskin}>
          <Part geo={rbox(0.1, 0.12, 0.012, 0.01)} m={L.oilskinDark} p={[-0.08, -0.55, 0.055]} castShadow={false} />
          <Part geo={rbox(0.1, 0.12, 0.012, 0.01)} m={L.oilskinDark} p={[0.08, -0.55, 0.055]} castShadow={false} />
          {[-0.16, -0.3, -0.44].map((y) => (
            <Part key={y} geo={cyl(0.012, 0.012, 0.01, 8)} m={L.brass} p={[0, y, 0.056]} rotation-x={Math.PI / 2} castShadow={false} />
          ))}
        </Garment>
        <Part geo={SPH} m={L.oilskin} scale={[0.15, 0.09, 0.15]} p={[0.08, 2.98, 0.22]} castShadow={false} />
        <Part geo={cyl(0.2, 0.2, 0.012, 24)} m={L.oilskinDark} p={[0.08, 2.92, 0.22]} castShadow={false} />
      </group>
      {/* une ancre appuyée au mur : fût, jas, bras courbes, organeau */}
      <group position={[-2.72, 0, -0.35]} rotation-z={-0.08}>
        <Part geo={cyl(0.03, 0.035, 1.15, 8)} m={L.iron} p={[0, 0.62, 0]} />
        <Part geo={cyl(0.022, 0.022, 0.5, 8)} m={L.iron} p={[0, 1.08, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part m={L.iron} p={[0, 0.1, 0]}>
          <torusGeometry args={[0.28, 0.03, 8, 22, Math.PI]} />
        </Part>
        <Part m={L.ironLight} p={[0, 1.2, 0]} castShadow={false}>
          <torusGeometry args={[0.06, 0.014, 6, 16]} />
        </Part>
      </group>
      {/* un tableau de navire sous voiles, sur la paroi de gauche, au-dessus de l'ancre */}
      <group position={[-2.96, 3.35, -0.05]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(0.95, 0.66, 0.05, 0.02)} m={L.oakDark} />
        <mesh position={[0, 0, 0.028]}>
          <planeGeometry args={[0.82, 0.54]} />
          <meshBasicMaterial map={shipPainting} />
        </mesh>
      </group>
      {/* les bottes qui sèchent devant le poêle */}
      <Boot position={[-1.55, 0, -1.7]} rotation={0.5} />
      <Boot position={[-1.35, 0, -1.55]} rotation={0.9} />
    </>
  )
}
