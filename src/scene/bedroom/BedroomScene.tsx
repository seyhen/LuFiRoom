// La scène de la chambre : décor, mobilier et objets interactifs (hors hotspots, que la pièce ajoute).
import { Static } from '../Static'
import { Motes } from '../Floaters'
import { Window } from '../objects/Window'
import { Lamp } from '../objects/Lamp'
import { FairyLights } from '../objects/FairyLights'
import { Radio } from '../objects/Radio'
import { Cat } from '../objects/Cat'
import { BedroomShell } from './BedroomShell'
import { WindowView } from './WindowView'
import { Curtains } from './Curtains'
import { WindowLight } from './WindowLight'
import { Rug } from './Rug'
import { Bed } from './Bed'
import { Nightstand } from './Nightstand'
import { Shelf } from './Shelf'
import { Desk } from './Desk'
import { Laptop } from './Laptop'
import { Chair } from './Chair'
import { Monstera } from './Monstera'
import { SnakePlant } from './SnakePlant'
import { Fan } from './Fan'
import { Cloud } from '../objects/Cloud'
import { Rain } from '../objects/Rain'
import { Polaroids } from './Polaroids'
import { MoonGarland } from './MoonGarland'
import { Slippers } from './Slippers'
import { ReadingNook } from './ReadingNook'
import { B } from './materials'

export function BedroomScene() {
  return (
    <>
      {/* le décor immobile, regroupé en quelques tracés (voir Static) */}
      <Static>
        <BedroomShell />
        <Rug />
        <Bed />
        <Nightstand />
        <Shelf />
        <Desk />
        <Laptop position={[1.42, 1.364, -2.55]} />
        <Chair />
        <Monstera />
        <SnakePlant />
        <Polaroids />
        <Slippers />
        <ReadingNook />
        <FairyLights />
      </Static>
      <WindowView />
      <Window glass={B.rainGlass} />
      <Curtains />
      <WindowLight />
      <Lamp position={[-2.68, 0.73, -2.72]} />
      <MoonGarland />
      <Motes />
      <Radio position={[2.25, 1.35, -2.6]} />
      <Fan position={[0.62, 1.35, -2.6]} />
      <Cat position={[-1.25, 0.9, -0.6]} rotation={-0.25} />
      <Cloud />
      <Rain />
    </>
  )
}
