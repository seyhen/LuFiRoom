import { Part, SPH, cyl, rbox } from '../parts'
import { A } from './materials'

/** Un mannequin de couture en toile sur son pied de bois : le buste piqué d'épingles, un mètre ruban autour de la taille. `position` est le sol. */
export function DressForm({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={cyl(0.2, 0.22, 0.04, 20)} m={A.oakDark} p={[0, 0.02, 0]} />
      <Part geo={cyl(0.03, 0.04, 0.05, 12)} m={A.oakDark} p={[0, 0.065, 0]} castShadow={false} />
      <Part geo={cyl(0.016, 0.016, 0.82, 8)} m={A.oak} p={[0, 0.5, 0]} />
      <Part geo={cyl(0.04, 0.04, 0.025, 10)} m={A.brass} p={[0, 0.78, 0]} castShadow={false} />
      {/* le buste : hanches, taille, poitrine et épaules, d'une seule toile */}
      <Part geo={SPH} m={A.cream} scale={[0.19, 0.17, 0.12]} p={[0, 0.93, 0]} />
      <Part geo={cyl(0.135, 0.17, 0.24, 20)} m={A.cream} p={[0, 1.08, 0]} scale={[1, 1, 0.68]} />
      <Part geo={SPH} m={A.cream} scale={[0.185, 0.17, 0.13]} p={[0, 1.27, 0]} />
      <Part geo={SPH} m={A.cream} scale={[0.19, 0.06, 0.1]} p={[0, 1.4, 0]} />
      <Part geo={cyl(0.04, 0.05, 0.1, 10)} m={A.cream} p={[0, 1.45, 0]} />
      <Part geo={SPH} m={A.oak} scale={0.05} p={[0, 1.55, 0]} />
      <Part geo={cyl(0.006, 0.006, 0.07, 6)} m={A.brass} p={[0, 1.6, 0]} castShadow={false} />
      {/* le mètre ruban, jaune, noué à la taille, et son bout qui pend */}
      <Part geo={cyl(0.1555, 0.1555, 0.022, 20)} m={A.ochre} p={[0, 1.04, 0]} scale={[1, 1, 0.68]} castShadow={false} />
      <Part geo={rbox(0.022, 0.2, 0.004, 0.002)} m={A.ochre} p={[0.1, 0.93, 0.1]} castShadow={false} />
      {/* trois épingles à tête de couleur piquées dans la poitrine */}
      {[[-0.07, 1.3, A.terracotta], [0.0, 1.24, A.prussian], [0.08, 1.31, A.blush]].map(([x, y, m], i) => (
        <Part key={i} geo={SPH} m={m as typeof A.cream} scale={0.012} p={[x as number, y as number, 0.125]} castShadow={false} />
      ))}
    </group>
  )
}

/** La pendule ronde de l'atelier : cadran crème, lunette de laiton, chiffres aux quatre coins, aiguilles d'encre. Face à +x, centre en `position`. */
function Clock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={Math.PI / 2}>
      <Part geo={cyl(0.33, 0.33, 0.06, 28)} m={A.brass} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.285, 0.285, 0.06, 28)} m={A.cream} rotation-x={Math.PI / 2} p={[0, 0, 0.008]} castShadow={false} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, big = i % 3 === 0
        return <Part key={i} geo={rbox(big ? 0.03 : 0.016, big ? 0.07 : 0.045, 0.01, 0.004)} m={A.ink} p={[Math.sin(a) * 0.23, Math.cos(a) * 0.23, 0.04]} rotation-z={-a} castShadow={false} />
      })}
      <Part geo={rbox(0.022, 0.15, 0.01, 0.005)} m={A.ink} p={[-0.034, 0.05, 0.05]} rotation-z={0.7} castShadow={false} />
      <Part geo={rbox(0.016, 0.22, 0.01, 0.005)} m={A.ink} p={[0.06, 0.062, 0.058]} rotation-z={-0.55} castShadow={false} />
      <Part geo={SPH} m={A.brass} scale={0.02} p={[0, 0, 0.066]} castShadow={false} />
    </group>
  )
}

/**
 * Un panneau d'outils en chêne, au mur de gauche, près du coin du fond : pinceaux dans un pot, ciseaux, règle, rouleau
 * de ruban, pelote de ficelle, tous accrochés à des chevilles. Face à +x, centre en `position`.
 */
function ToolBoard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={Math.PI / 2} scale={0.8}>
      <Part geo={rbox(0.95, 0.72, 0.04, 0.015)} m={A.oak} castShadow={false} />
      <Part geo={rbox(1.0, 0.04, 0.06, 0.015)} m={A.oakDark} p={[0, 0.38, 0.0]} castShadow={false} />
      {/* les chevilles et ce qui y pend */}
      {[-0.36, -0.12, 0.12, 0.36].map((x) => <Part key={x} geo={cyl(0.012, 0.012, 0.07, 8)} m={A.brass} p={[x, 0.22, 0.05]} rotation-x={Math.PI / 2} castShadow={false} />)}
      <Part geo={rbox(0.05, 0.4, 0.012, 0.005)} m={A.white} p={[-0.36, 0.0, 0.06]} castShadow={false} />
      <Part geo={rbox(0.05, 0.2, 0.012, 0.005)} m={A.ochre} p={[-0.36, 0.1, 0.07]} castShadow={false} />
      <group position={[-0.12, 0.08, 0.06]}>
        <Part geo={rbox(0.03, 0.22, 0.01, 0.004)} m={A.steel} p={[-0.02, -0.02, 0]} rotation-z={0.18} castShadow={false} />
        <Part geo={rbox(0.03, 0.22, 0.01, 0.004)} m={A.steel} p={[0.02, -0.02, 0.008]} rotation-z={-0.18} castShadow={false} />
        <Part geo={cyl(0.04, 0.04, 0.012, 14)} m={A.terracotta} p={[-0.045, -0.15, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.04, 0.04, 0.012, 14)} m={A.terracotta} p={[0.045, -0.15, 0.008]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
      <Part geo={cyl(0.075, 0.075, 0.07, 18)} m={A.sage} p={[0.12, 0.0, 0.065]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.04, 0.04, 0.075, 14)} m={A.paper} p={[0.12, 0.0, 0.066]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={SPH} m={A.baguette} scale={[0.07, 0.07, 0.04]} p={[0.36, 0.0, 0.065]} castShadow={false} />
      {/* la petite étagère basse : un pot de pinceaux, une équerre */}
      <Part geo={rbox(0.9, 0.035, 0.1, 0.012)} m={A.oakDark} p={[0, -0.26, 0.05]} castShadow={false} />
      <Part geo={cyl(0.05, 0.045, 0.1, 14)} m={A.prussian} p={[-0.25, -0.19, 0.06]} castShadow={false} />
      {[-0.02, 0.0, 0.02].map((x, i) => <Part key={i} geo={cyl(0.005, 0.005, 0.22, 5)} m={A.oak} p={[-0.25 + x, -0.08, 0.06]} rotation-z={x * 4} castShadow={false} />)}
      <Part geo={rbox(0.14, 0.14, 0.012, 0.005)} m={A.glass} p={[0.2, -0.17, 0.07]} castShadow={false} />
    </group>
  )
}

/** Le fond de l'atelier près du coin : la pendule, le panneau d'outils et le mannequin de couture contre le mur. */
export function BackWall() {
  return (
    <>
      <Clock position={[-2.945, 3.3, -2.12]} />
      <ToolBoard position={[-2.955, 2.2, -2.12]} />
      <DressForm position={[-2.45, 0, -2.2]} ry={0.5} />
    </>
  )
}
