import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ConeGeometry, MeshStandardMaterial } from 'three'
import { seeded, smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { Batch, Part, SPH, cyl, noRay, rbox, type Item, type V3 } from '../../parts'
import { far } from '../../materials'
import { Firs, type Fir } from '../../nature/firs'
import { Fern } from '../../nature/Fern'
import { Foliage } from '../../nature/Foliage'
import { Rock } from '../../nature/Rock'
import { SkyFadeClock, groundGrid, skyFade } from '../../outdoor'
import { GlowPoints } from '../../objects/GlowPoints'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { Steam } from '../../objects/Steam'
import { tent } from '../../../rooms/tent'
import { CENTER, HALF_ARC, onCanvas, radiusAt } from '../shape'
import { tube } from '../Shell'
import { groundCol, groundY } from './ground'
import { O } from './materials'

// Le dehors de la tente : une pinède sous la pluie. La tente est au milieu d'une clairière de mousse et d'aiguilles : des sapins qui montent
// derrière et sur les côtés (et des collines bleutées au loin pour les grands écrans), trois bouleaux, des rochers moussus, des fougères, un
// tronc tombé et ses champignons, un sentier de boue qui part vers la droite, le feu de camp éteint (un trépied, une marmite, deux
// rondins pour s'asseoir), un tas de bois sous une bâche bleue, les haubans de la tente, la lanterne d'un autre campeur sur le sentier ;
// la nuit, des lucioles dans les fougères et, très loin, la lueur d'une autre tente.

const TREE_COLS = [0x2f5a46, 0x356650, 0x294c3e, 0x3b6b52, 0x2c5340]
const fir = (x: number, z: number, h: number, w = 1, tiers = 5, c = 0): Fir => ({ p: [x, groundY(x, z) - 0.05, z], h, w: w * 0.66, tiers, snow: 0, c: TREE_COLS[c % 5] })

/** Les grands sapins, derrière la tente et sur ses côtés, à 6 à 10 m du centre : ils dépassent le haut de la toile. */
const FOREST: Fir[] = [
  fir(-4.8, -5.4, 6.4, 1, 5, 0), fir(-2.4, -6.6, 7.4, 1.05, 5, 1), fir(0.4, -6.2, 6.0, 0.95, 5, 2), fir(2.9, -7.0, 7.2, 1, 5, 3), fir(5.6, -5.6, 5.4, 1, 4, 4),
  fir(-6.2, -3.4, 6.6, 1, 5, 2), fir(-6.8, -0.2, 7.2, 1.05, 5, 0), fir(-7.2, 2.9, 5.8, 1, 5, 3), fir(-4.0, -8.4, 8.2, 1.1, 5, 4), fir(-1.0, -8.8, 7.8, 1, 5, 1),
  fir(1.8, -9.0, 8.4, 1.1, 5, 0), fir(5.0, -8.4, 7.2, 1, 5, 2), fir(-8.4, -2.8, 8.0, 1.05, 5, 1), fir(-8.6, 0.8, 6.8, 1, 5, 4), fir(8.0, -6.6, 6.4, 1, 5, 3),
  fir(9.2, -0.2, 5.0, 1, 4, 0), fir(-9.2, 4.6, 4.6, 1, 4, 2),
  // devant, de petits sapins loin sur les côtés (jamais devant l'entrée)
  fir(-6.4, 5.8, 4.4, 1, 4, 1), fir(7.0, 6.2, 4.0, 1, 4, 4), fir(-3.6, 9.0, 3.4, 1.05, 4, 3), fir(9.4, 3.8, 3.8, 1, 4, 2),
]

/** La forêt lointaine, pour les grands écrans : un arc de sapins pâles à 11 à 17 m (derrière et sur les côtés). */
function farForest(): Fir[] {
  const r = seeded(31), out: Fir[] = []
  for (let i = 0; i < 26; i++) {
    const deg = 100 + (i / 26) * 250 + (r() - 0.5) * 8, a = (deg * Math.PI) / 180, d = 11.4 + (i % 3) * 2.0 + r() * 1.4
    const x = Math.cos(a) * d, z = Math.sin(a) * d
    out.push({ p: [x, groundY(x, z) - 0.05, z], h: 3.4 + r() * 2.2, w: 0.7 + r() * 0.2, tiers: 4, snow: 0, c: TREE_COLS[i % 5] })
  }
  return out
}
const FAR_FOREST = farForest()

/** Un bouleau : un tronc blanc tacheté de noir, trois branches et un houppier léger de feuilles vert-jaune. */
function Birch({ p, h = 3.6, s = 1, seed = 0 }: { p: V3; h?: number; s?: number; seed?: number }) {
  const [x, y, z] = p
  return (
    <group>
      <Part geo={cyl(0.07 * s, 0.11 * s, h, 8)} m={O.birchBark} p={[x, y + h / 2, z]} castShadow={false} />
      {[0.4, 0.9, 1.5, 2.1, 2.7].filter((k) => k < h - 0.4).map((k, i) => (
        <Part key={k} geo={rbox(0.05 * s, 0.05, 0.1 * s, 0.015)} m={O.birchMark} p={[x + 0.09 * s * (i % 2 ? 1 : -1) * 0.6, y + k, z + 0.08 * s * (i % 2 ? -1 : 1)]} rotation-y={i} castShadow={false} />
      ))}
      {[[-0.5, 0.7], [0.45, 0.85], [0.0, 1.0]].map(([dx, k], i) => (
        <Part key={i} geo={cyl(0.025 * s, 0.045 * s, 0.8 * s, 6)} m={O.birchBark} p={[x + dx * 0.4 * s, y + h * k - 0.2, z + (i - 1) * 0.2 * s]} rotation-z={dx * 0.9} castShadow={false} />
      ))}
      {[[0, 0.1, 0, 0.8], [-0.62, -0.28, 0.2, 0.62], [0.58, -0.2, -0.2, 0.66], [0.1, 0.5, 0.15, 0.5], [-0.2, -0.45, -0.4, 0.46]].map(([dx, dy, dz, r], i) => (
        <Foliage key={i} v={seed + i} p={[x + dx * s, y + h + dy * s - 0.1, z + dz * s]} s={[r * s, r * s * 0.8, r * s]} m={O.leaf[(seed + i) % 3]} ry={i} shadow={false} />
      ))}
    </group>
  )
}

/** Un champignon : pied crème, chapeau rouge à pois. */
function Mushroom({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Part geo={cyl(0.025, 0.035, 0.1, 8)} m={O.mushroomStem} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={SPH} m={O.mushroom} scale={[0.07, 0.04, 0.07]} p={[0, 0.11, 0]} castShadow={false} />
      {[[0.03, 0.04], [-0.035, 0.02], [0.0, -0.05]].map(([dx, dz], i) => <Part key={i} geo={SPH} m={O.dot} scale={0.011} p={[dx, 0.145, dz]} castShadow={false} />)}
    </group>
  )
}

/** Le feu de camp éteint : un cercle de pierres, la cendre et deux rondins brûlés, un trépied de bois avec sa marmite noircie, deux rondins pour s'asseoir. */
function Campfire({ at }: { at: [number, number] }) {
  const [x, z] = at, y = groundY(x, z)
  const top: V3 = [0, 1.45, 0]
  return (
    <group position={[x, y, z]}>
      <Part geo={cyl(0.55, 0.58, 0.03, 18)} m={O.ash} p={[0, 0.015, 0]} castShadow={false} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        return <Rock key={i} v={i + 2} p={[Math.cos(a) * 0.62, -0.02, Math.sin(a) * 0.62]} s={[0.17, 0.12, 0.15]} ry={a} m={O.stone} shadow={false} />
      })}
      <Part geo={cyl(0.07, 0.08, 0.7, 8)} m={O.charcoal} p={[0.05, 0.1, 0.0]} rotation={[0, 0.5, Math.PI / 2 - 0.1]} castShadow={false} />
      <Part geo={cyl(0.06, 0.07, 0.6, 8)} m={O.charcoal} p={[-0.05, 0.1, 0.05]} rotation={[0, -0.7, Math.PI / 2 - 0.05]} castShadow={false} />
      {/* le trépied : trois perches qui se rejoignent, la chaîne, la marmite */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.6, t = tube([Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05], [0.02, top[1], 0.02], 0.035)
        return <Part key={i} geo={cyl(t.r, t.r * 1.15, t.h, 7)} m={O.log} p={t.p} rotation={t.rot} castShadow={false} />
      })}
      <Part geo={cyl(0.01, 0.01, 0.4, 5)} m={O.iron} p={[0, top[1] - 0.2, 0]} castShadow={false} />
      <Part geo={SPH} m={O.iron} scale={[0.16, 0.13, 0.16]} p={[0, top[1] - 0.52, 0]} castShadow={false} />
      <Part geo={cyl(0.12, 0.12, 0.02, 14)} m={O.iron} p={[0, top[1] - 0.4, 0]} castShadow={false} />
      {/* les rondins-sièges, de part et d'autre */}
      {[[1.2, -0.5, 0.5], [-0.6, 1.2, 2.3]].map(([dx, dz, a], i) => (
        <group key={i} position={[dx, 0.17, dz]} rotation-y={a}>
          <Part geo={cyl(0.17, 0.17, 1.1, 10)} m={O.log} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.15, 0.15, 0.01, 10)} m={O.logCut} p={[0.555, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      ))}
      <Steam at={[0.0, 0.35, 0.0]} every={1.6} />
    </group>
  )
}

