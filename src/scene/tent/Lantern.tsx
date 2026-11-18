import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, LatheGeometry, Vector2, type Group, type PointLight, type Sprite } from 'three'
import { smooth } from '../../math'
import { glowTex } from '../textures'
import { mood, reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, orient, type V3 } from '../parts'
import { Static } from '../Static'
import { T } from './materials'

/** Le point d'accroche, au bout du bras de fer : sorti du mât, vers la caméra. */
export const HOOK: V3 = [0.34, 2.5, 0.34]

// Le verre de la lampe-tempête : une cheminée qui se renfle au milieu et se resserre en haut (rayon, hauteur).
const GLOBE = new LatheGeometry(
  [[0.052, 0], [0.066, 0.04], [0.086, 0.1], [0.092, 0.16], [0.078, 0.22], [0.056, 0.27], [0.05, 0.32], [0.048, 0.34]].map(([r, y]) => new Vector2(r, y)),
  24,
)

/**
 * La lampe à pétrole (objet « jour / nuit »), suspendue à un bras de fer au mât central : un réservoir d'émail rouge, un brûleur de
 * laiton avec sa molette, une cheminée de verre qui se renfle, deux montants et un anneau de fer, un chapeau de laiton et l'anse.
 * Elle se balance à peine ; le soir la flamme monte, un halo et une lumière chaude ambrent la toile. `position` est le point
 * d'accroche (le groupe pivote autour) : tout pend en dessous.
 */
export function Lantern() {
  const g = useRef<Group>(null!), sway = useRef<Group>(null!), flame = useRef<Group>(null!), light = useRef<PointLight>(null!), bounce = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  const st = useRef({ ph: 0, ph2: 0 })
  useSquash('lamp', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, e = smooth(mood.night)
    s.ph += dt * 0.9
    s.ph2 += dt * 1.37
    const a = reduceMotion ? 0 : 0.014 + 0.004 * mood.rain
    sway.current.rotation.set(Math.sin(s.ph) * a, 0, Math.sin(s.ph2) * a * 0.8)
    // la flamme : lente, un peu vivante
    const f = 1 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 7.3) * 0.05 + Math.sin(clock.elapsedTime * 11.1) * 0.03)
    flame.current.scale.set(0.5 + e * 0.5, (0.35 + e * 0.65) * f, 0.5 + e * 0.5)
    light.current.intensity = (0.3 + e * 2.3) * Math.PI * (0.97 + (f - 1))
    bounce.current.intensity = (0.1 + e * 1.0) * Math.PI
    T.lampGlass.emissiveIntensity = 0.1 + e * 1.0
    glow.current.material.opacity = 0.15 + e * 0.75
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={HOOK}>
      <group ref={sway}>
        <Static>
          {/* le crochet et l'anneau */}
          <Part m={T.iron} p={[0, 0.02, 0]} castShadow={false}>
            <torusGeometry args={[0.035, 0.008, 6, 14]} />
          </Part>
          <Part m={T.iron} p={[0, -0.07, 0]} castShadow={false}>
            <torusGeometry args={[0.03, 0.007, 6, 14]} />
          </Part>
          {/* l'anse : un arceau de fer sur le dessus */}
          <Part m={T.iron} p={[0, -0.2, 0]} rotation-z={0} castShadow={false}>
            <torusGeometry args={[0.09, 0.007, 6, 24, Math.PI]} />
          </Part>
          {/* le chapeau de laiton, sa cheminée d'aération */}
          <Part m={T.brass} p={[0, -0.215, 0]}>
            <coneGeometry args={[0.085, 0.07, 18]} />
          </Part>
          <Part geo={cyl(0.03, 0.04, 0.03, 14)} m={T.brass} p={[0, -0.168, 0]} castShadow={false} />
          {/* deux montants de fer et la bague basse */}
          {[-1, 1].map((s) => <Part key={s} geo={cyl(0.006, 0.006, 0.36, 6)} m={T.iron} p={[s * 0.1, -0.4, 0]} castShadow={false} />)}
          <Part geo={cyl(0.1, 0.1, 0.014, 20)} m={T.iron} p={[0, -0.585, 0]} castShadow={false} />
          {/* le brûleur de laiton, la molette de la mèche */}
          <Part geo={cyl(0.06, 0.075, 0.05, 18)} m={T.brass} p={[0, -0.625, 0]} />
          <Part geo={cyl(0.012, 0.012, 0.05, 8)} m={T.brass} p={[0.085, -0.63, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.026, 0.026, 0.014, 12)} m={T.brass} p={[0.115, -0.63, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {/* le réservoir d'émail rouge, son goulot et sa petite écaille de peinture */}
          <Part geo={SPH} m={T.lampRed} scale={[0.115, 0.07, 0.115]} p={[0, -0.69, 0]} />
          <Part geo={cyl(0.1, 0.11, 0.025, 20)} m={T.iron} p={[0, -0.75, 0]} castShadow={false} />
          <Part geo={SPH} m={T.iron} scale={[0.016, 0.01, 0.012]} p={[0.07, -0.655, 0.075]} castShadow={false} />
        </Static>
        {/* la mèche et la flamme, dans la cheminée */}
        <group ref={flame} position={[0, -0.595, 0]}>
          <Part geo={cyl(0.018, 0.018, 0.02, 8)} m={T.lampFlameOut} p={[0, 0.005, 0]} castShadow={false} />
          <Part geo={SPH} m={T.lampFlameOut} scale={[0.026, 0.07, 0.026]} p={[0, 0.06, 0]} castShadow={false} />
          <Part geo={SPH} m={T.lampFlame} scale={[0.014, 0.045, 0.014]} p={[0, 0.05, 0]} castShadow={false} />
        </group>
        {/* la cheminée de verre : un renflement transparent qui s'allume le soir */}
        <mesh geometry={GLOBE} material={T.lampGlass} position={[0, -0.59, 0]} raycast={noRay} renderOrder={3} />
        <sprite ref={glow} position={[0, -0.45, 0]} scale={2.4} raycast={noRay} renderOrder={4}>
          <spriteMaterial map={glowTex} color={0xffbf70} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.2} />
        </sprite>
        <pointLight ref={light} color={0xffb066} intensity={0} distance={9} decay={1.3} position={[0, -0.45, 0]} />
        {/* le reflet de la toile : une seconde lumière douce, devant, qui éclaire les faces tournées vers nous (sinon tout ce qui regarde l'entrée est dans le noir) */}
        <pointLight ref={bounce} color={0xffc890} intensity={0} distance={11} decay={1.3} position={[2.7, -0.7, 2.7]} />
      </group>
    </group>
  )
}

/** Le bras de fer qui sort du mât et porte la lampe (immobile, hors de l'objet interactif), avec sa bague de serrage. */
export function LampArm() {
  const a: V3 = [0, HOOK[1] + 0.04, 0], b: V3 = [HOOK[0], HOOK[1] + 0.04, HOOK[2]]
  const d = Math.hypot(b[0] - a[0], b[2] - a[2])
  return (
    <>
      <Part geo={cyl(0.012, 0.012, d, 8)} m={T.iron} p={[(a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2]} rotation={orient([b[0] - a[0], 0, b[2] - a[2]])} castShadow={false} />
      <Part geo={cyl(0.07, 0.07, 0.06, 14)} m={T.iron} p={[0, a[1], 0]} castShadow={false} />
      <Part geo={SPH} m={T.iron} scale={0.02} p={[b[0], b[1], b[2]]} castShadow={false} />
    </>
  )
}
