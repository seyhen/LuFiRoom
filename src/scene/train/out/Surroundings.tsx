import { useFrame } from '@react-three/fiber'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { SkyFadeClock } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { train } from '../../../rooms/train'
import { R } from './materials'
import { GROUND, Line } from './Line'
import { NextCar } from './Cars'
import { Hills } from './Hills'

const AREA: [number, number, number, number] = [-15, 15, -12, 11]

/** Le soir, les fenêtres de la voiture suivante et du chalet s'allument (un peu dès qu'il fait sombre). */
function Windows() {
  useFrame(() => {
    const k = Math.min(1, smooth(mood.night) + mood.rain * 0.2 + mood.storm * 0.3)
    R.carSide.emissiveIntensity = k * 1.25
    R.chalet.emissiveIntensity = k * 1.1
  })
  return null
}

/**
 * Le dehors du train de nuit : la voie qui file dans un pré des Alpes, avec ses poteaux télégraphiques et leurs fils, sa clôture
 * de perches, un signal, un chalet, des bosquets et des fleurs, des collines boisées qui défilent moins vite ; derrière le mur de
 * gauche, la voiture-lits suivante aux fenêtres allumées. La pluie et la neige tombent dehors seulement.
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={train} />
      <Windows />
      <Static>
        <NextCar />
      </Static>
      <Line />
      <Hills />
      <OutdoorPrecip ground={GROUND} area={AREA} />
    </>
  )
}
