import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, Float32BufferAttribute, type Mesh } from 'three'
import { TAU, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { noRay } from '../parts'
import { C, ISLE, WATER, groundColor, groundY, inland, shoreR } from './isle'
import { S } from './surroundMaterials'
import { glintTex, lace, rippleTex, waveTex } from './surroundTex'

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const sstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)))

/** Le sol de l'île : une grille de sable (dunes, pente de la plage) qui se prolonge en mer plate ; les couleurs disent la profondeur. */
function groundGeo() {
  const N = 50, step = ISLE.size / N, x0 = ISLE.x - ISLE.size / 2, z0 = ISLE.z - ISLE.size / 2
  const pos: number[] = [], col: number[] = [], uv: number[] = [], land: number[] = [], idx: number[] = []
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const x = x0 + i * step, z = z0 + j * step, [r, g, b] = groundColor(x, z)
    pos.push(x, groundY(x, z), z)
    col.push(r / 255, g / 255, b / 255)
    uv.push(i / N, j / N)
    land.push(sstep(-0.1, 0.5, inland(x, z)))
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = j * (N + 1) + i, b = a + N + 1, c = a + 1, d = b + 1
    idx.push(a, b, c, c, b, d)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setAttribute('land', new Float32BufferAttribute(land, 1))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/**
 * Une bande qui suit le rivage, de `s0` (vers la terre, négatif) à `s1` (vers le large) : u le long de la côte (la texture se
 * répète tous les `tile` m), v en travers (de `s1` vers `s0`, `across` m par tuile). `alpha(s)` donne l'enveloppe.
 * Elle épouse le sable (hauteur du sol) et ne descend jamais sous l'eau.
 */
function shoreBand(s0: number, s1: number, rows: number, tile: number, across: number, alpha: (s: number) => number, lift = 0.014) {
  const M = 130, pos: number[] = [], col: number[] = [], uv: number[] = [], idx: number[] = []
  // la longueur du rivage, pour que la texture se raccorde en bouclant
  let len = 0, prev: [number, number] | null = null
  const at = (a: number, s: number): [number, number] => { const r = shoreR(a) + s; return [C.x + Math.cos(a) * r, C.z + Math.sin(a) * r] }
  const cum: number[] = []
  for (let m = 0; m <= M; m++) {
    const p = at((m / M) * TAU, 0)
    if (prev) len += Math.hypot(p[0] - prev[0], p[1] - prev[1])
    cum.push(len); prev = p
  }
  const tiles = Math.max(1, Math.round(len / tile))
  for (let m = 0; m <= M; m++) {
    const a = (m / M) * TAU
    for (let k = 0; k <= rows; k++) {
      const s = s1 + (s0 - s1) * (k / rows), [x, z] = at(a, s)
      pos.push(x, Math.max(WATER, groundY(x, z)) + lift, z)
      col.push(1, 1, 1, alpha(s))
      uv.push((cum[m] / len) * tiles, ((s1 - s) / across))
    }
  }
  for (let m = 0; m < M; m++) for (let k = 0; k < rows; k++) {
    const a = m * (rows + 1) + k, b = a + rows + 1
    idx.push(a, a + 1, b, b, a + 1, b + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 4))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

const FOAM_DAY = new Color(1, 0.98, 0.95), FOAM_NIGHT = new Color(0.6, 0.67, 0.94), FOAM_STORM = new Color(0.86, 0.9, 0.9)
const GLINT_DAY = new Color(1, 0.84, 0.6), GLINT_NIGHT = new Color(0.72, 0.8, 1)
const WET = new Color(0.8, 0.77, 0.78)

/**
 * Le sol de l'île et la mer : le sable et ses dunes, la plage qui descend dans l'eau, l'écume qui défile vers le rivage (plus vite et
 * plus dense sous l'orage), la dentelle du bord, les paillettes du couchant (de lune la nuit), les ronds de la pluie. Le sable
 * s'assombrit sous la pluie et blanchit sous la neige ; les bords se dissolvent dans le ciel.
 */
export function Terrain() {
  const geo = useMemo(groundGeo, [])
  const bands = useMemo(() => ({
    // les vagues qui arrivent : s'éteignent au large et juste avant le sable, où la dentelle prend le relais
    waves: shoreBand(0.05, 3.9, 5, 6, 3.6, (s) => sstep(3.9, 2.7, s) * sstep(0.0, 0.5, s) * 0.95),
    lace: shoreBand(-0.3, 0.7, 2, 6, 1.0, (s) => sstep(-0.3, 0.05, s) * sstep(0.7, 0.25, s) * 0.95, 0.018),
  }), [])
  // des copies de la texture : chaque bande défile à son rythme
  const tex = useMemo(() => {
    const w = waveTex.clone(), sw = waveTex.clone(), l = lace.clone(), gl = glintTex.clone(), rp = rippleTex.clone()
    for (const t of [w, sw, l, gl, rp]) t.needsUpdate = true
    return { w, sw, l, gl, rp }
  }, [])
  const mats = useMemo(() => {
    const wave = S.wave.clone(), swell = S.wave.clone(), laceM = S.lace.clone(), glint = S.glint.clone(), ripple = S.ripple.clone()
    wave.map = tex.w; swell.map = tex.sw; laceM.map = tex.l; glint.map = tex.gl; ripple.map = tex.rp
    return { wave, swell, lace: laceM, glint, ripple }
  }, [tex])
  const ripples = useRef<Mesh>(null!)
  const st = useRef({ flow: 0, swell: 0, drift: 0, tick: 0 })
  const c = useMemo(() => new Color(), [])
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, night = smooth(mood.night), storm = smooth(mood.storm), rain = smooth(mood.rain), snow = smooth(mood.snow)
    // les vagues défilent vers la plage ; l'orage les accélère
    if (!reduceMotion) { s.flow += dt * (0.075 + storm * 0.11); s.swell += dt * (0.03 + storm * 0.05); s.drift += dt * 0.004 }
    tex.w.offset.y = -s.flow
    tex.sw.offset.y = -s.swell
    tex.gl.offset.set(s.drift, s.drift * 0.6)
    // la dentelle respire : monte et redescend sur le sable
    const breath = reduceMotion ? 0.8 : 0.72 + 0.2 * Math.sin(clock.elapsedTime * 0.9)
    // couleur de l'écume : crème le jour, bleutée la nuit, grise sous l'orage, nette sous la neige
    c.copy(FOAM_DAY).lerp(FOAM_NIGHT, night).lerp(FOAM_STORM, storm * 0.7 * (1 - night * 0.5))
    mats.wave.color.copy(c); mats.swell.color.copy(c); mats.lace.color.copy(c)
    mats.wave.opacity = 0.8 + storm * 0.2 + snow * 0.1
    mats.swell.opacity = 0.7 + storm * 0.3
    mats.lace.opacity = breath * (0.9 + storm * 0.1)
    // les paillettes : le soleil bas d'un côté, la lune de l'autre ; éteintes sous la pluie
    mats.glint.color.copy(GLINT_DAY).lerp(GLINT_NIGHT, night)
    mats.glint.opacity = (0.24 - night * 0.04) * (1 - Math.max(rain * 0.8, snow * 0.6)) * (1 - storm * 0.5)
    // le sable mouillé par la pluie
    c.set(1, 1, 1).lerp(WET, rain * 0.75)
    S.ground.color.copy(c)
    // la pluie : des ronds dans l'eau, qui se renouvellent quelques fois par seconde
    const rr = Math.max(rain, storm) * (1 - snow)
    ripples.current.visible = rr > 0.03
    mats.ripple.opacity = rr * 0.55
    if (rr > 0.03 && (s.tick -= dt) <= 0) {
      s.tick = 0.22
      tex.rp.offset.set(Math.random(), Math.random())
    }
  })
  return (
    <group>
      <mesh geometry={geo} material={S.ground} receiveShadow raycast={noRay} />
      <mesh geometry={bands.waves} material={mats.wave} renderOrder={2} raycast={noRay} />
      <mesh geometry={bands.lace} material={mats.lace} renderOrder={3} raycast={noRay} />
      <mesh position={[C.x, WATER + 0.006, C.z]} rotation-x={-Math.PI / 2} material={mats.glint} renderOrder={4} raycast={noRay}>
        <planeGeometry args={[ISLE.size, ISLE.size]} />
      </mesh>
      <mesh ref={ripples} position={[C.x, WATER + 0.008, C.z]} rotation-x={-Math.PI / 2} material={mats.ripple} renderOrder={5} raycast={noRay} visible={false}>
        <planeGeometry args={[ISLE.size, ISLE.size]} />
      </mesh>
    </group>
  )
}
