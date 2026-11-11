import { useFrame } from '@react-three/fiber'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { SkyFadeClock } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { atelier } from '../../../rooms/atelier'
import { P } from './materials'
import { Antenna, Block, Chimney, INSET, type BlockProps } from './Haussmann'
import { Steam } from '../../objects/Steam'
import { Dish, FarBlock, Laundry, Pigeon, RoofEvening, RoofGarden, Skylight, StairCage, Terrasson, WaterTower, type FarProps } from './RoofDress'

/** Les voisins : à droite (le faîte juste sous notre plancher), à gauche devant, devant à droite (plus bas). */
const RIGHT: BlockProps = { x0: 3.62, x1: 9.8, z0: -4.4, z1: 0.95, wall: -1.95, top: -0.15, s: 1, shift: 0.3, dormers: [2, 3] }
const LEFT: BlockProps = { x0: -9.2, x1: -3.78, z0: 0.3, z1: 7.4, wall: -2.5, top: -0.7, s: 2, shift: 0.6, dormers: [3, 3] }
const FRONT: BlockProps = { x0: 3.62, x1: 9.2, z0: 1.25, z1: 7.8, wall: -3.7, top: -1.9, s: 0, shift: 0.15, dormers: [3, 2] }
/** Derrière, plus hauts : leurs toits dépassent derrière l'atelier. */
const BACK_L: BlockProps = { x0: -9.4, x1: -3.8, z0: -7.2, z1: 0.05, wall: -0.2, top: 1.6, s: 1, shift: 0.45, dormers: [2, 3] }
const BACK_R: BlockProps = { x0: 3.62, x1: 10.2, z0: -10.5, z1: -4.65, wall: 0.6, top: 2.4, s: 2, shift: 0.7, dormers: [3, 2] }
/** Plus loin derrière : d'autres toits de zinc, de plus en plus hauts, qui se fondent dans le ciel. */
const BACK_C: BlockProps = { x0: -3.6, x1: 3.4, z0: -10.4, z1: -4.5, wall: 1.0, top: 3.0, s: 0, shift: 0.2, dormers: [3, 3] }
const FAR_L: BlockProps = { x0: -10.8, x1: -3.9, z0: -14.5, z1: -7.5, wall: 1.6, top: 3.6, s: 2, shift: 0.5, dormers: [3, 3] }
const FAR_C: BlockProps = { x0: -3.4, x1: 4.2, z0: -16.5, z1: -10.8, wall: 2.4, top: 4.4, s: 1, shift: 0.7, dormers: [4, 3] }
const FAR_R: BlockProps = { x0: 4.4, x1: 11.5, z0: -17, z1: -11, wall: 2.8, top: 4.8, s: 0, shift: 0.1, dormers: [3, 3] }
const BLOCKS = [RIGHT, LEFT, FRONT, BACK_L, BACK_R, BACK_C, FAR_L, FAR_C, FAR_R]

/** Plus loin encore (13 à 17 m du centre), pour les coins du grand écran : des toits bas et pâles qui se perdent dans la brume. */
const FARTHER: FarProps[] = [
  { x0: -17.4, x1: -11.6, z0: -11.6, z1: -5.2, wall: 0.5, top: 2.3, s: 1, dormers: [2, 2], chimney: [1.2, 0.4] },
  { x0: -19, x1: -12.6, z0: -19.6, z1: -12.8, wall: 1.0, top: 2.9, s: 0, dormers: [2, 2], chimney: [-1.0, -0.6] },
  { x0: -17.6, x1: -10.6, z0: -4.6, z1: 2.2, wall: -0.4, top: 1.5, s: 0, dormers: [2, 2], chimney: [0.8, 0.5] },
  { x0: -10.6, x1: -3.6, z0: -22.4, z1: -17.4, wall: 1.4, top: 3.3, s: 1, dormers: [2, 2], chimney: [-1.0, 0.2] },
  { x0: -2.4, x1: 4.4, z0: -23.6, z1: -18.8, wall: 1.6, top: 3.5, s: 0, dormers: [3, 2], chimney: [1.0, -0.4] },
  { x0: 5.6, x1: 12.4, z0: -21.6, z1: -17.8, wall: 1.5, top: 3.2, s: 1, dormers: [3, 2], chimney: [-0.8, 0.2] },
]

const rainGround = (x: number, z: number) => {
  for (const b of BLOCKS) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return b.top!
  return -6
}

