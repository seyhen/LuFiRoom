import type { Material } from 'three'
import { Part, type V3 } from '../parts'
import { FOLIAGE_VARIANTS, foliageGeo, type FoliageStyle } from './shapes'

interface FoliageProps {
  /** Forme (0 à FOLIAGE_VARIANTS - 1). */
  v: number
  /** Le bas de la masse. */
  p: V3
  /** Demi-largeur, hauteur, demi-profondeur. */
  s: V3
  ry?: number
  /** Un matériau `foliage(couleur)` (nature/materials.ts). */
  m: Material
  /** `clipped` pour un arbuste taillé (dôme doux), `wild` (par défaut) pour un houppier libre. */
  style?: FoliageStyle
  shadow?: boolean
}

/**
 * Une masse de feuillage : arbuste taillé en boule, nuage d'un pin, houppier d'un arbre, touffe d'herbes aromatiques.
 * Lobes fondus, petites touffes en surface, ombre dans les creux et soleil sur le dessus (peints par la texture).
 */
export function Foliage({ v, p, s, ry = 0, m, style, shadow = true }: FoliageProps) {
  return <Part geo={foliageGeo(v % FOLIAGE_VARIANTS, style)} m={m} p={p} scale={s} rotation-y={ry} castShadow={shadow} />
}
