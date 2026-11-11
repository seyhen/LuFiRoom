import { useMemo } from 'react'
import { CircleGeometry, TorusGeometry } from 'three'
import { seeded } from '../../../math'
import { Batch, Part, SPH, cyl, noRay, type Item } from '../../parts'
import { groundGrid } from '../../outdoor'
import { Static } from '../../Static'
import { Rock } from '../../nature/Rock'
import { O } from './materials'
import { PATH, POND, snowColor, snowY } from './ground'

const PRINT = new CircleGeometry(1, 14)
const RIM = new TorusGeometry(1, 0.1, 8, 40)

/** Des pas qui suivent le sentier, gauche, droite : des empreintes ovales un peu plus bleues que la neige. */
function prints(): Item[] {
  const out: Item[] = []
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.floor(len / 0.34)
    const ux = (bx - ax) / len, uz = (bz - az) / len, ang = Math.atan2(ux, uz)
    for (let k = 0; k < n; k++) {
      const side = k % 2 ? 1 : -1, t = (k + 0.5) / n
      const x = ax + (bx - ax) * t - uz * side * 0.1, z = az + (bz - az) * t + ux * side * 0.1
      out.push({ p: [x, snowY(x, z) + 0.012, z], s: [0.055, 0.1, 1], r: [-Math.PI / 2, 0, ang] })
    }
  }
  return out
}

/** Les roseaux secs qui percent la neige au bord de la mare. */
function reeds(): Item[] {
  const r = seeded(5), out: Item[] = []
  for (let i = 0; i < 16; i++) {
    const a = -0.6 + r() * 2.2 + (i > 8 ? 3.0 : 0), d = POND.r + 0.15 + r() * 0.3
    const x = POND.x + Math.cos(a) * d, z = POND.z + Math.sin(a) * d, h = 0.4 + r() * 0.45
    out.push({ p: [x, snowY(x, z) + h / 2 - 0.04, z], s: [1, h, 1], r: [(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3] })
  }
  return out
}

/** Les rochers qui dépassent de la neige : [x, z, taille, variante]. */
const ROCKS: [number, number, number, number][] = [
  [-4.6, 4.4, 0.42, 1], [-5.1, 4.9, 0.26, 3], [6.2, -3.2, 0.36, 2], [3.9, 6.4, 0.3, 5], [-6.8, -1.2, 0.5, 4], [10.1, -4.5, 0.4, 0],
]

/**
 * Le sol de la clairière : la neige (congères contre le socle, collines derrière), le sentier et ses traces de pas, la mare gelée
 * avec son bourrelet de neige et ses roseaux, quelques rochers qui dépassent.
 */
export function Snowfield() {
  const geo = useMemo(() => groundGrid(0.4, 0.4, 44, 96, snowY, snowColor, 2.4), [])
  const pr = useMemo(prints, [])
  const rd = useMemo(reeds, [])
  const reedGeo = useMemo(() => cyl(0.012, 0.018, 1, 5), [])
  const heads = useMemo(() => rd.filter((_, i) => i % 2 === 0).map((it): Item => ({ p: [it.p[0], it.p[1] + (it.s as number[])[1] / 2, it.p[2]], s: [0.035, 0.11, 0.035], r: it.r })), [rd])
  return (
    <>
      <mesh geometry={geo} material={O.snow} receiveShadow raycast={noRay} />
      <Batch geo={PRINT} m={O.print} items={pr} />
      {/* la mare gelée et son bourrelet de neige */}
      <mesh position={[POND.x, snowY(POND.x, POND.z) + 0.03, POND.z]} rotation-x={-Math.PI / 2} material={O.ice} receiveShadow raycast={noRay}>
        <circleGeometry args={[POND.r, 40]} />
      </mesh>
      <Static>
      <Part geo={RIM} m={O.snowCap} p={[POND.x, snowY(POND.x, POND.z) + 0.04, POND.z]} rotation-x={-Math.PI / 2} scale={[POND.r + 0.05, POND.r + 0.05, 1.2]} castShadow={false} />
      <Batch geo={reedGeo} m={O.reed} items={rd} />
      <Batch geo={SPH} m={O.trunk} items={heads} />
      {ROCKS.map(([x, z, s, v]) => (
        // la « mousse » de la pierre devient la neige posée sur son dessus
        <Rock key={`${x},${z}`} v={v} p={[x, snowY(x, z) - s * 0.12, z]} s={[s, s * 0.8, s * 0.85]} ry={x} m={O.rock} moss={O.snowCap} shadow={false} />
      ))}
      </Static>
    </>
  )
}
