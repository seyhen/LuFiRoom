import { useFrame } from '@react-three/fiber'
import { seeded, smooth } from '../../../math'
import { bathroom } from '../../../rooms/bathroom'
import { far } from '../../materials'
import { mood } from '../../anim'
import { SkyFadeClock, skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { Static } from '../../Static'
import { Batch, Part, noRay, rbox, type Item, type V3 } from '../../parts'
import { BoxGeometry } from 'three'
import { GROUND, HIP, T, Town, hill } from './Town'

// Le dehors de la salle de bain : Lisbonne sur sa colline, vue du dernier étage un matin de pluie fine (ou un soir de bougies). La fenêtre
// en arche donne d'en haut sur les toits de tuiles de la rangée d'en dessous ; derrière la pièce, le quartier monte en gradins (`Town.tsx`),
// l'église blanche à coupole, et sur les côtés des maisons qui longent la pièce. Tout se fond dans la brume.

/** Un décor très lointain, bas et pâle, au fondu large : il remplit les coins du haut sur un grand écran (voir docs/ROOMS.md). */
const FW = { c: [0, 0] as [number, number], r0: 9.5, r1: 21 }
const FAR = [0xe8d2c8, 0xe4dcc6, 0xcfe0d8, 0xd6dcec].map((c) => skyFade(snowTop(far(c, { roughness: 0.9 }), 0.8, 0.4, 0.8), FW))
const FAR_ROOF = skyFade(snowTop(far(0xe6b8a8, { roughness: 0.8 }), 1, 0.4, 0.8), FW)
const FAR_GLASS = skyFade(far(0x8ea6bc, { roughness: 0.25, emissive: 0xffc070, emissiveIntensity: 0 }), FW)
const FAR_DARK = skyFade(far(0x7d93ab, { roughness: 0.25 }), FW)

/** [x, z, largeur, profondeur] : les mêmes maisons que `Town.tsx` (même échelle, mêmes étages), plus loin, aux quatre coins du haut. */
const FAR_BLOCKS: [number, number, number, number][] = [
  [-16.2, 6, 4.2, 4.6], [-16.2, -0.5, 4.4, 4.2], [-16.2, -6.5, 4.2, 4.8], [-16.2, -13, 4.6, 4.4], [-16, -19.5, 4.8, 4.4],
  [-9, -22.5, 5.0, 4.2], [-2, -22.8, 4.6, 4.6], [5, -22.5, 5.2, 4.2], [12, -22, 4.8, 4.4],
  [16.2, -15, 4.4, 4.6], [16.2, -8.5, 4.2, 4.8], [16.2, -2, 4.4, 4.2],
  // les coins du haut d'un grand écran (à 1440 px, le coin haut gauche est à 24 du centre) : une deuxième couronne, encore plus pâle
  [-21.5, 12, 4.4, 4.4], [-21.5, 5, 4.6, 4.2], [-21.5, -2, 4.2, 4.6], [-21.5, -9, 4.6, 4.4], [-21.5, -16, 4.4, 4.6], [-20, -23, 4.8, 4.6],
  [-14, -27.5, 5.0, 4.4], [-5, -28, 4.6, 4.6], [4, -27.5, 5.2, 4.4], [13, -27, 4.8, 4.6], [21, -21, 4.6, 4.8], [21, -13, 4.4, 4.6],
]

/** Chaque maison lointaine : trois rangées de fenêtres sur les deux façades vues de la caméra, un toit en pyramide, une souche de cheminée. */
const FAR_DRESS = (() => {
  const r = seeded(31), lit: Item[] = [], dark: Item[] = [], roofs: Item[] = []
  const blocks = FAR_BLOCKS.map(([x, z, w, d]) => ({ x, z, w, d, e: hill(x, z) + (r() - 0.5) * 0.8 }))
  for (const { x, z, w, d, e } of blocks) {
    for (const side of ['z', 'x'] as const) {
      const span = side === 'z' ? w : d, n = Math.max(2, Math.floor(span / 1.9)), face = side === 'z' ? z + d / 2 : x + w / 2
      for (let f = 0; f < 3; f++) for (let i = 0; i < n; i++) {
        const u = (side === 'z' ? x - w / 2 : z - d / 2) + ((i + 0.5) * span) / n, y = e - 1.3 - f * 2.6
        const s: V3 = side === 'z' ? [0.8, 1.3, 0.04] : [0.04, 1.3, 0.8]
        const p: V3 = side === 'z' ? [u, y, face + 0.02] : [face + 0.02, y, u]
        ;(r() < 0.6 ? lit : dark).push({ p, s })
      }
    }
    roofs.push({ p: [x - w * 0.25, e + 1.6, z - d * 0.25], s: [0.46, 1.0, 0.46], c: 0xf0e0cc })
  }
  return { lit, dark, roofs, blocks }
})()
const FAR_BOX = new BoxGeometry(1, 1, 1)
/** La pluie s'arrête sur les toits (la hauteur des corniches). */
const rainGround = (x: number, z: number) => Math.max(GROUND, hill(x, z) + 0.2)

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    T.glass.emissiveIntensity = 0.03 + k * 0.7 // les fenêtres s'allument le soir (ou sous la pluie)
    FAR_GLASS.emissiveIntensity = 0.03 + k * 0.7
  })
  return null
}

export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={bathroom} />
      <Evening />
      <mesh position={[0, GROUND, 0]} rotation-x={-Math.PI / 2} material={T.ground} raycast={noRay}>
        <planeGeometry args={[160, 160]} />
      </mesh>
      <Static>
        {FAR_DRESS.blocks.map(({ x, z, w, d, e }, i) => (
          <group key={i}>
            <Part geo={rbox(w, e - GROUND, d, 0.05)} m={FAR[i % FAR.length]} p={[x, (GROUND + e) / 2, z]} castShadow={false} />
            <Part geo={rbox(w + 0.12, 0.14, d + 0.12, 0.03)} m={FAR[(i + 1) % FAR.length]} p={[x, e, z]} castShadow={false} />
            <Part geo={HIP} m={FAR_ROOF} p={[x, e + 0.07 + 0.85, z]} scale={[w + 0.3, 1.7, d + 0.3]} castShadow={false} />
          </group>
        ))}
        <Town />
        <Batch geo={FAR_BOX} m={FAR_GLASS} items={FAR_DRESS.lit} />
        <Batch geo={FAR_BOX} m={FAR_DARK} items={FAR_DRESS.dark} />
        <Batch geo={FAR_BOX} m={T.shutter} items={FAR_DRESS.roofs} />
      </Static>
      <OutdoorPrecip ground={rainGround} area={[-13, 13, -13, 12]} covered />
    </>
  )
}
