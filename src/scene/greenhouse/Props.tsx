import { Part, SPH, cyl, noRay, rbox, worldUV, type V3 } from '../parts'
import { Fern } from '../nature/Fern'
import { Rosette } from '../nature/Rosette'
import { Leaf } from '../nature/Leaf'
import { G } from './materials'
import { Pot, Orchid, Succulents } from './Plants'

/**
 * La paillasse de rempotage le long du mur du fond : un plateau de planches, deux tréteaux, une étagère basse de pots en pile, un
 * sac de terreau éventré, une pelle, un plantoir, un arrosoir de laiton, un plateau de semis étiquetés et un pot qu'on rempote.
 * `position` est le milieu du pied de la paillasse, face à +z.
 */
export function PottingBench({ position }: { position: V3 }) {
  const top = 0.86
  return (
    <group position={position}>
      <Part geo={worldUV(rbox(1.7, 0.06, 0.62, 0.02), 1)} m={G.wood} p={[0, top, 0]} />
      <Part geo={rbox(1.74, 0.03, 0.1, 0.012)} m={G.woodDark} p={[0, top - 0.06, 0.26]} castShadow={false} />
      {[-0.78, 0.78].map((x) => (
        <group key={x}>
          <Part geo={rbox(0.07, top, 0.07, 0.02)} m={G.woodDark} p={[x, top / 2, 0.25]} />
          <Part geo={rbox(0.07, top, 0.07, 0.02)} m={G.woodDark} p={[x, top / 2, -0.25]} />
          <Part geo={rbox(0.05, 0.05, 0.56, 0.015)} m={G.woodDark} p={[x, 0.2, 0]} castShadow={false} />
        </group>
      ))}
      <Part geo={worldUV(rbox(1.6, 0.04, 0.52, 0.015), 1)} m={G.wood} p={[0, 0.22, 0]} />
      {/* sous la paillasse : des piles de pots, un sac de terreau */}
      {[-0.55, -0.3, 0.2].map((x, i) => (
        <group key={x}>
          {[0, 1, 2].map((k) => <Part key={k} geo={cyl(0.12 - k * 0.0, 0.09, 0.1, 16)} m={G.terracotta} p={[x, 0.26 + k * 0.1 + (i % 2) * 0, -0.05]} rotation-z={0} castShadow={false} />)}
        </group>
      ))}
      <Part geo={rbox(0.36, 0.28, 0.2, 0.06)} m={G.cushion} p={[0.55, 0.38, -0.02]} rotation-y={0.2} />
      <Part geo={rbox(0.3, 0.02, 0.14, 0.01)} m={G.soil} p={[0.55, 0.53, -0.02]} rotation-y={0.2} castShadow={false} />
      {/* sur le plateau : un pot en cours de rempotage, la pelle, le plantoir */}
      <Pot p={[-0.55, top + 0.03, -0.05]} r={0.12} h={0.18} />
      <Fern p={[-0.55, top + 0.2, -0.05]} size={0.3} n={7} m={G.fernM} m2={G.leafLight} />
      <Part geo={rbox(0.18, 0.012, 0.1, 0.005)} m={G.soil} p={[-0.2, top + 0.036, 0.05]} rotation-y={0.4} castShadow={false} />
      <Part geo={cyl(0.007, 0.007, 0.16, 6)} m={G.woodDark} p={[-0.1, top + 0.05, 0.18]} rotation-z={Math.PI / 2} rotation-y={0.2} castShadow={false} />
      <Part geo={rbox(0.07, 0.012, 0.05, 0.005)} m={G.steel} p={[-0.2, top + 0.04, 0.19]} rotation-y={0.2} castShadow={false} />
      {/* le plateau de semis : douze alvéoles, pousses minuscules, étiquettes */}
      <Part geo={rbox(0.42, 0.03, 0.28, 0.01)} m={G.woodDark} p={[0.15, top + 0.045, -0.08]} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 0.15 - 0.15 + (i % 4) * 0.095 - 0.14 + 0.14, z = -0.08 + (Math.floor(i / 4) - 1) * 0.08
        return (
          <group key={i} position={[x + 0.01, top + 0.065, z]}>
            <Part geo={cyl(0.035, 0.03, 0.03, 8)} m={G.soil} castShadow={false} />
            <Part geo={SPH} m={G.leafLight} scale={[0.02, 0.012, 0.02]} p={[0, 0.02, 0]} castShadow={false} />
          </group>
        )
      })}
      <Part geo={rbox(0.045, 0.045, 0.004, 0.002)} m={G.label} p={[0.32, top + 0.1, 0.1]} rotation-y={0.2} castShadow={false} />
      {/* l'arrosoir de laiton : corps, pomme, bec, anse */}
      <group position={[0.6, top + 0.03, 0.1]} rotation-y={-0.5}>
        <Part geo={cyl(0.07, 0.08, 0.13, 16)} m={G.horn} p={[0, 0.07, 0]} />
        <Part geo={cyl(0.012, 0.012, 0.22, 8)} m={G.horn} p={[0.14, 0.12, 0]} rotation-z={-0.7} castShadow={false} />
        <Part m={G.horn} p={[0.23, 0.2, 0]} castShadow={false}>
          <coneGeometry args={[0.03, 0.04, 10]} />
        </Part>
        <Part m={G.horn} p={[-0.06, 0.13, 0]} rotation-z={0.2} rotation-x={0} castShadow={false}>
          <torusGeometry args={[0.055, 0.01, 6, 14, Math.PI]} />
        </Part>
      </group>
      {/* l'étagère haute au mur : des pots d'aromatiques et des orchidées */}
      <Part geo={rbox(1.5, 0.04, 0.22, 0.012)} m={G.woodDark} p={[0, 1.7, -0.2]} />
      {[-0.55, 0.55].map((x) => <Part key={x} geo={rbox(0.04, 0.2, 0.2, 0.01)} m={G.woodDark} p={[x, 1.6, -0.2]} castShadow={false} />)}
      <Orchid position={[-0.5, 1.72, -0.2]} />
      <Orchid position={[0.05, 1.72, -0.2]} pink={false} />
      <Succulents position={[0.45, 1.72, -0.2]} />
    </group>
  )
}

