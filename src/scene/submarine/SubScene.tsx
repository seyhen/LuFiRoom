import { Static } from '../Static'
import { Motes } from '../Floaters'
import { SubShell } from './SubShell'
import { DeepView, Porthole } from './DeepView'
import { Sonar } from './Sonar'
import { Gauge } from './Gauge'
import { ValveTank } from './ValveTank'
import { Telegraph } from './Telegraph'
import { Organ, ORGAN } from './Organ'
import { Table } from './BankerLamp'
import { Seating } from './Seating'
import { Decor } from './Decor'

/**
 * Le carré d'un sous-marin de légende, posé sur l'abîme : un hublot de laiton sur l'eau turquoise, une console de sonar qui
 * balaie, un manomètre, un tube de ballast à vanne rouge, un télégraphe de machines, un orgue de capitaine, une table ronde sous
 * la lampe de banquier avec son bocal de poissons rouges, une banquette de cuir, un scaphandre de cuivre.
 */
export function SubScene() {
  return (
    <Static>
      <SubShell />
      <DeepView />
      <Porthole />
      <Sonar />
      <Gauge />
      <ValveTank />
      <Telegraph />
      <Organ position={[ORGAN.x + 0.2, 1.0, ORGAN.z]} />
      <Table />
      <Seating />
      <Decor />
      <Motes colors={[0xc8f4ee, 0x8ff0e0]} opacity={[0.3, 0.5]} n={22} />
    </Static>
  )
}
