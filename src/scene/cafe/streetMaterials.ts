import { Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, type Material, type MeshPhysicalMaterial, type MeshPhysicalMaterialParameters } from 'three'
import { smooth } from '../../math'
import { gummy } from '../materials'
import { mood } from '../anim'
import { snowTop } from '../snowTop'
import { foliage } from '../nature/materials'
import { aboardTex, awningTex, bookbinderTex, brickTex, cobbleTex, flagTex, ghostTex, pubSignTex, sandTex, slateTex, streetFade } from './streetTex'

// Les matériaux du dehors : tout ce qui est autour du café (rue, façades voisines, toits). Chacun se fond dans la brume au loin
// (`outside`), la pierre fonce et brille quand il pleut (`useWetness` dans StreetWeather.tsx), les toits et les dalles reçoivent la neige.

/** La brume du dehors : sa couleur suit le fond du ciel (jour, nuit, pluie) ; `StreetWeather` la tient à jour. */
export const MIST = { uMist: { value: new Color(0xc3ccd6) }, uMistK: { value: 1 } }

/**
 * Prépare un matériau du dehors : il se mêle à la brume avec la distance au café (et avec la hauteur : le haut des façades
 * s'efface dans le ciel). Avec `snow`, il reçoit aussi la neige sur ce qui regarde le ciel (`snowTop`).
 */
export function outside<T extends Material>(m: T, snow?: [k?: number, from?: number, to?: number]): T {
  if (snow) snowTop(m, ...snow)
  const prev = m.onBeforeCompile, key = m.customProgramCacheKey()
  m.onBeforeCompile = (sh, r) => {
    prev.call(m, sh, r)
    sh.uniforms.uMist = MIST.uMist
    sh.uniforms.uMistK = MIST.uMistK
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'varying vec3 vMistP;\nvoid main() {')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 mistP_ = transformed;
        #ifdef USE_INSTANCING
        mistP_ = (instanceMatrix * vec4(transformed, 1.0)).xyz;
        #endif
        vMistP = mistP_;`,
      )
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform vec3 uMist;\nuniform float uMistK;\nvarying vec3 vMistP;\nvoid main() {')
      .replace(
        '#include <dithering_fragment>',
        `float mistD_ = length(vMistP.xz - vec2(-0.5, 0.3));
        float mistA_ = uMistK * (smoothstep(6.5, 14.0, mistD_) * 0.9 + smoothstep(6.0, 11.5, vMistP.y) * 0.45);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uMist, clamp(mistA_, 0.0, 0.95));
        #include <dithering_fragment>`,
      )
  }
  m.customProgramCacheKey = () => key + '|mist'
  return m
}

const stone = (o: MeshPhysicalMaterialParameters) => gummy(0xffffff, { roughness: 0.82, clearcoat: 0.06, clearcoatRoughness: 0.6, ...o })

/** Les pierres qui foncent et luisent sous la pluie : [matériau, couleur sèche, couleur mouillée, vernis sec, vernis mouillé]. */
export const WET: [MeshPhysicalMaterial, number, number, number, number][] = []
const wet = <T extends MeshPhysicalMaterial>(m: T, dry: number, soaked: number, coat = 0.06, coatWet = 0.7): T => {
  WET.push([m, dry, soaked, coat, coatWet])
  return m
}

/**
 * Les matériaux de la rue. `lit` : les vitres des fenêtres voisines, qui s'allument à des moments différents (leur seuil :
 * la nuit en allume de plus en plus, le jour sombre quelques-unes restent allumées).
 */
