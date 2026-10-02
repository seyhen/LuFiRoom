import { Batch, SPH, rbox, type Item, type V3 } from '../parts'
import { C } from './materials'

interface Gift {
  x: number
  z: number
  /** Posé sur un autre paquet. */
  y?: number
  w: number
  h: number
  d: number
  /** Rotation autour de la verticale. */
  r: number
  paper: number
  ribbon: number
}
// Au pied du sapin, du côté de la pièce : sous le bord des branches (à 0.4 du sol).
const GIFTS: Gift[] = [
  { x: -1.12, z: 1.45, w: 0.44, h: 0.34, d: 0.44, r: 0.35, paper: 0xd9506a, ribbon: 0xfff3dc },
  { x: -1.0, z: 2.22, w: 0.52, h: 0.27, d: 0.38, r: -0.25, paper: 0x7fbf9e, ribbon: 0xd9506a },
  { x: -1.02, z: 2.2, y: 0.27, w: 0.26, h: 0.22, d: 0.26, r: 0.45, paper: 0xf6d071, ribbon: 0xd9506a },
  { x: -1.62, z: 2.78, w: 0.34, h: 0.3, d: 0.34, r: 0.12, paper: 0x4fb0bf, ribbon: 0xf6d071 },
  { x: -2.7, z: 2.9, w: 0.3, h: 0.22, d: 0.26, r: -0.4, paper: 0xfff4e6, ribbon: 0xd9506a },
]

const boxes: Item[] = [], bows: Item[] = []
for (const { x, z, y = 0, w, h, d, r, paper, ribbon } of GIFTS) {
  const at = (ox: number, oy: number, oz: number): V3 => [x + ox * Math.cos(r) + oz * Math.sin(r), y + oy, z - ox * Math.sin(r) + oz * Math.cos(r)]
  boxes.push(
    { p: at(0, h / 2, 0), s: [w, h, d], r: [0, r, 0], c: paper },
    { p: at(0, h / 2, 0), s: [w + 0.012, h + 0.012, 0.075], r: [0, r, 0], c: ribbon },
    { p: at(0, h / 2, 0), s: [0.075, h + 0.012, d + 0.012], r: [0, r, 0], c: ribbon },
  )
  for (const s of [-1, 1]) bows.push({ p: at(s * 0.07, h + 0.035, 0), s: [0.085, 0.055, 0.04], r: [0, r, s * 0.5], c: ribbon })
  bows.push({ p: at(0, h + 0.03, 0), s: 0.035, c: ribbon })
}

/** Paquets au pied du sapin : papier, ruban croisé, nœud. Deux tracés pour tous les paquets. */
export function Gifts() {
  return (
    <>
      <Batch geo={rbox(1, 1, 1, 0.12)} m={C.paper} items={boxes} shadow />
      <Batch geo={SPH} m={C.paper} items={bows} />
    </>
  )
}
