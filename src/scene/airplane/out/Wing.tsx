import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, LatheGeometry, Shape, Vector2, type Group, type Mesh } from 'three'
import { smooth } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { mood, reduceMotion } from '../../anim'
import { Part, SPH, noRay, rbox } from '../../parts'
import { LIVE, Static } from '../../Static'
import { O } from './materials'

/**
 * Le plan de l'aile gauche (vu d'en haut) : le pied sur le flanc à z = -3,4, une flèche de 34°, le bout à z = -13,3. Les points sont en (x, -z) :
 * l'extrusion tourne ensuite autour de x. Le dessus est peint sur le plan lui-même (`wingTex` : coordonnées du plan).
 */
const WING = (() => {
  const s = new Shape()
  s.moveTo(2.7, 3.35); s.lineTo(-3.2, 3.35); s.lineTo(-5.9, 13.1); s.quadraticCurveTo(-5.95, 13.35, -5.6, 13.35); s.lineTo(-4.5, 13.35); s.quadraticCurveTo(-4.2, 13.35, -4.3, 13.1)
  s.lineTo(2.7, 3.35)
  return new ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 6 })
})()

/** La nacelle : une lèvre d'entrée arrondie, un corps renflé, un cône d'échappement ; l'axe est x, le nez vers +x. */
const NACELLE = new LatheGeometry(
  [[0.0, 0.9], [0.44, 0.9], [0.44, 1.3], [0.52, 1.36], [0.57, 1.22], [0.56, 0.7], [0.5, 0.0], [0.42, -0.5], [0.3, -0.8], [0.18, -0.95], [0.0, -0.98]].map(([r, y]) => new Vector2(r, y)),
  28,
)
const NX = 0.9, NY = -0.5, NZ = -7.1 // le centre de la nacelle (le milieu de son axe)

/**
 * L'aile et son réacteur, derrière le flanc de la cabine, en haut à droite de l'écran : une aile en flèche aux bords arrondis et à la peinture
 * de bout d'aile corail et indigo, son carénage de volets, la nacelle qui dépasse du bord d'attaque avec sa soufflante à pales courbes (qui
 * tourne vite quand les moteurs jouent, à peine sinon), un petit ailette de bout d'aile, le feu rouge qui brille la nuit et l'éclat blanc du strobe.
 * Quand le son des moteurs joue, l'aile fléchit à peine.
 */
export function Wing() {
  const flex = useRef<Group>(null!), fan = useRef<Mesh>(null!), red = useRef<Mesh>(null!), strobe = useRef<Mesh>(null!)
  const spin = useRef(0), flexV = useRef(0)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'porthole'), n = smooth(mood.night), t = clock.elapsedTime
    spin.current += dt * (on ? 7 : 0.9) * (reduceMotion ? 0.2 : 1)
    fan.current.rotation.y = spin.current
    flexV.current += ((on ? 1 : 0) - flexV.current) * Math.min(1, dt * 1.2)
    flex.current.rotation.x = reduceMotion ? 0 : Math.sin(t * 1.3) * 0.0035 * flexV.current
    // le feu de bout d'aile : fixe et rouge ; le strobe : deux éclats blancs toutes les 1,3 s
    const ph = (t % 1.3) / 1.3, flash = (ph < 0.06 || (ph > 0.14 && ph < 0.2)) ? 1 : 0
    red.current.scale.setScalar(0.3 + n * 0.5)
    ;(red.current.material as typeof O.navRed).opacity = 0.35 + n * 0.55
    strobe.current.scale.setScalar(0.6)
    ;(strobe.current.material as typeof O.strobe).opacity = flash * (0.25 + n * 0.7)
  })
  return (
    <group ref={flex} position={[0, 0, -3.35]}>
      <group position={[0, 0, 3.35]}>
        <Static>
          {/* l'aile : un dessus peint ; on la tourne pour que (x, -z) du plan devienne (x, z) du monde, et on la pose au niveau du plancher */}
          <mesh geometry={WING} material={O.wing} rotation-x={-Math.PI / 2} position={[0, -0.27, 0]} receiveShadow />
          {/* le carénage du bord de fuite et les becs de bord d'attaque */}
          <Part geo={rbox(0.5, 0.22, 3.6, 0.1)} m={O.wingEdge} p={[-4.0, -0.24, -6.6]} rotation-y={0.3} castShadow={false} />
          {/* l'ailette du bout d'aile : une plaque qui se redresse vers le haut */}
          <Part geo={rbox(0.9, 0.9, 0.08, 0.04)} m={O.wing} p={[-5.1, 0.4, -13.1]} rotation-z={0.05} castShadow={false} />
          {/* le pylône sous l'aile, qui porte la nacelle */}
          <Part geo={rbox(1.4, 0.5, 0.18, 0.08)} m={O.nacelle} p={[NX - 0.6, NY + 0.45, NZ]} castShadow={false} />
        </Static>
        {/* le réacteur : la nacelle (l'axe de la forme est y : on la couche le long de x), le nez avec sa lèvre sombre et la soufflante */}
        <group position={[NX, NY, NZ]} rotation-z={-Math.PI / 2}>
          <mesh geometry={NACELLE} material={O.nacelle} castShadow receiveShadow raycast={noRay} />
          <Part m={O.inlet} p={[0, 1.31, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.47, 0.035, 8, 28]} />
          </Part>
        </group>
        <mesh ref={fan} userData={LIVE} position={[NX + 0.96, NY, NZ]} rotation-z={-Math.PI / 2} material={O.fan} raycast={noRay}>
          <circleGeometry args={[0.46, 28]} />
        </mesh>
        <Part geo={SPH} m={O.tailcone} scale={0.1} p={[NX + 1.02, NY, NZ]} castShadow={false} />
        {/* le feu rouge et le strobe, au bout de l'aile (sprites additifs) */}
        <mesh ref={red} userData={LIVE} position={[-5.3, 0.15, -13.0]} raycast={noRay} material={O.navRed} renderOrder={6}>
          <sphereGeometry args={[0.12, 8, 6]} />
        </mesh>
        <mesh ref={strobe} userData={LIVE} position={[-4.4, 0.15, -13.15]} raycast={noRay} material={O.strobe} renderOrder={6}>
          <sphereGeometry args={[0.2, 8, 6]} />
        </mesh>
      </group>
    </group>
  )
}

