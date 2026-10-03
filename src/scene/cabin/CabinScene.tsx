import { Window } from '../objects/Window'
import { Radio } from '../objects/Radio'
import { FairyLights } from '../objects/FairyLights'
import { Static } from '../Static'
import { CabinShell } from './CabinShell'
import { SnowView } from './SnowView'
import { Fireplace } from './Fireplace'
import { Chest } from './Chest'
import { Armchair } from './Armchair'
import { SideTable } from './SideTable'
import { Firewood } from './Firewood'
import { Dog } from './Dog'
import { Lantern } from './Lantern'
import { ArmchairThrow, Cocoa, DryingLine, PineconeBasket, Rug, Sled, WallGear } from './Cozy'
import { C } from './materials'

/**
 * Le chalet de rondins sous la neige : la neige sur le toit, la cheminée de pierres de rivière, un husky qui dort devant le
 * feu, deux chocolats chauds, des chaussettes qui sèchent, des raquettes au mur, une luge, la tempête à la fenêtre.
 */
export function CabinScene() {
  return (
    <Static>
      <CabinShell />
      <SnowView />
      <Window frame={C.beamDark} />
      <FairyLights />
      <Rug />
      <Fireplace />
      <DryingLine />
      <Dog />
      <Chest />
      <Radio position={[1.9, 0.71, -2.7]} />
      <Armchair />
      <ArmchairThrow />
      <SideTable />
      <Lantern position={[1.25, 0.62, -1.85]} />
      <Cocoa />
      <Firewood />
      <PineconeBasket />
      <WallGear />
      <Sled />
    </Static>
  )
}
