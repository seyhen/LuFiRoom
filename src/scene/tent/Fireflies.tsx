import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type Sprite } from 'three'
import { smooth } from '../../math'
import { isActive, useStore } from '../../state/store'
import { glowTex } from '../textures'
import { mood, reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { T } from './materials'

const TOP = 0.3 // le dessus du rondin
/** Les lucioles du bocal : [x, hauteur, z, vitesse du clignotement, phase]. */
const BUGS: [number, number, number, number, number][] = [
  [-0.035, 0.085, 0.02, 1.1, 0.2], [0.04, 0.14, -0.03, 0.8, 2.1], [0.0, 0.2, 0.04, 1.3, 4.0], [-0.04, 0.24, -0.02, 0.9, 5.3], [0.045, 0.05, 0.035, 1.5, 3.1], [0.02, 0.17, -0.05, 1.0, 1.0],
]

/**
 * Le bocal de lucioles, objet « crickets » : un bocal à confiture sur une tranche de rondin, un couvercle de fer percé de trous
 * d'aération et son anse de fil, de l'herbe et une brindille au fond, six lucioles qui s'allument et s'éteignent chacune à son
 * rythme (plus vives quand le chant des grillons joue), un halo vert-jaune. À côté : un carnet d'observations, un crayon, une
 * loupe. `position` est le pied du rondin.
 */
export function Fireflies({ position, ry = 0 }: { position: V3; ry?: number }) {
  const g = useRef<Group>(null!), halo = useRef<Sprite>(null!), flies = useRef<(Mesh | null)[]>([])
  const st = useRef({ on: 0, ph: BUGS.map((b) => b[4]) })
  useSquash('fireflies', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.on += ((isActive(useStore.getState(), 'fireflies') ? 1 : 0) - s.on) * Math.min(1, dt * 2)
    const dark = 0.45 + 0.55 * smooth(mood.night)
    let sum = 0
    BUGS.forEach(([x, y, z, f], i) => {
      s.ph[i] += dt * f * (reduceMotion ? 0 : 1) * (1 + s.on)
      const blink = Math.pow(Math.max(0, Math.sin(s.ph[i])), 2.2), m = flies.current[i]
      const k = (0.18 + (0.25 + s.on * 0.75) * blink) * dark
      sum += k
      if (m) {
        m.scale.setScalar(0.014 + 0.012 * k)
        m.material = k > 0.4 ? T.fireflyLit : T.firefly
        m.position.set(x + (reduceMotion ? 0 : Math.sin(s.ph[i] * 0.37) * 0.008), TOP + y + (reduceMotion ? 0 : Math.sin(s.ph[i] * 0.23) * 0.01), z)
      }
    })
    halo.current.material.opacity = Math.min(0.55, (sum / BUGS.length) * (0.3 + s.on * 0.8))
  })
  return (
    <group ref={g} userData={{ id: 'fireflies' }} position={position} rotation-y={ry}>
      <group scale={1.4}>
      <Static>
        {/* le rondin : un disque de bois clair cerné d'écorce, des cernes, une fente */}
        <Part geo={cyl(0.22, 0.24, TOP, 28)} m={T.bark} p={[0, TOP / 2, 0]} />
        <Part geo={cyl(0.208, 0.208, 0.006, 28)} m={T.logCut} p={[0, TOP + 0.001, 0]} castShadow={false} />
        {[0.14, 0.085, 0.04].map((r) => (
          <Part key={r} m={T.woodDark} p={[0, TOP + 0.006, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[r, 0.0035, 5, 28]} />
          </Part>
        ))}
        <Part geo={rbox(0.2, 0.004, 0.012, 0.002)} m={T.woodDark} p={[0.06, TOP + 0.005, -0.1]} rotation-y={0.5} castShadow={false} />
        {/* le bocal : fond épais, herbe, brindille ; le verre est plus bas, autour */}
        <Part geo={cyl(0.088, 0.088, 0.02, 24)} m={T.jar} p={[0, TOP + 0.016, 0]} castShadow={false} />
        <Part geo={cyl(0.07, 0.075, 0.012, 14)} m={T.earth} p={[0, TOP + 0.029, 0]} castShadow={false} />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return <Part key={i} geo={cyl(0.003, 0.008, 0.08 + (i % 2) * 0.03, 5)} m={T.grass} p={[Math.cos(a) * 0.04, TOP + 0.07, Math.sin(a) * 0.04]} rotation={[Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25]} castShadow={false} />
        })}
        <Part geo={cyl(0.006, 0.008, 0.2, 6)} m={T.woodDark} p={[-0.02, TOP + 0.13, 0.015]} rotation-z={0.25} castShadow={false} />
        {/* le couvercle de fer percé, la bague, l'anse de fil */}
        <Part geo={cyl(0.083, 0.083, 0.022, 24)} m={T.lid} p={[0, TOP + 0.3, 0]} />
        <Part geo={cyl(0.088, 0.088, 0.014, 24)} m={T.lid} p={[0, TOP + 0.278, 0]} castShadow={false} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2
          return <Part key={i} geo={cyl(0.007, 0.007, 0.004, 6)} m={T.sole} p={[Math.cos(a) * 0.045, TOP + 0.3125, Math.sin(a) * 0.045]} castShadow={false} />
        })}
        <Part m={T.steel} p={[0, TOP + 0.31, 0]} castShadow={false}>
          <torusGeometry args={[0.085, 0.0045, 6, 24, Math.PI]} />
        </Part>
        {/* l'étiquette de papier collée sur le verre, une main a écrit dessus */}
        <mesh material={T.paper} position={[0, TOP + 0.13, 0.0905]} raycast={noRay}>
          <planeGeometry args={[0.07, 0.05]} />
        </mesh>
        {/* le carnet d'observations, le crayon, la loupe, posés au sol à côté */}
        <group position={[0.42, 0, 0.12]} rotation-y={0.5}>
          <Part geo={rbox(0.2, 0.025, 0.28, 0.008)} m={T.leatherDark} p={[0, 0.0125, 0]} castShadow={false} />
          <Part geo={rbox(0.17, 0.012, 0.25, 0.004)} m={T.paper} p={[0, 0.03, 0]} castShadow={false} />
          <Part geo={cyl(0.006, 0.006, 0.17, 6)} m={T.pencil} p={[0.03, 0.045, 0.04]} rotation={[Math.PI / 2, 0, 0.6]} castShadow={false} />
        </group>
        <group position={[0.4, 0.006, -0.18]} rotation-y={-0.4}>
          <Part m={T.brass} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.05, 0.006, 6, 20]} />
          </Part>
          <Part geo={cyl(0.046, 0.046, 0.004, 20)} m={T.jar} p={[0, 0.001, 0]} castShadow={false} />
          <Part geo={cyl(0.009, 0.009, 0.1, 8)} m={T.woodDark} p={[0.095, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </Static>
      {/* le verre du bocal, par-dessus ; les lucioles dedans (le verre n'écrit pas la profondeur) */}
      <mesh position={[0, TOP + 0.158, 0]} material={T.jar} raycast={noRay} renderOrder={3}>
        <cylinderGeometry args={[0.083, 0.083, 0.28, 24, 1, true]} />
      </mesh>
      {BUGS.map((b, i) => (
        <mesh key={i} ref={(m) => { flies.current[i] = m }} geometry={SPH} material={T.firefly} position={[b[0], TOP + b[1], b[2]]} raycast={noRay} renderOrder={4} />
      ))}
      <sprite ref={halo} position={[0, TOP + 0.16, 0]} scale={0.75} raycast={noRay} renderOrder={4}>
        <spriteMaterial map={glowTex} color={0xcdf060} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.2} />
      </sprite>
      </group>
    </group>
  )
}
