import { Motes } from '../Floaters'
import { Part, cyl, rbox } from '../parts'
import { Static } from '../Static'
import { Shell } from './Shell'
import { Phonograph } from './Phonograph'
import { Pond } from './Pond'
import { MusicBox } from './MusicBox'
import { RainBarrel } from './RainBarrel'
import { Lantern } from './Lantern'
import { FernStand, HangingBasket, LemonTree, Monstera, Palm } from './Plants'
import { FallenLeaves, Odds, PlantStand, PottingBench, Rug, WickerChair } from './Props'
import { G } from './materials'
import { Surroundings } from './out/Surroundings'

/** La petite table de rotin sous le phonographe : un plateau rond, trois pieds, une entretoise tressée. */
function RattanTable({ position }: { position: [number, number, number] }) {
  const top = 0.72
  return (
    <group position={position}>
      <Part geo={cyl(0.34, 0.34, 0.04, 26)} m={G.wicker} p={[0, top - 0.02, 0]} />
      <Part geo={cyl(0.36, 0.36, 0.02, 26)} m={G.woodDark} p={[0, top - 0.05, 0]} castShadow={false} />
      {[0, 1, 2].map((i) => (
        <group key={i} rotation-y={(i / 3) * Math.PI * 2 + 0.5}>
          <Part geo={cyl(0.025, 0.03, top - 0.06, 8)} m={G.wicker} p={[0.24, (top - 0.06) / 2, 0]} rotation-z={0.06} castShadow={false} />
        </group>
      ))}
      <Part geo={cyl(0.22, 0.22, 0.025, 20)} m={G.wicker} p={[0, 0.22, 0]} castShadow={false} />
      {/* sous le plateau : le plateau de bois, deux disques de rechange en pochette */}
      <Part geo={rbox(0.24, 0.012, 0.24, 0.005)} m={G.cushion2} p={[0, 0.238, 0]} rotation-y={0.3} castShadow={false} />
    </group>
  )
}

/**
 * Une serre victorienne un soir de pluie, dans le parc d'une orangerie : la charpente de fonte vert bouteille et ses vitres embuées,
 * le carrelage ancien, le phonographe sur sa table de rotin, le bassin de nénuphars où chante une grenouille, la boîte à musique sur
 * la table de lecture près du fauteuil d'osier et du tapis, le tonneau d'eau de pluie sous sa gouttière, la paillasse de rempotage,
 * le présentoir de pots, les palmiers, le monstera, le citronnier, les fougères et les suspensions ; la lanterne qui s'allume le soir.
 */
export function GreenhouseScene() {
  return (
    <>
      <Surroundings />
      <Static>
        <Shell />
        <Rug position={[1.4, 0, 1.75]} />
        <PottingBench position={[-0.55, 0, -2.55]} />
        <PlantStand position={[-2.62, 0, -0.1]} />
        <RattanTable position={[-2.0, 0, 1.9]} />
        <WickerChair position={[0.75, 0, 1.95]} ry={Math.PI / 2 - 0.2} />
        <Odds position={[-1.5, 0, -1.2]} />
        <Palm position={[2.55, 0, -2.65]} />
        <Palm position={[-2.65, 0, 2.7]} s={0.8} />
        <Monstera position={[-2.5, 0, 1.0]} s={1.1} />
        <LemonTree position={[-0.5, 0, 0.2]} />
        <FernStand position={[0.1, 0, 2.7]} />
        <FernStand position={[-0.4, 0, -1.3]} h={0.9} />
        <FallenLeaves position={[2.0, 0, -2.1]} />
        {/* les suspensions, accrochées sous la sablière */}
        <HangingBasket position={[-1.6, 3.95, -2.78]} drop={0.7} seed={1} />
        <HangingBasket position={[0.4, 3.95, -2.78]} drop={0.55} seed={2} kind="fern" />
        <HangingBasket position={[2.0, 3.95, -2.78]} drop={0.75} seed={3} />
        <HangingBasket position={[-2.78, 3.95, -0.9]} drop={0.6} seed={4} kind="fern" />
        <HangingBasket position={[-2.78, 3.95, 0.9]} drop={0.8} seed={5} />
        <HangingBasket position={[-2.78, 3.95, 2.5]} drop={0.55} seed={6} kind="fern" />
      </Static>
      <Phonograph position={[-2.0, 0.72, 1.9]} ry={0.3} />
      <Pond position={[1.3, 0, -1.3]} />
      <MusicBox position={[1.9, 0, 1.5]} />
      <RainBarrel position={[-2.35, 0, -2.35]} />
      <Lantern position={[0.2, 0, -0.2]} />
      <Motes colors={[0xfff4d0, 0xbfe8c8]} opacity={[0.35, 0.55]} />
    </>
  )
}
