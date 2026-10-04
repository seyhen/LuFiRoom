import { Part, cyl, type V3 } from '../parts'
import { Foliage } from '../nature/Foliage'
import { Rock } from '../nature/Rock'
import { Fern } from '../nature/Fern'
import { Leaf } from '../nature/Leaf'
import { O } from './materials'

/**
 * Le pin taillé en nuages (niwaki) : un tronc qui se tord, des branches qui portent chacune un coussin d'aiguilles,
 * sur son lit de mousse.
 */
function Pine() {
  return (
    <group position={[0.05, 0, 1.75]}>
      <Rock v={6} p={[0, -0.04, 0]} s={[0.62, 0.12, 0.5]} m={O.moss} shadow={false} />
      <Part geo={cyl(0.05, 0.085, 0.55, 10)} m={O.bark} p={[0.03, 0.26, 0]} rotation-z={-0.2} />
      <Part geo={cyl(0.04, 0.055, 0.5, 10)} m={O.bark} p={[0.02, 0.68, 0.02]} rotation-z={0.35} />
      <Part geo={cyl(0.03, 0.04, 0.45, 8)} m={O.bark} p={[0.25, 0.72, 0.04]} rotation-z={-1.0} />
      <Part geo={cyl(0.025, 0.035, 0.36, 8)} m={O.bark} p={[-0.2, 0.92, 0.0]} rotation-z={0.9} />
      <Part geo={cyl(0.025, 0.03, 0.3, 8)} m={O.bark} p={[0.0, 1.05, -0.08]} rotation-x={-0.5} />
      {([
        [0.45, 0.72, 0.06, 0.3, 0.15, 0, O.pineF],
        [-0.36, 0.95, 0.02, 0.25, 0.13, 1, O.pineDeep],
        [0.02, 1.16, -0.16, 0.24, 0.13, 2, O.pineF],
        [0.08, 0.88, 0.2, 0.2, 0.11, 4, O.pineDeep],
        [0.1, 1.36, 0.02, 0.15, 0.1, 5, O.pineF],
      ] as const).map(([x, y, z, w, h, v, m], i) => (
        <Foliage key={i} v={v} p={[x, y, z]} s={[w, h, w * 0.85]} ry={i * 1.7} m={m} style="clipped" />
      ))}
    </group>
  )
}

/** Les azalées taillées en coussins (karikomi), en massifs de deux ou trois ; l'une roussit avec l'automne. */
function Azaleas() {
  const groups: [number, number, number, boolean][] = [[2.55, 0.6, 0.32, false], [1.8, 1.5, 0.28, true], [-0.3, -2.72, 0.3, false], [2.92, 2.2, 0.36, false]]
  return (
    <>
      {groups.map(([x, z, s, rust], g) => (
        <group key={g} position={[x, 0, z]} rotation-y={g * 1.3}>
          <Foliage v={g} p={[0, 0, 0]} s={[s, s * 1.05, s * 0.9]} m={rust ? O.azaleaRust : O.azaleaF} style="clipped" />
          <Foliage v={g + 2} p={[s * 0.85, 0, s * 0.35]} s={[s * 0.62, s * 0.7, s * 0.6]} m={O.azaleaF} style="clipped" />
          {g % 2 === 0 && <Foliage v={g + 4} p={[-s * 0.6, 0, s * 0.6]} s={[s * 0.5, s * 0.55, s * 0.5]} m={rust ? O.azaleaF : O.azaleaRust} style="clipped" />}
        </group>
      ))}
    </>
  )
}

/** Le nanten (bambou sacré), au pied de la palissade : feuillage rougi et grappes de baies vermillon. */
function Nanten({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {[[0, 0.55, 0], [0.12, 0.42, 0.08], [-0.1, 0.48, 0.05]].map(([x, h, z], i) => (
        <Part key={i} geo={cyl(0.012, 0.016, h, 6)} m={O.bambooDry} p={[x, h / 2, z]} rotation-z={x * 1.5} castShadow={false} />
      ))}
      <Foliage v={1} p={[-0.02, 0.38, 0.02]} s={[0.22, 0.24, 0.2]} m={O.nantenF} />
      <Foliage v={5} p={[0.14, 0.26, 0.1]} s={[0.15, 0.16, 0.14]} m={O.azaleaF} />
      {[[0.06, 0.6, 0.12], [-0.12, 0.52, 0.14], [0.16, 0.42, 0.18]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {Array.from({ length: 7 }, (_, k) => (
            <Part key={k} geo={cyl(0.02, 0.02, 0.02, 8)} m={O.berry} p={[Math.cos(k * 2.4) * 0.03, -k * 0.012, Math.sin(k * 2.4) * 0.03]} castShadow={false} />
          ))}
        </group>
      ))}
    </group>
  )
}

/** Une touffe d'herbe du Japon (hakonechloa) : des lames fines et dorées qui retombent toutes du même côté, comme peignées. */
function Grass({ p, s = 1, ry = 0 }: { p: V3; s?: number; ry?: number }) {
  return (
    <group position={p} rotation-y={ry} scale={s}>
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * 2.2 - 1.1, l = 0.32 + (i % 4) * 0.05
        return (
          <group key={i} rotation-y={a}>
            <Leaf kind="lance" r={[-0.85 - (i % 3) * 0.15, 0, 0]} w={0.022} l={l} m={i % 3 ? O.grass : O.fernLight} />
          </group>
        )
      })}
    </group>
  )
}

/**
 * Le jardin autour du bassin : le pin taillé, les azalées, le nanten, des fougères au pied de la palissade et de l'engawa,
 * des touffes d'herbe dorée au bord de l'eau, des coussins de mousse.
 */
export function Shrubs() {
  return (
    <>
      <Pine />
      <Azaleas />
      <Nanten p={[-0.15, 0, -2.85]} />
      <Fern p={[2.05, 0, -2.62]} size={0.62} n={9} m={O.fern} m2={O.fernLight} />
      <Fern p={[-1.62, 0, 2.35]} size={0.55} n={8} m={O.fern} m2={O.fernLight} ry={1} />
      <Fern p={[1.0, 0, 2.88]} size={0.5} n={8} m={O.fern} m2={O.fernLight} ry={2} />
      <Fern p={[-1.5, 0, -1.65]} size={0.45} n={7} m={O.fern} m2={O.fernLight} ry={0.5} />
      <Grass p={[-0.55, 0, 0.25]} s={1.3} ry={0.8} />
      <Grass p={[1.85, 0, 0.75]} s={1.15} ry={-0.6} />
      <Grass p={[2.55, 0, -1.6]} s={1.1} ry={2.4} />
      {([[1.15, 2.35, 0.3, 0.22], [-1.2, 1.3, 0.28, 0.2], [2.95, 1.05, 0.22, 0.18], [-0.95, -2.6, 0.3, 0.25]] as const).map(([x, z, w, d], i) => (
        <Rock key={i} v={i % 2 ? 6 : 7} p={[x, -0.03, z]} s={[w, 0.08, d]} ry={i} m={O.moss} shadow={false} />
      ))}
    </>
  )
}
