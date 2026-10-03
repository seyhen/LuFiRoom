import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import { TAU, smooth } from '../../math'
import { mood } from '../anim'
import { noRay } from '../parts'
import { makeCanvas } from '../textures'

// Édimbourg par la fenêtre du café : le Château sur son rocher, la vieille ville qui monte vers lui, les façades
// colorées d'une rue en pente (Victoria Street), un immeuble de grès en face, la chaussée mouillée. Tout est froid et
// bleuté, même le jour (il fait « dreich ») : c'est ce qui rend l'intérieur si chaud.

type RGB = [number, number, number]
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const rgb = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

/** Tirage à graine : la même ville à chaque visite. */
function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Couleurs [jour, nuit]. La pluie les voile ensuite vers la brume.
const P = {
  skyTop: ['#8c9cb0', '#0e1430'], skyBot: ['#c9d2db', '#2b3462'],
  cloud: ['#aab6c4', '#1b2245'], cloudDark: ['#7d8a9c', '#121833'],
  mist: ['#c3ccd6', '#2a3158'],
  seat: ['#94a0ad', '#222a50'], rock: ['#6f7884', '#1a2140'], castle: ['#7f8791', '#a8916e'], trees: ['#55695f', '#141c30'],
  ridge: ['#66707d', '#171d3a'], stone: ['#8b8f96', '#242a45'], stoneDark: ['#6c717a', '#1b2038'],
  street: ['#4a525e', '#12162a'], roof: ['#4e5561', '#141a32'],
  win: ['#55606e', '#1c2240'], shopGlass: ['#d8c49a', '#ffcf7e'],
} as const
const shopColors: [string, string][] = [['#a83a3a', '#4a1c26'], ['#2f5d8a', '#18294a'], ['#3f7a5a', '#183428'], ['#d39b3e', '#5a3f1c'], ['#7a4a8a', '#2e1c3a'], ['#c76a3a', '#4a2618']]

const W = 1024, H = 800
const [canvas, x] = makeCanvas(W, H)
const tex = new CanvasTexture(canvas)
// Seule cette zone de l'image se voit par la fenêtre (le reste est caché par le mur) : on y dessine.
const VX = 284, VY = 42, VW = 682, VH = 500

function poly(pts: number[][], fill: string) {
  x.fillStyle = fill
  x.beginPath()
  pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)))
  x.closePath()
  x.fill()
}

