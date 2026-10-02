import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'

/** Ventilateur de bureau : pales à 22 rad/s, la tête oscille. */
export function Fan() {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), blades = useRef<Group>(null!)
  const spin = useRef({ speed: 0, angle: 0, swivel: 0 })
  useSquash('fan', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = spin.current
    s.speed = approach(s.speed, isActive(useStore.getState(), 'fan') ? 22 : 0, dt * 14)
    s.angle += s.speed * dt
    s.swivel += dt * 0.55 * (s.speed / 22)
    blades.current.rotation.z = s.angle
    head.current.rotation.y = -0.45 + Math.sin(s.swivel) * 0.4
  })
  return (
    <group ref={g} userData={{ id: 'fan' }} position={[0.98, 1.35, -2.45]}>
      <Part geo={cyl(0.19, 0.21, 0.06, 26)} m={M.butter} p={[0, 0.03, 0]} />
      <Part geo={cyl(0.035, 0.035, 0.36, 12)} m={M.cream} p={[0, 0.24, 0]} />
      <group ref={head} position={[0, 0.46, 0]} rotation-y={-0.45}>
        <Part geo={SPH} m={M.butter} scale={[0.1, 0.1, 0.13]} p={[0, 0, -0.07]} />
        <group ref={blades} position={[0, 0, 0.04]}>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation-z={(i / 3) * TAU}>
              <Part geo={SPH} m={M.cream} scale={[0.07, 0.17, 0.018]} p={[0, 0.15, 0]} rotation-y={0.35} />
            </group>
          ))}
        </group>
        <Part geo={SPH} m={M.butter} scale={[0.06, 0.06, 0.05]} p={[0, 0, 0.07]} />
        {/* grille : deux anneaux et quatre rayons */}
        <Part m={M.butter} p={[0, 0, 0.09]}>
          <torusGeometry args={[0.27, 0.022, 10, 36]} />
        </Part>
        <Part m={M.butter} p={[0, 0, -0.02]}>
          <torusGeometry args={[0.27, 0.016, 8, 36]} />
        </Part>
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={rbox(0.012, 0.54, 0.012, 0.005)} m={M.butter} p={[0, 0, 0.09]} rotation-z={(i / 4) * Math.PI} />
        ))}
      </group>
    </group>
  )
}
