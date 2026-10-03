import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, type PointsMaterial } from 'three'
import { TAU, smooth } from '../../math'
import { dn, mix, poly, rgb, seeded, usePainted } from '../paint'
import { noRay } from '../parts'
import { mood } from '../anim'
import { glowTex } from '../textures'

// Paris par la verrière de l'atelier : les toits de zinc et leurs mitrons de terre cuite, des chiens-assis allumés le soir,
// les toits qui s'éloignent en rangs, et la tour Eiffel au fond, qui scintille la nuit.
// Le plan peint couvre x ∈ [-1.8, 2.3], y ∈ [0.15, 3.55] : tout ce qu'on voit par la verrière.
const X0 = -1.8, Y1 = 3.55, PX = 200, W = 820, H = 680
const cx = (x: number) => (x - X0) * PX, cy = (y: number) => (Y1 - y) * PX
const TOWER = { x: 0.95, base: 1.8, top: 3.4 }

const P = {
  skyTop: ['#a9b9cc', '#0f1634'], skyLow: ['#e9dfd6', '#2c3468'],
  cloud: ['#c5cfdb', '#1e2550'], mist: ['#cdd3db', '#2a3060'],
  far: ['#a7b0bf', '#262d58'], farWall: ['#c9c0b4', '#2c3158'],
  zinc: ['#7f8b9c', '#2a3156'], zincLit: ['#a8b3c2', '#3a4270'], wall: ['#e3d6c2', '#3a3a62'], wallShade: ['#cbbca6', '#2e2f55'],
  chimney: ['#c9785a', '#5a3a4a'], tower: ['#8a7a6a', '#c9a060'], win: ['#5e6878', '#ffd28a'],
} as const

