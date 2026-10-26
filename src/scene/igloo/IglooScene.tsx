import { Static } from '../Static'
import { Motes } from '../Floaters'
import { IglooShell, polar } from './IglooShell'
import { Aurora, IceWindow } from './Aurora'
import { CrankRadio } from './CrankRadio'
import { StormLantern } from './StormLantern'
import { Thermos } from './Thermos'
import { Mitten } from './Mitten'
import { FishingHole } from './FishingHole'
import { Husky } from './Husky'
import { Backpack, Bedding, IceNiche, Rugs, Snowshoes, Stove, SupplyCrate, facing } from './Props'
import { BlockWall, Fir, Footprints, Skis, Sled, SnowLantern } from './Outside'
import { DryingRack, FishBucket, FishingStool } from './Camp'

/** L'échelle de toute la scène. */
export const IGLOO_SCALE = 1.15

/**
 * Le bivouac d'un explorateur dans un igloo, la nuit sous les aurores : le dôme de blocs de neige ouvert sur le devant, la fenêtre
 * de glace claire au fond (l'aurore), la banquette de couchage et son duvet, la radio de secours à manivelle, la lampe tempête sur
 * la caisse de vivres, le réchaud et sa casserole, le séchoir de linge, le thermos de cacao, la moufle qu'on coud près de l'entrée,
 * le husky endormi, le trou de pêche et son seau. Dehors, sur l'île de neige : le traîneau, les sapins, la lanterne de neige, les skis
 * plantés à l'entrée, les traces de pas, le muret de blocs.
 */
export function IglooScene() {
  return (
    <Static>
     {/* le dôme est rond : un peu plus grand que les pièces carrées, pour remplir le même cadre (les ancres de rooms/igloo.ts en tiennent compte) */}
     <group scale={IGLOO_SCALE}>
      <IglooShell />
      <Aurora />
      <IceWindow />
      <Bedding />
      <Rugs />
      <IceNiche a={212} y={1.2} />
      <CrankRadio position={polar(200, 2.5, 0.45)} ry={facing(200)} />
      <SupplyCrate position={[1.55, 0, -1.75]} ry={facing(311) + Math.PI / 2} top={0.5} />
      <StormLantern position={[1.55, 0.5, -1.75]} />
      <Snowshoes a={292} />
      <Backpack a={276} />
      <Stove position={[0.15, 0, -0.55]} />
      <Husky position={[-1.15, 0.01, 0.25]} ry={0.4} />
      <Thermos position={[0.55, 0, 1.45]} />
      <Mitten position={[-1.45, 0, 1.55]} />
      <FishingHole position={[2.0, 0, 0.75]} />
      <DryingRack position={[0.95, 0, -0.2]} ry={Math.PI / 4} />
      <FishingStool position={[2.95, 0, 1.25]} ry={0.6} />
      <FishBucket position={[2.85, 0, 0.05]} />
      {/* dehors, sur l'île : le traîneau, les sapins, la lanterne de neige, les skis à l'entrée, les traces de pas, le muret */}
      <Sled a={-8} />
      <Fir a={330} r={3.62} h={2.1} />
      <Fir a={183} r={3.72} h={1.8} ry={0.7} />
      <Fir a={104} r={3.62} h={1.05} ry={1.3} />
      <SnowLantern a={48} />
      <BlockWall a={76} />
      <Skis a={140} />
      <Footprints a0={112} a1={156} r0={3.88} r1={3.74} />
      <Motes colors={[0xffffff, 0xd8fff0]} opacity={[0.35, 0.55]} />
     </group>
    </Static>
  )
}
