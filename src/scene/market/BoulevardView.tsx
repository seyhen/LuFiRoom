import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Group, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { dn, rgb, seeded, usePainted } from '../paint'
import { WIN, noRay } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { ScrollLayer } from '../objects/ScrollLayer'
import { LIVE } from '../Static'
import { streakTex } from '../lighthouse/textures'
import { tramTex, umbrellasTex } from './textures'

// Le boulevard par la baie. Un fond peint (ciel de pluie, ville lointaine, grands immeubles à enseignes, chaussée mouillée et
// ses reflets), posé derrière le mur ; devant lui un tram qui passe, deux files de passants sous leurs parapluies, et le souffle
// des enseignes. Ce qu'on voit par un trou du mur remonte et glisse vers la droite : le plan est décalé de (-0,65 ; -0,52).
const CX = (WIN.x0 + WIN.x1) / 2 - 0.65, CY = (WIN.y0 + WIN.y1) / 2 - 0.52, Z = -3.8, PX = 200, W = 640, H = 480
const wx = (px: number) => CX + (px - 320) / PX // pixel → x du monde
const wy = (py: number) => CY - (py - 240) / PX // pixel → y du monde
const STREET = 335 // pixel où commence la chaussée

const P = {
  skyTop: ['#8e82b0', '#0d0924'], skyLow: ['#eec0c2', '#3d1b5c'], far: ['#7a6c9a', '#1a1238'], mid: ['#5c4c7c', '#120c2a'],
  midLit: ['#6e5c8c', '#1c1440'], street: ['#6c5a80', '#120e24'], curb: ['#b09ab8', '#2a2048'],
} as const
// Les enseignes du fond : [x, y, largeur, hauteur, couleur de nuit, couleur de jour].
const SIGNS: [number, number, number, number, string, string][] = [
  [128, 150, 18, 78, '#ff4fb0', '#e88ab8'], [196, 190, 14, 56, '#4ff0ff', '#88c0d0'], [330, 130, 22, 96, '#ffd24a', '#d8b878'],
  [420, 176, 16, 70, '#ff6f4a', '#d89880'], [500, 140, 20, 88, '#a07cff', '#a090c8'], [262, 208, 30, 12, '#4fff9a', '#88c8a8'],
]

function draw(x: CanvasRenderingContext2D, n: number, rain: number) {
  const r = seeded(17), c = (k: keyof typeof P, a = 1) => rgb(dn(P[k], n), a)
  const sky = x.createLinearGradient(0, 0, 0, STREET)
  sky.addColorStop(0, c('skyTop')); sky.addColorStop(1, c('skyLow'))
  x.fillStyle = sky; x.fillRect(0, 0, W, H)
  // la ville au loin : de petits blocs serrés, quelques fenêtres
  x.fillStyle = c('far')
  for (let px = -10; px < W; px += 22 + r() * 18) { const h = 70 + r() * 110; x.fillRect(px, STREET - h - 30, 20 + r() * 16, h + 30) }
  // les grands immeubles du boulevard, fenêtres allumées par paliers
  const blocks = [[30, 100, 120], [140, 135, 150], [250, 92, 130], [370, 120, 140], [490, 98, 120], [570, 130, 100]]
  for (const [bx, bw, bh] of blocks) {
    x.fillStyle = c('mid'); x.fillRect(bx, STREET - bh, bw, bh + 4)
    x.fillStyle = c('midLit', 0.5); x.fillRect(bx, STREET - bh, 6, bh)
    for (let j = 0; j < Math.floor(bh / 22); j++) for (let i = 0; i < Math.floor(bw / 18); i++) {
      const lit = r() < 0.5 * n + 0.1
      x.fillStyle = lit ? `rgba(255,${(200 + r() * 40) | 0},${(120 + r() * 60) | 0},${0.45 + 0.4 * n})` : c('far', 0.7)
      x.fillRect(bx + 8 + i * 18, STREET - bh + 10 + j * 22, 9, 11)
    }
  }
  // enseignes verticales : un bandeau lumineux, un halo, des barres de « caractères »
  for (const [sx, sy, sw, sh, night, day] of SIGNS) {
    const col = rgb(dn([day, night], n))
    x.save()
    x.shadowColor = col; x.shadowBlur = 8 + 18 * n
    x.fillStyle = col; x.globalAlpha = 0.55 + 0.45 * n
    x.fillRect(sx, sy, sw, sh)
    x.restore()
    x.fillStyle = `rgba(30,10,40,${0.55})`
    for (let k = 0; k < sh / 12; k++) x.fillRect(sx + 3, sy + 4 + k * 12, sw - 6 - (k % 3) * 2, 5)
  }
  // la chaussée mouillée : un dégradé sombre, la bordure, les reflets verticaux des enseignes et des fenêtres
  const road = x.createLinearGradient(0, STREET, 0, H)
  road.addColorStop(0, c('street')); road.addColorStop(1, c('mid'))
  x.fillStyle = road; x.fillRect(0, STREET, W, H - STREET)
  x.fillStyle = c('curb'); x.fillRect(0, STREET, W, 5)
  for (const [sx, , sw, , night, day] of SIGNS) {
    const col = dn([day, night], n), g = x.createLinearGradient(0, STREET, 0, H)
    g.addColorStop(0, rgb(col, 0.1 + 0.4 * n)); g.addColorStop(1, rgb(col, 0))
    x.fillStyle = g
    for (let k = 0; k < 4; k++) x.fillRect(sx - 4 + k * 2 + r() * 6, STREET + 5, sw + 6 - k * 2, 120)
  }
  x.fillStyle = `rgba(255,255,255,${0.1 + 0.1 * n})`
  for (let k = 0; k < 28; k++) x.fillRect(r() * W, STREET + 20 + r() * 110, 8 + r() * 40, 1.5)
  // des lignes de pluie, très fines, quand il pleut
  if (rain > 0.02) {
    x.strokeStyle = `rgba(210,220,255,${0.35 * rain})`; x.lineWidth = 1
    for (let k = 0; k < 110; k++) { const px = r() * W, py = r() * H; x.beginPath(); x.moveTo(px, py); x.lineTo(px - 4, py + 18); x.stroke() }
  }
}

