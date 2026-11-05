import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'
import { makeCanvas } from '../textures'

// Textures de la laverie : le carrelage menthe du sol et des murs, les affichettes, les panneaux des machines, le monnayeur, le
// panneau « sol glissant », la pluie qui tombe dehors et les gouttes sur la vitrine.

const SANS = '"Nunito", "Trebuchet MS", sans-serif'
const MONO = '"DM Mono", ui-monospace, monospace'

/**
 * Le sol : un damier de carreaux de grès menthe et crème, à peine contrasté (un damier franc scintille), joints gris clair,
 * un léger voile d'usure au milieu de chaque carreau. Tuile de 4 × 4 carreaux, répétée.
 */
export const floorTex = canvasTex(512, 512, (x) => {
  const r = seeded(3), S = 128
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      const light = (i + j) % 2 === 0
      x.fillStyle = light ? '#e4f1ea' : '#b9e0d0'
      x.fillRect(i * S, j * S, S, S)
      const g = x.createRadialGradient(i * S + S / 2, j * S + S / 2, 4, i * S + S / 2, j * S + S / 2, S * 0.7)
      g.addColorStop(0, light ? 'rgba(255,255,255,.35)' : 'rgba(220,245,235,.3)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.fillRect(i * S, j * S, S, S)
      for (let k = 0; k < 40; k++) {
        x.fillStyle = r() < 0.5 ? 'rgba(90,130,115,.08)' : 'rgba(255,255,255,.25)'
        x.fillRect(i * S + r() * S, j * S + r() * S, 2, 2)
      }
    }
  x.strokeStyle = '#a9bdb5'
  x.lineWidth = 4
  for (let k = 0; k <= 4; k++) {
    x.beginPath(); x.moveTo(k * S, 0); x.lineTo(k * S, 512); x.stroke()
    x.beginPath(); x.moveTo(0, k * S); x.lineTo(512, k * S); x.stroke()
  }
}, [4, 4])

/** La faïence des murs, jusqu'à hauteur d'épaule : des carreaux métro menthe pâle posés en quinconce, vernissés, joints blancs. */
export const wallTileTex = canvasTex(256, 256, (x) => {
  const r = seeded(9), W = 64, H = 32
  x.fillStyle = '#f4faf7'
  x.fillRect(0, 0, 256, 256)
  for (let j = 0; j < 8; j++)
    for (let i = -1; i < 5; i++) {
      const ox = (j % 2) * (W / 2), t = r()
      x.fillStyle = `rgb(${172 + t * 14},${222 + t * 10},${204 + t * 10})`
      rr(x, i * W + ox + 2, j * H + 2, W - 4, H - 4, 5)
      x.fill()
      // le reflet du vernis, en haut de chaque carreau
      x.fillStyle = 'rgba(255,255,255,.32)'
      rr(x, i * W + ox + 6, j * H + 5, W - 12, 6, 3)
      x.fill()
    }
}, [1, 1])

/** Le plâtre du haut des murs : un gris-vert très pâle, un grain doux. */
export const plasterTex = canvasTex(256, 256, (x) => {
  const r = seeded(21)
  x.fillStyle = '#e7eeea'
  x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1600; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.4)' : 'rgba(120,150,140,.06)'
    x.fillRect(r() * 256, r() * 256, 2, 2)
  }
}, [1, 1])

/** Le tableau des tarifs, au-dessus des machines : lettres blanches sur fond bleu lessive, les prix en jaune. */
export const priceTex = canvasTex(512, 340, (x) => {
  x.fillStyle = '#3d68a0'
  rr(x, 0, 0, 512, 340, 22); x.fill()
  x.strokeStyle = '#f4f8ff'; x.lineWidth = 6
  rr(x, 12, 12, 488, 316, 16); x.stroke()
  x.fillStyle = '#ffffff'
  x.textAlign = 'center'
  x.font = `900 46px ${SANS}`
  x.fillText('TARIFS', 256, 70)
  x.textAlign = 'left'
  x.font = `700 30px ${SANS}`
  const rows: [string, string][] = [['Lavage 7 kg', '4,50 €'], ['Lavage 11 kg', '6,00 €'], ['Séchage 10 min', '1,00 €'], ['Lessive', '1,00 €']]
  rows.forEach(([a, b], i) => {
    const y = 128 + i * 52
    x.fillStyle = '#ffffff'; x.fillText(a, 40, y)
    x.fillStyle = '#f2d78a'; x.textAlign = 'right'; x.fillText(b, 472, y); x.textAlign = 'left'
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(40, y + 14, 432, 2)
  })
})

