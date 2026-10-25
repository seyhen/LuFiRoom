import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { TAU } from '../../math'
import { WX, clearOf, dn, mix, paintFlakes, paintWhiteout, poly, rgb, seeded, skyWx, snowLine, usePainted, weathered, type Wx } from '../paint'
import { FlashVeil } from '../objects/FlashVeil'
import { ViewFlakes } from '../objects/ViewFlakes'
import { PANE } from './TrainShell'
import { noRay } from '../parts'
import { reduceMotion } from '../anim'
import { ScrollLayer } from '../objects/ScrollLayer'
import { LIVE } from '../Static'
import { farHillsSnowTex, farHillsTex, meadowLightsTex, meadowSnowTex, meadowTex, nearSnowTex, nearTex } from './textures'

// Le paysage par la fenêtre du compartiment. Un fond peint (ciel, montagnes, lune) juste derrière le mur, et devant lui
// trois bandes qui défilent de plus en plus vite : collines lointaines, prés et fermes, talus et poteaux tout près.
// Le fond couvre x ∈ [-1.09, 1.81], y ∈ [0.92, 2.82] : c'est tout ce qu'on voit par la fenêtre.
const PX = 200, W = 580, H = 380, Y1 = 2.82
const cy = (y: number) => (Y1 - y) * PX

const P = {
  skyTop: ['#8db6d6', '#0d1330'], skyLow: ['#f7dcb6', '#2a3166'],
  mount: ['#aebfd3', '#252d58'], snow: ['#f6f4f2', '#8a95c6'], mountNear: ['#93a9bf', '#1d2448'],
  rainSky: ['#9fa8b6', '#181d34'],
} as const

/**
 * Le ciel et les montagnes. La pluie grise le ciel et voile les sommets ; l'orage les fonce ; la neige blanchit les montagnes
 * jusqu'en bas, la tempête de neige les efface.
 */
function draw(x: CanvasRenderingContext2D, n: number, rain: number, w: Wx) {
  const r = seeded(11), clear = clearOf(w), snowy = Math.min(1, w.s * 1.4)
  const c = (k: keyof typeof P, far = 0.6) => rgb(weathered(mix(dn(P[k], n), dn(P.rainSky, n), rain * 0.35), w, far))
  const sky = (k: keyof typeof P) => rgb(skyWx(mix(dn(P[k], n), dn(P.rainSky, n), rain * 0.75), w))
  const g = x.createLinearGradient(0, 0, 0, cy(1.9))
  g.addColorStop(0, sky('skyTop')); g.addColorStop(1, sky('skyLow'))
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  if (n > 0.05) {
    const k = n * clear
    for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,248,230,${(0.3 + r() * 0.7) * k})`; const s = r() < 0.1 ? 2.2 : 1.2; x.fillRect(r() * W, r() * cy(2.3), s, s) }
    const mx = 430, my = 70, gl = x.createRadialGradient(mx, my, 0, mx, my, 90)
    gl.addColorStop(0, `rgba(220,226,255,${0.45 * k})`); gl.addColorStop(1, 'rgba(220,226,255,0)')
    x.fillStyle = gl; x.fillRect(0, 0, W, H)
    x.fillStyle = `rgba(250,248,238,${k})`; x.beginPath(); x.arc(mx, my, 17, 0, TAU); x.fill()
  }
  // les montagnes et leurs neiges (sous la neige, elles sont blanches jusqu'au pied)
  const peaks = [[-20, 150], [60, 92], [130, 130], [210, 70], [300, 120], [380, 88], [460, 136], [540, 96], [620, 150]]
  poly(x, [[-20, cy(1.9)], ...peaks, [620, cy(1.9)]], rgb(weathered(mix(mix(dn(P.mount, n), dn(P.rainSky, n), rain * 0.35), dn(WX.snowShade, n), snowy), w, 0.8)))
  for (let i = 1; i < peaks.length - 1; i += 1) {
    const [px, py] = peaks[i]
    if (py > 125) continue
    poly(x, [[px, py], [px - 26, py + 30], [px - 10, py + 24], [px, py + 34], [px + 12, py + 22], [px + 28, py + 30]], c('snow', 0.8))
  }
  const near = [[-20, cy(1.9)], [0, 170], [110, 150], [240, 176], [360, 150], [480, 170], [620, 156], [620, cy(1.9)]]
  const nearC = rgb(weathered(mix(mix(dn(P.mountNear, n), dn(P.rainSky, n), rain * 0.35), dn(WX.snowShade, n), snowy * 0.8), w, 0.5))
  poly(x, near, nearC)
  snowLine(x, near.slice(1, -1), 4, w)
  x.fillStyle = nearC; x.fillRect(0, cy(1.95), W, H)
  paintWhiteout(x, W, H, w, 0.55, 0.3)
  paintFlakes(x, W, H, w, 6)
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
    <>
    <group ref={g} userData={LIVE} raycast={noRay}>
      <mesh position={[0.36, 1.87, -3.72]} raycast={noRay}>
        <planeGeometry args={[2.9, 1.9]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      {/* sous la neige, chaque bande a sa jumelle blanche qui défile avec elle ; l'orage les assombrit */}
      <ScrollLayer map={farHillsTex} snowMap={farHillsSnowTex} position={[0.36, 1.98, -3.716]} size={[2.9, 0.36]} color={[0xffffff, 0x3a4678]} storm={[0x8a92a0, 0x262e52]} snow={[0xf2f4f8, 0x5a6694]} speed={0.006} />
      <ScrollLayer map={meadowTex} snowMap={meadowSnowTex} position={[0.36, 1.6, -3.712]} size={[2.9, 0.72]} color={[0xffffff, 0x2c3666]} storm={[0x8e98a0, 0x1e2648]} snow={[0xffffff, 0x4c5888]} speed={0.045} />
      <ScrollLayer map={meadowLightsTex} position={[0.36, 1.6, -3.708]} size={[2.9, 0.72]} color={[0xffffff, 0xffffff]} speed={0.045} opacity={[0, 1]} glow />
      <ScrollLayer map={nearTex} snowMap={nearSnowTex} position={[0.36, 1.6, -3.704]} size={[2.9, 1.45]} color={[0xe8f0e0, 0x1c223e]} storm={[0x9aa0a4, 0x161a32]} snow={[0xf6f8fb, 0x3a4470]} speed={0.32} />
    </group>
    <FlashVeil position={[0.36, 2.0, -3.7]} size={[2.9, 1.7]} />
    {/* le train file : les flocons filent de côté derrière la vitre */}
    <ViewFlakes x={[PANE.x0 - 0.4, PANE.x1 + 0.4]} y={[PANE.y0 - 0.2, PANE.y1 + 0.2]} z={[-3.68, -3.4]} n={80} fly={2.2} />
    </>
  )
}
