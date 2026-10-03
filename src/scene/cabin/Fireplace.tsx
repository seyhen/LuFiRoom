import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { Static } from '../Static'
import { Flames } from '../objects/Flames'
import { Candle } from '../objects/Candle'
import { C } from './materials'

const POS = [-1.9, 0, -2.69] as const

/** Une guirlande de branches de sapin sur la poutre, avec des baies rouges et des pommes de pin. */
function Garland() {
  const bits = useMemo(() => Array.from({ length: 22 }, (_, i) => [-1.05 + i * 0.1, Math.sin(i * 1.7) * 0.03, (i % 3) - 1] as const), [])
  return (
    <group position={[0, 1.98, 0.32]}>
      {bits.map(([x, dy, k], i) => (
        <Part key={i} geo={SPH} m={i % 2 ? C.pine : C.pineDark} scale={[0.09, 0.06, 0.08]} p={[x, dy, 0.02 * k]} rotation-z={i} castShadow={false} />
      ))}
      {bits.filter((_, i) => i % 3 === 1).map(([x], i) => (
        <Part key={`b${i}`} geo={SPH} m={C.berry} scale={0.025} p={[x + 0.03, 0.04, 0.07]} castShadow={false} />
      ))}
      {[-0.7, 0.15, 0.85].map((x) => (
        <Part key={x} geo={SPH} m={C.logBark} scale={[0.04, 0.055, 0.04]} p={[x, -0.06, 0.08]} castShadow={false} />
      ))}
    </group>
  )
}

/**
 * Cheminée de pierres de rivière, sa poutre de chêne brut en guise de manteau, sa guirlande de sapin : le feu s'allume et
 * crépite quand son son joue, la pièce s'éclaire de orange, des braises montent. Une bouilloire de fonte attend sur l'âtre.
 */
export function Fireplace() {
  const g = useRef<Group>(null!)
  useSquash('fireplace', g)
  const logs = useMemo(() => [{ y: 0.2, z: -0.06, r: 0.1 }, { y: 0.2, z: 0.2, r: 0.1 }, { y: 0.36, z: 0.07, r: 0.09 }], [])
  return (
    <group ref={g} userData={{ id: 'fireplace' }} position={POS as unknown as [number, number, number]}>
      <Static>
        {/* âtre de pierre plate, piliers, poutre, conduit : la maçonnerie, et ses pierres en placage sur les faces vues */}
        <Part geo={rbox(2.5, 0.14, 1.25, 0.06)} m={C.hearth} p={[0, 0.07, 0.24]} />
        {[-0.82, 0.82].map((x) => (
          <group key={x}>
            <Part geo={rbox(0.5, 1.6, 0.74, 0.08)} m={C.stoneGrey} p={[x, 0.94, 0]} />
            <mesh material={C.stonePier} position={[x, 0.94, 0.375]} receiveShadow>
              <planeGeometry args={[0.46, 1.56]} />
            </mesh>
            <mesh material={C.stonePier} position={[x + 0.255, 0.94, 0]} rotation-y={Math.PI / 2} receiveShadow>
              <planeGeometry args={[0.7, 1.56]} />
            </mesh>
          </group>
        ))}
        <Part geo={rbox(1.6, 2.55, 0.62, 0.06)} m={C.stoneGrey} p={[0, 3.0, -0.08]} />
        <mesh material={C.stoneFlue} position={[0, 3.0, 0.235]} receiveShadow>
          <planeGeometry args={[1.56, 2.5]} />
        </mesh>
        <mesh material={C.stoneFlue} position={[0.805, 3.0, -0.08]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.58, 2.5]} />
        </mesh>
        <Part geo={rbox(1.14, 1.4, 0.1, 0.04)} m={M.plum} p={[0, 0.85, -0.3]} />
        <Part geo={rbox(1.18, 0.12, 0.5, 0.04)} m={C.stoneGrey} p={[0, 1.56, 0.0]} />
        {/* la poutre de chêne brut */}
        <Part geo={rbox(2.5, 0.26, 0.52, 0.06)} m={C.beamDark} p={[0, 1.86, 0.12]} />
        {/* les bûches dans l'âtre */}
        {logs.map(({ y, z, r }, i) => (
          <Part key={i} geo={cyl(r, r, 0.9, 14)} m={i === 2 ? C.charred : C.log} p={[0, y, z]} rotation-z={Math.PI / 2 + (i === 2 ? 0.08 : 0)} />
        ))}
        {/* la bouilloire de fonte et le serviteur (tisonnier, pelle) */}
        <group position={[0.95, 0.14, 0.62]}>
          <Part geo={SPH} m={C.iron} scale={[0.13, 0.1, 0.13]} p={[0, 0.1, 0]} />
          <Part geo={cyl(0.015, 0.025, 0.12, 8)} m={C.iron} p={[0.13, 0.13, 0]} rotation-z={-0.9} castShadow={false} />
          <Part m={C.iron} p={[0, 0.19, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.09, 0.012, 6, 14, Math.PI]} />
          </Part>
        </group>
        <group position={[-1.05, 0.14, 0.65]}>
          <Part geo={cyl(0.1, 0.12, 0.04, 14)} m={C.iron} p={[0, 0.02, 0]} />
          <Part geo={cyl(0.015, 0.015, 0.8, 6)} m={C.iron} p={[0, 0.42, 0]} />
          {[-0.05, 0.05].map((dx) => (
            <Part key={dx} geo={cyl(0.008, 0.008, 0.7, 5)} m={C.iron} p={[dx, 0.4, 0.04]} rotation-z={dx * 0.8} castShadow={false} />
          ))}
        </group>
        <Garland />
        {/* sur la poutre : un bocal de pommes de pin, une petite photo encadrée */}
        <group position={[0.75, 2.0, 0.1]}>
          <Part geo={cyl(0.07, 0.07, 0.16, 14)} m={M.glass} p={[0, 0.08, 0]} castShadow={false} />
          {[0, 1, 2].map((i) => (
            <Part key={i} geo={SPH} m={C.logBark} scale={[0.035, 0.05, 0.035]} p={[Math.cos(i * 2) * 0.02, 0.05 + i * 0.03, Math.sin(i * 2) * 0.02]} castShadow={false} />
          ))}
        </group>
        <group position={[-0.45, 2.12, 0.0]} rotation-x={-0.1}>
          <Part geo={rbox(0.28, 0.22, 0.03, 0.01)} m={C.beam} />
          <Part geo={rbox(0.22, 0.16, 0.01, 0.005)} m={C.knitBlue} p={[0, 0, 0.018]} castShadow={false} />
        </group>
      </Static>
      <Candle position={[-0.85, 1.99, 0.1]} height={0.16} radius={0.035} />
      <Candle position={[-0.7, 1.99, 0.16]} height={0.1} radius={0.03} />
      {/* le feu : flammes, lumière, halo et braises */}
      <Flames id="fireplace" position={[0, 0.43, 0.07]} light={{ at: [0, 0.37, 0.43] }} glow={{ at: [0, 0.32, 0.23], scale: 2.8 }} embers={{ spread: 0.3, at: [0, 0.12, 0.18] }} />
    </group>
  )
}
