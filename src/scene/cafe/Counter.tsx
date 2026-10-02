import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SphereGeometry, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, rand } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { puffTex } from '../textures'
import { K } from './materials'

const dome = new SphereGeometry(0.19, 28, 14, 0, TAU, 0, Math.PI / 2)
const POS = [-1.85, 1.08, -2.62] as const

const Mug = ({ p, m = M.mug }: { p: [number, number, number]; m?: typeof M.mug }) => (
  <>
    <Part geo={cyl(0.06, 0.052, 0.1, 18)} m={m} p={p} />
    <Part m={m} p={[p[0] + 0.065, p[1] + 0.01, p[2]]}>
      <torusGeometry args={[0.032, 0.011, 8, 14]} />
    </Part>
  </>
)

/** Comptoir de noyer et de marbre, machine à café (qui chauffe, fume et fait son bruit quand on la touche), tasses et gâteaux. */
export function Counter() {
  const g = useRef<Group>(null!)
  const steam = useParticles(), since = useRef(0), heat = useRef(0)
  useSquash('espresso', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'espresso')
    heat.current = approach(heat.current, on ? 1 : 0, dt * 2)
    K.led.emissiveIntensity = 0.1 + heat.current * (0.9 + Math.sin(clock.elapsedTime * 6) * 0.15)
    since.current += dt
    if (on && since.current > 0.28) {
      since.current = 0
      // De la vapeur à la buse, un peu au-dessus de la tasse en dessous.
      steam.emit(puffTex, POS[0] + 0.37 + rand(-0.02, 0.02), POS[1] + 0.12, POS[2] + 0.22, { size: 0.16, life: 1.6, vy: 0.4, sway: 0.05, grow: 1.6, peak: 0.55 })
      if (Math.random() < 0.4) steam.emit(puffTex, POS[0] - 0.17 + rand(-0.03, 0.03), POS[1] + 0.2, POS[2] + 0.3, { size: 0.12, life: 1.8, vy: 0.3, sway: 0.04, grow: 1.4, peak: 0.4 })
    }
  })
  return (
    <>
      {/* le comptoir */}
      <Part geo={rbox(2.3, 0.98, 0.78, 0.08)} m={K.walnut} p={[-1.3, 0.49, -2.6]} />
      <Part geo={rbox(1.9, 0.58, 0.03, 0.02)} m={K.oak} p={[-1.3, 0.5, -2.2]} />
      <Part geo={rbox(2.44, 0.1, 0.94, 0.05)} m={M.cream} p={[-1.3, 1.03, -2.55]} />
      {/* la machine */}
      <group ref={g} userData={{ id: 'espresso' }} position={POS as unknown as [number, number, number]}>
        <Part geo={rbox(0.78, 0.46, 0.46, 0.1)} m={K.steel} p={[0, 0.23, 0]} />
        <Part geo={rbox(0.7, 0.05, 0.4, 0.02)} m={K.steel} p={[0, 0.49, 0]} />
        <Part geo={rbox(0.56, 0.16, 0.02, 0.01)} m={M.plum} p={[0, 0.32, 0.235]} />
        <Part m={K.brass} p={[-0.17, 0.32, 0.25]}>
          <torusGeometry args={[0.045, 0.01, 8, 20]} />
        </Part>
        <Part geo={cyl(0.034, 0.034, 0.012, 16)} m={M.dial} p={[-0.17, 0.32, 0.244]} rotation-x={Math.PI / 2} />
        <Part geo={cyl(0.022, 0.022, 0.03, 14)} m={K.led} p={[0.06, 0.32, 0.245]} rotation-x={Math.PI / 2} />
        <Part geo={cyl(0.022, 0.022, 0.03, 14)} m={M.leaf} p={[0.15, 0.32, 0.245]} rotation-x={Math.PI / 2} />
        {/* têtes de groupe, porte-filtres, buse de vapeur, bac et tasse */}
        {[-0.17, 0.17].map((x) => (
          <group key={x}>
            <Part geo={cyl(0.065, 0.065, 0.09, 18)} m={K.brass} p={[x, 0.17, 0.2]} />
            <Part geo={cyl(0.012, 0.012, 0.2, 10)} m={M.plum} p={[x, 0.11, 0.33]} rotation-x={Math.PI / 2} />
            <Part geo={SPH} m={M.plum} scale={[0.05, 0.03, 0.03]} p={[x, 0.11, 0.44]} />
          </group>
        ))}
        <Part geo={cyl(0.012, 0.012, 0.3, 8)} m={K.steel} p={[0.37, 0.2, 0.2]} />
        <Part geo={rbox(0.7, 0.03, 0.26, 0.012)} m={M.plum} p={[0, 0.015, 0.3]} />
        <Mug p={[-0.17, 0.08, 0.26]} m={M.pink} />
        {[-0.22, 0, 0.22].map((x) => (
          <Mug key={x} p={[x, 0.55, 0]} m={x === 0 ? M.tealLight : M.mug} />
        ))}
      </group>
      <group ref={steam.group} />
      {/* sur le comptoir : une cloche de verre avec des scones, des tasses */}
      <Part geo={cyl(0.2, 0.17, 0.05, 24)} m={M.cream} p={[-1.0, 1.105, -2.35]} />
      <Part geo={dome} m={M.glass} p={[-1.0, 1.13, -2.35]} />
      {[[-0.05, 0.02], [0.06, -0.03], [0, -0.09]].map(([dx, dz], i) => (
        <Part key={i} geo={SPH} m={K.scone} scale={[0.07, 0.045, 0.07]} p={[-1.0 + dx, 1.16, -2.35 + dz]} />
      ))}
      <Mug p={[-0.45, 1.13, -2.2]} m={M.butter} />
      <Mug p={[-2.3, 1.13, -2.25]} m={M.pink} />
    </>
  )
}
