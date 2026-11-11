import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, Float32BufferAttribute, Object3D, PlaneGeometry, type Group, type InstancedMesh, type Mesh } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { TAU, rand, seeded, smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, noRay, rbox } from '../../parts'
import { blob, cone, ell, pair } from '../../blob'
import { CURRENT, D, caustic } from './materials'
import { floorY } from './Seabed'

const dummy = new Object3D()

/** Un ruban de kelp : une lame qui monte (uv.y de 0 au pied à 1 en haut), large au milieu, avec ses flotteurs. */
function kelpGeo(h: number) {
  const N = 12, pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let j = 0; j <= N; j++) {
    const v = j / N, w = 0.05 + Math.sin(Math.PI * Math.min(1, v * 1.1)) * 0.11, y = v * h, wob = Math.sin(v * 7) * 0.06
    for (const s of [-1, 1]) { pos.push(s * w + wob, y, Math.sin(v * 5) * 0.03 * s); uv.push(s > 0 ? 1 : 0, v) }
  }
  for (let j = 0; j < N; j++) { const a = j * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals()
  return g
}

/** La forêt de kelp : des rubans en touffes, qui ondulent dans le courant (le shader `current`, sans calcul côté processeur). */
export function Kelp() {
  const blades = useMemo(() => {
    const r = seeded(7), out: { g: BufferGeometry; p: [number, number, number]; ry: number; dark: boolean }[] = []
    const tufts: [number, number][] = [[-6.6, -0.4], [-4.4, -5.6], [-1.6, -6.6], [3.4, -6.8], [7.6, -3.8], [-7.8, 4.4], [8.4, 3.4]]
    tufts.forEach(([x, z]) => {
      for (let i = 0; i < 6; i++) {
        const px = x + (r() - 0.5) * 1.2, pz = z + (r() - 0.5) * 1.2, h = 2.6 + r() * 2.8
        out.push({ g: kelpGeo(h), p: [px, floorY(px, pz) - 0.05, pz], ry: r() * TAU, dark: r() < 0.4 })
      }
    })
    return out
  }, [])
  return (
    <Static>
      {blades.map((b, i) => <mesh key={i} geometry={b.g} material={b.dark ? D.kelpDark : D.kelp} position={b.p} rotation-y={b.ry} raycast={noRay} />)}
    </Static>
  )
}

/** Un poisson : corps en goutte, queue en éventail, nageoire dorsale (couleur dans les sommets, teinte par banc). */
function fishGeo() {
  const b = SPH.clone().scale(0.16, 0.08, 0.05).toNonIndexed()
  const tail = cyl(0.001, 0.07, 0.12, 8).clone().rotateZ(Math.PI / 2).scale(1, 1, 0.3).translate(-0.19, 0, 0).toNonIndexed()
  const fin = cyl(0.001, 0.04, 0.06, 6).clone().scale(1.4, 1, 0.3).translate(0.02, 0.08, 0).toNonIndexed()
  const eye = SPH.clone().scale(0.018, 0.018, 0.018).translate(0.1, 0.02, 0.04).toNonIndexed()
  const eye2 = eye.clone().translate(0, 0, -0.08)
  const paint = (g: BufferGeometry, c: number) => { const col = new Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(a, i * 3); g.setAttribute('color', new Float32BufferAttribute(a, 3)); return g }
  for (const g of [b, tail, fin, eye, eye2]) for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k)
  return mergeGeometries([paint(b, 0xffffff), paint(tail, 0xdddddd), paint(fin, 0xdddddd), paint(eye, 0x1a1a22), paint(eye2, 0x1a1a22)])!
}
const FISH = fishGeo()

/** Les bancs : [centre x, y, z, rayon, vitesse (rad/s), nombre, teinte]. */
const SCHOOLS: [number, number, number, number, number, number, number][] = [
  [-5.9, 0.8, 2.0, 1.8, 0.32, 14, 0xffb44a], [6.3, 2.6, -4.2, 1.9, -0.26, 12, 0x7ad8f0], [3.0, -1.8, 5.9, 1.6, 0.4, 10, 0xf47a9a], [-3.0, 4.6, -6.5, 2.6, -0.2, 16, 0xf4f0a0],
]

