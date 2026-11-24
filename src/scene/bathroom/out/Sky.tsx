import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { FlashVeil } from '../../objects/FlashVeil'
import { clearOf } from '../../paint'
import { noRay } from '../../parts'
import { LIVE } from '../../Static'
import type { View } from './layout'
import { sky } from './materials'

const RAINBOW = 12.5

/**
 * Le ciel derrière les bulles : des étoiles fines et la lune la nuit, un arc-en-ciel pâle de jour quand le temps est clair, et l'éclair de l'orage
 * (`FlashVeil`). Des plans qui regardent la caméra, très loin derrière tout (les bulles et la mousse passent devant) ; la pluie, la neige et
 * l'orage les voilent (`clearOf`) : l'arc-en-ciel s'efface dès la bruine. La lune est posée où il n'y a pas de grosse bulle.
 */
export function Sky({ view, moon }: { view: View; moon: [number, number] }) {
  const camera = useThree((s) => s.camera)
  const g = useRef<Group>(null!), tw = useRef(0)
  useLayoutEffect(() => {
    g.current.quaternion.copy(camera.quaternion)
  }, [camera])
  useFrame((_, delta) => {
    const n = smooth(mood.night), clear = clearOf({ n, r: mood.rain, s: mood.snow, st: mood.storm })
    if (!reduceMotion) tw.current += Math.min(delta, 0.05)
    sky.moon.opacity = n * clear
    sky.halo.opacity = 0.65 * n * clear
    sky.rainbow.opacity = 0.62 * (1 - n) * clear * clear
    sky.stars.uniforms.uAmount.value = n * clear * 1.5
    sky.stars.uniforms.uTw.value = tw.current
  })
  const [moonX, moonY] = moon
  const arcX = view.r * 0.12, arcY = view.ut - 0.3 - RAINBOW
  // le groupe est au point visé et tourné comme la caméra : ses enfants se posent en coordonnées d'écran (x vers la droite, y vers le haut, z vers la caméra)
  return (
    <group ref={g} position={[0, 1.85, 0]} userData={LIVE}>
      <mesh position={[0, 0, -33]} material={sky.stars} raycast={noRay} renderOrder={-4} frustumCulled={false}>
        <planeGeometry args={[110, 80]} />
      </mesh>
      <mesh position={[moonX, moonY, -28]} material={sky.halo} scale={7.5} raycast={noRay} renderOrder={-3}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh position={[moonX, moonY, -27.9]} material={sky.moon} raycast={noRay} renderOrder={-2}>
        <circleGeometry args={[0.85, 40]} />
      </mesh>
      <mesh position={[arcX, arcY + RAINBOW / 2, -30]} material={sky.rainbow} scale={[RAINBOW * 2, RAINBOW, 1]} raycast={noRay} renderOrder={-3}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <FlashVeil position={[0, 0, -26]} size={[90, 60]} strength={0.9} />
    </group>
  )
}
