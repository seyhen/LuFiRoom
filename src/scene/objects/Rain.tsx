import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { noRay } from '../parts'

const DROPS = 150
const dummy = new Object3D()

interface Drop {
  x: number
  y: number
  z: number
  v: number
  alive: boolean
}

// Sous le nuage, derrière la vitre.
function spawn(d: Drop) {
  d.x = rand(0.6, 2.75)
  d.z = rand(-3.55, -3.4)
  d.y = rand(4.4, 4.75)
  d.v = rand(6.5, 8.5)
  d.alive = true
}

/** 150 gouttes instanciées (6.5 à 8.5 u/s) qui tombent tant que le nuage pleut. */
export function Rain() {
  const ref = useRef<InstancedMesh>(null!)
  const drops = useMemo(() => Array.from({ length: DROPS }, (): Drop => ({ x: 0, y: -10, z: 0, v: 0, alive: false })), [])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), raining = isActive(useStore.getState(), 'cloud')
    let budget = raining ? Math.ceil(dt * 160) : 0
    drops.forEach((d, i) => {
      if (d.alive) {
        d.y -= d.v * dt
        if (d.y < -0.3) {
          if (raining) spawn(d)
          else d.alive = false
        }
      } else if (budget > 0) {
        spawn(d)
        d.y -= Math.random() * 0.5
        budget--
      }
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.setScalar(d.alive ? 1 : 0)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, DROPS]} frustumCulled={false} raycast={noRay}>
      <cylinderGeometry args={[0.013, 0.013, 0.3, 5]} />
      <meshBasicMaterial color={0x9cc4ff} transparent opacity={0.8} depthWrite={false} />
    </instancedMesh>
  )
}
