import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, Shape, ShapeGeometry, SplineCurve, Vector2, type BufferGeometry, type Group } from 'three'
import { rand } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { noteTexA, noteTexB } from '../textures'
import { A } from './materials'

/** Le contour de la caisse : un huit aux hanches arrondies (demi-largeur selon la hauteur), de 0 à `LB`. */
const LB = 0.9
const HALF = 0.262
const outline = (scale = 1) => {
  const right = new SplineCurve(
    [[0, 0], [0.12, 0.012], [0.22, 0.07], [0.262, 0.19], [0.245, 0.32], [0.19, 0.43], [0.163, 0.5], [0.17, 0.56], [0.2, 0.66], [0.205, 0.77], [0.17, 0.86], [0.11, 0.9], [0, 0.905]].map(([w, y]) => new Vector2(w, y)),
  ).getPoints(70)
  const c = LB / 2
  const pts = [...right, ...right.slice(0, -1).reverse().map((p) => new Vector2(-p.x, p.y))]
  return pts.map((p) => new Vector2(p.x * scale, c + (p.y - c) * scale))
}

/** La caisse : le contour extrudé, ses arêtes arrondies (vernis roux) ; la table d'harmonie est un plan peint par-dessus. */
const BODY = (() => {
  const g = new ExtrudeGeometry(new Shape(outline()), { depth: 0.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.022, bevelSegments: 4, curveSegments: 4 })
  g.translate(0, 0, -0.075)
  return g
})()
const PLATE = (() => {
  const g = new ShapeGeometry(new Shape(outline(0.955)), 4), uv = g.attributes.uv, p = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / (HALF * 2) + 0.5, p.getY(i) / LB)
  return g
})()
/** La touche : un trapèze d'ébène, large près de la caisse, étroit au sillet. */
const BOARD = (() => {
  const s = new Shape([[-0.04, 0], [0.04, 0], [0.027, 0.55], [-0.027, 0.55]].map(([x, y]) => new Vector2(x, y)))
  return new ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 2 })
})()

const PLATE_Z = 0.114 // le plan de la table d'harmonie, un peu en avant de la caisse
const BRIDGE: V3 = [0, 0.38, PLATE_Z + 0.032]
const TAIL: V3 = [0, 0.1, PLATE_Z + 0.008]
const NUT: V3 = [0, 1.3, 0.098]
const STRING_X = [-0.021, -0.007, 0.007, 0.021]

/** Un fil entre deux points (une corde) : un cylindre fin couché dans leur direction. */
const wire = (a: V3, b: V3): { p: V3; r: V3; len: number } => {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  return { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], r: orient(d), len: Math.hypot(...d) }
}

/**
 * Le violoncelle du siège voisin, objet « berceuse » : un instrument qui voyage dans sa propre place, calé contre le dossier et sanglé
 * (une sangle en travers de la taille, une étiquette « TYO » à la volute). Une caisse aux hanches rondes en érable roux, sa table
 * d'harmonie à ouïes en f et filet, un chevalet, un cordier d'ébène, quatre cordes, une touche d'ébène, un cheville-box à quatre chevilles
 * et sa volute, une pique qui prend appui sur l'assise ; contre lui, l'archet, tenu par la même sangle. Quand la berceuse joue, les
 * cordes vibrent à chaque note, la caisse rougeoie et des notes s'envolent des ouïes. `position` : le point de la pique sur l'assise.
 */
