import { Window } from '../objects/Window'
import { Cloud } from '../objects/Cloud'
import { Rain } from '../objects/Rain'
import { Radio } from '../objects/Radio'
import { K, shopGlass } from './materials'
import { CafeShell } from './CafeShell'
import { Skyline } from './Skyline'
import { StreetLamp } from './StreetLamp'
import { Festoon } from './Festoon'
import { Counter } from './Counter'
import { Chalkboard } from './Chalkboard'
import { Clock } from './Clock'
import { BackShelf, Bookshelf } from './Bookshelf'
import { Hearth } from './Hearth'
import { LogBasket } from './LogBasket'
import { TartanRug } from './TartanRug'
import { Armchair } from './Armchair'
import { LibraryLamp } from './LibraryLamp'
import { Terrier } from './Terrier'
import { ReadingTable } from './ReadingTable'
import { Guests } from './Guests'
import { FigTree } from './Plants'
import { Umbrellas } from './Umbrellas'
import { Sill } from './Sill'
import { Static } from '../Static'

/**
 * Un café-librairie de la vieille ville d'Édimbourg, un jour de pluie. Dehors, tout est froid : la ville grise, le réverbère,
 * la vitre embuée. Dedans, tout est chaud : le feu, la guirlande, la lampe de banquier, le tartan, les livres.
 */
export function CafeScene() {
  // Tout ce qui ne bouge pas est fusionné par matériau (<Static>) : le café compte des centaines de petites pièces.
  return (
    <Static>
      <CafeShell />
      {/* dehors */}
      <Skyline />
      <StreetLamp />
      <Cloud />
      <Rain />
      <Window frame={K.green} glass={shopGlass} transom />
      <Sill />
      {/* le mur du fond : comptoir, ardoise, guirlande, clients à la fenêtre */}
      <Festoon />
      <Chalkboard />
      <Clock />
      <Counter />
      <Radio position={[-0.62, 1.08, -2.55]} />
      <Guests />
      <FigTree />
      {/* le mur de gauche : bibliothèques et coin du feu */}
      <BackShelf />
      <Hearth />
      <LogBasket />
      <Bookshelf />
      <TartanRug />
      <Armchair />
      <LibraryLamp />
      <Terrier />
      {/* la salle et l'entrée */}
      <ReadingTable />
      <Umbrellas />
    </Static>
  )
}
