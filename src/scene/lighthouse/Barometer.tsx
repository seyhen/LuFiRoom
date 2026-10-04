import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { L } from './materials'

/** Le baromètre : son centre sur le mur du fond. */
export const BARO = { x: -0.55, y: 3.0 }
// Le cadran va de TEMPÊTE (0) à SEC (1) sur trois quarts de tour ; l'aiguille part du centre.
const needleAngle = (k: number) => -(Math.PI * 0.75 + k * Math.PI * 1.5 + Math.PI / 2)

/**
 * Le baromètre de laiton, rond comme un hublot : son cadran peint (TEMPÊTE, PLUIE, VARIABLE, BEAU, SEC), un anneau de laiton, une
 * aiguille rouge. Au calme elle dort sur VARIABLE ; quand le vent hurle, elle plonge vers TEMPÊTE en tremblant.
 */
export function Barometer() {
  const g = useRef<Group>(null!), needle = useRef<Group>(null!), k = useRef(0.5)
  useSquash('barometer', g)
  useFrame(({ clock }, delta) => {
    const on = isActive(useStore.getState(), 'barometer'), t = clock.elapsedTime
    k.current = approach(k.current, on ? 0.06 : 0.5, Math.min(delta, 0.05) * (on ? 0.5 : 0.35))
    const tremble = reduceMotion ? 0 : (on ? Math.sin(t * 17) * 0.012 + Math.sin(t * 5.3) * 0.02 : Math.sin(t * 0.6) * 0.006)
    needle.current.rotation.z = needleAngle(k.current + tremble)
  })
  return (
    <group ref={g} userData={{ id: 'barometer' }} position={[BARO.x, BARO.y, -2.94]}>
      {/* le cadran, sous un anneau de laiton à bords ronds */}
      <Part geo={cyl(0.4, 0.4, 0.05, 36)} m={L.oakDark} rotation-x={Math.PI / 2} />
      <Part m={L.brass} p={[0, 0, 0.03]}>
        <torusGeometry args={[0.33, 0.045, 12, 44]} />
      </Part>
      <mesh material={L.baro} position={[0, 0, 0.034]}>
        <circleGeometry args={[0.31, 40]} />
      </mesh>
      <Part geo={cyl(0.3, 0.3, 0.008, 36)} m={L.glass} p={[0, 0, 0.065]} rotation-x={Math.PI / 2} castShadow={false} />
      <group ref={needle} position={[0, 0, 0.05]}>
        <Part geo={rbox(0.014, 0.24, 0.006, 0.004)} m={L.red} p={[0, 0.11, 0]} castShadow={false} />
        <Part geo={rbox(0.014, 0.06, 0.006, 0.004)} m={L.red} p={[0, -0.03, 0]} castShadow={false} />
      </group>
      <Part geo={SPH} m={L.brass} scale={0.028} p={[0, 0, 0.058]} castShadow={false} />
      {/* l'anneau pour l'accrocher, et son clou */}
      <Part m={L.brassDull} p={[0, 0.46, 0.01]} castShadow={false}>
        <torusGeometry args={[0.05, 0.009, 6, 14]} />
      </Part>
    </group>
  )
}
