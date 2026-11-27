import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Euler, InstancedBufferAttribute, SphereGeometry, type BufferGeometry, type Group, type InstancedMesh, type Mesh } from 'three'
import { reduceMotion } from '../../anim'
import { SPH_MID, noRay, type V3 } from '../../parts'
import { bulbGlowTex } from '../../textures'
import { O, bubbleMaterial } from './materials'
import { ROOM, S, roomGap, type View } from './layout'
import { candle, duck, monstera, soap, starfish, towels } from './things'

// Les grosses bulles : jusqu'à six, avec chacune une petite scène lisible en gros plan (un canard de bain, un monstera en pot, une bougie allumée,
// des serviettes roulées, un savon, une étoile de mer). La bulle est une coque presque transparente (bords irisés, centre clair, sans écrire
// la profondeur) : l'objet, opaque, se voit à travers. Elles se placent à l'écran autour de la pièce, loin de sa silhouette, et flottent doucement.

type Kind = 'duck' | 'monstera' | 'candle' | 'towels' | 'soap' | 'starfish'

export interface Slot {
  kind: Kind
  /** Le centre à l'écran, et le rayon. */
  sx: number
  sy: number
  r: number
  /** Le centre dans le monde (`dz` ajusté pour que la bulle ne morde pas la mousse). */
  p: V3
}

const RADIUS: Record<Kind, number> = { duck: 1.55, monstera: 1.6, candle: 1.3, towels: 1.4, soap: 1.35, starfish: 1.3 }

export interface Layout {
  slots: Slot[]
  /** Où poser la lune (libre de bulles). */
  moon: [number, number]
}

/**
 * Où poser les six bulles, selon le champ visible : on cherche pour chacune, au plus près de l'endroit voulu, une place qui ne touche ni la
 * silhouette de la pièce, ni une autre bulle, ni le bord de l'écran ou de l'interface. Sur un écran large, les côtés ; sur un téléphone,
 * les coins du haut et du bas, autour de la pièce (plus petites, et parfois moins nombreuses, s'il le faut). Le long du rayon de la caméra,
 * on s'approche jusqu'à ce que le dessous de la bulle passe au-dessus de la mousse (rien ne bouge à l'écran).
 */
export function bigSlots(v: View, foam: (x: number, z: number) => number): Layout {
  const W = v.r - ROOM.half, wide = W >= 4
  const want: [Kind, number, number, number][] = wide
    ? [
        ['duck', -(ROOM.half + 0.62 * W), 0.9, -2],
        ['monstera', ROOM.half + 0.55 * W, 2.4, -2],
        ['candle', -(ROOM.half + 0.3 * W), Math.min(5.6, v.ut - 1.3), -3],
        ['starfish', ROOM.half + 0.22 * W, Math.min(5.8, v.ut - 1.2), -3],
        ['towels', -(ROOM.half + 0.36 * W), Math.max(-2.7, v.ub + 2), 1],
        ['soap', ROOM.half + 0.66 * W, Math.max(-2.2, v.ub + 2), 1],
      ]
    : [
        ['candle', -4.6, v.ut - 1, -3],
        ['starfish', 4.6, v.ut - 1, -3],
        ['duck', -4.6, v.ub + 1.2, 1],
        ['towels', 4.6, v.ub + 1.2, 1],
        ['monstera', -1.6, v.ut - 0.9, -3],
        ['soap', 1.7, v.ub + 0.9, 1],
      ]
  const placed: { sx: number; sy: number; r: number }[] = [], slots: Slot[] = []
  const fit = (tx: number, ty: number, r0: number, gap: number, minK: number) => {
    for (let k = 1; k >= minK - 1e-6; k -= 0.1) {
      const r = r0 * k
      let best: [number, number] | undefined, bd = Infinity
      for (let x = v.l + r + 0.15; x <= v.r - r - 0.15; x += 0.25) {
        for (let y = v.ub + r + 0.1; y <= v.ut - r - 0.1; y += 0.25) {
          if (roomGap(x, y) < r + gap || placed.some((o) => Math.hypot(o.sx - x, o.sy - y) < o.r + r + 0.3)) continue
          const d = Math.hypot(x - tx, y - ty)
          if (d < bd) { bd = d; best = [x, y] }
        }
      }
      if (best) return { sx: best[0], sy: best[1], r }
    }
  }
  for (const [kind, tx, ty, dz0] of want) {
    const f = fit(tx, ty, RADIUS[kind], 0.25, 0.65)
    if (!f) continue
    placed.push(f)
    let dz = dz0, p = S(f.sx, f.sy, dz)
    for (; dz < dz0 + 18; dz += 0.5) {
      p = S(f.sx, f.sy, dz)
      let gap = 9
      for (let k = 0; k < 13; k++) {
        const a = (k / 13) * 6.283, d = k ? f.r * 0.85 : 0, x = p[0] + Math.cos(a) * d, z = p[2] + Math.sin(a) * d
        gap = Math.min(gap, p[1] - Math.sqrt(Math.max(0, f.r * f.r - d * d)) - foam(x, z))
      }
      if (gap > 0.25) break
    }
    slots.push({ kind, sx: f.sx, sy: f.sy, r: f.r, p })
  }
  const m = fit(wide ? -(ROOM.half + 0.55 * W) : v.l + 1.9, v.ut - 1.7, 0.9, 0.5, 1)
  return { slots, moon: m ? [m.sx, m.sy] : [v.l + 1.5, v.ut - 1.2] }
}

