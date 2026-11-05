import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Vector3, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { rb } from './box'
import { Part, cyl, orient, type V3 } from '../parts'
import { Static } from '../Static'
import { reduceMotion, useSquash } from '../anim'
import { T } from './materials'
import { HAMMOCK, TRUNK, LIMB } from './layout'
import { trunkR } from './Oak'

// La période d'un aller-retour, la même que celle du son (audio/channels/hammock.ts, SWING) : la toile suit les bouts de course qu'on entend.
const SWING = 4.4
const [A, B] = [new Vector3(...HAMMOCK.a), new Vector3(...HAMMOCK.b)]
const SPAN = A.distanceTo(B)
// la toile, de f0 à f1 le long de la portée ; les barres d'écartement juste au-delà ; la flèche au milieu
const F0 = 0.62, F1 = SPAN - 0.62, END_Y = -0.4, LOW = -0.88, HALF = 0.4
/** La hauteur du fond de la toile (axe du hamac), à la distance x de l'attache du tronc. */
const yAt = (x: number) => {
  const u = (x - F0) / (F1 - F0)
  return END_Y + (LOW - END_Y) * (1 - (2 * u - 1) ** 2)
}

/** La pente du fond de la toile à la distance x. */
const slopeAt = (x: number) => (yAt(x + 0.01) - yAt(x - 0.01)) / 0.02

/** La toile : un berceau qui se creuse au milieu, qui se resserre vers les barres, bords relevés. u le long, v en travers. */
function clothGeo() {
  const nu = 36, nv = 14, pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let i = 0; i <= nu; i++) {
    const u = i / nu, x = F0 + (F1 - F0) * u, s = Math.sin(Math.PI * u), w = HALF * (0.72 + 0.28 * s)
    for (let j = 0; j <= nv; j++) {
      const v = (j / nv) * 2 - 1
      pos.push(x, yAt(x) + 0.26 * s * v * v + 0.02 * (1 - s) * v * v, v * w * (1 - 0.12 * s * v * v))
      uv.push(u, j / nv)
    }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = a + nv + 1
    idx.push(a, b, a + 1, b, b + 1, a + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Un bout de ficelle droit entre deux points. */
function Cord({ a, b, r = 0.009 }: { a: V3; b: V3; r?: number }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d)
  return <Part geo={cyl(r, r, 1, 5)} m={T.rope} scale={[1, l, 1]} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} />
}

/** Un bout du hamac : la barre d'écartement, les ficelles en éventail jusqu'à l'anneau, l'anneau. `x` la barre, `tie` l'anneau. */
function End({ x, tie }: { x: number; tie: number }) {
  const y = yAt(x) + 0.02
  return (
    <>
      <Part geo={cyl(0.024, 0.024, HALF * 2 + 0.12, 10)} m={T.plankDark} p={[x, y, 0]} rotation-x={Math.PI / 2} />
      {[-1, -0.5, 0, 0.5, 1].map((k) => <Cord key={k} a={[x, y + 0.02, k * HALF]} b={[tie, -0.03, 0]} />)}
      <Part m={T.iron} p={[tie, 0, 0]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.035, 0.009, 6, 16]} />
      </Part>
    </>
  )
}

/**
 * Le hamac de toile rayée, tendu entre le tronc et la seconde branche : la toile en berceau, ses deux barres d'écartement et leurs
 * ficelles en éventail, les cordes nouées en plusieurs tours autour de l'écorce. Dedans : un coussin, un plaid jeté, un livre ouvert
 * retourné. Quand le son joue, il se balance autour de son axe, au rythme qu'on entend (ses bouts de course tombent sur le « mmh » de
 * la corde) ; sinon il bouge à peine.
 */
