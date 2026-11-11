import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshBasicMaterial, PlaneGeometry, SpriteMaterial } from 'three'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { Part, SPH, cyl, noRay, rbox, worldUV } from '../../parts'
import { far, gummy } from '../../materials'
import { farFoliage } from '../../nature/materials'
import { Foliage } from '../../nature/Foliage'
import { canvasTex, seeded } from '../../paint'
import { barkTex, cobbleTex, drainTex, manholeTex, roadTex, slabTex, treeGrateTex } from './streetTex'
import { SkyFadeClock, skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { glowTex } from '../../textures'
import { puddleTex } from '../textures'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { laundromat } from '../../../rooms/laundromat'
import { Block } from '../../atelier/out/Haussmann'
import { P } from '../../atelier/out/materials'

// Le dehors de la laverie : le coin de rue d'une ville française, la nuit. Le trottoir fait le tour (la vitrine donne sur la rue,
// derrière), une rue de côté à droite avec son passage piéton, le réverbère du coin et sa flaque de lumière, une borne à incendie,
// des sacs-poubelle, un banc, des poubelles dans la cour ; à gauche, l'immeuble voisin et sa boutique éclairée ; en face, de
// l'autre côté de la rue, l'immeuble de la boulangerie et de la pharmacie (celui qu'on voit dans la vitrine).

const SIDEWALK = -0.2, ROAD = -0.34
const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }

roadTex.repeat.set(5, 5)
roadTex.wrapS = roadTex.wrapT = 1000

// Peu de matériaux, partagés, et pas d'ombre portée : chaque matériau du dehors coûte un tracé (deux avec l'ombre). Les sacs sont
// du même noir que la fonte, l'auvent du même vert que les poubelles, la lanterne et la vitrine de la même lumière chaude.
/** La vitrine du fleuriste voisin : trois baies et une porte vitrée dans un cadre vert, des seaux de fleurs sur les gradins, des
 *  plantes vertes, le lettrage « FLEURS » sur le bandeau. Elle sert aussi de lueur (`emissiveMap`) : la boutique est allumée le soir. */
