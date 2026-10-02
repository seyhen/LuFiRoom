import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import { TAU, rand, smooth } from '../../math'
import { mood } from '../anim'
import { noRay } from '../parts'
import { makeCanvas } from '../textures'

type RGB = [number, number, number]
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const rgb = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`

// Haut / bas du ciel de jour, de nuit, et sous la pluie ; collines de devant / de derrière.
const SK = {
  dTop: hex('#bfe4f4'), dBot: hex('#f8dbe8'), nTop: hex('#1c2252'), nBot: hex('#3d3577'),
  rdTop: hex('#aab3c6'), rdBot: hex('#d6d4e0'), rnTop: hex('#202238'), rnBot: hex('#34324f'),
  h1D: hex('#d9c6e8'), h1N: hex('#2d2955'), h2D: hex('#c4aedb'), h2N: hex('#221e45'),
}
const stars = Array.from({ length: 55 }, () => [rand(50, 470), rand(70, 270), rand(0.6, 1.8), Math.random()])
const [canvas, x] = makeCanvas(512, 400)
const tex = new CanvasTexture(canvas)

/** n : nuit, r : pluie (0 → 1). Soleil le jour, lune et étoiles la nuit, voilés par la pluie. */
function drawSky(n: number, r: number) {
  const top = mix(mix(SK.dTop, SK.nTop, n), mix(SK.rdTop, SK.rnTop, n), r)
  const bot = mix(mix(SK.dBot, SK.nBot, n), mix(SK.rdBot, SK.rnBot, n), r)
  const g = x.createLinearGradient(0, 60, 0, 360)
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot))
  x.fillStyle = g; x.fillRect(0, 0, 512, 400)
  const sa = n * (1 - r * 0.9)
  if (sa > 0.01) {
    for (const s of stars) {
      x.fillStyle = `rgba(255,248,230,${(sa * (0.35 + 0.65 * s[3])).toFixed(3)})`
      x.beginPath(); x.arc(s[0], s[1], s[2], 0, TAU); x.fill()
    }
    const mg = x.createRadialGradient(330, 150, 10, 330, 150, 80)
    mg.addColorStop(0, `rgba(255,240,210,${0.35 * sa})`); mg.addColorStop(1, 'rgba(255,240,210,0)')
    x.fillStyle = mg; x.fillRect(220, 40, 220, 220)
    x.fillStyle = `rgba(255,245,218,${sa})`; x.beginPath(); x.arc(330, 150, 25, 0, TAU); x.fill()
  }
  const su = (1 - n) * (1 - r * 0.85)
  if (su > 0.01) {
    const sg = x.createRadialGradient(140, 170, 10, 140, 170, 90)
    sg.addColorStop(0, `rgba(255,244,205,${0.7 * su})`); sg.addColorStop(1, 'rgba(255,244,205,0)')
    x.fillStyle = sg; x.fillRect(40, 70, 200, 200)
    x.fillStyle = `rgba(255,247,220,${su})`; x.beginPath(); x.arc(140, 170, 26, 0, TAU); x.fill()
  }
  x.fillStyle = rgb(mix(SK.h1D, SK.h1N, n))
  x.beginPath(); x.ellipse(130, 372, 230, 72, 0, 0, TAU); x.ellipse(450, 380, 220, 84, 0, 0, TAU); x.fill()
  x.fillStyle = rgb(mix(SK.h2D, SK.h2N, n))
  x.beginPath(); x.ellipse(300, 400, 260, 58, 0, 0, TAU); x.fill()
  tex.needsUpdate = true
}

/** Le ciel vu par la fenêtre, redessiné seulement quand le jour / nuit ou la pluie changent. */
export function WindowView() {
  const drawn = useRef({ n: -1, r: -1 })
  useFrame(() => {
    const d = drawn.current
    if (Math.abs(mood.night - d.n) > 0.01 || Math.abs(mood.rain - d.r) > 0.01) {
      drawSky(smooth(mood.night), smooth(mood.rain))
      d.n = mood.night
      d.r = mood.rain
    }
  })
  return (
    <mesh position={[1.0, 2.6, -3.62]} raycast={noRay}>
      <planeGeometry args={[3.6, 2.8]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  )
}
