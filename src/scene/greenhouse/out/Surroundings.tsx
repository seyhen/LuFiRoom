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
import { C, Chateau } from './Chateau'
import { Fountain } from './Fountain'

// Le dehors de la serre : l'orangerie d'un château de campagne, un soir de pluie dans la brume. La serre est au bout du parc : des haies
// taillées en boules et en murs, de grands arbres ronds, des allées de gravier mouillé, des lampadaires qui s'allument, une balustrade
// de pierre, et au fond le château (brique rose, chaînages de pierre, toits d'ardoise pentus, tourelles, fenêtres éclairées le soir). Tout se fond dans la brume.

const GROUND = -0.5
const F = { c: [0, 0] as [number, number], r0: 9, r1: 16.5 }

// Peu de matériaux, partagés : le parc est un tracé par matériau.
const M = {
  grass: skyFade(far(0x6f9a58, { roughness: 0.9, clearcoat: 0.04 }), F),
  gravel: skyFade(far(0xb9ae98, { roughness: 0.85, clearcoat: 0.08 }), F),
  hedge: skyFade(farFoliage(0x3f7a4e), F),
  hedgeLight: skyFade(farFoliage(0x5e9a58), F),
  tree: [skyFade(farFoliage(0x4f8a52), F), skyFade(farFoliage(0x6aa458), F), skyFade(farFoliage(0x3a7048), F), skyFade(farFoliage(0x8bb85a), F), skyFade(farFoliage(0x2f6244), F)],
  bloomA: skyFade(farFoliage(0xe39ab0), F),
  bloomB: skyFade(farFoliage(0xf2dc8a), F),
  bloomC: skyFade(farFoliage(0xf4efe4), F),
  soil: skyFade(far(0x6b5040, { roughness: 0.95 }), F),
  trunk: skyFade(far(0x6a5040, { roughness: 0.85 }), F),
  stone: skyFade(far(0xd8cfba, { roughness: 0.75 }), F),
  iron: skyFade(far(0x26332e, { roughness: 0.45, clearcoat: 0.5 }), F),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffd490, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}

/** [x, z, échelle, forme (0 chêne, 1 peuplier), teinte] : peu d'arbres, sur les côtés (ni devant la pièce, ni devant le château, ni derrière la crête de la serre). */
const TREES: [number, number, number, number, number][] = [
  [-9.6, -1.0, 1.0, 0, 3], [-10.8, -5.6, 1.15, 0, 0], [-9.4, -9.0, 1.0, 1, 4], [10.8, -0.4, 0.9, 0, 1],
]
/** Les massifs : [x, z, largeur, profondeur, fleurs 0 à 2] ; bancs : [x, z, sens] ; urnes : [x, z]. */
const BEDS: [number, number, number, number, number][] = [[9.1, 2.6, 2.2, 1.4, 0], [-8.6, 4.8, 2.0, 1.3, 1], [-0.6, -9.4, 1.8, 1.8, 2]]
const BENCHES: [number, number, 'x' | 'z'][] = [[0.9, -6.4, 'x'], [8.6, -2.8, 'z']]
const URNS: [number, number][] = [[6.7, -2.6], [-7.4, -3.0]]

