import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../../../math'
import { reduceMotion, useParticles } from '../../anim'
import { Part, cyl, type V3 } from '../../parts'
import { box, gableTri } from './geo'
import { wispTexes } from '../../textures'
import { GROUND } from './terrain'
import { O } from './materials'

// Le cottage : la salle de bain est l'extension de plain-pied d'une maison de campagne. L'aile `W` longe le mur de gauche de la pièce
// (son pignon regarde la caméra, avec sa porte menthe et son auvent), le corps de logis `B` court derrière, avec ses lucarnes, sa
// cheminée qui fume et sa glycine. Pierre crème et miel, volets menthe, ardoise mauve, petits carreaux. Plus bas que la pièce : les
// avant-toits sont à 2,9 m et les faîtages à 4,5 m (le mur de la pièce monte à 4,3 m).

export const E = 2.7
/** Le faîtage de l'aile et du corps de logis. */
const R_W = 4.1, R_B = 4.15
const OV = 0.35
const YB = GROUND - 0.15

interface GabledProps {
  /** Centre en x, z du bâtiment, largeur (perpendiculaire au faîtage) et longueur (le long du faîtage). */
  x: number
  z: number
  w: number
  l: number
  /** Bas des murs, haut des murs, faîtage. */
  y0?: number
  e?: number
  r: number
  /** Le faîtage court le long de z (le pignon regarde +z) ou de x (le pignon regarde +x). */
  along: 'x' | 'z'
  /** Le toit déborde ou s'arrête plus loin (l'aile entre dans le corps de logis). */
  roofBack?: number
  /** Pas de pignon de pierre côté fond, pas de rives de ce côté. */
  noBack?: boolean
  ov?: number
}

/** Un corps de bâtiment à deux pans : murs, pignon de pierre, deux pans d'ardoise, faîtière, rives blanches. */
function Gabled({ x, z, w, l, y0 = YB, e = E, r, along, roofBack = 0, noBack = false, ov = OV }: GabledProps) {
  const th = Math.atan((r - e) / (w / 2)), S = (w / 2 + ov) / Math.cos(th)
  const rl = l + 2 * ov + roofBack, rc = (roofBack ? -roofBack / 2 : 0) // le toit, plus long côté fond ; son centre
  const T = 0.14
  const slope = (sgn: 1 | -1) => {
    const c = Math.cos(th), sn = Math.sin(th)
    // le pan descend vers sgn · x ; son dessus passe par le faîtage
    return { p: [sgn * ((S / 2) * c - (T / 2) * sn), r - (S / 2) * sn - (T / 2) * c, rc] as V3, rz: -sgn * th }
  }
  const pans = [slope(1), slope(-1)]
  return (
    <group position={[x, 0, z]} rotation-y={along === 'z' ? 0 : Math.PI / 2}>
      <Part geo={box(w, e - y0, l, 2.2)} m={O.wall} p={[0, (y0 + e) / 2, 0]} castShadow={false} />
      <Part geo={gableTri(w, r - e + 0.05)} m={O.wall} p={[0, e - 0.05, l / 2 - 0.25 + 0.006]} castShadow={false} />
      {!noBack && <Part geo={gableTri(w, r - e + 0.05)} m={O.wall} p={[0, e - 0.05, -l / 2 - 0.006]} castShadow={false} />}
      {pans.map((p, i) => (
        <Part key={i} geo={box(S, T, rl, 1.3, 'z')} m={O.roof} p={p.p} rotation-z={p.rz} castShadow={false} />
      ))}
      {/* la faîtière */}
      <Part geo={cyl(0.1, 0.1, rl - 0.1, 10)} m={O.roof} p={[0, r + 0.02, rc]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* les rives : une planche blanche le long de chaque pan, du côté du pignon (et du côté du fond quand il se voit) */}
      {([1, -1] as const).flatMap((end) => (noBack && end === -1 ? [] : [1, -1].map((sgn) => (
        <Part key={`${end}${sgn}`} geo={box(S + 0.06, 0.2, 0.05)} m={O.trim} p={[sgn * ((S / 2) * Math.cos(th)), r - (S / 2) * Math.sin(th) - 0.06, end === 1 ? l / 2 + ov + 0.025 : -(l / 2 + ov + roofBack + 0.025)]} rotation-z={-sgn * th} castShadow={false} />
      ))))}
    </group>
  )
}

