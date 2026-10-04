import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, type Group, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { LIVE } from '../Static'
import { A } from './materials'
import { Foliage } from '../nature/Foliage'
import { Rosette } from '../nature/Rosette'
import { DraftLamp } from './DraftingTable'

const X = -2.6, Z = -1.1, TOP = 0.76
const KEYS = Array.from({ length: 4 * 12 }, (_, i) => [(i % 12) - 5.5, ((i / 12) | 0) - 1.5] as const)
const keyGeo = rbox(0.034, 0.02, 0.034, 0.008)
const dummy = new Object3D()

/** Le clavier mécanique aux touches pastel : elles s'enfoncent une à une quand on écrit. */
function Keyboard() {
  const g = useRef<Group>(null!), keys = useRef<InstancedMesh>(null!), pressed = useRef(-1)
  useSquash('keyboard', g)
  const place = (i: number, down: boolean) => {
    const [c, r] = KEYS[i]
    dummy.position.set(r * 0.042, down ? 0.012 : 0.025, c * 0.042)
    dummy.updateMatrix()
    keys.current.setMatrixAt(i, dummy.matrix)
  }
  useLayoutEffect(() => {
    KEYS.forEach((_, i) => place(i, false))
    keys.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const on = isActive(useStore.getState(), 'keyboard'), t = clock.elapsedTime
    const k = on && Math.sin(t * 0.7) > -0.6 ? Math.floor(t * 9) % KEYS.length : -1
    const next = k < 0 ? -1 : (k * 17) % KEYS.length
    if (next === pressed.current) return
    if (pressed.current >= 0) place(pressed.current, false)
    if (next >= 0) place(next, true)
    pressed.current = next
    keys.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={g} userData={{ id: 'keyboard' }} position={[X + 0.2, TOP, Z]}>
      <Part geo={rbox(0.2, 0.025, 0.54, 0.012)} m={A.cream} />
      <instancedMesh ref={keys} args={[keyGeo, A.blush, KEYS.length]} castShadow />
      <Part geo={rbox(0.034, 0.02, 0.22, 0.008)} m={A.sage} p={[-0.07, 0.025, 0]} castShadow={false} />
    </group>
  )
}

/** Le bureau contre le mur : l'écran (une illustration en cours), le clavier, la souris, un carnet, un café, un cactus. */
export function Desk() {
  return (
    <>
      <group position={[X, 0, Z]}>
        <Part geo={rbox(0.72, 0.05, 1.7, 0.02)} m={A.oak} p={[0, TOP - 0.025, 0]} />
        {[[-0.3, -0.78], [0.3, -0.78], [-0.3, 0.78], [0.3, 0.78]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.022, 0.022, TOP - 0.05, 8)} m={A.steel} p={[x, (TOP - 0.05) / 2, z]} />
        ))}
        {/* l'écran */}
        <Part geo={rbox(0.04, 0.42, 0.66, 0.03)} m={A.white} p={[-0.18, TOP + 0.37, 0]} />
        <mesh material={A.screen} position={[-0.157, TOP + 0.39, 0]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.6, 0.36]} />
        </mesh>
        <Part geo={rbox(0.05, 0.16, 0.06, 0.02)} m={A.white} p={[-0.2, TOP + 0.08, 0]} />
        <Part geo={rbox(0.18, 0.012, 0.18, 0.006)} m={A.white} p={[-0.2, TOP + 0.006, 0]} castShadow={false} />
        {/* la souris, le carnet, la tasse, le cactus */}
        <Part geo={SPH} m={A.white} scale={[0.04, 0.02, 0.028]} p={[0.25, TOP + 0.015, 0.45]} castShadow={false} />
        <Part geo={rbox(0.2, 0.02, 0.15, 0.008)} m={A.prussian} p={[0.12, TOP + 0.01, -0.58]} rotation-y={0.2} castShadow={false} />
        <Part geo={cyl(0.045, 0.04, 0.09, 16)} m={A.terracotta} p={[0.18, TOP + 0.045, 0.62]} />
        <Part geo={cyl(0.05, 0.04, 0.08, 14)} m={A.cream} p={[-0.2, TOP + 0.04, 0.6]} />
        <Part geo={SPH} m={A.leaf} scale={[0.035, 0.07, 0.035]} p={[-0.2, TOP + 0.13, 0.6]} />
        <Part geo={SPH} m={A.leaf} scale={[0.02, 0.035, 0.02]} p={[-0.17, TOP + 0.13, 0.62]} rotation-z={-0.6} castShadow={false} />
      </group>
      <Keyboard />
      {/* la lampe d'architecte, au fond du bureau côté mur : son bras passe par-dessus le carnet */}
      <DraftLamp position={[X - 0.3, TOP, Z - 0.8]} rotationY={Math.PI} />
      {/* la chaise de bureau en bois courbé, tournée vers l'écran */}
      <group position={[-1.85, 0, Z]} rotation-y={-Math.PI / 2}>
        {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.02, 0.018, 0.46, 8)} m={A.oakDark} p={[x, 0.23, z]} />
        ))}
        <Part geo={cyl(0.22, 0.22, 0.05, 22)} m={A.oakDark} p={[0, 0.47, 0]} />
        <Part geo={cyl(0.19, 0.19, 0.04, 22)} m={A.sage} p={[0, 0.51, 0]} />
        {[-0.13, 0.13].map((x) => (
          <Part key={x} geo={cyl(0.016, 0.016, 0.44, 8)} m={A.oakDark} p={[x, 0.72, -0.19]} />
        ))}
        <Part m={A.oakDark} p={[0, 0.94, -0.19]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.13, 0.02, 8, 18, Math.PI]} />
        </Part>
        <Part geo={rbox(0.3, 0.3, 0.06, 0.03)} m={A.ochre} p={[0, 0.7, -0.14]} rotation-x={-0.2} castShadow={false} />
      </group>
      {/* le tableau de liège et l'étagère de bocaux au-dessus */}
      <group position={[-2.97, 1.95, Z]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(1.5, 1.0, 0.04, 0.02)} m={A.oak} />
        <mesh material={A.cork} position={[0, 0, 0.022]} receiveShadow>
          <planeGeometry args={[1.42, 0.92]} />
        </mesh>
      </group>
      <group position={[-2.82, 2.75, Z]}>
        <Part geo={rbox(0.3, 0.04, 1.4, 0.015)} m={A.oak} />
        {[[-0.5, A.terracotta, 0.18], [-0.25, A.glass, 0.14], [0.0, A.cream, 0.16], [0.3, A.glass, 0.12], [0.52, A.terracotta, 0.12]].map(([z, m, h], i) => (
          <group key={i} position={[0, 0.02, z as number]}>
            <Part geo={cyl(0.05, 0.05, h as number, 14)} m={m as typeof A.cream} p={[0, (h as number) / 2, 0]} castShadow={false} />
            {i % 2 === 0 &&
              [0, 1, 2].map((k) => (
                <Part key={k} geo={cyl(0.006, 0.006, 0.22, 5)} m={[A.ochre, A.prussian, A.sage][k]} p={[Math.cos(k * 2) * 0.02, (h as number) + 0.06, Math.sin(k * 2) * 0.02]} rotation-z={(k - 1) * 0.15} castShadow={false} />
              ))}
            {i % 2 === 1 && <Foliage v={i} p={[0, (h as number) - 0.01, 0]} s={[0.06, 0.08, 0.06]} m={A.herbF} shadow={false} />}
          </group>
        ))}
      </group>
    </>
  )
}