export function Cello({ position }: { position: V3 }) {
  const g = useRef<Group>(null!)
  const puffs = useParticles()
  const st = useRef({ seen: useStore.getState().pulses.lullaby ?? 0, at: -10, flip: false })
  useSquash('cello', g)
  useFrame(({ clock }) => {
    const s = useStore.getState(), t = clock.elapsedTime, b = st.current, on = isActive(s, 'cello')
    const p = s.pulses.lullaby ?? 0
    if (p !== b.seen) {
      b.seen = p
      b.at = t
      if (on && !reduceMotion) {
        b.flip = !b.flip
        puffs.emit(b.flip ? noteTexA : noteTexB, position[0] + 0.2 + rand(-0.05, 0.05), position[1] + 0.9, position[2] + rand(-0.15, 0.15), { size: 0.18, life: 2.6, vy: 0.3, sway: 0.14 })
      }
    }
    const k = on ? Math.exp(-(t - b.at) * 1.4) : 0
    A.string.emissiveIntensity = k * 0.9
    A.varnish.emissiveIntensity = 0.1 + k * 0.22
    A.plate.emissiveIntensity = 0.1 + k * 0.22
  })
  // les segments de corde, calculés une fois
  const segs = useMemo(() => STRING_X.map((x) => ({ long: wire([x * 1.1, BRIDGE[1] + 0.02, BRIDGE[2] + 0.012], [x * 0.75, NUT[1], NUT[2] + 0.004]), short: wire([x * 0.9, TAIL[1] + 0.07, TAIL[2] + 0.014], [x * 1.1, BRIDGE[1] + 0.02, BRIDGE[2] + 0.012]) })), [])
  const geoFor = (len: number): BufferGeometry => cyl(0.0045, 0.0045, len, 5)
  return (
    <>
      <group ref={g} userData={{ id: 'cello' }} position={position} rotation-z={0.13}>
        <group rotation-y={Math.PI / 2}>
          <Static>
            {/* la caisse, la table d'harmonie, le chevalet, le cordier */}
            <mesh geometry={BODY} material={A.varnish} castShadow receiveShadow />
            <mesh geometry={PLATE} material={A.plate} position={[0, 0, PLATE_Z]} receiveShadow />
            <Part geo={rbox(0.16, 0.05, 0.012, 0.004)} m={A.maple} p={BRIDGE} castShadow={false} />
            <Part geo={rbox(0.03, 0.04, 0.012, 0.004)} m={A.maple} p={[-0.055, BRIDGE[1] - 0.02, BRIDGE[2]]} castShadow={false} />
            <Part geo={rbox(0.03, 0.04, 0.012, 0.004)} m={A.maple} p={[0.055, BRIDGE[1] - 0.02, BRIDGE[2]]} castShadow={false} />
            <Part geo={rbox(0.062, 0.17, 0.014, 0.006)} m={A.ebony} p={TAIL} castShadow={false} />
            {[-0.016, 0.016].map((x) => <Part key={x} geo={SPH} m={A.string} scale={0.0075} p={[x, TAIL[1] - 0.07, TAIL[2] + 0.008]} castShadow={false} />)}
            {/* la pique : une tige d'acier, sa pointe sur l'assise */}
            <Part geo={cyl(0.008, 0.005, 0.1, 8)} m={A.steel} p={[0, -0.05, 0]} castShadow={false} />
            <Part geo={cyl(0.026, 0.026, 0.026, 12)} m={A.ebony} p={[0, 0.0, 0]} castShadow={false} />
            {/* le manche d'érable, la touche d'ébène qui s'avance au-dessus de la caisse, le sillet */}
            <Part geo={rbox(0.052, 0.62, 0.05, 0.02)} m={A.maple} p={[0, 1.1, 0.06]} />
            <mesh geometry={BOARD} material={A.ebony} position={[0, 0.78, 0.126]} rotation-x={-0.085} castShadow receiveShadow />
            <Part geo={rbox(0.058, 0.012, 0.02, 0.005)} m={A.ebony} p={[0, 1.335, 0.075]} castShadow={false} />
            {/* le cheville-box, ses quatre chevilles et la volute */}
            <Part geo={rbox(0.062, 0.17, 0.07, 0.02)} m={A.maple} p={[0, 1.43, 0.05]} />
            {[0, 1].map((k) => [-1, 1].map((s) => <Part key={`${k}${s}`} geo={cyl(0.011, 0.011, 0.07, 8)} m={A.ebony} p={[s * 0.062, 1.395 + k * 0.07, 0.05]} rotation-z={Math.PI / 2} castShadow={false} />))}
            {[0, 1].map((k) => [-1, 1].map((s) => <Part key={`k${k}${s}`} geo={rbox(0.014, 0.03, 0.03, 0.006)} m={A.ebony} p={[s * 0.1, 1.395 + k * 0.07, 0.05]} castShadow={false} />))}
            <Part m={A.maple} p={[0, 1.57, 0.045]} rotation-y={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.042, 0.017, 8, 20]} />
            </Part>
            <Part geo={SPH} m={A.maple} scale={[0.028, 0.03, 0.02]} p={[0, 1.57, 0.045]} castShadow={false} />
            {/* la sangle : en travers de la taille, deux boucles aux bouts */}
            <Part geo={rbox(0.58, 0.05, 0.014, 0.005)} m={A.strap} p={[0, 0.52, 0.134]} />
            {[-1, 1].map((s) => <Part key={s} geo={rbox(0.05, 0.062, 0.02, 0.008)} m={A.buckle} p={[s * 0.27, 0.52, 0.137]} castShadow={false} />)}
            {/* l'archet, debout contre le flanc : baguette, hausse, mèche */}
            <Part geo={cyl(0.007, 0.007, 1.0, 6)} m={A.ebony} p={[-0.3, 0.6, 0.13]} rotation-z={-0.025} castShadow={false} />
            <Part geo={rbox(0.022, 0.07, 0.026, 0.008)} m={A.ebony} p={[-0.31, 0.12, 0.13]} castShadow={false} />
            <Part geo={rbox(0.006, 0.86, 0.02, 0.003)} m={A.cream} p={[-0.296, 0.62, 0.13]} rotation-z={-0.025} castShadow={false} />
            {/* l'étiquette de bagage, au bout d'un cordon, sous la volute */}
            <Part geo={cyl(0.003, 0.003, 0.09, 4)} m={A.strap} p={[0.05, 1.5, 0.07]} rotation-z={0.2} castShadow={false} />
            <mesh material={A.tag} position={[0.07, 1.43, 0.075]} rotation-z={0.2} castShadow={false}>
              <planeGeometry args={[0.09, 0.045]} />
            </mesh>
            {/* les cordes : des fils d'acier fin ; elles vibrent quand la berceuse joue (leur matériau s'allume : il est partagé, elles restent fusionnées) */}
            {segs.map(({ long, short }, i) => (
              <group key={i}>
                <Part geo={geoFor(long.len)} m={A.string} p={long.p} rotation={long.r} castShadow={false} />
                <Part geo={geoFor(short.len)} m={A.string} p={short.p} rotation={short.r} castShadow={false} />
              </group>
            ))}
          </Static>
        </group>
      </group>
      <group ref={puffs.group} />
    </>
  )
}
