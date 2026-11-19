import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { noRay } from '../../parts'
import { Rock } from '../../nature/Rock'
import { SkyFadeClock, groundGrid } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { oasis } from '../../../rooms/oasis'
import { KneelingCamel } from './Camel'
import { Grove } from './Grove'
import { Far } from './Ksar'
import { groundCol, groundY } from './ground'
import { O } from './materials'

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    O.ksar.emissiveIntensity = 0.05 + k * 1.5
  })
  return null
}

/** Quelques rochers et un cairn au pied des dunes proches (les côtés et le devant, jamais devant l'entrée du campement). */
const ROCKS: [number, number, number, number][] = [[-5.4, 2.2, 0.55, 0.4], [-4.6, -2.6, 0.45, 2.0], [6.6, 0.6, 0.5, 1.1], [3.6, 6.2, 0.4, 2.8], [-1.8, 6.8, 0.5, 0.6], [5.2, 5.0, 0.35, 3.1]]

/** Le dehors de l'oasis : les dunes d'or (un sol en grille, les étoiles de la nuit dedans), le bosquet et sa mare derrière à gauche, le ksar, les falaises et la caravane au fond, un dromadaire accroupi devant à droite. */
export function Surroundings() {
  const terrain = useMemo(() => groundGrid(0, 0, 44, 110, groundY, groundCol, 2), [])
  useEffect(() => () => terrain.dispose(), [terrain])
  return (
    <>
      <SkyFadeClock room={oasis} />
      <Evening />
      <mesh geometry={terrain} material={O.ground} receiveShadow raycast={noRay} />
      <Static>
        <Grove />
        <Far />
        {ROCKS.map(([x, z, k, ry], i) => <Rock key={i} v={i} p={[x, groundY(x, z) - 0.08, z]} s={[k * 1.2, k * 0.7, k]} ry={ry} m={O.stone} shadow={false} />)}
        <KneelingCamel at={[6.0, -2.6]} ry={-2.356} />
      </Static>
      <OutdoorPrecip ground={groundY} area={[-13, 13, -12, 12]} covered />
    </>
  )
}