function draw(x: CanvasRenderingContext2D, n: number, rain: number) {
  const r = seeded(33), fog = dn(P.mist, n)
  const c = (k: keyof typeof P, far = 0) => rgb(mix(dn(P[k], n), fog, rain * (0.15 + far * 0.45)))
  const sky = x.createLinearGradient(0, 0, 0, cy(1.7))
  sky.addColorStop(0, c('skyTop', 1)); sky.addColorStop(1, c('skyLow', 1))
  x.fillStyle = sky; x.fillRect(0, 0, W, H)
  if (n > 0.05) for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,248,230,${(0.2 + r() * 0.6) * n * (1 - rain * 0.8)})`; x.fillRect(r() * W, r() * cy(2.4), 1.4, 1.4) }
  else for (let i = 0; i < 60; i++) { r(); r() }
  for (let i = 0; i < 9; i++) {
    const px = r() * W, py = 40 + r() * 200, w = 80 + r() * 140
    x.fillStyle = rgb(mix(dn(P.cloud, n), fog, rain * 0.5), 0.6 + rain * 0.3)
    x.beginPath(); x.ellipse(px, py, w, 18 + r() * 14, 0, 0, TAU); x.fill()
  }
  // la tour Eiffel : quatre pieds, deux étages, la flèche ; dorée la nuit
  const tx = cx(TOWER.x), tb = cy(TOWER.base), tt = cy(TOWER.top), th = tb - tt
  x.fillStyle = c('tower', 0.8)
  if (n > 0.05) {
    const gl = x.createRadialGradient(tx, tt + th * 0.5, 0, tx, tt + th * 0.5, th * 0.8)
    gl.addColorStop(0, `rgba(255,200,120,${0.3 * n * (1 - rain * 0.5)})`); gl.addColorStop(1, 'rgba(255,200,120,0)')
    x.fillStyle = gl; x.fillRect(tx - th, tt - 20, th * 2, th + 40)
    x.fillStyle = c('tower', 0.8)
  }
  poly(x, [[tx - th * 0.32, tb], [tx - th * 0.07, tt + th * 0.35], [tx - th * 0.025, tt + th * 0.1], [tx, tt], [tx + th * 0.025, tt + th * 0.1], [tx + th * 0.07, tt + th * 0.35], [tx + th * 0.32, tb], [tx + th * 0.18, tb], [tx, tb - th * 0.22], [tx - th * 0.18, tb]], x.fillStyle as string)
  x.fillRect(tx - th * 0.2, tb - th * 0.32, th * 0.4, th * 0.035)
  x.fillRect(tx - th * 0.1, tt + th * 0.38, th * 0.2, th * 0.03)
  // les toits lointains, en rangs, avec un dôme
  for (let row = 0; row < 3; row++) {
    const base = cy(1.95 - row * 0.22), hgt = 40 - row * 6
    let px = -20
    while (px < W) {
      const w = 50 + r() * 90, hh = hgt + r() * 20
      x.fillStyle = c(row % 2 ? 'farWall' : 'far', 0.9 - row * 0.25)
      x.fillRect(px, base - hh, w, hh + 60)
      poly(x, [[px - 4, base - hh], [px + 10, base - hh - 14], [px + w - 10, base - hh - 14], [px + w + 4, base - hh]], c('zinc', 0.9 - row * 0.25))
      if (n > 0.1 && r() < 0.5) { x.fillStyle = rgb(dn(P.win, n), 0.8 * n); x.fillRect(px + 10 + r() * (w - 20), base - hh + 8 + r() * 10, 5, 6) } else { r(); r(); r() }
      px += w + 4
    }
    if (row === 0) { const dx = cx(-0.6); x.fillStyle = c('far', 0.9); x.beginPath(); x.arc(dx, base - hgt - 10, 26, Math.PI, 0); x.fill(); x.fillRect(dx - 3, base - hgt - 50, 6, 16) }
  }
  // le toit d'en face, tout près : zinc, chiens-assis, souches de cheminée et leurs mitrons
  const roofTop = cy(1.25)
  x.fillStyle = c('wall'); x.fillRect(0, cy(0.7), W, H)
  poly(x, [[0, cy(0.75)], [0, roofTop + 30], [40, roofTop], [W, roofTop - 10], [W, cy(0.75)]], c('zinc'))
  x.strokeStyle = rgb(dn(P.zincLit, n), 0.6); x.lineWidth = 2
  for (let px = 20; px < W; px += 22) { x.beginPath(); x.moveTo(px, roofTop + 4); x.lineTo(px - 6, cy(0.75)); x.stroke() }
  for (const dxu of [-1.0, 0.1, 1.2]) {
    const dx = cx(dxu), dy = cy(0.98)
    x.fillStyle = c('wall'); x.fillRect(dx - 28, dy - 40, 56, 52)
    poly(x, [[dx - 34, dy - 40], [dx, dy - 66], [dx + 34, dy - 40]], c('zinc'))
    x.fillStyle = n > 0.2 ? rgb(dn(P.win, n)) : c('win'); x.fillRect(dx - 16, dy - 30, 32, 36)
    x.fillStyle = c('wallShade'); x.fillRect(dx - 1.5, dy - 30, 3, 36); x.fillRect(dx - 16, dy - 14, 32, 3)
  }
  for (const [sxu, sw] of [[-1.45, 70], [-0.45, 54], [0.75, 80], [1.85, 60]] as const) {
    const sx = cx(sxu), sy = roofTop + 6 - (sxu + 1.8) * 4
    x.fillStyle = c('wall'); x.fillRect(sx - sw / 2, sy - 56, sw, 60)
    x.fillStyle = c('wallShade'); x.fillRect(sx - sw / 2, sy - 60, sw, 8)
    for (let k = 0; k < Math.round(sw / 16); k++) { x.fillStyle = c('chimney'); x.fillRect(sx - sw / 2 + 5 + k * 16, sy - 76, 9, 18); x.fillRect(sx - sw / 2 + 4 + k * 16, sy - 78, 11, 4) }
  }
  x.fillStyle = c('wallShade'); x.fillRect(0, cy(0.75), W, 10)
  for (let px = 30; px < W; px += 90) { x.fillStyle = n > 0.3 && r() < 0.6 ? rgb(dn(P.win, n)) : c('win'); x.fillRect(px, cy(0.62), 34, 50) }
  // la pluie voile tout
  if (rain > 0.02) { x.fillStyle = rgb(fog, rain * 0.25); x.fillRect(0, 0, W, H) }
}

/** Les toits de Paris, et la tour Eiffel qui scintille à l'heure pile... ici, toutes les quelques secondes, la nuit. */
export function ParisView() {
  const tex = usePainted(W, H, draw), sparkle = useRef<PointsMaterial>(null!)
  const geo = useMemo(() => {
    const r = seeded(5), pts: number[] = []
    for (let i = 0; i < 40; i++) {
      const k = r(), y = TOWER.base + k * (TOWER.top - TOWER.base), half = (1 - k) * 0.42 * (TOWER.top - TOWER.base) * 0.75 + 0.01
      pts.push(TOWER.x + (r() - 0.5) * 2 * half, y, -3.69)
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(pts, 3))
  }, [])
  useFrame(({ clock }) => {
    const n = smooth(mood.night), t = clock.elapsedTime
    sparkle.current.opacity = n * (1 - mood.rain * 0.5) * (0.35 + 0.65 * Math.max(0, Math.sin(t * 9) * Math.sin(t * 0.4)))
  })
  return (
    <>
      <mesh position={[0.25, 1.85, -3.7]} raycast={noRay}>
        <planeGeometry args={[4.1, 3.4]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <points geometry={geo} raycast={noRay}>
        <pointsMaterial ref={sparkle} map={glowTex} color={0xfff2c8} size={0.12} sizeAttenuation blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </points>
    </>
  )
}
