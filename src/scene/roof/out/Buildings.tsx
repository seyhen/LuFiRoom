import { useMemo } from 'react'
import { PlaneGeometry, RepeatWrapping, type Material } from 'three'
import { Part, cyl, noRay, orient, rbox, type V3 } from '../../parts'
import { O } from './materials'

/** Une travée-étage de la texture de façade : 3 travées × 3 étages = 6,9 × 7,8 m. */
const TILE_W = 6.9, TILE_H = 7.8
for (const m of O.facade) {
  const t = m.map!, g = m.emissiveMap!
  t.wrapS = t.wrapT = g.wrapS = g.wrapT = RepeatWrapping
}

/** Le bas des immeubles : ils plongent dans le ciel (le fondu les efface bien avant). */
const BOTTOM = -12

/** Un plan de façade de `w` × `h`, dont la texture commence en haut (le dernier étage) et garde son échelle. */
function facadeGeo(w: number, h: number, shift = 0) {
  const g = new PlaneGeometry(w, h)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / TILE_W) + shift, 1 - (1 - uv.getY(i)) * (h / TILE_H))
  return g
}

export interface BlockProps {
  x0: number; x1: number; z0: number; z1: number
  /** Le dessus du toit. */
  top: number
  /** La brique (0 rouge, 1 blonde, 2 prune). */
  b: number
  /** Un parapet autour du toit (les voisins) ; notre immeuble n'en a pas (la terrasse est dessus). */
  parapet?: boolean
  /** Où commence la texture le long de la façade (deux voisins ne montrent pas les mêmes fenêtres). */
  shift?: number
}

/** Un immeuble : sa masse, ses deux façades vues (+x, +z), un toit de bitume et son parapet coiffé de pierre. */
export function Block({ x0, x1, z0, z1, top, b, parapet = true, shift = 0 }: BlockProps) {
  const w = x1 - x0, d = z1 - z0, h = top - BOTTOM
  const front = useMemo(() => facadeGeo(w, h - 0.6, shift), [w, h, shift])
  const side = useMemo(() => facadeGeo(d, h - 0.6, shift + 0.37), [d, h, shift])
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, fy = top - 0.6 - (h - 0.6) / 2
  return (
    <group>
      <Part geo={rbox(w, h, d, 0.05)} m={O.brick[b]} p={[cx, BOTTOM + h / 2, cz]} castShadow={false} />
      <mesh geometry={front} material={O.facade[b]} position={[cx, fy, z1 + 0.006]} receiveShadow raycast={noRay} />
      <mesh geometry={side} material={O.facade[b]} position={[x1 + 0.006, fy, cz]} rotation-y={Math.PI / 2} receiveShadow raycast={noRay} />
      {/* la corniche sous le toit */}
      <Part geo={rbox(w + 0.16, 0.16, d + 0.16, 0.05)} m={O.coping} p={[cx, top - 0.5, cz]} castShadow={false} />
      {parapet && (
        <>
          <Part geo={rbox(w - 0.04, 0.03, d - 0.04, 0.01)} m={O.tar} p={[cx, top + 0.005, cz]} castShadow={false} />
          {([[cx, z0 + 0.12, w, 0.24], [cx, z1 - 0.12, w, 0.24], [x0 + 0.12, cz, 0.24, d], [x1 - 0.12, cz, 0.24, d]] as const).map(([px, pz, pw, pd], i) => (
            <group key={i}>
              <Part geo={rbox(pw, 0.5, pd, 0.04)} m={O.brick[b]} p={[px, top + 0.25, pz]} castShadow={false} />
              <Part geo={rbox(pw + 0.06, 0.07, pd + 0.06, 0.025)} m={O.coping} p={[px, top + 0.53, pz]} castShadow={false} />
            </group>
          ))}
        </>
      )}
    </group>
  )
}