/** Le contenu de chaque bulle : sa géométrie (une peau), son échelle (pour le rayon de base), son décalage vers le bas et son cap. */
const THINGS: Record<Kind, { make: () => BufferGeometry; s: number; lift: number; rot: V3 }> = {
  duck: { make: duck, s: 6.0, lift: -0.72, rot: [0, -Math.PI / 4, 0] },
  monstera: { make: monstera, s: 2.5, lift: -1.15, rot: [0, 0.5, 0] },
  candle: { make: candle, s: 2.1, lift: -0.95, rot: [0, 0.4, 0] },
  towels: { make: towels, s: 1.55, lift: -0.05, rot: [0, -0.62, 0] },
  soap: { make: soap, s: 1.85, lift: -0.58, rot: [0, -0.5, 0] },
  starfish: { make: starfish, s: 1.65, lift: 0, rot: [0, 0, 0] },
}
/** Une étoile de mer fait face à la caméra, un peu relevée. */
const FACE = new Euler(-0.6, Math.PI / 4, 0.3, 'YXZ')

const BIG = new SphereGeometry(1, 40, 26)

export function BigBubbles({ slots, onCaps }: { slots: Slot[]; onCaps: (f: () => V3[]) => void }) {
  const n = slots.length
  const shell = useMemo(() => {
    const g = BIG.clone()
    g.setAttribute('aLife', new InstancedBufferAttribute(new Float32Array(n).fill(1), 1))
    g.setAttribute('aHue', new InstancedBufferAttribute(Float32Array.from({ length: n }, (_, i) => i * 0.17 + 0.05), 1))
    return g
  }, [n])
  const mat = useMemo(() => bubbleMaterial(10, 24), [])
  const geos = useMemo(() => slots.map((s) => THINGS[s.kind].make()), [slots])
  useEffect(() => () => { shell.dispose(); mat.dispose() }, [shell, mat])
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])
  const mesh = useRef<InstancedMesh>(null!), groups = useRef<(Group | null)[]>([]), flames = useRef<(Mesh | null)[]>([])
  const bob = useRef<{ ph: number; w: number; pos: V3 }[]>([])
  if (bob.current.length !== n) bob.current = slots.map((_, i) => ({ ph: i * 1.7, w: 0.32 + (i % 3) * 0.07, pos: [0, 0, 0] }))
  // les gouttes de pluie qui éclatent sur le dessus des grosses bulles (voir Bubbles.tsx)
  useEffect(() => onCaps(() => slots.map((s, i): V3 => [s.p[0] + 0.15 * s.r, s.p[1] + s.r * 0.96 + (bob.current[i]?.pos[1] ?? 0), s.p[2] + 0.1 * s.r])), [slots, onCaps])
  useFrame(({ clock }, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), arr = mesh.current.instanceMatrix.array as Float32Array
    slots.forEach((s, i) => {
      const b = bob.current[i], k = s.r / RADIUS[s.kind]
      b.ph += b.w * dt
      const dy = Math.sin(b.ph) * 0.14
      b.pos[1] = dy
      const o = i * 16
      arr.fill(0, o, o + 16)
      arr[o] = arr[o + 5] = arr[o + 10] = s.r
      arr[o + 12] = s.p[0]; arr[o + 13] = s.p[1] + dy; arr[o + 14] = s.p[2]; arr[o + 15] = 1
      const g = groups.current[i]
      if (g) g.position.set(s.p[0], s.p[1] + dy + THINGS[s.kind].lift * k, s.p[2])
      if (g && s.kind !== 'starfish') g.rotation.y = THINGS[s.kind].rot[1] + Math.sin(b.ph * 0.7) * 0.12
      const f = flames.current[i]
      if (f && !reduceMotion) {
        const t = clock.elapsedTime + i * 3
        f.scale.y = 0.19 * (1 + Math.sin(t * 13) * 0.1 + Math.sin(t * 7.1) * 0.07)
        f.rotation.z = Math.sin(t * 5.3) * 0.1
      }
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      {slots.map((s, i) => {
        const t = THINGS[s.kind]
        return (
          <group key={s.kind} ref={(g) => { groups.current[i] = g }} scale={t.s * (s.r / RADIUS[s.kind])} rotation={s.kind === 'starfish' ? FACE : t.rot}>
            <mesh geometry={geos[i]} material={O.thing} receiveShadow raycast={noRay} />
            {s.kind === 'candle' && (
              <>
                <mesh ref={(m) => { flames.current[i] = m }} geometry={SPH_MID} material={O.flame} scale={[0.07, 0.19, 0.07]} position={[0, 0.74, 0]} raycast={noRay} />
                <sprite scale={1.5} position={[0, 0.76, 0]} raycast={noRay}>
                  <spriteMaterial map={bulbGlowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.7} />
                </sprite>
              </>
            )}
          </group>
        )
      })}
      <instancedMesh ref={mesh} args={[shell, mat, n]} frustumCulled={false} renderOrder={2} raycast={noRay} />
    </>
  )
}
