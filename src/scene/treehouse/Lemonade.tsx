import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand } from '../../math'
import { rb } from './box'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, noRay, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion, useSquash } from '../anim'
import { Leaf } from '../nature/Leaf'
import { T } from './materials'

const TOP = 0.4 // le dessus de la caisse retournée (nappe comprise)
const P = { x: -0.06, z: 0.0, r: 0.1, h: 0.27, fill: 0.2 } // le pichet ; `fill` : la hauteur de la citronnade
const GLASS = { r: 0.048, h: 0.11 }

/** Un verre (ou le pichet) : la paroi ouverte, son fond épais, son bord. Transparent, il ne masque pas la citronnade. */
function Glassware({ p, r, h }: { p: V3; r: number; h: number }) {
  return (
    <group position={p}>
      <mesh material={T.pitcher} position={[0, h / 2, 0]} raycast={noRay} renderOrder={3}>
        <cylinderGeometry args={[r, r * 0.92, h, 24, 1, true]} />
      </mesh>
      <mesh material={T.pitcher} position={[0, 0.008, 0]} raycast={noRay} renderOrder={3}>
        <cylinderGeometry args={[r * 0.92, r * 0.92, 0.016, 24]} />
      </mesh>
      <mesh material={T.pitcher} position={[0, h, 0]} rotation-x={Math.PI / 2} raycast={noRay} renderOrder={3}>
        <torusGeometry args={[r - 0.002, 0.004, 6, 24]} />
      </mesh>
    </group>
  )
}

/** Une rondelle de citron : l'écorce jaune, la chair pâle des deux côtés. */
function Slice({ p, r = [0, 0, 0], s = 1 }: { p: V3; r?: V3; s?: number }) {
  return (
    <group position={p} rotation={r} scale={s}>
      <Part geo={cyl(0.038, 0.038, 0.012, 18)} m={T.lemon} castShadow={false} />
      <Part geo={cyl(0.032, 0.032, 0.014, 18)} m={T.lemonFlesh} castShadow={false} />
    </group>
  )
}

/**
 * La citronnade, sur une caisse à pommes retournée en guise de table, au devant de la cabane, sous une nappe à carreaux : le pichet
 * de verre (la citronnade trouble, des glaçons, des rondelles de citron, un brin de menthe), deux verres dont un entamé avec sa paille,
 * un demi-citron sur une petite planche et son couteau. C'est l'objet « les glaçons » : quand le son joue, des bulles montent dans
 * le pichet, et à chaque tintement qu'on entend un glaçon bouge et se cogne au verre.
 */
