import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, MeshBasicMaterial, Object3D, type InstancedMesh } from 'three'
import { rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { noRay } from '../parts'

const streak = new BoxGeometry(0.012, 0.5, 0.012)
const mat = new MeshBasicMaterial({ color: 0xb4ccff, transparent: true, opacity: 0.55, depthWrite: false })
const dummy = new Object3D()
const N = 170
const BOX = { x: [-7.5, 7.5], z: [-7.5, 7.5], y: [-1.7, 8.2] }
const INSIDE = { x: [-3.5, 3.4], z: [-3.5, 3.4], top: 4.5 }

interface Drop {
  x: number
  y: number
  z: number
  v: number
}

/**
 * La pluie autour de la ruelle, comme la neige autour de la cabane : de longs traits qui tombent hors du diorama, sur le ciel
 * (et s'effacent en entrant dans la silhouette de la pièce, pour ne pas la traverser). Elle n'existe que quand le nuage pleut.
 */
export function Rainfall() {
  const ref = useRef<InstancedMesh>(null!)
  const drops = useMemo(() => Array.from({ length: N }, (): Drop => ({ x: rand(BOX.x[0], BOX.x[1]), y: rand(BOX.y[0], BOX.y[1]), z: rand(BOX.z[0], BOX.z[1]), v: rand(7, 10) })), [])
  useFrame((_, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), rainy = smooth(mood.rain)
    ref.current.visible = rainy > 0.01
    if (!ref.current.visible) return
    drops.forEach((d, i) => {
      d.y -= d.v * dt
      d.x -= 0.9 * dt
      if (d.y < BOX.y[0]) { d.y = BOX.y[1]; d.x = rand(BOX.x[0], BOX.x[1]); d.z = rand(BOX.z[0], BOX.z[1]) }
      if (d.x < BOX.x[0]) d.x = BOX.x[1]
      const inside = d.x > INSIDE.x[0] && d.x < INSIDE.x[1] && d.z > INSIDE.z[0] && d.z < INSIDE.z[1]
      let k = inside ? Math.min(1, Math.max(0, (d.y - INSIDE.top) / 0.35)) : 1
      // devant la pièce, entre la caméra et elle : un trait y passerait « dedans » ; il s'efface en entrant dans sa silhouette
      if (k > 0 && (d.x + 0.8 * d.y + d.z) / 1.6248 > 1) {
        const sx = Math.abs((d.x - d.z) * 0.7071), sy = 0.8704 * d.y - 0.348 * (d.x + d.z)
        const m = Math.min(4.8 - sx, (6.2 - 0.494 * sx - sy) / 1.115, (sy + 2.98 - 0.494 * sx) / 1.115)
        k *= 1 - Math.min(1, Math.max(0, m / 0.6))
      }
      dummy.position.set(d.x, d.y, d.z)
      dummy.rotation.z = 0.1
      dummy.scale.setScalar(k * rainy)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[streak, mat, N]} frustumCulled={false} raycast={noRay} visible={false} />
}
