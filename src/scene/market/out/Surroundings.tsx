import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, CircleGeometry, MeshBasicMaterial, SpriteMaterial, TorusGeometry, TubeGeometry, Vector3 } from 'three'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { Batch, Part, SPH, cyl, noRay, rbox, type Item, type V3 } from '../../parts'
import { gummy } from '../../materials'
import { canvasTex } from '../../paint'
import { SkyFadeClock, skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { glowTex } from '../../textures'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { GlowPoints } from '../../objects/GlowPoints'
import { market } from '../../../rooms/market'
import { Block } from '../../roof/out/Buildings'
import { O } from '../../roof/out/materials'

// Le dehors du marché de nuit : la rue continue. Une chaussée mouillée et ses rails de tram devant, les immeubles de brique voisins
// à gauche et derrière à droite, leurs enseignes verticales au néon (RAMEN, KARAOKE, GYOZA, BAR) qui s'allument le soir, des
// guirlandes de lanternes rouges tendues au-dessus de la rue, un scooter garé, l'étal voisin avec sa table et ses tabourets.

const ROAD = -0.42, WALK = -0.3
const DISC = new CircleGeometry(1, 24)
/** Les flaques où se reflètent les néons (un seul tracé). */
const PUDDLES: Item[] = [[1.5, 5.2, 1.2, 0.5], [-2.0, 7.0, 0.9, 0.4], [5.6, 2.4, 0.5, 1.0]].map(([x, z, a, b]) => ({ p: [x, ROAD + 0.01, z], s: [a, b, 1], r: [-Math.PI / 2, 0, 0] }))
const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const tube = (pts: V3[], r: number) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 40, r, 6, false)

/** Une enseigne verticale : fond sombre, lettres empilées au néon ; `glow` : les lettres seules (elles s'allument). */
function signTex(word: string, color: string, glow: boolean) {
  return canvasTex(96, 64 * word.length + 32, (x) => {
    const H = 64 * word.length + 32
    x.fillStyle = glow ? '#000' : '#2a1838'; x.fillRect(0, 0, 96, H)
    x.strokeStyle = glow ? color : 'rgba(255,255,255,.25)'; x.lineWidth = 4; x.strokeRect(6, 6, 84, H - 12)
    x.fillStyle = glow ? color : '#c8b8d8'; x.font = 'bold 50px "Arial Rounded MT Bold", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
    for (let i = 0; i < word.length; i++) x.fillText(word[i], 48, 44 + i * 64)
  })
}
const SIGNS: [string, string, V3, number][] = [['RAMEN', '#ff5ab0', [-3.84, 3.2, 1.6], Math.PI / 2], ['KARAOKE', '#5ae0ff', [-3.84, 3.7, -1.4], Math.PI / 2], ['GYOZA', '#ffd25a', [5.2, 2.6, -4.42], 0], ['BAR', '#ff7a4a', [8.4, 2.2, -4.42], 0]]
const signMats = SIGNS.map(([w, c]) => skyFade(gummy(0xffffff, { map: signTex(w, c, false), emissiveMap: signTex(w, c, true), emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.4 }), F))

