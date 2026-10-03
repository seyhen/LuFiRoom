import { ExtrudeGeometry, Path, Shape } from 'three'
import { rrPath } from './parts'

export interface Hole {
  x0: number
  x1: number
  y0: number
  y1: number
  /** Arrondi des coins (une arche si r vaut la moitié de la largeur). */
  r?: number
}

const cache = new Map<string, ExtrudeGeometry>()

/**
 * Mur du fond (6.54 × `height`, épaisseur 0.2 + biseau), percé d'ouvertures. Même forme que celui de la chambre,
 * à poser en (0, 0, -3.26). Pour le mur de gauche, tourne-le de π/2 et pose-le en (-3.26, 0, 0) : x devient alors -z.
 */
export function holedWall(holes: Hole[], height = 4.35) {
  const key = JSON.stringify([holes, height])
  let g = cache.get(key)
  if (!g) {
    const shape = rrPath(new Shape(), -3.34, -0.05, 6.54, height, 0.12)
    for (const h of holes) shape.holes.push(rrPath(new Path(), h.x0, h.y0, h.x1 - h.x0, h.y1 - h.y0, h.r ?? 0.16))
    g = new ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 10 })
    cache.set(key, g)
  }
  return g
}
