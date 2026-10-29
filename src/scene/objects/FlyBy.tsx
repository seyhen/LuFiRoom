import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, type Group, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { blob, cone, ell } from '../blob'
import { mood, reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { useEvery } from '../life'
import { noRay } from '../parts'
import { glowTex } from '../textures'

// Un oiseau de loin, d'une seule peau (scene/blob.ts) : corps en goutte, grosse tête ronde, petit bec arrondi, queue courte ; l'aile est
// un ovale plat qui s'arrondit vers le bout (rien de pointu). x vers le bout de l'aile, y vers le haut, z vers l'avant. Matériau sans
// lumière : l'ombre du ventre et le bout sombre de l'aile sont cuits dans les couleurs des sommets. Calculés une seule fois, à la
// première apparition (le calcul coûte quelques dizaines de millisecondes).
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
let made: { body: BufferGeometry; wing: BufferGeometry } | undefined
const geos = () =>
  (made ??= {
    body: blob([
      ell([0, 0, 0], [0.055, 0.048, 0.085], { color: 0xffffff }),
      ell([0, 0.012, 0.09], 0.037, { color: 0xffffff, k: 0.04 }),
      cone([0, 0.005, 0.11], [0, -0.002, 0.15], 0.013, 0.0075, { color: 0xf2b84a, k: 0.012 }),
      ell([0, -0.004, -0.095], [0.04, 0.013, 0.06], { color: 0xffffff, rot: [0.1, 0, 0], k: 0.04 }),
    ], { h: 0.012, k: 0.04, paint: (p, c) => c.multiplyScalar(0.78 + 0.22 * smooth(clamp01((p.y + 0.05) / 0.1))) }),
    wing: blob([
      ell([0.1, 0, 0.0], [0.11, 0.02, 0.07], { color: 0xffffff }),
      ell([0.26, 0, -0.025], [0.11, 0.017, 0.05], { color: 0xffffff }),
      ell([0.39, 0, -0.05], [0.062, 0.014, 0.036], { color: 0xffffff }),
    ], { h: 0.011, k: 0.05, paint: (p, c) => c.multiplyScalar(1 - 0.55 * smooth(clamp01((p.x - 0.34) / 0.08))) }),
  })
// L'avion, de loin : un fuselage et une aile, en silhouette.
const PLANE = new BufferGeometry().setAttribute('position', new Float32BufferAttribute([
  -0.3, -0.015, 0, 0.3, -0.015, 0, 0.3, 0.015, 0, -0.3, -0.015, 0, 0.3, 0.015, 0, -0.3, 0.015, 0,
  -0.04, 0, 0, 0.1, 0, 0, -0.1, -0.06, 0,
], 3))

// Un passage loin derrière la pièce, de gauche à droite à l'écran : la caméra regarde en (1, 0.8, 1), la droite de l'écran est
// (1, 0, -1). Le centre du passage, (BACK, ·, BACK), est assez loin pour que l'oiseau ne frôle jamais les murs.
const R = [Math.SQRT1_2, 0, -Math.SQRT1_2], BACK = -6, FROM = -10, SPAN = 20

/**
 * De loin en loin (toutes les une à deux minutes et demie), un oiseau qui traverse le ciel derrière la pièce en battant des ailes,
 * le jour ; avec `plane`, la nuit, un avion lointain à la place, dont le feu clignote. `color` : le corps de l'oiseau, `wing` : ses ailes
 * (une mouette blanche aux ailes gris perle, qui se détache sur un ciel clair). `height` : la hauteur de son passage, juste au-dessus
 * des murs vus de loin (il passe derrière la pièce). Rien avec `prefers-reduced-motion`, ni onglet caché, ni par mauvais temps.
 */
export function FlyBy({ color = 0xffffff, wing = color, height = 2.2, plane = false }: { color?: number; wing?: number; height?: number; plane?: boolean }) {
  const g = useRef<Group>(null!), wings = useRef<Group[]>([]), lamp = useRef<Sprite>(null!), bird = useRef<Group>(null!), jet = useRef<Group>(null!)
  // les maillages du corps et des ailes ne sont calculés qu'au premier passage d'un oiseau
  const [shape, setShape] = useState<ReturnType<typeof geos>>()
  const t = useRef(-1), kind = useRef<'bird' | 'plane'>('bird'), flap = useRef(0)
  // Pont de développement (retiré du build) : `window.__lofi.flyby(0.5)` lance l'oiseau à mi-chemin, pour le regarder sans attendre.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const bridge = ((window as unknown as { __lofi?: Record<string, unknown> }).__lofi ??= {})
    bridge.flyby = (k = 0.5) => {
      setShape(geos())
      kind.current = 'bird'
      t.current = k
    }
    return () => void delete bridge.flyby
  }, [])
  useEvery(60, 150, () => {
    if (t.current >= 0) return // il est encore en route
    // Ni oiseau ni avion sous la pluie, l'orage ou la neige (comme le ciel du fond, ui/SkyLife.tsx).
    if (Math.max(mood.rain, mood.snow, mood.storm) > 0.3) return
    // Au crépuscule, ni l'un ni l'autre : on attend que le soir ou le jour soit là.
    if (mood.night < 0.2) kind.current = 'bird'
    else if (plane && mood.night > 0.8) kind.current = 'plane'
    else return
    if (kind.current === 'bird') setShape(geos())
    t.current = 0
  })
  useFrame(({ clock }, delta) => {
    const grp = g.current
    if (reduceMotion || t.current < 0) {
      grp.visible = false
      return
    }
    const dt = Math.min(delta, 0.05), isPlane = kind.current === 'plane'
    t.current += dt / (isPlane ? 30 : 18)
    if (t.current >= 1) {
      t.current = -1
      grp.visible = false
      return
    }
    const k = t.current, s = FROM + SPAN * k
    grp.visible = true
    bird.current.visible = !isPlane
    jet.current.visible = isPlane
    const y = height + (isPlane ? 0.1 + k * 0.3 : Math.sin(k * TAU) * 0.2)
    grp.position.set(BACK + R[0] * s, y, BACK + R[2] * s)
    if (isPlane) lamp.current.material.opacity = Math.sin(clock.elapsedTime * 4) > 0.6 ? 0.95 : 0.1
    else {
      // Il bat des ailes, puis plane un moment : la vitesse du battement ne change pas, seule son ampleur.
      flap.current += dt * 8
      const glide = Math.max(0, Math.sin(k * TAU * 2.5)), a = Math.sin(flap.current) * (0.7 - glide * 0.55) + glide * 0.12
      wings.current[0].rotation.z = a
      wings.current[1].rotation.z = -a
    }
  })
  return (
    // Le groupe tourné face à la caméra : les ailes s'ouvrent le long de l'écran, on lit un oiseau qui bat des ailes, pas une tache.
    <group ref={g} userData={LIVE} visible={false} rotation-y={Math.PI / 4}>
      <group ref={bird} scale={1.6}>
        {/* le corps, et deux ailes qui battent autour de leur épaule */}
        <mesh geometry={shape?.body} raycast={noRay}>
          <meshBasicMaterial color={color} vertexColors />
        </mesh>
        {[1, -1].map((s, i) => (
          <group key={s} ref={(el) => void (el && (wings.current[i] = el))} position={[s * 0.03, 0.012, 0.01]} scale={[s, 1, 1]}>
            <mesh geometry={shape?.wing} raycast={noRay}>
              <meshBasicMaterial color={wing} vertexColors />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={jet} visible={false} scale={1.2}>
        <mesh geometry={PLANE} raycast={noRay}>
          <meshBasicMaterial color={0x2a2a48} side={DoubleSide} />
        </mesh>
        <sprite ref={lamp} scale={0.4} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xff5a5a} transparent depthWrite={false} opacity={0.9} />
        </sprite>
      </group>
    </group>
  )
}
