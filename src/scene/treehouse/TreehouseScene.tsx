import { Static } from '../Static'
import { Motes } from '../Floaters'
import { Deck, RopeLadder } from './Deck'
import { LowerCrown, Oak, UpperCrown } from './Oak'
import { Forest } from './Forest'
import { Banjo, CHEST, CHEST_TOP, Chest } from './Banjo'
import { Hammock } from './Hammock'
import { Birdhouse } from './Birdhouse'
import { JarLanterns } from './JarLanterns'
import { Lemonade } from './Lemonade'
import { Owl, Squirrel } from './Creatures'
import { BookCrate, Boots, ConeBasket, FallenLeaves, Telescope, DryingHerbs, FernPot, HerbJars, LimbCollar, Lounge, NaturalistKit } from './Props'
import { LIMB } from './layout'

/**
 * Une cabane perchée dans un grand chêne, un soir d'été : la plateforme de planches que traverse le tronc, le toit de bardeaux sur
 * le fond, le hamac entre le tronc et la seconde branche, la malle et son banjo, les lanternes en bocal, le nichoir du rouge-gorge,
 * la citronnade sur sa caisse, le coin du naturaliste sur le tapis, les plantes qui sèchent, l'écureuil sur le garde-corps, la
 * hulotte qui se pose le soir ; tout autour le feuillage du chêne, et loin en contrebas la forêt et son ruisseau.
 */
export function TreehouseScene() {
  return (
    <Static>
      <Forest />
      <LowerCrown />
      <Oak />
      <Deck />
      <RopeLadder />
      <LimbCollar />
      <FallenLeaves />
      <Telescope position={[-1.45, 0, 2.4]} ry={-0.5} />
      <Lounge />
      <Chest />
      <Banjo position={[CHEST.x - 0.3, CHEST_TOP, CHEST.z - 0.02]} ry={-0.32} />
      <Hammock />
      <Birdhouse position={[LIMB.x + 0.315, 2.0, LIMB.z]} />
      <JarLanterns x={0.72} />
      <DryingHerbs />
      <HerbJars />
      <BookCrate position={[-1.2, 0, -1.05]} ry={0.35} />
      <group position={[1.05, 0, 1.5]} scale={1.65}>
        <Lemonade position={[0, 0, 0]} ry={-0.3} />
      </group>
      <group position={[-0.1, 0.01, 0.2]} scale={1.55}>
        <NaturalistKit position={[0, 0, 0]} ry={0.3} />
      </group>
      <FernPot position={[2.45, 0, -2.55]} />
      <group position={[2.4, 0, -0.3]} scale={1.35}>
        <ConeBasket position={[0, 0, 0]} />
      </group>
      <group position={[2.2, 0, 2.1]} scale={1.3}>
        <Boots position={[0, 0, 0]} ry={-0.6} />
      </group>
      <Squirrel position={[DECK_RAIL_X, 0.99, -1.75]} ry={-0.55} />
      <Owl position={[1.42, 3.1, -1.48]} ry={-0.75} />
      <UpperCrown />
      {/* le jour, du pollen doré dans la lumière ; le soir, des lucioles vert jaune */}
      <Motes colors={[0xffeab0, 0xdcf27a]} opacity={[0.35, 0.95]} n={40} />
    </Static>
  )
}
const DECK_RAIL_X = 2.9
