import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3, type Group, type Mesh } from 'three'
import { approach, smooth } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { mood, reduceMotion, useSquash } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, rbox } from '../../parts'
import { S } from './materials'
import { SEA } from './Sea'
import { HULL } from './Landing'

/** Où est la barque : au large, devant le phare, côté caméra (x, z) et son cap. */
export const ROWBOAT = { x: 0.6, z: -7.0, ry: 0.3 }

const PIVOT_Z = 0.42, SHOULDER: [number, number, number] = [0, 0.3, -0.28], GRIP = 0.34
const up = new Vector3(0, 1, 0), d = new Vector3(), q = new Quaternion()

/**
 * Le pêcheur qui rame au large (`rowboat`) : une barque bleue, un homme en ciré jaune qui lui tourne le dos à la proue, deux avirons
 * dans leurs tolets, une lanterne à la proue, une caisse de poissons. Quand les avirons jouent, il rame (coup de rame ~ 3 s : les
 * pelles plongent et balaient vers l'arrière, remontent et reviennent) ; au repos, avirons relevés, la barque dérive. La phase
 * s'additionne image après image. Repère : proue vers +x, tolets en z = ±0,42.
 */
export function Rowboat() {
  const root = useRef<Group>(null!), hull = useRef<Group>(null!), torso = useRef<Group>(null!)
  const oars = useRef<(Group | null)[]>([null, null]), arms = useRef<(Mesh | null)[]>([null, null])
  const st = useRef({ amp: 0, phase: 0, bob: 0 })
  useSquash('rowboat', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), R = st.current, storm = smooth(mood.storm)
    R.amp = approach(R.amp, isActive(useStore.getState(), 'rowboat') && !reduceMotion ? 1 : 0, dt * 0.7)
    if (!reduceMotion) { R.phase += dt * (0.8 + R.amp * 1.3); R.bob += dt * (1 + storm * 1.2) }
    const a = R.amp, ph = R.phase, k = 1 + storm * 1.6
    // la houle porte la barque ; un peu plus quand on rame
    hull.current.position.y = reduceMotion ? 0 : Math.sin(R.bob) * 0.03 * k
    hull.current.rotation.set(reduceMotion ? 0 : Math.sin(R.bob * 0.8 + 1) * 0.04 * k, 0, reduceMotion ? 0 : Math.sin(R.bob * 1.1) * 0.05 * k)
    // le coup : balayage a (> 0 à la prise, < 0 à la sortie), la pelle plonge pendant la poussée seulement
    const sweep = 0.4 * Math.cos(ph) * a
    const dip = a * 0.32 * Math.max(-0.5, Math.min(1, Math.sin(ph) * 3)) - (1 - a) * 0.1
    torso.current.rotation.z = 0.2 * Math.cos(ph) * a
    for (let i = 0; i < 2; i++) {
      const o = oars.current[i], arm = arms.current[i]
      if (!o || !arm) continue
      o.rotation.set(dip, sweep, 0, 'YXZ')
      // le bras relie l'épaule à la poignée de l'aviron (repère du tolet)
      const hx = -GRIP * Math.cos(dip) * Math.sin(sweep), hy = GRIP * Math.sin(dip), hz = -GRIP * Math.cos(dip) * Math.cos(sweep)
      d.set(hx - SHOULDER[0], hy - SHOULDER[1], hz - SHOULDER[2])
      const len = d.length()
      arm.position.set(SHOULDER[0] + d.x / 2, SHOULDER[1] + d.y / 2, SHOULDER[2] + d.z / 2)
      arm.quaternion.copy(q.setFromUnitVectors(up, d.normalize()))
      arm.scale.set(1, len, 1)
    }
  })
  return (
    <group ref={root} position={[ROWBOAT.x, SEA, ROWBOAT.z]} rotation-y={ROWBOAT.ry} userData={{ id: 'rowboat' }}>
      <group ref={hull} userData={LIVE}>
        <Static>
          <Part geo={HULL} m={S.hull} scale={[0.95, 0.55, 0.42]} />
          <Part geo={HULL} m={S.hullIn} scale={[0.93, 0.54, 0.4]} p={[0, 0.012, 0]} castShadow={false} />
          {/* le banc, un second à la poupe, et les tolets de fer */}
          <Part geo={rbox(0.14, 0.03, 0.68, 0.01)} m={S.wood} p={[0, 0.17, 0]} castShadow={false} />
          <Part geo={rbox(0.12, 0.03, 0.56, 0.01)} m={S.wood} p={[-0.55, 0.19, 0]} castShadow={false} />
          {[-1, 1].map((s) => <Part key={s} geo={cyl(0.022, 0.022, 0.1, 6)} m={S.iron} p={[0, 0.29, s * PIVOT_Z]} castShadow={false} />)}
          {/* à la proue : une lanterne de laiton et un cordage lové, à la poupe une caisse de poissons */}
          <Part geo={cyl(0.04, 0.04, 0.07, 8)} m={S.iron} p={[0.7, 0.13, 0]} castShadow={false} />
          <Part geo={cyl(0.035, 0.035, 0.1, 8)} m={S.brass} p={[0.7, 0.21, 0]} castShadow={false} />
          <Part geo={SPH} m={S.lamp} p={[0.7, 0.21, 0]} scale={0.026} castShadow={false} />
          <Part geo={cyl(0.075, 0.075, 0.035, 10)} m={S.rope} p={[0.52, 0.1, 0.12]} castShadow={false} />
          <Part geo={rbox(0.3, 0.12, 0.2, 0.03)} m={S.woodDark} p={[-0.7, 0.17, 0.02]} />
          <Part geo={rbox(0.24, 0.02, 0.15, 0.01)} m={S.buoyWhite} p={[-0.7, 0.235, 0.02]} castShadow={false} />
          <Part geo={SPH} m={S.buoyRed} p={[-0.62, 0.255, 0.03]} scale={[0.07, 0.03, 0.025]} castShadow={false} />
          {/* ses jambes, bottes dans le fond de la barque */}
          {[-0.075, 0.075].map((z) => (
            <group key={z}>
              <Part geo={rbox(0.32, 0.1, 0.11, 0.04)} m={S.slicker} p={[-0.14, 0.26, z]} />
              <Part geo={rbox(0.11, 0.24, 0.1, 0.04)} m={S.slicker} p={[-0.3, 0.16, z]} />
              <Part geo={rbox(0.17, 0.08, 0.11, 0.035)} m={S.boot} p={[-0.34, 0.08, z]} castShadow={false} />
            </group>
          ))}
        </Static>
        {/* le buste (il se penche à chaque coup), la tête, le suroît */}
        <group ref={torso} position={[0.03, 0.28, 0]}>
          <Part geo={rbox(0.2, 0.34, 0.34, 0.08)} m={S.slicker} p={[0, 0.18, 0]} />
          <Part geo={SPH} m={S.skin} p={[-0.03, 0.46, 0]} scale={0.085} />
          <Part geo={SPH} m={S.slicker} p={[-0.02, 0.5, 0]} scale={[0.11, 0.06, 0.11]} />
          <Part geo={cyl(0.13, 0.13, 0.014, 14)} m={S.slicker} p={[-0.04, 0.48, 0]} castShadow={false} />
        </group>
        {/* les deux avirons : pivot au tolet, la pelle dehors ; les bras sont dans le repère du tolet */}
        {[-1, 1].map((s, i) => (
          <group key={s} position={[0, 0.3, s * PIVOT_Z]} rotation-y={s > 0 ? 0 : Math.PI}>
            <group ref={(g) => { oars.current[i] = g }}>
              <Part geo={cyl(0.017, 0.017, 1.5, 6)} m={S.wood} p={[0, 0, 0.42]} rotation-x={Math.PI / 2} castShadow={false} />
              <Part geo={SPH} m={S.woodDark} p={[0, 0, -GRIP]} scale={[0.03, 0.03, 0.06]} castShadow={false} />
              <Part geo={rbox(0.12, 0.016, 0.36, 0.008)} m={S.white} p={[0, 0, 1.0]} castShadow={false} />
            </group>
            <mesh ref={(m) => { arms.current[i] = m }} geometry={cyl(0.034, 0.034, 1, 6)} material={S.slicker} />
          </group>
        ))}
      </group>
    </group>
  )
}
