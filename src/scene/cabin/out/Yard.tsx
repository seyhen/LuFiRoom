import { useMemo } from 'react'
import { CatmullRomCurve3, TorusGeometry, TubeGeometry, Vector3 } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../../parts'
import { O } from './materials'
import { snowY } from './ground'
import { between } from './Woodshed'

const tube = (pts: V3[], r: number, seg = 40) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), seg, r, 8, false)
const RING = new TorusGeometry(1, 0.32, 10, 28)

/** Un bâton entre deux points (bras du bonhomme, brindilles). */
function Stick({ a, b, r = 0.022, m = O.twig }: { a: V3; b: V3; r?: number; m?: typeof O.twig }) {
  const s = between(a, b)
  return (
    <>
      <Part geo={cyl(r * 0.7, r, s.len, 7)} m={m} p={s.p} rotation={s.r} />
      <Part geo={SPH} m={m} p={b} scale={r * 0.7} castShadow={false} />
    </>
  )
}

/**
 * Le bonhomme de neige, tourné vers la caméra : trois boules tassées, yeux et sourire de charbon, nez de carotte, boutons, bras de
 * branches, bonnet de laine canneberge à pompon et écharpe tricotée dont un pan retombe.
 */
export function Snowman({ x, z }: { x: number; z: number }) {
  const g = snowY(x, z)
  const smile = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const a = -0.5 + (i / 4) * 1.0
    return [Math.sin(a) * 0.1, 1.36 - Math.cos(a) * 0.035 + 0.035, 0.2 - Math.abs(Math.sin(a)) * 0.02] as V3
  }), [])
  return (
    <group position={[x, g, z]} rotation-y={Math.PI / 4 - 0.15}>
      <Part geo={SPH} m={O.snowball} p={[0, 0.33, 0]} scale={[0.44, 0.4, 0.44]} />
      <Part geo={SPH} m={O.snowball} p={[0, 0.92, 0]} scale={[0.32, 0.3, 0.32]} />
      <Part geo={SPH} m={O.snowball} p={[0, 1.38, 0]} scale={0.22} />
      {/* un bourrelet de neige au pied */}
      <Part geo={SPH} m={O.snowCap} p={[0, 0.02, 0]} scale={[0.56, 0.08, 0.56]} castShadow={false} />
      {/* le visage */}
      {[-0.075, 0.075].map((ex) => <Part key={ex} geo={SPH} m={O.coal} p={[ex, 1.44, 0.19]} scale={[0.028, 0.032, 0.02]} castShadow={false} />)}
      {smile.map((p, i) => <Part key={i} geo={SPH} m={O.coal} p={p} scale={0.016} castShadow={false} />)}
      <Part geo={cyl(0.006, 0.042, 0.2, 12)} m={O.carrot} p={[0, 1.4, 0.3]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={SPH} m={O.carrot} p={[0, 1.4, 0.4]} scale={0.008} castShadow={false} />
      {/* les boutons */}
      {[[0.83, 0.3], [0.95, 0.31], [1.07, 0.28]].map(([y, d]) => <Part key={y} geo={SPH} m={O.coal} p={[0, y, d]} scale={[0.03, 0.03, 0.02]} castShadow={false} />)}
      {/* les bras : deux branches avec leurs doigts */}
      <Stick a={[-0.27, 1.0, 0]} b={[-0.66, 1.26, 0.06]} />
      <Stick a={[-0.56, 1.19, 0.04]} b={[-0.66, 1.37, 0.03]} r={0.012} />
      <Stick a={[0.27, 1.0, 0]} b={[0.64, 0.86, 0.12]} />
      <Stick a={[0.55, 0.9, 0.1]} b={[0.68, 0.96, 0.2]} r={0.012} />
      {/* l'écharpe : un tour autour du cou, un pan qui retombe devant, deux rayures crème */}
      <Part geo={RING} m={O.scarf} p={[0, 1.18, 0]} rotation-x={Math.PI / 2} scale={[0.2, 0.2, 0.18]} />
      <group position={[0.1, 1.06, 0.2]} rotation={[0.15, 0, -0.12]}>
        <Part geo={rbox(0.1, 0.3, 0.04, 0.018)} m={O.scarf} />
        {[0.06, -0.06].map((y) => <Part key={y} geo={rbox(0.104, 0.03, 0.044, 0.01)} m={O.scarfCream} p={[0, y, 0]} castShadow={false} />)}
        {[-0.03, 0, 0.03].map((fx) => <Part key={fx} geo={cyl(0.008, 0.008, 0.06, 5)} m={O.scarfCream} p={[fx, -0.17, 0]} castShadow={false} />)}
      </group>
      {/* le bonnet et son pompon */}
      <Part geo={SPH} m={O.scarf} p={[0, 1.5, -0.01]} scale={[0.2, 0.15, 0.2]} />
      <Part geo={RING} m={O.scarfCream} p={[0, 1.52, -0.01]} rotation-x={Math.PI / 2 - 0.12} scale={[0.19, 0.19, 0.16]} castShadow={false} />
      <Part geo={SPH} m={O.scarfCream} p={[0, 1.68, -0.02]} scale={0.065} />
    </group>
  )
}

