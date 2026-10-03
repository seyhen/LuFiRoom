import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { T } from './materials'

const X = -2.5, Z0 = -2.85, Z1 = -0.45, ZM = (Z0 + Z1) / 2, LEN = Z1 - Z0

/** Une couchette : son cadre d'acajou, le matelas, les draps, une couverture bleu nuit rabattue, l'oreiller. */
function Berth({ y, top }: { y: number; top?: boolean }) {
  return (
    <group position={[X, y, ZM]}>
      <Part geo={rbox(0.96, 0.16, LEN, 0.04)} m={T.mahogany} p={[0, -0.08, 0]} />
      <Part geo={rbox(0.88, 0.16, LEN - 0.08, 0.07)} m={T.sheet} p={[0.02, 0.08, 0]} />
      <Part geo={rbox(0.9, 0.06, LEN * 0.62, 0.03)} m={T.blanket} p={[0.03, 0.17, LEN * 0.19]} />
      <Part geo={rbox(0.9, 0.05, 0.22, 0.025)} m={T.sheet} p={[0.03, 0.2, LEN * 0.19 - LEN * 0.31 + 0.08]} />
      <Part geo={rbox(0.62, 0.14, 0.36, 0.07)} m={T.sheet} p={[0, 0.22, -LEN / 2 + 0.28]} rotation-x={0.12} />
      {/* têtière et pied */}
      {[-1, 1].map((s) => (
        <Part key={s} geo={rbox(0.96, top ? 0.46 : 0.6, 0.06, 0.03)} m={T.mahogany} p={[0, top ? 0.1 : 0.0, s * (LEN / 2 + 0.03)]} />
      ))}
      {top && (
        <>
          {/* garde-corps de laiton */}
          <Part geo={cyl(0.018, 0.018, LEN - 0.3, 10)} m={T.brass} p={[0.5, 0.34, 0.1]} rotation-x={Math.PI / 2} />
          {[-0.9, 0.2, 1.05].map((z) => (
            <Part key={z} geo={cyl(0.015, 0.015, 0.3, 8)} m={T.brass} p={[0.5, 0.2, z]} castShadow={false} />
          ))}
          {/* un petit lapin en peluche */}
          <group position={[0.1, 0.32, -0.55]} rotation-y={0.9}>
            <Part geo={SPH} m={T.wool} scale={[0.09, 0.08, 0.08]} />
            <Part geo={SPH} m={T.wool} scale={0.065} p={[0, 0.1, 0.02]} />
            {[-1, 1].map((s) => (
              <Part key={s} geo={SPH} m={T.wool} scale={[0.02, 0.07, 0.015]} p={[s * 0.03, 0.2, 0]} rotation-z={s * 0.2} castShadow={false} />
            ))}
          </group>
        </>
      )}
    </group>
  )
}

/** Le livre ouvert sur la couchette du bas, et des lunettes : quand on l'écoute, les pages se tournent. */
function Book() {
  const g = useRef<Group>(null!), page = useRef<Group>(null!)
  useSquash('book', g)
  useFrame(({ clock }) => {
    const on = isActive(useStore.getState(), 'book'), t = clock.elapsedTime
    const ph = (t % 4) / 4
    page.current.rotation.z = on && ph < 0.25 ? -Math.sin((ph / 0.25) * Math.PI) * 2.6 : -0.05
  })
  return (
    <group ref={g} userData={{ id: 'book' }} position={[X + 0.12, 0.76, -1.15]} rotation-y={1.2}>
      {[-1, 1].map((s) => (
        <Part key={s} geo={rbox(0.15, 0.03, 0.21, 0.01)} m={T.velvet} p={[s * 0.075, 0, 0]} rotation-z={-s * 0.08} />
      ))}
      {[-1, 1].map((s) => (
        <Part key={s} geo={rbox(0.14, 0.02, 0.2, 0.008)} m={T.cream} p={[s * 0.072, 0.022, 0]} rotation-z={-s * 0.08} castShadow={false} />
      ))}
      <group ref={page} position={[0, 0.034, 0]}>
        <Part geo={rbox(0.14, 0.004, 0.19, 0.002)} m={T.cream} p={[0.07, 0, 0]} castShadow={false} />
      </group>
      {/* les lunettes à côté */}
      {[-1, 1].map((s) => (
        <Part key={s} m={T.gold} p={[0.06 + s * 0.045, 0.01, 0.2]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.035, 0.006, 6, 16]} />
        </Part>
      ))}
    </group>
  )
}

/** Petite applique de lecture en laiton au-dessus d'un oreiller (son abat-jour s'allume avec la lampe de table). */
function BerthLamp({ y }: { y: number }) {
  return (
    <group position={[-2.92, y, -2.25]}>
      <Part geo={cyl(0.04, 0.04, 0.02, 12)} m={T.brass} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.01, 0.01, 0.16, 6)} m={T.brass} p={[0.07, 0.04, 0]} rotation-z={Math.PI / 2 - 0.6} castShadow={false} />
      <Part geo={cyl(0.04, 0.07, 0.08, 12)} m={T.shade} p={[0.15, 0.08, 0]} castShadow={false} />
    </group>
  )
}

/** Les couchettes superposées contre la paroi, l'échelle de laiton, les appliques. */
export function Bunks() {
  return (
    <>
      <Part geo={rbox(0.96, 0.4, LEN, 0.04)} m={T.mahoganyDark} p={[X, 0.2, ZM]} />
      {[-1.9, -0.95].map((z) => (
        <Part key={z} geo={cyl(0.03, 0.03, 0.02, 10)} m={T.brass} p={[X + 0.49, 0.22, z]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
      <Berth y={0.48} />
      <Berth y={2.15} top />
      {/* les montants qui portent la couchette du haut */}
      {[Z0 + 0.03, Z1 - 0.03].map((z) => (
        <Part key={z} geo={rbox(0.06, 2.35, 0.06, 0.02)} m={T.mahogany} p={[X + 0.45, 1.17, z]} />
      ))}
      {/* l'échelle, au pied */}
      <group position={[X + 0.62, 0, Z1 - 0.12]} rotation-z={0.22}>
        {[-0.15, 0.15].map((z) => (
          <Part key={z} geo={cyl(0.018, 0.018, 2.35, 8)} m={T.brass} p={[0, 1.17, z]} />
        ))}
        {[0.4, 0.85, 1.3, 1.75].map((y) => (
          <Part key={y} geo={cyl(0.014, 0.014, 0.3, 6)} m={T.brass} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
      </group>
      <BerthLamp y={1.2} />
      <BerthLamp y={2.9} />
      <Book />
    </>
  )
}
