import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, type Group, type Mesh, type Sprite } from 'three'
import { TAU } from '../../math'
import { mood, reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { useEvery } from '../life'
import { noRay } from '../parts'
import { glowTex } from '../textures'

// Une aile, vue de face : partie de l'épaule, elle s'élargit puis s'effile en pointe vers le bout (le battement la fait tourner
// autour de l'axe du corps). Deux triangles, en x vers le bout de l'aile, y vers le haut, z vers l'avant.
const WING = new BufferGeometry().setAttribute('position', new Float32BufferAttribute([
  0, -0.03, 0.07, 0.26, 0.07, 0.05, 0, 0.03, -0.07,
  0.26, 0.07, 0.05, 0.56, 0.0, -0.06, 0, 0.03, -0.07,
], 3))
WING.computeVertexNormals()
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
 * des murs vus de loin (il passe derrière la pièce). Rien avec `prefers-reduced-motion`, ni onglet caché.
 */
export function FlyBy({ color = 0xffffff, wing = color, height = 2.2, plane = false }: { color?: number; wing?: number; height?: number; plane?: boolean }) {
  const g = useRef<Group>(null!), wings = useRef<Mesh[]>([]), lamp = useRef<Sprite>(null!), bird = useRef<Group>(null!), jet = useRef<Group>(null!)
  const t = useRef(-1), kind = useRef<'bird' | 'plane'>('bird'), flap = useRef(0)
  useEvery(60, 150, () => {
    if (t.current >= 0) return // il est encore en route
    // Au crépuscule, ni l'un ni l'autre : on attend que le soir ou le jour soit là.
    if (mood.night < 0.2) kind.current = 'bird'
    else if (plane && mood.night > 0.8) kind.current = 'plane'
    else return
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
        {/* le corps */}
        <mesh scale={[0.075, 0.06, 0.09]} raycast={noRay}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh ref={(m) => void (m && (wings.current[0] = m))} geometry={WING} raycast={noRay}>
          <meshBasicMaterial color={wing} side={DoubleSide} />
        </mesh>
        <mesh ref={(m) => void (m && (wings.current[1] = m))} geometry={WING} scale={[-1, 1, 1]} raycast={noRay}>
          <meshBasicMaterial color={wing} side={DoubleSide} />
        </mesh>
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
