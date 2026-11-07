import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, Float32BufferAttribute, type Group, type Material, type PointsMaterial } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part, cyl, noRay, type V3 } from '../parts'
import { Static } from '../Static'
import { mood, reduceMotion, useSquash, useWorldPointSize } from '../anim'
import { Foliage } from '../nature/Foliage'
import { Rock } from '../nature/Rock'
import { seeded } from '../paint'
import { glowTex } from '../textures'
import { T } from './materials'
import { GROUND, brookPts } from './layout'

const WATER_Y = GROUND.y + 0.012
/** Les points du ruisseau sur la partie opaque du sol. */
const inGround = (pts: [number, number][]) => pts.filter(([x, z]) => Math.hypot(x - GROUND.x, z - GROUND.z) < 7.6)

/** Le ruban d'eau : il suit le ruisseau, plus large dans les méandres ; u en travers, v le long (la texture défile). */
function brookGeo() {
  // seulement là où le sol se voit (il s'efface sur ses bords) ; le ruban s'amincit à ses deux bouts
  const pts = inGround(brookPts(80)), pos: number[] = [], uv: number[] = [], idx: number[] = []
  let v = 0
  pts.forEach(([x, z], i) => {
    const [nx, nz] = pts[Math.min(pts.length - 1, i + 1)], [px, pz] = pts[Math.max(0, i - 1)]
    const end = Math.min(1, i / 6, (pts.length - 1 - i) / 6)
    const dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz) || 1, w = (0.16 + 0.05 * Math.sin(i * 0.4)) * end
    if (i) v += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]) / 1.2
    pos.push(x - (dz / l) * w, WATER_Y, z + (dx / l) * w, x + (dz / l) * w, WATER_Y, z - (dx / l) * w)
    uv.push(0, v, 1, v)
    if (i) {
      const a = (i - 1) * 2
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Les cimes de la forêt en contrebas, tout autour du fond : [forme, pied, demi-tailles, matériau] ; jamais sur le ruisseau. */
function farCrowns() {
  const r = seeded(9), brook = brookPts(60), out: [number, V3, V3, Material, number][] = []
  const mats = [T.far, T.farDeep, T.farLight, T.far, T.farDeep]
  let tries = 0
  while (out.length < 30 && tries++ < 500) {
    // de l'avant gauche au fond, puis à droite : le devant de la scène sort du cadre, inutile d'y planter
    const a = ((95 + r() * 260) * Math.PI) / 180, rad = 4.6 + r() * 5
    const x = Math.cos(a) * rad - 0.4, z = Math.sin(a) * rad - 0.4
    if (Math.hypot(x - GROUND.x, z - GROUND.z) > GROUND.size * 0.42) continue
    const s = 0.75 + r() * 0.7
    if (brook.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < s + 0.35)) continue
    if (out.some(([, p, q]) => Math.hypot(p[0] - x, p[2] - z) < (q[0] + s) * 0.75)) continue
    out.push([(r() * 6) | 0, [x, GROUND.y + 0.25, z], [s, s * (0.9 + r() * 0.5), s], mats[out.length % mats.length], r() * 6])
  }
  return out
}

/**
 * La forêt en contrebas : le sol du sous-bois qui s'efface au loin, les cimes rondes des chênes et des hêtres, quelques sapins, et le
 * ruisseau qui serpente derrière la cabane. C'est l'objet « ruisseau » : quand il chante, l'eau court plus vite et scintille.
 */
