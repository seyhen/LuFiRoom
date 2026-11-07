import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, type Material } from 'three'
import { gummy } from '../materials'
import { stripes } from './textures'
import { leafy, moss, stone } from '../nature/materials'
import { SNOW, snowTop } from '../snowTop'
import { deckBoards, glintTex, isleFade, lace, palmBark, rippleTex, sandTex, waveTex } from './surroundTex'

const stripeTex = stripes('#fbf1e2', '#3fb8b0', 7)

// Les matériaux du décor autour du bungalow : sable, eau (écume, paillettes, ronds de pluie), bois du ponton, palmes, pierres.

/** Le vent : le temps et la force (1 par beau temps, plus fort sous l'orage), lus par les palmes et les herbes. <Surroundings> les tient à jour. */
export const WIND = { uTime: { value: 0 }, uWind: { value: 1 } }

/**
 * Fait osciller un matériau de feuillage dans le vent, sans rien recalculer côté CPU : le sommet se déplace d'autant plus que sa
 * coordonnée v (le long de la palme, de la tige vers la pointe) est grande. La phase vient de la position, donc deux palmes
 * ne battent pas ensemble. S'applique APRÈS `snowTop` (`sway(snowTop(m))`) : `snowTop` remplace le `onBeforeCompile` qu'il trouve,
 * alors que `sway` garde le précédent.
 */
export function sway<T extends Material>(m: T, amp = 0.1): T {
  const prev = m.onBeforeCompile
  m.onBeforeCompile = (sh, r) => {
    prev?.call(m, sh, r)
    sh.uniforms.uTime = WIND.uTime
    sh.uniforms.uWind = WIND.uWind
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'uniform float uTime;\nuniform float uWind;\nvoid main() {')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          float k = pow(clamp(uv.y, 0.0, 1.0), 1.5) * uWind * ${amp.toFixed(3)};
          float ph = uTime * 1.7 + transformed.x * 0.9 + transformed.z * 0.7;
          transformed.y += sin(ph) * k * 0.7;
          transformed.x += sin(ph * 0.8 + 1.3) * k;
          transformed.z += cos(ph * 0.7) * k * 0.6;
        }`,
      )
  }
  const key = m.customProgramCacheKey
  m.customProgramCacheKey = () => `${key.call(m)}sway${amp}`
  return m
}

/**
 * Le sol de l'île : le sable vient des couleurs de sommets, son grain d'une texture ; sous la neige il blanchit là où `land` vaut 1
 * (pas sur la mer, qui garde ses couleurs). `alphaMap` : le fondu des bords dans le ciel. On garde ce fondu transparent plutôt que
 * `skyFade` : le voile de pluie et la pluie peints derrière le canvas (`WeatherSky`) restent visibles à travers le bord de l'île.
 */
function ground() {
  const m = new MeshStandardMaterial({ map: sandTex, alphaMap: isleFade, vertexColors: true, transparent: true, roughness: 0.92, metalness: 0 })
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSnow = SNOW.uSnow
    sh.uniforms.uSnowColor = SNOW.uSnowColor
    sh.uniforms.uUp = SNOW.uUp
    sh.uniforms.uSnowGlow = SNOW.uSnowGlow
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'attribute float land;\nvarying float vLand;\nvoid main() {\n  vLand = land;')
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform float uSnow;\nuniform float uSnowGlow;\nuniform vec3 uSnowColor;\nuniform vec3 uUp;\nvarying float vLand;\nvoid main() {')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        float snowMask = uSnow * smoothstep(0.55, 0.9, vLand) * smoothstep(0.3, 0.75, dot(normal, uUp));
        diffuseColor.rgb = mix(diffuseColor.rgb, uSnowColor, snowMask * 0.92);`,
      )
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n        totalEmissiveRadiance += uSnowColor * snowMask * uSnowGlow;')
  }
  m.customProgramCacheKey = () => 'beachGround'
  return m
}

const basic = (o: ConstructorParameters<typeof MeshBasicMaterial>[0]) => new MeshBasicMaterial({ transparent: true, depthWrite: false, ...o })

