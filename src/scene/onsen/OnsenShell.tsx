import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { smooth } from '../../math'
import { Part, cyl, rbox } from '../parts'
import { mood } from '../anim'
import { O } from './materials'
import { Rock } from './Rocks'

/** La lumière chaude qui passe à travers les shōji, le soir. */
function ShojiGlow() {
  const light = useRef<PointLight>(null!)
  useFrame(() => {
    const e = smooth(mood.night)
    O.shoji.emissiveIntensity = 0.04 + e * 0.75
    light.current.intensity = e * 1.1 * Math.PI // × π : voir materials.ts
  })
  return <pointLight ref={light} color={0xffb877} intensity={0} distance={6} decay={1.5} position={[-2.3, 1.6, 0.2]} />
}

const ENGAWA = { x0: -3.0, x1: -1.95, z0: -2.7, z1: 3.05, top: 0.42 }
// La palissade de bambou, au fond : de -1.95 au bout du socle.
const FENCE_X = Array.from({ length: 52 }, (_, i) => -1.92 + i * 0.1).filter((x) => x < 3.18)

/**
 * Le sol de dalles moussues, l'aile du ryokan à gauche (poteaux de cèdre, shōji, avant-toit de tuiles), son engawa de bois,
 * et la palissade de bambou au fond.
 */
export function OnsenShell() {
  const { x0, x1, z0, z1, top } = ENGAWA
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={O.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={O.earth} p={[-0.07, -0.12, -0.07]} />
      <mesh material={O.flags} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      {/* l'aile du ryokan : le mur, les shōji, les poteaux, la frise d'enduit */}
      <Part geo={rbox(0.34, 3.3, 6.54, 0.06)} m={O.cedar} p={[-3.17, 1.65, -0.07]} />
      {[-1.5, -0.5, 0.5, 1.5].map((z) => (
        <mesh key={z} material={O.shoji} position={[-2.995, 1.55, z]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.96, 2.0]} />
        </mesh>
      ))}
      <mesh material={O.paper} position={[-2.995, 2.95, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[6.3, 0.62]} />
      </mesh>
      {[-2.0, -1.0, 0, 1.0, 2.0].map((z) => (
        <Part key={z} geo={rbox(0.08, 2.1, 0.08, 0.02)} m={O.cedar} p={[-2.97, 1.55, z]} castShadow={false} />
      ))}
      <Part geo={rbox(0.1, 0.1, 6.3, 0.02)} m={O.cedar} p={[-2.96, 2.62, 0]} castShadow={false} />
      {/* l'engawa : plancher de bois sur ses pieds, son poteau d'avant-toit */}
      <Part geo={rbox(x1 - x0, 0.08, z1 - z0, 0.02)} m={O.deck} p={[(x0 + x1) / 2, top - 0.04, (z0 + z1) / 2]} />
      <Part geo={rbox(x1 - x0 - 0.1, top - 0.08, z1 - z0 - 0.1, 0.02)} m={O.cedar} p={[(x0 + x1) / 2, (top - 0.08) / 2, (z0 + z1) / 2]} />
      {[-2.6, 0.15, 2.95].map((z) => (
        <Part key={z} geo={rbox(0.12, 3.0, 0.12, 0.03)} m={O.cedar} p={[x1 + 0.02, 1.5 + top / 2, z]} />
      ))}
      {/* l'avant-toit de tuiles, qui déborde au-dessus de l'engawa */}
      <group position={[-2.35, 3.38, 0.15]} rotation-z={-0.32}>
        <Part geo={rbox(1.6, 0.1, 6.2, 0.03)} m={O.cedar} />
        <mesh material={O.tiles} position={[0, 0.06, 0]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2} receiveShadow>
          <planeGeometry args={[6.2, 1.6]} />
        </mesh>
        <Part geo={cyl(0.07, 0.07, 6.3, 12)} m={O.tiles} p={[0.78, 0.07, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
      {/* la pierre où l'on laisse ses sandales */}
      <Rock v={7} p={[-1.6, 0, -0.15]} s={[0.34, 0.18, 0.28]} ry={0.3} m={O.stone[2]} />
      {/* la palissade de bambou */}
      {FENCE_X.map((x, i) => (
        <Part key={x} geo={cyl(0.045, 0.045, 2.05 + (i % 3) * 0.04, 10)} m={i % 4 ? O.bambooDry : O.bamboo} p={[x, 1.02 + (i % 3) * 0.02, -3.12]} castShadow={false} />
      ))}
      {[0.45, 1.15, 1.85].map((y) => (
        <group key={y}>
          <Part geo={cyl(0.03, 0.03, 5.1, 8)} m={O.bambooDry} p={[0.62, y, -3.04]} rotation-z={Math.PI / 2} castShadow={false} />
          {[-1.4, -0.4, 0.6, 1.6, 2.6].map((x) => (
            <Part key={x} geo={cyl(0.04, 0.04, 0.06, 8)} m={O.rope} p={[x, y, -3.03]} rotation-x={Math.PI / 2} castShadow={false} />
          ))}
        </group>
      ))}
      <ShojiGlow />
    </>
  )
}
