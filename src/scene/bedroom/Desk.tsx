import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { rand } from '../../math'
import { M } from '../materials'
import { Batch, Part, cyl, noRay, rbox, type Item } from '../parts'
import { reduceMotion, useParticles } from '../anim'
import { wispTex } from '../textures'
import { B } from './materials'

const LEGS = [[0.42, -2.9], [0.42, -2.1], [2.78, -2.9], [2.78, -2.1]]
const MUG = [2.72, 1.35, -2.2] as const
const POT = [0.52, 1.35, -2.25] as const

// Crayons dans le pot : ils partent en éventail.
const PENCILS: Item[] = [
  { p: [POT[0] - 0.02, POT[1] + 0.24, POT[2]], s: [0.012, 0.3, 0.012], r: [0, 0, 0.25], c: 0xf3afc6 },
  { p: [POT[0] + 0.02, POT[1] + 0.25, POT[2] + 0.01], s: [0.012, 0.32, 0.012], r: [0.2, 0, -0.18], c: 0x37a3b5 },
  { p: [POT[0], POT[1] + 0.23, POT[2] - 0.02], s: [0.012, 0.28, 0.012], r: [-0.25, 0, 0.05], c: 0xf6d071 },
]

/** Bureau en bois clair : sous-main, cahier ouvert et crayon, pot à crayons, et un mug qui fume toujours. Le portable, le ventilo et la radio sont posés dessus. */
export function Desk() {
  const steam = useParticles(), since = useRef(0)
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > 0.6) {
      since.current = 0
      steam.emit(wispTex, MUG[0] + rand(-0.02, 0.02), MUG[1] + 0.33, MUG[2], { size: 0.3, life: 2.8, vy: 0.2, sway: 0.05, grow: 0.7, peak: 0.85 })
    }
  })
  return (
    <>
      <Part geo={rbox(2.6, 0.12, 1.0, 0.05)} m={M.woodLight} p={[1.6, 1.29, -2.5]} />
      {LEGS.map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.045, 0.04, 1.23, 12)} m={M.woodLeg} p={[x, 0.615, z]} />
      ))}
      <Part geo={rbox(1.15, 0.014, 0.52, 0.01)} m={B.lilac} p={[1.42, 1.357, -2.3]} castShadow={false} />
      <Part geo={rbox(0.6, 0.03, 0.4, 0.015)} m={B.notebook} p={[1.3, 1.372, -2.1]} rotation-y={0.12} />
      <Part geo={cyl(0.011, 0.011, 0.3, 8)} m={M.butter} p={[1.58, 1.4, -2.08]} rotation={[0, 0.5, Math.PI / 2]} castShadow={false} />
      <Part geo={cyl(0.08, 0.065, 0.17, 18)} m={M.mint} p={[POT[0], POT[1] + 0.085, POT[2]]} />
      <Batch geo={cyl(1, 1, 1, 6)} m={B.trim} items={PENCILS} />
      <Part geo={cyl(0.095, 0.085, 0.2, 22)} m={M.mug} p={[MUG[0], MUG[1] + 0.1, MUG[2]]} />
      <Part m={M.mug} p={[MUG[0] + 0.08, MUG[1] + 0.11, MUG[2] + 0.08]} rotation-y={Math.PI / 4}>
        <torusGeometry args={[0.055, 0.017, 8, 18]} />
      </Part>
      <Part geo={cyl(0.08, 0.08, 0.01, 20)} m={M.toffee} p={[MUG[0], MUG[1] + 0.195, MUG[2]]} />
      <group ref={steam.group} />
      {reduceMotion && (
        <sprite scale={0.34} position={[MUG[0], MUG[1] + 0.5, MUG[2]]} raycast={noRay}>
          <spriteMaterial map={wispTex} transparent depthWrite={false} opacity={0.8} />
        </sprite>
      )}
    </>
  )
}
