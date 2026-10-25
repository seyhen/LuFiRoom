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

/**
 * Un toit-terrasse de Brooklyn, un soir d'été : la ville tout autour qui s'allume, le château d'eau, un braséro, le linge
 * qui sèche, des pigeons sur le parapet, une guirlande au-dessus du canapé.
 */
export function RoofScene() {
  return (
    <Static>
      <RoofShell />
      <Skyline />
      <WaterTower />
      <StringLights />
      <Planter />
      <OliveTree />
      <Herbs />
      <Pigeons />
      {/* un pigeon qui passe le jour (la nuit, les tours cacheraient un avion : rien) */}
      <FlyBy color={0x6a6680} wing={0x585470} height={2.4} />
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
    </Static>
  )
}
