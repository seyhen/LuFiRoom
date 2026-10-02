import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type DirectionalLight, type HemisphereLight } from 'three'
import { isActive, useStore } from '../state/store'
import { approach, lerp, smooth } from '../math'
import type { Room } from '../rooms/types'
import { mood } from './anim'

// Intensités × π : three r155+ n'a plus l'éclairage « legacy » de r128 (voir materials.ts).
const PI = Math.PI

/** Ciel et soleil (ou lune) de la pièce. Avance aussi les transitions jour / nuit et pluie (~0.9 s) pour toute la scène. */
export function Lights({ room }: { room: Room }) {
  const hemi = useRef<HemisphereLight>(null!), sun = useRef<DirectionalLight>(null!)
  const col = useMemo(() => {
    const { hemi, sun } = room.light, c = ([d, n]: [number, number]) => [new Color(d), new Color(n)] as const
    return { sky: c(hemi.sky), ground: c(hemi.ground), sun: c(sun.color) }
  }, [room])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = useStore.getState(), { hemi: h, sun: u } = room.light
    mood.night = approach(mood.night, s.night ? 1 : 0, dt * 1.1)
    mood.rain = approach(mood.rain, room.dimmedBy && isActive(s, room.dimmedBy) ? 1 : 0, dt * 0.8)
    const e = smooth(mood.night)
    hemi.current.color.copy(col.sky[0]).lerp(col.sky[1], e)
    hemi.current.groundColor.copy(col.ground[0]).lerp(col.ground[1], e)
    hemi.current.intensity = lerp(h.intensity[0], h.intensity[1], e) * (1 - mood.rain * 0.12) * PI
    sun.current.color.copy(col.sun[0]).lerp(col.sun[1], e)
    sun.current.intensity = lerp(u.intensity[0], u.intensity[1], e) * (1 - mood.rain * 0.3) * PI
  }, -1)
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight ref={sun} position={[5, 10, 7]} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.03}>
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 1, 30]} />
      </directionalLight>
    </>
  )
}
