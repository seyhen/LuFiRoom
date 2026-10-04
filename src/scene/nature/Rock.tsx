import type { Material } from 'three'
import { Part, type V3 } from '../parts'
import { ROCK_VARIANTS, rockGeo } from './shapes'

export { FLAT_ROCKS, ROCK_VARIANTS } from './shapes'

export interface RockProps {
  /** Forme (0 à ROCK_VARIANTS - 1). */
  v: number
  p: V3
  /** Demi-largeur, hauteur, demi-profondeur. */
  s: V3
  ry?: number
  m: Material
  moss?: Material
  shadow?: boolean
}

/**
 * Une pierre posée au sol (le bas de sa forme en `p`), avec sa mousse si on lui en donne. Huit formes (`rockGeo`), dont deux
 * au dessus plat pour les pas japonais. Préfère-la à une sphère étirée dès qu'une pierre se voit.
 */
export function Rock({ v, p, s, ry = 0, m, moss, shadow = true }: RockProps) {
  const g = rockGeo(v % ROCK_VARIANTS)
  return (
    <group position={p} rotation-y={ry} scale={s}>
      <Part geo={g.rock} m={m} castShadow={shadow} />
      {moss && <Part geo={g.moss} m={moss} castShadow={false} />}
    </group>
  )
}
