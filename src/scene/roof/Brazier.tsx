import { useRef } from 'react'
import type { Group } from 'three'
import { TAU } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { useSquash } from '../anim'
import { Static } from '../Static'
import { Flames } from '../objects/Flames'
import { R } from './materials'

const AT = [-0.85, 0, 0.35] as const

/** Le braséro d'acier corten sur ses trois pieds, ses bûches et ses braises : on y allume un feu pour la soirée. */
export function Brazier() {
  const g = useRef<Group>(null!)
  useSquash('brazier', g)
  return (
    <group ref={g} userData={{ id: 'brazier' }} position={AT as unknown as [number, number, number]}>
      <Static>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU + 0.3
          return <Part key={i} geo={cyl(0.03, 0.03, 0.34, 8)} m={R.steel} p={[Math.cos(a) * 0.3, 0.16, Math.sin(a) * 0.3]} rotation={[-Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25]} />
        })}
        <Part geo={SPH} m={R.corten} scale={[0.52, 0.22, 0.52]} p={[0, 0.48, 0]} />
        <Part m={R.corten} p={[0, 0.5, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.5, 0.035, 8, 32]} />
        </Part>
        <Part geo={cyl(0.46, 0.46, 0.02, 28)} m={R.tar} p={[0, 0.5, 0]} castShadow={false} />
        {[[0.15, 0.2], [-0.12, -0.6], [0.0, 1.4]].map(([dz, a], i) => (
          <Part key={i} geo={cyl(0.06, 0.06, 0.5, 10)} m={R.log} p={[0, 0.56 + i * 0.03, dz]} rotation={[Math.PI / 2, 0, a]} />
        ))}
        {[[-0.15, 0.1], [0.12, -0.12], [0.05, 0.18], [-0.05, -0.2]].map(([x, z], i) => (
          <mesh key={i} geometry={SPH} material={R.ember} scale={[0.07, 0.035, 0.07]} position={[x, 0.53, z]} />
        ))}
      </Static>
      <Flames
        id="brazier"
        position={[0, 0.55, 0]}
        size={0.75}
        light={{ at: [0, 0.5, 0.2], intensity: 1.4, distance: 7 }}
        glow={{ at: [0, 0.25, 0.1], scale: 2.2 }}
        embers={{ spread: 0.2, at: [0, 0.2, 0] }}
        onFrame={(k, t) => (R.ember.emissiveIntensity = 0.1 + k * (1.2 + Math.sin(t * 2.3) * 0.25))}
      />
    </group>
  )
}
