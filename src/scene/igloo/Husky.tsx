import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Part, SPH, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'

/**
 * Le chien de traîneau, un husky gris et blanc, roulé en boule sur la peau de renne, le museau sur la queue. Il dort : ses flancs
 * montent et descendent lentement. Il ne fait pas de son (on ne joue pas de respiration : voir le skill room-objects).
 */
export function Husky({ position, ry = 0 }: { position: V3; ry?: number }) {
  const body = useRef<Group>(null!), ph = useRef(0)
  useFrame((_, delta) => {
    if (!reduceMotion) ph.current += Math.min(delta, 0.05) * 1.3
    body.current.scale.set(1, 1 + Math.sin(ph.current) * 0.035, 1 + Math.sin(ph.current) * 0.02)
  })
  return (
    <group position={position} rotation-y={ry} userData={LIVE}>
      <group ref={body}>
        <Static>
          {/* le corps roulé : le dos gris, le ventre et la poitrine blancs */}
          <Part geo={SPH} m={I.husky} scale={[0.42, 0.22, 0.3]} p={[0, 0.2, 0]} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.36, 0.17, 0.26]} p={[0.04, 0.16, 0.06]} />
          {/* la queue en panache, enroulée devant */}
          <Part geo={SPH} m={I.husky} scale={[0.3, 0.09, 0.11]} p={[0.06, 0.12, 0.28]} rotation-y={0.25} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.1, 0.07, 0.08]} p={[0.32, 0.12, 0.26]} />
        </Static>
      </group>
      {/* la tête, posée sur la queue : le crâne gris, le masque blanc, le museau, la truffe, les yeux fermés, les oreilles */}
      <group position={[0.36, 0.2, 0.18]} rotation-y={-0.5}>
        <Part geo={SPH} m={I.husky} scale={[0.15, 0.13, 0.14]} />
        <Part geo={SPH} m={I.huskyLight} scale={[0.12, 0.09, 0.12]} p={[0.04, -0.04, 0.02]} />
        <Part geo={SPH} m={I.huskyLight} scale={[0.1, 0.06, 0.065]} p={[0.15, -0.06, 0.0]} />
        <Part geo={SPH} m={I.nose} scale={0.025} p={[0.245, -0.045, 0]} castShadow={false} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={SPH} m={I.huskyDark} scale={[0.022, 0.006, 0.012]} p={[0.11, 0.025, s * 0.058]} rotation-y={s * 0.3} castShadow={false} />
            <Part m={I.husky} p={[-0.02, 0.15, s * 0.07]} rotation={[s * 0.25, 0, -0.15]}>
              <coneGeometry args={[0.05, 0.11, 12]} />
            </Part>
            <Part m={I.huskyLight} p={[-0.012, 0.145, s * 0.07]} rotation={[s * 0.25, 0, -0.15]} castShadow={false}>
              <coneGeometry args={[0.028, 0.07, 10]} />
            </Part>
          </group>
        ))}
      </group>
    </group>
  )
}
