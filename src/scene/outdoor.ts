import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Vector2, Vector3, type Material } from 'three'
import { smooth } from '../math'
import { mood } from './anim'
import type { Room } from '../rooms/types'
import type { V3 } from './parts'

// Le décor autour d'une pièce (la forêt de la cabane, la voie du train, les toits voisins…) : des outils communs.
//
// - `skyFade` fond un matériau dans le ciel du fond avec la distance à la pièce : à la bordure, l'objet prend exactement la couleur
//   du dégradé CSS qui est derrière lui (`.sky-day` / `.sky-night` de app.css, recalculé par pixel), donc il disparaît sans
//   couture ni transparence (pas de tri, pas de tracé en plus).
// - `<SkyFadeClock room>` tient à jour les couleurs du ciel (celles de la fiche de la pièce) et le passage à la nuit.
// - `groundGrid` fabrique un sol en grille (hauteur et couleur par sommet) ; `toScreen` dit où tombe un point à l'écran.

const hexVec = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16)
  // valeurs brutes (sRGB) : le rendu sort en linéaire sans conversion (<Canvas linear>), comme le CSS derrière
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

/** Les couleurs du ciel du fond et la taille de l'écran, partagées par tous les matériaux fondus. */
export const SKY = {
  uSkyDay: { value: [new Vector3(1, 1, 1), new Vector3(1, 1, 1), new Vector3(1, 1, 1)] },
  uSkyNight: { value: [new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0)] },
  uSkyN: { value: 0 },
  uSkyRes: { value: new Vector2(1, 1) },
}

// Le voile de neige du fond, au centre, au milieu et au bord du dégradé (couleurs et opacités de `.sky-veil.snowy`).
const DAY_VEIL = [[236, 240, 250], [231, 236, 248], [226, 232, 246]].map(([r, g, b]) => new Vector3(r / 255, g / 255, b / 255))
const NIGHT_VEIL = [[150, 160, 200], [145, 155, 195], [140, 150, 190]].map(([r, g, b]) => new Vector3(r / 255, g / 255, b / 255))
const DAY_A = [0.5, 0.65, 0.78], NIGHT_A = [0.15, 0.2, 0.28]

/** Gain de la lune sur le dehors, la nuit (voir `skyFade`). */
const NIGHT_GAIN = 0.7

export interface FadeOpts {
  /** Le centre du fondu (x, z) : le milieu de la pièce. */
  c?: [number, number]
  /** Distance où le fondu commence, où l'objet a disparu (en mètres, au sol). */
  r0?: number
  r1?: number
  /** Étire la distance le long de x et de z (un décor en longueur : la voie du train). */
  sx?: number
  sz?: number
  /** Hauteur où le haut d'un volume commence à se fondre, et où il a disparu (les tours qui montent hors du cadre). */
  y0?: number
  y1?: number
  /** Profondeur sous laquelle le bas se fond (un sol qui plonge, un tronc vu de loin). */
  below?: number
  /** Un matériau additif (reflets, halos) s'éteint vers le noir au lieu de prendre la couleur du ciel (il l'ajouterait). */
  additive?: boolean
  /**
   * La nuit, des étoiles fines (fixes à l'écran, comme un ciel) là où le matériau s'est fondu dans le ciel : pour le sol qui couvre le haut de
   * l'écran (le désert, 2026-11-19). 0 : aucune ; 1 : une étoile pour trente cases environ.
   */
  stars?: number
}

/**
 * Fond le matériau dans le ciel du fond : la couleur glisse vers celle du dégradé derrière le pixel, avec la distance au centre de
 * la pièce (et la hauteur, si on la donne). Se combine avec `snowTop` et les autres `onBeforeCompile` (appelés d'abord).
 */
