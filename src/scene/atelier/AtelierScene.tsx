import { Static } from '../Static'
import { Motes } from '../Floaters'
import { AtelierShell } from './AtelierShell'
import { ParisView } from './ParisView'
import { DraftingTable, Stool } from './DraftingTable'
import { Desk, Turntable } from './Desk'
import { Kitchenette } from './Kitchenette'
import { Gallery, Rafters } from './Rafters'
import { PaintEasel } from './PaintEasel'
import { FloorNook } from './FloorNook'
import { Bookcase, CanvasCorner, HangingPlants, ReadingCorner, RugAndLadder } from './Corner'

/**
 * Un atelier d'illustratrice sous les toits de Paris : la verrière d'acier sur les toits de zinc et la tour Eiffel,
 * la table à dessin et sa lampe d'architecte, le bureau, le tourne-disque, la bouilloire, un fauteuil pour lire.
 */
export function AtelierScene() {
  return (
    <Static>
      <AtelierShell />
      <ParisView />
      <HangingPlants />
      <Bookcase />
      <DraftingTable />
      <Stool />
      <Turntable />
      <PaintEasel />
      <Desk />
      <Kitchenette />
      <RugAndLadder />
      <ReadingCorner />
      <CanvasCorner />
      <FloorNook />
      <Rafters />
      <Gallery />
      <Motes colors={[0xfff0d0, 0xffd28a]} opacity={[0.4, 0.55]} />
    </Static>
  )
}
