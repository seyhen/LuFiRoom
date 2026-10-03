import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import type { ObjectId, V3 } from '../../rooms/types'
import { approach, rand } from '../../math'
import { flameMats } from '../materials'
import { SPH, noRay } from '../parts'
import { useParticles } from '../anim'
import { emberTex, glowTex } from '../textures'
import { LIVE } from '../Static'

// Les flammes : abscisse, profondeur, hauteur, déphasage.
const FLAMES = [{ x: -0.2, z: 0.02, h: 1, p: 0 }, { x: 0.18, z: 0.06, h: 1.15, p: 1.7 }, { x: 0, z: -0.08, h: 1.4, p: 3.1 }]

interface Props {
  /** L'objet dont le son allume le feu. */
  id: ObjectId
  /** Pied des flammes, dans le repère du parent. */
  position?: V3
  /** Taille des flammes (1 : celles de la cabane). */
  size?: number
  /** Lumière du feu : position (relative au pied des flammes), intensité de base. */
  light?: { at: V3; intensity?: number; distance?: number }
  /** Halo : position (relative) et taille. */
  glow?: { at: V3; scale: number }
  /** Braises qui montent : largeur du foyer, profondeur (relatives). */
  embers?: { spread: number; at: V3 }
  /** Appelé à chaque image avec l'intensité du feu (0 éteint → 1 allumé), pour faire rougeoyer des braises, par exemple. */
  onFrame?: (lit: number, t: number) => void
}

/** Un feu : trois flammes qui dansent, sa lumière orange qui vacille, un halo et des braises. Il s'allume et s'éteint en douceur. */
export function Flames({ id, position = [0, 0, 0], size = 1, light, glow, embers, onFrame }: Props) {
  const fire = useRef<Group>(null!), flames = useRef<Group[]>([]), lamp = useRef<PointLight>(null), halo = useRef<Sprite>(null)
  const sparks = useParticles(), lit = useRef(0), since = useRef(0)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime
    lit.current = approach(lit.current, isActive(useStore.getState(), id) ? 1 : 0, dt * 2.2)
    const k = lit.current
    fire.current.visible = k > 0.01
    flames.current.forEach((f, i) => {
      const { h, p } = FLAMES[i], w = Math.sin(t * 9 + p) * 0.12 + Math.sin(t * 14.3 + p * 2) * 0.07
      f.scale.set(1 + w * 0.5, k * h * (1 + w), 1 + w * 0.5)
      f.rotation.z = Math.sin(t * 5 + p) * 0.1
    })
    const flicker = Math.sin(t * 11) * 0.12 + Math.sin(t * 17.3) * 0.1
    if (lamp.current) lamp.current.intensity = k * ((light?.intensity ?? 1.5) + flicker) * Math.PI // × π : voir materials.ts
    if (halo.current) halo.current.material.opacity = k * (0.62 + Math.sin(t * 9) * 0.06)
    since.current += dt
    if (embers && k > 0.6 && since.current > 0.22) {
      since.current = 0
      const [ex, ey, ez] = embers.at
      sparks.emit(emberTex, ex + rand(-embers.spread, embers.spread), ey, ez + rand(-0.1, 0.1) * size, { size: 0.1 * size, life: 1.9, vy: 0.55 * size, sway: 0.14 * size, peak: 0.95 })
    }
    onFrame?.(k, t)
  })
  return (
    <group position={position} userData={LIVE}>
      <group ref={fire} scale={size}>
        {FLAMES.map(({ x, z, h }, i) => (
          <group key={i} ref={(el) => void (el && (flames.current[i] = el))} position={[x, 0, z]}>
            <mesh geometry={SPH} material={flameMats.outer} scale={[0.17, 0.3 * h, 0.12]} position={[0, 0.3 * h * 0.9, 0]} raycast={noRay} />
            <mesh geometry={SPH} material={flameMats.core} scale={[0.09, 0.17 * h, 0.07]} position={[0, 0.17 * h * 0.9, 0.03]} raycast={noRay} />
          </group>
        ))}
      </group>
      {light && <pointLight ref={lamp} color={0xff8a3d} intensity={0} distance={light.distance ?? 9} decay={1.5} position={light.at} />}
      {glow && (
        <sprite ref={halo} scale={glow.scale} position={glow.at} raycast={noRay}>
          <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      )}
      <group ref={sparks.group} />
    </group>
  )
}
