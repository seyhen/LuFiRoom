import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, rand } from '../../math'
import { M } from '../materials'
import { Part, SPH, type V3 } from '../parts'
import { useParticles, useSquash } from '../anim'
import { heartTex } from '../textures'

// Visage tourné vers la caméra.
const face = new Vector3(1, 0, 1).normalize(), side = new Vector3(1, 0, -1).normalize()
const EYES = [1, -1].map((sgn): V3 => {
  const p = face.clone().multiplyScalar(0.165).addScaledVector(side, 0.065 * sgn)
  return [p.x, 0.03, p.z]
})
const nose = face.clone().multiplyScalar(0.178)
const EARS = [[-0.05, 0.11], [0.11, -0.05]]

/** Chat roulé en boule (sur le lit, ou devant le feu de la cabane). Qui ronronne : respiration plus ample, queue qui balance, cœurs. */
export function Cat({ position = [-1.15, 0.88, -0.55], rotation = -0.25 }: { position?: V3; rotation?: number }) {
  const g = useRef<Group>(null!), body = useRef<Mesh>(null!), tail = useRef<Group>(null!)
  const hearts = useParticles(), since = useRef(0)
  useSquash('cat', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, purr = isActive(useStore.getState(), 'cat')
    body.current.scale.y = 0.21 * (1 + (purr ? 0.06 : 0.025) * Math.sin((t * TAU) / (purr ? 2.7 : 3.8)))
    tail.current.rotation.y = 2.4 + (purr ? Math.sin(t * 1.7) * 0.12 : 0)
    since.current += Math.min(delta, 0.05)
    if (purr && since.current > 1.3) {
      since.current = 0
      hearts.emit(heartTex, position[0] + 0.3 + rand(-0.1, 0.1), position[1] + 0.37, position[2] + 0.15, { size: 0.2, life: 2.2, vy: 0.4, sway: 0.08 })
    }
  })
  return (
    <>
      <group ref={g} userData={{ id: 'cat' }} position={position} rotation-y={rotation}>
        <mesh ref={body} geometry={SPH} material={M.fur} scale={[0.44, 0.21, 0.32]} position={[0, 0.19, 0]} castShadow receiveShadow />
        <Part geo={SPH} m={M.furLight} scale={[0.3, 0.12, 0.2]} p={[0.12, 0.12, 0.14]} />
        <group position={[0.3, 0.24, 0.18]}>
          <Part geo={SPH} m={M.fur} scale={[0.18, 0.16, 0.18]} />
          {EARS.map(([dx, dz]) => (
            <Part key={dx} m={M.fur} p={[dx, 0.16, dz]} rotation={[dz * 2.2, 0, -dx * 2.2]}>
              <coneGeometry args={[0.07, 0.13, 14]} />
            </Part>
          ))}
          {EYES.map((p) => (
            <Part key={p[0]} geo={SPH} m={M.ink} scale={[0.035, 0.011, 0.014]} p={p} rotation-y={Math.PI / 4} />
          ))}
          <Part geo={SPH} m={M.nose} scale={[0.022, 0.016, 0.018]} p={[nose.x, -0.015, nose.z]} />
        </group>
        <group ref={tail} position={[0, 0.07, 0]} rotation-y={2.4} scale={[1, 1, 0.8]}>
          <Part m={M.furDark} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.34, 0.055, 10, 28, Math.PI * 1.1]} />
          </Part>
        </group>
      </group>
      <group ref={hearts.group} />
    </>
  )
}
