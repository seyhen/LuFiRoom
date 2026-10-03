import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, SPH } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { C } from './materials'

/** Un husky roulé en boule sur la peau de mouton, devant le feu : dos gris, ventre et museau blancs, la queue en panache sur le nez. */
export function Dog() {
  const body = useRef<Group>(null!), ear = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const t = clock.elapsedTime, b = Math.sin(t * 1.6) * 0.5 + 0.5
    body.current.scale.set(1 + b * 0.02, 1 + b * 0.05, 1 + b * 0.03)
    ear.current.rotation.x = Math.sin(t * 0.37) > 0.97 ? 0.3 : 0 // une oreille qui frémit de temps en temps
  })
  return (
    <group position={[-1.7, 0.05, -1.4]} rotation-y={0.6}>
      <group ref={body} userData={LIVE}>
        <Part geo={SPH} m={C.husky} scale={[0.36, 0.17, 0.25]} p={[0, 0.15, 0]} />
        <Part geo={SPH} m={C.huskyLight} scale={[0.3, 0.1, 0.22]} p={[0.04, 0.09, 0.05]} />
        <Part geo={SPH} m={C.husky} scale={[0.18, 0.12, 0.18]} p={[-0.2, 0.2, -0.02]} castShadow={false} />
      </group>
      {/* les pattes avant, la tête posée dessus, tournée vers nous */}
      {[0.07, 0.19].map((z) => (
        <Part key={z} geo={SPH} m={C.huskyLight} scale={[0.1, 0.04, 0.05]} p={[0.32, 0.05, z]} castShadow={false} />
      ))}
      <group position={[0.3, 0.17, 0.14]} rotation-y={-0.5}>
        <Part geo={SPH} m={C.husky} scale={[0.14, 0.12, 0.13]} />
        <Part geo={SPH} m={C.huskyLight} scale={[0.1, 0.07, 0.11]} p={[0.06, -0.04, 0]} castShadow={false} />
        <Part geo={SPH} m={C.huskyLight} scale={[0.08, 0.05, 0.065]} p={[0.15, -0.04, 0]} castShadow={false} />
        <Part geo={SPH} m={M.ink} scale={[0.025, 0.02, 0.025]} p={[0.22, -0.03, 0]} castShadow={false} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={M.ink} scale={[0.02, 0.005, 0.012]} p={[0.11, 0.035, s * 0.05]} rotation-y={s * 0.3} castShadow={false} />
        ))}
        {[-1, 1].map((s) => (
          <group key={s} ref={s > 0 ? ear : undefined} position={[-0.02, 0.1, s * 0.07]}>
            <Part m={C.husky} rotation={[s * 0.3, 0, 0.2]} castShadow={false}>
              <coneGeometry args={[0.045, 0.1, 10]} />
            </Part>
          </group>
        ))}
      </group>
      {/* la queue en panache, enroulée devant */}
      <Part geo={SPH} m={C.husky} scale={[0.22, 0.07, 0.08]} p={[0.05, 0.12, 0.27]} rotation-y={-0.3} castShadow={false} />
      <Part geo={SPH} m={C.huskyLight} scale={[0.08, 0.05, 0.06]} p={[0.25, 0.13, 0.3]} castShadow={false} />
    </group>
  )
}
