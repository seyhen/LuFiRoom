import { useFrame } from '@react-three/fiber'
import { smooth } from '../../math'
import { mood } from '../anim'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { DOOR, VITRINE } from './Shell'
import { L } from './materials'

const Z = -3.13 // le milieu du mur, où sont les montants
const MID = (VITRINE.x0 + VITRINE.x1) / 2
const TRANSOM = 2.78 // la traverse haute de la vitrine (au-dessus : le lettrage)

/** Un vitrage : la vitre (côté pièce), et dehors, collées dessus, les gouttes de pluie. */
function Pane({ x0, x1, y0, y1 }: { x0: number; x1: number; y0: number; y1: number }) {
  const w = x1 - x0, h = y1 - y0, c: [number, number] = [(x0 + x1) / 2, (y0 + y1) / 2]
  return (
    <>
      <mesh material={L.glass} position={[c[0], c[1], Z]} raycast={noRay}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={L.drops} position={[c[0], c[1], Z - 0.03]} raycast={noRay}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </>
  )
}

/**
 * La devanture : la grande vitrine sur la rue et sa porte vitrée, des montants d'aluminium laqué blanc, l'imposte où le lettrage
 * « LAVERIE » se lit à l'envers depuis l'intérieur, la barre de poussée chromée et la plaque de propreté de la porte, l'étiquette
 * des horaires, l'appui intérieur de la vitrine (un gobelet de café oublié, un gant perdu). Sous la pluie, les gouttes perlent
 * et coulent sur le verre, côté rue (la pluie reste dehors).
 */
