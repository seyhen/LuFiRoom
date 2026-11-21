import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, LatheGeometry, Shape, Vector2, type BufferGeometry, type Group, type Mesh } from 'three'
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
/** Le plan de l'aile gauche, déjà couché dans le monde (z de -13,4 à -3,3) ; `WING_R` en est le miroir en z (l'aile droite), le sens des triangles retourné. */
const WING_L = WING.clone().rotateX(-Math.PI / 2)
function mirrorZ(g: BufferGeometry) {
  const m = g.clone()
  m.scale(1, 1, -1)
  for (const name of Object.keys(m.attributes)) {
    const at = m.attributes[name], n = at.itemSize
    for (let i = 0; i + 2 < at.count; i += 3) {
      for (let c = 0; c < n; c++) {
        const t = at.getComponent(i + 1, c)
        at.setComponent(i + 1, c, at.getComponent(i + 2, c))
        at.setComponent(i + 2, c, t)
      }
    }
  }
  return m
}
const WING_R = mirrorZ(WING_L)
const NX = 0.9, NY = -0.5, NZ = -7.1 // le centre de la nacelle (le milieu de son axe)

/**
 * Une aile et son réacteur, derrière le flanc de la cabine. `side` = -1 : l'aile gauche (le flanc du fond, en haut à droite de l'écran, feu de bout
 * d'aile rouge) ; `side` = +1 : l'aile droite, son exacte jumelle en miroir (devant la coupe, en bas à gauche de l'écran, feu vert) : même taille, même
 * flèche, même réacteur, même strobe blanc. Le plan est une aile en flèche aux bords arrondis, à la peinture de bout d'aile corail et indigo, avec son
 * carénage de volets, la nacelle qui dépasse du bord d'attaque et sa soufflante à pales courbes, un petit ailette de bout d'aile.
 * La soufflante tourne autour de l'axe de la nacelle (x) : une phase qu'on additionne image après image ; vite quand les moteurs jouent (un
 * disque flou apparaît alors par-dessus les pales), à peine sinon. Quand le son des moteurs joue, l'aile fléchit à peine.
 */
export function Wing({ side }: { side: -1 | 1 }) {
  const flex = useRef<Group>(null!), fan = useRef<Mesh>(null!), blur = useRef<Mesh>(null!), nav = useRef<Mesh>(null!), strobe = useRef<Mesh>(null!)
  const spin = useRef(0), speed = useRef(0.9), flexV = useRef(0)
  const s = side
  const navMat = s < 0 ? O.navRed : O.navGreen
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'porthole'), n = smooth(mood.night), t = clock.elapsedTime
    // la vitesse monte et descend en douceur (le moteur monte en régime) ; la phase s'additionne image après image : jamais de saut
    const target = (on ? 7 : 0.9) * (reduceMotion ? 0.2 : 1)
    speed.current += (target - speed.current) * Math.min(1, dt * 1.5)
    spin.current = (spin.current + dt * speed.current) % (Math.PI * 2)
    fan.current.rotation.z = spin.current
    // le flou de rotation : les pales s'effacent dans un disque doux quand elles vont vite
    ;(blur.current.material as typeof O.fanBlur).opacity = Math.min(0.55, Math.max(0, (speed.current - 2.5) / 4.5) * 0.55)
    flexV.current += ((on ? 1 : 0) - flexV.current) * Math.min(1, dt * 1.2)
    flex.current.rotation.x = reduceMotion ? 0 : -s * Math.sin(t * 1.3) * 0.0035 * flexV.current
    // le feu de bout d'aile : fixe (rouge à gauche, vert à droite) ; le strobe : deux éclats blancs toutes les 1,3 s
    const ph = (t % 1.3) / 1.3, flash = (ph < 0.06 || (ph > 0.14 && ph < 0.2)) ? 1 : 0
    nav.current.scale.setScalar(0.3 + n * 0.5)
    ;(nav.current.material as typeof O.navRed).opacity = 0.35 + n * 0.55
    strobe.current.scale.setScalar(0.6)
    ;(strobe.current.material as typeof O.strobe).opacity = flash * (0.25 + n * 0.7)
  })
  return (
    <group ref={flex} position={[0, 0, s * 3.35]}>
      <group position={[0, 0, -s * 3.35]}>
        <Static>
          {/* l'aile : un dessus peint, déjà couché dans le monde, au niveau du plancher */}
          <mesh geometry={s < 0 ? WING_L : WING_R} material={O.wing} position={[0, -0.27, 0]} receiveShadow />
          {/* le carénage du bord de fuite et les becs de bord d'attaque */}
          <Part geo={rbox(0.5, 0.22, 3.6, 0.1)} m={O.wingEdge} p={[-4.0, -0.24, s * 6.6]} rotation-y={-s * 0.3} castShadow={false} />
          {/* l'ailette du bout d'aile : une plaque qui se redresse vers le haut */}
          <Part geo={rbox(0.9, 0.9, 0.08, 0.04)} m={O.wing} p={[-5.1, 0.4, s * 13.1]} rotation-z={0.05} castShadow={false} />
          {/* le pylône sous l'aile, qui porte la nacelle */}
          <Part geo={rbox(1.4, 0.5, 0.18, 0.08)} m={O.nacelle} p={[NX - 0.6, NY + 0.45, s * -NZ]} />
          {/* le réacteur : la nacelle (l'axe de la forme est y : on la couche le long de x), le nez avec sa lèvre sombre, le cône central */}
          <group position={[NX, NY, s * -NZ]} rotation-z={-Math.PI / 2}>
            <mesh geometry={NACELLE} material={O.nacelle} castShadow receiveShadow />
            <Part m={O.inlet} p={[0, 1.31, 0]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.47, 0.035, 8, 28]} />
            </Part>
          </group>
          <Part geo={SPH} m={O.tailcone} scale={0.1} p={[NX + 1.25, NY, s * -NZ]} castShadow={false} />
        </Static>
        {/* la soufflante : un disque tourné face à +x (l'axe de la nacelle), qui tourne sur lui-même autour de cet axe ; le flou, un peu devant */}
        <group position={[NX + 1.2, NY, s * -NZ]} rotation-y={Math.PI / 2}>
          <mesh ref={fan} userData={LIVE} material={O.fan} raycast={noRay}>
            <circleGeometry args={[0.435, 28]} />
          </mesh>
          <mesh ref={blur} userData={LIVE} material={O.fanBlur} raycast={noRay} position={[0, 0, 0.012]} renderOrder={2}>
            <circleGeometry args={[0.435, 28]} />
          </mesh>
        </group>
        {/* le feu de bout d'aile et le strobe (sprites additifs) */}
        <mesh ref={nav} userData={LIVE} position={[-5.3, 0.15, s * 13.0]} raycast={noRay} material={navMat} renderOrder={6}>
          <sphereGeometry args={[0.12, 8, 6]} />
        </mesh>
        <mesh ref={strobe} userData={LIVE} position={[-4.4, 0.15, s * 13.15]} raycast={noRay} material={O.strobe} renderOrder={6}>
          <sphereGeometry args={[0.2, 8, 6]} />
        </mesh>
      </group>
    </group>
  )
}
