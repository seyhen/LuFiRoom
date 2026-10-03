import { TAU } from '../../math'
import { canvasTex, poly, rr, seeded } from '../paint'

// Textures du train de nuit : boiseries d'acajou, moquette, et les bandes de paysage qui défilent derrière la vitre.

/**
 * Boiserie d'acajou : soubassement à panneaux, cimaise de laiton, grands panneaux encadrés de filets clairs (marqueterie).
 * Tuile : 1 unité de large, toute la hauteur du mur (4.4).
 */
export const panelTex = canvasTex(256, 1126, (x) => {
  const r = seeded(4), H = 1126, u = H / 4.4
  const wood = (y0: number, y1: number, base: number) => {
    for (let px = 0; px < 256; px += 4) {
      const t = base + Math.sin(px * 0.09 + r() * 0.5) * 6 + r() * 5
      x.fillStyle = `rgb(${t + 18},${t * 0.48},${t * 0.36})`
      x.fillRect(px, y0, 4, y1 - y0)
    }
    x.strokeStyle = 'rgba(40,15,10,.18)'; x.lineWidth = 1
    for (let k = 0; k < 18; k++) {
      const px = r() * 256
      x.beginPath(); x.moveTo(px, y0)
      for (let y = y0; y < y1; y += 40) x.lineTo(px + Math.sin(y * 0.02 + k) * 4, y)
      x.stroke()
    }
  }
  wood(0, H, 112)
  // le soubassement (jusqu'à 1.1) : un panneau en relief
  const dado = H - 1.1 * u
  x.fillStyle = 'rgba(30,10,5,.28)'; rr(x, 24, dado + 26, 208, 1.1 * u - 60, 10); x.fill()
  x.strokeStyle = 'rgba(255,210,170,.22)'; x.lineWidth = 3; rr(x, 28, dado + 30, 200, 1.1 * u - 68, 8); x.stroke()
  // la cimaise de laiton
  const brass = x.createLinearGradient(0, dado - 8, 0, dado + 8)
  brass.addColorStop(0, '#f6d58a'); brass.addColorStop(0.5, '#c9973e'); brass.addColorStop(1, '#8a6224')
  x.fillStyle = brass; x.fillRect(0, dado - 7, 256, 14)
  // le grand panneau du haut, encadré de deux filets clairs, une rosace au milieu
  const top = 0.25 * u, bottom = dado - 34
  x.fillStyle = 'rgba(25,8,4,.2)'; rr(x, 20, top, 216, bottom - top, 14); x.fill()
  x.strokeStyle = '#e9c48f'; x.lineWidth = 3; rr(x, 30, top + 10, 196, bottom - top - 20, 10); x.stroke()
  x.strokeStyle = 'rgba(233,196,143,.45)'; x.lineWidth = 1.5; rr(x, 40, top + 20, 176, bottom - top - 40, 6); x.stroke()
  const cy = (top + bottom) / 2
  x.fillStyle = 'rgba(233,196,143,.5)'
  for (let i = 0; i < 8; i++) { x.save(); x.translate(128, cy); x.rotate((i / 8) * TAU); x.beginPath(); x.ellipse(0, -16, 5, 14, 0, 0, TAU); x.fill(); x.restore() }
  x.fillStyle = '#e9c48f'; x.beginPath(); x.arc(128, cy, 5, 0, TAU); x.fill()
  // corniche
  x.fillStyle = 'rgba(20,6,3,.35)'; x.fillRect(0, 0, 256, 0.12 * u)
}, [1, 1])

/** Moquette de voiture-lits : rouge profond, petits losanges dorés. */
export const carpetTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#74222c'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const cx = i * 64 + 32, cy = j * 64 + 32
    x.fillStyle = 'rgba(232,180,90,.55)'; poly(x, [[cx, cy - 12], [cx + 12, cy], [cx, cy + 12], [cx - 12, cy]], 'rgba(232,180,90,.55)')
    x.fillStyle = '#74222c'; x.beginPath(); x.arc(cx, cy, 4, 0, TAU); x.fill()
    x.fillStyle = 'rgba(60,15,25,.35)'; x.fillRect(i * 64, j * 64, 64, 1.5); x.fillRect(i * 64, j * 64, 1.5, 64)
  }
}, [6, 6])

// ── Le paysage, en bandes qui défilent. Chaque bande se répète en largeur (son bord droit continue son bord gauche).
const LW = 1024

