import { ExtrudeGeometry, Path, Shape } from 'three'
import { Part, SPH_MID, cyl, rbox, rrPath, worldUV, noRay } from '../parts'
import { D } from './materials'

/** Un trou en arche (le bas droit, le haut en demi-cercle) dans un mur : de `x0` à `x1`, du bas `y0` à la clef `yTop`. */
function archPath<P extends Path>(p: P, x0: number, x1: number, y0: number, yTop: number) {
  const R = (x1 - x0) / 2, spring = yTop - R
  p.moveTo(x0, y0)
  p.lineTo(x1, y0)
  p.lineTo(x1, spring)
  p.absarc((x0 + x1) / 2, spring, R, 0, Math.PI, false)
  p.lineTo(x0, y0)
  return p
}

/** Un mur de pisé de 6,54 de long (de -3,34 à 3,2), de hauteur `h`, percé d'arches ; mêmes bords que ceux des autres pièces. */
function mudWall(h: number, arches: [number, number, number, number][]) {
  const shape = rrPath(new Shape(), -3.34, -0.05, 6.54, h, 0.12)
  for (const [x0, x1, y0, yTop] of arches) shape.holes.push(archPath(new Path(), x0, x1, y0, yTop))
  return new ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 14 })
}

/** Le mur du fond (3,1 m), percé d'une arche sur les dunes, et le mur de gauche (2,5 m), percé d'une fenêtre : leur forme, créée une fois. */
export const BACK_H = 3.1
export const LEFT_H = 2.5
/** L'arche du fond (x), la fenêtre de gauche (z du monde : le mur est tourné, x local = -z). */
export const ARCH = { x0: 0.25, x1: 1.95, y0: 0.03, top: 2.45 }
export const WINDOW = { z0: -2.15, z1: -0.85, y0: 0.95, top: 2.0 }
const backWall = mudWall(BACK_H, [[ARCH.x0, ARCH.x1, ARCH.y0, ARCH.top]])
const leftWall = mudWall(LEFT_H, [[-WINDOW.z1, -WINDOW.z0, WINDOW.y0, WINDOW.top]])

const IN = -3.0 // la face intérieure des deux murs

/** Une poutre de palmier qui dépasse du mur : un fût court, son bout clair. `axis` : le sens dans lequel elle sort (le fond : z ; la gauche : x). */
function Beam({ at, y, axis }: { at: number; y: number; axis: 'z' | 'x' }) {
  const out = 0.16, L = 0.34
  return axis === 'z' ? (
    <group position={[at, y, IN + out]}>
      <Part geo={cyl(0.058, 0.062, L, 10)} m={D.beam} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.052, 0.052, 0.012, 10)} m={D.beamEnd} p={[0, 0, L / 2 + 0.002]} rotation-x={Math.PI / 2} castShadow={false} />
    </group>
  ) : (
    <group position={[IN + out, y, at]}>
      <Part geo={cyl(0.058, 0.062, L, 10)} m={D.beam} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.052, 0.052, 0.012, 10)} m={D.beamEnd} p={[L / 2 + 0.002, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
    </group>
  )
}

/** Le moucharabieh de la fenêtre de gauche : un cadre de bois sombre et un treillis de lattes, dans l'épaisseur du mur. */
function Lattice() {
  const cz = (WINDOW.z0 + WINDOW.z1) / 2, R = (WINDOW.z1 - WINDOW.z0) / 2, spring = WINDOW.top - R, X = IN - 0.1
  const bars = Array.from({ length: 9 }, (_, i) => cz - R + 0.1 + (i * (2 * R - 0.2)) / 8)
  const rows = [1.12, 1.3, 1.48, 1.66, 1.84]
  return (
    <>
      {/* le cadre : deux montants, l'appui, le linteau en arc (une suite de petits blocs) */}
      {[WINDOW.z0 + 0.02, WINDOW.z1 - 0.02].map((z) => <Part key={z} geo={rbox(0.12, spring - WINDOW.y0 + 0.02, 0.07, 0.02)} m={D.woodDark} p={[X, (spring + WINDOW.y0) / 2, z]} castShadow={false} />)}
      <Part geo={rbox(0.14, 0.07, 1.34, 0.025)} m={D.woodDark} p={[X, WINDOW.y0 + 0.01, cz]} castShadow={false} />
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 10) * Math.PI
        return <Part key={i} geo={rbox(0.12, 0.09, 0.08, 0.02)} m={D.woodDark} p={[X, spring + Math.sin(a) * (R - 0.01), cz + Math.cos(a) * (R - 0.01)]} rotation-x={Math.PI / 2 - a} castShadow={false} />
      })}
      {/* le treillis : des lattes verticales qui montent jusqu'à l'arc, des traverses */}
      {bars.map((z) => {
        const top = Math.min(spring + Math.sqrt(Math.max(0.01, (R - 0.05) ** 2 - (z - cz) ** 2)), WINDOW.top - 0.06)
        return <Part key={z} geo={rbox(0.03, top - WINDOW.y0 - 0.05, 0.03, 0.01)} m={D.wood} p={[X + 0.02, (top + WINDOW.y0 + 0.05) / 2, z]} castShadow={false} />
      })}
      {rows.map((y) => <Part key={y} geo={rbox(0.03, 0.03, 2 * R - 0.12, 0.01)} m={D.wood} p={[X - 0.005, y, cz]} castShadow={false} />)}
    </>
  )
}

