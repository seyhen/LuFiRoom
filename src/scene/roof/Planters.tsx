import { Part, SPH, cyl, rbox } from '../parts'
import { Foliage } from '../nature/Foliage'
import { Rosette } from '../nature/Rosette'
import { Lantern } from './Lounge'
import { R } from './materials'

/** La jardinière de bois le long du parapet : trois touffes de lavande en fleurs, un plant de tomates tuteuré. */
export function Planter() {
  return (
    <group position={[-0.5, 0, -2.78]}>
      <Part geo={rbox(1.9, 0.48, 0.44, 0.04)} m={R.teak} p={[0, 0.24, 0]} />
      <Part geo={rbox(1.8, 0.04, 0.36, 0.02)} m={R.log} p={[0, 0.47, 0]} castShadow={false} />
      {[-0.6, -0.15, 0.28].map((x, g) => (
        <group key={g} position={[x, 0.46, 0]}>
          {/* la touffe gris-vert, et ses épis qui en jaillissent */}
          <Foliage v={g} p={[0, 0, 0]} s={[0.24, 0.2, 0.17]} m={R.lavBush} style="clipped" />
          {Array.from({ length: 16 }, (_, k) => {
            const a = k * 2.4 + g, d = 0.04 + (k % 4) * 0.04, tilt = 0.15 + (k % 3) * 0.12, h = 0.28 + (k % 5) * 0.035
            return (
              <group key={k} position={[Math.cos(a) * d, 0.12, Math.sin(a) * d * 0.7]} rotation={[Math.sin(a) * tilt, 0, -Math.cos(a) * tilt]}>
                <Part geo={cyl(0.004, 0.005, h, 4)} m={R.olive} p={[0, h / 2, 0]} castShadow={false} />
                <Part geo={cyl(0.016, 0.024, 0.13, 8)} m={k % 3 ? R.lavender : R.lavenderDeep} p={[0, h + 0.04, 0]} castShadow={false} />
              </group>
            )
          })}
        </group>
      ))}
      {/* les tomates, au bout : un tuteur, le feuillage, les fruits qui rougissent */}
      <group position={[0.7, 0.48, 0]}>
        <Part geo={cyl(0.01, 0.01, 1.0, 4)} m={R.teak} p={[0, 0.5, 0]} castShadow={false} />
        {[[0.08, 0.0, 0.02, 0.15], [-0.07, 0.16, 0.0, 0.14], [0.07, 0.33, -0.02, 0.13], [-0.06, 0.5, 0.03, 0.12], [0.05, 0.66, 0.0, 0.1], [0, 0.82, 0.02, 0.08]].map(([x, y, z, w], i) => (
          <Foliage key={i} v={i} p={[x, y, z]} s={[w, w * 1.1, w * 0.9]} ry={i * 2} m={R.tomatoF} shadow={i % 2 === 0} />
        ))}
        {[[0.15, 0.2, 0.06], [-0.13, 0.36, 0.09], [0.12, 0.55, 0.08], [-0.02, 0.12, 0.14], [0.03, 0.45, 0.14]].map(([x, y, z], i) => (
          <Part key={i} geo={SPH} m={i === 2 ? R.tomatoF : R.tomato} p={[x, y, z]} scale={[0.042, 0.038, 0.042]} castShadow={false} />
        ))}
      </group>
    </group>
  )
}

/** Un olivier dans un grand pot de terre cuite, dans le coin du fond : tronc noueux en deux branches, feuillage argenté. */
export function OliveTree() {
  return (
    <group position={[2.25, 0, -2.55]}>
      <Part geo={cyl(0.32, 0.26, 0.55, 22)} m={R.terracotta} p={[0, 0.275, 0]} />
      <Part geo={cyl(0.3, 0.3, 0.03, 20)} m={R.log} p={[0, 0.535, 0]} castShadow={false} />
      <Part geo={cyl(0.05, 0.075, 0.7, 10)} m={R.log} p={[0.03, 0.88, 0]} rotation-z={0.12} />
      <Part geo={cyl(0.035, 0.05, 0.6, 10)} m={R.log} p={[-0.1, 1.42, 0.04]} rotation={[0.15, 0, 0.35]} />
      <Part geo={cyl(0.03, 0.045, 0.55, 10)} m={R.log} p={[0.14, 1.4, -0.03]} rotation={[-0.1, 0, -0.4]} />
      {([[-0.22, 1.5, 0.08, 0.3, 0.34], [0.22, 1.48, -0.06, 0.32, 0.36], [0.0, 1.72, 0.02, 0.34, 0.36], [-0.05, 1.42, -0.2, 0.24, 0.26], [0.1, 1.38, 0.2, 0.24, 0.26]] as const).map(([x, y, z, w, h], i) => (
        <Foliage key={i} v={i} p={[x, y, z]} s={[w, h, w * 0.9]} ry={i * 1.9} m={i % 2 ? R.oliveDeep : R.oliveF} shadow={i < 3} />
      ))}
    </group>
  )
}

/** Trois pots d'herbes sur le couronnement du parapet de gauche (basilic, persil, menthe), et une lanterne. */
export function Herbs() {
  return (
    <>
      {[0.6, 0.95, 1.3].map((z, i) => (
        <group key={i} position={[-3.19, 1.02, z]}>
          <Part geo={cyl(0.09, 0.07, 0.14, 14)} m={R.terracotta} p={[0, 0.07, 0]} />
          <Part geo={cyl(0.08, 0.08, 0.02, 12)} m={R.log} p={[0, 0.135, 0]} castShadow={false} />
          <Foliage v={i + 1} p={[0, 0.12, 0]} s={[0.1, 0.16 + (i % 2) * 0.04, 0.1]} ry={i} m={R.herbF[i]} shadow={false} />
        </group>
      ))}
      <Lantern position={[-3.19, 1.02, -0.35]} scale={0.8} />
    </>
  )
}

/** Un aloès en rosette : des feuilles charnues et pointues qui montent du centre et s'ouvrent. */
export function Aloe({ position }: { position: [number, number, number] }) {
  return <Rosette p={position} size={0.24} n={11} rise={1.25} m={R.aloe} />
}
