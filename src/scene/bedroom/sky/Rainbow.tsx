import { useMemo } from 'react'
import { BufferGeometry, Color, Float32BufferAttribute, TorusGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { noRay } from '../../parts'
import { S } from './layout'
import { K } from './materials'

const BANDS = [0xf6aec6, 0xf8c9a0, 0xf6e08a, 0x9fdcb8, 0x9fd0f0, 0xc3b1ee]
const R0 = 5.6, STEP = 0.3

/** Un arc-en-ciel doux, tendre : six boudins pastel côte à côte dans un seul maillage (la couleur vient des sommets). */
export function rainbowGeo() {
  const parts = BANDS.map((c, i) => {
    const g = new TorusGeometry(R0 - i * STEP, 0.15, 6, 40, Math.PI)
    g.scale(1, 1, 0.55)
    const col = new Color(c), n = g.attributes.position.count
    g.setAttribute('color', new Float32BufferAttribute(Array.from({ length: n }, () => [col.r, col.g, col.b]).flat(), 3))
    return g
  })
  const g = mergeGeometries(parts) as BufferGeometry
  parts.forEach((p) => p.dispose())
  return g
}

/** L'arc-en-ciel, derrière la chambre à droite : ses pieds s'enfoncent dans les bancs de nuages. */
export function Rainbow() {
  const geo = useMemo(rainbowGeo, [])
  return <mesh geometry={geo} material={K.rainbow} position={S(5.4, -3.4, -11)} rotation-y={Math.PI / 4} raycast={noRay} />
}
