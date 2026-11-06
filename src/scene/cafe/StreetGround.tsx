import { useMemo } from 'react'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { BoxGeometry, BufferGeometry, CylinderGeometry, Float32BufferAttribute, RepeatWrapping } from 'three'
import { Batch, Part, cyl, noRay, type Item, type V3 } from '../parts'
import { Static } from '../Static'
import { K } from './materials'
import { B, CURB, RD, SW } from './streetKit'
import { S } from './streetMaterials'
import { gutter } from './StreetWeather'
import { cobbleTex } from './streetTex'

// Le sol du café : la chaussée de pavés qui s'efface sur ses bords, les trottoirs de dalles (devant et le long du côté droit,
// à l'angle arrondi), la bordure de granit, le caniveau qui court vers la bouche d'égout, les doubles lignes jaunes.

export const GROUND = { x: -1, z: 1, size: 30 }
cobbleTex.wrapS = cobbleTex.wrapT = RepeatWrapping
cobbleTex.repeat.set(GROUND.size / 2.5, GROUND.size / 2.5)

const { cx, cz, r, front, right } = CURB
const SLAB_BOTTOM = RD - 0.12, SLAB_H = SW - SLAB_BOTTOM
const slabY = (SW + SLAB_BOTTOM) / 2

/** Un ruban à plat qui suit une ligne brisée (le caniveau) : u en travers, v le long du courant. Il s'amincit aux deux bouts. */
function ribbon(pts: [number, number][], width: number, y: number, vScale = 1.2) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  let v = 0
  pts.forEach(([x, z], i) => {
    const [nx, nz] = pts[Math.min(pts.length - 1, i + 1)], [px, pz] = pts[Math.max(0, i - 1)]
    const dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz) || 1, w = width / 2
    if (i) v += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]) / vScale
    pos.push(x - (dz / l) * w, y, z + (dx / l) * w, x + (dz / l) * w, y, z - (dx / l) * w)
    uv.push(0, v, 1, v)
    if (i) {
      const a = (i - 1) * 2
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const arc = (a0: number, a1: number, rad: number, n: number): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n
    return [cx + Math.cos(a) * rad, cz + Math.sin(a) * rad]
  })

/** Le point où les deux caniveaux se rejoignent : la bouche d'égout, au milieu de l'arrondi, côté chaussée. */
export const DRAIN: [number, number] = [cx + Math.cos(Math.PI / 4) * (r + 0.19), cz + Math.sin(Math.PI / 4) * (r + 0.19)]

/** Une pierre de bordure. */
const rbs = new BoxGeometry(0.64, 0.19, 0.2)
/** Le quart de cylindre de l'angle du trottoir. */
const cornerGeo = new CylinderGeometry(r, r, SLAB_H, 20, 1, false, 0, Math.PI / 2)

