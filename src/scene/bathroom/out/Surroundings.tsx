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
import { GROUND, T, Town } from './Town'

// Le dehors de la salle de bain : une ville de colline, douce et pastel, vue du dessus d'un toit un matin de pluie fine (ou un soir
// de bougies). La fenêtre en arche donne sur la première rangée de maisons ; derrière, une deuxième et une troisième rangées,
// l'église blanche à coupole, et sur les côtés des maisons qui montent le long de la pièce. Tout se fond dans la brume.

/** Un décor très lointain, bas et pâle, au fondu large : il remplit les coins du haut sur un grand écran (voir docs/ROOMS.md). */
const FW = { c: [0, 0] as [number, number], r0: 9.5, r1: 17.5 }
const FAR = [0xe8d2c8, 0xe4dcc6, 0xcfe0d8, 0xd6dcec].map((c) => skyFade(snowTop(far(c, { roughness: 0.9 }), 0.8, 0.4, 0.8), FW))
const FAR_ROOF = skyFade(snowTop(far(0xcf8a68, { roughness: 0.8 }), 1, 0.4, 0.8), FW)

/** [x, z, largeur, profondeur, hauteur] : des barres basses, loin, aux quatre coins du haut. */
const FAR_BLOCKS: [number, number, number, number, number][] = [
  [-13.5, -9, 4.2, 3.2, 1.6], [-14.5, -2, 3.4, 4.0, 1.3], [-13.5, 6, 3.6, 3.4, 1.4], [-16, -14, 5.0, 3.2, 1.8],
  [13.5, -10, 4.4, 3.2, 1.5], [14.5, -3, 3.4, 4.0, 1.2], [8, -17.5, 5.0, 3.0, 1.7], [-1, -18.5, 6.0, 3.0, 1.8], [-9, -18, 4.4, 3.0, 1.5],
]

/**
 * Les barres lointaines ne sont plus des plaques nues : deux rangées de fenêtres sur chaque façade qui regarde la caméra (une série de
 * boîtes simples, 12 triangles) et des souches de cheminée, une trappe d'accès et un petit abri d'escalier sur le toit.
 */
const FAR_DRESS = (() => {
  const r = seeded(31), lit: Item[] = [], dark: Item[] = [], roofs: Item[] = []
  for (const [x, z, w, d, h] of FAR_BLOCKS) {
    const rows = h > 1.35 ? 2 : 1
    for (const side of ['z', 'x'] as const) {
      const span = side === 'z' ? w : d, n = Math.max(2, Math.floor(span / 0.75)), face = side === 'z' ? z + d / 2 : x + w / 2
      for (let f = 0; f < rows; f++) for (let i = 0; i < n; i++) {
        const u = (side === 'z' ? x - w / 2 : z - d / 2) + ((i + 0.5) * span) / n, y = GROUND + 0.5 + f * 0.6
        const s: V3 = side === 'z' ? [0.3, 0.38, 0.04] : [0.04, 0.38, 0.3]
        const p: V3 = side === 'z' ? [u, y, face + 0.02] : [face + 0.02, y, u]
        ;(r() < 0.6 ? lit : dark).push({ p, s })
      }
    }
    const top = GROUND + h + 0.18
    roofs.push({ p: [x - w * 0.28, top + 0.28, z - d * 0.2], s: [0.34, 0.56, 0.34], c: 0xd9b9a6 })
    roofs.push({ p: [x + w * 0.22, top + 0.2, z - d * 0.12], s: [0.3, 0.4, 0.3], c: 0xd9b9a6 })
    roofs.push({ p: [x + w * 0.05, top + 0.1, z + d * 0.18], s: [0.9, 0.2, 0.6], c: 0xc8a590 })
    roofs.push({ p: [x - w * 0.12, top + 0.3, z + d * 0.05], s: [0.62, 0.6, 0.55], c: 0xe8d6c4 })
  }
  return { lit, dark, roofs }
})()
const FAR_BOX = new BoxGeometry(1, 1, 1)

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    T.glass.emissiveIntensity = 0.03 + k * 0.7 // les fenêtres s'allument le soir (ou sous la pluie)
  })
  return null
}

export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={bathroom} />
      <Evening />
      <mesh position={[0, GROUND, 0]} rotation-x={-Math.PI / 2} material={T.ground} receiveShadow raycast={noRay}>
        <planeGeometry args={[40, 40]} />
      </mesh>
      <Static>
        {FAR_BLOCKS.map(([x, z, w, d, h], i) => (
          <group key={i}>
            <Part geo={rbox(w, h, d, 0.05)} m={FAR[i % FAR.length]} p={[x, GROUND + h / 2, z]} castShadow={false} />
            <Part geo={rbox(w + 0.2, 0.18, d + 0.2, 0.05)} m={FAR_ROOF} p={[x, GROUND + h + 0.09, z]} castShadow={false} />
          </group>
        ))}
        <Town />
        <Batch geo={FAR_BOX} m={T.glass} items={FAR_DRESS.lit} />
        <Batch geo={FAR_BOX} m={T.dark} items={FAR_DRESS.dark} />
        <Batch geo={FAR_BOX} m={T.shutter} items={FAR_DRESS.roofs} />
      </Static>
      <OutdoorPrecip ground={GROUND} area={[-13, 13, -13, 12]} covered />
    </>
  )
}
