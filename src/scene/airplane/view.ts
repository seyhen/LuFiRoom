import { TAU } from '../../math'
import { clearOf, dn, hex, mix, rgb, seeded, skyWx, type Wx } from '../paint'

/**
 * Ce qu'on voit par un hublot, dessiné sur un canvas de `W` × `H` (l'horizon à 60 % de la hauteur) : le ciel (bleu le jour, indigo la nuit),
 * la mer de nuages dessous, claire de jour, éclairée par la lune la nuit ; le bout de l'aile en bas à droite. `kind` 0 : la lune
 * (ou le soleil de jour) ; 1 : l'aurore lointaine à l'horizon. La pluie et l'orage mettent le hublot dans le nuage (gris, sans étoiles) ;
 * la neige le voile et pose du givre dans les coins.
 */
export function paintView(x: CanvasRenderingContext2D, W: number, H: number, n: number, r: number, w: Wx, kind: number, seed: number) {
  const rnd = seeded(seed), hz = H * 0.6
  const clear = clearOf(w)
  const top = skyWx(dn(['#6aa6ec', '#070c2c'], n), w), low = skyWx(dn(['#cfe6ff', '#26367a'], n), w)
  const g = x.createLinearGradient(0, 0, 0, hz)
  g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(low))
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  // les étoiles, la lune ou le soleil (voilés par le mauvais temps)
  if (n * clear > 0.02) {
    for (let i = 0; i < 70; i++) { const px = rnd() * W, py = rnd() * hz * 0.85, s = 0.5 + rnd() * 1.3; x.fillStyle = `rgba(235,240,255,${(0.35 + rnd() * 0.55) * n * clear})`; x.beginPath(); x.arc(px, py, s, 0, TAU); x.fill() }
  }
  if (kind === 0) {
    const mx = W * 0.3, my = H * 0.2, mr = W * 0.17
    const day = (1 - n) * clear, night = n * clear
    if (day > 0.02) {
      const sg = x.createRadialGradient(mx, my, 0, mx, my, mr * 3.4)
      sg.addColorStop(0, `rgba(255,248,214,${0.95 * day})`); sg.addColorStop(0.18, `rgba(255,236,170,${0.55 * day})`); sg.addColorStop(1, 'rgba(255,236,170,0)')
      x.fillStyle = sg; x.fillRect(0, 0, W, hz)
    }
    if (night > 0.02) {
      const hg = x.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 3.2)
      hg.addColorStop(0, `rgba(190,205,255,${0.34 * night})`); hg.addColorStop(1, 'rgba(190,205,255,0)')
      x.fillStyle = hg; x.fillRect(0, 0, W, hz)
      x.fillStyle = `rgba(244,240,222,${night})`; x.beginPath(); x.arc(mx, my, mr, 0, TAU); x.fill()
      // le croissant : un disque de la couleur du ciel le mord
      x.fillStyle = rgb(mix(top, low, my / hz)); x.beginPath(); x.arc(mx + mr * 0.5, my - mr * 0.12, mr * 0.92, 0, TAU); x.fill()
    }
  } else if (n * clear > 0.02) {
    // l'aurore : trois rideaux verts qui montent de l'horizon, de plus en plus pâles
    for (let k = 0; k < 3; k++) {
      const ax = W * (0.15 + k * 0.32), aw = W * 0.34
      const ag = x.createLinearGradient(0, hz, 0, hz - H * (0.42 - k * 0.06))
      ag.addColorStop(0, `rgba(120,255,190,${0.55 * n * clear})`); ag.addColorStop(0.5, `rgba(90,220,200,${0.22 * n * clear})`); ag.addColorStop(1, 'rgba(120,150,255,0)')
      x.fillStyle = ag
      x.beginPath(); x.moveTo(ax, hz)
      for (let i = 0; i <= 8; i++) x.lineTo(ax + (i / 8) * aw, hz - H * (0.16 + 0.12 * Math.sin(i * 0.9 + k * 2)) * (0.5 + 0.5 * Math.sin((i / 8) * Math.PI)))
      x.lineTo(ax + aw, hz); x.closePath(); x.fill()
    }
  }
  // la mer de nuages : un aplat, puis des boules plus claires au sommet
  const sea = x.createLinearGradient(0, hz, 0, H)
  sea.addColorStop(0, rgb(skyWx(dn(['#f6faff', '#6877b4'], n), w))); sea.addColorStop(1, rgb(skyWx(dn(['#b8cdee', '#252f68'], n), w)))
  x.fillStyle = sea; x.fillRect(0, hz - 2, W, H - hz + 2)
  for (let i = 0; i < 26; i++) {
    const px = rnd() * W, py = hz + rnd() * (H - hz) * 0.5 - 4, rad = 8 + rnd() * 22
    x.fillStyle = rgb(skyWx(dn(['#fbfdff', '#8a99d4'], n), w), 0.9)
    x.beginPath(); x.ellipse(px, py, rad * 1.5, rad * 0.7, 0, 0, TAU); x.fill()
  }
  // l'aile : le bout, un dessus gris clair, une ombre dessous, le feu de bout d'aile rouge qui brille la nuit
  const wc = skyWx(dn(['#b9c4d6', '#4c5882'], n), w), wd = skyWx(dn(['#8d99b0', '#323c62'], n), w)
  x.fillStyle = rgb(wc)
  x.beginPath(); x.moveTo(W * 0.1, H); x.lineTo(W * 0.52, H * 0.8); x.lineTo(W * 1.02, H * 0.68); x.lineTo(W * 1.02, H * 0.8); x.lineTo(W * 0.86, H); x.closePath(); x.fill()
  x.fillStyle = rgb(wd)
  x.beginPath(); x.moveTo(W * 0.52, H * 0.8); x.lineTo(W * 1.02, H * 0.68); x.lineTo(W * 1.02, H * 0.71); x.lineTo(W * 0.55, H * 0.83); x.closePath(); x.fill()
  x.strokeStyle = rgb(wd, 0.7); x.lineWidth = 1.4
  for (const f of [0.62, 0.72, 0.82]) { x.beginPath(); x.moveTo(W * (f - 0.2), H); x.lineTo(W * (f + 0.12), H * (0.99 - (f - 0.5) * 0.4)); x.stroke() }
  x.fillStyle = `rgba(255,70,70,${0.4 + n * 0.6})`; x.beginPath(); x.arc(W * 0.97, H * 0.7, 3.2, 0, TAU); x.fill()
  if (n > 0.3) { const rg = x.createRadialGradient(W * 0.97, H * 0.7, 0, W * 0.97, H * 0.7, 16); rg.addColorStop(0, `rgba(255,80,80,${0.6 * n})`); rg.addColorStop(1, 'rgba(255,80,80,0)'); x.fillStyle = rg; x.fillRect(W * 0.7, H * 0.5, W * 0.4, H * 0.4) }
  // dans le nuage : la pluie et l'orage noient tout dans un gris doux
  const fog = Math.max(r, w.st) * 0.8
  if (fog > 0.01) {
    const fc = dn(['#b7bfcc', '#2b3050'], n)
    x.fillStyle = rgb(fc, fog * 0.8); x.fillRect(0, 0, W, H)
    for (let i = 0; i < 40; i++) { x.fillStyle = rgb(mix(fc, hex('#ffffff'), 0.2), fog * 0.1); x.beginPath(); x.ellipse(rnd() * W, rnd() * H, 30 + rnd() * 50, 8 + rnd() * 10, 0, 0, TAU); x.fill() }
    // des gouttes poussées par le vent le long de la vitre
    x.strokeStyle = `rgba(230,240,255,${0.35 * fog})`; x.lineWidth = 1.2; x.lineCap = 'round'
    for (let i = 0; i < 26; i++) { const px = rnd() * W, py = rnd() * H * 0.9, l = 6 + rnd() * 16; x.beginPath(); x.moveTo(px, py); x.lineTo(px + l * 0.7, py - l * 0.35); x.stroke() }
  }
  // la neige : le voile blanc et le givre des coins
  if (w.s > 0.02) {
    x.fillStyle = `rgba(240,246,255,${w.s * 0.65})`; x.fillRect(0, 0, W, H)
    x.strokeStyle = `rgba(255,255,255,${0.7 * w.s})`; x.lineWidth = 1.4
    for (const [cx, cy, a0] of [[0, 0, 0], [W, 0, Math.PI / 2], [0, H, -Math.PI / 2], [W, H, Math.PI]]) {
      for (let k = 0; k < 7; k++) { const a = a0 + (k / 6) * (Math.PI / 2), l = 22 + rnd() * 34; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); x.stroke() }
    }
  }
}