/** Une fenêtre à petits carreaux (cadre blanc, meneaux, vitre, appui de pierre), volets menthe en option. Posée contre un mur dont la face est en z = 0 (regarde +z) ; `ry` la tourne. */
function Win({ p, ry = 0, w = 0.95, h = 1.35, cols = 2, rows = 3, shutters = false, sill = true }: { p: V3; ry?: number; w?: number; h?: number; cols?: number; rows?: number; shutters?: boolean; sill?: boolean }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={box(w, h, 0.03)} m={O.glass} p={[0, 0, 0.03]} castShadow={false} />
      {[-1, 1].map((s) => <Part key={s} geo={box(0.07, h + 0.14, 0.08)} m={O.trim} p={[s * (w / 2 + 0.035), 0, 0.05]} castShadow={false} />)}
      {[-1, 1].map((s) => <Part key={s} geo={box(w + 0.14, 0.07, 0.08)} m={O.trim} p={[0, s * (h / 2 + 0.035), 0.05]} castShadow={false} />)}
      {Array.from({ length: cols - 1 }, (_, i) => <Part key={`c${i}`} geo={box(0.035, h, 0.05)} m={O.trim} p={[-w / 2 + (w * (i + 1)) / cols, 0, 0.062]} castShadow={false} />)}
      {Array.from({ length: rows - 1 }, (_, i) => <Part key={`r${i}`} geo={box(w, 0.035, 0.05)} m={O.trim} p={[0, -h / 2 + (h * (i + 1)) / rows, 0.062]} castShadow={false} />)}
      {sill && <Part geo={box(w + 0.34, 0.07, 0.22)} m={O.stone} p={[0, -h / 2 - 0.1, 0.11]} castShadow={false} />}
      {shutters && [-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.07 + w * 0.25), 0, 0.03]}>
          <Part geo={box(w * 0.5, h + 0.14, 0.04)} m={O.mint} castShadow={false} />
          {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={box(w * 0.42, 0.03, 0.03)} m={O.mint} p={[0, -h / 2 + 0.08 + (i * (h - 0.08)) / 5.4, 0.03]} rotation-x={-0.35} castShadow={false} />)}
        </group>
      ))}
    </group>
  )
}

/** Une porte de bois menthe : cadre blanc, deux panneaux, un carreau en haut, un seuil de pierre. */
function Door({ p, w = 1.0, h = 2.1, hood = false }: { p: V3; w?: number; h?: number; hood?: boolean }) {
  return (
    <group position={p}>
      <Part geo={box(w + 0.2, h + 0.1, 0.08)} m={O.trim} p={[0, h / 2, 0.04]} castShadow={false} />
      <Part geo={box(w, h, 0.06)} m={O.mint} p={[0, h / 2, 0.075]} castShadow={false} />
      <Part geo={box(w * 0.7, h * 0.28, 0.02)} m={O.glass} p={[0, h * 0.74, 0.115]} castShadow={false} />
      <Part geo={box(w * 0.74, 0.04, 0.03)} m={O.trim} p={[0, h * 0.74, 0.125]} castShadow={false} />
      <Part geo={box(0.04, h * 0.28, 0.03)} m={O.trim} p={[0, h * 0.74, 0.125]} castShadow={false} />
      <Part geo={box(w * 0.7, h * 0.3, 0.02)} m={O.trim} p={[0, h * 0.27, 0.115]} castShadow={false} />
      <Part geo={box(0.05, 0.05, 0.05)} m={O.iron} p={[w * 0.36, h * 0.48, 0.14]} castShadow={false} />
      <Part geo={box(w + 0.5, 0.16, 0.55)} m={O.stone} p={[0, -0.08, 0.3]} castShadow={false} />
      {hood && (
        <>
          {[-1, 1].map((s) => <Part key={s} geo={box(0.07, 0.07, 0.9)} m={O.trim} p={[s * (w / 2 + 0.2), h + 0.2, 0.5]} rotation-x={0.3} castShadow={false} />)}
          <Part geo={box(w + 0.7, 0.07, 1.1)} m={O.roof} p={[0, h + 0.3, 0.55]} rotation-x={0.26} castShadow={false} />
          <Part geo={box(w + 0.74, 0.12, 0.05)} m={O.trim} p={[0, h + 0.18, 1.08]} rotation-x={0.26} castShadow={false} />
        </>
      )}
    </group>
  )
}

