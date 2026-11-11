import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, PlaneGeometry } from 'three'
import { TAU, smooth } from '../../../math'
import { mood } from '../../anim'
import { Part, cyl, noRay, rbox } from '../../parts'
import { far } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { Antenna, Chimney } from '../../atelier/out/Haussmann'

// L'habillage du haut et des façades des immeubles du dehors. Les immeubles eux-mêmes sont le `Block` de l'atelier (on n'y touche pas) :
// ici on pose, sur ou devant ce qu'il dessine, des cheminées et une antenne sur les toits, un séchoir à linge sur le toit du voisin,
// des rideaux aux fenêtres allumées, et l'enseigne en saillie du fleuriste. Tout va dans le `<Static>` de Surroundings.

const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const SIDEWALK = -0.2
const TILE_W = 6.9

/** Deux pans de rideau noués à mi-hauteur, sur une tringle ; le milieu reste transparent (on voit la vitre allumée). Blanc : la teinte vient du matériau. */
const curtainTex = canvasTex(128, 256, (x) => {
  x.clearRect(0, 0, 128, 256)
  for (const side of [0, 1]) {
    x.save()
    if (side) { x.translate(128, 0); x.scale(-1, 1) }
    const g = x.createLinearGradient(0, 0, 50, 0)
    g.addColorStop(0, '#d6d6d6'); g.addColorStop(1, '#ffffff')
    x.fillStyle = g
    x.beginPath(); x.moveTo(2, 16); x.lineTo(54, 16)
    x.bezierCurveTo(54, 80, 22, 100, 22, 140)
    x.bezierCurveTo(22, 160, 50, 200, 56, 248)
    x.lineTo(2, 248); x.closePath(); x.fill()
    x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 2.5
    for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(10 + k * 11, 18); x.bezierCurveTo(14 + k * 9, 100, 18 + k * 7, 190, 8 + k * 14, 246); x.stroke() }
    // le embrasse de tissu qui noue le rideau
    x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(14, 128, 14, 7)
    x.restore()
  }
  x.fillStyle = '#9a9a9a'; x.fillRect(0, 8, 128, 6); x.beginPath(); x.arc(3, 11, 5, 0, TAU); x.arc(125, 11, 5, 0, TAU); x.fill()
})

/** L'enseigne du fleuriste, une planche verte ronde : une grosse fleur rose, deux feuilles. */
const signTex = canvasTex(128, 128, (x) => {
  x.clearRect(0, 0, 128, 128)
  x.fillStyle = '#2a5a48'; x.beginPath(); x.arc(64, 64, 60, 0, TAU); x.fill()
  x.strokeStyle = '#e8d49a'; x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 54, 0, TAU); x.stroke()
  x.fillStyle = '#5a9a5a'
  for (const k of [-1, 1]) { x.save(); x.translate(64 + k * 24, 88); x.rotate(k * 0.9); x.beginPath(); x.ellipse(0, 0, 20, 8, 0, 0, TAU); x.fill(); x.restore() }
  x.fillStyle = '#ee7a96'
  for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; x.beginPath(); x.arc(64 + Math.cos(a) * 17, 52 + Math.sin(a) * 17, 13, 0, TAU); x.fill() }
  x.fillStyle = '#ffd25a'; x.beginPath(); x.arc(64, 52, 10, 0, TAU); x.fill()
})

const curtainTints = [0xf2e2c0, 0xe8b0b8, 0xc6d4ea]
const M = {
  curtain: curtainTints.map((c) => skyFade(far(c, { map: curtainTex, alphaTest: 0.5, side: DoubleSide, roughness: 0.9, emissive: new Color(c), emissiveMap: curtainTex, emissiveIntensity: 0.04 }), F)),
  sign: skyFade(far(0xffffff, { map: signTex, emissiveMap: signTex, emissive: 0xffffff, emissiveIntensity: 0.05, alphaTest: 0.5, side: DoubleSide, roughness: 0.4, clearcoat: 0.5 }), F),
  ironDark: skyFade(far(0x2a3236, { roughness: 0.35, clearcoat: 0.6 }), F),
  rack: skyFade(far(0xb4bcc6, { roughness: 0.35, metalness: 0.3 }), F),
  clothA: skyFade(far(0xeee9dc, { roughness: 0.85, side: DoubleSide }), F),
  clothB: skyFade(far(0xe8a0b4, { roughness: 0.85, side: DoubleSide }), F),
}
const PANE = new PlaneGeometry(0.57, 1.75)
const DISC = new PlaneGeometry(0.56, 0.56)

/** Le soir, les rideaux et l'enseigne reçoivent la lumière du dedans. */
export function DressingLife() {
  useFrame(() => {
    const n = smooth(mood.night)
    M.curtain.forEach((m) => { m.emissiveIntensity = 0.04 + n * 0.55 })
    M.sign.emissiveIntensity = 0.05 + n * 0.3
  })
  return null
}

interface Face { x0: number; x1: number; z0: number; z1: number; wall: number; s: number; shift: number }
const SEEDS = [4, 9, 15]

/** Les fenêtres allumées du premier étage visible de cette façade : on rejoue le tirage de `facade()` (atelier/out/materials.ts), deux `r()` par fenêtre. */
function litWindows(s: number) {
  const r = seeded(SEEDS[s]), out: { i: number; warm: boolean }[] = []
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
    const on = r() < 0.5, warm = r() < 0.75
    if (on && j === 0) out.push({ i, warm })
  }
  return out
}

