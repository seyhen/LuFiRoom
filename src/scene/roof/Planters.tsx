import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Lantern } from './Lounge'
import { R } from './materials'

/** La jardinière de bois le long du parapet : lavande, graminées, un plant de tomates tuteuré. */
export function Planter() {
  return (
    <group position={[-0.5, 0, -2.78]}>
      <Part geo={rbox(1.9, 0.48, 0.44, 0.04)} m={R.teak} p={[0, 0.24, 0]} />
      <Part geo={rbox(1.8, 0.04, 0.36, 0.02)} m={R.log} p={[0, 0.47, 0]} castShadow={false} />
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[-0.75 + i * 0.12, 0.48, -0.06 + (i % 2) * 0.1]}>
          {[0, 1, 2].map((k) => (
            <group key={k} rotation-z={(k - 1) * 0.25}>
              <Part geo={cyl(0.005, 0.005, 0.32, 4)} m={R.olive} p={[0, 0.16, 0]} castShadow={false} />
              <Part geo={SPH} m={R.lavender} scale={[0.018, 0.06, 0.018]} p={[0, 0.34, 0]} castShadow={false} />
            </group>
          ))}
        </group>
      ))}
      {/* les tomates, au bout */}
      <group position={[0.7, 0.48, 0]}>
        <Part geo={cyl(0.01, 0.01, 1.0, 4)} m={R.teak} p={[0, 0.5, 0]} castShadow={false} />
        {[0.3, 0.5, 0.7, 0.85].map((y, i) => (
          <group key={y}>
            <Part geo={SPH} m={i % 2 ? R.leaf : R.leafDark} scale={[0.14, 0.06, 0.12]} p={[(i % 2 ? 1 : -1) * 0.07, y, 0]} />
            <Part geo={SPH} m={R.tomato} scale={0.04} p={[(i % 2 ? -1 : 1) * 0.06, y - 0.05, 0.05]} castShadow={false} />
          </group>
        ))}
      </group>
    </group>
  )
}

/** Un olivier dans un grand pot de terre cuite, dans le coin du fond. */
export function OliveTree() {
  return (
    <group position={[2.25, 0, -2.55]}>
      <Part geo={cyl(0.32, 0.26, 0.55, 22)} m={R.terracotta} p={[0, 0.275, 0]} />
      <Part geo={cyl(0.04, 0.06, 1.1, 8)} m={R.log} p={[0.02, 1.0, 0]} rotation-z={0.08} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * TAU, r = 0.22 + (i % 3) * 0.08
        return <Part key={i} geo={SPH} m={i % 2 ? R.olive : R.leaf} scale={[0.2, 0.15, 0.2]} p={[Math.cos(a) * r, 1.55 + (i % 4) * 0.09, Math.sin(a) * r]} />
      })}
    </group>
  )
}

/** Trois pots d'herbes sur le couronnement du parapet de gauche, et une lanterne. */
export function Herbs() {
  return (
    <>
      {[[0.6, R.leaf], [0.95, R.olive], [1.3, R.leafDark]].map(([z, m], i) => (
        <group key={i} position={[-3.19, 1.02, z as number]}>
          <Part geo={cyl(0.09, 0.07, 0.14, 14)} m={R.terracotta} p={[0, 0.07, 0]} />
          {[0, 1, 2, 3, 4].map((k) => (
            <Part key={k} geo={SPH} m={m as typeof R.leaf} scale={[0.05, 0.07, 0.05]} p={[Math.cos(k * 1.3) * 0.04, 0.18 + (k % 2) * 0.04, Math.sin(k * 1.3) * 0.04]} castShadow={false} />
          ))}
        </group>
      ))}
      <Lantern position={[-3.19, 1.02, -0.35]} scale={0.8} />
    </>
  )
}
