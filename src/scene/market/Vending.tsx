import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { K } from './materials'

/** Le distributeur : son pied au sol, contre le mur de gauche, près de l'angle du fond. */
export const VENDING = { x: -2.55, z: -1.75 }
const day = new Color(0xb4b0c8), night = new Color(0xffffff)

/**
 * Un distributeur de boissons, vu de face : un caisson laqué, une vitrine de canettes éclairée de l'intérieur, un bandeau rose, le
 * bac, la fente de monnaie. Il bourdonne doucement : sa lumière froide se pose sur le pavé en face de lui, et vacille parfois.
 */
export function Vending() {
  const glow = useRef<Sprite>(null!), floor = useRef<Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night), f = reduceMotion ? 1 : 1 - Math.max(0, Math.sin(t * 2.3) - 0.97) * 14 * 0.25
    K.vending.color.copy(day).lerp(night, n).multiplyScalar(f)
    glow.current.material.opacity = (0.25 + 0.55 * n) * f
    ;(floor.current.material as MeshBasicMaterial).opacity = (0.2 + 0.55 * n) * f
  })
  return (
    <group position={[VENDING.x, 0, VENDING.z]} rotation-y={Math.PI / 2}>
      <Part geo={rbox(0.95, 1.9, 0.78, 0.08)} m={K.indigo} p={[0, 0.98, 0]} />
      <Part geo={rbox(0.99, 0.1, 0.82, 0.04)} m={K.iron} p={[0, 0.07, 0]} castShadow={false} />
      <Part geo={rbox(0.99, 0.06, 0.82, 0.03)} m={K.red} p={[0, 1.92, 0]} castShadow={false} />
      {/* la face : vitrine lumineuse (basic, teintée), cadre, fente de monnaie et bac */}
      <Part geo={rbox(0.84, 1.74, 0.03, 0.02)} m={K.iron} p={[0, 1.0, 0.395]} />
      <mesh material={K.vending} position={[0, 1.02, 0.412]}>
        <planeGeometry args={[0.8, 1.6]} />
      </mesh>
      <Part geo={rbox(0.22, 0.34, 0.025, 0.01)} m={K.steelDark} p={[0.28, 0.6, 0.42]} castShadow={false} />
      {[0, 1, 2].map((i) => (
        <Part key={i} geo={SPH} m={[K.red, K.yellow, K.teal][i]} scale={0.018} p={[0.22 + i * 0.06, 0.7, 0.44]} castShadow={false} />
      ))}
      {/* le bandeau de lumière du bas et quelques canettes déjà tombées dans le bac */}
      <Part geo={cyl(0.026, 0.026, 0.11, 10)} m={K.red} p={[-0.16, 0.22, 0.42]} rotation-z={1.4} castShadow={false} />
      <Part geo={cyl(0.026, 0.026, 0.11, 10)} m={K.teal} p={[-0.02, 0.2, 0.42]} rotation-z={1.2} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.3, 6)} m={K.iron} p={[0.4, 0.2, 0.3]} castShadow={false} />
      <sprite ref={glow} scale={[1.9, 2.8, 1]} position={[0, 1.0, 0.55]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0x9ad8ff} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
      </sprite>
      {/* le halo sur le pavé : une nappe froide qui s'étale devant */}
      <group userData={LIVE}>
        <mesh ref={floor} rotation-x={-Math.PI / 2} position={[0, 0.03, 1.0]} raycast={noRay}>
          <planeGeometry args={[2.2, 2.6]} />
          <meshBasicMaterial map={glowTex} color={0x7ac8ff} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
        </mesh>
      </group>
    </group>
  )
}
