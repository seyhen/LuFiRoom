import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../../math'
import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { useParticles } from '../anim'
import { puffTex } from '../textures'

const LEGS = [[0.42, -2.86], [0.42, -2.14], [2.78, -2.86], [2.78, -2.14]]

/** Bureau, et un mug qui fume toujours. */
export function Desk() {
  const steam = useParticles(), since = useRef(0)
  useFrame((_, delta) => {
    since.current += Math.min(delta, 0.05)
    if (since.current > 0.55) {
      since.current = 0
      steam.emit(puffTex, 2.55 + rand(-0.03, 0.03), 1.62, -2.2, { size: 0.14, life: 2.4, vy: 0.28, sway: 0.05, grow: 1.4, peak: 0.45 })
    }
  })
  return (
    <>
      <Part geo={rbox(2.6, 0.12, 0.95, 0.05)} m={M.woodLight} p={[1.6, 1.29, -2.5]} />
      {LEGS.map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.045, 0.04, 1.23, 12)} m={M.woodLeg} p={[x, 0.615, z]} />
      ))}
      <Part geo={cyl(0.095, 0.085, 0.2, 22)} m={M.mug} p={[2.55, 1.45, -2.2]} />
      <Part m={M.mug} p={[2.63, 1.46, -2.12]} rotation-y={Math.PI / 4}>
        <torusGeometry args={[0.055, 0.017, 8, 18]} />
      </Part>
      <Part geo={cyl(0.08, 0.08, 0.01, 20)} m={M.toffee} p={[2.55, 1.545, -2.2]} />
      <group ref={steam.group} />
    </>
  )
}