/** La luge garée près du bonhomme : patins rouges qui se recourbent, lattes de bois, corde, et un paquet vert ficelé d'or. */
export function Sled({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const g = snowY(x, z) - 0.01
  const runners = useMemo(() => [-0.22, 0.22].map((s) => tube([[-0.55, 0.03, s], [0.25, 0.03, s], [0.47, 0.07, s], [0.56, 0.22, s], [0.48, 0.33, s], [0.38, 0.3, s]], 0.024)), [])
  const rope = useMemo(() => tube([[0.5, 0.31, -0.2], [0.72, 0.2, -0.14], [0.92, 0.03, 0.0], [0.98, 0.02, 0.22], [0.78, 0.04, 0.34], [0.5, 0.31, 0.2]], 0.012, 50), [])
  return (
    <group position={[x, g, z]} rotation-y={ry}>
      {runners.map((geo, i) => <Part key={i} geo={geo} m={O.runner} />)}
      {[-0.4, -0.05, 0.28].flatMap((sx) => [-0.22, 0.22].map((sz) => (
        <Part key={`${sx}${sz}`} geo={cyl(0.018, 0.018, 0.15, 6)} m={O.runner} p={[sx, 0.11, sz]} castShadow={false} />
      )))}
      {[-0.46, -0.28, -0.1, 0.08, 0.26].map((sx) => <Part key={sx} geo={rbox(0.15, 0.035, 0.56, 0.015)} m={O.slat} p={[sx, 0.2, 0]} />)}
      <Part geo={rope} m={O.rope} castShadow={false} />
      {/* le paquet */}
      <group position={[-0.12, 0.34, 0]} rotation-y={0.25}>
        <Part geo={rbox(0.34, 0.24, 0.3, 0.04)} m={O.giftGreen} />
        <Part geo={rbox(0.06, 0.248, 0.305, 0.02)} m={O.ribbon} castShadow={false} />
        <Part geo={rbox(0.345, 0.248, 0.06, 0.02)} m={O.ribbon} castShadow={false} />
        {[-1, 1].map((s) => <Part key={s} geo={RING} m={O.ribbon} p={[s * 0.045, 0.15, 0]} rotation={[0, s * 0.5, s * 0.6]} scale={[0.05, 0.035, 0.05]} castShadow={false} />)}
        <Part geo={SPH} m={O.snowCap} p={[0.06, 0.125, 0.06]} scale={[0.09, 0.02, 0.07]} castShadow={false} />
      </group>
    </group>
  )
}

/** La barrière de perches, à moitié dans la neige : des poteaux coiffés de neige et deux perches entre chacun. */
export function Fence({ posts }: { posts: [number, number][] }) {
  const pts = posts.map(([x, z]): V3 => [x, snowY(x, z), z])
  return (
    <group>
      {pts.map((p, i) => (
        <group key={i} position={p}>
          <Part geo={rbox(0.13, 1.0, 0.13, 0.04)} m={O.plankDark} p={[0, 0.38, 0]} rotation-y={0.3 * i} />
          <Part geo={SPH} m={O.snowCap} p={[0, 0.9, 0]} scale={[0.1, 0.07, 0.1]} castShadow={false} />
        </group>
      ))}
      {pts.slice(1).flatMap((b, i) => {
        const a = pts[i]
        return [0.35, 0.68].map((h) => {
          const s = between([a[0], a[1] + h, a[2]], [b[0], b[1] + h + (i % 2 ? 0.03 : -0.02), b[2]])
          return (
            <group key={`${i}${h}`}>
              <Part geo={cyl(0.045, 0.05, s.len + 0.18, 8)} m={O.plank} p={s.p} rotation={s.r} />
              {h > 0.5 && <Part geo={cyl(0.035, 0.035, s.len - 0.1, 6)} m={O.snowCap} p={[s.p[0], s.p[1] + 0.05, s.p[2]]} rotation={s.r} castShadow={false} />}
            </group>
          )
        })
      })}
    </group>
  )
}

const BRACE = between([0, 1.7, 0], [0.32, 1.97, 0])

/**
 * Le lampadaire du sentier : un poteau de bois, une potence, la lanterne de fer à vitres dorées (elle s'allume le soir), un brin de
 * houx à baies rouges noué au poteau, un chapeau de neige.
 */
export function LampPost({ x, z }: { x: number; z: number }) {
  const g = snowY(x, z)
  return (
    <group position={[x, g, z]}>
      <Part geo={cyl(0.055, 0.07, 2.1, 10)} m={O.plankDark} p={[0, 1.0, 0]} />
      <Part geo={SPH} m={O.snowCap} p={[0, 0.05, 0]} scale={[0.2, 0.07, 0.2]} castShadow={false} />
      {/* la potence */}
      <Part geo={rbox(0.5, 0.06, 0.06, 0.02)} m={O.plankDark} p={[0.2, 1.98, 0]} />
      <Part geo={cyl(0.02, 0.02, BRACE.len, 6)} m={O.iron} p={BRACE.p} rotation={BRACE.r} castShadow={false} />
      <Part geo={rbox(0.5, 0.05, 0.08, 0.025)} m={O.snowCap} p={[0.2, 2.04, 0]} castShadow={false} />
      {/* la lanterne */}
      <group position={[0.4, 1.62, 0]}>
        <Part geo={cyl(0.012, 0.012, 0.2, 6)} m={O.iron} p={[0, 0.25, 0]} castShadow={false} />
        <Part geo={cyl(0.04, 0.17, 0.1, 4)} m={O.iron} p={[0, 0.18, 0]} rotation-y={Math.PI / 4} />
        <Part geo={SPH} m={O.snowCap} p={[0, 0.22, 0]} scale={[0.1, 0.04, 0.1]} castShadow={false} />
        <Part geo={rbox(0.18, 0.24, 0.18, 0.03)} m={O.lanternGlass} p={[0, 0.01, 0]} />
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => <Part key={`${sx}${sz}`} geo={rbox(0.025, 0.26, 0.025, 0.008)} m={O.iron} p={[sx * 0.095, 0.01, sz * 0.095]} castShadow={false} />)}
        <Part geo={rbox(0.22, 0.04, 0.22, 0.015)} m={O.iron} p={[0, -0.13, 0]} castShadow={false} />
        <Part geo={SPH} m={O.iron} p={[0, -0.17, 0]} scale={0.03} castShadow={false} />
      </group>
      {/* le houx noué au poteau, avec un ruban */}
      <group position={[0.07, 1.42, 0.03]}>
        <Part geo={RING} m={O.berry} rotation-x={Math.PI / 2} scale={[0.075, 0.075, 0.08]} p={[-0.07, 0, -0.03]} castShadow={false} />
        {[[0.06, 0.04, 0.6], [0.02, -0.05, -0.5], [0.09, -0.01, 0.1]].map(([dx, dy, a], i) => (
          <Part key={i} geo={SPH} m={O.holly} p={[dx, dy, 0.06]} rotation={[0.3, 0.4, a]} scale={[0.08, 0.035, 0.012]} castShadow={false} />
        ))}
        {[[0.03, 0.0], [0.05, 0.025], [0.0, 0.02]].map(([dx, dy], i) => <Part key={i} geo={SPH} m={O.berry} p={[dx, dy, 0.08]} scale={0.022} castShadow={false} />)}
      </group>
    </group>
  )
}

