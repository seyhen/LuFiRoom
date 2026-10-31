import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Material } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Vessel } from '../igloo/Vessel'
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

/** Une tasse ouverte (on voit le thé dedans), son anse vers la pièce, et sa soucoupe si on veut. `p` : le pied. */
export function Cup({ p, m, ry = 0, saucer = false }: { p: V3; m: Material; ry?: number; saucer?: boolean }) {
  const y0 = saucer ? 0.012 : 0
  return (
    <group position={p} rotation-y={ry}>
      {saucer && <Part geo={cyl(0.065, 0.05, 0.012, 20)} m={A.white} p={[0, 0.006, 0]} castShadow={false} />}
      <Vessel p={[0, y0, 0]} rt={0.042} rb={0.032} h={0.075} m={m} inner={A.glazeIn} t={0.005} />
      <Part geo={cyl(0.034, 0.034, 0.006, 16)} m={A.tea} p={[0, y0 + 0.058, 0]} castShadow={false} />
      <Part m={m} p={[0.04, y0 + 0.04, 0]} rotation-z={-Math.PI * 0.55} castShadow={false}>
        <torusGeometry args={[0.02, 0.006, 6, 12, Math.PI * 1.1]} />
      </Part>
    </group>
  )
}

/** La théière ronde en grès bleu de Prusse : panse, épaule, couvercle et son bouton, anse en anneau derrière, bec qui monte devant. */
function Teapot({ p }: { p: V3 }) {
  return (
    <group position={p} rotation-y={0.75}>
      <Part geo={cyl(0.06, 0.065, 0.015, 18)} m={A.prussian} p={[0, 0.008, 0]} castShadow={false} />
      <Part geo={SPH} m={A.prussian} scale={[0.105, 0.09, 0.105]} p={[0, 0.09, 0]} />
      {/* un filet crème autour de la panse */}
      <Part m={A.cream} p={[0, 0.1, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.103, 0.006, 6, 28]} />
      </Part>
      {/* le couvercle, son rebord et le bouton */}
      <Part geo={cyl(0.052, 0.058, 0.014, 18)} m={A.prussian} p={[0, 0.178, 0]} castShadow={false} />
      <Part geo={SPH} m={A.prussian} scale={[0.048, 0.025, 0.048]} p={[0, 0.186, 0]} castShadow={false} />
      <Part geo={SPH} m={A.cream} scale={[0.017, 0.02, 0.017]} p={[0, 0.215, 0]} castShadow={false} />
      {/* l'anse : un anneau épais, debout, à l'arrière */}
      <Part m={A.prussian} p={[-0.11, 0.1, 0]} castShadow={false}>
        <torusGeometry args={[0.045, 0.013, 8, 18]} />
      </Part>
      {/* le bec, qui part bas sur la panse et remonte, son bout un peu évasé */}
      <Part geo={cyl(0.012, 0.024, 0.11, 10)} m={A.prussian} p={[0.12, 0.11, 0]} rotation-z={-0.85} castShadow={false} />
      <Part geo={cyl(0.016, 0.012, 0.014, 10)} m={A.prussian} p={[0.161, 0.146, 0]} rotation-z={-0.85} castShadow={false} />
      {/* le fil du sachet qui dépasse sous le couvercle */}
      <Part geo={cyl(0.0025, 0.0025, 0.07, 4)} m={A.paper} p={[0.04, 0.15, 0.04]} rotation-z={0.4} castShadow={false} />
      <Part geo={rbox(0.022, 0.026, 0.004, 0.002)} m={A.ochre} p={[0.055, 0.105, 0.05]} castShadow={false} />
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
        {/* la théière bleue (couvercle, bouton, anse, bec), deux tasses à anse sur leurs soucoupes, la boîte à biscuits */}
        <Teapot p={[0.02, TOP, 0.12]} />
        <Cup p={[0.06, TOP, 0.4]} m={A.blush} ry={-0.4} saucer />
        <Cup p={[0.15, TOP, 0.53]} m={A.cream} ry={0.5} saucer />
        {/* la boîte à biscuits en fer : son couvercle qui déborde, une étiquette crème */}
        <Part geo={cyl(0.07, 0.07, 0.13, 20)} m={A.terracotta} p={[-0.12, TOP + 0.065, 0.45]} />
        <Part geo={cyl(0.075, 0.075, 0.03, 20)} m={A.terracotta} p={[-0.12, TOP + 0.135, 0.45]} />
        <Part geo={cyl(0.077, 0.077, 0.05, 20)} m={A.cream} p={[-0.12, TOP + 0.06, 0.45]} castShadow={false} />
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
          <Cup key={z} p={[0.02, 0.02, z]} m={[A.terracotta, A.cream, A.sage, A.blush][i]} ry={0.3} />
        ))}
        <Part geo={cyl(0.05, 0.05, 0.18, 14)} m={A.glass} p={[0.02, 0.11, 0.42]} castShadow={false} />
        <Part geo={cyl(0.045, 0.045, 0.1, 14)} m={A.ochre} p={[0.02, 0.07, 0.42]} castShadow={false} />
      </group>
    </>
  )
}