export function Forest() {
  const crowns = useMemo(farCrowns, [])
  const rocks = useMemo(() => {
    const pts = inGround(brookPts(60)), r = seeded(21), out: [V3, V3, number][] = []
    for (let i = 3; i < pts.length - 3; i += 4) {
      const [x, z] = pts[i], [nx, nz] = pts[i + 1], dx = nx - x, dz = nz - z, l = Math.hypot(dx, dz) || 1, side = i % 8 === 3 ? 1 : -1, off = 0.3 + r() * 0.12
      const s = 0.16 + r() * 0.14
      out.push([[x - (dz / l) * off * side, GROUND.y, z + (dx / l) * off * side], [s, s * 0.7, s], (r() * 8) | 0])
    }
    return out
  }, [])
  const pines = useMemo<V3[]>(() => [[-7.6, GROUND.y, -1.6], [1.2, GROUND.y, -10.2], [-5.0, GROUND.y, -9.6], [6.5, GROUND.y, -5.6]], [])
  return (
    <>
      <Static>
        <mesh material={T.ground} position={[GROUND.x, GROUND.y, GROUND.z]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
          <planeGeometry args={[GROUND.size, GROUND.size]} />
        </mesh>
        {/* les rochers moussus de la berge, de part et d'autre du ruisseau */}
        {rocks.map(([p, s, v], i) => <Rock key={`r${i}`} v={v} p={p} s={s} ry={i * 1.7} m={T.stone} moss={T.mossRock} shadow={false} />)}
        {crowns.map(([v, p, s, m, ry], i) => (
          <group key={i}>
            <Foliage v={v} p={p} s={s} m={m} ry={ry} shadow={false} />
            <Part geo={cyl(0.06, 0.09, 0.5, 8)} m={T.barkDark} p={[p[0], GROUND.y + 0.2, p[2]]} castShadow={false} />
          </group>
        ))}
        {/* les sapins : trois étages de feuillage taillé, de plus en plus petits */}
        {pines.map((p, i) => (
          <group key={`p${i}`} position={p}>
            <Part geo={cyl(0.06, 0.1, 0.6, 8)} m={T.barkDark} p={[0, 0.3, 0]} castShadow={false} />
            {[0, 1, 2].map((k) => (
              <Foliage key={k} v={(i + k) % 6} p={[0, 0.4 + k * 0.62, 0]} s={[0.75 - k * 0.2, 0.75, 0.75 - k * 0.2]} m={T.pine} style="clipped" shadow={false} />
            ))}
          </group>
        ))}
      </Static>
      <Brook />
    </>
  )
}

/** Où pend le bouton du ruisseau : sur le méandre qu'on voit derrière le garde-corps de droite. */
export const BROOK_ANCHOR: V3 = [-2.6, GROUND.y + 0.2, -7.9]

/** Le ruisseau : le ruban d'eau qui défile, et des étincelles de lumière qui naissent et s'éteignent dessus. */
function Brook() {
  const g = useRef<Group>(null!), pm = useRef<PointsMaterial>(null!)
  const geo = useMemo(brookGeo, [])
  const sparks = useMemo(() => {
    const pts = inGround(brookPts(120)), r = seeded(5)
    const list = pts.filter((_, i) => i % 3 === 0).map(([x, z]) => ({ x: x + (r() - 0.5) * 0.18, z: z + (r() - 0.5) * 0.18, ph: r() * 6.3, sp: 0.6 + r() * 1.4 }))
    const pg = new BufferGeometry()
    pg.setAttribute('position', new Float32BufferAttribute(list.flatMap((s) => [s.x, WATER_Y + 0.02, s.z]), 3))
    pg.setAttribute('color', new Float32BufferAttribute(list.flatMap(() => [1, 1, 1]), 3))
    return { list, pg }
  }, [])
  const st = useRef({ on: 0, flow: 0 })
  useSquash('brook', g)
  useWorldPointSize(pm, 0.09)
  const c = useMemo(() => new Color(), [])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'brook')
    s.on = approach(s.on, on ? 1 : 0, dt * 0.8)
    // l'eau court toujours un peu ; plus vite quand le ruisseau chante
    if (!reduceMotion) s.flow += dt * (0.12 + s.on * 0.35)
    T.water.map!.offset.y = -s.flow
    const col = sparks.pg.attributes.color, night = smooth(mood.night)
    sparks.list.forEach((p, i) => {
      if (!reduceMotion) p.ph += dt * p.sp * (1 + s.on * 1.5)
      const k = Math.max(0, Math.sin(p.ph)) ** 6
      c.setRGB(1, 0.97, 0.85).multiplyScalar(k)
      col.setXYZ(i, c.r, c.g, c.b)
    })
    col.needsUpdate = true
    pm.current.opacity = (0.25 + s.on * 0.75) * (1 - night * 0.6)
  })
  return (
    <group ref={g} userData={{ id: 'brook' }} position={BROOK_ANCHOR}>
      <group position={[-BROOK_ANCHOR[0], -BROOK_ANCHOR[1], -BROOK_ANCHOR[2]]}>
        <mesh geometry={geo} material={T.water} raycast={noRay} renderOrder={1} />
        <points geometry={sparks.pg} raycast={noRay} renderOrder={2}>
          <pointsMaterial ref={pm} map={glowTex} vertexColors sizeAttenuation={false} transparent depthWrite={false} blending={2} opacity={0.3} />
        </points>
        {/* une zone de toucher, invisible, sur le méandre */}
        <mesh position={[BROOK_ANCHOR[0], WATER_Y + 0.05, BROOK_ANCHOR[2]]} rotation-x={-Math.PI / 2} visible={false}>
          <planeGeometry args={[3, 1.6]} />
        </mesh>
      </group>
    </group>
  )
}