const shopTex = canvasTex(384, 208, (x) => {
  const r = seeded(7)
  x.fillStyle = '#2a4a3e'; x.fillRect(0, 0, 384, 208)
  // le bandeau et son lettrage
  x.fillStyle = '#1f3a30'; x.fillRect(0, 0, 384, 40)
  x.fillStyle = '#f0d9a0'; x.font = 'bold 30px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('F L E U R S', 192, 22)
  // trois baies, la porte à droite
  const panes: [number, number][] = [[12, 92], [112, 92], [212, 92], [316, 58]]
  for (const [X, W] of panes) {
    const g = x.createLinearGradient(0, 48, 0, 200)
    g.addColorStop(0, '#fff2d2'); g.addColorStop(1, '#f2c784')
    x.fillStyle = g; x.fillRect(X, 48, W, 152)
  }
  // les gradins et leurs seaux de fleurs, dans les trois baies
  for (let b = 0; b < 3; b++) {
    const X = 12 + b * 100
    for (let k = 0; k < 2; k++) {
      const y = 150 - k * 46
      x.fillStyle = 'rgba(90,60,40,.55)'; x.fillRect(X, y + 18, 92, 5)
      for (let i = 0; i < 4; i++) {
        const cx = X + 12 + i * 22, hue = ['#e86a7a', '#f4c040', '#c88ae8', '#ff9a5a', '#f6f0f0', '#e84a5a'][Math.floor(r() * 6)]
        x.fillStyle = '#5a8a5a'; x.fillRect(cx - 1, y - 2, 2, 14)
        x.fillStyle = hue; for (let f = 0; f < 4; f++) { x.beginPath(); x.arc(cx + (r() - 0.5) * 12, y - 4 + (r() - 0.5) * 8, 4 + r() * 2, 0, 6.3); x.fill() }
        x.fillStyle = '#8a9aa6'; x.fillRect(cx - 6, y + 8, 12, 10)
      }
    }
  }
  // une grande plante verte derrière la porte, la poignée
  x.fillStyle = '#4a7a4a'; for (let f = 0; f < 9; f++) { x.beginPath(); x.ellipse(345 + (r() - 0.5) * 26, 120 + (r() - 0.5) * 50, 9, 4, r() * 3, 0, 6.3); x.fill() }
  x.fillStyle = '#b06a4a'; x.fillRect(334, 165, 22, 30)
  x.fillStyle = '#d8b060'; x.fillRect(320, 120, 4, 16)
})
const M = {
  // le sol reste mat (presque pas de vernis) : sinon les lampes de la laverie y font une traînée de lumière devant la pièce
  slab: skyFade(snowTop(far(0xffffff, { map: slabTex, roughness: 0.85, clearcoat: 0.08, clearcoatRoughness: 0.7 }), 1, 0.4, 0.8), F),
  road: skyFade(snowTop(far(0xffffff, { map: roadTex, roughness: 0.7, clearcoat: 0.2, clearcoatRoughness: 0.65 }), 1, 0.4, 0.8), F),
  cobble: skyFade(snowTop(far(0xffffff, { map: cobbleTex, roughness: 0.55 }), 1, 0.4, 0.8), F),
  manhole: skyFade(far(0xffffff, { map: manholeTex, roughness: 0.4, metalness: 0.25 }), F),
  drain: skyFade(far(0xffffff, { map: drainTex, roughness: 0.4, metalness: 0.2 }), F),
  grate: skyFade(far(0xffffff, { map: treeGrateTex, roughness: 0.45, metalness: 0.2 }), F),
  bark: skyFade(snowTop(far(0xffffff, { map: barkTex, roughness: 0.8 }), 0.8, 0.4, 0.8), F),
  leaves: [0x7d9650, 0x8fa058, 0xa09a48].map((c) => skyFade(snowTop(farFoliage(c), 0.7, 0.45, 0.8), F)),
  scooter: skyFade(far(0x86c9bd, { roughness: 0.3 }), F),
  seat: skyFade(far(0x3a2e2a, { roughness: 0.6 }), F),
  chrome: skyFade(far(0xc8d2d8, { roughness: 0.2, metalness: 0.5 }), F),
  tyre: skyFade(far(0x1f2326, { roughness: 0.8 }), F),
  curb: skyFade(snowTop(far(0xa8acb0, { roughness: 0.7, clearcoat: 0.1 }), 1, 0.4, 0.8), F),
  stripe: skyFade(snowTop(far(0xf2f0e8, { roughness: 0.6 }), 1, 0.4, 0.8), F),
  iron: skyFade(snowTop(far(0x2a3236, { roughness: 0.35, clearcoat: 0.6 }), 0.6, 0.55, 0.9), F),
  red: skyFade(far(0xc8403a, { roughness: 0.4, clearcoat: 0.6 }), F),
  green: skyFade(snowTop(far(0x37725a, { roughness: 0.55, clearcoat: 0.3 }), 0.9, 0.45, 0.85), F),
  wood: skyFade(snowTop(far(0x8a5e3e, { roughness: 0.6 }), 0.9, 0.45, 0.85), F),
  shop: skyFade(far(0xffffff, { map: shopTex, emissiveMap: shopTex, emissive: 0xffffff, emissiveIntensity: 0.1, roughness: 0.25, clearcoat: 0.8 }), F),
  lit: skyFade(far(0xfbe4b8, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffc884, emissiveIntensity: 0.15 }), F),
  puddle: gummy(0x6a8296, { map: puddleTex, alphaMap: puddleTex, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  streak: new MeshBasicMaterial({ map: glowTex, color: 0xffc080, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }),
  pool: new MeshBasicMaterial({ map: glowTex, color: 0xffc888, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffd090, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}

/** Le réverbère du coin : un fût vert sombre à cannelures, une crosse, une lanterne à quatre vitres. */
function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, SIDEWALK, z]}>
      <Part geo={cyl(0.12, 0.16, 0.4, 12)} m={M.iron} p={[0, 0.2, 0]} castShadow={false} />
      <Part geo={cyl(0.06, 0.08, 3.4, 10)} m={M.iron} p={[0, 1.9, 0]} castShadow={false} />
      <Part geo={SPH} m={M.iron} p={[0, 3.62, 0]} scale={0.08} castShadow={false} />
      <group position={[0, 3.55, 0]}>
        <Part geo={cyl(0.03, 0.03, 0.5, 6)} m={M.iron} p={[0.22, 0.02, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.06, 0.2, 0.14, 4)} m={M.iron} p={[0.45, 0.02, 0]} rotation-y={Math.PI / 4} castShadow={false} />
        <Part geo={rbox(0.24, 0.3, 0.24, 0.04)} m={M.lit} p={[0.45, -0.2, 0]} castShadow={false} />
        <Part geo={cyl(0.12, 0.08, 0.06, 4)} m={M.iron} p={[0.45, -0.38, 0]} rotation-y={Math.PI / 4} castShadow={false} />
      </group>
    </group>
  )
}