/** Le tourne-disque sur son buffet bas, sous la verrière : le plateau tourne quand la musique joue. */
export function Turntable() {
  const g = useRef<Group>(null!), platter = useRef<Group>(null!), arm = useRef<Group>(null!)
  useSquash('radio', g)
  useFrame((_, delta) => {
    const on = isActive(useStore.getState(), 'radio')
    if (on && !reduceMotion) platter.current.rotation.y -= Math.min(delta, 0.05) * 3.5
    arm.current.rotation.y = on ? 0.42 : 0.05
  })
  return (
    <>
      <group position={[2.15, 0, -2.6]}>
        <Part geo={rbox(1.3, 0.42, 0.46, 0.03)} m={A.oak} p={[0, 0.29, 0]} />
        {[-0.5, 0.5].map((x) => (
          <Part key={x} geo={cyl(0.02, 0.015, 0.08, 6)} m={A.oakDark} p={[x, 0.04, 0]} />
        ))}
        {[-0.32, 0.32].map((x) => (
          <Part key={x} geo={rbox(0.6, 0.36, 0.02, 0.012)} m={A.sage} p={[x, 0.29, 0.235]} castShadow={false} />
        ))}
        {/* des disques rangés debout, dans le casier de gauche */}
        {[-0.5, -0.45, -0.4, -0.35, -0.3, -0.25].map((x, i) => (
          <Part key={x} geo={rbox(0.02, 0.3, 0.3, 0.006)} m={[A.terracotta, A.prussian, A.ochre, A.cream, A.blush, A.sage][i]} p={[x, 0.66, -0.03]} rotation-z={(i % 2 ? 1 : -1) * 0.06} castShadow={false} />
        ))}
      </group>
      <group ref={g} userData={{ id: 'radio' }} position={[2.3, 0.5, -2.6]}>
        <Part geo={rbox(0.6, 0.1, 0.44, 0.03)} m={A.oakDark} p={[0, 0.05, 0]} />
        <Part geo={cyl(0.19, 0.19, 0.02, 32)} m={A.steel} p={[-0.06, 0.11, 0]} />
        <group ref={platter} userData={LIVE} position={[-0.06, 0.125, 0]}>
          <Part geo={cyl(0.18, 0.18, 0.01, 32)} m={A.vinyl} castShadow={false} />
          <Part geo={cyl(0.06, 0.06, 0.012, 20)} m={A.label} p={[0, 0.001, 0]} castShadow={false} />
          <Part geo={rbox(0.02, 0.013, 0.06, 0.004)} m={A.cream} p={[0.03, 0.002, 0]} castShadow={false} />
        </group>
        <group ref={arm} userData={LIVE} position={[0.21, 0.13, -0.14]}>
          <Part geo={cyl(0.025, 0.03, 0.04, 12)} m={A.steel} castShadow={false} />
          <Part geo={cyl(0.007, 0.007, 0.26, 6)} m={A.brass} p={[-0.02, 0.03, 0.12]} rotation={[Math.PI / 2, 0, 0.15]} castShadow={false} />
        </group>
        {[0.2, 0.25].map((x) => (
          <Part key={x} geo={cyl(0.015, 0.015, 0.02, 10)} m={A.cream} p={[x, 0.11, 0.15]} castShadow={false} />
        ))}
      </group>
      {/* une plante grasse et une pochette posée contre la vitre */}
      <Part geo={cyl(0.07, 0.06, 0.1, 14)} m={A.terracotta} p={[1.7, 0.55, -2.65]} />
      <Rosette p={[1.7, 0.6, -2.65]} size={0.08} n={14} kind="round" rise={1.0} m={A.succulent} m2={A.succulentPink} />
      <Part geo={rbox(0.3, 0.3, 0.015, 0.006)} m={A.prussian} p={[2.62, 0.66, -2.78]} rotation={[-0.12, 0, 0.05]} castShadow={false} />
    </>
  )
}
