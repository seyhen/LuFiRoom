import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, Path, Shape, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox, rrPath } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { T } from './materials'
import { PANE } from './TrainShell'

const { x0, x1, y0, y1 } = PANE, W = x1 - x0, Hh = y1 - y0, CX = (x0 + x1) / 2
// Le cadre de laiton qui borde l'ouverture.
const ring = rrPath(new Shape(), -0.1, -0.1, W + 0.2, Hh + 0.2, 0.42)
ring.holes.push(rrPath(new Path(), 0, 0, W, Hh, 0.32))
const ringGeo = new ExtrudeGeometry(ring, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 12 })

/** Un rideau de velours retenu par une embrasse : quelques gros plis et un gland doré. */
function Drape({ x, side }: { x: number; side: 1 | -1 }) {
  return (
    <group position={[x, 0, -2.86]}>
      {[0, 1, 2, 3].map((i) => (
        <Part key={i} geo={cyl(0.07, 0.11 + (i % 2) * 0.02, 2.4, 12)} m={i % 2 ? T.velvetDark : T.velvet} p={[side * i * 0.07, 2.35, (i % 2) * 0.03]} rotation-z={side * (0.02 + i * 0.015)} />
      ))}
      <Part m={T.gold} p={[side * 0.1, 2.0, 0.06]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.15, 0.022, 8, 18]} />
      </Part>
      <Part geo={SPH} m={T.gold} scale={[0.04, 0.07, 0.04]} p={[side * 0.25, 1.86, 0.1]} />
    </group>
  )
}

/** La fenêtre du compartiment : sa vitre descend quand on écoute le train (le bruit entre), la pluie coule en biais. */
export function TrainWindow() {
  const g = useRef<Group>(null!), pane = useRef<Group>(null!), open = useRef(0)
  useSquash('window', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    open.current = approach(open.current, isActive(useStore.getState(), 'window') ? 1 : 0, dt * 1.2)
    pane.current.position.y = -smooth(open.current) * 0.55
    T.rain.opacity = 0.08 + mood.rain * 0.8
    if (!reduceMotion && T.rain.map) {
      T.rain.map.offset.x = (T.rain.map.offset.x + dt * 0.05) % 1
      T.rain.map.offset.y = (T.rain.map.offset.y - dt * 0.025) % 1
    }
  })
  return (
    <>
      <Part geo={ringGeo} m={T.brass} p={[x0, y0, -3.02]} castShadow={false} />
      <group userData={{ id: 'window' }}>
        <group ref={g} position={[CX, y0, -3.13]}>
          <group ref={pane}>
            {/* la vitre et son cadre fin, un peu plus haute que l'ouverture */}
            <Part geo={rbox(W + 0.1, 0.06, 0.05, 0.02)} m={T.brass} p={[0, Hh + 0.02, 0]} castShadow={false} />
            <mesh material={T.glass} position={[0, Hh / 2, 0]} raycast={noRay}>
              <planeGeometry args={[W + 0.1, Hh + 0.1]} />
            </mesh>
            <mesh material={T.rain} position={[0, Hh / 2, 0.01]} raycast={noRay}>
              <planeGeometry args={[W + 0.1, Hh + 0.1]} />
            </mesh>
            {[-0.5, 0.5].map((dx) => (
              <Part key={dx} geo={rbox(0.12, 0.04, 0.05, 0.015)} m={T.brass} p={[dx, Hh - 0.04, 0.04]} castShadow={false} />
            ))}
          </group>
        </group>
        <mesh visible={false} position={[CX, (y0 + y1) / 2, -3.0]}>
          <planeGeometry args={[W, Hh]} />
        </mesh>
      </group>
      {/* les rideaux de velours et leur cantonnière festonnée */}
      <Drape x={x0 - 0.12} side={-1} />
      <Drape x={x1 + 0.12} side={1} />
      <Part geo={rbox(W + 0.7, 0.2, 0.14, 0.05)} m={T.velvet} p={[CX, y1 + 0.32, -2.88]} />
      {Array.from({ length: 9 }, (_, i) => (
        <Part key={i} geo={SPH} m={T.velvet} scale={[0.19, 0.08, 0.06]} p={[x0 - 0.25 + (i * (W + 0.5)) / 8, y1 + 0.2, -2.83]} />
      ))}
      <Part geo={rbox(W + 0.75, 0.035, 0.16, 0.012)} m={T.gold} p={[CX, y1 + 0.43, -2.87]} castShadow={false} />
    </>
  )
}
