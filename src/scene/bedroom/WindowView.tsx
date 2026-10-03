import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
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

/** Une étoile filante : un trait qui s'efface derrière sa tête, `t` de 0 à 1. */
function drawShootingStar(t: number, x0: number, y0: number) {
  const X = x0 - t * 150, Y = y0 + t * 70, a = Math.sin(Math.PI * t)
  const g = x.createLinearGradient(X + 60, Y - 28, X, Y)
  g.addColorStop(0, 'rgba(255,250,225,0)'); g.addColorStop(1, `rgba(255,250,225,${(0.95 * a).toFixed(3)})`)
  x.strokeStyle = g; x.lineWidth = 2.6; x.lineCap = 'round'
  x.beginPath(); x.moveTo(X + 60, Y - 28); x.lineTo(X, Y); x.stroke()
  x.fillStyle = `rgba(255,252,235,${a.toFixed(3)})`
  x.beginPath(); x.arc(X, Y, 3, 0, TAU); x.fill()
  tex.needsUpdate = true
}

/**
 * Le ciel vu par la fenêtre, redessiné seulement quand le jour / nuit ou la pluie changent. Par ciel dégagé, une étoile
 * file de temps en temps.
 */
export function WindowView() {
  const drawn = useRef({ n: -1, r: -1 }), star = useRef({ at: -1, next: 10 + Math.random() * 12, x: 400, y: 50 })
  useFrame((_, delta) => {
    const d = drawn.current, s = star.current
    const n = smooth(mood.night), r = smooth(mood.rain)
    if (!reduceMotion) {
      s.next -= Math.min(delta, 0.05)
      if (s.at < 0 && s.next <= 0 && n > 0.95 && r < 0.05) {
        s.at = 0
        s.next = 22 + Math.random() * 30
        s.x = 380 + Math.random() * 90
        s.y = 40 + Math.random() * 60
      }
    }
    if (s.at >= 0) {
      s.at += Math.min(delta, 0.05)
      drawSky(n, r)
      if (s.at < 0.9) drawShootingStar(s.at / 0.9, s.x, s.y)
      else s.at = -1
      d.n = mood.night
      d.r = mood.rain
    } else if (Math.abs(mood.night - d.n) > 0.01 || Math.abs(mood.rain - d.r) > 0.01) {
      drawSky(n, r)
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
