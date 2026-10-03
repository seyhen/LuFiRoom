import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood } from '../anim'
import { bulbGlowTex } from '../textures'
import { R } from './materials'

/** La cage de la porte de l'escalier : brique, porte verte, applique grillagée. */
export const SHED = { x0: -3.34, x1: -1.5, z0: -3.34, z1: -1.65, h: 2.5 }

/** Lampe grillagée au-dessus de la porte de l'escalier : allumée le soir. */
function DoorLamp() {
  const glow = useRef<Sprite>(null!)
  useFrame(() => void (glow.current.material.opacity = 0.1 + smooth(mood.night) * 0.75))
  return (
    <group position={[-2.42, 2.12, SHED.z1 + 0.08]}>
      <Part geo={rbox(0.14, 0.18, 0.06, 0.02)} m={R.steel} castShadow={false} />
      <mesh geometry={SPH} material={R.bulb} scale={[0.07, 0.09, 0.07]} position={[0, -0.02, 0.09]} />
      {[-0.05, 0.05].map((x) => (
        <Part key={x} geo={cyl(0.006, 0.006, 0.2, 4)} m={R.steel} p={[x, -0.02, 0.14]} castShadow={false} />
      ))}
      <sprite ref={glow} scale={1.1} position={[0, -0.02, 0.15]} raycast={noRay}>
        <spriteMaterial map={bulbGlowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * Le haut de l'immeuble : socle de brique et sa corniche, terrasse de teck, parapets de brique et leur couronnement de
 * pierre, la cage d'escalier avec sa porte.
 */
export function RoofShell() {
  const { x0, x1, z0, z1, h } = SHED
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={R.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.98, 0.09, 6.98, 0.04)} m={R.cornice} p={[-0.07, -0.21, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={R.tar} p={[-0.07, -0.12, -0.07]} />
      <mesh material={R.deck} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      {/* parapets : le fond et la gauche, un mètre de haut */}
      <Part geo={rbox(6.54, 0.95, 0.3, 0.05)} m={R.brick} p={[-0.07, 0.47, -3.19]} />
      <mesh material={R.brickBack} position={[-0.07, 0.47, -3.035]} receiveShadow>
        <planeGeometry args={[6.4, 0.93]} />
      </mesh>
      <Part geo={rbox(0.3, 0.95, 6.54, 0.05)} m={R.brick} p={[-3.19, 0.47, -0.07]} />
      <mesh material={R.brickSide} position={[-3.035, 0.47, -0.07]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 0.93]} />
      </mesh>
      <Part geo={rbox(6.62, 0.08, 0.42, 0.03)} m={R.coping} p={[-0.07, 0.98, -3.19]} />
      <Part geo={rbox(0.42, 0.08, 6.62, 0.03)} m={R.coping} p={[-3.19, 0.98, -0.07]} />
      {/* la cage d'escalier */}
      <Part geo={rbox(x1 - x0, h, z1 - z0, 0.06)} m={R.brick} p={[(x0 + x1) / 2, h / 2, (z0 + z1) / 2]} />
      <mesh material={R.brickShed} position={[(x0 + x1) / 2, h / 2, z1 + 0.003]} receiveShadow>
        <planeGeometry args={[x1 - x0 - 0.08, h - 0.08]} />
      </mesh>
      <mesh material={R.brickShed} position={[x1 + 0.003, h / 2, (z0 + z1) / 2]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[z1 - z0 - 0.08, h - 0.08]} />
      </mesh>
      <Part geo={rbox(x1 - x0 + 0.12, 0.1, z1 - z0 + 0.12, 0.04)} m={R.coping} p={[(x0 + x1) / 2, h + 0.02, (z0 + z1) / 2]} />
      {/* la porte verte, sa poignée, sa petite vitre */}
      <Part geo={rbox(0.8, 1.75, 0.06, 0.03)} m={R.door} p={[-2.42, 0.875, z1 + 0.03]} />
      <Part geo={rbox(0.9, 0.06, 0.08, 0.02)} m={R.coping} p={[-2.42, 1.79, z1 + 0.04]} castShadow={false} />
      <Part geo={rbox(0.3, 0.36, 0.02, 0.02)} m={R.glass} p={[-2.42, 1.35, z1 + 0.065]} castShadow={false} />
      <Part geo={SPH} m={R.brass} scale={0.035} p={[-2.1, 0.9, z1 + 0.08]} castShadow={false} />
      <DoorLamp />
    </>
  )
}