/** Le tas de bois sous la bâche : une pile de bûches (bout coupé vers nous), une bâche bleue tendue sur deux perches, le billot et sa hache. */
function Woodpile({ at }: { at: [number, number] }) {
  const [x, z] = at, y = groundY(x, z)
  const { logs, caps } = useMemo(() => {
    const r = seeded(8), logs: Item[] = [], caps: Item[] = []
    for (let row = 0; row < 5; row++) {
      const n = 8 - Math.floor(row * 0.9)
      for (let i = 0; i < n; i++) {
        const lx = (i - (n - 1) / 2) * 0.17 + (r() - 0.5) * 0.01, ly = 0.08 + row * 0.15, s = 0.9 + r() * 0.25
        logs.push({ p: [lx, ly, 0], s: [s, 1, s], r: [Math.PI / 2, 0, 0], c: r() < 0.5 ? 0x7a5a3a : 0x6a4c30 })
        caps.push({ p: [lx, ly, 0.352], s: [0.92 * s, 1, 0.92 * s], r: [Math.PI / 2, 0, 0] })
      }
    }
    return { logs, caps }
  }, [])
  return (
    <group position={[x, y, z]} rotation-y={-0.5}>
      <Batch geo={cyl(0.085, 0.085, 0.7, 8)} m={O.log} items={logs} />
      <Batch geo={cyl(0.08, 0.08, 0.012, 8)} m={O.logCut} items={caps} />
      <Static>
        {/* les perches et la bâche bleue, penchée vers l'arrière, ses œillets cordés */}
        {[-0.8, 0.8].map((dx) => <Part key={dx} geo={cyl(0.04, 0.05, 2.1, 6)} m={O.log} p={[dx, 1.05, 0.5]} castShadow={false} />)}
        <Part geo={rbox(1.9, 0.03, 1.6, 0.012)} m={O.tarp} p={[0, 2.05, -0.1]} rotation-x={0.28} castShadow={false} />
        <Part geo={rbox(1.9, 0.045, 0.06, 0.02)} m={O.tarpEdge} p={[0, 2.19, 0.62]} rotation-x={0.28} castShadow={false} />
        {[-0.8, 0.8].map((dx) => {
          const t = tube([dx, 2.05, 0.5], [dx * 1.8, 0, 1.6], 0.012)
          return <Part key={dx} geo={cyl(t.r, t.r, t.h, 5)} m={O.rope} p={t.p} rotation={t.rot} castShadow={false} />
        })}
        {/* le billot et la hache plantée dedans */}
        <Part geo={cyl(0.24, 0.27, 0.4, 14)} m={O.log} p={[1.35, 0.2, 0.7]} />
        <Part geo={cyl(0.22, 0.22, 0.01, 14)} m={O.logCut} p={[1.35, 0.405, 0.7]} castShadow={false} />
        <Part geo={cyl(0.02, 0.025, 0.8, 7)} m={O.peg} p={[1.42, 0.78, 0.72]} rotation={[0.15, 0, -0.55]} castShadow={false} />
        <Part geo={rbox(0.2, 0.14, 0.04, 0.012)} m={O.iron} p={[1.26, 0.45, 0.7]} rotation-z={-0.4} castShadow={false} />
      </Static>
    </group>
  )
}

