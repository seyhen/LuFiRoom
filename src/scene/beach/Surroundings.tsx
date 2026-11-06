import { useFrame } from '@react-three/fiber'
import { smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { BeachedBoat, FloatBoat } from './Boats'
import { Palm } from './Palms'
import { PIER, Pier } from './Pier'
import { DuneGrass, Driftwood, FoamRings, Parasol, Rocks, SandCastle, Shells } from './Props'
import { Terrain } from './Terrain'
import { Soarers } from './Gulls'
import { WIND } from './surroundMaterials'

// Des mouettes qui planent au large : centre du cercle, rayon, hauteur, vitesse (rad/s), phase
const SOAR = [
  { c: [4, -12] as [number, number], r: 2.6, y: 3.2, sp: 0.16, ph: 0 },
  { c: [-9, -1] as [number, number], r: 1.8, y: 2.0, sp: -0.13, ph: 2 },
  { c: [11.5, -5] as [number, number], r: 1.5, y: 2.6, sp: 0.2, ph: 4 },
]

/** Le vent : le temps des palmes et des herbes, et sa force (l'orage la quadruple). */
function WindClock() {
  useFrame(({ clock }) => {
    WIND.uTime.value = reduceMotion ? 0 : clock.elapsedTime
    WIND.uWind.value = reduceMotion ? 0 : 0.7 + smooth(mood.storm) * 2.6
  })
  return null
}

/**
 * Le décor autour du bungalow : une île de sable que la mer lèche de tous côtés, avec ses dunes, son ponton, ses palmiers, ses
 * rochers, ses barques et ses mouettes. La pièce n'est plus une coupe posée sur un ciel uni : elle est quelque part.
 */
export function Surroundings() {
  return (
    <>
      <WindClock />
      <Terrain />
      <Soarers list={SOAR} />
      <FloatBoat at={[PIER.x + 1.5, PIER.z - 6.0]} ry={1.45} />
    </>
  )
}

/** Le décor immobile du dehors : à poser dans le `<Static>` de la pièce, pour fusionner avec ses matériaux. */
export function SurroundStatic() {
  return (
    <>
        <Pier />
        <Rocks />
        <Shells />
        <DuneGrass />
        {/* à gauche (fond et devant) : trois palmiers, le coin du baigneur, le bois flotté */}
        <Palm at={[-7.2, 2.4]} h={4.6} lean={[-0.8, 0.5]} seed={1} />
        <Palm at={[-5.6, 5.9]} h={3.7} lean={[-0.3, 0.9]} seed={2} size={0.9} />
        <Palm at={[-7.6, -2.0]} h={4.3} lean={[-0.6, -0.3]} seed={3} size={1.05} />
        {/* à droite : deux palmiers sur la langue de sable avant le ponton */}
        <Palm at={[7.9, -4.6]} h={4.2} lean={[0.6, -0.6]} seed={6} size={0.95} />
        <Parasol at={[-3.0, 6.4]} />
        <SandCastle at={[1.4, 7.0]} />
        <Driftwood at={[-5.2, 1.0]} ry={0.25} s={1.2} />
        <Driftwood at={[2.4, 6.1]} ry={-0.4} />
        <BeachedBoat at={[4.4, 5.3]} ry={-Math.PI / 4 + 0.25} />
        <FoamRings extra={[[PIER.x - 0.62, PIER.z - PIER.len + 0.3, 0.2], [PIER.x + 0.62, PIER.z - PIER.len + 0.3, 0.2], [PIER.x - 0.62, PIER.z - PIER.len + 2.1, 0.2], [PIER.x + 0.62, PIER.z - PIER.len + 2.1, 0.2]]} />
    </>
  )
}
