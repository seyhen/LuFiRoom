import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Object3D, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { WIN, noRay } from '../parts'
import { WX, clearOf, dn, paintWhiteout, skyWx, useRepaint, weathered, whiteout, type Wx } from '../paint'
import { makeCanvas } from '../textures'
import { FlashVeil } from '../objects/FlashVeil'
import { DOT } from '../Floaters'
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

// Le ciel bas d'une pluie d'hiver (de jour, de nuit) : sur la cabane, la pluie tombe en neige fondue.
const SLEET = { top: hex('#a9b2c0'), bot: hex('#d5d9e0'), nTop: hex('#1a1f34'), nBot: hex('#30364f') }

/**
 * Ciel pâle le jour, lune et étoiles la nuit, collines et sapins sous la neige : la neige reste posée quelle que soit la météo.
 * La pluie (de la neige fondue ici) grise le ciel, l'orage le fonce, la neige le rend laiteux, la tempête de neige efface le lointain.
 */
function drawSky(w: Wx) {
  const { n, r } = w
  const sky = (d: RGB, nn: RGB, rd: RGB, rn: RGB) => rgb(skyWx(mix(mix(d, nn, n), mix(rd, rn, n), r * 0.75), w))
  const g = x.createLinearGradient(0, 40, 0, 340)
  g.addColorStop(0, sky(SK.dTop, SK.nTop, SLEET.top, SLEET.nTop)); g.addColorStop(1, sky(SK.dBot, SK.nBot, SLEET.bot, SLEET.nBot))
  x.fillStyle = g; x.fillRect(0, 0, 512, 400)
  const k = n * clearOf(w)
  if (k > 0.01) {
    for (const s of stars) {
      x.fillStyle = `rgba(255,248,230,${(k * (0.35 + 0.65 * s[3])).toFixed(3)})`
      x.beginPath(); x.arc(s[0], s[1], s[2], 0, TAU); x.fill()
    }
    const mg = x.createRadialGradient(360, 130, 10, 360, 130, 80)
    mg.addColorStop(0, `rgba(255,240,210,${0.35 * k})`); mg.addColorStop(1, 'rgba(255,240,210,0)')
    x.fillStyle = mg; x.fillRect(250, 20, 220, 220)
    x.fillStyle = `rgba(255,245,218,${k})`; x.beginPath(); x.arc(360, 130, 24, 0, TAU); x.fill()
  }
  // la neige des collines, un peu grise quand il pleut dessus ; le lointain s'efface dans la tempête
  const wet = (c: RGB, far: number) => weathered(mix(c, dn(WX.snowShade, n), r * 0.3), w, far)
  const hills = (col: RGB, cy: number, rx: number, ry: number, cxs: number[]) => {
    x.fillStyle = rgb(col)
    x.beginPath()
    for (const c of cxs) x.ellipse(c, cy, rx, ry, 0, 0, TAU)
    x.fill()
  }
  hills(wet(mix(SK.h2D, SK.h2N, n), 0.7), 392, 250, 74, [120, 430])
  for (const [cx, b, h] of [[70, 330, 90], [160, 322, 70], [430, 326, 100], [350, 318, 66]]) pine(cx, b, h, weathered(mix(SK.p2D, SK.p2N, n), w, 0.7))
  hills(wet(mix(SK.h1D, SK.h1N, n), 0.2), 410, 300, 66, [60, 300, 520])
  for (const [cx, b, h] of [[250, 360, 118], [120, 372, 84], [470, 366, 96]]) pine(cx, b, h, weathered(mix(SK.p1D, SK.p1N, n), w, 0.2))
  paintWhiteout(x, 512, 400, w, 0.45, 0.2)
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

/**
 * Le paysage vu par la fenêtre, et la neige qui tombe derrière la vitre : poussée de côté quand le vent souffle ou par la tempête
 * de neige, en neige fondue (plus fine, plus rapide) quand il pleut.
 */
export function SnowView() {
  const ref = useRef<InstancedMesh>(null!), gust = useRef(0)
  const flakes = useMemo(() => Array.from({ length: FLAKES }, () => { const f = {} as Flake; spawn(f, true); return f }), [])
  useRepaint(drawSky)
  useFrame(({ clock }, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), t = clock.elapsedTime
    gust.current += ((isActive(useStore.getState(), 'window') ? 1 : 0) - gust.current) * Math.min(1, dt * 1.5)
    // La pluie : de la neige fondue, plus fine, qui tombe plus vite. La tempête de neige : poussée de côté, à toute allure.
    const sleet = smooth(mood.rain), wo = whiteout({ n: 0, r: 0, s: smooth(mood.snow), st: 0 })
    const wind = (gust.current + wo * 1.4) * (1.1 + Math.sin(t * 0.9) * 0.5)
    const fall = (1 + gust.current * 0.6) * (1 + sleet * 1.6 + wo * 1.2), size = 1 - sleet * 0.4
    flakes.forEach((f, i) => {
      f.y -= f.v * dt * fall
      f.x += (Math.sin(t * 0.8 + f.ph) * 0.12 * (1 - sleet) - wind) * dt
      if (f.y < WIN.y0 - 0.25) spawn(f, false)
      if (f.x < X0) f.x = X1
      dummy.position.set(f.x, f.y, f.z)
      dummy.scale.set(f.s * size * (1 + wo * 0.6), f.s * (size + sleet * 0.5), f.s * size)
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
      <FlashVeil position={[1.4, 3.0, -3.6]} size={[2.8, 2.2]} />
      <instancedMesh ref={ref} args={[DOT, C.snow, FLAKES]} frustumCulled={false} raycast={noRay} />
    </>
  )
}
