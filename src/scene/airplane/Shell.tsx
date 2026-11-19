import { Part, cyl, noRay, rbox } from '../parts'
import { holedWall } from '../walls'
import { A } from './materials'
import { AISLE, EXIT_DOOR, IN, PORTS } from './layout'

/** Les ouvertures du flanc : un hublot par rangée (un rectangle très arrondi) et le petit hublot de la porte de secours. */
const backWall = holedWall(
  [
    ...PORTS.map((p) => ({ x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.y0, y1: p.y1, r: p.w / 2 - 0.02 })),
    { x0: EXIT_DOOR.win.x - EXIT_DOOR.win.w / 2, x1: EXIT_DOOR.win.x + EXIT_DOOR.win.w / 2, y0: EXIT_DOOR.win.y0, y1: EXIT_DOOR.win.y1, r: EXIT_DOOR.win.w / 2 - 0.02 },
  ],
  4.35,
)
const leftWall = holedWall([], 4.35)

/**
 * La coque de la cabine : le socle (un plancher d'avion, bleu ardoise, liseré clair), la moquette bleu nuit et le chemin plus clair de l'allée,
 * le flanc (ivoire, soubassement bleu, percé de trois hublots) et la cloison arrière, leurs plinthes d'aluminium,
 * l'angle des deux murs. Les hublots, le rideau, les coffres sont dans leurs fichiers.
 */
export function Shell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={A.slab} p={[-0.07, -0.47, -0.07]} />
      <Part geo={rbox(6.92, 0.06, 6.92, 0.025)} m={A.slabTrim} p={[-0.07, -0.2, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={A.slabTrim} p={[-0.07, -0.12, -0.07]} />
      <mesh material={A.carpet} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <planeGeometry args={[6.42, 6.42]} />
      </mesh>
      {/* le chemin de l'allée : plus clair, juste au-dessus de la moquette */}
      <mesh material={A.runner} position={[0.06, 0.012, (AISLE.z0 + AISLE.z1) / 2]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <planeGeometry args={[6.12, AISLE.z1 - AISLE.z0 - 0.3]} />
      </mesh>
      {/* le flanc et la cloison arrière */}
      <mesh geometry={backWall} material={A.wall} position={[0, 0, -3.26]} castShadow receiveShadow raycast={noRay} />
      <mesh geometry={leftWall} material={A.wall} position={[-3.26, 0, 0]} rotation-y={Math.PI / 2} castShadow receiveShadow raycast={noRay} />
      {/* les plinthes d'aluminium, plus larges que le mur de 3 cm */}
      <Part geo={rbox(6.2, 0.1, 0.06, 0.02)} m={A.aluminium} p={[0.1, 0.05, IN + 0.03]} castShadow={false} />
      <Part geo={rbox(0.06, 0.1, 6.15, 0.02)} m={A.aluminium} p={[IN + 0.03, 0.05, 0.125]} castShadow={false} />
      {/* l'angle : une baguette arrondie, du sol au bandeau */}
      <Part geo={cyl(0.035, 0.035, 3.1, 12)} m={A.reveal} p={[IN + 0.035, 1.55, IN + 0.035]} castShadow={false} />
    </>
  )
}

