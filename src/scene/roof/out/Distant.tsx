import { gummy } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { Part, SPH, cyl, rbox, worldUV } from '../../parts'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { WoodTank } from './NycGear'

// Le skyline de Manhattan derrière le toit : à la même échelle que les petites tours de la pièce, mais **new-yorkais** : de la
// brique et de la pierre (pas du verre bleu), des fenêtres hautes et étroites entre des piliers, des retraits en gradins, des
// couronnes Art déco, des châteaux d'eau de bois sur les toits, et deux repères qu'on reconnaît (une flèche à gradins comme
// l'Empire State, une couronne d'acier comme le Chrysler). Peu de tours, des vides entre elles : pas une grille de mégalopole.

/** brique, pierre blonde, calcaire, brique sombre, béton gris. */
const TONES = ['#a65f4a', '#cdb48c', '#ddd2bc', '#76483c', '#908c92'] as const

/** Une façade de tour : fenêtres hautes entre des piliers (tuile 3,3 m, 6 travées), allumées au hasard. `glow` : seulement les allumées. */
const tex = (wall: string, glow: boolean, seed: number) =>
  canvasTex(128, 128, (x) => {
    const r = seeded(seed)
    x.fillStyle = glow ? '#000' : wall; x.fillRect(0, 0, 128, 128)
    if (!glow) { x.fillStyle = 'rgba(255,255,255,.1)'; for (let i = 0; i < 6; i++) x.fillRect(i * 21.3 + 1, 0, 2, 128) }
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
      const lit = r() < 0.4
      if (glow) { if (lit) { x.fillStyle = r() < 0.6 ? '#ffd890' : '#ffeab8'; x.fillRect(i * 21.3 + 6, j * 21.3 + 4, 9, 14) } continue }
      x.fillStyle = 'rgba(38,34,46,.82)'; x.fillRect(i * 21.3 + 6, j * 21.3 + 4, 9, 14)
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(i * 21.3 + 4, j * 21.3 + 19, 13, 2)
    }
  }, [1, 1])

const FADE = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5, below: -4.2 }
export const T = {
  tone: TONES.map((c, i) => skyFade(snowTop(gummy(0xffffff, { map: tex(c, false, i + 40), emissiveMap: tex(c, true, i + 40), emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.8 }), 1, 0.4, 0.8), FADE)),
  trim: skyFade(gummy(0xe6dccb, { roughness: 0.6 }), FADE),
  steel: skyFade(gummy(0xcfd4dc, { roughness: 0.25, clearcoat: 0.9, metalness: 0.4 }), FADE),
}
const BOTTOM = -12

/** Un gradin : une masse de `w` × `d` de `y0` à `y1`, sa corniche. */
function Tier({ w, d, y0, y1, tone }: { w: number; d: number; y0: number; y1: number; tone: number }) {
  return (
    <>
      <Part geo={worldUV(rbox(w, y1 - y0, d, 0.03), 3.3)} m={T.tone[tone]} p={[0, (y0 + y1) / 2, 0]} castShadow={false} />
      <Part geo={rbox(w + 0.07, 0.07, d + 0.07, 0.025)} m={T.trim} p={[0, y1, 0]} castShadow={false} />
    </>
  )
}

type Crown = 'flat' | 'tank' | 'deco' | 'setback'
/** [x, z, largeur, profondeur, faîte, teinte, couronne]. Des tours plutôt carrées, brique et pierre, bien espacées. */
const TOWERS: [number, number, number, number, number, number, Crown][] = [
  [-8.6, -8.6, 1.5, 1.2, 4.4, 0, 'tank'], [-6.7, -9.4, 1.2, 1.1, 5.8, 1, 'setback'], [-5.1, -8.4, 1.4, 1.2, 4.0, 3, 'tank'],
  [-0.4, -7.6, 1.5, 1.1, 3.6, 2, 'flat'], [1.6, -8.2, 1.2, 1.1, 4.8, 0, 'deco'],
  [-9.0, -11.6, 1.4, 1.2, 6.4, 4, 'setback'], [-4.2, -11.4, 1.3, 1.1, 5.4, 0, 'tank'], [0.1, -11.6, 1.4, 1.2, 6.2, 2, 'deco'],
  [6.2, -9.8, 1.5, 1.2, 4.6, 1, 'tank'], [8.2, -10.0, 1.2, 1.1, 5.8, 3, 'setback'], [7.0, -12.6, 1.4, 1.2, 7.0, 0, 'deco'],
]

