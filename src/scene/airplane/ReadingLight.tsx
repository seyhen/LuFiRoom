import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, type Group, type PointLight } from 'three'
import { smooth } from '../../math'
import { mood, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { BIN, IN, ROW_X } from './layout'

/** Le faisceau de la lampe de lecture : étroit à la lentille, large vers l'assise (le haut d'un cylindre est en +y). */
const BEAM = new CylinderGeometry(0.05, 0.5, 2.3, 24, 1, true)

/**
 * La lampe de lecture du bloc de services de la rangée 2, objet « jour / nuit » : la lentille ronde s'allume en ambre et son faisceau
 * descend sur le siège du violoncelle ; la bouche d'air et le bouton d'appel complètent le bloc. La nuit, c'est la lumière chaude de la cabine
 * (la seule vraie lumière du bloc : une source ponctuelle ambre, douce, qui rejoint le violoncelle et le plateau).
 * `position` : le dessous du coffre, au-dessus du siège A de la rangée 2.
 */
export function ReadingLight() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const n = smooth(mood.night)
    A.beam.opacity = 0.03 + n * 0.17
    A.lens.emissiveIntensity = 0.08 + n * 1.1
    light.current.intensity = (0.1 + n * 1.9) * Math.PI
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[ROW_X[1], BIN.y0, IN + 0.3]}>
      <Static>
        <Part geo={rbox(0.58, 0.06, 0.32, 0.025)} m={A.psu} p={[0, -0.025, 0]} castShadow={false} />
        <Part geo={cyl(0.052, 0.052, 0.014, 20)} m={A.psu} p={[-0.17, -0.056, 0]} castShadow={false} />
        <Part geo={SPH} m={A.nozzle} scale={0.04} p={[0.02, -0.07, 0]} castShadow={false} />
        <Part geo={cyl(0.022, 0.022, 0.012, 12)} m={A.button} p={[0.19, -0.058, 0.04]} castShadow={false} />
        <Part geo={rbox(0.08, 0.008, 0.04, 0.003)} m={A.binDark} p={[0.19, -0.056, -0.06]} castShadow={false} />
      </Static>
      {/* la lentille, qui s'allume */}
      <Part geo={cyl(0.04, 0.04, 0.012, 20)} m={A.lens} p={[-0.17, -0.066, 0]} castShadow={false} />
      <mesh geometry={BEAM} material={A.beam} position={[-0.17, -1.2, 0.0]} raycast={noRay} renderOrder={4} />
      <pointLight ref={light} color={0xffc882} intensity={0} distance={6} decay={1.3} position={[-0.17, -0.4, 0.3]} />
    </group>
  )
}