export function Lemonade({ position, ry = 0 }: { position: V3; ry?: number }) {
  const g = useRef<Group>(null!), cubes = useRef<Group[]>([]), bubbles = useRef<Mesh[]>([])
  const st = useRef({ seen: 0, knock: 0, who: 0, on: 0 })
  const bub = useMemo(() => Array.from({ length: 9 }, () => ({ x: rand(-0.06, 0.06), z: rand(-0.06, 0.06), y: rand(0, 1), sp: rand(0.15, 0.3) })), [])
  useSquash('lemonade', g)
  const ICE: V3[] = [[0.03, 0, 0.02], [-0.035, 0, 0.01], [0.0, 0, -0.04]]
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'lemonade')
    const n = 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !reduceMotion) { s.knock = 1; s.who = (s.who + 1) % ICE.length }
    }
    s.knock = Math.max(0, s.knock - dt * 2.2)
    s.on = approach(s.on, on ? 1 : 0, dt)
    cubes.current.forEach((c, i) => {
      const k = i === s.who ? s.knock : 0
      c.position.y = TOP + P.fill - 0.012 + Math.sin(k * Math.PI * 3) * 0.012 * k
      c.rotation.set(0.3 + i, i * 1.3 + k * 0.4, 0.2 + Math.sin(k * 9) * 0.15 * k)
    })
    bubbles.current.forEach((m, i) => {
      const b = bub[i]
      if (!reduceMotion) b.y += dt * b.sp
      if (b.y > 1) b.y = 0
      m.visible = s.on > 0.05
      m.position.set(P.x + b.x, TOP + 0.02 + b.y * (P.fill - 0.03), P.z + b.z)
      m.scale.setScalar(0.006 * s.on * (0.6 + b.y * 0.6))
    })
  })
  return (
    <group ref={g} userData={{ id: 'lemonade' }} position={position} rotation-y={ry}>
      <Static>
        {/* la caisse à pommes retournée : ses planches à claire-voie, ses montants, sa poignée découpée */}
        {[0.06, 0.18, 0.3].map((y) => (
          <group key={y}>
            <Part geo={rb(0.62, 0.08, 0.025, 0.01)} m={T.plank} p={[0, y, 0.21]} castShadow={false} />
            <Part geo={rb(0.62, 0.08, 0.025, 0.01)} m={T.plank} p={[0, y, -0.21]} castShadow={false} />
          </group>
        ))}
        {[-0.3, 0.3].map((x) => (
          <Part key={x} geo={rb(0.025, 0.37, 0.44, 0.01)} m={T.plankDark} p={[x, 0.185, 0]} />
        ))}
        <Part geo={rb(0.64, 0.025, 0.46, 0.01)} m={T.plank} p={[0, 0.37, 0]} />
        {/* la nappe à carreaux doux, qui retombe sur le devant */}
        <Part geo={rb(0.5, 0.012, 0.42, 0.005)} m={T.cloth} p={[0.02, 0.388, 0]} castShadow={false} />
        {[-0.15, 0.0, 0.15].map((x) => (
          <Part key={x} geo={rb(0.05, 0.014, 0.42, 0.004)} m={T.clothCheck} p={[0.02 + x, 0.389, 0]} castShadow={false} />
        ))}
        <Part geo={rb(0.5, 0.1, 0.012, 0.005)} m={T.cloth} p={[0.02, 0.34, 0.214]} castShadow={false} />
        {/* la citronnade dans le pichet (trouble, elle se voit derrière le verre), les rondelles collées à la paroi */}
        <Part geo={cyl(P.r - 0.008, P.r * 0.92 - 0.008, P.fill, 24)} m={T.lemonade} p={[P.x, TOP + 0.016 + P.fill / 2, P.z]} castShadow={false} />
        <Slice p={[P.x + 0.055, TOP + 0.12, P.z + 0.06]} r={[1.3, 0.7, 0]} />
        <Slice p={[P.x - 0.06, TOP + 0.08, P.z + 0.05]} r={[1.2, -0.6, 0]} s={0.9} />
        <Slice p={[P.x + 0.01, TOP + P.fill + 0.022, P.z + 0.03]} r={[0.15, 0, 0.1]} />
        {/* le brin de menthe qui dépasse du pichet */}
        <group position={[P.x - 0.03, TOP + P.fill + 0.01, P.z - 0.03]}>
          <Part geo={cyl(0.005, 0.005, 0.14, 4)} m={T.stem} p={[0, 0.05, 0]} rotation-z={0.25} castShadow={false} />
          {[0, 1, 2, 3].map((i) => (
            <group key={i} position={[-0.012 * i, 0.04 + i * 0.03, 0]} rotation-y={i * 2.2}>
              <Leaf kind="ovate" r={[-0.6, 0, 0]} w={0.022} l={0.05} m={T.fern} />
            </group>
          ))}
        </group>
        {/* le bec et l'anse du pichet */}
        <mesh material={T.pitcher} position={[P.x + P.r + 0.012, TOP + P.h - 0.02, P.z]} rotation-z={-0.6} raycast={noRay} renderOrder={3}>
          <cylinderGeometry args={[0.02, 0.04, 0.05, 12, 1, true]} />
        </mesh>
        <mesh material={T.pitcher} position={[P.x - P.r - 0.03, TOP + 0.15, P.z]} raycast={noRay} renderOrder={3}>
          <torusGeometry args={[0.06, 0.012, 8, 16]} />
        </mesh>
        {/* les deux verres : l'un plein, l'autre entamé avec sa paille rayée */}
        <Part geo={cyl(GLASS.r - 0.006, GLASS.r * 0.92 - 0.006, 0.08, 20)} m={T.lemonade} p={[0.17, TOP + 0.016 + 0.04, 0.1]} castShadow={false} />
        <Part geo={cyl(GLASS.r - 0.006, GLASS.r * 0.92 - 0.006, 0.045, 20)} m={T.lemonade} p={[0.15, TOP + 0.016 + 0.0225, -0.11]} castShadow={false} />
        <Part geo={cyl(0.007, 0.007, 0.2, 6)} m={T.terracotta} p={[0.165, TOP + 0.1, -0.11]} rotation-z={-0.25} castShadow={false} />
        <Slice p={[0.17 + GLASS.r, TOP + GLASS.h - 0.01, 0.1]} r={[0, 0, Math.PI / 2]} s={0.8} />
        {/* la petite planche, le demi-citron, le couteau */}
        <Part geo={rb(0.16, 0.018, 0.12, 0.008)} m={T.chestLight} p={[-0.16, TOP + 0.01, 0.13]} rotation-y={0.3} castShadow={false} />
        {/* le demi-citron, coupé vers le haut : la demi-sphère jaune, la chair pâle et ses quartiers */}
        <Part m={T.lemon} scale={[0.042, 0.04, 0.05]} p={[-0.17, TOP + 0.06, 0.14]} castShadow={false}>
          <sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        </Part>
        <Part geo={cyl(1, 1, 0.004, 18)} m={T.lemonFlesh} scale={[0.037, 1, 0.045]} p={[-0.17, TOP + 0.061, 0.14]} castShadow={false} />
        {[0, 1, 2].map((i) => (
          <Part key={i} geo={rb(0.06, 0.003, 0.004, 0.001)} m={T.lemon} p={[-0.17, TOP + 0.064, 0.14]} rotation-y={(i * Math.PI) / 3} castShadow={false} />
        ))}
        <Part geo={rb(0.09, 0.004, 0.016, 0.002)} m={T.chrome} p={[-0.13, TOP + 0.022, 0.08]} rotation-y={-0.5} castShadow={false} />
        <Part geo={rb(0.06, 0.012, 0.016, 0.005)} m={T.walnut} p={[-0.2, TOP + 0.024, 0.115]} rotation-y={-0.5} castShadow={false} />
      </Static>
      {/* le verre (dessiné après ce qu'il contient) */}
      <Glassware p={[P.x, TOP, P.z]} r={P.r} h={P.h} />
      <Glassware p={[0.17, TOP, 0.1]} r={GLASS.r} h={GLASS.h} />
      <Glassware p={[0.15, TOP, -0.11]} r={GLASS.r} h={GLASS.h} />
      {/* les glaçons qui flottent, et les bulles */}
      <group userData={LIVE}>
        {ICE.map((c, i) => (
          <group key={i} ref={(o) => o && (cubes.current[i] = o)} position={[P.x + c[0], TOP + P.fill, P.z + c[2]]}>
            <mesh geometry={rb(0.045, 0.04, 0.045, 0.012)} material={T.ice} />
          </group>
        ))}
        {bub.map((_, i) => <mesh key={i} ref={(m) => m && (bubbles.current[i] = m)} geometry={SPH} material={T.bubble} raycast={noRay} renderOrder={2} />)}
      </group>
    </group>
  )
}
