import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { TAU } from '../../math'
import { dn, poly, rgb, seeded, usePainted } from '../paint'
import { noRay } from '../parts'
import { reduceMotion } from '../anim'
import { ScrollLayer } from '../objects/ScrollLayer'
import { LIVE } from '../Static'
import { farHillsTex, meadowLightsTex, meadowTex, nearTex } from './textures'

// Le paysage par la fenêtre du compartiment. Un fond peint (ciel, montagnes, lune) juste derrière le mur, et devant lui
// trois bandes qui défilent de plus en plus vite : collines lointaines, prés et fermes, talus et poteaux tout près.
// Le fond couvre x ∈ [-1.09, 1.81], y ∈ [0.92, 2.82] : c'est tout ce qu'on voit par la fenêtre.
const PX = 200, W = 580, H = 380, Y1 = 2.82
const cy = (y: number) => (Y1 - y) * PX

const P = {
  skyTop: ['#8db6d6', '#0d1330'], skyLow: ['#f7dcb6', '#2a3166'],
  mount: ['#aebfd3', '#252d58'], snow: ['#f6f4f2', '#8a95c6'], mountNear: ['#93a9bf', '#1d2448'],
} as const

function draw(x: CanvasRenderingContext2D, n: number) {
  const r = seeded(11), c = (k: keyof typeof P) => rgb(dn(P[k], n))
  const g = x.createLinearGradient(0, 0, 0, cy(1.9))
  g.addColorStop(0, c('skyTop')); g.addColorStop(1, c('skyLow'))
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  if (n > 0.05) {
    for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,248,230,${(0.3 + r() * 0.7) * n})`; const s = r() < 0.1 ? 2.2 : 1.2; x.fillRect(r() * W, r() * cy(2.3), s, s) }
    const mx = 430, my = 70, gl = x.createRadialGradient(mx, my, 0, mx, my, 90)
    gl.addColorStop(0, `rgba(220,226,255,${0.45 * n})`); gl.addColorStop(1, 'rgba(220,226,255,0)')
    x.fillStyle = gl; x.fillRect(0, 0, W, H)
    x.fillStyle = `rgba(250,248,238,${n})`; x.beginPath(); x.arc(mx, my, 17, 0, TAU); x.fill()
  }
  // les montagnes et leurs neiges
  const peaks = [[-20, 150], [60, 92], [130, 130], [210, 70], [300, 120], [380, 88], [460, 136], [540, 96], [620, 150]]
  poly(x, [[-20, cy(1.9)], ...peaks, [620, cy(1.9)]], c('mount'))
  for (let i = 1; i < peaks.length - 1; i += 1) {
    const [px, py] = peaks[i]
    if (py > 125) continue
    poly(x, [[px, py], [px - 26, py + 30], [px - 10, py + 24], [px, py + 34], [px + 12, py + 22], [px + 28, py + 30]], c('snow'))
  }
  poly(x, [[-20, cy(1.9)], [0, 170], [110, 150], [240, 176], [360, 150], [480, 170], [620, 156], [620, cy(1.9)]], c('mountNear'))
  x.fillStyle = c('mountNear'); x.fillRect(0, cy(1.95), W, H)
}

/** Le paysage qui défile, avec le léger roulis du train. */
export function TrainView() {
  const tex = usePainted(W, H, draw), g = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const t = clock.elapsedTime
    g.current.position.y = Math.sin(t * 2.1) * 0.006 + Math.sin(t * 7.3) * 0.002
  })
  return (
    <group ref={g} userData={LIVE} raycast={noRay}>
      <mesh position={[0.36, 1.87, -3.72]} raycast={noRay}>
        <planeGeometry args={[2.9, 1.9]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <ScrollLayer map={farHillsTex} position={[0.36, 1.98, -3.716]} size={[2.9, 0.36]} color={[0xffffff, 0x3a4678]} speed={0.006} />
      <ScrollLayer map={meadowTex} position={[0.36, 1.6, -3.712]} size={[2.9, 0.72]} color={[0xffffff, 0x2c3666]} speed={0.045} />
      <ScrollLayer map={meadowLightsTex} position={[0.36, 1.6, -3.708]} size={[2.9, 0.72]} color={[0xffffff, 0xffffff]} speed={0.045} opacity={[0, 1]} glow />
      <ScrollLayer map={nearTex} position={[0.36, 1.6, -3.704]} size={[2.9, 1.45]} color={[0xe8f0e0, 0x1c223e]} speed={0.32} />
    </group>
  )
}
