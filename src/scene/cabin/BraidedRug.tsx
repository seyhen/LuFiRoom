import { cyl } from '../parts'
import { C } from './materials'

/** Grand tapis rond tressé au milieu de la pièce, sous le fauteuil. */
export function BraidedRug() {
  return <mesh geometry={cyl(1.75, 1.75, 0.035, 72)} material={[C.cranberry, C.braid, C.braid]} position={[-0.3, 0.0175, -0.75]} receiveShadow />
}
