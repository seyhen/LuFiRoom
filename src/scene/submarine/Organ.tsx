import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { LIVE, Static } from '../Static'
import { S } from './materials'

/** L'orgue : le centre de son coffre au sol, contre le mur de gauche. */
export const ORGAN = { x: -2.62, z: 0.5 }
const PIPES = 13
const KEYS = 14

/**
 * L'orgue du capitaine : un coffre d'acajou contre la paroi, treize tuyaux de laiton en éventail qui montent vers la corniche,
 * un clavier d'ivoire et ses registres, un tabouret de cuir. Joué, les tuyaux rougeoient chacun à leur tour, quelques touches
 * s'enfoncent, le coffre rebondit sur chaque kick et des notes s'échappent. C'est l'objet « radio » du sous-marin.
 */
export function Organ({ position }: { position: V3 }) {
  const keys = useRef<Group[]>([])
  const mats = useMemo(() => [S.pipeGlow, S.pipeGlow.clone(), S.pipeGlow.clone()], [])
  const { g, notes } = useBeat(position, 1.3, (on, t, pulse) => {
    mats.forEach((m, i) => {
      m.emissiveIntensity = on && !reduceMotion ? Math.max(0, 0.1 + pulse * 0.5 + Math.sin(t * 2.3 + i * 2.1) * 0.35) : on ? 0.25 : 0
    })
    keys.current.forEach((k, i) => {
      const dip = on && !reduceMotion ? Math.max(0, Math.sin(t * 3.1 + i * 2.4)) ** 7 * 0.022 + (i % 5 === 0 ? pulse * 0.016 : 0) : 0
      k.position.y = -dip
    })
  }, 0.03)
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={[ORGAN.x, 0, ORGAN.z]}>
        <Static>
        {/* le coffre : caisse, corniche, plinthe */}
        <Part geo={rbox(0.62, 1.1, 3.2, 0.08)} m={S.wood} p={[0, 0.55, 0]} />
        <Part geo={rbox(0.7, 0.1, 3.28, 0.04)} m={S.woodDark} p={[0, 0.06, 0]} castShadow={false} />
        <Part geo={rbox(0.68, 0.08, 3.26, 0.03)} m={S.woodLight} p={[0, 1.12, 0]} castShadow={false} />
        {/* les panneaux du coffre, avec leurs cabochons de laiton */}
        {[-1.0, 0, 1.0].map((z) => (
          <group key={z}>
            <Part geo={rbox(0.03, 0.62, 0.78, 0.02)} m={S.woodDark} p={[0.31, 0.5, z]} castShadow={false} />
            <Part geo={SPH} m={S.brass} scale={0.034} p={[0.335, 0.5, z]} castShadow={false} />
          </group>
        ))}
        {/* les tuyaux : une ligne qui monte vers le milieu puis redescend */}
        {Array.from({ length: PIPES }, (_, i) => {
          const u = 1 - Math.abs(i - (PIPES - 1) / 2) / ((PIPES - 1) / 2 + 1), h = 0.6 + Math.pow(u, 0.9) * 1.65, r = 0.062 + u * 0.03
          const z = (i - (PIPES - 1) / 2) * 0.235, m = mats[i % 3]
          return (
            <group key={i} position={[-0.12, 1.16, z]}>
              <Part geo={cyl(r * 0.45, r * 0.9, 0.16, 12)} m={S.brassDull} p={[0, 0.08, 0]} castShadow={false} />
              <Part geo={cyl(r, r, h, 16)} m={m} p={[0, 0.16 + h / 2, 0]} />
              <Part geo={rbox(r * 1.3, 0.1, r * 0.5, 0.015)} m={S.woodDark} p={[0.01, 0.32 + r * 1.4, r * 0.9]} castShadow={false} />
              <Part geo={cyl(r + 0.004, r + 0.004, 0.03, 16)} m={S.band} p={[0, 0.16 + h, 0]} castShadow={false} />
            </group>
          )
        })}
        {/* le pupitre, les registres et le clavier d'ivoire qui avance au-dessus du coffre */}
        <Part geo={rbox(0.5, 0.1, 1.7, 0.04)} m={S.woodLight} p={[0.5, 0.88, 0]} />
        <Part geo={rbox(0.1, 0.7, 1.7, 0.03)} m={S.woodDark} p={[0.2, 0.8, 0]} castShadow={false} />
        {[-0.6, -0.3, 0, 0.3, 0.6].map((z) => (
          <group key={z} position={[0.3, 1.2, z]}>
            <Part geo={cyl(0.035, 0.035, 0.1, 10)} m={S.cream} rotation-z={Math.PI / 2} p={[0.04, 0, 0]} castShadow={false} />
            <Part geo={SPH} m={S.brass} scale={0.032} p={[0.1, 0, 0]} castShadow={false} />
          </group>
        ))}
        {Array.from({ length: KEYS }, (_, i) => (
          <group key={i} ref={(el) => void (el && (keys.current[i] = el))} userData={LIVE} position={[0.5, 0.95, (i - (KEYS - 1) / 2) * 0.11]}>
            <Part geo={rbox(0.38, 0.045, 0.1, 0.012)} m={S.cream} castShadow={false} />
            {[1, 3, 4, 6, 8, 9, 11].includes(i) && <Part geo={rbox(0.2, 0.05, 0.062, 0.01)} m={S.iron} p={[-0.08, 0.04, 0.055]} castShadow={false} />}
          </group>
        ))}
        {/* un chandelier de laiton et une partition sur le coffre */}
        <Part geo={rbox(0.014, 0.3, 0.42, 0.006)} m={S.paper} p={[0.22, 1.35, -0.3]} rotation-z={0.25} castShadow={false} />
        <Part geo={cyl(0.04, 0.05, 0.18, 12)} m={S.brass} p={[0.42, 1.04, 0.8]} castShadow={false} />
        </Static>
      </group>
      <group ref={notes.group} />
      {/* le tabouret de cuir devant le clavier */}
      <group position={[ORGAN.x + 1.15, 0, ORGAN.z + 0.06]}>
        <Part geo={cyl(0.24, 0.24, 0.1, 24)} m={S.leather} p={[0, 0.55, 0]} />
        <Part geo={cyl(0.245, 0.245, 0.025, 24)} m={S.brass} p={[0, 0.5, 0]} castShadow={false} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.5
          return <Part key={i} geo={cyl(0.026, 0.02, 0.5, 8)} m={S.brass} p={[Math.cos(a) * 0.14, 0.25, Math.sin(a) * 0.14]} rotation={[Math.sin(a) * 0.14, 0, -Math.cos(a) * 0.14]} />
        })}
      </group>
    </>
  )
}
