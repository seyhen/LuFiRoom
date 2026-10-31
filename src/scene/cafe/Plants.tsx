import { TAU } from '../../math'
import { Part, cyl } from '../parts'
import { Leaf } from '../nature/Leaf'
import { Vessel, innerR } from '../igloo/Vessel'
import { K } from './materials'

// Grandes feuilles de figuier lyre : [hauteur, angle autour du tronc, inclinaison]. Serrées sur le tronc, plus petites en haut.
const LEAVES = Array.from({ length: 20 }, (_, i) => [0.72 + i * 0.066, i * 2.4, 0.45 + (i % 3) * 0.2] as const)
// Deux branches qui partent du tronc, chacune avec son bouquet de feuilles au bout : [hauteur du départ, angle, longueur, pente].
// (vers la pièce, jamais vers le mur du fond ni hors du plancher)
const BRANCHES = [[1.15, 0.3, 0.36, 0.75], [1.45, -0.9, 0.3, 0.7]] as const
const POT = { rt: 0.26, rb: 0.21, h: 0.5 }

/** Un grand figuier lyre au feuillage dense, deux branches, dans un cache-pot de laiton ouvert (on voit la terre), près de la fenêtre. */
export function FigTree() {
  return (
    <group position={[2.82, 0, -2.78]}>
      <Vessel p={[0, 0, 0]} rt={POT.rt} rb={POT.rb} h={POT.h} m={K.brass} inner={K.brassInner} t={0.014} />
      <Part geo={cyl(innerR(POT.rt, POT.rb, POT.h, 0.44, 0.014), innerR(POT.rt, POT.rb, POT.h, 0.44, 0.014), 0.02, 24)} m={K.soil} p={[0, 0.44, 0]} castShadow={false} />
      <Part geo={cyl(0.025, 0.04, 1.6, 8)} m={K.walnut} p={[0, 1.24, 0]} />
      {LEAVES.map(([y, a, tilt], i) => {
        const small = i > 14
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, a % TAU, 0]}>
            <Part geo={cyl(0.008, 0.01, 0.06, 5)} m={K.walnut} p={[0, 0.01, 0.025]} rotation-x={1.2} castShadow={false} />
            <Leaf kind="round" p={[0, 0.02, 0.05]} r={[-tilt * 0.8, 0, (i % 2 ? 1 : -1) * 0.15]} w={small ? 0.085 : 0.11} l={small ? 0.22 : 0.3} m={i % 3 ? K.fig : K.leafVDark} shadow={i % 2 === 0} />
          </group>
        )
      })}
      {BRANCHES.map(([y, a, len, up], b) => {
        const dx = Math.sin(a) * Math.sin(up) * len, dz = Math.cos(a) * Math.sin(up) * len, dy = Math.cos(up) * len
        return (
          <group key={b}>
            <group position={[0, y, 0]} rotation={[0, a, 0]}>
              <Part geo={cyl(0.012, 0.02, len, 6)} m={K.walnut} p={[0, (Math.cos(up) * len) / 2, (Math.sin(up) * len) / 2]} rotation-x={up} />
            </group>
            {Array.from({ length: 6 }, (_, i) => (
              <group key={i} position={[dx, y + dy - 0.06 + i * 0.03, dz]} rotation={[0, a + i * 1.1, 0]}>
                <Leaf kind="round" p={[0, 0.02, 0.04]} r={[-0.5 - (i % 3) * 0.2, 0, (i % 2 ? 1 : -1) * 0.2]} w={0.095} l={0.25} m={i % 2 ? K.fig : K.leafVDark} shadow={i % 3 === 0} />
              </group>
            ))}
          </group>
        )
      })}
    </group>
  )
}
