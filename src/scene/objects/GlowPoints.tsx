import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, type PointsMaterial } from 'three'
import { useWorldPointSize } from '../anim'
import { noRay, type V3 } from '../parts'
import { glowTex } from '../textures'

/**
 * Des halos de lumière (lanternes, réverbères, fenêtres) en un seul tracé : un nuage de points additifs, au lieu d'un sprite par
 * lanterne (chaque sprite coûte un tracé). `level()` donne l'intensité à chaque image (0 le jour, 1 la nuit) ; `size` en mètres.
 */
export function GlowPoints({ points, color = 0xffc880, size = 0.8, level }: { points: V3[]; color?: number; size?: number; level: () => number }) {
  const mat = useRef<PointsMaterial>(null!)
  // Les appelants passent un tableau neuf à chaque rendu (`[-1, 0, 1].map(...)` dans le JSX) : la clé est le contenu, sinon chaque
  // rendu du parent refaisait une géométrie, laissée sur la carte graphique (+1 par re-rendu dans le train et le toit).
  const key = points.flat().join(',')
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(key.split(',').map(Number), 3))
    return g
  }, [key])
  useEffect(() => () => geo.dispose(), [geo])
  useWorldPointSize(mat, size)
  useFrame(() => {
    const k = level()
    mat.current.opacity = k
    mat.current.visible = k > 0.01
  })
  return (
    <points geometry={geo} frustumCulled={false} renderOrder={4} raycast={noRay}>
      <pointsMaterial ref={mat} map={glowTex} color={color} size={10} sizeAttenuation={false} transparent depthWrite={false} blending={AdditiveBlending} opacity={0} />
    </points>
  )
}
