import { Static } from '../Static'
import { Motes } from '../Floaters'
import { Cat } from '../objects/Cat'
import { L } from './materials'
import { LighthouseShell } from './LighthouseShell'
import { Porthole, SeaView } from './SeaView'
import { Staircase } from './Staircase'
import { Stove } from './Stove'
import { ChartTable } from './ChartTable'
import { Barometer } from './Barometer'
import { Foghorn } from './Foghorn'
import { Bell } from './Bell'
import { Concertina } from './Concertina'
import { Reading } from './Reading'
import { SeaChest, CHEST } from './SeaChest'
import { WallDecor } from './WallDecor'

/**
 * Le quartier du gardien, au sommet d'un phare battu par la tempête : un hublot de laiton sur la houle, un escalier de fonte qui
 * monte vers la lanterne, le poêle et sa bouilloire, la table à cartes à la lueur d'une lampe à huile, un fauteuil de cuir,
 * un baromètre qui s'affole, la corne de brume, la cloche de la bouée, et un concertina sur le coffre.
 */
export function LighthouseScene() {
  return (
    <Static>
      <LighthouseShell />
      <SeaView />
      <Porthole />
      <Staircase />
      <WallDecor />
      <Stove />
      <ChartTable />
      <Barometer />
      <Foghorn />
      <Bell />
      <Reading />
      <Cat position={[-0.7, 0.035, 0.55]} rotation={0.5} coat={{ fur: L.catFur, light: L.catLight, dark: L.catDark }} />
      <SeaChest />
      <Concertina position={[CHEST.x, CHEST.lid, CHEST.z - 0.05]} />
      <Motes colors={[0xfff0d0, 0xffc98a]} opacity={[0.3, 0.5]} n={20} />
    </Static>
  )
}
