import { OutdoorPrecip } from '../objects/OutdoorPrecip'
import { StreetGround, StreetGroundStatic } from './StreetGround'
import { StreetProps } from './StreetProps'
import { StreetWeather } from './StreetWeather'
import { GutterCat } from './GutterCat'
import { Terrace } from './Terrace'
import { CURB, RD, SW } from './streetKit'

/** Où la neige s'arrête : le trottoir (devant et à droite), les toits des maisons voisines, sinon la chaussée. */
function snowGround(x: number, z: number) {
  if (x < -3.85 && z < 3.36) return x > -10.85 ? SW + 7.0 : SW + 6.4 // le relieur, puis la maison basse
  if (x > 4.0 && x < 10.6 && z < -3.8) return SW + 7.6 // le pub
  if (x > 10.6 && z < -3.0) return SW + 4.6 // sa voisine, plus basse
  const front = z > 3.3 && z < CURB.front && x > CURB.x0 && x < CURB.cx, right = x > 3.3 && x < CURB.right && z > CURB.zBack && z < CURB.cz
  return front || right ? SW : RD
}

const SNOW_AREA: [number, number, number, number] = [-13, 10, -7, 10]

/**
 * Le bout de rue autour du café : chaussée de pavés mouillés et trottoirs, réverbères, vélo, poubelle, boîte aux lettres, banc, charrette
 * de livres, les maisons voisines (le relieur, le pub), la pluie et la neige qui tombent dehors seulement.
 */
export function Surroundings() {
  return (
    <>
      <StreetGround />
      <StreetWeather />
      {/* la neige du dehors (la pluie a ses filets à elle dans StreetWeather) : aucun tracé quand il ne neige pas */}
      <OutdoorPrecip ground={snowGround} rain={0} snow={130} area={SNOW_AREA} />
    </>
  )
}

/**
 * Le décor immobile de la rue : à poser dans le `<Static>` de la salle (comme la plage), pour que ses matériaux partagés avec le dedans
 * (fonte, pierre claire, bordeaux, vert bouteille, moutarde…) fusionnent avec ceux de la salle : un tracé par matériau pour tout le café.
 */
export function SurroundStatic() {
  return (
    <>
      <StreetGroundStatic />
      <Terrace />
      <StreetProps />
      <GutterCat />
    </>
  )
}
