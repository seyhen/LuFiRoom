import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CircleGeometry, type Group, type Mesh } from 'three'
import { approach } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Leaf } from '../nature/Leaf'
import { Rock } from '../nature/Rock'
import { Part, SPH, cyl, noRay, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { Vessel, innerR } from '../igloo/Vessel'
import { D } from './materials'

/** Le centre de la mare (dans la pièce) et ses rayons : l'eau, puis le sable mouillé autour. */
export const POND = { at: [1.85, 0, -1.0] as V3, rx: 0.95, rz: 0.75, wx: 1.3, wz: 1.05 }
const WATER_Y = 0.03
// la source : une pierre à 0,55 de haut, dans le fond de la mare ; le filet tombe devant, vers la caméra
const SPRING: V3 = [0.5, 0, -0.5]
const LIP_Y = 0.56
const SPLASH: V3 = [0.5 + 0.1, WATER_Y + 0.004, -0.5 + 0.1]
const DISC = new CircleGeometry(1, 44)

/** Un bouquet de roseaux : des lames lancéolées qui partent en éventail, certaines retombant, d'autres sèches ; quelques massettes. */
function Reeds({ p, n = 9, s = 1, seed = 0, cattails = 2 }: { p: V3; n?: number; s?: number; seed?: number; cattails?: number }) {
  const mats = [D.reed, D.reed2, D.reedDry]
  return (
    <group position={p} scale={s}>
      {Array.from({ length: n }, (_, i) => {
        const az = (i / n) * Math.PI * 2 + seed + i * 0.3, lean = 1.05 + ((i * 7 + seed * 3) % 5) * 0.08, len = 0.75 + ((i * 5 + seed) % 4) * 0.14
        return (
          <group key={i} rotation-y={az}>
            <Leaf kind="lance" w={0.034} l={len} m={mats[(i + seed) % 3]} p={[0, 0, 0.03 + (i % 3) * 0.02]} r={[-lean, 0, 0]} />
          </group>
        )
      })}
      {Array.from({ length: cattails }, (_, i) => {
        const az = i * 2.4 + seed * 2, h = 0.95 + i * 0.12
        return (
          <group key={`c${i}`} rotation-y={az} position={[0, 0, 0]}>
            <group position={[0.06, 0, 0.02]} rotation-z={-0.07 - i * 0.03}>
              <Part geo={cyl(0.008, 0.011, h, 6)} m={D.reedDry} p={[0, h / 2, 0]} castShadow={false} />
              <Part geo={cyl(0.026, 0.024, 0.17, 8)} m={D.cattail} p={[0, h - 0.04, 0]} castShadow={false} />
              <Part geo={cyl(0.004, 0.012, 0.08, 6)} m={D.reedDry} p={[0, h + 0.09, 0]} castShadow={false} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

/**
 * La mare (objet « source » : le clapotis) : une petite nappe turquoise bordée de sable mouillé, de galets plats et de deux
 * bouquets de roseaux avec leurs massettes, quatre nénuphars, un seau de cuir au bord ; au fond, un chaos de grès roux d'où tombe un
 * filet d'eau (il s'amincit quand le son se tait). Quand la source joue, des ronds s'élargissent à l'endroit où le filet touche l'eau.
 * `position` est le centre de la mare, au sol.
 */
export function Pond() {
  const g = useRef<Group>(null!), stream = useRef<Mesh>(null!), rings = useRef<(Mesh | null)[]>([])
  const st = useRef({ on: 0, ph: 0 })
  const ringMats = useMemo(() => [0, 1, 2].map(() => D.ring.clone()), [])
  useEffect(() => () => ringMats.forEach((m) => m.dispose()), [ringMats])
  useSquash('waterhole', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.on = approach(s.on, isActive(useStore.getState(), 'waterhole') ? 1 : 0, dt * 1.2)
    s.ph += dt * (0.4 + s.on * 1.1)
    // le filet : une texture qui descend, plus large et plus claire quand la source joue
    D.stream.map!.offset.y = -s.ph
    stream.current.scale.set(0.45 + s.on * 0.55, 1, 1)
    D.stream.opacity = 0.5 + s.on * 0.35
    // les ronds : trois anneaux décalés d'un tiers de période, qui s'élargissent et s'effacent
    const t = clock.elapsedTime
    rings.current.forEach((m, i) => {
      if (!m) return
      const k = reduceMotion ? 0.5 : (t * 0.55 + i / 3) % 1, r = 0.06 + k * 0.5
      m.scale.set(r, r * 0.8, 1)
      ringMats[i].opacity = Math.sin(Math.PI * k) * 0.7 * s.on
      m.visible = s.on > 0.02
    })
  })
  return (
    <group ref={g} userData={{ id: 'waterhole' }} position={POND.at}>
      <Static>
        {/* le sable mouillé autour : un rond sombre qui s'éteint (transparent : il reste hors fusion, un seul tracé) */}
        {/* les galets plats du bord, serrés devant, plus gros derrière */}
        {Array.from({ length: 13 }, (_, i) => {
          const a = (i / 13) * Math.PI * 2 + 0.2, r = 1.02 + ((i * 3) % 4) * 0.015
          const x = Math.cos(a) * POND.rx * r, z = Math.sin(a) * POND.rz * r
          if (z < -0.35 && x > -0.2 && x < 0.9) return null // la source est là
          return <Rock key={i} v={6 + (i % 2)} p={[x, -0.02, z]} s={[0.15 + (i % 3) * 0.04, 0.06 + (i % 2) * 0.025, 0.11 + (i % 4) * 0.02]} ry={a * 2} m={i % 3 ? D.stone : D.stoneDark} shadow={false} />
        })}
        {/* le chaos de grès d'où sort la source : trois blocs, des galets, de l'algue verte au ras de l'eau */}
        <Rock v={1} p={[SPRING[0], -0.03, SPRING[2] - 0.15]} s={[0.36, LIP_Y + 0.03, 0.32]} ry={0.5} m={D.stone} moss={D.algae} />
        <Rock v={4} p={[SPRING[0] - 0.42, -0.03, SPRING[2] - 0.1]} s={[0.26, 0.4, 0.24]} ry={1.9} m={D.stoneDark} moss={D.algae} />
        <Rock v={2} p={[SPRING[0] + 0.45, -0.03, SPRING[2] - 0.2]} s={[0.24, 0.3, 0.26]} ry={3.1} m={D.stone} moss={D.algae} />
        <Rock v={7} p={[SPRING[0] + 0.1, -0.02, SPRING[2] + 0.18]} s={[0.17, 0.07, 0.13]} ry={0.8} m={D.stoneDark} shadow={false} />
        {/* le bec de pierre : une dalle penchée sur le bloc, d'où part le filet */}
        <Part geo={SPH} m={D.stoneDark} scale={[0.1, 0.035, 0.08]} p={[SPRING[0] + 0.06, LIP_Y + 0.0, SPRING[2] + 0.12]} rotation={[0.2, 0.7, -0.3]} castShadow={false} />
        {/* les roseaux de chaque côté, les nénuphars sur l'eau */}
        <Reeds p={[-0.88, 0, -0.32]} n={10} s={1.1} seed={1} cattails={3} />
        <Reeds p={[0.98, 0, 0.18]} n={8} s={0.9} seed={4} cattails={2} />
        <Reeds p={[-0.15, 0, -0.78]} n={6} s={0.85} seed={7} cattails={0} />
        {[[-0.35, 0.18, 0.4, 0], [-0.08, 0.34, 0.3, 1.7], [0.28, 0.12, 0.32, 3.3], [-0.52, -0.1, 0.26, 2.2]].map(([x, z, w, ry], i) => (
          <group key={i} position={[x, WATER_Y + 0.012, z]} rotation-y={ry}>
            <Leaf kind="round" w={w * 0.38} l={w * 0.38} m={D.lily} p={[0, 0, -w * 0.18]} />
          </group>
        ))}
        {/* le seau de cuir au bord de l'eau : un cylindre cousu, une anse de corde, un peu d'eau dedans */}
        <group position={[-0.62, 0, 0.62]} rotation-y={0.4}>
          <Vessel p={[0, 0.0, 0]} rt={0.12} rb={0.095} h={0.2} m={D.leather} inner={D.leatherDark} rim={D.leatherDark} t={0.008} />
          <Part geo={cyl(innerR(0.12, 0.095, 0.2, 0.12, 0.008), innerR(0.12, 0.095, 0.2, 0.12, 0.008), 0.004, 20)} m={D.water} p={[0, 0.12, 0]} castShadow={false} />
          <Part m={D.rope} p={[0, 0.2, 0]} rotation-y={Math.PI / 2} castShadow={false}><torusGeometry args={[0.12, 0.007, 6, 20, Math.PI]} /></Part>
          {[0.06, 0.13].map((y) => <Part key={y} geo={cyl(0.1 + y * 0.2, 0.1 + y * 0.2, 0.012, 20)} m={D.rope} p={[0, y + 0.01, 0]} castShadow={false} />)}
        </group>
      </Static>
      <mesh geometry={DISC} material={D.wet} position={[0, 0.006, 0]} rotation-x={-Math.PI / 2} scale={[POND.wx, POND.wz, 1]} raycast={noRay} />
      <group userData={LIVE}>
        <mesh geometry={DISC} material={D.water} position={[0, WATER_Y, 0]} rotation-x={-Math.PI / 2} scale={[POND.rx, POND.rz, 1]} receiveShadow raycast={noRay} renderOrder={1} />
        {/* le filet d'eau, du bec à la mare : un plan debout vers la caméra, dont la texture descend */}
        <mesh ref={stream} material={D.stream} position={[SPRING[0] + 0.06, (LIP_Y + WATER_Y) / 2 - 0.01, SPRING[2] + 0.12]} rotation-y={Math.PI / 4} raycast={noRay} renderOrder={2}>
          <planeGeometry args={[0.06, LIP_Y - WATER_Y - 0.02]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} ref={(m) => { rings.current[i] = m }} material={ringMats[i]} position={SPLASH} rotation-x={-Math.PI / 2} raycast={noRay} renderOrder={3}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
