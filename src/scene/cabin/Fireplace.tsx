import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { glowTex } from '../textures'
import { C } from './materials'
import { emberTex } from './textures'

// Les flammes : abscisse, profondeur, hauteur, déphasage.
const FLAMES = [{ x: -0.2, z: 0.02, h: 1, p: 0 }, { x: 0.18, z: 0.06, h: 1.15, p: 1.7 }, { x: 0, z: -0.08, h: 1.4, p: 3.1 }]
const POS = [-1.9, 0, -2.69] as const

/** Cheminée en pierre : le feu s'allume et crépite quand son son joue, la pièce s'éclaire de orange, des braises montent. */
export function Fireplace() {
  const g = useRef<Group>(null!), flames = useRef<Group[]>([]), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!), fire = useRef<Group>(null!)
  const embers = useParticles(), lit = useRef(0), since = useRef(0)
  useSquash('fireplace', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime
    lit.current = approach(lit.current, isActive(useStore.getState(), 'fireplace') ? 1 : 0, dt * 2.2)
    const k = lit.current
    fire.current.visible = k > 0.01
    flames.current.forEach((f, i) => {
      const { h, p } = FLAMES[i], w = Math.sin(t * 9 + p) * 0.12 + Math.sin(t * 14.3 + p * 2) * 0.07
      f.scale.set(1 + w * 0.5, k * h * (1 + w), 1 + w * 0.5)
      f.rotation.z = Math.sin(t * 5 + p) * 0.1
    })
    light.current.intensity = k * (1.5 + Math.sin(t * 11) * 0.12 + Math.sin(t * 17.3) * 0.1) * Math.PI // × π : voir materials.ts
    glow.current.material.opacity = k * (0.62 + Math.sin(t * 9) * 0.06)
    since.current += dt
    if (k > 0.6 && since.current > 0.22) {
      since.current = 0
      embers.emit(emberTex, POS[0] + rand(-0.3, 0.3), 0.55, POS[2] + 0.25 + rand(-0.1, 0.1), { size: 0.1, life: 1.9, vy: 0.55, sway: 0.14, peak: 0.95 })
    }
  })
  const logs = useMemo(() => [{ y: 0.2, z: -0.06, r: 0.1 }, { y: 0.2, z: 0.2, r: 0.1 }, { y: 0.36, z: 0.07, r: 0.09 }], [])
  return (
    <>
      <group ref={g} userData={{ id: 'fireplace' }} position={POS as unknown as [number, number, number]}>
        {/* âtre, piliers, manteau, conduit */}
        <Part geo={rbox(2.4, 0.14, 1.2, 0.06)} m={C.stoneDark} p={[0, 0.07, 0.22]} />
        {[-0.8, 0.8].map((x) => (
          <Part key={x} geo={rbox(0.46, 1.5, 0.74, 0.1)} m={C.stone} p={[x, 0.89, 0]} />
        ))}
        <Part geo={rbox(2.3, 0.26, 0.9, 0.1)} m={C.stone} p={[0, 1.77, 0.05]} />
        <Part geo={rbox(1.55, 2.3, 0.6, 0.08)} m={C.stone} p={[0, 3.05, -0.07]} />
        <Part geo={rbox(1.14, 1.3, 0.1, 0.04)} m={M.plum} p={[0, 0.85, -0.3]} />
        {/* bûches */}
        {logs.map(({ y, z, r }, i) => (
          <Part key={i} geo={cyl(r, r, 0.9, 14)} m={i === 2 ? C.charred : C.log} p={[0, y, z]} rotation-z={Math.PI / 2 + (i === 2 ? 0.08 : 0)} />
        ))}
        {/* sur le manteau : un mini sapin et un mug */}
        <Part geo={cyl(0.045, 0.06, 0.1, 10)} m={C.log} p={[-0.8, 1.95, 0.05]} />
        <Part m={C.pine} p={[-0.8, 2.22, 0.05]}>
          <coneGeometry args={[0.17, 0.46, 16]} />
        </Part>
        <Part geo={cyl(0.075, 0.068, 0.15, 18)} m={M.mug} p={[0.75, 1.98, 0.08]} />
        {/* le feu : flammes (pied commun, chaque flamme grandit vers le haut), lumière, halo */}
        <group ref={fire} position={[0, 0.43, 0.07]}>
          {FLAMES.map(({ x, z, h }, i) => (
            <group key={i} ref={(el) => void (el && (flames.current[i] = el))} position={[x, 0, z]}>
              <mesh geometry={SPH} material={C.flame} scale={[0.17, 0.3 * h, 0.12]} position={[0, 0.3 * h * 0.9, 0]} raycast={noRay} />
              <mesh geometry={SPH} material={C.flameCore} scale={[0.09, 0.17 * h, 0.07]} position={[0, 0.17 * h * 0.9, 0.03]} raycast={noRay} />
            </group>
          ))}
        </group>
        <pointLight ref={light} color={0xff8a3d} intensity={0} distance={9} decay={1.5} position={[0, 0.8, 0.5]} />
        <sprite ref={glow} scale={2.8} position={[0, 0.75, 0.3]} raycast={noRay}>
          <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
      <group ref={embers.group} />
    </>
  )
}
