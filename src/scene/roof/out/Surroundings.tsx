import { useFrame } from '@react-three/fiber'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { SkyFadeClock } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { roof } from '../../../rooms/roof'
import { Part, rbox } from '../../parts'
import { O } from './materials'
import { Block, FireEscape, type BlockProps } from './Buildings'
import { AirCon, Billboard, Bulkhead, Chimney, Dish, PigeonCoop, RoofGarden, Skylight, Turbine } from './RoofGear'

/** Les voisins : à droite (plus bas d'un étage), devant à droite (plus bas encore), à gauche devant. */
const RIGHT: BlockProps = { x0: 3.62, x1: 9.8, z0: -4.4, z1: 0.95, top: -1.75, b: 1, shift: 0.2 }
const FRONT: BlockProps = { x0: 3.62, x1: 9.2, z0: 1.25, z1: 7.8, top: -3.3, b: 2, shift: 0.55 }
const LEFT: BlockProps = { x0: -9.0, x1: -3.78, z0: 0.3, z1: 7.2, top: -2.55, b: 1, shift: 0.8 }
const BLOCKS = [RIGHT, FRONT, LEFT]

/** Où s'arrête la pluie : sur le toit d'un voisin, sinon tout en bas (elle se perd dans le ciel avant). */
const rainGround = (x: number, z: number) => {
  for (const b of BLOCKS) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return b.top
  return -6
}

/** Le soir, les fenêtres des façades s'allument, le panneau et la verrière s'éclairent. */
function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.25 + mood.storm * 0.3)
    for (const m of O.facade) m.emissiveIntensity = 0.04 + n * 1.05
    O.billboard.emissiveIntensity = k * 0.38
    O.bulb.emissiveIntensity = 0.2 + k * 1.6
    O.glow.opacity = k * 0.8
    O.glass.emissiveIntensity = n * 0.55
  })
  return null
}

/**
 * Le dehors du toit-terrasse : notre immeuble de brique qui descend dans le soir (fenêtres à guillotine, escalier de secours), et
 * les toits voisins, plus bas : climatiseurs aux pales qui tournent, verrière, aérateur à turbine, parabole, cheminées, un potager
 * et le grand panneau « COFFEE » qui s'éclaire la nuit. Les façades se fondent vers le bas dans le ciel.
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={roof} />
      <Evening />
      <Static>
        {/* notre immeuble, sous la terrasse : une corniche cache la jonction avec le socle */}
        <Block x0={-3.5} x1={3.36} z0={-3.5} z1={3.36} top={-0.7} b={0} parapet={false} />
        <Part geo={rbox(7.04, 0.14, 7.04, 0.05)} m={O.coping} p={[-0.07, -0.76, -0.07]} castShadow={false} />
        <FireEscape x0={-3.2} x1={-0.9} z={3.37} top={-0.84} />
        {BLOCKS.map((b, i) => <Block key={i} {...b} />)}
        {/* le toit de droite : verrière, climatiseur, cheminée, parabole */}
        <Skylight p={[6.3, RIGHT.top, -2.6]} />
        <Chimney p={[8.6, RIGHT.top, -3.4]} b={1} />
        <Dish p={[8.8, RIGHT.top, -0.2]} ry={0.55} />
        {/* le toit de devant : un potager */}
        <RoofGarden p={[5.6, FRONT.top, 3.0]} />
        <Chimney p={[8.1, FRONT.top, 6.6]} b={2} pots={2} />
        {/* le toit de gauche : le panneau, une cheminée */}
        <Chimney p={[-8.0, LEFT.top, 1.4]} b={1} pots={4} />
        <Bulkhead p={[-4.95, LEFT.top, 1.35]} />
        <AirCon p={[4.9, RIGHT.top, -0.35]} ry={0.1} />
        <AirCon p={[6.4, RIGHT.top, -0.2]} ry={-0.05} />
        <Turbine p={[8.6, RIGHT.top, -1.6]} />
        <Turbine p={[-5.0, LEFT.top, 6.3]} />
        {/* le toit de gauche, devant : le pigeonnier (ses pigeons sont sur notre parapet) */}
        <PigeonCoop p={[-7.5, LEFT.top, 5.8]} />
      </Static>
      <Billboard p={[-6.2, LEFT.top, 3.8]} />
      <OutdoorPrecip ground={rainGround} area={[-13, 13, -10, 12]} />
    </>
  )
}