/** Collines lointaines bleutées, un clocher. */
export const farHillsTex = canvasTex(LW, 128, (x) => {
  const r = seeded(31)
  x.fillStyle = '#9db8c2'
  x.beginPath(); x.moveTo(0, 128)
  for (let px = 0; px <= LW; px += 8) x.lineTo(px, 70 - Math.sin((px / LW) * TAU * 2) * 18 - Math.sin((px / LW) * TAU * 5 + 1) * 8)
  x.lineTo(LW, 128); x.closePath(); x.fill()
  x.fillStyle = '#86a6b2'
  x.beginPath(); x.moveTo(0, 128)
  for (let px = 0; px <= LW; px += 8) x.lineTo(px, 92 - Math.sin((px / LW) * TAU * 3 + 2) * 14)
  x.lineTo(LW, 128); x.closePath(); x.fill()
  // un village lointain et son clocher
  for (let i = 0; i < 9; i++) { x.fillStyle = r() < 0.5 ? '#c9b8a8' : '#b8a898'; x.fillRect(600 + i * 9, 84 - r() * 6, 8, 12) }
  x.fillStyle = '#c9b8a8'; x.fillRect(640, 62, 6, 28); poly(x, [[638, 62], [643, 50], [648, 62]], '#7a8a96')
})

/** Les maisons des prés : position, largeur, hauteur, toit. Partagées avec leurs fenêtres allumées. */
const HOUSES = (() => {
  const r = seeded(77), out: { x: number; w: number; h: number; y: number }[] = []
  for (let px = 40; px < LW - 80; px += 140 + r() * 200) out.push({ x: px, w: 34 + r() * 26, h: 24 + r() * 14, y: 150 + r() * 40 })
  return out
})()

/** Prés et bosquets, fermes et chalets. */
export const meadowTex = canvasTex(LW, 256, (x) => {
  const r = seeded(53)
  const field = (y: number, amp: number, k: number, col: string) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, 256)
    for (let px = 0; px <= LW; px += 8) x.lineTo(px, y - Math.sin((px / LW) * TAU * k + y) * amp)
    x.lineTo(LW, 256); x.closePath(); x.fill()
  }
  field(140, 22, 2, '#8fb070')
  field(175, 16, 3, '#7aa462')
  // haies et bosquets
  for (let i = 0; i < 26; i++) {
    const px = r() * LW, py = 150 + r() * 60, s = 10 + r() * 16
    x.fillStyle = r() < 0.5 ? '#4f7f4f' : '#5d8f56'
    x.beginPath(); x.ellipse(px, py, s, s * 0.8, 0, 0, TAU); x.fill()
    x.fillStyle = '#5a4030'; x.fillRect(px - 1.5, py + s * 0.6, 3, 6)
  }
  // les maisons
  for (const hs of HOUSES) {
    x.fillStyle = '#f1e6d4'; x.fillRect(hs.x, hs.y - hs.h, hs.w, hs.h)
    poly(x, [[hs.x - 5, hs.y - hs.h], [hs.x + hs.w / 2, hs.y - hs.h - 16], [hs.x + hs.w + 5, hs.y - hs.h]], '#a8584a')
    x.fillStyle = '#6a7a8a'; x.fillRect(hs.x + 6, hs.y - hs.h + 7, 6, 7); x.fillRect(hs.x + hs.w - 12, hs.y - hs.h + 7, 6, 7)
  }
  field(225, 8, 4, '#6e9a58')
})

/** Les fenêtres des maisons, allumées la nuit : mêmes positions que dans `meadowTex`. */
export const meadowLightsTex = canvasTex(LW, 256, (x) => {
  for (const hs of HOUSES) {
    for (const wx of [hs.x + 6, hs.x + hs.w - 12]) {
      const g = x.createRadialGradient(wx + 3, hs.y - hs.h + 10, 0, wx + 3, hs.y - hs.h + 10, 16)
      g.addColorStop(0, 'rgba(255,214,140,.9)'); g.addColorStop(1, 'rgba(255,190,110,0)')
      x.fillStyle = g; x.fillRect(wx - 14, hs.y - hs.h - 6, 34, 32)
      x.fillStyle = '#ffd88a'; x.fillRect(wx, hs.y - hs.h + 7, 6, 7)
    }
  }
})

