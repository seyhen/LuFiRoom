import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, NormalBlending, type Mesh, type MeshBasicMaterial, type Texture } from 'three'
import { smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { noRay, type V3 } from '../parts'
import { LIVE } from '../Static'

interface Props {
  /** Texture qui se répète en largeur (RepeatWrapping), dessinée en clair : la couleur la teinte. */
  map: Texture
  position: V3
  size: [number, number]
  /** Teinte de jour, de nuit. */
  color: [number, number]
  /** Défilement, en largeurs de texture par seconde (négatif : vers la gauche). */
  speed?: number
  /** Houle : amplitude (unités) et vitesse du balancement vertical. */
  bob?: [number, number]
  phase?: number
  /** Facteur de vitesse lu à chaque image (le train qui ralentit, par exemple). */
  pace?: () => number
  /** Opacité de jour, de nuit (1 par défaut). */
  opacity?: [number, number]
  /** Lumières (fenêtres allumées) : s'ajoutent à ce qui est derrière. */
  glow?: boolean
}

/**
 * Un plan transparent dont la texture défile : vagues, collines, poteaux vus d'un train. Plusieurs plans à des vitesses
 * différentes font une parallaxe. Rien n'est redessiné : seul le décalage de la texture change, c'est gratuit.
 */
export function ScrollLayer({ map, position, size, color, speed = 0, bob, phase = 0, pace, opacity, glow }: Props) {
  const mesh = useRef<Mesh>(null!), day = new Color(color[0]), night = new Color(color[1])
  useFrame(({ clock }, delta) => {
    const m = mesh.current, mat = m.material as MeshBasicMaterial
    const n = smooth(mood.night)
    mat.color.copy(day).lerp(night, n)
    if (opacity) mat.opacity = opacity[0] + (opacity[1] - opacity[0]) * n
    if (reduceMotion) return
    const tex = mat.map!
    tex.offset.x = (tex.offset.x + speed * Math.min(delta, 0.05) * (pace ? pace() : 1)) % 1
    if (bob) m.position.y = position[1] + Math.sin(clock.elapsedTime * bob[1] + phase) * bob[0]
  })
  return (
    <mesh ref={mesh} userData={LIVE} position={position} raycast={noRay}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={map} transparent depthWrite={false} blending={glow ? AdditiveBlending : NormalBlending} />
    </mesh>
  )
}
