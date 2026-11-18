import { Motes } from '../Floaters'
import { Static } from '../Static'
import { Bedding } from './Bedding'
import { Fireflies } from './Fireflies'
import { LampArm, Lantern } from './Lantern'
import { Boots, Bunting, Kilim, PinnedMap, RainJacket, Rucksack, Stool, WallPocket } from './Props'
import { CanvasLife, Shell } from './Shell'
import { Stove } from './Stove'
import { Ukulele } from './Ukulele'
import { CENTER } from './shape'
import { Surroundings } from './out/Surroundings'

/**
 * Une tente de camping un soir de pluie, au milieu d'une pinède : une grande tente-cloche de toile ecru sur son mât (ouverte vers
 * nous), la toile qui s'éclaire d'ambre quand la lampe à pétrole brille (la nuit) et que la pluie y laisse des taches ; le sac de
 * couchage sur son matelas, le kilim rond sous le mât, le sac à dos et les bottes, le ciré qui sèche au mât, la pochette de rangement
 * et la carte punaisée, la guirlande de fanions ; l'ukulélé sur sa caisse, la table du réchaud et son percolateur, le bocal de lucioles.
 */
export function TentScene() {
  return (
    <>
      <Surroundings />
      <Static>
        <Shell />
        <Kilim position={[0.15, 0.011, 0.1]} />
        <Bedding position={[-2.0, 0, 0.35]} ry={0.05} />
        <Rucksack position={[-1.1, 0, -2.2]} />
        <Boots position={[2.45, 0, -0.45]} ry={-0.5} />
        <Stool position={[0.95, 0, 2.15]} ry={0.4} />
        <WallPocket phi={CENTER + 0.45} />
        <PinnedMap phi={CENTER - 0.2} />
        <LampArm />
        <RainJacket position={[0, 1.98, -0.36]} />
      </Static>
      <Bunting from={CENTER - 1.0} to={CENTER + 1.0} />
      <CanvasLife />
      <Lantern />
      <Ukulele position={[-0.35, 0, 2.05]} ry={Math.PI / 4 - 0.1} />
      <Stove position={[1.55, 0, -1.7]} ry={0.485} />
      <Fireflies position={[2.0, 0, 0.95]} ry={0.6} />
      <Motes colors={[0xfff0cc, 0xcfe6c0]} opacity={[0.3, 0.55]} />
    </>
  )
}