/** Le passage piéton sur la rue de droite : des bandes blanches. */
function Crosswalk() {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <Part key={i} geo={rbox(4.0, 0.02, 0.38, 0.01)} m={M.stripe} p={[7.9, ROAD + 0.012, -5.2 + i * 0.7]} castShadow={false} />
      ))}
    </>
  )
}


/** Un plan au sol dont les UV suivent les mètres (`tile` mètres par texture) : la même texture garde sa taille sur tous les plans. */
const flats = new Map<string, PlaneGeometry>()
function flat(w: number, d: number, tile: number) {
  const k = `${w},${d},${tile}`
  let g = flats.get(k)
  if (!g) {
    g = new PlaneGeometry(w, d)
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / tile), uv.getY(i) * (d / tile))
    flats.set(k, g)
  }
  return g
}
const ground = (m: (typeof M)[keyof typeof M], w: number, d: number, tile: number, p: [number, number, number], ry = 0) => (
  <mesh geometry={flat(w, d, tile)} material={m as never} position={p} rotation={[-Math.PI / 2, 0, ry]} receiveShadow raycast={noRay} />
)

/** Le caniveau : une bande de pavés le long du trottoir, ses deux avaloirs, une plaque d'égout, une autre sur la chaussée de devant. */
function Gutter() {
  const y = ROAD + 0.01
  return (
    <>
      {ground(M.cobble, 0.75, 12.4, 0.8, [6.68, y, 0.5])}
      {ground(M.cobble, 16.4, 0.75, 0.8, [-2.1, y, 6.43])}
      {ground(M.drain, 0.5, 0.8, 1, [6.68, y + 0.012, 2.6])}
      {ground(M.drain, 0.8, 0.5, 1, [-6.6, y + 0.012, 6.43], Math.PI / 2)}
      <Part geo={cyl(0.4, 0.4, 0.03, 28)} m={M.manhole} p={[8.6, ROAD + 0.015, 3.1]} castShadow={false} />
      <Part geo={cyl(0.4, 0.4, 0.03, 28)} m={M.manhole} p={[1.6, ROAD + 0.015, 8.4]} castShadow={false} />
    </>
  )
}

/** Les marquages : la ligne de voie en tirets sur la rue de devant et sur celle de droite (elle s'arrête au passage piéton). */
function Markings() {
  const y = ROAD + 0.012
  return (
    <>
      {Array.from({ length: 11 }, (_, i) => <Part key={i} geo={rbox(0.13, 0.02, 1.0, 0.01)} m={M.stripe} p={[9.6, y, 0.6 + i * 1.9]} castShadow={false} />)}
      {Array.from({ length: 8 }, (_, i) => <Part key={i} geo={rbox(1.0, 0.02, 0.13, 0.01)} m={M.stripe} p={[-7.6 + i * 1.9, y, 9.4]} castShadow={false} />)}
      <Part geo={rbox(0.36, 0.02, 4.4, 0.01)} m={M.stripe} p={[10.4, y, -3.1]} castShadow={false} />
    </>
  )
}

