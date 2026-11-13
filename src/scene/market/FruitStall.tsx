import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type Group, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, clamp, smooth } from '../../math'
import { gummy } from '../materials'
import { Batch, Part, SPH, SPH_MID, cyl, noRay, rbox, type Item } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { K } from './materials'

/** L'étal de fruits du marchand, devant la carriole : son pied au sol. */
export const STALL = { x: 1.1, z: 2.0, top: 0.66 }
const fruit = gummy(0xffffff, { roughness: 0.35, clearcoat: 0.8 })
const bead = gummy(0xffffff, { roughness: 0.4, clearcoat: 0.7 })
// le soroban : sept tiges verticales, une boule du ciel (5) au-dessus de la barre et quatre boules de terre (1) dessous
const RODS = 7, BEADS = 5
const ROD_X = (r: number) => (r - 3) * 0.06
const BEAM = 0.04 // hauteur de la barre de compte
const STEP = 0.0235 // l'écart entre deux boules
const HEAVEN = { rest: 0.117, active: 0.063 }
const EARTH_ACTIVE = 0.017 // la boule de terre voisine de la barre, quand elle est remontée
const EARTH_REST = -0.0465 // et au repos, tout en bas
const colorOf = (i: number) => (i === 0 ? 0xd6334f : 0xf0e2bc)

// les fruits : mandarines (aplaties, une feuille), pommes rouges (une fossette et une queue), poires (un ventre, un col, une queue),
// dans deux cagettes. Chaque sorte a sa silhouette : on les reconnaît sans lire la couleur.
const CRATES = [0.12, 0.35]
const KINDS = ['mandarin', 'apple', 'mandarin', 'pear'] as const
const SLOTS = CRATES.flatMap((x0, crate) =>
  Array.from({ length: 8 }, (_, i) => ({ x: x0 + ((i % 2) - 0.5) * 0.09, y: STALL.top + 0.1 + (i % 3) * 0.004, z: -0.105 + (i >> 1) * 0.07, kind: KINDS[(i + crate * 2) % 4], i })),
)
const FRUITS: Item[] = SLOTS.flatMap(({ x, y, z, kind }) =>
  kind === 'mandarin'
    ? [{ p: [x, y, z], s: [0.038, 0.03, 0.038], c: 0xf2902f }]
    : kind === 'apple'
      ? [{ p: [x, y + 0.002, z], s: [0.037, 0.033, 0.037], c: 0xd6334f }]
      : [{ p: [x, y - 0.004, z], s: [0.034, 0.03, 0.034], c: 0xa7c850 }, { p: [x + 0.004, y + 0.028, z], s: [0.021, 0.026, 0.021], c: 0xb2cf5a }],
) as Item[]
// les queues (bois) et les feuilles des mandarines
const STEMS: Item[] = SLOTS.filter((f) => f.kind !== 'mandarin').map(({ x, y, z, kind, i }) => ({ p: [x + (kind === 'pear' ? 0.006 : 0), y + (kind === 'pear' ? 0.06 : 0.036), z], s: [0.006, 0.02, 0.006], r: [0.2 * ((i % 3) - 1), 0, 0.3], c: 0x6a4024 })) as Item[]
const LEAVES: Item[] = SLOTS.filter((f) => f.kind === 'mandarin').map(({ x, y, z, i }) => ({ p: [x + 0.008, y + 0.031, z + 0.004], s: [0.018, 0.005, 0.009], r: [0, i, 0.25], c: 0x4f9a46 })) as Item[]
const DETAILS = [...FRUITS, ...STEMS, ...LEAVES]

/**
 * L'étal de fruits : un petit comptoir de bois, deux cagettes de mandarines, de pommes et de poires, et le soroban du marchand,
 * appuyé contre un tasseau. Quand le son joue, les boules glissent d'un côté à l'autre des tiges, l'une après l'autre, comme
 * pour un compte qu'on refait ; au repos, elles restent là où elles sont.
 */
