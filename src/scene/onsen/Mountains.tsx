import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, LatheGeometry, Vector2, type SpriteMaterial } from 'three'
import { smooth } from '../../math'
import { Part, SPH, noRay } from '../parts'
import { seeded } from '../paint'
import { Foliage } from '../nature/Foliage'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { O } from './materials'

// Derrière la palissade : la lisière d'une forêt d'automne dont les cimes dépassent, puis deux rangs de montagnes douces qui
// bleuissent dans la brume. Plus bas vers les bords, pour que le diorama garde sa silhouette.
// La lisière : [x, z, bas, demi-largeur, hauteur, essence (0-4 : feuillus roux, 5 : conifère)].
const TREES: [number, number, number, number, number, number][] = (() => {
  const r = seeded(91), out: [number, number, number, number, number, number][] = []
  for (let x = -1.85; x < 3.15; x += 0.3 + r() * 0.12) {
    const edge = Math.min(1, (3.2 - x) / 1.2), conifer = r() < 0.22
    out.push([x, -3.32 - r() * 0.22, 1.55 + r() * 0.2, conifer ? 0.16 + r() * 0.05 : 0.24 + r() * 0.12, (conifer ? 0.95 : 0.6 + r() * 0.35) * (0.6 + 0.4 * edge), conifer ? 5 : (r() * 5) | 0])
  }
  return out
})()
// Les montagnes : [x, hauteur, demi-largeur], sur deux rangs.
const RANGES: [number, number, [number, number, number][]][] = [
  [-4.1, 0.4, [[-2.6, 2.9, 1.7], [-0.6, 3.25, 1.9], [1.5, 3.0, 1.8], [3.0, 2.5, 1.2]]],
  [-4.7, 0.35, [[-1.6, 3.55, 2.3], [0.9, 3.85, 2.4], [2.9, 3.1, 1.5]]],
]
const mists: SpriteMaterial[] = []
// Les deux rangs : bleu-vert puis bleu lavande le jour, nuit d'encre le soir.
const DAY = [0x98a4a4, 0xb8bccf].map((c) => new Color(c)), NIGHT = [0x262c48, 0x323c64].map((c) => new Color(c))

/** Une montagne : profil tourné, base large, flancs creusés, sommet arrondi (rien de pointu). Base y = 0, sommet y = 1. */
const mountainGeo = (() => {
  const pts: Vector2[] = []
  for (let i = 0; i <= 28; i++) {
    const y = i / 28
    // pied large, flancs qui se creusent, sommet en dôme (la racine carrée arrondit la cime)
    pts.push(new Vector2(Math.max(0.0005, Math.sqrt(1 - y) * (1 - 0.35 * y) ** 1.5 * (1 - 0.18 * Math.max(0, y - 0.8))), y))
  }
  const g = new LatheGeometry(pts, 28)
  g.computeVertexNormals()
  return g
})()

/** Les montagnes dans la brume au-dessus de la palissade, et la lune qui se lève sur elles le soir. */
export function Mountains() {
  useFrame(() => {
    const n = smooth(mood.night)
    O.mountains.slice(1).forEach((m, i) => m.color.copy(DAY[i]).lerp(NIGHT[i], n))
    O.moon.opacity = n
    mists.forEach((m) => (m.opacity = 0.3 - n * 0.24))
  })
  return (
    <group raycast={noRay}>
      {RANGES.map(([z, d, peaks], r) =>
        peaks.map(([x, h, w], i) => (
          <Part key={`${r}${i}`} geo={mountainGeo} m={O.mountains[r + 1]} p={[x, -0.1, z]} scale={[w, h, d]} rotation-y={i * 1.3} castShadow={false} receiveShadow={false} />
        )),
      )}
      {/* la lisière : feuillus roux et dorés, quelques conifères sombres et élancés */}
      {TREES.map(([x, z, y, w, h, k], i) => (
        <Foliage key={i} v={i} p={[x, y, z]} s={[w, h, w * 0.85]} ry={i} m={k === 5 ? O.forestPine : O.forest[k]} style={k === 5 ? 'clipped' : 'wild'} shadow={false} />
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
