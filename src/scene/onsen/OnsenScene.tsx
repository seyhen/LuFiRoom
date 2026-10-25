import { Static } from '../Static'
import { FallingLeaf } from './FallingLeaf'
import { Shamisen } from './Shamisen'
import { OnsenShell } from './OnsenShell'
import { Mountains } from './Mountains'
import { Pool } from './Pool'
import { ShishiOdoshi, Spout } from './Water'
import { Furin, Maple, StoneLantern } from './Garden'
import { BathThings, TeaTray, TowelRack } from './Props'
import { Macaque } from './Macaque'
import { POOL } from './Pool'
import { MatchaTable } from './MatchaTable'
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
      <Shamisen position={[-2.45, 0.42, 2.0]} />
      <MatchaTable />
      <BathThings />
      <TowelRack />
      {/* le baigneur : un macaque, et son petit près du bord */}
      <Macaque p={[POOL.cx - 0.55, POOL.y - 0.1, POOL.cz - 0.4]} />
      <Macaque p={[POOL.cx - 0.05, POOL.y - 0.07, POOL.cz - 0.55]} s={0.6} ry={0.5} />
      <Shrubs />
      <Noren />
      <Chochin />
      <Fireflies />
      <FallingLeaf />
    </Static>
  )
}
