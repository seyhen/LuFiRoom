import { Motes } from '../Floaters'
import { Static } from '../Static'
import { Awning, AwningPoles } from './Awning'
import { Lantern } from './Lantern'
import { Oud } from './Oud'
import { DatePalm } from './Palm'
import { Pond } from './Pond'
import { Chest, FrontCorner, JarCorner, WallKilim, Waterskin } from './Props'
import { Shell } from './Shell'
import { Brazier, TeaTray } from './Tea'
import { Bolster, Cushion, Pouf, Rugs, Slippers } from './Textiles'
import { Surroundings } from './out/Surroundings'

/**
 * Une oasis du désert : un campement de pierre et de toile au bord d'une petite mare. Deux murs de pisé (le fond avec son arche sur les
 * dunes, la gauche avec son moucharabieh), un auvent de toile rayée tendu sur deux perches (le vent des dunes), la lanterne de laiton
 * ajouré qui pend de sa poutre (la lampe : jour / nuit), de grands tapis posés les uns sur les autres, des coussins, le plateau de
 * cuivre et sa théière, un brasero, l'oud sur son coussin (la musique), la mare entre ses roseaux et sa source (le clapotis), le
 * palmier dattier (les palmes) ; amphores, coffre, sacs, panier de dattes. Dehors : dunes, bosquet, ksar, dromadaire (`out/`).
 */
export function OasisScene() {
  return (
    <>
      <Surroundings />
      <Static>
        <Shell />
        <JarCorner />
        <Chest position={[-2.68, 0, -0.05]} />
        <Cushion position={[-0.7, 0.012, 0.2]} ry={0.2} />
        <Cushion position={[0.2, 0.012, -0.3]} ry={-0.3} s={0.58} />
        <Cushion position={[0.35, 0.012, 1.5]} ry={0.5} s={0.6} />
        <Bolster position={[-1.9, 0.012, 0.55]} ry={0.25} />
        <Pouf position={[0.0, 0, 2.6]} />
        <Slippers position={[1.0, 0.016, 2.3]} ry={0.35} />
        <WallKilim position={[-1.45, 1.52, -2.975]} />
        <FrontCorner />
      </Static>
      <Rugs />
      <AwningPoles />
      <Awning />
      <Waterskin />
      <Lantern />
      <TeaTray position={[0.15, 0, 0.55]} />
      <Brazier position={[1.2, 0, 0.85]} />
      <Oud position={[-1.6, 0, 1.4]} ry={Math.PI / 4 - 0.1} />
      <Pond />
      <DatePalm />
      <Motes colors={[0xffe8b0, 0xcfd8ff]} opacity={[0.35, 0.5]} />
    </>
  )
}
