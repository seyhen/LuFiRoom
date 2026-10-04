import type { ReactNode } from 'react'
import { ExtrudeGeometry, Shape, type Material } from 'three'
import { Part, cyl, type V3 } from '../parts'

export type GarmentKind = 'coat' | 'shirt' | 'dress'

// La moitié droite de chaque silhouette, vue de face, depuis le col (0, 0) : épaule, manche qui pend, aisselle, flanc, ourlet.
// L'autre moitié est le miroir. Le vêtement pend donc sous son crochet.
const HALF: Record<GarmentKind, number[][]> = {
  coat: [[0.055, 0.0], [0.17, -0.05], [0.205, -0.12], [0.215, -0.62], [0.15, -0.65], [0.14, -0.24], [0.15, -0.3], [0.2, -0.9], [0.1, -0.915]],
  shirt: [[0.05, 0.0], [0.16, -0.04], [0.2, -0.1], [0.215, -0.42], [0.15, -0.44], [0.135, -0.2], [0.14, -0.26], [0.15, -0.62], [0.07, -0.64]],
  dress: [[0.045, 0.0], [0.11, -0.03], [0.125, -0.14], [0.1, -0.3], [0.13, -0.42], [0.22, -0.86], [0.1, -0.88]],
}
const cache = new Map<GarmentKind, ExtrudeGeometry>()

/** La silhouette d'un vêtement : une plaque épaisse aux bords très arrondis, centrée en épaisseur. */
function garmentGeo(kind: GarmentKind) {
  let g = cache.get(kind)
  if (g) return g
  const half = HALF[kind], s = new Shape()
  s.moveTo(-half[0][0], half[0][1])
  // un col légèrement creusé
  s.quadraticCurveTo(0, -0.035, half[0][0], half[0][1])
  for (const [x, y] of half.slice(1)) s.lineTo(x, y)
  s.quadraticCurveTo(0, half[half.length - 1][1] - 0.02, -half[half.length - 1][0], half[half.length - 1][1])
  for (const [x, y] of [...half].reverse().slice(1, -1)) s.lineTo(-x, y)
  s.closePath()
  g = new ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.022, bevelSegments: 4, curveSegments: 8 })
  g.translate(0, 0, -0.02)
  cache.set(kind, g)
  return g
}

interface GarmentProps {
  kind?: GarmentKind
  /** Le crochet (le haut du col). */
  p?: V3
  r?: V3
  /** Échelle (1 : un manteau d'adulte, 0,9 de long). */
  s?: number | V3
  m: Material
  /** Un cintre de bois sous le col (penderie), plutôt qu'une simple boucle. */
  hanger?: Material
  /** Détails posés sur le devant (boutons, poche, col), dans le repère du vêtement : le devant est vers +z, à z ≈ 0,05. */
  children?: ReactNode
}

/**
 * Un vêtement suspendu : manteau, chemise ou robe, avec ses épaules, ses manches qui pendent et son ourlet. Le volume est
 * une silhouette épaisse aux bords arrondis : c'est le contour qui le fait reconnaître, pas un cône ou une planche.
 */
export function Garment({ kind = 'coat', p, r, s = 1, m, hanger, children }: GarmentProps) {
  return (
    <group position={p} rotation={r} scale={s}>
      {hanger && (
        <>
          <Part geo={cyl(0.012, 0.012, 0.4, 8)} m={hanger} p={[0, -0.035, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part m={hanger} p={[0, 0.03, 0]} castShadow={false}>
            <torusGeometry args={[0.03, 0.006, 6, 12, Math.PI * 1.3]} />
          </Part>
        </>
      )}
      <Part geo={garmentGeo(kind)} m={m} />
      {children}
    </group>
  )
}