/**
 * Le banc de la clairière, tourné vers la caméra : pieds de rondins, assise et dossier de planches sous un coussin de neige, une
 * moufle oubliée sur l'accoudoir et une tasse émaillée posée à côté (quelqu'un vient y regarder la neige tomber).
 */
export function Bench({ x, z, ry = Math.PI / 4 }: { x: number; z: number; ry?: number }) {
  const g = snowY(x, z) - 0.02
  return (
    <group position={[x, g, z]} rotation-y={ry}>
      {/* les pieds : deux rondins de chaque côté, enfoncés dans la neige */}
      {[-0.62, 0.62].flatMap((dx) => [-0.14, 0.14].map((dz) => (
        <Part key={`${dx}${dz}`} geo={cyl(0.055, 0.065, 0.46, 9)} m={O.plankDark} p={[dx, 0.2, dz]} />
      )))}
      {/* l'assise : trois planches, et le coussin de neige dessus */}
      {[-0.13, 0, 0.13].map((dz) => <Part key={dz} geo={rbox(1.5, 0.05, 0.12, 0.02)} m={O.plank} p={[0, 0.45, dz]} />)}
      <Part geo={rbox(1.36, 0.07, 0.36, 0.035)} m={O.snowCap} p={[-0.06, 0.505, 0]} castShadow={false} />
      {/* le dossier : deux montants, deux planches, un bourrelet de neige sur le haut */}
      {[-0.62, 0.62].map((dx) => <Part key={dx} geo={rbox(0.08, 0.5, 0.06, 0.02)} m={O.plankDark} p={[dx, 0.7, -0.2]} rotation-x={-0.12} />)}
      {[0.66, 0.86].map((y) => <Part key={y} geo={rbox(1.5, 0.11, 0.045, 0.02)} m={O.plank} p={[0, y, -0.2 - (y - 0.45) * 0.12]} rotation-x={-0.12} />)}
      <Part geo={rbox(1.46, 0.04, 0.08, 0.02)} m={O.snowCap} p={[0, 0.935, -0.255]} castShadow={false} />
      {/* la moufle oubliée et la tasse */}
      <group position={[0.6, 0.555, 0.04]} rotation-y={0.4}>
        <Part geo={rbox(0.15, 0.05, 0.2, 0.024)} m={O.scarf} />
        <Part geo={rbox(0.06, 0.045, 0.08, 0.02)} m={O.scarf} p={[0.09, 0, 0.03]} rotation-y={-0.5} castShadow={false} />
        <Part geo={rbox(0.16, 0.055, 0.05, 0.02)} m={O.scarfCream} p={[0, 0.003, -0.11]} castShadow={false} />
      </group>
      <group position={[-0.5, 0.54, 0.06]}>
        <Part geo={cyl(0.055, 0.05, 0.11, 14)} m={O.runner} p={[0, 0.055, 0]} castShadow={false} />
        <Part geo={cyl(0.057, 0.057, 0.012, 14)} m={O.scarfCream} p={[0, 0.113, 0]} castShadow={false} />
        <Part geo={RING} m={O.runner} p={[0.065, 0.055, 0]} scale={[0.035, 0.035, 0.08]} castShadow={false} />
      </group>
    </group>
  )
}

