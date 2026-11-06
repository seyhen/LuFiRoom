import { useMemo } from 'react'
import { CircleGeometry } from 'three'
import { seeded } from '../../../math'
import { Batch, Part, SPH, cyl, orient, rbox, type Item, type V3 } from '../../parts'
import { O } from './materials'
import { snowY } from './ground'

/** L'abri à bois : son centre, sa face ouverte vers +x (la caméra la voit de côté). */
export const SHED = { x: 5.75, z: -1.75 }
const LOG = cyl(1, 1, 1, 14)
const END = new CircleGeometry(1, 16)

/** Les bûches empilées dans l'abri : le bout coupé regarde la caméra (+x). */
function logs() {
  const r = seeded(9), side: Item[] = [], ends: Item[] = [], g = snowY(SHED.x, SHED.z) + 0.06
  const L = 0.62, x = SHED.x + 0.05
  for (let row = 0; row < 5; row++) {
    const n = 8 - (row > 2 ? row - 2 : 0), r0 = 0.085
    for (let k = 0; k < n; k++) {
      const rr = r0 * (0.85 + r() * 0.3), z = SHED.z - 0.74 + (k + (row % 2) * 0.5) * 0.19, y = g + rr + row * 0.165
      if (z > SHED.z + 0.8) continue
      const dx = (r() - 0.5) * 0.06
      side.push({ p: [x + dx, y, z], s: [rr, L, rr], r: [0, 0, Math.PI / 2] })
      ends.push({ p: [x + dx + L / 2 + 0.002, y, z], s: rr * 0.97, r: [0, Math.PI / 2, r() * 6.3] })
    }
  }
  return { side, ends }
}

/** Une pièce entre deux points (planche, barreau) : centre, rotation, longueur. */
export function between(a: V3, b: V3) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  return { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] as V3, r: orient(d), len }
}

/**
 * L'abri à bois, à droite de la cabane : quatre poteaux, un toit de planches qui penche vers l'avant sous un gros édredon de neige
 * (et ses glaçons arrondis), la réserve de bûches au bout coupé, et devant, le billot avec la hache plantée et des bûches fendues.
 */
export function Woodshed() {
  const lg = useMemo(logs, [])
  const g = snowY(SHED.x, SHED.z)
  const { x, z } = SHED
  // le toit : de 1,75 à l'arrière (x - 0,5) à 1,4 devant (x + 0,55), débord compris
  const tilt = -Math.atan2(0.34, 1.0), roofY = g + 1.56
  const icicles = useMemo(() => {
    const r = seeded(3)
    return Array.from({ length: 9 }, (_, i) => ({ z: z - 0.88 + i * 0.22 + (r() - 0.5) * 0.06, h: 0.1 + r() * 0.16 }))
  }, [z])
  const block: V3 = [x + 1.05, snowY(x + 1.05, z + 1.15), z + 1.15]
  const haft = between([block[0] - 0.02, block[1] + 0.42, block[2]], [block[0] + 0.12, block[1] + 0.92, block[2] + 0.26])
  return (
    <group>
      {/* poteaux et traverses */}
      {[[-0.5, -0.92], [-0.5, 0.92], [0.5, -0.92], [0.5, 0.92]].map(([dx, dz]) => {
        const h = dx < 0 ? 1.72 : 1.38
        return <Part key={`${dx}${dz}`} geo={rbox(0.11, h, 0.11, 0.03)} m={O.plankDark} p={[x + dx, g + h / 2 - 0.04, z + dz]} />
      })}
      {/* le fond en planches verticales, les côtés à claire-voie */}
      {Array.from({ length: 8 }, (_, i) => (
        <Part key={i} geo={rbox(0.05, 1.6, 0.22, 0.02)} m={i % 3 === 1 ? O.plankDark : O.plank} p={[x - 0.52, g + 0.8, z - 0.8 + i * 0.228]} />
      ))}
      {[0.3, 0.75, 1.2].map((y) => (
        <Part key={y} geo={rbox(1.0, 0.1, 0.04, 0.02)} m={O.plank} p={[x, g + y, z - 0.94]} />
      ))}
      <Part geo={rbox(1.0, 0.06, 1.9, 0.02)} m={O.plankDark} p={[x, g + 0.04, z]} castShadow={false} />
      {/* le toit, et sa neige */}
      <group position={[x, roofY, z]} rotation-z={tilt}>
        <Part geo={rbox(1.36, 0.07, 2.12, 0.03)} m={O.plank} />
        <Part geo={rbox(1.32, 0.2, 2.06, 0.1)} m={O.snowCap} p={[0, 0.13, 0]} />
        <Part geo={SPH} m={O.snowCap} p={[0.66, 0.1, 0]} scale={[0.1, 0.12, 1.02]} castShadow={false} />
        {icicles.map((ic, i) => (
          <group key={i} position={[0.67, -0.02, ic.z - z]}>
            <Part geo={cyl(0.028, 0.008, ic.h, 8)} m={O.snowCap} p={[0, -ic.h / 2, 0]} castShadow={false} />
            <Part geo={SPH} m={O.snowCap} p={[0, -ic.h, 0]} scale={0.011} castShadow={false} />
          </group>
        ))}
      </group>
      {/* la réserve de bûches */}
      <Batch geo={LOG} m={O.bark} items={lg.side} shadow />
      <Batch geo={END} m={O.rings} items={lg.ends} />
      {/* le billot, la hache, les bûches fendues */}
      <Part geo={cyl(0.27, 0.3, 0.42, 18)} m={O.bark} p={[block[0], block[1] + 0.17, block[2]]} />
      <Part geo={END} m={O.rings} p={[block[0], block[1] + 0.385, block[2]]} rotation-x={-Math.PI / 2} scale={0.265} castShadow={false} />
      <Part geo={cyl(0.024, 0.03, haft.len, 8)} m={O.slat} p={haft.p} rotation={haft.r} />
      <Part geo={rbox(0.05, 0.13, 0.2, 0.02)} m={O.iron} p={[block[0] - 0.01, block[1] + 0.43, block[2] - 0.02]} rotation={[0.45, 0, 0]} />
      <Part geo={rbox(0.054, 0.04, 0.08, 0.015)} m={O.steel} p={[block[0] - 0.01, block[1] + 0.395, block[2] - 0.08]} rotation={[0.45, 0, 0]} castShadow={false} />
      {[[0.5, 0.15, 0.4], [0.28, 0.45, -0.3], [-0.42, 0.42, 1.1]].map(([dx, dz, ry], i) => (
        <group key={i} position={[block[0] + dx, block[1] + 0.07, block[2] + dz]} rotation-y={ry}>
          <Part geo={LOG} m={O.bark} scale={[0.07, 0.36, 0.07]} rotation-z={Math.PI / 2} />
          <Part geo={END} m={O.rings} p={[0.181, 0, 0]} rotation-y={Math.PI / 2} scale={0.068} castShadow={false} />
        </group>
      ))}
      {/* un peu de neige sur le billot et sur la pile */}
      <Part geo={SPH} m={O.snowCap} p={[block[0] + 0.1, block[1] + 0.39, block[2] + 0.1]} scale={[0.1, 0.03, 0.08]} castShadow={false} />
    </group>
  )
}
