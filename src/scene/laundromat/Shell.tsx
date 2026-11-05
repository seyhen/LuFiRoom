import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { Part, cyl, noRay, rbox, worldUV } from '../parts'
import { holedWall } from '../walls'
import { L } from './materials'

/** La vitrine sur la rue (mur du fond), la porte vitrée à sa droite : leurs ouvertures, dans le repère de la pièce. */
export const VITRINE = { x0: -1.45, x1: 0.95, y0: 0.55, y1: 3.35 }
export const DOOR = { x0: 1.25, x1: 2.25, y0: 0, y1: 3.35 }
/** Le dessus de la faïence, à hauteur d'épaule. */
export const DADO = 1.25
const IN = -3.0 // la face intérieure des murs (mur du fond en z, mur de gauche en x)

/** Un rang de faïence posé sur un mur : une plaque mince aux UV du monde, sa baguette d'angle arrondie. */
function Dado({ x0, x1, h = DADO, side }: { x0: number; x1: number; h?: number; side: 'back' | 'left' }) {
  const l = x1 - x0, c = (x0 + x1) / 2
  return side === 'back' ? (
    <>
      <Part geo={worldUV(rbox(l, h, 0.02, 0.008), 0.8)} m={L.tile} p={[c, h / 2, IN + 0.01]} castShadow={false} />
      <Part geo={rbox(l, 0.05, 0.05, 0.022)} m={L.tileTrim} p={[c, h, IN + 0.025]} castShadow={false} />
    </>
  ) : (
    <>
      <Part geo={worldUV(rbox(0.02, h, l, 0.008), 0.8)} m={L.tile} p={[IN + 0.01, h / 2, c]} castShadow={false} />
      <Part geo={rbox(0.05, 0.05, l, 0.022)} m={L.tileTrim} p={[IN + 0.025, h, c]} castShadow={false} />
    </>
  )
}

/**
 * Un néon tubulaire : la réglette d'acier laqué, le tube blanc-bleu qui luit, ses deux culots, et le halo sur le mur derrière.
 * `along` : le sens du tube (x sur le mur du fond, z sur le mur de gauche).
 */
function NeonTube({ at, len, along, halo = true }: { at: [number, number, number]; len: number; along: 'x' | 'z'; halo?: boolean }) {
  const ax = along === 'x'
  const rot: [number, number, number] = ax ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]
  const off = (d: number): [number, number, number] => (ax ? [at[0], at[1], at[2] + d] : [at[0] + d, at[1], at[2]])
  const end = (s: number): [number, number, number] => (ax ? [at[0] + s * (len / 2 - 0.03), at[1] - 0.05, at[2] + 0.06] : [at[0] + 0.06, at[1] - 0.05, at[2] + s * (len / 2 - 0.03)])
  return (
    <group raycast={noRay}>
      <Part geo={ax ? rbox(len, 0.07, 0.07, 0.025) : rbox(0.07, 0.07, len, 0.025)} m={L.frame} p={off(0.035)} castShadow={false} />
      <mesh geometry={cyl(0.024, 0.024, len - 0.1, 12)} material={L.tube} position={ax ? [at[0], at[1] - 0.06, at[2] + 0.07] : [at[0] + 0.07, at[1] - 0.06, at[2]]} rotation={rot} raycast={noRay} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.032, 0.032, 0.05, 12)} m={L.steelDark} p={end(s)} rotation={rot} castShadow={false} />
      ))}
      {/* le halo sur le mur : un rectangle doux, additif */}
      {halo && <mesh material={L.tubeHalo} position={ax ? [at[0], at[1] - 0.05, at[2] + 0.004] : [at[0] + 0.004, at[1] - 0.05, at[2]]} rotation-y={ax ? 0 : Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[len + 0.7, 0.9]} />
      </mesh>}
    </group>
  )
}

