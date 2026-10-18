import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import { rand } from '../../math'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { useEvery } from '../life'
import { noRay } from '../parts'
import { POOL } from './Pool'
import { leafTex } from './textures'

const FALL = 7.5, REST = 4, FADE = 1.5

/**
 * Une feuille d'érable se détache de l'arbre de temps en temps (toutes les 18 à 40 s), descend en tournoyant jusqu'à l'eau du bassin,
 * y reste un moment à flotter, puis s'efface. Elle vient s'ajouter à celles qui y flottent déjà.
 */
export function FallingLeaf() {
  const leaf = useRef<Mesh>(null!), age = useRef(-1)
  const from = useRef([2.5, 3.5, -2.6]), to = useRef([1, 0, -0.7]), spin = useRef(0)
  useEvery(18, 40, () => {
    age.current = 0
    from.current = [2.2 + rand(0, 0.7), 3.3 + rand(0, 0.3), -2.9 + rand(0, 0.5)]
    to.current = [POOL.cx + rand(-0.6, 0.8), POOL.y + 0.03, POOL.cz + rand(-0.5, 0.5)]
    spin.current = rand(0.8, 1.6)
  })
  useFrame((_, delta) => {
    const m = leaf.current
    if (reduceMotion || age.current < 0) {
      m.visible = false
      return
    }
    age.current += Math.min(delta, 0.05)
    const a = age.current
    if (a > FALL + REST + FADE) {
      age.current = -1
      m.visible = false
      return
    }
    m.visible = true
    const k = Math.min(1, a / FALL), e = k * k * (3 - 2 * k) * 0.35 + k * 0.65 // tombe presque régulièrement, un peu plus vite au milieu
    const sway = Math.sin(a * 2.2) * 0.22 * (1 - k)
    m.position.set(
      from.current[0] + (to.current[0] - from.current[0]) * e + sway,
      from.current[1] + (to.current[1] - from.current[1]) * e,
      from.current[2] + (to.current[2] - from.current[2]) * e + Math.cos(a * 1.7) * 0.15 * (1 - k),
    )
    // en l'air, elle bascule et vrille ; posée sur l'eau, elle est à plat et tourne très lentement
    m.rotation.set(-Math.PI / 2 + Math.sin(a * 3) * 0.7 * (1 - k), 0, a * spin.current * (1 - k * 0.9))
    ;(m.material as MeshBasicMaterial).opacity = a > FALL + REST ? 1 - (a - FALL - REST) / FADE : 1
  })
  return (
    <mesh ref={leaf} userData={LIVE} visible={false} raycast={noRay}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial map={leafTex} transparent alphaTest={0.3} depthWrite={false} />
    </mesh>
  )
}