export function skyFade<T extends Material>(m: T, o: FadeOpts = {}): T {
  const { c = [-0.07, -0.07], r0 = 7, r1 = 12, sx = 1, sz = 1, y0 = 40, y1 = 60, below = -40, additive = false, stars = 0 } = o
  const prev = m.onBeforeCompile, key = m.customProgramCacheKey()
  const f = (v: number) => v.toFixed(3)
  m.onBeforeCompile = (sh, r) => {
    prev.call(m, sh, r)
    Object.assign(sh.uniforms, SKY)
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'varying vec3 vSkyP;\nvoid main() {')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec4 skyP_ = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
          skyP_ = instanceMatrix * skyP_;
          #endif
          vSkyP = (modelMatrix * skyP_).xyz;
        }`,
      )
    sh.fragmentShader = sh.fragmentShader
      .replace(
        'void main() {',
        `uniform vec3 uSkyDay[3];
        uniform vec3 uSkyNight[3];
        uniform float uSkyN;
        uniform vec2 uSkyRes;
        varying vec3 vSkyP;
        vec3 skyGrad_(vec3 a, vec3 b, vec3 c, float t) {
          return t < 0.52 ? mix(a, b, t / 0.52) : mix(b, c, clamp((t - 0.52) / 0.48, 0.0, 1.0));
        }
        void main() {`,
      )
      .replace(
        '#include <dithering_fragment>',
        `{
          vec2 sp_ = gl_FragCoord.xy / uSkyRes;
          float t_ = length(vec2((sp_.x - 0.5) / 1.3, ((1.0 - sp_.y) - 0.4) / 0.9));
          vec3 sky_ = mix(skyGrad_(uSkyDay[0], uSkyDay[1], uSkyDay[2], t_), skyGrad_(uSkyNight[0], uSkyNight[1], uSkyNight[2], t_), uSkyN);
          vec2 d_ = (vSkyP.xz - vec2(${f(c[0])}, ${f(c[1])})) / vec2(${f(sx)}, ${f(sz)});
          // Le fondu ne démarre pas en ligne droite : la puissance 1,6 garde le décor franc près de la pièce (les immeubles du café, les sapins
          // du train n'étaient plus que des silhouettes laiteuses) et le fait disparaître vite à la bordure, où il rejoint toujours le ciel (k = 1).
          // 2,0 (et non 1,6) : au milieu du fondu un volume garde 25 % de brume au lieu de 33 %, donc sa teinte de jour (revue graphique 2026-11-16).
          float k_ = pow(smoothstep(${f(r0)}, ${f(r1)}, length(d_)), 2.0);
          k_ = max(k_, smoothstep(${f(y0)}, ${f(y1)}, vSkyP.y));
          k_ = max(k_, smoothstep(${f(below)}, ${f(below - 1.2)}, vSkyP.y));
          ${additive ? '' : `// La nuit, le dehors reçoit la lune : un voile froid et un peu de gain, pour que les volumes se lisent au lieu de tomber au bleu uni
          // (ce décor n'est jamais dans la pièce : les intérieurs gardent leur nuit). Le gain vise ce qui est sombre (sapins, gazon, toits) :
          // la neige et le sable, déjà clairs, ne bougent presque pas (à plein gain, la neige de la cabane virait au violet lumineux).
          float moon_ = uSkyN * (1.0 - smoothstep(0.10, 0.38, dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114))));
          gl_FragColor.rgb = gl_FragColor.rgb * (1.0 + ${f(NIGHT_GAIN)} * moon_) + vec3(0.012, 0.022, 0.05) * moon_;`}
          gl_FragColor.rgb = mix(gl_FragColor.rgb, ${additive ? 'vec3(0.0)' : 'sky_'}, k_);
          ${stars > 0 && !additive ? `// Des étoiles dans le ciel de la nuit : des points fixes à l'écran (une case sur trente, au hasard), que seul le sol fondu dans le ciel montre.
          {
            vec2 cell_ = gl_FragCoord.xy / (uSkyRes.y / 120.0);
            vec2 id_ = floor(cell_);
            float h1_ = fract(sin(dot(id_, vec2(127.1, 311.7))) * 43758.5453);
            float h2_ = fract(sin(dot(id_, vec2(269.5, 183.3))) * 43758.5453);
            vec2 cp_ = vec2(0.3 + 0.4 * fract(h1_ * 13.0), 0.3 + 0.4 * fract(h2_ * 11.0));
            float big_ = step(0.992, h1_);
            float st_ = step(0.967, h1_) * smoothstep(0.17 + big_ * 0.1, 0.0, length(fract(cell_) - cp_)) * (0.35 + 0.65 * h2_);
            gl_FragColor.rgb += vec3(1.0, 0.95, 0.85) * st_ * uSkyN * pow(k_, 1.5) * ${f(stars)};
          }` : ''}
        }
        #include <dithering_fragment>`,
      )
  }
  // la clé dit tout ce que le shader injecte : deux matériaux pareils et fondus pareil partagent un seul programme compilé
  const params = [c[0], c[1], r0, r1, sx, sz, y0, y1, below].map(f).join(',')
  m.customProgramCacheKey = () => `${key}|sky${params}${additive ? 'a' : ''}${stars > 0 && !additive ? `s${f(stars)}` : ''}`
  return m
}

