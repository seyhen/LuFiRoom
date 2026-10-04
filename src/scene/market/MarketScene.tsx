import { Static } from '../Static'
import { Motes } from '../Floaters'
import { Cloud } from '../objects/Cloud'
import { Rain } from '../objects/Rain'
import { MarketShell } from './MarketShell'
import { BoulevardView } from './BoulevardView'
import { Yatai } from './Yatai'
import { NeonSign } from './NeonSign'
import { TVSet } from './TV'
import { Vending } from './Vending'
import { Street } from './Street'
import { Rainfall } from './Rainfall'
import { Izakaya } from './Izakaya'
import { Overhead } from './Overhead'
import { Details } from './Details'

/**
 * Une ruelle de marché de nuit sous la pluie : une carriole de ramen sous ses lanternes rouges, un wok qui saute, une marmite qui
 * frémit, une enseigne au néon qui bourdonne, une télé de comptoir, un distributeur qui éclaire le pavé, une baie sur un boulevard
 * où passe un tram, des flaques qui reflètent tout ça, et des guirlandes d'ampoules tendues entre les murs.
 */
export function MarketScene() {
  return (
    <Static>
      <MarketShell />
      <BoulevardView />
      <Cloud />
      <Rain />
      <Rainfall />
      <Yatai />
      <NeonSign />
      <TVSet />
      <Vending />
      <Izakaya />
      <Street />
      <Overhead />
      <Details />
      <Motes colors={[0xffd8c0, 0xff9ac8]} opacity={[0.3, 0.55]} n={26} />
    </Static>
  )
}