/** La pelle à neige plantée dans un tas de neige au bord du sentier : manche à poignée en D, pelle de tôle rouge. */
export function Shovel({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  const g = snowY(x, z)
  return (
    <group position={[x, g, z]} rotation-y={ry}>
      {/* le petit tas de neige derrière la pelle, et la pelle plantée devant, sa tôle tournée vers nous */}
      <Part geo={SPH} m={O.snowCap} p={[-0.1, 0, -0.16]} scale={[0.32, 0.15, 0.26]} castShadow={false} />
      <group rotation-z={-0.18}>
        <Part geo={rbox(0.32, 0.36, 0.035, 0.03)} m={O.runner} p={[0, 0.16, 0]} />
        <Part geo={rbox(0.34, 0.04, 0.05, 0.015)} m={O.steel} p={[0, 0.34, 0]} castShadow={false} />
        <Part geo={rbox(0.33, 0.03, 0.045, 0.012)} m={O.steel} p={[0, -0.01, 0]} castShadow={false} />
        <Part geo={cyl(0.025, 0.03, 0.8, 8)} m={O.slat} p={[0, 0.74, 0]} />
        <Part geo={RING} m={O.iron} p={[0, 1.2, 0]} scale={[0.07, 0.07, 0.09]} castShadow={false} />
      </group>
    </group>
  )
}
