import { Radio } from '../objects/Radio'
import { Static } from '../Static'
import { OnsenShell } from './OnsenShell'
import { Mountains } from './Mountains'
import { Pool } from './Pool'
import { ShishiOdoshi, Spout } from './Water'
import { Furin, Maple, StoneLantern } from './Garden'
import { BathThings, TeaTray } from './Props'
import { Shrubs } from './Shrubs'
import { Chochin, Fireflies, Noren } from './Signs'

/**
 * Un bain en plein air (rotenburo) au bord d'un ryokan, en automne : le bassin qui fume entre ses rochers, l'eau de la source
 * qui coule du bambou, le shishi-odoshi, l'érable rouge, la lanterne de pierre, le furin sous l'avant-toit, et les montagnes
 * dans la brume au-dessus de la palissade.
 */
export function OnsenScene() {
  return (
    <Static>
      <OnsenShell />
      <Mountains />
      <Maple />
      <Pool />
      <Spout />
      <ShishiOdoshi />
      <StoneLantern />
      <Furin />
      <TeaTray />
      <Radio position={[-2.45, 0.42, 2.0]} />
      <BathThings />
      <Shrubs />
      <Noren />
      <Chochin />
      <Fireflies />
    </Static>
  )
}
