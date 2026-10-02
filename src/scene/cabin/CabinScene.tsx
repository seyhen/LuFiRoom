import { Window } from '../objects/Window'
import { Radio } from '../objects/Radio'
import { Lamp } from '../objects/Lamp'
import { FairyLights } from '../objects/FairyLights'
import { CabinShell } from './CabinShell'
import { SnowView } from './SnowView'
import { Fireplace } from './Fireplace'
import { Chest } from './Chest'
import { Armchair } from './Armchair'
import { SideTable } from './SideTable'
import { Firewood } from './Firewood'
import { Sheepskin } from './Sheepskin'

/** La cabane sous la neige : cheminée, fenêtre sur la tempête, coffre et radio, fauteuil, lampe. */
export function CabinScene() {
  return (
    <>
      <CabinShell />
      <SnowView />
      <Window />
      <FairyLights />
      <Sheepskin />
      <Fireplace />
      <Chest />
      <Radio position={[1.9, 0.71, -2.7]} />
      <Armchair />
      <SideTable />
      <Lamp position={[1.4, 0.62, -1.75]} />
      <Firewood />
    </>
  )
}
