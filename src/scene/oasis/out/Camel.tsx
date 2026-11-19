import { useMemo } from 'react'
import { blob, cone, ell, pair, type Blob } from '../../blob'
import { skin } from '../../materials'
import { Part, SPH_LO, cyl, rbox, type V3 } from '../../parts'
import { Static } from '../../Static'
import { O } from './materials'
import { groundY } from './ground'

const TAN = 0xc9a070, TAN_D = 0xb08a58, BELLY = 0xdcbc8e, LIP = 0xb87a6a, EYE = 0x22150c, CALLUS = 0x8a6a46

// Le dromadaire accroupi : la forme d'une seule peau (un corps couché, une bosse, un long cou en S, une tête fine au museau tombant, les pattes
// repliées sous le ventre). Repère : x vers l'avant (la tête), y en haut, z sur le côté.
const BODY: Blob[] = [
  ell([0, 0.52, 0], [0.92, 0.4, 0.42], { color: TAN, k: 0.1 }),
  ell([-0.78, 0.52, 0], [0.34, 0.38, 0.37], { color: TAN, k: 0.1 }),
  ell([0.0, 0.3, 0], [0.85, 0.26, 0.4], { color: BELLY, k: 0.1 }),
  ell([-0.04, 1.02, 0], [0.3, 0.36, 0.27], { color: TAN_D, k: 0.1 }),
  ell([0.76, 0.66, 0], [0.34, 0.44, 0.34], { color: TAN, k: 0.1 }),
  // le cou : trois cônes qui montent en S, et la tête
  cone([0.86, 0.78, 0], [1.12, 1.18, 0], 0.23, 0.16, { color: TAN, k: 0.1 }),
  cone([1.12, 1.18, 0], [1.1, 1.62, 0], 0.16, 0.12, { color: TAN, k: 0.08 }),
  cone([1.1, 1.62, 0], [1.28, 1.78, 0], 0.12, 0.115, { color: TAN, k: 0.06 }),
  ell([1.44, 1.8, 0], [0.2, 0.125, 0.105], { rot: [0, 0, -0.2], color: TAN, k: 0.05 }),
  ell([1.6, 1.74, 0], [0.13, 0.09, 0.085], { rot: [0, 0, -0.25], color: TAN, k: 0.04 }),
  ell([1.66, 1.67, 0], [0.095, 0.04, 0.07], { color: LIP, k: 0.03 }),
  ...pair(ell([1.46, 1.86, 0.1], [0.032, 0.03, 0.02], { color: EYE, k: 0.01 }), 'z'),
  ...pair(cone([1.3, 1.88, 0.07], [1.26, 1.99, 0.09], 0.036, 0.022, { color: TAN_D, k: 0.03 }), 'z'),
  // les pattes repliées : l'avant-bras couché sous la poitrine, le jarret couché sous la croupe, les callosités
  ...pair(cone([0.55, 0.14, 0.3], [1.12, 0.13, 0.28], 0.11, 0.085, { color: TAN_D, k: 0.06 }), 'z'),
  ...pair(cone([-0.6, 0.17, 0.3], [-0.05, 0.14, 0.3], 0.15, 0.1, { color: TAN_D, k: 0.06 }), 'z'),
  ell([0.85, 0.1, 0], [0.18, 0.07, 0.24], { color: CALLUS, k: 0.04 }),
  cone([-1.08, 0.7, 0], [-1.22, 0.18, 0], 0.05, 0.03, { color: TAN_D, k: 0.03 }),
]

/**
 * Le dromadaire accroupi au bord du campement, le bât (une couverture rayée, deux sacoches) sur sa bosse : une seule peau de blob, le
 * museau, l'œil, les oreilles, les callosités. `at` est le sol (x, z), `ry` le cap de la tête.
 */
export function KneelingCamel({ at, ry }: { at: [number, number]; ry: number }) {
  const geo = useMemo(() => blob(BODY, { h: 0.04, k: 0.08 }), [])
  const skinMat = useMemo(() => skin({ roughness: 0.9, clearcoat: 0 }), [])
  const [x, z] = at, y = groundY(x, z)
  const p: V3 = [x, y - 0.02, z]
  return (
    <group position={p} rotation-y={ry} scale={0.8}>
      <Static>
        <mesh geometry={geo} material={skinMat} castShadow receiveShadow />
        {/* la couverture rayée jetée sur la bosse (le dessus et les deux retombées), et la sangle */}
        <Part geo={rbox(0.5, 0.05, 0.4, 0.02)} m={O.blanket} p={[-0.04, 1.36, 0]} castShadow={false} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={rbox(0.5, 0.46, 0.04, 0.02)} m={O.blanket} p={[-0.04, 1.15, s * 0.265]} rotation-x={-s * 0.2} castShadow={false} />
            <Part geo={rbox(0.5, 0.07, 0.045, 0.02)} m={O.blanketIndigo} p={[-0.04, 0.95, s * 0.3]} rotation-x={-s * 0.2} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.31, 0.31, 0.06, 14)} m={O.rope} p={[0.4, 0.82, 0]} rotation-z={-0.1} castShadow={false} />
        {/* la longe qui pend du licol, posée sur le sable */}
        <Part geo={cyl(0.012, 0.012, 0.5, 5)} m={O.rope} p={[1.7, 1.45, 0.03]} rotation-z={0.15} castShadow={false} />
        <Part geo={SPH_LO} m={O.rope} scale={0.03} p={[1.72, 1.2, 0.03]} castShadow={false} />
      </Static>
    </group>
  )
}

/** Un dromadaire de loin (une caravane sur une crête) : un corps, la bosse, le cou et la tête, quatre pattes droites. Trois volumes de base, rien de plus. */
export function FarCamel({ p, ry = 0, s = 1 }: { p: V3; ry?: number; s?: number }) {
  return (
    <group position={p} rotation-y={ry} scale={s}>
      <Part geo={SPH_LO} m={O.camelFar} scale={[0.85, 0.36, 0.34]} p={[0, 1.35, 0]} castShadow={false} />
      <Part geo={SPH_LO} m={O.camelFar} scale={[0.26, 0.32, 0.24]} p={[-0.1, 1.72, 0]} castShadow={false} />
      <Part geo={cyl(0.1, 0.17, 0.85, 7)} m={O.camelFar} p={[0.95, 1.8, 0]} rotation-z={-0.35} castShadow={false} />
      <Part geo={SPH_LO} m={O.camelFar} scale={[0.22, 0.11, 0.1]} p={[1.28, 2.2, 0]} rotation-z={-0.25} castShadow={false} />
      {[[0.6, 0.2], [0.6, -0.2], [-0.6, 0.2], [-0.6, -0.2]].map(([x, z], i) => <Part key={i} geo={cyl(0.07, 0.05, 1.1, 6)} m={O.camelFar} p={[x, 0.55, z]} castShadow={false} />)}
    </group>
  )
}
