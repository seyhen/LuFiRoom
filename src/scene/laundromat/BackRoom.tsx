import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { L } from './materials'

const IN = -3.0 // la face intérieure du mur du fond

/** Une planche à repasser : plateau à bout rond, ses deux paires de pieds en X, le fer posé à plat, une chemise pliée. `position` est le sol. */
function IroningBoard({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  const TOP = 0.84
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={rbox(0.9, 0.035, 0.34, 0.015)} m={L.mintCloth} p={[0, TOP, 0]} />
      <Part geo={cyl(0.17, 0.17, 0.035, 20)} m={L.mintCloth} p={[0.45, TOP, 0]} />
      <Part geo={rbox(0.9, 0.012, 0.3, 0.005)} m={L.steelDark} p={[0, TOP - 0.03, 0]} castShadow={false} />
      {/* les pieds en X, de chaque côté, et leur barre d'appui */}
      {[-0.1, 0.1].map((z) => (
        <group key={z} position={[-0.05, 0.4, z]}>
          <Part geo={cyl(0.012, 0.012, 0.86, 6)} m={L.chrome} rotation-z={0.3} castShadow={false} />
          <Part geo={cyl(0.012, 0.012, 0.86, 6)} m={L.chrome} rotation-z={-0.3} castShadow={false} />
        </group>
      ))}
      <Part geo={cyl(0.01, 0.01, 0.24, 6)} m={L.chrome} p={[-0.05, 0.4, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* le fer : semelle, coque menthe, poignée, voyant */}
      <group position={[-0.28, TOP + 0.018, 0.02]} rotation-y={0.25}>
        <Part geo={rbox(0.22, 0.03, 0.11, 0.02)} m={L.chrome} p={[0, 0.015, 0]} castShadow={false} />
        <Part geo={SPH} m={L.mintPaint} scale={[0.1, 0.05, 0.055]} p={[-0.01, 0.06, 0]} />
        <Part geo={rbox(0.14, 0.025, 0.03, 0.01)} m={L.rubber} p={[-0.01, 0.115, 0]} castShadow={false} />
        <Part geo={SPH} m={L.coral} scale={0.012} p={[0.07, 0.085, 0]} castShadow={false} />
      </group>
      {/* la chemise pliée, col visible */}
      <Part geo={rbox(0.3, 0.035, 0.26, 0.012)} m={L.white} p={[0.2, TOP + 0.034, -0.01]} rotation-y={-0.08} />
      <Part geo={rbox(0.05, 0.04, 0.2, 0.012)} m={L.sky} p={[0.07, TOP + 0.04, -0.01]} castShadow={false} />
      <Part geo={rbox(0.3, 0.012, 0.04, 0.005)} m={L.sky} p={[0.21, TOP + 0.054, 0.08]} rotation-y={-0.08} castShadow={false} />
    </group>
  )
}

/** Le tableau des objets trouvés, au mur du fond : liège, une chaussette seule, des petites annonces, des punaises de couleur. */
function LostAndFound({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Part geo={rbox(0.86, 0.62, 0.04, 0.015)} m={L.woodDark} castShadow={false} />
      <mesh material={L.cork} position={[0, 0, 0.022]} raycast={noRay}>
        <planeGeometry args={[0.76, 0.52]} />
      </mesh>
      {/* la chaussette orpheline : jambe, talon, pied rayés, une punaise rouge */}
      <group position={[-0.2, -0.02, 0.04]} rotation-z={0.12}>
        <Part geo={rbox(0.09, 0.2, 0.02, 0.008)} m={L.coral} castShadow={false} />
        <Part geo={rbox(0.17, 0.09, 0.02, 0.008)} m={L.coral} p={[0.04, -0.12, 0]} castShadow={false} />
        <Part geo={rbox(0.093, 0.03, 0.022, 0.005)} m={L.white} p={[0, 0.06, 0.001]} castShadow={false} />
        <Part geo={rbox(0.093, 0.03, 0.022, 0.005)} m={L.white} p={[0, -0.01, 0.001]} castShadow={false} />
        <Part geo={SPH} m={L.coral} scale={0.018} p={[0, 0.12, 0.02]} castShadow={false} />
      </group>
      {/* deux annonces et un ticket */}
      <Part geo={rbox(0.2, 0.26, 0.012, 0.004)} m={L.white} p={[0.12, 0.08, 0.035]} rotation-z={-0.06} castShadow={false} />
      <Part geo={rbox(0.12, 0.012, 0.004, 0.002)} m={L.frameDark} p={[0.12, 0.17, 0.043]} rotation-z={-0.06} castShadow={false} />
      <Part geo={rbox(0.16, 0.18, 0.012, 0.004)} m={L.butter} p={[0.3, -0.1, 0.035]} rotation-z={0.1} castShadow={false} />
      <Part geo={rbox(0.1, 0.07, 0.01, 0.004)} m={L.sky} p={[0.0, 0.2, 0.034]} rotation-z={0.05} castShadow={false} />
      {[[0.12, 0.2, L.coral], [0.3, -0.03, L.sky], [0.0, 0.23, L.yellow]].map(([x, y, m], i) => (
        <Part key={i} geo={SPH} m={m as typeof L.coral} scale={0.015} p={[x as number, y as number, 0.046]} castShadow={false} />
      ))}
    </group>
  )
}

/**
 * Le fond de la laverie, resté vide au milieu : une planche à repasser avec son fer et une chemise, et le tableau des objets trouvés (la chaussette orpheline) au mur du fond.
 */
export function BackRoom() {
  return (
    <>
      <IroningBoard position={[-1.2, 0, -1.0]} ry={1.45} />
      <LostAndFound position={[-2.15, 2.4, IN + 0.03]} />
    </>
  )
}
