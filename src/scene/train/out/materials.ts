import { AdditiveBlending, MeshStandardMaterial, RepeatWrapping, SpriteMaterial } from 'three'
import { far } from '../../materials'
import { canvasTex, rr, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { farLeafy } from '../../nature/materials'
import { glowTex } from '../../textures'

// Les matériaux du dehors du train : le pré alpin, le ballast, les rails, les poteaux, la voiture suivante, le chalet.
// Tout se fond dans le ciel sur les bords (un fondu étiré le long de la voie) et reçoit la neige quand il neige.

/** Le pré : vert tendre, touffes plus sombres, petites fleurs des Alpes (blanches, jaunes, roses). */
const meadowTex = canvasTex(256, 256, (x) => {
  const r = seeded(21)
  x.fillStyle = '#8fbf7a'; x.fillRect(0, 0, 256, 256)
  // des bandes de fauche (en long de la voie) et de larges plaques plus claires ou plus sombres, pour que le pré ne soit pas un aplat ;
  // dessinées aussi décalées de 256 : la tuile se raccorde
  const band = x.createLinearGradient(0, 0, 0, 256)
  band.addColorStop(0, 'rgba(190,225,150,.30)'); band.addColorStop(0.25, 'rgba(190,225,150,0)'); band.addColorStop(0.5, 'rgba(70,120,70,.22)'); band.addColorStop(0.75, 'rgba(190,225,150,0)'); band.addColorStop(1, 'rgba(190,225,150,.30)')
  x.fillStyle = band; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 7; i++) {
    const cx = r() * 256, cy = r() * 256, rad = 34 + r() * 40, a = 0.1 + r() * 0.1, light = i % 2 === 0
    for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
      const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, rad)
      g.addColorStop(0, light ? `rgba(205,230,150,${a})` : `rgba(80,130,80,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)')
      x.fillStyle = g; x.fillRect(cx + dx - rad, cy + dy - rad, rad * 2, rad * 2)
    }
  }
  for (let i = 0; i < 260; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(110,160,95,.55)' : 'rgba(165,205,140,.5)'
    x.beginPath(); x.ellipse(r() * 256, r() * 256, 3 + r() * 9, 2 + r() * 5, r() * 3, 0, 6.3); x.fill()
  }
  for (let i = 0; i < 90; i++) {
    x.fillStyle = ['#fffaf0', '#ffe27a', '#f4a6b8', '#c9b6f0'][(r() * 4) | 0]
    x.beginPath(); x.arc(r() * 256, r() * 256, 1.4 + r() * 1.2, 0, 6.3); x.fill()
  }
}, [1, 1])

/** Le ballast : des cailloux gris-brun serrés, quelques plus clairs. */
const gravelTex = canvasTex(256, 128, (x) => {
  const r = seeded(8)
  x.fillStyle = '#8c8580'; x.fillRect(0, 0, 256, 128)
  for (let i = 0; i < 700; i++) {
    const v = 110 + r() * 80
    x.fillStyle = `rgb(${v + 8},${v},${v - 6})`
    x.beginPath(); x.ellipse(r() * 256, r() * 128, 1.5 + r() * 2.8, 1.2 + r() * 2, r() * 3, 0, 6.3); x.fill()
  }
}, [1, 1])

/**
 * Le flanc de la voiture suivante : livrée bleu nuit, filet et lettrage dorés, cinq fenêtres aux rideaux à demi tirés.
 * `glow` : le même dessin où seules les fenêtres sont claires (elles s'allument la nuit).
 */
function carSide(glow: boolean) {
  return canvasTex(1024, 512, (x) => {
    x.fillStyle = glow ? '#000' : '#1f2f5a'; x.fillRect(0, 0, 1024, 512)
    if (!glow) {
      x.fillStyle = '#e2b25a'; x.fillRect(0, 392, 1024, 8); x.fillRect(0, 96, 1024, 5)
      x.font = 'bold 30px Georgia, serif'; x.textAlign = 'center'; x.fillText('LUFI  EXPRESS  ·  VOITURE-LITS', 512, 444)
      // les blasons entre les fenêtres
      for (const cx of [312, 712]) { x.beginPath(); x.arc(cx, 454, 14, 0, 6.3); x.lineWidth = 3; x.strokeStyle = '#e2b25a'; x.stroke() }
    }
    for (let i = 0; i < 5; i++) {
      const X = 52 + i * 190, Y = 150, W = 150, H = 190
      x.save(); rr(x, X, Y, W, H, 26); x.clip()
      if (glow) { x.fillStyle = '#ffd59a'; x.fillRect(X, Y, W, H) }
      else {
        const g = x.createLinearGradient(0, Y, 0, Y + H)
        g.addColorStop(0, '#f6d7a4'); g.addColorStop(1, '#e8a96a')
        x.fillStyle = g; x.fillRect(X, Y, W, H)
      }
      // les rideaux bordeaux, à demi tirés ; une lampe d'abat-jour au milieu
      x.fillStyle = glow ? '#2a1008' : '#8e2f3a'
      x.fillRect(X, Y, W * (0.28 + (i % 3) * 0.06), H); x.fillRect(X + W * (0.74 - (i % 2) * 0.08), Y, W, H)
      x.fillStyle = glow ? '#3a1a0a' : '#7a3528'; x.fillRect(X, Y + H - 34, W, 34)
      x.fillStyle = glow ? '#fff2c0' : '#ffe9b0'; x.beginPath(); x.ellipse(X + W / 2, Y + H - 52, 16, 12, 0, 0, 6.3); x.fill()
      x.restore()
      if (!glow) { x.lineWidth = 6; x.strokeStyle = '#e2b25a'; rr(x, X, Y, W, H, 26); x.stroke() }
    }
  }, undefined, glow ? 0.5 : 0.67) // la voiture voisine, vue de loin derrière le mur : 100 texels par mètre suffisent
}

/** Le chalet : bois blond, fenêtres à croisillons et volets verts (et leurs vitres qui s'allument). */
function chaletFront(glow: boolean) {
  return canvasTex(256, 256, (x) => {
    x.fillStyle = glow ? '#000' : '#c08a5a'; x.fillRect(0, 0, 256, 256)
    if (!glow) for (let y = 0; y < 256; y += 18) { x.fillStyle = 'rgba(90,50,30,.25)'; x.fillRect(0, y, 256, 3) }
    for (const X of [40, 150]) {
      if (!glow) { x.fillStyle = '#3f7a5a'; x.fillRect(X - 22, 90, 18, 70); x.fillRect(X + 70, 90, 18, 70) }
      x.fillStyle = glow ? '#ffcf86' : '#f2d9a6'; x.fillRect(X, 92, 66, 66)
      x.fillStyle = glow ? '#000' : '#5a3a26'; x.fillRect(X + 30, 92, 6, 66); x.fillRect(X, 122, 66, 6)
    }
    if (!glow) { x.fillStyle = '#d9536a'; for (const X of [40, 150]) for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(X + 6 + k * 11, 170, 6, 0, 6.3); x.fill() } }
  })
}

const carSideTex = carSide(false), carGlowTex = carSide(true)
const chaletTex = chaletFront(false), chaletGlowTex = chaletFront(true)

/** Le fondu de la voie : étiré le long de x (la voie part à gauche et à droite), plus court vers l'avant. */
const out = <T extends MeshStandardMaterial>(m: T, snow?: [number, number?, number?]) => {
  if (snow) snowTop(m, ...snow)
  return skyFade(m, { c: [0, 0], r0: 8, r1: 12.5, sx: 1.7, sz: 1.05 })
}

/** La voiture suivante : son toit reçoit la neige. */
const car = <T extends MeshStandardMaterial>(m: T) => out(m, [1, 0.45, 0.85])

/** Les Alpes lointaines (grands écrans) : un fondu large, des couleurs par sommet (roche bleutée, neige au sommet). */
export const alps = skyFade(far(0xffffff, { vertexColors: true, roughness: 0.85, clearcoat: 0 }), { c: [0, 0], r0: 9.5, r1: 17.5, sx: 1.4, sz: 1.3 })

export const meadow = meadowTex
export const gravel = gravelTex
meadow.wrapS = meadow.wrapT = RepeatWrapping
// le pré fait 48 × 26 m : une tuile tous les 3 m
meadow.repeat.set(16, 26 / 3)
gravel.wrapS = gravel.wrapT = RepeatWrapping

export const R = {
  meadow: out(far(0xffffff, { map: meadowTex, roughness: 0.92, clearcoat: 0 }), [1, 0.4, 0.8]),
  gravel: out(far(0xffffff, { map: gravelTex, roughness: 0.9, clearcoat: 0 }), [0.9, 0.4, 0.8]),
  rail: out(far(0xb8bcc6, { roughness: 0.25, clearcoat: 0.8, metalness: 0.3 })),
  railFoot: out(far(0x5a4a44, { roughness: 0.7 })),
  sleeper: out(far(0x6a4a3a, { roughness: 0.85, clearcoat: 0.05 }), [0.7, 0.5, 0.85]),
  pole: out(far(0x7a5a44, { roughness: 0.8, clearcoat: 0.05 }), [0.8, 0.5, 0.85]),
  insulator: out(far(0x7fc8b8, { roughness: 0.15, clearcoat: 1 })),
  wire: out(far(0x3a3236, { roughness: 0.5 })),
  fence: out(far(0xb08a66, { roughness: 0.8, clearcoat: 0.05 }), [0.8, 0.5, 0.85]),
  fir: out(far(0x3f8a66, { roughness: 0.6, clearcoat: 0.2 }), [0.85, 0.4, 0.8]),
  trunk: out(far(0x6a4632, { roughness: 0.8 })),
  snowCap: out(far(0xf3f7ff, { roughness: 0.5, clearcoat: 0.3 })),
  bush: out(farLeafy(0x5f9a5a), [0.8, 0.4, 0.8]),
  rock: out(far(0xa8a4a8, { roughness: 0.75, clearcoat: 0.1 }), [0.9, 0.4, 0.8]),
  hill: out(far(0x7fae72, { roughness: 0.9, clearcoat: 0 }), [1, 0.35, 0.75]),
  /** Les fleurs du talus, teintées une à une (Batch). */
  petal: out(far(0xffffff, { roughness: 0.5, clearcoat: 0.3 })),
  stem: out(far(0x5a8a4a, { roughness: 0.7 })),
  white: out(far(0xf4f0e8, { roughness: 0.5, clearcoat: 0.3 }), [0.6, 0.5, 0.85]),
  black: out(far(0x2a2730, { roughness: 0.5, clearcoat: 0.3 })),
  // la voiture suivante
  livery: car(far(0x1f2f5a, { roughness: 0.35, clearcoat: 0.8 })),
  carSide: car(far(0xffffff, { map: carSideTex, emissiveMap: carGlowTex, emissive: 0xffc070, emissiveIntensity: 0, roughness: 0.35, clearcoat: 0.8 })),
  carGold: car(far(0xe2b25a, { roughness: 0.3, clearcoat: 0.9 })),
  carIron: car(far(0x2a2730, { roughness: 0.5, clearcoat: 0.3 })),
  roof: car(far(0x6f7484, { roughness: 0.5, clearcoat: 0.4 })),
  gold: out(far(0xe2b25a, { roughness: 0.3, clearcoat: 0.9 })),
  iron: out(far(0x2a2730, { roughness: 0.5, clearcoat: 0.3 })),
  bellows: car(far(0x3a3640, { roughness: 0.85 })),
  // le chalet
  chalet: out(far(0xffffff, { map: chaletTex, emissiveMap: chaletGlowTex, emissive: 0xffb860, emissiveIntensity: 0, roughness: 0.75, clearcoat: 0.05 })),
  wood: out(far(0xb07a4c, { roughness: 0.8, clearcoat: 0.05 })),
  chaletRoof: out(far(0x7a4a3a, { roughness: 0.7, clearcoat: 0.1 }), [1, 0.3, 0.7]),
  stone: out(far(0xb8b0a8, { roughness: 0.8 }), [0.8, 0.5, 0.85]),
  // le signal : sa lentille verte s'allume le soir
  lens: out(far(0x5adf9a, { roughness: 0.2, clearcoat: 1, emissive: 0x40ff90, emissiveIntensity: 0.3 })),
  lensRed: out(far(0x8a3a3a, { roughness: 0.2, clearcoat: 1 })),
  glow: new SpriteMaterial({ map: glowTex, color: 0x7dffb0, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}
