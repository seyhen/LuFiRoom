import { Color, Vector3, type Material } from 'three'

// La neige posée sur ce qui est dehors en volumes (les tours autour du toit, les montagnes et la forêt de l'onsen) : le
// matériau blanchit là où sa surface regarde le ciel. Rien à dessiner en plus : c'est le même tracé, avec trois lignes de shader.
// <Lights> tient `SNOW` à jour (la quantité, la couleur selon la nuit, le haut vu de la caméra).

export const SNOW = {
  uSnow: { value: 0 },
  uSnowColor: { value: new Color(0xf4f7fb) },
  /** La neige renvoie un peu de lumière d'elle-même (la nuit surtout : la ville, la lune) ; sinon elle serait aussi sombre que le toit. */
  uSnowGlow: { value: 0 },
  /** Le haut du monde, dans le repère de la caméra (les normales du shader y sont exprimées). */
  uUp: { value: new Vector3(0, 1, 0) },
}

/**
 * Prépare un matériau (gummy, feuillage…) à recevoir la neige : `k` règle la quantité (une pente raide en garde moins, une
 * forêt est poudrée plutôt que couverte). À appeler avant le premier rendu du matériau.
 */
export function snowTop<T extends Material>(m: T, k = 1, from = 0.35, to = 0.75): T {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSnow = SNOW.uSnow
    sh.uniforms.uSnowColor = SNOW.uSnowColor
    sh.uniforms.uUp = SNOW.uUp
    sh.uniforms.uSnowGlow = SNOW.uSnowGlow
    sh.uniforms.uSnowK = { value: k }
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform float uSnow;\nuniform float uSnowK;\nuniform float uSnowGlow;\nuniform vec3 uSnowColor;\nuniform vec3 uUp;\nvoid main() {')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        float snowMask = uSnow * uSnowK * smoothstep(${from.toFixed(3)}, ${to.toFixed(3)}, dot(normal, uUp));
        diffuseColor.rgb = mix(diffuseColor.rgb, uSnowColor, snowMask);`,
      )
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n        totalEmissiveRadiance += uSnowColor * snowMask * uSnowGlow;')
  }
  m.customProgramCacheKey = () => `snowTop${from}-${to}`
  return m
}
