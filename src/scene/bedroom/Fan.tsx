import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { M } from '../materials'
import { Batch, Part, SPH, cyl, rbox, type Item, type V3 } from '../parts'
import { useSquash } from '../anim'
import { Static } from '../Static'
import { B } from './materials'

// La tête est assez basse pour que le battant gauche de la fenêtre, ouvert, passe au-dessus de la grille (bas de la fenêtre : y = 2,1).
const HEAD_Y = 0.4, R = 0.25
// La grille : huit rayons devant, quatre derrière, et les barrettes qui relient les deux anneaux sur le pourtour.
const SPOKES: Item[] = [
  ...Array.from({ length: 8 }, (_, i): Item => ({ p: [0, 0, 0.095], s: [0.011, R * 2, 0.011], r: [0, 0, (i / 8) * Math.PI] })),
  ...Array.from({ length: 4 }, (_, i): Item => ({ p: [0, 0, -0.025], s: [0.01, R * 2, 0.01], r: [0, 0, (i / 4) * Math.PI + 0.4] })),
  ...Array.from({ length: 12 }, (_, i): Item => {
    const a = (i / 12) * TAU
    return { p: [Math.cos(a) * R, Math.sin(a) * R, 0.035], s: [0.012, 0.012, 0.12] }
  }),
]
// le fil : il sort de l'arrière du socle, traîne sur le bureau et file vers la prise, derrière
const CORD = new TubeGeometry(new CatmullRomCurve3([[0, 0.02, -0.15], [-0.05, 0.012, -0.24], [-0.2, 0.012, -0.26], [-0.32, 0.012, -0.3], [-0.36, 0.05, -0.36]].map(([x, y, z]) => new Vector3(x, y, z))), 24, 0.011, 6, false)

/** Ventilateur de bureau rétro : socle à trois touches, pied à rotule, moteur bombé, grille à rayons, pales en pétales ; elles tournent à 22 rad/s et la tête oscille. */
export function Fan({ position = [0.98, 1.35, -2.45] }: { position?: V3 }) {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), blades = useRef<Group>(null!)
  const spin = useRef({ speed: 0, angle: 0, swivel: 0 })
  useSquash('fan', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = spin.current
    s.speed = approach(s.speed, isActive(useStore.getState(), 'fan') ? 22 : 0, dt * 14)
    s.angle += s.speed * dt
    s.swivel += dt * 0.55 * (s.speed / 22)
    blades.current.rotation.z = s.angle
    head.current.rotation.y = -0.45 + Math.sin(s.swivel) * 0.4
  })
  return (
    <group ref={g} userData={{ id: 'fan' }} position={position}>
      {/* (chaque partie qui ne bouge pas par rapport à son groupe est fusionnée : socle, tête, hélice) */}
      <Static>
      {/* le socle : un galet bombé, trois touches devant (la deuxième enfoncée : vitesse 2) */}
      <Part geo={cyl(0.18, 0.2, 0.05, 28)} m={M.butter} p={[0, 0.025, 0]} />
      <Part geo={SPH} m={M.butter} scale={[0.17, 0.04, 0.17]} p={[0, 0.05, 0]} />
      {[-1, 0, 1].map((i) => (
        <group key={i} rotation-y={-0.45 + i * 0.32}>
          <Part geo={rbox(0.05, 0.03, 0.035, 0.012)} m={i === 0 ? M.butterDeep : M.cream} p={[0, i === 0 ? 0.052 : 0.062, 0.15]} />
        </group>
      ))}
      <Part geo={CORD} m={M.plum} castShadow={false} />
      {/* le pied et sa rotule, avec la molette de serrage */}
      <Part geo={cyl(0.028, 0.034, 0.27, 14)} m={M.cream} p={[0, 0.2, 0]} />
      <Part geo={SPH} m={M.butterDeep} scale={0.042} p={[0, 0.345, 0]} />
      </Static>
      <group ref={head} position={[0, HEAD_Y, 0]} rotation-y={-0.45}>
        <Static>
        <Part geo={cyl(0.012, 0.012, 0.09, 10)} m={M.butterDeep} p={[0.05, -0.05, -0.06]} rotation-z={Math.PI / 2} />
        <Part geo={cyl(0.026, 0.026, 0.02, 14)} m={M.cream} p={[0.1, -0.05, -0.06]} rotation-z={Math.PI / 2} />
        {/* le moteur : une coque bombée, un capot arrière, une bande d'aération */}
        <Part geo={SPH} m={M.butter} scale={[0.1, 0.1, 0.12]} p={[0, 0, -0.08]} />
        <Part geo={cyl(0.07, 0.085, 0.05, 22)} m={M.butterDeep} p={[0, 0, -0.17]} rotation-x={Math.PI / 2} />
        <Part m={M.cream} p={[0, 0, -0.12]} castShadow={false}>
          <torusGeometry args={[0.097, 0.009, 6, 26]} />
        </Part>
        </Static>
        <group ref={blades} position={[0, 0, 0.035]}>
          <Static>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation-z={(i / 4) * TAU}>
              <Part geo={SPH} m={B.cloud} scale={[0.075, 0.12, 0.014]} p={[0, 0.12, 0]} rotation-y={0.4} />
            </group>
          ))}
          <Part geo={cyl(0.045, 0.05, 0.05, 18)} m={M.cream} rotation-x={Math.PI / 2} />
          </Static>
        </group>
        <Static>
        {/* la grille : l'anneau de devant, un anneau intérieur, l'anneau de derrière, les rayons et le macaron central */}
        <Part m={M.butter} p={[0, 0, 0.095]}>
          <torusGeometry args={[R, 0.02, 10, 40]} />
        </Part>
        <Part m={M.butter} p={[0, 0, 0.1]} castShadow={false}>
          <torusGeometry args={[R * 0.58, 0.009, 6, 32]} />
        </Part>
        <Part m={M.butter} p={[0, 0, -0.025]}>
          <torusGeometry args={[R, 0.015, 8, 40]} />
        </Part>
        <Batch geo={rbox(1, 1, 1, 0.004)} m={M.butter} items={SPOKES} />
        <Part geo={cyl(0.05, 0.05, 0.018, 20)} m={M.butterDeep} p={[0, 0, 0.104]} rotation-x={Math.PI / 2} />
        <Part geo={cyl(0.03, 0.03, 0.01, 18)} m={M.cream} p={[0, 0, 0.115]} rotation-x={Math.PI / 2} castShadow={false} />
        </Static>
      </group>
    </group>
  )
}
