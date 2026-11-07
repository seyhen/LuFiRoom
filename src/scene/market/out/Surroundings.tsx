import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, CircleGeometry, MeshBasicMaterial, PlaneGeometry, SpriteMaterial, TorusGeometry, TubeGeometry, Vector3 } from 'three'
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
import { F as ZF, Z, Zakkyo } from './Zakkyo'
import { O } from '../../roof/out/materials'

// Le dehors du marché de nuit : la rue continue. Une chaussée mouillée et ses rails de tram devant, les petits immeubles japonais de béton (zakkyo) voisins
// à gauche et derrière, leurs enseignes verticales en kanji (ラーメン, カラオケ, 餃子, 居酒屋…) qui s'allument le soir, des
// guirlandes de lanternes rouges tendues au-dessus de la rue, un scooter garé, l'étal voisin avec sa table et ses tabourets.

const ROAD = -0.42, WALK = -0.3
const DISC = new CircleGeometry(1, 24)
/** Les flaques où se reflètent les néons (un seul tracé). */
const PUDDLES: Item[] = [[1.5, 5.2, 1.2, 0.5], [-2.0, 7.0, 0.9, 0.4], [5.6, 2.4, 0.5, 1.0]].map(([x, z, a, b]) => ({ p: [x, ROAD + 0.01, z], s: [a, b, 1], r: [-Math.PI / 2, 0, 0] }))
const F = ZF
const tube = (pts: V3[], r: number) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 40, r, 6, false)

/** Les enseignes verticales en drapeau (tategaki), plantées perpendiculairement aux façades : [mot, couleur, position, rotation]. */
const SIGNS: [string, string, V3, number][] = [
  ['ラーメン', '#ff5ab0', [-3.55, 3.5, 1.6], 0], ['カラオケ', '#5ae0ff', [-3.55, 4.4, -1.4], 0], ['おでん', '#ffd25a', [-3.55, 3.3, -2.9], 0],
  ['餃子', '#ffd25a', [-3.55, 2.6, 2.9], 0], ['居酒屋', '#ff7a4a', [6.3, 3.6, -4.85], Math.PI / 2], ['焼肉', '#ff4a5a', [8.6, 3.0, -4.85], Math.PI / 2], ['スナック', '#c58aff', [4.6, 4.3, -4.85], Math.PI / 2],
]
/** L'atlas des enseignes : une colonne de 96 px par enseigne, lettres empilées (un seul matériau, un seul tracé pour les quatre). */
const ATLAS_W = 96 * SIGNS.length, ATLAS_H = 64 * Math.max(...SIGNS.map(([w]) => w.length)) + 32
const signH = (w: string) => 64 * w.length + 32
/** `glow` : les lettres seules, sur noir (elles s'allument). */
function signAtlas(glow: boolean) {
  return canvasTex(ATLAS_W, ATLAS_H, (x) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, ATLAS_W, ATLAS_H)
    SIGNS.forEach(([word, color], k) => {
      const X = k * 96, H = signH(word)
      x.fillStyle = glow ? '#000' : '#2a1838'; x.fillRect(X, 0, 96, H)
      x.strokeStyle = glow ? color : 'rgba(255,255,255,.25)'; x.lineWidth = 4; x.strokeRect(X + 6, 6, 84, H - 12)
      x.fillStyle = glow ? color : '#c8b8d8'; x.font = 'bold 50px "Yu Gothic","Hiragino Sans","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
      for (let i = 0; i < word.length; i++) {
        // la barre de « ー » se couche à la verticale en écriture verticale
        x.save(); x.translate(X + 48, 44 + i * 64); if (word[i] === 'ー') x.rotate(Math.PI / 2); x.fillText(word[i], 0, 0); x.restore()
      }
    })
  })
}
/** Le plan d'une enseigne, ses UV calés sur sa colonne de l'atlas. */
function signGeo(k: number) {
  const word = SIGNS[k][0], h = signH(word), g = new PlaneGeometry(0.5, (0.5 * h) / 96), uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (k + uv.getX(i)) / SIGNS.length, 1 - (1 - uv.getY(i)) * (h / ATLAS_H))
  return g
}
const signMat = skyFade(gummy(0xffffff, { map: signAtlas(false), emissiveMap: signAtlas(true), emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.4 }), F)
const SIGN_GEOS = SIGNS.map((_, k) => signGeo(k))