/** L'affichette des consignes : papier blanc scotché, un liseré menthe, écrite au feutre. */
export const rulesTex = canvasTex(256, 340, (x) => {
  x.fillStyle = '#fbfaf4'
  x.fillRect(0, 0, 256, 340)
  x.fillStyle = '#7fcfb4'
  x.fillRect(0, 0, 256, 18)
  x.fillStyle = '#2b3a44'
  x.textAlign = 'center'
  x.font = `900 30px ${SANS}`
  x.fillText('MERCI', 128, 64)
  x.font = `700 21px ${SANS}`
  ;['de vider', 'le filtre', 'du séchoir', '', 'pas de', 'teinture', 'en machine'].forEach((l, i) => x.fillText(l, 128, 104 + i * 30))
  x.strokeStyle = '#d0584a'; x.lineWidth = 5
  x.beginPath(); x.arc(128, 306, 18, 0, TAU); x.stroke()
  x.beginPath(); x.moveTo(116, 294); x.lineTo(140, 318); x.stroke()
})

/** Le panneau d'horaires collé sur la porte vitrée, lu de l'intérieur (la caméra voit la face +z : le texte est à l'endroit pour elle) : « 24 h / 24 · 7 j / 7 ». */
export const hoursTex = canvasTex(256, 128, (x) => {
  x.fillStyle = 'rgba(255,255,255,.92)'
  rr(x, 6, 6, 244, 116, 14); x.fill()
  x.fillStyle = '#2a63b8'
  x.textAlign = 'center'
  x.font = `900 40px ${SANS}`
  x.fillText('24 h / 24', 128, 58)
  x.font = `700 26px ${SANS}`
  x.fillText('7 j / 7', 128, 98)
})

/** Le lettrage de vinyle de la vitrine, lu depuis la caméra : LAVERIE, et une petite bulle de savon. */
export const letteringTex = canvasTex(1024, 192, (x) => {
  x.fillStyle = 'rgba(245,252,255,.95)'
  x.textAlign = 'center'
  x.font = `900 120px ${SANS}`
  x.fillText('LAVERIE', 512, 128)
  x.font = `700 34px ${SANS}`
  x.fillText('libre-service · lavage · séchage', 512, 178)
  x.lineWidth = 6; x.strokeStyle = 'rgba(245,252,255,.9)'
  for (const [cx, cy, rad] of [[118, 70, 34], [70, 120, 20], [930, 80, 28], [968, 136, 16]]) { x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.stroke() }
})

/**
 * Le bandeau de commande d'un lave-linge : plastique gris, l'afficheur vert (« 32 MIN »), le bouton de programme cranté peint
 * autour (froid, 30°, 40°, 60°, 90°), le monnayeur et son étiquette, le numéro de la machine.
 */
