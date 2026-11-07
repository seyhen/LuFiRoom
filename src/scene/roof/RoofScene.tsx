import { Boombox } from './Boombox'
import { Static } from '../Static'
import { RoofShell } from './RoofShell'
import { Skyline } from './Skyline'
import { WaterTower } from './WaterTower'
import { StringLights } from './StringLights'
import { Brazier } from './Brazier'
import { FireCorner, FrontCorner, RadioCrate, Sofa, Telescope } from './Lounge'
import { Laundry } from './Laundry'
import { WateringCan } from './WateringCan'
import { Pigeons } from './Pigeons'
import { FlyBy } from '../objects/FlyBy'
import { Herbs, OliveTree, Planter } from './Planters'
import { FireEscape, NeonSign, Vent } from './Neon'
import { BackNook } from './BackNook'
import { Surroundings } from './out/Surroundings'

/**
 * Un toit-terrasse de Brooklyn, un soir d'été : la ville tout autour qui s'allume, le château d'eau, un braséro, le linge
 * qui sèche, des pigeons sur le parapet, une guirlande au-dessus du canapé.
 */
export function RoofScene() {
  return (
    <>
    <Surroundings />
    <Static>
      <RoofShell />
      <Skyline />
      <WaterTower />
      <StringLights />
      <Planter />
      <OliveTree />
      <Herbs />
      <Pigeons />
      {/* un pigeon qui passe le jour, au-dessus des tours du fond : à 2,4 il filait derrière elles et seul un bout d’aile violet dépassait, comme un arc à droite de la flèche (la nuit, les tours cacheraient un avion : rien) */}
      <FlyBy color={0x6a6680} wing={0x585470} height={5.0} />
      <Sofa />
      <FireCorner />
      <Brazier />
      <RadioCrate />
      <Boombox position={[-2.55, 0.5, 2.35]} />
      <Telescope />
      <FrontCorner />
      <WateringCan />
      <Laundry />
      <NeonSign />
      <FireEscape />
      <Vent />
      <BackNook />
    </Static>
    </>
  )
}