/** Le platane d'alignement : écorce en plaques, trois branches, un houppier de masses de feuillage, sa grille de fonte au pied. */
function PlaneTree({ x, z }: { x: number; z: number }) {
  const masses: [number, [number, number, number], [number, number, number]][] = [
    [0, [0, 2.3, 0], [0.72, 0.62, 0.7]], [1, [0.42, 2.7, 0.1], [0.62, 0.6, 0.6]], [2, [-0.4, 2.65, -0.1], [0.62, 0.6, 0.6]],
    [3, [0.05, 3.15, 0.0], [0.58, 0.6, 0.58]], [4, [-0.05, 2.55, 0.42], [0.56, 0.55, 0.5]], [5, [0.1, 2.6, -0.42], [0.54, 0.55, 0.5]],
  ]
  return (
    <group position={[x, SIDEWALK, z]}>
      {ground(M.grate, 1.0, 1.0, 1, [0, 0.012, 0])}
      <Part geo={cyl(0.15, 0.22, 2.4, 12)} m={M.bark} p={[0, 1.2, 0]} castShadow={false} />
      {([[0.35, 0.2], [-0.3, -0.15], [0.05, -0.38]] as const).map(([bx, bz], i) => (
        <Part key={i} geo={cyl(0.04, 0.07, 0.8, 8)} m={M.bark} p={[bx * 0.55, 2.35, bz * 0.55]} rotation={[bz * 1.1, 0, -bx * 1.1]} castShadow={false} />
      ))}
      {masses.map(([v, p, s], i) => <Foliage key={i} v={v} p={[p[0], p[1] - s[1] * 0.4, p[2]]} s={s} m={M.leaves[i % 3]} ry={i * 1.3} shadow={false} />)}
    </group>
  )
}

/** Le scooter garé le long du trottoir : caisse crème-menthe, bouclier, selle, guidon à rétroviseurs, phare, deux roues. */
function Scooter({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, SIDEWALK, z]}>
      {[-0.52, 0.55].map((dx) => (
        <group key={dx} position={[dx, 0.17, 0]}>
          <Part geo={cyl(0.17, 0.17, 0.09, 16)} m={M.tyre} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.08, 0.08, 0.115, 12)} m={M.chrome} rotation-x={Math.PI / 2} castShadow={false} />
        </group>
      ))}
      <Part geo={rbox(0.95, 0.26, 0.34, 0.1)} m={M.scooter} p={[-0.28, 0.38, 0]} castShadow={false} />
      <Part geo={rbox(0.5, 0.05, 0.3, 0.02)} m={M.scooter} p={[0.2, 0.24, 0]} castShadow={false} />
      <Part geo={rbox(0.09, 0.62, 0.32, 0.04)} m={M.scooter} p={[0.5, 0.58, 0]} rotation-z={-0.18} castShadow={false} />
      <Part geo={rbox(0.55, 0.08, 0.28, 0.04)} m={M.seat} p={[-0.28, 0.58, 0]} castShadow={false} />
      <Part geo={rbox(0.3, 0.04, 0.22, 0.02)} m={M.scooter} p={[0.56, 0.4, 0]} castShadow={false} />
      <Part geo={cyl(0.025, 0.025, 0.42, 8)} m={M.chrome} p={[0.58, 0.28, 0]} castShadow={false} />
      <Part geo={cyl(0.022, 0.022, 0.66, 8)} m={M.chrome} p={[0.5, 1.0, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      {[-1, 1].map((k) => <Part key={k} geo={cyl(0.03, 0.03, 0.12, 8)} m={M.seat} p={[0.5, 1.0, k * 0.36]} rotation-x={Math.PI / 2} castShadow={false} />)}
      {[-1, 1].map((k) => <Part key={k} geo={cyl(0.012, 0.012, 0.2, 6)} m={M.chrome} p={[0.5, 1.12, k * 0.3]} castShadow={false} />)}
      <Part geo={SPH} m={M.lit} p={[0.62, 0.88, 0]} scale={[0.07, 0.09, 0.09]} castShadow={false} />
      <Part geo={rbox(0.08, 0.06, 0.16, 0.02)} m={M.red} p={[-0.78, 0.46, 0]} castShadow={false} />
    </group>
  )
}

/** Le soir, le réverbère, la boutique voisine et les fenêtres s'allument. */
function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    M.lit.emissiveIntensity = 0.15 + k * 1.4
    M.shop.emissiveIntensity = 0.1 + k * 0.85
    M.glow.opacity = k * 0.9
    M.pool.opacity = k * 0.5
    M.streak.opacity = k * 0.55
    for (const m of P.facade) m.emissiveIntensity = 0.04 + n * 0.55
    P.dormerGlass.emissiveIntensity = n * 1.3
  })
  return null
}

