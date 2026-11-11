import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, PlaneGeometry, SphereGeometry } from 'three'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../../parts'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { P } from './materials'
import { R } from './roofMaterials'
import { BRISIS, INSET, mansardGeo } from './Haussmann'

// L'habillage des toits de zinc : les terrassons à joints debout, la verrière d'un atelier d'artiste voisin, une cage d'escalier,
// un château d'eau, le linge et le potager d'un toit, des paraboles, des pigeons. Et plus loin, les toits qui se perdent dans la brume.


/** Le soir, la verrière et les lucarnes lointaines s'allument. */
export function RoofEvening() {
  useFrame(() => {
    const n = smooth(mood.night)
    R.glass.emissiveIntensity = n * 1.4
    R.farGlass.emissiveIntensity = n * 1.8
    for (const m of R.farWall) m.emissiveIntensity = n * 1.1
  })
  return null
}

/** Le dessus d'un toit : un plan de zinc à joints debout (une texture, jamais un aplat) posé sur la boîte lisse du terrasson. */
export function Terrasson({ cx, cz, w, d, y, far = false }: { cx: number; cz: number; w: number; d: number; y: number; far?: boolean }) {
  const g = useMemo(() => {
    const p = new PlaneGeometry(w, d), uv = p.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / 3.6), uv.getY(i) * (d / 1.8))
    return p
  }, [w, d])
  return <mesh geometry={g} material={far ? R.farZinc : R.seam} position={[cx, y, cz]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay} />
}

/** La verrière d'un atelier d'artiste : socle de zinc, double pente de verre à petits carreaux, pignons, faîtage de fer. */
export function Skylight({ p, ry = 0 }: { p: V3; ry?: number }) {
  const W = 1.9, D = 1.3, E = 0.28, H = 0.5, L = Math.hypot(D / 2, H), a = Math.atan2(H, D / 2)
  const gable = useMemo(() => {
    const g = new BufferGeometry(), x = W / 2
    const v = [-x, E, -D / 2, -x, E, D / 2, -x, E + H, 0, x, E, D / 2, x, E, -D / 2, x, E + H, 0]
    g.setAttribute('position', new Float32BufferAttribute(v, 3)); g.computeVertexNormals()
    return g
  }, [])
  const pane = useMemo(() => new PlaneGeometry(W - 0.06, L), [L])
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(W + 0.08, E, D + 0.08, 0.04)} m={P.zincFlat} p={[0, E / 2, 0]} castShadow={false} />
      <mesh geometry={gable} material={R.dish} /> {/* les pignons, plein de zinc clair */}
      <Part geo={pane} m={R.glass} p={[0, E + H / 2, D / 4]} rotation-x={-(Math.PI / 2 - a)} castShadow={false} raycast={noRay} />
      <Part geo={pane} m={R.glass} p={[0, E + H / 2, -D / 4]} rotation-x={-(Math.PI / 2 + a)} castShadow={false} raycast={noRay} />
      <Part geo={rbox(W + 0.06, 0.06, 0.07, 0.02)} m={P.iron} p={[0, E + H + 0.02, 0]} castShadow={false} />
      <Part geo={rbox(W + 0.06, 0.05, 0.06, 0.02)} m={P.iron} p={[0, E + 0.02, D / 2 - 0.02]} castShadow={false} />
      {/* un lanterneau qui s'entrouvre sur le pan de devant */}
      <Part geo={rbox(0.5, 0.03, 0.3, 0.012)} m={P.trim} p={[-0.5, E + 0.26, D / 4 + 0.01]} rotation-x={-(Math.PI / 2 - a) + 0.35} castShadow={false} />
    </group>
  )
}

/** Une cage d'escalier : un petit volume enduit, sa porte, sa lucarne, un toit de zinc à une pente, un tuyau de ventilation. */
export function StairCage({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={rbox(1.3, 0.95, 0.95, 0.04)} m={P.plaster} p={[0, 0.475, 0]} castShadow={false} />
      <Part geo={rbox(1.46, 0.07, 1.1, 0.025)} m={P.trim} p={[0, 0.96, 0]} rotation-x={0.07} castShadow={false} />
      <Part geo={rbox(1.52, 0.05, 1.14, 0.02)} m={P.zincFlat} p={[0, 1.02, 0]} rotation-x={0.07} castShadow={false} />
      <Part geo={rbox(0.4, 0.68, 0.04, 0.015)} m={P.iron} p={[-0.28, 0.34, 0.485]} castShadow={false} />
      <Part geo={rbox(0.5, 0.08, 0.06, 0.02)} m={P.trim} p={[-0.28, 0.72, 0.49]} castShadow={false} />
      <Part geo={rbox(0.3, 0.3, 0.03, 0.012)} m={P.dormerGlass} p={[0.3, 0.6, 0.48]} castShadow={false} />
      <Part geo={rbox(0.36, 0.05, 0.06, 0.02)} m={P.trim} p={[0.3, 0.42, 0.49]} castShadow={false} />
      <Part geo={cyl(0.07, 0.07, 0.5, 10)} m={P.zincFlat} p={[0.45, 1.28, -0.2]} castShadow={false} />
      <Part geo={cyl(0.12, 0.07, 0.07, 10)} m={P.zincFlat} p={[0.45, 1.56, -0.2]} castShadow={false} />
    </group>
  )
}

