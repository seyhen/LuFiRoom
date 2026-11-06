import { Static } from '../Static'
import { Motes } from '../Floaters'
import { Shell } from './Shell'
import { Vitrine } from './Vitrine'
import { StreetView } from './StreetView'
import { DryerStack, WASHER, Washer, WasherLive } from './Machines'
import { Changer } from './Changer'
import { FoldingTable } from './FoldingTable'
import { Boombox } from './Boombox'
import { Counter } from './Counter'
import { Bench, Bin, Cart, CatBasket, FloorSheen, Plant, Shelf, WallDecor, WetFloor } from './Props'
import { Surroundings } from './out/Surroundings'

/** Le pied des lave-linge : le dessus de l'estrade carrelée, au ras du mur de gauche. */
const STEP = 0.1, MX = -2.62

/**
 * Une laverie automatique de quartier, à 2 h du matin, sous la pluie. Contre le mur de gauche, la rangée de lave-linge à hublot
 * (le n° 2 tourne, le linge de couleur culbute) et la colonne de sèche-linge dans le coin ; le radiocassette sur le n° 4 ; au fond,
 * la vitrine et sa porte sur la rue mouillée (le réverbère, la pharmacie d'en face), le banc de plastique où un client s'est
 * assoupi, la sansevieria, le distributeur de lessive et de monnaie ; au milieu, la table où l'on plie le linge, le chariot ; devant,
 * le chat du quartier dans un panier de linge chaud, le seau et son panneau « sol glissant », le comptoir du pressing et sa lampe.
 * Le néon blanc-bleu au mur, le carrelage menthe qui brille.
 */
export function LaundromatScene() {
  return (
    <>
    <Surroundings />
    <Static>
      <Shell />
      <StreetView />
      <Vitrine />
      <FloorSheen />
      <WallDecor />
      <Shelf />
      <DryerStack position={[MX, 0, -2.5]} />
      <Washer position={[MX, STEP, -1.45]} num={1} load />
      <WasherLive position={[MX, STEP, -0.55]} />
      <Washer position={[MX, STEP, 0.35]} num={3} open />
      <Washer position={[MX, STEP, 1.25]} num={4} />
      <Boombox position={[MX + 0.06, STEP + WASHER.H, 1.22]} />
      <Plant position={[-2.68, 0, 2.82]} />
      <Bin position={[-1.85, 0, -2.62]} />
      <Bench position={[0.0, 0, -2.4]} />
      <Changer position={[2.72, 0, -2.75]} />
      <FoldingTable position={[0.15, 0, 0.35]} />
      <Cart position={[1.75, 0, -0.95]} ry={0.25} />
      <CatBasket position={[-1.55, 0, 2.4]} />
      <WetFloor position={[0.3, 0, 2.45]} />
      <Counter position={[2.55, 0, 1.85]} />
      <Motes colors={[0xe8f6ff, 0xbfe6ff]} opacity={[0.25, 0.45]} n={20} />
    </Static>
    </>
  )
}
