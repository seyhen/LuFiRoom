import { AdditiveBlending, MeshStandardMaterial, SpriteMaterial } from 'three'
import { far } from '../../materials'
import { canvasTex, rr, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { glowTex } from '../../textures'
import { farFoliage } from '../../nature/materials'

// Les matériaux des immeubles autour du toit : façades de brique à fenêtres à guillotine (et leurs vitres qui s'allument le soir),
// toits de bitume, climatiseurs, verrière, panneau publicitaire. Tout descend dans le ciel : les façades se fondent vers le bas.

/** Une façade : 3 travées sur 3 étages (6,9 × 7,8 m), briques, linteaux clairs, fenêtres à guillotine ; `glow` : les vitres allumées. */
function facade(brick: string, seed: number, glow: boolean) {
  return canvasTex(768, 864, (x) => {
    const r = seeded(seed), W = 768, H = 864, bay = W / 3, floor = H / 3
    x.fillStyle = glow ? '#000' : brick; x.fillRect(0, 0, W, H)
    if (!glow) {
      // les rangs de briques
      for (let y = 0; y < H; y += 9) {
        x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, y, W, 1.5)
        for (let k = (y / 9) % 2 ? 0 : 11; k < W; k += 22) { x.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},.05)`; x.fillRect(k, y + 1.5, 20, 7.5) }
      }
      // le bandeau de pierre à chaque étage
      for (let j = 0; j < 3; j++) { x.fillStyle = 'rgba(232,220,200,.75)'; x.fillRect(0, j * floor + floor - 14, W, 8) }
    }
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const X = i * bay + bay / 2 - 50, Y = j * floor + 70, w = 100, h = 150, on = r() < 0.45, warm = r() < 0.7
      if (glow) {
        if (on) {
          x.fillStyle = warm ? '#ffcf86' : '#cfe0ff'; x.fillRect(X + 6, Y + 6, w - 12, h - 12)
          // un store à demi baissé, un rideau
          x.fillStyle = '#000'; x.fillRect(X + 6, Y + 6, w - 12, 18 + r() * 40); x.fillRect(X + w / 2 - 2, Y, 4, h)
        }
        continue
      }
      x.fillStyle = '#e8dcc8'; x.fillRect(X - 10, Y - 16, w + 20, 14) // linteau
      x.fillStyle = '#d8ccb6'; x.fillRect(X - 8, Y + h, w + 16, 10) // appui
      x.fillStyle = '#f2ece0'; x.fillRect(X, Y, w, h) // dormant
      x.fillStyle = on ? '#e8b878' : '#3a4258'; x.fillRect(X + 6, Y + 6, w - 12, h - 12)
      x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(X + 8, Y + 8, 20, h - 16)
      x.fillStyle = '#f2ece0'; x.fillRect(X, Y + h / 2 - 3, w, 6); x.fillRect(X + w / 2 - 2, Y, 4, h)
      if (r() < 0.25) { x.fillStyle = '#5a8a5a'; rr(x, X - 4, Y + h - 22, w + 8, 20, 6); x.fill() } // une jardinière
    }
  }, undefined, glow ? 0.5 : 0.67) // vue de loin : 74 texels par mètre suffisent (la carte des vitres allumées, 1 sur 2)
}

/** Le panneau publicitaire : une grande tasse fumante et « COFFEE · day & night », couleurs d'affiche passée. */
const billboardTex = canvasTex(768, 336, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 336)
  g.addColorStop(0, '#f6d9a8'); g.addColorStop(1, '#eeb88a')
  x.fillStyle = g; x.fillRect(0, 0, 768, 336)
  x.fillStyle = '#c8553d'; x.fillRect(0, 290, 768, 46)
  // la tasse
  x.fillStyle = '#fbf3e4'; rr(x, 70, 120, 170, 140, 30); x.fill()
  x.strokeStyle = '#fbf3e4'; x.lineWidth = 22; x.beginPath(); x.arc(245, 185, 38, -1.2, 1.2); x.stroke()
  x.fillStyle = '#6a3a2a'; x.beginPath(); x.ellipse(155, 124, 78, 16, 0, 0, 6.3); x.fill()
  x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 9; x.lineCap = 'round'
  for (const dx of [125, 160, 195]) { x.beginPath(); x.moveTo(dx, 100); x.bezierCurveTo(dx - 20, 70, dx + 20, 50, dx, 20); x.stroke() }
  x.fillStyle = '#2f5a6a'; x.font = 'bold 96px Georgia, serif'; x.textAlign = 'left'; x.fillText('COFFEE', 312, 200)
  x.fillStyle = '#c8553d'; x.font = 'italic 44px Georgia, serif'; x.fillText('day & night', 360, 258)
  x.fillStyle = '#fbf3e4'; x.font = 'bold 28px Georgia, serif'; x.textAlign = 'center'; x.fillText('B R O O K L Y N   ·   S I N C E   1 9 5 2', 384, 323)
})

const bricks = [
  [facade('#9a5444', 3, false), facade('#9a5444', 3, true)],
  [facade('#b9906a', 7, false), facade('#b9906a', 7, true)],
  [facade('#8a6a72', 11, false), facade('#8a6a72', 11, true)],
] as const

const out = <T extends MeshStandardMaterial>(m: T, snow?: [number, number?, number?]) => {
  if (snow) snowTop(m, ...snow)
  return skyFade(m, { c: [0, 0], r0: 7.5, r1: 12.5, below: -4.2 })
}

export const O = {
  /** Les façades : notre immeuble (brique rouge), le voisin de droite (brique blonde), celui de gauche (brique prune). */
  facade: bricks.map(([map, glow]) => out(far(0xffffff, { map, emissiveMap: glow, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.82, clearcoat: 0.04 }))),
  brick: [out(far(0x9a5444, { roughness: 0.85 })), out(far(0xb9906a, { roughness: 0.85 })), out(far(0x8a6a72, { roughness: 0.85 }))],
  coping: out(far(0xd8ccb8, { roughness: 0.6 }), [1, 0.45, 0.8]),
  tar: out(far(0x58525a, { roughness: 0.9, clearcoat: 0 }), [1, 0.4, 0.8]),
  steel: out(far(0x2e2c34, { roughness: 0.45, clearcoat: 0.4 }), [0.7, 0.55, 0.9]),
  metal: out(far(0xb8bec8, { roughness: 0.35, clearcoat: 0.6 }), [0.9, 0.45, 0.85]),
  metalDark: out(far(0x7a808c, { roughness: 0.4, clearcoat: 0.5 })),
  glass: out(far(0x9fc4d8, { roughness: 0.1, clearcoat: 1, emissive: 0xffc480, emissiveIntensity: 0 }), [0.8, 0.45, 0.85]),
  rust: out(far(0xb4573a, { roughness: 0.7 })),
  wood: out(far(0x8a6448, { roughness: 0.8 }), [0.8, 0.5, 0.85]),
  terracotta: out(far(0xc8704e, { roughness: 0.7 }), [0.9, 0.45, 0.85]),
  /** Les plants du potager d'en face : du vrai feuillage (`Foliage`), pas des boules. */
  leaf: out(farFoliage(0x6aa060), [0.7, 0.45, 0.85]),
  soil: out(far(0x5a4034, { roughness: 0.95, clearcoat: 0 }), [1, 0.4, 0.8]),
  tomato: out(far(0xd9483a, { roughness: 0.3, clearcoat: 0.8 })),
  billboard: out(far(0xffffff, { map: billboardTex, roughness: 0.6, clearcoat: 0.1, emissive: 0xffffff, emissiveMap: billboardTex, emissiveIntensity: 0 })),
  lampHead: out(far(0x2e2c34, { roughness: 0.4, clearcoat: 0.5 })),
  bulb: out(far(0xfff1c8, { roughness: 0.2, emissive: 0xffd080, emissiveIntensity: 0.2 })),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffcf80, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}
