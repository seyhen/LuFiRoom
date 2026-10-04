import { TAU } from '../../math'
import { Part, SPH, cyl, rbox, worldUV } from '../parts'
import { holedWall } from '../walls'
import { S } from './materials'

/** Le hublot rond du mur du fond : centre et rayon (un trou rond percé dans l'épaisseur du mur). */
export const PORT = { x: 0.45, y: 2.45, r: 0.95 }

/** Un tuyau de cuivre le long d'un mur, tenu par des colliers de laiton. `axis` : sens du tuyau. */
function Pipe({ p, len, axis, r = 0.06 }: { p: [number, number, number]; len: number; axis: 'x' | 'z'; r?: number }) {
  const rot: [number, number, number] = axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]
  const n = Math.max(2, Math.round(len / 1.3))
  return (
    <group position={p}>
      <Part geo={cyl(r, r, len, 14)} m={S.copper} rotation={rot} castShadow={false} />
      {Array.from({ length: n }, (_, i) => {
        const o = -len / 2 + ((i + 0.5) * len) / n
        return <Part key={i} geo={cyl(r + 0.014, r + 0.014, 0.05, 14)} m={S.brass} p={axis === 'x' ? [o, 0, 0] : [0, 0, o]} rotation={rot} castShadow={false} />
      })}
    </group>
  )
}

/**
 * La coque : un plancher de tôle larmée, des murs de cuivre vert-de-gris rivetés sur un lambris d'acajou, des membrures
 * baguées de laiton, deux tuyaux de cuivre sous le plafond, et un grand hublot boulonné dans le mur du fond (l'abysse est
 * derrière, voir DeepView). Dessous, les ballasts, la quille et une rangée de petits hublots allumés.
 */
