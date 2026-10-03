import { Batch, Part, SPH, cyl, rbox, worldUV, type Item } from '../parts'
import { C } from './materials'

// Sur le mur de gauche (face à x = -2.99), entre la cheminée et le sapin. Dans ce repère, x va vers la pièce.
const PEGS = [-0.45, 0, 0.45]
const WOOD: Item[] = PEGS.map((z) => ({ p: [0.11, -0.01, z], s: [0.025, 0.13, 0.025], r: [0, 0, Math.PI / 2] }))
// Bouts des patères, bonnet (calotte et pompon, penchés de 0.15), moufles (main et pouce) et leurs revers.
const HAT = [0.15, -0.16, 0] as const, TILT = 0.15
const MITTENS = [[0.38, -0.2, 0.12], [0.52, -0.25, -0.1]]
const SOFT: Item[] = [
  ...PEGS.map((z): Item => ({ p: [0.18, -0.01, z], s: 0.035, c: 0x9a6244 })),
  { p: [...HAT], s: [0.12, 0.15, 0.14], r: [TILT, 0, 0], c: 0xd25c72 },
  { p: [HAT[0], HAT[1] + 0.16 * Math.cos(TILT), HAT[2] + 0.16 * Math.sin(TILT)], s: 0.065, c: 0xfff6ea },
  ...MITTENS.flatMap(([z, y, r]): Item[] => [
    { p: [0.12, y, z], s: [0.04, 0.09, 0.065], r: [r, 0, 0], c: 0x6db492 },
    { p: [0.12, y - 0.06 * Math.sin(r), z + 0.06 * Math.cos(r)], s: [0.03, 0.04, 0.025], r: [r, 0, 0], c: 0x6db492 },
  ]),
]
const CUFFS: Item[] = MITTENS.map(([z, y, r]) => ({ p: [0.12, y + 0.085 * Math.cos(r), z + 0.085 * Math.sin(r)], s: [0.05, 0.035, 0.11], r: [r, 0, 0] }))

/** Patères en bois : écharpe écossaise, bonnet à pompon, moufles. On vient de rentrer du froid. */
export function CoatPegs() {
  return (
    <group position={[-2.99, 2.35, -0.3]}>
      <Part geo={rbox(0.05, 0.13, 1.25, 0.025)} m={C.beam} p={[0.03, 0, 0]} />
      <Batch geo={cyl(1, 1, 1, 10)} m={C.log} items={WOOD} />
      <Batch geo={SPH} m={C.tint} items={SOFT} />
      <Batch geo={rbox(1, 1, 1, 0.3)} m={C.wool} items={CUFFS} />
      {/* écharpe : passée sur la patère, deux pans qui tombent */}
      <Part geo={worldUV(rbox(0.07, 0.07, 0.3, 0.03), 0.5)} m={C.tartan} p={[0.12, 0.02, -0.45]} castShadow={false} />
      <Part geo={worldUV(rbox(0.035, 0.7, 0.13, 0.015), 0.5)} m={C.tartan} p={[0.1, -0.33, -0.53]} rotation-x={0.05} />
      <Part geo={worldUV(rbox(0.035, 0.56, 0.13, 0.015), 0.5)} m={C.tartan} p={[0.12, -0.27, -0.38]} rotation-x={-0.06} />
      {/* revers en tricot du bonnet */}
      <Part
        geo={worldUV(cyl(0.135, 0.135, 0.07, 24), 0.4)}
        m={C.knit}
        p={[HAT[0], HAT[1] - 0.08 * Math.cos(TILT), HAT[2] - 0.08 * Math.sin(TILT)]}
        rotation-x={TILT}
        castShadow={false}
      />
    </group>
  )
}
