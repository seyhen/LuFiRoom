import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, type Material } from 'three'
import { far, skin } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { farStone } from '../../nature/materials'
import { glowTex } from '../../textures'

// Le fond de la mer autour du sous-marin : sable ridé, roches, coraux, éponges, kelp, poissons, baleine. Tout se perd dans le
// bleu-vert de l'eau avec la distance (le ciel de la pièce est l'eau) et vers le bas.

const F = { c: [0, 0] as [number, number], r0: 6.5, r1: 12, below: -5.2 }

/** Le sable : des rides parallèles, quelques coquillages et cailloux. */
const sandTex = canvasTex(256, 256, (x) => {
  const r = seeded(17)
  x.fillStyle = '#d8c8a0'; x.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 256; y += 14) {
    x.strokeStyle = 'rgba(150,130,90,.25)'; x.lineWidth = 3
    x.beginPath(); for (let X = 0; X <= 256; X += 8) { const Y = y + Math.sin(X * 0.05 + y) * 3; X ? x.lineTo(X, Y) : x.moveTo(X, Y) } x.stroke()
    x.strokeStyle = 'rgba(255,250,230,.3)'; x.lineWidth = 2
    x.beginPath(); for (let X = 0; X <= 256; X += 8) { const Y = y + 4 + Math.sin(X * 0.05 + y) * 3; X ? x.lineTo(X, Y) : x.moveTo(X, Y) } x.stroke()
  }
  for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,240,220,.7)' : 'rgba(120,110,90,.4)'; x.beginPath(); x.arc(r() * 256, r() * 256, 1.5 + r() * 2, 0, 6.3); x.fill() }
}, [1, 1])
sandTex.wrapS = sandTex.wrapT = RepeatWrapping

/** Les reflets de surface qui dansent sur le sable (caustiques) : un réseau de lignes claires, additif. */
const causticTex = canvasTex(256, 256, (x) => {
  const r = seeded(23)
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256)
  // un trait épais et flou, peu contrasté : les caustiques fines se lisaient comme des gribouillis sur le sable
  x.strokeStyle = 'rgba(255,255,255,.42)'; x.lineWidth = 4.2; x.shadowColor = 'rgba(255,255,255,.7)'; x.shadowBlur = 9
  for (let i = 0; i < 24; i++) {
    const cx = r() * 256, cy = r() * 256, rr = 14 + r() * 22
    x.beginPath()
    for (let k = 0; k <= 7; k++) { const a = (k / 7) * 6.3, d = rr * (0.8 + r() * 0.4); k ? x.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d) : x.moveTo(cx + d, cy) }
    x.stroke()
  }
}, [1, 1])
causticTex.wrapS = causticTex.wrapT = RepeatWrapping

/** Le courant : le temps, lu par le kelp et les éventails de corail. <Surroundings> le tient à jour. */
export const CURRENT = { uTime: { value: 0 } }

/** Fait onduler un matériau dans le courant : plus le sommet est haut le long de la tige (uv.y), plus il bouge. */
export function current<T extends Material>(m: T, amp = 0.25): T {
  const prev = m.onBeforeCompile
  m.onBeforeCompile = (sh, r) => {
    prev.call(m, sh, r)
    sh.uniforms.uTime = CURRENT.uTime
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'uniform float uTime;\nvoid main() {')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec4 wp_ = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
          wp_ = instanceMatrix * wp_;
          #endif
          float k = pow(clamp(uv.y, 0.0, 1.0), 1.4) * ${amp.toFixed(3)};
          float ph = uTime * 0.9 + wp_.x * 0.6 + wp_.z * 0.4;
          transformed.x += sin(ph) * k;
          transformed.z += cos(ph * 0.8 + 1.0) * k * 0.7;
        }`,
      )
  }
  const key = m.customProgramCacheKey
  m.customProgramCacheKey = () => `${key.call(m)}current${amp}`
  return m
}

const corals = new Map<number, MeshStandardMaterial>()
/** Le matériau d'un massif de corail branchu, à sa couleur (un par couleur : fusionnés par <Static>). */
export const coralOf = (c: number) => {
  let m = corals.get(c)
  if (!m) corals.set(c, (m = skyFade(far(c, { roughness: 0.5, clearcoat: 0.4 }), F)))
  return m
}

export const sand = sandTex
export const caustic = causticTex

const out = <T extends MeshStandardMaterial>(m: T) => skyFade(m, F)

export const D = {
  sand: out(far(0xffffff, { map: sandTex, vertexColors: true, roughness: 0.9, clearcoat: 0 })),
  caustic: skyFade(new MeshBasicMaterial({ map: causticTex, transparent: true, opacity: 0.25, depthWrite: false, blending: AdditiveBlending }), { ...F, additive: true }),
  rock: [out(farStone(0x6a7a7c)), out(farStone(0x56686c))],
  // les coraux, teintés un à un (Batch) ou en couleurs franches
  coral: out(far(0xffffff, { roughness: 0.5, clearcoat: 0.4 })),
  brain: out(far(0xe8a86a, { roughness: 0.6, clearcoat: 0.3 })),
  sponge: out(far(0xb07ad0, { roughness: 0.7, clearcoat: 0.2 })),
  fan: current(out(far(0xe86a7a, { roughness: 0.6, clearcoat: 0.2, side: DoubleSide })), 0.08),
  anemone: current(out(far(0xffffff, { roughness: 0.4, clearcoat: 0.5 })), 0.06),
  star: out(far(0xf08a3c, { roughness: 0.5, clearcoat: 0.5 })),
  kelp: current(out(far(0x6a8a3a, { roughness: 0.6, clearcoat: 0.3, side: DoubleSide })), 0.6),
  kelpDark: current(out(far(0x4f7030, { roughness: 0.6, clearcoat: 0.3, side: DoubleSide })), 0.6),
  fish: out(far(0xffffff, { vertexColors: true, roughness: 0.4, clearcoat: 0.6 })),
  whale: out(skin({ roughness: 0.5, clearcoat: 0.4 })),
  // dehors de la coque : hélice, projecteur
  brass: out(far(0xc99a5a, { roughness: 0.35, clearcoat: 0.8 })),
  hull: out(far(0x37505a, { roughness: 0.5, clearcoat: 0.45 })),
  lens: out(far(0xfff4d8, { roughness: 0.1, clearcoat: 1, emissive: 0xffe2a0, emissiveIntensity: 0.3 })),
  beam: new MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }),
  ray: new MeshBasicMaterial({ color: 0xeafff8, vertexColors: true, transparent: true, opacity: 0.1, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }),
  // les méduses : cloche et halo additifs, qui s'éteignent vers le noir avec la distance
  jelly: [0x7ff0ff, 0xff9ad8, 0xc0a0ff].map((c) => skyFade(new MeshBasicMaterial({ color: c, transparent: true, opacity: 0.4, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }), { ...F, additive: true })),
  jellyGlow: [0x7ff0ff, 0xff9ad8, 0xc0a0ff].map((c) => skyFade(new MeshBasicMaterial({ map: glowTex, color: c, transparent: true, opacity: 0.3, depthWrite: false, blending: AdditiveBlending }), { ...F, additive: true })),
  bubble: new MeshBasicMaterial({ color: 0xeafffa, transparent: true, opacity: 0.55, depthWrite: false }),
}