/** Les haies : [x, z, longueur, sens] ; boules de buis : [x, z, rayon]. */
const HEDGES: [number, number, number, 'x' | 'z'][] = [[-3.6, -5.6, 5.4, 'x'], [5.0, -4.9, 4.4, 'x'], [-5.2, 1.6, 4.6, 'z'], [-5.2, -2.8, 3.0, 'z'], [5.8, 1.6, 3.4, 'z']]
const BALLS: [number, number, number][] = [[-3.5, -4.4, 0.42], [-1.2, -4.4, 0.42], [3.4, -4.1, 0.42], [-4.4, 3.8, 0.4], [4.6, 4.6, 0.4], [4.6, -1.2, 0.36], [-7.2, 3.6, 0.5], [7.0, 3.4, 0.5]]
const LAMPS: V3[] = [[-3.6, 0, 3.3], [4.8, 0, 3.2], [-2.4, 0, -3.8], [4.6, 0, -3.6]]

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.25)
    C.glass.emissiveIntensity = 0.04 + n * 0.95 // les fenêtres du château s'allument le soir
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
        {HEDGES.map(([x, z, len, dir], i) => {
          // une haie : un cœur bas et, par-dessus, une rangée de buis ronds de tailles un peu différentes (pas un boudin lisse)
          const n = Math.round(len / 0.7), m = i % 2 ? M.hedge : M.hedgeLight
          return (
            <group key={i}>
              <Part geo={rbox(dir === 'x' ? len - 0.3 : 0.55, 0.45, dir === 'x' ? 0.55 : len - 0.3, 0.2)} m={m} p={[x, GROUND + 0.22, z]} castShadow={false} />
              {Array.from({ length: n }, (_, k) => {
                const t = -len / 2 + 0.35 + ((len - 0.7) * k) / Math.max(1, n - 1), r = 0.46 + 0.07 * ((k + i) % 3)
                return <Foliage key={k} v={k + i} p={dir === 'x' ? [x + t, GROUND + 0.3, z] : [x, GROUND + 0.3, z + t]} s={[r, r * 0.95, r]} ry={k} m={(k + i) % 2 ? m : i % 2 ? M.hedgeLight : M.hedge} style="clipped" shadow={false} />
              })}
            </group>
          )
        })}
        {BALLS.map(([x, z, r], i) => (
          <group key={i}>
            <Part geo={cyl(0.12, 0.14, 0.2, 10)} m={M.stone} p={[x, GROUND + 0.1, z]} castShadow={false} />
            <Foliage v={i} p={[x, GROUND + 0.2, z]} s={[r, r, r]} m={M.hedgeLight} style="clipped" shadow={false} />
          </group>
        ))}
        {TREES.map(([x, z, k, kind, t], i) => {
          // un tronc court et épais, puis des masses de feuillage de tailles et de teintes différentes (jamais un champignon)
          const th = (kind ? 1.0 : 1.2) * k
          const blobs: [number, number, number, number, number][] = kind
            ? [[0, 0.5, 0, 0.9, 0], [0.12, 1.4, -0.1, 0.78, 1], [-0.1, 2.2, 0.1, 0.6, 2], [0, 2.9, 0, 0.4, 3]] // peuplier : colonne
            : [[0, 0.7, 0, 1.15, 0], [0.85, 0.35, 0.3, 0.72, 1], [-0.8, 0.5, -0.35, 0.78, 2], [0.2, 1.45, -0.55, 0.62, 3], [-0.25, 1.35, 0.7, 0.56, 4]]
          return (
            <group key={i}>
              <Part geo={cyl(0.2 * k, 0.36 * k, th, 8)} m={M.trunk} p={[x, GROUND + th / 2, z]} castShadow={false} />
              {!kind && <Part geo={cyl(0.08 * k, 0.13 * k, 0.8 * k, 6)} m={M.trunk} p={[x + 0.2 * k, GROUND + th + 0.15 * k, z]} rotation-z={-0.55} castShadow={false} />}
              {blobs.map(([dx, dy, dz, r, c], j) => (
                <Foliage key={j} v={i * 5 + j} p={[x + dx * k, GROUND + th + dy * k, z + dz * k]} s={[r * k, r * k * (kind ? 0.95 : 0.8), r * k]} m={M.tree[(t + c) % 5]} ry={i + j} shadow={false} />
              ))}
            </group>
          )
        })}
        {/* les massifs de fleurs : une bordure de pierre, de la terre, des touffes roses, jaunes et crème */}
        {BEDS.map(([x, z, w, d, f], i) => (
          <group key={i}>
            <Part geo={rbox(w, 0.16, d, 0.06)} m={M.stone} p={[x, GROUND + 0.08, z]} castShadow={false} />
            <Part geo={rbox(w - 0.22, 0.04, d - 0.22, 0.015)} m={M.soil} p={[x, GROUND + 0.17, z]} castShadow={false} />
            {Array.from({ length: Math.min(12, Math.max(3, Math.round(w * d * 1.6))) }, (_, k) => {
              const u = ((k * 0.618 + i * 0.3) % 1) - 0.5, v = ((k * 0.382 + 0.17) % 1) - 0.5
              return <Foliage key={k} v={k + i} p={[x + u * (w - 0.5), GROUND + 0.2, z + v * (d - 0.5)]} s={[0.26, 0.22, 0.26]} ry={k} m={[M.bloomA, M.bloomB, M.bloomC][(k + f) % 3]} style="clipped" shadow={false} />
            })}
          </group>
        ))}
        {/* les bancs de pierre, le dossier côté fond */}
        {BENCHES.map(([x, z, dir], i) => (
          <group key={i} position={[x, GROUND, z]} rotation-y={dir === 'x' ? 0 : Math.PI / 2}>
            <Part geo={rbox(1.5, 0.1, 0.46, 0.04)} m={M.stone} p={[0, 0.42, 0]} castShadow={false} />
            <Part geo={rbox(0.14, 0.4, 0.4, 0.04)} m={M.stone} p={[-0.62, 0.2, 0]} castShadow={false} />
            <Part geo={rbox(0.14, 0.4, 0.4, 0.04)} m={M.stone} p={[0.62, 0.2, 0]} castShadow={false} />
            <Part geo={rbox(1.4, 0.34, 0.08, 0.03)} m={M.stone} p={[0, 0.7, -0.2]} castShadow={false} />
          </group>
        ))}
        {/* les urnes de pierre sur leur socle, une touffe dedans */}
        {URNS.map(([x, z], i) => (
          <group key={i} position={[x, GROUND, z]}>
            <Part geo={rbox(0.5, 0.3, 0.5, 0.05)} m={M.stone} p={[0, 0.15, 0]} castShadow={false} />
            <Part geo={cyl(0.12, 0.24, 0.34, 14)} m={M.stone} p={[0, 0.47, 0]} castShadow={false} />
            <Part geo={cyl(0.3, 0.14, 0.2, 14)} m={M.stone} p={[0, 0.74, 0]} castShadow={false} />
            <Foliage v={i} p={[0, 0.84, 0]} s={[0.3, 0.26, 0.3]} m={i ? M.bloomA : M.hedgeLight} style="clipped" shadow={false} />
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
        {/* le château au fond : brique, ardoise, tourelles (Chateau.tsx), ses fenêtres allumées le soir */}
        <Chateau />
      </Static>
      {lampHeads.map((p, i) => (
        <sprite key={i} position={[p[0], p[1] + GROUND, p[2]]} scale={1.6} material={M.glow} raycast={noRay} renderOrder={4} />
      ))}
      {/* la fontaine du parc, à gauche : interactive (son `fountain`), donc hors du <Static> */}
      <Fountain at={[-7.2, GROUND, 0.0]} />
      <GlowPoints points={lampHeads.map(([x, y, z]): V3 => [x, y + GROUND, z])} color={0xffd490} size={0.6} level={() => M.glow.opacity} />
      <OutdoorPrecip ground={GROUND} area={[-13, 13, -12, 12]} />
    </>
  )
}
