import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, type Group, type Mesh, type Sprite } from 'three'
import { TAU } from '../../math'
import { mood, reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { useEvery } from '../life'
import { noRay } from '../parts'
import { glowTex } from '../textures'

/** Une aile : un triangle effilé, plié à l'emplanture (le battement la fait tourner autour de l'axe x). */
const wing = new BufferGeometry().setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0.5, 0.05, -0.06, 0.34, 0.02, 0.2, 0, 0, 0, 0.34, 0.02, 0.2, 0.06, 0, 0.16], 3))
const PLANE_BODY = new BufferGeometry().setAttribute('position', new Float32BufferAttribute([-0.22, 0, 0, 0.22, 0, 0, 0, 0.05, 0.03], 3))

// Un passage derrière la pièce, de gauche à droite à l'écran : la caméra regarde en (1, 0.8, 1), la droite de l'écran est (1, 0, -1).
// L'oiseau est tourné de face à la caméra (ses ailes s'ouvrent le long de l'écran), pour qu'on lise un V qui bat et pas une tache.
const R = [Math.SQRT1_2, 0, -Math.SQRT1_2], FROM = -8.5, SPAN = 17

/**
 * Un oiseau qui traverse le ciel derrière la pièce de temps en temps (toutes les 35 à 80 s), les ailes battantes ; avec `plane`, la nuit,
 * un avion lointain à la place, qui clignote. `color` : celui de l'oiseau (blanc pour une mouette, sombre pour un pigeon). `height` : sa hauteur.
 */
export function FlyBy({ color = 0xffffff, height = 4.4, plane = false }: { color?: number; height?: number; plane?: boolean }) {
  const g = useRef<Group>(null!), wings = useRef<Mesh[]>([]), lamp = useRef<Sprite>(null!), t = useRef(-1), kind = useRef<'bird' | 'plane'>('bird')
  const bird = useRef<Group>(null!), jet = useRef<Group>(null!)
  useEvery(35, 80, () => {
    kind.current = plane && mood.night > 0.6 ? 'plane' : 'bird'
    t.current = 0
  })
  useFrame(({ clock }, delta) => {
    const grp = g.current
    if (reduceMotion || t.current < 0) {
      grp.visible = false
      return
    }
    const isPlane = kind.current === 'plane', dur = isPlane ? 24 : 15
    t.current += Math.min(delta, 0.05) / dur
    if (t.current >= 1) {
      t.current = -1
      grp.visible = false
      return
    }
    const s = FROM + SPAN * t.current, now = clock.elapsedTime
    grp.visible = true
    bird.current.visible = !isPlane
    jet.current.visible = isPlane
    const y = height + (isPlane ? -0.2 + t.current * 0.4 : Math.sin(t.current * TAU * 1.5) * 0.35)
    grp.position.set(-3 + R[0] * s, y, -3 + R[2] * s)
    if (isPlane) lamp.current.material.opacity = Math.sin(now * 5) > 0.5 ? 0.95 : 0.15
    else {
      const flap = Math.sin(now * 9) * 0.75
      wings.current[0].rotation.z = flap
      wings.current[1].rotation.z = -flap
    }
  })
  return (
    <group ref={g} userData={LIVE} visible={false} rotation-y={Math.PI / 4}>
      {/* l'oiseau : un corps ovale, deux ailes qui battent */}
      <group ref={bird} scale={0.95}>
        <mesh scale={[0.13, 0.09, 0.09]} raycast={noRay}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh ref={(m) => void (m && (wings.current[0] = m))} geometry={wing} raycast={noRay}>
          <meshBasicMaterial color={color} side={DoubleSide} />
        </mesh>
        <mesh ref={(m) => void (m && (wings.current[1] = m))} geometry={wing} scale={[-1, 1, 1]} raycast={noRay}>
          <meshBasicMaterial color={color} side={DoubleSide} />
        </mesh>
      </group>
      {/* l'avion : une croix sombre et un feu qui clignote */}
      <group ref={jet} visible={false} scale={0.8}>
        <mesh geometry={PLANE_BODY} raycast={noRay}>
          <meshBasicMaterial color={0x20203a} side={DoubleSide} />
        </mesh>
        <sprite ref={lamp} scale={0.45} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xff4a4a} transparent depthWrite={false} opacity={0.9} />
        </sprite>
      </group>
    </group>
  )
}
