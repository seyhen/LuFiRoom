import { Radio } from '../objects/Radio'
import { Cloud } from '../objects/Cloud'
import { Rain } from '../objects/Rain'
import { Static } from '../Static'
import { Motes } from '../Floaters'
import { TrainShell } from './TrainShell'
import { TrainView } from './TrainView'
import { TrainWindow } from './TrainWindow'
import { Table } from './Table'
import { Bunks } from './Bunks'
import { ClubChair, LuggageRack, OpenSuitcase, Slippers, TeaTrolley } from './Luggage'
import { Sideboard, Washstand } from './Corner'
import { PassingLights } from './PassingLights'
import { CatBasket, ChessTable, Flowers, PersianRug, SteamerTrunk } from './Lounge'

/**
 * Un compartiment de voiture-lits, la nuit, quelque part dans les Alpes : boiseries d'acajou, couchettes faites, la lampe
 * à abat-jour plissé, un verre de thé qui tinte ; dehors, le paysage défile et la pluie raye la vitre en biais.
 */
export function TrainScene() {
  return (
    <Static>
      <TrainShell />
      <PersianRug />
      <TrainView />
      <Cloud />
      <Rain />
      <TrainWindow />
      <LuggageRack />
      <Table />
      <Bunks />
      <ClubChair />
      <Sideboard />
      <Radio position={[-2.58, 0.76, 1.6]} />
      <OpenSuitcase />
      <TeaTrolley />
      <Slippers />
      <Washstand />
      <PassingLights />
      <ChessTable />
      <SteamerTrunk />
      <CatBasket />
      <Flowers />
      <Motes colors={[0xffe8c8, 0xffc98a]} opacity={[0.35, 0.5]} n={24} />
    </Static>
  )
}
