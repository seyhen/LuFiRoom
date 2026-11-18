import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { rand, smooth } from '../../math'
import { isActive, useStore } from '../../state/store'
import { mood, reduceMotion, useParticles, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { Vessel } from '../igloo/Vessel'
import { wispTexes } from '../textures'
import { T } from './materials'

const TOP = 0.52 // le plateau de la table
const POT = { x: -0.17, z: 0.02 } // la casserole sur le réchaud
const SUP = TOP + 0.185 // le haut des supports : le fond du percolateur
const K = 1.4 // le percolateur et son réchaud sont agrandis : ce sont les vedettes de la table

/**
 * Le réchaud et le percolateur, objet « percolator » : une table de camping à plateau de lattes d'aluminium et pieds en X, une
 * cartouche de gaz rouge portant son brûleur à trois branches, et dessus un percolateur d'émail bleu (couvercle, bouton de verre où
 * l'on voit le café sauter, bec, poignée de bois). Allumé : la flamme bleue sous le pot, le bouton de verre qui s'allume par
 * à-coups, le couvercle qui tremble, une vapeur fine. À côté : un quart de café, une boîte de café moulu, des allumettes.
 * `position` est le pied de la table.
 */
export function Stove({ position, ry = 0 }: { position: V3; ry?: number }) {
  const g = useRef<Group>(null!), lid = useRef<Group>(null!), ring = useRef<Group>(null!)
  const puffs = useParticles()
  const st = useRef({ on: 0, since: 0, flash: 0, next: 0.5, ph: 0 })
  useSquash('percolator', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.on += ((isActive(useStore.getState(), 'percolator') ? 1 : 0) - s.on) * Math.min(1, dt * 2.5)
    const on = s.on
    ring.current.visible = on > 0.04
    T.flame.opacity = on * (0.8 + 0.15 * Math.sin(clock.elapsedTime * 9))
    T.flameCore.opacity = on * 0.9
    ring.current.scale.setScalar(0.85 + on * 0.15 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 13) * 0.03))
    // le bouton de verre : de petits à-coups de lumière quand le café monte
    s.next -= dt
    if (on > 0.5 && s.next <= 0) { s.flash = 1; s.next = rand(0.5, 1.6) }
    s.flash = Math.max(0, s.flash - dt * 3.2)
    T.knob.emissiveIntensity = on * (0.25 + s.flash * 1.2)
    // le couvercle tremble un peu quand ça bout
    s.ph += dt * 31
    lid.current.rotation.z = reduceMotion ? 0 : on * Math.sin(s.ph) * 0.012 * (0.5 + s.flash)
    lid.current.position.y = 0.205 + on * s.flash * 0.004
    // la vapeur : un filet fin, qui monte du bec et du bouton
    s.since += dt
    if (on > 0.5 && !reduceMotion && s.since > 0.55) {
      s.since = 0
      const lx = POT.x - 0.085 * K, ly = SUP + 0.19 * K + 0.02, lz = POT.z
      const c = Math.cos(ry), sn = Math.sin(ry)
      puffs.emit(wispTexes, position[0] + lx * c + lz * sn + rand(-0.01, 0.01), position[1] + ly, position[2] - lx * sn + lz * c, { size: 0.15, life: 2.6, vy: 0.15, sway: 0.03, grow: 0.9, peak: 0.45 * (1 - 0.4 * smooth(mood.night)), soft: true })
    }
  })
  return (
    <>
      <group ref={g} userData={{ id: 'percolator' }} position={position} rotation-y={ry}>
        <Static>
          {/* la table : lattes d'aluminium, deux longerons, pieds en X, traverse */}
          {Array.from({ length: 7 }, (_, i) => <Part key={i} geo={rbox(0.12, 0.024, 0.62, 0.008)} m={T.tin} p={[-0.45 + i * 0.15, TOP - 0.012, 0]} castShadow={i === 0} />)}
          {[-0.22, 0.22].map((z) => <Part key={z} geo={rbox(1.08, 0.03, 0.03, 0.01)} m={T.iron} p={[0, TOP - 0.04, z]} castShadow={false} />)}
          {[-0.4, 0.4].map((x) => [-1, 1].map((s) => (
            <Part key={`${x}${s}`} geo={cyl(0.014, 0.014, 0.66, 8)} m={T.steel} p={[x, TOP / 2 - 0.02, 0]} rotation-x={s * 0.42} castShadow={false} />
          )))}
          <Part geo={cyl(0.012, 0.012, 0.8, 8)} m={T.steel} p={[0, 0.24, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {[-0.4, 0.4].flatMap((x) => [-0.2, 0.2].map((z) => <Part key={`${x}${z}`} geo={SPH} m={T.sole} scale={[0.02, 0.012, 0.02]} p={[x, 0.008, z * 1.3]} castShadow={false} />))}
          {/* la cartouche de gaz : corps rouge, calotte argentée, bande blanche et son étiquette */}
          <group position={[POT.x, TOP, POT.z]}>
            <Part geo={cyl(0.052, 0.052, 0.13, 20)} m={T.canister} p={[0, 0.065, 0]} />
            <Part geo={cyl(0.05, 0.05, 0.03, 20)} m={T.canisterTop} p={[0, 0.138, 0]} castShadow={false} />
            <Part geo={cyl(0.053, 0.053, 0.03, 20)} m={T.enamel} p={[0, 0.07, 0]} castShadow={false} />
            {/* le brûleur : un pied, une coupelle, trois branches pour le pot */}
            <Part geo={cyl(0.012, 0.012, 0.04, 8)} m={T.steel} p={[0, 0.173, 0]} castShadow={false} />
            <Part geo={cyl(0.034, 0.026, 0.02, 16)} m={T.steel} p={[0, 0.194 - 0.0, 0]} castShadow={false} />
            {[0, 1, 2].map((i) => (
              <group key={i} rotation-y={(i / 3) * Math.PI * 2 + 0.3}>
                <Part geo={rbox(0.1, 0.008, 0.014, 0.003)} m={T.steel} p={[0.05, 0.2, 0]} castShadow={false} />
                <Part geo={SPH} m={T.steel} scale={[0.01, 0.014, 0.01]} p={[0.098, 0.206, 0]} castShadow={false} />
              </group>
            ))}
            {/* la molette de gaz, sur le côté */}
            <Part geo={cyl(0.008, 0.008, 0.06, 8)} m={T.steel} p={[0.05, 0.15, 0.04]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.02, 0.02, 0.008, 12)} m={T.iron} p={[0.085, 0.15, 0.04]} rotation-z={Math.PI / 2} castShadow={false} />
          </group>
          {/* le quart de café et sa cuillère, la boîte de café moulu, les allumettes */}
          <group position={[0.3, TOP, 0.08]}>
            <Vessel p={[0, 0, 0]} rt={0.062} rb={0.056} h={0.11} m={T.enamel} inner={T.enamelIn} rim={T.enamelBlue} />
            <Part geo={cyl(0.052, 0.052, 0.005, 20)} m={T.coffee} p={[0, 0.085, 0]} castShadow={false} />
            <Part m={T.enamel} p={[0.07, 0.06, 0]} castShadow={false}>
              <torusGeometry args={[0.031, 0.008, 8, 16]} />
            </Part>
            <Part geo={cyl(0.004, 0.004, 0.15, 6)} m={T.steel} p={[-0.02, 0.12, 0.01]} rotation={[0.2, 0, 0.5]} castShadow={false} />
          </group>
          <group position={[0.1, TOP, 0.2]} rotation-y={0.4}>
            <Part geo={cyl(0.05, 0.05, 0.085, 20)} m={T.tin} p={[0, 0.0425, 0]} />
            <Part geo={cyl(0.052, 0.052, 0.012, 20)} m={T.canister} p={[0, 0.09, 0]} castShadow={false} />
            <Part geo={cyl(0.0505, 0.0505, 0.04, 20)} m={T.enamelBlue} p={[0, 0.045, 0]} castShadow={false} />
          </group>
          <group position={[0.38, TOP, -0.2]} rotation-y={-0.5}>
            <Part geo={rbox(0.07, 0.022, 0.045, 0.004)} m={T.match} p={[0, 0.011, 0]} castShadow={false} />
            <Part geo={rbox(0.05, 0.004, 0.025, 0.002)} m={T.ink} p={[0, 0.023, 0]} castShadow={false} />
            {[0, 1, 2].map((i) => <Part key={i} geo={cyl(0.002, 0.002, 0.04, 5)} m={T.woodDark} p={[0.06, 0.003, -0.01 + i * 0.012]} rotation-z={Math.PI / 2} castShadow={false} />)}
          </group>
          {/* un torchon plié, à l'angle de la table */}
          <Part geo={rbox(0.2, 0.02, 0.16, 0.008)} m={T.plaid} p={[-0.38, TOP + 0.01, 0.18]} rotation-y={0.3} castShadow={false} />
        </Static>
        {/* la flamme bleue du brûleur : un anneau et son cœur, sous le pot */}
        <group ref={ring} position={[POT.x, TOP + 0.208, POT.z]}>
          <Part m={T.flame} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.04, 0.012, 6, 20]} />
          </Part>
          <Part m={T.flameCore} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.04, 0.005, 6, 20]} />
          </Part>
        </group>
        {/* le percolateur : l'émail bleu, le bec, la poignée de bois, le bouton de verre */}
        <group position={[POT.x, SUP, POT.z]} scale={K}>
          <Static>
            <Part geo={cyl(0.082, 0.098, 0.2, 28)} m={T.enamelBlue} p={[0, 0.1, 0]} />
            <Part geo={cyl(0.087, 0.098, 0.03, 28)} m={T.enamel} p={[0, 0.015, 0]} castShadow={false} />
            <Part m={T.enamel} p={[0, 0.2, 0]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.082, 0.007, 8, 28]} />
            </Part>
            {/* le bec verseur, évasé, au bord */}
            <Part m={T.enamelBlue} p={[-0.085, 0.17, 0]} rotation-z={0.7} castShadow={false}>
              <coneGeometry args={[0.03, 0.06, 12]} />
            </Part>
            {/* la poignée : deux attaches de fer et un manche de bois noir */}
            {[0.05, 0.17].map((y) => <Part key={y} geo={rbox(0.06, 0.016, 0.022, 0.006)} m={T.iron} p={[0.105, y, 0]} castShadow={false} />)}
            <Part geo={rbox(0.022, 0.15, 0.026, 0.01)} m={T.ukeDark} p={[0.14, 0.11, 0]} />
            {/* les traces d'usage : de la suie au pied, un éclat d'émail au bord */}
            <Part geo={SPH} m={T.sole} scale={[0.028, 0.02, 0.008]} p={[0.045, 0.045, 0.094]} castShadow={false} />
            <Part geo={SPH} m={T.ink} scale={[0.012, 0.01, 0.004]} p={[-0.04, 0.192, 0.082]} castShadow={false} />
          </Static>
          {/* le couvercle bombé et son bouton de verre (les deux bougent un peu) */}
          <group ref={lid} position={[0, 0.205, 0]}>
            <Part geo={cyl(0.084, 0.084, 0.012, 28)} m={T.enamelBlue} castShadow={false} />
            <Part geo={SPH} m={T.enamelBlue} scale={[0.08, 0.03, 0.08]} p={[0, 0.006, 0]} castShadow={false} />
            <Part geo={cyl(0.024, 0.03, 0.012, 14)} m={T.steel} p={[0, 0.034, 0]} castShadow={false} />
            <mesh geometry={cyl(0.026, 0.03, 0.03, 16)} material={T.knob} position={[0, 0.056, 0]} raycast={noRay} renderOrder={3} />
          </group>
        </group>
      </group>
      <group ref={puffs.group} />
    </>
  )
}

