import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SpriteMaterial } from 'three'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../../parts'
import { far } from '../../materials'
import { farFoliage } from '../../nature/materials'
import { Foliage } from '../../nature/Foliage'
import { SkyFadeClock, skyFade } from '../../outdoor'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { GlowPoints } from '../../objects/GlowPoints'
import { glowTex } from '../../textures'
import { greenhouse } from '../../../rooms/greenhouse'
import { Block } from '../../atelier/out/Haussmann'
import { P } from '../../atelier/out/materials'

// Le dehors de la serre : l'orangerie d'un château de campagne, un soir de pluie dans la brume. La serre est au bout du parc : des haies
// taillées en boules et en murs, de grands arbres ronds, des allées de gravier mouillé, des lampadaires qui s'allument, une balustrade
// de pierre, et au fond le château (pierre blonde, toits mansardés de zinc, hautes fenêtres éclairées). Tout se fond dans la brume.

const GROUND = -0.5
const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }

// Peu de matériaux, partagés : le parc est un tracé par matériau.
const M = {
  grass: skyFade(far(0x6f9a58, { roughness: 0.9, clearcoat: 0.04 }), F),
  gravel: skyFade(far(0xb9ae98, { roughness: 0.85, clearcoat: 0.08 }), F),
  hedge: skyFade(farFoliage(0x3f7a4e), F),
  hedgeLight: skyFade(farFoliage(0x5e9a58), F),
  tree: [skyFade(farFoliage(0x4f8a52), F), skyFade(farFoliage(0x6aa458), F), skyFade(farFoliage(0x3a7048), F)],
  trunk: skyFade(far(0x6a5040, { roughness: 0.85 }), F),
  stone: skyFade(far(0xd8cfba, { roughness: 0.75 }), F),
  iron: skyFade(far(0x26332e, { roughness: 0.45, clearcoat: 0.5 }), F),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffd490, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}

/** [x, z, rayon du houppier, hauteur du tronc, teinte, forme] : de grands arbres ronds, que sur les côtés du fond (un volume devant cacherait la pièce). */
const TREES: [number, number, number, number, number, number][] = [
  [-6.4, -4.8, 1.35, 2.2, 0, 1], [-9.0, -1.8, 1.25, 1.9, 1, 2], [-5.4, -8.6, 1.6, 2.6, 2, 3], [-2.0, -9.6, 1.5, 2.3, 0, 4], [2.6, -9.0, 1.7, 2.7, 1, 1],
  [6.8, -6.2, 1.35, 2.1, 2, 2], [9.2, -3.2, 1.25, 1.9, 0, 5], [5.2, -10.4, 1.5, 2.5, 0, 2], [9.4, -7.6, 1.5, 2.4, 1, 3], [-9.6, -6.0, 1.5, 2.4, 2, 4],
]
/** Les haies : [x, z, longueur, sens] ; boules de buis : [x, z, rayon]. */
const HEDGES: [number, number, number, 'x' | 'z'][] = [[-3.6, -5.6, 5.4, 'x'], [5.0, -4.9, 4.4, 'x'], [-5.2, 1.6, 4.6, 'z'], [-5.2, -2.8, 3.0, 'z'], [5.8, 1.6, 3.4, 'z']]
const BALLS: [number, number, number][] = [[-3.5, -4.4, 0.42], [-1.2, -4.4, 0.42], [3.4, -4.1, 0.42], [-4.4, 3.8, 0.4], [4.6, 4.6, 0.4], [4.6, -1.2, 0.36], [-7.2, 3.6, 0.5], [7.0, 3.4, 0.5]]
const LAMPS: V3[] = [[-4.4, 0, 3.4], [4.8, 0, 3.2], [-3.4, 0, -4.8], [4.6, 0, -4.6]]

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.25)
    for (const m of P.facade) m.emissiveIntensity = 0.04 + n * 1.0
    P.dormerGlass.emissiveIntensity = n * 1.3
    M.glow.opacity = k * 0.8
  })
  return null
}

