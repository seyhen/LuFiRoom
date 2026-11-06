import { Static } from '../Static'
import { StreetGround } from './StreetGround'
import { StreetProps } from './StreetProps'
import { StreetWeather } from './StreetWeather'
import { GutterCat } from './GutterCat'
import { Terrace } from './Terrace'

/**
 * Le bout de rue autour du café : chaussée de pavés mouillés et trottoirs, réverbères, vélo, poubelle, boîte aux lettres, banc, charrette
 * de livres, les maisons voisines (le relieur, le pub) et la pluie qui tombe dehors seulement.
 */
export function Surroundings() {
  return (
    <>
      <Static>
        <Terrace />
        <StreetProps />
        <GutterCat />
      </Static>
      <StreetGround />
      <StreetWeather />
    </>
  )
}
