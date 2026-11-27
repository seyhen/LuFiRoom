import { airplane } from '../../../rooms/airplane'
import { SkyFadeClock } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { SEA } from './layout'
import { CloudSea } from './Clouds'
import { Peaks } from './Peaks'
import { Sky } from './Sky'
import { Wing } from './Wing'

/**
 * Le dehors de la cabine : un vol de nuit au-dessus d'une mer de nuages que la lune éclaire (le soleil le jour), une aurore lointaine, des étoiles, et
 * les deux ailes avec leur réacteur et leur strobe : la gauche (feu rouge) derrière le flanc, la droite (feu vert) devant la coupe de la cabine. Tout se fond dans le ciel à la bordure (`skyFade`). La pluie et la neige
 * tombent autour de l'avion (`OutdoorPrecip`), grisaillent les nuages et gomment la lune et les étoiles.
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={airplane} />
      <Sky />
      <CloudSea />
      <Peaks />
      <Wing side={-1} />
      <Wing side={1} />
      {/* la pluie et la neige tombent autour de l'avion jusqu'à la mer de nuages, jamais dans la cabine ; sans elles, la mer de nuages
          (qui remplit tout l'écran) cachait la météo du ciel du fond et rien ne se voyait */}
      <OutdoorPrecip ground={SEA} area={[-13, 13, -12, 12]} covered />
    </>
  )
}
