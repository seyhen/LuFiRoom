import { MeshStandardMaterial, RepeatWrapping } from 'three'
import { far } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'

// Les matériaux des toits de Paris autour de l'atelier : pierre de taille crème, zinc bleuté à joints debout, mitrons de terre
// cuite, fer forgé noir des balcons. Les fenêtres s'allument le soir ; tout se fond dans le ciel vers le bas et sur les bords.

/** Une façade haussmannienne : 4 travées sur 2 étages (6,9 × 6,4 m), pierre à joints, hautes portes-fenêtres et garde-corps. */
function facade(stone: string, seed: number, glow: boolean) {
  return canvasTex(768, 712, (x) => {
    const r = seeded(seed), W = 768, H = 712, bay = W / 4, floor = H / 2
    x.fillStyle = glow ? '#000' : stone; x.fillRect(0, 0, W, H)
    if (!glow) {
      for (let y = 0; y < H; y += 26) { x.fillStyle = 'rgba(120,100,80,.12)'; x.fillRect(0, y, W, 2) }
      for (let j = 0; j < 2; j++) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, j * floor + floor - 18, W, 10); x.fillStyle = 'rgba(120,100,80,.18)'; x.fillRect(0, j * floor + floor - 8, W, 3) }
    }
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
      const X = i * bay + bay / 2 - 38, Y = j * floor + 40, w = 76, h = 236, on = r() < 0.5, warm = r() < 0.75
      if (glow) {
        if (on) { x.fillStyle = warm ? '#ffd08a' : '#d8e4ff'; x.fillRect(X + 6, Y + 6, w - 12, h - 12); x.fillStyle = '#000'; x.fillRect(X + w / 2 - 2, Y, 4, h); x.fillRect(X, Y + h * 0.35, w, 4) }
        continue
      }
      x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(X - 10, Y - 14, w + 20, 10) // corniche de fenêtre
      x.fillStyle = '#f4efe6'; x.fillRect(X, Y, w, h)
      x.fillStyle = on ? '#e9c088' : '#56677e'; x.fillRect(X + 6, Y + 6, w - 12, h - 12)
      x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(X + 9, Y + 9, 12, h - 18)
      x.fillStyle = '#f4efe6'; x.fillRect(X + w / 2 - 2, Y, 4, h); x.fillRect(X, Y + h * 0.35, w, 4); x.fillRect(X, Y + h * 0.68, w, 4)
      // le garde-corps de fer forgé, à volutes
      x.strokeStyle = '#26262c'; x.lineWidth = 3
      x.strokeRect(X - 4, Y + h - 62, w + 8, 56)
      for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(X + 10 + k * 19, Y + h - 34, 8, 0, 6.3); x.stroke() }
    }
  }, undefined, glow ? 0.5 : 0.67) // vue de loin : 74 texels par mètre suffisent (la carte des vitres allumées, 1 sur 2)
}

/** Le zinc à joints debout : des bandes bleu-gris, une nervure claire tous les 45 cm. */
const zincTex = canvasTex(256, 64, (x) => {
  x.fillStyle = '#8f9aa8'; x.fillRect(0, 0, 256, 64)
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)'; x.fillRect(i * 32, 0, 32, 64)
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(i * 32, 0, 3, 64)
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(i * 32 + 3, 0, 2, 64)
  }
}, [1, 1])
zincTex.wrapS = zincTex.wrapT = RepeatWrapping

const stones = [
  [facade('#e9dcc4', 4, false), facade('#e9dcc4', 4, true)],
  [facade('#ecd9bc', 9, false), facade('#ecd9bc', 9, true)],
  [facade('#e2d6c6', 15, false), facade('#e2d6c6', 15, true)],
] as const
for (const pair of stones) for (const t of pair) t.wrapS = t.wrapT = RepeatWrapping

const out = <T extends MeshStandardMaterial>(m: T, snow?: [number, number?, number?]) => {
  if (snow) snowTop(m, ...snow)
  return skyFade(m, { c: [0, 0], r0: 7.5, r1: 12.5, below: -4.6 })
}

export const P = {
  facade: stones.map(([map, glow]) => out(far(0xffffff, { map, emissiveMap: glow, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.8, clearcoat: 0.04 }))),
  stone: [out(far(0xe9dcc4, { roughness: 0.8 })), out(far(0xecd9bc, { roughness: 0.8 })), out(far(0xe2d6c6, { roughness: 0.8 }))],
  trim: out(far(0xf4ede0, { roughness: 0.6 }), [0.9, 0.45, 0.8]),
  zinc: out(far(0xffffff, { map: zincTex, roughness: 0.38, clearcoat: 0.6, metalness: 0.15 }), [1, 0.3, 0.7]),
  zincFlat: out(far(0x8f9aa8, { roughness: 0.4, clearcoat: 0.5, metalness: 0.15 }), [1, 0.35, 0.75]),
  iron: out(far(0x26262c, { roughness: 0.4, clearcoat: 0.5 }), [0.5, 0.6, 0.9]),
  plaster: out(far(0xe6c9a4, { roughness: 0.85 }), [0.9, 0.45, 0.8]),
  pot: out(far(0xc7703e, { roughness: 0.6 }), [0.9, 0.45, 0.85]),
  dormerGlass: out(far(0x5a6a80, { roughness: 0.15, clearcoat: 1, emissive: 0xffc888, emissiveIntensity: 0 })),
  leaf: out(far(0x5a9a68, { roughness: 0.6 }), [0.7, 0.45, 0.85]),
  geranium: out(far(0xe0586e, { roughness: 0.5, clearcoat: 0.3 })),
  antenna: out(far(0x9aa2ae, { roughness: 0.35, clearcoat: 0.6 })),
}
