import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, ExtrudeGeometry, Shape, type SpriteMaterial } from 'three'
import { smooth } from '../../math'
import { SPH, noRay } from '../parts'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { O } from './materials'

// Trois rangs de montagnes derrière la palissade, du plus proche au plus lointain : [z, crêtes (x, y)]. Les crêtes
// redescendent vers les bords, pour que le diorama garde sa silhouette.
const RANGES: [number, number[][]][] = [
  [-3.5, [[-3.3, 1.9], [-2.5, 2.45], [-1.6, 2.25], [-0.7, 2.7], [0.3, 2.4], [1.3, 2.65], [2.3, 2.3], [3.2, 1.9]]],
  [-4.0, [[-3.3, 2.0], [-2.1, 2.95], [-1.0, 2.7], [0.1, 3.25], [1.3, 2.85], [2.3, 3.1], [3.2, 2.0]]],
  [-4.5, [[-3.3, 2.1], [-1.7, 3.35], [-0.3, 3.05], [0.9, 3.7], [2.1, 3.3], [3.2, 2.1]]],
]
// Le rang proche est couvert de forêts d'automne ; les autres bleuissent dans la brume.
const mists: SpriteMaterial[] = []
const DAY = [0xa07a50, 0x8f9a72, 0xb4b6d2].map((c) => new Color(c)), NIGHT = [0x262a40, 0x283252, 0x384270].map((c) => new Color(c))
function ridge(pts: number[][]) {
  const s = new Shape()
  s.moveTo(pts[0][0], 0)
  for (const [x, y] of pts) s.lineTo(x, y)
  s.lineTo(pts[pts.length - 1][0], 0)
  s.closePath()
  return new ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 })
}

/** Les montagnes dans la brume au-dessus de la palissade, et la lune qui se lève sur elles le soir. */
export function Mountains() {
  const geos = useMemo(() => RANGES.map(([, pts]) => ridge(pts)), [])
  useFrame(() => {
    const n = smooth(mood.night)
    O.mountains.forEach((m, i) => m.color.copy(DAY[i]).lerp(NIGHT[i], n))
    O.moon.opacity = n
    mists.forEach((m) => (m.opacity = 0.3 - n * 0.24))
  })
  return (
    <group raycast={noRay}>
      {RANGES.map(([z], i) => (
        <mesh key={z} geometry={geos[i]} material={O.mountains[i]} position={[0, 0, z]} raycast={noRay} />
      ))}
      <mesh geometry={SPH} material={O.moon} scale={0.32} position={[-1.3, 4.6, -5.0]} raycast={noRay} />
      {/* des bancs de brume entre les rangs */}
      {[[-1.5, 2.55, -3.8], [1.2, 2.9, -4.3], [2.4, 2.4, -3.75]].map(([x, y, z], i) => (
        <sprite key={i} position={[x, y, z]} scale={[3, 0.8, 1]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xffffff} transparent opacity={0.3} depthWrite={false} blending={AdditiveBlending} ref={(m) => void (m && (mists[i] = m))} />
        </sprite>
      ))}
    </group>
  )
}
