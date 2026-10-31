import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import { TAU, rand } from '../../math'
import { mood, reduceMotion } from '../anim'
import { WX, clearOf, dn, paintFlakes, paintWhiteout, skyWx, useRepaint, weathered, type Wx } from '../paint'
import { WIN, noRay } from '../parts'
import { makeCanvas } from '../textures'
import { FlashVeil } from '../objects/FlashVeil'
import { ViewFlakes } from '../objects/ViewFlakes'

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
  // le village sur la colline : murs, toits, arbres
  wallD: hex('#f3e6ef'), wallN: hex('#3a3466'), roofD: hex('#e59bb3'), roofN: hex('#4b3a6e'), roof2D: hex('#8fc9c0'), roof2N: hex('#2f4a63'),
  treeD: hex('#9fcfae'), treeN: hex('#24394f'),
}
// [x du milieu, largeur, hauteur du mur, hauteur du toit, toit menthe ?] : des maisons posées sur la crête de la colline du fond
const HOUSES: [number, number, number, number, boolean][] = [
  [212, 34, 26, 18, false], [252, 28, 34, 16, true], [300, 40, 24, 20, false], [372, 30, 30, 17, true], [414, 36, 22, 18, false], [458, 26, 28, 15, true],
]
const TREES: [number, number][] = [[176, 16], [336, 13], [440, 11]]
/** La crête de la colline du fond (les deux ellipses) à l'abscisse `u`. */
const ridge = (u: number) => {
  const e = (cx: number, cy: number, rx: number, ry: number) => (Math.abs(u - cx) < rx ? cy - ry * Math.sqrt(1 - ((u - cx) / rx) ** 2) : 999)
  return Math.min(e(130, 340, 230, 72), e(450, 348, 220, 84))
}
const stars = Array.from({ length: 55 }, () => [rand(50, 470), rand(70, 270), rand(0.6, 1.8), Math.random()])
const [canvas, x] = makeCanvas(512, 400)
const tex = new CanvasTexture(canvas)

/**
 * Soleil le jour, lune et étoiles la nuit, voilés par la pluie ; l'orage fonce le ciel vers l'ardoise ; la neige le blanchit et
 * couvre les collines, la tempête de neige les efface dans la brume.
 */
function drawSky(w: Wx) {
  const { n, r } = w
  const top = skyWx(mix(mix(SK.dTop, SK.nTop, n), mix(SK.rdTop, SK.rnTop, n), r), w)
  const bot = skyWx(mix(mix(SK.dBot, SK.nBot, n), mix(SK.rdBot, SK.rnBot, n), r), w)
  const g = x.createLinearGradient(0, 60, 0, 360)
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot))
  x.fillStyle = g; x.fillRect(0, 0, 512, 400)
  const clear = clearOf({ ...w, r: 0 })
  const sa = n * (1 - r * 0.9) * clear
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
  const su = (1 - n) * (1 - r * 0.85) * clear
  if (su > 0.01) {
    const sg = x.createRadialGradient(140, 170, 10, 140, 170, 90)
    sg.addColorStop(0, `rgba(255,244,205,${0.7 * su})`); sg.addColorStop(1, 'rgba(255,244,205,0)')
    x.fillStyle = sg; x.fillRect(40, 70, 200, 200)
    x.fillStyle = `rgba(255,247,220,${su})`; x.beginPath(); x.arc(140, 170, 26, 0, TAU); x.fill()
  }
  // les collines : lilas, ou blanches sous la neige (celle de devant plus claire, celle de derrière dans l'ombre)
  const snowy = Math.min(1, w.s * 1.4)
  x.fillStyle = rgb(weathered(mix(mix(SK.h1D, SK.h1N, n), dn(WX.snowShade, n), snowy), w, 0.6))
  // (leur sommet affleure au bas de la fenêtre : c'est là qu'on voit la neige tenir)
  x.beginPath(); x.ellipse(130, 340, 230, 72, 0, 0, TAU); x.ellipse(450, 348, 220, 84, 0, 0, TAU); x.fill()
  drawVillage(w, snowy)
  x.fillStyle = rgb(weathered(mix(mix(SK.h2D, SK.h2N, n), dn(WX.snow, n), snowy), w, 0.2))
  x.beginPath(); x.ellipse(300, 370, 260, 58, 0, 0, TAU); x.fill()
  paintWhiteout(x, 512, 400, w, 0.5, 0.25)
  paintFlakes(x, 512, 400, w, 3)
  tex.needsUpdate = true
}

/**
 * Le village sur la colline du fond : des maisons aux toits ronds (rose ou menthe), une cheminée, des arbres en boule. La nuit,
 * leurs fenêtres s'allument (pas toutes) ; sous la neige, les toits blanchissent. Le tout passe dans la même brume que la colline.
 */
