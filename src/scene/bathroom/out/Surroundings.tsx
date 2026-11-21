import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { bathroom } from '../../../rooms/bathroom'

import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { GlowPoints } from '../../objects/GlowPoints'
import { SkyFadeClock } from '../../outdoor'
import { Static } from '../../Static'
import { noRay, type V3 } from '../../parts'
import { Cottage, Smoke, WINDOW_GLOWS } from './Cottage'
import { Garden, LAMP_GLOWS, evening } from './Garden'
import { O } from './materials'
import { terrainGeo, terrainY } from './terrain'
import { Village } from './Village'

// Le dehors de la salle de bain : un jardin de cottage sous la pluie fine. La pièce est l'extension de plain-pied d'une maison de
// campagne (pierre crème, volets menthe, glycine, ardoise, cheminée qui fume) ; elle repose sur le pré, entre les hortensias, un
// chemin de dalles, une mare à nénuphars, un banc et une cabane à outils. Au fond, des collines douces et un village à clocher, pâles
// dans la brume. La pluie ne tombe que dehors (`covered`) ; la nuit, les fenêtres s'allument et les lanternes du chemin aussi.

const GLOWS: V3[] = [...WINDOW_GLOWS, ...LAMP_GLOWS]

function Evening() {
  useFrame(() => {
    const k = evening()
    O.glass.emissiveIntensity = 0.04 + k * 0.85 // les fenêtres s'allument le soir (ou sous la pluie)
    O.lantern.emissiveIntensity = 0.1 + k * 1.2
  })
  return null
}

export function Surroundings() {
  const geo = useMemo(() => terrainGeo(), [])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <>
      <SkyFadeClock room={bathroom} />
      <Evening />
      <mesh geometry={geo} material={O.grass} receiveShadow raycast={noRay} />
      <Static>
        <Cottage />
        <Village />
      </Static>
      <Garden />
      <Smoke />
      <GlowPoints points={GLOWS} color={0xffc880} size={0.9} level={evening} />
      <OutdoorPrecip ground={terrainY} area={[-14, 15, -14, 13]} covered />
    </>
  )
}

