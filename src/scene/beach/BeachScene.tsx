import { Ukulele } from './Ukulele'
import { Cat } from '../objects/Cat'
import { FairyLights } from '../objects/FairyLights'
import { Static } from '../Static'
import { Motes } from '../Floaters'
import { BeachShell } from './BeachShell'
import { SeaView } from './SeaView'
import { Curtains } from './Curtains'
import { SunGlow } from './SunGlow'
import { Daybed } from './Daybed'
import { PeacockChair } from './PeacockChair'
import { RattanLamp } from './RattanLamp'
import { CoffeeTable } from './CoffeeTable'
import { Gull } from './Gull'
import { FlyBy } from '../objects/FlyBy'
import { WindChimes } from './WindChimes'
import { BeachBag, DeckChair, FishingNet, Hats, Macrame, RecordCrate, ShellShelf, Surfboard } from './Corner'
import { SunRays } from './SunRays'
import { HangingPothos, Kentia, Monstera } from './Plants'
import { EggChair } from './EggChair'
import { B } from './materials'
import { RainStick } from './RainStick'
import { Hearthside } from './Hearthside'

const ginger = { fur: B.butter, light: B.linen, dark: B.coral }

/**
 * Un bungalow au bord de l'eau, au coucher du soleil. La grande porte ouvre sur la terrasse, le sable et la mer ; dedans,
 * du bois blanchi, du rotin, du lin, un chat roux qui dort sur le lit de jour.
 */
export function BeachScene() {
  return (
    <Static>
      <BeachShell />
      <SeaView />
      <SunGlow />
      <Curtains />
      <WindChimes />
      <Gull />
      {/* une mouette au loin le jour, un avion la nuit */}
      <FlyBy color={0xfffaf4} wing={0xb8b4c4} height={2.1} plane />
      <FairyLights />
      <Daybed />
      <Cat position={[-2.4, 0.4, -0.45]} rotation={0.35} coat={ginger} />
      <ShellShelf />
      <Macrame />
      <PeacockChair />
      <RattanLamp />
      <CoffeeTable />
      <RecordCrate />
      <Ukulele position={[-2.45, 0.5, 1.55]} />
      <Hats />
      <Surfboard />
      <HangingPothos position={[-2.95, 3.0, 0.9]} />
      {/* le kentia, loin du voilage (qui le traversait en gonflant) et du cabas */}
      <Kentia position={[2.7, 0, 0.6]} />
      <Monstera position={[2.85, 0, -1.25]} />
      <EggChair />
      <RainStick />
      <Hearthside />
      <BeachBag />
      <FishingNet />
      <DeckChair />
      <SunRays />
      <Motes colors={[0xffe2a8, 0xd8e4ff]} opacity={[0.45, 0.6]} />
    </Static>
  )
}