/** Un présentoir à trois gradins de pots fleuris contre le mur de gauche. `position` est le milieu du pied, face à +x. */
export function PlantStand({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <group key={i}>
          <Part geo={worldUV(rbox(0.5 - i * 0.12, 0.04, 1.4, 0.015), 1)} m={G.wood} p={[i * 0.12, 0.3 + i * 0.4, 0]} />
          {[-1, 1].map((s) => <Part key={s} geo={rbox(0.05, 0.3 + i * 0.4, 0.05, 0.015)} m={G.woodDark} p={[i * 0.12 + 0.18, (0.3 + i * 0.4) / 2, s * 0.64]} castShadow={false} />)}
        </group>
      ))}
      {[-0.5, -0.1, 0.3, 0.6].map((z, k) => <Pot key={`a${k}`} p={[0, 0.32, z]} r={0.1} h={0.14} />)}
      {[-0.35, 0.15, 0.5].map((z, k) => <Pot key={`b${k}`} p={[0.12, 0.72, z]} r={0.09} h={0.12} />)}
      {[-0.4, 0.2].map((z, k) => <Pot key={`c${k}`} p={[0.24, 1.12, z]} r={0.08} h={0.11} />)}
      {[-0.5, -0.1, 0.3, 0.6].map((z, k) => <Rosette key={`ra${k}`} p={[0, 0.5, z]} size={0.11} n={10} kind="round" m={G.leafLight} m2={G.leaf} />)}
      {[-0.35, 0.15, 0.5].map((z, k) => <Orchid key={`o${k}`} position={[0.12, 0.84, z]} pink={k % 2 === 0} />)}
      {[-0.4, 0.2].map((z, k) => <Fern key={`f${k}`} p={[0.24, 1.23, z]} size={0.28} n={7} m={G.fernM} m2={G.leafLight} />)}
    </group>
  )
}

