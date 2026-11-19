import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { clearOf } from '../../paint'
import { noRay } from '../../parts'
import { LIVE } from '../../Static'
import { O } from './materials'
import { S } from './layout'

/** Où sont la lune (et le soleil le jour) et l'aurore, en coordonnées d'écran (voir layout.ts). */
const MOON = S(-5.0, 5.6, -12)
const AURORA = S(-7.0, 3.4, -12)

/**
 * Le ciel qu'on voit loin derrière : la lune (ou le soleil le jour) et son halo, en haut à gauche de l'écran, au-dessus des nuages qui s'y fondent ;
 * l'aurore, des rideaux verts qui ondulent, plus bas à gauche. Ce sont des plans qui regardent la caméra, dessinés sans test de profondeur (la mer
 * de nuages couvre tout le haut de l'écran) : on les pose loin des murs de la cabine. Les étoiles sont celles de la mer de nuages (`skyFade` avec
 * `stars`). La pluie, l'orage et la neige voilent tout (`clearOf`).
 */
export function Sky() {
  const camera = useThree((s) => s.camera)
  const g = useRef<Group>(null!), aur = useRef<Mesh>(null!)
  useLayoutEffect(() => {
    g.current.quaternion.copy(camera.quaternion)
  }, [camera])
  useFrame(({ clock }) => {
    const n = smooth(mood.night), clear = clearOf({ n, r: mood.rain, s: mood.snow, st: mood.storm })
    O.moon.opacity = n * clear
    O.sun.opacity = (1 - n) * clear
    O.halo.opacity = 0.55 * clear
    O.halo.color.setRGB(0.74 + (1 - n) * 0.26, 0.8 + (1 - n) * 0.15, 1 - (1 - n) * 0.3)
    O.aurora.opacity = n * clear * 0.85
    // l'aurore ondule à peine : le rideau se déplace de côté
    if (!reduceMotion) aur.current.position.x = Math.sin(clock.elapsedTime * 0.05) * 0.25
  })
  return (
    <group ref={g} userData={LIVE}>
      <group position={MOON}>
        <mesh material={O.halo} scale={5.4} raycast={noRay} renderOrder={-2}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        <mesh material={O.moon} raycast={noRay} renderOrder={-1}>
          <circleGeometry args={[0.72, 36]} />
        </mesh>
        <mesh material={O.sun} raycast={noRay} renderOrder={-1}>
          <circleGeometry args={[0.6, 36]} />
        </mesh>
      </group>
      <group position={AURORA}>
        <mesh ref={aur} material={O.aurora} raycast={noRay} renderOrder={-3}>
          <planeGeometry args={[6, 3]} />
        </mesh>
      </group>
    </group>
  )
}
