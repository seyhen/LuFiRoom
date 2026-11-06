import { useLayoutEffect } from 'react'
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
}

/**
 * Fond le matériau dans le ciel du fond : la couleur glisse vers celle du dégradé derrière le pixel, avec la distance au centre de
 * la pièce (et la hauteur, si on la donne). Se combine avec `snowTop` et les autres `onBeforeCompile` (appelés d'abord).
 */
export function skyFade<T extends Material>(m: T, o: FadeOpts = {}): T {
  const { c = [-0.07, -0.07], r0 = 7, r1 = 12, sx = 1, sz = 1, y0 = 40, y1 = 60, below = -40, additive = false } = o
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
          float k_ = smoothstep(${f(r0)}, ${f(r1)}, length(d_));
          k_ = max(k_, smoothstep(${f(y0)}, ${f(y1)}, vSkyP.y));
          k_ = max(k_, smoothstep(${f(below)}, ${f(below - 1.2)}, vSkyP.y));
          gl_FragColor.rgb = mix(gl_FragColor.rgb, ${additive ? 'vec3(0.0)' : 'sky_'}, k_);
        }
        #include <dithering_fragment>`,
      )
  }
  // la clé dit tout ce que le shader injecte : deux matériaux pareils et fondus pareil partagent un seul programme compilé
  const params = [c[0], c[1], r0, r1, sx, sz, y0, y1, below].map(f).join(',')
  m.customProgramCacheKey = () => `${key}|sky${params}${additive ? 'a' : ''}`
  return m
}

/** Tient à jour le ciel des matériaux fondus : couleurs de la pièce, nuit, taille de l'écran. À poser une fois dans le décor. */
export function SkyFadeClock({ room }: { room: Room }) {
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  useLayoutEffect(() => {
    room.sky.day.forEach((h, i) => SKY.uSkyDay.value[i].copy(hexVec(h)))
    room.sky.night.forEach((h, i) => SKY.uSkyNight.value[i].copy(hexVec(h)))
  }, [room])
  useLayoutEffect(() => {
    gl.getDrawingBufferSize(SKY.uSkyRes.value)
  }, [gl, size])
  useFrame(() => {
    SKY.uSkyN.value = smooth(mood.night)
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