/** Les haubans de la tente : une corde de la toile à un piquet planté au sol, de chaque côté coupé (les autres sont derrière la toile). */
function GuyRopes() {
  return (
    <>
      {[CENTER - HALF_ARC + 0.05, CENTER + HALF_ARC - 0.05].map((phi, k) => {
        const s = Math.sin(phi), c = Math.cos(phi)
        return [2.4, 1.2].map((y, i) => {
          const a = onCanvas(phi, y), r = radiusAt(y) + 1.3 + i * 1.4, bx = s * r + (k ? -0.4 : 0.4) * (1 - i), bz = c * r, by = groundY(bx, bz)
          const t = tube(a, [bx, by + 0.02, bz], 0.012)
          return (
            <group key={`${k}${i}`}>
              <Part geo={cyl(t.r, t.r, t.h, 5)} m={O.rope} p={t.p} rotation={t.rot} castShadow={false} />
              <Part geo={cyl(0.022, 0.026, 0.34, 6)} m={O.peg} p={[bx, by + 0.1, bz]} rotation={[-c * 0.5, 0, s * 0.5]} castShadow={false} />
              <Part geo={rbox(0.07, 0.03, 0.03, 0.01)} m={O.peg} p={[(a[0] + bx) / 2 + (bx - a[0]) * 0.15, (a[1] + by) / 2 + (by - a[1]) * 0.15, (a[2] + bz) / 2 + (bz - a[2]) * 0.15]} castShadow={false} />
            </group>
          )
        })
      })}
    </>
  )
}

