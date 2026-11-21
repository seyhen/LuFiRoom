import { BoxGeometry, ExtrudeGeometry, Shape, type BufferGeometry } from 'three'
import { worldUV } from '../../parts'

/** Les boîtes du cottage, mises en cache : une par dimension, avec des UV en mètres (la pierre garde sa taille sur toutes les faces). */
const boxes = new Map<string, BufferGeometry>()
export function box(w: number, h: number, d: number, tile = 0, along: 'x' | 'z' = 'x') {
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${tile}|${along}`
  let g = boxes.get(key)
  if (!g) {
    g = new BoxGeometry(w, h, d)
    if (tile) g = worldUV(g, tile, along)
    boxes.set(key, g)
  }
  return g
}
const tris = new Map<string, BufferGeometry>()
/** Un pignon : un triangle de pierre (base `w`, hauteur `h`) épais de 0,25. */
export function gableTri(w: number, h: number) {
  const key = `${w.toFixed(3)}|${h.toFixed(3)}`
  let g = tris.get(key)
  if (!g) {
    const s = new Shape()
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath()
    g = worldUV(new ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false }), 2.2)
    tris.set(key, g)
  }
  return g
}

