import { DoubleSide, RepeatWrapping } from 'three'
import { far } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'

// Les matériaux de l'habillage des toits (zinc à joints debout bien visibles, linge, potager, verrière) et ceux du décor lointain
// (toits à 13 à 17 m du centre : leur propre fondu, plus large, et des teintes pâles).

const NEAR = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5, below: -4.6 }
const FAR = { c: [0, 0] as [number, number], r0: 9.5, r1: 17.5, below: -4.6 }

/** Un pan de zinc : 8 bandes de 45 cm (3,6 m), nervure claire et ombre sombre bien marquées, agrafes décalées, patine. 3,6 × 1,8 m. */
function seams(base: string, light: string, dark: string, seed: number) {
  const t = canvasTex(512, 256, (x) => {
    const r = seeded(seed)
    x.fillStyle = base; x.fillRect(0, 0, 512, 256)
    for (let i = 0; i < 8; i++) {
      x.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'; x.fillRect(i * 64, 0, 64, 256)
      // la patine : des coulures sombres le long de la bande
      for (let k = 0; k < 3; k++) { x.fillStyle = `rgba(40,50,64,${0.05 + r() * 0.06})`; x.fillRect(i * 64 + 8 + r() * 40, r() * 120, 3 + r() * 5, 60 + r() * 130) }
      // les agrafes : un joint à plat, décalé d'une bande sur l'autre
      const y = i % 2 ? 128 : 0
      x.fillStyle = 'rgba(30,40,56,.28)'; x.fillRect(i * 64 + 6, y, 52, 3)
      x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(i * 64 + 6, y + 3, 52, 2)
    }
    for (let i = 0; i < 8; i++) {
      x.fillStyle = dark; x.fillRect(i * 64 + 7, 0, 7, 256)
      x.fillStyle = light; x.fillRect(i * 64, 0, 7, 256)
    }
  })
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

/** La verrière : des petits carreaux et des fers (une carte de la lumière du soir, carreaux seuls). */
function glassTex(glow: boolean) {
  const t = canvasTex(256, 192, (x) => {
    x.fillStyle = glow ? '#ffcf8a' : '#9db9cc'; x.fillRect(0, 0, 256, 192)
    if (!glow) { x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.moveTo(30, 0); x.lineTo(90, 0); x.lineTo(40, 192); x.lineTo(0, 192); x.fill() }
    x.fillStyle = glow ? '#000' : '#2a2f38'
    for (let i = 0; i <= 6; i++) x.fillRect(i * (256 / 6) - 3, 0, 6, 192)
    for (let j = 0; j <= 3; j++) x.fillRect(0, j * (192 / 3) - 3, 256, 6)
  })
  return t
}

function farWall(stone: string, seed: number, glow = false) {
  const t = canvasTex(128, 128, (x) => {
    const r = seeded(seed)
    x.fillStyle = glow ? '#000' : stone; x.fillRect(0, 0, 128, 128)
    if (!glow) {
      for (let y = 0; y < 128; y += 16) { x.fillStyle = 'rgba(120,100,80,.12)'; x.fillRect(0, y, 128, 2) }
      x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, 112, 128, 8)
    }
    for (let i = 0; i < 2; i++) {
      const X = 14 + i * 64, on = r() < 0.65
      if (glow) {
        if (on) { x.fillStyle = '#ffd08a'; x.fillRect(X + 4, 16, 28, 72); x.fillStyle = '#000'; x.fillRect(X + 16, 16, 3, 72); x.fillRect(X + 4, 44, 28, 3) }
        continue
      }
      x.fillStyle = '#efe8dc'; x.fillRect(X, 12, 36, 80)
      x.fillStyle = on ? '#d9b98c' : '#7f93ae'; x.fillRect(X + 4, 16, 28, 72)
      x.fillStyle = '#efe8dc'; x.fillRect(X + 16, 16, 3, 72); x.fillRect(X + 4, 44, 28, 3)
      // l'appui de fenêtre : une tablette de pierre claire sous la vitre (elle barrait la vitre d'un trait sombre à y = 74)
      x.fillStyle = '#f6f0e4'; x.fillRect(X - 3, 92, 42, 4)
      x.fillStyle = 'rgba(90,76,60,.22)'; x.fillRect(X - 3, 96, 42, 2)
    }
  })
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

const seamNear = seams('#8d99a9', '#e2e9f1', '#46505f', 3)
const seamFar = seams('#b4c2d6', '#eef3fa', '#8393ab', 5)
const glassMap = glassTex(false), glassGlow = glassTex(true)
const wall0 = farWall('#dfdcd6', 2), wall1 = farWall('#e2dacb', 6)
const glow0 = farWall('', 2, true), glow1 = farWall('', 6, true)

export const R = {
  /** Le terrasson de zinc à joints debout, posé sur le toit lisse des voisins. */
  seam: skyFade(far(0xffffff, { map: seamNear, roughness: 0.4, clearcoat: 0.5, metalness: 0.12 }), NEAR),
  glass: skyFade(far(0xffffff, { map: glassMap, emissiveMap: glassGlow, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.1, clearcoat: 1, side: DoubleSide }), NEAR),
  dish: skyFade(far(0xc9d1db, { roughness: 0.45, clearcoat: 0.5, side: DoubleSide }), NEAR),
  dishOut: skyFade(far(0xf3eee2, { roughness: 0.4, clearcoat: 0.6, side: DoubleSide }), NEAR),
  dishIn: skyFade(far(0x7d8ba0, { roughness: 0.5, clearcoat: 0.3, side: DoubleSide }), NEAR),
  lnb: skyFade(far(0xd9453b, { roughness: 0.5, clearcoat: 0.4 }), NEAR),
  post: skyFade(far(0xc99466, { roughness: 0.65, clearcoat: 0.2 }), NEAR),
  wood: skyFade(far(0xb9855a, { roughness: 0.7 }), NEAR),
  soil: skyFade(far(0x4a362a, { roughness: 0.95 }), NEAR),
  tomato: skyFade(far(0xd9453b, { roughness: 0.45, clearcoat: 0.4 }), NEAR),
  lettuce: skyFade(far(0x86b86a, { roughness: 0.6 }), NEAR),
  pigeon: skyFade(far(0x9aa0aa, { roughness: 0.7 }), NEAR),
  pigeonNeck: skyFade(far(0x6f7fa0, { roughness: 0.35, clearcoat: 0.5 }), NEAR),
  beak: skyFade(far(0xe3a5a0, { roughness: 0.6 }), NEAR),
  cloth: [0xf6f1e6, 0x7fb0c8, 0xe58a8a, 0xf0d27a, 0xa9c9a0].map((c) => skyFade(far(c, { roughness: 0.9, side: DoubleSide }), NEAR)),
  // le décor lointain
  farWall: [[wall0, glow0], [wall1, glow1]].map(([map, em]) => skyFade(far(0xeef2ff, { map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.85 }), FAR)),
  farStone: skyFade(far(0xe4dacb, { roughness: 0.85 }), FAR),
  farTrim: skyFade(far(0xf2ece1, { roughness: 0.7 }), FAR),
  farZinc: skyFade(far(0xe6eeff, { map: seamFar, roughness: 0.4, clearcoat: 0.4, metalness: 0.1 }), FAR),
  farPot: skyFade(far(0xc98a64, { roughness: 0.65 }), FAR),
  farPlaster: skyFade(far(0xe3cdb0, { roughness: 0.85 }), FAR),
  farGlass: skyFade(far(0x8296b4, { roughness: 0.2, clearcoat: 0.8, emissive: 0xffd49a, emissiveIntensity: 0 }), FAR),
}
