import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, lerp } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { A } from './materials'
import { washTex } from './textures'

/** Le chevalet : son pied au sol, comme l'ancien (il garde sa place et son orientation). */
export const EASEL = { x: 2.35, z: -0.85, ry: 0.6 }
const CANVAS_Y = 1.15
const WASH = [0xc7703e, 0x2c4a6e, 0xd9a441, 0x9db59a] // terre cuite, bleu de Prusse, ocre, sauge
const ROWS = [{ y: -0.24, w: 0.5 }, { y: -0.09, w: 0.38 }, { y: 0.06, w: 0.46 }]
const X0 = -0.27
const ROW_T = 4.2 // secondes par aplat
const OPACITY = 0.72

/**
 * Le chevalet et sa toile : l'aquarelle des toits, à moitié finie, et le pinceau du peintre. Quand le son joue, le pinceau quitte la
 * tablette et va et vient sur la toile : un aplat de couleur grandit à sa pointe, ligne après ligne (terre cuite, bleu de Prusse,
 * ocre, sauge), puis la toile s'éclaircit et recommence. Au repos le pinceau dort sur la tablette, à côté de la boîte de couleurs.
 */
export function PaintEasel() {
  const g = useRef<Group>(null!), brush = useRef<Group>(null!), patches = useRef<(Mesh | null)[]>([])
  // chaque aplat a sa copie de la texture : on en dévoile la partie gauche à mesure qu'il grandit (sans l'étirer)
  const mats = useRef(ROWS.map(() => new MeshStandardMaterial({ color: WASH[0], map: washTex.clone(), roughness: 0.85, transparent: true, opacity: OPACITY, depthWrite: false })))
  const st = useRef({ k: 0, row: 0, p: 0, cycle: 0, fade: 0, hold: 0, t: 0 })
  useSquash('brush', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'brush')
    s.k = approach(s.k, on ? 1 : 0, dt * 1.5)
    if (on && !reduceMotion) {
      s.t += dt
      if (s.fade > 0) {
        s.fade += dt / 1.4 // la toile s'éclaircit
        if (s.fade >= 1) {
          s.fade = 0
          s.row = 0
          s.p = 0
          s.cycle++
        }
      } else if (s.row < ROWS.length) {
        s.p = Math.min(1, s.p + dt / ROW_T)
        if (s.p >= 1) {
          s.row++
          s.p = 0
          if (s.row >= ROWS.length) s.fade = 0.001
        }
      }
    }
    ROWS.forEach((r, i) => {
      const m = patches.current[i], mat = mats.current[i]
      if (!m) return
      mat.color.setHex(WASH[(s.cycle + i) % WASH.length])
      const w = i < s.row ? 1 : i === s.row && s.fade === 0 ? s.p : 0
      mat.opacity = OPACITY * (1 - s.fade)
      m.visible = w > 0.004 && mat.opacity > 0.01
      m.scale.set(Math.max(r.w * w, 0.001), 0.13, 1)
      mat.map!.repeat.x = Math.max(w, 0.001)
      m.position.x = X0 + (r.w * w) / 2
    })
    // le pinceau : de la tablette à la pointe de l'aplat en cours, avec le va-et-vient du poignet
    const row = Math.min(s.row, ROWS.length - 1), r = ROWS[row], moving = on && s.fade === 0 && s.row < ROWS.length
    const wob = moving && !reduceMotion ? Math.sin(s.t * 4.6) : 0
    const wx = X0 + r.w * s.p + wob * 0.035, wy = CANVAS_Y + r.y + (moving ? Math.sin(s.t * 9.1) * 0.012 : 0)
    const b = brush.current
    b.position.set(lerp(-0.22, wx, s.k), lerp(0.735, wy, s.k), lerp(0.13, 0.115 + (CANVAS_Y - wy) * 0.08 + 0.06, s.k))
    b.rotation.set(lerp(0, 0.95, s.k), 0, lerp(-1.45, -0.45, s.k))
  })
  return (
    <group ref={g} userData={{ id: 'brush' }} position={[EASEL.x, 0, EASEL.z]} rotation-y={EASEL.ry}>
      <Static>
        <Part geo={cyl(0.02, 0.025, 1.9, 8)} m={A.oakDark} p={[-0.32, 0.92, 0]} rotation-z={-0.12} />
        <Part geo={cyl(0.02, 0.025, 1.9, 8)} m={A.oakDark} p={[0.32, 0.92, 0]} rotation-z={0.12} />
        <Part geo={cyl(0.02, 0.025, 1.7, 8)} m={A.oakDark} p={[0, 0.82, -0.32]} rotation-x={0.35} />
        <Part geo={rbox(0.78, 0.04, 0.08, 0.015)} m={A.oakDark} p={[0, 0.7, 0.04]} />
        <group position={[0, CANVAS_Y, 0.06]} rotation-x={-0.08}>
          <Part geo={rbox(0.62, 0.8, 0.03, 0.01)} m={A.white} />
          <mesh material={A.painting} position={[0, 0, 0.023]}>
            <planeGeometry args={[0.58, 0.76]} />
          </mesh>
        </group>
        {/* la boîte de couleurs, sur la tablette */}
        <group position={[0.18, 0.74, 0.08]}>
          <Part geo={rbox(0.24, 0.03, 0.12, 0.01)} m={A.white} />
          {[A.prussian, A.terracotta, A.ochre, A.sage].map((m, i) => (
            <Part key={i} geo={cyl(0.015, 0.015, 0.01, 10)} m={m} p={[-0.08 + i * 0.05, 0.02, 0]} castShadow={false} />
          ))}
        </group>
      </Static>
      {/* les aplats qui grandissent sur la toile */}
      <group position={[0, CANVAS_Y, 0.06]} rotation-x={-0.08}>
        {ROWS.map((r, i) => (
          <mesh key={i} ref={(m) => { patches.current[i] = m }} material={mats.current[i]} position={[X0, r.y, 0.031]}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        ))}
      </group>
      {/* le pinceau : sa pointe à l'origine du groupe, le manche de bois monte */}
      <group ref={brush} position={[-0.22, 0.735, 0.13]} scale={1.5}>
        <Part geo={SPH} m={A.terracotta} scale={[0.011, 0.032, 0.011]} p={[0, 0.026, 0]} castShadow={false} />
        <Part geo={cyl(0.011, 0.009, 0.05, 8)} m={A.brass} p={[0, 0.075, 0]} castShadow={false} />
        <Part geo={cyl(0.008, 0.012, 0.22, 8)} m={A.ochreDeep} p={[0, 0.21, 0]} castShadow={false} />
      </group>
    </group>
  )
}
