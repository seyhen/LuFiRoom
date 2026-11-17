import { useMemo } from 'react'
import { CircleGeometry } from 'three'
import { Batch, Part, SPH, cyl, rbox, type Item, type V3 } from '../../parts'
import { Rock } from '../../nature/Rock'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { farStone } from '../../nature/materials'
import { barkTex, ringsTex } from '../textures'
import { O as BASE } from './materials'
import { snowY } from './ground'
import { between } from './Woodshed'

/** Le devant de la clairière est à 10 à 14 du centre, là où le fondu standard du dehors (r1 12,5) en fait des fantômes bleutés : mêmes matières, fondu large (r0 9,5, r1 17,5). */
const wide = <T extends Parameters<typeof skyFade>[0]>(m: T) => skyFade(m, { c: [0, 0], r0: 9.5, r1: 17.5 })
const O = {
  print: BASE.print,
  rock: wide(farStone(0x9ea3b4)),
  snowCap: wide(far(0xf3f7ff, { roughness: 0.5 })),
  bark: wide(far(0xffffff, { map: barkTex, roughness: 0.78 })),
  rings: wide(far(0xffffff, { map: ringsTex, roughness: 0.65 })),
  twig: wide(far(0x6a4632, { roughness: 0.85 })),
  berry: wide(far(0xc8414f, { roughness: 0.35 })),
  plankDark: wide(far(0x8a6a52, { roughness: 0.82 })),
}

// Les détails de la clairière, pour que la neige du devant ne soit pas un grand aplat vide : souches coiffées de neige, pierres
// enneigées, touffes de ronces sèches, piquets de la vieille clôture, une branche tombée, les traces d'un lièvre.

const PAW = new CircleGeometry(1, 12)

/** Une souche sciée : un fût, les anneaux du dessus, un chapeau de neige qui déborde, une repousse et une racine qui sort. */
function Stump({ x, z, s = 1, ry = 0 }: { x: number; z: number; s?: number; ry?: number }) {
  const g = snowY(x, z) - 0.03
  return (
    <group position={[x, g, z]} rotation-y={ry} scale={s}>
      <Part geo={cyl(0.24, 0.3, 0.4, 14)} m={O.bark} p={[0, 0.2, 0]} castShadow={false} />
      <Part geo={cyl(0.235, 0.235, 0.012, 14)} m={O.rings} p={[0, 0.405, 0]} castShadow={false} />
      {/* le manteau de neige : un disque bombé posé sur un côté seulement, le reste des anneaux se voit */}
      <Part geo={SPH} m={O.snowCap} p={[0.05, 0.43, -0.04]} scale={[0.19, 0.06, 0.17]} castShadow={false} />
      <Part geo={SPH} m={O.snowCap} p={[0, 0.02, 0]} scale={[0.4, 0.07, 0.4]} castShadow={false} />
      {[0.5, 2.4, 4.2].map((a) => <Part key={a} geo={SPH} m={O.bark} p={[Math.cos(a) * 0.3, 0.06, Math.sin(a) * 0.3]} scale={[0.13, 0.05, 0.06]} rotation-y={-a} castShadow={false} />)}
    </group>
  )
}

/** Une pierre de la clairière sous son bonnet de neige. */
function SnowRock({ x, z, s, v, ry = 0 }: { x: number; z: number; s: number; v: number; ry?: number }) {
  return <Rock v={v} p={[x, snowY(x, z) - s * 0.15, z]} s={[s, s * 0.78, s * 0.86]} ry={ry} m={O.rock} moss={O.snowCap} shadow={false} />
}

