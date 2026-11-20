import { Motes } from '../Floaters'
import { Static } from '../Static'
import { Bulkhead, Trolley } from './Galley'
import { CabinLights } from './CabinLights'
import { Cello } from './Cello'
import { ExitDoor } from './Door'
import { Headphones } from './Headphones'
import { Hublots } from './Hublot'
import { Overhead } from './Overhead'
import { BookAndPouch, Duffel, PillowBag, Suitcase } from './Props'
import { ReadingLight } from './ReadingLight'
import { Seats } from './Seats'
import { Shell } from './Shell'
import { Sleeper } from './Sleeper'
import { MealTray, Tablet, TrayTable, TY } from './Table'
import { ROW_X, SEAT_Z } from './layout'
import { Surroundings } from './out/Surroundings'

/**
 * Une cabine d'avion de nuit, en coupe, sur une mer de nuages : deux rangées de sièges bleu nuit contre le flanc (un dormeur au hublot de la
 * rangée 1, un violoncelle sanglé au hublot de la rangée 2), un couloir à pastilles lumineuses, une cloison arrière avec son office, son
 * rideau et ses toilettes, une porte de secours, des coffres à bagages qui cachent leur lumière indigo. Quatre objets : le casque (la radio) et
 * la tablette de vol, le hublot (les moteurs), le violoncelle (la berceuse), la lampe de lecture (jour / nuit).
 */
export function AirplaneScene() {
  const [r1, r2] = ROW_X
  return (
    <>
      <Surroundings />
      <Static>
        <Shell />
      </Static>
      <Overhead />
      <Seats />
      <Sleeper />
      <Hublots />
      <ExitDoor />
      <Bulkhead />
      <Trolley position={[-1.3, 0, 0.55]} />
      {/* rangée 2, sièges A, B, C : le violoncelle, le plateau repas (B), la tablette du casque (C) : le casque et le violoncelle restent à 44 px l'un de l'autre sur un téléphone */}
      <Cello position={[r2 - 0.11, 0.605, SEAT_Z.A]} />
      <Static>
        <TrayTable position={[r2, 0, SEAT_Z.B]} />
        <TrayTable position={[r2, 0, SEAT_Z.C]} />
      </Static>
      <Headphones position={[r2 + 0.62, TY, SEAT_Z.C - 0.2]} />
      <Tablet position={[r2 + 0.48, TY, SEAT_Z.C + 0.2]} />
      <MealTray position={[r2, 0, SEAT_Z.B]} />
      {/* rangée 1 : le livre et la trousse, le plaid et l'oreiller sous plastique */}
      <BookAndPouch position={[r1, 0, SEAT_Z.B]} />
      <PillowBag position={[r1, 0, SEAT_Z.C]} />
      <Suitcase position={[2.55, 0, 0.6]} />
      <Duffel position={[2.3, 0, 2.4]} />
      <ReadingLight />
      <CabinLights />
      <Motes colors={[0xf4f0ff, 0xb4c4ff]} opacity={[0.25, 0.4]} />
    </>
  )
}
