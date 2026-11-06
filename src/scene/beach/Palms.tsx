import { useMemo } from 'react'
import { seeded } from '../paint'
import { SPH_LO } from '../igloo/spheres'
import { Part } from './deco'
import { frondGeo, trunkGeo } from './shapes'
import { onGround } from './isle'
import { S } from './surroundMaterials'

interface PalmProps {
  /** Le pied, sur le sol (x, z). */
  at: [number, number]
  /** Hauteur du tronc. */
  h: number
  /** Penchée de combien en x, z au sommet. */
  lean: [number, number]
  /** Graine : l'ordre et la pente des palmes changent d'un arbre à l'autre. */
  seed?: number
  /** Taille des palmes (1 : 1,9 m). */
  size?: number
  fronds?: number
}

const MATS = [S.palmA, S.palmB, S.palmA, S.palmB]

/**
 * Un palmier : un tronc annelé qui penche, une couronne de palmes arquées (les hautes dressées, les basses retombantes), un régime
 * de noix de coco. Les palmes battent dans le vent (voir `sway`) ; pas d'ombre portée, pour ne pas assombrir la pièce.
 */
export function Palm({ at, h, lean, seed = 1, size = 1, fronds = 11 }: PalmProps) {
  const trunk = useMemo(() => trunkGeo(h, lean), [h, lean[0], lean[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  const list = useMemo(() => {
    const r = seeded(seed * 97 + 3)
    return Array.from({ length: fronds }, (_, i) => {
      const hi = i % 3 === 0
      return {
        yaw: (i / fronds) * Math.PI * 2 + (r() - 0.5) * 0.5,
        // les hautes se dressent, les autres s'étalent ou retombent
        pitch: hi ? 0.75 + r() * 0.35 : 0.15 - r() * 0.45 + (i % 3 === 1 ? 0.2 : 0),
        s: size * (1.6 + r() * 0.4) * (hi ? 0.9 : 1),
        m: MATS[(i + seed) % MATS.length],
      }
    })
  }, [seed, size, fronds])
  const base = onGround(at[0], at[1], -0.06)
  const top: [number, number, number] = [lean[0], h, lean[1]]
  return (
    <group position={base}>
      <Part geo={trunk} m={S.trunk} castShadow={false} />
      <group position={top}>
        {list.map((f, i) => (
          <group key={i} rotation-y={f.yaw}>
            <Part geo={frondGeo()} m={f.m} rotation-x={-f.pitch} scale={f.s} castShadow={false} />
          </group>
        ))}
        {/* le régime de noix de coco, sous la couronne */}
        {[0, 1].map((i) => (
          <Part key={i} geo={SPH_LO} m={S.pierPost} p={[Math.cos(i * 2.2) * 0.13, -0.16 - (i % 2) * 0.04, Math.sin(i * 2.2) * 0.13]} scale={0.1 * size} castShadow={false} />
        ))}
      </group>
    </group>
  )
}