/** Tout près de la voie : buissons flous et poteaux télégraphiques avec leurs fils. */
export const nearTex = canvasTex(LW, 512, (x) => {
  const r = seeded(19)
  // les fils, qui montent et descendent entre deux poteaux
  x.strokeStyle = 'rgba(40,40,50,.55)'; x.lineWidth = 2
  const poles = [120, 620]
  for (const wy of [70, 92]) {
    x.beginPath()
    for (let px = 0; px <= LW; px += 8) {
      const k = ((px - poles[0] + LW) % 500) / 500
      x.lineTo(px, wy + Math.sin(k * Math.PI) * 26)
    }
    x.stroke()
  }
  for (const px of poles) {
    x.fillStyle = '#4a3a30'; x.fillRect(px - 5, 60, 10, 452)
    x.fillRect(px - 26, 66, 52, 6)
    x.fillStyle = '#d8d0c0'; for (const dx of [-22, -10, 10, 22]) x.fillRect(px + dx - 2, 60, 4, 7)
  }
  // le talus et ses buissons, flous de vitesse (étirés en largeur)
  for (let i = 0; i < 40; i++) {
    const px = r() * LW, py = 380 + r() * 90, w = 40 + r() * 90, h = 30 + r() * 60
    x.fillStyle = r() < 0.5 ? 'rgba(52,92,58,.95)' : 'rgba(70,110,64,.95)'
    x.beginPath(); x.ellipse(px, py, w, h, 0, 0, TAU); x.fill()
  }
  x.fillStyle = '#4a7a48'; x.fillRect(0, 440, LW, 72)
})

/** Pluie sur la vitre d'un train qui roule : des gouttes et des traînées en biais. */
export const streakTex = canvasTex(512, 512, (x) => {
  const r = seeded(23)
  x.lineCap = 'round'
  for (let i = 0; i < 70; i++) {
    const px = r() * 512, py = r() * 512, len = 20 + r() * 70
    x.strokeStyle = `rgba(225,235,250,${0.25 + r() * 0.35})`; x.lineWidth = 1.2 + r() * 1.8
    x.beginPath(); x.moveTo(px, py); x.lineTo(px - len * 0.9, py + len * 0.45); x.stroke()
  }
  for (let i = 0; i < 160; i++) {
    const px = r() * 512, py = r() * 512, rad = 1 + r() * 3.5
    x.fillStyle = 'rgba(220,232,248,.45)'; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
    x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(px - rad * 0.3, py - rad * 0.3, rad * 0.35, 0, TAU); x.fill()
  }
}, [1.5, 1])

/** Tapis persan du couloir : bordure bleu nuit, médaillon central, entrelacs crème et rouille. */
export const persianTex = canvasTex(256, 384, (x) => {
  x.fillStyle = '#9a3a2e'; x.fillRect(0, 0, 256, 384)
  x.fillStyle = '#1f2f5a'; x.fillRect(0, 0, 256, 384)
  x.fillStyle = '#b84a34'; x.fillRect(22, 22, 212, 340)
  x.strokeStyle = '#e9c48f'; x.lineWidth = 4; x.strokeRect(30, 30, 196, 324)
  for (let i = 0; i < 12; i++) { x.fillStyle = '#e9c48f'; x.beginPath(); x.arc(11, 20 + i * 31, 4, 0, TAU); x.arc(245, 20 + i * 31, 4, 0, TAU); x.fill() }
  for (let i = 0; i < 8; i++) { x.fillStyle = '#e9c48f'; x.beginPath(); x.arc(20 + i * 31, 11, 4, 0, TAU); x.arc(20 + i * 31, 373, 4, 0, TAU); x.fill() }
  poly(x, [[128, 92], [196, 192], [128, 292], [60, 192]], '#1f2f5a')
  poly(x, [[128, 120], [176, 192], [128, 264], [80, 192]], '#e9c48f')
  poly(x, [[128, 146], [158, 192], [128, 238], [98, 192]], '#9a2e3a')
  x.fillStyle = '#e9c48f'; x.beginPath(); x.arc(128, 192, 10, 0, TAU); x.fill()
  for (const [cx, cy] of [[60, 70], [196, 70], [60, 314], [196, 314]]) { poly(x, [[cx, cy - 20], [cx + 20, cy], [cx, cy + 20], [cx - 20, cy]], '#1f2f5a'); x.fillStyle = '#e9c48f'; x.beginPath(); x.arc(cx, cy, 5, 0, TAU); x.fill() }
  for (let i = 0; i < 384; i += 3) { x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(0, i, 256, 1) }
})

/** Échiquier. */
export const boardTex = canvasTex(128, 128, (x) => {
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#5a3424' : '#e9d2a8'; x.fillRect(i * 16, j * 16, 16, 16) }
})