/** Une couronne ou un toit de tour : citerne de bois, gradin à flèche, couronne Art déco. */
function Top({ w, d, top, crown, tone }: { w: number; d: number; top: number; crown: Crown; tone: number }) {
  if (crown === 'tank') return <group position={[w * 0.1, top + 0.04, 0]}><WoodTank p={[0, 0, 0]} s={0.42} /></group>
  if (crown === 'setback') {
    return (
      <>
        <Tier w={w * 0.68} d={d * 0.68} y0={top} y1={top + 0.7} tone={tone} />
        <WoodTank p={[0, top + 0.74, 0]} s={0.36} />
      </>
    )
  }
  if (crown === 'deco') {
    return (
      <>
        <Tier w={w * 0.7} d={d * 0.7} y0={top} y1={top + 0.6} tone={tone} />
        <Tier w={w * 0.42} d={d * 0.42} y0={top + 0.6} y1={top + 1.05} tone={tone} />
        <Part geo={cyl(0.015, 0.04, 0.6, 8)} m={T.steel} p={[0, top + 1.35, 0]} castShadow={false} />
      </>
    )
  }
  return null
}

/** Le repère à flèche à gradins (Empire State) : cinq retraits, un mât, la lumière d'en haut. */
function SpireTower({ x, z }: { x: number; z: number }) {
  const tiers: [number, number, number, number][] = [[1.6, 1.2, -12, 5.2], [1.2, 0.9, 5.2, 6.1], [0.88, 0.68, 6.1, 6.8], [0.6, 0.5, 6.8, 7.4], [0.36, 0.34, 7.4, 7.8]]
  return (
    <group position={[x, 0, z]}>
      {tiers.map(([w, d, y0, y1], i) => <Tier key={i} w={w} d={d} y0={y0} y1={y1} tone={1} />)}
      <Part geo={cyl(0.07, 0.12, 0.5, 10)} m={T.trim} p={[0, 8.05, 0]} castShadow={false} />
      <Part geo={cyl(0.015, 0.04, 1.4, 6)} m={T.steel} p={[0, 9.0, 0]} castShadow={false} />
      <Part geo={SPH} m={T.steel} scale={0.04} p={[0, 9.75, 0]} castShadow={false} />
    </group>
  )
}

/** Le repère à couronne d'acier (Chrysler) : base de brique blanche, retraits, arcs de la couronne qui rétrécissent, flèche. */
function CrownTower({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Tier w={1.5} d={1.3} y0={-12} y1={4.8} tone={2} />
      <Tier w={1.1} d={1.0} y0={4.8} y1={5.7} tone={2} />
      {[0, 1, 2, 3].map((i) => (
        <Part key={i} geo={cyl(0.5 - i * 0.1, 0.56 - i * 0.1, 0.3, 20)} m={T.steel} p={[0, 5.95 + i * 0.3, 0]} castShadow={false} />
      ))}
      <Part geo={cyl(0.012, 0.05, 1.5, 8)} m={T.steel} p={[0, 7.7, 0]} castShadow={false} />
    </group>
  )
}

export function DistantTowers() {
  return (
    <>
      <SpireTower x={-2.6} z={-10.4} />
      <CrownTower x={3.9} z={-10.9} />
      {TOWERS.map(([x, z, w, d, top, t, crown], i) => (
        <group key={i} position={[x, 0, z]}>
          <Tier w={w} d={d} y0={BOTTOM} y1={top} tone={t} />
          <Top w={w} d={d} top={top} crown={crown} tone={t} />
        </group>
      ))}
    </>
  )
}
