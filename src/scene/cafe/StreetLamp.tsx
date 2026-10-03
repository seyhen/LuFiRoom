import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay } from '../parts'
import { mood } from '../anim'
import { K } from './materials'
import { coldGlowTex } from './textures'

// Dehors, juste derrière la vitre (entre le mur, z = -3.32, et la vue peinte, z = -3.62) : un réverbère de fonte noire
// à lanterne, comme dans la vieille ville. Sa lumière est froide, pour que le dedans paraisse encore plus chaud.
// Vu de la caméra, ce qui est derrière le mur remonte et glisse vers la droite : il est donc placé plus à gauche et plus bas
// que là où on le voit, dans le battant droit.
const AT = [1.74, 0, -3.48] as const, H = 2.5
const glass = new MeshBasicMaterial({ color: 0xd8e2ea })
const DAY = new Color(0xc9d4de), NIGHT = new Color(0xf2f6ff)

/** Réverbère de la rue, vu par la fenêtre. Allumé même le jour (il fait sombre sous la pluie), éclatant la nuit. */
export function StreetLamp() {
  const halo = useRef<Sprite>(null!), core = useRef<Sprite>(null!)
  useFrame(() => {
    const n = smooth(mood.night), wet = mood.rain
    glass.color.copy(DAY).lerp(NIGHT, Math.max(n, wet * 0.5))
    halo.current.material.opacity = 0.15 + wet * 0.1 + n * 0.6
    core.current.material.opacity = 0.2 + wet * 0.15 + n * 0.65
  })
  const [x, , z] = AT
  return (
    <group raycast={noRay}>
      {/* le fût, ses bagues, la barre d'échelle (pour l'allumeur de réverbères) */}
      <Part geo={cyl(0.032, 0.045, H, 12)} m={K.iron} p={[x, H / 2, z]} castShadow={false} raycast={noRay} />
      {[H - 0.85, H - 0.2].map((y) => (
        <Part key={y} geo={cyl(0.055, 0.055, 0.05, 12)} m={K.iron} p={[x, y, z]} castShadow={false} raycast={noRay} />
      ))}
      <Part geo={cyl(0.012, 0.012, 0.42, 6)} m={K.iron} p={[x, H - 0.12, z]} rotation-z={Math.PI / 2} castShadow={false} raycast={noRay} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={SPH} m={K.iron} scale={0.025} p={[x + s * 0.21, H - 0.12, z]} castShadow={false} raycast={noRay} />
      ))}
      {/* la lanterne : socle, vitres qui s'évasent, chapeau et fleuron */}
      <Part geo={cyl(0.06, 0.04, 0.08, 4)} m={K.iron} p={[x, H + 0.04, z]} rotation-y={Math.PI / 4} castShadow={false} raycast={noRay} />
      <mesh geometry={cyl(0.13, 0.08, 0.3, 4)} material={glass} position={[x, H + 0.23, z]} rotation-y={Math.PI / 4} raycast={noRay} />
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2
        return <Part key={i} geo={cyl(0.008, 0.008, 0.31, 4)} m={K.iron} p={[x + Math.cos(a) * 0.104, H + 0.23, z + Math.sin(a) * 0.104]} rotation={[Math.sin(a) * 0.17, 0, -Math.cos(a) * 0.17]} castShadow={false} raycast={noRay} />
      })}
      <Part m={K.iron} p={[x, H + 0.44, z]} rotation-y={Math.PI / 4} castShadow={false} raycast={noRay}>
        <coneGeometry args={[0.17, 0.13, 4]} />
      </Part>
      <Part geo={SPH} m={K.iron} scale={0.03} p={[x, H + 0.53, z]} castShadow={false} raycast={noRay} />
      <sprite ref={halo} scale={2.4} position={[x, H + 0.23, z + 0.06]} raycast={noRay}>
        <spriteMaterial map={coldGlowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      <sprite ref={core} scale={0.8} position={[x, H + 0.23, z + 0.08]} raycast={noRay}>
        <spriteMaterial map={coldGlowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}
