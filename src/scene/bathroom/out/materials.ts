import { AdditiveBlending, CanvasTexture, CustomBlending, MeshBasicMaterial, OneFactor, OneMinusSrcAlphaFactor, ShaderMaterial } from 'three'
import { TAU, seeded } from '../../../math'
import { far } from '../../materials'
import { SKY, skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { makeCanvas } from '../../textures'

// Les matériaux du dehors de la salle de bain : un monde de bulles dans le ciel. La mousse et les objets des grosses bulles sont des
// matériaux gummy légers qui se fondent dans le ciel avec la distance (`skyFade`) ; les bulles, elles, sont un petit matériau fait maison
// (l'iridescence de three.js est retirée du projet, voir scene/materials.ts) : un bord lumineux, un centre presque transparent, une teinte
// d'arc-en-ciel qui tourne avec l'angle et ondule, deux reflets de fenêtre. Leur fondu avec la distance est un fondu d'opacité.

/** Le fondu de la mousse : large (le banc va jusqu'à 8 de la pièce, les nuages lointains de 11 à 18 : voilés, jamais effacés, même dans les coins). */
export const F = { c: [0, 0] as [number, number], r0: 10, r1: 22 }

export const O = {
  /** Mousse : blanche, la teinte vient de chaque paquet (couleur d'instance). Un peu d'émission : elle reste douce la nuit et à l'ombre. */
  foam: skyFade(snowTop(far(0xffffff, { roughness: 0.3, emissive: 0xffd8e6, emissiveIntensity: 0.07 }), 1, 0.4, 0.8), F),
  /** Ce qu'il y a dans les grosses bulles : une seule peau par objet, la couleur vient des sommets. */
  thing: skyFade(far(0xffffff, { vertexColors: true, roughness: 0.46, emissive: 0xffe8e0, emissiveIntensity: 0.05 }), F),
  /** La flamme de la bougie. */
  flame: new MeshBasicMaterial({ color: 0xffd36b }),
}

/** Ce que les bulles partagent : la phase de leurs couleurs (elle s'additionne image après image) et l'éclair. */
export const BUB = { phase: { value: 0 }, flash: { value: 0 } }

const VERT = /* glsl */ `
attribute float aLife;
attribute float aHue;
varying vec3 vN;
varying float vLife;
varying float vHue;
varying float vFade;
uniform float uR0;
uniform float uR1;
void main() {
  mat4 im = mat4(1.0);
  #ifdef USE_INSTANCING
  im = instanceMatrix;
  #endif
  vec4 wp = modelMatrix * im * vec4(position, 1.0);
  vec3 nw = mat3(modelMatrix) * mat3(im) * normal;
  vN = normalize(mat3(viewMatrix) * nw);
  vLife = aLife;
  vHue = aHue;
  float d = length(wp.xz);
  vFade = 1.0 - pow(smoothstep(uR0, uR1, d), 1.4);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

const FRAG = /* glsl */ `
uniform float uPhase;
uniform float uSkyN;
uniform float uFlash;
varying vec3 vN;
varying float vLife;
varying float vHue;
varying float vFade;
void main() {
  vec3 N = normalize(vN);
  // la caméra est orthographique : on regarde toujours selon +z dans son repère
  float f = 1.0 - abs(N.z);
  float rim = pow(f, 2.1);
  // la teinte : un arc-en-ciel pâle qui tourne avec l'angle de vue et ondule doucement dans le temps
  float t = f * 1.5 + dot(N.xy, vec2(0.55, 0.35)) * 0.5 + vHue + uPhase;
  vec3 film = 0.5 + 0.5 * cos(6.2832 * (t + vec3(0.0, 0.33, 0.67)));
  film = mix(vec3(0.97, 0.95, 1.0), film, 0.78);
  vec3 col = mix(film * vec3(0.9, 0.82, 0.95), film * 1.08, uSkyN);
  // les reflets d'une fenêtre : un grand en haut à gauche, un petit doux en bas à droite
  float h1 = smoothstep(0.93, 0.975, dot(N, normalize(vec3(-0.42, 0.64, 0.64))));
  float h2 = smoothstep(0.9, 0.96, dot(N, normalize(vec3(0.56, -0.6, 0.57)))) * 0.5;
  float a0 = 0.04 + 0.68 * rim;
  float hl = h1 * 0.95 + h2 * 0.7;
  float life = vLife * vFade;
  vec3 rgb = (col * a0 + vec3(1.0) * hl) * life;
  float alpha = (a0 + hl) * life;
  rgb += vec3(0.55, 0.6, 0.85) * uFlash * (0.25 + rim) * 0.5 * life;
  // la nuit, la bulle brille plus qu'elle ne voile : presque additive
  alpha *= mix(1.0, 0.28, uSkyN);
  rgb *= mix(1.0, 1.25, uSkyN);
  gl_FragColor = vec4(rgb, alpha);
}`

/** Un matériau de bulle : bord lumineux, centre clair, fondu d'opacité avec la distance à la pièce (`r0`, `r1`). Couleur prémultipliée. */
export function bubbleMaterial(r0 = 8.5, r1 = 21) {
  return new ShaderMaterial({
    uniforms: { uPhase: BUB.phase, uSkyN: SKY.uSkyN, uFlash: BUB.flash, uR0: { value: r0 }, uR1: { value: r1 } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneMinusSrcAlphaFactor,
  })
}

/** La lune : un disque crème, des cratères doux. */
export const moonTex = (() => {
  const [c, x] = makeCanvas(128, 128)
  const g = x.createRadialGradient(54, 50, 6, 64, 64, 60)
  g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f1e2d6')
  x.fillStyle = g; x.beginPath(); x.arc(64, 64, 60, 0, TAU); x.fill()
  const r = seeded(5)
  for (const [px, py, pr] of [[44, 48, 14], [78, 40, 9], [84, 76, 15], [50, 86, 8], [66, 62, 6], [30, 72, 6]]) {
    x.fillStyle = `rgba(214,190,196,${0.28 + r() * 0.1})`
    x.beginPath(); x.arc(px, py, pr, 0, TAU); x.fill()
    x.fillStyle = 'rgba(255,255,255,.35)'
    x.beginPath(); x.arc(px - pr * 0.18, py - pr * 0.2, pr * 0.62, 0, TAU); x.fill()
  }
  return new CanvasTexture(c)
})()

/** Le halo de la lune : un rond doux lilas. */
export const haloTex = (() => {
  const [c, x] = makeCanvas(128, 128)
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,240,235,.9)'); g.addColorStop(0.25, 'rgba(236,214,240,.42)'); g.addColorStop(1, 'rgba(210,190,240,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
})()

/** L'arc-en-ciel : un dégradé continu de sept teintes pastel, transparent aux deux bords, qui s'efface vers les pieds. Un demi-anneau dans un carré 2 : 1. */
export const rainbowTex = (() => {
  const W = 1024, H = 512, [c, x] = makeCanvas(W, H), cx = W / 2, cy = H, out = 500, thick = 92, inner = out - thick
  const g = x.createRadialGradient(cx, cy, inner, cx, cy, out)
  const stops: [number, string][] = [[0, 'rgba(217,176,238,0)'], [0.1, 'rgba(217,176,238,.85)'], [0.24, 'rgba(180,182,240,.9)'], [0.38, 'rgba(168,220,240,.9)'], [0.52, 'rgba(191,232,194,.9)'], [0.66, 'rgba(253,229,160,.9)'], [0.8, 'rgba(251,191,159,.9)'], [0.92, 'rgba(246,166,189,.85)'], [1, 'rgba(246,166,189,0)']]
  for (const [p, col] of stops) g.addColorStop(p, col)
  x.fillStyle = g
  x.beginPath(); x.arc(cx, cy, out, Math.PI, TAU); x.arc(cx, cy, inner - 8, TAU, Math.PI, true); x.closePath(); x.fill()
  // les pieds se perdent dans la brume : un fondu horizontal vers les deux bouts, et vers le bas
  x.globalCompositeOperation = 'destination-in'
  const m = x.createLinearGradient(0, 0, W, 0)
  m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.16, 'rgba(0,0,0,.9)'); m.addColorStop(0.84, 'rgba(0,0,0,.9)'); m.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = m; x.fillRect(0, 0, W, H)
  const v = x.createLinearGradient(0, 0, 0, H)
  v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.82, 'rgba(0,0,0,.7)'); v.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = v; x.fillRect(0, 0, W, H)
  x.globalCompositeOperation = 'source-over'
  return new CanvasTexture(c)
})()

export const sky = {
  moon: new MeshBasicMaterial({ map: moonTex, transparent: true, depthWrite: false, opacity: 0 }),
  halo: new MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }),
  rainbow: new MeshBasicMaterial({ map: rainbowTex, transparent: true, depthWrite: false, opacity: 0 }),
  /** Des étoiles fines, fixes à l'écran, qui scintillent à peine (même calcul que l'option `stars` de skyFade). */
  stars: new ShaderMaterial({
    uniforms: { uSkyRes: SKY.uSkyRes, uAmount: { value: 0 }, uTw: { value: 0 } },
    vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform vec2 uSkyRes;
      uniform float uAmount;
      uniform float uTw;
      void main() {
        vec2 cell = gl_FragCoord.xy / (uSkyRes.y / 110.0);
        vec2 id = floor(cell);
        float h1 = fract(sin(dot(id, vec2(127.1, 311.7))) * 43758.5453);
        float h2 = fract(sin(dot(id, vec2(269.5, 183.3))) * 43758.5453);
        vec2 cp = vec2(0.3 + 0.4 * fract(h1 * 13.0), 0.3 + 0.4 * fract(h2 * 11.0));
        float big = step(0.99, h1);
        float tw = 0.78 + 0.22 * sin(uTw * (0.6 + h2) + h1 * 40.0);
        float st = step(0.94, h1) * smoothstep(0.17 + big * 0.12, 0.0, length(fract(cell) - cp)) * (0.35 + 0.65 * h2) * tw;
        float a = st * uAmount;
        gl_FragColor = vec4(vec3(1.0, 0.94, 0.88) * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    // une étoile se pose sur le fond : sans alpha, l'additif seul laisserait le canevas opaque noir par-dessus le ciel
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneFactor,
  }),
}