/** La lanterne d'un autre campeur, accrochée à une perche au bord du sentier : elle s'allume le soir. */
function PathLantern({ at }: { at: [number, number] }) {
  const [x, z] = at, y = groundY(x, z)
  return (
    <group position={[x, y, z]}>
      <Part geo={cyl(0.04, 0.055, 2.2, 6)} m={O.log} p={[0, 1.1, 0]} rotation-z={0.04} castShadow={false} />
      <Part geo={cyl(0.015, 0.015, 0.5, 5)} m={O.iron} p={[0.22, 2.12, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.08, 0.1, 0.22, 8)} m={O.lantern} p={[0.44, 1.9, 0]} castShadow={false} />
      <Part geo={cyl(0.02, 0.1, 0.07, 8)} m={O.iron} p={[0.44, 2.04, 0]} castShadow={false} />
      <Part geo={cyl(0.1, 0.09, 0.03, 8)} m={O.iron} p={[0.44, 1.78, 0]} castShadow={false} />
      <sprite position={[0.44, 1.9, 0]} scale={1.8} material={O.glow} raycast={noRay} renderOrder={4} />
    </group>
  )
}

/** Une autre tente, très loin dans les arbres : un petit cône de toile dont la porte s'allume le soir (pour les coins du haut sur grand écran). */
function FarTent({ at }: { at: [number, number] }) {
  const [x, z] = at, y = groundY(x, z)
  const geo = useMemo(() => new ConeGeometry(1.5, 1.7, 8, 1, false), [])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <group position={[x, y, z]}>
      <mesh geometry={geo} material={FAR_TENT} position={[0, 0.85, 0]} raycast={noRay} />
      <mesh position={[0.82, 0.34, 0.82]} rotation-y={Math.PI / 4} material={FAR_DOOR} raycast={noRay}>
        <planeGeometry args={[0.5, 0.65]} />
      </mesh>
    </group>
  )
}
const FAR_TENT = skyFade(far(0xa88c5a, { roughness: 0.9 }), { c: [0, 0], r0: 9.5, r1: 17.5 })
const FAR_DOOR = skyFade(new MeshStandardMaterial({ color: 0x4a3a22, emissive: 0xffa84a, emissiveIntensity: 0.05, roughness: 0.9 }), { c: [0, 0], r0: 9.5, r1: 17.5 })