function panelTex(num: number, mins: string, dryer = false) {
  return canvasTex(512, 96, (x) => {
    x.fillStyle = '#d9e0e3'
    rr(x, 0, 0, 512, 96, 18); x.fill()
    x.fillStyle = '#2a63b8'
    rr(x, 14, 14, 68, 68, 14); x.fill()
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = `900 50px ${SANS}`
    x.fillText(String(num), 48, 66)
    // l'afficheur
    x.fillStyle = '#16302a'
    rr(x, 102, 22, 128, 52, 8); x.fill()
    x.fillStyle = '#7dffc8'; x.font = `500 30px ${MONO}`
    x.fillText(mins, 166, 59)
    // les repères du bouton de programme
    x.fillStyle = '#44525a'; x.font = `700 ${dryer ? 13 : 15}px ${SANS}`
    const labels = dryer ? ['DOUX', 'MOYEN', 'CHAUD'] : ['30°', '40°', '60°', '90°']
    labels.forEach((l, i) => x.fillText(l, dryer ? 262 + i * 54 : 268 + i * 34, 26))
    // la fente du monnayeur et son étiquette
    x.fillStyle = '#9aa6ad'
    rr(x, 420, 20, 70, 56, 10); x.fill()
    x.fillStyle = '#2c3438'
    rr(x, 451, 28, 8, 40, 3); x.fill()
    x.fillStyle = '#44525a'; x.font = `700 13px ${SANS}`
    x.fillText(dryer ? '1 €' : '4,50 €', 455, 90)
  })
}
export const panelTexes = [panelTex(1, '— —'), panelTex(2, '32 MIN'), panelTex(3, '— —'), panelTex(4, '— —')]
export const dryerPanelTexes = [panelTex(5, '14 MIN', true), panelTex(6, '— —', true)]

/** Le fond d'un tambour : l'inox percé de rangées de trous, plus sombre vers le bord. */
export const drumTex = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128)
  g.addColorStop(0, '#8d9aa2'); g.addColorStop(0.75, '#56636b'); g.addColorStop(1, '#2c353b')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  x.fillStyle = 'rgba(20,28,32,.55)'
  for (let j = -6; j <= 6; j++)
    for (let i = -6; i <= 6; i++) {
      const px = 128 + i * 18 + (j % 2) * 9, py = 128 + j * 16
      if (Math.hypot(px - 128, py - 128) < 108) { x.beginPath(); x.arc(px, py, 3.2, 0, TAU); x.fill() }
    }
  // les trois aubes qui soulèvent le linge
  x.fillStyle = 'rgba(200,210,215,.5)'
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * TAU
    x.save(); x.translate(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96); x.rotate(a)
    rr(x, -10, -16, 20, 32, 8); x.fill(); x.restore()
  }
})

/** L'éponge d'une serviette : un fond et ses bouclettes, une bande tissée en travers. */
export function towelTex(base: string, band: string, seed: number) {
  return canvasTex(128, 128, (x) => {
    const r = seeded(seed)
    x.fillStyle = base
    x.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 900; i++) {
      x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.07)'
      x.beginPath(); x.arc(r() * 128, r() * 128, 1.3, 0, TAU); x.fill()
    }
    x.fillStyle = band
    x.fillRect(0, 98, 128, 12)
    x.fillStyle = 'rgba(255,255,255,.5)'
    x.fillRect(0, 96, 128, 2); x.fillRect(0, 110, 128, 2)
  })
}

/**
 * La façade du distributeur, au-dessus de la vitre : le bandeau lumineux « LESSIVE · MONNAIE », et en bas le monnayeur : l'écran,
 * la fente des billets, la fente des pièces, les étiquettes.
 */
export const dispenserHeadTex = canvasTex(512, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, '#ffe7a8'); g.addColorStop(1, '#ffc768')
  x.fillStyle = g
  rr(x, 0, 0, 512, 128, 22); x.fill()
  x.fillStyle = '#2a63b8'
  x.textAlign = 'center'
  x.font = `900 52px ${SANS}`
  x.fillText('LESSIVE', 256, 66)
  x.font = `800 28px ${SANS}`
  x.fillText('& MONNAIE', 256, 106)
})

