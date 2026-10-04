import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, Object3D, SphereGeometry, type Group, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, rand } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { S } from './materials'

/** Le tube de ballast : son pied au sol, contre le mur du fond, à droite du hublot. */
export const TANK = { x: 2.45, z: -2.5, h: 2.55 }
const N = 16
const dot = new SphereGeometry(1, 10, 8)
const dummy = new Object3D()
const bubbleMat = new MeshBasicMaterial({ color: 0xeaffff, transparent: true, opacity: 0.75, depthWrite: false })

/**
 * Le tube de ballast : une colonne de verre pleine d'eau turquoise entre deux chapeaux de laiton, tenue par quatre tirants, et sa
 * vanne à volant rouge sur un tuyau de cuivre. Tourner le volant fait monter des chapelets de bulles ; le niveau frémit.
 */
export function ValveTank() {
  const g = useRef<Group>(null!), wheel = useRef<Group>(null!), water = useRef<Group>(null!), bubbles = useRef<InstancedMesh>(null!)
  const k = useRef(0), spin = useRef(0)
  useSquash('valve', g)
  const items = useMemo(() => Array.from({ length: N }, (_, i) => ({ y: rand(0, 1), v: rand(0.18, 0.34), s: rand(0.018, 0.045), a: rand(0, TAU), r: rand(0.02, 0.17), w: rand(1.2, 2.6), d: i })), [])
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime, on = isActive(useStore.getState(), 'valve')
    k.current = approach(k.current, on ? 1 : 0, dt * 1.4)
    if (!reduceMotion) spin.current += dt * k.current * 2.2
    wheel.current.rotation.y = spin.current
    water.current.scale.y = 1 + (reduceMotion ? 0 : Math.sin(t * 1.3) * 0.006 * (0.3 + k.current))
    const vis = k.current
    items.forEach((b, i) => {
      if (!reduceMotion) b.y = (b.y + b.v * dt * (0.4 + vis)) % 1
      const y = 0.55 + b.y * (TANK.h - 0.8)
      dummy.position.set(Math.cos(b.a + t * b.w * 0.3) * b.r * (0.4 + b.y * 0.6), y, Math.sin(b.a + t * b.w * 0.3) * b.r * (0.4 + b.y * 0.6))
      // un chapelet à la fois : seules les premières bulles montent au calme
      const show = i < 3 ? 0.35 + vis * 0.65 : vis
      dummy.scale.setScalar(b.s * show * (0.6 + b.y * 0.6))
      dummy.updateMatrix()
      bubbles.current.setMatrixAt(i, dummy.matrix)
    })
    bubbles.current.instanceMatrix.needsUpdate = true
  })
  const wh = TANK.h
  return (
    <group ref={g} userData={{ id: 'valve' }} position={[TANK.x, 0, TANK.z]}>
      {/* le socle de fonte et le chapeau du bas */}
      <Part geo={cyl(0.46, 0.5, 0.12, 32)} m={S.hullDark} p={[0, 0.06, 0]} />
      <Part geo={cyl(0.4, 0.4, 0.07, 32)} m={S.band} p={[0, 0.155, 0]} castShadow={false} />
      <Part geo={cyl(0.34, 0.36, 0.2, 32)} m={S.brass} p={[0, 0.27, 0]} />
      {/* l'eau et la vitre : l'eau est dessous, la vitre un peu plus large */}
      <group ref={water} position={[0, 0.37, 0]}>
        <Part geo={cyl(0.265, 0.265, wh - 0.55, 28)} m={S.water} p={[0, (wh - 0.55) / 2, 0]} castShadow={false} />
      </group>
      <Part geo={cyl(0.29, 0.29, wh - 0.5, 28)} m={S.glass} p={[0, 0.37 + (wh - 0.5) / 2, 0]} castShadow={false} />
      {/* le chapeau du haut, avec sa soupape et son anneau */}
      <Part geo={cyl(0.34, 0.36, 0.2, 32)} m={S.brass} p={[0, wh - 0.1, 0]} />
      <Part geo={cyl(0.4, 0.4, 0.07, 32)} m={S.band} p={[0, wh + 0.04, 0]} castShadow={false} />
      <Part geo={cyl(0.07, 0.07, 0.2, 14)} m={S.copper} p={[0, wh + 0.17, 0]} />
      <Part geo={SPH} m={S.brass} scale={0.07} p={[0, wh + 0.3, 0]} castShadow={false} />
      {/* les quatre tirants */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * TAU + Math.PI / 4
        return <Part key={i} geo={cyl(0.015, 0.015, wh - 0.1, 8)} m={S.steel} p={[Math.cos(a) * 0.37, 0.35 + (wh - 0.1) / 2 - 0.25, Math.sin(a) * 0.37]} castShadow={false} />
      })}
      {/* les bulles qui montent dans l'eau */}
      <instancedMesh ref={bubbles} args={[dot, bubbleMat, N]} frustumCulled={false} raycast={noRay} />
      {/* le tuyau de cuivre vers l'avant, le coude et la vanne à volant rouge */}
      <Part geo={cyl(0.05, 0.05, 0.55, 14)} m={S.copper} p={[0, 0.27, 0.46]} rotation-x={Math.PI / 2} />
      <Part geo={SPH} m={S.copper} scale={0.075} p={[0, 0.27, 0.74]} />
      <Part geo={cyl(0.05, 0.05, 0.3, 14)} m={S.copper} p={[0, 0.45, 0.74]} />
      <Part geo={cyl(0.085, 0.085, 0.1, 18)} m={S.brass} p={[0, 0.66, 0.74]} />
      <Part geo={cyl(0.012, 0.012, 0.16, 6)} m={S.steel} p={[0, 0.76, 0.74]} castShadow={false} />
      <group ref={wheel} position={[0, 0.82, 0.74]}>
        <Part m={S.red} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.2, 0.025, 10, 32]} />
        </Part>
        {[0, 1, 2, 3, 4].map((i) => (
          <Part key={i} geo={rbox(0.4, 0.02, 0.025, 0.008)} m={S.red} rotation-y={(i / 5) * Math.PI} castShadow={false} />
        ))}
        <Part geo={cyl(0.04, 0.04, 0.05, 12)} m={S.brass} p={[0, 0.02, 0]} castShadow={false} />
        {/* la poignée du volant */}
        <Part geo={cyl(0.012, 0.012, 0.09, 6)} m={S.brassDull} p={[0.19, 0.05, 0]} castShadow={false} />
        <Part geo={SPH} m={S.brass} scale={0.028} p={[0.19, 0.1, 0]} castShadow={false} />
      </group>
    </group>
  )
}
