import { Motes } from '../Floaters'
import { Static } from '../Static'
import { BathSteam } from './BathSteam'
import { BathMat, Hamper, Print, Robe, ShelfUnit, Sink, Stool, STOOL_TOP, TowelBasket, TowelLadder } from './Fixtures'
import { Faucet } from './Faucet'
import { Kalimba } from './Kalimba'
import { HangingFern, MonsteraStand, Strelitzia } from './Plants'
import { Shell } from './Shell'
import { Shower, ShowerStall } from './Shower'
import { Suds } from './Suds'
import { TUB_AT, Tub } from './Tub'
import { ArchWindow, SillCandles } from './Window'
import { B } from './materials'
import { TUB } from './tubGeo'
import { Surroundings } from './out/Surroundings'

/** Le tabouret du kalimba est un peu agrandi : l'instrument doit se lire de loin. */
const STOOL_S = 1.2

/**
 * Une salle de bain pastel un soir de pluie fine, sur une ville de colline : la baignoire à pieds de lion sous la fenêtre en arche
 * (mousse, canard, robinet col de cygne, plateau de bain), la douche à effet pluie dans sa niche de zellige rose, le lavabo sur colonne
 * et son miroir, le sèche-serviettes, la robe de chambre, le panier à linge, l'étagère de serviettes roulées, le tabouret du kalimba, des
 * plantes, des bougies sur la tablette (la lampe : jour / nuit). La vapeur monte du bain, la buée gagne la vitre quand l'eau coule.
 */
export function BathroomScene() {
  return (
    <>
      <Surroundings />
      <Static>
        <Shell />
        <ShowerStall />
        <Sink position={[-2.93, 0, -0.85]} />
        <TowelLadder position={[-1.85, 0, -2.86]} />
        <Robe position={[-2.55, 2.15, -2.99]} />
        <Hamper position={[-2.5, 0, -2.45]} />
        <ShelfUnit position={[2.55, 0, -2.78]} />
        <BathMat position={[0.1, 0, -1.35]} />
        <TowelBasket position={[2.7, 0, 0.0]} />
        <Stool position={[1.5, 0, 0.7]} s={STOOL_S} />
        <Strelitzia position={[-2.62, 0, 2.98]} s={0.9} />
        <MonsteraStand position={[2.35, 0, 2.7]} />
        <HangingFern position={[-2.2, 3.75, -2.99]} />
        <Print p={[-1.4, 2.75, -2.975]} w={0.32} h={0.42} m={B.printA} />
        <Print p={[-0.85, 2.95, -2.975]} w={0.24} h={0.32} m={B.printB} />
      </Static>
      <Tub />
      <ArchWindow />
      <Faucet />
      <Suds />
      <Shower />
      <Kalimba position={[1.5, STOOL_TOP * STOOL_S, 0.7]} ry={Math.PI / 4} />
      <SillCandles position={[1.0, 1.75, -2.86]} />
      {/* la vapeur du bain, toujours un peu, plus quand l'eau coule */}
      <BathSteam at={[TUB_AT[0] + 0.1, TUB.water + 0.18, TUB_AT[2]]} every={2.6} hot={['faucet', 'suds', 'shower']} size={0.6} spread={0.4} />
      <Motes colors={[0xfff2e4, 0xffd6b8]} opacity={[0.3, 0.45]} />
    </>
  )
}