const M = {
  road: skyFade(snowTop(gummy(0x3a3446, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }), 1, 0.4, 0.8), F),
  walk: skyFade(snowTop(gummy(0x8a8290, { roughness: 0.7 }), 1, 0.4, 0.8), F),
  rail: skyFade(gummy(0xb8bcc6, { roughness: 0.25, clearcoat: 0.8, metalness: 0.3 }), F),
  wire: skyFade(gummy(0x2a2430, { roughness: 0.5 }), F),
  lantern: skyFade(gummy(0xe0402e, { roughness: 0.6, emissive: 0xff5a2a, emissiveIntensity: 0.15 }), F),
  cap: skyFade(gummy(0x2a2024, { roughness: 0.5 }), F),
  scooter: skyFade(gummy(0x8ad8c0, { roughness: 0.3, clearcoat: 0.8 }), F),
  tire: skyFade(gummy(0x24202a, { roughness: 0.6 }), F),
  chrome: skyFade(gummy(0xd8dce4, { roughness: 0.2, clearcoat: 1 }), F),
  seat: skyFade(gummy(0x5a3a2a, { roughness: 0.5, clearcoat: 0.4 }), F),
  stool: skyFade(gummy(0xe04a5a, { roughness: 0.4, clearcoat: 0.6 }), F),
  stoolBlue: skyFade(gummy(0x4a7ae0, { roughness: 0.4, clearcoat: 0.6 }), F),
  table: skyFade(gummy(0xf0eadc, { roughness: 0.4, clearcoat: 0.5 }), F),
  umbrella: skyFade(snowTop(gummy(0xf4c040, { roughness: 0.6, side: 2 }), 1, 0.4, 0.8), F),
  glow: new SpriteMaterial({ map: glowTex, color: 0xff7a50, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  puddle: new MeshBasicMaterial({ color: 0xff7ac8, transparent: true, opacity: 0.18, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }),
}

/** Les guirlandes de lanternes, tendues le long des façades voisines (jamais devant la pièce) : [départ, arrivée]. */
const STRINGS: [V3, V3][] = [[[-3.55, 3.0, 3.9], [-3.55, 2.8, 9.4]], [[3.9, 3.0, -4.82], [10.2, 2.8, -4.82]]]
const sagAt = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 0.45 * Math.sin(Math.PI * t), a[2] + (b[2] - a[2]) * t]

/** Le scooter garé : carénage menthe, selle, guidon chromé, phare, deux petites roues. */
function Scooter({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      {[-0.42, 0.42].map((x) => <Part key={x} geo={new TorusGeometry(0.16, 0.07, 10, 20)} m={M.tire} p={[x, 0.22, 0]} />)}
      <Part geo={SPH} m={M.scooter} p={[-0.18, 0.45, 0]} scale={[0.42, 0.2, 0.2]} />
      <Part geo={SPH} m={M.scooter} p={[0.38, 0.6, 0]} scale={[0.1, 0.38, 0.18]} rotation-z={-0.25} />
      <Part geo={rbox(0.36, 0.08, 0.2, 0.04)} m={M.seat} p={[-0.25, 0.68, 0]} />
      <Part geo={cyl(0.02, 0.02, 0.5, 6)} m={M.chrome} p={[0.48, 0.98, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={SPH} m={M.chrome} p={[0.53, 0.88, 0]} scale={[0.04, 0.06, 0.06]} castShadow={false} />
      <Part geo={rbox(0.24, 0.03, 0.28, 0.01)} m={M.chrome} p={[-0.45, 0.62, 0]} castShadow={false} />
    </group>
  )
}

/** L'étal voisin, fermé pour la nuit : sa table pliante, quatre tabourets de plastique, un parasol jaune replié en partie. */
function Stall({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={cyl(0.45, 0.45, 0.04, 20)} m={M.table} p={[0, 0.72, 0]} />
      <Part geo={cyl(0.04, 0.04, 0.72, 8)} m={M.chrome} p={[0, 0.36, 0]} castShadow={false} />
      {[0, 1, 2, 3].map((i) => { const a = i * 1.57 + 0.4; return (
        <group key={i} position={[Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75]}>
          <Part geo={cyl(0.17, 0.2, 0.06, 14)} m={i % 2 ? M.stoolBlue : M.stool} p={[0, 0.45, 0]} />
          <Part geo={cyl(0.16, 0.2, 0.42, 14)} m={i % 2 ? M.stoolBlue : M.stool} p={[0, 0.21, 0]} />
        </group>
      ) })}
      <Part geo={cyl(0.03, 0.03, 2.3, 8)} m={M.chrome} p={[0, 1.15, 0]} castShadow={false} />
      <Part geo={cyl(0.05, 1.0, 0.4, 16)} m={M.umbrella} p={[0, 2.2, 0]} />
    </group>
  )
}

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    signMats.forEach((m) => (m.emissiveIntensity = 0.3 + k * 1.7))
    M.lantern.emissiveIntensity = 0.15 + k * 1.3
    M.glow.opacity = k * 0.7
    M.puddle.opacity = (0.1 + k * 0.25) * Math.max(0.4, mood.rain)
    for (const m of O.facade) m.emissiveIntensity = 0.04 + n * 1.05
  })
  return null
}

