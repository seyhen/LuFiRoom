import { TAU } from '../../math'
import { Part, SPH, cyl, type V3 } from '../parts'
import { Fern } from '../nature/Fern'
import { Foliage } from '../nature/Foliage'
import { Leaf } from '../nature/Leaf'
import { Rosette } from '../nature/Rosette'
import { Vines } from '../nature/Vines'
import { Vessel } from '../igloo/Vessel'
import { G } from './materials'

/** Un pot de terre cuite : paroi, bord roulé, terre en dessous du bord. `p` est le sol. */
export function Pot({ p, r = 0.16, h = 0.22, soil = true }: { p: V3; r?: number; h?: number; soil?: boolean }) {
  return (
    <group position={p}>
      <Part geo={cyl(r, r * 0.74, h, 20)} m={G.terracotta} p={[0, h / 2, 0]} />
      <Part geo={cyl(r * 1.1, r * 1.1, h * 0.14, 20)} m={G.terracotta} p={[0, h - h * 0.07, 0]} castShadow={false} />
      {soil && <Part geo={cyl(r * 0.96, r * 0.96, 0.01, 20)} m={G.soil} p={[0, h + 0.002, 0]} castShadow={false} />}
    </group>
  )
}

/** Un palmier kentia : un faisceau de stipes fins qui montent d'un grand pot, et de longues palmes pennées qui retombent en arc. */
export function Palm({ position, s = 1 }: { position: V3; s?: number }) {
  return (
    <group position={position} scale={s}>
      <Pot p={[0, 0, 0]} r={0.3} h={0.42} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * TAU + 0.2, lean = 0.1 + (i % 3) * 0.1, h = 1.2 + (i % 4) * 0.28
        return (
          <group key={i} rotation-y={a}>
            <Part geo={cyl(0.012, 0.018, h, 5)} m={G.leafDark} p={[Math.sin(lean) * h * 0.5, 0.42 + h * 0.5, 0]} rotation-z={-lean} castShadow={false} />
            <group position={[Math.sin(lean) * h, 0.42 + h * Math.cos(lean), 0]}>
              <Leaf kind="pinnate" r={[-0.55, 0, 0]} w={0.22} l={1.0 + (i % 3) * 0.15} m={i % 2 ? G.palm : G.leaf} p={[0, 0, 0]} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

/** Un monstera : une touffe de grandes feuilles fendues sur de longues tiges. */
export function Monstera({ position, s = 1 }: { position: V3; s?: number }) {
  return (
    <group position={position} scale={s}>
      <Pot p={[0, 0, 0]} r={0.22} h={0.3} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * TAU, lean = 0.3 + (i % 3) * 0.12, h = 0.5 + (i % 4) * 0.12
        return (
          <group key={i} rotation-y={a}>
            <Part geo={cyl(0.01, 0.014, h, 5)} m={G.leafDark} p={[Math.sin(lean) * h * 0.5, 0.3 + h * 0.5, 0]} rotation-z={-lean} castShadow={false} />
            <group position={[Math.sin(lean) * h, 0.3 + h * Math.cos(lean), 0]} rotation-y={0.4 + i * 0.3}>
              <Leaf kind="split" r={[-0.4, 0, 0]} w={0.2} l={0.4} m={G.monstera} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

/** Un citronnier en pot : un tronc grêle, un houppier rond, des citrons jaunes, un grand pot de cuivre. */
export function LemonTree({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <group>
        <Vessel p={[0, 0, 0]} rt={0.3} rb={0.24} h={0.42} m={G.horn} inner={G.terracotta} rim={G.horn} t={0.012} />
        <Part geo={cyl(0.27, 0.27, 0.01, 20)} m={G.soil} p={[0, 0.34, 0]} castShadow={false} />
      </group>
      <Part geo={cyl(0.03, 0.045, 1.0, 8)} m={G.lacquer} p={[0, 0.8, 0]} />
      <Part geo={cyl(0.015, 0.02, 0.4, 6)} m={G.lacquer} p={[0.12, 1.2, 0]} rotation-z={-0.8} castShadow={false} />
      <Part geo={cyl(0.015, 0.02, 0.4, 6)} m={G.lacquer} p={[-0.12, 1.15, 0.05]} rotation-z={0.8} castShadow={false} />
      <Foliage v={2} p={[0, 1.0, 0]} s={[0.55, 0.55, 0.55]} m={G.lemonLeaf} />
      <Foliage v={4} p={[0.3, 1.2, 0.05]} s={[0.3, 0.3, 0.3]} m={G.lemonLeaf} ry={1} />
      <Foliage v={1} p={[-0.3, 1.15, 0]} s={[0.28, 0.28, 0.28]} m={G.lemonLeaf} ry={2} />
      {[[0.3, 1.15, 0.38], [-0.28, 1.35, 0.3], [0.1, 1.6, 0.4], [-0.4, 1.1, -0.1], [0.4, 1.4, -0.25]].map(([x, y, z], i) => (
        <Part key={i} geo={SPH} m={G.lemon} scale={[0.07, 0.085, 0.07]} p={[x, y, z]} castShadow={false} />
      ))}
    </group>
  )
}

/** Une fougère de Boston dans un pot, sur son socle de bois : un pied de fougère qui retombe de tous côtés. */
export function FernStand({ position, h = 0.7 }: { position: V3; h?: number }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.03, 0.04, h, 8)} m={G.woodDark} p={[0, h / 2, 0]} />
      <Part geo={cyl(0.2, 0.2, 0.03, 20)} m={G.woodDark} p={[0, h, 0]} />
      <Part geo={cyl(0.14, 0.14, 0.03, 16)} m={G.woodDark} p={[0, 0.02, 0]} castShadow={false} />
      <Pot p={[0, h + 0.015, 0]} r={0.15} h={0.2} />
      <Fern p={[0, h + 0.2, 0]} size={0.55} n={9} m={G.fernM} m2={G.leafLight} />
    </group>
  )
}

/** Une orchidée en pot : deux feuilles larges, une hampe arquée et ses fleurs. */
export function Orchid({ position, pink = true }: { position: V3; pink?: boolean }) {
  const f = pink ? G.orchid : G.orchid2
  return (
    <group position={position}>
      <Pot p={[0, 0, 0]} r={0.07} h={0.1} soil={false} />
      <Leaf kind="ovate" r={[-0.6, 0.3, 0]} w={0.04} l={0.14} m={G.leaf} p={[0, 0.1, 0]} />
      <Leaf kind="ovate" r={[-0.6, 2.9, 0]} w={0.04} l={0.14} m={G.leaf} p={[0, 0.1, 0]} />
      <Part geo={cyl(0.004, 0.004, 0.3, 5)} m={G.leafDark} p={[0.02, 0.25, 0]} rotation-z={-0.2} castShadow={false} />
      {[0.18, 0.25, 0.32].map((y, i) => <Part key={i} geo={SPH} m={f} scale={[0.028, 0.02, 0.012]} p={[0.04 + i * 0.012, y, 0.012]} rotation-z={i} castShadow={false} />)}
    </group>
  )
}

/** Une suspension : un panier de fer en forme de coupe, accroché à trois chaînes, plein de plantes retombantes. */
export function HangingBasket({ position, drop = 0.6, seed = 1, kind = 'vines' }: { position: V3; drop?: number; seed?: number; kind?: 'vines' | 'fern' }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation-y={(i / 3) * TAU}>
          <Part geo={cyl(0.004, 0.004, drop, 4)} m={G.brass} p={[0.05, -drop / 2, 0]} rotation-z={0.12} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={G.brass} scale={0.025} castShadow={false} />
      <group position={[0, -drop, 0]}>
        <Part geo={cyl(0.17, 0.09, 0.14, 18)} m={G.ironDark} p={[0, -0.07, 0]} />
        <Part geo={cyl(0.15, 0.15, 0.012, 18)} m={G.soil} p={[0, -0.003, 0]} castShadow={false} />
        {kind === 'vines'
          ? <Vines p={[0, 0, 0]} strands={[[0.1, 0.05, 0.6], [-0.1, 0.08, 0.45], [0.02, -0.11, 0.7], [-0.06, -0.09, 0.35]]} m={G.leaf} m2={G.leafLight} size={0.07} seed={seed} />
          : <Fern p={[0, 0.02, 0]} size={0.45} n={8} m={G.fernM} m2={G.leafLight} />}
      </group>
    </group>
  )
}

/** Une touffe de succulentes dans un petit pot : trois rosettes de tailles différentes. */
export function Succulents({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Pot p={[0, 0, 0]} r={0.09} h={0.1} />
      <Rosette p={[0, 0.11, 0]} size={0.07} n={10} m={G.succulent} />
      <Pot p={[0.22, 0, 0.05]} r={0.07} h={0.08} />
      <Rosette p={[0.22, 0.09, 0.05]} size={0.05} n={9} m={G.succulent} m2={G.leafLight} />
    </group>
  )
}