export const changerTex = canvasTex(256, 320, (x) => {
  x.fillStyle = '#e8edef'
  x.fillRect(0, 0, 256, 320)
  x.textAlign = 'center'
  // l'écran
  x.fillStyle = '#16302a'
  rr(x, 40, 22, 176, 54, 10); x.fill()
  x.fillStyle = '#7dffc8'; x.font = `500 26px ${MONO}`
  x.fillText('MONNAIE', 128, 58)
  // les billets
  x.fillStyle = '#44525a'; x.font = `800 18px ${SANS}`
  x.fillText('BILLETS  5 · 10 · 20 €', 128, 112)
  x.fillStyle = '#2c3438'
  rr(x, 48, 124, 160, 16, 6); x.fill()
  x.fillStyle = '#7dffc8'; x.fillRect(56, 130, 144, 4)
  // les pièces
  x.fillStyle = '#44525a'
  x.fillText('PIÈCES', 128, 182)
  x.fillStyle = '#2c3438'
  rr(x, 120, 194, 16, 44, 5); x.fill()
  x.fillStyle = '#f2c24a'
  x.beginPath(); x.arc(70, 216, 16, 0, TAU); x.fill()
  x.fillStyle = '#c9ced1'
  x.beginPath(); x.arc(186, 216, 16, 0, TAU); x.fill()
  x.fillStyle = '#44525a'; x.font = `700 15px ${SANS}`
  x.fillText('1 €', 70, 221); x.fillText('2 €', 186, 221)
  x.font = `800 16px ${SANS}`
  x.fillText('RENDU ↓', 128, 290)
})

/** Une boîte de lessive du distributeur : son carton coloré, une bulle et le nom. */
export function soapBoxTex(base: string, ink: string, name: string) {
  return canvasTex(128, 160, (x) => {
    x.fillStyle = base
    x.fillRect(0, 0, 128, 160)
    x.fillStyle = 'rgba(255,255,255,.85)'
    x.beginPath(); x.arc(64, 66, 34, 0, TAU); x.fill()
    x.fillStyle = ink
    x.textAlign = 'center'
    x.font = `900 30px ${SANS}`
    x.fillText(name, 64, 78)
    x.font = `800 16px ${SANS}`
    x.fillText('1 dose', 64, 136)
  })
}

/** Le panneau jaune « attention sol glissant » : le bonhomme qui glisse, le texte. */
export const wetSignTex = canvasTex(256, 384, (x) => {
  x.fillStyle = '#f5c935'
  rr(x, 0, 0, 256, 384, 26); x.fill()
  x.fillStyle = '#2b2b2e'
  x.textAlign = 'center'
  x.font = `900 34px ${SANS}`
  x.fillText('ATTENTION', 128, 62)
  x.font = `800 26px ${SANS}`
  x.fillText('SOL', 128, 300); x.fillText('GLISSANT', 128, 334)
  // le triangle et le bonhomme qui glisse
  x.lineJoin = 'round'
  x.strokeStyle = '#2b2b2e'; x.lineWidth = 12
  x.beginPath(); x.moveTo(128, 90); x.lineTo(212, 250); x.lineTo(44, 250); x.closePath(); x.stroke()
  x.lineWidth = 9; x.lineCap = 'round'
  x.beginPath(); x.arc(140, 150, 11, 0, TAU); x.fill()
  x.beginPath(); x.moveTo(132, 166); x.lineTo(112, 200); x.lineTo(86, 214); x.moveTo(112, 200); x.lineTo(136, 222); x.lineTo(160, 216); x.moveTo(128, 176); x.lineTo(160, 188); x.moveTo(126, 178); x.lineTo(100, 178); x.stroke()
  x.lineWidth = 6
  x.beginPath(); x.moveTo(70, 236); x.quadraticCurveTo(128, 226, 186, 236); x.stroke()
})

