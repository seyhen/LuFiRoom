import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { M, gummy } from '../materials'
import { Batch, Part, SPH, cyl, rbox, type Item, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
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

// La vitesse du ventilateur : une seule, moyenne (22 rad/s ; 5 avec `prefers-reduced-motion`).
const SPIN = 22, SPIN_CALM = 5
// Les trois touches du socle (décor, comme sur un vrai ventilateur rétro) : celle du milieu, la vitesse moyenne, est enfoncée quand il tourne.
// Le témoin ambre s'allume avec lui. Les deux rubans noués à la grille s'envolent avec le vent.
const SPEED_KEY = 1
const KEY_UP = 0.062, KEY_DOWN = 0.05
const KEY = rbox(0.055, 0.03, 0.04, 0.012)
// les touches sont à l'avant du socle, du côté de la caméra : faible à gauche, fort à droite (à l'écran)
const KEYS_AT = 0.55, KEYS_GAP = 0.42
// un ruban noué : la bande et son nœud, en un seul maillage (un tracé de moins que deux)
const RIBBON = mergeGeometries([rbox(0.03, 0.2, 0.004, 0.0015).clone().translate(0, -0.1, 0), SPH.clone().scale(0.016, 0.016, 0.016).translate(0, 0.004, 0)])!
const PILOT = gummy(0xd9b078, { emissive: 0xffa631, emissiveIntensity: 0, roughness: 0.4 })
const RIBBONS = [{ x: -0.07, m: B.blushDeep, ph: 0 }, { x: 0.075, m: B.mintSoft, ph: 2.1 }]

/**
 * Ventilateur de bureau rétro : socle à trois touches (celle du milieu est enfoncée quand il tourne) et son témoin, pied à rotule,
 * moteur bombé, grille à rayons, deux rubans noués à la grille, pales en pétales. Les pales tournent à 22 rad/s, la tête oscille et les
 * rubans s'envolent ; avec `prefers-reduced-motion`, elles tournent doucement (5 rad/s), la tête reste fixe et les rubans ne battent plus.
 */
export function Fan({ position = [0.98, 1.35, -2.45] }: { position?: V3 }) {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), blades = useRef<Group>(null!)
  const keys = useRef<(Mesh | null)[]>([]), ribbons = useRef<(Group | null)[]>([])
  const spin = useRef({ speed: 0, angle: 0, swivel: 0, flutter: 0, lamp: 0, press: [0, 0, 0] })
  useSquash('fan', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = spin.current, st = useStore.getState()
    const on = isActive(st, 'fan')
    s.speed = approach(s.speed, on ? (reduceMotion ? SPIN_CALM : SPIN) : 0, dt * 14)
    const k = s.speed / SPIN // 0 à l'arrêt, 1 en marche
    s.angle = (s.angle + s.speed * dt) % TAU
    // la tête balaie au rythme des pales ; elle reste fixe si l'on préfère moins de mouvement
    s.swivel += dt * 0.55 * (s.speed / SPIN)
    blades.current.rotation.z = s.angle
    head.current.rotation.y = -0.45 + (reduceMotion ? 0 : Math.sin(s.swivel) * 0.4)
    // les touches : celle du milieu descend, les autres restent en haut
    for (let i = 0; i < 3; i++) {
      s.press[i] = approach(s.press[i], on && i === SPEED_KEY ? 1 : 0, dt * 9)
      const key = keys.current[i]
      if (key) {
        key.position.y = KEY_UP + (KEY_DOWN - KEY_UP) * s.press[i]
        const down = s.press[i] > 0.5 ? M.butterDeep : M.cream
        if (key.material !== down) key.material = down
      }
    }
    s.lamp = approach(s.lamp, on ? 1 : 0, dt * 5)
    PILOT.emissiveIntensity = s.lamp * 1.3
    // les rubans : tirés vers l'avant par le vent (la phase s'additionne image après image), qui retombent à l'arrêt
    s.flutter = (s.flutter + dt * (3 + 9 * k)) % TAU
    ribbons.current.forEach((r, i) => {
      if (!r) return
      const ph = s.flutter + RIBBONS[i].ph, wave = reduceMotion ? 0 : Math.sin(ph) * (0.05 + 0.18 * k)
      r.rotation.x = -(0.04 + 1.0 * k + wave)
      r.rotation.z = reduceMotion ? 0 : Math.sin(ph * 0.7 + 1) * 0.14 * k
    })
  })
  return (
    <group ref={g} userData={{ id: 'fan' }} position={position}>
      {/* (chaque partie qui ne bouge pas par rapport à son groupe est fusionnée : socle, tête, hélice) */}
      <Static>
      {/* le socle : un galet bombé (les trois touches de vitesse et le témoin sont dessinés dehors : ils bougent) */}
      <Part geo={cyl(0.18, 0.2, 0.05, 28)} m={M.butter} p={[0, 0.025, 0]} />
      <Part geo={SPH} m={M.butter} scale={[0.17, 0.04, 0.17]} p={[0, 0.05, 0]} />
      <Part geo={CORD} m={M.plum} castShadow={false} />
      {/* le pied et sa rotule, avec la molette de serrage */}
      <Part geo={cyl(0.028, 0.034, 0.27, 14)} m={M.cream} p={[0, 0.2, 0]} />
      <Part geo={SPH} m={M.butterDeep} scale={0.042} p={[0, 0.345, 0]} />
      </Static>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation-y={KEYS_AT + (i - 1) * KEYS_GAP}>
          <mesh ref={(el) => void (keys.current[i] = el)} geometry={KEY} material={M.cream} position={[0, KEY_UP, 0.148]} />
        </group>
      ))}
      <mesh geometry={SPH} material={PILOT} scale={0.019} position={[Math.sin(KEYS_AT) * 0.075, 0.088, Math.cos(KEYS_AT) * 0.075]} />
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
        {/* deux rubans noués au haut de la grille, devant les pales : le vent les soulève */}
        {RIBBONS.map(({ x, m }, i) => (
          <group key={i} ref={(el) => void (ribbons.current[i] = el)} position={[x, R - 0.012, 0.122]}>
            <mesh geometry={RIBBON} material={m} />
          </group>
        ))}
      </group>
    </group>
  )
}
