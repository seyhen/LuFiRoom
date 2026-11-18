import { LatheGeometry, Vector2 } from 'three'
import { CENTER, HALF_ARC, LEN, LENGTHS, PROFILE } from './profile'

// La forme de la tente : une tente-cloche, toile ecru sur un mât central. La courbe (`radiusAt`, `onCanvas`, `tiltAt`…) est en maths pures
// dans `profile.ts` (testée) ; ici, la coque de révolution qu'on en fait. La toile, les accessoires posés dessus et les haubans lisent la même courbe.
export { APEX, CENTER, HALF_ARC, LEN, PROFILE, R0, V_WALL, WALL, onCanvas, radiusAt, tiltAt } from './profile'

/** La demi-coque de toile : un solide de révolution ouvert, UV en mètres le long du profil (v) et de l'angle (u : 0 à 1). `inset` la rentre vers le mât. */
export function canvasShell(segments = 60, inset = 0) {
  const g = new LatheGeometry(PROFILE.map(([r, y]) => new Vector2(r - inset, y)), segments, CENTER - HALF_ARC, HALF_ARC * 2)
  const uv = g.attributes.uv
  const n = PROFILE.length
  for (let i = 0; i <= segments; i++) for (let j = 0; j < n; j++) uv.setXY(i * n + j, i / segments, LENGTHS[j] / LEN)
  return g
}
