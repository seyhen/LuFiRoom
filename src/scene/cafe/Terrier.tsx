import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { K } from './materials'

/**
 * Un skye terrier qui dort en boule sur son coussin, près du feu : long poil gris argent qui tombe jusqu'au sol,
 * frange sur les yeux, oreilles frangées. Clin d'œil à Greyfriars Bobby, le chien le plus célèbre d'Édimbourg.
 */
export function Terrier() {
  const body = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const b = Math.sin(clock.elapsedTime * 1.9) * 0.5 + 0.5
    body.current.scale.set(1 + b * 0.02, 1 + b * 0.05, 1 + b * 0.03)
  })
  return (
    <group position={[-1.82, 0, 0.62]} rotation-y={0.75}>
      {/* le coussin de velours vert, son bourrelet crème */}
      <Part geo={cyl(0.44, 0.46, 0.09, 28)} m={K.velvet} p={[0, 0.045, 0]} />
      <Part m={K.cream} p={[0, 0.1, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.4, 0.07, 10, 28]} />
      </Part>
      <group position={[0, 0.1, 0]}>
        <group ref={body} userData={LIVE}>
          {/* corps en boule et son long poil */}
          <Part geo={SPH} m={K.dog} scale={[0.27, 0.12, 0.17]} p={[-0.02, 0.1, 0]} />
          <Part geo={SPH} m={K.dogLight} scale={[0.3, 0.06, 0.2]} p={[-0.02, 0.04, 0]} />
          <Part geo={SPH} m={K.dog} scale={[0.12, 0.05, 0.16]} p={[-0.12, 0.17, 0]} castShadow={false} />
        </group>
        {/* la queue, enroulée devant */}
        <Part geo={SPH} m={K.dogLight} scale={[0.15, 0.045, 0.055]} p={[-0.1, 0.05, 0.17]} rotation-y={-0.5} castShadow={false} />
        {/* les pattes avant, la tête posée dessus */}
        {[0.03, 0.12].map((z) => (
          <Part key={z} geo={SPH} m={K.dogLight} scale={[0.07, 0.03, 0.035]} p={[0.25, 0.03, z]} castShadow={false} />
        ))}
        <group position={[0.22, 0.09, 0.07]} rotation-y={-0.2}>
          <Part geo={SPH} m={K.dog} scale={[0.1, 0.08, 0.09]} />
          <Part geo={SPH} m={K.dogLight} scale={[0.065, 0.045, 0.055]} p={[0.08, -0.025, 0.01]} castShadow={false} />
          <Part geo={SPH} m={M.ink} scale={[0.02, 0.016, 0.02]} p={[0.14, -0.012, 0.012]} castShadow={false} />
          {/* la frange sur les yeux */}
          <Part geo={SPH} m={K.dogLight} scale={[0.07, 0.04, 0.085]} p={[0.04, 0.05, 0]} rotation-z={-0.3} castShadow={false} />
          {/* les oreilles frangées, tombantes */}
          {[-1, 1].map((s) => (
            <Part key={s} geo={SPH} m={K.dog} scale={[0.035, 0.085, 0.045]} p={[-0.02, 0.0, s * 0.085]} rotation-x={s * 0.5} castShadow={false} />
          ))}
        </group>
      </group>
      {/* sa gamelle */}
      <Part geo={cyl(0.08, 0.1, 0.06, 18)} m={K.burgundy} p={[0.5, 0.03, -0.32]} />
    </group>
  )
}