/** n : nuit, r : pluie (0 → 1). */
function draw(n: number, r: number) {
  const fog = mix(hex(P.mist[0]), hex(P.mist[1]), n)
  // Couleur d'un élément : jour → nuit, puis voilée par la pluie, d'autant plus qu'il est loin.
  const col = (k: keyof typeof P, far = 0) => mix(mix(hex(P[k][0]), hex(P[k][1]), n), fog, r * (0.12 + far * 0.4))
  const rnd = seeded(42)

  // Ciel bas et nuages lourds.
  const g = x.createLinearGradient(0, VY, 0, VY + VH * 0.7)
  g.addColorStop(0, rgb(col('skyTop'))); g.addColorStop(1, rgb(col('skyBot')))
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  x.save()
  x.translate(VX, VY)
  for (let i = 0; i < 18; i++) {
    const cx = rnd() * VW, cy = 20 + rnd() * 150, rx = 60 + rnd() * 120, ry = 18 + rnd() * 26
    x.fillStyle = rgb(i % 3 ? col('cloud') : col('cloudDark'), 0.45 + r * 0.25)
    x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill()
  }

  // Arthur's Seat, au loin à droite.
  poly([[420, 300], [470, 240], [530, 196], [580, 182], [622, 196], [660, 228], [700, 262], [700, 300]], rgb(col('seat', 1)))

  // Le rocher du Château, escarpé, et le Château dessus.
  const rock = rgb(col('rock', 0.7)), castle = rgb(col('castle', 0.7 - n * 0.5))
  // La nuit, le Château est éclairé par en dessous : un halo chaud sur le rocher.
  if (n > 0.05) {
    const fl = x.createRadialGradient(165, 150, 10, 165, 150, 190)
    fl.addColorStop(0, `rgba(255,200,130,${(0.32 * n * (1 - r * 0.4)).toFixed(2)})`); fl.addColorStop(1, 'rgba(255,200,130,0)')
    x.fillStyle = fl; x.fillRect(-20, 0, 380, 330)
  }
  poly([[-10, 330], [-10, 214], [30, 206], [60, 186], [92, 178], [250, 176], [276, 190], [300, 224], [330, 262], [350, 300], [360, 330]], rock)
  x.strokeStyle = rgb(mix(col('rock', 0.7), [255, 255, 255], 0.12)); x.lineWidth = 2
  for (const [ax, ay, bx, by] of [[60, 200, 70, 250], [120, 186, 112, 236], [210, 182, 222, 230], [280, 200, 290, 240]]) { x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke() }
  // l'ombre des falaises, du côté opposé à la lumière
  const sh = x.createLinearGradient(0, 180, 0, 330)
  sh.addColorStop(0, rgb(mix(col('rock', 0.7), [0, 0, 0], 0.05))); sh.addColorStop(1, rgb(mix(col('rock', 0.7), [0, 0, 0], 0.25)))
  poly([[150, 182], [250, 176], [276, 190], [300, 224], [330, 262], [350, 300], [360, 330], [200, 330]], 'rgba(0,0,0,0)')
  x.fillStyle = sh; x.fill()
  // les arbres des jardins au pied du rocher
  x.fillStyle = rgb(col('trees', 0.5))
  for (let i = 0; i < 16; i++) { const tx = -10 + i * 24 + rnd() * 10, ty = 300 + rnd() * 14; x.beginPath(); x.ellipse(tx, ty, 18 + rnd() * 8, 14 + rnd() * 6, 0, 0, TAU); x.fill() }
  poly([[70, 178], [70, 142], [250, 142], [250, 178]], castle) // remparts
  poly([[250, 178], [250, 150], [262, 146], [276, 150], [282, 178]], castle) // Half Moon Battery
  poly([[96, 142], [96, 104], [150, 104], [150, 142]], castle) // palais
  poly([[100, 104], [123, 86], [146, 104]], castle)
  poly([[176, 142], [176, 96], [214, 96], [214, 142]], castle) // grande salle
  poly([[180, 96], [184, 84], [210, 84], [214, 96]], castle)
  x.fillStyle = rgb(mix(col('castle', 0.7 - n * 0.5), [255, 245, 225], 0.18)) // arêtes plus claires
  x.fillRect(70, 142, 180, 3); x.fillRect(96, 104, 54, 3); x.fillRect(176, 96, 38, 3)
  x.fillStyle = castle
  for (let cx = 70; cx < 250; cx += 13) x.fillRect(cx, 136, 8, 7)
  for (const tx of [96, 140, 176, 206]) { x.fillRect(tx, 98, 8, 10); x.fillRect(tx - 1, 96, 10, 4) }
  x.fillRect(195, 60, 2.5, 26)
  x.fillStyle = rgb(mix(hex('#3a5aa8'), hex('#1a2246'), n)); x.fillRect(197.5, 60, 16, 10) // le drapeau (bleu et blanc)
  x.fillStyle = rgb(mix(hex('#e8ecf2'), hex('#5a6080'), n)); x.fillRect(197.5, 64, 16, 2)

  // Brume entre le Château et la ville.
  const mg = x.createLinearGradient(0, 230, 0, 320)
  mg.addColorStop(0, rgb(fog, 0)); mg.addColorStop(0.6, rgb(fog, 0.55 + r * 0.2)); mg.addColorStop(1, rgb(fog, 0))
  x.fillStyle = mg; x.fillRect(-10, 220, VW + 20, 110)

  // La vieille ville : immeubles hauts, pignons à redents, cheminées, et la couronne de St Giles.
  const ridge = rgb(col('ridge', 0.4)), lit: number[][] = []
  for (let hx = 300; hx < 470; ) {
    const hw = 26 + rnd() * 20, hh = 70 + rnd() * 60, base = 330
    poly([[hx, base], [hx, base - hh], [hx + hw, base - hh], [hx + hw, base]], ridge)
    // pignon à redents
    const steps = 3, sw = hw / (steps * 2)
    for (let s = 0; s < steps; s++) x.fillRect(hx + s * sw, base - hh - (s + 1) * 6, hw - s * 2 * sw, 6)
    x.fillRect(hx + hw * 0.7, base - hh - 26, 6, 16)
    for (let wy = base - hh + 12; wy < base - 10; wy += 16) for (let wx = hx + 5; wx < hx + hw - 6; wx += 10) if (rnd() < 0.55) lit.push([wx, wy, rnd()])
    hx += hw + 2
  }
  poly([[470, 330], [470, 214], [490, 214], [490, 330]], ridge)
  poly([[472, 214], [480, 150], [488, 214]], ridge)
  x.strokeStyle = ridge; x.lineWidth = 3
  for (const dx of [-11, 11]) { x.beginPath(); x.moveTo(480, 188); x.quadraticCurveTo(480 + dx * 1.3, 176, 480 + dx, 214); x.stroke() }

  // La rue en pente : façades colorées de Victoria Street, plus petites en montant vers la gauche.
  const shops: number[][] = []
  for (let sx = -20; sx < 420; ) {
    const k = (sx + 20) / 440, sw = 54 + k * 46, ground = 450 - (1 - k) * 70, sh = 46 + k * 40, up = 60 + k * 60
    const [cd, cn] = shopColors[((sx + 20) / 30) % shopColors.length | 0]
    // étages de grès au-dessus de la boutique, toit et cheminée
    poly([[sx, ground - sh], [sx, ground - sh - up], [sx + sw, ground - sh - up], [sx + sw, ground - sh]], rgb(col('stone', 0.15)))
    poly([[sx - 2, ground - sh - up], [sx + sw * 0.5, ground - sh - up - 16 - k * 8], [sx + sw + 2, ground - sh - up]], rgb(col('roof', 0.15)))
    x.fillStyle = rgb(col('stoneDark', 0.15)); x.fillRect(sx + sw * 0.72, ground - sh - up - 24 - k * 8, 7 + k * 3, 16)
    for (let wy = ground - sh - up + 12; wy < ground - sh - 10; wy += 22 + k * 6) {
      for (let wx = sx + 8; wx < sx + sw - 12; wx += 18 + k * 8) {
        if (rnd() < 0.5) lit.push([wx, wy, rnd()])
        else { x.fillStyle = rgb(col('win', 0.15)); x.fillRect(wx, wy, 7 + k * 4, 11 + k * 4) }
      }
    }
    // la boutique : couleur vive, grande vitrine éclairée, enseigne
    poly([[sx, ground], [sx, ground - sh], [sx + sw, ground - sh], [sx + sw, ground]], rgb(mix(mix(hex(cd), hex(cn), n), fog, r * 0.12)))
    x.fillStyle = rgb(mix(hex(P.shopGlass[0]), hex(P.shopGlass[1]), n), 0.75 + n * 0.25)
    x.fillRect(sx + sw * 0.12, ground - sh * 0.72, sw * 0.5, sh * 0.6)
    x.fillStyle = rgb(mix(col('win'), [20, 20, 30], 0.3)); x.fillRect(sx + sw * 0.7, ground - sh * 0.7, sw * 0.18, sh * 0.7) // porte
    x.fillStyle = 'rgba(240,220,170,.55)'; x.fillRect(sx + sw * 0.15, ground - sh * 0.92, sw * 0.6, 3) // enseigne
    shops.push([sx + sw * 0.12, ground, sw * 0.5])
    sx += sw
  }

  // L'immeuble de grès juste en face, à droite : fenêtres à guillotine, salon de thé au rez-de-chaussée.
  const fx = 430, ftop = 120, fground = 470
  poly([[fx, fground], [fx, ftop], [VW + 10, ftop], [VW + 10, fground]], rgb(col('stone')))
  x.fillStyle = rgb(col('stoneDark')); x.fillRect(fx, ftop, VW - fx + 10, 10); x.fillRect(fx, ftop + 120, VW - fx + 10, 6)
  for (let wy = ftop + 26; wy < fground - 140; wy += 70) {
    for (let wx = fx + 30; wx < VW - 30; wx += 72) {
      const on = rnd()
      lit.push([wx, wy, on, 1])
      x.fillStyle = rgb(col('stoneDark')); x.fillRect(wx - 4, wy - 4, 38, 52)
      x.fillStyle = rgb(col('win')); x.fillRect(wx, wy, 30, 44)
    }
  }
  poly([[fx, fground], [fx, fground - 86], [VW + 10, fground - 86], [VW + 10, fground]], rgb(mix(mix(hex('#5a1f2a'), hex('#2a0f18'), n), fog, r * 0.1)))
  x.fillStyle = rgb(mix(hex(P.shopGlass[0]), hex(P.shopGlass[1]), n), 0.8 + n * 0.2)
  x.fillRect(fx + 24, fground - 66, 120, 56); x.fillRect(fx + 170, fground - 66, 70, 56)
  x.fillStyle = 'rgba(244,214,140,.85)'; x.font = 'italic bold 18px Georgia, serif'; x.fillText('Tea Room', fx + 40, fground - 72)
  shops.push([fx + 24, fground, 120], [fx + 170, fground, 70])

  // Les fenêtres allumées : de plus en plus au crépuscule, avec un halo la nuit.
  for (const [lx, ly, th, big] of lit) {
    // Un peu plus d'une fenêtre sur deux s'allume, pas toutes en même temps ; le jour, quelques-unes restent allumées.
    const a = th > 0.62 ? 0 : smooth(Math.min(1, Math.max(0, (n * 1.2 + 0.18 - th) * 2.5)))
    const s = big ? [30, 44] : [8, 11]
    if (a < 0.03) {
      if (!big) { x.fillStyle = rgb(col('win', 0.3)); x.fillRect(lx, ly, s[0], s[1]) }
      continue
    }
    x.fillStyle = `rgba(255,${196 + ((th * 40) | 0)},${110 + ((th * 30) | 0)},${(0.2 + a * 0.65).toFixed(2)})`
    x.shadowColor = 'rgba(255,190,100,.7)'; x.shadowBlur = 8 * a
    x.fillRect(lx, ly, s[0], s[1])
    x.shadowBlur = 0
    if (big) { // petits bois de la fenêtre à guillotine
      x.fillStyle = rgb(col('stoneDark'), 0.85)
      x.fillRect(lx, ly + 20, 30, 3); x.fillRect(lx + 14, ly, 2.5, 44)
    }
  }
  // Réverbères peints le long de la rue en pente.
  for (const [lx, ly, ls] of [[60, 372, 0.7], [200, 392, 0.85], [350, 420, 1]]) {
    x.fillStyle = rgb(mix(col('stoneDark'), [10, 10, 20], 0.5)); x.fillRect(lx, ly, 2.5 * ls, 50 * ls)
    x.fillStyle = 'rgba(255,214,140,.95)'; x.fillRect(lx - 3 * ls, ly - 7 * ls, 8.5 * ls, 8 * ls)
    const lg = x.createRadialGradient(lx + 1, ly - 3, 1, lx + 1, ly - 3, 26 * ls)
    lg.addColorStop(0, `rgba(255,205,130,${(0.35 + n * 0.4).toFixed(2)})`); lg.addColorStop(1, 'rgba(255,205,130,0)')
    x.fillStyle = lg; x.fillRect(lx - 30 * ls, ly - 33 * ls, 60 * ls, 60 * ls)
  }

  // La chaussée mouillée : pavés sombres, reflets chauds des vitrines qui s'étirent.
  const sg = x.createLinearGradient(0, 380, 0, VH + 10)
  sg.addColorStop(0, rgb(mix(col('street'), fog, 0.25))); sg.addColorStop(1, rgb(mix(col('street'), [0, 0, 0], 0.25)))
  const edge = shops.slice(0, -2).map(([sx2, ground, sw]) => [sx2 + sw * 1.6, ground]).filter(([px]) => px < fx)
  poly([[-10, 380], ...edge, [fx, 444], [fx, fground], [VW + 10, fground], [VW + 10, VH + 10], [-10, VH + 10]], '#000')
  x.fillStyle = sg; x.fill()
  x.fillStyle = 'rgba(255,255,255,.05)'
  for (let i = 0; i < 220; i++) { const cx = rnd() * VW, cy = 400 + rnd() * 100; if (cy > 460 - cx * 0.16) { x.beginPath(); x.ellipse(cx, cy, 5, 1.6, 0, 0, TAU); x.fill() } }
  for (const [sx2, ground, sw] of shops) {
    const rg = x.createLinearGradient(0, ground, 0, ground + 46)
    rg.addColorStop(0, `rgba(255,205,130,${(0.18 + n * 0.3 + r * 0.1).toFixed(2)})`); rg.addColorStop(1, 'rgba(255,205,130,0)')
    x.fillStyle = rg; x.fillRect(sx2, Math.max(ground, 452), sw, 46)
  }
  x.restore()

  // Pluie sur la vitre : traînées obliques, plus nombreuses quand il pleut fort.
  x.strokeStyle = `rgba(225,235,248,${(0.08 + r * 0.22).toFixed(2)})`
  x.lineWidth = 1.6
  for (let i = 0; i < 40 + r * 120; i++) {
    const sx = VX + ((i * 97) % VW), sy = VY + ((i * 61) % VH)
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx - 7, sy + 30); x.stroke()
  }
  tex.needsUpdate = true
}

/** La vue, redessinée quand le jour / nuit ou la pluie changent (par petits pas : c'est une grande image). */
export function Skyline() {
  const drawn = useRef({ n: -1, r: -1 })
  useFrame(() => {
    const d = drawn.current, dn = Math.abs(mood.night - d.n), dr = Math.abs(mood.rain - d.r)
    const settled = (v: number) => v === 0 || v === 1
    if (dn > 0.06 || dr > 0.06 || ((dn > 0.001 || dr > 0.001) && settled(mood.night) && settled(mood.rain))) {
      draw(smooth(mood.night), smooth(mood.rain))
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
