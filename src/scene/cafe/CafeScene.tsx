import { Window } from '../objects/Window'
import { Cloud } from '../objects/Cloud'
import { Rain } from '../objects/Rain'
import { Radio } from '../objects/Radio'
import { Lamp } from '../objects/Lamp'
import { SideTable } from '../cabin/SideTable'
import { CafeShell } from './CafeShell'
import { Skyline } from './Skyline'
import { Counter } from './Counter'
import { Chalkboard } from './Chalkboard'
import { Clock } from './Clock'
import { Bookshelf } from './Bookshelf'
import { TartanRug } from './TartanRug'
import { Guests } from './Guests'
import { Umbrellas } from './Umbrellas'

/** Un café d'Édimbourg sous la pluie : comptoir et machine à café, mur de livres, clients, fenêtre sur la ville. */
export function CafeScene() {
  return (
    <>
      <CafeShell />
      <Skyline />
      <Window />
      <Chalkboard />
      <Clock />
      <Counter />
      <Radio position={[-0.62, 1.08, -2.55]} />
      <Bookshelf />
      <TartanRug />
      <Guests />
      <SideTable position={[2.45, 0, -1.55]} />
      <Lamp position={[2.45, 0.62, -1.55]} />
      <Umbrellas />
      <Cloud />
      <Rain />
    </>
  )
}
