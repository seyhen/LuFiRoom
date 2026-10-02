// La scène de la chambre : décor, mobilier et objets interactifs (hors hotspots, que la pièce ajoute).
import { Shell } from '../objects/Shell'
import { WindowView } from '../objects/WindowView'
import { Window } from '../objects/Window'
import { Rug } from '../objects/Rug'
import { Bed } from '../objects/Bed'
import { Nightstand } from '../objects/Nightstand'
import { Lamp } from '../objects/Lamp'
import { Shelf } from '../objects/Shelf'
import { FairyLights } from '../objects/FairyLights'
import { Desk } from '../objects/Desk'
import { Chair } from '../objects/Chair'
import { Plant } from '../objects/Plant'
import { Radio } from '../objects/Radio'
import { Fan } from '../objects/Fan'
import { Cat } from '../objects/Cat'
import { Cloud } from '../objects/Cloud'
import { Rain } from '../objects/Rain'

export function BedroomScene() {
  return (
    <>
      <Shell />
      <WindowView />
      <Window />
      <Rug />
      <Bed />
      <Nightstand />
      <Lamp />
      <Shelf />
      <FairyLights />
      <Desk />
      <Chair />
      <Plant />
      <Radio />
      <Fan />
      <Cat />
      <Cloud />
      <Rain />
    </>
  )
}
