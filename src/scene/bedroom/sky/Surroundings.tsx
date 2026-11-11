import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { SphereGeometry } from 'three'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Batch, Part } from '../../parts'
import { Static } from '../../Static'
import { cloudItems, } from './clouds'
import { CLOUD, K } from './materials'
import { Rainbow } from './Rainbow'
import { Plushies, Balloons, garland } from './Toys'
import { Islet } from './Islet'
import { Precip } from './Precip'

const LUMP = new SphereGeometry(1, 10, 7)
const GLOW = [K.hill, K.under, K.wall, K.roofRose, K.roofMint, K.leaf, K.door, K.balloonPink, K.balloonMint, K.balloonButter]
for (const m of GLOW) m.emissive.copy(m.color)

/**
 * Le dehors de la chambre : elle flotte sur un banc de nuages au milieu d'un ciel doux, avec une lune et des étoiles en peluche,
 * une guirlande de petits nuages, un arc-en-ciel discret, des ballons, et l'îlot du village que la fenêtre montre au loin.
 * La pluie et la neige tombent autour (jamais dans la chambre) ; la nuit, tout se teinte d'indigo et de petites lueurs scintillent.
 */
export function Surroundings() {
  const { items, geos } = useMemo(() => {
    const base = cloudItems(), g = garland()
    return { items: [...base, ...g.flags], geos: g.geos }
  }, [])
  useFrame(() => {
    const n = smooth(mood.night), r = Math.max(mood.rain, mood.snow * 0.5)
    const c = K.cloud.color
    c.copy(CLOUD.day).lerp(CLOUD.rain, r * 0.9).lerp(CLOUD.storm, mood.storm * 0.8).lerp(CLOUD.night, n)
    K.cloud.emissive.copy(CLOUD.emDay).lerp(CLOUD.emNight, n)
    K.cloud.emissiveIntensity = 0.1 - r * 0.04 + n * 0.08
    // l'arc-en-ciel : tendre le jour, une lueur la nuit, effacé sous l'orage et la neige
    K.rainbow.opacity = 0.9 * (1 - n * 0.65) * (1 - mood.storm) * (1 - Math.min(1, mood.snow * 1.3)) * (1 - r * 0.15)
    K.win.emissiveIntensity = n * 0.95
    // la nuit, ce qui est loin garde un peu de sa couleur (la lune l'éclaire) : un léger éclat propre
    for (const m of GLOW) m.emissiveIntensity = 0.04 + n * 0.22
  })
  return (
    <>
      <Static>
        <Batch geo={LUMP} m={K.cloud} items={items} />
        {geos.map((g, i) => <Part key={i} geo={g} m={K.thread} castShadow={false} receiveShadow={false} />)}
        <Islet />
      </Static>
      <Rainbow />
      <Plushies />
      <Balloons />
      <Precip />
    </>
  )
}
