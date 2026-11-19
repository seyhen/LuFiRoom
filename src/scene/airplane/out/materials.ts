import { AdditiveBlending, CanvasTexture, DoubleSide, MeshBasicMaterial } from 'three'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { glowTex, makeCanvas } from '../../textures'
import { canvasTex, seeded } from '../../paint'
import { TAU } from '../../../math'

/** Le fondu large des décors lointains (voir docs/ROOMS.md : coins du haut sur grand écran). */
export const FW = { r0: 9.5, r1: 18 }
const SEA_FADE = { r0: 8.5, r1: 19, stars: 1 }

/** Le dessus de l'aile, peint en coordonnées de plan (x de -6 à 2,7, -z de 3,4 à 13,3) : alu clair, joints, becs, volets, aileron, bande de bout d'aile. */
const WING_X0 = -6.2, WING_X1 = 2.8, WING_Y0 = 3.4, WING_Y1 = 13.4
export const wingTex = (() => {
  const t = canvasTex(512, 1024, (x) => {
    const r = seeded(7), W = 512, H = 1024
    const X = (wx: number) => ((wx - WING_X0) / (WING_X1 - WING_X0)) * W, Y = (wy: number) => H - ((wy - WING_Y0) / (WING_Y1 - WING_Y0)) * H
    x.fillStyle = '#dde2ec'; x.fillRect(0, 0, W, H)
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '90,100,120'},${r() * 0.05})`; x.fillRect(r() * W, r() * H, 3 + r() * 14, 1) }
    x.strokeStyle = 'rgba(70,82,110,.22)'; x.lineWidth = 1.5
    // les panneaux : des joints le long de l'envergure et en travers
    for (const f of [0.25, 0.5, 0.74]) { x.beginPath(); x.moveTo(X(2.7 - f * 6.4), Y(3.4)); x.lineTo(X(-4.6 - f * 1.1), Y(13.3)); x.stroke() }
    for (let k = 1; k < 4; k++) { const y = 3.4 + k * 2.4; x.beginPath(); x.moveTo(X(-6.5), Y(y)); x.lineTo(X(3), Y(y)); x.stroke() }
    // les volets (le bord de fuite) : deux grands, séparés par un joint sombre, et leurs carénages
    x.fillStyle = 'rgba(120,134,164,.4)'
    x.beginPath(); x.moveTo(X(-2.2), Y(3.5)); x.lineTo(X(-3.0), Y(3.5)); x.lineTo(X(-4.1), Y(8.4)); x.lineTo(X(-3.5), Y(8.4)); x.closePath(); x.fill()
    x.beginPath(); x.moveTo(X(-3.9), Y(8.7)); x.lineTo(X(-4.2), Y(8.7)); x.lineTo(X(-5.2), Y(11.6)); x.lineTo(X(-4.9), Y(11.6)); x.closePath(); x.fill()
    // la zone de marche antidérapante près du fuselage : un cadre sombre, des bandes
    x.fillStyle = 'rgba(70,82,110,.34)'; x.fillRect(X(-1.2), Y(6.0), X(1.4) - X(-1.2), Y(3.8) - Y(6.0))
    x.strokeStyle = 'rgba(240,244,255,.7)'; x.lineWidth = 3; x.strokeRect(X(-1.2), Y(6.0), X(1.4) - X(-1.2), Y(3.8) - Y(6.0))
    // le bord d'attaque plus sombre, une bande pastel au bout de l'aile
    x.fillStyle = 'rgba(46,58,100,.4)'
    x.beginPath(); x.moveTo(X(2.8), Y(3.4)); x.lineTo(X(2.4), Y(3.4)); x.lineTo(X(-4.0), Y(13.4)); x.lineTo(X(-4.3), Y(13.4)); x.closePath(); x.fill()
    x.fillStyle = '#6d7fd8'; x.fillRect(0, 0, W, Y(12.4))
    x.fillStyle = '#f09a86'; x.fillRect(0, 0, W, Y(12.9))
  })
  t.repeat.set(1 / (WING_X1 - WING_X0), 1 / (WING_Y1 - WING_Y0))
  t.offset.set(-WING_X0 / (WING_X1 - WING_X0), -WING_Y0 / (WING_Y1 - WING_Y0))
  return t
})()

/** La face avant du réacteur : un disque à pales courbes (le disque tourne sur lui-même), un cône central clair. */
export const fanTex = (() => {
  const [c, x] = makeCanvas(256, 256)
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, '#9aa3b6'); g.addColorStop(1, '#4a5368')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * TAU
    x.fillStyle = k % 2 ? '#2b3246' : '#3c455c'
    x.beginPath(); x.moveTo(128 + Math.cos(a) * 22, 128 + Math.sin(a) * 22)
    x.quadraticCurveTo(128 + Math.cos(a + 0.5) * 70, 128 + Math.sin(a + 0.5) * 70, 128 + Math.cos(a + 0.36) * 122, 128 + Math.sin(a + 0.36) * 122)
    x.lineTo(128 + Math.cos(a + 0.12) * 124, 128 + Math.sin(a + 0.12) * 124)
    x.quadraticCurveTo(128 + Math.cos(a + 0.14) * 66, 128 + Math.sin(a + 0.14) * 66, 128 + Math.cos(a) * 22, 128 + Math.sin(a) * 22)
    x.fill()
  }
  x.fillStyle = '#e4e8f2'; x.beginPath(); x.arc(128, 128, 26, 0, TAU); x.fill()
  x.fillStyle = '#b9c0d2'; x.beginPath(); x.arc(134, 134, 16, 0, TAU); x.fill()
  return new CanvasTexture(c)
})()

/** La lune : un disque crème, des mers d'ombre douces. */
export const moonTex = (() => {
  const [c, x] = makeCanvas(256, 256)
  const r = seeded(17)
  x.fillStyle = '#f2eedc'; x.beginPath(); x.arc(128, 128, 124, 0, TAU); x.fill()
  x.save(); x.beginPath(); x.arc(128, 128, 124, 0, TAU); x.clip()
  for (const [px, py, rad] of [[90, 100, 34], [150, 90, 26], [120, 160, 40], [172, 150, 22], [70, 160, 20]]) {
    const g = x.createRadialGradient(px, py, 0, px, py, rad)
    g.addColorStop(0, 'rgba(160,156,150,.42)'); g.addColorStop(1, 'rgba(160,156,150,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
  }
  for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(150,146,140,${0.06 + r() * 0.1})`; x.beginPath(); x.arc(40 + r() * 176, 40 + r() * 176, 3 + r() * 6, 0, TAU); x.fill() }
  x.restore()
  return new CanvasTexture(c)
})()