export function StreetGround() {
  const gutters = useMemo(() => {
    const gr = r + 0.19 // le caniveau suit la bordure, 0,19 en dehors
    const front0 = Array.from({ length: 16 }, (_, i): [number, number] => [CURB.x0 + 0.4 + (i / 15) * (cx - CURB.x0 - 0.4), front + 0.19])
    const a = [...front0, ...arc(Math.PI / 2, Math.PI / 4, gr, 4)]
    const right0 = Array.from({ length: 12 }, (_, i): [number, number] => [right + 0.19, CURB.zBack + 0.1 + (i / 11) * (cz - CURB.zBack - 0.1)])
    const b = [...right0, ...arc(0, Math.PI / 4, gr, 4)]
    // les bouts s'amincissent : on les termine par un point confondu
    return [mergeGeometries([ribbon(a, 0.2, RD + 0.012), ribbon(b, 0.2, RD + 0.012)])]
  }, [])

  // la bordure : des pierres de granit, sur le bord du trottoir
  const kerb = useMemo(() => {
    const out: Item[] = []
    const L = 0.66
    for (let x = CURB.x0 + 0.5; x < cx - 0.1; x += L) out.push({ p: [x, SW + 0.005, front - 0.09], s: [1, 1, 1], c: undefined })
    for (const k of [0.2, 0.5, 0.8]) {
      const a = (k * Math.PI) / 2
      out.push({ p: [cx + Math.cos(Math.PI / 2 - a) * (r - 0.09), SW + 0.005, cz + Math.sin(Math.PI / 2 - a) * (r - 0.09)], s: [1, 1, 1], r: [0, a, 0] })
    }
    for (let z = CURB.zBack + 0.3; z < cz - 0.1; z += L) out.push({ p: [right - 0.09, SW + 0.005, z], s: [1, 1, 1], r: [0, Math.PI / 2, 0] })
    return out
  }, [])

  // les lignes jaunes doubles, le long de la bordure
  const lines: { p: V3; s: V3 }[] = [
    { p: [(CURB.x0 + 3.9) / 2, RD + 0.006, front + 0.55], s: [3.9 - CURB.x0, 0.012, 0.06] },
    { p: [(CURB.x0 + 3.9) / 2, RD + 0.006, front + 0.66], s: [3.9 - CURB.x0, 0.012, 0.06] },
    { p: [right + 0.55, RD + 0.006, (CURB.zBack + 3.9) / 2], s: [0.06, 0.012, 3.9 - CURB.zBack] },
    { p: [right + 0.66, RD + 0.006, (CURB.zBack + 3.9) / 2], s: [0.06, 0.012, 3.9 - CURB.zBack] },
  ]
  return (
    <>
      <Static>
        {/* la chaussée de pavés, qui s'efface sur ses bords */}
        <mesh material={S.cobble} position={[GROUND.x, RD, GROUND.z]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
          <planeGeometry args={[GROUND.size, GROUND.size]} />
        </mesh>
        {/* le trottoir de devant, celui de droite, et l'angle arrondi qui les joint */}
        <B s={[cx - CURB.x0, SLAB_H, front - 3.3]} p={[(CURB.x0 + cx) / 2, slabY, (3.3 + front) / 2]} m={S.flag} r={0.04} uv={2.4} />
        <B s={[right - 3.3, SLAB_H, 3.3 - CURB.zBack]} p={[(3.3 + right) / 2, slabY, (CURB.zBack + 3.3) / 2]} m={S.flag} r={0.04} uv={2.4} />
        <B s={[right - cx, SLAB_H, cz - 3.3]} p={[(cx + right) / 2, slabY, (3.3 + cz) / 2]} m={S.flag} r={0.04} uv={2.4} />
        <Part geo={cornerGeo} m={S.flag} p={[cx, slabY, cz]} castShadow={false} raycast={noRay} />
        {/* la bordure */}
        <Batch geo={rbs} m={K.base} items={kerb} />
        {/* les doubles lignes jaunes */}
        {lines.map((l, i) => (
          <B key={i} s={l.s} p={l.p} m={K.mustard} r={0.005} seg={1} />
        ))}
        {/* la bouche d'égout, à la jonction des deux caniveaux : cadre de fonte et fentes */}
        <group position={[DRAIN[0], RD, DRAIN[1]]} rotation-y={-Math.PI / 4}>
          <B s={[0.56, 0.05, 0.34]} p={[0, 0.02, 0]} m={K.iron} r={0.02} />
          {[-0.18, -0.09, 0, 0.09, 0.18].map((x) => (
            <B key={x} s={[0.035, 0.012, 0.24]} p={[x, 0.05, 0]} m={K.soot} r={0.005} />
          ))}
        </group>
        {/* un tampon d'égout sur la chaussée : disque de fonte, anneau et motif */}
        <group position={[1.8, RD, 6.9]}>
          <Part geo={cyl(0.46, 0.46, 0.03, 28)} m={K.iron} p={[0, 0.012, 0]} castShadow={false} raycast={noRay} />
          <Part geo={cyl(0.4, 0.4, 0.012, 28)} m={K.soot} p={[0, 0.032, 0]} castShadow={false} raycast={noRay} />
          <Part geo={cyl(0.36, 0.36, 0.012, 28)} m={K.iron} p={[0, 0.036, 0]} castShadow={false} raycast={noRay} />
          {[0, 1, 2].map((i) => (
            <B key={i} s={[0.64, 0.012, 0.035]} p={[0, 0.045, 0]} m={K.soot} r={0.005} ry={(i * Math.PI) / 3} />
          ))}
        </group>
      </Static>
      {/* le caniveau : de l'eau qui court (son courant et sa quantité suivent la pluie) */}
      {gutters.map((g, i) => (
        <mesh key={i} geometry={g} material={gutter} renderOrder={1} raycast={noRay} />
      ))}
    </>
  )
}
