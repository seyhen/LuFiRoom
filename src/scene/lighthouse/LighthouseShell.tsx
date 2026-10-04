import { TAU } from '../../math'
import { Part, SPH, cyl, rbox, worldUV } from '../parts'
import { holedWall } from '../walls'
import { Rock } from '../nature/Rock'
import { L } from './materials'

/** Le hublot rond du mur du fond : centre et rayon (c'est un trou rond, percé dans l'épaisseur du mur). */
export const PORT = { x: 1.35, y: 2.55, r: 0.85 }

// L'îlot sous la pièce : des assises de roche qui s'étrécissent vers le bas, comme une aiguille battue par la mer, puis quelques
// blocs au pied du mur. [x, y (le bas), z, demi-largeur, hauteur, rotation, forme, teinte].
const ISLAND: [number, number, number, number, number, number, number, number][] = [
  [-0.07, -1.45, -0.07, 3.45, 0.72, 0.4, 1, 0], [0.1, -2.15, 0, 2.7, 0.8, 1.9, 4, 1], [-0.1, -2.9, 0.05, 1.8, 0.85, 3.3, 6, 2], [0.1, -3.55, 0, 1.0, 0.75, 0.8, 3, 1],
  [3.2, -1.35, 2.5, 0.75, 0.62, 0.3, 5, 2], [-3.1, -1.3, 2.9, 0.65, 0.55, 2.2, 2, 0], [0.8, -1.3, 3.3, 0.7, 0.5, 1.1, 7, 1],
]

/**
 * La pièce du gardien, au sommet de l'îlot : un socle de roche, un plancher de chêne grisé, des murs d'enduit blanc cassé
 * sur un lambris bleu marine, et un grand hublot de laiton dans le mur du fond (la mer est derrière, voir SeaView).
 */
export function LighthouseShell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={L.rock} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={L.rockDark} p={[-0.07, -0.12, -0.07]} />
      {ISLAND.map(([x, y, z, w, h, ry, v, m], i) => (
        <Rock key={i} v={v} p={[x, y, z]} s={[w, h, w * 0.9]} ry={ry} m={L.boulder[m]} moss={i > 3 || i === 0 ? L.weed : undefined} />
      ))}
      <mesh material={L.floor} position={[-0.07, 0.002, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.44, 6.44]} />
      </mesh>
      {/* mur du fond, percé du hublot ; mur de gauche plein */}
      <Part geo={holedWall([{ x0: PORT.x - PORT.r, x1: PORT.x + PORT.r, y0: PORT.y - PORT.r, y1: PORT.y + PORT.r, r: PORT.r }])} m={L.plaster} p={[0, 0, -3.26]} />
      <Part geo={worldUV(rbox(0.34, 4.35, 6.54, 0.08), 1)} m={L.plaster} p={[-3.17, 2.125, -0.07]} />
      {/* lambris bleu marine, filet crème et plinthe */}
      <Part geo={worldUV(rbox(6.4, 1.3, 0.06, 0.02), 1)} m={L.wainscot} p={[-0.07, 0.68, -2.97]} castShadow={false} />
      <Part geo={worldUV(rbox(0.06, 1.3, 6.4, 0.02), 1)} m={L.wainscot} p={[-2.97, 0.68, -0.07]} castShadow={false} />
      <Part geo={rbox(6.44, 0.08, 0.1, 0.03)} m={L.cream} p={[-0.07, 1.36, -2.95]} castShadow={false} />
      <Part geo={rbox(0.1, 0.08, 6.44, 0.03)} m={L.cream} p={[-2.95, 1.36, -0.07]} castShadow={false} />
      <Part geo={rbox(6.44, 0.16, 0.09, 0.03)} m={L.navyDark} p={[-0.07, 0.08, -2.95]} castShadow={false} />
      <Part geo={rbox(0.09, 0.16, 6.44, 0.03)} m={L.navyDark} p={[-2.95, 0.08, -0.07]} castShadow={false} />
      {/* le cadre du hublot : un épais anneau de laiton boulonné, scellé dans le mur */}
      <group position={[PORT.x, PORT.y, -3.0]}>
        <Part m={L.brass}>
          <torusGeometry args={[PORT.r + 0.03, 0.075, 12, 48]} />
        </Part>
        <Part m={L.brassDull} p={[0, 0, -0.04]} castShadow={false}>
          <torusGeometry args={[PORT.r - 0.05, 0.04, 10, 48]} />
        </Part>
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * TAU
          return <Part key={i} geo={SPH} m={L.brassDull} scale={[0.04, 0.04, 0.03]} p={[Math.cos(a) * (PORT.r + 0.03), Math.sin(a) * (PORT.r + 0.03), 0.07]} castShadow={false} />
        })}
        {/* la charnière, à gauche */}
        {[-0.34, 0.34].map((dy) => (
          <Part key={dy} geo={rbox(0.12, 0.2, 0.1, 0.03)} m={L.brass} p={[-PORT.r - 0.06, dy, 0.03]} castShadow={false} />
        ))}
        <Part geo={cyl(0.02, 0.02, 0.9, 8)} m={L.brassDull} p={[-PORT.r - 0.11, 0, 0.04]} castShadow={false} />
      </group>
    </>
  )
}