export const S = {
  cobble: outside(wet(stone({ map: cobbleTex, alphaMap: streetFade, transparent: true }), 0xffffff, 0x8e96a4, 0.1, 0.9), [0.8, 0.5, 0.85]),
  flag: outside(wet(stone({ map: flagTex }), 0xffffff, 0x929aa8, 0.1, 0.9), [0.9, 0.45, 0.8]),
  granite: outside(wet(gummy(0xa3a8b0, { roughness: 0.7, clearcoat: 0.12 }), 0xa3a8b0, 0x6f7886, 0.12, 0.9), [0.9, 0.45, 0.8]),
  sand: outside(wet(stone({ map: sandTex }), 0xffffff, 0xb5b8c0, 0.04, 0.5), [0.5, 0.55, 0.85]),
  brick: outside(wet(stone({ map: brickTex }), 0xffffff, 0xa8a8b4, 0.04, 0.5), [0.5, 0.55, 0.85]),
  slate: outside(wet(stone({ map: slateTex, roughness: 0.5, clearcoat: 0.3 }), 0xffffff, 0xaab0bc, 0.3, 0.9), [1, 0.35, 0.7]),
  /** Les corniches, appuis et chaînages de pierre claire. */
  trim: outside(wet(gummy(0xe4d6b8, { roughness: 0.8, clearcoat: 0.06 }), 0xe4d6b8, 0xb5b4b6, 0.06, 0.5), [0.8, 0.5, 0.85]),
  paint: outside(gummy(0xf0ebe0, { roughness: 0.55 })),
  oxblood: outside(gummy(0x6b2430, { roughness: 0.5 })),
  pubGreen: outside(gummy(0x234a3c, { roughness: 0.5 })),
  navy: outside(gummy(0x2a3a5c, { roughness: 0.5 })),
  mustard: outside(gummy(0xd2a03c)),
  iron: outside(gummy(0x2a2428, { roughness: 0.45, clearcoat: 0.5 }), [0.7, 0.5, 0.85]),
  brass: outside(gummy(0xd6a64a, { roughness: 0.3, clearcoat: 0.8, metalness: 0.4 })),
  post: outside(gummy(0xc22b33, { roughness: 0.4, clearcoat: 0.8 }), [0.8, 0.5, 0.85]),
  void: outside(gummy(0x100d12, { roughness: 0.6, clearcoat: 0.2 })),
  yellow: outside(gummy(0xd9b23a, { roughness: 0.6, clearcoat: 0.3 })),
  oak: outside(gummy(0xb07a52, { roughness: 0.5 })),
  teal: outside(gummy(0x37a3b5)),
  leaf: outside(gummy(0x4a8a5a, { roughness: 0.5 })),
  heather: outside(gummy(0xa8689a, { roughness: 0.7, clearcoat: 0.1 })),
  thistle: outside(gummy(0x9a6cc8, { roughness: 0.6 })),
  soil: outside(gummy(0x4a3a30, { roughness: 0.95, clearcoat: 0 })),
  tarp: outside(gummy(0x9fc4cf, { roughness: 0.25, clearcoat: 0.9, transparent: true, opacity: 0.8, side: DoubleSide })),
  awning: outside(gummy(0xffffff, { map: awningTex, roughness: 0.8, clearcoat: 0.05, side: DoubleSide }), [0.7, 0.5, 0.85]),
  fol: outside(foliage(0x62a070)),
  folDark: outside(foliage(0x3f7a56)),
  folHeather: outside(foliage(0xc088bb)),
  /** Blanc : la teinte vient de chaque copie (dos des livres). */
  tint: outside(gummy(0xffffff, { roughness: 0.7, clearcoat: 0.15 })),
  aboard: outside(new MeshStandardMaterial({ map: aboardTex, roughness: 0.85 })),
  signBook: outside(new MeshStandardMaterial({ map: bookbinderTex, roughness: 0.5 })),
  signPub: outside(new MeshStandardMaterial({ map: pubSignTex, roughness: 0.5, side: DoubleSide })),
  ghost: outside(new MeshStandardMaterial({ map: ghostTex, roughness: 0.9, transparent: true, depthWrite: false })),
  /** Verre éteint : le ciel gris et le café en face s'y reflètent. */
  dark: outside(gummy(0x45546a, { roughness: 0.12, clearcoat: 1, emissive: 0x6d86a6, emissiveIntensity: 0 })),
  lit: (() => {
    const mk = () => outside(new MeshStandardMaterial({ color: 0xffc77a, emissive: 0xffb45a, emissiveIntensity: 0, roughness: 0.5 }))
    const a = mk(), b = mk()
    return [{ th: 0.18, m: a }, { th: 0.5, m: b }, { th: 0.5, m: b }]
  })(),
  /** Le verre d'une lanterne, d'un lampadaire : éteint le jour, plein feu la nuit (réglé par chaque lampadaire). */
  glass: new MeshBasicMaterial({ color: 0xc9d4de }),
}

const A = new Color(), B = new Color(), OFF = new Color(0x4a5870), ON = new Color(0xffc77a)
/** Fait suivre aux matériaux de la rue le temps qu'il fait (pierre mouillée, fenêtres allumées, brume) : une fois par image. */
export function tickStreetMaterials() {
  const w = smooth(mood.rain), n = smooth(mood.night)
  const a = A, b = B
  for (const [m, dry, soaked, coat, coatWet] of WET) {
    m.color.copy(a.set(dry).lerp(b.set(soaked), w * (1 - mood.snow * 0.8)))
    m.clearcoat = coat + (coatWet - coat) * w
    m.roughness = 0.82 - w * 0.4
  }
  // Un peu plus d'une fenêtre sur deux s'allume, pas toutes en même temps ; le jour sombre, quelques-unes restent allumées.
  const dim = Math.max(w * 0.5, mood.storm * 0.4)
  for (const { th, m } of S.lit) {
    const on = th > 0.62 ? 0 : smooth(Math.min(1, Math.max(0, (n * 1.2 + 0.18 + dim * 0.25 - th) * 2.5)))
    m.emissiveIntensity = on * 1.1
    m.color.copy(OFF).lerp(ON, on)
  }
  S.dark.emissiveIntensity = 0.05 + (1 - n) * 0.12
  // la brume : la couleur du ciel du fond (jour clair, jour de pluie un peu plus sombre, nuit bleue)
  MIST.uMist.value.set(0xc3ccd6).lerp(a.set(0xaab4c2), w * 0.6).lerp(a.set(0x1a2040), n)
  MIST.uMistK.value = 1 + mood.snow * 0.2
}
