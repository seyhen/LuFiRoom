import { Boombox } from './Boombox'
import { Static } from '../Static'
import { RoofShell } from './RoofShell'
import { Skyline } from './Skyline'
import { WaterTower } from './WaterTower'
import { StringLights } from './StringLights'
import { Brazier } from './Brazier'
import { FireCorner, FrontCorner, RadioCrate, Sofa, Telescope } from './Lounge'
import { Laundry } from './Laundry'
import { Pigeons } from './Pigeons'
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
      <Sofa />
      <FireCorner />
      <Brazier />
      <RadioCrate />
      <Boombox position={[-2.55, 0.5, 2.35]} />
      <Telescope />
      <FrontCorner />
      <Laundry />
      <NeonSign />
      <FireEscape />
      <Vent />
    </Static>
  )
}
