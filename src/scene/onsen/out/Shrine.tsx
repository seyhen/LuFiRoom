import { useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../../parts'
import { N } from './materials'
import { groundY } from './ground'

/**
 * Le torii vermillon à l'entrée du sentier : deux piliers sur leurs socles noirs, la traverse basse (nuki) et sa cale, le linteau
 * vermillon (shimaki) sous le grand linteau noir (kasagi) aux bouts relevés. `ry` le tourne en travers du sentier.
 */
export function Torii({ x, z, ry }: { x: number; z: number; ry: number }) {
  const g = groundY(x, z)
  return (
    <group position={[x, g, z]} rotation-y={ry}>
      {[-0.95, 0.95].map((px) => (
        <group key={px} position={[px, 0, 0]}>
          <Part geo={cyl(0.13, 0.15, 2.6, 16)} m={N.vermilion} p={[0, 1.3, 0]} />
          <Part geo={cyl(0.19, 0.2, 0.3, 16)} m={N.black} p={[0, 0.15, 0]} />
        </group>
      ))}
      <Part geo={rbox(2.6, 0.16, 0.16, 0.04)} m={N.vermilion} p={[0, 1.95, 0]} />
      <Part geo={rbox(0.16, 0.36, 0.14, 0.03)} m={N.vermilion} p={[0, 2.2, 0]} />
      <Part geo={rbox(2.9, 0.16, 0.22, 0.05)} m={N.vermilion} p={[0, 2.47, 0]} />
      {/* le kasagi : un linteau noir dont les bouts se relèvent */}
      <Part geo={rbox(2.2, 0.16, 0.3, 0.06)} m={N.black} p={[0, 2.64, 0]} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={rbox(0.85, 0.16, 0.3, 0.06)} m={N.black} p={[s * 1.42, 2.69, 0]} rotation-z={s * 0.16} />
      ))}
    </group>
  )
}

/** Une lanterne de pierre (tōrō) : socle, fût, plateau, foyer aux fenêtres de papier (elles s'allument le soir), toit à six pans, bouton. */
export function Toro({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  const g = groundY(x, z)
  return (
    <group position={[x, g, z]} scale={s}>
      <Part geo={cyl(0.26, 0.3, 0.14, 6)} m={N.lantern} p={[0, 0.07, 0]} />
      <Part geo={cyl(0.09, 0.11, 0.62, 10)} m={N.lantern} p={[0, 0.45, 0]} />
      <Part geo={cyl(0.24, 0.18, 0.12, 6)} m={N.lantern} p={[0, 0.82, 0]} />
      <Part geo={rbox(0.3, 0.3, 0.3, 0.03)} m={N.lantern} p={[0, 1.03, 0]} />
      {/* les fenêtres de papier, devant et sur le côté vus */}
      <Part geo={rbox(0.16, 0.16, 0.02, 0.01)} m={N.paper} p={[0, 1.04, 0.152]} castShadow={false} />
      <Part geo={rbox(0.02, 0.16, 0.16, 0.01)} m={N.paper} p={[0.152, 1.04, 0]} castShadow={false} />
      <Part geo={cyl(0.08, 0.38, 0.2, 6)} m={N.lantern} p={[0, 1.28, 0]} />
      <Part geo={cyl(0.07, 0.07, 0.06, 8)} m={N.lantern} p={[0, 1.41, 0]} castShadow={false} />
      <Part geo={SPH} m={N.lantern} p={[0, 1.48, 0]} scale={[0.06, 0.08, 0.06]} castShadow={false} />
    </group>
  )
}

/** Où se pose le halo d'une lanterne (devant son foyer). */
export const toroGlowAt = (x: number, z: number, s = 1): V3 => [x + 0.1 * s, groundY(x, z) + 1.04 * s, z + 0.1 * s]

/**
 * Le pont arqué vermillon (taikobashi) sur le ruisseau : un tablier de planches de cèdre en arc, deux garde-corps vermillon aux
 * montants coiffés de boutons de laiton (giboshi), deux poutres dessous. `ry` aligne la portée.
 */
export function Bridge({ x, z, ry, span = 2.6, rise = 0.5 }: { x: number; z: number; ry: number; span?: number; rise?: number }) {
  const g = groundY(x - 1.3, z) * 0.5 + groundY(x + 1.3, z) * 0.5
  const arc = (t: number): V3 => [-span / 2 + span * t, rise * Math.sin(Math.PI * t), 0]
  const rails = useMemo(() => [-0.46, 0.46].map((dz) => new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => { const p = arc(i / 8); return new Vector3(p[0], p[1] + 0.62, dz) })), 30, 0.035, 8, false)), [span, rise])
  const beams = useMemo(() => [-0.36, 0.36].map((dz) => new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => { const p = arc(i / 8); return new Vector3(p[0], p[1] - 0.08, dz) })), 30, 0.07, 8, false)), [span, rise])
  const planks = 14
  return (
    <group position={[x, g + 0.05, z]} rotation-y={ry}>
      {Array.from({ length: planks }, (_, i) => {
        const t = (i + 0.5) / planks, p = arc(t), slope = Math.atan(rise * Math.PI * Math.cos(Math.PI * t) / span)
        return <Part key={i} geo={rbox(span / planks - 0.015, 0.05, 1.0, 0.015)} m={N.cedar} p={p} rotation-z={slope} />
      })}
      {beams.map((b, i) => <Part key={i} geo={b} m={N.cedar} castShadow={false} />)}
      {rails.map((r, i) => <Part key={i} geo={r} m={N.vermilion} />)}
      {[-0.46, 0.46].flatMap((dz) => [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const p = arc(t), end = t === 0 || t === 1
        return (
          <group key={`${dz}${t}`} position={[p[0], p[1], dz]}>
            <Part geo={cyl(0.05, 0.05, 0.66, 10)} m={N.vermilion} p={[0, 0.31, 0]} castShadow={false} />
            {end && <Part geo={SPH} m={N.brass} p={[0, 0.72, 0]} scale={[0.07, 0.1, 0.07]} castShadow={false} />}
          </group>
        )
      }))}
    </group>
  )
}
