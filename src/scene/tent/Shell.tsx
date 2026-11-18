import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CircleGeometry, type Mesh } from 'three'
import { smooth } from '../../math'
import { isActive, useStore } from '../../state/store'
import { mood, reduceMotion } from '../anim'
import { Part, SPH, cyl, noRay, orient, type V3 } from '../parts'
import { Rock } from '../nature/Rock'
import { stone } from '../nature/materials'
import { APEX, CENTER, HALF_ARC, PROFILE, R0, canvasShell } from './shape'
import { T } from './materials'

const FLOOR = new CircleGeometry(R0, 72)
const pebble = stone(0x8a8678)

/** Un tube entre deux points (corde, couture épaisse, piquet) : un cylindre orienté. */
export function tube(a: V3, b: V3, r: number): { p: V3; rot: V3; h: number; r: number } {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  return { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: orient(d), h: Math.hypot(...d), r }
}

/** Le liseré qui borde un bord coupé de la toile : un tube de coton le long du profil, une boucle de corde et un bouton de bois tous les 0,6 m. */
function Edge({ phi }: { phi: number }) {
  const s = Math.sin(phi), c = Math.cos(phi)
  const pts = PROFILE.map(([r, y]): V3 => [r * s, y, r * c])
  return (
    <>
      {pts.slice(1).map((b, i) => {
        const t = tube(pts[i], b, 0.026)
        return <Part key={i} geo={cyl(t.r, t.r, t.h + 0.02, 6)} m={T.binding} p={t.p} rotation={t.rot} castShadow={false} />
      })}
      {[0.55, 1.7, 2.6].map((y, i) => {
        const r = i === 0 ? R0 : PROFILE.reduce((best, [rr, yy]) => (Math.abs(yy - y) < Math.abs(best[1] - y) ? [rr, yy] : best), PROFILE[0])[0]
        return <Part key={y} geo={SPH} m={T.woodDark} scale={[0.04, 0.05, 0.04]} p={[r * s - s * 0.02, y, r * c - c * 0.02]} castShadow={false} />
      })}
    </>
  )
}

/**
 * La coque de la tente-cloche : le socle de tourbe et ses pierres, la toile de sol, la demi-coque de toile (ourlet, jupe de boue,
 * laies cousues, bande de tempête), le liseré des deux bords coupés, le mât central et ses ferrures. Le devant est ouvert vers la
 * caméra : la toile ne couvre que le fond.
 */
export function Shell() {
  return (
    <>
      {/* le socle : une galette de tourbe, la bordure de forêt entre la toile de sol et le bord */}
      <Part geo={cyl(3.5, 3.58, 0.55, 72)} m={T.earth} p={[0, -0.275, 0]} />
      <mesh material={T.moss} position={[0, 0.003, 0]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <ringGeometry args={[3.2, 3.46, 72]} />
      </mesh>
      <mesh geometry={FLOOR} material={T.floor} position={[0, 0.006, 0]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay} />
      {/* la toile de sol remonte en bourrelet le long de la jupe */}
      <Part m={T.canvasDark} p={[0, 0.03, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[R0 - 0.02, 0.03, 6, 72]} />
      </Part>
      {/* les pierres qui tiennent la bordure, le long du bord ouvert : quelques cailloux plats, pas un anneau */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = CENTER + HALF_ARC + 0.1 + (i / 8) * (Math.PI * 2 - HALF_ARC * 2 - 0.2), r = 3.38 + ((i * 7) % 3) * 0.03
        return <Rock key={i} v={i} p={[r * Math.sin(a), -0.02, r * Math.cos(a)]} s={[0.16 + (i % 3) * 0.05, 0.1, 0.13]} ry={a} m={pebble} shadow={false} />
      })}
      {/* la toile elle-même est dans CanvasLife (c'est l'objet « canvas ») */}
      <Edge phi={CENTER - HALF_ARC} />
      <Edge phi={CENTER + HALF_ARC} />
      {/* le mât central : un fût de frêne, une platine de fer au pied, un anneau et une boule de laiton au sommet */}
      <Part geo={cyl(0.1, 0.12, 0.03, 20)} m={T.iron} p={[0, 0.03, 0]} castShadow={false} />
      <Part geo={cyl(0.048, 0.058, APEX + 0.1, 14)} m={T.pole} p={[0, (APEX + 0.1) / 2, 0]} />
      <Part geo={cyl(0.062, 0.062, 0.05, 14)} m={T.brass} p={[0, 0.3, 0]} castShadow={false} />
      <Part geo={cyl(0.055, 0.055, 0.04, 14)} m={T.iron} p={[0, 3.2, 0]} castShadow={false} />
      <Part geo={SPH} m={T.brass} scale={0.07} p={[0, APEX + 0.16, 0]} castShadow={false} />
    </>
  )
}

/**
 * La vie de la toile : elle s'éclaire d'ambre quand la nuit tombe (la lampe est dedans), elle fonce un peu sous la pluie, et, quand
 * le son de la pluie sur la toile joue, de petites taches mouillées apparaissent et disparaissent au gré des gouttes (une couche
 * juste en dedans de la toile, redécalée toutes les 0,16 s). Rien ne tombe dans la tente : ce sont des empreintes sur le tissu.
 */
export function CanvasLife() {
  const wet = useRef<Mesh>(null!)
  const st = useRef({ k: 0, t: 0 })
  const wall = useMemo(() => canvasShell(64), [])
  const shell = useMemo(() => canvasShell(64, 0.014), [])
  useEffect(() => () => { wall.dispose(); shell.dispose() }, [wall, shell])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    const n = smooth(mood.night), raining = mood.rain
    // la lampe éclaire la toile : un peu d'ambre le soir, davantage sous la pluie (le ciel est sombre dehors)
    T.canvas.emissiveIntensity = 0.01 + n * 0.2
    T.canvas.color.setScalar(1 - 0.09 * raining)
    const store = useStore.getState(), on = isActive(store, 'canvas')
    // un toucher fait crépiter la toile : une rafale de gouttes, qui retombe en une seconde
    const at = store.squashAt.canvas, burst = at === undefined ? 0 : Math.max(0, 1 - (performance.now() - at) / 1000)
    s.k += ((on ? 1 : 0) - s.k) * Math.min(1, dt * 1.6)
    T.wet.opacity = Math.min(1, s.k * (0.55 + 0.25 * n) + burst * 0.4)
    wet.current.visible = s.k > 0.01 || burst > 0
    s.t += dt
    if ((on || burst > 0) && !reduceMotion && s.t > 0.16) {
      s.t = 0
      T.wet.map!.offset.set(Math.random(), Math.random())
    }
  })
  return (
    <group userData={{ id: 'canvas' }}>
      <mesh geometry={wall} material={T.canvas} receiveShadow />
      <mesh ref={wet} geometry={shell} material={T.wet} raycast={noRay} renderOrder={2} visible={false} />
    </group>
  )
}