export function Hammock() {
  const g = useRef<Group>(null!), swing = useRef<Group>(null!)
  const st = useRef({ ph: 0, amp: 0, corr: 0, seen: useStore.getState().pulses.hammock ?? 0 })
  useSquash('hammock', g)
  const cloth = useMemo(clothGeo, [])
  const dir = new Vector3().subVectors(B, A)
  const ry = -Math.atan2(dir.z, dir.x)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'hammock')
    const n = store.pulses.hammock ?? 0
    if (n !== s.seen) {
      s.seen = n
      // un bout de course s'entend : la phase devrait être à π/2 près d'un multiple de π ; on rattrape l'écart en douceur
      const e = ((s.ph - Math.PI / 2) % Math.PI + Math.PI * 1.5) % Math.PI - Math.PI / 2
      s.corr = -e
    }
    const c = s.corr * Math.min(1, dt * 2)
    s.corr -= c
    s.ph = (s.ph + dt * (TAU / SWING) + c) % (TAU * 100)
    s.amp = approach(s.amp, reduceMotion ? 0 : on ? 0.16 : 0.02, dt * 0.06)
    swing.current.rotation.x = Math.sin(s.ph) * s.amp
  })
  const mid = (F0 + F1) / 2
  return (
    <>
      {/* les attaches, qui ne bougent pas : plusieurs tours de corde autour du tronc et autour de la branche */}
      {[0, 1, 2].map((k) => (
        <Part key={k} m={T.rope} p={[TRUNK.x, HAMMOCK.a[1] + 0.03 - k * 0.035, TRUNK.z]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[trunkR(HAMMOCK.a[1]) + 0.012, 0.016, 6, 28]} />
        </Part>
      ))}
      {[0, 1, 2].map((k) => (
        <Part key={`l${k}`} m={T.rope} p={[LIMB.x, HAMMOCK.b[1] + 0.03 - k * 0.035, LIMB.z]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.2, 0.016, 6, 20]} />
        </Part>
      ))}
      <group ref={g} userData={{ id: 'hammock' }} position={HAMMOCK.a} rotation-y={ry}>
        <group ref={swing}>
          <Static>
            {/* la corde de l'anneau au nœud, de chaque côté */}
            <Cord a={[0.02, 0, 0]} b={[0.3, -0.04, 0]} r={0.014} />
            <Cord a={[SPAN - 0.02, 0, 0]} b={[SPAN - 0.3, -0.04, 0]} r={0.014} />
            <End x={F0 - 0.02} tie={0.3} />
            <End x={F1 + 0.02} tie={SPAN - 0.3} />
            <mesh geometry={cloth} material={T.hammock} castShadow receiveShadow />
            {/* le coussin, côté branche (la tête), couché dans la pente de la toile */}
            <group position={[F1 - 0.45, yAt(F1 - 0.45) + 0.075, 0]} rotation-z={Math.atan(slopeAt(F1 - 0.45))}>
              <Part geo={rb(0.34, 0.12, 0.42, 0.055)} m={T.cushion3} />
              <Part geo={rb(0.26, 0.012, 0.32, 0.006)} m={T.linen} p={[0, 0.062, 0]} castShadow={false} />
            </group>
            {/* le plaid terracotta plié en deux, jeté en travers du fond : à plat sur la toile, suivant sa pente */}
            <group position={[mid - 0.3, yAt(mid - 0.3) + 0.045, 0.0]} rotation-z={Math.atan(slopeAt(mid - 0.3))}>
              <Part geo={rb(0.5, 0.045, 0.62, 0.02)} m={T.blanket} />
              <Part geo={rb(0.5, 0.012, 0.05, 0.005)} m={T.cushion3} p={[0, 0.025, 0.2]} castShadow={false} />
              <Part geo={rb(0.5, 0.012, 0.05, 0.005)} m={T.cushion3} p={[0, 0.025, 0.12]} castShadow={false} />
            </group>
            {/* le livre ouvert, retourné sur le plaid */}
            <group position={[mid + 0.32, yAt(mid + 0.32) + 0.06, -0.08]} rotation-y={0.4}>
              {/* ouvert et retourné : deux plats en toit, les pages dessous */}
              {[-1, 1].map((k) => (
                <Part key={k} geo={rb(0.17, 0.014, 0.13, 0.005)} m={T.cover} p={[0, 0.02, k * 0.06]} rotation-x={k * 0.28} castShadow={false} />
              ))}
              <Part geo={rb(0.14, 0.035, 0.02, 0.008)} m={T.paper} p={[0, -0.005, 0]} castShadow={false} />
            </group>
          </Static>
        </group>
      </group>
    </>
  )
}

/** Où pend le bouton du hamac : au creux de la toile. */
export const HAMMOCK_ANCHOR: V3 = (() => {
  const m = A.clone().lerp(B, 0.5)
  return [m.x, m.y + LOW + 0.15, m.z]
})()