function drawVillage(w: Wx, snowy: number) {
  const { n } = w
  const R = (r: number, y: number, ww: number, hh: number, rr: number) => { x.beginPath(); x.roundRect(r, y, ww, hh, rr); x.fill() }
  for (const [tx, r] of TREES) {
    const g = ridge(tx)
    x.fillStyle = rgb(weathered(mix(mix(SK.h1D, SK.h1N, n), [90, 70, 80], 0.25), w, 0.5))
    R(tx - 2, g - r - 4, 4, r + 6, 2)
    x.fillStyle = rgb(weathered(mix(mix(SK.treeD, SK.treeN, n), dn(WX.snow, n), snowy * 0.6), w, 0.5))
    x.beginPath(); x.arc(tx, g - r - 6, r, 0, TAU); x.arc(tx - r * 0.55, g - r * 0.7, r * 0.7, 0, TAU); x.arc(tx + r * 0.55, g - r * 0.75, r * 0.7, 0, TAU); x.fill()
  }
  HOUSES.forEach(([cx, ww, hh, rh, mint], i) => {
    const g = ridge(cx) + 6, top = g - hh
    x.fillStyle = rgb(weathered(mix(SK.wallD, SK.wallN, n), w, 0.5))
    R(cx - ww / 2, top, ww, hh, 3)
    // la cheminée, puis le toit arrondi qui déborde un peu
    x.fillStyle = rgb(weathered(mix(SK.wallD, SK.wallN, n * 0.9), w, 0.5))
    R(cx + ww * 0.18, top - rh * 0.95, 6, rh * 0.7, 2)
    const roof = mix(mint ? mix(SK.roof2D, SK.roof2N, n) : mix(SK.roofD, SK.roofN, n), dn(WX.snow, n), snowy)
    x.fillStyle = rgb(weathered(roof, w, 0.5))
    x.beginPath()
    x.moveTo(cx - ww / 2 - 4, top + 2)
    x.quadraticCurveTo(cx - ww * 0.25, top - rh * 0.9, cx, top - rh)
    x.quadraticCurveTo(cx + ww * 0.25, top - rh * 0.9, cx + ww / 2 + 4, top + 2)
    x.closePath(); x.fill()
    // la porte et deux fenêtres : éteintes le jour, dorées la nuit (une maison sur trois dort déjà)
    const lit = n * (i % 3 === 1 ? 0.25 : 1)
    x.fillStyle = `rgba(${(140 + 115 * lit) | 0},${(130 + 85 * lit) | 0},${(160 - 20 * lit) | 0},${(0.55 + 0.45 * lit).toFixed(3)})`
    R(cx - ww * 0.32, top + hh * 0.28, ww * 0.22, hh * 0.26, 2)
    R(cx + ww * 0.1, top + hh * 0.28, ww * 0.22, hh * 0.26, 2)
    x.fillStyle = rgb(weathered(mix(SK.roofD, SK.roofN, n), w, 0.5))
    R(cx - 3, g - hh * 0.38, 7, hh * 0.38, 3)
    if (lit > 0.3) {
      const halo = x.createRadialGradient(cx, top + hh * 0.4, 2, cx, top + hh * 0.4, ww * 0.8)
      halo.addColorStop(0, `rgba(255,214,150,${(0.22 * lit).toFixed(3)})`); halo.addColorStop(1, 'rgba(255,214,150,0)')
      x.fillStyle = halo; x.fillRect(cx - ww, top - ww * 0.4, ww * 2, ww * 1.6)
    }
  })
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
  const star = useRef({ at: -1, next: 10 + Math.random() * 12, x: 400, y: 50 }), now = useRef<Wx>({ n: 0, r: 0, s: 0, st: 0 })
  useRepaint((w) => {
    now.current = w
    if (star.current.at < 0) drawSky(w)
  })
  useFrame((_, delta) => {
    const s = star.current, w = now.current
    if (!reduceMotion) {
      s.next -= Math.min(delta, 0.05)
      if (s.at < 0 && s.next <= 0 && w.n > 0.95 && mood.rain < 0.05 && mood.snow < 0.05 && mood.storm < 0.05) {
        s.at = 0
        s.next = 22 + Math.random() * 30
        s.x = 380 + Math.random() * 90
        s.y = 40 + Math.random() * 60
      }
    }
    if (s.at >= 0) {
      s.at += Math.min(delta, 0.05)
      drawSky(w)
      if (s.at < 0.9) drawShootingStar(s.at / 0.9, s.x, s.y)
      else s.at = -1
    }
  })
  return (
    <>
      <mesh position={[1.0, 2.6, -3.62]} raycast={noRay}>
        <planeGeometry args={[3.6, 2.8]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <FlashVeil position={[1.4, 3.0, -3.6]} size={[2.8, 2.2]} />
      <ViewFlakes x={[WIN.x0 - 0.3, WIN.x1 + 0.3]} y={[WIN.y0 - 0.25, WIN.y1 + 0.15]} z={[-3.56, -3.42]} n={80} />
    </>
  )
}