/** Le soir, les fenêtres des façades et des lucarnes s'allument. */
function Evening() {
  useFrame(() => {
    const n = smooth(mood.night)
    for (const m of P.facade) m.emissiveIntensity = 0.04 + n * 1.0
    P.dormerGlass.emissiveIntensity = n * 1.3
  })
  return null
}

/**
 * Le dehors de l'atelier : les toits de Paris. Notre immeuble de pierre de taille descend sous l'atelier (balcons filants en fer
 * forgé, géraniums) ; autour, les toits mansardés de zinc des voisins, leurs lucarnes qui s'allument le soir, les souches de
 * cheminée et leurs mitrons de terre cuite, des antennes. Tout descend dans le ciel.
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={atelier} />
      <Evening />
      <RoofEvening />
      <Static>
        <Block x0={-3.5} x1={3.36} z0={-3.5} z1={3.36} wall={-0.72} s={0} topRail={false} />
        {BLOCKS.map((b, i) => <Block key={i} {...b} />)}
        <Chimney p={[6.2, RIGHT.top!, -2.4]} pots={5} />
        <Chimney p={[8.6, RIGHT.top!, -1.2]} pots={3} ry={Math.PI / 2} />
        <Chimney p={[-6.6, LEFT.top!, 2.2]} pots={6} />
        <Chimney p={[-5.4, LEFT.top!, 5.8]} pots={3} ry={Math.PI / 2} />
        <Chimney p={[6.6, FRONT.top!, 4.2]} pots={4} />
        <Chimney p={[-6.0, BACK_L.top!, -3.4]} pots={5} ry={Math.PI / 2} />
        <Chimney p={[6.4, BACK_R.top!, -7.2]} pots={4} />
        <Chimney p={[-1.2, BACK_C.top!, -7.4]} pots={6} />
        <Chimney p={[-7.4, FAR_L.top!, -10.6]} pots={4} ry={Math.PI / 2} />
        <Chimney p={[7.6, FAR_R.top!, -14]} pots={5} />
        <Antenna p={[1.8, BACK_C.top!, -8.2]} />
        <Antenna p={[-7.8, BACK_L.top!, -1.2]} />
        <Antenna p={[7.5, RIGHT.top!, -0.9]} />
        <Antenna p={[-7.6, LEFT.top!, 4.6]} />
        {/* le zinc à joints debout sur chaque terrasson */}
        {BLOCKS.map((b, i) => (
          <Terrasson key={i} cx={(b.x0 + b.x1) / 2} cz={(b.z0 + b.z1) / 2} w={b.x1 - b.x0 - INSET * 2 + 0.06} d={b.z1 - b.z0 - INSET * 2 + 0.06} y={b.top! + 0.075} />
        ))}
        {FARTHER.map((f, i) => <FarBlock key={i} {...f} />)}
        {/* de la vie sur les toits : verrière d'artiste, cage d'escalier, château d'eau, linge, potager, paraboles, pigeons */}
        <Skylight p={[-7.2, LEFT.top! + 0.075, 5.9]} />
        <StairCage p={[-7.5, BACK_L.top! + 0.075, -5.4]} />
        <WaterTower p={[2.6, BACK_C.top! + 0.075, -6.2]} />
        <Laundry p={[4.5, BACK_R.top! + 0.075, -5.9]} len={3} />
        <RoofGarden p={[-8.0, LEFT.top! + 0.075, 3.25]} />
        <Dish p={[4.85, RIGHT.top! + 0.075, -0.4]} />
        <Dish p={[0.7, BACK_C.top! + 0.075, -9.2]} ry={Math.PI / 3} />
        <Pigeon p={[8.0, RIGHT.top! + 0.075, -3.2]} ry={0.9} />
        <Pigeon p={[8.35, RIGHT.top! + 0.075, -3.35]} ry={-0.6} />
        <Pigeon p={[7.7, RIGHT.top! + 0.075, -3.45]} ry={2.2} />
        <Pigeon p={[-7.0, LEFT.top! + 0.075, 2.7]} ry={0.5} />
        <Pigeon p={[-6.9, LEFT.top! + 1.16, 2.4]} ry={1.2} s={1.1} />
      </Static>
      <Steam at={[6.2, RIGHT.top! + 1.7, -2.4]} every={0.5} />
      <Steam at={[-6.6, LEFT.top! + 1.7, 2.2]} every={0.5} />
      <Steam at={[6.6, FRONT.top! + 1.7, 4.2]} every={0.6} />
      <OutdoorPrecip ground={rainGround} area={[-13, 13, -10, 12]} />
    </>
  )
}
