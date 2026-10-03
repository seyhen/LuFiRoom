import { TAU } from '../../math'
import { M } from '../materials'
import { Batch, Part, SPH, cyl, type Item } from '../parts'
import { C } from './materials'

// Sur le coffre, à gauche de la radio.
const P = [1.36, 0.71, -2.62] as const

// Une feuille allongée qui part du centre vers l'angle `a`, relevée (`up` > 0) ou retombante.
const leaf = (a: number, r: number, y: number, len: number, up: number, c: number): Item => ({
  p: [P[0] + Math.cos(a) * r, P[1] + y, P[2] + Math.sin(a) * r],
  s: [len, 0.025, len * 0.5],
  r: [0, -a, up],
  c,
})
const PLANT: Item[] = [
  ...Array.from({ length: 5 }, (_, i) => leaf((i / 5) * TAU + 0.3, 0.13, 0.25, 0.12, -0.15, 0x3f9474)),
  ...Array.from({ length: 6 }, (_, i) => leaf((i / 6) * TAU, 0.1, 0.3, 0.11, 0.22, 0xd9506a)),
  ...Array.from({ length: 4 }, (_, i) => leaf((i / 4) * TAU + 0.5, 0.06, 0.33, 0.07, 0.35, 0xe7707f)),
  ...[[0.015, 0], [-0.012, 0.015], [0, -0.016]].map(([x, z]): Item => ({ p: [P[0] + x, P[1] + 0.355, P[2] + z], s: 0.018, c: 0xf6d071 })),
]

/** Étoile de Noël (poinsettia) en pot : bractées rouges, feuilles vertes, petites fleurs jaunes. */
export function Poinsettia() {
  return (
    <>
      <Part geo={cyl(0.12, 0.09, 0.2, 20)} m={M.terracotta} p={[P[0], P[1] + 0.1, P[2]]} />
      <mesh geometry={cyl(0.11, 0.11, 0.01, 20)} material={C.soot} position={[P[0], P[1] + 0.2, P[2]]} />
      <Batch geo={SPH} m={C.tint} items={PLANT} />
    </>
  )
}
