import { ExtrudeGeometry, Shape } from 'three'
import { TAU } from '../../math'
import { Part } from '../parts'
import { B } from './materials'
import { RUG, rugR } from './textures'

const shape = new Shape()
for (let i = 0; i <= 120; i++) {
  const t = (i / 120) * TAU, r = rugR(t)
  const x = Math.cos(t) * RUG.a * r, y = Math.sin(t) * RUG.b * r
  i ? shape.lineTo(x, y) : shape.moveTo(x, y)
}
const geo = new ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 3, curveSegments: 1 })

/** Tapis nuage au pied du lit : un galet crème bordé de menthe et de lilas, semé de gouttes de pluie. */
export function Rug() {
  return <Part geo={geo} m={[B.rug, B.rugEdge]} p={[0.2, 0.02, 1.05]} rotation-x={-Math.PI / 2} castShadow={false} />
}