export function FruitStall() {
  const g = useRef<Group>(null!), beads = useRef<InstancedMesh>(null!), st = useRef({ k: 0, ph: 0 })
  useSquash('abacus', g)
  useLayoutEffect(() => {
    const c = new Color()
    for (let r = 0; r < RODS; r++) for (let i = 0; i < BEADS; i++) beads.current.setColorAt(r * BEADS + i, c.setHex(colorOf(i)))
    if (beads.current.instanceColor) beads.current.instanceColor.needsUpdate = true
  }, [])
  const dummy = useRef(new Object3D())
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'abacus')
    s.k = approach(s.k, on ? 1 : 0, dt * 2)
    if (!reduceMotion) s.ph += dt * 0.9 * s.k // la phase s'ajoute image après image
    const d = dummy.current
    for (let r = 0; r < RODS; r++) {
      // la boule du ciel descend vers la barre, les boules de terre y montent l'une après l'autre : un compte qu'on refait, décalé d'une tige à l'autre
      const h = smooth(clamp(Math.sin(s.ph * 0.55 + r * 2.1) * 1.6 + 0.4, 0, 1))
      const e = (Math.sin(s.ph * 0.9 + r * 1.35) * 0.5 + 0.5) * (BEADS - 1 + 0.4)
      for (let i = 0; i < BEADS; i++) {
        const y = i === 0
          ? HEAVEN.rest + (HEAVEN.active - HEAVEN.rest) * h
          : EARTH_REST - (i - 1) * STEP + (EARTH_ACTIVE - EARTH_REST) * smooth(clamp(e - (i - 1), 0, 1))
        d.position.set(ROD_X(r), y, 0)
        d.scale.set(0.0235, 0.0125, 0.0235)
        d.updateMatrix()
        beads.current.setMatrixAt(r * BEADS + i, d.matrix)
      }
    }
    beads.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={g} userData={{ id: 'abacus' }} position={[STALL.x, 0, STALL.z]} rotation-y={0.25}>
      <Static>
        {/* le comptoir : un plateau de bois, quatre pieds, une étagère basse */}
        <Part geo={rbox(1.035, 0.05, 0.5, 0.02)} m={K.wood} p={[-0.0425, STALL.top - 0.025, 0]} />
        {[[-0.485, -0.2], [0.395, -0.2], [-0.485, 0.2], [0.395, 0.2]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={rbox(0.05, STALL.top - 0.05, 0.05, 0.015)} m={K.woodDark} p={[x, (STALL.top - 0.05) / 2, z]} />
        ))}
        <Part geo={rbox(0.935, 0.03, 0.42, 0.012)} m={K.woodDark} p={[-0.0425, 0.2, 0]} castShadow={false} />
        {/* deux cagettes de bois clair, sur la moitié droite */}
        {CRATES.map((x, i) => (
          <group key={i} position={[x, STALL.top, 0.0]}>
            <Part geo={rbox(0.22, 0.09, 0.3, 0.01)} m={K.woodPale} p={[0, 0.045, 0]} />
            <Part geo={rbox(0.2, 0.012, 0.28, 0.005)} m={K.woodDark} p={[0, 0.088, 0]} castShadow={false} />
          </group>
        ))}
        {/* le soroban : un cadre de bois sombre, un fond, une barre claire à trois points de laiton, des tiges de laiton ; il repose dans une lisse */}
        <Part geo={rbox(0.55, 0.04, 0.04, 0.012)} m={K.woodDark} p={[-0.27, STALL.top + 0.02, 0.025]} />
        <group position={[-0.27, STALL.top + 0.175, -0.05]} rotation-x={-0.2}>
          {[-1, 1].map((s) => (
            <Part key={s} geo={rbox(0.04, 0.34, 0.05, 0.014)} m={K.woodDark} p={[s * 0.25, 0, 0]} />
          ))}
          {[-1, 1].map((s) => (
            <Part key={s} geo={rbox(0.54, 0.04, 0.05, 0.014)} m={K.woodDark} p={[0, s * 0.15, 0]} />
          ))}
          <Part geo={rbox(0.47, 0.27, 0.012, 0.004)} m={K.woodDark} p={[0, 0, -0.014]} castShadow={false} />
          <Part geo={rbox(0.47, 0.022, 0.032, 0.006)} m={K.woodPale} p={[0, BEAM, 0]} />
          {[-3, 0, 3].map((r) => (
            <Part key={r} geo={SPH} m={K.brass} scale={0.0065} p={[ROD_X(r + 3), BEAM, 0.0165]} castShadow={false} />
          ))}
          {Array.from({ length: RODS }, (_, r) => (
            <Part key={r} geo={cyl(0.0035, 0.0035, 0.27, 6)} m={K.brass} p={[ROD_X(r), 0, 0]} castShadow={false} />
          ))}
        </group>
        {/* le carnet de comptes, ouvert devant, et le pinceau qui y est posé */}
        <group position={[-0.27, STALL.top, 0.155]} rotation-y={0.15}>
          <Part geo={rbox(0.22, 0.016, 0.15, 0.006)} m={K.woodDark} p={[0, 0.008, 0]} />
          <Part geo={rbox(0.095, 0.01, 0.13, 0.003)} m={K.woodPale} p={[-0.051, 0.019, 0]} />
          <Part geo={rbox(0.095, 0.01, 0.13, 0.003)} m={K.woodPale} p={[0.051, 0.019, 0]} />
          {[-0.03, 0, 0.03].map((z) => (
            <Part key={z} geo={rbox(0.07, 0.002, 0.004, 0.001)} m={K.woodDark} p={[0.051, 0.0245, z]} castShadow={false} />
          ))}
          <Part geo={cyl(0.005, 0.005, 0.17, 8)} m={K.woodDark} p={[0.0, 0.03, 0.02]} rotation-z={Math.PI / 2} rotation-y={0.4} castShadow={false} />
          <Part geo={cyl(0.0035, 0.007, 0.03, 8)} m={K.brass} p={[0.092, 0.03, -0.019]} rotation-z={-Math.PI / 2} rotation-y={0.4} castShadow={false} />
        </group>
      </Static>
      {/* les fruits des cagettes, en un seul tracé */}
      <Batch geo={SPH} m={fruit} items={DETAILS} />
      {/* les boules du soroban : un seul tracé, repositionnées à chaque image */}
      <group position={[-0.27, STALL.top + 0.175, -0.05]} rotation-x={-0.2}>
        <instancedMesh ref={beads} args={[SPH_MID, bead, RODS * BEADS]} raycast={noRay} castShadow />
      </group>
    </group>
  )
}
