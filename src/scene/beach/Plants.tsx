import { TAU } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { B } from './materials'

/** Un palmier kentia dans un panier : des palmes longues et souples qui retombent en éventail. */
export function Kentia({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Part geo={cyl(0.27, 0.22, 0.42, 22)} m={B.rattan} p={[0, 0.21, 0]} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * TAU + i * 0.3, tilt = 0.45 + (i % 3) * 0.2, len = 0.9 + (i % 4) * 0.18
        return (
          <group key={i} position={[0, 0.4, 0]} rotation={[0, a, 0]}>
            <group rotation-x={tilt}>
              <Part geo={cyl(0.012, 0.016, len, 6)} m={B.leafDark} p={[0, len / 2, 0]} castShadow={false} />
              {Array.from({ length: 7 }, (_, k) => (
                <group key={k} position={[0, len * (0.35 + k * 0.1), 0]}>
                  {[-1, 1].map((s) => (
                    <Part key={s} geo={SPH} m={k % 2 ? B.leaf : B.leafLight} scale={[0.02, 0.14 - k * 0.012, 0.035]} p={[0, -0.04, s * 0.06]} rotation-x={s * 1.0} castShadow={k === 3} />
                  ))}
                </group>
              ))}
            </group>
          </group>
        )
      })}
    </group>
  )
}

/** Un monstera dans un panier de jonc : de grandes feuilles rondes sur des tiges arquées. */
export function Monstera({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.3, 0.25, 0.44, 22)} m={B.rattan} p={[0, 0.22, 0]} />
      <Part geo={cyl(0.27, 0.27, 0.03, 20)} m={B.wood} p={[0, 0.43, 0]} castShadow={false} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * TAU + 0.4, h = 0.35 + (i % 3) * 0.2
        return (
          <group key={i} position={[0, 0.42, 0]} rotation-y={a}>
            <Part geo={cyl(0.01, 0.012, h, 5)} m={B.leafDark} p={[0, h / 2, 0.08]} rotation-x={0.35} castShadow={false} />
            <Part geo={SPH} m={i % 2 ? B.leaf : B.leafDark} scale={[0.2, 0.025, 0.24]} p={[0, h, 0.26]} rotation-x={-0.5} />
          </group>
        )
      })}
    </group>
  )
}

/** Un pothos dans une suspension de macramé, accrochée à une potence du mur. */
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
      {Array.from({ length: 18 }, (_, i) => {
        const a = i * 2.1, d = 0.08 + (i % 4) * 0.025, drop = (i % 5) * 0.09
        return <Part key={i} geo={SPH} m={i % 3 ? B.leaf : B.leafLight} scale={[0.045, 0.012, 0.035]} p={[0.32 + Math.cos(a) * d, -0.52 - drop, Math.sin(a) * d]} rotation={[0.6, a, 0.3]} castShadow={false} />
      })}
    </group>
  )
}
