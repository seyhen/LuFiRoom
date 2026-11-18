import { TAU } from '../../math'
import { Fern } from '../nature/Fern'
import { Leaf } from '../nature/Leaf'
import { Vines } from '../nature/Vines'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { B } from './materials'

/** Un pot de céramique : paroi, bord roulé, terre sous le bord. `p` est le sol. */
function Pot({ p, r, h, m = B.ceramic }: { p: V3; r: number; h: number; m?: typeof B.ceramic }) {
  return (
    <group position={p}>
      <Part geo={cyl(r, r * 0.76, h, 22)} m={m} p={[0, h / 2, 0]} />
      <Part geo={cyl(r * 1.07, r * 1.07, h * 0.12, 22)} m={m} p={[0, h - h * 0.06, 0]} castShadow={false} />
      <Part geo={cyl(r * 0.96, r * 0.96, 0.012, 20)} m={B.soil} p={[0, h + 0.002, 0]} castShadow={false} />
    </group>
  )
}

/** Un oiseau de paradis (strelitzia) en grand pot blanc : de longues tiges, de larges feuilles ovales en palette qui retombent en arc. */
export function Strelitzia({ position, s = 1 }: { position: V3; s?: number }) {
  return (
    <group position={position} scale={s}>
      <Pot p={[0, 0, 0]} r={0.28} h={0.46} m={B.ceramic} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * TAU + 0.3, lean = 0.12 + (i % 3) * 0.1, h = 0.85 + (i % 4) * 0.2
        return (
          <group key={i} rotation-y={a}>
            <Part geo={cyl(0.012, 0.018, h, 6)} m={B.leafDark} p={[Math.sin(lean) * h * 0.5, 0.46 + (h * Math.cos(lean)) / 2, 0]} rotation-z={-lean} castShadow={false} />
            <group position={[Math.sin(lean) * h, 0.46 + h * Math.cos(lean), 0]} rotation-y={0.6 + i * 0.25}>
              <Leaf kind="ovate" r={[-0.5 + (i % 3) * 0.12, 0, 0]} w={0.16 + (i % 3) * 0.02} l={0.5 + (i % 4) * 0.06} m={i % 2 ? B.leaf : B.leafDark} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

/** Un monstera sur un petit guéridon de bois : une touffe de grandes feuilles fendues sur des tiges arquées. */
export function MonsteraStand({ position, s = 1 }: { position: V3; s?: number }) {
  const h = 0.5
  return (
    <group position={position} scale={s}>
      <Part geo={cyl(0.22, 0.22, 0.03, 22)} m={B.woodLight} p={[0, h, 0]} />
      <Part geo={cyl(0.04, 0.06, h, 10)} m={B.wood} p={[0, h / 2, 0]} castShadow={false} />
      <Part geo={cyl(0.15, 0.17, 0.03, 18)} m={B.wood} p={[0, 0.015, 0]} castShadow={false} />
      <Pot p={[0, h + 0.015, 0]} r={0.15} h={0.2} m={B.ceramicRose} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * TAU, lean = 0.3 + (i % 3) * 0.12, hh = 0.4 + (i % 4) * 0.1, y0 = h + 0.215
        return (
          <group key={i} rotation-y={a}>
            <Part geo={cyl(0.008, 0.012, hh, 5)} m={B.leafDark} p={[Math.sin(lean) * hh * 0.5, y0 + (hh * Math.cos(lean)) / 2, 0]} rotation-z={-lean} castShadow={false} />
            <group position={[Math.sin(lean) * hh, y0 + hh * Math.cos(lean), 0]} rotation-y={0.4 + i * 0.3}>
              <Leaf kind="split" r={[-0.4, 0, 0]} w={0.17} l={0.34} m={B.monstera} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

/** Une fougère de Boston dans un panier suspendu à une potence de fer scellée dans le mur du fond : trois chaînes, un panier, la fougère qui retombe. */
export function HangingFern({ position, drop = 0.7 }: { position: V3; drop?: number }) {
  return (
    <group position={position}>
      {/* la potence : une platine au mur, un bras qui sort, une volute en renfort, un anneau au bout */}
      <Part geo={rbox(0.1, 0.16, 0.025, 0.01)} m={B.brassDark} p={[0, -0.08, 0.012]} castShadow={false} />
      <Part geo={cyl(0.014, 0.014, 0.5, 8)} m={B.brassDark} p={[0, 0, 0.26]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part m={B.brassDark} p={[0, -0.14, 0.14]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.14, 0.01, 6, 14, Math.PI / 2]} />
      </Part>
      <Part geo={SPH} m={B.brass} scale={0.026} p={[0, 0.0, 0.5]} castShadow={false} />
      <group position={[0, 0, 0.46]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation-y={(i / 3) * TAU}>
            <Part geo={cyl(0.004, 0.004, drop, 4)} m={B.brass} p={[0.06, -drop / 2, 0]} rotation-z={0.15} castShadow={false} />
          </group>
        ))}
        <group position={[0, -drop, 0]}>
          <Part geo={cyl(0.17, 0.09, 0.15, 18)} m={B.wicker} p={[0, -0.075, 0]} />
          <Part geo={cyl(0.15, 0.15, 0.012, 18)} m={B.soil} p={[0, -0.003, 0]} castShadow={false} />
          <Fern p={[0, 0.02, 0]} size={0.5} n={9} m={B.fernM} m2={B.leafLight} />
          <Vines p={[0, 0, 0]} strands={[[0.1, 0.08, 0.5], [-0.12, 0.06, 0.38]]} m={B.leaf} m2={B.leafLight} size={0.06} seed={9} />
        </group>
      </group>
    </group>
  )
}