export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={laundromat} />
      <Evening />
      {/* la chaussée partout, le trottoir autour de la laverie et de ses voisins */}
      <mesh position={[0, ROAD, 0]} rotation-x={-Math.PI / 2} material={M.road} receiveShadow raycast={noRay}><planeGeometry args={[34, 34]} /></mesh>
      <Static>
        <Part geo={worldUV(rbox(16.2, 0.16, 11.5, 0.05), 1)} m={M.slab} p={[-1.9, SIDEWALK - 0.08, 0.25]} castShadow={false} />
        <Part geo={rbox(16.3, 0.18, 0.18, 0.05)} m={M.curb} p={[-1.9, SIDEWALK - 0.08, -5.5]} castShadow={false} />
        <Part geo={rbox(16.5, 0.18, 0.18, 0.05)} m={M.curb} p={[-1.9, SIDEWALK - 0.08, 6.0]} castShadow={false} />
        <Part geo={rbox(0.18, 0.18, 11.6, 0.05)} m={M.curb} p={[6.2, SIDEWALK - 0.08, 0.25]} castShadow={false} />
        <Crosswalk />
        <Markings />
        <Gutter />
        <PlaneTree x={5.4} z={-3.1} />
        <Scooter x={3.2} z={5.2} />
        {/* l'immeuble voisin à gauche, sa boutique éclairée au rez-de-chaussée ; l'immeuble d'en face, de l'autre côté de la rue */}
        <Block x0={-9.6} x1={-3.8} z0={-3.6} z1={3.4} wall={3.2} top={4.9} s={1} shift={0.25} dormers={[3, 3]} lowBalcony={false} />
        {/* en face : plus bas, plus loin et moins large que le voisin, pour ne pas fermer le coin en haut à droite */}
        <Block x0={2.8} x1={10.5} z0={-15.5} z1={-8.2} wall={3.0} top={4.6} s={2} shift={0.2} dormers={[3, 3]} lowBalcony={false} />
        <Block x0={-9.6} x1={-3.9} z0={-10.6} z1={-3.9} wall={2.9} top={4.3} s={0} shift={0.8} dormers={[3, 3]} lowBalcony={false} />
        <Block x0={-8.4} x1={2.2} z0={-17} z1={-10.4} wall={2.8} top={4.5} s={1} shift={0.6} dormers={[4, 2]} lowBalcony={false} />
        <group position={[-6.7, SIDEWALK, 3.42]}>
          <Part geo={rbox(4.2, 2.5, 0.06, 0.03)} m={M.iron} p={[0, 1.25, 0.02]} castShadow={false} />
          <mesh material={M.shop} position={[0, 1.2, 0.055]} raycast={noRay}><planeGeometry args={[3.7, 2.0]} /></mesh>
          <Part geo={rbox(4.4, 0.08, 0.9, 0.03)} m={M.green} p={[0, 2.55, 0.45]} rotation-x={0.25} castShadow={false} />
        </group>
        <StreetLamp x={5.5} z={-4.6} />
        {/* la borne à incendie, les sacs-poubelle, le banc, les poubelles de la cour */}
        <group position={[5.4, SIDEWALK, 1.6]}>
          <Part geo={cyl(0.13, 0.15, 0.55, 14)} m={M.red} p={[0, 0.27, 0]} castShadow={false} />
          <Part geo={SPH} m={M.red} p={[0, 0.56, 0]} scale={[0.14, 0.1, 0.14]} castShadow={false} />
          {[-1, 1].map((s) => <Part key={s} geo={cyl(0.05, 0.05, 0.12, 10)} m={M.red} p={[s * 0.16, 0.35, 0]} rotation-z={Math.PI / 2} castShadow={false} />)}
        </group>
        {/* les sacs-poubelle sortis pour la nuit : un ventre affaissé, un col froncé, le nœud et ses deux oreilles */}
        {([[5.3, 3.0, 0.32, M.iron, 0.3], [5.0, 3.42, 0.26, M.green, -0.6], [5.6, 3.6, 0.24, M.iron, 1.2]] as const).map(([x, z, s, m, ry], i) => (
          <group key={i} position={[x, SIDEWALK, z]} rotation-y={ry}>
            <Part geo={SPH} m={m} p={[0, s * 0.62, 0]} scale={[s * 1.05, s * 0.66, s]} castShadow={false} />
            <Part geo={SPH} m={m} p={[0.02 * s, s * 1.1, 0]} scale={[s * 0.62, s * 0.5, s * 0.6]} castShadow={false} />
            <Part geo={cyl(s * 0.1, s * 0.22, s * 0.3, 10)} m={m} p={[0, s * 1.62, 0]} castShadow={false} />
            <Part geo={SPH} m={m} p={[0, s * 1.8, 0]} scale={s * 0.12} castShadow={false} />
            {[-1, 1].map((k) => <Part key={k} geo={SPH} m={m} p={[k * s * 0.14, s * 1.9, 0]} scale={[s * 0.13, s * 0.05, s * 0.07]} rotation-z={k * 0.6} castShadow={false} />)}
          </group>
        ))}
        <group position={[5.3, SIDEWALK, -1.6]} rotation-y={-Math.PI / 2}>
          {[-0.18, 0, 0.18].map((dz) => <Part key={dz} geo={rbox(1.5, 0.05, 0.14, 0.02)} m={M.wood} p={[0, 0.45, dz]} castShadow={false} />)}
          {[-0.18, 0.18].map((dz) => <Part key={dz + 1} geo={rbox(1.5, 0.14, 0.04, 0.02)} m={M.wood} p={[0, 0.7, -0.28 + dz * 0.2]} castShadow={false} />)}
          {[-0.65, 0.65].map((dx) => <Part key={dx} geo={rbox(0.06, 0.45, 0.5, 0.02)} m={M.iron} p={[dx, 0.22, -0.05]} castShadow={false} />)}
        </group>
        {[[-1.4, 4.6], [-0.4, 4.7]].map(([x, z], i) => (
          <group key={i} position={[x, SIDEWALK, z]}>
            <Part geo={rbox(0.7, 0.85, 0.65, 0.06)} m={M.green} p={[0, 0.42, 0]} castShadow={false} />
            <Part geo={rbox(0.74, 0.06, 0.7, 0.03)} m={M.green} p={[0, 0.88, -0.02]} rotation-x={-0.08} castShadow={false} />
            {[-0.2, 0.2].map((dx) => <Part key={dx} geo={cyl(0.05, 0.05, 0.04, 10)} m={M.iron} p={[dx, 0.05, 0.33]} rotation-x={Math.PI / 2} castShadow={false} />)}
          </group>
        ))}
      </Static>
      <sprite position={[5.95, SIDEWALK + 3.35, -4.6]} scale={1.4} material={M.glow} raycast={noRay} renderOrder={4} />
      <mesh position={[5.95, SIDEWALK + 0.01, -4.6]} rotation-x={-Math.PI / 2} material={M.pool} renderOrder={3} raycast={noRay}><planeGeometry args={[3.6, 3.6]} /></mesh>
      {/* les flaques de la chaussée, et le reflet du réverbère dans la plus proche */}
      {([[8.6, ROAD + 0.014, 5.9, 2.4, 1.5, 0.4], [10.0, ROAD + 0.016, 1.8, 1.8, 1.2, -0.5], [-2.8, ROAD + 0.018, 7.9, 2.0, 1.2, 0.2], [8.0, ROAD + 0.02, -7.2, 2.6, 1.6, 0.1]] as const).map(([px, py, pz, w, d, ry], i) => (
        <mesh key={i} material={M.puddle} position={[px, py, pz]} rotation={[-Math.PI / 2, 0, ry]} raycast={noRay}><planeGeometry args={[w, d]} /></mesh>
      ))}
      <mesh material={M.streak} position={[7.2, ROAD + 0.04, -6.9]} rotation={[-Math.PI / 2, 0, 0.1]} renderOrder={3} raycast={noRay}><planeGeometry args={[1.2, 2.6]} /></mesh>
      <OutdoorPrecip ground={(x, z) => (x < 6.2 && z > -5.5 && z < 6 && x > -10 ? SIDEWALK : ROAD)} area={[-13, 13, -12, 12]} />
    </>
  )
}