/** Les rideaux de l'aurore : des colonnes verticales de hauteurs différentes, vert à la base, turquoise puis violet. 2 : 1. */
export const auroraTex = canvasTex(512, 256, (x) => {
  const r = seeded(29)
  for (let i = 0; i < 70; i++) {
    const px = (i / 70) * 512 + r() * 6, w = 6 + r() * 12, h = 70 + 110 * Math.sin((i / 70) * Math.PI) * (0.5 + 0.5 * r()) + 30 * Math.sin(i * 0.4)
    const g = x.createLinearGradient(0, 256, 0, 256 - h)
    g.addColorStop(0, 'rgba(110,255,190,.55)'); g.addColorStop(0.5, 'rgba(80,220,200,.28)'); g.addColorStop(1, 'rgba(150,130,255,0)')
    x.fillStyle = g; x.fillRect(px, 256 - h, w, h)
  }
  // les bords s'effacent : ni pied coupé net, ni côtés francs
  x.globalCompositeOperation = 'destination-in'
  const v = x.createLinearGradient(0, 0, 0, 256)
  v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.55, 'rgba(0,0,0,1)'); v.addColorStop(0.95, 'rgba(0,0,0,0)')
  x.fillStyle = v; x.fillRect(0, 0, 512, 256)
  const hz = x.createLinearGradient(0, 0, 512, 0)
  hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(0.2, 'rgba(0,0,0,1)'); hz.addColorStop(0.8, 'rgba(0,0,0,1)'); hz.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = hz; x.fillRect(0, 0, 512, 256)
})

const tone = (c: number, o = {}) => far(c, { roughness: 0.78, ...o })

/** Les matériaux du dehors. Les couleurs des nuages suivent le jour, la nuit et la météo (Surroundings.tsx). */
export const O = {
  cloud: skyFade(tone(0xffffff, { emissive: 0xdde6fa, emissiveIntensity: 0.1 }), SEA_FADE),
  /** Les bancs très lointains des coins du haut : bas, pâles, au fondu large. */
  bank: skyFade(tone(0xffffff, { emissive: 0xdde6fa, emissiveIntensity: 0.1 }), { ...FW, stars: 1 }),
  wing: skyFade(far(0xffffff, { map: wingTex, roughness: 0.5, emissive: 0xaab6d8, emissiveIntensity: 0.06 }), { r0: 10, r1: 19, y0: 20, y1: 30 }),
  wingEdge: skyFade(far(0xaeb7cc, { roughness: 0.55 }), { r0: 10, r1: 19 }),
  nacelle: skyFade(far(0xe6eaf2, { roughness: 0.45, emissive: 0xaab6d8, emissiveIntensity: 0.06, side: DoubleSide }), { r0: 10, r1: 19 }),
  inlet: skyFade(far(0x3a4258, { roughness: 0.6 }), { r0: 10, r1: 19 }),
  fan: skyFade(far(0xffffff, { map: fanTex, roughness: 0.4, metalness: 0.2 }), { r0: 10, r1: 19 }),
  tailcone: skyFade(far(0xb7bfd2, { roughness: 0.4, metalness: 0.4 }), { r0: 10, r1: 19 }),
  // les corps du ciel : dessinés par-dessus la mer de nuages (sans test de profondeur), loin des murs de la cabine
  moon: new MeshBasicMaterial({ map: moonTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }),
  sun: new MeshBasicMaterial({ color: 0xfff7d8, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }),
  halo: new MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: AdditiveBlending, color: 0xbcccff, fog: false }),
  aurora: new MeshBasicMaterial({ map: auroraTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, fog: false }),
  navRed: new MeshBasicMaterial({ color: 0xff4a4a, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false, blending: AdditiveBlending }),
  strobe: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: AdditiveBlending }),
}