/** La couverture d'un magazine corné : un aplat, une grande photo ronde, le titre. */
export function magazineTex(bg: string, photo: string, title: string, seed: number) {
  return canvasTex(128, 160, (x) => {
    const r = seeded(seed)
    x.fillStyle = bg
    x.fillRect(0, 0, 128, 160)
    x.fillStyle = photo
    x.beginPath(); x.ellipse(64, 96, 46, 50, 0, 0, TAU); x.fill()
    x.fillStyle = 'rgba(255,255,255,.4)'
    for (let i = 0; i < 4; i++) x.fillRect(12, 136 + i * 0, 60 + r() * 40, 4)
    x.fillStyle = '#ffffff'
    x.textAlign = 'left'
    x.font = `900 26px ${SANS}`
    x.fillText(title, 10, 32)
    x.fillStyle = 'rgba(255,255,255,.7)'
    for (let i = 0; i < 3; i++) x.fillRect(10, 42 + i * 8, 40 + r() * 40, 3)
  })
}

/** Le panneau de liège des petites annonces : des papiers punaisés, l'un à languettes qu'on arrache. */
export const corkTex = canvasTex(320, 256, (x) => {
  const r = seeded(5)
  x.fillStyle = '#c99a62'
  x.fillRect(0, 0, 320, 256)
  for (let i = 0; i < 1800; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(120,80,40,.25)' : 'rgba(240,200,150,.25)'
    x.fillRect(r() * 320, r() * 256, 2, 2)
  }
  x.strokeStyle = '#8a5e34'; x.lineWidth = 10
  x.strokeRect(5, 5, 310, 246)
  const notes: [number, number, number, number, string, string, string][] = [
    [24, 22, 110, 120, '#fffaf0', 'COURS DE', 'GUITARE'],
    [150, 30, 140, 84, '#ffe0e8', 'CHAT', 'TROUVÉ !'],
    [160, 130, 120, 100, '#dff3ff', 'DONNE', 'CANAPÉ'],
    [30, 160, 104, 76, '#fff3c0', 'REPASSAGE', 'À DOMICILE'],
  ]
  notes.forEach(([nx, ny, w, h, c, a, b], i) => {
    x.save(); x.translate(nx + w / 2, ny + h / 2); x.rotate((r() - 0.5) * 0.12)
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(-w / 2 + 3, -h / 2 + 4, w, h)
    x.fillStyle = c; x.fillRect(-w / 2, -h / 2, w, h)
    x.fillStyle = '#2b3a44'; x.textAlign = 'center'; x.font = `800 17px ${SANS}`
    x.fillText(a, 0, -h / 2 + 26); x.fillText(b, 0, -h / 2 + 48)
    if (i === 0) {
      // les languettes à numéro de téléphone, deux déjà arrachées
      for (let k = 0; k < 7; k++) {
        if (k === 2 || k === 5) continue
        x.fillStyle = c; x.fillRect(-w / 2 + 4 + k * 15, h / 2 - 2, 12, 26)
        x.fillStyle = 'rgba(43,58,68,.6)'; x.fillRect(-w / 2 + 9 + k * 15, h / 2 + 2, 2, 18)
      }
      x.strokeStyle = 'rgba(43,58,68,.35)'; x.lineWidth = 1
      for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-w / 2 + 12, -h / 2 + 62 + k * 10); x.lineTo(w / 2 - 12, -h / 2 + 62 + k * 10); x.stroke() }
    }
    if (i === 1) {
      x.fillStyle = '#7a6a60'; x.beginPath(); x.ellipse(0, 18, 18, 12, 0, 0, TAU); x.fill()
      x.beginPath(); x.arc(14, 6, 9, 0, TAU); x.fill()
    }
    x.fillStyle = ['#d0584a', '#2a63b8', '#3faa7a', '#f2c24a'][i]
    x.beginPath(); x.arc(0, -h / 2 + 7, 6, 0, TAU); x.fill()
    x.restore()
  })
})

