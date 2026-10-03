import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Steam } from '../objects/Steam'
import { O } from './materials'

const DECK = 0.42

/** Sur l'engawa : le plateau de thé (bouilloire de fonte, deux bols, des gâteaux), un coussin, le yukata plié. */
export function TeaTray() {
  return (
    <>
      <group position={[-2.42, DECK, -1.35]}>
        <Part geo={rbox(0.62, 0.035, 0.44, 0.015)} m={O.hinoki} p={[0, 0.018, 0]} />
        <group position={[-0.12, 0.035, 0]}>
          <Part geo={SPH} m={O.iron} scale={[0.13, 0.1, 0.13]} p={[0, 0.09, 0]} />
          <Part geo={cyl(0.04, 0.05, 0.03, 12)} m={O.iron} p={[0, 0.19, 0]} castShadow={false} />
          <Part m={O.iron} p={[0, 0.18, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.1, 0.01, 6, 16, Math.PI]} />
          </Part>
          <Part geo={cyl(0.012, 0.022, 0.1, 8)} m={O.iron} p={[0.13, 0.11, 0]} rotation-z={-0.9} castShadow={false} />
          <Steam at={[0.18, 0.2, 0]} every={1.4} />
        </group>
        {[[0.14, -0.1], [0.2, 0.08]].map(([x, z], i) => (
          <Part key={i} geo={cyl(0.05, 0.035, 0.06, 14)} m={i ? O.celadon : O.ceramic} p={[x, 0.065, z]} />
        ))}
        <Part geo={cyl(0.08, 0.07, 0.015, 16)} m={O.ceramic} p={[0.05, 0.045, 0.14]} castShadow={false} />
        {[[0.02, 0.13, O.red], [0.08, 0.15, O.paper]].map(([x, z, m], i) => (
          <Part key={i} geo={SPH} m={m as typeof O.red} scale={[0.03, 0.022, 0.03]} p={[x as number, 0.065, z as number]} castShadow={false} />
        ))}
      </group>
      <Part geo={rbox(0.62, 0.08, 0.6, 0.04)} m={O.indigo} p={[-2.45, DECK + 0.04, -0.62]} />
      {/* le yukata plié et sa ceinture */}
      <group position={[-2.5, DECK, 0.65]} rotation-y={0.2}>
        <Part geo={rbox(0.5, 0.08, 0.4, 0.03)} m={O.yukata} p={[0, 0.04, 0]} />
        <Part geo={rbox(0.5, 0.025, 0.08, 0.01)} m={O.red} p={[0, 0.09, 0]} castShadow={false} />
        <Part geo={rbox(0.4, 0.05, 0.3, 0.02)} m={O.towel} p={[0.02, 0.11, 0.05]} />
      </group>
    </>
  )
}

/** Les geta sur la pierre, le seau de hinoki et le petit tabouret au bord du bassin, une serviette pliée. */
export function BathThings() {
  return (
    <>
      {[[-1.68, -0.25], [-1.52, -0.08]].map(([x, z], i) => (
        <group key={i} position={[x, 0.18, z]} rotation-y={0.3}>
          <Part geo={rbox(0.11, 0.025, 0.24, 0.01)} m={O.hinoki} />
          {[-0.06, 0.06].map((dz) => (
            <Part key={dz} geo={rbox(0.1, 0.04, 0.02, 0.005)} m={O.hinoki} p={[0, -0.03, dz]} castShadow={false} />
          ))}
          <Part m={O.red} p={[0, 0.015, -0.05]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.04, 0.006, 4, 10, Math.PI]} />
          </Part>
        </group>
      ))}
      <group position={[-0.55, 0, 0.75]}>
        <Part geo={cyl(0.2, 0.17, 0.24, 18)} m={O.hinoki} p={[0, 0.12, 0]} />
        {[0.05, 0.19].map((y) => (
          <Part key={y} geo={cyl(0.205, 0.205, 0.02, 18)} m={O.iron} p={[0, y, 0]} castShadow={false} />
        ))}
        <Part geo={cyl(0.18, 0.18, 0.01, 18)} m={O.water} p={[0, 0.2, 0]} castShadow={false} />
      </group>
      <group position={[-0.95, 0, 1.05]} rotation-y={0.3}>
        <Part geo={rbox(0.36, 0.04, 0.26, 0.015)} m={O.hinoki} p={[0, 0.22, 0]} />
        {[-0.14, 0.14].map((x) => (
          <Part key={x} geo={rbox(0.04, 0.2, 0.24, 0.01)} m={O.hinoki} p={[x, 0.1, 0]} />
        ))}
        <Part geo={rbox(0.26, 0.05, 0.2, 0.02)} m={O.towel} p={[0, 0.265, 0]} />
      </group>
      {/* les pas japonais, de l'engawa au bassin */}
      {[[-1.05, -0.05, 0.3], [-0.55, -0.35, 0.25]].map(([x, z, s], i) => (
        <Part key={i} geo={cyl(s, s * 1.05, 0.06, 10)} m={O.stone[i]} p={[x, 0.03, z]} scale={[1, 1, 0.8]} />
      ))}
    </>
  )
}

/** Un petit pin taillé en nuages, des azalées en boule, des fougères et de la mousse. */
export function Plants() {
  return (
    <>
      <group position={[0.05, 0, 1.75]}>
        <Part geo={SPH} m={O.moss} scale={[0.6, 0.12, 0.5]} p={[0, 0.04, 0]} />
        <Part geo={cyl(0.05, 0.08, 0.7, 8)} m={O.bark} p={[0.05, 0.35, 0]} rotation-z={-0.25} />
        <Part geo={cyl(0.035, 0.05, 0.5, 8)} m={O.bark} p={[0.25, 0.75, 0.05]} rotation-z={-0.9} />
        {[[0.25, 0.75, 0.0, 0.32], [-0.1, 0.95, 0.05, 0.26], [0.5, 0.95, 0.1, 0.22], [0.15, 1.15, -0.05, 0.2]].map(([x, y, z, s], i) => (
          <Part key={i} geo={SPH} m={O.pine} scale={[s, s * 0.45, s * 0.9]} p={[x, y, z]} />
        ))}
      </group>
      {[[2.55, 0.55, 0.3], [1.85, 1.5, 0.26], [-0.3, -2.75, 0.3], [2.95, 2.2, 0.34]].map(([x, z, s], i) => (
        <Part key={i} geo={SPH} m={O.azalea} scale={[s, s * 0.75, s]} p={[x, s * 0.6, z]} />
      ))}
      {[[2.85, 2.2], [-0.35, -2.7]].map(([x, z], i) => (
        <group key={i}>
          {Array.from({ length: 7 }, (_, k) => {
            const a = (k / 7) * TAU
            return <Part key={k} geo={SPH} m={O.maple[(k + i) % 4]} scale={0.035} p={[x + Math.cos(a) * 0.2, 0.42 + (k % 2) * 0.05, z + Math.sin(a) * 0.2]} castShadow={false} />
          })}
        </group>
      ))}
      {[[2.0, -2.6], [-1.6, 2.3], [1.0, 2.9]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {Array.from({ length: 6 }, (_, k) => (
            <Part key={k} geo={SPH} m={k % 2 ? O.azalea : O.pine} scale={[0.04, 0.02, 0.22]} p={[Math.cos(k) * 0.1, 0.12, Math.sin(k) * 0.1]} rotation={[0.5, k * 1.05, 0]} castShadow={false} />
          ))}
        </group>
      ))}
    </>
  )
}
