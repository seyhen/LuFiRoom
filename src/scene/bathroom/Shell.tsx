import { ExtrudeGeometry, Path, Shape } from 'three'
import { Part, cyl, noRay, rbox, rrPath, worldUV } from '../parts'
import { holedWall } from '../walls'
import { B } from './materials'

/** La fenêtre : une arche, 1,8 m de large (de x = 0,25 à 2,05), de 1,85 à 3,55 m de haut ; le bas est la tablette. */
export const WIN = { x0: 0.25, x1: 2.05, y0: 1.85, y1: 3.55 }
const CX = (WIN.x0 + WIN.x1) / 2, R = (WIN.x1 - WIN.x0) / 2, SPRING = WIN.y1 - R

/** Un trou en arche (le bas à coins arrondis, le haut en demi-cercle), pour un mur ou pour un cadre. */
export function archPath<P extends Path>(p: P, grow = 0) {
  const x0 = WIN.x0 - grow, x1 = WIN.x1 + grow, y0 = WIN.y0 - grow
  p.moveTo(x0, y0)
  p.lineTo(x1, y0)
  p.lineTo(x1, SPRING)
  p.absarc(CX, SPRING, R + grow, 0, Math.PI, false)
  p.lineTo(x0, y0)
  return p
}

/** Le mur du fond, percé de la fenêtre en arche (même forme que `holedWall`, un autre trou). */
const backWall = (() => {
  const shape = rrPath(new Shape(), -3.34, -0.05, 6.54, 4.35, 0.12)
  shape.holes.push(archPath(new Path()))
  return new ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 14 })
})()
const leftWall = holedWall([], 4.35)

const IN = -3.0
const KNEE = 1.5 // le haut des carreaux

/**
 * La coque de la salle de bain : le socle de pierre claire et son carrelage, le mur du fond (papier peint de feuillages, fenêtre en
 * arche) et le mur de gauche, une corniche, le soubassement de carreaux métro menthe avec sa lisse rose et sa plinthe. Le cadre de la
 * fenêtre, la vitre embuée et la tablette sont dans `Window.tsx`.
 */
export function Shell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={B.base} p={[-0.07, -0.47, -0.07]} />
      <Part geo={rbox(6.92, 0.06, 6.92, 0.025)} m={B.baseTrim} p={[-0.07, -0.2, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={B.baseTrim} p={[-0.07, -0.12, -0.07]} />
      <mesh material={B.floor} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <planeGeometry args={[6.42, 6.42]} />
      </mesh>
      {/* les deux murs */}
      <mesh geometry={backWall} material={B.wall} position={[0, 0, -3.26]} castShadow receiveShadow raycast={noRay} />
      <mesh geometry={leftWall} material={B.wall} position={[-3.26, 0, 0]} rotation-y={Math.PI / 2} castShadow receiveShadow raycast={noRay} />
      {/* la corniche : plus large que le mur, au-dessus de son biseau */}
      <Part geo={rbox(6.6, 0.14, 0.42, 0.04)} m={B.trim} p={[-0.02, 4.34, IN - 0.13]} castShadow={false} />
      <Part geo={rbox(0.42, 0.14, 6.6, 0.04)} m={B.trim} p={[IN - 0.13, 4.34, 0.2]} castShadow={false} />
      {/* les carreaux métro : une planche épaisse de 5 cm sur chaque mur, la lisse rose au-dessus, la plinthe en bas */}
      <Part geo={worldUV(rbox(6.16, KNEE, 0.05, 0.015), 0.6)} m={B.subway} p={[0.1, KNEE / 2, IN + 0.025]} />
      <Part geo={worldUV(rbox(0.05, KNEE, 6.15, 0.015), 0.6)} m={B.subway} p={[IN + 0.025, KNEE / 2, 0.125]} />
      <Part geo={rbox(6.2, 0.09, 0.09, 0.03)} m={B.rail} p={[0.1, KNEE + 0.045, IN + 0.045]} castShadow={false} />
      <Part geo={rbox(0.09, 0.09, 6.11, 0.03)} m={B.rail} p={[IN + 0.045, KNEE + 0.045, 0.145]} castShadow={false} />
      <Part geo={rbox(6.2, 0.15, 0.075, 0.025)} m={B.trim} p={[0.1, 0.075, IN + 0.0375]} castShadow={false} />
      <Part geo={rbox(0.075, 0.15, 6.125, 0.025)} m={B.trim} p={[IN + 0.0375, 0.075, 0.1375]} castShadow={false} />
      {/* l'angle des deux murs : une baguette de carrelage arrondie */}
      <Part geo={cyl(0.03, 0.03, KNEE, 10)} m={B.trim} p={[IN + 0.03, KNEE / 2, IN + 0.03]} castShadow={false} />
    </>
  )
}