/** Le cadran de l'horloge murale : chiffres ronds, graduations, le nom de la laverie. */
export const clockTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#fbfcfa'
  x.beginPath(); x.arc(128, 128, 126, 0, TAU); x.fill()
  x.strokeStyle = '#2b3a44'; x.fillStyle = '#2b3a44'
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU, big = i % 5 === 0, r0 = big ? 100 : 108
    x.lineWidth = big ? 5 : 2
    x.beginPath(); x.moveTo(128 + Math.sin(a) * r0, 128 - Math.cos(a) * r0); x.lineTo(128 + Math.sin(a) * 116, 128 - Math.cos(a) * 116); x.stroke()
  }
  x.textAlign = 'center'; x.font = `800 26px ${SANS}`
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * TAU
    x.fillText(String(h), 128 + Math.sin(a) * 80, 137 - Math.cos(a) * 80)
  }
  x.fillStyle = '#2a63b8'; x.font = `800 14px ${SANS}`
  x.fillText('LAVERIE', 128, 178)
})

/** La cassette dans la fenêtre du radiocassette : l'étiquette crème écrite à la main, les deux fenêtres des bobines. */
export const cassetteTex = canvasTex(256, 128, (x) => {
  x.fillStyle = '#2c3034'
  rr(x, 0, 0, 256, 128, 14); x.fill()
  x.fillStyle = '#f6eedc'
  rr(x, 16, 12, 224, 70, 8); x.fill()
  x.fillStyle = '#e46f6f'; x.fillRect(16, 26, 224, 6)
  x.fillStyle = '#3a3a44'; x.font = `700 20px ${SANS}`; x.textAlign = 'left'
  x.fillText('lofi nuit · face A', 26, 62)
  x.fillStyle = '#1a1c1f'
  rr(x, 64, 88, 128, 28, 12); x.fill()
})

/** Le cadran du radiocassette : FM / AM, les graduations, l'aiguille rouge. */
export const tunerTex = canvasTex(256, 64, (x) => {
  x.fillStyle = '#fff3d2'
  rr(x, 0, 0, 256, 64, 10); x.fill()
  x.strokeStyle = '#4a3a30'; x.fillStyle = '#4a3a30'; x.font = `700 12px ${SANS}`; x.textAlign = 'center'
  for (let i = 0; i <= 24; i++) {
    const px = 22 + i * 9.2, h = i % 4 === 0 ? 12 : 6
    x.lineWidth = i % 4 === 0 ? 2 : 1
    x.beginPath(); x.moveTo(px, 40); x.lineTo(px, 40 - h); x.stroke()
  }
  ;['88', '92', '96', '100', '104', '108', '—'].forEach((n, i) => i < 6 && x.fillText(n, 22 + i * 36.8, 56))
  x.fillStyle = '#d8402e'; x.fillRect(150, 6, 4, 52)
})

/** Les traits de pluie qui tombent dehors : de fines rayures claires, de longueurs et d'intensités variées. Tuile répétée. */
export const rainTex = (() => {
  const [c, x] = makeCanvas(256, 512)
  const r = seeded(13)
  x.clearRect(0, 0, 256, 512)
  for (let i = 0; i < 140; i++) {
    const px = r() * 256, py = r() * 512, len = 26 + r() * 50, a = 0.25 + r() * 0.5
    const g = x.createLinearGradient(px, py, px - len * 0.12, py + len)
    g.addColorStop(0, 'rgba(225,238,255,0)'); g.addColorStop(1, `rgba(225,238,255,${a.toFixed(2)})`)
    x.strokeStyle = g; x.lineWidth = 1.6
    for (const oy of [0, -512, 512]) { x.beginPath(); x.moveTo(px, py + oy); x.lineTo(px - len * 0.12, py + len + oy); x.stroke() }
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
})()

/** Les gouttes sur la vitrine, côté rue : des perles rondes avec leur reflet, et quelques coulures. */
export const dropsTex = canvasTex(512, 512, (x) => {
  const r = seeded(29)
  x.clearRect(0, 0, 512, 512)
  for (let i = 0; i < 26; i++) {
    const px = r() * 512, py0 = r() * 300, len = 80 + r() * 200
    x.strokeStyle = 'rgba(230,242,255,.28)'; x.lineWidth = 2.5 + r() * 2
    x.beginPath(); x.moveTo(px, py0); x.bezierCurveTo(px + (r() - 0.5) * 12, py0 + len * 0.4, px + (r() - 0.5) * 12, py0 + len * 0.7, px + (r() - 0.5) * 8, py0 + len); x.stroke()
    x.fillStyle = 'rgba(235,245,255,.5)'; x.beginPath(); x.arc(px, py0 + len, 3.5, 0, TAU); x.fill()
  }
  for (let i = 0; i < 420; i++) {
    const px = r() * 512, py = r() * 512, rad = 1 + r() * r() * 5
    x.fillStyle = 'rgba(210,228,245,.35)'; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
    x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(px - rad * 0.3, py - rad * 0.3, rad * 0.35, 0, TAU); x.fill()
  }
}, [1, 1])

/** Le pavé du trottoir, dehors : de grandes dalles de béton gris, un joint sombre, un grain. */
export const pavingTex = canvasTex(256, 256, (x) => {
  const r = seeded(31)
  x.fillStyle = '#8f979c'
  x.fillRect(0, 0, 256, 256)
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    const t = r()
    x.fillStyle = `rgb(${132 + t * 18},${140 + t * 16},${146 + t * 14})`
    x.fillRect(i * 128 + 3, j * 128 + 3, 122, 122)
  }
  for (let i = 0; i < 1400; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)'
    x.fillRect(r() * 256, r() * 256, 2, 2)
  }
}, [1, 1])

