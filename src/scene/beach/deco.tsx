import type { ThreeElements } from '@react-three/fiber'
import type { BufferGeometry, Material } from 'three'
import { Part as Base, type V3 } from '../parts'

/** Le décor du dehors ne projette pas d'ombre (elle tomberait sur la pièce et coûte un tracé de plus par matériau) ; `castShadow` la rend. */
export function Part({ geo, m, p, ...rest }: { geo?: BufferGeometry; m: Material | Material[]; p?: V3 } & ThreeElements['mesh']) {
  return <Base geo={geo} m={m} p={p} castShadow={false} {...rest} />
}
