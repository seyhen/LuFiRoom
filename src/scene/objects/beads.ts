import { BufferGeometry, Color, Float32BufferAttribute, SphereGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { V3 } from '../parts'

/** Une bille : centre, rayon (ou demi-axes), couleur. */
export interface Bead {
  c: V3
  r: number | V3
  color: number
}

/**
 * Des billes brillantes (les yeux : iris, pupille, reflet) fusionnées en UN seul maillage à couleurs de sommets, à poser avec un
 * matériau `vertexColors` verni : un tracé pour la paire d'yeux, au lieu de six. Les billes sont dans le repère du parent.
 */
export function beads(list: Bead[], seg = 14): BufferGeometry {
  const geos = list.map(({ c, r, color }) => {
    const g = new SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7)))
    const [rx, ry, rz] = typeof r === 'number' ? [r, r, r] : r
    g.scale(rx, ry, rz).translate(...c)
    const col = new Color(color), n = g.attributes.position.count, a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) a.set([col.r, col.g, col.b], i * 3)
    g.setAttribute('color', new Float32BufferAttribute(a, 3))
    return g
  })
  const out = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  return out
}