/** Une flaque : une tache sombre et lisse au bord doux (le reflet vient du vernis du matériau). */
export const puddleTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 6, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.beginPath(); x.ellipse(64, 64, 62, 62, 0, 0, TAU); x.fill()
})

/** Un rond dans l'eau : un anneau fin, qui s'agrandit et s'efface (les flaques du trottoir sous la pluie). */
export const ringTex = canvasTex(64, 64, (x) => {
  x.strokeStyle = 'rgba(235,245,255,.9)'; x.lineWidth = 3
  x.beginPath(); x.arc(32, 32, 26, 0, TAU); x.stroke()
})

/** Un reflet doux sur le carrelage : une tache claire qui s'efface sur ses bords, allongée. */
export const sheenTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.5, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
})

/** L'étiquette d'un bidon de lessive liquide : une vague, le nom. */
export function bottleTex(base: string, ink: string, name: string) {
  return canvasTex(128, 96, (x) => {
    x.fillStyle = base
    x.fillRect(0, 0, 128, 96)
    x.fillStyle = 'rgba(255,255,255,.85)'
    rr(x, 14, 18, 100, 60, 14); x.fill()
    x.fillStyle = ink; x.textAlign = 'center'; x.font = `900 24px ${SANS}`
    x.fillText(name, 64, 58)
  })
}

/** La plaque « PRESSING · DÉPÔT » du comptoir, et le carnet de tickets. */
export const counterSignTex = canvasTex(384, 96, (x) => {
  x.fillStyle = '#fbf6ea'
  rr(x, 0, 0, 384, 96, 16); x.fill()
  x.strokeStyle = '#2a63b8'; x.lineWidth = 5
  rr(x, 8, 8, 368, 80, 12); x.stroke()
  x.fillStyle = '#2a63b8'; x.textAlign = 'center'; x.font = `900 36px ${SANS}`
  x.fillText('PRESSING · DÉPÔT', 192, 62)
})

/** Le halo d'un néon sur le mur : une bande de lumière qui s'efface vers le haut, le bas et les deux bouts. */
export const haloTex = canvasTex(256, 64, (x) => {
  const img = x.createImageData(256, 64)
  for (let j = 0; j < 64; j++)
    for (let i = 0; i < 256; i++) {
      const u = (i / 255) * 2 - 1, v = (j / 63) * 2 - 1
      const a = Math.exp(-v * v * 5) * Math.max(0, 1 - Math.pow(Math.abs(u), 6))
      const k = (j * 256 + i) * 4
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255
      img.data[k + 3] = Math.round(a * 255)
    }
  x.putImageData(img, 0, 0)
})