/** Les rideaux d'un immeuble : un plan par fenêtre allumée, à 0,014 devant la façade, calé sur la vitre peinte. `skip` écarte ce qui est caché. */
function Curtains({ b, skipFront, skipSide }: { b: Face; skipFront?: (x: number) => boolean; skipSide?: (z: number) => boolean }) {
  const y = b.wall - 0.413 - 0.875
  const wins = litWindows(b.s)
  const items: JSX.Element[] = []
  for (const { i, warm } of wins) {
    const tint = warm ? (i % 2 ? 1 : 0) : 2
    for (let n = -2; n < 5; n++) {
      const x = b.x0 + (i / 4 + 0.125 + n - b.shift) * TILE_W
      if (x > b.x0 + 0.45 && x < b.x1 - 0.45 && !skipFront?.(x)) items.push(<mesh key={`f${i}_${n}`} geometry={PANE} material={M.curtain[tint]} position={[x, y, b.z1 + 0.014]} raycast={noRay} />)
      const z = b.z1 - (i / 4 + 0.125 + n - (b.shift + 0.37)) * TILE_W
      if (z > b.z0 + 0.45 && z < b.z1 - 0.45 && !skipSide?.(z)) items.push(<mesh key={`s${i}_${n}`} geometry={PANE} material={M.curtain[tint]} position={[b.x1 + 0.014, y, z]} rotation-y={Math.PI / 2} raycast={noRay} />)
    }
  }
  return <>{items}</>
}

/** Le séchoir à linge sur le toit : deux cadres en A, trois barres, une serviette, une chemise, un drap plié. */
function DryingRack({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  return (
    <group position={p} rotation-y={ry}>
      {[-0.7, 0.7].map((x) => [-1, 1].map((k) => (
        <Part key={`${x}${k}`} geo={cyl(0.02, 0.02, 1.2, 6)} m={M.rack} p={[x, 0.58, k * 0.17]} rotation-x={-k * 0.28} castShadow={false} />
      )))}
      {[0.6, 0.85, 1.08].map((y) => <Part key={y} geo={cyl(0.016, 0.016, 1.5, 6)} m={M.rack} p={[0, y, 0]} rotation-z={Math.PI / 2} castShadow={false} />)}
      <Part geo={rbox(0.5, 0.42, 0.02, 0.006)} m={M.clothA} p={[-0.4, 0.85 - 0.22, 0.01]} castShadow={false} />
      <Part geo={rbox(0.42, 0.46, 0.02, 0.006)} m={M.clothB} p={[0.15, 1.08 - 0.24, 0.01]} castShadow={false} />
      <Part geo={rbox(0.2, 0.46, 0.02, 0.006)} m={M.clothB} p={[0.52, 1.08 - 0.24, -0.02]} castShadow={false} />
      <Part geo={rbox(0.6, 0.3, 0.02, 0.006)} m={M.clothA} p={[0.1, 0.6 - 0.16, 0.01]} castShadow={false} />
    </group>
  )
}

/** L'enseigne en saillie du fleuriste : une potence de fer le long de la façade, deux chaînes, la planche ronde (de profil pour la caméra). */
function BladeSign({ x, z, y }: { x: number; z: number; y: number }) {
  return (
    <group position={[x, y, z]}>
      <Part geo={cyl(0.02, 0.02, 0.8, 8)} m={M.ironDark} p={[0, 0, 0.4]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(0.05, 0.16, 0.05, 0.015)} m={M.ironDark} p={[0, -0.06, 0.03]} castShadow={false} />
      {[0.2, 0.68].map((dz) => <Part key={dz} geo={cyl(0.012, 0.012, 0.18, 6)} m={M.ironDark} p={[0, -0.09, dz]} castShadow={false} />)}
      <mesh geometry={DISC} material={M.sign} position={[0, -0.46, 0.44]} rotation-y={Math.PI / 2} raycast={noRay} />
    </group>
  )
}

/** À poser dans le `<Static>` de Surroundings, après les `Block`. */
export function Dressing() {
  const roof = (top: number) => top + 0.03
  return (
    <>
      {/* le toit du voisin de gauche : deux souches de cheminée, une antenne, le séchoir à linge */}
      <Chimney p={[-8.3, roof(4.9), -1.3]} pots={3} />
      <Chimney p={[-5.1, roof(4.9), 1.5]} pots={2} ry={Math.PI / 2} />
      <Antenna p={[-6.6, roof(4.9), -0.2]} />
      <DryingRack p={[-7.3, roof(4.9), 2.15]} />
      {/* l'immeuble derrière lui, et ceux du fond */}
      <Chimney p={[-8.0, roof(4.3), -7.0]} pots={4} />
      <Antenna p={[-5.7, roof(4.3), -8.6]} />
      <Chimney p={[-3.6, roof(4.5), -12.8]} pots={3} />
      <Chimney p={[6.2, roof(4.6), -11.2]} pots={4} />
      <Antenna p={[8.9, roof(4.6), -13.2]} />
      {/* les rideaux des fenêtres allumées */}
      <Curtains b={{ x0: -9.6, x1: -3.8, z0: -3.6, z1: 3.4, wall: 3.2, s: 1, shift: 0.25 }} skipFront={(x) => Math.abs(x + 6.7) < 2.55 || x > -4.7} />
      <Curtains b={{ x0: 2.8, x1: 10.5, z0: -15.5, z1: -8.2, wall: 3.0, s: 2, shift: 0.2 }} />
      <Curtains b={{ x0: -9.6, x1: -3.9, z0: -10.6, z1: -3.9, wall: 2.9, s: 0, shift: 0.8 }} />
      <Curtains b={{ x0: -8.4, x1: 2.2, z0: -17, z1: -10.4, wall: 2.8, s: 1, shift: 0.6 }} />
      <BladeSign x={-4.1} y={SIDEWALK + 3.1} z={3.43} />
    </>
  )
}
