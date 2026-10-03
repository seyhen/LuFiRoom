import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { Flames } from '../objects/Flames'
import { C } from './materials'

const POS = [-1.9, 0, -2.69] as const

/** Cheminée en pierre : le feu s'allume et crépite quand son son joue, la pièce s'éclaire de orange, des braises montent. */
export function Fireplace() {
  const g = useRef<Group>(null!)
  useSquash('fireplace', g)
  const logs = useMemo(() => [{ y: 0.2, z: -0.06, r: 0.1 }, { y: 0.2, z: 0.2, r: 0.1 }, { y: 0.36, z: 0.07, r: 0.09 }], [])
  return (
    <>
      <group ref={g} userData={{ id: 'fireplace' }} position={POS as unknown as [number, number, number]}>
        {/* âtre, piliers, manteau, conduit */}
        <Part geo={rbox(2.4, 0.14, 1.2, 0.06)} m={C.stoneDark} p={[0, 0.07, 0.22]} />
        {[-0.8, 0.8].map((x) => (
          <Part key={x} geo={rbox(0.46, 1.5, 0.74, 0.1)} m={C.stone} p={[x, 0.89, 0]} />
        ))}
        <Part geo={rbox(2.3, 0.26, 0.9, 0.1)} m={C.stone} p={[0, 1.77, 0.05]} />
        <Part geo={rbox(1.55, 2.3, 0.6, 0.08)} m={C.stone} p={[0, 3.05, -0.07]} />
        <Part geo={rbox(1.14, 1.3, 0.1, 0.04)} m={M.plum} p={[0, 0.85, -0.3]} />
        {/* bûches */}
        {logs.map(({ y, z, r }, i) => (
          <Part key={i} geo={cyl(r, r, 0.9, 14)} m={i === 2 ? C.charred : C.log} p={[0, y, z]} rotation-z={Math.PI / 2 + (i === 2 ? 0.08 : 0)} />
        ))}
        {/* sur le manteau : un mini sapin et un mug */}
        <Part geo={cyl(0.045, 0.06, 0.1, 10)} m={C.log} p={[-0.8, 1.95, 0.05]} />
        <Part m={C.pine} p={[-0.8, 2.22, 0.05]}>
          <coneGeometry args={[0.17, 0.46, 16]} />
        </Part>
        <Part geo={cyl(0.075, 0.068, 0.15, 18)} m={M.mug} p={[0.75, 1.98, 0.08]} />
        {/* le feu : flammes, lumière, halo et braises */}
        <Flames id="fireplace" position={[0, 0.43, 0.07]} light={{ at: [0, 0.37, 0.43] }} glow={{ at: [0, 0.32, 0.23], scale: 2.8 }} embers={{ spread: 0.3, at: [0, 0.12, 0.18] }} />
      </group>
    </>
  )
}
