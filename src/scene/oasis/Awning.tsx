import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, type BufferGeometry, type Group } from 'three'
import { approach } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { LIVE } from '../Static'
import { D } from './materials'

/** Le point où l'auvent s'accroche au mur de gauche, la pente, sa longueur (du mur au bord libre) et sa largeur (le long du mur). */
export const AWN = { at: [-2.97, 2.2, -1.7] as V3, tilt: -0.18, L: 2.5, W: 2.5, beam: 0.92 }
/** Le bord où la toile passe sur la poutre avant, dans le repère de la pièce. */
export const BEAM: V3 = [AWN.at[0] + AWN.L * AWN.beam * Math.cos(AWN.tilt), AWN.at[1] + AWN.L * AWN.beam * Math.sin(AWN.tilt), AWN.at[2]]

const NU = 24, NV = 16

/**
 * L'auvent (objet « dunes » : le vent sur le sable) : une toile rayée indigo, crème et terre cuite, tendue du mur de gauche à une poutre
 * sur deux perches, le bord libre festonné qui dépasse en volant. Au repos elle s'affaisse un peu entre ses appuis ; quand le vent des
 * dunes joue, des vagues la traversent du mur vers le bord libre et le bord claque doucement (une grille de 25 × 17 points réécrite à
 * chaque image : un seul maillage). `position` est l'accroche au mur : la toile part de là, vers +x, en descendant.
 */
export function Awning() {
  const g = useRef<Group>(null!), live = useRef({ wind: 0, ph: 0, ph2: 0, drawn: false })
  const geo = useMemo<BufferGeometry>(() => {
    const p = new PlaneGeometry(1, 1, NU, NV)
    p.rotateX(-Math.PI / 2) // à plat (le dessus vers +y), u le long de +x, v le long de z : le haut de l'image est -z
    return p
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  useSquash('awning', g)
  const rest = useMemo(() => {
    const pos = geo.attributes.position, out = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      out[i * 3] = (pos.getX(i) + 0.5) * AWN.L
      out[i * 3 + 1] = 0
      out[i * 3 + 2] = pos.getZ(i) * AWN.W
    }
    return out
  }, [geo])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = live.current
    s.wind = approach(s.wind, reduceMotion ? 0 : isActive(useStore.getState(), 'awning') ? 1 : 0, dt * 0.6)
    s.ph += dt * (1.6 + s.wind * 2.2)
    s.ph2 += dt * (2.3 + s.wind * 1.3)
    const pos = geo.attributes.position
    // la toile ne bouge que si le vent souffle (ou retombe) : au repos, un affaissement fixe, aucun calcul
    if (s.wind < 0.002 && s.drawn) return
    s.drawn = s.wind < 0.002
    for (let i = 0; i < pos.count; i++) {
      const x = rest[i * 3], z = rest[i * 3 + 2], u = x / AWN.L, v = z / AWN.W + 0.5
      const span = Math.sin(Math.PI * Math.min(u / AWN.beam, 1))
      const edge = Math.max(0, (u - AWN.beam) / (1 - AWN.beam))
      const sag = -0.07 * span * Math.sin(Math.PI * v) ** 0.8 - 0.02 * edge
      const wave = s.wind * (0.04 * span + 0.085 * edge ** 1.2) * Math.sin(u * 7 - s.ph + v * 2.4) + s.wind * 0.02 * span * Math.sin(v * 9 + s.ph2)
      const flap = s.wind * 0.05 * edge * Math.sin(v * 13 - s.ph2 * 1.6)
      pos.setXYZ(i, x, sag + wave + flap, z)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })
  return (
    <group ref={g} userData={{ id: 'awning' }} position={AWN.at}>
      <group rotation-z={AWN.tilt}>
        <group userData={LIVE}>
          <mesh geometry={geo} material={D.awning} castShadow receiveShadow />
        </group>
        {/* la ralingue le long du mur : un tube de corde et ses œillets */}
        <Part geo={cyl(0.022, 0.022, AWN.W + 0.05, 8)} m={D.rope} p={[0.02, 0.03, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={SPH} m={D.iron} scale={0.025} p={[0.03, 0.02, -AWN.W / 2 + 0.2 + i * ((AWN.W - 0.4) / 5)]} castShadow={false} />)}
        {/* la poutre avant, sous la toile, et les attaches qui la tiennent */}
        <group position={[AWN.L * AWN.beam, -0.05, 0]}>
          <Part geo={cyl(0.034, 0.038, AWN.W + 0.14, 10)} m={D.pole} rotation-x={Math.PI / 2} />
          {[-0.62, 0, 0.62].map((z) => <Part key={z} geo={cyl(0.045, 0.045, 0.05, 10)} m={D.rope} p={[0, 0, z]} rotation-x={Math.PI / 2} castShadow={false} />)}
        </group>
      </group>
    </group>
  )
}

/** Les deux perches de l'auvent, leurs pierres de calage et le hauban : immobiles, hors de l'objet interactif (il rebondit sans elles). */
export function AwningPoles() {
  const top = (z: number): V3 => [BEAM[0], BEAM[1] - 0.05, z]
  const poles: [number, number][] = [[-0.5, 0], [-2.9, 0]]
  const peg: V3 = [BEAM[0] + 0.8, 0.0, -0.5 + 0.95]
  const a = top(-0.5), d: V3 = [peg[0] - a[0], peg[1] - a[1], peg[2] - a[2]], len = Math.hypot(...d)
  return (
    <>
      {poles.map(([z]) => {
        const t = top(z)
        return (
          <group key={z}>
            <Part geo={cyl(0.042, 0.052, t[1], 12)} m={D.pole} p={[t[0], t[1] / 2, z]} />
            <Part geo={cyl(0.056, 0.056, 0.08, 12)} m={D.rope} p={[t[0], t[1] - 0.16, z]} castShadow={false} />
            <Part geo={cyl(0.052, 0.046, 0.05, 12)} m={D.iron} p={[t[0], t[1] + 0.0, z]} castShadow={false} />
            {/* le pied : trois pierres plates de calage */}
            {[0, 1, 2].map((k) => <Part key={k} geo={rbox(0.16, 0.06, 0.12, 0.03)} m={D.stone} p={[t[0] + Math.cos(k * 2.1 + z) * 0.11, 0.03, z + Math.sin(k * 2.1 + z) * 0.11]} rotation-y={k * 1.1} castShadow={false} />)}
          </group>
        )
      })}
      {/* le hauban de la perche de devant : une corde tendue jusqu'à un piquet, sa planchette de tension */}
      <Part geo={cyl(0.013, 0.013, len, 6)} m={D.rope} p={[(a[0] + peg[0]) / 2, (a[1] + peg[1]) / 2, (a[2] + peg[2]) / 2]} rotation={orient(d)} castShadow={false} />
      <Part geo={rbox(0.12, 0.04, 0.05, 0.015)} m={D.pole} p={[a[0] + d[0] * 0.6, a[1] + d[1] * 0.6, a[2] + d[2] * 0.6]} rotation={orient(d, [0, 0, 1])} castShadow={false} />
      <Part geo={cyl(0.022, 0.027, 0.3, 7)} m={D.pole} p={[peg[0] + 0.04, 0.11, peg[2] + 0.03]} rotation={[0.3, 0, 0.5]} castShadow={false} />
    </>
  )
}