/** Les bancs de poissons qui tournent autour du sous-marin, chacun à sa couleur ; un seul tracé pour tous. */
export function Schools() {
  const mesh = useRef<InstancedMesh>(null!)
  const fish = useMemo(() => {
    const r = seeded(3), out: { s: number; ph: number; dy: number; dr: number; c: number }[] = []
    SCHOOLS.forEach(([, , , , , n, c], s) => { for (let i = 0; i < n; i++) out.push({ s, ph: r() * 1.2, dy: (r() - 0.5) * 0.6, dr: (r() - 0.5) * 0.7, c }) })
    return out
  }, [])
  const t = useRef(0)
  useFrame((_, dt) => {
    if (!reduceMotion) t.current += Math.min(dt, 0.05)
    const m = mesh.current
    fish.forEach((f, i) => {
      const [cx, cy, cz, rad, sp] = SCHOOLS[f.s], a = t.current * sp + f.ph, R = rad + f.dr
      dummy.position.set(cx + Math.cos(a) * R, cy + f.dy + Math.sin(a * 2 + f.ph * 3) * 0.12, cz + Math.sin(a) * R)
      // le poisson regarde dans le sens de la course (tangente au cercle)
      dummy.rotation.set(0, -a - (sp > 0 ? Math.PI / 2 : -Math.PI / 2), Math.sin(t.current * 6 + i) * 0.08)
      dummy.scale.setScalar(1.6)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  const colors = useMemo(() => fish.map((f) => new Color(f.c)), [fish])
  return (
    <instancedMesh ref={mesh} args={[FISH, D.fish, fish.length]} frustumCulled={false} raycast={noRay} userData={LIVE}
      onUpdate={(m) => { colors.forEach((c, i) => m.setColorAt(i, c)); if (m.instanceColor) m.instanceColor.needsUpdate = true }} />
  )
}

/** La baleine : une seule peau (corps, tête, ventre clair à sillons, nageoires, nageoire caudale), qui passe au loin, très lentement. */
const WHALE = blob([
  ell([0, 0, 0], [1.4, 0.55, 0.6], { color: 0x4a6e8a }),
  ell([1.1, -0.05, 0], [0.75, 0.45, 0.52], { color: 0x4a6e8a, k: 0.25 }),
  ell([0.6, -0.32, 0], [1.3, 0.22, 0.44], { color: 0xd8e4ea, k: 0.2 }),
  ell([-1.4, 0.05, 0], [0.7, 0.28, 0.3], { color: 0x4a6e8a, k: 0.3 }),
  ell([-2.0, 0.1, 0], [0.4, 0.14, 0.18], { color: 0x4a6e8a, k: 0.2 }),
  ...pair(ell([-2.35, 0.12, 0.32], [0.3, 0.05, 0.3], { color: 0x3e5e78, rot: [0, 0.4, 0], k: 0.12 })),
  ...pair(ell([0.7, -0.35, 0.62], [0.4, 0.06, 0.22], { color: 0x3e5e78, rot: [0.3, -0.5, 0], k: 0.1 })),
  ...pair(ell([1.45, 0.08, 0.44], [0.06, 0.06, 0.06], { color: 0x1a2430, k: 0.02 })),
  cone([0.5, 0.48, 0], [0.2, 0.62, 0], 0.08, 0.02, { color: 0x4a6e8a, k: 0.1 }),
], { h: 0.06, k: 0.2 })

/**
 * La course de la baleine, dans le repère de l'écran : elle glisse de gauche à droite (u, en mètres à l'écran) un peu derrière la
 * pièce (recul D), en arc : basse sur les côtés, où l'eau est libre, elle passe juste au-dessus du coin du fond au milieu, plus haut
 * que le banc jaune. Aux bouts, loin de la pièce, elle se fond dans l'eau (le fondu des matériaux du dehors).
 */
const WHALE_D = 2.1, WHALE_U = 15
const SX = Math.SQRT1_2
/** Hauteur à l'écran au-dessus du centre visé (y = 1,85), le long de la course. */
const whaleSy = (u: number) => 5.25 - 2.4 * (u / 12) ** 2

export function Whale() {
  const g = useRef<Group>(null!), t = useRef(0.42)
  useFrame((_, dt) => {
    if (!reduceMotion) t.current = (t.current + Math.min(dt, 0.05) * 0.011) % 1
    const u = -WHALE_U + t.current * WHALE_U * 2, sw = Math.sin(t.current * 14)
    // de l'écran au monde (caméra dans l'axe (1, 0,8, 1)) : u le long de (1, 0, -1), recul D vers (-1, 0, -1) ; la hauteur à l'écran
    // donne y (l'axe vertical de l'écran monte de 0,871 par mètre de y et de 0,492 par mètre de recul)
    const y = (whaleSy(u) - 0.492 * WHALE_D) / 0.871 + 1.85 + sw * 0.15
    g.current.position.set((u - WHALE_D) * SX, y, (-u - WHALE_D) * SX)
    // la tête vers la droite de l'écran, le nez qui suit la pente de l'arc, un lent roulis
    const slope = -2.4 * 2 * u / 144 / 0.871
    g.current.rotation.set(0, Math.PI / 4, Math.atan(slope) * 0.8 + Math.cos(t.current * 14) * 0.03)
  })
  return (
    <group ref={g} userData={LIVE}>
      <mesh geometry={WHALE} material={D.whale} scale={1.05} raycast={noRay} />
    </group>
  )
}

/** Des bulles qui montent des fissures du fond, en colonnes, se balancent et repartent d'en bas. */
export function Bubbles() {
  const mesh = useRef<InstancedMesh>(null!)
  const list = useMemo(() => {
    const vents: [number, number][] = [[-4.6, 3.0], [5.0, -2.4], [-2.6, 6.0], [6.6, 2.2]]
    return Array.from({ length: 36 }, (_, i) => {
      const [x, z] = vents[i % vents.length]
      return { x, z, y: rand(0, 8), v: rand(0.5, 0.9), s: rand(0.03, 0.07), ph: rand(0, 6) }
    })
  }, [])
  useFrame((_, dt) => {
    const m = mesh.current
    list.forEach((b, i) => {
      if (!reduceMotion) { b.y += Math.min(dt, 0.05) * b.v; b.ph += dt * 2 }
      if (b.y > 8) b.y = 0
      const y = floorY(b.x, b.z) + b.y
      dummy.position.set(b.x + Math.sin(b.ph) * 0.06, y, b.z + Math.cos(b.ph * 0.8) * 0.06)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(b.s * Math.min(1, b.y * 2) * (1 - Math.max(0, b.y - 7)))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[SPH, D.bubble, list.length]} frustumCulled={false} raycast={noRay} renderOrder={3} />
}

/** Les rais de lumière qui descendent de la surface : de longues bandes pâles, additives, qui oscillent doucement. */
export function Rays() {
  const refs = useRef<(Mesh | null)[]>([])
  const rays = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: -7 + i * 2.3 + rand(-0.5, 0.5), z: -6 + rand(-1, 1) + (i % 2) * 3, w: rand(0.25, 0.6), ph: rand(0, 6) })), [])
  const geo = useMemo(() => {
    const g = new PlaneGeometry(1, 12, 1, 4)
    const col = new Float32Array(g.attributes.position.count * 4)
    for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i); col.set([1, 1, 1, Math.max(0, (y + 6) / 12) ** 1.5], i * 4) }
    g.setAttribute('color', new Float32BufferAttribute(col, 4))
    return g
  }, [])
  useFrame(({ clock }, dt) => {
    const n = smooth(mood.night), dim = 1 - Math.max(mood.rain * 0.4, mood.storm * 0.6)
    D.ray.opacity = 0.09 * (1 - n * 0.85) * dim
    caustic.offset.x += Math.min(dt, 0.05) * 0.02
    caustic.offset.y += Math.min(dt, 0.05) * 0.013
    D.caustic.opacity = 0.28 * (1 - n * 0.8) * dim
    if (!reduceMotion) CURRENT.uTime.value = clock.elapsedTime
    rays.forEach((r, i) => { const m = refs.current[i]; if (m) m.rotation.z = 0.25 + Math.sin(clock.elapsedTime * 0.2 + r.ph) * 0.05 })
  })
  return (
    <>
      {rays.map((r, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m }} geometry={geo} material={D.ray} position={[r.x, 3.6, r.z]} rotation={[0, Math.PI / 4, 0.25]} scale={[r.w, 1, 1]} renderOrder={1} raycast={noRay} />
      ))}
    </>
  )
}

