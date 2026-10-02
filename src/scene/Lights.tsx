import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { DirectionalLight, HemisphereLight } from 'three'
import { isActive, useStore } from '../state/store'
import { approach, lerp, smooth } from '../math'
import { COL } from './materials'
import { mood } from './anim'

// Intensités × π : three r155+ n'a plus l'éclairage « legacy » de r128 (voir materials.ts).
const PI = Math.PI

/** Ciel et soleil (ou lune). Avance aussi les transitions jour / nuit et pluie (~0.9 s) pour toute la scène. */
export function Lights() {
  const hemi = useRef<HemisphereLight>(null!), sun = useRef<DirectionalLight>(null!)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = useStore.getState()
    mood.night = approach(mood.night, s.night ? 1 : 0, dt * 1.1)
    mood.rain = approach(mood.rain, isActive(s, 'cloud') ? 1 : 0, dt * 0.8)
    const e = smooth(mood.night)
    hemi.current.color.copy(COL.hemiDay).lerp(COL.hemiNight, e)
    hemi.current.groundColor.copy(COL.gDay).lerp(COL.gNight, e)
    hemi.current.intensity = lerp(0.62, 0.42, e) * (1 - mood.rain * 0.12) * PI
    sun.current.color.copy(COL.sunDay).lerp(COL.sunNight, e)
    sun.current.intensity = lerp(0.6, 0.28, e) * (1 - mood.rain * 0.3) * PI
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
