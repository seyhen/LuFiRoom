import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { Steam } from '../objects/Steam'
import { A } from './materials'

const X = -2.68, Z = 1.25, TOP = 0.9

/** La bouilloire émaillée crème : elle fume quand on l'écoute chauffer. */
function Kettle() {
  const g = useRef<Group>(null!), steam = useRef<Group>(null!)
  useSquash('kettle', g)
  useFrame(() => void (steam.current.visible = isActive(useStore.getState(), 'kettle')))
  return (
    <group ref={g} userData={{ id: 'kettle' }} position={[X + 0.05, TOP, Z - 0.3]}>
      <Part geo={cyl(0.1, 0.1, 0.03, 20)} m={A.steel} p={[0, 0.015, 0]} />
      <Part geo={SPH} m={A.cream} scale={[0.13, 0.12, 0.13]} p={[0, 0.13, 0]} />
      <Part geo={cyl(0.05, 0.07, 0.04, 16)} m={A.cream} p={[0, 0.25, 0]} castShadow={false} />
      <Part geo={SPH} m={A.prussian} scale={0.025} p={[0, 0.28, 0]} castShadow={false} />
      <Part m={A.prussian} p={[0, 0.27, 0]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.08, 0.012, 6, 14, Math.PI]} />
      </Part>
      <Part geo={cyl(0.015, 0.03, 0.14, 8)} m={A.cream} p={[0.13, 0.17, 0]} rotation-z={-0.9} castShadow={false} />
      <group ref={steam}>
        <Steam at={[0.2, 0.25, 0]} every={0.35} />
      </group>
    </group>
  )
}

/** Le petit coin cuisine contre le mur : un buffet, la bouilloire, la théière, les tasses, une baguette dans son sac. */
export function Kitchenette() {
  return (
    <>
      <group position={[X, 0, Z]}>
        <Part geo={rbox(0.6, TOP - 0.04, 1.3, 0.03)} m={A.sage} p={[0, (TOP - 0.04) / 2, 0]} />
        <Part geo={rbox(0.64, 0.05, 1.36, 0.02)} m={A.oak} p={[0, TOP - 0.02, 0]} />
        {[-0.32, 0.32].map((z) => (
          <group key={z}>
            <Part geo={rbox(0.02, 0.62, 0.56, 0.015)} m={A.sage} p={[0.31, 0.42, z]} castShadow={false} />
            <Part geo={SPH} m={A.brass} scale={0.02} p={[0.33, 0.6, z - Math.sign(z) * 0.2]} castShadow={false} />
          </group>
        ))}
        {/* la théière bleue, deux tasses, la boîte à biscuits */}
        <group position={[0.02, TOP, 0.12]}>
          <Part geo={SPH} m={A.prussian} scale={[0.1, 0.085, 0.1]} p={[0, 0.08, 0]} />
          <Part geo={SPH} m={A.prussian} scale={0.022} p={[0, 0.17, 0]} castShadow={false} />
          <Part geo={cyl(0.01, 0.02, 0.1, 8)} m={A.prussian} p={[0.11, 0.1, 0]} rotation-z={-0.9} castShadow={false} />
        </group>
        {[[0.05, 0.38, A.blush], [0.12, 0.5, A.cream]].map(([x, z, m], i) => (
          <Part key={i} geo={cyl(0.04, 0.034, 0.07, 14)} m={m as typeof A.cream} p={[x as number, TOP + 0.035, z as number]} />
        ))}
        <Part geo={cyl(0.07, 0.07, 0.14, 16)} m={A.terracotta} p={[-0.12, TOP + 0.07, 0.45]} />
        {/* la baguette dans son sac de papier, appuyée au mur */}
        <group position={[-0.18, TOP, -0.55]} rotation-x={0.25}>
          <Part geo={rbox(0.12, 0.3, 0.1, 0.02)} m={A.paper} p={[0, 0.15, 0]} />
          <Part geo={cyl(0.03, 0.03, 0.62, 10)} m={A.baguette} p={[0, 0.3, 0]} />
        </group>
      </group>
      <Kettle />
      {/* l'étagère de tasses au-dessus */}
      <group position={[-2.84, 1.65, Z]}>
        <Part geo={rbox(0.28, 0.04, 1.2, 0.015)} m={A.oak} />
        {[-0.4, -0.2, 0, 0.2].map((z, i) => (
          <Part key={z} geo={cyl(0.04, 0.034, 0.08, 14)} m={[A.terracotta, A.cream, A.sage, A.blush][i]} p={[0.02, 0.06, z]} castShadow={false} />
        ))}
        <Part geo={cyl(0.05, 0.05, 0.18, 14)} m={A.glass} p={[0.02, 0.11, 0.42]} castShadow={false} />
        <Part geo={cyl(0.045, 0.045, 0.1, 14)} m={A.ochre} p={[0.02, 0.07, 0.42]} castShadow={false} />
      </group>
    </>
  )
}