/** Dehors de la coque : l'hélice qui tourne à l'arrière (vers -x) et le projecteur de proue, qui s'allume la nuit. */
export function HullGear() {
  const prop = useRef<Group>(null!)
  // une copie : `cyl` rend une géométrie partagée en cache ; la tourner sur place la retournait encore à chaque visite (le cône finissait dressé dans l'eau).
  // Le haut de `cyl(haut, bas)` est en +y, donc en +x après la rotation : le bout large va au loin, le bout étroit reste sur la lentille
  const beam = useMemo(() => cyl(1.1, 0.12, 5, 20).clone().translate(0, 2.5, 0).rotateZ(-Math.PI / 2), [])
  useFrame((_, dt) => {
    if (!reduceMotion) prop.current.rotation.x += Math.min(dt, 0.05) * 2.2
    const k = Math.min(1, smooth(mood.night) + mood.storm * 0.4)
    D.beam.opacity = k * 0.2
    D.lens.emissiveIntensity = 0.3 + k * 1.6
  })
  return (
    <>
      <Static>
        {/* l'arbre d'hélice et son carénage */}
        <Part geo={cyl(0.1, 0.22, 0.7, 16)} m={D.hull} p={[-3.75, -1.2, 0]} rotation-z={Math.PI / 2} />
        {/* le projecteur sur la proue (+x) */}
        <Part geo={cyl(0.22, 0.26, 0.3, 18)} m={D.brass} p={[3.6, -0.35, 0.9]} rotation-z={Math.PI / 2} />
        <Part geo={cyl(0.19, 0.19, 0.02, 18)} m={D.lens} p={[3.76, -0.35, 0.9]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.2, 0.1, 0.3, 0.03)} m={D.brass} p={[3.48, -0.5, 0.9]} castShadow={false} />
      </Static>
      <group ref={prop} position={[-4.15, -1.2, 0]} userData={LIVE}>
        <Static>
          <Part geo={SPH} m={D.brass} scale={[0.14, 0.12, 0.12]} />
          {[0, 1, 2, 3].map((i) => (
            <Part key={i} geo={SPH} m={D.brass} p={[0, Math.cos((i / 4) * TAU) * 0.32, Math.sin((i / 4) * TAU) * 0.32]} rotation-x={(i / 4) * TAU} scale={[0.04, 0.3, 0.13]} />
          ))}
        </Static>
      </group>
      <mesh geometry={beam} material={D.beam} position={[3.78, -0.35, 0.9]} rotation-y={-0.25} renderOrder={5} raycast={noRay} />
    </>
  )
}
