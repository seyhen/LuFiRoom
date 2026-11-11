import { AdditiveBlending, DoubleSide, MeshBasicMaterial } from 'three'
import { far } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { farStone } from '../../nature/materials'
import { glowTex, knitTex } from '../../textures'
import { barkTex, ringsTex } from '../textures'

// Les matériaux de la clairière : neige, sapins, bois de l'abri, glace de la mare, bonhomme de neige, luge, lanterne.
// Tout ce qui est loin se fond dans le ciel (`skyFade`), autour du milieu de la cabane.

/** Le grain de la neige : quelques rides de vent bleutées et des paillettes. */
const snowTex = canvasTex(256, 256, (x) => {
  const r = seeded(11)
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 256)
  x.lineCap = 'round'
  for (let i = 0; i < 26; i++) {
    const y = r() * 256, x0 = r() * 256, w = 40 + r() * 90
    x.strokeStyle = `rgba(150,175,220,${0.05 + r() * 0.06})`; x.lineWidth = 1.5 + r() * 2.5
    x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo(x0 + w / 2, y - 6 + r() * 12, x0 + w, y + r() * 6 - 3); x.stroke()
  }
  for (let i = 0; i < 220; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,1)' : `rgba(170,195,235,${0.15 + r() * 0.15})`
    x.fillRect(r() * 256, r() * 256, 1.5, 1.5)
  }
}, [1, 1])

/** La glace de la mare : bleu pâle, quelques traces de patins en boucle. */
const iceTex = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 20, 128, 128, 128)
  g.addColorStop(0, '#cfe4f4'); g.addColorStop(0.75, '#b5d3ec'); g.addColorStop(1, '#e8f2fb')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.6
  for (const [cx, cy, rx, ry, a] of [[118, 120, 70, 42, 0.3], [140, 136, 52, 66, -0.5], [126, 112, 34, 24, 1.1]]) {
    x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, Math.PI * 1.7); x.stroke()
  }
  x.strokeStyle = 'rgba(120,160,200,.25)'; x.lineWidth = 1
  for (const [x0, y0, x1, y1] of [[60, 90, 110, 130], [150, 60, 190, 110], [90, 180, 160, 170]]) { x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke() }
})

const knitScarf = knitTex.clone()
knitScarf.repeat.set(4, 1)

const out = <T extends Parameters<typeof skyFade>[0]>(m: T, r0 = 7.2, r1 = 12.5) => skyFade(m, { c: [0, 0], r0, r1 })

/** Le dehors lointain des grands écrans (les coins du haut sont à 13 à 18 du centre) : fondu large, teintes pâles. */
const wide = <T extends Parameters<typeof skyFade>[0]>(m: T) => out(m, 9.5, 17.5)

export const O = {
  // la neige de la clairière va plus loin que le reste : elle porte les sapins lointains
  snow: out(far(0xffffff, { map: snowTex, vertexColors: true, roughness: 0.62, clearcoat: 0.18, clearcoatRoughness: 0.5 }), 8.8, 16.5),
  /** La forêt lointaine : vert-bleu poudré, neige bleutée, troncs effacés. */
  farFir: wide(far(0x5d9a86, { roughness: 0.7, clearcoat: 0.1 })),
  farSnow: wide(far(0xe9f0fa, { roughness: 0.6, clearcoat: 0.15 })),
  farTrunk: wide(far(0x7a6a68, { roughness: 0.85 })),
  /** La neige des volumes (capuchons des sapins, toit de l'abri, poteaux) : blanc bleuté, un peu brillant. */
  snowCap: out(far(0xf3f7ff, { roughness: 0.5, clearcoat: 0.3 })),
  fir: out(far(0x3f8f6e, { roughness: 0.6, clearcoat: 0.2 })),
  firDark: out(far(0x2e7259, { roughness: 0.65, clearcoat: 0.15 })),
  trunk: out(far(0x7a5038, { roughness: 0.8, clearcoat: 0.05 })),
  bark: out(far(0xffffff, { map: barkTex, roughness: 0.78, clearcoat: 0.1 })),
  rings: out(far(0xffffff, { map: ringsTex, roughness: 0.65, clearcoat: 0.12 })),
  /** Planches de l'abri et de la barrière : bois gris argenté par l'hiver. */
  plank: out(far(0xa9876a, { roughness: 0.8, clearcoat: 0.06 })),
  plankDark: out(far(0x8a6a52, { roughness: 0.82, clearcoat: 0.05 })),
  iron: out(far(0x3d3438, { roughness: 0.45, clearcoat: 0.5 })),
  steel: out(far(0xc9cdd6, { roughness: 0.3, clearcoat: 0.8 })),
  ice: out(far(0xffffff, { map: iceTex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 })),
  reed: out(far(0xb08a5a, { roughness: 0.8 })),
  rock: out(farStone(0x9ea3b4)),
  // le bonhomme de neige
  snowball: out(far(0xfafcff, { roughness: 0.55, clearcoat: 0.25 })),
  coal: out(far(0x2e2a30, { roughness: 0.5, clearcoat: 0.4 })),
  carrot: out(far(0xf08a3c, { roughness: 0.5, clearcoat: 0.4 })),
  twig: out(far(0x6a4632, { roughness: 0.85 })),
  scarf: out(far(0xd25c72, { map: knitScarf, roughness: 0.85, clearcoat: 0.05 })),
  scarfCream: out(far(0xfff4e6, { roughness: 0.85, clearcoat: 0.05 })),
  // la luge et son paquet
  runner: out(far(0xc8414f, { roughness: 0.35, clearcoat: 0.8, side: DoubleSide })),
  slat: out(far(0xd4a06a, { roughness: 0.6, clearcoat: 0.3 })),
  rope: out(far(0xe7d3a8, { roughness: 0.9 })),
  giftGreen: out(far(0x3f9474, { roughness: 0.4, clearcoat: 0.7 })),
  ribbon: out(far(0xf4c75a, { roughness: 0.3, clearcoat: 0.9 })),
  // la lanterne : la vitre s'allume le soir (Surroundings)
  lanternGlass: out(far(0xfff0cc, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffb455, emissiveIntensity: 0.2 })),
  berry: out(far(0xc8414f, { roughness: 0.35, clearcoat: 0.8 })),
  holly: out(far(0x2f7d5d, { roughness: 0.4, clearcoat: 0.6 })),
  /** Les traces de pas, un peu plus bleues que la neige (pas de lumière : posées à plat). */
  print: new MeshBasicMaterial({ color: 0x9fb6dc, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  glow: new MeshBasicMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }),
}