/** Un rectangle de fer (palier, limon) ; les barreaux d'une rambarde. */
function Rail({ a, b, m = O.steel, r = 0.016 }: { a: V3; b: V3; m?: Material; r?: number }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
  return <Part geo={cyl(r, r, len, 6)} m={m} p={mid} rotation={orient(d)} castShadow={false} />
}

/**
 * L'escalier de secours sur la façade de notre immeuble (côté +z) : un palier sous chaque fenêtre de deux travées, une rambarde,
 * des volées en zigzag de l'un à l'autre, l'échelle rabattue au bas.
 */
export function FireEscape({ x0, x1, z, top }: { x0: number; x1: number; z: number; top: number }) {
  const DEPTH = 0.62
  const levels = [0, 1, 2].map((j) => top - j * 2.6 - 2.12)
  return (
    <group>
      {levels.map((y, j) => {
        const zc = z + DEPTH / 2
        return (
          <group key={j}>
            <Part geo={rbox(x1 - x0, 0.04, DEPTH, 0.01)} m={O.steel} p={[(x0 + x1) / 2, y, zc]} castShadow={false} />
            {/* la rambarde : main courante, lisse basse, barreaux */}
            {[0.95, 0.45].map((hh) => <Rail key={hh} a={[x0, y + hh, z + DEPTH]} b={[x1, y + hh, z + DEPTH]} r={hh > 0.5 ? 0.022 : 0.014} />)}
            {Array.from({ length: Math.round((x1 - x0) / 0.3) + 1 }, (_, i) => {
              const x = x0 + i * ((x1 - x0) / Math.round((x1 - x0) / 0.3))
              return <Rail key={i} a={[x, y, z + DEPTH]} b={[x, y + 0.95, z + DEPTH]} r={0.011} />
            })}
            {[x0, x1].map((x) => <Rail key={x} a={[x, y + 0.95, z + 0.04]} b={[x, y + 0.95, z + DEPTH]} r={0.016} />)}
            {/* deux consoles sous le palier */}
            {[x0 + 0.2, x1 - 0.2].map((x) => <Part key={x} geo={rbox(0.04, 0.04, DEPTH, 0.01)} m={O.steel} p={[x, y - 0.25, zc]} rotation-x={-0.6} castShadow={false} />)}
            {/* la volée vers le palier du dessous, en zigzag */}
            {j < levels.length - 1 && (() => {
              const ya = y, yb = levels[j + 1], xa = j % 2 ? x0 + 0.35 : x1 - 0.35, xb = j % 2 ? x1 - 0.9 : x0 + 0.9
              const n = 9, zs = z + DEPTH * 0.55
              return (
                <group>
                  {[zs - 0.2, zs + 0.2].map((zz) => <Rail key={zz} a={[xa, ya, zz]} b={[xb, yb, zz]} r={0.022} />)}
                  {Array.from({ length: n }, (_, k) => {
                    const t = (k + 0.5) / n
                    return <Part key={k} geo={rbox(0.12, 0.025, 0.4, 0.008)} m={O.steel} p={[xa + (xb - xa) * t, ya + (yb - ya) * t, zs]} castShadow={false} />
                  })}
                  <Rail a={[xa, ya + 0.9, zs + 0.22]} b={[xb, yb + 0.9, zs + 0.22]} r={0.016} />
                </group>
              )
            })()}
          </group>
        )
      })}
      {/* l'échelle rabattue sous le dernier palier */}
      {[-0.18, 0.18].map((dx) => <Rail key={dx} a={[x0 + 0.6 + dx, levels[2] - 1.6, z + 0.5]} b={[x0 + 0.6 + dx, levels[2], z + 0.5]} r={0.016} />)}
      {Array.from({ length: 6 }, (_, k) => <Rail key={k} a={[x0 + 0.42, levels[2] - 0.2 - k * 0.27, z + 0.5]} b={[x0 + 0.78, levels[2] - 0.2 - k * 0.27, z + 0.5]} r={0.011} />)}
    </group>
  )
}
