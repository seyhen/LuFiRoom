import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, ExtrudeGeometry, LatheGeometry, Shape, Vector2, type InstancedMesh, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { Batch, Part, SPH, cyl, noRay, type Item } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { C } from './materials'

const POS = [-2.0, 0, 2.0] as const

interface Tier {
  /** Bas de l'étage. */
  y: number
  /** Rayon du bord. */
  r: number
  h: number
  /** Rayon du haut (0 : la cime). */
  top: number
}
// Quatre étages, chacun posé dans celui du dessous.
const TIERS: Tier[] = [
  { y: 0.4, r: 0.98, h: 0.8, top: 0.3 },
  { y: 0.86, r: 0.8, h: 0.74, top: 0.24 },
  { y: 1.28, r: 0.62, h: 0.66, top: 0.18 },
  { y: 1.66, r: 0.44, h: 0.66, top: 0 },
]
const LIP = 0.09

const bez = (a: number, b: number, c: number, d: number, u: number) => {
  const v = 1 - u
  return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d
}
/** Un point du flanc (rayon, hauteur), de u = 0 (le bord) à 1 (le haut). */
const flank = ({ r, h, top }: Tier, u: number) =>
  [bez(r, r * 0.92, top + (r - top) * 0.35, top, u), bez(LIP, LIP + (h - LIP) * 0.35, h * 0.85, h, u)] as const

/** Un étage : une jupe ronde au bord arrondi, sans pointe (le haut de la cime est bombé). */
function tierGeo(t: Tier) {
  const pts = [new Vector2(0.001, 0), new Vector2(t.r * 0.7, 0.005)]
  for (let i = 1; i <= 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * (Math.PI / 2)
    pts.push(new Vector2(t.r - LIP + Math.cos(a) * LIP, LIP + Math.sin(a) * LIP))
  }
  for (let i = 1; i <= 14; i++) {
    const [x, y] = flank(t, i / 14)
    pts.push(new Vector2(Math.max(x, 0.001), y))
  }
  if (t.top > 0) pts.push(new Vector2(0.001, t.h))
  return new LatheGeometry(pts, 32)
}
const tiers = TIERS.map(tierGeo)
/** La cime seule : petits sapins du manteau. */
export const treeTop = tiers[3]

/** Étoile à cinq branches aux bouts arrondis (la cime du sapin, les biscuits). `depth` : épaisseur. */
export function starGeo(R: number, r: number, depth = 0.05) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r : R
    return new Vector2(Math.cos(a) * d, Math.sin(a) * d)
  })
  const k = 0.3, s = new Shape()
  const start = pts[0].clone().lerp(pts[1], k)
  s.moveTo(start.x, start.y)
  for (let i = 1; i <= 10; i++) {
    const p = pts[i % 10]
    if (i % 2) {
      s.lineTo(p.x, p.y)
      continue
    }
    const a = pts[i - 1].clone().lerp(p, 1 - k), b = p.clone().lerp(pts[(i + 1) % 10], k)
    s.lineTo(a.x, a.y)
    s.quadraticCurveTo(p.x, p.y, b.x, b.y)
  }
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.7, bevelSize: depth * 0.6, bevelSegments: 4, curveSegments: 6 })
  g.center()
  return g
}
const STAR = starGeo(0.2, 0.095)
const STAR_Y = TIERS[3].y + TIERS[3].h + 0.15

// Tirage fixe, pour que le sapin soit le même à chaque visite.
const hash = (i: number) => {
  const v = Math.sin(i * 12.9898) * 43758.5453
  return v - Math.floor(v)
}
const on = (t: Tier, a: number, u: number, out: number): [number, number, number] => {
  const [rad, y] = flank(t, u)
  return [POS[0] + Math.cos(a) * (rad + out), t.y + y, POS[2] + Math.sin(a) * (rad + out)]
}

// Boules : rouge canneberge, or, crème, rose, bleu canard.
const BAUBLE = [0xd9506a, 0xf3c14e, 0xfff4e6, 0xf3a3b8, 0x4fb0bf]
const baubles: Item[] = TIERS.flatMap((t, k) => {
  const n = [7, 6, 5, 3][k]
  return Array.from({ length: n }, (_, i) => {
    const j = k * 10 + i, a = ((i + hash(j) * 0.5) / n) * TAU + k * 0.9
    return { p: on(t, a, 0.06 + hash(j + 50) * 0.16, 0.02), s: 0.065 + hash(j + 90) * 0.025, c: BAUBLE[(i + k) % BAUBLE.length] }
  })
})

// Ampoules : une spirale par étage. Or et blanc chaud surtout, un peu de rose et de menthe.
const BULB = [0xffd36b, 0xfff0c8, 0xffd36b, 0xff9fb0, 0xfff0c8, 0x9ff0d4]
const bulbs: Item[] = TIERS.flatMap((t, k) => {
  const n = [15, 12, 9, 6][k]
  return Array.from({ length: n }, (_, i) => ({ p: on(t, (i / n) * TAU + k * 1.7, 0.1 + (0.45 * i) / n, 0.015), s: 0.036, c: BULB[(i + k * 2) % BULB.length] }))
})
const bulbBase = bulbs.map((b) => new Color(b.c))

const lit = new Color()
/** Fait scintiller une série d'ampoules (`base` : leurs couleurs), plus vives la nuit. Fixes si on réduit les animations. */
export function twinkle(mesh: InstancedMesh, base: Color[], t: number) {
  const n = smooth(mood.night)
  base.forEach((c, i) => {
    const tw = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.9 + hash(i + 200) * TAU)
    mesh.setColorAt(i, lit.copy(c).multiplyScalar(0.62 + n * 0.2 + tw * (0.12 + n * 0.25)))
  })
  mesh.instanceColor!.needsUpdate = true
}

/** Le sapin : étages arrondis, boules, guirlande qui scintille (plus vive la nuit), étoile dorée, jupe de sapin. */
export function ChristmasTree() {
  const lights = useRef<InstancedMesh>(null!), glow = useRef<Sprite>(null!), starGlow = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const n = smooth(mood.night)
    twinkle(lights.current, bulbBase, clock.elapsedTime)
    C.gold.emissiveIntensity = 0.2 + n * 0.8
    glow.current.material.opacity = n * 0.42
    starGlow.current.material.opacity = 0.12 + n * 0.6
  })
  return (
    <group>
      {/* jupe de sapin : crème bordée, canneberge au centre */}
      <mesh geometry={cyl(0.96, 0.96, 0.03, 40)} material={C.wool} position={[POS[0], 0.015, POS[2]]} receiveShadow />
      <mesh geometry={cyl(0.84, 0.86, 0.04, 40)} material={C.cranberry} position={[POS[0], 0.02, POS[2]]} receiveShadow />
      <Part geo={cyl(0.12, 0.15, 0.46, 14)} m={C.log} p={[POS[0], 0.23, POS[2]]} />
      {tiers.map((g, i) => (
        <Part key={i} geo={g} m={C.pine} p={[POS[0], TIERS[i].y, POS[2]]} rotation-y={i * 0.7} />
      ))}
      <Batch geo={SPH} m={C.tint} items={baubles} />
      <Batch ref={lights} geo={SPH} m={C.bulb} items={bulbs} />
      <Part geo={STAR} m={C.gold} p={[POS[0], STAR_Y, POS[2]]} rotation-y={Math.PI / 4} castShadow={false} />
      <sprite ref={starGlow} scale={0.85} position={[POS[0] + 0.05, STAR_Y, POS[2] + 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      <sprite ref={glow} scale={3.4} position={[POS[0] + 0.3, 1.3, POS[2] + 0.3]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}
