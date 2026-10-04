import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Steam } from '../objects/Steam'
import { K } from './materials'
import { ringTex } from './textures'

const R = 0.27, H = 0.44
const BUBBLES = 7

/**
 * La marmite de bouillon, sur son réchaud : un grand faitout d'acier plein à ras bord d'un bouillon doré, deux anses, un couvercle
 * appuyé contre sa panse et une louche posée en travers. Quand elle frémit, des bulles crèvent la surface et une vapeur épaisse
 * monte ; au repos elle fume à peine.
 */
export function Pot({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), bubbles = useRef<Mesh[]>([]), k = useRef(0)
  const on = useStore((s) => isActive(s, 'pot'))
  useSquash('pot', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    k.current = approach(k.current, isActive(useStore.getState(), 'pot') ? 1 : 0.15, Math.min(delta, 0.05) * 1.2)
    bubbles.current.forEach((b, i) => {
      const p = reduceMotion ? 0.5 : (t * (0.35 + (i % 3) * 0.12) + i * 0.37) % 1
      const a = (i / BUBBLES) * TAU + i * 0.8, r = 0.04 + ((i * 53) % 17) * 0.011
      b.position.set(Math.cos(a) * r, H + 0.011, Math.sin(a) * r)
      b.scale.setScalar(0.03 + p * 0.1)
      ;(b.material as MeshBasicMaterial).opacity = Math.sin(Math.PI * p) * 0.55 * k.current
    })
  })
  return (
    <group ref={g} userData={{ id: 'pot' }} position={position}>
      {/* le réchaud : une couronne de fonte, un tuyau de gaz */}
      <Part geo={cyl(0.2, 0.22, 0.07, 22)} m={K.iron} p={[0, 0.035, 0]} />
      {/* le faitout */}
      <Part geo={cyl(R, R * 0.96, H, 30)} m={K.steel} p={[0, H / 2 + 0.07, 0]} />
      <Part m={K.steel} p={[0, H + 0.07, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[R, 0.02, 8, 34]} />
      </Part>
      <Part geo={cyl(R - 0.02, R - 0.02, 0.01, 30)} m={K.broth} p={[0, H + 0.075, 0]} castShadow={false} />
      <Part geo={cyl(R * 0.97, R * 0.97, 0.03, 30)} m={K.steelDark} p={[0, 0.22, 0]} castShadow={false} />
      {[-1, 1].map((s) => (
        <Part key={s} m={K.steelDark} p={[s * (R + 0.03), 0.4, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.05, 0.012, 6, 14, Math.PI]} />
        </Part>
      ))}
      {/* les bulles qui crèvent la surface */}
      <group position={[0, 0.07, 0]}>
        {Array.from({ length: BUBBLES }, (_, i) => (
          <mesh key={i} ref={(el) => void (el && (bubbles.current[i] = el))} rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={ringTex} color={0xffe6b0} transparent depthWrite={false} opacity={0} blending={AdditiveBlending} />
          </mesh>
        ))}
      </group>
      {/* le couvercle, appuyé contre la panse côté client, et sa poignée de bois */}
      <group position={[0.2, 0.3, 0.3]} rotation={[0.9, 0.5, 0]}>
        <Part geo={cyl(0.27, 0.27, 0.02, 28)} m={K.steel} />
        <Part geo={SPH} m={K.woodDark} scale={[0.04, 0.03, 0.04]} p={[0, 0.03, 0]} castShadow={false} />
      </group>
      {/* la louche posée en travers de la marmite */}
      <group position={[0, H + 0.12, 0]} rotation-y={-0.7}>
        <Part geo={cyl(0.008, 0.008, 0.62, 6)} m={K.woodPale} p={[0.12, 0, 0]} rotation-z={Math.PI / 2 - 0.12} castShadow={false} />
        <Part geo={SPH} m={K.steel} scale={[0.055, 0.03, 0.055]} p={[-0.2, -0.04, 0]} castShadow={false} />
      </group>
      {/* le tuyau d'arrivée du gaz et sa manette */}
      <Part geo={rbox(0.06, 0.06, 0.5, 0.02)} m={K.iron} p={[0.1, 0.03, 0.4]} castShadow={false} />
      <Steam at={[0, H + 0.2, 0]} every={on ? 0.28 : 1.5} />
      {on && <Steam at={[0.08, H + 0.22, 0.05]} every={0.4} />}
    </group>
  )
}