export function Surroundings() {
  const lampHeads: V3[] = LAMPS.map(([x, , z]) => [x, 2.1, z])
  return (
    <>
      <SkyFadeClock room={greenhouse} />
      <Evening />
      <mesh position={[0, GROUND, 0]} rotation-x={-Math.PI / 2} material={M.grass} receiveShadow raycast={noRay}>
        <planeGeometry args={[34, 34]} />
      </mesh>
      <Static>
        {/* les allées de gravier mouillé : devant la serre, le long de sa gauche, puis vers le fond */}
        <Part geo={rbox(2.0, 0.03, 12, 0.012)} m={M.gravel} p={[4.4, GROUND + 0.015, 2.6]} castShadow={false} />
        <Part geo={rbox(13, 0.03, 1.8, 0.012)} m={M.gravel} p={[-1.0, GROUND + 0.015, 5.0]} castShadow={false} />
        <Part geo={rbox(1.8, 0.03, 9, 0.012)} m={M.gravel} p={[-4.8, GROUND + 0.015, -6.2]} castShadow={false} />
        {/* le soubassement du parc autour de la serre : une marge de pierre */}
        <Part geo={rbox(7.2, 0.1, 7.2, 0.04)} m={M.stone} p={[-0.07, GROUND + 0.05, -0.07]} castShadow={false} />
        {/* la balustrade de pierre qui ferme le parterre, derrière à droite */}
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i} position={[1.2 + i * 0.7, GROUND, -7.4]}>
            <Part geo={cyl(0.06, 0.08, 0.7, 10)} m={M.stone} p={[0, 0.35, 0]} castShadow={false} />
            <Part geo={SPH} m={M.stone} scale={[0.1, 0.07, 0.1]} p={[0, 0.65, 0]} castShadow={false} />
          </group>
        ))}
        <Part geo={rbox(6.4, 0.1, 0.22, 0.03)} m={M.stone} p={[4.2, GROUND + 0.78, -7.4]} castShadow={false} />
        {/* les haies taillées en mur, les boules de buis, les arbres */}
        {HEDGES.map(([x, z, len, dir], i) => (
          <Part key={i} geo={rbox(dir === 'x' ? len : 0.8, 0.95, dir === 'x' ? 0.8 : len, 0.3)} m={i % 2 ? M.hedge : M.hedgeLight} p={[x, GROUND + 0.47, z]} castShadow={false} />
        ))}
        {BALLS.map(([x, z, r], i) => (
          <group key={i}>
            <Part geo={cyl(0.12, 0.14, 0.2, 10)} m={M.stone} p={[x, GROUND + 0.1, z]} castShadow={false} />
            <Foliage v={i} p={[x, GROUND + 0.2, z]} s={[r, r, r]} m={M.hedgeLight} style="clipped" shadow={false} />
          </group>
        ))}
        {TREES.map(([x, z, r, th, t, v], i) => (
          <group key={i}>
            <Part geo={cyl(0.18, 0.28, th, 8)} m={M.trunk} p={[x, GROUND + th / 2, z]} castShadow={false} />
            <Foliage v={v} p={[x, GROUND + th - 0.2, z]} s={[r, r * 0.9, r]} m={M.tree[t % 3]} ry={i} shadow={false} />
            <Foliage v={v + 2} p={[x + r * 0.45, GROUND + th + 0.2, z - r * 0.2]} s={[r * 0.6, r * 0.55, r * 0.6]} m={M.tree[(t + 1) % 3]} ry={i + 1} shadow={false} />
          </group>
        ))}
        {/* les lampadaires de fonte : colonne, lanterne vitrée, chapeau */}
        {LAMPS.map(([x, , z], i) => (
          <group key={i} position={[x, GROUND, z]}>
            <Part geo={cyl(0.07, 0.1, 0.18, 10)} m={M.iron} p={[0, 0.09, 0]} castShadow={false} />
            <Part geo={cyl(0.03, 0.045, 2.2, 8)} m={M.iron} p={[0, 1.2, 0]} castShadow={false} />
            <Part geo={rbox(0.2, 0.28, 0.2, 0.05)} m={M.stone} p={[0, 2.5, 0]} castShadow={false} />
            <Part geo={cyl(0.02, 0.14, 0.12, 4)} m={M.iron} p={[0, 2.7, 0]} castShadow={false} />
          </group>
        ))}
        {/* le château au fond : deux ailes, de la pierre blonde, des toits mansardés de zinc, ses fenêtres allumées le soir */}
        <Block x0={-8} x1={0.5} z0={-16} z1={-10.8} wall={2.2} top={4.2} s={1} shift={0.3} dormers={[4, 3]} lowBalcony={false} />
        <Block x0={0.5} x1={9.5} z0={-15} z1={-10.2} wall={1.8} top={3.6} s={2} shift={0.7} dormers={[3, 2]} lowBalcony={false} />
        <Block x0={-12} x1={-9} z0={-9} z1={-3.6} wall={1.4} top={3.0} s={0} shift={0.1} dormers={[2, 2]} lowBalcony={false} />
      </Static>
      {lampHeads.map((p, i) => (
        <sprite key={i} position={[p[0], p[1] + GROUND, p[2]]} scale={1.6} material={M.glow} raycast={noRay} renderOrder={4} />
      ))}
      <GlowPoints points={lampHeads.map(([x, y, z]): V3 => [x, y + GROUND, z])} color={0xffd490} size={0.6} level={() => M.glow.opacity} />
      <OutdoorPrecip ground={GROUND} area={[-13, 13, -12, 12]} />
    </>
  )
}