/**
 * La coque de l'oasis : le socle de grès strié et son sable, deux murs de pisé (le fond avec son arche sur les dunes, la gauche avec
 * son moucharabieh), leurs chaperons de terre, les poutres de palmier qui dépassent, le soubassement de grès, une étagère de poteries,
 * le sable qui coule par l'arche. L'auvent, la lanterne et les objets sont à part.
 */
export function Shell() {
  return (
    <>
      {/* le socle : des strates de grès, le sable par-dessus (le bord roulé comme une dune) */}
      <Part geo={worldUV(rbox(6.86, 0.55, 6.86, 0.2), 1.6)} m={D.strata} p={[-0.07, -0.47, -0.07]} />
      <Part geo={worldUV(rbox(6.54, 0.3, 6.54, 0.12), 3.2)} m={D.sand} p={[-0.07, -0.15, -0.07]} />
      {/* le sable qui entre par l'arche */}
      <Part geo={SPH_MID} m={D.sand} scale={[0.95, 0.075, 0.4]} p={[1.1, 0.0, -2.78]} rotation-y={0.1} castShadow={false} />
      {/* les deux murs */}
      <mesh geometry={backWall} material={D.adobe} position={[0, 0, -3.26]} castShadow receiveShadow raycast={noRay} />
      <mesh geometry={leftWall} material={D.adobe} position={[-3.26, 0, 0]} rotation-y={Math.PI / 2} castShadow receiveShadow raycast={noRay} />
      {/* les chaperons de terre : plus larges que le mur, au-dessus de son biseau */}
      <Part geo={rbox(6.62, 0.16, 0.42, 0.06)} m={D.mudCap} p={[-0.02, BACK_H - 0.02, IN - 0.13]} castShadow={false} />
      <Part geo={rbox(0.42, 0.16, 6.62, 0.06)} m={D.mudCap} p={[IN - 0.13, LEFT_H - 0.02, 0.2]} castShadow={false} />
      {/* le soubassement de grès, coupé par l'arche */}
      <Part geo={worldUV(rbox(3.27, 0.34, 0.1, 0.04), 1.6)} m={D.strata} p={[-1.385, 0.17, IN + 0.05]} />
      <Part geo={worldUV(rbox(1.17, 0.34, 0.1, 0.04), 1.6)} m={D.strata} p={[2.575, 0.17, IN + 0.05]} />
      <Part geo={worldUV(rbox(0.1, 0.34, 6.1, 0.04), 1.6)} m={D.strata} p={[IN + 0.05, 0.17, 0.05]} />
      {/* les poutres de palmier qui sortent du mur, sous le chaperon */}
      {[-2.7, -1.8, -0.9, 0.0, 2.35, 2.95].map((x) => <Beam key={x} at={x} y={BACK_H - 0.4} axis="z" />)}
      {/* pas de poutre sous l'auvent : sa toile (accrochée à 2,2) passerait au travers */}
      {[0.15, 1.05, 1.95, 2.85].map((z) => <Beam key={z} at={z} y={LEFT_H - 0.35} axis="x" />)}
      <Lattice />
      {/* l'étagère de poteries au mur de gauche : une planche sur deux consoles, deux bols, une cruche de cuivre */}
      <group position={[IN + 0.14, 1.35, 1.0]}>
        <Part geo={rbox(0.3, 0.05, 1.0, 0.015)} m={D.woodDark} castShadow={false} />
        {[-0.38, 0.38].map((z) => <Part key={z} geo={rbox(0.2, 0.2, 0.05, 0.015)} m={D.woodDark} p={[-0.05, -0.12, z]} rotation-z={0.4} castShadow={false} />)}
        <Part geo={cyl(0.075, 0.05, 0.07, 14)} m={D.clay} p={[0.0, 0.06, -0.3]} castShadow={false} />
        <Part geo={cyl(0.06, 0.04, 0.06, 14)} m={D.clayPlain} p={[0.02, 0.055, -0.14]} castShadow={false} />
        <Part geo={cyl(0.05, 0.075, 0.12, 14)} m={D.copper} p={[0.0, 0.085, 0.14]} castShadow={false} />
        <Part geo={cyl(0.03, 0.05, 0.05, 14)} m={D.copper} p={[0.0, 0.17, 0.14]} castShadow={false} />
        <Part geo={cyl(0.02, 0.02, 0.1, 8)} m={D.clayDark} p={[0.0, 0.08, 0.36]} castShadow={false} />
      </group>
    </>
  )
}
