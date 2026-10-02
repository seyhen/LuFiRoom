import { Static } from '../Static'
import { Snowfall } from '../Floaters'
import { Window } from '../objects/Window'
import { Lamp } from '../objects/Lamp'
import { Cat } from '../objects/Cat'
import { FairyLights } from '../objects/FairyLights'
import { WIN } from '../parts'
import { CabinShell } from './CabinShell'
import { SnowView } from './SnowView'
import { Fireplace } from './Fireplace'
import { Chest } from './Chest'
import { Armchair } from './Armchair'
import { SideTable } from './SideTable'
import { Sheepskin } from './Sheepskin'
import { BraidedRug } from './BraidedRug'
import { ChristmasTree } from './ChristmasTree'
import { Gifts } from './Gifts'
import { Wreath } from './Wreath'
import { LogBasket } from './LogBasket'
import { Pouf } from './Pouf'
import { Cocoa } from './Cocoa'
import { Lantern } from './Lantern'
import { Turntable } from './Turntable'
import { RecordCrate } from './RecordCrate'
import { WallDecor } from './WallDecor'
import { Poinsettia } from './Poinsettia'
import { CoatPegs } from './CoatPegs'
import { Candles, type Candle } from '../objects/Candles'
import { warmFairy } from './materials'

// Sur l'appui de la fenêtre, de part et d'autre.
const SILL = WIN.y0 + 0.02
const WINDOW_CANDLES: Candle[] = [
  { p: [0.5, SILL, -2.86], h: 0.24 },
  { p: [0.72, SILL, -2.82], h: 0.15, r: 0.05 },
  { p: [2.32, SILL, -2.86], h: 0.2 },
]

/**
 * La cabane de Noël sous la neige : cheminée habillée et son feu, sapin et cadeaux, fauteuil sur un tapis tressé,
 * chat sur la peau de mouton, chocolat chaud, lanterne sur des livres, coffre avec le tourne-disque et un poinsettia, patères
 * (écharpe, bonnet, moufles), lampe, couronne, bougies à la fenêtre sur la tempête.
 */
export function CabinScene() {
  return (
    <>
      {/* le décor immobile, regroupé en quelques tracés (voir Static) */}
      <Static>
        <CabinShell />
        <FairyLights mats={warmFairy} />
        <Wreath />
        <CoatPegs />
        <WallDecor />
        <BraidedRug />
        <Sheepskin />
        <LogBasket />
        <Chest />
        <Poinsettia />
        <Armchair />
        <Pouf />
        <SideTable />
        <Lantern />
        <ChristmasTree />
        <Gifts />
        <RecordCrate />
      </Static>
      <SnowView />
      <Snowfall />
      <Window />
      <Candles items={WINDOW_CANDLES} />
      <Fireplace />
      <Turntable position={[1.9, 0.71, -2.64]} />
      <Lamp position={[1.05, 0.62, -1.7]} />
      <Cocoa />
      <Cat position={[-1.55, 0.12, -1.3]} rotation={0.1} />
    </>
  )
}
