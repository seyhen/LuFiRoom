import type { Material } from 'three'
import { Part, cyl, rbox, type V3 } from '../parts'
import { B } from './materials'

/**
 * Une serviette jetée sur une barre qui court le long de x : le pli qui passe par-dessus, un pan devant, un pan derrière plus court,
 * un liseré de couleur près de l'ourlet. `position` est le dessus de la barre, `drop` la longueur du pan de devant.
 */
export function Towel({ position, width, drop, m, hem = B.trim, bar = 0.016 }: { position: V3; width: number; drop: number; m: Material; hem?: Material; bar?: number }) {
  const t = bar + 0.016 // l'épaisseur de l'éponge de chaque côté de la barre
  return (
    <group position={position}>
      <Part geo={cyl(bar + 0.018, bar + 0.018, width, 14)} m={m} p={[0, -bar, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(width, drop, 0.026, 0.011)} m={m} p={[0, -bar - drop / 2, t + 0.012]} castShadow={false} />
      <Part geo={rbox(width, drop * 0.78, 0.026, 0.011)} m={m} p={[0, -bar - (drop * 0.78) / 2, -t - 0.012]} castShadow={false} />
      <Part geo={rbox(width + 0.004, 0.036, 0.032, 0.012)} m={hem} p={[0, -bar - drop + 0.075, t + 0.014]} castShadow={false} />
    </group>
  )
}

/** Une serviette roulée : un boudin d'éponge, ses deux spirales sur les bouts. `p` est le centre ; l'axe est z. */
export function RolledTowel({ p, r = 0.058, len = 0.26, m, rotY = 0 }: { p: V3; r?: number; len?: number; m: Material; rotY?: number }) {
  return (
    <group position={p} rotation-y={rotY}>
      <Part geo={cyl(r, r, len, 16)} m={m} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(r * 0.55, r * 0.55, 0.006, 12)} m={B.trim} p={[0, 0, len / 2 + 0.004]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(r * 0.55, r * 0.55, 0.006, 12)} m={B.trim} p={[0, 0, -len / 2 - 0.004]} rotation-x={Math.PI / 2} castShadow={false} />
    </group>
  )
}
