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

// Ciel et silhouettes, de jour et de nuit, puis sous la pluie : plus gris, plus bas.
const C = {
  dTop: hex('#bcc8d3'), dBot: hex('#e8ebee'), nTop: hex('#121836'), nBot: hex('#3b4070'),
  rdTop: hex('#8c98a6'), rdBot: hex('#c3c8ce'), rnTop: hex('#161a2d'), rnBot: hex('#2d3250'),
  hillD: hex('#9ca9a4'), hillN: hex('#2a3052'), rockD: hex('#7b8088'), rockN: hex('#1f2542'),
  castD: hex('#8a8c92'), castN: hex('#242a4a'), townD: hex('#6d7480'), townN: hex('#1a2040'), nearD: hex('#4d535f'), nearN: hex('#121830'),
}
const stars = Array.from({ length: 36 }, () => [rand(30, 480), rand(20, 150), rand(0.6, 1.5), Math.random()])
// Fenêtres du Old Town, tirées une fois pour toutes : [x, y, allumée à partir de n].
const lights = Array.from({ length: 70 }, () => [rand(215, 470), rand(255, 335), Math.random()])
const [canvas, x] = makeCanvas(512, 400)
const tex = new CanvasTexture(canvas)

function poly(pts: number[][], col: RGB) {
  x.fillStyle = rgb(col)
  x.beginPath()
  pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)))
  x.closePath()
  x.fill()
}

/** n : nuit, r : pluie (0 → 1). Arthur's Seat, le Château sur son rocher, la crête de la Old Town avec St Giles et le Scott Monument. */
function drawSky(n: number, r: number) {
  const top = mix(mix(C.dTop, C.nTop, n), mix(C.rdTop, C.rnTop, n), r)
  const bot = mix(mix(C.dBot, C.nBot, n), mix(C.rdBot, C.rnBot, n), r)
  const g = x.createLinearGradient(0, 0, 0, 340)
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot))
  x.fillStyle = g; x.fillRect(0, 0, 512, 400)
  // La fenêtre ne laisse voir que x 142 → 483, y 21 → 271 de cette image : on y loge le dessin, réduit.
  x.save()
  x.translate(140, 37)
  x.scale(0.68, 0.68)
  const sa = n * (1 - r * 0.9)
  if (sa > 0.01) {
    for (const s of stars) {
      x.fillStyle = `rgba(255,248,230,${(sa * (0.35 + 0.65 * s[3])).toFixed(3)})`
      x.beginPath(); x.arc(s[0], s[1], s[2], 0, TAU); x.fill()
    }
  }
  const dim = (c: RGB, d: RGB) => mix(mix(c, d, n), top, r * 0.28) // la pluie voile les silhouettes
  // Arthur's Seat : une grosse bosse à droite, avec son épaule.
  poly([[300, 330], [340, 270], [392, 225], [430, 212], [462, 228], [500, 262], [530, 300], [540, 335]], dim(C.hillD, C.hillN))
  // Le rocher du Château, escarpé à gauche, qui descend en pente vers la Old Town.
  poly([[0, 340], [0, 262], [26, 250], [40, 232], [150, 228], [168, 240], [196, 280], [250, 322], [260, 340]], dim(C.rockD, C.rockN))
  // Le Château : remparts, tours à créneaux, la tour de l'horloge, un drapeau.
  const cast = dim(C.castD, C.castN)
  poly([[40, 232], [40, 190], [150, 190], [150, 232]], cast)
  poly([[56, 190], [56, 160], [88, 160], [88, 190]], cast)
  poly([[104, 190], [104, 148], [136, 148], [136, 190]], cast)
  poly([[110, 148], [120, 122], [130, 148]], cast)
  x.fillStyle = rgb(cast)
  for (let cx = 40; cx < 150; cx += 12) x.fillRect(cx, 184, 7, 6) // créneaux
  x.fillRect(119, 108, 2, 16)
  x.fillStyle = rgb(mix(hex('#a93a3a'), hex('#4a2a40'), n)); x.fillRect(121, 108, 12, 7)
  // La crête de la Old Town : immeubles étroits aux toits pointus, de plus en plus bas.
  const town = dim(C.townD, C.townN)
  const houses: [number, number, number][] = [[236, 62, 26], [262, 80, 24], [286, 58, 28], [314, 94, 26], [366, 70, 24], [392, 56, 28], [420, 66, 26], [448, 52, 28]]
  for (const [hx, hh, hw] of houses) {
    poly([[hx, 330], [hx, 330 - hh], [hx + hw / 2, 330 - hh - 18], [hx + hw, 330 - hh], [hx + hw, 330]], town)
    x.fillRect(hx + 4, 330 - hh - 28, 3, 12) // cheminée
  }
  // St Giles : une flèche à couronne d'arcs boutants.
  poly([[334, 330], [334, 214], [352, 214], [352, 330]], town)
  poly([[336, 214], [343, 150], [350, 214]], town)
  x.strokeStyle = rgb(town); x.lineWidth = 3
  for (const dx of [-9, 9]) { x.beginPath(); x.moveTo(343, 190); x.quadraticCurveTo(343 + dx * 1.4, 178, 343 + dx, 214); x.stroke() }
  // Le Scott Monument : une aiguille gothique, plus fine, plus loin.
  poly([[476, 330], [478, 190], [484, 150], [490, 190], [492, 330]], town)
  poly([[470, 330], [470, 256], [498, 256], [498, 330]], town)
  // Les toits de devant, noirs, avec des cheminées.
  const near = dim(C.nearD, C.nearN)
  poly([[0, 400], [0, 350], [60, 344], [64, 360], [120, 352], [124, 338], [190, 346], [196, 360], [250, 350], [320, 356], [326, 342], [400, 350], [470, 346], [512, 354], [512, 400]], near)
  x.fillStyle = rgb(near)
  for (const cx of [30, 94, 168, 288, 372, 440]) x.fillRect(cx, 328, 10, 22)
  // Les fenêtres allumées au crépuscule et la nuit.
  for (const [lx, ly, th] of lights) {
    const a = smooth(Math.min(1, Math.max(0, (n * 1.15 - th * 0.6) * 2))) * 0.9
    if (a < 0.02) continue
    x.fillStyle = `rgba(255,205,120,${a.toFixed(2)})`
    x.fillRect(lx, ly, 4, 5)
  }
  x.restore()
  // Des traînées de pluie sur la vitre : quelques traits clairs et obliques.
  if (r > 0.05) {
    x.strokeStyle = `rgba(235,242,250,${(0.22 * r).toFixed(2)})`
    x.lineWidth = 1.4
    for (let i = 0; i < 90; i++) {
      const sx = 140 + ((i * 53) % 350), sy = 20 + ((i * 97) % 255)
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx - 5, sy + 24); x.stroke()
    }
  }
  tex.needsUpdate = true
}

/** Édimbourg vu par la fenêtre, redessiné seulement quand le jour / nuit ou la pluie changent. */
export function Skyline() {
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
