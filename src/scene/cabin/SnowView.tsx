import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Object3D, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { SPH, WIN, noRay } from '../parts'
import { makeCanvas } from '../textures'
import { C } from './materials'

type RGB = [number, number, number]
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const rgb = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`

// Ciel et collines enneigées, de jour et de nuit ; sapins devant et derrière.
const SK = {
  dTop: hex('#c3d6ec'), dBot: hex('#f2f6fb'), nTop: hex('#121a40'), nBot: hex('#2c3673'),
  h1D: hex('#ffffff'), h1N: hex('#9aaadb'), h2D: hex('#dfe9f6'), h2N: hex('#6d7fba'),
  p1D: hex('#4f8f94'), p1N: hex('#1c3d5a'), p2D: hex('#79aeb0'), p2N: hex('#26496a'),
}
const stars = Array.from({ length: 50 }, () => [rand(40, 480), rand(40, 230), rand(0.6, 1.7), Math.random()])
const [canvas, x] = makeCanvas(512, 400)
const tex = new CanvasTexture(canvas)

function pine(cx: number, base: number, h: number, col: RGB) {
  x.fillStyle = rgb(col)
  for (let i = 0; i < 3; i++) {
    const w = h * (0.34 - i * 0.07), y0 = base - h * (0.2 + i * 0.27), y1 = y0 - h * 0.46
    x.beginPath(); x.moveTo(cx - w, y0); x.lineTo(cx, y1); x.lineTo(cx + w, y0); x.closePath(); x.fill()
  }
}

/** n : nuit (0 → 1). Ciel pâle le jour, lune et étoiles la nuit, collines et sapins sous la neige. */
function drawSky(n: number) {
  const g = x.createLinearGradient(0, 40, 0, 340)
  g.addColorStop(0, rgb(mix(SK.dTop, SK.nTop, n))); g.addColorStop(1, rgb(mix(SK.dBot, SK.nBot, n)))
  x.fillStyle = g; x.fillRect(0, 0, 512, 400)
  if (n > 0.01) {
    for (const s of stars) {
      x.fillStyle = `rgba(255,248,230,${(n * (0.35 + 0.65 * s[3])).toFixed(3)})`
      x.beginPath(); x.arc(s[0], s[1], s[2], 0, TAU); x.fill()
    }
    const mg = x.createRadialGradient(360, 130, 10, 360, 130, 80)
    mg.addColorStop(0, `rgba(255,240,210,${0.35 * n})`); mg.addColorStop(1, 'rgba(255,240,210,0)')
    x.fillStyle = mg; x.fillRect(250, 20, 220, 220)
    x.fillStyle = `rgba(255,245,218,${n})`; x.beginPath(); x.arc(360, 130, 24, 0, TAU); x.fill()
  }
  const hills = (col: RGB, cy: number, rx: number, ry: number, cxs: number[]) => {
    x.fillStyle = rgb(col)
    x.beginPath()
    for (const c of cxs) x.ellipse(c, cy, rx, ry, 0, 0, TAU)
    x.fill()
  }
  hills(mix(SK.h2D, SK.h2N, n), 392, 250, 74, [120, 430])
  for (const [cx, b, h] of [[70, 330, 90], [160, 322, 70], [430, 326, 100], [350, 318, 66]]) pine(cx, b, h, mix(SK.p2D, SK.p2N, n))
  hills(mix(SK.h1D, SK.h1N, n), 410, 300, 66, [60, 300, 520])
  for (const [cx, b, h] of [[250, 360, 118], [120, 372, 84], [470, 366, 96]]) pine(cx, b, h, mix(SK.p1D, SK.p1N, n))
  tex.needsUpdate = true
}

const FLAKES = 130
const dummy = new Object3D()
const X0 = WIN.x0 - 0.3, X1 = WIN.x1 + 0.3 // un peu plus large que la fenêtre, pour que le vent ne la vide pas

interface Flake {
  x: number
  y: number
  z: number
  v: number
  ph: number
  s: number
}
const spawn = (f: Flake, anywhere: boolean) => {
  f.x = rand(X0, X1)
  f.y = anywhere ? rand(WIN.y0 - 0.2, WIN.y1 + 0.1) : WIN.y1 + 0.15
  f.z = rand(-3.55, -3.4)
  f.v = rand(0.3, 0.6)
  f.ph = rand(0, TAU)
  f.s = rand(0.014, 0.03)
}

/** Le paysage vu par la fenêtre, et la neige qui tombe derrière la vitre : poussée de côté quand le vent souffle. */
export function SnowView() {
  const ref = useRef<InstancedMesh>(null!), drawn = useRef(-1), gust = useRef(0)
  const flakes = useMemo(() => Array.from({ length: FLAKES }, () => { const f = {} as Flake; spawn(f, true); return f }), [])
  useFrame(({ clock }, delta) => {
    if (Math.abs(mood.night - drawn.current) > 0.01) {
      drawSky(smooth(mood.night))
      drawn.current = mood.night
    }
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), t = clock.elapsedTime
    gust.current += ((isActive(useStore.getState(), 'window') ? 1 : 0) - gust.current) * Math.min(1, dt * 1.5)
    const wind = gust.current * (1.1 + Math.sin(t * 0.9) * 0.5)
    flakes.forEach((f, i) => {
      f.y -= f.v * dt * (1 + gust.current * 0.6)
      f.x += (Math.sin(t * 0.8 + f.ph) * 0.12 - wind) * dt
      if (f.y < WIN.y0 - 0.25) spawn(f, false)
      if (f.x < X0) f.x = X1
      dummy.position.set(f.x, f.y, f.z)
      dummy.scale.setScalar(f.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <mesh position={[1.0, 2.6, -3.62]} raycast={noRay}>
        <planeGeometry args={[3.6, 2.8]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <instancedMesh ref={ref} args={[SPH, C.snow, FLAKES]} frustumCulled={false} raycast={noRay} />
    </>
  )
}
