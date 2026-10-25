import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type DirectionalLight, type HemisphereLight } from 'three'
import { fallingAsleep, useStore } from '../state/store'
import { skyOf, snowOf, wetOf } from '../state/weather'
import { approach, lerp, rand, smooth } from '../math'
import type { Room } from '../rooms/types'
import { DUSK } from '../state/daylight'
import { mood, reduceMotion } from './anim'
import { life } from './life'
import { SNOW } from './snowTop'

// Intensités × π : three r155+ n'a plus l'éclairage « legacy » de r128 (voir materials.ts).
const PI = Math.PI
// Les teintes du crépuscule et de l'aube, au milieu d'un passage fait par l'horloge : un soleil orangé, un ciel rosé.
const DUSK_SUN = new Color(0xffa36e), DUSK_SKY = new Color(0xffc2b0)
// La neige posée dehors (snowTop.ts) : blanche le jour, bleutée sous la lune.
const SNOW_DAY = new Color(0xf4f7fb), SNOW_NIGHT = new Color(0xdde4f4)

/**
 * Ciel et soleil (ou lune) de la pièce. Avance aussi les transitions jour / nuit, pluie, neige et orage pour toute la scène : moins d'une seconde
 * à la main, `DUSK` secondes quand l'horloge fait passer la pièce au soir ou au matin (avec une lumière dorée au milieu).
 * Et l'orage : quand la météo est à l'orage (ou que le son `storm` de la pièce joue, la tempête du phare), un éclair de loin en loin (le compteur `thunders`, que le ciel du fond et
 * le tonnerre écoutent).
 */
export function Lights({ room }: { room: Room }) {
  const hemi = useRef<HemisphereLight>(null!), sun = useRef<DirectionalLight>(null!)
  const col = useMemo(() => {
    const { hemi, sun } = room.light, c = ([d, n]: [number, number]) => [new Color(d), new Color(n)] as const
    return { sky: c(hemi.sky), ground: c(hemi.ground), sun: c(sun.color) }
  }, [room])
  // Rare : le premier une à deux minutes après le début de l'averse, puis un toutes les deux minutes et demie à cinq minutes.
  const bolt = useRef({ next: rand(60, 120) * life.speed, second: 0 })
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05), s = useStore.getState(), { hemi: h, sun: u } = room.light
    const b = bolt.current
    const sky = skyOf(s), stormy = sky === 'storm' || (!!room.storm && s.on[room.storm])
    if (stormy && !s.leaving && !fallingAsleep(s) && document.visibilityState === 'visible') {
      b.next -= dt
      if (b.next <= 0) {
        b.next = rand(150, 300) * life.speed
        // Avec `prefers-reduced-motion`, le tonnerre seul, sans lumière qui clignote.
        if (!reduceMotion) {
          life.flash = 1
          b.second = rand(0.14, 0.22) // une seconde lueur, plus faible, juste après
        }
        useStore.setState((st) => ({ thunders: st.thunders + 1 }))
      }
    }
    if (b.second > 0 && (b.second -= dt) <= 0) life.flash = Math.max(life.flash, 0.55)
    life.flash = life.flash < 0.01 ? 0 : life.flash * Math.exp(-dt * 7)
    const slow = s.dusk && room.skyLife !== false
    mood.night = approach(mood.night, s.night ? 1 : 0, s.dusk ? dt / DUSK : dt * 1.1)
    mood.rain = approach(mood.rain, wetOf(sky), dt * 0.8)
    mood.snow = approach(mood.snow, snowOf(sky), dt * 0.8)
    mood.storm = approach(mood.storm, stormy ? 1 : 0, dt * 0.8)
    // Un ciel couvert, de pluie ou de neige (la neige un peu moins sombre).
    const gray = Math.max(mood.rain, mood.snow * 0.75)
    const e = smooth(mood.night)
    SNOW.uSnow.value = Math.min(1, smooth(mood.snow) * 1.4)
    SNOW.uSnowColor.value.copy(SNOW_DAY).lerp(SNOW_NIGHT, e)
    SNOW.uSnowGlow.value = 0.06 + e * 0.16
    SNOW.uUp.value.set(0, 1, 0).transformDirection(camera.matrixWorldInverse)
    // Au milieu d'un crépuscule (ou d'une aube) : le soleil se dore, le ciel rosit ; rien sous la mer.
    const gold = slow ? Math.sin(Math.PI * mood.night) * (1 - gray * 0.7) : 0
    hemi.current.color.copy(col.sky[0]).lerp(col.sky[1], e).lerp(DUSK_SKY, gold * 0.35)
    hemi.current.groundColor.copy(col.ground[0]).lerp(col.ground[1], e)
    // L'éclair éclaire un peu la pièce, comme par la fenêtre : un ciel un peu plus clair, sans toucher au soleil (ni aux ombres).
    // Sous la mer (`skyLife: false`), aucun éclair ne descend jusqu'au hublot : le tonnerre seul, très loin.
    const flash = room.skyLife === false ? 0 : life.flash
    hemi.current.intensity = (lerp(h.intensity[0], h.intensity[1], e) * (1 - gray * 0.12) + flash * 0.15) * PI
    sun.current.color.copy(col.sun[0]).lerp(col.sun[1], e).lerp(DUSK_SUN, gold * 0.55)
    // L'orage assombrit encore un peu le soleil : son ciel d'ardoise est plus lourd que celui d'une pluie.
    sun.current.intensity = lerp(u.intensity[0], u.intensity[1], e) * (1 - gray * 0.3 - smooth(mood.storm) * 0.1) * PI
  }, -1)
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight ref={sun} position={[5, 10, 7]} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0008} shadow-normalBias={0.06}>
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 1, 30]} />
      </directionalLight>
    </>
  )
}
