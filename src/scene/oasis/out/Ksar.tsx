import { Part, cyl, rbox, worldUV } from '../../parts'
import { FarCamel } from './Camel'
import { Buttes } from './Mesa'
import { groundY } from './ground'
import { O } from './materials'

// Le village de terre du fond (un ksar : tours carrées crénelées, maisons basses à toit plat, une porte dans l'enceinte), et les falaises
// de grès strié qui montent derrière à droite, et la caravane qui longe une crête. Tout est pâle et lointain (fondu large, pour les
// coins du haut des grands écrans) ; la nuit, quelques fenêtres du village s'allument (`emissiveMap`).

interface Block { dx: number; dz: number; w: number; d: number; h: number; crenel?: boolean }
const KSAR_AT: [number, number] = [-11.2, 3.4]
const BLOCKS: Block[] = [
  { dx: 0, dz: 0, w: 3.6, d: 2.8, h: 2.8 },
  { dx: -2.5, dz: 0.5, w: 1.8, d: 1.8, h: 4.8, crenel: true },
  { dx: 2.7, dz: -0.6, w: 1.6, d: 1.6, h: 4.0, crenel: true },
  { dx: 1.4, dz: 2.3, w: 2.4, d: 1.8, h: 1.9 },
  { dx: -1.3, dz: -2.4, w: 2.6, d: 1.7, h: 2.2 },
  { dx: 4.4, dz: 1.6, w: 1.8, d: 1.6, h: 1.6 },
  { dx: -4.8, dz: -1.4, w: 1.9, d: 1.9, h: 3.2, crenel: true },
]

function Village() {
  return (
    <>
      {BLOCKS.map(({ dx, dz, w, d, h, crenel }, i) => {
        const x = KSAR_AT[0] + dx, z = KSAR_AT[1] + dz, y = groundY(x, z) - 0.2
        return (
          <group key={i} position={[x, y, z]} rotation-y={0.7 + (i % 3) * 0.05}>
            <Part geo={worldUV(rbox(w, h, d, 0.05), 3.2)} m={O.ksar} p={[0, h / 2, 0]} castShadow={false} />
            {/* le chaperon de terre, plus large que le mur */}
            <Part geo={rbox(w + 0.14, 0.14, d + 0.14, 0.05)} m={O.ksarCap} p={[0, h + 0.05, 0]} castShadow={false} />
            {crenel && [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => <Part key={`${sx}${sz}`} geo={rbox(0.36, 0.34, 0.36, 0.06)} m={O.ksarCap} p={[sx * (w / 2 - 0.08), h + 0.3, sz * (d / 2 - 0.08)]} castShadow={false} />)}
            {/* les rondins de palmier qui portent le toit et dépassent du pisé, sur les deux faces qu'on voit (sans eux, des boîtes nues) */}
            {Array.from({ length: Math.floor(d / 0.5) }, (_, k) => -d / 2 + 0.25 + k * 0.5 + (d % 0.5) / 2).map((bz) => (
              <Part key={`x${bz}`} geo={cyl(0.045, 0.045, 0.34, 6)} m={O.barkFar} p={[w / 2 + 0.06, h - 0.1, bz]} rotation-z={Math.PI / 2} castShadow={false} />
            ))}
            {Array.from({ length: Math.floor(w / 0.5) }, (_, k) => -w / 2 + 0.25 + k * 0.5 + (w % 0.5) / 2).map((bx) => (
              <Part key={`z${bx}`} geo={cyl(0.045, 0.045, 0.34, 6)} m={O.barkFar} p={[bx, h - 0.1, d / 2 + 0.06]} rotation-x={Math.PI / 2} castShadow={false} />
            ))}
          </group>
        )
      })}
      {/* la porte de l'enceinte : une arche sombre dans un mur bas, vers nous */}
      <group position={[KSAR_AT[0] + 1.2, groundY(KSAR_AT[0] + 1.2, KSAR_AT[1] + 4.2) - 0.2, KSAR_AT[1] + 4.2]}>
        <Part geo={worldUV(rbox(3.2, 1.5, 0.5, 0.05), 3.2)} m={O.ksar} p={[0, 0.75, 0]} castShadow={false} />
        <Part geo={rbox(0.8, 1.0, 0.56, 0.04)} m={O.ksarDark} p={[0, 0.5, 0.02]} castShadow={false} />
        <Part geo={rbox(3.34, 0.12, 0.64, 0.04)} m={O.ksarCap} p={[0, 1.55, 0]} castShadow={false} />
      </group>
    </>
  )
}

/** La caravane : quatre dromadaires en file sur la crête, à gauche du fond au centre. */
function Caravan() {
  const pts: [number, number][] = [[1.6, -12.4], [3.8, -12.9], [6.0, -13.2], [8.2, -13.1]]
  return (
    <>
      {pts.map(([x, z], i) => <FarCamel key={i} p={[x, groundY(x, z) - 0.1, z]} ry={-0.2 + (i % 2) * 0.05} s={0.8} />)}
    </>
  )
}

export function Far() {
  return (
    <>
      <Village />
      <Buttes />
      <Caravan />
    </>
  )
}