export function SubShell() {
  return (
    <>
      {/* le socle : une coque en acier, deux ballasts couchés dessous, une quille, des hublots de service */}
      <Part geo={rbox(6.86, 0.8, 6.86, 0.3)} m={S.hull} p={[-0.07, -0.45, -0.07]} />
      <Part geo={rbox(6.9, 0.07, 6.9, 0.03)} m={S.band} p={[-0.07, -0.1, -0.07]} castShadow={false} />
      <Part geo={rbox(6.9, 0.06, 6.9, 0.03)} m={S.band} p={[-0.07, -0.78, -0.07]} castShadow={false} />
      {[-1.7, 1.55].map((z) => (
        <group key={z}>
          <Part geo={cyl(0.62, 0.62, 5.4, 32)} m={S.verdigris} p={[-0.07, -1.2, z]} rotation={[0, 0, Math.PI / 2]} />
          {[-2.4, -0.9, 0.9, 2.4].map((x) => (
            <Part key={x} geo={cyl(0.64, 0.64, 0.12, 32)} m={S.band} p={[x, -1.2, z]} rotation={[0, 0, Math.PI / 2]} castShadow={false} />
          ))}
          <Part geo={SPH} m={S.verdigris} scale={[0.4, 0.62, 0.62]} p={[2.62, -1.2, z]} />
        </group>
      ))}
      <Part geo={rbox(5.0, 0.3, 0.7, 0.1)} m={S.hullDark} p={[-0.07, -1.7, -0.07]} />
      {/* de petits hublots de service allumés dans les flancs du socle : face avant (+z), face de droite (+x) */}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
        <group key={`z${x}`} position={[x, -0.45, 3.37]}>
          <Part m={S.brass} castShadow={false}>
            <torusGeometry args={[0.15, 0.035, 10, 24]} />
          </Part>
          <mesh>
            <circleGeometry args={[0.13, 20]} />
            <meshBasicMaterial color={0x7fe6d8} />
          </mesh>
        </group>
      ))}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((z) => (
        <group key={`x${z}`} position={[3.37, -0.45, z]} rotation-y={Math.PI / 2}>
          <Part m={S.brass} castShadow={false}>
            <torusGeometry args={[0.15, 0.035, 10, 24]} />
          </Part>
          <mesh>
            <circleGeometry args={[0.13, 20]} />
            <meshBasicMaterial color={0x7fe6d8} />
          </mesh>
        </group>
      ))}
      {/* le plancher */}
      <Part geo={worldUV(rbox(6.44, 0.1, 6.44, 0.03), 1.5)} m={S.deck} p={[-0.07, -0.05, -0.07]} />
      {/* mur du fond, percé du hublot ; mur de gauche plein, en tôles */}
      <Part geo={worldUV(holedWall([{ x0: PORT.x - PORT.r, x1: PORT.x + PORT.r, y0: PORT.y - PORT.r, y1: PORT.y + PORT.r, r: PORT.r }]), 2)} m={S.plates} p={[0, 0, -3.26]} />
      <Part geo={worldUV(rbox(0.34, 4.35, 6.54, 0.08), 2)} m={S.plates} p={[-3.17, 2.125, -0.07]} />
      {/* lambris d'acajou, filet de laiton en haut, plinthe */}
      <Part geo={worldUV(rbox(6.4, 1.15, 0.06, 0.02), 1)} m={S.wood} p={[-0.07, 0.6, -2.97]} castShadow={false} />
      <Part geo={worldUV(rbox(0.06, 1.15, 6.4, 0.02), 1)} m={S.wood} p={[-2.97, 0.6, -0.07]} castShadow={false} />
      <Part geo={rbox(6.44, 0.07, 0.09, 0.03)} m={S.brass} p={[-0.07, 1.2, -2.95]} castShadow={false} />
      <Part geo={rbox(0.09, 0.07, 6.44, 0.03)} m={S.brass} p={[-2.95, 1.2, -0.07]} castShadow={false} />
      <Part geo={rbox(6.44, 0.14, 0.09, 0.03)} m={S.woodDark} p={[-0.07, 0.07, -2.95]} castShadow={false} />
      <Part geo={rbox(0.09, 0.14, 6.44, 0.03)} m={S.woodDark} p={[-2.95, 0.07, -0.07]} castShadow={false} />
      {/* les membrures : montants baguées de laiton, entre les objets */}
      {[-0.82, 1.82, 2.95].map((x) => (
        <group key={`b${x}`} position={[x, 0, -2.96]}>
          <Part geo={rbox(0.16, 3.1, 0.08, 0.03)} m={S.hullDark} p={[0, 2.75, 0]} castShadow={false} />
          {[1.7, 2.6, 3.5].map((y) => (
            <Part key={y} geo={rbox(0.22, 0.06, 0.1, 0.02)} m={S.band} p={[0, y, 0.01]} castShadow={false} />
          ))}
        </group>
      ))}
      {[-1.65, 2.45].map((z) => (
        <group key={`l${z}`} position={[-2.96, 0, z]}>
          <Part geo={rbox(0.08, 3.1, 0.16, 0.03)} m={S.hullDark} p={[0, 2.75, 0]} castShadow={false} />
          {[1.7, 2.6, 3.5].map((y) => (
            <Part key={y} geo={rbox(0.1, 0.06, 0.22, 0.02)} m={S.band} p={[0.01, y, 0]} castShadow={false} />
          ))}
        </group>
      ))}
      {/* sous le plafond : une corniche de laiton, et deux tuyaux de cuivre qui courent le long des murs */}
      <Part geo={rbox(6.44, 0.14, 0.14, 0.04)} m={S.band} p={[-0.07, 4.22, -2.93]} castShadow={false} />
      <Part geo={rbox(0.14, 0.14, 6.44, 0.04)} m={S.band} p={[-2.93, 4.22, -0.07]} castShadow={false} />
      <Pipe p={[-0.07, 3.98, -2.86]} len={6.2} axis="x" />
      <Pipe p={[-0.07, 3.78, -2.86]} len={6.2} axis="x" r={0.045} />
      <Pipe p={[-2.86, 3.98, -0.07]} len={6.2} axis="z" />
      {/* une vanne sur le grand tuyau du fond, près de l'angle */}
      <group position={[-2.1, 3.98, -2.86]}>
        <Part geo={cyl(0.1, 0.1, 0.22, 16)} m={S.brass} />
        <Part geo={cyl(0.012, 0.012, 0.2, 6)} m={S.brassDull} p={[0, 0.2, 0]} castShadow={false} />
        <Part m={S.red} p={[0, 0.3, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.08, 0.013, 8, 20]} />
        </Part>
      </group>
      {/* le cadre du hublot : un épais anneau de laiton boulonné, scellé dans le mur */}
      <group position={[PORT.x, PORT.y, -3.0]}>
        <Part m={S.brass}>
          <torusGeometry args={[PORT.r + 0.04, 0.1, 14, 56]} />
        </Part>
        <Part m={S.copper} p={[0, 0, -0.03]} castShadow={false}>
          <torusGeometry args={[PORT.r + 0.2, 0.06, 12, 56]} />
        </Part>
        <Part m={S.brassDull} p={[0, 0, -0.04]} castShadow={false}>
          <torusGeometry args={[PORT.r - 0.06, 0.05, 10, 56]} />
        </Part>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * TAU + 0.1
          return <Part key={i} geo={SPH} m={S.brass} scale={[0.055, 0.055, 0.04]} p={[Math.cos(a) * (PORT.r + 0.2), Math.sin(a) * (PORT.r + 0.2), 0.05]} castShadow={false} />
        })}
      </group>
    </>
  )
}
