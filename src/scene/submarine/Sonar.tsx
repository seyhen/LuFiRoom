import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group, type Mesh, type MeshBasicMaterial, type PointLight } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { S } from './materials'

/** La console du sonar : son pied au sol, contre le mur du fond, dans l'angle gauche. */
export const SONAR = { x: -1.75, z: -2.45 }
const TILT = 0.6
// Des échos fixes sur l'écran : [angle visuel (rad), rayon (0 → 1)]. Ils s'allument quand le balayage les croise, puis s'éteignent.
const BLIPS: [number, number][] = [[0.6, 0.55], [2.4, 0.72], [3.9, 0.4], [5.3, 0.8], [1.5, 0.28]]
const off = new Color(0x4a5a50), lit = new Color(0xffffff)

/**
 * La console du sonar : un coffre sombre, un pupitre incliné, un écran rond de cuivre où un faisceau vert balaie et allume des
 * échos, des boutons de laiton, des interrupteurs et des voyants. Quand on l'écoute, l'écran brille, le balayage tourne et la pièce
 * verdit doucement ; éteint, il veille à peine.
 */
export function Sonar() {
  const g = useRef<Group>(null!), sweep = useRef<Mesh>(null!), light = useRef<PointLight>(null!), blips = useRef<Mesh[]>([]), lamps = useRef<Mesh[]>([])
  const angle = useRef(0), k = useRef(0)
  useSquash('sonar', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'sonar')
    k.current = approach(k.current, on ? 1 : 0, dt * 1.5)
    if (!reduceMotion) angle.current -= dt * (TAU / 4.5) * (0.12 + k.current * 0.88)
    sweep.current.rotation.z = angle.current
    S.crt.color.copy(off).lerp(lit, k.current)
    ;(sweep.current.material as MeshBasicMaterial).opacity = 0.35 + k.current * 0.65
    light.current.intensity = (0.1 + k.current * 1.1) * Math.PI
    // l'écho s'allume quand la tête du balayage (qui tourne dans le sens horaire) passe sur lui
    const head = Math.PI / 2 + angle.current
    blips.current.forEach((m, i) => {
      const d = (((BLIPS[i][0] - head) % TAU) + TAU) % TAU
      ;(m.material as MeshBasicMaterial).opacity = Math.exp(-d * 1.1) * (0.25 + k.current * 0.75)
    })
    lamps.current.forEach((m, i) => {
      const mat = m.material as MeshBasicMaterial
      mat.color.setHex(i === 0 ? 0x3cff9a : i === 1 ? 0xffb347 : 0xff5a5a).multiplyScalar(0.25 + (i === 0 ? k.current : i === 1 ? 0.6 : (Math.sin(angle.current * 2) > 0.7 ? 1 : 0.15) * k.current) * 0.75)
    })
  })
  return (
    <group ref={g} userData={{ id: 'sonar' }} position={[SONAR.x, 0, SONAR.z]}>
      {/* le coffre, sa plinthe, son bandeau de laiton */}
      <Part geo={rbox(1.8, 0.85, 0.85, 0.08)} m={S.hullDark} p={[0, 0.5, 0]} />
      <Part geo={rbox(1.86, 0.1, 0.9, 0.04)} m={S.woodDark} p={[0, 0.07, 0]} castShadow={false} />
      <Part geo={rbox(1.84, 0.05, 0.88, 0.02)} m={S.band} p={[0, 0.93, 0]} castShadow={false} />
      <Part geo={rbox(0.8, 0.5, 0.03, 0.02)} m={S.woodLight} p={[0, 0.5, 0.435]} castShadow={false} />
      {[-0.28, 0.28].map((x) => (
        <Part key={x} geo={SPH} m={S.brass} scale={0.025} p={[x, 0.5, 0.46]} castShadow={false} />
      ))}
      {/* le pupitre incliné */}
      <group position={[0, 1.07, 0.04]} rotation-x={-TILT}>
        <Part geo={rbox(1.7, 0.9, 0.1, 0.04)} m={S.iron} />
        {/* l'écran : lunette de laiton, verre, cadran, balayage, échos */}
        <group position={[0, 0.06, 0.05]}>
          <Part m={S.brass}>
            <torusGeometry args={[0.35, 0.05, 12, 40]} />
          </Part>
          <mesh material={S.crt} position={[0, 0, 0.005]}>
            <circleGeometry args={[0.32, 40]} />
          </mesh>
          <mesh ref={sweep} material={S.sweep} position={[0, 0, 0.012]}>
            <circleGeometry args={[0.32, 40]} />
          </mesh>
          {BLIPS.map(([a, r], i) => (
            <mesh key={i} ref={(el) => void (el && (blips.current[i] = el))} position={[Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, 0.02]}>
              <circleGeometry args={[0.022 + (i % 3) * 0.006, 12]} />
              <meshBasicMaterial color={0xbfffd8} transparent depthWrite={false} opacity={0} />
            </mesh>
          ))}
          <Part geo={cyl(0.33, 0.33, 0.012, 40)} m={S.glass} p={[0, 0, 0.03]} rotation-x={Math.PI / 2} castShadow={false} />
        </group>
        {/* les boutons, les interrupteurs et les voyants du bandeau du bas */}
        {[-0.62, -0.42, 0.42, 0.62].map((x, i) => (
          <group key={x} position={[x, -0.3, 0.05]}>
            <Part geo={cyl(0.055, 0.06, 0.04, 16)} m={S.brass} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={rbox(0.014, 0.05, 0.03, 0.005)} m={S.iron} p={[0, 0.02, 0.025]} rotation-z={i * 0.9 - 0.8} castShadow={false} />
          </group>
        ))}
        {[-0.12, 0.04, 0.2].map((x, i) => (
          <group key={x} position={[x, -0.3, 0.05]}>
            <Part geo={cyl(0.012, 0.012, 0.1, 6)} m={S.steel} p={[0, 0.03, 0.03]} rotation-x={0.35 + i * 0.2} castShadow={false} />
            <Part geo={SPH} m={S.red} scale={0.022} p={[0, 0.065, 0.06]} castShadow={false} />
          </group>
        ))}
        {[-0.7, -0.62, -0.54].map((x, i) => (
          <mesh key={x} ref={(el) => void (el && (lamps.current[i] = el))} position={[x, 0.38, 0.056]}>
            <circleGeometry args={[0.025, 12]} />
            <meshBasicMaterial color={0x3cff9a} />
          </mesh>
        ))}
        {/* une ligne de petits cadrans de chaque côté de l'écran */}
        {[-0.62, 0.62].map((x) => (
          <group key={x} position={[x, 0.1, 0.05]}>
            <Part geo={cyl(0.1, 0.1, 0.03, 20)} m={S.brassDull} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.082, 0.082, 0.01, 20)} m={S.cream} p={[0, 0, 0.012]} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={rbox(0.008, 0.07, 0.006, 0.003)} m={S.red} p={[0.01, 0.02, 0.02]} rotation-z={x < 0 ? -0.6 : 0.8} castShadow={false} />
          </group>
        ))}
      </group>
      <pointLight ref={light} color={0x6cffb0} intensity={0} distance={3.2} decay={1.6} position={[0.1, 1.5, 0.9]} />
    </group>
  )
}
