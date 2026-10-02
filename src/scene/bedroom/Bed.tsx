import { ExtrudeGeometry, Shape } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox, worldUV } from '../parts'
import { B } from './materials'

const LEGS = [[-2.85, -1.82], [-2.85, 0.42], [-0.35, -1.82], [-0.35, 0.42]]
// Les bosses du nuage qui sert de tête de lit : z, hauteur du centre, rayon sur z, rayon sur y.
const PUFFS = [[-1.8, 0.95, 0.34, 0.32], [-1.27, 1.08, 0.4, 0.38], [-0.7, 1.18, 0.46, 0.44], [-0.13, 1.08, 0.4, 0.38], [0.4, 0.95, 0.34, 0.32]]

// Croissant de lune en peluche : un grand disque moins un petit, décalé.
const moon = (() => {
  const R = 0.27, r = 0.23, d = 0.1
  const x0 = (d * d + R * R - r * r) / (2 * d), y0 = Math.sqrt(R * R - x0 * x0)
  const a = Math.atan2(y0, x0), b = Math.atan2(y0, x0 - d)
  const s = new Shape()
  s.absarc(0, 0, R, a, TAU - a, false)
  s.absarc(d, 0, r, TAU - b, b, true)
  return new ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4, curveSegments: 18 })
})()

/** Lit : cadre en bois clair, matelas, tête de lit nuage, couette matelassée, oreillers, plaid tricoté et lune en peluche. */
export function Bed() {
  return (
    <>
      <Part geo={rbox(2.75, 0.3, 2.5, 0.1)} m={M.woodLight} p={[-1.6, 0.27, -0.7]} />
      {LEGS.map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.06, 0.05, 0.16, 14)} m={M.woodLeg} p={[x, 0.08, z]} />
      ))}
      <Part geo={rbox(2.62, 0.32, 2.36, 0.13)} m={M.cream} p={[-1.6, 0.58, -0.7]} />
      {/* tête de lit : un nuage */}
      <Part geo={rbox(0.26, 0.75, 2.5, 0.08)} m={B.cloud} p={[-2.86, 0.85, -0.7]} />
      {PUFFS.map(([z, y, rz, ry], i) => (
        <Part key={i} geo={SPH} m={B.cloud} scale={[0.13, ry, rz]} p={[-2.86, y, z]} />
      ))}
      {/* couette matelassée et son revers rose */}
      <Part geo={worldUV(rbox(1.86, 0.2, 2.46, 0.1), 1.8)} m={B.quilt} p={[-1.12, 0.8, -0.7]} />
      <Part geo={rbox(0.32, 0.22, 2.47, 0.1)} m={B.blush} p={[-2.05, 0.82, -0.7]} />
      {/* deux gros oreillers carrés contre le nuage, deux oreillers devant */}
      <Part geo={rbox(0.32, 0.7, 0.96, 0.14)} m={B.lilac} p={[-2.62, 1.1, -1.25]} rotation-z={0.1} />
      <Part geo={rbox(0.32, 0.7, 0.96, 0.14)} m={B.blush} p={[-2.62, 1.1, -0.15]} rotation-z={0.1} />
      {[-1.28, -0.12].map((z, i) => (
        <Part key={z} geo={rbox(0.5, 0.26, 0.98, 0.12)} m={M.pillow} p={[-2.25, 0.9, z]} rotation={[0, i ? 0.06 : -0.05, 0.18]} />
      ))}
      <Part geo={moon} m={M.butter} p={[-2.0, 1.0, -0.55]} rotation={[0, Math.PI / 2 + 0.15, 0.5]} />
      {/* plaid tricoté jeté au pied du lit */}
      <Part geo={rbox(0.5, 0.1, 2.52, 0.05)} m={B.knitBlush} p={[-0.52, 0.95, -0.7]} />
      <Part geo={rbox(0.1, 0.42, 2.5, 0.05)} m={B.knitBlush} p={[-0.2, 0.7, -0.7]} />
    </>
  )
}