/** Des plaques de rochers, des fougères, un tronc tombé aux champignons, une flaque : le sous-bois. */
function Undergrowth() {
  const ferns = useMemo(() => {
    const r = seeded(14), list: [number, number, number, number][] = []
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = 4.2 + r() * 5.2, x = Math.cos(a) * d, z = Math.sin(a) * d
      if (z + x > 5.5 && Math.abs(x - z) < 3.5) continue // pas devant l'entrée
      if (Math.hypot(x + 7.4, z - 0.2) < 2.4 || Math.hypot(x - 5.6, z - 3.6) < 2.0 || Math.hypot(x + 5.4, z - 6.5) < 2.0) continue // ni dans le tas de bois, ni dans le feu, ni sous le tronc
      list.push([x, z, 0.38 + r() * 0.26, r() * 6])
    }
    return list
  }, [])
  return (
    <>
      {ferns.map(([x, z, s, ry], i) => <Fern key={i} p={[x, groundY(x, z), z]} size={s} n={7} m={O.fernM} m2={O.fernM2} ry={ry} />)}
      {[[5.0, -2.1, 0.5, 0.4], [-2.4, 7.4, 0.46, 1.4], [8.8, 2.4, 0.4, 2.2], [-7.0, -6.2, 0.95, 0.7], [-3.6, -7.2, 0.7, 3.1], [3.4, 6.8, 0.36, 0.2]].map(([x, z, k, ry], i) => (
        <Rock key={i} v={i} p={[x, groundY(x, z) - 0.06, z]} s={[k * 1.1, k * 0.8, k]} ry={ry} m={O.stone} moss={O.moss} shadow={false} />
      ))}
      {/* le tronc tombé, sa mousse, trois champignons */}
      <group position={[-5.4, groundY(-5.4, 6.5), 6.5]} rotation-y={0.9}>
        <Part geo={cyl(0.26, 0.3, 2.6, 10)} m={O.log} p={[0, 0.26, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.2, 0.2, 0.012, 10)} m={O.logCut} p={[1.3, 0.26, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={SPH} m={O.moss} scale={[0.9, 0.12, 0.2]} p={[-0.2, 0.5, 0]} castShadow={false} />
        <Mushroom p={[0.6, 0.45, 0.14]} s={1.2} />
        <Mushroom p={[0.78, 0.4, -0.16]} s={0.9} />
        <Mushroom p={[-0.8, 0.04, 0.44]} s={1.1} />
      </group>
      <Part geo={cyl(0.7, 0.7, 0.006, 20)} m={O.puddle} scale={[1.4, 1, 0.8]} p={[6.6, groundY(6.6, 1.0) + 0.012, 1.0]} castShadow={false} />
    </>
  )
}

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    O.lantern.emissiveIntensity = 0.1 + k * 1.3
    O.glow.opacity = k * 0.85
    FAR_DOOR.emissiveIntensity = 0.05 + k * 1.4
  })
  return null
}

/** Des lucioles posées dans les fougères, la nuit : des halos jaune-vert (un seul tracé). */
const FLY_POINTS: V3[] = (() => {
  const r = seeded(61), out: V3[] = []
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2, d = 4.4 + r() * 5, x = Math.cos(a) * d, z = Math.sin(a) * d
    if (x + z > 6) continue
    out.push([x, groundY(x, z) + 0.3 + r() * 1.4, z])
  }
  return out
})()

export function Surroundings() {
  const terrain = useMemo(() => groundGrid(0, 0, 44, 110, groundY, groundCol, 2), [])
  useEffect(() => () => terrain.dispose(), [terrain])
  const fly = useRef({ n: 0 })
  useFrame(() => { fly.current.n = smooth(mood.night) * (1 - 0.5 * mood.rain) })
  return (
    <>
      <SkyFadeClock room={tent} />
      <Evening />
      <mesh geometry={terrain} material={O.ground} receiveShadow raycast={noRay} />
      <Static>
        <Firs list={FOREST} m={O.fir} snowM={O.snowOff} trunkM={O.trunk} seed={5} />
        <Firs list={FAR_FOREST} m={O.farFir} snowM={O.snowOff} trunkM={O.farTrunk} seed={9} />
        <Birch p={[-7.4, groundY(-7.4, 5.4), 5.4]} h={3.8} seed={1} />
        <Birch p={[6.2, groundY(6.2, -6.3), -6.3]} h={4.4} s={1.1} seed={3} />
        <Birch p={[-9.9, groundY(-9.9, -3.8), -3.8]} h={4.0} s={1.05} seed={2} />
        <Undergrowth />
        <Campfire at={[5.6, 3.6]} />
        <Woodpile at={[-7.4, 0.2]} />
        <GuyRopes />
        <PathLantern at={[7.4, -1.4]} />
        <FarTent at={[-12.8, -7.2]} />
      </Static>
      <GlowPoints points={FLY_POINTS} color={0xd2f56a} size={0.28} level={() => fly.current.n * 0.9} />
      <OutdoorPrecip ground={groundY} area={[-13, 13, -12, 12]} covered />
    </>
  )
}