/** Une touffe de ronces et de tiges sèches qui percent la neige, avec leurs baies rouges oubliées. */
function Brambles({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  const g = snowY(x, z) - 0.03
  const stems = useMemo(() => [[0, 0, 0.3, 0.9], [0.4, 1.4, 0.45, 1.0], [0.9, 2.5, 0.3, 0.75], [-0.3, 3.7, 0.5, 0.95], [0.2, 4.9, 0.25, 0.7], [-0.5, 5.8, 0.4, 0.85]].map(([lean, a, spread, h]) => {
    const tip: V3 = [Math.cos(a) * spread * h, h, Math.sin(a) * spread * h]
    return { ...between([0, 0, 0], tip), tip, lean }
  }), [])
  return (
    <group position={[x, g, z]} scale={s}>
      {stems.map((st, i) => (
        <group key={i}>
          <Part geo={cyl(0.01, 0.022, st.len, 5)} m={O.twig} p={st.p} rotation={st.r} castShadow={false} />
          <Part geo={SPH} m={O.berry} p={st.tip} scale={0.026} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={O.snowCap} p={[0, 0.03, 0]} scale={[0.38, 0.1, 0.34]} castShadow={false} />
    </group>
  )
}

/** Un piquet de la vieille clôture, à moitié enfoncé, de travers, coiffé de neige. */
function Stake({ x, z, tilt = 0.1, h = 0.6 }: { x: number; z: number; tilt?: number; h?: number }) {
  const g = snowY(x, z) - 0.02
  return (
    <group position={[x, g, z]} rotation={[tilt, 0.4, -tilt * 0.6]}>
      <Part geo={rbox(0.11, h, 0.11, 0.035)} m={O.plankDark} p={[0, h / 2 - 0.1, 0]} castShadow={false} />
      <Part geo={SPH} m={O.snowCap} p={[0, h - 0.07, 0]} scale={[0.1, 0.055, 0.1]} castShadow={false} />
      <Part geo={SPH} m={O.snowCap} p={[0, 0.0, 0]} scale={[0.2, 0.06, 0.2]} castShadow={false} />
    </group>
  )
}

/** Une branche tombée sur la neige : un tronçon écorcé, deux rameaux, de la neige dessus. */
function FallenBranch({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const g = snowY(x, z)
  return (
    <group position={[x, g + 0.1, z]} rotation-y={ry}>
      <Part geo={cyl(0.07, 0.09, 1.7, 9)} m={O.plankDark} rotation-z={Math.PI / 2 + 0.05} castShadow={false} />
      <Part geo={cyl(0.03, 0.045, 0.7, 7)} m={O.plankDark} p={[0.35, 0.18, 0.15]} rotation={[0.5, 0.6, 1.1]} castShadow={false} />
      <Part geo={cyl(0.025, 0.04, 0.5, 7)} m={O.plankDark} p={[-0.3, 0.14, -0.1]} rotation={[-0.4, 0.2, 1.0]} castShadow={false} />
      <Part geo={SPH} m={O.snowCap} p={[0.05, 0.08, 0]} scale={[0.7, 0.045, 0.085]} castShadow={false} />
      <Part geo={SPH} m={O.snowCap} p={[0, -0.09, 0]} scale={[0.95, 0.06, 0.2]} castShadow={false} />
    </group>
  )
}

/** Les traces d'un lièvre : par bonds, deux grandes pattes de derrière côte à côte, deux petites devant, qui filent de la lisière à la ronce. */
function hareTracks(from: [number, number], to: [number, number]): Item[] {
  const out: Item[] = [], dx = to[0] - from[0], dz = to[1] - from[1], len = Math.hypot(dx, dz), ux = dx / len, uz = dz / len, ang = Math.atan2(ux, uz)
  const n = Math.floor(len / 0.62)
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n, cx = from[0] + dx * t, cz = from[1] + dz * t
    // les pattes arrière (grandes, côte à côte) puis les pattes avant (petites, l'une derrière l'autre)
    for (const s of [-1, 1]) {
      const hx = cx - uz * s * 0.1, hz = cz + ux * s * 0.1
      out.push({ p: [hx, snowY(hx, hz) + 0.014, hz], s: [0.045, 0.11, 1], r: [-Math.PI / 2, 0, ang] })
      const fx = cx - ux * 0.3 - uz * s * 0.03 * (k % 2 ? 1 : -1), fz = cz - uz * 0.3 + ux * s * 0.03 * (k % 2 ? 1 : -1)
      out.push({ p: [fx, snowY(fx, fz) + 0.014, fz], s: [0.03, 0.05, 1], r: [-Math.PI / 2, 0, ang] })
    }
  }
  return out
}

/** La clairière du devant : à poser dans le `<Static>` du dehors. Les positions viennent de la projection à 1440 px (le devant, de part et d'autre du mixeur). */
export function Clearing() {
  const tracks = useMemo(() => [...hareTracks([-10.5, 6.2], [-7.4, 10.4]), ...hareTracks([15.2, -6.2], [12.4, -2.2])], [])
  return (
    <>
      {/* devant à gauche */}
      <Stump x={-6.4} z={8.1} s={1.1} ry={0.6} />
      <SnowRock x={-8.2} z={7.0} s={0.46} v={2} ry={1.2} />
      <SnowRock x={-7.6} z={7.6} s={0.27} v={5} ry={0.3} />
      <Brambles x={-5.0} z={9.1} s={1.1} />
      <Stake x={-8.6} z={4.6} tilt={0.14} h={0.62} />
      <Stake x={-9.4} z={3.4} tilt={-0.12} h={0.5} />
      <FallenBranch x={-4.4} z={7.6} ry={0.55} />
      <Stump x={-2.8} z={11.2} s={0.95} ry={1.4} />
      <SnowRock x={-5.8} z={11.0} s={0.55} v={4} ry={0.9} />
      <SnowRock x={-5.2} z={11.6} s={0.3} v={0} ry={2.0} />
      <Brambles x={-7.4} z={10.2} s={1.2} />
      <FallenBranch x={-2.2} z={10.0} ry={0.2} />
      {/* devant à droite, au-delà du sentier */}
      <Stump x={11.8} z={-0.8} s={1.2} ry={2.1} />
      <SnowRock x={13.0} z={-3.0} s={0.52} v={3} ry={0.8} />
      <SnowRock x={13.4} z={-1.2} s={0.34} v={1} ry={2.2} />
      <Brambles x={12.8} z={-4.4} s={1.15} />
      <FallenBranch x={13.6} z={-3.6} ry={-0.4} />
      <Batch geo={PAW} m={O.print} items={tracks} />
    </>
  )
}