/** Un château d'eau : cuve de zinc cerclée de fer, toit conique, quatre pieds, une échelle. */
export function WaterTower({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {[[-0.34, -0.34], [0.34, -0.34], [-0.34, 0.34], [0.34, 0.34]].map(([x, z], i) => (
        <Part key={i} geo={cyl(0.035, 0.035, 0.85, 8)} m={P.iron} p={[x, 0.42, z]} castShadow={false} />
      ))}
      <Part geo={rbox(0.9, 0.06, 0.9, 0.02)} m={P.iron} p={[0, 0.86, 0]} castShadow={false} />
      <Part geo={cyl(0.46, 0.46, 0.85, 20)} m={P.zincFlat} p={[0, 1.33, 0]} castShadow={false} />
      {[1.0, 1.35, 1.7].map((y) => <Part key={y} geo={cyl(0.475, 0.475, 0.045, 20)} m={P.iron} p={[0, y, 0]} castShadow={false} />)}
      <Part geo={cyl(0.03, 0.54, 0.34, 20)} m={P.zincFlat} p={[0, 1.93, 0]} castShadow={false} />
      <Part geo={SPH} m={P.iron} p={[0, 2.12, 0]} scale={0.045} castShadow={false} />
      {[-0.07, 0.07].map((x) => <Part key={x} geo={cyl(0.015, 0.015, 1.5, 6)} m={P.iron} p={[0.5 + x * 0.0, 0.8, x + 0.0]} rotation-z={0.0} castShadow={false} />)}
      {[0.2, 0.55, 0.9, 1.25].map((y) => <Part key={y} geo={cyl(0.012, 0.012, 0.2, 6)} m={P.iron} p={[0.5, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />)}
    </group>
  )
}

/** Du linge sur un fil entre deux poteaux (la ligne est le long de x) : chemise, drap, torchons. */
export function Laundry({ p, len = 3 }: { p: V3; len?: number }) {
  const items: { x: number; w: number; h: number; c: number }[] = [
    { x: 0.38, w: 0.4, h: 0.5, c: 1 }, { x: 0.98, w: 0.56, h: 0.72, c: 0 }, { x: 1.55, w: 0.32, h: 0.38, c: 2 },
    { x: 2.0, w: 0.36, h: 0.42, c: 3 }, { x: 2.52, w: 0.44, h: 0.56, c: 4 },
  ]
  return (
    <group position={p}>
      {[0, len].map((x) => <Part key={x} geo={cyl(0.075, 0.09, 1.5, 10)} m={R.post} p={[x, 0.75, 0]} castShadow={false} />)}
      {[0, len].map((x) => <Part key={`b${x}`} geo={SPH} m={R.post} p={[x, 1.52, 0]} scale={0.1} castShadow={false} />)}
      <Part geo={cyl(0.02, 0.02, len, 5)} m={R.dishOut} p={[len / 2, 1.38, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      {items.map((it, i) => (
        <group key={i} position={[it.x, 1.37, 0]} rotation-y={0.03 * (i % 2 ? 1 : -1)}>
          <Part geo={rbox(it.w, it.h, 0.015, 0.006)} m={R.cloth[it.c]} p={[0, -it.h / 2, 0]} castShadow={false} />
          {it.c === 1 && [-1, 1].map((s) => <Part key={s} geo={rbox(0.14, 0.11, 0.015, 0.006)} m={R.cloth[1]} p={[s * (it.w / 2 + 0.05), -0.07, 0]} rotation-z={s * 0.7} castShadow={false} />)}
          {[-0.4, 0.4].map((s) => <Part key={s} geo={rbox(0.025, 0.05, 0.02, 0.008)} m={P.iron} p={[s * it.w, 0.0, 0]} castShadow={false} />)}
        </group>
      ))}
    </group>
  )
}

/** Un petit potager de toit : deux caisses de bois (salades, tomates sur tuteurs) et un grand pot de tomates. */
export function RoofGarden({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {[0, 0.7].map((z, k) => (
        <group key={k} position={[0, 0, z]}>
          <Part geo={rbox(0.95, 0.28, 0.42, 0.03)} m={R.wood} p={[0, 0.14, 0]} castShadow={false} />
          <Part geo={rbox(0.84, 0.03, 0.32, 0.01)} m={R.soil} p={[0, 0.292, 0]} castShadow={false} />
          {[-0.32, -0.1, 0.12, 0.34].map((x, i) => k === 0
            ? <Part key={x} geo={SPH} m={R.lettuce} p={[x, 0.33, i % 2 ? 0.05 : -0.05]} scale={[0.1, 0.06, 0.1]} castShadow={false} />
            : <group key={x} position={[x, 0.3, 0]}>
                <Part geo={cyl(0.008, 0.008, 0.75, 5)} m={R.wood} p={[0, 0.37, 0]} castShadow={false} />
                <Part geo={SPH} m={P.leaf} p={[0, 0.3, 0]} scale={[0.1, 0.14, 0.09]} castShadow={false} />
                <Part geo={SPH} m={R.tomato} p={[0.06, 0.22, 0.05]} scale={0.04} castShadow={false} />
                <Part geo={SPH} m={R.tomato} p={[-0.05, 0.4, 0.04]} scale={0.04} castShadow={false} />
              </group>)}
        </group>
      ))}
      <group position={[1.2, 0, 0.35]}>
        <Part geo={cyl(0.2, 0.15, 0.32, 14)} m={P.pot} p={[0, 0.16, 0]} castShadow={false} />
        <Part geo={cyl(0.19, 0.19, 0.02, 14)} m={R.soil} p={[0, 0.325, 0]} castShadow={false} />
        <Part geo={cyl(0.01, 0.01, 0.9, 5)} m={R.wood} p={[0, 0.7, 0]} castShadow={false} />
        <Part geo={SPH} m={P.leaf} p={[0, 0.6, 0]} scale={[0.17, 0.22, 0.16]} castShadow={false} />
        <Part geo={SPH} m={R.tomato} p={[0.13, 0.48, 0.08]} scale={0.05} castShadow={false} />
        <Part geo={SPH} m={R.tomato} p={[-0.1, 0.68, 0.1]} scale={0.05} castShadow={false} />
      </group>
    </group>
  )
}

const DISH = new SphereGeometry(1, 20, 8, 0, Math.PI * 2, Math.PI - 0.8, 0.8)
/** Une parabole sur un mât, tournée vers le sud-est : cuvette creuse crème à fond sombre, bras et récepteur rouge. */
export function Dish({ p, ry = Math.PI / 4 }: { p: V3; ry?: number }) {
  return (
    <group position={p} rotation-y={ry} scale={1.25}>
      <Part geo={rbox(0.26, 0.06, 0.26, 0.025)} m={R.post} p={[0, 0.03, 0]} castShadow={false} />
      <Part geo={cyl(0.045, 0.055, 1.0, 10)} m={P.antenna} p={[0, 0.55, 0]} castShadow={false} />
      <group position={[0, 1.05, 0.06]} rotation-x={1.0}>
        <Part geo={DISH} m={R.dishOut} scale={[0.5, 0.36, 0.5]} p={[0, 0.34, 0]} castShadow={false} />
        <Part geo={DISH} m={R.dishIn} scale={[0.47, 0.34, 0.47]} p={[0, 0.355, 0]} castShadow={false} />
        <Part geo={cyl(0.02, 0.02, 0.42, 6)} m={P.antenna} p={[0, 0.3, 0]} castShadow={false} />
        <Part geo={cyl(0.045, 0.035, 0.12, 8)} m={R.lnb} p={[0, 0.54, 0]} castShadow={false} />
        <Part geo={cyl(0.03, 0.05, 0.1, 8)} m={P.iron} p={[0, -0.04, -0.0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Un pigeon : corps rond, gorge irisée, tête, bec rose, queue ; il regarde le long de +z (tourné par `ry`). */
export function Pigeon({ p, ry = 0, s = 1.4 }: { p: V3; ry?: number; s?: number }) {
  return (
    <group position={p} rotation-y={ry} scale={s}>
      <Part geo={SPH} m={R.pigeon} p={[0, 0.09, 0]} scale={[0.065, 0.062, 0.1]} castShadow={false} />
      <Part geo={SPH} m={R.pigeonNeck} p={[0, 0.125, 0.065]} scale={[0.05, 0.05, 0.05]} castShadow={false} />
      <Part geo={SPH} m={R.pigeon} p={[0, 0.17, 0.095]} scale={0.04} castShadow={false} />
      <Part geo={cyl(0.003, 0.012, 0.035, 5)} m={R.beak} p={[0, 0.17, 0.14]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(0.07, 0.012, 0.1, 0.005)} m={R.pigeon} p={[0, 0.09, -0.12]} rotation-x={0.15} castShadow={false} />
      {[-0.025, 0.025].map((x) => <Part key={x} geo={cyl(0.005, 0.005, 0.04, 4)} m={R.beak} p={[x, 0.02, 0.01]} castShadow={false} />)}
    </group>
  )
}

/** Une lucarne de loin : corps de zinc, encadrement, vitre qui s'allume, petit toit. */
function FarDormer({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(0.56, 0.74, 0.52, 0.04)} m={R.farZinc} p={[0, 0, -0.02]} castShadow={false} />
      <Part geo={rbox(0.66, 0.1, 0.12, 0.025)} m={R.farTrim} p={[0, 0.34, 0.29]} castShadow={false} />
      <Part geo={rbox(0.38, 0.55, 0.02, 0.008)} m={R.farGlass} p={[0, -0.04, 0.26]} castShadow={false} />
      <Part geo={rbox(0.62, 0.06, 0.12, 0.02)} m={R.farTrim} p={[0, -0.36, 0.3]} castShadow={false} />
      <Part geo={rbox(0.7, 0.07, 0.62, 0.03)} m={R.farZinc} p={[0, 0.42, 0.0]} castShadow={false} />
    </group>
  )
}

function FarChimney({ p, pots = 3, ry = 0 }: { p: V3; pots?: number; ry?: number }) {
  const w = 0.26 * pots + 0.14
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(w, 1.1, 0.46, 0.04)} m={R.farPlaster} p={[0, 0.55, 0]} castShadow={false} />
      <Part geo={rbox(w + 0.1, 0.08, 0.56, 0.03)} m={R.farTrim} p={[0, 1.12, 0]} castShadow={false} />
      {Array.from({ length: pots }, (_, i) => <Part key={i} geo={cyl(0.08, 0.095, 0.34, 10)} m={R.farPot} p={[-0.13 * (pots - 1) + i * 0.26, 1.34, 0]} castShadow={false} />)}
    </group>
  )
}

export interface FarProps { x0: number; x1: number; z0: number; z1: number; wall: number; top: number; s?: number; dormers?: [number, number]; chimney?: [number, number] }

/** Un immeuble lointain (13 à 17 m du centre) : pierre pâle, brisis et terrasson de zinc à joints, lucarnes et souches. Bas et voilé. */
export function FarBlock({ x0, x1, z0, z1, wall, top, s = 0, dormers = [2, 2], chimney }: FarProps) {
  const w = x1 - x0, d = z1 - z0, B = -8, h = wall - B, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2
  const roof = useMemo(() => mansardGeo(w, d), [w, d])
  const wallGeo = (len: number) => {
    const g = new PlaneGeometry(len, h), uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (len / 3.2), uv.getY(i) * (h / 3.2))
    return g
  }
  const front = useMemo(() => wallGeo(w), [w, h]) // eslint-disable-line react-hooks/exhaustive-deps
  const side = useMemo(() => wallGeo(d), [d, h]) // eslint-disable-line react-hooks/exhaustive-deps
  const ty = (wall + BRISIS + top) / 2, th = top - wall - BRISIS + 0.12
  return (
    <group>
      <Part geo={rbox(w, h - 0.03, d, 0.05)} m={R.farStone} p={[cx, B + (h - 0.03) / 2, cz]} castShadow={false} />
      <mesh geometry={front} material={R.farWall[s % 2]} position={[cx, B + h / 2, z1 + 0.006]} raycast={noRay} />
      <mesh geometry={side} material={R.farWall[s % 2]} position={[x1 + 0.006, B + h / 2, cz]} rotation-y={Math.PI / 2} raycast={noRay} />
      <Part geo={rbox(w + 0.24, 0.2, d + 0.24, 0.06)} m={R.farTrim} p={[cx, wall - 0.1, cz]} castShadow={false} />
      <Part geo={roof} m={R.farZinc} p={[cx, wall, cz]} castShadow={false} />
      <Part geo={rbox(w - INSET * 2 + 0.1, th, d - INSET * 2 + 0.1, 0.04)} m={R.farTrim} p={[cx, ty, cz]} castShadow={false} />
      <Terrasson cx={cx} cz={cz} w={w - INSET * 2 + 0.06} d={d - INSET * 2 + 0.06} y={ty + th / 2 + 0.012} far />
      {Array.from({ length: dormers[0] }, (_, i) => <FarDormer key={`z${i}`} p={[x0 + (w * (i + 0.5)) / dormers[0], wall + 1.0, z1 - INSET * 0.6]} ry={0} />)}
      {Array.from({ length: dormers[1] }, (_, i) => <FarDormer key={`x${i}`} p={[x1 - INSET * 0.6, wall + 1.0, z0 + (d * (i + 0.5)) / dormers[1]]} ry={Math.PI / 2} />)}
      {chimney && <FarChimney p={[cx + chimney[0], top + 0.06, cz + chimney[1]]} pots={3} />}
    </group>
  )
}
