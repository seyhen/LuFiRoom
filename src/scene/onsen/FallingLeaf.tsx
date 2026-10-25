import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, type Mesh, type MeshBasicMaterial } from 'three'
import { rand } from '../../math'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { useEvery } from '../life'
import { noRay } from '../parts'
import { POOL } from './Pool'
import { leafTex } from './textures'

const FALL = 8, REST = 9, FADE = 2.5

/**
 * De loin en loin (toutes les une à deux minutes), une feuille de l'érable se détache du haut du houppier, descend en se balançant
 * jusqu'à l'eau du bassin, y flotte un moment en tournant à peine, puis s'efface. Les petites feuilles qui tombent sans cesse se
 * perdent avant ; celle-là, on la suit jusqu'à l'eau.
 */
export function FallingLeaf() {
  const leaf = useRef<Mesh>(null!), age = useRef(-1), spin = useRef(0), turn = useRef(0)
  const from = useRef([2.4, 3.3, -2.6]), to = useRef([1, 0, -0.7])
  useEvery(60, 130, () => {
    age.current = 0
    // Du bas du houppier côté bassin (il penche vers lui), vers un point de l'eau loin des rochers du bord.
    from.current = [1.6 + rand(0, 0.6), 2.5 + rand(0, 0.3), -2.2 + rand(0, 0.5)]
    to.current = [POOL.cx + rand(-0.5, 0.6), POOL.y + 0.016, POOL.cz + rand(-0.4, 0.4)]
    spin.current = rand(0.9, 1.5)
    turn.current = rand(0, Math.PI * 2)
  })
  useFrame((_, delta) => {
    const m = leaf.current
    if (reduceMotion || age.current < 0) {
      m.visible = false
      return
    }
    const dt = Math.min(delta, 0.05)
    age.current += dt
    const a = age.current
    if (a > FALL + REST + FADE) {
      age.current = -1
      m.visible = false
      return
    }
    m.visible = true
    const k = Math.min(1, a / FALL), e = k * k * (3 - 2 * k) * 0.35 + k * 0.65 // presque régulière, un peu plus vite au milieu
    const air = 1 - k
    m.position.set(
      from.current[0] + (to.current[0] - from.current[0]) * e + Math.sin(a * 1.9) * 0.25 * air,
      from.current[1] + (to.current[1] - from.current[1]) * e,
      from.current[2] + (to.current[2] - from.current[2]) * e + Math.cos(a * 1.5) * 0.15 * air,
    )
    // En l'air elle bascule d'un côté à l'autre et vrille ; posée sur l'eau, elle est à plat et tourne très lentement.
    turn.current += dt * spin.current * (air * 0.9 + 0.04)
    m.rotation.set(-Math.PI / 2 + Math.sin(a * 1.9) * 0.6 * air, 0, turn.current)
    ;(m.material as MeshBasicMaterial).opacity = a > FALL + REST ? 1 - (a - FALL - REST) / FADE : 1
  })
  return (
    <mesh ref={leaf} userData={LIVE} visible={false} raycast={noRay}>
      <planeGeometry args={[0.17, 0.17]} />
      {/* la même matière que les feuilles qui flottent déjà sur le bassin */}
      <meshBasicMaterial map={leafTex} transparent alphaTest={0.04} depthWrite={false} side={DoubleSide} />
    </mesh>
  )
}
