import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Sprite } from 'three'
import { seeded, smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { noRay } from '../../parts'
import { glowTex } from '../../textures'
import { SkyFadeClock } from '../../outdoor'
import { Firs, type Fir } from '../../nature/firs'
import { cabin } from '../../../rooms/cabin'
import { O } from './materials'
import { snowY } from './ground'
import { Snowfield } from './Snowfield'
import { Woodshed } from './Woodshed'
import { Bench, Fence, LampPost, Shovel, Sled, Snowman } from './Yard'

const fir = (x: number, z: number, h: number, w = 1, tiers = 4): Fir => ({ p: [x, snowY(x, z) - 0.05, z], h, w, tiers })

/** La forêt : un rideau de grands sapins derrière les murs, des bosquets sur les côtés, des petits devant à gauche. */
const FOREST: Fir[] = [
  // derrière le mur du fond
  fir(-2.6, -5.0, 4.6), fir(-0.4, -5.6, 5.4, 0.95, 5), fir(1.8, -5.0, 4.2), fir(3.6, -5.9, 4.8, 1, 5), fir(0.9, -7.4, 4.0), fir(-2.0, -7.6, 4.4),
  // derrière le mur de gauche
  fir(-5.0, -2.2, 5.0, 1, 5), fir(-5.7, 0.4, 4.3), fir(-5.1, 2.6, 3.6), fir(-7.2, -0.9, 4.6), fir(-6.8, -3.8, 5.2, 0.9, 5), fir(-4.7, -4.9, 3.4),
  // à droite, derrière l'abri et autour de la mare (aucun ne déborde sur la glace : la mare reste visible)
  fir(9.0, -2.4, 3.2), fir(9.6, -6.6, 4.0), fir(6.0, -7.8, 3.4),
  // devant à gauche, petits sapins près de la barrière
  fir(-6.6, 5.6, 2.2, 1.05, 3), fir(-2.5, 8.9, 1.6, 1.1, 3), fir(-8.2, 3.4, 2.8),
  // devant à droite, au bout du sentier
  fir(8.6, 4.2, 2.4, 1, 3), fir(4.0, 8.8, 1.8, 1.05, 3),
]

/**
 * La forêt lointaine, pour les grands écrans : un arc de sapins à 11 à 16 du centre (derrière et sur les côtés, pas devant),
 * bas et pâles, au fondu large (matériaux `far*`). Posés sur les collines de `snowY`.
 */
function farForest(): Fir[] {
  const r = seeded(77), out: Fir[] = []
  for (let i = 0; i < 17; i++) {
    const deg = 135 + (i / 17) * 205 + (r() - 0.5) * 8, a = (deg * Math.PI) / 180, d = 11.2 + (i % 3) * 1.9 + r() * 1.2
    const x = Math.cos(a) * d, z = Math.sin(a) * d, h = 2.5 + r() * 1.3
    out.push({ p: [x, snowY(x, z) - 0.05, z], h, w: 0.95 + r() * 0.25, tiers: 3 })
  }
  return out
}
const FAR_FOREST = farForest()

/** La lanterne du sentier s'allume le soir (un peu par temps sombre) ; son halo et sa flaque de lumière sur la neige. */
function LanternLight({ x, z }: { x: number; z: number }) {
  const halo = useRef<Sprite>(null!)
  const g = snowY(x, z)
  useFrame(() => {
    const k = Math.min(1, smooth(mood.night) + mood.rain * 0.25 + mood.snow * 0.2)
    O.lanternGlass.emissiveIntensity = 0.15 + k * 1.6
    halo.current.material.opacity = k * 0.85
    O.glow.opacity = k * 0.55
  })
  return (
    <group position={[x + 0.4, g, z]}>
      <sprite ref={halo} position={[0, 1.63, 0.05]} scale={1.1} raycast={noRay} renderOrder={4}>
        <spriteMaterial map={glowTex} color={0xffc277} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} material={O.glow} raycast={noRay} renderOrder={3}>
        <planeGeometry args={[2.4, 2.4]} />
      </mesh>
    </group>
  )
}

/**
 * Le dehors de la cabane : une clairière enneigée au milieu des sapins. Les congères montent contre les rondins, un sentier tassé
 * mène à l'abri à bois, la mare est gelée, un bonhomme de neige en bonnet attend près de sa luge et la lanterne du sentier
 * s'allume le soir. Tout se fond dans le ciel d'hiver sur les bords. La neige qui tombe est celle de la cabane (Snowfall).
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={cabin} />
      <Snowfield />
      <Static>
        <Firs list={FOREST} m={O.fir} snowM={O.snowCap} trunkM={O.trunk} seed={4} />
        <Firs list={FAR_FOREST} m={O.farFir} snowM={O.farSnow} trunkM={O.farTrunk} seed={9} />
        <Woodshed />
        <Snowman x={-2.5} z={5.5} />
        <Sled x={-0.9} z={6.2} ry={0.55} />
        <Fence posts={[[-7.4, 1.4], [-6.7, 3.3], [-5.8, 5.0], [-4.7, 6.6], [-3.3, 7.9]]} />
        <LampPost x={5.45} z={1.7} />
        {/* devant, au milieu de la clairière : le banc tourné vers nous, la pelle plantée près du sentier */}
        <Bench x={2.3} z={5.4} />
        <Shovel x={3.95} z={2.9} ry={Math.PI / 4} />
      </Static>
      <LanternLight x={5.45} z={1.7} />
    </>
  )
}