/** Un fauteuil d'osier à haut dossier arrondi, un coussin crème, un plaid vert plié sur l'accoudoir. `position` est le sol, face à +z. */
export function WickerChair({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={rbox(0.62, 0.1, 0.58, 0.04)} m={G.wicker} p={[0, 0.4, 0]} />
      {[[-0.27, 0.25], [0.27, 0.25], [-0.27, -0.25], [0.27, -0.25]].map(([x, z]) => <Part key={`${x}${z}`} geo={cyl(0.03, 0.025, 0.36, 8)} m={G.wicker} p={[x, 0.18, z]} castShadow={false} />)}
      {/* le dossier : un grand disque aplati, arrondi, avec sa tresse */}
      <Part geo={cyl(0.38, 0.38, 0.07, 28)} m={G.wicker} p={[0, 0.88, -0.27]} rotation-x={Math.PI / 2 - 0.15} scale={[1, 1, 1.25]} />
      <Part m={G.wicker} p={[0, 0.88, -0.25]} rotation-x={-0.15} scale={[1, 1.25, 1]} castShadow={false}>
        <torusGeometry args={[0.38, 0.03, 8, 28]} />
      </Part>
      {/* les accoudoirs courbes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geo={cyl(0.03, 0.03, 0.4, 8)} m={G.wicker} p={[s * 0.31, 0.64, 0.0]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.025, 0.025, 0.22, 8)} m={G.wicker} p={[s * 0.31, 0.52, 0.18]} castShadow={false} />
        </group>
      ))}
      <Part geo={rbox(0.5, 0.1, 0.46, 0.05)} m={G.cushion} p={[0, 0.5, 0.02]} />
      <Part geo={rbox(0.32, 0.26, 0.09, 0.04)} m={G.cushion2} p={[0, 0.72, -0.18]} rotation-x={-0.25} />
      <Part geo={rbox(0.14, 0.04, 0.4, 0.015)} m={G.plaid} p={[0.31, 0.7, 0.05]} rotation-z={0.1} castShadow={false} />
    </group>
  )
}

/** Le tapis de la lecture : un rectangle tissé crème, vert et rouille. */
export function Rug({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <mesh material={G.rug} position={[position[0], 0.012, position[2]]} rotation={[-Math.PI / 2, 0, ry]} receiveShadow raycast={noRay}>
      <planeGeometry args={[2.3, 1.7]} />
    </mesh>
  )
}

/** Une pile de pots, un seau de zinc et son râteau, rangés dans un coin. */
export function Odds({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((k) => <Part key={k} geo={cyl(0.12, 0.09, 0.1, 16)} m={G.terracotta} p={[0, 0.05 + k * 0.1, 0]} rotation-y={k * 0.6} castShadow={false} />)}
      <Part geo={cyl(0.13, 0.1, 0.26, 18)} m={G.steel} p={[0.32, 0.13, 0.06]} />
      <Part geo={cyl(0.01, 0.01, 1.2, 6)} m={G.woodDark} p={[0.4, 0.62, 0.0]} rotation-z={0.22} castShadow={false} />
      <Part geo={rbox(0.2, 0.02, 0.03, 0.008)} m={G.steel} p={[0.5, 0.02, 0.0]} castShadow={false} />
      {[0, 1, 2, 3].map((i) => <Part key={i} geo={cyl(0.004, 0.004, 0.06, 4)} m={G.steel} p={[0.42 + i * 0.045, 0.03, 0.0]} castShadow={false} />)}
    </group>
  )
}

/** Des feuilles tombées sur le carrelage, près du palmier : trois grandes feuilles et deux pétales. */
export function FallenLeaves({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[i * 0.22 - 0.2, 0.012, (i % 2) * 0.18]} rotation-y={i * 2}>
          <Leaf kind="ovate" r={[-0.05, 0, 0]} w={0.07} l={0.2} m={i % 2 ? G.leafLight : G.leaf} />
        </group>
      ))}
    </group>
  )
}

