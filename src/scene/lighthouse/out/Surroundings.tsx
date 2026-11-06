import { Static } from '../../Static'
import { SkyFadeClock } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { Rock } from '../../nature/Rock'
import { Soarers } from '../../beach/Gulls'
import { lighthouse } from '../../../rooms/lighthouse'
import { S } from './materials'
import { FOAMS, SEA, Sea } from './Sea'
import { Lighthouse } from './Tower'
import { BellBuoy, Landing } from './Landing'

/** Les mouettes qui tournent autour du phare et au large. */
const SOAR = [
  { c: [6.6, -5.4] as [number, number], r: 2.4, y: 5.4, sp: 0.18, ph: 0 },
  { c: [-6, 1] as [number, number], r: 1.8, y: 2.4, sp: -0.14, ph: 2 },
  { c: [3, 7] as [number, number], r: 1.4, y: 1.2, sp: 0.21, ph: 4 },
]

/**
 * Le dehors du phare : la mer tout autour de l'aiguille de roche, sa houle et son écume, quelques rochers qui affleurent, le phare
 * rayé de rouge sur son îlot (ses faisceaux tournent la nuit et par gros temps), l'échelle du gardien jusqu'à son ponton et sa
 * barque, une bouée à cloche, des mouettes.
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={lighthouse} />
      <Sea />
      <Static>
        {FOAMS.slice(2).map(([x, z, r], i) => (
          <Rock key={i} v={(i * 3 + 1) % 8} p={[x, SEA - r * 0.8, z]} s={[r * 1.05, r * 1.6, r]} ry={i * 1.7} m={S.rock[i % 3]} moss={i % 2 ? S.weed : undefined} />
        ))}
      </Static>
      <Lighthouse />
      <Landing />
      <BellBuoy x={-7.4} z={3.4} />
      <Soarers list={SOAR} />
      <OutdoorPrecip ground={SEA} area={[-13, 13, -12, 12]} top={6.6} />
    </>
  )
}
