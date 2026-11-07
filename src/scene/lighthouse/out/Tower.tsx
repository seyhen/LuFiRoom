import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, TorusGeometry, type Group } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, cyl, noRay, rbox } from '../../parts'
import { Rock } from '../../nature/Rock'
import { S } from './materials'
import { SEA } from './Sea'

/** Le phare, sur son îlot derrière à droite : le pied de la tour, sa hauteur. */
export const TOWER = { x: 6.6, z: -5.4, y: SEA + 0.55, h: 6.0 }
const RING = new TorusGeometry(1, 0.05, 6, 32)

/**
 * Le phare sur son îlot : la tour blanche à deux bandes rouges qui s'affine vers le haut, sa porte et ses fenêtres (allumées la
 * nuit), la galerie et son garde-corps, la lanterne de verre, la coupole rouge et sa girouette. La nuit (et par gros temps), deux
 * faisceaux tournent lentement autour de la lanterne.
 */
export function Lighthouse() {
  const beams = useRef<Group>(null!)
  const { x, z, y, h } = TOWER
  // la tour : quatre tronçons (blanc, rouge, blanc, rouge) qui s'affinent
  const segs = useMemo(() => {
    const r = (t: number) => 0.95 - 0.33 * t
    return [0, 1, 2, 3].map((i) => ({ y0: (i / 4) * h, y1: ((i + 1) / 4) * h, r0: r(i / 4), r1: r((i + 1) / 4), m: i % 2 ? S.red : S.white }))
  }, [h])
  const beamGeo = useMemo(() => {
    const g = new CylinderGeometry(0.9, 0.14, 4.6, 18, 1, true)
    g.translate(0, 2.3 + 0.3, 0)
    g.rotateZ(-Math.PI / 2)
    return g
  }, [])
  useFrame((_, dt) => {
    const k = Math.min(1, smooth(mood.night) + mood.storm * 0.6 + mood.rain * 0.3)
    S.beam.opacity = k * 0.16
    S.glow.opacity = k * 0.95
    S.lamp.emissiveIntensity = 0.2 + k * 1.8
    S.window.emissiveIntensity = smooth(mood.night) * 1.2
    if (!reduceMotion) beams.current.rotation.y += Math.min(dt, 0.05) * 0.55
  })
  const top = y + h
  return (
    <group>
      <Static>
        {/* l'îlot : des blocs de roche, et une petite plateforme */}
        <Rock v={1} p={[x, SEA - 0.9, z]} s={[2.0, 1.5, 1.8]} ry={0.4} m={S.rock[0]} moss={S.weed} />
        <Rock v={4} p={[x - 1.4, SEA - 0.6, z + 1.0]} s={[1.0, 0.9, 0.9]} ry={1.2} m={S.rock[1]} />
        <Rock v={6} p={[x + 1.2, SEA - 0.5, z + 0.9]} s={[0.8, 0.7, 0.7]} ry={2.4} m={S.rock[2]} moss={S.weed} />
        <Part geo={cyl(1.35, 1.45, 0.2, 28)} m={S.white} p={[x, y - 0.1, z]} />
        {segs.map((s, i) => <Part key={i} geo={cyl(s.r1, s.r0, s.y1 - s.y0, 28)} m={s.m} p={[x, y + (s.y0 + s.y1) / 2, z]} />)}
        {/* la porte et deux fenêtres, côté caméra */}
        <group position={[x, y, z]} rotation-y={Math.PI / 4}>
          <Part geo={rbox(0.5, 0.95, 0.08, 0.04)} m={S.iron} p={[0, 0.48, 0.93]} />
          <Part geo={rbox(0.62, 0.08, 0.14, 0.03)} m={S.white} p={[0, 1.0, 0.94]} castShadow={false} />
          {/* posées sur le fût qui s'affine (rayon 0,95 → 0,62) : un peu en avant de la paroi, sinon elles s'y enfoncent */}
          {[2.1, 3.9].map((wy) => (
            <group key={wy} position={[0, wy, 0.95 - (wy / h) * 0.33]}>
              <Part geo={rbox(0.3, 0.44, 0.06, 0.03)} m={S.white} p={[0, 0, 0.0]} castShadow={false} />
              <Part geo={rbox(0.22, 0.36, 0.06, 0.03)} m={S.window} p={[0, 0, 0.02]} castShadow={false} />
              <Part geo={rbox(0.34, 0.05, 0.1, 0.02)} m={S.white} p={[0, -0.23, 0.03]} castShadow={false} />
            </group>
          ))}
        </group>
        {/* la galerie, son garde-corps */}
        <Part geo={cyl(1.0, 0.8, 0.18, 28)} m={S.iron} p={[x, top + 0.09, z]} />
        <Part geo={RING} m={S.iron} p={[x, top + 0.62, z]} rotation-x={Math.PI / 2} scale={[0.98, 0.98, 1]} castShadow={false} />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return <Part key={i} geo={cyl(0.018, 0.018, 0.45, 5)} m={S.iron} p={[x + Math.cos(a) * 0.98, top + 0.4, z + Math.sin(a) * 0.98]} castShadow={false} />
        })}
        {/* la lanterne : socle, vitres à montants, coupole, girouette */}
        <Part geo={cyl(0.6, 0.62, 0.3, 24)} m={S.white} p={[x, top + 0.33, z]} />
        <Part geo={cyl(0.52, 0.52, 0.7, 24)} m={S.lamp} p={[x, top + 0.83, z]} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2
          return <Part key={i} geo={rbox(0.04, 0.72, 0.04, 0.01)} m={S.iron} p={[x + Math.cos(a) * 0.53, top + 0.83, z + Math.sin(a) * 0.53]} castShadow={false} />
        })}
        <Part geo={SPH} m={S.red} p={[x, top + 1.2, z]} scale={[0.62, 0.42, 0.62]} />
        <Part geo={cyl(0.02, 0.02, 0.4, 6)} m={S.iron} p={[x, top + 1.75, z]} castShadow={false} />
        <Part geo={SPH} m={S.brass} p={[x, top + 1.96, z]} scale={0.06} castShadow={false} />
      </Static>
      <sprite position={[x, top + 0.85, z]} scale={2.6} material={S.glow} raycast={noRay} renderOrder={4} />
      <group ref={beams} position={[x, top + 0.85, z]} userData={LIVE}>
        <mesh geometry={beamGeo} material={S.beam} renderOrder={5} raycast={noRay} />
        <mesh geometry={beamGeo} material={S.beam} rotation-y={Math.PI} renderOrder={5} raycast={noRay} />
      </group>
    </group>
  )
}
