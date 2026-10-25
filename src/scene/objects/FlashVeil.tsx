import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CanvasTexture, type Mesh, type MeshBasicMaterial } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { life } from '../life'
import { noRay, type V3 } from '../parts'
import { LIVE } from '../Static'
import { makeCanvas } from '../textures'

// Plus fort en haut (le ciel), plus faible en bas (le sol, la mer) : l'éclair vient des nuages.
const tex = (() => {
  const [c, x] = makeCanvas(4, 64)
  const g = x.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,.18)')
  x.fillStyle = g; x.fillRect(0, 0, 4, 64)
  return new CanvasTexture(c)
})()

/**
 * L'éclair dans une vue du dehors : un voile bleuté qui s'ajoute à la vue le temps de la lueur (`life.flash`), plus visible la nuit.
 * Posé juste devant la vue (et ses bandes qui défilent), derrière la vitre. Aucun tracé entre deux éclairs.
 */
export function FlashVeil({ position, size, strength = 1 }: { position: V3; size: [number, number]; strength?: number }) {
  const ref = useRef<Mesh>(null!)
  useFrame(() => {
    const m = ref.current, f = life.flash
    m.visible = f > 0.01
    if (m.visible) (m.material as MeshBasicMaterial).opacity = f * strength * (0.32 + 0.38 * smooth(mood.night))
  })
  return (
    <mesh ref={ref} userData={LIVE} position={position} raycast={noRay} visible={false} renderOrder={1}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} color={0xdfe6ff} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
    </mesh>
  )
}