export function Surroundings() {
  const { wires, lanterns } = useMemo(() => {
    const wires = STRINGS.map(([a, b]) => tube(Array.from({ length: 11 }, (_, i) => sagAt(a, b, i / 10)), 0.012))
    const lanterns: Item[] = []
    STRINGS.forEach(([a, b]) => { for (let i = 1; i < 12; i++) { const p = sagAt(a, b, i / 12); lanterns.push({ p: [p[0], p[1] - 0.2, p[2]], s: [0.13, 0.17, 0.13] }) } })
    return { wires, lanterns }
  }, [])
  const glowPts = useMemo(() => lanterns.map((l) => l.p), [lanterns])
  const caps = useMemo(() => lanterns.flatMap((l): Item[] => [{ p: [l.p[0], l.p[1] + 0.17, l.p[2]], s: [0.06, 0.03, 0.06] }, { p: [l.p[0], l.p[1] - 0.17, l.p[2]], s: [0.06, 0.03, 0.06] }]), [lanterns])
  return (
    <>
      <SkyFadeClock room={market} />
      <Evening />
      <mesh position={[0, ROAD, 0]} rotation-x={-Math.PI / 2} material={M.road} receiveShadow raycast={noRay}><planeGeometry args={[34, 34]} /></mesh>
      {/* des flaques où se reflètent les néons */}
      <Batch geo={DISC} m={M.puddle} items={PUDDLES} />
      <Static>
        {/* le trottoir le long des immeubles, les rails du tram dans la chaussée */}
        <Part geo={rbox(1.6, 0.12, 5.8, 0.04)} m={M.walk} p={[-3.05, WALK - 0.06, 6.65]} castShadow={false} />
        <Part geo={rbox(12, 0.12, 1.6, 0.04)} m={M.walk} p={[3.4, WALK - 0.06, -4.3]} castShadow={false} />
        {[5.4, 6.5].map((z) => <Part key={z} geo={rbox(34, 0.03, 0.08, 0.01)} m={M.rail} p={[0, ROAD + 0.01, z]} castShadow={false} />)}
        {/* les immeubles de brique voisins */}
        <Block x0={-10} x1={-3.85} z0={-3.6} z1={3.4} top={6.2} b={0} shift={0.3} />
        <Block x0={3.62} x1={10.4} z0={-11} z1={-5.1} top={5.4} b={0} shift={0.65} />
        <Block x0={-10} x1={-3.85} z0={3.8} z1={9.5} top={4.6} b={0} shift={0.5} />
        {SIGNS.map(([w, , p, ry], i) => (
          <group key={w} position={p} rotation-y={ry}>
            <mesh material={signMats[i]} raycast={noRay}><planeGeometry args={[0.5, (0.5 * (64 * w.length + 32)) / 96]} /></mesh>
            <Part geo={rbox(0.54, (0.5 * (64 * w.length + 32)) / 96 + 0.04, 0.05, 0.02)} m={M.cap} p={[0, 0, -0.035]} castShadow={false} />
          </group>
        ))}
        {/* les guirlandes le long des façades */}
        {wires.map((g, i) => <Part key={i} geo={g} m={M.wire} castShadow={false} />)}
        <Scooter p={[4.6, WALK, -3.7]} ry={0.2} />
        <Stall p={[-5.6, WALK, 6.2]} />
      </Static>
      <Batch geo={SPH} m={M.lantern} items={lanterns} />
      <Batch geo={SPH} m={M.cap} items={caps} />
      <GlowPoints points={glowPts} color={0xff7a50} size={0.7} level={() => M.glow.opacity} />
      <OutdoorPrecip ground={ROAD} area={[-13, 13, -12, 12]} />
    </>
  )
}