// Peu de matériaux, partagés : chaque matériau du dehors coûte un tracé (le pneu, la selle, les fils, les caissons des enseignes
// et les culots des lanternes sont du même noir ; les rails, le chrome et le pied de l'étal du même acier).
const M = {
  // la chaussée mouillée : un vernis, mais assez mat pour que la lanterne de la carriole n'y fasse pas une traînée de lumière
  road: skyFade(snowTop(gummy(0x3a3446, { roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.55 }), 1, 0.4, 0.8), F),
  walk: skyFade(snowTop(gummy(0x8a8290, { roughness: 0.7 }), 1, 0.4, 0.8), F),
  steel: skyFade(gummy(0xc8ccd6, { roughness: 0.22, clearcoat: 0.9, metalness: 0.2 }), F),
  dark: skyFade(gummy(0x28222c, { roughness: 0.5 }), F),
  lantern: skyFade(gummy(0xe0402e, { roughness: 0.6, emissive: 0xff5a2a, emissiveIntensity: 0.15 }), F),
  scooter: skyFade(gummy(0x8ad8c0, { roughness: 0.3, clearcoat: 0.8 }), F),
  stool: skyFade(gummy(0xe04a5a, { roughness: 0.4, clearcoat: 0.6 }), F),
  umbrella: skyFade(snowTop(gummy(0xf4c040, { roughness: 0.6, side: 2 }), 1, 0.4, 0.8), F),
  glow: new SpriteMaterial({ map: glowTex, color: 0xff7a50, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  puddle: new MeshBasicMaterial({ color: 0xff7ac8, transparent: true, opacity: 0.18, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }),
}

/** Les guirlandes de lanternes, tendues le long des façades voisines (jamais devant la pièce) : [départ, arrivée]. */
const STRINGS: [V3, V3][] = [[[-3.55, 3.0, 3.9], [-3.55, 2.8, 9.4]], [[3.9, 3.0, -4.82], [10.2, 2.8, -4.82]]]
const sagAt = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 0.45 * Math.sin(Math.PI * t), a[2] + (b[2] - a[2]) * t]

/** Le scooter garé, sur sa béquille : carénage menthe, tablier, plancher, selle, coffre arrière, guidon chromé et rétroviseurs,
 *  phare, garde-boue, deux petites roues. Le dehors ne projette pas d'ombre (deux tracés de moins par matériau). */
const WHEEL = new TorusGeometry(0.16, 0.07, 10, 20)
function Scooter({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      {[-0.42, 0.42].map((x) => <Part key={x} geo={WHEEL} m={M.dark} p={[x, 0.22, 0]} castShadow={false} />)}
      {[-0.42, 0.42].map((x) => <Part key={`j${x}`} geo={cyl(0.07, 0.07, 0.15, 12)} m={M.steel} p={[x, 0.22, 0]} rotation-x={Math.PI / 2} castShadow={false} />)}
      {/* la coque arrière, le tablier, le plancher entre les deux */}
      <Part geo={SPH} m={M.scooter} p={[-0.22, 0.47, 0]} scale={[0.38, 0.2, 0.2]} castShadow={false} />
      <Part geo={SPH} m={M.scooter} p={[0.36, 0.58, 0]} scale={[0.1, 0.36, 0.18]} rotation-z={-0.25} castShadow={false} />
      <Part geo={rbox(0.5, 0.06, 0.26, 0.03)} m={M.dark} p={[0.06, 0.3, 0]} castShadow={false} />
      {/* le garde-boue avant sur la roue */}
      <Part geo={new TorusGeometry(0.2, 0.05, 8, 16, Math.PI * 0.8)} m={M.scooter} p={[0.42, 0.24, 0]} rotation-z={Math.PI * 0.1} castShadow={false} />
      {/* la selle, le coffre arrière */}
      <Part geo={rbox(0.4, 0.08, 0.2, 0.04)} m={M.dark} p={[-0.24, 0.69, 0]} castShadow={false} />
      <Part geo={rbox(0.24, 0.18, 0.26, 0.06)} m={M.scooter} p={[-0.56, 0.78, 0]} castShadow={false} />
      <Part geo={rbox(0.2, 0.02, 0.22, 0.01)} m={M.steel} p={[-0.56, 0.68, 0]} castShadow={false} />
      {/* la colonne de direction, le guidon et ses poignées, les deux rétroviseurs, le phare */}
      <Part geo={cyl(0.025, 0.025, 0.3, 8)} m={M.steel} p={[0.46, 0.84, 0]} rotation-z={-0.25} castShadow={false} />
      <Part geo={cyl(0.02, 0.02, 0.5, 6)} m={M.steel} p={[0.5, 0.98, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      {[-1, 1].map((s) => <Part key={s} geo={cyl(0.03, 0.03, 0.1, 8)} m={M.dark} p={[0.5, 0.98, s * 0.26]} rotation-x={Math.PI / 2} castShadow={false} />)}
      {[-1, 1].map((s) => (
        <group key={`m${s}`} position={[0.48, 1.0, s * 0.17]}>
          <Part geo={cyl(0.008, 0.008, 0.14, 5)} m={M.steel} p={[0, 0.07, 0]} castShadow={false} />
          <Part geo={SPH} m={M.steel} p={[0, 0.15, 0]} scale={[0.02, 0.04, 0.04]} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={M.steel} p={[0.55, 0.9, 0]} scale={[0.04, 0.06, 0.06]} castShadow={false} />
      {/* la béquille */}
      <Part geo={cyl(0.012, 0.012, 0.22, 5)} m={M.steel} p={[-0.05, 0.13, 0.1]} rotation-x={0.4} castShadow={false} />
    </group>
  )
}

/** L'étal voisin, fermé pour la nuit : sa table pliante, quatre tabourets de plastique, un parasol jaune replié en partie. */
function Stall({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={cyl(0.45, 0.45, 0.04, 20)} m={O.coping} p={[0, 0.72, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.04, 0.72, 8)} m={M.steel} p={[0, 0.36, 0]} castShadow={false} />
      {[0, 1, 2, 3].map((i) => { const a = i * 1.57 + 0.4; return (
        <group key={i} position={[Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75]}>
          <Part geo={cyl(0.17, 0.2, 0.06, 14)} m={i % 2 ? M.scooter : M.stool} p={[0, 0.45, 0]} castShadow={false} />
          <Part geo={cyl(0.16, 0.2, 0.42, 14)} m={i % 2 ? M.scooter : M.stool} p={[0, 0.21, 0]} castShadow={false} />
        </group>
      ) })}
      <Part geo={cyl(0.03, 0.03, 2.3, 8)} m={M.steel} p={[0, 1.15, 0]} castShadow={false} />
      <Part geo={cyl(0.05, 1.0, 0.4, 16)} m={M.umbrella} p={[0, 2.2, 0]} castShadow={false} />
    </group>
  )
}

function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    signMat.emissiveIntensity = 0.3 + k * 1.7
    M.lantern.emissiveIntensity = 0.15 + k * 1.3
    M.glow.opacity = k * 0.7
    M.puddle.opacity = (0.1 + k * 0.25) * Math.max(0.4, mood.rain)
    for (const m of Z.facade) m.emissiveIntensity = 0.04 + n * 0.9
    for (const m of Z.shop) m.emissiveIntensity = 0.3 + k * 0.9
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
        {[5.4, 6.5].map((z) => <Part key={z} geo={rbox(34, 0.03, 0.08, 0.01)} m={M.steel} p={[0, ROAD + 0.01, z]} castShadow={false} />)}
        {/* les petits immeubles de béton voisins : à gauche, au fond à droite, et derrière la ruelle (le fond n'est plus vide) */}
        <Zakkyo x0={-10} x1={-3.85} z0={-3.6} z1={3.4} top={6.2} v={0} shop={0} shift={0.3} />
        <Zakkyo x0={3.62} x1={10.4} z0={-11} z1={-5.1} top={5.4} v={1} shop={1} shift={0.65} />
        <Zakkyo x0={-10} x1={-3.85} z0={3.8} z1={9.5} top={4.6} v={1} shop={0} shift={0.5} />
        <Zakkyo x0={-3.8} x1={3.5} z0={-12.2} z1={-5.1} top={6.2} v={0} shop={1} shift={0.1} />
        <Zakkyo x0={-10.4} x1={-4.0} z0={-12} z1={-4.0} top={6.8} v={1} shop={1} shift={0.8} />
        <Zakkyo x0={4.0} x1={11} z0={-17} z1={-11.4} top={7.2} v={0} shop={0} shift={0.45} />
        {SIGNS.map(([w, , p, ry], i) => (
          <group key={w} position={p} rotation-y={ry}>
            <mesh geometry={SIGN_GEOS[i]} material={signMat} raycast={noRay} />
            <Part geo={rbox(0.54, (0.5 * signH(w)) / 96 + 0.04, 0.05, 0.02)} m={M.dark} p={[0, 0, -0.035]} castShadow={false} />
            {/* le bras de fer qui la tient au mur */}
            <Part geo={rbox(0.5, 0.04, 0.04, 0.012)} m={M.dark} p={[-0.0, (0.25 * signH(w)) / 96 + 0.04, -0.03]} castShadow={false} />
          </group>
        ))}
        {/* les guirlandes le long des façades */}
        {wires.map((g, i) => <Part key={i} geo={g} m={M.dark} castShadow={false} />)}
        <Scooter p={[4.6, WALK, -3.7]} ry={0.2} />
        <Stall p={[-5.6, WALK, 6.2]} />
      </Static>
      <Batch geo={SPH} m={M.lantern} items={lanterns} />
      <Batch geo={SPH} m={M.dark} items={caps} />
      <GlowPoints points={glowPts} color={0xff7a50} size={0.7} level={() => M.glow.opacity} />
      <OutdoorPrecip ground={ROAD} area={[-13, 13, -12, 12]} />
    </>
  )
}