const dayTint = new Color(0xb8a8c8), nightTint = new Color(0xffffff)

/** La baie sur le boulevard, le tram qui y passe et la vitre qui ruisselle ; un tap sur la baie est le 'tram' (son et animation). */
export function BoulevardView() {
  const tex = usePainted(W, H, draw)
  const tram = useRef<Mesh>(null!), glows = useRef<Sprite[]>([]), streaks = useRef<Mesh>(null!), body = useRef<Group>(null!)
  useSquash('tram', body)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, n = smooth(mood.night), dt = Math.min(delta, 0.05)
    // le tram : huit secondes et demie de passage, toutes les trente-six secondes
    const q = (t % 36) / 8.5, m = tram.current, mat = m.material as MeshBasicMaterial
    m.visible = q < 1
    m.position.x = CX + 2.4 - Math.min(q, 1) * 4.8
    m.position.y = wy(301) + (reduceMotion ? 0 : Math.sin(t * 22) * 0.002)
    mat.color.copy(dayTint).lerp(nightTint, n)
    mat.opacity = Math.min(1, q * 8, (1 - q) * 8)
    // les enseignes respirent
    glows.current.forEach((g, i) => {
      g.material.opacity = n * (0.55 + (reduceMotion ? 0 : Math.sin(t * (1.1 + i * 0.37) + i) * 0.18))
    })
    // la vitre ruisselle quand il pleut
    const sm = streaks.current.material as MeshBasicMaterial
    sm.opacity = smooth(mood.rain) * 0.55
    streaks.current.visible = sm.opacity > 0.01
    if (!reduceMotion) { const o = sm.map!.offset; o.y = (o.y - dt * 0.2 + 1) % 1 }
  })
  const w = WIN.x1 - WIN.x0, h = WIN.y1 - WIN.y0
  return (
    <group userData={LIVE} raycast={noRay}>
      <mesh position={[CX, CY, Z]} raycast={noRay}>
        <planeGeometry args={[W / PX, H / PX]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      {SIGNS.map(([sx, sy, sw, sh, col], i) => (
        <sprite key={i} ref={(el) => void (el && (glows.current[i] = el))} position={[wx(sx + sw / 2), wy(sy + sh / 2), Z + 0.004]} scale={[sw / PX + 0.7, sh / PX + 0.7, 1]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={col} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
      <mesh ref={tram} position={[CX, wy(301), Z + 0.008]} raycast={noRay} visible={false}>
        <planeGeometry args={[1.75, 0.33]} />
        <meshBasicMaterial map={tramTex} transparent depthWrite={false} opacity={0} />
      </mesh>
      <ScrollLayer map={umbrellasTex} position={[CX, wy(372), Z + 0.012]} size={[3.2, 0.38]} color={[0xa86a8c, 0xff6fb0]} speed={0.012} bob={[0.004, 3]} opacity={[0.7, 0.85]} />
      <ScrollLayer map={umbrellasTex} position={[CX, wy(400), Z + 0.014]} size={[3.2, 0.5]} color={[0x6a8aa8, 0x4fd8ff]} speed={-0.02} bob={[0.006, 2.4]} phase={1.4} opacity={[0.75, 0.9]} />
      {/* la vitre : de la pluie qui ruisselle, par-dessus la baie */}
      <mesh ref={streaks} position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -3.065]} renderOrder={2} raycast={noRay}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={streakTex} transparent depthWrite={false} opacity={0} />
      </mesh>
      {/* zone de tap invisible sur toute la baie */}
      <group ref={body} userData={{ id: 'tram' }}>
        <mesh visible={false} position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -2.98]}>
          <planeGeometry args={[w, h]} />
        </mesh>
      </group>
    </group>
  )
}
