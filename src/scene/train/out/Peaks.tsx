import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, TubeGeometry, Vector3, type Group } from 'three'
import { TAU } from '../../../math'
import { reduceMotion } from '../../anim'
import { far } from '../../materials'
import { LIVE, Static } from '../../Static'
import { Part, cyl, noRay, rbox, type V3 } from '../../parts'
import { skyFade } from '../../outdoor'
import { GROUND, SPEED } from './Line'

// Le grand fond du train : une crête de montagnes (herbe, roche bleutée, neige) derrière les collines boisées, avec une ligne de pylônes
// qui la longe. Elle défile très lentement (15 % de la vitesse) et prend son propre fondu large : au-delà de 13 m, le fondu de la voie
// avait tout effacé et les coins du haut des grands écrans n'avaient que du ciel.

const P = 60 // la crête est périodique sur 60 m
const Z0 = -15, Z1 = -19.5
const F = { c: [0, 0] as [number, number], r0: 14, r1: 30, sx: 2.4, sz: 1 }
const M = {
  ridge: skyFade(far(0xffffff, { roughness: 0.9, vertexColors: true }), F),
  steel: skyFade(far(0x6d7886, { roughness: 0.5 }), F),
  wire: skyFade(far(0x3a3236, { roughness: 0.5 }), F),
}

const hillW = (x: number) => Math.sin((x / 30) * TAU) * 0.8 + Math.sin((x / 30) * TAU * 2 + 1.3) * 0.5 + Math.sin((x / 30) * TAU * 3 + 0.4) * 0.25
/** La hauteur au-dessus du sol : celle des collines à leur bord (z = -15), puis la crête qui monte. */
function rise(x: number, z: number) {
  const t = Math.min(1, Math.max(0, (Z0 - z) / (Z0 - Z1)))
  const peak = Math.pow(1 - Math.abs(Math.sin((x / P) * TAU * 3 + 0.7)), 1.4) * 0.9 + Math.pow(1 - Math.abs(Math.sin((x / P) * TAU * 5 + 2)), 1.6) * 0.5
  return 2.6 + hillW(x) * 1.1 + Math.pow(t, 0.8) * (0.2 + peak * 1.1)
}

const GRASS = new Color(0x6a9f66), ROCK = new Color(0x7488a8), SNOW = new Color(0xe8eff9)
function ridgeGeo() {
  const NX = 180, NZ = 8, pos: number[] = [], col: number[] = [], idx: number[] = []
  const c = new Color()
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const x = -P + (i / NX) * 3 * P, z = Z0 - (j / NZ) * (Z0 - Z1), h = rise(x, z), above = h - (2.6 + hillW(x) * 1.1)
    pos.push(x, GROUND + h, z)
    const f = above / 1.6 // 0 au pied, 1 au sommet
    if (f < 0.12) c.copy(GRASS); else if (f < 0.5) c.copy(ROCK).lerp(GRASS, Math.max(0, 1 - (f - 0.12) / 0.2)); else c.copy(ROCK).lerp(SNOW, Math.min(1, (f - 0.5) / 0.2))
    col.push(c.r, c.g, c.b)
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const a = j * (NX + 1) + i, b = a + NX + 1
    idx.push(a, a + 1, b, a + 1, b + 1, b)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const PYLONS = [8, 38]
const PZ = Z0 - 0.7
/** Un pylône à treillis : deux jambes qui se rejoignent, deux traverses, des fils qui filent vers le suivant. */
function Pylon({ x }: { x: number }) {
  const y = GROUND + rise(x, PZ), H = 2.6
  return (
    <group position={[x, y - 0.05, PZ]}>
      {[-1, 1].map((s) => <Part key={s} geo={cyl(0.03, 0.06, H, 6)} m={M.steel} p={[s * 0.16, H / 2, 0]} rotation-z={-s * 0.07} castShadow={false} />)}
      <Part geo={rbox(0.18, 0.1, 0.1, 0.03)} m={M.steel} p={[0, 0.55, 0]} castShadow={false} />
      {[1.9, 2.4].map((h, i) => <Part key={h} geo={rbox(1.5 - i * 0.4, 0.05, 0.05, 0.02)} m={M.steel} p={[0, h, 0]} castShadow={false} />)}
      <Part geo={cyl(0.02, 0.02, 0.3, 5)} m={M.steel} p={[0, H + 0.1, 0]} castShadow={false} />
    </group>
  )
}

function wires() {
  const out: BufferGeometry[] = []
  for (const x of PYLONS) for (const [h, dz] of [[1.9, 0.7], [1.9, -0.7], [2.4, 0.5]] as [number, number][]) {
    const x2 = x === PYLONS[0] ? PYLONS[1] : PYLONS[0] + P // d'un pylône au suivant, et du dernier au premier du motif suivant
    const y0 = GROUND + rise(x, PZ) + h, y1 = GROUND + rise(x2, PZ) + h
    const pts: V3[] = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [x + (x2 - x) * t, y0 + (y1 - y0) * t - 0.5 * Math.sin(Math.PI * t), PZ + dz * 0.4] })
    out.push(new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 24, 0.012, 5, false))
  }
  return out
}

/** La crête de montagnes et ses pylônes, qui défilent à 15 % de la vitesse du train. */
export function Peaks() {
  const g = useRef<Group>(null!), s = useRef(0)
  const geo = useMemo(ridgeGeo, [])
  const ws = useMemo(wires, [])
  useFrame((_, delta) => {
    if (!reduceMotion) s.current = (s.current + Math.min(delta, 0.05) * SPEED * 0.15) % P
    g.current.position.x = -s.current
  })
  return (
    <group ref={g} userData={LIVE}>
      <mesh geometry={geo} material={M.ridge} raycast={noRay} />
      <Static>
        {[-1, 0, 1].map((k) => (
          <group key={k} position-x={k * P}>
            {PYLONS.map((x) => <Pylon key={x} x={x} />)}
            {ws.map((w, i) => <Part key={i} geo={w} m={M.wire} castShadow={false} />)}
          </group>
        ))}
      </Static>
    </group>
  )
}
