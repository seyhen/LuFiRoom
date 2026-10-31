import { TAU } from '../../math'
import { M } from '../materials'
import { Batch, Part, SPH, cyl, type Item } from '../parts'
import { Vessel, innerR } from '../igloo/Vessel'
import { C } from './materials'

// Par terre, entre le panier à bûches et le coffre (le tourne-disque prend tout le dessus du coffre) : un grand pot, à l'échelle
// SCALE. Les feuilles sont décrites autour du pied du pot (P = l'origine du groupe).
const AT = [0.62, 0, -2.62] as const, SCALE = 1.55
const P = [0, 0, 0] as const
const H = 0.2, SOIL = 0.17

// Une feuille allongée qui part du centre vers l'angle `a`, relevée (`up` > 0) ou retombante.
const leaf = (a: number, r: number, y: number, len: number, up: number, c: number): Item => ({
  p: [P[0] + Math.cos(a) * r, P[1] + y, P[2] + Math.sin(a) * r],
  s: [len, 0.025, len * 0.5],
  r: [0, -a, up],
  c,
})
const PLANT: Item[] = [
  // les tiges, qui sortent de la terre
  ...[[0.03, 0.02, 0.2], [-0.035, 0.01, -0.25], [0.0, -0.035, 0.05], [0.01, 0.04, -0.1]].map(([x, z, t]): Item => ({ p: [x, 0.24, z], s: [0.012, 0.075, 0.012], r: [t, 0, -t], c: 0x2f7a5c })),
  ...Array.from({ length: 5 }, (_, i) => leaf((i / 5) * TAU + 0.3, 0.13, 0.25, 0.12, -0.15, 0x3f9474)),
  ...Array.from({ length: 6 }, (_, i) => leaf((i / 6) * TAU, 0.1, 0.3, 0.11, 0.22, 0xd9506a)),
  ...Array.from({ length: 4 }, (_, i) => leaf((i / 4) * TAU + 0.5, 0.06, 0.33, 0.07, 0.35, 0xe7707f)),
  ...[[0.015, 0], [-0.012, 0.015], [0, -0.016]].map(([x, z]): Item => ({ p: [P[0] + x, P[1] + 0.355, P[2] + z], s: 0.018, c: 0xf6d071 })),
]

/** Étoile de Noël (poinsettia) dans un pot ouvert, ceint d'un ruban canneberge, sur une soucoupe : bractées rouges, feuilles vertes, petites fleurs jaunes. */
export function Poinsettia() {
  const r = innerR(0.12, 0.09, H, SOIL, 0.01)
  return (
    <group position={AT as unknown as [number, number, number]} scale={SCALE}>
      <Part geo={cyl(0.13, 0.11, 0.016, 24)} m={M.terracotta} p={[0, 0.008, 0]} />
      <Vessel p={[0, 0.016, 0]} rt={0.12} rb={0.09} h={H} m={M.terracotta} inner={C.potInner} t={0.01} />
      <Part m={C.cranberry} p={[0, 0.016 + H * 0.62, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.112, 0.012, 6, 28]} />
      </Part>
      <Part geo={SPH} m={C.cranberry} scale={[0.03, 0.022, 0.016]} p={[0.08, 0.016 + H * 0.62, 0.08]} rotation-y={-Math.PI / 4} castShadow={false} />
      <Part geo={cyl(r, r, 0.012, 24)} m={C.soot} p={[0, 0.016 + SOIL, 0]} castShadow={false} />
      <Batch geo={SPH} m={C.tint} items={PLANT} shadow />
    </group>
  )
}
