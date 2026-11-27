import { airplane } from '../../../rooms/airplane'
import { SkyFadeClock } from '../../outdoor'
import { CloudSea } from './Clouds'
import { Peaks } from './Peaks'
import { Sky } from './Sky'
import { Wing } from './Wing'

/**
 * Le dehors de la cabine : un vol de nuit au-dessus d'une mer de nuages que la lune éclaire (le soleil le jour), une aurore lointaine, des étoiles, et
 * les deux ailes avec leur réacteur et leur strobe : la gauche (feu rouge) derrière le flanc, la droite (feu vert) devant la coupe de la cabine. Tout se fond dans le ciel à la bordure (`skyFade`). Pas de pluie
 * ni de neige dans ce ciel à dix mille mètres : le mauvais temps ne fait que grisailler les nuages et gommer la lune.
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
    </>
  )
}
