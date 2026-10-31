import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, MeshBasicMaterial, Object3D, SphereGeometry, type InstancedMesh } from 'three'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { noRay } from '../parts'

const N = 22
const BOX = { x: [-2.5, 2.9], y: [0.5, 3.4], z: [-2.5, 2.5] } as const
// des billes rondes (assez de facettes pour ne pas faire d'octogones) en lumière additive : elles brillent au lieu de griser
const dot = new SphereGeometry(1, 14, 10)
const mat = new MeshBasicMaterial({ color: 0xc8f8f0, transparent: true, opacity: 0.4, depthWrite: false, blending: AdditiveBlending })
const day = new Color(0x9fe8dc), night = new Color(0x7ff8e8)
const dummy = new Object3D()

/**
 * Le plancton du sous-marin, à la place des poussières des autres pièces : de minuscules billes d'eau claire qui montent
 * lentement en dérivant, et luisent un peu plus la nuit (le plancton phosphorescent). Phase cumulée image après image.
 */
export function Plankton() {
  const ref = useRef<InstancedMesh>(null!)
  const items = useMemo(
    () => Array.from({ length: N }, () => ({ x: rand(BOX.x[0], BOX.x[1]), y: rand(BOX.y[0], BOX.y[1]), z: rand(BOX.z[0], BOX.z[1]), s: rand(0.014, 0.03), ph: rand(0, TAU), sp: rand(0.4, 1.1) })),
    [],
  )
  useFrame((_, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), k = smooth(mood.night)
    mat.color.copy(day).lerp(night, k)
    mat.opacity = 0.35 + k * 0.3
    items.forEach((m, i) => {
      m.ph += dt * m.sp
      m.x += Math.sin(m.ph * 0.3) * 0.05 * dt
      m.z += Math.cos(m.ph * 0.25) * 0.05 * dt
      m.y += (0.03 + Math.sin(m.ph * 0.4) * 0.02) * dt
      if (m.y > BOX.y[1]) m.y = BOX.y[0]
      const tw = 0.6 + 0.4 * Math.sin(m.ph * 1.4)
      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(m.s * (0.8 + k * 0.5) * tw)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[dot, mat, N]} frustumCulled={false} raycast={noRay} />
}