export function Vitrine() {
  useFrame(() => {
    L.drops.opacity = smooth(mood.rain) * 0.75
  })
  const vw = VITRINE.x1 - VITRINE.x0, vh = VITRINE.y1 - VITRINE.y0
  return (
    <group>
      {/* les montants de la vitrine : bas, haut, côtés, meneau, traverse */}
      <Part geo={rbox(vw + 0.14, 0.09, 0.16, 0.03)} m={L.frame} p={[MID, VITRINE.y0 - 0.01, Z]} />
      <Part geo={rbox(vw + 0.14, 0.09, 0.16, 0.03)} m={L.frame} p={[MID, VITRINE.y1 + 0.01, Z]} />
      {[VITRINE.x0, VITRINE.x1].map((x) => (
        <Part key={x} geo={rbox(0.09, vh + 0.1, 0.16, 0.03)} m={L.frame} p={[x, (VITRINE.y0 + VITRINE.y1) / 2, Z]} />
      ))}
      <Part geo={rbox(0.06, TRANSOM - VITRINE.y0, 0.1, 0.02)} m={L.frame} p={[MID, (VITRINE.y0 + TRANSOM) / 2, Z]} castShadow={false} />
      <Part geo={rbox(vw, 0.06, 0.1, 0.02)} m={L.frame} p={[MID, TRANSOM, Z]} castShadow={false} />
      <Pane x0={VITRINE.x0} x1={VITRINE.x1} y0={VITRINE.y0} y1={VITRINE.y1} />
      {/* le lettrage de vinyle, collé à l'intérieur de l'imposte : vu d'ici, à l'envers */}
      <mesh material={L.lettering} position={[MID, (TRANSOM + VITRINE.y1) / 2 + 0.01, Z + 0.012]} raycast={noRay}>
        <planeGeometry args={[vw - 0.2, (vw - 0.2) * 0.1875]} />
      </mesh>
      {/* l'appui intérieur, en stratifié, et ce qu'on y a laissé : un gobelet de café, son couvercle, un gant de laine perdu */}
      <Part geo={rbox(vw + 0.2, 0.05, 0.3, 0.02)} m={L.laminate} p={[MID, VITRINE.y0 - 0.06, -2.88]} />
      <group position={[0.62, VITRINE.y0 - 0.035, -2.86]}>
        <Part geo={cyl(0.042, 0.032, 0.12, 18)} m={L.paper} p={[0, 0.06, 0]} />
        <Part geo={cyl(0.04, 0.04, 0.035, 18)} m={L.coral} p={[0, 0.05, 0]} castShadow={false} />
        <Part geo={cyl(0.046, 0.045, 0.014, 18)} m={L.plastic} p={[0, 0.125, 0]} castShadow={false} />
      </group>
      <group position={[-1.12, VITRINE.y0 - 0.03, -2.84]} rotation-y={0.5}>
        <Part geo={SPH} m={L.lilac} scale={[0.07, 0.018, 0.05]} p={[0, 0.012, 0]} castShadow={false} />
        {[-0.03, -0.01, 0.01, 0.03].map((z, i) => (
          <Part key={z} geo={SPH} m={L.lilac} scale={[0.04, 0.014, 0.011]} p={[0.07 + (i === 0 ? -0.025 : 0), 0.012, z]} rotation-y={(z * 4)} castShadow={false} />
        ))}
        <Part geo={SPH} m={L.white} scale={[0.03, 0.019, 0.05]} p={[-0.07, 0.012, 0]} castShadow={false} />
      </group>
      {/* la porte : dormant, ouvrant, imposte, barre de poussée, plaque de propreté, horaires */}
      <Part geo={rbox(DOOR.x1 - DOOR.x0 + 0.14, 0.09, 0.16, 0.03)} m={L.frame} p={[(DOOR.x0 + DOOR.x1) / 2, DOOR.y1 + 0.01, Z]} />
      {[DOOR.x0, DOOR.x1].map((x) => (
        <Part key={x} geo={rbox(0.09, DOOR.y1 + 0.05, 0.16, 0.03)} m={L.frame} p={[x, DOOR.y1 / 2, Z]} />
      ))}
      <Part geo={rbox(DOOR.x1 - DOOR.x0, 0.07, 0.12, 0.02)} m={L.frame} p={[(DOOR.x0 + DOOR.x1) / 2, 2.84, Z]} castShadow={false} />
      <group position={[(DOOR.x0 + DOOR.x1) / 2, 0, Z]}>
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.07, 2.78, 0.07, 0.02)} m={L.frame} p={[s * 0.41, 1.41, 0]} castShadow={false} />
        ))}
        <Part geo={rbox(0.86, 0.26, 0.07, 0.02)} m={L.frame} p={[0, 0.15, 0]} castShadow={false} />
        <Part geo={rbox(0.78, 0.2, 0.012, 0.005)} m={L.steel} p={[0, 0.15, 0.042]} castShadow={false} />
        <Part geo={rbox(0.86, 0.07, 0.07, 0.02)} m={L.frame} p={[0, 2.77, 0]} castShadow={false} />
        {/* la barre de poussée et ses deux pattes */}
        <Part geo={cyl(0.02, 0.02, 0.62, 12)} m={L.chrome} p={[0, 1.05, 0.12]} rotation-z={Math.PI / 2} castShadow={false} />
        {[-0.28, 0.28].map((x) => (
          <Part key={x} geo={cyl(0.014, 0.014, 0.09, 8)} m={L.chrome} p={[x, 1.05, 0.08]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
        <mesh material={L.hours} position={[0, 1.6, 0.012]} raycast={noRay}>
          <planeGeometry args={[0.42, 0.21]} />
        </mesh>
      </group>
      <Pane x0={DOOR.x0 + 0.06} x1={DOOR.x1 - 0.06} y0={0.28} y1={DOOR.y1 - 0.04} />
      {/* le paillasson devant la porte, et le seuil d'inox */}
      <Part geo={rbox(DOOR.x1 - DOOR.x0 + 0.1, 0.02, 0.18, 0.008)} m={L.steel} p={[(DOOR.x0 + DOOR.x1) / 2, 0.01, -3.04]} castShadow={false} />
      <Part geo={rbox(0.9, 0.025, 0.55, 0.012)} m={L.rubber} p={[(DOOR.x0 + DOOR.x1) / 2, 0.0125, -2.62]} castShadow={false} />
      <Part geo={rbox(0.78, 0.006, 0.44, 0.004)} m={L.frameDark} p={[(DOOR.x0 + DOOR.x1) / 2, 0.027, -2.62]} castShadow={false} />
    </group>
  )
}
