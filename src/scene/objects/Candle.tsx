import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Mesh } from 'three'
import { M, flameMats } from '../materials'
import { Part, SPH, cyl, noRay, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { bulbGlowTex } from '../textures'

/** Une bougie allumée : cire, petite flamme qui vacille, halo. Pas de lumière (trop coûteux à plusieurs) : le halo suffit. */
export function Candle({ position, height = 0.12, radius = 0.03, holder }: { position: V3; height?: number; radius?: number; holder?: 'brass' | 'jar' }) {
  const flame = useRef<Mesh>(null!), phase = useRef(Math.random() * 10)
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const t = clock.elapsedTime + phase.current
    flame.current.scale.y = 0.035 * (1 + Math.sin(t * 13) * 0.12 + Math.sin(t * 7.1) * 0.08)
    flame.current.rotation.z = Math.sin(t * 5.3) * 0.12
  })
  const [x, y, z] = position, top = y + height
  return (
    <>
      {holder === 'brass' && (
        <>
          <Part geo={cyl(0.055, 0.065, 0.02, 16)} m={M.brass} p={[x, y - 0.13, z]} castShadow={false} />
          <Part geo={cyl(0.014, 0.02, 0.11, 10)} m={M.brass} p={[x, y - 0.07, z]} castShadow={false} />
          <Part geo={cyl(0.04, 0.03, 0.02, 14)} m={M.brass} p={[x, y - 0.01, z]} castShadow={false} />
        </>
      )}
      {holder === 'jar' && (
        <mesh geometry={cyl(radius + 0.025, radius + 0.02, height + 0.04, 18)} position={[x, y + (height + 0.04) / 2, z]} raycast={noRay}>
          <meshPhysicalMaterial color={0xffe0b8} transparent opacity={0.35} roughness={0.1} clearcoat={1} depthWrite={false} />
        </mesh>
      )}
      <Part geo={cyl(radius, radius, height, 14)} m={M.wax} p={[x, y + height / 2, z]} castShadow={false} />
      <mesh ref={flame} userData={LIVE} geometry={SPH} material={flameMats.core} scale={[0.014, 0.035, 0.014]} position={[x, top + 0.035, z]} raycast={noRay} />
      <sprite scale={0.32} position={[x, top + 0.035, z]} raycast={noRay}>
        <spriteMaterial map={bulbGlowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.75} />
      </sprite>
    </>
  )
}
