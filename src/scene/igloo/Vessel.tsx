import type { Material } from 'three'
import { Part, cyl, type V3 } from '../parts'

/**
 * Un récipient ouvert (quart, casserole, seau, boîte) : la paroi dehors, la paroi dedans (son matériau `inner`, en BackSide ou
 * DoubleSide), le fond et un bourrelet au bord. Ce qu'il contient se pose dedans, sous `h` : on le voit, rien ne le couvre.
 * `p` est le pied du récipient.
 */
export function Vessel({ p, rt, rb, h, m, inner, rim = m, t = 0.006 }: { p: V3; rt: number; rb: number; h: number; m: Material; inner: Material; rim?: Material; t?: number }) {
  return (
    <group position={p}>
      <Part m={m} p={[0, h / 2, 0]}>
        <cylinderGeometry args={[rt, rb, h, 28, 1, true]} />
      </Part>
      <Part m={inner} p={[0, h / 2, 0]} castShadow={false}>
        <cylinderGeometry args={[rt - t, rb - t, h, 28, 1, true]} />
      </Part>
      <Part geo={cyl(rb, rb, t * 1.5, 28)} m={m} p={[0, t * 0.75, 0]} />
      <Part m={rim} p={[0, h, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[rt - t / 2, t * 0.75, 8, 28]} />
      </Part>
    </group>
  )
}

/** Le rayon intérieur d'un récipient de `Vessel` à la hauteur `y` (pour poser un liquide dedans sans traverser la paroi). */
export const innerR = (rt: number, rb: number, h: number, y: number, t = 0.006) => rb + (rt - rb) * (y / h) - t - 0.002