export const S = {
  ground: ground(),
  // l'eau : des vagues qui défilent, la dentelle du bord, les paillettes, les ronds de pluie (toutes sans lumière, teintées à chaque image)
  wave: basic({ map: waveTex, vertexColors: true, opacity: 1 }),
  lace: basic({ map: lace, vertexColors: true }),
  glint: basic({ map: glintTex, alphaMap: isleFade, blending: AdditiveBlending, opacity: 0.5 }),
  ripple: basic({ map: rippleTex, alphaMap: isleFade, opacity: 0 }),
  foamRing: basic({ color: 0xffffff, opacity: 0.8 }),
  // le bois du ponton et des barques : gris argenté du sel, un peu de vert aux pieds
  pierWood: gummy(0xffffff, { map: deckBoards, roughness: 0.78, clearcoat: 0.08 }),
  pierBeam: gummy(0x9c8468, { roughness: 0.82, clearcoat: 0.06 }),
  pierPost: gummy(0x8a7358, { roughness: 0.85, clearcoat: 0.05 }),
  pierPostWet: gummy(0x5d5a4a, { roughness: 0.85, clearcoat: 0.05 }),
  driftwood: gummy(0xd9cdb8, { roughness: 0.85, clearcoat: 0.04 }),
  rope: gummy(0xe2cfa4, { roughness: 0.9, clearcoat: 0 }),
  iron: gummy(0x4a4a52, { roughness: 0.5, clearcoat: 0.4 }),
  lantern: gummy(0xffe9c0, { roughness: 0.3, clearcoat: 0.6, emissive: 0xffb050, emissiveIntensity: 0 }),
  // les palmiers
  trunk: gummy(0xffffff, { map: palmBark, roughness: 0.85, clearcoat: 0.04 }),
  palmA: sway(snowTop(leafy(0x58b078, { side: DoubleSide }), 0.8), 0.16),
  palmB: sway(snowTop(leafy(0x3f9b6c, { side: DoubleSide }), 0.8), 0.16),
  coconut: gummy(0x6a5238, { roughness: 0.6, clearcoat: 0.3 }),
  grass: sway(snowTop(gummy(0xffffff, { vertexColors: true, roughness: 0.7, clearcoat: 0.1, side: DoubleSide }), 0.9), 0.12),
  // les rochers du rivage : gris chaud, un peu de rose du couchant
  rock: snowTop(stone(0xb9aca0), 0.9),
  rockDark: snowTop(stone(0x8f857f), 0.9),
  algae: gummy(0x6f9a64, { roughness: 0.7, clearcoat: 0.2 }),
  barnacle: gummy(0xf1e8d8, { roughness: 0.6, clearcoat: 0.2 }),
  // le parasol, la serviette, les barques
  canvas: gummy(0xffffff, { vertexColors: true, roughness: 0.8, clearcoat: 0.06, side: DoubleSide }),
  castle: gummy(0xf0d9a8, { roughness: 0.95, clearcoat: 0 }),
  towel: gummy(0xffffff, { map: stripeTex, roughness: 0.9, clearcoat: 0.02 }),
  algaeMoss: moss(0x6f9a64),
  star: gummy(0xf08a76, { roughness: 0.5, clearcoat: 0.5 }),
  canvasCoral: gummy(0xf08a76, { roughness: 0.8, clearcoat: 0.06, side: DoubleSide }),
  canvasCream: gummy(0xfbf1e2, { roughness: 0.8, clearcoat: 0.06, side: DoubleSide }),
  hullOuter: gummy(0xffffff, { vertexColors: true, roughness: 0.55, clearcoat: 0.35, side: DoubleSide }),
  crabSkin: gummy(0xffffff, { vertexColors: true, roughness: 0.55, clearcoat: 0.3 }),
  buoyRed: gummy(0xe2564a, { roughness: 0.4, clearcoat: 0.6 }),
  buoyWhite: gummy(0xfbf6ee, { roughness: 0.4, clearcoat: 0.6 }),
}
