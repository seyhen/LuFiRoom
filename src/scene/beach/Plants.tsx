import { TAU } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { Leaf } from '../nature/Leaf'
import { Vines } from '../nature/Vines'
import { B } from './materials'

/** Un palmier kentia dans un panier : des palmes longues et souples qui montent puis retombent en éventail. */
export function Kentia({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Part geo={cyl(0.27, 0.22, 0.42, 22)} m={B.rattan} p={[0, 0.21, 0]} />
      <Part geo={cyl(0.25, 0.25, 0.03, 20)} m={B.wood} p={[0, 0.41, 0]} castShadow={false} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * TAU + i * 0.3, rise = 1.0 + (i % 3) * 0.22, len = 0.95 + (i % 4) * 0.16
        return (
          <group key={i} position={[0, 0.4, 0]} rotation-y={a}>
            <Leaf kind="pinnate" r={[-rise, 0, (i % 2 ? 1 : -1) * 0.12]} w={len * 0.17} l={len} m={i % 3 ? B.palm : B.palmLight} shadow={i % 3 === 0} />
          </group>
        )
      })}
    </group>
  )
}

/** Un monstera dans un panier de jonc : de grandes feuilles fendues sur des tiges arquées. */
export function Monstera({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.3, 0.25, 0.44, 22)} m={B.rattan} p={[0, 0.22, 0]} />
      <Part geo={cyl(0.27, 0.27, 0.03, 20)} m={B.wood} p={[0, 0.43, 0]} castShadow={false} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * TAU + 0.4, h = 0.3 + (i % 3) * 0.18, lean = 0.25 + (i % 2) * 0.15
        return (
          <group key={i} position={[0, 0.42, 0]} rotation-y={a}>
            <Part geo={cyl(0.01, 0.013, h, 6)} m={B.leafDark} p={[0, h / 2, Math.sin(lean) * h * 0.5]} rotation-x={lean} castShadow={false} />
            <Leaf kind="split" p={[0, h * Math.cos(lean), Math.sin(lean) * h]} r={[0.15 - (i % 3) * 0.15, 0, 0]} w={0.2} l={0.42} m={i % 2 ? B.monstera : B.monsteraDark} shadow={i % 2 === 0} />
          </group>
        )
      })}
    </group>
  )
}

/** Un pothos panaché dans une suspension de macramé, accrochée à une potence du mur. */
export function HangingPothos({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position
  return (
    <group position={[x, y, z]}>
      <Part geo={cyl(0.015, 0.015, 0.36, 6)} m={B.wood} p={[0.18, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU
        return <Part key={i} geo={cyl(0.005, 0.005, 0.55, 4)} m={B.rope} p={[0.32 + Math.cos(a) * 0.05, -0.28, Math.sin(a) * 0.05]} rotation={[Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15]} castShadow={false} />
      })}
      <Part geo={SPH} m={B.linen} scale={[0.13, 0.11, 0.13]} p={[0.32, -0.6, 0]} />
      <Vines p={[0.32, -0.52, 0]} strands={[[0.12, 0.05, 0.55], [0.06, -0.11, 0.4], [-0.1, 0.06, 0.7], [0.0, 0.12, 0.3]]} m={B.pothos} m2={B.pothosVar} size={0.075} crown={8} seed={3} />
    </group>
  )
}