/** Tient à jour le ciel des matériaux fondus : couleurs de la pièce, nuit, taille de l'écran. À poser une fois dans le décor. */
export function SkyFadeClock({ room }: { room: Room }) {
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const base = useRef({ day: room.sky.day.map(hexVec), night: room.sky.night.map(hexVec) })
  useLayoutEffect(() => {
    base.current = { day: room.sky.day.map(hexVec), night: room.sky.night.map(hexVec) }
    base.current.day.forEach((c, i) => SKY.uSkyDay.value[i].copy(c))
    base.current.night.forEach((c, i) => SKY.uSkyNight.value[i].copy(c))
  }, [room])
  useLayoutEffect(() => {
    gl.getDrawingBufferSize(SKY.uSkyRes.value)
  }, [gl, size])
  useFrame(() => {
    SKY.uSkyN.value = smooth(mood.night)
    // Sous la neige, le voile blanc du fond (`.sky-veil.snowy` de app.css) couvre le dégradé : le décor lointain se fond dans ce ciel-là,
    // sinon il reste de la couleur de la pièce (crème, dans la cabane perchée) et fait des plaques jaunes sur un fond blanc.
    const s = smooth(mood.snow)
    base.current.day.forEach((c, i) => SKY.uSkyDay.value[i].copy(c).lerp(DAY_VEIL[i], s * DAY_A[i]))
    base.current.night.forEach((c, i) => SKY.uSkyNight.value[i].copy(c).lerp(NIGHT_VEIL[i], s * NIGHT_A[i]))
  })
  return null
}

/**
 * Un sol en grille carrée : `y(x, z)` donne la hauteur, `col(x, z)` la couleur (0 à 1). `uv` en mètres / `tile` (pour une
 * texture qui se répète). Les normales sont calculées.
 */
export function groundGrid(cx: number, cz: number, size: number, n: number, y: (x: number, z: number) => number, col?: (x: number, z: number) => [number, number, number], tile = 2) {
  const step = size / n, x0 = cx - size / 2, z0 = cz - size / 2
  const pos: number[] = [], c: number[] = [], uv: number[] = [], idx: number[] = []
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const x = x0 + i * step, z = z0 + j * step
    pos.push(x, y(x, z), z)
    if (col) c.push(...col(x, z))
    uv.push(x / tile, -z / tile)
  }
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = j * (n + 1) + i, b = a + n + 1
    idx.push(a, b, a + 1, a + 1, b, b + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  if (col) g.setAttribute('color', new Float32BufferAttribute(c, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// La caméra regarde dans la direction (1, 0,8, 1) le point (0, 1,85, 0), dans toutes les pièces.
const LOOK: V3 = [0, 1.85, 0]
const RX: V3 = [0.7071, 0, -0.7071]
const UP: V3 = [-0.344, 0.861, -0.344]
const TO: V3 = [0.615, 0.492, 0.615]
/** Position d'un point du monde à l'écran : [vers la droite, vers le haut, vers la caméra]. */
export const toScreen = (p: V3): V3 => {
  const d: V3 = [p[0] - LOOK[0], p[1] - LOOK[1], p[2] - LOOK[2]]
  return [d[0] * RX[0] + d[2] * RX[2], d[0] * UP[0] + d[1] * UP[1] + d[2] * UP[2], d[0] * TO[0] + d[1] * TO[1] + d[2] * TO[2]]
}

/** Lissage entre a et b (0 avant a, 1 après b ; a > b inverse le sens). */
export const sstep = (a: number, b: number, x: number) => smooth(Math.min(1, Math.max(0, (x - a) / (b - a))))

/** Un bruit de valeurs lisse et déterministe, de -1 à 1. */
const hash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}
export function noise(x: number, z: number) {
  const i = Math.floor(x), j = Math.floor(z), fx = smooth(x - i), fz = smooth(z - j)
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1)
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz
}

/** Distance (positive dehors) d'un point au carré de la pièce : le socle de toutes les pièces va de -3,5 à 3,36. */
export const slabGap = (x: number, z: number, m = 0) => Math.max(-3.5 - m - x, x - 3.36 - m, -3.5 - m - z, z - 3.36 - m)