/** La cheminée : un fût de pierre, un chapeau, deux pots de terre cuite. Elle fume (voir `Smoke`). */
export const CHIMNEY: V3 = [3.75, 0, -9.85]
function Chimney() {
  const [cx, , cz] = CHIMNEY
  return (
    <group position={[cx, 0, cz]}>
      <Part geo={box(0.8, 2.9, 0.8, 1.6)} m={O.wall} p={[0, 3.75, 0]} castShadow={false} />
      <Part geo={box(1.0, 0.12, 1.0)} m={O.stone} p={[0, 5.26, 0]} castShadow={false} />
      <Part geo={box(0.9, 0.1, 0.9)} m={O.trim} p={[0, 5.16, 0]} castShadow={false} />
      {[-0.2, 0.2].map((dx) => <Part key={dx} geo={cyl(0.12, 0.15, 0.4, 10)} m={O.clay} p={[dx, 5.52, 0]} castShadow={false} />)}
    </group>
  )
}

/** Un filet de fumée douce qui monte de la cheminée, sous la pluie comme au soleil. */
export function Smoke() {
  const puffs = useParticles(), since = useRef(rand(0, 1))
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > 1.3) {
      since.current = 0
      puffs.emit(wispTexes, CHIMNEY[0] + rand(-0.05, 0.05) - 0.2, 5.75, CHIMNEY[2], { size: 0.34, life: 5, vy: 0.3, sway: 0.1, grow: 1.7, peak: 0.55, soft: true, color: 0xd9d3dc })
    }
  })
  return <group ref={puffs.group} />
}

/** Une lucarne : une petite maison à pignon posée sur le pan de devant du toit, avec sa fenêtre. */
function Dormer({ x }: { x: number }) {
  return (
    <group>
      <Gabled x={x} z={-8.95} w={1.25} l={1.3} y0={2.7} e={3.65} r={4.05} along="z" roofBack={0} noBack ov={0.2} />
      <Win p={[x, 3.3, -8.3 + 0.006]} w={0.62} h={0.55} cols={2} rows={2} sill={false} />
    </group>
  )
}

/** Les positions des fenêtres, pour la lumière du soir (un halo par fenêtre). */
export const WINDOW_GLOWS: V3[] = [
  [-8.4, 1.25, 2.6], [-4.95, 1.25, 2.6], [-6.675, 3.65, 2.6], [-3.75, 1.25, -6.9], [-3.75, 1.25, -4.7],
  [-2.7, 1.25, -7.8], [1.55, 1.25, -7.8], [3.55, 1.25, -7.8], [-1.4, 3.3, -8.1], [2.4, 3.3, -8.1], [4.7, 1.25, -9.85], [4.7, 3.3, -9.85],
]

export function Cottage() {
  return (
    <>
      {/* l'aile contre la pièce : son pignon regarde la caméra */}
      <Gabled x={-6.675} z={-2.825} w={5.45} l={10.45} r={R_W} along="z" roofBack={1.4} noBack />
      <Win p={[-8.4, 1.25, 2.4]} shutters />
      <Win p={[-4.95, 1.25, 2.4]} shutters />
      <Win p={[-6.675, 3.4, 2.4]} w={0.7} h={0.7} cols={2} rows={2} sill={false} />
      <Door p={[-6.675, GROUND + 0.16, 2.4]} hood />
      {/* sa face côté jardin du fond, contre le mur de la pièce */}
      <Win p={[-3.95, 1.25, -6.9]} ry={Math.PI / 2} shutters />
      <Win p={[-3.95, 1.25, -4.7]} ry={Math.PI / 2} shutters />
      {/* le corps de logis, au fond */}
      <Gabled x={-2.45} z={-9.85} w={3.7} l={13.9} r={R_B} along="x" />
      <Win p={[-2.7, 1.25, -8.0]} shutters />
      <Door p={[-0.3, GROUND + 0.16, -8.0]} />
      <Win p={[1.55, 1.25, -8.0]} shutters />
      <Win p={[3.55, 1.25, -8.0]} w={0.85} shutters />
      <Dormer x={-1.4} />
      <Dormer x={2.4} />
      <Win p={[4.5, 1.25, -9.85]} ry={Math.PI / 2} shutters />
      <Win p={[4.5, 3.3, -9.85]} ry={Math.PI / 2} w={0.55} h={0.65} cols={2} rows={2} sill={false} />
      <Chimney />
      {/* une gouttière le long du corps de logis et sa descente */}
      <Part geo={cyl(0.05, 0.05, 13.5, 8)} m={O.zinc} p={[-2.7, 2.4, -7.64]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.04, 0.04, 2.05, 8)} m={O.zinc} p={[4.3, 1.375, -7.7]} castShadow={false} />
    </>
  )
}