/** La lumière froide du néon (la seule lumière blanche de la pièce) : posée sous le plafond, au milieu. */
function NeonLight() {
  const l = useRef<PointLight>(null!)
  useFrame(() => {
    const n = smooth(mood.night)
    l.current.intensity = (0.35 + n * 0.85) * Math.PI
    L.tubeHalo.opacity = 0.1 + n * 0.3
  })
  return <pointLight ref={l} color={0xdff2ff} intensity={0} distance={9.5} decay={1.2} position={[-1.0, 3.5, -0.6]} />
}

/**
 * La coque de la laverie : le socle de béton et son liseré menthe, le carrelage en damier, le mur du fond percé de la vitrine et
 * de la porte, le mur de gauche, la faïence menthe jusqu'à l'épaule et le plâtre au-dessus, l'estrade carrelée des lave-linge,
 * les plinthes, les deux néons tubulaires.
 */
export function Shell() {
  return (
    <>
      {/* le socle, son liseré, le sol */}
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={L.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.92, 0.06, 6.92, 0.025)} m={L.baseTrim} p={[-0.07, -0.2, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={L.wallEdge} p={[-0.07, -0.12, -0.07]} />
      <mesh material={L.floor} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <planeGeometry args={[6.42, 6.42]} />
      </mesh>
      {/* les murs */}
      <Part geo={holedWall([{ ...VITRINE, r: 0.06 }, { ...DOOR, r: 0.06 }])} m={L.wall} p={[0, 0, -3.26]} />
      <Part geo={worldUV(rbox(0.34, 4.35, 6.54, 0.08), 1)} m={L.wall} p={[-3.17, 2.125, -0.07]} />
      {/* la faïence : mur de gauche ; mur du fond à gauche de la vitrine, sous la vitrine, à droite de la porte */}
      <Dado side="left" x0={-3.0} x1={3.18} />
      <Dado side="back" x0={-2.99} x1={VITRINE.x0 - 0.1} />
      <Dado side="back" x0={VITRINE.x0 - 0.1} x1={VITRINE.x1 + 0.1} h={VITRINE.y0 - 0.08} />
      <Dado side="back" x0={DOOR.x1 + 0.1} x1={3.18} />
      {/* les plinthes d'acier, au pied de la faïence */}
      <Part geo={rbox(0.03, 0.08, 6.16, 0.01)} m={L.steelDark} p={[IN + 0.03, 0.04, 0.08]} castShadow={false} />
      <Part geo={rbox(1.5, 0.08, 0.03, 0.01)} m={L.steelDark} p={[-2.27, 0.04, IN + 0.03]} castShadow={false} />
      <Part geo={rbox(0.9, 0.08, 0.03, 0.01)} m={L.steelDark} p={[2.76, 0.04, IN + 0.03]} castShadow={false} />
      {/* l'estrade carrelée sous les lave-linge, son nez de marche en inox */}
      <Part geo={worldUV(rbox(0.82, 0.1, 3.72, 0.02), 0.8)} m={L.tile} p={[-2.6, 0.05, -0.1]} />
      <Part geo={rbox(0.04, 0.03, 3.74, 0.012)} m={L.steel} p={[-2.19, 0.095, -0.1]} castShadow={false} />
      {/* le haut des murs, un chant d'acier laqué blanc */}
      <Part geo={rbox(6.6, 0.06, 0.32, 0.025)} m={L.frame} p={[-0.07, 4.33, -3.16]} castShadow={false} />
      <Part geo={rbox(0.32, 0.06, 6.6, 0.025)} m={L.frame} p={[-3.16, 4.33, -0.07]} castShadow={false} />
      {/* les néons : sur le mur de gauche au-dessus des machines, sur le mur du fond au-dessus de la vitrine */}
      <NeonTube at={[IN, 3.55, -1.25]} len={2.2} along="z" halo={false} />
      <NeonTube at={[IN, 3.55, 1.1]} len={2.2} along="z" halo={false} />
      {/* un seul halo pour les deux tubes du mur de gauche (un tracé de moins) */}
      <mesh material={L.tubeHalo} position={[IN + 0.004, 3.5, -0.075]} rotation-y={Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[5.6, 0.9]} />
      </mesh>
      <NeonTube at={[-0.25, 3.78, IN]} len={2.3} along="x" />
      <NeonLight />
    </>
  )
}
