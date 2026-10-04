import type { Material } from 'three'
import { Part, type V3 } from '../parts'
import { leafGeo, type LeafKind } from './shapes'

interface LeafProps {
  kind?: LeafKind
  /** Le pétiole (la base de la feuille). */
  p?: V3
  /** Rotation (x, y, z) : la feuille part le long de +z, dessus vers +y. */
  r?: V3
  /** Demi-largeur et longueur. */
  w: number
  l: number
  /** Un matériau `leafy(couleur)` (nature/materials.ts). */
  m: Material
  shadow?: boolean
}

/** Une feuille bombée, pliée sur sa nervure, arquée vers la pointe : ovale, en cœur, lancéolée, ronde, pennée (palme, fougère) ou fendue (monstera). */
export function Leaf({ kind = 'ovate', p, r, w, l, m, shadow = false }: LeafProps) {
  return <Part geo={leafGeo(kind)} m={m} p={p} rotation={r} scale={[w, (w + l) / 2, l]} castShadow={shadow} />
}
